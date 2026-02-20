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

// Manual check scanners for sites with advanced bot protection
export {
  ManualCheckScanner,
  createFastPeopleSearchManualScanner,
  createPeopleFinderManualScanner,
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
import { BeenVerifiedScanner } from "./beenverified-scanner";
import { TruePeopleSearchScanner } from "./truepeoplesearch-scanner";
import { RadarisScanner } from "./radaris-scanner";
import { InteliusScanner } from "./intelius-scanner";
import { TruthFinderScanner } from "./truthfinder-scanner";
import { InstantCheckmateScanner } from "./instantcheckmate-scanner";
import { PeopleLookerScanner } from "./peoplelooker-scanner";
import { MyLifeScanner } from "./mylife-scanner";
import { NuwberScanner } from "./nuwber-scanner";
import { CheckPeopleScanner } from "./checkpeople-scanner";
import {
  createFastPeopleSearchManualScanner,
  createPeopleFinderManualScanner,
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
    // Active scrapers for major brokers
    new SpokeoScanner(),
    new WhitePagesScanner(),
    new BeenVerifiedScanner(),
    new TruePeopleSearchScanner(),
    createFastPeopleSearchManualScanner(), // Manual check - advanced bot protection
    new RadarisScanner(),
    new InteliusScanner(),
    new TruthFinderScanner(),
    new InstantCheckmateScanner(),
    new PeopleLookerScanner(),
    new MyLifeScanner(),
    new NuwberScanner(),
    new CheckPeopleScanner(),
    createPeopleFinderManualScanner(), // Manual check - advanced bot protection
    // NOTE: AllBrokersScanner removed - it created fake "potential" exposures
    // for 2,100+ brokers without confirming user is actually listed
  ];
}

/**
 * Get scanner by data source
 */
export function getScannerBySource(source: string): Scanner | null {
  // Manual check scanners (sites with advanced bot protection)
  if (source === "FASTPEOPLESEARCH") {
    return createFastPeopleSearchManualScanner();
  }
  if (source === "PEOPLEFINDER") {
    return createPeopleFinderManualScanner();
  }

  // Regular scraped scanners
  const scannerMap: Record<string, new () => Scanner> = {
    SPOKEO: SpokeoScanner,
    WHITEPAGES: WhitePagesScanner,
    BEENVERIFIED: BeenVerifiedScanner,
    TRUEPEOPLESEARCH: TruePeopleSearchScanner,
    RADARIS: RadarisScanner,
    INTELIUS: InteliusScanner,
    TRUTHFINDER: TruthFinderScanner,
    INSTANTCHECKMATE: InstantCheckmateScanner,
    PEOPLELOOKER: PeopleLookerScanner,
    MYLIFE: MyLifeScanner,
    NUWBER: NuwberScanner,
    CHECKPEOPLE: CheckPeopleScanner,
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
