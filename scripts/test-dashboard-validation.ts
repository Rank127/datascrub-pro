/**
 * Test Dashboard Data Validation
 *
 * Tests the QA Agent's dashboard validation capability
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { validateDashboardData } from "../src/lib/agents/qa-agent";
import { prisma } from "../src/lib/db";

async function test() {
  console.log("Testing Dashboard Data Validation...");
  console.log("=".repeat(70));
  console.log();

  try {
    const result = await validateDashboardData();

    console.log(`Validation completed at: ${result.validatedAt}`);
    console.log(`Duration: ${result.duration}ms`);
    console.log();

    // Overall Status
    const statusEmoji = result.overallStatus === "PASS" ? "✓" : result.overallStatus === "WARN" ? "⚠" : "✗";
    console.log(`Overall Status: ${statusEmoji} ${result.overallStatus}`);
    console.log(`Checks: ${result.checksPassed}/${result.checksPerformed} passed`);
    console.log();

    // Individual Checks
    console.log("VALIDATION CHECKS:");
    console.log("-".repeat(70));
    for (const check of result.checks) {
      const emoji = check.status === "PASS" ? "✓" : check.status === "WARN" ? "⚠" : "✗";
      console.log(`  ${emoji} ${check.name}`);
      console.log(`     ${check.message}`);
      if (check.expected !== undefined && check.actual !== undefined) {
        console.log(`     Expected: ${check.expected}, Actual: ${check.actual}`);
      }
    }
    console.log();

    // Data Integrity Summary
    console.log("DATA INTEGRITY:");
    console.log("-".repeat(70));
    console.log(`  Orphaned Removals:    ${result.dataIntegrity.orphanedRemovals}`);
    console.log(`  Missing Exposures:    ${result.dataIntegrity.missingExposures}`);
    console.log(`  Status Mismatches:    ${result.dataIntegrity.statusMismatches}`);
    console.log(`  Duplicate Exposures:  ${result.dataIntegrity.duplicateExposures}`);
    console.log();

    // User Sample Checks
    if (result.userSampleChecks.length > 0) {
      console.log("USER SAMPLE CHECKS:");
      console.log("-".repeat(70));
      for (const user of result.userSampleChecks) {
        const userEmoji = user.status === "PASS" ? "✓" : "✗";
        console.log(`  ${userEmoji} User ${user.userId}`);
        if (user.issues.length > 0) {
          for (const issue of user.issues) {
            console.log(`     ⚠ ${issue}`);
          }
        } else {
          console.log(`     All checks passed`);
        }
      }
      console.log();
    }

    // Recommendations
    if (result.recommendations.length > 0) {
      console.log("RECOMMENDATIONS:");
      console.log("-".repeat(70));
      for (const rec of result.recommendations) {
        console.log(`  → ${rec}`);
      }
      console.log();
    }

    console.log("=".repeat(70));
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
