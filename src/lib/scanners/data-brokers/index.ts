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

// Legacy mock scanner (kept for testing/development)
export { MockDataBrokerScanner } from "./mock-broker-scanner";

import { SpokeoScanner } from "./spokeo-scanner";
import { WhitePagesScanner } from "./whitepages-scanner";
import { BeenVerifiedScanner } from "./beenverified-scanner";
import { TruePeopleSearchScanner } from "./truepeoplesearch-scanner";
import { FastPeopleSearchScanner } from "./fastpeoplesearch-scanner";
import { RadarisScanner } from "./radaris-scanner";
import { InteliusScanner } from "./intelius-scanner";
import { PeopleFinderScanner } from "./peoplefinder-scanner";
import type { Scanner } from "../base-scanner";

/**
 * Create all real data broker scanners
 * Use this instead of MockDataBrokerScanner.createAll() for production
 */
export function createRealBrokerScanners(): Scanner[] {
  return [
    new SpokeoScanner(),
    new WhitePagesScanner(),
    new BeenVerifiedScanner(),
    new TruePeopleSearchScanner(),
    new FastPeopleSearchScanner(),
    new RadarisScanner(),
    new InteliusScanner(),
    new PeopleFinderScanner(),
  ];
}

/**
 * Get scanner by data source
 */
export function getScannerBySource(source: string): Scanner | null {
  const scannerMap: Record<string, new () => Scanner> = {
    SPOKEO: SpokeoScanner,
    WHITEPAGES: WhitePagesScanner,
    BEENVERIFIED: BeenVerifiedScanner,
    TRUEPEOPLESEARCH: TruePeopleSearchScanner,
    FASTPEOPLESEARCH: FastPeopleSearchScanner,
    RADARIS: RadarisScanner,
    INTELIUS: InteliusScanner,
    PEOPLEFINDER: PeopleFinderScanner,
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
] as const;

export type SupportedDataBroker = (typeof SUPPORTED_DATA_BROKERS)[number];
