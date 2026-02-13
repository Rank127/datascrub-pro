/**
 * Weekly Mastermind Board Meeting - Cron Job
 *
 * Schedule: Mondays 9am ET (0 14 * * 1 UTC)
 * Runs the full 7-step Modern Mastermind Protocol against live metrics.
 * Sends "Weekly Board Meeting Minutes" email to rocky@ghostmydata.com.
 */

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";
import { logCronExecution } from "@/lib/cron-logger";
import { collectStandupMetrics } from "@/lib/standup/collect-metrics";
import { Resend } from "resend";
import { buildMastermindPrompt } from "@/lib/mastermind";
import { applyMastermindDirectives } from "@/lib/mastermind/directives";
import type { MastermindDirectiveOutput } from "@/lib/mastermind/directives";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const JOB_NAME = "mastermind-weekly";
const RECIPIENT = "rocky@ghostmydata.com";

export async function GET(request: Request) {
  const startTime = Date.now();

  // Auth check
  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return cronUnauthorizedResponse(authResult.reason);
  }

  try {
    // Collect live metrics
    const metrics = await collectStandupMetrics();

    // Build the full 7-step protocol prompt
    const mastermindPrompt = buildMastermindPrompt({
      invocation: "Board Meeting",
      protocol: ["MAP", "ANALYZE", "DESIGN", "SAFETY_CHECK", "BUILD_SHIP", "SELL", "GOVERN"],
      maxAdvisors: 5,
      includeBusinessContext: true,
      scenario: "Weekly strategic review of GhostMyData operations and performance.",
    });

    // Run the protocol via Claude Haiku
    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      temperature: 0.4,
      system: `You are the Strategic Advisor for GhostMyData, conducting a weekly Mastermind Board Meeting.

${mastermindPrompt}

Analyze the provided business metrics through each protocol step. For each step, provide a concise observation (2-3 sentences) channeling the assigned advisors' thinking styles.

Respond with valid JSON:
{
  "weeklyTheme": "One sentence capturing the week's strategic theme",
  "protocolSteps": [
    { "step": "MAP", "observation": "..." },
    { "step": "ANALYZE", "observation": "..." },
    { "step": "DESIGN", "observation": "..." },
    { "step": "SAFETY_CHECK", "observation": "..." },
    { "step": "BUILD_SHIP", "observation": "..." },
    { "step": "SELL", "observation": "..." },
    { "step": "GOVERN", "observation": "..." }
  ],
  "topPriority": "The single most important action for next week",
  "boardDecision": "2-3 sentence strategic decision from the Nucleus"
}`,
      messages: [
        {
          role: "user",
          content: `Here are this week's GhostMyData metrics:\n\n${JSON.stringify(metrics, null, 2)}`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Extract JSON from response (handles code fences, trailing text, etc.)
    let analysisJson = textBlock.text.trim();
    if (analysisJson.startsWith("```")) {
      analysisJson = analysisJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    // Extract first complete JSON object if there's trailing text
    const jsonMatch = analysisJson.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in Claude response");
    }
    const analysis = JSON.parse(jsonMatch[0]);

    // Generate strategic directives from the analysis
    let directivesApplied = 0;
    let directivesList: MastermindDirectiveOutput[] = [];
    try {
      const directiveMessage = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        temperature: 0.2,
        system: `You are the Directive Engine for GhostMyData. Based on a weekly Mastermind Board Meeting analysis and live metrics, generate concrete operational directives.

Each directive adjusts a specific parameter that agents and cron jobs use. Only include directives where the analysis suggests a change from defaults.

Available directive keys and their defaults:
- removal_batch_pending (default: 1000) — How many pending removals to process per batch
- removal_batch_retries (default: 200) — How many retries to process per batch
- removal_rate_per_broker (default: 25) — Max requests per broker per day
- removal_anomaly_multiplier (default: 0.5) — Batch size multiplier when anomalies detected
- content_focus_topics (default: []) — Priority content topics as string array
- content_target_wordcount (default: 1000) — Target word count for content
- content_target_readability (default: 65) — Target readability score (Flesch-Kincaid)
- seo_alert_threshold (default: 70) — SEO score below which to trigger alerts
- seo_keyword_relevance_min (default: 60) — Minimum keyword relevance percentage
- support_batch_size (default: 20) — Tickets to process per run
- billing_churn_risk_threshold (default: 0.6) — Churn risk score trigger
- growth_upsell_confidence_min (default: 0.7) — Min confidence for upsell suggestions
- strategic_priority (default: "") — This week's top strategic priority
- board_decision (default: "") — Latest board decision text

Respond with valid JSON only:
{
  "directives": [
    {
      "category": "removal|content|seo|support|billing|growth|global",
      "key": "directive_key_name",
      "value": <number|string|array>,
      "rationale": "Why this change (1 sentence)",
      "advisorSource": "Which advisor(s) influenced this"
    }
  ]
}

Always include strategic_priority and board_decision directives.
Only adjust numerical parameters if the data clearly warrants it.`,
        messages: [
          {
            role: "user",
            content: `Board Meeting Analysis:\n${JSON.stringify(analysis, null, 2)}\n\nLive Metrics Summary:\nUsers: ${JSON.stringify(metrics.users)}\nRemovals: ${JSON.stringify(metrics.removals)}\nAgents: healthy=${metrics.agents.healthy}/${metrics.agents.total}, failed=${metrics.agents.failed}\nCrons: failures=${metrics.crons.failureCount24h}`,
          },
        ],
      });

      const dirTextBlock = directiveMessage.content.find((b) => b.type === "text");
      if (dirTextBlock && dirTextBlock.type === "text") {
        let dirJson = dirTextBlock.text.trim();
        if (dirJson.startsWith("```")) {
          dirJson = dirJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }
        const dirJsonMatch = dirJson.match(/\{[\s\S]*\}/);
        if (!dirJsonMatch) throw new Error("No JSON in directive response");
        const parsed = JSON.parse(dirJsonMatch[0]);
        directivesList = parsed.directives || [];
        directivesApplied = await applyMastermindDirectives(directivesList, "mastermind-weekly");
      }
    } catch (dirError) {
      console.error("[MastermindWeekly] Directive generation failed (non-fatal):", dirError instanceof Error ? dirError.message : dirError);
    }

    // Format email
    const stepColors: Record<string, string> = {
      MAP: "#3b82f6",
      ANALYZE: "#8b5cf6",
      DESIGN: "#10b981",
      SAFETY_CHECK: "#ef4444",
      BUILD_SHIP: "#f59e0b",
      SELL: "#ec4899",
      GOVERN: "#6366f1",
    };

    const stepLabels: Record<string, string> = {
      MAP: "MAP — Map the Terrain",
      ANALYZE: "ANALYZE — Principles & Data",
      DESIGN: "DESIGN — Irresistible Solution",
      SAFETY_CHECK: "SAFETY CHECK — What Could Go Wrong?",
      BUILD_SHIP: "BUILD & SHIP — Efficient Execution",
      SELL: "SELL — Empathy-Driven Distribution",
      GOVERN: "GOVERN — Ethics & Legacy",
    };

    const stepsHtml = (analysis.protocolSteps || [])
      .map(
        (s: { step: string; observation: string }) => `
        <div style="background-color: #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 12px; border-left: 4px solid ${stepColors[s.step] || "#94a3b8"};">
          <h3 style="color: ${stepColors[s.step] || "#e2e8f0"}; font-size: 14px; margin: 0 0 8px 0;">${stepLabels[s.step] || s.step}</h3>
          <p style="color: #cbd5e1; font-size: 13px; line-height: 1.5; margin: 0;">${s.observation}</p>
        </div>`
      )
      .join("");

    const dateStr = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 40px 20px; margin: 0;">
      <div style="max-width: 640px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #e2e8f0; font-size: 22px; margin: 0 0 8px 0;">Weekly Board Meeting Minutes</h1>
          <p style="color: #94a3b8; font-size: 13px; margin: 0 0 12px 0;">${dateStr}</p>
          <div style="display: inline-block; padding: 6px 16px; border-radius: 20px; background-color: #f59e0b; color: #000000; font-weight: bold; font-size: 13px;">
            Mastermind Protocol
          </div>
        </div>

        <div style="background-color: #1e293b; border-radius: 8px; padding: 24px; margin-bottom: 16px;">
          <h2 style="color: #f59e0b; font-size: 16px; margin: 0 0 12px 0;">Weekly Theme</h2>
          <p style="color: #e2e8f0; font-size: 15px; line-height: 1.6; margin: 0; font-weight: 600;">${analysis.weeklyTheme || "Strategic review complete."}</p>
        </div>

        <div style="margin-bottom: 16px;">
          <h2 style="color: #e2e8f0; font-size: 16px; margin: 0 0 16px 0; padding: 0 0 8px 0; border-bottom: 1px solid #334155;">7-Step Protocol Analysis</h2>
          ${stepsHtml}
        </div>

        <div style="background-color: #1e293b; border-radius: 8px; padding: 24px; margin-bottom: 16px; border-left: 4px solid #10b981;">
          <h2 style="color: #10b981; font-size: 16px; margin: 0 0 12px 0;">Top Priority This Week</h2>
          <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 0;">${analysis.topPriority || "Continue current trajectory."}</p>
        </div>

        <div style="background-color: #1e293b; border-radius: 8px; padding: 24px; margin-bottom: 16px; border-left: 4px solid #f59e0b;">
          <h2 style="color: #f59e0b; font-size: 16px; margin: 0 0 12px 0;">Nucleus Board Decision</h2>
          <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">${analysis.boardDecision || "No special decision this week."}</p>
          <p style="color: #94a3b8; font-size: 11px; margin: 8px 0 0 0;">— Huang, Hassabis, Buffett, Nadella, Amodei</p>
        </div>

        ${directivesApplied > 0 ? `
        <div style="background-color: #1e293b; border-radius: 8px; padding: 24px; margin-bottom: 16px; border-left: 4px solid #8b5cf6;">
          <h2 style="color: #8b5cf6; font-size: 16px; margin: 0 0 12px 0;">Strategic Directives Updated (${directivesApplied})</h2>
          ${directivesList.map((d: MastermindDirectiveOutput) => `
            <div style="margin-bottom: 8px; padding: 8px; background-color: #0f172a; border-radius: 4px;">
              <span style="color: #a78bfa; font-size: 12px; font-family: monospace;">${d.key}</span>
              <span style="color: #94a3b8; font-size: 12px;"> = </span>
              <span style="color: #e2e8f0; font-size: 12px; font-weight: 600;">${typeof d.value === 'object' ? JSON.stringify(d.value) : String(d.value)}</span>
              <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0 0;">${d.rationale}${d.advisorSource ? ` — ${d.advisorSource}` : ''}</p>
            </div>
          `).join('')}
        </div>` : ''}

        <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155;">
          <p style="color: #64748b; font-size: 11px; margin: 0 0 4px 0;">
            Generated ${new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "full", timeStyle: "short" })} ET
          </p>
          <p style="color: #64748b; font-size: 11px; margin: 0;">
            <a href="https://ghostmydata.com/dashboard/mastermind" style="color: #10b981; text-decoration: none;">Open Mastermind Dashboard</a>
          </p>
        </div>
      </div>
    </body>
    </html>`;

    // Send email
    await getResend().emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "GhostMyData <noreply@send.ghostmydata.com>",
      to: RECIPIENT,
      subject: `Weekly Board Meeting — ${dateStr}`,
      html: emailHtml,
    });

    const duration = Date.now() - startTime;

    await logCronExecution({
      jobName: JOB_NAME,
      status: "SUCCESS",
      duration,
      message: `Weekly mastermind protocol completed. Theme: ${analysis.weeklyTheme || "N/A"}. ${directivesApplied} directives updated.`,
      metadata: {
        topPriority: analysis.topPriority,
        stepsCompleted: analysis.protocolSteps?.length || 0,
        directivesApplied,
      },
    });

    return NextResponse.json({
      success: true,
      weeklyTheme: analysis.weeklyTheme,
      topPriority: analysis.topPriority,
      directivesApplied,
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

    console.error("[MastermindWeekly] Failed:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
