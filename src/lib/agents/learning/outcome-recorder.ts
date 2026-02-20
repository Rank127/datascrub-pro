/**
 * Outcome Recorder — records agent outcomes for learning
 *
 * Non-invasive: failures here never break core operations.
 * All writes are fire-and-forget with error swallowing.
 */

import { prisma } from "@/lib/db";
import { captureError } from "@/lib/error-reporting";

// ============================================================================
// TYPES
// ============================================================================

export interface RecordOutcomeInput {
  agentId: string;
  capability: string;
  executionId?: string;
  outcomeType: "SUCCESS" | "FAILURE" | "PARTIAL" | "REJECTED" | "TIMEOUT";
  inputHash?: string;
  context?: Record<string, unknown>;
  outcome?: Record<string, unknown>;
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Record an agent outcome. Fire-and-forget — never throws.
 */
export async function recordOutcome(input: RecordOutcomeInput): Promise<void> {
  try {
    await prisma.agentOutcome.create({
      data: {
        agentId: input.agentId,
        capability: input.capability,
        executionId: input.executionId,
        outcomeType: input.outcomeType,
        inputHash: input.inputHash,
        context: input.context ? JSON.stringify(input.context) : null,
        outcome: input.outcome ? JSON.stringify(input.outcome) : null,
      },
    });
  } catch (error) {
    captureError("[Learning] Failed to record outcome", error);
  }
}

/**
 * Get recent lessons learned for an agent + capability.
 * Returns formatted string for injection into AI prompts.
 */
export async function getLessonsForAgent(
  agentId: string,
  capability: string,
  limit = 5
): Promise<string> {
  try {
    const outcomes = await prisma.agentOutcome.findMany({
      where: {
        agentId,
        capability,
        lessonLearned: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        lessonLearned: true,
        outcomeType: true,
        context: true,
      },
    });

    if (outcomes.length === 0) return "";

    return (
      "\n\n## Learned Patterns (from past outcomes)\n" +
      outcomes
        .map((o) => `- [${o.outcomeType}] ${o.lessonLearned}`)
        .join("\n")
    );
  } catch {
    return "";
  }
}

/**
 * Get outcome statistics for an agent + capability.
 */
export async function getOutcomeStats(
  agentId: string,
  capability: string,
  daysBack = 30
): Promise<{
  total: number;
  success: number;
  failure: number;
  successRate: number;
}> {
  try {
    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const outcomes = await prisma.agentOutcome.groupBy({
      by: ["outcomeType"],
      where: {
        agentId,
        capability,
        createdAt: { gte: since },
      },
      _count: { outcomeType: true },
    });

    const total = outcomes.reduce((sum, o) => sum + o._count.outcomeType, 0);
    const success =
      outcomes.find((o) => o.outcomeType === "SUCCESS")?._count.outcomeType || 0;
    const failure =
      outcomes.find((o) => o.outcomeType === "FAILURE")?._count.outcomeType || 0;

    return {
      total,
      success,
      failure,
      successRate: total > 0 ? success / total : 0,
    };
  } catch {
    return { total: 0, success: 0, failure: 0, successRate: 0 };
  }
}

/**
 * Simple hash for input dedup / pattern matching.
 * Not cryptographic — just for grouping similar inputs.
 */
export function hashInput(input: Record<string, unknown>): string {
  const str = JSON.stringify(input, Object.keys(input).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
