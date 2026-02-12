/**
 * Daily Standup - AI Analysis
 *
 * Sends collected metrics to Claude Haiku for analysis.
 * Falls back to rule-based analysis if the AI call fails.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { StandupMetrics } from "./collect-metrics";

export type HealthStatus = "EXCELLENT" | "GOOD" | "ATTENTION_NEEDED" | "CRITICAL";

export interface ActionItem {
  priority: "HIGH" | "MEDIUM" | "LOW";
  action: string;
  rationale: string;
}

export interface StandupAnalysis {
  overallHealth: HealthStatus;
  executiveSummary: string;
  highlights: string[];
  concerns: string[];
  actionItems: ActionItem[];
  agentReport: string;
  operationsReport: string;
  financialReport: string;
  brokerReport: string;
}

const SYSTEM_PROMPT = `You are the Chief Operations Analyst for GhostMyData, a data privacy platform that removes users' personal information from data brokers. You run 24 AI agents and 33 cron jobs autonomously.

Analyze the provided 24-hour metrics and produce a structured JSON report. Be concise, specific, and actionable. Reference actual numbers from the data.

Respond ONLY with valid JSON matching this schema:
{
  "overallHealth": "EXCELLENT" | "GOOD" | "ATTENTION_NEEDED" | "CRITICAL",
  "executiveSummary": "2-3 sentence overview of the last 24 hours",
  "highlights": ["3-5 things working well, with specific numbers"],
  "concerns": ["0-5 issues needing attention, with specific numbers"],
  "actionItems": [{"priority": "HIGH"|"MEDIUM"|"LOW", "action": "specific action to take", "rationale": "why this matters"}],
  "agentReport": "1-2 paragraph summary of agent fleet health and performance",
  "operationsReport": "1-2 paragraph summary of removal pipeline and scan activity",
  "financialReport": "1-2 paragraph summary of plan distribution and growth",
  "brokerReport": "1-2 paragraph summary of broker performance and trends"
}

Health status guide:
- EXCELLENT: All agents healthy, no cron failures, removal success >90%
- GOOD: Minor issues, 1-2 degraded agents, removal success >75%
- ATTENTION_NEEDED: Multiple degraded agents, cron failures, or removal success <75%
- CRITICAL: Failed agents, multiple cron failures, or removal success <50%`;

export async function analyzeStandupMetrics(
  metrics: StandupMetrics
): Promise<StandupAnalysis> {
  try {
    const anthropic = new Anthropic();

    const message = await anthropic.messages.create({
      model: "claude-haiku-3-5-20241022",
      max_tokens: 1500,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Here are the last 24 hours of GhostMyData metrics:\n\n${JSON.stringify(metrics, null, 2)}`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    const parsed = JSON.parse(textBlock.text) as StandupAnalysis;

    // Validate required fields
    if (!parsed.overallHealth || !parsed.executiveSummary || !parsed.highlights) {
      throw new Error("Incomplete analysis response");
    }

    return parsed;
  } catch (error) {
    console.error(
      "[DailyStandup] AI analysis failed, using rule-based fallback:",
      error instanceof Error ? error.message : error
    );
    return generateRuleBasedAnalysis(metrics);
  }
}

function generateRuleBasedAnalysis(metrics: StandupMetrics): StandupAnalysis {
  const highlights: string[] = [];
  const concerns: string[] = [];
  const actionItems: ActionItem[] = [];

  // --- Agent health ---
  const agentSuccessRate =
    metrics.agents.total > 0
      ? (metrics.agents.healthy / metrics.agents.total) * 100
      : 100;

  if (agentSuccessRate >= 90) {
    highlights.push(
      `${metrics.agents.healthy}/${metrics.agents.total} agents healthy (${agentSuccessRate.toFixed(0)}%)`
    );
  } else if (agentSuccessRate < 70) {
    concerns.push(
      `Only ${metrics.agents.healthy}/${metrics.agents.total} agents healthy — ${metrics.agents.failed} failed, ${metrics.agents.degraded} degraded`
    );
    actionItems.push({
      priority: "HIGH",
      action: "Investigate failed agents immediately",
      rationale: `${metrics.agents.failed} agents are in failed state`,
    });
  } else {
    concerns.push(
      `${metrics.agents.degraded} agent(s) degraded — monitoring recommended`
    );
  }

  // --- Cron health ---
  if (metrics.crons.failureCount24h === 0) {
    highlights.push(
      `All ${metrics.crons.successCount24h} cron executions succeeded in 24h`
    );
  } else {
    concerns.push(
      `${metrics.crons.failureCount24h} cron job failures in 24h`
    );
    actionItems.push({
      priority: metrics.crons.failureCount24h > 3 ? "HIGH" : "MEDIUM",
      action: "Review cron failure logs",
      rationale: `${metrics.crons.failureCount24h} failures may indicate systemic issues`,
    });
  }

  if (metrics.crons.overdueJobs.length > 0) {
    concerns.push(
      `Overdue cron jobs: ${metrics.crons.overdueJobs.join(", ")}`
    );
    actionItems.push({
      priority: "HIGH",
      action: "Check overdue cron jobs in Vercel",
      rationale: "Overdue jobs may indicate deployment or configuration issues",
    });
  }

  // --- Removals ---
  const removalTotal = metrics.removals.completed24h + metrics.removals.failed24h;
  const removalSuccessRate =
    removalTotal > 0
      ? (metrics.removals.completed24h / removalTotal) * 100
      : 100;

  if (removalSuccessRate >= 90 && metrics.removals.completed24h > 0) {
    highlights.push(
      `${metrics.removals.completed24h} removals completed (${removalSuccessRate.toFixed(0)}% success rate)`
    );
  } else if (removalSuccessRate < 75 && removalTotal > 0) {
    concerns.push(
      `Removal success rate at ${removalSuccessRate.toFixed(0)}% (${metrics.removals.failed24h} failures)`
    );
    actionItems.push({
      priority: "MEDIUM",
      action: "Review failed removal requests",
      rationale: "Low success rate may indicate broker changes or service issues",
    });
  }

  if (metrics.removals.pending > 200) {
    concerns.push(`${metrics.removals.pending} removals pending in queue`);
  }

  // --- Scans ---
  if (metrics.scans.completed24h > 0) {
    highlights.push(
      `${metrics.scans.completed24h} scans completed, ${metrics.scans.exposuresFound24h} exposures found`
    );
  }

  if (metrics.scans.failed24h > 0) {
    concerns.push(`${metrics.scans.failed24h} scans failed in 24h`);
  }

  // --- Users ---
  if (metrics.users.newSignups24h > 0) {
    highlights.push(`${metrics.users.newSignups24h} new user signup(s) in 24h`);
  }

  // --- Security ---
  if (metrics.security.failedActions24h > 5) {
    concerns.push(
      `${metrics.security.failedActions24h} failed actions in 24h — possible security concern`
    );
    actionItems.push({
      priority: "HIGH",
      action: "Review failed audit log entries",
      rationale: "Elevated failed actions may indicate unauthorized access attempts",
    });
  }

  // --- Determine overall health ---
  let overallHealth: HealthStatus;
  const hasHighPriority = actionItems.some((a) => a.priority === "HIGH");
  const hasCriticalAgents = metrics.agents.failed > 0;

  if (hasCriticalAgents || (concerns.length >= 3 && hasHighPriority)) {
    overallHealth = "CRITICAL";
  } else if (concerns.length > 0 && hasHighPriority) {
    overallHealth = "ATTENTION_NEEDED";
  } else if (concerns.length > 0) {
    overallHealth = "GOOD";
  } else {
    overallHealth = "EXCELLENT";
  }

  // --- Build reports ---
  const agentReport = `Agent fleet: ${metrics.agents.healthy} healthy, ${metrics.agents.degraded} degraded, ${metrics.agents.failed} failed out of ${metrics.agents.total} total. ${metrics.agents.totalExecutions24h} executions in the last 24h consuming ${metrics.agents.totalTokens24h.toLocaleString()} tokens ($${metrics.agents.totalCost24h.toFixed(4)} estimated cost).`;

  const operationsReport = `Removal pipeline: ${metrics.removals.pending} pending, ${metrics.removals.submitted} submitted, ${metrics.removals.completed24h} completed, ${metrics.removals.failed24h} failed in 24h.${metrics.removals.avgCompletionHours ? ` Average completion time: ${metrics.removals.avgCompletionHours}h.` : ""} Scans: ${metrics.scans.completed24h} completed, ${metrics.scans.failed24h} failed, ${metrics.scans.exposuresFound24h} exposures found.`;

  const financialReport = `Plan distribution: ${metrics.users.planDistribution.FREE} Free, ${metrics.users.planDistribution.PRO} Pro, ${metrics.users.planDistribution.ENTERPRISE} Enterprise. ${metrics.users.newSignups24h} new signups in 24h, ${metrics.users.activeUsers7d} active users in last 7 days (${metrics.users.totalUsers} total).`;

  const brokerReport = metrics.brokers.totalBrokers > 0
    ? `Tracking ${metrics.brokers.totalBrokers} brokers with removal history. Top performers: ${metrics.brokers.topPerformers.map((b) => `${b.sourceName || b.source} (${b.successRate.toFixed(0)}%)`).join(", ") || "N/A"}. Worst performers: ${metrics.brokers.worstPerformers.map((b) => `${b.sourceName || b.source} (${b.successRate.toFixed(0)}%)`).join(", ") || "N/A"}.`
    : "No broker intelligence data available yet.";

  const executiveSummary = `System is ${overallHealth.toLowerCase().replace("_", " ")} with ${highlights.length} highlights and ${concerns.length} concern(s). ${metrics.agents.healthy}/${metrics.agents.total} agents operational, ${metrics.removals.completed24h} removals processed, ${metrics.scans.completed24h} scans completed.`;

  return {
    overallHealth,
    executiveSummary,
    highlights,
    concerns,
    actionItems,
    agentReport,
    operationsReport,
    financialReport,
    brokerReport,
  };
}
