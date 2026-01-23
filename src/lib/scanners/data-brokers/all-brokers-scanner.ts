/**
 * All Brokers Scanner
 *
 * Generates manual check results for ALL brokers in the data broker directory.
 * This ensures users are aware of all 66+ potential sources where their data
 * might appear, even if we can't automatically scrape them.
 *
 * For each broker, we return:
 * - A link to check if the user is listed
 * - The opt-out URL
 * - Estimated removal time
 * - Privacy contact email
 */

import { BaseScanner, type ScanInput, type ScanResult } from "../base-scanner";
import {
  DATA_BROKER_DIRECTORY,
  BROKER_CATEGORIES,
  type DataBrokerInfo,
} from "@/lib/removers/data-broker-directory";
import type { DataSource, Severity } from "@/lib/types";

// Search URL patterns for different broker types
const SEARCH_URL_PATTERNS: Record<string, (name: string, city?: string, state?: string) => string> = {
  // People search sites - name-based search URLs
  SPOKEO: (name) => `https://www.spokeo.com/${encodeNameForUrl(name)}`,
  WHITEPAGES: (name, city, state) =>
    `https://www.whitepages.com/name/${encodeNameForUrl(name)}${state ? `/${state}` : ""}${city ? `/${encodeNameForUrl(city)}` : ""}`,
  BEENVERIFIED: (name) => `https://www.beenverified.com/people/${encodeNameForUrl(name)}/`,
  INTELIUS: (name) => `https://www.intelius.com/people-search/${encodeNameForUrl(name)}/`,
  TRUEPEOPLESEARCH: (name, city, state) =>
    `https://www.truepeoplesearch.com/results?name=${encodeURIComponent(name)}${city ? `&citystatezip=${encodeURIComponent(city)}` : ""}`,
  RADARIS: (name) => `https://radaris.com/p/${encodeNameForUrl(name)}/`,
  FASTPEOPLESEARCH: (name, city, state) =>
    `https://www.fastpeoplesearch.com/name/${encodeNameForUrl(name)}${city && state ? `_${encodeNameForUrl(city)}-${state.toLowerCase()}` : ""}`,
  USSEARCH: (name) => `https://www.ussearch.com/search/results/?fn=${encodeURIComponent(name.split(" ")[0])}&ln=${encodeURIComponent(name.split(" ").slice(-1)[0])}`,
  PEOPLEFINDER: (name, city, state) =>
    `https://www.peoplefinder.com/results.php?name=${encodeURIComponent(name)}${state ? `&state=${state}` : ""}`,
  INSTANTCHECKMATE: (name) => `https://www.instantcheckmate.com/people/${encodeNameForUrl(name)}/`,
  PEOPLELOOKER: (name) => `https://www.peoplelooker.com/people-search/${encodeNameForUrl(name)}`,
  PEOPLEFINDERS: (name, city, state) =>
    `https://www.peoplefinders.com/people/${encodeNameForUrl(name)}${city && state ? `/${encodeNameForUrl(city)}-${state.toLowerCase()}` : ""}`,
  THATSTHEM: (name) => `https://thatsthem.com/name/${encodeNameForUrl(name)}`,
  PUBLICRECORDSNOW: (name) => `https://www.publicrecordsnow.com/name/${encodeNameForUrl(name)}`,
  FAMILYTREENOW: (name) => `https://www.familytreenow.com/search/genealogy/results?first=${encodeURIComponent(name.split(" ")[0])}&last=${encodeURIComponent(name.split(" ").slice(-1)[0])}`,
  MYLIFE: (name) => `https://www.mylife.com/pub/search?firstName=${encodeURIComponent(name.split(" ")[0])}&lastName=${encodeURIComponent(name.split(" ").slice(-1)[0])}`,
  TRUTHFINDER: (name) => `https://www.truthfinder.com/results/?firstName=${encodeURIComponent(name.split(" ")[0])}&lastName=${encodeURIComponent(name.split(" ").slice(-1)[0])}`,
  CHECKPEOPLE: (name) => `https://www.checkpeople.com/search/results?name=${encodeURIComponent(name)}`,
  CYBERBACKGROUNDCHECKS: (name) => `https://www.cyberbackgroundchecks.com/people/${encodeNameForUrl(name)}`,
  NUWBER: (name) => `https://nuwber.com/search?name=${encodeURIComponent(name)}`,
  SPYDIALER: (name) => `https://www.spydialer.com/results.aspx?name=${encodeURIComponent(name)}`,
  USPHONEBOOK: (name) => `https://www.usphonebook.com/${encodeNameForUrl(name)}`,
  VOTERRECORDS: (name, city, state) =>
    `https://voterrecords.com/voters?name=${encodeURIComponent(name)}${state ? `&state=${state}` : ""}`,

  // B2B/Professional
  ZOOMINFO: (name) => `https://www.zoominfo.com/s/#!search/profile/person?personName=${encodeURIComponent(name)}`,
  LUSHA: (name) => `https://www.lusha.com/search/#people?name=${encodeURIComponent(name)}`,
  APOLLO: (name) => `https://app.apollo.io/#/people?qKeywords=${encodeURIComponent(name)}`,
  ROCKETREACH: (name) => `https://rocketreach.co/search?searchTerm=${encodeURIComponent(name)}`,
  CLEARBIT: (name) => `https://dashboard.clearbit.com/people?query=${encodeURIComponent(name)}`,

  // Property records
  NEIGHBOR_WHO: (name) => `https://www.neighborwho.com/people/${encodeNameForUrl(name)}`,
  HOMEMETRY: (name) => `https://homemetry.com/search?q=${encodeURIComponent(name)}`,

  // Marketing data brokers - typically don't have public search
  ACXIOM: () => `https://isapps.acxiom.com/optout/optout.aspx`,
  LEXISNEXIS: () => `https://optout.lexisnexis.com/`,
  ORACLE_DATACLOUD: () => `https://www.oracle.com/legal/privacy/marketing-cloud-data-cloud-privacy-policy.html#optout`,
  EXPERIAN_MARKETING: () => `https://www.experian.com/privacy/opt-out-form`,
};

