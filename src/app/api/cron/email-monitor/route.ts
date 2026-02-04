/**
 * Email Delivery Monitor Cron Job
 *
 * Runs twice daily to:
 * 1. Check Resend email delivery status
 * 2. Identify bounced/suppressed emails
 * 3. Update affected removal requests
 * 4. Alert admin if delivery rate drops
 *
 * Schedule: 8 AM and 8 PM UTC (configured in vercel.json)
 */

import { NextResponse } from "next/server";
import { logCronExecution } from "@/lib/cron-logger";
import { runEmailDeliveryMonitor } from "@/lib/agents/operations-agent";

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Allow Vercel cron (no auth needed) or manual with secret
  if (!cronSecret) return true;
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    console.log("[Email Monitor] Starting email delivery check...");

    // Run the Operations Agent's email monitoring capability
    const result = await runEmailDeliveryMonitor();

    const duration = Date.now() - startTime;

    // Log the execution
    await logCronExecution({
      jobName: "email-monitor",
      status: "SUCCESS",
      duration,
      message: `Checked ${result.totalEmails} emails: ${result.delivered} delivered, ${result.bounced} bounced, ${result.suppressed} suppressed (${result.deliveryRate}% delivery rate)${result.bounced > 0 || result.suppressed > 0 ? " [NEEDS ATTENTION]" : ""}`,
      metadata: {
        totalEmails: result.totalEmails,
        delivered: result.delivered,
        bounced: result.bounced,
        suppressed: result.suppressed,
        deliveryRate: result.deliveryRate,
        problemEmails: result.problemEmails.slice(0, 10), // Limit for logging
        actionsToken: result.actionsToken.length,
        removalRequestsUpdated: result.removalRequestsUpdated,
      },
    });

    console.log(`[Email Monitor] Complete: ${result.deliveryRate}% delivery rate`);

    if (result.problemEmails.length > 0) {
      console.log(`[Email Monitor] Problem emails found:`);
      for (const problem of result.problemEmails.slice(0, 10)) {
        console.log(`  - ${problem.email} (${problem.status})`);
      }
    }

    return NextResponse.json({
      success: true,
      result,
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error("[Email Monitor] Error:", error);

    await logCronExecution({
      jobName: "email-monitor",
      status: "FAILED",
      duration,
      message: `Email monitoring failed: ${errorMessage}`,
    });

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
