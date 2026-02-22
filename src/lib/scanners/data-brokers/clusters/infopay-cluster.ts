/**
 * InfoPay/Accucom Cluster — 1 parser → ~17 scanners
 *
 * Parent: InfoPay Inc. (CA-registered, owns InfoTracer)
 * All sites share the same backend HTML structure and search patterns.
 * InfoTracer is the primary scanner (already in Tier 1 via INFOTRACER key).
 *
 * Common patterns:
 * - Search URL: /search?name=First+Last or /people/First-Last
 * - No-result indicators: "no results found", "0 records", "no records"
 * - Result structure: person-card/search-result with name, location, age
 */

import { ClusterBrokerScanner, type UrlBuilder, type HtmlParser } from "../cluster-scanner";
import type { BrokerConfig, BrokerSearchResult } from "../base-broker-scanner";
import type { ScanInput } from "../../base-scanner";
import type { DataSource } from "@/lib/types";

// ─── Shared URL Builder ─────────────────────────────────────────────────
// InfoPay/InfoTracer sites use query-param format: ?fname=First&lname=Last
// This matches the real InfoTracer URL pattern and avoids 404s from path-based URLs

const infopayUrlBuilder: UrlBuilder = (input: ScanInput, config: BrokerConfig): string | null => {
  if (!input.fullName) return null;
  const nameParts = input.fullName.trim().split(/\s+/);
  if (nameParts.length < 2) return null;

  const firstName = encodeURIComponent(nameParts[0]);
  const lastName = encodeURIComponent(nameParts[nameParts.length - 1]);

  // Use query params — universal across InfoPay network
  return `${config.searchUrl}?fname=${firstName}&lname=${lastName}`;
};

