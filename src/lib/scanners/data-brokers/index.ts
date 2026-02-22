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

// Cluster scanner base + factory functions
export { ClusterBrokerScanner } from "./cluster-scanner";
export { createInfoPayClusterScanners, INFOPAY_BROKER_KEYS } from "./clusters/infopay-cluster";
export { createRadarisClusterScanners, RADARIS_BROKER_KEYS } from "./clusters/radaris-cluster";
export { createPeopleConnectClusterScanners, PEOPLECONNECT_BROKER_KEYS } from "./clusters/peopleconnect-cluster";

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
import { createInfoPayClusterScanners } from "./clusters/infopay-cluster";
import { createRadarisClusterScanners } from "./clusters/radaris-cluster";
import { createPeopleConnectClusterScanners } from "./clusters/peopleconnect-cluster";
import type { Scanner } from "../base-scanner";

/**
 * Create all real data broker scanners
 * Use this instead of MockDataBrokerScanner.createAll() for production
 *
 * Scanner tiers:
 * - Tier 1 (Critical): 8 original verified scrapers
 * - Tier 2 (Cluster children): InfoPay (~16), Radaris (~11), PeopleConnect (~8) cluster sites
 * - Manual check: 6 sites with paywall SPAs / bot protection
 *
 * Total: 8 active + ~35 cluster + 6 manual = ~49 scanners
 */
export function createRealBrokerScanners(): Scanner[] {
  return [
    // ─── Tier 1: Active scrapers — verified working with premium proxy (Feb 2026)
    new SpokeoScanner(),
    new WhitePagesScanner(),
    new TruePeopleSearchScanner(),
    new RadarisScanner(),
    new InteliusScanner(),
    new TruthFinderScanner(),
    new InstantCheckmateScanner(),
    new MyLifeScanner(),

    // ─── Tier 2: Cluster children — share parent's HTML backend
    ...createInfoPayClusterScanners(),       // ~16 InfoPay/Accucom sites
    ...createRadarisClusterScanners(),       // ~11 Radaris/Norden sites
    ...createPeopleConnectClusterScanners(), // ~8 PeopleConnect sites

    // ─── Manual check: Sites with paywall SPAs or bot protection
    createFastPeopleSearchManualScanner(),
    createPeopleFinderManualScanner(),
    createBeenVerifiedManualScanner(),
    createPeopleLookerManualScanner(),
    createNuwberManualScanner(),
    createCheckPeopleManualScanner(),
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
