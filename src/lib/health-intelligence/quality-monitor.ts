/**
 * Health Intelligence — Quality Monitor
 *
 * 6 runtime anti-pattern detectors that surface operational issues
 * before they become incidents. Pure DB queries — $0 AI cost.
 */

import { prisma } from "@/lib/db";

// ============================================================================
// TYPES
// ============================================================================

export type InsightSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface QualityInsight {
  check: string;
  severity: InsightSeverity;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

export async function generateRuntimeQualityInsights(): Promise<QualityInsight[]> {
  const insights: QualityInsight[] = [];

  const [
    fallbackInsights,
    durationInsights,
    errorInsights,
    staleInsights,
    saturationInsights,
    oscillationInsights,
  ] = await Promise.all([
    checkAgentFallbackDrift(),
    checkCronDurationCreep(),
    checkRepeatedErrors(),
    checkStaleDirectives(),
    checkLessonSaturation(),
    checkBrokerMethodOscillation(),
  ]);

  insights.push(...fallbackInsights);
  insights.push(...durationInsights);
  insights.push(...errorInsights);
  insights.push(...staleInsights);
  insights.push(...saturationInsights);
  insights.push(...oscillationInsights);

  return insights;
}

// ============================================================================
// CHECK 1: Agent Fallback Drift
// Agents using rule-based fallback >40% of time in 7d
// ============================================================================

async function checkAgentFallbackDrift(): Promise<QualityInsight[]> {
  const insights: QualityInsight[] = [];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const agentStats = await prisma.agentExecution.groupBy({
      by: ["agentId"],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: { _all: true },
    });

    const fallbackCounts = await prisma.agentExecution.groupBy({
      by: ["agentId"],
      where: { createdAt: { gte: sevenDaysAgo }, usedFallback: true },
      _count: { _all: true },
    });

    const fallbackMap = new Map(fallbackCounts.map(f => [f.agentId, f._count._all]));

    for (const agent of agentStats) {
      const total = agent._count._all;
      if (total < 5) continue; // Skip agents with too few executions

      const fallbacks = fallbackMap.get(agent.agentId) || 0;
      const fallbackRate = fallbacks / total;

      if (fallbackRate > 0.6) {
        insights.push({
          check: "agent_fallback_drift",
          severity: "CRITICAL",
          message: `${agent.agentId} used fallback in ${(fallbackRate * 100).toFixed(0)}% of ${total} executions (7d). AI calls may be failing.`,
          details: { agentId: agent.agentId, fallbackRate, total, fallbacks },
        });
      } else if (fallbackRate > 0.4) {
        insights.push({
          check: "agent_fallback_drift",
          severity: "WARNING",
          message: `${agent.agentId} used fallback in ${(fallbackRate * 100).toFixed(0)}% of ${total} executions (7d).`,
          details: { agentId: agent.agentId, fallbackRate, total, fallbacks },
        });
      }
    }
  } catch (error) {
    console.warn("[QualityMonitor] Agent fallback drift check failed:", error instanceof Error ? error.message : error);
  }

  return insights;
}

// ============================================================================
// CHECK 2: Cron Duration Creep
// Critical crons approaching 300s Vercel timeout
// ============================================================================

const CRITICAL_CRONS = [
  "process-removals",
  "health-check",
  "daily-standup",
  "broker-compliance",
  "ticketing-agent",
];

const TIMEOUT_MS = 300_000;
const WARNING_THRESHOLD = 0.7; // 70% of timeout = 210s
const CRITICAL_THRESHOLD = 0.85; // 85% of timeout = 255s

