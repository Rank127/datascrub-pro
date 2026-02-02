import { NextResponse } from "next/server";
import { processDripCampaigns } from "@/lib/email/drip-campaigns";

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Drip Cron] Starting drip campaign processing...");

    const stats = await processDripCampaigns();

    console.log(`[Drip Cron] Complete. Processed: ${stats.processed}, Sent: ${stats.sent}, Errors: ${stats.errors}`);

    return NextResponse.json({
      success: true,
      ...stats,
    });
  } catch (error) {
    console.error("[Drip Cron] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
