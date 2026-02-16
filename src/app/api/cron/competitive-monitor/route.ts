/**
 * Competitive Intelligence Monitor - Weekly Cron Job
 *
 * Schedule: Mondays 11am ET (0 15 * * 1 UTC), 1 hour after mastermind-weekly
 * Runs competitor monitoring + feature gap analysis, stores results in DB,
 * and sends alert emails for HIGH impact changes.
 */

import { NextResponse } from "next/server";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";
import { logCronExecution } from "@/lib/cron-logger";
import { prisma } from "@/lib/db";
import { monitorCompetitors, analyzeFeatureGaps } from "@/lib/agents/competitive-intel-agent";
import { Resend } from "resend";

export const maxDuration = 120;

const JOB_NAME = "competitive-monitor";
const ALERT_RECIPIENT = "rocky@ghostmydata.com";

export async function GET(request: Request) {
  const startTime = Date.now();

  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return cronUnauthorizedResponse(authResult.reason);
  }

  try {
    // Run monitoring and gap analysis in parallel
    const [monitorResult, gapResult] = await Promise.all([
      monitorCompetitors(),
      analyzeFeatureGaps(),
    ]);

    // Defensive: ensure arrays exist even if agent returns partial data
    const changes = monitorResult.changes || [];
    const gaps = gapResult.gaps || [];
    const advantages = gapResult.advantages || [];
    const recommendations = gapResult.recommendations || [];

    // Store snapshot in DB
    const snapshot = await prisma.competitorSnapshot.create({
      data: {
        competitorsMonitored: monitorResult.monitored || 0,
        changesDetected: changes.length,
        gapsAnalyzed: gapResult.analyzed || 0,
        advantagesFound: advantages.length,
        highImpactAlerts: changes.filter((c) => c.impact === "HIGH").length,
        gapAnalysis: JSON.stringify(gaps),
        recommendations: JSON.stringify(recommendations),
        advantages: JSON.stringify(advantages),
        duration: Date.now() - startTime,
        status: "SUCCESS",
        changes: changes.length > 0
          ? {
              create: changes.map((change) => ({
                competitor: change.competitor,
                changeType: change.changeType,
                description: change.description,
                impact: change.impact,
                detectedAt: new Date(change.detectedAt),
              })),
            }
          : undefined,
      },
    });

    // Send alert email for HIGH impact changes
    const highImpactChanges = changes.filter((c) => c.impact === "HIGH");
    if (highImpactChanges.length > 0) {
      await sendAlertEmail(highImpactChanges);
    }

    const duration = Date.now() - startTime;

    await logCronExecution({
      jobName: JOB_NAME,
      status: "SUCCESS",
      duration,
      message: `Monitored ${monitorResult.monitored || 0} competitors. ${changes.length} changes detected (${highImpactChanges.length} high impact). ${gaps.length} gaps, ${advantages.length} advantages.`,
      metadata: {
        snapshotId: snapshot.id,
        changesDetected: changes.length,
        highImpactAlerts: highImpactChanges.length,
        gapsFound: gaps.length,
        advantagesFound: advantages.length,
        recommendationsCount: recommendations.length,
      },
    });

    return NextResponse.json({
      success: true,
      snapshotId: snapshot.id,
      monitored: monitorResult.monitored || 0,
      changesDetected: changes.length,
      highImpactAlerts: highImpactChanges.length,
      gaps: gaps.length,
      advantages: advantages.length,
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const message = error instanceof Error ? error.message : "Unknown error";

    await logCronExecution({
      jobName: JOB_NAME,
      status: "FAILED",
      duration,
      message,
    });

    console.error("[CompetitiveMonitor] Failed:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

async function sendAlertEmail(
  changes: Array<{
    competitor: string;
    changeType: string;
    description: string;
    impact: string;
    detectedAt: string;
  }>
) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const changesHtml = changes
      .map(
        (c) => `
        <div style="background-color: #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #ef4444;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="color: #f87171; font-weight: 600; font-size: 14px;">${c.competitor}</span>
            <span style="background-color: #dc2626; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">HIGH IMPACT</span>
          </div>
          <p style="color: #cbd5e1; font-size: 13px; margin: 0 0 4px 0;">${c.description}</p>
          <p style="color: #64748b; font-size: 11px; margin: 0;">Type: ${c.changeType} | Detected: ${new Date(c.detectedAt).toLocaleString("en-US", { timeZone: "America/New_York" })}</p>
        </div>`
      )
      .join("");

    const dateStr = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "GhostMyData <noreply@send.ghostmydata.com>",
      to: ALERT_RECIPIENT,
      subject: `Competitive Alert: ${changes.length} High Impact Change${changes.length > 1 ? "s" : ""} Detected`,
      html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 40px 20px; margin: 0;">
        <div style="max-width: 640px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #e2e8f0; font-size: 22px; margin: 0 0 8px 0;">Competitive Intelligence Alert</h1>
            <p style="color: #94a3b8; font-size: 13px; margin: 0 0 12px 0;">${dateStr}</p>
            <div style="display: inline-block; padding: 6px 16px; border-radius: 20px; background-color: #ef4444; color: white; font-weight: bold; font-size: 13px;">
              ${changes.length} High Impact Change${changes.length > 1 ? "s" : ""}
            </div>
          </div>
          ${changesHtml}
          <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155;">
            <p style="color: #64748b; font-size: 11px; margin: 0;">
              <a href="https://ghostmydata.com/dashboard/executive?tab=competitive" style="color: #818cf8; text-decoration: none;">View Competitive Dashboard</a>
            </p>
          </div>
        </div>
      </body>
      </html>`,
    });
  } catch (error) {
    console.error("[CompetitiveMonitor] Alert email failed:", error);
  }
}
