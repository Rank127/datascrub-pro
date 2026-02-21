/**
 * Weekly Mastermind Board Meeting - Cron Job
 *
 * Schedule: Mondays 9am ET (0 14 * * 1 UTC)
 * Runs the full 11-step Modern Mastermind Protocol against live metrics.
 * Sends "Weekly Board Meeting Minutes" email to rocky@ghostmydata.com.
 */

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";
import { logCronExecution } from "@/lib/cron-logger";
import { collectStandupMetrics, type StandupMetrics } from "@/lib/standup/collect-metrics";
import { Resend } from "resend";
import { buildMastermindPrompt } from "@/lib/mastermind";
import { applyMastermindDirectives } from "@/lib/mastermind/directives";
import { getAdminFromEmail } from "@/lib/email";
import type { MastermindDirectiveOutput } from "@/lib/mastermind/directives";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export const maxDuration = 120;

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

    // Build the full 11-step protocol prompt
    const mastermindPrompt = buildMastermindPrompt({
      invocation: "Board Meeting",
      protocol: ["MAP", "ANALYZE", "DESIGN_OFFER", "DESIGN_EXPERIENCE", "SAFETY_CHECK", "BUILD_SHIP", "GROW_ORGANICALLY", "SELL", "OPTIMIZE", "PROTECT", "GOVERN"],
      maxAdvisors: 10,
      includeBusinessContext: true,
      scenario: "Weekly strategic review of GhostMyData operations and performance.",
    });

    // Run the protocol via Claude Haiku
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }
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
    { "step": "DESIGN_OFFER", "observation": "..." },
    { "step": "DESIGN_EXPERIENCE", "observation": "..." },
    { "step": "SAFETY_CHECK", "observation": "..." },
    { "step": "BUILD_SHIP", "observation": "..." },
    { "step": "GROW_ORGANICALLY", "observation": "..." },
    { "step": "SELL", "observation": "..." },
    { "step": "OPTIMIZE", "observation": "..." },
    { "step": "PROTECT", "observation": "..." },
    { "step": "GOVERN", "observation": "..." }
  ],
  "topPriority": "The single most important action for next week",
  "boardDecision": "2-3 sentence strategic decision from the Board of Directors"
}`,
      messages: [
        {
          role: "user",
          content: formatMetricsWithContext(metrics),
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

Each directive adjusts a specific parameter that agents and cron jobs use. Only include directives where the data CLEARLY warrants a change from defaults. If unsure, do NOT include the directive.

Available directive keys with defaults and HARD BOUNDS (values will be clamped to these ranges):
- removal_batch_pending (default: 1000, min: 50, max: 5000) — Pending removals per batch
- removal_batch_retries (default: 200, min: 10, max: 1000) — Retries per batch
- removal_rate_per_broker (default: 25, min: 5, max: 200) — Max requests per broker per day. NEVER set below 5 — this would halt removals.
- removal_anomaly_multiplier (default: 0.5, min: 0.1, max: 2.0) — Batch size multiplier on anomalies
- content_focus_topics (default: []) — Priority content topics as string array
- content_target_wordcount (default: 1000, min: 300, max: 5000) — Target word count
- content_target_readability (default: 65, min: 30, max: 90) — Flesch-Kincaid score
- seo_alert_threshold (default: 70, min: 20, max: 95) — SEO score alert trigger
- seo_keyword_relevance_min (default: 60, min: 20, max: 95) — Min keyword relevance %
- support_batch_size (default: 20, min: 5, max: 100) — Tickets per run
- billing_churn_risk_threshold (default: 0.6, min: 0.1, max: 0.95) — Churn risk trigger
- growth_upsell_confidence_min (default: 0.7, min: 0.3, max: 0.95) — Min upsell confidence
- strategic_priority (default: "") — This week's top strategic priority
- board_decision (default: "") — Latest board decision text

CRITICAL CONSTRAINTS:
1. NEVER set removal_rate_per_broker to 0 or below 5 — this halts ALL removals
2. Large "submitted" counts are NORMAL — brokers have 45-day legal response windows
3. Large "pending" counts are NORMAL — queue clears at 3,600/day capacity
4. Only adjust parameters where metrics show a clear, data-driven need for change
5. NEVER generate directives related to pricing, plan prices, discounts, coupons, trials, or free tier limits — these are admin-only and will be rejected by the system

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

Always include strategic_priority and board_decision directives.`,
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
      DESIGN_OFFER: "#10b981",
      DESIGN_EXPERIENCE: "#14b8a6",
      SAFETY_CHECK: "#ef4444",
      BUILD_SHIP: "#f59e0b",
      GROW_ORGANICALLY: "#22c55e",
      SELL: "#ec4899",
      OPTIMIZE: "#06b6d4",
      PROTECT: "#f97316",
      GOVERN: "#6366f1",
    };

    const stepLabels: Record<string, string> = {
      MAP: "MAP — Map the Landscape",
      ANALYZE: "ANALYZE — Principles & Data Analysis",
      DESIGN_OFFER: "DESIGN THE OFFER — Irresistible Value",
      DESIGN_EXPERIENCE: "DESIGN THE EXPERIENCE — Human-Centered Design",
      SAFETY_CHECK: "SAFETY CHECK — What Could Go Wrong?",
      BUILD_SHIP: "BUILD & SHIP — Efficient Execution",
      GROW_ORGANICALLY: "GROW ORGANICALLY — Sustainable Growth",
      SELL: "SELL — Empathy-Driven Distribution",
      OPTIMIZE: "OPTIMIZE — Performance & Efficiency",
      PROTECT: "PROTECT — Security & Defense",
      GOVERN: "GOVERN — Ethics, Transparency & Legacy",
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
          <h2 style="color: #e2e8f0; font-size: 16px; margin: 0 0 16px 0; padding: 0 0 8px 0; border-bottom: 1px solid #334155;">11-Step Protocol Analysis</h2>
          ${stepsHtml}
        </div>

        <div style="background-color: #1e293b; border-radius: 8px; padding: 24px; margin-bottom: 16px; border-left: 4px solid #10b981;">
          <h2 style="color: #10b981; font-size: 16px; margin: 0 0 12px 0;">Top Priority This Week</h2>
          <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 0;">${analysis.topPriority || "Continue current trajectory."}</p>
        </div>

        <div style="background-color: #1e293b; border-radius: 8px; padding: 24px; margin-bottom: 16px; border-left: 4px solid #f59e0b;">
          <h2 style="color: #f59e0b; font-size: 16px; margin: 0 0 12px 0;">Board Decision</h2>
          <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">${analysis.boardDecision || "No special decision this week."}</p>
          <p style="color: #94a3b8; font-size: 11px; margin: 8px 0 0 0;">— Buffett, Dalio, Cialdini, Fishkin, Marcus Aurelius</p>
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
      from: getAdminFromEmail(),
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

/**
 * Format metrics with human-readable context so the AI doesn't misinterpret
 * normal operational data as broken.
 */
function formatMetricsWithContext(metrics: StandupMetrics): string {
  const r = metrics.removals;
  const ctx = r.statusContext;

  return `Here are this week's GhostMyData metrics with context:

## Removal Pipeline — Health: ${ctx.pipelineHealth}
- Pending: ${r.pending} — ${ctx.pendingExplanation}
- Submitted: ${r.submitted} — ${ctx.submittedExplanation}
- Completed (24h): ${r.completed24h}
- Failed (24h): ${r.failed24h}
- Completion rate (all-time): ${ctx.completionRate}% (${ctx.completedAllTime} total)
- Requires manual: ${ctx.requiresManualCount} (handled internally by team, NOT shown to users)
- Avg completion time: ${r.avgCompletionHours ? `${r.avgCompletionHours}h` : "N/A"}

STATUS DEFINITIONS:
- PENDING = queued, waiting for next cron batch (capacity: 3,600/day). Normal range: 0-5,000.
- SUBMITTED = email sent to broker, awaiting legal response. Normal range: 1,000-15,000. Brokers have 45-day legal deadline.
- COMPLETED = verified removed. This is the end state.
- REQUIRES_MANUAL = being handled by our internal team (user never sees this status).

IMPORTANT: Large pending/submitted counts are NORMAL and expected. Do NOT interpret them as failures.

## Users
${JSON.stringify(metrics.users, null, 2)}

## Agents
Healthy: ${metrics.agents.healthy}/${metrics.agents.total}, Degraded: ${metrics.agents.degraded}, Failed: ${metrics.agents.failed}
Total cost (24h): $${metrics.agents.totalCost24h.toFixed(4)}

## Crons
Success: ${metrics.crons.successCount24h}, Failures: ${metrics.crons.failureCount24h}
Overdue: ${metrics.crons.overdueJobs.length > 0 ? metrics.crons.overdueJobs.join(", ") : "none"}

## Scans
Completed (24h): ${metrics.scans.completed24h}, Failed: ${metrics.scans.failed24h}, In progress: ${metrics.scans.inProgress}

## Tickets
Open: ${metrics.tickets.openCount}, Stale: ${metrics.tickets.staleCount}, Auto-fixed (24h): ${metrics.tickets.autoFixedCount24h}

## Security
Admin actions (24h): ${metrics.security.adminActions24h}, Failed actions: ${metrics.security.failedActions24h}`;
}
