/**
 * Agent Learning Cron
 *
 * Runs DAILY at 5 AM UTC. Reviews recent agent outcomes, extracts lessons
 * via Claude Haiku, and updates BrokerIntelligence aggregate stats.
 *
 * Schedule: 0 5 * * *  (daily at 5 AM UTC)
 * Cost: ~$0.001/day (small Haiku calls for lesson extraction)
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyCronAuth } from "@/lib/cron-auth";
import { logCronExecution } from "@/lib/cron-logger";
import { captureError } from "@/lib/error-reporting";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 120;

const JOB_NAME = "agent-learning";
const DEADLINE_MS = 100_000; // 100s safety margin
const MIN_OUTCOMES_FOR_LESSON = 3; // Need 3+ similar outcomes to extract a pattern

export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    const authResult = verifyCronAuth(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = {
      outcomesReviewed: 0,
      lessonsExtracted: 0,
      brokerStatsUpdated: 0,
      thresholdsAdapted: 0,
      errors: [] as string[],
    };

    // 1. Query AgentOutcome records from last 24h without lessons
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentOutcomes = await prisma.agentOutcome.findMany({
      where: {
        createdAt: { gte: oneDayAgo },
        lessonLearned: null,
      },
      orderBy: { createdAt: "desc" },
      take: 200, // Cap to avoid timeout
    });

    results.outcomesReviewed = recentOutcomes.length;

    if (recentOutcomes.length === 0) {
      await logCronExecution({ jobName: JOB_NAME, status: "SUCCESS", duration: Date.now() - startTime, metadata: results });
      return NextResponse.json({ success: true, ...results });
    }

    // 2. Group by agentId + capability
    const groups = new Map<string, typeof recentOutcomes>();
    for (const outcome of recentOutcomes) {
      const key = `${outcome.agentId}::${outcome.capability}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(outcome);
    }

    // 3. Extract lessons for groups with enough outcomes
    const anthropic = process.env.ANTHROPIC_API_KEY
      ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      : null;

    for (const [groupKey, outcomes] of groups) {
      if (Date.now() - startTime > DEADLINE_MS) break;

      // Need minimum outcomes to detect a pattern
      if (outcomes.length < MIN_OUTCOMES_FOR_LESSON) continue;

      const [agentId, capability] = groupKey.split("::");

      try {
        let lesson: string | null = null;

        if (anthropic) {
          // Use Haiku to extract a lesson
          lesson = await extractLessonWithAI(anthropic, agentId, capability, outcomes);
        } else {
          // Fallback: rule-based pattern detection
          lesson = extractLessonRuleBased(outcomes);
        }

        if (lesson && lesson !== "NO_PATTERN") {
          // Write lesson to all outcomes in this group
          await prisma.agentOutcome.updateMany({
            where: {
              id: { in: outcomes.map((o) => o.id) },
            },
            data: { lessonLearned: lesson },
          });
          results.lessonsExtracted++;
        }
      } catch (error) {
        const msg = `Failed to extract lesson for ${groupKey}: ${error instanceof Error ? error.message : "unknown"}`;
        results.errors.push(msg);
        captureError(`[AgentLearning] ${msg}`, error);
      }
    }

    // 4. Broker threshold adaptation (removal-agent outcomes)
    try {
      const adapted = await adaptBrokerThresholds();
      results.brokerStatsUpdated = adapted.updated;
      results.thresholdsAdapted = adapted.adapted;
    } catch (error) {
      results.errors.push(`Broker adaptation failed: ${error instanceof Error ? error.message : "unknown"}`);
    }

    const status = results.errors.length > 0 ? "PARTIAL" : "SUCCESS";
    await logCronExecution({ jobName: JOB_NAME, status: status as "SUCCESS" | "PARTIAL", duration: Date.now() - startTime, metadata: results });

    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    captureError("[AgentLearning] Cron failed", error);
    await logCronExecution({ jobName: JOB_NAME, status: "FAILED", duration: Date.now() - startTime,
      metadata: { error: error instanceof Error ? error.message : "Unknown error" } });
    return NextResponse.json({ error: "Learning cron failed" }, { status: 500 });
  }
}

// ============================================================================
// LESSON EXTRACTION
// ============================================================================

async function extractLessonWithAI(
  anthropic: Anthropic,
  agentId: string,
  capability: string,
  outcomes: Array<{ outcomeType: string; context: string | null; outcome: string | null }>
): Promise<string | null> {
  const outcomeSummary = outcomes.map((o) => ({
    type: o.outcomeType,
    context: o.context ? safeJsonParse(o.context) : null,
    outcome: o.outcome ? safeJsonParse(o.outcome) : null,
  }));

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    system: "You extract actionable patterns from agent outcomes. Respond with ONLY the lesson (1 sentence) or NO_PATTERN if no clear pattern exists.",
    messages: [
      {
        role: "user",
        content: `Agent: ${agentId}, Capability: ${capability}\n\nRecent outcomes (${outcomes.length}):\n${JSON.stringify(outcomeSummary, null, 2)}\n\nExtract a concise, actionable lesson (1 sentence) that would help this agent make better decisions. If no clear pattern exists, respond with "NO_PATTERN".`,
      },
    ],
  });

  const text = response.content.find((c) => c.type === "text");
  return text && text.type === "text" ? text.text.trim() : null;
}

function extractLessonRuleBased(
  outcomes: Array<{ outcomeType: string; context: string | null }>
): string | null {
  // Count outcome types
  const counts: Record<string, number> = {};
  for (const o of outcomes) {
    counts[o.outcomeType] = (counts[o.outcomeType] || 0) + 1;
  }

  const total = outcomes.length;
  const failureRate = (counts["FAILURE"] || 0) / total;
  const successRate = (counts["SUCCESS"] || 0) / total;

  // If >80% failures, extract broker from context
  if (failureRate > 0.8) {
    const brokers = outcomes
      .map((o) => {
        const ctx = o.context ? safeJsonParse(o.context) : null;
        return ctx?.brokerKey;
      })
      .filter(Boolean);

    const uniqueBrokers = [...new Set(brokers)];
    if (uniqueBrokers.length === 1) {
      return `Broker ${uniqueBrokers[0]} has ${Math.round(failureRate * 100)}% failure rate — consider alternative removal method.`;
    }
    return `High failure rate (${Math.round(failureRate * 100)}%) across ${uniqueBrokers.length} brokers.`;
  }

  // If >90% success, note the working pattern
  if (successRate > 0.9) {
    return `Current approach has ${Math.round(successRate * 100)}% success rate — maintain current strategy.`;
  }

  return "NO_PATTERN";
}

// ============================================================================
// BROKER THRESHOLD ADAPTATION
// ============================================================================

async function adaptBrokerThresholds(): Promise<{ updated: number; adapted: number }> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Get removal outcomes grouped by broker
  const outcomes = await prisma.agentOutcome.findMany({
    where: {
      agentId: "removal-agent",
      capability: "execute-removal",
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { outcomeType: true, context: true },
  });

  // Group by broker key
  const brokerStats = new Map<string, { success: number; failure: number; total: number }>();

  for (const o of outcomes) {
    const ctx = o.context ? safeJsonParse(o.context) : null;
    const broker = ctx?.brokerKey as string | undefined;
    if (!broker) continue;

    if (!brokerStats.has(broker)) {
      brokerStats.set(broker, { success: 0, failure: 0, total: 0 });
    }
    const stats = brokerStats.get(broker)!;
    stats.total++;
    if (o.outcomeType === "SUCCESS") stats.success++;
    if (o.outcomeType === "FAILURE") stats.failure++;
  }

  let updated = 0;
  let adapted = 0;

  for (const [broker, stats] of brokerStats) {
    if (stats.total < 5) continue; // Need enough data

    const emailFailureRate = stats.failure / stats.total;

    // If EMAIL failure rate > 80% with 5+ attempts → mark as rejectsEmail
    if (emailFailureRate > 0.8) {
      try {
        await prisma.brokerIntelligence.updateMany({
          where: { source: broker, rejectsEmail: false },
          data: {
            rejectsEmail: true,
            preferredMethod: "FORM",
            methodConfidence: Math.min(0.95, 0.5 + emailFailureRate * 0.5),
            lastMethodUpdate: new Date(),
          },
        });
        adapted++;
      } catch {
        // Broker may not exist in BrokerIntelligence yet — skip
      }
    }

    updated++;
  }

  return { updated, adapted };
}

// ============================================================================
// HELPERS
// ============================================================================

function safeJsonParse(str: string): Record<string, unknown> | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
