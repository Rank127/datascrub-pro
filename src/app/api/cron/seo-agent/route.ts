import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSEOAgent, runFullSEOReport } from "@/lib/agents/seo-agent";
import { getContentAgent } from "@/lib/agents/content-agent";
import { createAgentContext } from "@/lib/agents/base-agent";
import { InvocationTypes } from "@/lib/agents/types";
import { getRemediationEngine } from "@/lib/agents";
import { logCronExecution } from "@/lib/cron-logger";
import { verifyCronAuth } from "@/lib/cron-auth";
import { getAdminFromEmail } from "@/lib/email";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";

// Initialize Resend for critical SEO alerts only
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const maxDuration = 300;

async function sendSEOAlertEmail(to: string, subject: string, content: string): Promise<boolean> {
  if (!resend) {
    console.log("[SEO Agent Cron] Email service not configured, skipping email");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: getAdminFromEmail(),
      to,
      subject,
      html: `<pre style="font-family: monospace; white-space: pre-wrap; background: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 8px;">${content}</pre>`,
    });

    if (error) {
      console.error("[SEO Agent Cron] Email error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[SEO Agent Cron] Failed to send email:", err);
    return false;
  }
}

async function waitForRemediationComplete(
  remediationEngine: ReturnType<typeof getRemediationEngine>,
  maxWaitMs = 60000,
  pollIntervalMs = 1000
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const activePlans = remediationEngine.getActivePlans();
    if (activePlans.length === 0) {
      console.log("[SEO Agent Cron] All remediation plans completed");
      return;
    }

    console.log(`[SEO Agent Cron] Waiting for ${activePlans.length} active plans to complete...`);
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }

  console.log("[SEO Agent Cron] Remediation wait timeout reached, continuing...");
}

