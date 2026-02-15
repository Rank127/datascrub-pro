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
import { logCronExecution } from "@/lib/cron-logger";
import { captureError } from "@/lib/error-reporting";
import { createRemovalFailedTicket } from "@/lib/support/ticket-service";

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

// Vercel Pro max timeout: 300 seconds (5 minutes)
export const maxDuration = 300;

// Stop processing at 4 minutes — 60s safety buffer for cleanup, logging, response
const PROCESSING_DEADLINE_MS = 240_000;

const AGGRESSIVE_BATCH_SIZE = 150;
const RETRY_BATCH_SIZE = 50;

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    // Verify cron secret
    const authResult = verifyCronAuth(request);
    if (!authResult.authorized) {
      return cronUnauthorizedResponse(authResult.reason);
    }

    console.log("[Cron: Clear Pending Queue] Starting aggressive queue processing...");

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

    // Calculate deadline for time-boxed processing
    const deadline = startTime + PROCESSING_DEADLINE_MS;

    // Step 4: Process pending removals
    console.log(`[Cron: Clear Pending Queue] Processing pending removals (batch size: ${AGGRESSIVE_BATCH_SIZE}, deadline: ${new Date(deadline).toISOString()})...`);
    const pendingResults = await processPendingRemovalsBatch(AGGRESSIVE_BATCH_SIZE, deadline);

    // Step 5: Retry failed removals (only if we still have time)
    let retryResults = { retried: 0, stillFailed: 0, processed: 0, emailsSent: 0, skippedDueToLimit: 0, timeBoxed: false };
    if (Date.now() < deadline) {
      console.log(`[Cron: Clear Pending Queue] Retrying failed removals...`);
      retryResults = await retryFailedRemovalsBatch(RETRY_BATCH_SIZE, deadline);
    } else {
      console.log(`[Cron: Clear Pending Queue] Skipping retries — time-box reached during pending processing`);
    }

    const wasTimeBoxed = pendingResults.timeBoxed || retryResults.timeBoxed || Date.now() >= deadline;

    // Step 6: Get final stats
    const stats = await getAutomationStats();
    const finalQueueStatus = await getQueueStatus();

    const duration = Date.now() - startTime;

    const response = {
      success: true,
      duration: `${(duration / 1000).toFixed(1)}s`,
      timeBoxed: wasTimeBoxed,
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

    await logCronExecution({
      jobName: "clear-pending-queue",
      status: wasTimeBoxed ? "PARTIAL" : "SUCCESS",
      duration: duration,
      message: `Cleared ${queueStatus.pending - finalQueueStatus.pending} items, ${pendingResults.successful} processed. Time-boxed: ${wasTimeBoxed}`,
    });

    return NextResponse.json(response);
  } catch (error) {
    captureError("[Cron: Clear Pending Queue]", error);
    await logCronExecution({
      jobName: "clear-pending-queue",
      status: "FAILED",
      duration: Date.now() - startTime,
      message: error instanceof Error ? error.message : "Unknown error",
    });
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
 * First tries email fallback (many form-only brokers also have privacyEmail).
 * For truly non-automatable items, creates an internal support ticket
 * so the team handles it instead of the user.
 */
async function markNonAutomatableAsManual(): Promise<number> {
  const pendingRemovals = await prisma.removalRequest.findMany({
    where: { status: "PENDING" },
    include: {
      exposure: { select: { id: true, source: true, sourceName: true } },
    },
  });

  let marked = 0;
  for (const removal of pendingRemovals) {
    const brokerInfo = getDataBrokerInfo(removal.exposure.source);

    // If broker has a privacy email, it CAN be automated via email — skip
    if (brokerInfo?.privacyEmail) continue;

    // If broker has an opt-out URL but no email, it still can't be auto-emailed
    // but we don't want to burden the user — create internal ticket instead
    if (!brokerInfo?.privacyEmail && !brokerInfo?.optOutUrl) {
      await prisma.removalRequest.update({
        where: { id: removal.id },
        data: {
          status: "REQUIRES_MANUAL",
          method: "MANUAL_GUIDE",
          notes: "Auto-marked: No automated removal method available. Internal ticket created for team handling.",
        },
      });

      // Create an internal support ticket so our team handles it
      try {
        await createRemovalFailedTicket(
          removal.userId,
          removal.id,
          removal.exposure.id,
          removal.exposure.sourceName || removal.exposure.source,
          "No automated removal method available for this broker — requires manual team action"
        );
      } catch (ticketError) {
        console.warn(`[Cron: Clear Pending Queue] Failed to create ticket for ${removal.exposure.source}:`, ticketError);
      }

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
