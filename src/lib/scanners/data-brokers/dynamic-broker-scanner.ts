/**
 * Dynamic Broker Scanner
 *
 * Template-based scanner that reads config from DynamicScannerConfig DB table.
 * Enables adding new broker scanners without code deploys.
 *
 * Most people-search sites use one of 4 URL patterns and similar HTML structures.
 * The template approach (URL templates + configurable parsing rules) covers ~80% of cases.
 */

import { BaseBrokerScanner, type BrokerConfig, type BrokerSearchResult } from "./base-broker-scanner";
import type { ScanInput } from "../base-scanner";
import type { DataSource } from "@/lib/types";
import { prisma } from "@/lib/db";

// Max confidence score for dynamic scanners (until proven over 30+ days)
const DYNAMIC_CONFIDENCE_CAP = 65;

export interface ParsingRules {
  noResultIndicators: string[];   // e.g. ["no results found", "0 records"]
  resultIndicators: string[];     // e.g. ["view full report", "records found"]
  extractionPatterns?: {
    name?: string;       // regex to extract name
    location?: string;   // regex to extract location
    age?: string;        // regex to extract age
    phone?: string;      // regex to extract phone
    email?: string;      // regex to extract email
  };
}

export interface DynamicScannerRow {
  id: string;
  brokerKey: string;
  brokerName: string;
  enabled: boolean;
  searchUrlTemplate: string;
  baseUrl: string;
  optOutUrl: string | null;
  optOutEmail: string | null;
  estimatedRemovalDays: number;
  parsingRules: string;
  usePremiumProxy: boolean;
  useStealthProxy: boolean;
  delayMs: number;
  validationStatus: string;
  validationScore: number | null;
  totalScans: number;
  successfulScans: number;
  consecutiveFailures: number;
  createdAt: Date;
}

export class DynamicBrokerScanner extends BaseBrokerScanner {
  config: BrokerConfig;
  private parsingRules: ParsingRules;
  private searchUrlTemplate: string;
  private configId: string;
  private configCreatedAt: Date;
  private totalScans: number;
  private successfulScans: number;

  constructor(row: DynamicScannerRow) {
    super();
    this.configId = row.id;
    this.searchUrlTemplate = row.searchUrlTemplate;
    this.configCreatedAt = row.createdAt;
    this.totalScans = row.totalScans;
    this.successfulScans = row.successfulScans;

    // Parse the stored rules
    try {
      this.parsingRules = JSON.parse(row.parsingRules) as ParsingRules;
    } catch {
      this.parsingRules = { noResultIndicators: [], resultIndicators: [] };
    }

    // Build BrokerConfig from DB row
    this.config = {
      name: row.brokerName,
      source: row.brokerKey as DataSource,
      baseUrl: row.baseUrl,
      searchUrl: row.searchUrlTemplate,
      optOutUrl: row.optOutUrl || `${row.baseUrl}/optout`,
      optOutInstructions: row.optOutEmail
        ? `Email ${row.optOutEmail} or visit the opt-out page to request removal.`
        : "Visit the opt-out page to request removal of your data.",
      estimatedRemovalDays: row.estimatedRemovalDays,
      privacyEmail: row.optOutEmail || undefined,
      requiresVerification: false,
      usePremiumProxy: row.usePremiumProxy,
      useStealthProxy: row.useStealthProxy,
      rateLimit: {
        requestsPerMinute: 10,
        delayMs: row.delayMs,
      },
    };
  }

  /**
   * Build search URL by replacing template variables
   */
  protected buildSearchUrl(input: ScanInput): string | null {
    if (!input.fullName) return null;

    const nameParts = input.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts[nameParts.length - 1] || "";

    // Get location from first address if available
    const addr = input.addresses?.[0];
    const city = addr?.city || "";
    const state = addr?.state || "";

    let url = this.searchUrlTemplate;
    url = url.replace(/\{firstName\}/gi, encodeURIComponent(this.formatNameForUrl(firstName)));
    url = url.replace(/\{lastName\}/gi, encodeURIComponent(this.formatNameForUrl(lastName)));
    url = url.replace(/\{fullName\}/gi, encodeURIComponent(this.formatNameForUrl(input.fullName)));
    url = url.replace(/\{city\}/gi, encodeURIComponent(city.toLowerCase().replace(/\s+/g, "-")));
    url = url.replace(/\{state\}/gi, encodeURIComponent(this.formatStateForUrl(state || "")));

    // If URL still has unfilled location templates and no address, strip them
    if (!city && !state) {
      url = url.replace(/\/\{city\}/gi, "");
      url = url.replace(/\/\{state\}/gi, "");
      url = url.replace(/[?&]city=\{city\}/gi, "");
      url = url.replace(/[?&]state=\{state\}/gi, "");
    }

    return url;
  }

