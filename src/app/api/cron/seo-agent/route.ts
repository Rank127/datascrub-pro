import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSEOAgent, runFullSEOReport } from "@/lib/agents/seo-agent";
import { createAgentContext } from "@/lib/agents/base-agent";
import { InvocationTypes } from "@/lib/agents/types";
import { nanoid } from "nanoid";

// Initialize Resend for email notifications
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[SEO Agent Cron] Starting automated SEO optimization run...");

    // Use the new SEO Agent
    const result = await runFullSEOReport();

    // Send email if score is low or there are critical issues
    const adminEmail = process.env.ADMIN_EMAILS?.split(",")[0];
    if (adminEmail && (result.report.overallScore < 70 || result.report.criticalIssues.length > 0)) {
      console.log("[SEO Agent Cron] Sending alert email...");
      await sendSEOAlertEmail(
        adminEmail,
        `GhostMyData SEO Alert - Score: ${result.report.overallScore}/100`,
        result.emailContent || ""
      );
    }

    console.log(`[SEO Agent Cron] Run complete. Score: ${result.report.overallScore}/100`);

    return NextResponse.json({
      success: true,
      report: result.formatted,
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

    const agent = getSEOAgent();
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

    return NextResponse.json({
      success: true,
      result: result.data,
      metadata: result.metadata,
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
