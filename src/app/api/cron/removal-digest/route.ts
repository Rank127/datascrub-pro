import { NextResponse } from "next/server";
import { processConsolidatedDigests } from "@/lib/email";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";
import { logCronExecution } from "@/lib/cron-logger";

/**
 * GET /api/cron/removal-digest
 *
 * Processes ALL pending digest items (exposures, removals, bulk summaries, monthly recaps)
 * and sends ONE consolidated email per user.
 * Runs daily at 10AM UTC (2h after reports cron queues monthly data at 8AM).
 *
 * Respects user preferences (re-checked at send time).
 */
export const maxDuration = 120;

export async function GET(request: Request) {
  // Verify this is a legitimate cron request
  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return cronUnauthorizedResponse(authResult.reason);
  }

  const startTime = Date.now();

  try {
    console.log("[Cron: consolidated-digest] Starting daily consolidated digest processing...");

    // Process all pending digest items into one email per user
    const result = await processConsolidatedDigests();

    const duration = Date.now() - startTime;

    await logCronExecution({
      jobName: "consolidated-digest",
      status: result.errors > 0 ? "FAILED" : "SUCCESS",
      duration,
      message: `Sent ${result.emailsSent} digest emails to ${result.usersProcessed} users`,
      metadata: {
        usersProcessed: result.usersProcessed,
        emailsSent: result.emailsSent,
        updatesProcessed: result.updatesProcessed,
        errors: result.errors,
      },
    });

    console.log(`[Cron: consolidated-digest] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: `Processed ${result.updatesProcessed} removal updates`,
      ...result,
      durationMs: duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("[Cron: consolidated-digest] Error:", error);

    await logCronExecution({
      jobName: "consolidated-digest",
      status: "FAILED",
      duration,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        error: "Failed to process removal digests",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
