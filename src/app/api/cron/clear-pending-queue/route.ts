import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  processPendingRemovalsBatch,
  retryFailedRemovalsBatch,
  getAutomationStats,
} from "@/lib/removers/removal-service";
import { getDataBrokerInfo } from "@/lib/removers/data-broker-directory";
import { processEmailQueue, getEmailQuotaStatus } from "@/lib/email";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";

/**
 * Aggressive Queue Clearer - Ensures pending queue is emptied within 24 hours
 *
 * Schedule: Runs hourly (24 times per day)
 *
 * Strategy:
 * 1. Mark non-automatable removals as REQUIRES_MANUAL (no privacy email/opt-out URL)
 * 2. Process pending removals in large batches (150 per run)
 * 3. Process email queue to send any queued emails
 * 4. Retry failed removals
 *
 * With 24 runs/day × 150 items = 3,600 items/day capacity
 * Email quota: 90/day limit, but emails are queued and processed over time
 */

const AGGRESSIVE_BATCH_SIZE = 150;
const RETRY_BATCH_SIZE = 50;

export async function POST(request: Request) {
  try {
    // Verify cron secret
    const authResult = verifyCronAuth(request);
    if (!authResult.authorized) {
      return cronUnauthorizedResponse(authResult.reason);
    }

    console.log("[Cron: Clear Pending Queue] Starting aggressive queue processing...");
    const startTime = Date.now();

    // Step 1: Mark non-automatable items as REQUIRES_MANUAL
    const markedManual = await markNonAutomatableAsManual();
    console.log(`[Cron: Clear Pending Queue] Marked ${markedManual} as REQUIRES_MANUAL`);

    // Step 2: Check current queue status
    const queueStatus = await getQueueStatus();
    console.log(`[Cron: Clear Pending Queue] Queue: ${queueStatus.pending} pending, ${queueStatus.automatable} automatable`);

    // Step 3: Process email queue first (send any queued emails from previous runs)
    const emailQuota = getEmailQuotaStatus();
    let emailQueueProcessed = { sent: 0, failed: 0 };

    if (emailQuota.remaining > 0) {
      console.log(`[Cron: Clear Pending Queue] Processing email queue (${emailQuota.remaining} quota remaining)...`);
      emailQueueProcessed = await processEmailQueue(Math.min(emailQuota.remaining, 20));
    }

    // Step 4: Process pending removals
    console.log(`[Cron: Clear Pending Queue] Processing pending removals (batch size: ${AGGRESSIVE_BATCH_SIZE})...`);
    const pendingResults = await processPendingRemovalsBatch(AGGRESSIVE_BATCH_SIZE);

    // Step 5: Retry failed removals
    console.log(`[Cron: Clear Pending Queue] Retrying failed removals...`);
    const retryResults = await retryFailedRemovalsBatch(RETRY_BATCH_SIZE);

    // Step 6: Get final stats
    const stats = await getAutomationStats();
    const finalQueueStatus = await getQueueStatus();

    const duration = Date.now() - startTime;

    const response = {
      success: true,
      duration: `${(duration / 1000).toFixed(1)}s`,
      markedAsManual: markedManual,
      queueBefore: queueStatus,
      queueAfter: finalQueueStatus,
      emailQueue: {
        sent: emailQueueProcessed.sent,
        failed: emailQueueProcessed.failed,
        quotaRemaining: getEmailQuotaStatus().remaining,
      },
      pending: {
        processed: pendingResults.processed,
        successful: pendingResults.successful,
        failed: pendingResults.failed,
        skipped: pendingResults.skipped,
      },
      retries: {
        retried: retryResults.retried,
        stillFailed: retryResults.stillFailed,
      },
      automationStats: {
        total: stats.totalRemovals,
        automationRate: `${stats.automationRate}%`,
      },
      cleared: queueStatus.pending - finalQueueStatus.pending,
    };

    console.log("[Cron: Clear Pending Queue] Complete:", JSON.stringify(response, null, 2));
    return NextResponse.json(response);
  } catch (error) {
    console.error("[Cron: Clear Pending Queue] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Mark non-automatable removals as REQUIRES_MANUAL
 * These are brokers without privacy email or opt-out URL
 */
async function markNonAutomatableAsManual(): Promise<number> {
  const pendingRemovals = await prisma.removalRequest.findMany({
    where: { status: "PENDING" },
    include: {
      exposure: { select: { source: true } },
    },
  });

  let marked = 0;
  for (const removal of pendingRemovals) {
    const brokerInfo = getDataBrokerInfo(removal.exposure.source);

    // If no email or opt-out URL, it's not automatable
    if (!brokerInfo?.privacyEmail && !brokerInfo?.optOutUrl) {
      await prisma.removalRequest.update({
        where: { id: removal.id },
        data: {
          status: "REQUIRES_MANUAL",
          method: "MANUAL_GUIDE",
          notes: "Auto-marked: No automated removal method available for this broker",
        },
      });
      marked++;
    }
  }

  return marked;
}

/**
 * Get current queue status
 */
async function getQueueStatus() {
  const pending = await prisma.removalRequest.count({
    where: { status: "PENDING" },
  });

  const pendingWithBroker = await prisma.removalRequest.findMany({
    where: { status: "PENDING" },
    include: {
      exposure: { select: { source: true } },
    },
  });

  let automatable = 0;
  for (const removal of pendingWithBroker) {
    const brokerInfo = getDataBrokerInfo(removal.exposure.source);
    if (brokerInfo?.privacyEmail || brokerInfo?.optOutUrl) {
      automatable++;
    }
  }

  return {
    pending,
    automatable,
    requiresManual: pending - automatable,
  };
}

// Also allow GET for manual testing
export async function GET(request: Request) {
  return POST(request);
}
