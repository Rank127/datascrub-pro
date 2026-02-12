import { NextResponse } from "next/server";
import { processPendingRemovalDigests } from "@/lib/email";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";
import { logCronExecution } from "@/lib/cron-logger";

/**
 * GET /api/cron/removal-digest
 *
 * Processes all pending removal status updates and sends batched digest emails.
 * Should be run once daily (recommended: 9 AM UTC).
 *
 * This respects user preferences:
 * - Only sends to users with emailNotifications: true AND removalUpdates: true
 * - Batches all updates from the past 24 hours into a single email per user
 */
export async function GET(request: Request) {
  // Verify this is a legitimate cron request
  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return cronUnauthorizedResponse(authResult.reason);
  }

  const startTime = Date.now();

  try {
    console.log("[Cron: removal-digest] Starting daily removal digest processing...");

    // Process all pending removal status updates
    const result = await processPendingRemovalDigests();

    const duration = Date.now() - startTime;

    await logCronExecution({
      jobName: "removal-digest",
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

    console.log(`[Cron: removal-digest] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: `Processed ${result.updatesProcessed} removal updates`,
      ...result,
      durationMs: duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("[Cron: removal-digest] Error:", error);

    await logCronExecution({
      jobName: "removal-digest",
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
