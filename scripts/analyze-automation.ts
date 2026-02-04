/**
 * Analyze Automation Capabilities
 *
 * This script shows which data brokers can be automated and via what method.
 * Run with: npx ts-node scripts/analyze-automation.ts
 */

import { getAllAutomatableBrokers, getBestAutomationMethod } from "../src/lib/removers/browser-automation";
import { DATA_BROKER_DIRECTORY } from "../src/lib/removers/data-broker-directory";

function main() {
  console.log("=".repeat(70));
  console.log("AUTOMATION CAPABILITIES ANALYSIS");
  console.log("=".repeat(70));
  console.log();

  const analysis = getAllAutomatableBrokers();

  console.log("SUMMARY:");
  console.log("-".repeat(40));
  console.log(`Total brokers in directory: ${analysis.total}`);
  console.log(`Can automate via FORM:      ${analysis.stats.formCount} brokers`);
  console.log(`Can automate via EMAIL:     ${analysis.stats.emailCount} brokers`);
  console.log(`Requires MANUAL:            ${analysis.stats.manualCount} brokers`);
  console.log(`Overall automation rate:    ${analysis.stats.automationRate}%`);
  console.log();

  // Form automated brokers
  if (analysis.formAutomated.length > 0) {
    console.log("FORM AUTOMATION (no Cloudflare, browser automation possible):");
    console.log("-".repeat(60));
    for (const key of analysis.formAutomated) {
      const broker = DATA_BROKER_DIRECTORY[key];
      console.log(`  - ${broker.name} (${key})`);
    }
    console.log();
  }

  // Email automated brokers (these are the key ones!)
  console.log("EMAIL AUTOMATION (Cloudflare-blocked brokers with privacyEmail):");
  console.log("-".repeat(60));
  if (analysis.emailAutomated.length === 0) {
    console.log("  (none)");
  } else {
    for (const key of analysis.emailAutomated.slice(0, 30)) {
      const broker = DATA_BROKER_DIRECTORY[key];
      const method = getBestAutomationMethod(key);
      console.log(`  - ${broker.name.padEnd(30)} ${broker.privacyEmail?.padEnd(35) || 'N/A'}`);
    }
    if (analysis.emailAutomated.length > 30) {
      console.log(`  ... and ${analysis.emailAutomated.length - 30} more`);
    }
  }
  console.log();

  // Manual only brokers
  console.log("MANUAL ONLY (no automation available):");
  console.log("-".repeat(60));
  if (analysis.manualOnly.length === 0) {
    console.log("  (none - 100% automation!)");
  } else {
    for (const key of analysis.manualOnly.slice(0, 20)) {
      const broker = DATA_BROKER_DIRECTORY[key];
      const method = getBestAutomationMethod(key);
      console.log(`  - ${broker.name.padEnd(30)} Reason: ${method.reason}`);
    }
    if (analysis.manualOnly.length > 20) {
      console.log(`  ... and ${analysis.manualOnly.length - 20} more`);
    }
  }
  console.log();

  // Recommendations
  console.log("=".repeat(70));
  console.log("RECOMMENDATIONS:");
  console.log("-".repeat(60));

  if (analysis.stats.formCount === 0) {
    console.log("1. All form-configured brokers have Cloudflare protection.");
    console.log("   Consider residential proxies or focus on email automation.");
  }

  if (analysis.stats.emailCount > 0) {
    console.log(`2. ${analysis.stats.emailCount} brokers can receive automated CCPA/GDPR emails.`);
    console.log("   The system will automatically use email when form automation fails.");
  }

  if (analysis.stats.manualCount > 0) {
    console.log(`3. ${analysis.stats.manualCount} brokers still require manual user action.`);
    console.log("   Consider adding privacyEmail contacts to reduce manual work.");
  }

  console.log();
  console.log("=".repeat(70));
}

main();
