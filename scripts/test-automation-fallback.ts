/**
 * Test Automation Fallback Logic
 *
 * Tests that the smart fallback from form to email works correctly.
 * Run with: npx tsx scripts/test-automation-fallback.ts
 */

import {
  getBestAutomationMethod,
  canAutomateBroker,
  getAllAutomatableBrokers,
  canAutomateBrokerAny,
} from "../src/lib/removers/browser-automation";
import { DATA_BROKER_DIRECTORY } from "../src/lib/removers/data-broker-directory";

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => boolean, message: string) {
  try {
    const passed = fn();
    results.push({ name, passed, message: passed ? "PASS" : message });
  } catch (error) {
    results.push({
      name,
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

console.log("=".repeat(70));
console.log("AUTOMATION FALLBACK TESTS");
console.log("=".repeat(70));
console.log();

// Test 1: Spokeo - has Cloudflare but supports email
test(
  "Spokeo should fall back to EMAIL",
  () => {
    const result = getBestAutomationMethod("SPOKEO");
    return result.method === "EMAIL" && result.canAutomate === true;
  },
  `Expected EMAIL, got ${getBestAutomationMethod("SPOKEO").method}`
);

// Test 2: BeenVerified - has Cloudflare but supports email
test(
  "BeenVerified should fall back to EMAIL",
  () => {
    const result = getBestAutomationMethod("BEENVERIFIED");
    return result.method === "EMAIL" && result.canAutomate === true;
  },
  `Expected EMAIL, got ${getBestAutomationMethod("BEENVERIFIED").method}`
);

// Test 3: WhitePages - form only, no email support
test(
  "WhitePages should require MANUAL (form-only with Cloudflare)",
  () => {
    const result = getBestAutomationMethod("WHITEPAGES");
    return result.method === "MANUAL" && result.canAutomate === false;
  },
  `Expected MANUAL, got ${getBestAutomationMethod("WHITEPAGES").method}`
);

// Test 4: TruePeopleSearch - supports both, should try email since form blocked
test(
  "TruePeopleSearch should fall back to EMAIL",
  () => {
    const result = getBestAutomationMethod("TRUEPEOPLESEARCH");
    return result.method === "EMAIL";
  },
  `Expected EMAIL, got ${getBestAutomationMethod("TRUEPEOPLESEARCH").method}`
);

// Test 5: Radaris - supports both
test(
  "Radaris should fall back to EMAIL",
  () => {
    const result = getBestAutomationMethod("RADARIS");
    return result.method === "EMAIL";
  },
  `Expected EMAIL, got ${getBestAutomationMethod("RADARIS").method}`
);

// Test 6: Unknown broker should return MANUAL
test(
  "Unknown broker should return MANUAL",
  () => {
    const result = getBestAutomationMethod("UNKNOWN_BROKER_XYZ");
    return result.method === "MANUAL" && result.canAutomate === false;
  },
  `Expected MANUAL for unknown broker`
);

// Test 7: canAutomateBroker should return false for Cloudflare-blocked sites
test(
  "canAutomateBroker returns false for Cloudflare sites",
  () => {
    const result = canAutomateBroker("SPOKEO");
    return result.canAutomate === false && result.reason?.includes("Cloudflare");
  },
  `Expected Cloudflare blocking message`
);

// Test 8: canAutomateBrokerAny should return true for email-capable sites
test(
  "canAutomateBrokerAny returns true for email-capable sites",
  () => {
    const result = canAutomateBrokerAny("SPOKEO");
    return result.canAutomate === true && result.preferredMethod === "EMAIL";
  },
  `Expected canAutomate=true with EMAIL method`
);

// Test 9: Check automation stats are reasonable
test(
  "getAllAutomatableBrokers returns valid stats",
  () => {
    const stats = getAllAutomatableBrokers();
    return (
      stats.total > 0 &&
      stats.stats.emailCount > 0 &&
      stats.stats.automationRate > 0 &&
      stats.stats.automationRate <= 100
    );
  },
  `Stats look invalid`
);

// Test 10: Verify email brokers list is populated
test(
  "Email-automatable brokers list is populated",
  () => {
    const stats = getAllAutomatableBrokers();
    return (
      stats.emailAutomated.length > 100 &&
      stats.emailAutomated.includes("SPOKEO") &&
      stats.emailAutomated.includes("BEENVERIFIED")
    );
  },
  `Expected major brokers in email list`
);

// Test 11: Verify reason message is helpful
test(
  "Fallback reason message is descriptive",
  () => {
    const result = getBestAutomationMethod("SPOKEO");
    return (
      result.reason.includes("Cloudflare") &&
      result.reason.includes("email")
    );
  },
  `Reason should mention Cloudflare and email fallback`
);

// Test 12: Verify form-only broker with no email goes to MANUAL
test(
  "Form-only broker without email goes to MANUAL",
  () => {
    // Intelius is form-only
    const result = getBestAutomationMethod("INTELIUS");
    const broker = DATA_BROKER_DIRECTORY["INTELIUS"];
    // If it has no privacyEmail and is form-only, should be MANUAL
    if (broker.removalMethod === "FORM" && !broker.privacyEmail) {
      return result.method === "MANUAL";
    }
    // If it does have email, it should fall back to that
    return result.method === "EMAIL" || result.method === "MANUAL";
  },
  `Form-only broker handling incorrect`
);

// Print results
console.log("TEST RESULTS:");
console.log("-".repeat(70));

let passed = 0;
let failed = 0;

for (const result of results) {
  const status = result.passed ? "✓ PASS" : "✗ FAIL";
  console.log(`${status}: ${result.name}`);
  if (!result.passed) {
    console.log(`       ${result.message}`);
  }
  if (result.passed) passed++;
  else failed++;
}

console.log();
console.log("-".repeat(70));
console.log(`Total: ${results.length} tests, ${passed} passed, ${failed} failed`);
console.log();

// Show some example fallback decisions
console.log("EXAMPLE FALLBACK DECISIONS:");
console.log("-".repeat(70));

const exampleBrokers = [
  "SPOKEO",
  "WHITEPAGES",
  "BEENVERIFIED",
  "TRUEPEOPLESEARCH",
  "RADARIS",
  "INTELIUS",
  "FASTPEOPLESEARCH",
];

for (const broker of exampleBrokers) {
  const result = getBestAutomationMethod(broker);
  const info = DATA_BROKER_DIRECTORY[broker];
  console.log(`${broker.padEnd(20)} → ${result.method.padEnd(8)} (${result.reason})`);
  if (info) {
    console.log(`                       removalMethod: ${info.removalMethod}, privacyEmail: ${info.privacyEmail || "N/A"}`);
  }
}

console.log();

// Exit with appropriate code
process.exit(failed > 0 ? 1 : 0);
