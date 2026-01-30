import { NextResponse } from "next/server";
import { processPendingRemovalDigests } from "@/lib/email";
import { prisma } from "@/lib/db";

// Verify cron secret to prevent unauthorized calls
function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // If no CRON_SECRET is set, allow the request (for development)
  if (!cronSecret) return true;

  return authHeader === `Bearer ${cronSecret}`;
}

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
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    console.log("[Cron: removal-digest] Starting daily removal digest processing...");

    // Process all pending removal status updates
    const result = await processPendingRemovalDigests();

    const duration = Date.now() - startTime;

    // Log to CronLog for monitoring
    await prisma.cronLog.create({
      data: {
        jobName: "removal-digest",
        status: result.errors > 0 ? "PARTIAL" : "SUCCESS",
        duration,
        message: `Sent ${result.emailsSent} digest emails to ${result.usersProcessed} users`,
        metadata: JSON.stringify({
          usersProcessed: result.usersProcessed,
          emailsSent: result.emailsSent,
          updatesProcessed: result.updatesProcessed,
          errors: result.errors,
        }),
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

    // Log failure to CronLog
    await prisma.cronLog.create({
      data: {
        jobName: "removal-digest",
        status: "FAILED",
        duration,
        message: error instanceof Error ? error.message : "Unknown error",
      },
    }).catch(console.error);

    return NextResponse.json(
      {
        error: "Failed to process removal digests",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
