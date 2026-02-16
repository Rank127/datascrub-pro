/**
 * Broker Compliance Monitor - Daily Cron Job
 *
 * Schedule: Daily at 6 AM UTC
 *
 * Daily: Check ~100 opt-out URLs (rotating subset), check email bounce rates
 * Weekly (Tuesdays): Full classification audit + comprehensive report
 *
 * Alerts: email rocky@ghostmydata.com for HIGH impact issues
 */

import { NextResponse } from "next/server";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";
import { logCronExecution } from "@/lib/cron-logger";
import { prisma } from "@/lib/db";
import {
  validateOptOutUrls,
  checkBounceRates,
  auditClassifications,
  generateComplianceReport,
} from "@/lib/agents/broker-compliance-agent";
import { Resend } from "resend";

export const maxDuration = 300;

const JOB_NAME = "broker-compliance";
const ALERT_RECIPIENT = "rocky@ghostmydata.com";

export async function GET(request: Request) {
  const startTime = Date.now();

  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return cronUnauthorizedResponse(authResult.reason);
  }

  try {
    const now = new Date();
    const isTuesday = now.getUTCDay() === 2;
    const runType = isTuesday ? "weekly_full_audit" : "daily_url_check";

    console.log(`[${JOB_NAME}] Starting ${runType} run`);

    // Always run: URL checks + bounce rates
    const deadline = startTime + 240_000; // 4 minute deadline

    const [urlResults, bounceResults] = await Promise.all([
      validateOptOutUrls(undefined, 100),
      checkBounceRates(),
    ]);

    // Weekly on Tuesdays: full classification audit
    let classificationResults;
    if (isTuesday && Date.now() < deadline) {
      classificationResults = await auditClassifications();
    }

    // Generate report
    const report = await generateComplianceReport(
      urlResults,
      bounceResults,
      classificationResults
    );

    const isTimeBoxed = Date.now() >= deadline;

    // Store audit run
    await prisma.complianceAuditRun.create({
      data: {
        runType,
        brokersChecked: urlResults.length,
        urlsHealthy: report.urlsHealthy,
        urlsBroken: report.urlsBroken,
        urlsRedirected: report.urlsRedirected,
        classificationsValid: report.classificationsChecked - report.classificationIssues,
        classificationsChanged: report.classificationIssues,
        highBounceEmails: report.highBounceEmails,
        alertsSent: 0, // Updated below
        issues: JSON.stringify(report.issues),
        duration: Date.now() - startTime,
        status: isTimeBoxed ? "PARTIAL" : "SUCCESS",
      },
    });

    // Send alert for HIGH severity issues
    const highIssues = report.issues.filter((i) => i.severity === "HIGH");
    if (highIssues.length > 0) {
      await sendAlertEmail(highIssues, runType);
    }

    const duration = Date.now() - startTime;

    await logCronExecution({
      jobName: JOB_NAME,
      status: isTimeBoxed ? "PARTIAL" : "SUCCESS",
      duration,
      message: `${runType}: ${report.urlsChecked} URLs checked (${report.urlsBroken} broken), ${report.highBounceEmails} high-bounce domains${classificationResults ? `, ${report.classificationIssues} classification issues` : ""}`,
      metadata: {
        runType,
        urlsChecked: report.urlsChecked,
        urlsHealthy: report.urlsHealthy,
        urlsBroken: report.urlsBroken,
        urlsRedirected: report.urlsRedirected,
        highBounceEmails: report.highBounceEmails,
        classificationsChecked: report.classificationsChecked,
        classificationIssues: report.classificationIssues,
        highAlerts: highIssues.length,
        isTimeBoxed,
      },
    });

    return NextResponse.json({
      success: true,
      runType,
      duration,
      urlsChecked: report.urlsChecked,
      urlsBroken: report.urlsBroken,
      highBounceEmails: report.highBounceEmails,
      classificationIssues: report.classificationIssues,
      highAlerts: highIssues.length,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    await logCronExecution({
      jobName: JOB_NAME,
      status: "FAILED",
      duration,
      message: `Broker compliance check failed: ${errorMessage}`,
    });

    console.error(`[${JOB_NAME}] Error:`, error);

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

async function sendAlertEmail(
  issues: Array<{ type: string; severity: string; brokerKey: string; description: string }>,
  runType: string
) {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn(`[${JOB_NAME}] RESEND_API_KEY not configured — skipping alert email`);
      return;
    }

    const resend = new Resend(resendKey);

    const issueRows = issues
      .map(
        (i) =>
          `<tr><td style="padding:4px 8px;border:1px solid #ddd;">${i.brokerKey}</td>` +
          `<td style="padding:4px 8px;border:1px solid #ddd;">${i.type}</td>` +
          `<td style="padding:4px 8px;border:1px solid #ddd;">${i.description}</td></tr>`
      )
      .join("");

    await resend.emails.send({
      from: "GhostMyData Compliance <alerts@ghostmydata.com>",
      to: ALERT_RECIPIENT,
      subject: `[Compliance Alert] ${issues.length} HIGH severity issue${issues.length > 1 ? "s" : ""} detected (${runType})`,
      html: `
        <h2>Broker Compliance Alert</h2>
        <p>The broker compliance monitor detected <strong>${issues.length} HIGH severity issue${issues.length > 1 ? "s" : ""}</strong> during the <strong>${runType}</strong> run.</p>
        <table style="border-collapse:collapse;width:100%;">
          <tr style="background:#f5f5f5;">
            <th style="padding:4px 8px;border:1px solid #ddd;text-align:left;">Broker</th>
            <th style="padding:4px 8px;border:1px solid #ddd;text-align:left;">Type</th>
            <th style="padding:4px 8px;border:1px solid #ddd;text-align:left;">Description</th>
          </tr>
          ${issueRows}
        </table>
        <p style="margin-top:16px;color:#666;">Review in the admin dashboard: <a href="https://ghostmydata.com/dashboard/executive?tab=operations">Operations Tab</a></p>
      `,
    });

    console.log(`[${JOB_NAME}] Alert email sent to ${ALERT_RECIPIENT}`);
  } catch (err) {
    console.error(`[${JOB_NAME}] Failed to send alert email:`, err);
  }
}
