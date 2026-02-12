import { NextResponse } from "next/server";
import { Resend } from "resend";
import { logCronExecution } from "@/lib/cron-logger";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";
import {
  collectStandupMetrics,
  analyzeStandupMetrics,
  formatStandupEmail,
} from "@/lib/standup";
import type { HealthStatus } from "@/lib/standup";

export const maxDuration = 60;

const ADMIN_EMAIL = "rocky@ghostmydata.com";
const JOB_NAME = "daily-standup";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const HEALTH_EMOJI: Record<HealthStatus, string> = {
  EXCELLENT: "\u2705",
  GOOD: "\u{1F7E2}",
  ATTENTION_NEEDED: "\u26A0\uFE0F",
  CRITICAL: "\u{1F6A8}",
};

export async function GET(request: Request) {
  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return cronUnauthorizedResponse(authResult.reason);
  }

  const startTime = Date.now();

  try {
    // 1. Collect metrics from all data sources
    const metrics = await collectStandupMetrics();

    // 2. Analyze with AI (falls back to rule-based if Claude unavailable)
    const analysis = await analyzeStandupMetrics(metrics);

    // 3. Format the email
    const emailHtml = formatStandupEmail(metrics, analysis);

    // 4. Send via Resend
    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const emoji = HEALTH_EMOJI[analysis.overallHealth];
    const subject = `${emoji} Daily Cabinet Meeting: ${analysis.overallHealth.replace("_", " ")} - ${dateStr}`;

    await getResend().emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "GhostMyData <noreply@send.ghostmydata.com>",
      to: [ADMIN_EMAIL],
      subject,
      html: emailHtml,
    });

    const duration = Date.now() - startTime;

    await logCronExecution({
      jobName: JOB_NAME,
      status: "SUCCESS",
      duration,
      message: `${analysis.overallHealth}: ${analysis.highlights.length} highlights, ${analysis.concerns.length} concerns`,
      metadata: {
        overallHealth: analysis.overallHealth,
        highlights: analysis.highlights.length,
        concerns: analysis.concerns.length,
        actionItems: analysis.actionItems.length,
        agentsHealthy: metrics.agents.healthy,
        agentsDegraded: metrics.agents.degraded,
        agentsFailed: metrics.agents.failed,
        cronSuccesses: metrics.crons.successCount24h,
        cronFailures: metrics.crons.failureCount24h,
        removalsCompleted: metrics.removals.completed24h,
        scansCompleted: metrics.scans.completed24h,
        newSignups: metrics.users.newSignups24h,
        aiCost: metrics.agents.totalCost24h,
      },
    });

    return NextResponse.json({
      success: true,
      health: analysis.overallHealth,
      highlights: analysis.highlights.length,
      concerns: analysis.concerns.length,
      actionItems: analysis.actionItems.length,
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error("[DailyStandup] Failed:", errorMessage);

    await logCronExecution({
      jobName: JOB_NAME,
      status: "FAILED",
      duration,
      message: `Failed: ${errorMessage}`,
    });

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
