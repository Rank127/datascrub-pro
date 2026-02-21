// Real Data Broker Scanners
// These scanners search actual data broker websites for user information

export { BaseBrokerScanner } from "./base-broker-scanner";
export type { BrokerConfig, BrokerSearchResult } from "./base-broker-scanner";

// Individual scanner implementations
export { SpokeoScanner } from "./spokeo-scanner";
export { WhitePagesScanner } from "./whitepages-scanner";
export { BeenVerifiedScanner } from "./beenverified-scanner";
export { TruePeopleSearchScanner } from "./truepeoplesearch-scanner";
export { FastPeopleSearchScanner } from "./fastpeoplesearch-scanner";
export { RadarisScanner } from "./radaris-scanner";
export { InteliusScanner } from "./intelius-scanner";
export { PeopleFinderScanner } from "./peoplefinder-scanner";
export { TruthFinderScanner } from "./truthfinder-scanner";
export { InstantCheckmateScanner } from "./instantcheckmate-scanner";
export { PeopleLookerScanner } from "./peoplelooker-scanner";
export { MyLifeScanner } from "./mylife-scanner";
export { NuwberScanner } from "./nuwber-scanner";
export { CheckPeopleScanner } from "./checkpeople-scanner";

// Manual check scanners for sites with bot protection / paywall SPAs
export {
  ManualCheckScanner,
  createFastPeopleSearchManualScanner,
  createPeopleFinderManualScanner,
  createBeenVerifiedManualScanner,
  createPeopleLookerManualScanner,
  createNuwberManualScanner,
  createCheckPeopleManualScanner,
} from "./manual-check-scanner";

// Legacy mock scanner (kept for testing/development)
export { MockDataBrokerScanner } from "./mock-broker-scanner";

// All brokers scanner - generates check links for ALL 2,100+ brokers
export { AllBrokersScanner, createAllBrokersScanner } from "./all-brokers-scanner";

// Dynamic broker scanner — reads config from DB, no code deploy needed
export { DynamicBrokerScanner, loadDynamicScanners } from "./dynamic-broker-scanner";
export type { ParsingRules, DynamicScannerRow } from "./dynamic-broker-scanner";

import { SpokeoScanner } from "./spokeo-scanner";
import { WhitePagesScanner } from "./whitepages-scanner";
import { TruePeopleSearchScanner } from "./truepeoplesearch-scanner";
import { RadarisScanner } from "./radaris-scanner";
import { InteliusScanner } from "./intelius-scanner";
import { TruthFinderScanner } from "./truthfinder-scanner";
import { InstantCheckmateScanner } from "./instantcheckmate-scanner";
import { MyLifeScanner } from "./mylife-scanner";
import {
  createFastPeopleSearchManualScanner,
  createPeopleFinderManualScanner,
  createBeenVerifiedManualScanner,
  createPeopleLookerManualScanner,
  createNuwberManualScanner,
  createCheckPeopleManualScanner,
} from "./manual-check-scanner";
// createAllBrokersScanner is available for comprehensive scanning
import type { Scanner } from "../base-scanner";

/**
 * Create all real data broker scanners
 * Use this instead of MockDataBrokerScanner.createAll() for production
 *
 * Note: FastPeopleSearch and PeopleFinders use manual check scanners
 * because they have advanced bot protection that blocks scraping.
 * These return a link for the user to check manually.
 *
 * IMPORTANT: We removed AllBrokersScanner because it was generating 2,100+
 * "potential exposure" items for every broker in the directory, overwhelming
 * users with manual review tasks for sites they may not even be listed on.
 * Only confirmed exposures from actual scans should be shown.
 */
export function createRealBrokerScanners(): Scanner[] {
  return [
    // Active scrapers — verified working with premium proxy (Feb 2026)
    new SpokeoScanner(),
    new WhitePagesScanner(),
    new TruePeopleSearchScanner(),
    new RadarisScanner(),
    new InteliusScanner(),
    new TruthFinderScanner(),
    new InstantCheckmateScanner(),   // Fixed: /results/?firstName=...&lastName=... (was 404 on /people/)
    new MyLifeScanner(),             // Fixed: /{first-last}/ path (was 404 on /pub/search)

    // Manual check — sites with paywall SPAs or bot protection that blocks scraping
    createFastPeopleSearchManualScanner(),
    createPeopleFinderManualScanner(),
    createBeenVerifiedManualScanner(),   // React SPA — search URLs don't return scrapable results
    createPeopleLookerManualScanner(),   // Paywall SPA — search paths redirect to generic page
    createNuwberManualScanner(),         // Returns 0 bytes — completely blocks scrapers
    createCheckPeopleManualScanner(),    // All URL patterns return 404
  ];
}

/**
 * Get scanner by data source
 */
export function getScannerBySource(source: string): Scanner | null {
  // Manual check scanners (sites with bot protection / paywall SPAs)
  const manualCheckFactories: Record<string, () => Scanner> = {
    FASTPEOPLESEARCH: createFastPeopleSearchManualScanner,
    PEOPLEFINDER: createPeopleFinderManualScanner,
    BEENVERIFIED: createBeenVerifiedManualScanner,
    PEOPLELOOKER: createPeopleLookerManualScanner,
    NUWBER: createNuwberManualScanner,
    CHECKPEOPLE: createCheckPeopleManualScanner,
  };

  if (manualCheckFactories[source]) {
    return manualCheckFactories[source]();
  }

  // Regular scraped scanners
  const scannerMap: Record<string, new () => Scanner> = {
    SPOKEO: SpokeoScanner,
    WHITEPAGES: WhitePagesScanner,
    TRUEPEOPLESEARCH: TruePeopleSearchScanner,
    RADARIS: RadarisScanner,
    INTELIUS: InteliusScanner,
    TRUTHFINDER: TruthFinderScanner,
    INSTANTCHECKMATE: InstantCheckmateScanner,
    MYLIFE: MyLifeScanner,
  };

  const ScannerClass = scannerMap[source];
  return ScannerClass ? new ScannerClass() : null;
}

/**
 * List of all supported data broker sources
 */
export const SUPPORTED_DATA_BROKERS = [
  "SPOKEO",
  "WHITEPAGES",
  "BEENVERIFIED",
  "TRUEPEOPLESEARCH",
  "FASTPEOPLESEARCH",
  "RADARIS",
  "INTELIUS",
  "PEOPLEFINDER",
  "TRUTHFINDER",
  "INSTANTCHECKMATE",
  "PEOPLELOOKER",
  "MYLIFE",
  "NUWBER",
  "CHECKPEOPLE",
] as const;

export type SupportedDataBroker = (typeof SUPPORTED_DATA_BROKERS)[number];
