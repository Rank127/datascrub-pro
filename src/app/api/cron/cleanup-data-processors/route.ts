/**
 * Data Processor Cleanup Cron Job
 *
 * Automatically cleans up exposures and removal requests for entities
 * that are Data Processors (not Data Brokers).
 *
 * Data Processors should NOT receive deletion requests because:
 * 1. They only process data on behalf of Data Controllers (their clients)
 * 2. Per GDPR Articles 28/29, they cannot action deletion requests without Controller authorization
 * 3. Sending requests may actually add data to systems where it didn't exist
 *
 * INTELLIGENT FEATURES:
 * - Uses Intelligence Coordinator for job locking
 * - Logs comprehensive metrics
 * - Creates user alerts for transparency
 * - Maintains whitelist for future prevention
 *
 * Schedule: Daily at 5 AM UTC
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logCronExecution } from "@/lib/cron-logger";
import { acquireJobLock, releaseJobLock } from "@/lib/agents/intelligence-coordinator";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

const JOB_NAME = "cleanup-data-processors";

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

function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;
  if (!expectedToken) return true;
  return authHeader === `Bearer ${expectedToken}`;
}

async function findDataProcessorExposures() {
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

async function findPendingRemovalRequests(exposureIds: string[]) {
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

export async function GET(request: Request) {
  const startTime = Date.now();

  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Acquire job lock
  const lockResult = await acquireJobLock(JOB_NAME);
  if (!lockResult.acquired) {
    console.log(`[${JOB_NAME}] Skipped: ${lockResult.reason}`);
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: lockResult.reason,
    });
  }

  try {
    console.log(`[${JOB_NAME}] Starting Data Processor cleanup...`);

    const stats = {
      exposuresFound: 0,
      exposuresUpdated: 0,
      removalRequestsCancelled: 0,
      usersAffected: new Set<string>(),
      whitelistEntriesCreated: 0,
      alertsCreated: 0,
    };

    // Step 1: Find all exposures for data processors
    const exposures = await findDataProcessorExposures();
    stats.exposuresFound = exposures.length;

    if (exposures.length === 0) {
      console.log(`[${JOB_NAME}] No Data Processor exposures found.`);

      await logCronExecution({
        jobName: JOB_NAME,
        status: "SUCCESS",
        duration: Date.now() - startTime,
        message: "No Data Processor exposures found. System is clean.",
      });

      return NextResponse.json({
        success: true,
        message: "No Data Processor exposures found",
        stats: { exposuresFound: 0 },
        duration: Date.now() - startTime,
      });
    }

    console.log(`[${JOB_NAME}] Found ${exposures.length} Data Processor exposures`);

    // Collect affected users
    for (const exp of exposures) {
      stats.usersAffected.add(exp.userId);
    }

    // Step 2: Find pending removal requests
    const exposureIds = exposures.map((e) => e.id);
    const removalRequests = await findPendingRemovalRequests(exposureIds);

    console.log(`[${JOB_NAME}] Found ${removalRequests.length} removal requests to cancel`);

    // Step 3: Cancel removal requests
    for (const request of removalRequests) {
      await prisma.removalRequest.update({
        where: { id: request.id },
        data: {
          status: "CANCELLED",
          notes:
            `Auto-cancelled: ${new Date().toISOString()} - Entity reclassified as Data Processor. ` +
            `Per GDPR Articles 28/29, deletion requests should go to the Data Controller, not the Processor.`,
        },
      });
      stats.removalRequestsCancelled++;
    }

    // Step 4: Update exposures to WHITELISTED
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
    }

    // Step 5: Create whitelist entries for future prevention
    for (const exposure of exposures) {
      // Check if whitelist entry already exists
      const existing = await prisma.whitelist.findFirst({
        where: {
          userId: exposure.userId,
          source: exposure.source,
        },
      });

      if (!existing) {
        await prisma.whitelist.create({
          data: {
            userId: exposure.userId,
            source: exposure.source,
            sourceUrl: exposure.sourceUrl,
            sourceName: exposure.sourceName,
            reason:
              "Data Processor (not Data Broker) - Automatically whitelisted. " +
              "Per GDPR Articles 28/29, deletion requests should go to the Data Controller.",
          },
        });
        stats.whitelistEntriesCreated++;
      }
    }

    // Step 6: Create alerts for affected users
    for (const userId of stats.usersAffected) {
      const userExposures = exposures.filter((e) => e.userId === userId);
      const sourceNames = [...new Set(userExposures.map((e) => e.sourceName))];

      await prisma.alert.create({
        data: {
          userId,
          type: "EXPOSURE_RECLASSIFIED",
          title: "Data Source Reclassified",
          message:
            `${sourceNames.join(", ")} ${sourceNames.length === 1 ? "has" : "have"} been identified as ` +
            `Data Processor(s), not Data Broker(s). These have been removed from your dashboard. ` +
            `Data Processors only handle data on behalf of their clients and cannot process deletion requests directly.`,
        },
      });
      stats.alertsCreated++;
    }

    const duration = Date.now() - startTime;

    await logCronExecution({
      jobName: JOB_NAME,
      status: "SUCCESS",
      duration,
      message: `Cleaned up ${stats.exposuresFound} Data Processor exposures for ${stats.usersAffected.size} users. Cancelled ${stats.removalRequestsCancelled} removal requests.`,
      metadata: {
        exposuresFound: stats.exposuresFound,
        exposuresUpdated: stats.exposuresUpdated,
        removalRequestsCancelled: stats.removalRequestsCancelled,
        usersAffected: stats.usersAffected.size,
        whitelistEntriesCreated: stats.whitelistEntriesCreated,
        alertsCreated: stats.alertsCreated,
      },
    });

    console.log(`[${JOB_NAME}] Cleanup complete`);

    return NextResponse.json({
      success: true,
      stats: {
        exposuresFound: stats.exposuresFound,
        exposuresUpdated: stats.exposuresUpdated,
        removalRequestsCancelled: stats.removalRequestsCancelled,
        usersAffected: stats.usersAffected.size,
        whitelistEntriesCreated: stats.whitelistEntriesCreated,
        alertsCreated: stats.alertsCreated,
      },
      dataProcessors: DATA_PROCESSOR_PATTERNS.sourceNames,
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error(`[${JOB_NAME}] Error:`, error);

    await logCronExecution({
      jobName: JOB_NAME,
      status: "FAILED",
      duration,
      message: errorMessage,
    });

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  } finally {
    releaseJobLock(JOB_NAME);
  }
}
