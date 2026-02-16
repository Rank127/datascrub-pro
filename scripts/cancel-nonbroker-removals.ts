/**
 * Cancel Non-Broker Removal Requests
 *
 * Cancels existing RemovalRequests for entities that have been reclassified
 * as NOT statutory data brokers (gray area, direct relationship, etc.)
 *
 * Usage:
 *   npx tsx scripts/cancel-nonbroker-removals.ts              # Dry run (default)
 *   npx tsx scripts/cancel-nonbroker-removals.ts --execute     # Actually cancel
 *
 * What it does:
 *   1. Finds RemovalRequests linked to Exposures from reclassified sources
 *   2. Cancels those requests (PENDING, SUBMITTED, IN_PROGRESS only)
 *   3. Updates linked Exposures to status = MONITORING (no longer actionable)
 *   4. Logs results to CronLog
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const isDryRun = !process.argv.includes("--execute");

// All reclassified entities that are NOT statutory data brokers
const RECLASSIFIED_SOURCES = [
  // Gray area sources
  "ZILLOW", "REDFIN", "REALTOR_COM", "TRULIA",
  "HOMES_COM", "HOMESNAP", "MOVOTO",
  "HEALTHGRADES", "VITALS",
  "YELP_DATA", "TRIPADVISOR_DATA",
  // Dating platforms (direct relationship)
  "MATCHDOTCOM_LOOKUP", "BUMBLE_LOOKUP", "HINGE_LOOKUP",
  "OKCUPID_LOOKUP", "PLENTYOFFISH", "TINDER_LOOKUP",
  // Consent-based background check firms
  "HIRERIGHT", "STERLING", "CHECKR", "GOODHIRE", "ACCURATE_BG",
  // User-generated content review platforms
  "TRUSTPILOT_DATA", "CONSUMERAFFAIRS", "SITEJABBER",
  "PISSEDCONSUMER", "COMPLAINTSBOARD",
];

const CANCELLABLE_STATUSES = ["PENDING", "SUBMITTED", "IN_PROGRESS"];

async function cancelNonBrokerRemovals() {
  console.log("=== CANCEL NON-BROKER REMOVAL REQUESTS ===");
  console.log(`Mode: ${isDryRun ? "DRY RUN (preview only)" : "EXECUTE (live changes)"}`);
  console.log(`Reclassified sources: ${RECLASSIFIED_SOURCES.length}`);
  console.log("");

  const startTime = Date.now();

  // Find removal requests linked to reclassified sources
  const affectedRequests = await prisma.removalRequest.findMany({
    where: {
      status: { in: CANCELLABLE_STATUSES },
      exposure: {
        source: { in: RECLASSIFIED_SOURCES },
      },
    },
    include: {
      exposure: {
        select: { id: true, source: true, sourceName: true },
      },
    },
  });

  // Count per source
  const countsBySource: Record<string, number> = {};
  for (const req of affectedRequests) {
    const source = req.exposure?.source || "UNKNOWN";
    countsBySource[source] = (countsBySource[source] || 0) + 1;
  }

  console.log(`Total removal requests to cancel: ${affectedRequests.length}`);
  console.log("");
  console.log("Breakdown by source:");
  for (const [source, count] of Object.entries(countsBySource).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${source}: ${count}`);
  }
  console.log("");

  // Also count by status
  const countsByStatus: Record<string, number> = {};
  for (const req of affectedRequests) {
    countsByStatus[req.status] = (countsByStatus[req.status] || 0) + 1;
  }
  console.log("Breakdown by status:");
  for (const [status, count] of Object.entries(countsByStatus)) {
    console.log(`  ${status}: ${count}`);
  }
  console.log("");

  if (affectedRequests.length === 0) {
    console.log("No removal requests found for reclassified sources. Nothing to do.");
    await prisma.$disconnect();
    return;
  }

  if (isDryRun) {
    console.log("--- DRY RUN --- No changes made.");
    console.log("Run with --execute to apply changes.");
    await prisma.$disconnect();
    return;
  }

  // === EXECUTE MODE ===

  const requestIds = affectedRequests.map(r => r.id);
  const exposureIds = affectedRequests.map(r => r.exposure?.id).filter(Boolean) as string[];

  // 1. Cancel removal requests
  const cancelledRequests = await prisma.removalRequest.updateMany({
    where: { id: { in: requestIds } },
    data: {
      status: "CANCELLED",
      notes: "COMPLIANCE RECLASSIFICATION: Source reclassified as non-broker per CA Civil Code § 1798.99.80(d). " + new Date().toISOString(),
    },
  });
  console.log(`Cancelled ${cancelledRequests.count} removal requests`);

  // 2. Update linked exposures to MONITORING status
  if (exposureIds.length > 0) {
    const updatedExposures = await prisma.exposure.updateMany({
      where: { id: { in: exposureIds } },
      data: {
        status: "MONITORING",
        requiresManualAction: false,
      },
    });
    console.log(`Updated ${updatedExposures.count} exposures to MONITORING status`);
  }

  // 3. Log to CronLog
  const duration = Date.now() - startTime;
  await prisma.cronLog.create({
    data: {
      jobName: "cancel-nonbroker-removals",
      status: "SUCCESS",
      duration,
      message: `Cancelled ${cancelledRequests.count} removal requests for ${Object.keys(countsBySource).length} reclassified sources, updated ${exposureIds.length} exposures to MONITORING`,
      metadata: {
        cancelledCount: cancelledRequests.count,
        exposuresUpdated: exposureIds.length,
        countsBySource,
        countsByStatus,
        executedAt: new Date().toISOString(),
      },
    },
  });
  console.log("Logged to CronLog");

  console.log("\n=== CANCELLATION COMPLETE ===");
  await prisma.$disconnect();
}

cancelNonBrokerRemovals().catch((err) => {
  console.error("FATAL:", err);
  prisma.$disconnect();
  process.exit(1);
});
