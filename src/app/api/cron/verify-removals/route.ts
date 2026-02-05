import { NextResponse } from "next/server";
import { runVerificationBatch } from "@/lib/removers/verification-service";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";

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
export async function GET(request: Request) {
  // Verify authorization
  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return cronUnauthorizedResponse(authResult.reason);
  }

  console.log("[Verify Removals] Starting verification batch...");
  const startTime = Date.now();

  try {
    const stats = await runVerificationBatch();

    const duration = Date.now() - startTime;

    console.log(`[Verify Removals] Completed in ${duration}ms:`, stats);

    return NextResponse.json({
      success: true,
      stats,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Verify Removals] Error:", error);

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
