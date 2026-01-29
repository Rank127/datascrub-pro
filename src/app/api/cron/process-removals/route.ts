import { NextResponse } from "next/server";
import {
  processPendingRemovalsBatch,
  retryFailedRemovalsBatch,
  getAutomationStats,
} from "@/lib/removers/removal-service";

/**
 * Cron job to automatically process pending and retry failed removals
 * Schedule: 6x daily (every 4 hours) at 2, 6, 10, 14, 18, 22 UTC
 *
 * This job:
 * 1. Processes pending removal requests (sends CCPA emails)
 * 2. Retries failed removals with alternative email patterns
 * 3. Returns automation statistics
 *
 * Rate limiting (Resend Pro: 50,000/month):
 * - 100 pending + 25 retries = 125 broker emails per batch
 * - 6 batches/day = 750 broker emails/day
 * - Plus user digest emails = ~800-900 total/day
 * - Monthly: ~25,000 emails (well under 50k limit)
 *
 * Per-broker limits (to avoid being flagged as spam):
 * - Max 25 requests per broker per day
 * - Min 15 minutes between requests to same broker
 * - Severity-weighted round-robin distribution across brokers
 */
export async function POST(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron: Process Removals] Starting automated removal processing...");
    const startTime = Date.now();

    // Step 1: Process pending removals (100 per batch × 6 batches/day = 600 emails)
    console.log("[Cron: Process Removals] Processing pending removals...");
    const pendingResults = await processPendingRemovalsBatch(100);

    // Step 2: Retry failed removals (25 per batch × 6 batches/day = 150 emails)
    console.log("[Cron: Process Removals] Retrying failed removals...");
    const retryResults = await retryFailedRemovalsBatch(25);

    // Step 3: Get automation stats
    const stats = await getAutomationStats();

    const duration = Date.now() - startTime;

    const response = {
      success: true,
      duration: `${(duration / 1000).toFixed(1)}s`,
      pending: {
        processed: pendingResults.processed,
        successful: pendingResults.successful,
        failed: pendingResults.failed,
        skipped: pendingResults.skipped,
        brokerDistribution: pendingResults.brokerDistribution,
      },
      retries: {
        processed: retryResults.processed,
        retried: retryResults.retried,
        stillFailed: retryResults.stillFailed,
        skippedDueToLimit: retryResults.skippedDueToLimit,
      },
      rateLimiting: {
        maxPerBrokerPerDay: 25,
        minMinutesBetweenSameBroker: 15,
        batchSize: { pending: 100, retries: 25 },
        dailyBatches: 6,
      },
      automationStats: {
        total: stats.totalRemovals,
        automationRate: `${stats.automationRate}%`,
        byStatus: stats.byStatus,
      },
    };

    console.log("[Cron: Process Removals] Complete:", JSON.stringify(response, null, 2));
    return NextResponse.json(response);
  } catch (error) {
    console.error("[Cron: Process Removals] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also allow GET for manual testing
export async function GET(request: Request) {
  return POST(request);
}
