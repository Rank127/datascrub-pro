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

    const message =
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

    // Send admin alert if scanners were newly enabled or disabled
    if (summary.scannersEnabled > 0 || summary.scannersDisabled > 0) {
      try {
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          const resend = new Resend(resendKey);
          await resend.emails.send({
            from: getAdminFromEmail(),
            to: ALERT_RECIPIENT,
            subject: `[Broker Discovery] ${summary.scannersEnabled} enabled, ${summary.scannersDisabled} disabled`,
            html: `
              <h2>Broker Discovery Agent Report</h2>
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
