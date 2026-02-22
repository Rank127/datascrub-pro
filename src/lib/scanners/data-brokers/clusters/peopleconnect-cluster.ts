/**
 * PeopleConnect/Intelius Cluster — 1 parser → ~8 scanners
 *
 * Parent: PeopleConnect Inc (owns Intelius)
 * All sites share the same backend HTML structure and search patterns.
 * Intelius is the primary scanner (already in Tier 1).
 *
 * Common patterns:
 * - Search URL: /people-search/first-last or /search/first-last
 * - Result indicators: search-results, person-card, View Report
 * - Shares Intelius CSS class names and result structure
 */

import { ClusterBrokerScanner, type UrlBuilder, type HtmlParser } from "../cluster-scanner";
import type { BrokerConfig, BrokerSearchResult } from "../base-broker-scanner";
import type { ScanInput } from "../../base-scanner";
import type { DataSource } from "@/lib/types";

// ─── Shared Parser (mirrors Intelius parser logic) ──────────────────────

const peopleConnectUrlBuilder: UrlBuilder = (input: ScanInput, config: BrokerConfig): string | null => {
  if (!input.fullName) return null;
  const nameParts = input.fullName.trim().split(/\s+/);
  if (nameParts.length < 2) return null;

  const firstName = nameParts[0].toLowerCase();
  const lastName = nameParts[nameParts.length - 1].toLowerCase();

  return `${config.searchUrl}/${firstName}-${lastName}`;
};

const peopleConnectParser: HtmlParser = (html: string, input: ScanInput): BrokerSearchResult => {
  const result: BrokerSearchResult = { found: false };

  // Check for no-result indicators
  const noResults =
    html.includes("No results found") ||
    html.includes("We couldn't find") ||
    html.includes("0 results") ||
    html.includes("Try another search");

  if (noResults) return result;

  // Check for positive result indicators (shared Intelius/PeopleConnect HTML patterns)
  const hasResults =
    html.includes("search-results") ||
    html.includes("person-card") ||
    html.includes("result-item") ||
    html.includes("View Report") ||
    html.includes("View Full Report") ||
    (input.fullName && input.fullName.split(" ").every(part =>
      html.toLowerCase().includes(part.toLowerCase())
    ));

  if (!hasResults) return result;

  result.found = true;

  // Extract profile URL
  const profileUrlMatch = html.match(/href="(\/people\/[^"]+)"/);
  if (profileUrlMatch) {
    result.profileUrl = profileUrlMatch[1];
  }

  // Extract location
  const locationMatch = html.match(
    /(?:Lives in|Location)[:\s]*([^<]+(?:,\s*[A-Z]{2}))/i
  );
  if (locationMatch) {
    result.location = locationMatch[1].trim();
  }

  // Extract age
  const ageMatch = html.match(/(?:Age|age)[:\s]*(\d+)/);
  if (ageMatch) {
    result.age = ageMatch[1];
  }

  // Count data indicators
  const addressCount = (html.match(/(?:address|addresses)/gi) || []).length;
  if (addressCount > 0) {
    result.addresses = new Array(Math.min(addressCount, 5)).fill("Address on file");
  }

  const phoneCount = (html.match(/(?:phone|phones)/gi) || []).length;
  if (phoneCount > 0) {
    result.phones = new Array(Math.min(phoneCount, 3)).fill("Phone on file");
  }

  const relativesMatch = html.match(/(\d+)\s*(?:relatives|associates)/i);
  if (relativesMatch) {
    result.relatives = new Array(parseInt(relativesMatch[1])).fill("Relative");
  }

  return result;
};

// ─── Site Configurations ────────────────────────────────────────────────

interface ClusterSite {
  key: string;
  name: string;
  baseUrl: string;
  searchPath: string;
  optOutUrl: string;
  privacyEmail?: string;
}

const PEOPLECONNECT_SITES: ClusterSite[] = [
  { key: "SNOOPSTATION", name: "SnoopStation", baseUrl: "https://www.snoopstation.com", searchPath: "/people-search", optOutUrl: "https://www.snoopstation.com/opt-out" },
  { key: "ONLINESEARCHES", name: "OnlineSearches", baseUrl: "https://www.onlinesearches.com", searchPath: "/people-search", optOutUrl: "https://www.onlinesearches.com/opt-out" },
  { key: "EASYBACKGROUNDCHECKS_PC", name: "EasyBackgroundChecks", baseUrl: "https://www.easybackgroundchecks.com", searchPath: "/people-search", optOutUrl: "https://www.easybackgroundchecks.com/opt-out" },
  { key: "PEOPLELOOKUP", name: "PeopleLookup", baseUrl: "https://www.peoplelookup.com", searchPath: "/people-search", optOutUrl: "https://www.peoplelookup.com/opt-out", privacyEmail: "privacy@peoplelookup.com" },
  { key: "USAPEOPLEDATA", name: "USAPeopleData", baseUrl: "https://usapeopledata.com", searchPath: "/search", optOutUrl: "https://usapeopledata.com/opt-out" },
  { key: "ALLAREACODES", name: "AllAreaCodes", baseUrl: "https://www.allareacodes.com", searchPath: "/people", optOutUrl: "https://www.allareacodes.com/opt-out" },
  { key: "GEORGIAPUBLICRECORDS", name: "GeorgiaPublicRecords", baseUrl: "https://georgiapublicrecords.com", searchPath: "/search", optOutUrl: "https://georgiapublicrecords.com/opt-out" },
  { key: "REVERSEPHONELOOKUP_PC", name: "ReversePhoneLookup", baseUrl: "https://www.reversephonelookup.com", searchPath: "/people", optOutUrl: "https://www.reversephonelookup.com/opt-out" },
];

// ─── Factory Functions ──────────────────────────────────────────────────

function createPeopleConnectScanner(site: ClusterSite): ClusterBrokerScanner {
  const config: BrokerConfig = {
    name: site.name,
    source: site.key as DataSource,
    baseUrl: site.baseUrl,
    searchUrl: `${site.baseUrl}${site.searchPath}`,
    optOutUrl: site.optOutUrl,
    optOutInstructions:
      `1. Go to ${site.optOutUrl}\n` +
      `2. Search for your name and location\n` +
      `3. Select your listing from the results\n` +
      `4. Enter your email address\n` +
      `5. Click the verification link sent to your email\n` +
      `6. Your information will be removed within 72 hours`,
    estimatedRemovalDays: 3,
    privacyEmail: site.privacyEmail,
    requiresVerification: true,
    usePremiumProxy: true,
    rateLimit: { requestsPerMinute: 5, delayMs: 3000 },
  };

  return new ClusterBrokerScanner(config, peopleConnectUrlBuilder, peopleConnectParser);
}

/** Create all PeopleConnect cluster scanners */
export function createPeopleConnectClusterScanners(): ClusterBrokerScanner[] {
  return PEOPLECONNECT_SITES.map(site => createPeopleConnectScanner(site));
}

/** All PeopleConnect cluster broker keys (for PEOPLE_SEARCH_SOURCES) */
export const PEOPLECONNECT_BROKER_KEYS = PEOPLECONNECT_SITES.map(s => s.key);
