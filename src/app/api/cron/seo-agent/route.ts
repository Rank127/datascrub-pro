import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSEOAgent, runFullSEOReport } from "@/lib/agents/seo-agent";
import { getContentAgent } from "@/lib/agents/content-agent";
import { createAgentContext } from "@/lib/agents/base-agent";
import { InvocationTypes } from "@/lib/agents/types";
import { getRemediationEngine } from "@/lib/agents";
import { logCronExecution } from "@/lib/cron-logger";
import { nanoid } from "nanoid";

// Initialize Resend for email notifications
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const maxDuration = 300;

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@ghostmydata.com";

async function sendSEOAlertEmail(to: string, subject: string, content: string): Promise<boolean> {
  if (!resend) {
    console.log("[SEO Agent Cron] Email service not configured, skipping email");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "GhostMyData <onboarding@resend.dev>",
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

interface RemediationSummary {
  totalIssuesDetected: number;
  totalAutoRemediated: number;
  totalEscalated: number;
  totalFailed: number;
  issuesByType: Record<string, number>;
  completedActions: Array<{
    issueType: string;
    description: string;
    url?: string;
    status: string;
  }>;
}

async function sendRemediationSummaryEmail(summary: RemediationSummary, seoScore: number): Promise<boolean> {
  if (!resend) {
    console.log("[SEO Agent Cron] Email service not configured, skipping remediation summary");
    return false;
  }

  // Only send if there were auto-remediated issues
  if (summary.totalAutoRemediated === 0 && summary.totalEscalated === 0) {
    console.log("[SEO Agent Cron] No remediation activity, skipping summary email");
    return false;
  }

  const issueTypeLabels: Record<string, string> = {
    "seo.structure": "Content Structure (Thin Content)",
    "seo.readability": "Content Readability",
    "seo.keyword": "Missing Keywords",
    "seo.missing_title": "Missing Title Tag",
    "seo.missing_description": "Missing Meta Description",
    "seo.missing_og_tags": "Missing Open Graph Tags",
  };

  let html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 24px; }
    h1 { color: #22d3ee; margin-top: 0; }
    h2 { color: #94a3b8; font-size: 16px; margin-top: 24px; border-bottom: 1px solid #334155; padding-bottom: 8px; }
    .score { font-size: 48px; font-weight: bold; color: ${seoScore >= 80 ? '#22c55e' : seoScore >= 60 ? '#eab308' : '#ef4444'}; }
    .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 16px 0; }
    .stat-box { background: #334155; border-radius: 8px; padding: 16px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #22d3ee; }
    .stat-label { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    .success { color: #22c55e; }
    .warning { color: #eab308; }
    .error { color: #ef4444; }
    .action-list { list-style: none; padding: 0; margin: 0; }
    .action-item { background: #334155; border-radius: 8px; padding: 12px; margin-bottom: 8px; }
    .action-type { font-weight: bold; color: #22d3ee; }
    .action-desc { color: #cbd5e1; font-size: 14px; margin-top: 4px; }
    .action-url { color: #94a3b8; font-size: 12px; margin-top: 4px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
    .badge-success { background: #166534; color: #22c55e; }
    .badge-escalated { background: #854d0e; color: #eab308; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>SEO Auto-Remediation Summary</h1>
    <p>The SEO Agent has completed its automated scan and remediation.</p>

    <div style="text-align: center; margin: 24px 0;">
      <div class="score">${seoScore}/100</div>
      <div style="color: #94a3b8;">Current SEO Score</div>
    </div>

    <div class="stat-grid">
      <div class="stat-box">
        <div class="stat-value">${summary.totalIssuesDetected}</div>
        <div class="stat-label">Issues Detected</div>
      </div>
      <div class="stat-box">
        <div class="stat-value success">${summary.totalAutoRemediated}</div>
        <div class="stat-label">Auto-Remediated</div>
      </div>
      <div class="stat-box">
        <div class="stat-value warning">${summary.totalEscalated}</div>
        <div class="stat-label">Escalated to Human</div>
      </div>
      <div class="stat-box">
        <div class="stat-value error">${summary.totalFailed}</div>
        <div class="stat-label">Failed</div>
      </div>
    </div>`;

  // Add issues by type breakdown
  if (Object.keys(summary.issuesByType).length > 0) {
    html += `
    <h2>Issues by Type</h2>
    <ul class="action-list">`;

    for (const [type, count] of Object.entries(summary.issuesByType)) {
      const label = issueTypeLabels[type] || type;
      html += `
      <li class="action-item">
        <span class="action-type">${label}</span>
        <span style="float: right; color: #94a3b8;">${count} issue${count !== 1 ? 's' : ''}</span>
      </li>`;
    }
    html += `</ul>`;
  }

  // Add completed actions
  if (summary.completedActions.length > 0) {
    html += `
    <h2>Remediation Actions Completed</h2>
    <ul class="action-list">`;

    for (const action of summary.completedActions.slice(0, 10)) {
      const label = issueTypeLabels[action.issueType] || action.issueType;
      const badgeClass = action.status === 'completed' ? 'badge-success' : 'badge-escalated';
      const badgeText = action.status === 'completed' ? 'Auto-Fixed' : 'Escalated';

      html += `
      <li class="action-item">
        <div>
          <span class="action-type">${label}</span>
          <span class="badge ${badgeClass}">${badgeText}</span>
        </div>
        <div class="action-desc">${action.description}</div>
        ${action.url ? `<div class="action-url">${action.url}</div>` : ''}
      </li>`;
    }

    if (summary.completedActions.length > 10) {
      html += `<li class="action-item" style="text-align: center; color: #94a3b8;">... and ${summary.completedActions.length - 10} more actions</li>`;
    }
    html += `</ul>`;
  }

  html += `
    <div class="footer">
      <p>Generated by GhostMyData SEO Agent</p>
      <p>${new Date().toISOString()}</p>
    </div>
  </div>
</body>
</html>`;

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "GhostMyData <onboarding@resend.dev>",
      to: SUPPORT_EMAIL,
      subject: `SEO Auto-Remediation: ${summary.totalAutoRemediated} issues fixed, Score: ${seoScore}/100`,
      html,
    });

    if (error) {
      console.error("[SEO Agent Cron] Remediation summary email error:", error);
      return false;
    }

    console.log(`[SEO Agent Cron] Sent remediation summary to ${SUPPORT_EMAIL}`);
    return true;
  } catch (err) {
    console.error("[SEO Agent Cron] Failed to send remediation summary:", err);
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

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
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

    // Send email if score is low or there are critical issues
    const adminEmail = process.env.ADMIN_EMAILS?.split(",")[0];
    const hasLowScore = result.report.overallScore < 70;
    const hasCriticalIssues = result.report.criticalIssues && result.report.criticalIssues.length > 0;

    if (adminEmail && (hasLowScore || hasCriticalIssues)) {
      console.log("[SEO Agent Cron] Sending alert email...");
      await sendSEOAlertEmail(
        adminEmail,
        `GhostMyData SEO Alert - Score: ${result.report.overallScore}/100`,
        result.emailContent || ""
      );
    }

    console.log(`[SEO Agent Cron] Run complete. Score: ${result.report.overallScore}/100`);

    // Wait for all remediation plans to complete (max 60 seconds)
    await waitForRemediationComplete(remediationEngine, 60000, 2000);

    // Get remediation stats after all plans complete
    const remediationStats = remediationEngine.getStats();
    const completedPlans = remediationEngine.getCompletedPlans(50);

    console.log(`[SEO Agent Cron] Remediation: ${remediationStats.totalIssuesDetected} issues detected, ${remediationStats.totalAutoRemediated} auto-remediated`);

    // Build remediation summary for email
    const completedActions = completedPlans.map(plan => ({
      issueType: plan.issue.type,
      description: plan.issue.description,
      url: plan.issue.affectedResource,
      status: plan.status,
    }));

    const remediationSummary: RemediationSummary = {
      totalIssuesDetected: remediationStats.totalIssuesDetected,
      totalAutoRemediated: remediationStats.totalAutoRemediated,
      totalEscalated: remediationStats.totalEscalated,
      totalFailed: remediationStats.totalFailed,
      issuesByType: remediationStats.issuesByType,
      completedActions,
    };

    // Send remediation summary email to support
    await sendRemediationSummaryEmail(remediationSummary, result.report.overallScore);

    await logCronExecution({
      jobName: "seo-agent",
      status: "SUCCESS",
      duration: Date.now() - startTime,
      message: `Score: ${result.report.overallScore}/100, ${remediationStats.totalAutoRemediated} auto-remediated`,
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
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
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
    const completedPlans = remediationEngine.getCompletedPlans(50);

    // Build remediation summary for email if this was a full report
    if (capability === "full-report" && result.data) {
      const reportData = result.data as { report: { overallScore: number } };
      const completedActions = completedPlans.map(plan => ({
        issueType: plan.issue.type,
        description: plan.issue.description,
        url: plan.issue.affectedResource,
        status: plan.status,
      }));

      const remediationSummary: RemediationSummary = {
        totalIssuesDetected: remediationStats.totalIssuesDetected,
        totalAutoRemediated: remediationStats.totalAutoRemediated,
        totalEscalated: remediationStats.totalEscalated,
        totalFailed: remediationStats.totalFailed,
        issuesByType: remediationStats.issuesByType,
        completedActions,
      };

      // Send remediation summary email to support
      await sendRemediationSummaryEmail(remediationSummary, reportData.report.overallScore);
    }

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
