/**
 * Process Return Emails from Data Brokers
 *
 * Reads return email files and updates removal requests accordingly.
 * Categories:
 * - CONFIRMED_REMOVAL: Broker confirmed they will delete the data
 * - NO_RECORD: Broker confirmed no record exists
 * - REQUIRES_MANUAL: User needs to take manual action (portal, form, etc.)
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import * as fs from "fs";
import * as path from "path";
import { processReturnEmails } from "../src/lib/agents/operations-agent";
import { prisma } from "../src/lib/db";

// Default file to process
const DEFAULT_FILE = path.join(
  __dirname,
  "..",
  "Emails-Returns",
  "Return-Email-RK020326.txt"
);

async function main() {
  const filePath = process.argv[2] || DEFAULT_FILE;

  console.log("=".repeat(70));
  console.log("PROCESS RETURN EMAILS FROM DATA BROKERS");
  console.log("=".repeat(70));
  console.log();

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`Reading: ${filePath}`);
  const emailContent = fs.readFileSync(filePath, "utf-8");
  console.log(`File size: ${emailContent.length} characters`);
  console.log();

  try {
    console.log("Processing emails...");
    console.log("-".repeat(50));
    let result;
    try {
      result = await processReturnEmails(emailContent);
    } catch (err) {
      console.error("Error in processReturnEmails:", err);
      throw err;
    }

    if (!result) {
      console.error("processReturnEmails returned undefined/null");
      process.exit(1);
    }

    console.log();
    console.log("=".repeat(70));
    console.log("PROCESSING RESULTS");
    console.log("=".repeat(70));
    console.log();
    console.log(`  Total Processed:     ${result.processed}`);
    console.log(`  Confirmed Removals:  ${result.confirmedRemovals}`);
    console.log(`  No Record Found:     ${result.noRecordFound}`);
    console.log(`  Requires Manual:     ${result.requiresManual}`);
    console.log(`  Unknown/Review:      ${result.unknown}`);
    console.log();

    if (result.updates.length > 0) {
      console.log("DETAILED UPDATES:");
      console.log("-".repeat(50));
      for (const update of result.updates) {
        console.log(`  ${update.broker.padEnd(20)} | ${update.userName.padEnd(20)}`);
        console.log(`    Action: ${update.action}`);
        console.log(`    Status: ${update.status}`);
        console.log();
      }
    }

    // Summary by category
    console.log("=".repeat(70));
    console.log("NEXT STEPS");
    console.log("=".repeat(70));
    console.log();

    if (result.confirmedRemovals > 0) {
      console.log("CONFIRMED REMOVALS:");
      console.log("  These requests are now IN_PROGRESS. The broker will complete removal.");
      console.log("  Check back in 30-45 days to verify removal is complete.");
      console.log();
    }

    if (result.noRecordFound > 0) {
      console.log("NO RECORD FOUND:");
      console.log("  These have been marked as REMOVED - no action needed.");
      console.log("  The user's data was not present on these brokers.");
      console.log();
    }

    if (result.requiresManual > 0) {
      console.log("REQUIRES MANUAL ACTION:");
      console.log("  These brokers need the user to take action themselves.");
      console.log("  Send users instructions from the removal request notes.");
      console.log();

      // List the manual actions
      const manualUpdates = result.updates.filter((u) => u.action === "Marked REQUIRES_MANUAL");
      for (const update of manualUpdates) {
        console.log(`  - ${update.broker}: ${update.status}`);
      }
      console.log();
    }

    console.log("=".repeat(70));
  } catch (error) {
    console.error("Error processing emails:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
