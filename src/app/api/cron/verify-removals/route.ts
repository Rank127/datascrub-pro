import { NextResponse } from "next/server";
import { runVerificationBatch } from "@/lib/removers/verification-service";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";
import { logCronExecution } from "@/lib/cron-logger";
import { captureError } from "@/lib/error-reporting";

/**
 * Cron endpoint to verify removal requests
 *
 * This runs daily to check if submitted removal requests have been completed.
 * It re-scans the source to verify the data is no longer present.
 *
 * Schedule: Daily at 8 AM UTC (configure in vercel.json)
 *
 * Flow:
 * 1. Find all removal requests with verifyAfter <= now
 * 2. For each, re-run the scanner for that specific source
 * 3. If data no longer found → mark as COMPLETED
 * 4. If data still found → schedule next verification or mark FAILED
 */
export const maxDuration = 300;

export async function GET(request: Request) {
  // Verify authorization
  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return cronUnauthorizedResponse(authResult.reason);
  }

  console.log("[Verify Removals] Starting verification batch...");
  const startTime = Date.now();
  const PROCESSING_DEADLINE_MS = 240_000; // 4 minutes — leave 1 min buffer
  const deadline = startTime + PROCESSING_DEADLINE_MS;

  try {
    const stats = await runVerificationBatch(deadline);

    const duration = Date.now() - startTime;
    const timeBoxed = stats.timeBoxed || false;

    console.log(`[Verify Removals] ${timeBoxed ? "PARTIAL" : "Completed"} in ${duration}ms:`, stats);

    await logCronExecution({
      jobName: "verify-removals",
      status: timeBoxed ? "PARTIAL" : "SUCCESS",
      duration,
      message: `${timeBoxed ? "PARTIAL: " : ""}Verified ${stats.processed} removals in ${duration}ms`,
      metadata: stats as Record<string, unknown>,
    });

    return NextResponse.json({
      success: true,
      stats,
      timeBoxed,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    captureError("[Verify Removals]", error);

    await logCronExecution({
      jobName: "verify-removals",
      status: "FAILED",
      duration: Date.now() - startTime,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