async function checkCronDurationCreep(): Promise<QualityInsight[]> {
  const insights: QualityInsight[] = [];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    for (const cronName of CRITICAL_CRONS) {
      const recentLogs = await prisma.cronLog.findMany({
        where: {
          jobName: cronName,
          status: "SUCCESS",
          createdAt: { gte: sevenDaysAgo },
          duration: { not: null },
        },
        select: { duration: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      if (recentLogs.length < 3) continue;

      const durations = recentLogs.map(l => l.duration!);
      const maxDuration = Math.max(...durations);
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const ratio = maxDuration / TIMEOUT_MS;

      if (ratio > CRITICAL_THRESHOLD) {
        insights.push({
          check: "cron_duration_creep",
          severity: "CRITICAL",
          message: `${cronName} peak duration ${(maxDuration / 1000).toFixed(0)}s (${(ratio * 100).toFixed(0)}% of 300s timeout). Risk of FUNCTION_INVOCATION_TIMEOUT.`,
          details: { cronName, maxDuration, avgDuration: Math.round(avgDuration), ratio },
        });
      } else if (ratio > WARNING_THRESHOLD) {
        insights.push({
          check: "cron_duration_creep",
          severity: "WARNING",
          message: `${cronName} peak duration ${(maxDuration / 1000).toFixed(0)}s (${(ratio * 100).toFixed(0)}% of 300s timeout).`,
          details: { cronName, maxDuration, avgDuration: Math.round(avgDuration), ratio },
        });
      }
    }
  } catch (error) {
    console.warn("[QualityMonitor] Cron duration creep check failed:", error instanceof Error ? error.message : error);
  }

  return insights;
}

// ============================================================================
// CHECK 3: Repeated Error Patterns
// Same normalized error appearing ≥3x in 7d
// ============================================================================

async function checkRepeatedErrors(): Promise<QualityInsight[]> {
  const insights: QualityInsight[] = [];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const failedLogs = await prisma.cronLog.findMany({
      where: {
        status: "FAILED",
        createdAt: { gte: sevenDaysAgo },
        message: { not: null },
      },
      select: { jobName: true, message: true },
    });

    // Normalize error messages (remove IDs, timestamps, specific values)
    const errorCounts = new Map<string, { count: number; jobName: string; sample: string }>();
    for (const log of failedLogs) {
      if (!log.message) continue;
      const normalized = normalizeError(log.message);
      const key = `${log.jobName}:${normalized}`;
      const existing = errorCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        errorCounts.set(key, { count: 1, jobName: log.jobName, sample: log.message });
      }
    }

    for (const [, { count, jobName, sample }] of errorCounts) {
      if (count >= 5) {
        insights.push({
          check: "repeated_error_pattern",
          severity: "CRITICAL",
          message: `${jobName} has the same error ${count}x in 7d: "${sample.slice(0, 100)}"`,
          details: { jobName, count, sample },
        });
      } else if (count >= 3) {
        insights.push({
          check: "repeated_error_pattern",
          severity: "WARNING",
          message: `${jobName} has the same error ${count}x in 7d: "${sample.slice(0, 100)}"`,
          details: { jobName, count, sample },
        });
      }
    }
  } catch (error) {
    console.warn("[QualityMonitor] Repeated error check failed:", error instanceof Error ? error.message : error);
  }

  return insights;
}

function normalizeError(message: string): string {
  return message
    .replace(/[a-f0-9]{24,}/gi, "<ID>")          // CUID/ObjectId
    .replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z?/g, "<DATE>") // ISO timestamps
    .replace(/\d+ms/g, "<TIME>")                   // Durations
    .replace(/\d+\.\d+\.\d+\.\d+/g, "<IP>")       // IP addresses
    .replace(/\d{3,}/g, "<NUM>")                    // Large numbers
    .slice(0, 200);
}

// ============================================================================
// CHECK 4: Stale Directives
// Directives unchanged for 30+ days
// ============================================================================