const infopayParser: HtmlParser = (html: string, input: ScanInput): BrokerSearchResult => {
  const result: BrokerSearchResult = { found: false };

  // Check for no-result indicators (shared across InfoPay cluster)
  const noResultPatterns = [
    "no results found",
    "0 records",
    "no records",
    "no matching records",
    "person not found",
    "we couldn't find",
  ];
  const htmlLower = html.toLowerCase();
  if (noResultPatterns.some(p => htmlLower.includes(p))) {
    return result;
  }

  // Check for positive result indicators
  const hasResults =
    html.includes("person-card") ||
    html.includes("search-result") ||
    html.includes("result-item") ||
    html.includes("View Full Report") ||
    html.includes("View Record") ||
    html.includes("records found") ||
    (input.fullName && input.fullName.split(" ").every(part =>
      htmlLower.includes(part.toLowerCase())
    ));

  if (!hasResults) return result;

  result.found = true;

  // Extract location
  const locationMatch = html.match(
    /(?:Located in|Lives in|Location|Current City)[:\s]*([^<,]+,\s*[A-Z]{2})/i
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
  const addressCount = (html.match(/(?:address|addresses|lived at)/gi) || []).length;
  if (addressCount > 0) {
    result.addresses = new Array(Math.min(addressCount, 5)).fill("Address on file");
  }

  const phoneCount = (html.match(/(?:phone|phones|mobile|landline)/gi) || []).length;
  if (phoneCount > 0) {
    result.phones = new Array(Math.min(phoneCount, 3)).fill("Phone on file");
  }

  const relativesMatch = html.match(/(\d+)\s*(?:relatives|associates|family)/i);
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

const INFOPAY_SITES: ClusterSite[] = [
  { key: "RECORDSFINDER", name: "RecordsFinder", baseUrl: "https://recordsfinder.com", searchPath: "/people-search", optOutUrl: "https://recordsfinder.com/optout", privacyEmail: "privacy@recordsfinder.com" },
  { key: "COURTCASEFINDER", name: "CourtCaseFinder", baseUrl: "https://courtcasefinder.com", searchPath: "/people-search", optOutUrl: "https://courtcasefinder.com/optout", privacyEmail: "privacy@courtcasefinder.com" },
  { key: "STATERECORDS", name: "StateRecords", baseUrl: "https://staterecords.org", searchPath: "/people-search", optOutUrl: "https://staterecords.org/optout", privacyEmail: "privacy@staterecords.org" },
  { key: "VERIFYRECORDS", name: "VerifyRecords", baseUrl: "https://www.verifyrecords.com", searchPath: "/people-search", optOutUrl: "https://www.verifyrecords.com/optout" },
  { key: "GOVWARRANTSEARCH", name: "GovWarrantSearch", baseUrl: "https://govwarrantsearch.com", searchPath: "/people-search", optOutUrl: "https://govwarrantsearch.com/optout" },
  { key: "NDB", name: "NDB (National Database)", baseUrl: "https://ndb.com", searchPath: "/people-search", optOutUrl: "https://ndb.com/optout" },
  { key: "VERIFYPUBLICRECORDS", name: "VerifyPublicRecords", baseUrl: "https://verifypublicrecords.com", searchPath: "/people-search", optOutUrl: "https://verifypublicrecords.com/optout" },
  { key: "USWARRANTS", name: "USWarrants", baseUrl: "https://uswarrants.org", searchPath: "/people-search", optOutUrl: "https://uswarrants.org/optout" },
  { key: "USRECORDS", name: "USRecords", baseUrl: "https://usrecords.org", searchPath: "/people-search", optOutUrl: "https://usrecords.org/optout" },
  // REVERSERECORDS removed — redirects to infotracer.com (wastes ScrapingBee credit)
  // INFOPAGES removed — redirects to infotracer.com (wastes ScrapingBee credit)
  // DEATHRECORDS removed — site is dead (ERR_CONNECTION_CLOSED)
  { key: "SEARCHUSAPEOPLE", name: "SearchUSAPeople", baseUrl: "https://searchusapeople.com", searchPath: "/people-search", optOutUrl: "https://searchusapeople.com/optout" },
  { key: "FREEBACKGROUNDCHECK_IP", name: "FreeBackgroundCheck (InfoPay)", baseUrl: "https://freebackgroundcheck.org", searchPath: "/people-search", optOutUrl: "https://freebackgroundcheck.org/optout" },
  // CRIMINALRECORDS removed — site is dead (ERR_CONNECTION_CLOSED)
  { key: "BIRTHRECORDS", name: "BirthRecords", baseUrl: "https://birthrecords.org", searchPath: "/people-search", optOutUrl: "https://birthrecords.org/optout" },
];

// ─── Factory Functions ──────────────────────────────────────────────────

function createInfoPayScanner(site: ClusterSite): ClusterBrokerScanner {
  const config: BrokerConfig = {
    name: site.name,
    source: site.key as DataSource,
    baseUrl: site.baseUrl,
    searchUrl: `${site.baseUrl}${site.searchPath}`,
    optOutUrl: site.optOutUrl,
    optOutInstructions:
      `1. Go to ${site.optOutUrl}\n` +
      `2. Search for your name\n` +
      `3. Select your listing\n` +
      `4. Follow the opt-out process\n` +
      `5. Verify via email if required`,
    estimatedRemovalDays: 7,
    privacyEmail: site.privacyEmail,
    requiresVerification: false,
    usePremiumProxy: true,
    rateLimit: { requestsPerMinute: 5, delayMs: 2000 },
  };

  return new ClusterBrokerScanner(config, infopayUrlBuilder, infopayParser);
}

/** Create all InfoPay cluster scanners */
export function createInfoPayClusterScanners(): ClusterBrokerScanner[] {
  return INFOPAY_SITES.map(site => createInfoPayScanner(site));
}

/** All InfoPay cluster broker keys (for PEOPLE_SEARCH_SOURCES) */
export const INFOPAY_BROKER_KEYS = INFOPAY_SITES.map(s => s.key);
