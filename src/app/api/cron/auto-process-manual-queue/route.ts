/**
 * Auto-Process Manual Action Queue
 *
 * Automatically processes exposures that require manual action by:
 * 1. Auto-approving exposures from known scanner sources (all legitimate)
 * 2. Creating removal requests for them with appropriate methods
 * 3. Only excluding explicitly blacklisted sources
 *
 * Strategy: All sources from our scanner are legitimate data brokers.
 * The requiresManualAction flag indicates low confidence about matching
 * the right person, but our scanners are designed to minimize false positives.
 *
 * We auto-process all sources EXCEPT known data processors (GDPR-exempt)
 * which are handled separately by cleanup-data-processors cron.
 */

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { acquireJobLock, releaseJobLock, getBrokerIntelligence } from "@/lib/agents/intelligence-coordinator/index";
import { getBestAutomationMethod } from "@/lib/removers/browser-automation";
import { logCronExecution } from "@/lib/cron-logger";
import { getEffectivePlan } from "@/lib/family/family-service";
import type { Plan } from "@/lib/types";

export const maxDuration = 300;

const prisma = new PrismaClient();
const JOB_NAME = "auto-process-manual-queue";

// Sources to EXCLUDE from auto-processing (data processors, not data brokers)
// These are handled by cleanup-data-processors cron instead
const EXCLUDED_SOURCES = [
  // Data Processors (GDPR-exempt - they process data on behalf of others)
  "SYNDIGO",
  "POWERREVIEWS",
  "1WORLDSYNC",
  "SALSIFY",
  "AKENEO",
  "RIVERSAND",
  "STIBO",
  "CONTENTSERV",
  "INFORMATICA_MDM",
  "TIBCO_MDM",
  "INRIVER",
  "PIMCORE",
  "SALES_LAYER",
  "PLYTIX",
  "CATSY",
  "EGGHEADS",
  "PROFISEE",
  "SEMARCHY",
];

// Auto-process any exposure with confidence >= this threshold (or no confidence data)
// Lower threshold because all scanner sources are pre-validated data brokers
const AUTO_PROCESS_MIN_CONFIDENCE = 30;

// Maximum exposures to process per run (increased since we're processing more)
const BATCH_SIZE = 200;

// Plan-based removal limits (matches removals/request/route.ts)
const REMOVAL_LIMITS: Record<Plan, number> = {
  FREE: 3,
  PRO: -1, // unlimited
  ENTERPRISE: -1, // unlimited
};

interface ProcessResult {
  processed: number;
  removalRequestsCreated: number;
  skippedLowConfidence: number;
  skippedExcludedSource: number;
  skippedPlanLimit: number;
  errors: number;
}

