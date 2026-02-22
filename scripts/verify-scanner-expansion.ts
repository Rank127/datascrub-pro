/**
 * Quick verification script for scanner expansion + parent-routed removals
 */
import { createInfoPayClusterScanners } from "../src/lib/scanners/data-brokers/clusters/infopay-cluster";
import { createRadarisClusterScanners } from "../src/lib/scanners/data-brokers/clusters/radaris-cluster";
import { createPeopleConnectClusterScanners } from "../src/lib/scanners/data-brokers/clusters/peopleconnect-cluster";
import { getDataBrokerInfo, getConsolidationParent, getSubsidiaries } from "../src/lib/removers/data-broker-directory";
import { CONFIDENCE_THRESHOLDS } from "../src/lib/scanners/base-scanner";

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

console.log("=== Scanner Expansion Verification ===\n");

// 1. Cluster scanner instantiation
console.log("1. Cluster Scanner Creation");
const infopay = createInfoPayClusterScanners();
const radaris = createRadarisClusterScanners();
const pc = createPeopleConnectClusterScanners();

check(`InfoPay cluster: ${infopay.length} scanners`, infopay.length === 12);
check(`Radaris cluster: ${radaris.length} scanners`, radaris.length === 10);
check(`PeopleConnect cluster: ${pc.length} scanners`, pc.length === 8);
check(`Total new scanners: ${infopay.length + radaris.length + pc.length}`, infopay.length + radaris.length + pc.length === 30);

// 2. Parent-child relationships
console.log("\n2. Parent-Child Relationships");
check("CENTEDA → RADARIS", getConsolidationParent("CENTEDA") === "RADARIS");
check("NDB → INFOTRACER", getConsolidationParent("NDB") === "INFOTRACER");
check("SNOOPSTATION → INTELIUS", getConsolidationParent("SNOOPSTATION") === "INTELIUS");
check("DATAVERIA_CLUSTER → RADARIS", getConsolidationParent("DATAVERIA_CLUSTER") === "RADARIS");

const radarisKids = getSubsidiaries("RADARIS");
const infotracerKids = getSubsidiaries("INFOTRACER");
const inteliusKids = getSubsidiaries("INTELIUS");
check(`RADARIS has ${radarisKids.length} subsidiaries`, radarisKids.length === 10);
check(`INFOTRACER has ${infotracerKids.length} subsidiaries`, infotracerKids.length >= 12);
check(`INTELIUS has ${inteliusKids.length} subsidiaries`, inteliusKids.length >= 13);

// 3. Broker info exists for cluster children
console.log("\n3. Broker Info for Cluster Children");
check("CENTEDA has broker info", !!getDataBrokerInfo("CENTEDA"));
check("NDB has broker info", !!getDataBrokerInfo("NDB"));
check("SNOOPSTATION has broker info", !!getDataBrokerInfo("SNOOPSTATION"));
check("CENTEDA has consolidatesTo", getDataBrokerInfo("CENTEDA")?.consolidatesTo === "RADARIS");

// 4. Parent removal routing
console.log("\n4. Parent Removal Routing");
const radarisInfo = getDataBrokerInfo("RADARIS");
const infotracerInfo = getDataBrokerInfo("INFOTRACER");
check("RADARIS has privacy email", !!radarisInfo?.privacyEmail);
check("INFOTRACER has privacy email", !!infotracerInfo?.privacyEmail);

// When child is removed, email should go to parent
const centedaParent = getConsolidationParent("CENTEDA");
const parentInfo = centedaParent ? getDataBrokerInfo(centedaParent) : null;
check("CENTEDA removal routes to RADARIS email", parentInfo?.privacyEmail === radarisInfo?.privacyEmail);

// 5. Confidence thresholds
console.log("\n5. Confidence Thresholds");
check("AUTO_PROCEED = 75", CONFIDENCE_THRESHOLDS.AUTO_PROCEED === 75);
check("DISPLAY = 50", CONFIDENCE_THRESHOLDS.DISPLAY === 50);
check("MANUAL_REVIEW = 40", CONFIDENCE_THRESHOLDS.MANUAL_REVIEW === 40);

// 6. Scanner configs have proper structure
console.log("\n6. Scanner Config Structure");
const firstInfopay = infopay[0];
check("Scanner has config.source", !!firstInfopay.config.source);
check("Scanner has config.name", !!firstInfopay.config.name);
check("Scanner has config.searchUrl", !!firstInfopay.config.searchUrl);

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
