/**
 * Cleanup Script: Remove Data Processor Exposures and Pending Requests
 *
 * This script removes exposures and pending removal requests for companies
 * that have been identified as Data Processors (not Data Brokers).
 *
 * Data Processors should NOT receive deletion requests because:
 * 1. They only process data on behalf of Data Controllers (their clients)
 * 2. Per GDPR Articles 28/29, they cannot action deletion requests without Controller authorization
 * 3. Sending requests may actually add data to systems where it didn't exist
 *
 * Run with: npx tsx scripts/cleanup-data-processor-requests.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Data Processors that should NOT have exposures or removal requests
const DATA_PROCESSOR_PATTERNS = {
  // Source names (as stored in database)
  sourceNames: [
    "SYNDIGO",
    "POWERREVIEWS",
    "POWER_REVIEWS",
    "1WORLDSYNC",
    "BAZAARVOICE",
    "YOTPO",
    "YOTPO_DATA",
  ],
  // Domain patterns to match in sourceUrl
  domainPatterns: [
    "syndigo.com",
    "powerreviews.com",
    "1worldsync.com",
    "bazaarvoice.com",
    "yotpo.com",
  ],
};

interface CleanupStats {
  exposuresFound: number;
  exposuresUpdated: number;
  removalRequestsCancelled: number;
  usersAffected: Set<string>;
}

async function findDataProcessorExposures(): Promise<
  Array<{
    id: string;
    userId: string;
    source: string;
    sourceName: string;
    sourceUrl: string | null;
    status: string;
  }>
> {
  // Build OR conditions for source names
  const sourceConditions = DATA_PROCESSOR_PATTERNS.sourceNames.map((name) => ({
    source: { contains: name, mode: "insensitive" as const },
  }));

  // Build OR conditions for domain patterns in sourceUrl
  const urlConditions = DATA_PROCESSOR_PATTERNS.domainPatterns.map((domain) => ({
    sourceUrl: { contains: domain, mode: "insensitive" as const },
  }));

  const exposures = await prisma.exposure.findMany({
    where: {
      OR: [...sourceConditions, ...urlConditions],
      // Only find active exposures (not already removed/whitelisted)
      status: {
        notIn: ["REMOVED", "WHITELISTED"],
      },
    },
    select: {
      id: true,
      userId: true,
      source: true,
      sourceName: true,
      sourceUrl: true,
      status: true,
    },
  });

  return exposures;
}

async function findPendingRemovalRequests(exposureIds: string[]): Promise<
  Array<{
    id: string;
    exposureId: string;
    status: string;
    userId: string;
  }>
> {
  if (exposureIds.length === 0) return [];

  const requests = await prisma.removalRequest.findMany({
    where: {
      exposureId: { in: exposureIds },
      status: {
        in: ["PENDING", "SUBMITTED", "IN_PROGRESS", "REQUIRES_MANUAL"],
      },
    },
    select: {
      id: true,
      exposureId: true,
      status: true,
      userId: true,
    },
  });

  return requests;
}

async function cleanupDataProcessorRequests(dryRun: boolean = true): Promise<CleanupStats> {
  const stats: CleanupStats = {
    exposuresFound: 0,
    exposuresUpdated: 0,
    removalRequestsCancelled: 0,
    usersAffected: new Set(),
  };

  console.log("=".repeat(70));
  console.log("DATA PROCESSOR CLEANUP SCRIPT");
  console.log(`Mode: ${dryRun ? "DRY RUN (no changes)" : "LIVE (making changes)"}`);
  console.log("=".repeat(70));
  console.log();

  // Step 1: Find all exposures for data processors
  console.log("Step 1: Finding Data Processor exposures...");
  const exposures = await findDataProcessorExposures();
  stats.exposuresFound = exposures.length;

  if (exposures.length === 0) {
    console.log("No Data Processor exposures found. Nothing to clean up.");
    return stats;
  }

  console.log(`Found ${exposures.length} exposures for Data Processors:`);
  for (const exp of exposures) {
    console.log(`  - ${exp.sourceName} (${exp.source}): ${exp.sourceUrl || "no URL"} [${exp.status}]`);
    stats.usersAffected.add(exp.userId);
  }
  console.log();

  // Step 2: Find pending removal requests for these exposures
  console.log("Step 2: Finding pending removal requests...");
  const exposureIds = exposures.map((e) => e.id);
  const removalRequests = await findPendingRemovalRequests(exposureIds);

  console.log(`Found ${removalRequests.length} pending removal requests to cancel.`);
  console.log();

  if (dryRun) {
    console.log("DRY RUN - No changes made. Run with --live to apply changes.");
    console.log();
    console.log("Changes that would be made:");
    console.log(`  - ${exposures.length} exposures would be marked as WHITELISTED`);
    console.log(`  - ${removalRequests.length} removal requests would be CANCELLED`);
    console.log(`  - ${stats.usersAffected.size} users would be affected`);
    return stats;
  }

  // Step 3: Cancel removal requests
  console.log("Step 3: Cancelling removal requests...");
  for (const request of removalRequests) {
    await prisma.removalRequest.update({
      where: { id: request.id },
      data: {
        status: "CANCELLED",
        notes: `Cancelled: ${new Date().toISOString()} - Entity reclassified as Data Processor (not Data Broker). ` +
          `Per GDPR Articles 28/29, deletion requests should go to the Data Controller, not the Processor.`,
      },
    });
    stats.removalRequestsCancelled++;
    console.log(`  Cancelled request ${request.id}`);
  }
  console.log();

  // Step 4: Update exposures to WHITELISTED
  console.log("Step 4: Marking exposures as whitelisted...");
  for (const exposure of exposures) {
    await prisma.exposure.update({
      where: { id: exposure.id },
      data: {
        status: "WHITELISTED",
        isWhitelisted: true,
        requiresManualAction: false,
      },
    });
    stats.exposuresUpdated++;
    console.log(`  Whitelisted exposure ${exposure.id} (${exposure.sourceName})`);
  }
  console.log();

  // Step 5: Create whitelist entries
  console.log("Step 5: Creating whitelist entries...");
  const whitelistEntries: Array<{
    userId: string;
    source: string;
    sourceUrl: string | null;
    sourceName: string;
  }> = [];

  for (const exposure of exposures) {
    // Check if whitelist entry already exists
    const existing = await prisma.whitelist.findFirst({
      where: {
        userId: exposure.userId,
        source: exposure.source,
      },
    });

    if (!existing) {
      whitelistEntries.push({
        userId: exposure.userId,
        source: exposure.source,
        sourceUrl: exposure.sourceUrl,
        sourceName: exposure.sourceName,
      });
    }
  }

  for (const entry of whitelistEntries) {
    await prisma.whitelist.create({
      data: {
        ...entry,
        reason: "Data Processor (not Data Broker) - Automatically whitelisted. " +
          "Per GDPR Articles 28/29, deletion requests should go to the Data Controller.",
      },
    });
    console.log(`  Created whitelist entry for ${entry.sourceName} (user: ${entry.userId.slice(0, 8)}...)`);
  }
  console.log();

  // Step 6: Create alerts for affected users
  console.log("Step 6: Creating user alerts...");
  for (const userId of stats.usersAffected) {
    const userExposures = exposures.filter((e) => e.userId === userId);
    const sourceNames = [...new Set(userExposures.map((e) => e.sourceName))];

    await prisma.alert.create({
      data: {
        userId,
        type: "EXPOSURE_RECLASSIFIED",
        title: "Data Source Reclassified",
        message: `${sourceNames.join(", ")} ${sourceNames.length === 1 ? "has" : "have"} been identified as ` +
          `Data Processor(s), not Data Broker(s). These have been removed from your dashboard. ` +
          `Data Processors only handle data on behalf of their clients and cannot process deletion requests directly.`,
      },
    });
    console.log(`  Created alert for user ${userId.slice(0, 8)}...`);
  }
  console.log();

  // Summary
  console.log("=".repeat(70));
  console.log("CLEANUP COMPLETE");
  console.log("=".repeat(70));
  console.log(`Exposures found: ${stats.exposuresFound}`);
  console.log(`Exposures whitelisted: ${stats.exposuresUpdated}`);
  console.log(`Removal requests cancelled: ${stats.removalRequestsCancelled}`);
  console.log(`Users affected: ${stats.usersAffected.size}`);

  return stats;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const isLive = args.includes("--live");

  try {
    await cleanupDataProcessorRequests(!isLive);
  } catch (error) {
    console.error("Error during cleanup:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
