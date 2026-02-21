/**
 * Broker Discovery Cron
 *
 * Schedule: Weekly Sunday 6 AM UTC (0 6 * * 0)
 * Discovers new brokers, probes sites, validates scanners, checks opt-out URLs
 */

import { NextResponse } from "next/server";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";
import { logCronExecution } from "@/lib/cron-logger";
import { runBrokerDiscovery } from "@/lib/agents/broker-discovery-agent";
import { getAdminFromEmail } from "@/lib/email";
import { Resend } from "resend";

export const maxDuration = 300;

const JOB_NAME = "broker-discovery";
const ALERT_RECIPIENT = "rocky@ghostmydata.com";

export async function GET(request: Request) {
  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return cronUnauthorizedResponse(authResult.reason);
  }

  const startTime = Date.now();
  const deadline = startTime + 240_000; // 4-minute time-box

  try {
    console.log(`[${JOB_NAME}] Starting broker discovery...`);

    const results = await runBrokerDiscovery();

    const duration = Date.now() - startTime;
    const isTimeBoxed = Date.now() >= deadline;

    const summary = {
      scannerHealthAnalyzed: results.scannerHealth.scannersAnalyzed,
      scannerHealthIssues: results.scannerHealth.issues.length,
      degradedScanners: results.scannerHealth.degradedScanners,
      proxyUpgrades: results.scannerHealth.proxyUpgrades,
      regressions: results.scannerHealth.regressions,
      candidates: results.discovered.candidates.length,
      probed: results.probed.length,
      probeSuccesses: results.probed.filter((p) => p.success).length,
      scannersValidated: results.validated.scannersChecked,
      scannersEnabled: results.validated.enabled,
      scannersDisabled: results.validated.disabled,
      optOutChecked: results.optOutChecks.checked,
      optOutBroken: results.optOutChecks.broken,
      optOutUpdated: results.optOutChecks.updated,
    };

    const healthNote = summary.scannerHealthIssues > 0
      ? `Scanner health: ${summary.scannerHealthIssues} issues (${summary.degradedScanners} degraded, ${summary.proxyUpgrades} need proxy upgrade, ${summary.regressions} regressions). `
      : `Scanner health: ${summary.scannerHealthAnalyzed} analyzed, all healthy. `;

    const message =
      healthNote +
      `Discovered ${summary.candidates} candidates, probed ${summary.probed} (${summary.probeSuccesses} success). ` +
      `Validated ${summary.scannersValidated} scanners (${summary.scannersEnabled} enabled, ${summary.scannersDisabled} disabled). ` +
      `Opt-out: ${summary.optOutChecked} checked, ${summary.optOutBroken} broken, ${summary.optOutUpdated} updated.`;

    console.log(`[${JOB_NAME}] ${message}`);

    await logCronExecution({
      jobName: JOB_NAME,
      status: isTimeBoxed ? "PARTIAL" : "SUCCESS",
      duration,
      message,
      metadata: summary,
    });

    // Send admin alert if scanners changed or health issues found
    const hasHealthIssues = results.scannerHealth.issues.filter(i => i.severity === "HIGH").length > 0;
    if (summary.scannersEnabled > 0 || summary.scannersDisabled > 0 || hasHealthIssues) {
      try {
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          const resend = new Resend(resendKey);

          // Build scanner health section for email
          const healthSection = results.scannerHealth.issues.length > 0
            ? `<h3 style="color:#ef4444">Scanner Health Issues</h3>
               <ul>${results.scannerHealth.issues.map(i =>
                 `<li><strong>${i.scannerName}</strong>: ${i.issue} — ${i.detail} (success: ${i.metrics.successRate}%, blocked: ${i.metrics.blockRate}%)</li>`
               ).join("")}</ul>`
            : `<p style="color:#10b981"><strong>Scanner Health:</strong> ${summary.scannerHealthAnalyzed} scanners analyzed, all healthy</p>`;

          await resend.emails.send({
            from: getAdminFromEmail(),
            to: ALERT_RECIPIENT,
            subject: hasHealthIssues
              ? `[Broker Discovery] ${results.scannerHealth.issues.length} scanner health issues detected`
              : `[Broker Discovery] ${summary.scannersEnabled} enabled, ${summary.scannersDisabled} disabled`,
            html: `
              <h2>Broker Discovery Agent Report</h2>
              ${healthSection}
              <h3>Discovery & Validation</h3>
              <p><strong>Candidates discovered:</strong> ${summary.candidates}</p>
              <p><strong>Sites probed:</strong> ${summary.probed} (${summary.probeSuccesses} successful)</p>
              <p><strong>Scanners enabled:</strong> ${summary.scannersEnabled}</p>
              <p><strong>Scanners disabled:</strong> ${summary.scannersDisabled}</p>
              <p><strong>Opt-out URLs checked:</strong> ${summary.optOutChecked} (${summary.optOutBroken} broken)</p>
              <hr/>
              <p style="color:#666;font-size:12px">Broker Discovery Agent — GhostMyData</p>
            `,
          });
        }
      } catch (emailError) {
        console.error(`[${JOB_NAME}] Failed to send alert email:`, emailError);
      }
    }

    return NextResponse.json({
      success: true,
      duration,
      ...summary,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[${JOB_NAME}] Failed:`, error);

    await logCronExecution({
      jobName: JOB_NAME,
      status: "FAILED",
      duration,
      message: `Broker discovery failed: ${errorMessage}`,
      metadata: { error: errorMessage },
    });

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