  /**
   * Parse search results using configurable parsing rules
   */
  protected parseSearchResults(html: string, input: ScanInput): BrokerSearchResult {
    const htmlLower = html.toLowerCase();

    // Check no-result indicators first
    for (const indicator of this.parsingRules.noResultIndicators) {
      if (htmlLower.includes(indicator.toLowerCase())) {
        return { found: false };
      }
    }

    // Check result indicators
    let hasResultIndicator = false;
    for (const indicator of this.parsingRules.resultIndicators) {
      if (htmlLower.includes(indicator.toLowerCase())) {
        hasResultIndicator = true;
        break;
      }
    }

    // Fallback: check if user's name appears in the HTML
    const nameFound = input.fullName ? this.nameInHtml(html, input.fullName) : false;

    if (!hasResultIndicator && !nameFound) {
      return { found: false };
    }

    // Extract data using configured patterns
    const result: BrokerSearchResult = {
      found: true,
      profileUrl: this.config.baseUrl,
    };

    const patterns = this.parsingRules.extractionPatterns;
    if (patterns) {
      if (patterns.name) {
        const match = html.match(new RegExp(patterns.name, "i"));
        if (match?.[1]) result.name = this.stripHtml(match[1]);
      }
      if (patterns.location) {
        const match = html.match(new RegExp(patterns.location, "i"));
        if (match?.[1]) result.location = this.stripHtml(match[1]);
      }
      if (patterns.age) {
        const match = html.match(new RegExp(patterns.age, "i"));
        if (match?.[1]) result.age = this.stripHtml(match[1]);
      }
      if (patterns.phone) {
        const phones = this.extractMatches(html, new RegExp(patterns.phone, "gi"));
        if (phones.length > 0) result.phones = phones;
      }
      if (patterns.email) {
        const emails = this.extractMatches(html, new RegExp(patterns.email, "gi"));
        if (emails.length > 0) result.emails = emails;
      }
    }

    // Default: use input name if no extraction pattern matched
    if (!result.name && input.fullName) {
      result.name = input.fullName;
    }

    return result;
  }

  /**
   * Override createExposureResult to cap confidence for dynamic scanners.
   * Until a scanner has 30+ days of history with >80% accuracy,
   * confidence is capped at 65 (LIKELY).
   */
  protected createExposureResult(
    searchResult: BrokerSearchResult,
    input: ScanInput
  ) {
    const result = super.createExposureResult(searchResult, input);
    if (!result || !result.confidence) return result;

    // Check if scanner has proven itself (30+ days, >80% accuracy)
    const ageInDays = (Date.now() - this.configCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
    const accuracy = this.totalScans > 0 ? this.successfulScans / this.totalScans : 0;
    const isProven = ageInDays >= 30 && accuracy >= 0.8 && this.totalScans >= 10;

    if (!isProven && result.confidence.score > DYNAMIC_CONFIDENCE_CAP) {
      result.confidence.score = DYNAMIC_CONFIDENCE_CAP;
      result.confidence.classification = "LIKELY";
      result.confidence.reasoning.push(
        `Dynamic scanner confidence capped at ${DYNAMIC_CONFIDENCE_CAP} (${Math.floor(ageInDays)}d old, ${(accuracy * 100).toFixed(0)}% accuracy)`
      );
    }

    return result;
  }

  /**
   * Record scan outcome for health tracking
   */
  async recordScanOutcome(success: boolean): Promise<void> {
    try {
      if (success) {
        await prisma.dynamicScannerConfig.update({
          where: { id: this.configId },
          data: {
            lastScanAt: new Date(),
            totalScans: { increment: 1 },
            successfulScans: { increment: 1 },
            consecutiveFailures: 0,
          },
        });
      } else {
        const updated = await prisma.dynamicScannerConfig.update({
          where: { id: this.configId },
          data: {
            lastScanAt: new Date(),
            totalScans: { increment: 1 },
            consecutiveFailures: { increment: 1 },
          },
        });

        // Auto-disable after 3 consecutive failures
        if (updated.consecutiveFailures >= 3) {
          await prisma.dynamicScannerConfig.update({
            where: { id: this.configId },
            data: {
              enabled: false,
              validationStatus: "DISABLED",
            },
          });
          console.log(`[DynamicScanner] Auto-disabled ${this.config.name} after ${updated.consecutiveFailures} consecutive failures`);
        }
      }
    } catch (error) {
      console.error(`[DynamicScanner] Failed to record outcome for ${this.config.name}:`, error);
    }
  }

  /**
   * Strip HTML tags from extracted text
   */
  private stripHtml(text: string): string {
    return text.replace(/<[^>]*>/g, "").trim();
  }
}

/**
 * Load all enabled and validated dynamic scanner configs from DB
 * and return scanner instances. Fails gracefully — returns empty array on error.
 */
export async function loadDynamicScanners(): Promise<DynamicBrokerScanner[]> {
  try {
    const configs = await prisma.dynamicScannerConfig.findMany({
      where: {
        enabled: true,
        validationStatus: "VALIDATED",
      },
      orderBy: { discoveryScore: "desc" },
    });

    if (configs.length === 0) return [];

    console.log(`[DynamicScanner] Loaded ${configs.length} dynamic scanner configs`);
    return configs.map((c) => new DynamicBrokerScanner(c));
  } catch (error) {
    // Graceful degradation — don't break scans if table doesn't exist yet
    console.error("[DynamicScanner] Failed to load dynamic scanners:", error);
    return [];
  }
}
