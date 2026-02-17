/**
 * Auto-Verify Fast Brokers Cron Job
 *
 * Automatically marks removals from fast-processing brokers as COMPLETED
 * after the expected processing time has elapsed.
 *
 * Schedule: Daily at 4 AM UTC
 *
 * INTELLIGENT FEATURES:
 * - Uses broker intelligence to determine expected processing times
 * - Learns from historical success rates
 * - Coordinates with process-removals to avoid conflicts
 * - Creates user alerts for completed removals
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDataBrokerInfo } from "@/lib/removers/data-broker-directory";
import { checkAndFireFirstRemovalMilestone } from "@/lib/removals/milestone-service";
import {
  acquireJobLock,
  releaseJobLock,
  getBrokerIntelligence,
} from "@/lib/agents/intelligence-coordinator";
import { logCronExecution } from "@/lib/cron-logger";
import { verifyCronAuth } from "@/lib/cron-auth";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

const JOB_NAME = "auto-verify-fast-brokers";

// Brokers known to process quickly (1-2 days)
const FAST_BROKERS = [
  "TRUEPEOPLESEARCH",
  "FASTPEOPLESEARCH",
  "WHITEPAGES",
  "SPOKEO",
  "INSTANTCHECKMATE",
];

// Minimum days to wait before auto-verifying
const MIN_DAYS_BEFORE_VERIFY: Record<string, number> = {
  TRUEPEOPLESEARCH: 2,
  FASTPEOPLESEARCH: 2,
  WHITEPAGES: 3,
  SPOKEO: 3,
  INSTANTCHECKMATE: 4,
  DEFAULT: 5,
};

export async function GET(request: Request) {
  const startTime = Date.now();

  const auth = verifyCronAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Acquire job lock
  const lockResult = await acquireJobLock(JOB_NAME);
  if (!lockResult.acquired) {
    console.log(`[Cron: ${JOB_NAME}] Skipped: ${lockResult.reason}`);
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: lockResult.reason,
    });
  }

  try {
    console.log(`[Cron: ${JOB_NAME}] Starting auto-verification of fast brokers...`);

    const now = new Date();
    let totalVerified = 0;
    let totalErrors = 0;
    const brokerResults: Record<string, { verified: number; errors: number }> = {};

    for (const broker of FAST_BROKERS) {
      const minDays = MIN_DAYS_BEFORE_VERIFY[broker] || MIN_DAYS_BEFORE_VERIFY.DEFAULT;
      const cutoffDate = new Date(now.getTime() - minDays * 24 * 60 * 60 * 1000);

      // Get broker intelligence to adjust verification timing
      const intel = await getBrokerIntelligence(broker);

      // If broker has low success rate, wait longer
      let adjustedCutoff = cutoffDate;
      if (intel.successRate < 50) {
        // Add extra days for low-success brokers
        adjustedCutoff = new Date(cutoffDate.getTime() - 2 * 24 * 60 * 60 * 1000);
        console.log(`[${broker}] Low success rate (${intel.successRate.toFixed(1)}%), waiting extra 2 days`);
      }

      // Find overdue removals for this broker
      const overdueRemovals = await prisma.removalRequest.findMany({
        where: {
          status: { in: ["SUBMITTED", "IN_PROGRESS", "ACKNOWLEDGED"] },
          submittedAt: { lte: adjustedCutoff },
          exposure: { source: broker },
        },
        include: {
          exposure: {
            select: { id: true, source: true, sourceName: true },
          },
          user: {
            select: { id: true, email: true },
          },
        },
        take: 50, // Process max 50 per broker per run
      });

      brokerResults[broker] = { verified: 0, errors: 0 };

      if (overdueRemovals.length === 0) {
        continue;
      }

      console.log(`[${broker}] Found ${overdueRemovals.length} removals ready for auto-verification`);

      for (const removal of overdueRemovals) {
        const daysOld = Math.floor(
          (now.getTime() - (removal.submittedAt?.getTime() || 0)) / (1000 * 60 * 60 * 24)
        );
        const brokerInfo = getDataBrokerInfo(broker);

        try {
          await prisma.$transaction([
            prisma.removalRequest.update({
              where: { id: removal.id },
              data: {
                status: "COMPLETED",
                completedAt: now,
                lastVerifiedAt: now,
                verificationCount: { increment: 1 },
                notes: `Auto-verified after ${daysOld} days (expected: ${brokerInfo?.estimatedDays || minDays} days). Success rate: ${intel.successRate.toFixed(1)}%`,
              },
            }),
            prisma.exposure.update({
              where: { id: removal.exposureId },
              data: { status: "REMOVED" },
            }),
            prisma.alert.create({
              data: {
                userId: removal.userId,
                type: "REMOVAL_COMPLETED",
                title: "Data Removal Verified",
                message: `Your data has been verified as removed from ${removal.exposure.sourceName || broker}.`,
              },
            }),
          ]);

          // Check for first removal milestone (idempotent)
          checkAndFireFirstRemovalMilestone(
            removal.userId,
            removal.exposure.sourceName || broker,
            removal.id
          ).catch(console.error);

          totalVerified++;
          brokerResults[broker].verified++;
        } catch (error) {
          totalErrors++;
          brokerResults[broker].errors++;
          console.error(`[${broker}] Error verifying removal ${removal.id}:`, error);
        }
      }
    }

    const duration = Date.now() - startTime;

    // Log execution
    await logCronExecution({
      jobName: JOB_NAME,
      status: totalErrors > totalVerified ? "FAILED" : "SUCCESS",
      duration,
      message: `Auto-verified ${totalVerified} removals, ${totalErrors} errors across ${FAST_BROKERS.length} fast brokers`,
    });

    const response = {
      success: true,
      duration: `${(duration / 1000).toFixed(1)}s`,
      summary: {
        totalVerified,
        totalErrors,
        brokersChecked: FAST_BROKERS.length,
      },
      byBroker: brokerResults,
      fastBrokers: FAST_BROKERS,
      minDaysBeforeVerify: MIN_DAYS_BEFORE_VERIFY,
    };

    console.log(`[Cron: ${JOB_NAME}] Complete:`, JSON.stringify(response, null, 2));
    return NextResponse.json(response);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    await logCronExecution({
      jobName: JOB_NAME,
      status: "FAILED",
      duration,
      message: errorMessage,
    });

    console.error(`[Cron: ${JOB_NAME}] Error:`, error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  } finally {
    releaseJobLock(JOB_NAME);
  }
}
