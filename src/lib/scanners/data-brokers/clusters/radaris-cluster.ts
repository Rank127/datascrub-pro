/**
 * Radaris/Norden Cluster — 1 parser → ~12 scanners
 *
 * Parent: Gary Norden / Radaris (confirmed by Krebs on Security)
 * All sites share Radaris's backend HTML structure.
 * Radaris itself is the primary scanner (already in Tier 1).
 *
 * Common patterns:
 * - Search URL: /p/First/Last/ or /search/First+Last
 * - Result indicators: person-card, profile-details, View Full Profile
 * - Shares Radaris CSS class names and result structure
 */

import { ClusterBrokerScanner, type UrlBuilder, type HtmlParser } from "../cluster-scanner";
import type { BrokerConfig, BrokerSearchResult } from "../base-broker-scanner";
import type { ScanInput } from "../../base-scanner";
import type { DataSource } from "@/lib/types";

// ─── Shared Parser (mirrors Radaris parser logic) ───────────────────────

const radarisUrlBuilder: UrlBuilder = (input: ScanInput, config: BrokerConfig): string | null => {
  if (!input.fullName) return null;
  const nameParts = input.fullName.trim().split(/\s+/);
  if (nameParts.length < 2) return null;

  const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
  const lastName = nameParts[nameParts.length - 1].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].slice(1).toLowerCase();

  return `${config.searchUrl}/${firstName}/${lastName}/`;
};

const radarisParser: HtmlParser = (html: string, input: ScanInput): BrokerSearchResult => {
  const result: BrokerSearchResult = { found: false };

  // Check for no-result indicators
  const noResults =
    html.includes("No results found") ||
    html.includes("We couldn't find") ||
    html.includes("Person not found") ||
    html.includes("0 results");

  if (noResults) return result;

  // Check for positive result indicators (shared Radaris HTML patterns)
  const hasResults =
    html.includes("person-card") ||
    html.includes("profile-details") ||
    html.includes("search-result") ||
    html.includes("View Full Profile") ||
    html.includes("View Details") ||
    (input.fullName && input.fullName.split(" ").every(part =>
      html.toLowerCase().includes(part.toLowerCase())
    ));

  if (!hasResults) return result;

  result.found = true;

  // Extract location
  const locationMatch = html.match(
    /(?:Located in|Lives in|Current Location)[:\s]*([^<,]+,\s*[A-Z]{2})/i
  );
  if (locationMatch) {
    result.location = locationMatch[1].trim();
  }

  // Extract age
  const ageMatch = html.match(/(?:Age|age)[:\s]*(\d+)/);
  if (ageMatch) {
    result.age = ageMatch[1];
  }

  // Count addresses
  const addressCount = (html.match(/(?:address|addresses|lived at)/gi) || []).length;
  if (addressCount > 0) {
    result.addresses = new Array(Math.min(addressCount, 10)).fill("Address on file");
  }

  // Count phones
  const phoneCount = (html.match(/(?:phone|phones|mobile|landline)/gi) || []).length;
  if (phoneCount > 0) {
    result.phones = new Array(Math.min(phoneCount, 5)).fill("Phone on file");
  }

  // Count relatives
  const relativesMatch = html.match(/(\d+)\s*(?:relatives|family|associates)/i);
  if (relativesMatch) {
    result.relatives = new Array(parseInt(relativesMatch[1])).fill("Relative");
  }

  // Check for email
  const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    result.emails = [emailMatch[0]];
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

const RADARIS_SITES: ClusterSite[] = [
  { key: "CENTEDA", name: "Centeda", baseUrl: "https://centeda.com", searchPath: "/p", optOutUrl: "https://centeda.com/ng/privacy", privacyEmail: "support@centeda.com" },
  { key: "PUBLICREPORTS", name: "PublicReports", baseUrl: "https://publicreports.com", searchPath: "/p", optOutUrl: "https://publicreports.com/ng/privacy", privacyEmail: "support@publicreports.com" },
  { key: "VIRTORY", name: "Virtory", baseUrl: "https://virtory.com", searchPath: "/p", optOutUrl: "https://virtory.com/ng/privacy" },
  { key: "CLUBSET", name: "Clubset", baseUrl: "https://clubset.com", searchPath: "/p", optOutUrl: "https://clubset.com/ng/privacy" },
  { key: "PERSONTRUST", name: "PersonTrust", baseUrl: "https://persontrust.com", searchPath: "/p", optOutUrl: "https://persontrust.com/ng/privacy" },
  { key: "COUNCILON", name: "Councilon", baseUrl: "https://councilon.com", searchPath: "/p", optOutUrl: "https://councilon.com/ng/privacy" },
  { key: "KWOLD", name: "Kwold", baseUrl: "https://kwold.com", searchPath: "/p", optOutUrl: "https://kwold.com/ng/privacy" },
  { key: "NEWENGLANDFACTS", name: "NewEnglandFacts", baseUrl: "https://newenglandfacts.com", searchPath: "/p", optOutUrl: "https://newenglandfacts.com/ng/privacy" },
  { key: "PUB360", name: "Pub360", baseUrl: "https://pub360.com", searchPath: "/p", optOutUrl: "https://pub360.com/ng/privacy" },
  { key: "DATAVERIA_CLUSTER", name: "DataVeria", baseUrl: "https://dataveria.com", searchPath: "/p", optOutUrl: "https://dataveria.com/ng/privacy" },
  { key: "VERICORA", name: "Vericora", baseUrl: "https://vericora.com", searchPath: "/p", optOutUrl: "https://vericora.com/ng/privacy" },
];

// ─── Factory Functions ──────────────────────────────────────────────────

function createRadarisClusterScanner(site: ClusterSite): ClusterBrokerScanner {
  const config: BrokerConfig = {
    name: site.name,
    source: site.key as DataSource,
    baseUrl: site.baseUrl,
    searchUrl: `${site.baseUrl}${site.searchPath}`,
    optOutUrl: site.optOutUrl,
    optOutInstructions:
      `1. Go to ${site.optOutUrl}\n` +
      `2. Search for your name\n` +
      `3. Find your profile listing\n` +
      `4. Request removal via the privacy page\n` +
      `5. Verify your identity if required`,
    estimatedRemovalDays: 7,
    privacyEmail: site.privacyEmail,
    requiresVerification: true,
    usePremiumProxy: true,
    rateLimit: { requestsPerMinute: 5, delayMs: 3000 },
  };

  return new ClusterBrokerScanner(config, radarisUrlBuilder, radarisParser);
}

/** Create all Radaris cluster scanners */
export function createRadarisClusterScanners(): ClusterBrokerScanner[] {
  return RADARIS_SITES.map(site => createRadarisClusterScanner(site));
}

/** All Radaris cluster broker keys (for PEOPLE_SEARCH_SOURCES) */
export const RADARIS_BROKER_KEYS = RADARIS_SITES.map(s => s.key);
