import { BaseScanner, type ScanInput, type ScanResult } from "../base-scanner";
import type { DataSource } from "@/lib/types";
import { scrapeUrl, isScrapingServiceEnabled } from "../scraping-service";

export interface BrokerSearchResult {
  found: boolean;
  profileUrl?: string;
  name?: string;
  location?: string;
  age?: string;
  relatives?: string[];
  addresses?: string[];
  phones?: string[];
  emails?: string[];
  rawHtml?: string;
}

export interface BrokerConfig {
  name: string;
  source: DataSource;
  baseUrl: string;
  searchUrl: string;
  optOutUrl: string;
  optOutInstructions: string;
  estimatedRemovalDays: number;
  privacyEmail?: string;
  requiresVerification: boolean;
  usePremiumProxy?: boolean; // Use residential IPs for sites with moderate bot detection
  useStealthProxy?: boolean; // Use stealth mode for sites with strong bot detection (most expensive)
  rateLimit: {
    requestsPerMinute: number;
    delayMs: number;
  };
}

// Common browser headers to avoid bot detection
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

export abstract class BaseBrokerScanner extends BaseScanner {
  abstract config: BrokerConfig;

  get name(): string {
    return this.config.name;
  }

  get source(): DataSource {
    return this.config.source;
  }

  /**
   * Build search URL for the broker
   */
  protected abstract buildSearchUrl(input: ScanInput): string | null;

  /**
   * Parse the HTML response to find profile data
   */
  protected abstract parseSearchResults(
    html: string,
    input: ScanInput
  ): BrokerSearchResult;

  /**
   * Fetch HTML from a URL using scraping service (handles bot detection)
   * Uses stealth proxy for strongest bot detection sites
   * Uses premium proxy for moderate bot detection sites
   * Retries with escalating proxy options on 403 errors
   */
  protected async fetchHtml(url: string): Promise<string> {
    const useStealth = this.config.useStealthProxy || false;
    const usePremium = this.config.usePremiumProxy || false;

    // First attempt with configured proxy level
    console.log(`[${this.config.name}] Fetching with stealthProxy=${useStealth}, premiumProxy=${usePremium}`);
    const result = await scrapeUrl(url, {
      renderJs: true,
      timeout: 30000,
      stealthProxy: useStealth,
      premiumProxy: !useStealth && usePremium,
    });

    if (result.success) {
      return result.html;
    }

    // If we got a 403 and weren't using stealth proxy, try escalating
    if (result.statusCode === 403 && !useStealth) {
      // Try stealth proxy as last resort
      console.log(`[${this.config.name}] Got 403, retrying with stealth proxy`);
      const retryResult = await scrapeUrl(url, {
        renderJs: true,
        timeout: 30000,
        stealthProxy: true,
      });

      if (retryResult.success) {
        return retryResult.html;
      }

      throw new Error(retryResult.error || `Failed to fetch ${url} (even with stealth proxy)`);
    }

    throw new Error(result.error || `Failed to fetch ${url}`);
  }

  /**
   * Legacy direct fetch (for testing or when scraping service unavailable)
   */
  protected async fetchHtmlDirect(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.text();
  }

