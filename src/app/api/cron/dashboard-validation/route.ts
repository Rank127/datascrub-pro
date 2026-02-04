/**
 * Dashboard Validation Cron Job
 *
 * Runs the QA Agent to validate dashboard data integrity
 * Recommended schedule: Daily at 6 AM
 */

import { NextResponse } from "next/server";
import { validateDashboardData } from "@/lib/agents/qa-agent";
import { logCronExecution } from "@/lib/cron-logger";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;
  if (!expectedToken) return true;
  return authHeader === `Bearer ${expectedToken}`;
}

export async function GET(request: Request) {
  const startTime = Date.now();

  // Verify cron secret
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await validateDashboardData();

    const duration = Date.now() - startTime;

    // Log success with summary
    await logCronExecution({
      jobName: "dashboard-validation",
      status: result.overallStatus === "FAIL" ? "FAILED" : "SUCCESS",
      duration,
      message: `Validated: ${result.checksPassed}/${result.checksPerformed} checks passed. Status: ${result.overallStatus}`,
    });

    return NextResponse.json({
      success: true,
      overallStatus: result.overallStatus,
      checksPerformed: result.checksPerformed,
      checksPassed: result.checksPassed,
      checksFailed: result.checksFailed,
      dataIntegrity: result.dataIntegrity,
      recommendations: result.recommendations,
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    await logCronExecution({
      jobName: "dashboard-validation",
      status: "FAILED",
      duration,
      message: `Error: ${errorMessage}`,
    });

    console.error("[CRON] Dashboard validation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        duration,
      },
      { status: 500 }
    );
  }
}
