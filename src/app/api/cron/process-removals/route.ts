import { NextResponse } from "next/server";
import {
  processPendingRemovalsBatch,
  retryFailedRemovalsBatch,
  getAutomationStats,
} from "@/lib/removers/removal-service";

/**
 * Cron job to automatically process pending and retry failed removals
 * Schedule: Daily at 10 AM UTC (after verify-removals at 8 AM)
 *
 * This job:
 * 1. Processes pending removal requests (sends CCPA emails)
 * 2. Retries failed removals with alternative email patterns
 * 3. Returns automation statistics
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

    // Step 1: Process pending removals
    console.log("[Cron: Process Removals] Processing pending removals...");
    const pendingResults = await processPendingRemovalsBatch(30);

    // Step 2: Retry failed removals
    console.log("[Cron: Process Removals] Retrying failed removals...");
    const retryResults = await retryFailedRemovalsBatch(20);

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
      },
      retries: {
        processed: retryResults.processed,
        retried: retryResults.retried,
        stillFailed: retryResults.stillFailed,
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