export async function GET(request: Request) {
  try {
    const authResult = verifyCronAuth(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startTime = Date.now();
    console.log("[SEO Agent Cron] Starting automated SEO optimization run...");

    // IMPORTANT: Initialize agents and remediation engine BEFORE SEO scan
    // 1. Initialize Content Agent so it's available for auto-fixing content issues
    await getContentAgent();
    console.log("[SEO Agent Cron] Content Agent initialized for auto-remediation");

    // 2. Initialize remediation engine so it's listening for events
    const remediationEngine = getRemediationEngine();
    await remediationEngine.initialize();
    console.log("[SEO Agent Cron] Remediation engine initialized and listening for issues");

    // Use the new SEO Agent
    const result = await runFullSEOReport();

    // Validate result structure
    if (!result || !result.report || typeof result.report.overallScore !== 'number') {
      console.error("[SEO Agent Cron] Invalid result structure:", JSON.stringify(result, null, 2).slice(0, 500));
      return NextResponse.json(
        {
          success: false,
          error: "SEO report generation returned invalid data",
          details: result ? {
            hasReport: !!result.report,
            hasScore: result.report ? typeof result.report.overallScore : 'no report',
          } : 'no result',
        },
        { status: 500 }
      );
    }

    // Only email if score dropped significantly from last run (not on every run)
    const adminEmail = process.env.ADMIN_EMAILS?.split(",")[0];
    const currentScore = result.report.overallScore;

    // Get last SEO score from CronLog to detect changes
    let shouldEmail = false;
    let emailReason = "";
    try {
      const lastRun = await prisma.cronLog.findFirst({
        where: { jobName: "seo-agent", status: "SUCCESS" },
        orderBy: { createdAt: "desc" },
      });
      if (lastRun?.metadata) {
        const lastMeta = JSON.parse(lastRun.metadata);
        const lastScore = lastMeta.score;
        if (typeof lastScore === "number") {
          const scoreDrop = lastScore - currentScore;
          if (scoreDrop >= 5) {
            shouldEmail = true;
            emailReason = `Score dropped ${scoreDrop} points (${lastScore} → ${currentScore})`;
          }
        } else {
          // First run with score tracking — email if below 70
          shouldEmail = currentScore < 70;
          emailReason = `Score ${currentScore}/100 (first tracked run)`;
        }
      } else {
        shouldEmail = currentScore < 70;
        emailReason = `Score ${currentScore}/100 (no previous data)`;
      }
    } catch {
      // If we can't check history, only email on very low scores
      shouldEmail = currentScore < 60;
      emailReason = `Score ${currentScore}/100 (history check failed)`;
    }

    if (adminEmail && shouldEmail) {
      console.log(`[SEO Agent Cron] Sending alert: ${emailReason}`);
      await sendSEOAlertEmail(
        adminEmail,
        `GhostMyData SEO Alert - Score: ${currentScore}/100`,
        result.emailContent || ""
      );
    } else {
      console.log(`[SEO Agent Cron] Score ${currentScore}/100 — no email needed (stable or improving)`);
    }

    console.log(`[SEO Agent Cron] Run complete. Score: ${result.report.overallScore}/100`);

    // Wait for all remediation plans to complete (max 60 seconds)
    await waitForRemediationComplete(remediationEngine, 60000, 2000);

    // Get remediation stats after all plans complete
    const remediationStats = remediationEngine.getStats();

    console.log(`[SEO Agent Cron] Remediation: ${remediationStats.totalIssuesDetected} issues detected, ${remediationStats.totalAutoRemediated} auto-remediated`);

    // No remediation summary email — CronLog tracks stats in admin dashboard

    await logCronExecution({
      jobName: "seo-agent",
      status: "SUCCESS",
      duration: Date.now() - startTime,
      message: `Score: ${currentScore}/100, ${remediationStats.totalAutoRemediated} auto-remediated`,
      metadata: { score: currentScore, criticalIssues: result.report.criticalIssues?.length ?? 0 },
    });

    return NextResponse.json({
      success: true,
      report: result.formatted,
      remediation: {
        issuesDetected: remediationStats.totalIssuesDetected,
        totalAutoRemediated: remediationStats.totalAutoRemediated,
        totalEscalated: remediationStats.totalEscalated,
        totalFailed: remediationStats.totalFailed,
        issuesByType: remediationStats.issuesByType,
      },
    });
  } catch (error) {
    console.error("[SEO Agent Cron] Error:", error);
    await logCronExecution({
      jobName: "seo-agent",
      status: "FAILED",
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

// POST endpoint for manual trigger with options
export async function POST(request: Request) {
  try {
    const authResult = verifyCronAuth(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const {
      capability = "full-report",
      sendEmailReport = false,
    } = body;

    console.log("[SEO Agent Cron] Starting manual SEO run with options:", {
      capability,
      sendEmailReport,
    });

    // Initialize Content Agent for auto-remediation
    await getContentAgent();

    // Initialize remediation engine so it's listening for events
    const remediationEngine = getRemediationEngine();
    await remediationEngine.initialize();

    const agent = await getSEOAgent();
    const context = createAgentContext({
      requestId: nanoid(),
      invocationType: InvocationTypes.ON_DEMAND,
    });

    const result = await agent.execute(capability, body, context);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error?.message || "Agent execution failed",
        },
        { status: 500 }
      );
    }

    // Send email if requested and we have report data
    if (sendEmailReport && capability === "full-report") {
      const adminEmail = process.env.ADMIN_EMAILS?.split(",")[0];
      if (adminEmail && result.data) {
        const reportData = result.data as { report: { overallScore: number }; emailContent?: string };
        const emailSent = await sendSEOAlertEmail(
          adminEmail,
          `GhostMyData SEO Report - Score: ${reportData.report.overallScore}/100`,
          reportData.emailContent || ""
        );
        (result.data as Record<string, unknown>).emailSent = emailSent;
      }
    }

    console.log("[SEO Agent Cron] Manual run complete");

    // Wait for all remediation plans to complete (max 60 seconds)
    await waitForRemediationComplete(remediationEngine, 60000, 2000);

    // Get remediation stats after all plans complete
    const remediationStats = remediationEngine.getStats();
    return NextResponse.json({
      success: true,
      result: result.data,
      metadata: result.metadata,
      remediation: {
        issuesDetected: remediationStats.totalIssuesDetected,
        totalAutoRemediated: remediationStats.totalAutoRemediated,
        totalEscalated: remediationStats.totalEscalated,
        totalFailed: remediationStats.totalFailed,
        issuesByType: remediationStats.issuesByType,
      },
    });
  } catch (error) {
    console.error("[SEO Agent Cron] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
