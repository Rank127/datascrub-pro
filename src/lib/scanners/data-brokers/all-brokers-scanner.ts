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
  TRUEPEOPLESEARCH: (name, city, _state) =>
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

  // Additional people search sites (Feb 2026)
  GOLOOKUP: (name) => `https://golookup.com/name/${encodeNameForUrl(name)}`,
  PUBLICDATAUSA: (name) => `https://publicdatausa.com/search.php?q=${encodeURIComponent(name)}`,
  FOUR11_INFO: (name) => `https://411.info/name/${encodeNameForUrl(name)}`,
  CITY_DATA: () => `https://www.city-data.com/`,
  LOCATEPEOPLE: (name) => `https://www.locatepeople.org/search/${encodeNameForUrl(name)}`,
  FREEPEOPLEDIRECTORY: (name) => `https://www.freepeopledirectory.com/name/${encodeNameForUrl(name)}`,
  PRIVATEREPORTS: (name) => `https://www.privatereports.com/name/${encodeNameForUrl(name)}`,
  ALLPEOPLE: (name) => `https://allpeople.com/search?q=${encodeURIComponent(name)}`,
  OKCALLER: () => `https://www.okcaller.com/`,
  NUMLOOKER: () => `https://www.numlooker.com/`,
  PEEPLOOKUP: (name) => `https://www.peeplookup.com/people/${encodeNameForUrl(name)}`,
  PERSONSEARCHERS: (name) => `https://www.personsearchers.com/search/${encodeNameForUrl(name)}`,
  BACKGROUNDCHECKERS: (name) => `https://www.backgroundcheckers.net/search/${encodeNameForUrl(name)}`,
  FREEBACKGROUNDCHECK: (name) => `https://www.freebackgroundcheck.org/results?name=${encodeURIComponent(name)}`,
  AROUNDDEAL: (name) => `https://www.arounddeal.com/search/?q=${encodeURIComponent(name)}`,
  NJPARCELS: () => `https://njparcels.com/`,

  // Tier 3 — Marketing data brokers
  MELISSA_DATA: () => `https://www.melissa.com/lookups`,
  ANALYTICSIQ: () => `https://analytics-iq.com/`,
  AUDIENCE_ACUITY: () => `https://audienceacuity.com/`,
  FOUR11_LOCATE: () => `https://www.411locate.com/`,

  // Tier 4 — Niche people search / background / state DBs
  ZOSEARCH: (name) => `https://www.zosearch.com/search/${encodeNameForUrl(name)}`,
  FINDPEOPLEFAST: (name) => `https://www.findpeoplefast.com/search/${encodeNameForUrl(name)}`,
  PUBLICSEARCHER: (name) => `https://www.publicsearcher.com/search/${encodeNameForUrl(name)}`,
  TRUTHRECORD: (name) => `https://www.truthrecord.org/search/${encodeNameForUrl(name)}`,
  SECRETINFO: (name) => `https://www.secretinfo.org/search/${encodeNameForUrl(name)}`,
  SEALEDRECORDS: (name) => `https://www.sealedrecords.net/search/${encodeNameForUrl(name)}`,
  BACKGROUNDCHECK_RUN: (name) => `https://backgroundcheck.run/search/${encodeNameForUrl(name)}`,
  PROPERTYRECS: () => `https://www.propertyrecs.com/`,
  QUICKPUBLICRECORDS: (name) => `https://www.quickpublicrecords.com/search/${encodeNameForUrl(name)}`,
  PUBLICRECORDREPORTS: (name) => `https://www.publicrecordreports.com/search/${encodeNameForUrl(name)}`,
  FLORIDA_RESIDENTS_DIRECTORY: (name) => `https://www.floridaresidentsdirectory.com/search/${encodeNameForUrl(name)}`,
  OHIO_RESIDENT_DATABASE: (name) => `https://www.ohioresidentdatabase.com/search/${encodeNameForUrl(name)}`,
  NC_RESIDENT_DATABASE: (name) => `https://www.northcarolinaresidentdatabase.com/search/${encodeNameForUrl(name)}`,
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
  if ((BROKER_CATEGORIES.PROFESSIONAL_B2B as readonly string[]).includes(brokerKey)) {
    return "MEDIUM";
  }

  // Medium for marketing data brokers
  if ((BROKER_CATEGORIES.MARKETING as readonly string[]).includes(brokerKey)) {
    return "MEDIUM";
  }

  return "LOW";
}

/**
 * Scanner that generates check links for ALL brokers in the directory
 */
export class AllBrokersScanner extends BaseScanner {
  // Only skip social media and breach databases (handled by other scanners)
  // NOTE: We NO LONGER skip dedicated broker scanners (Spokeo, WhitePages, etc.)
  // because scraping may fail due to bot protection. We always generate check links
  // for ALL data brokers so users can manually verify their listings.
  private skipBrokers = new Set([
    // Social media is handled by SocialMediaScanner
    "LINKEDIN", "FACEBOOK", "TWITTER", "INSTAGRAM", "TIKTOK",
    "REDDIT", "PINTEREST", "YOUTUBE", "SNAPCHAT", "DISCORD",
    // Breach databases handled by dedicated scanners (HIBP, LeakCheck)
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

      // For manual action exposures, use the opt-out URL as the primary link
      // This is what users actually need to take action
      let primaryUrl: string;
      let searchUrl: string | undefined;

      // Build search URL if we have a pattern (for user to verify listing)
      const urlBuilder = SEARCH_URL_PATTERNS[brokerKey];
      if (urlBuilder) {
        searchUrl = urlBuilder(name, city, state);
      }

      // Primary URL should be opt-out URL (what user needs to take action)
      if (brokerInfo.optOutUrl) {
        primaryUrl = brokerInfo.optOutUrl;
      } else if (brokerInfo.privacyEmail) {
        // Use mailto: link for email-only brokers
        primaryUrl = `mailto:${brokerInfo.privacyEmail}`;
      } else if (searchUrl) {
        // Fallback to search URL if no opt-out available
        primaryUrl = searchUrl;
      } else {
        // Skip only if no URL and no email available
        console.log(`[AllBrokersScanner] Skipping ${brokerKey} - no contact method`);
        continue;
      }

      results.push({
        source: brokerKey as DataSource,
        sourceName: brokerInfo.name,
        sourceUrl: primaryUrl,
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
          reason: `Potential exposure on ${brokerInfo.name}. Click to opt out or check if listed.`,
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