async function processManualQueue(): Promise<ProcessResult> {
  const result: ProcessResult = {
    processed: 0,
    removalRequestsCreated: 0,
    skippedLowConfidence: 0,
    skippedExcludedSource: 0,
    skippedPlanLimit: 0,
    errors: 0,
  };

  // Get exposures requiring manual action that:
  // 1. Are NOT from excluded sources (data processors)
  // 2. Have confidence >= AUTO_PROCESS_MIN_CONFIDENCE (or no confidence data = legacy)
  // 3. Don't have a removal request yet
  // 4. Are in ACTIVE status
  const exposures = await prisma.exposure.findMany({
    where: {
      requiresManualAction: true,
      manualActionTaken: false,
      status: "ACTIVE",
      source: { notIn: EXCLUDED_SOURCES },
      removalRequest: null,
      OR: [
        { confidenceScore: { gte: AUTO_PROCESS_MIN_CONFIDENCE } },
        { confidenceScore: null }, // Legacy exposures without confidence scoring
      ],
    },
    select: {
      id: true,
      userId: true,
      source: true,
      sourceName: true,
      confidenceScore: true,
      matchClassification: true,
    },
    take: BATCH_SIZE,
    orderBy: { firstFoundAt: "asc" }, // Process oldest first
  });

  console.log(`[AutoManualQueue] Found ${exposures.length} exposures to auto-process`);

  // Pre-load plan info and monthly quotas for all unique users in this batch
  const uniqueUserIds = [...new Set(exposures.map(e => e.userId))];

  const userPlanMap = new Map<string, Plan>();
  for (const userId of uniqueUserIds) {
    const plan = await getEffectivePlan(userId) as Plan;
    userPlanMap.set(userId, plan);
  }

  // For FREE users, pre-load their current month's removal count
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);

  const freeUserIds = uniqueUserIds.filter(id => userPlanMap.get(id) === "FREE");
  const userQuotaUsed = new Map<string, number>();

  if (freeUserIds.length > 0) {
    // Batch query: count removals this month for all FREE users
    const quotaCounts = await prisma.removalRequest.groupBy({
      by: ["userId"],
      where: {
        userId: { in: freeUserIds },
        createdAt: { gte: currentMonth },
      },
      _count: true,
    });

    for (const userId of freeUserIds) {
      const found = quotaCounts.find(q => q.userId === userId);
      userQuotaUsed.set(userId, found?._count ?? 0);
    }
  }

  console.log(`[AutoManualQueue] Users in batch: ${uniqueUserIds.length} (${freeUserIds.length} FREE)`);

  for (const exposure of exposures) {
    try {
      // Enforce plan-based removal limits
      const userPlan = userPlanMap.get(exposure.userId) ?? "FREE";
      const limit = REMOVAL_LIMITS[userPlan];

      if (limit !== -1) {
        const used = userQuotaUsed.get(exposure.userId) ?? 0;
        if (used >= limit) {
          result.skippedPlanLimit++;
          console.log(`[AutoManualQueue] Skipped ${exposure.source} for user ${exposure.userId.substring(0, 8)}... (${userPlan} plan, ${used}/${limit} quota used)`);
          continue;
        }
        // Increment the tracked quota so subsequent exposures for same user are also limited
        userQuotaUsed.set(exposure.userId, used + 1);
      }

      // Get broker intelligence to inform method selection
      const intel = await getBrokerIntelligence(exposure.source);

      // Select best removal method
      const bestMethod = getBestAutomationMethod(exposure.source);
      const method = bestMethod.method === "MANUAL" ? "MANUAL_GUIDE" :
                    bestMethod.method === "EMAIL" ? "AUTO_EMAIL" : "AUTO_FORM";

      // Create removal request
      await prisma.$transaction([
        // Create removal request
        prisma.removalRequest.create({
          data: {
            userId: exposure.userId,
            exposureId: exposure.id,
            status: "PENDING",
            method,
            isProactive: false,
            notes: `Auto-processed from manual queue. Source: ${exposure.source} (high-trust). Confidence: ${exposure.confidenceScore ?? 'legacy'}. Intel success rate: ${intel.successRate}%. Method: ${bestMethod.reason}`,
          },
        }),
        // Update exposure status
        prisma.exposure.update({
          where: { id: exposure.id },
          data: {
            status: "REMOVAL_PENDING",
            manualActionTaken: true,
            manualActionTakenAt: new Date(),
            userConfirmed: true, // Auto-confirmed for high-trust sources
            userConfirmedAt: new Date(),
          },
        }),
      ]);

      result.removalRequestsCreated++;
      result.processed++;

      console.log(`[AutoManualQueue] Created removal for ${exposure.source} (${exposure.id.substring(0, 8)}...)`);
    } catch (error) {
      result.errors++;
      console.error(`[AutoManualQueue] Error processing ${exposure.id}:`, error);
    }
  }

  // Count skipped exposures for reporting
  const skippedLowConfidence = await prisma.exposure.count({
    where: {
      requiresManualAction: true,
      manualActionTaken: false,
      status: "ACTIVE",
      source: { notIn: EXCLUDED_SOURCES },
      removalRequest: null,
      confidenceScore: { lt: AUTO_PROCESS_MIN_CONFIDENCE },
      NOT: { confidenceScore: null }, // Only count those with actual low scores
    },
  });

  const skippedExcludedSource = await prisma.exposure.count({
    where: {
      requiresManualAction: true,
      manualActionTaken: false,
      status: "ACTIVE",
      source: { in: EXCLUDED_SOURCES },
      removalRequest: null,
    },
  });

  result.skippedLowConfidence = skippedLowConfidence;
  result.skippedExcludedSource = skippedExcludedSource;

  return result;
}

export async function GET() {
  const startTime = Date.now();

  try {
    // Acquire job lock
    const lockResult = await acquireJobLock(JOB_NAME);
    if (!lockResult.acquired) {
      return NextResponse.json({
        success: false,
        skipped: true,
        reason: lockResult.reason,
      });
    }

    console.log(`[AutoManualQueue] Starting auto-process run...`);

    const result = await processManualQueue();

    await releaseJobLock(JOB_NAME);

    const duration = Date.now() - startTime;

    // Calculate remaining manual queue
    const remainingManualQueue = await prisma.exposure.count({
      where: {
        requiresManualAction: true,
        manualActionTaken: false,
      },
    });

    console.log(`[AutoManualQueue] Completed in ${duration}ms`);
    console.log(`[AutoManualQueue] Processed: ${result.processed}, Created: ${result.removalRequestsCreated}`);
    console.log(`[AutoManualQueue] Remaining manual queue: ${remainingManualQueue}`);

    await logCronExecution({
      jobName: "auto-process-manual-queue",
      status: result.errors > 0 ? "FAILED" : "SUCCESS",
      duration,
      message: `Processed ${result.processed}, created ${result.removalRequestsCreated} removals, ${result.errors} errors`,
    });

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      result,
      remainingManualQueue,
      message: `Auto-processed ${result.processed} exposures. Created ${result.removalRequestsCreated} removal requests. ${result.skippedPlanLimit} skipped (plan limit), ${result.skippedLowConfidence} skipped (low confidence), ${result.skippedExcludedSource} skipped (excluded/data processors). ${result.errors} errors.`,
    });
  } catch (error) {
    await releaseJobLock(JOB_NAME);
    console.error("[AutoManualQueue] Error:", error);
    await logCronExecution({
      jobName: "auto-process-manual-queue",
      status: "FAILED",
      duration: Date.now() - startTime,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Also support POST for manual triggers
export const POST = GET;
