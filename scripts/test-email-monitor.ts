/**
 * Test Email Delivery Monitor
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { runEmailDeliveryMonitor } from "../src/lib/agents/operations-agent";
import { prisma } from "../src/lib/db";

async function test() {
  console.log("Testing Email Delivery Monitor...");
  console.log("=".repeat(60));

  try {
    const result = await runEmailDeliveryMonitor();

    console.log();
    console.log("RESULTS:");
    console.log("-".repeat(40));
    console.log(`Total Emails Checked: ${result.totalEmails}`);
    console.log(`Delivered:            ${result.delivered}`);
    console.log(`Bounced:              ${result.bounced}`);
    console.log(`Suppressed:           ${result.suppressed}`);
    console.log(`Delivery Rate:        ${result.deliveryRate}%`);
    console.log();

    if (result.problemEmails.length > 0) {
      console.log("PROBLEM EMAILS:");
      console.log("-".repeat(40));
      for (const prob of result.problemEmails.slice(0, 20)) {
        console.log(`  ${prob.email.padEnd(35)} (${prob.status.padEnd(10)}) - ${prob.domain}`);
      }
      if (result.problemEmails.length > 20) {
        console.log(`  ... and ${result.problemEmails.length - 20} more`);
      }
    } else {
      console.log("No problem emails found - all deliveries successful!");
    }

    if (result.actionsToken.length > 0) {
      console.log();
      console.log("ACTIONS FLAGGED:");
      console.log("-".repeat(40));
      for (const action of result.actionsToken.slice(0, 10)) {
        console.log(`  ${action.action}: ${action.source} - ${action.reason}`);
      }
    }

    console.log();
    console.log("=".repeat(60));

    // Summary assessment
    if (result.deliveryRate >= 95) {
      console.log("✓ EXCELLENT: Delivery rate is healthy (>= 95%)");
    } else if (result.deliveryRate >= 80) {
      console.log("⚠ WARNING: Delivery rate below optimal (80-95%)");
    } else {
      console.log("✗ CRITICAL: Delivery rate is low (< 80%) - action required!");
    }

    console.log();
    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Test failed:", error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack.split("\n").slice(0, 5).join("\n"));
    }
  } finally {
    await prisma.$disconnect();
  }
}

test();