async function checkStaleDirectives(): Promise<QualityInsight[]> {
  const insights: QualityInsight[] = [];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
    const staleDirectives = await prisma.strategicDirective.findMany({
      where: {
        isActive: true,
        updatedAt: { lt: thirtyDaysAgo },
      },
      select: { key: true, category: true, updatedAt: true },
    });

    if (staleDirectives.length > 0) {
      const keys = staleDirectives.map(d => d.key).slice(0, 5);
      const daysOldest = Math.round(
        (Date.now() - Math.min(...staleDirectives.map(d => d.updatedAt.getTime()))) / (1000 * 60 * 60 * 24)
      );

      insights.push({
        check: "stale_directives",
        severity: "INFO",
        message: `${staleDirectives.length} directive(s) unchanged for 30+ days (oldest: ${daysOldest}d). Keys: ${keys.join(", ")}${staleDirectives.length > 5 ? "..." : ""}`,
        details: { count: staleDirectives.length, keys, daysOldest },
      });
    }
  } catch (error) {
    console.warn("[QualityMonitor] Stale directives check failed:", error instanceof Error ? error.message : error);
  }

  return insights;
}

// ============================================================================
// CHECK 5: Lesson Saturation
// Same lesson learned ≥5x in 7d (indicates agent not applying its learning)
// ============================================================================

async function checkLessonSaturation(): Promise<QualityInsight[]> {
  const insights: QualityInsight[] = [];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const recentOutcomes = await prisma.agentOutcome.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        lessonLearned: { not: null },
      },
      select: { agentId: true, lessonLearned: true },
    });

    // Count similar lessons per agent
    const lessonCounts = new Map<string, { count: number; lesson: string }>();
    for (const outcome of recentOutcomes) {
      if (!outcome.lessonLearned) continue;
      const normalized = outcome.lessonLearned.toLowerCase().slice(0, 100);
      const key = `${outcome.agentId}:${normalized}`;
      const existing = lessonCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        lessonCounts.set(key, { count: 1, lesson: outcome.lessonLearned });
      }
    }

    for (const [key, { count, lesson }] of lessonCounts) {
      if (count >= 5) {
        const agentId = key.split(":")[0];
        insights.push({
          check: "lesson_saturation",
          severity: "WARNING",
          message: `${agentId} learned the same lesson ${count}x in 7d: "${lesson.slice(0, 80)}"`,
          details: { agentId, count, lesson },
        });
      }
    }
  } catch (error) {
    console.warn("[QualityMonitor] Lesson saturation check failed:", error instanceof Error ? error.message : error);
  }

  return insights;
}

// ============================================================================
// CHECK 6: Broker Method Oscillation
// Success/failure alternating >60% of attempts for a broker
// ============================================================================

async function checkBrokerMethodOscillation(): Promise<QualityInsight[]> {
  const insights: QualityInsight[] = [];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    // Check BrokerIntelligence for brokers with high oscillation indicators
    const brokers = await prisma.brokerIntelligence.findMany({
      where: {
        removalsSent: { gte: 6 }, // Need enough attempts to detect oscillation
        updatedAt: { gte: sevenDaysAgo },
      },
      select: {
        source: true,
        sourceName: true,
        successRate: true,
        removalsSent: true,
        removalsCompleted: true,
        falsePositiveRate: true,
      },
    });

    for (const broker of brokers) {
      // Success rate near 50% with enough attempts suggests oscillation
      const sr = broker.successRate;
      if (sr >= 30 && sr <= 70 && broker.removalsSent >= 10) {
        // Also check if the broker has a high false positive rate
        if (broker.falsePositiveRate > 0.3) {
          insights.push({
            check: "broker_method_oscillation",
            severity: "WARNING",
            message: `${broker.sourceName || broker.source} has ${sr.toFixed(0)}% success rate with ${broker.falsePositiveRate.toFixed(0)}% FP rate across ${broker.removalsSent} attempts — may need method review.`,
            details: {
              source: broker.source,
              successRate: sr,
              falsePositiveRate: broker.falsePositiveRate,
              attempts: broker.removalsSent,
            },
          });
        }
      }
    }
  } catch (error) {
    console.warn("[QualityMonitor] Broker oscillation check failed:", error instanceof Error ? error.message : error);
  }

  return insights;
}