// Helper to encode name for URL paths
function encodeNameForUrl(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-");
}

// Get severity based on broker category
function getSeverityForBroker(brokerKey: string): Severity {
  // Higher severity for sites that aggregate lots of PII
  const highSeveritySites = [
    "SPOKEO", "WHITEPAGES", "BEENVERIFIED", "INTELIUS", "RADARIS",
    "TRUTHFINDER", "INSTANTCHECKMATE", "MYLIFE", "ZOOMINFO",
    "LEXISNEXIS", "ACXIOM", "EXPERIAN_MARKETING"
  ];

  if (highSeveritySites.includes(brokerKey)) {
    return "HIGH";
  }

  // Medium for professional/B2B
  if (BROKER_CATEGORIES.PROFESSIONAL_B2B.includes(brokerKey as any)) {
    return "MEDIUM";
  }

  // Medium for marketing data brokers
  if (BROKER_CATEGORIES.MARKETING.includes(brokerKey as any)) {
    return "MEDIUM";
  }

  return "LOW";
}

/**
 * Scanner that generates check links for ALL brokers in the directory
 */
export class AllBrokersScanner extends BaseScanner {
  // Brokers to skip (already handled by dedicated scrapers or social media scanner)
  private skipBrokers = new Set([
    // These have dedicated scrapers
    "SPOKEO", "WHITEPAGES", "BEENVERIFIED", "TRUEPEOPLESEARCH",
    "FASTPEOPLESEARCH", "RADARIS", "INTELIUS", "PEOPLEFINDER",
    // Social media is handled by SocialMediaScanner
    "LINKEDIN", "FACEBOOK", "TWITTER", "INSTAGRAM", "TIKTOK",
    "REDDIT", "PINTEREST", "YOUTUBE", "SNAPCHAT", "DISCORD",
    // Breach databases handled by dedicated scanners
    "HAVEIBEENPWNED", "DEHASHED", "LEAKCHECK", "SNUSBASE",
  ]);

  get name(): string {
    return "All Data Brokers";
  }

  get source(): DataSource {
    return "OTHER";
  }

  async scan(input: ScanInput): Promise<ScanResult[]> {
    if (!input.fullName) {
      console.log("[AllBrokersScanner] No name provided, skipping");
      return [];
    }

    const results: ScanResult[] = [];
    const name = input.fullName;
    const city = input.addresses?.[0]?.city;
    const state = input.addresses?.[0]?.state;

    // Get all brokers from the directory
    const allBrokers = Object.entries(DATA_BROKER_DIRECTORY);
    console.log(`[AllBrokersScanner] Checking ${allBrokers.length} brokers`);

    for (const [brokerKey, brokerInfo] of allBrokers) {
      // Skip brokers that have dedicated scanners
      if (this.skipBrokers.has(brokerKey)) {
        continue;
      }

      // Build search URL if we have a pattern, otherwise use opt-out URL
      let searchUrl: string;
      const urlBuilder = SEARCH_URL_PATTERNS[brokerKey];

      if (urlBuilder) {
        searchUrl = urlBuilder(name, city, state);
      } else if (brokerInfo.optOutUrl) {
        // Fallback to opt-out URL
        searchUrl = brokerInfo.optOutUrl;
      } else {
        // Skip if no URL available
        continue;
      }

      results.push({
        source: brokerKey as DataSource,
        sourceName: brokerInfo.name,
        sourceUrl: searchUrl,
        dataType: "COMBINED_PROFILE",
        dataPreview: `Check if listed on ${brokerInfo.name}`,
        severity: getSeverityForBroker(brokerKey),
        rawData: {
          manualCheckRequired: true,
          searchUrl,
          optOutUrl: brokerInfo.optOutUrl,
          privacyEmail: brokerInfo.privacyEmail,
          estimatedRemovalDays: brokerInfo.estimatedDays,
          removalMethod: brokerInfo.removalMethod,
          notes: brokerInfo.notes,
          reason: `Potential exposure on ${brokerInfo.name}. Click to verify if your information is listed.`,
        },
      });
    }

    console.log(`[AllBrokersScanner] Generated ${results.length} check links`);
    return results;
  }
}

/**
 * Create scanner for all remaining brokers not covered by dedicated scanners
 */
export function createAllBrokersScanner(): AllBrokersScanner {
  return new AllBrokersScanner();
}
