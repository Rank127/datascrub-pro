/**
 * Test Removal Service Flow
 *
 * Simulates the removal flow to verify the fallback logic works correctly.
 * Run with: npx tsx scripts/test-removal-flow.ts
 */

import { getBestAutomationMethod, canAutomateBroker } from "../src/lib/removers/browser-automation";
import { getDataBrokerInfo } from "../src/lib/removers/data-broker-directory";

interface SimulatedRemovalResult {
  broker: string;
  originalMethod: string;
  formCheck: { canAutomate: boolean; reason?: string };
  bestMethod: { method: string; canAutomate: boolean; reason: string };
  finalAction: string;
  wouldSendEmail: boolean;
  wouldRequireManual: boolean;
}

function simulateRemovalFlow(brokerKey: string, requestedMethod: string): SimulatedRemovalResult {
  const brokerInfo = getDataBrokerInfo(brokerKey);
  const formCheck = canAutomateBroker(brokerKey);
  const bestMethod = getBestAutomationMethod(brokerKey);

  let finalAction: string;
  let wouldSendEmail = false;
  let wouldRequireManual = false;

  // Simulate the logic in removal-service.ts executeRemoval()
  if (requestedMethod === "AUTO_FORM" || requestedMethod === "FORM") {
    if (formCheck.canAutomate) {
      finalAction = "FORM_SUBMIT";
    } else if (bestMethod.method === "EMAIL" || (brokerInfo?.privacyEmail && (brokerInfo.removalMethod === "BOTH" || brokerInfo.removalMethod === "EMAIL"))) {
      finalAction = "EMAIL_FALLBACK";
      wouldSendEmail = true;
    } else {
      finalAction = "REQUIRES_MANUAL";
      wouldRequireManual = true;
    }
  } else if (requestedMethod === "AUTO_EMAIL" || requestedMethod === "EMAIL") {
    if (brokerInfo?.privacyEmail) {
      finalAction = "EMAIL_SEND";
      wouldSendEmail = true;
    } else {
      finalAction = "REQUIRES_MANUAL";
      wouldRequireManual = true;
    }
  } else {
    finalAction = "REQUIRES_MANUAL";
    wouldRequireManual = true;
  }

  return {
    broker: brokerKey,
    originalMethod: requestedMethod,
    formCheck,
    bestMethod,
    finalAction,
    wouldSendEmail,
    wouldRequireManual,
  };
}

console.log("=".repeat(80));
console.log("REMOVAL FLOW SIMULATION");
console.log("=".repeat(80));
console.log();

// Test cases: broker + requested method combinations
const testCases = [
  // Cloudflare-blocked brokers with email support
  { broker: "SPOKEO", method: "AUTO_FORM" },
  { broker: "BEENVERIFIED", method: "FORM" },
  { broker: "TRUEPEOPLESEARCH", method: "AUTO_FORM" },
  { broker: "RADARIS", method: "FORM" },

  // Cloudflare-blocked brokers without email (form-only)
  { broker: "WHITEPAGES", method: "AUTO_FORM" },
  { broker: "INTELIUS", method: "FORM" },

  // Direct email requests
  { broker: "SPOKEO", method: "AUTO_EMAIL" },
  { broker: "FASTPEOPLESEARCH", method: "EMAIL" },

  // Unknown broker
  { broker: "UNKNOWN_XYZ", method: "AUTO_FORM" },
];

console.log("Simulating removal flow for various broker/method combinations:");
console.log("-".repeat(80));
console.log();

let emailCount = 0;
let manualCount = 0;

for (const testCase of testCases) {
  const result = simulateRemovalFlow(testCase.broker, testCase.method);

  console.log(`${result.broker} (requested: ${result.originalMethod})`);
  console.log(`  Form automation: ${result.formCheck.canAutomate ? "✓ Available" : `✗ Blocked (${result.formCheck.reason})`}`);
  console.log(`  Best method: ${result.bestMethod.method} (${result.bestMethod.reason})`);
  console.log(`  → Final action: ${result.finalAction}`);

  if (result.wouldSendEmail) {
    console.log(`  ✉️  Would send CCPA/GDPR email`);
    emailCount++;
  }
  if (result.wouldRequireManual) {
    console.log(`  👤 Would require manual action`);
    manualCount++;
  }
  console.log();
}

console.log("-".repeat(80));
console.log("SUMMARY:");
console.log(`  Automated via email: ${emailCount}/${testCases.length} (${Math.round(emailCount/testCases.length*100)}%)`);
console.log(`  Requires manual:     ${manualCount}/${testCases.length} (${Math.round(manualCount/testCases.length*100)}%)`);
console.log();

// Verification
const expectedEmails = 6; // SPOKEO, BEENVERIFIED, TRUEPEOPLESEARCH, RADARIS, SPOKEO(email), FASTPEOPLESEARCH
const expectedManual = 3; // WHITEPAGES, INTELIUS, UNKNOWN

if (emailCount === expectedEmails && manualCount === expectedManual) {
  console.log("✓ All assertions passed! Fallback logic working correctly.");
  process.exit(0);
} else {
  console.log(`✗ Assertion failed! Expected ${expectedEmails} emails and ${expectedManual} manual, got ${emailCount} and ${manualCount}`);
  process.exit(1);
}