  /**
   * Main scan implementation
   */
  async scan(input: ScanInput): Promise<ScanResult[]> {
    const results: ScanResult[] = [];
    const startTime = Date.now();

    try {
      console.log(`[${this.config.name}] Starting scan...`);
      console.log(`[${this.config.name}] Input: name="${input.fullName}", hasAddresses=${!!input.addresses?.length}`);
      console.log(`[${this.config.name}] Scraping service enabled: ${isScrapingServiceEnabled()}`);

      const searchUrl = this.buildSearchUrl(input);
      if (!searchUrl) {
        console.log(`[${this.config.name}] No search URL built (missing required data)`);
        return results;
      }

      console.log(`[${this.config.name}] Search URL: ${searchUrl}`);

      // Rate limiting delay
      console.log(`[${this.config.name}] Waiting ${this.config.rateLimit.delayMs}ms (rate limit)...`);
      await this.delay(this.config.rateLimit.delayMs);

      console.log(`[${this.config.name}] Fetching HTML...`);
      const fetchStart = Date.now();
      const html = await this.fetchHtml(searchUrl);
      const fetchTime = Date.now() - fetchStart;
      console.log(`[${this.config.name}] Received ${html.length} bytes in ${fetchTime}ms`);

      // Log HTML snippet for debugging (first 500 chars)
      const htmlPreview = html.substring(0, 500).replace(/\s+/g, ' ');
      console.log(`[${this.config.name}] HTML preview: ${htmlPreview}...`);

      const searchResult = this.parseSearchResults(html, input);
      console.log(`[${this.config.name}] Parse result: found=${searchResult.found}, hasProfileUrl=${!!searchResult.profileUrl}, hasLocation=${!!searchResult.location}`);

      if (searchResult.found) {
        results.push(this.createExposureResult(searchResult, input));
        console.log(`[${this.config.name}] Created exposure result`);
      } else {
        // Log why no result was found
        const hasName = input.fullName && html.toLowerCase().includes(input.fullName.toLowerCase().split(' ')[0]);
        console.log(`[${this.config.name}] No result - name in HTML: ${hasName}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error(`[${this.config.name}] Scan error: ${errorMessage}`);
      if (errorStack) {
        console.error(`[${this.config.name}] Stack: ${errorStack.split('\n').slice(0, 3).join(' | ')}`);
      }
      // Don't throw - return empty results on error
    }

    const totalTime = Date.now() - startTime;
    console.log(`[${this.config.name}] Completed in ${totalTime}ms with ${results.length} results`);
    return results;
  }

  /**
   * Create a standardized exposure result
   */
  protected createExposureResult(
    searchResult: BrokerSearchResult,
    input: ScanInput
  ): ScanResult {
    const dataPreview = this.buildDataPreview(searchResult, input);

    return {
      source: this.config.source,
      sourceName: this.config.name,
      sourceUrl: searchResult.profileUrl || this.config.baseUrl,
      dataType: "COMBINED_PROFILE",
      dataPreview,
      severity: this.calculateProfileSeverity(searchResult),
      rawData: {
        profileUrl: searchResult.profileUrl,
        location: searchResult.location,
        age: searchResult.age,
        relativesCount: searchResult.relatives?.length || 0,
        addressesCount: searchResult.addresses?.length || 0,
        phonesCount: searchResult.phones?.length || 0,
        optOutUrl: this.config.optOutUrl,
        optOutInstructions: this.config.optOutInstructions,
        estimatedRemovalDays: this.config.estimatedRemovalDays,
        privacyEmail: this.config.privacyEmail,
      },
    };
  }

  /**
   * Build a masked preview of the found data
   */
  protected buildDataPreview(
    searchResult: BrokerSearchResult,
    input: ScanInput
  ): string {
    const parts: string[] = [];

    if (searchResult.name || input.fullName) {
      parts.push(this.maskData(searchResult.name || input.fullName || "", "NAME"));
    }

    if (searchResult.location) {
      parts.push(searchResult.location);
    } else if (searchResult.addresses?.length) {
      parts.push(this.maskData(searchResult.addresses[0], "ADDRESS"));
    }

    if (searchResult.age) {
      parts.push(`Age: ${searchResult.age}`);
    }

    return parts.join(" | ") || "Profile found";
  }

  /**
   * Calculate severity based on data exposed
   */
  protected calculateProfileSeverity(
    searchResult: BrokerSearchResult
  ): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    let score = 0;

    // More data = higher severity
    if (searchResult.phones?.length) score += 2;
    if (searchResult.emails?.length) score += 2;
    if (searchResult.addresses?.length) score += 3;
    if (searchResult.relatives?.length) score += 2;
    if (searchResult.age) score += 1;

    if (score >= 7) return "CRITICAL";
    if (score >= 5) return "HIGH";
    if (score >= 2) return "MEDIUM";
    return "LOW";
  }

  /**
   * Format name for search URL (lowercase, hyphenated)
   */
  protected formatNameForUrl(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z\s]/g, "")
      .replace(/\s+/g, "-");
  }

  /**
   * Format state for URL (abbreviation)
   */
  protected formatStateForUrl(state: string): string {
    const stateMap: Record<string, string> = {
      alabama: "al", alaska: "ak", arizona: "az", arkansas: "ar",
      california: "ca", colorado: "co", connecticut: "ct", delaware: "de",
      florida: "fl", georgia: "ga", hawaii: "hi", idaho: "id",
      illinois: "il", indiana: "in", iowa: "ia", kansas: "ks",
      kentucky: "ky", louisiana: "la", maine: "me", maryland: "md",
      massachusetts: "ma", michigan: "mi", minnesota: "mn", mississippi: "ms",
      missouri: "mo", montana: "mt", nebraska: "ne", nevada: "nv",
      "new hampshire": "nh", "new jersey": "nj", "new mexico": "nm",
      "new york": "ny", "north carolina": "nc", "north dakota": "nd",
      ohio: "oh", oklahoma: "ok", oregon: "or", pennsylvania: "pa",
      "rhode island": "ri", "south carolina": "sc", "south dakota": "sd",
      tennessee: "tn", texas: "tx", utah: "ut", vermont: "vt",
      virginia: "va", washington: "wa", "west virginia": "wv",
      wisconsin: "wi", wyoming: "wy", "district of columbia": "dc",
    };

    const normalized = state.toLowerCase().trim();
    // Return as-is if already abbreviated
    if (normalized.length === 2) return normalized;
    return stateMap[normalized] || normalized;
  }

  /**
   * Check if a name appears in HTML (case-insensitive)
   */
  protected nameInHtml(html: string, name: string): boolean {
    const normalizedHtml = html.toLowerCase();
    const nameParts = name.toLowerCase().split(/\s+/);

    // Check if all parts of the name appear
    return nameParts.every((part) => normalizedHtml.includes(part));
  }

  /**
   * Extract text between markers in HTML
   */
  protected extractBetween(
    html: string,
    startMarker: string,
    endMarker: string
  ): string | null {
    const startIndex = html.indexOf(startMarker);
    if (startIndex === -1) return null;

    const contentStart = startIndex + startMarker.length;
    const endIndex = html.indexOf(endMarker, contentStart);
    if (endIndex === -1) return null;

    return html.substring(contentStart, endIndex).trim();
  }

  /**
   * Extract all matches of a pattern
   */
  protected extractMatches(html: string, pattern: RegExp): string[] {
    const matches: string[] = [];
    let match;
    while ((match = pattern.exec(html)) !== null) {
      if (match[1]) {
        matches.push(match[1].trim());
      }
    }
    return [...new Set(matches)]; // Remove duplicates
  }
}
