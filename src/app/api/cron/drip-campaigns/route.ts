import { NextResponse } from "next/server";
import { processDripCampaigns } from "@/lib/email/drip-campaigns";
import { logCronExecution } from "@/lib/cron-logger";

export const maxDuration = 120;

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  const startTime = Date.now();
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Drip Cron] Starting drip campaign processing...");

    const stats = await processDripCampaigns();

    console.log(`[Drip Cron] Complete. Processed: ${stats.processed}, Sent: ${stats.sent}, Errors: ${stats.errors}`);

    await logCronExecution({
      jobName: "drip-campaigns",
      status: stats.errors > 0 ? "FAILED" : "SUCCESS",
      duration: Date.now() - startTime,
      message: `Processed: ${stats.processed}, Sent: ${stats.sent}, Errors: ${stats.errors}`,
    });

    return NextResponse.json({
      success: true,
      ...stats,
    });
  } catch (error) {
    console.error("[Drip Cron] Error:", error);
    await logCronExecution({
      jobName: "drip-campaigns",
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
