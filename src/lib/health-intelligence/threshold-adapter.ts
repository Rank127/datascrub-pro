/**
 * Health Intelligence — Threshold Adapter
 *
 * 6 rules propose directive changes based on trends.
 * Self-evaluation loop checks 3-10 day old adaptations and auto-reverts failures.
 * Pure DB queries + arithmetic — $0 AI cost.
 */

import { prisma } from "@/lib/db";
import { getDirective, setDirective } from "@/lib/mastermind/directives";
import type { TrendAnalysis } from "./trend-analyzer";

// ============================================================================
// TYPES
// ============================================================================

export interface AdaptationProposal {
  directiveKey: string;
  category: string;
  previousValue: unknown;
  newValue: unknown;
  rationale: string;
  triggerMetric: string;
  triggerValue: number;
}

export interface AdaptationResult {
  proposed: AdaptationProposal[];
  applied: AdaptationProposal[];
  skippedCooldown: string[];
}

export interface EvaluationResult {
  evaluated: number;
  reverted: number;
  details: Array<{
    id: string;
    directiveKey: string;
    score: number;
    action: "kept" | "reverted" | "insufficient_data";
    notes: string;
  }>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_ADAPTATIONS_PER_RUN = 3;
const COOLDOWN_DAYS = 3;
const EVALUATION_MIN_DAYS = 3;
const EVALUATION_MAX_DAYS = 10;
const REVERT_THRESHOLD = -0.3;
const MIN_EVAL_DATAPOINTS = 3;

// ============================================================================
// ADAPTATION RULES
// ============================================================================

export function proposeAdaptationsFromTrends(trends: TrendAnalysis[]): AdaptationProposal[] {
  const proposals: AdaptationProposal[] = [];

  const findTrend = (metric: string) => trends.find(t => t.metric === metric);

  // Rule 1: Removal success rate declining → reduce anomaly multiplier
  const removalSuccessRate = findTrend("removal_success_rate");
  if (
    removalSuccessRate &&
    removalSuccessRate.trend7d.direction === "degrading" &&
    removalSuccessRate.trend7d.dataPoints >= 5 &&
    removalSuccessRate.trend7d.r2 >= 0.5
  ) {
    proposals.push({
      directiveKey: "removal_anomaly_multiplier",
      category: "removal",
      previousValue: null, // filled later
      newValue: null,      // filled later
      rationale: `Removal success rate declining (slope=${removalSuccessRate.trend7d.normalizedSlope.toFixed(3)}, R²=${removalSuccessRate.trend7d.r2.toFixed(2)}). Reducing anomaly multiplier for more conservative batching.`,
      triggerMetric: "removal_success_rate",
      triggerValue: removalSuccessRate.latestValue,
    });
  }

  // Rule 2: Removal success rate improving (>70%) → increase anomaly multiplier
  if (
    removalSuccessRate &&
    removalSuccessRate.trend7d.direction === "improving" &&
    removalSuccessRate.latestValue > 0.7 &&
    removalSuccessRate.trend7d.dataPoints >= 5 &&
    removalSuccessRate.trend7d.r2 >= 0.5
  ) {
    proposals.push({
      directiveKey: "removal_anomaly_multiplier",
      category: "removal",
      previousValue: null,
      newValue: null,
      rationale: `Removal success rate improving at ${(removalSuccessRate.latestValue * 100).toFixed(1)}%. Increasing anomaly multiplier for larger batches.`,
      triggerMetric: "removal_success_rate",
      triggerValue: removalSuccessRate.latestValue,
    });
  }

  // Rule 3: Process-removals duration >200s and rising → reduce batch size
  const prDuration = findTrend("process_removals_duration");
  if (
    prDuration &&
    prDuration.latestValue > 200000 && // 200s in ms
    prDuration.trend7d.direction === "degrading" && // inverted — degrading means duration increasing
    prDuration.trend7d.dataPoints >= 5 &&
    prDuration.trend7d.r2 >= 0.5
  ) {
    proposals.push({
      directiveKey: "removal_batch_pending",
      category: "removal",
      previousValue: null,
      newValue: null,
      rationale: `Process-removals duration at ${(prDuration.latestValue / 1000).toFixed(0)}s and rising. Reducing batch size to stay within 300s timeout.`,
      triggerMetric: "process_removals_duration",
      triggerValue: prDuration.latestValue,
    });
  }

  // Rule 4: Process-removals duration <120s and stable → increase batch size
  if (
    prDuration &&
    prDuration.latestValue < 120000 && // 120s in ms
    prDuration.trend7d.direction === "stable" &&
    prDuration.trend7d.dataPoints >= 5
  ) {
    proposals.push({
      directiveKey: "removal_batch_pending",
      category: "removal",
      previousValue: null,
      newValue: null,
      rationale: `Process-removals duration stable at ${(prDuration.latestValue / 1000).toFixed(0)}s. Room to increase batch size.`,
      triggerMetric: "process_removals_duration",
      triggerValue: prDuration.latestValue,
    });
  }

  // Rule 5: Cron failures trending up → reduce support batch size
  const cronFailures = findTrend("daily_cron_failures");
  if (
    cronFailures &&
    cronFailures.trend7d.direction === "degrading" && // inverted — degrading means more failures
    cronFailures.trend7d.dataPoints >= 5 &&
    cronFailures.trend7d.r2 >= 0.5
  ) {
    proposals.push({
      directiveKey: "support_batch_size",
      category: "support",
      previousValue: null,
      newValue: null,
      rationale: `Cron failures trending up (latest: ${cronFailures.latestValue}). Reducing support batch size to reduce load.`,
      triggerMetric: "daily_cron_failures",
      triggerValue: cronFailures.latestValue,
    });
  }

  // Rule 6: Process-removals failures/day rising → reduce rate per broker
  const prFailures = findTrend("process_removals_failures_per_day");
  if (
    prFailures &&
    prFailures.trend7d.direction === "degrading" && // inverted — degrading means more failures
    prFailures.trend7d.dataPoints >= 5 &&
    prFailures.trend7d.r2 >= 0.5
  ) {
    proposals.push({
      directiveKey: "removal_rate_per_broker",
      category: "removal",
      previousValue: null,
      newValue: null,
      rationale: `Process-removals failures/day rising (latest: ${prFailures.latestValue}). Reducing per-broker rate to improve reliability.`,
      triggerMetric: "process_removals_failures_per_day",
      triggerValue: prFailures.latestValue,
    });
  }

  return proposals;
}

// ============================================================================
// APPLY ADAPTATIONS with cooldown + clamping
// ============================================================================

// Directive bounds (mirrors directives.ts — kept in sync)
const DIRECTIVE_BOUNDS: Record<string, { min: number; max: number }> = {
  removal_rate_per_broker: { min: 10, max: 200 },
  removal_batch_pending: { min: 200, max: 3000 },
  removal_anomaly_multiplier: { min: 0.2, max: 1.5 },
  support_batch_size: { min: 5, max: 100 },
};

// Default values for directives
const DIRECTIVE_DEFAULTS: Record<string, number> = {
  removal_rate_per_broker: 25,
  removal_batch_pending: 1000,
  removal_anomaly_multiplier: 0.5,
  support_batch_size: 20,
};

// Change rules per directive
const CHANGE_RULES: Record<string, { increase: number; decrease: number; unit: "absolute" | "percent" }> = {
  removal_anomaly_multiplier: { increase: 0.1, decrease: 0.1, unit: "absolute" },
  removal_batch_pending: { increase: 0.15, decrease: 0.20, unit: "percent" },
  support_batch_size: { increase: 5, decrease: 5, unit: "absolute" },
  removal_rate_per_broker: { increase: 5, decrease: 5, unit: "absolute" },
};

function clamp(value: number, key: string): number {
  const bounds = DIRECTIVE_BOUNDS[key];
  if (!bounds) return value;
  return Math.max(bounds.min, Math.min(bounds.max, value));
}

export async function applyAdaptations(proposals: AdaptationProposal[]): Promise<AdaptationResult> {
  const result: AdaptationResult = { proposed: proposals, applied: [], skippedCooldown: [] };

  if (proposals.length === 0) return result;

  // Check cooldowns
  const cooldownCutoff = new Date(Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
  const recentAdaptations = await prisma.adaptationLog.findMany({
    where: { createdAt: { gte: cooldownCutoff } },
    select: { directiveKey: true },
  });
  const recentKeys = new Set(recentAdaptations.map(a => a.directiveKey));

  let appliedCount = 0;

  for (const proposal of proposals) {
    if (appliedCount >= MAX_ADAPTATIONS_PER_RUN) break;

    if (recentKeys.has(proposal.directiveKey)) {
      result.skippedCooldown.push(proposal.directiveKey);
      continue;
    }

    // Get current value
    const defaultVal = DIRECTIVE_DEFAULTS[proposal.directiveKey] ?? 0;
    const currentValue = await getDirective<number>(proposal.directiveKey, defaultVal);
    proposal.previousValue = currentValue;

    // Calculate new value based on change rules
    const rule = CHANGE_RULES[proposal.directiveKey];
    if (!rule) continue;

    let newValue: number;
    const isIncrease = proposal.rationale.toLowerCase().includes("increas");

    if (rule.unit === "percent") {
      const factor = isIncrease ? (1 + rule.increase) : (1 - rule.decrease);
      newValue = Math.round(currentValue * factor);
    } else {
      const delta = isIncrease ? rule.increase : -rule.decrease;
      newValue = currentValue + delta;
    }

    newValue = clamp(newValue, proposal.directiveKey);

    // Skip if value didn't change
    if (newValue === currentValue) continue;

    proposal.newValue = newValue;

    // Apply the directive
    try {
      await setDirective({
        category: proposal.category,
        key: proposal.directiveKey,
        value: newValue,
        rationale: `[health-intelligence] ${proposal.rationale}`,
        advisorSource: "Health Intelligence System",
        source: "health-intelligence",
      });

      // Log to AdaptationLog
      await prisma.adaptationLog.create({
        data: {
          directiveKey: proposal.directiveKey,
          previousValue: currentValue,
          newValue: newValue,
          rationale: proposal.rationale,
          triggerMetric: proposal.triggerMetric,
          triggerValue: proposal.triggerValue,
          source: "health-intelligence",
        },
      });

      result.applied.push(proposal);
      appliedCount++;
    } catch (error) {
      console.error(`[HealthIntelligence] Failed to apply adaptation for ${proposal.directiveKey}:`, error instanceof Error ? error.message : error);
    }
  }

  return result;
}

// ============================================================================
// SELF-EVALUATION — Check past adaptations, score, auto-revert if harmful
// ============================================================================

export async function evaluatePastAdaptations(): Promise<EvaluationResult> {
  const result: EvaluationResult = { evaluated: 0, reverted: 0, details: [] };

  // Find adaptations from 3-10 days ago that haven't been evaluated yet
  const minDate = new Date(Date.now() - EVALUATION_MAX_DAYS * 24 * 60 * 60 * 1000);
  const maxDate = new Date(Date.now() - EVALUATION_MIN_DAYS * 24 * 60 * 60 * 1000);

  const pendingEvals = await prisma.adaptationLog.findMany({
    where: {
      createdAt: { gte: minDate, lte: maxDate },
      evaluatedAt: null,
      reverted: false,
    },
    orderBy: { createdAt: "asc" },
  });

  for (const adaptation of pendingEvals) {
    const changeDate = adaptation.createdAt;
    const metricName = adaptation.triggerMetric;

    // Get metric values before and after the change
    const beforeWindow = new Date(changeDate.getTime() - 3 * 24 * 60 * 60 * 1000);
    const afterStart = changeDate;
    const afterEnd = new Date();

    // Query CronLog for the metric before/after
    const { beforeAvg, afterAvg, afterCount } = await getMetricAverages(
      metricName, beforeWindow, changeDate, afterStart, afterEnd
    );

    if (afterCount < MIN_EVAL_DATAPOINTS) {
      result.details.push({
        id: adaptation.id,
        directiveKey: adaptation.directiveKey,
        score: 0,
        action: "insufficient_data",
        notes: `Only ${afterCount} data points after change (need ${MIN_EVAL_DATAPOINTS})`,
      });
      continue;
    }

    // Calculate effectiveness score
    // For most metrics, higher is better (we already inverted cost/failures in trend analysis)
    let score: number;
    if (beforeAvg === 0) {
      score = afterAvg > 0 ? 0.5 : 0;
    } else {
      score = (afterAvg - beforeAvg) / Math.abs(beforeAvg);
      // Clamp to [-1, 1]
      score = Math.max(-1, Math.min(1, score));
    }

    let action: "kept" | "reverted" = "kept";
    let notes = `Before avg: ${beforeAvg.toFixed(3)}, After avg: ${afterAvg.toFixed(3)}, Score: ${score.toFixed(3)}`;

    // Auto-revert if score < -0.3
    if (score < REVERT_THRESHOLD) {
      try {
        const previousValue = adaptation.previousValue as number;
        await setDirective({
          category: "removal", // Most adaptations are removal-related
          key: adaptation.directiveKey,
          value: previousValue,
          rationale: `[health-intelligence] Auto-revert: adaptation from ${changeDate.toISOString().slice(0, 10)} scored ${score.toFixed(2)}. Reverting ${adaptation.directiveKey} from ${JSON.stringify(adaptation.newValue)} back to ${JSON.stringify(adaptation.previousValue)}.`,
          advisorSource: "Health Intelligence Self-Evaluation",
          source: "health-intelligence",
        });

        action = "reverted";
        notes += ` — REVERTED to ${JSON.stringify(adaptation.previousValue)}`;
        result.reverted++;

        // Log the revert as a new AdaptationLog entry
        await prisma.adaptationLog.create({
          data: {
            directiveKey: adaptation.directiveKey,
            previousValue: adaptation.newValue ?? 0,
            newValue: adaptation.previousValue ?? 0,
            rationale: `Auto-revert: previous adaptation scored ${score.toFixed(2)} (threshold: ${REVERT_THRESHOLD})`,
            triggerMetric: adaptation.triggerMetric,
            triggerValue: score,
            source: "health-intelligence-revert",
          },
        });
      } catch (error) {
        notes += ` — Revert FAILED: ${error instanceof Error ? error.message : "unknown"}`;
      }
    }

    // Update the original adaptation with evaluation results
    await prisma.adaptationLog.update({
      where: { id: adaptation.id },
      data: {
        evaluatedAt: new Date(),
        effectivenessScore: score,
        evaluationNotes: notes,
        reverted: action === "reverted",
      },
    });

    result.evaluated++;
    result.details.push({
      id: adaptation.id,
      directiveKey: adaptation.directiveKey,
      score,
      action,
      notes,
    });
  }

  return result;
}

// ============================================================================
// METRIC LOOKUP — Get before/after averages for a metric
// ============================================================================

async function getMetricAverages(
  metricName: string,
  beforeStart: Date,
  beforeEnd: Date,
  afterStart: Date,
  afterEnd: Date
): Promise<{ beforeAvg: number; afterAvg: number; afterCount: number }> {
  // Map metric names to their CronLog sources
  const metricSources: Record<string, { jobName: string; metadataKey: string }> = {
    removal_success_rate: { jobName: "daily-standup", metadataKey: "removalsCompleted" },
    process_removals_duration: { jobName: "process-removals", metadataKey: "__duration__" },
    daily_cron_failures: { jobName: "daily-standup", metadataKey: "cronFailures" },
    process_removals_failures_per_day: { jobName: "process-removals", metadataKey: "__failed_count__" },
  };

  const source = metricSources[metricName];
  if (!source) {
    return { beforeAvg: 0, afterAvg: 0, afterCount: 0 };
  }

  // Special handling for duration and failure counts
  if (source.metadataKey === "__duration__") {
    return getDurationAverages(source.jobName, beforeStart, beforeEnd, afterStart, afterEnd);
  }
  if (source.metadataKey === "__failed_count__") {
    return getFailureCountAverages(source.jobName, beforeStart, beforeEnd, afterStart, afterEnd);
  }

  // Standard metadata field extraction
  const [beforeLogs, afterLogs] = await Promise.all([
    prisma.cronLog.findMany({
      where: { jobName: source.jobName, status: "SUCCESS", createdAt: { gte: beforeStart, lt: beforeEnd } },
      select: { metadata: true },
    }),
    prisma.cronLog.findMany({
      where: { jobName: source.jobName, status: "SUCCESS", createdAt: { gte: afterStart, lt: afterEnd } },
      select: { metadata: true },
    }),
  ]);

  const extractValues = (logs: Array<{ metadata: string | null }>): number[] => {
    return logs
      .map(l => {
        if (!l.metadata) return null;
        try {
          const meta = typeof l.metadata === "string" ? JSON.parse(l.metadata) : l.metadata;
          const val = Number(meta[source.metadataKey]);
          return isNaN(val) ? null : val;
        } catch {
          return null;
        }
      })
      .filter((v): v is number => v !== null);
  };

  const beforeVals = extractValues(beforeLogs);
  const afterVals = extractValues(afterLogs);

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  return {
    beforeAvg: avg(beforeVals),
    afterAvg: avg(afterVals),
    afterCount: afterVals.length,
  };
}

async function getDurationAverages(
  jobName: string,
  beforeStart: Date,
  beforeEnd: Date,
  afterStart: Date,
  afterEnd: Date
): Promise<{ beforeAvg: number; afterAvg: number; afterCount: number }> {
  const [beforeLogs, afterLogs] = await Promise.all([
    prisma.cronLog.findMany({
      where: { jobName, status: "SUCCESS", createdAt: { gte: beforeStart, lt: beforeEnd } },
      select: { duration: true },
    }),
    prisma.cronLog.findMany({
      where: { jobName, status: "SUCCESS", createdAt: { gte: afterStart, lt: afterEnd } },
      select: { duration: true },
    }),
  ]);

  const beforeVals = beforeLogs.filter(l => l.duration != null).map(l => l.duration!);
  const afterVals = afterLogs.filter(l => l.duration != null).map(l => l.duration!);

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  return { beforeAvg: avg(beforeVals), afterAvg: avg(afterVals), afterCount: afterVals.length };
}

async function getFailureCountAverages(
  jobName: string,
  beforeStart: Date,
  beforeEnd: Date,
  afterStart: Date,
  afterEnd: Date
): Promise<{ beforeAvg: number; afterAvg: number; afterCount: number }> {
  const [beforeCount, afterCount, beforeDays, afterDays] = await Promise.all([
    prisma.cronLog.count({
      where: { jobName, status: "FAILED", createdAt: { gte: beforeStart, lt: beforeEnd } },
    }),
    prisma.cronLog.count({
      where: { jobName, status: "FAILED", createdAt: { gte: afterStart, lt: afterEnd } },
    }),
    // Count unique days to normalize
    prisma.cronLog.findMany({
      where: { jobName, createdAt: { gte: beforeStart, lt: beforeEnd } },
      select: { createdAt: true },
      distinct: ["createdAt"],
    }),
    prisma.cronLog.findMany({
      where: { jobName, createdAt: { gte: afterStart, lt: afterEnd } },
      select: { createdAt: true },
      distinct: ["createdAt"],
    }),
  ]);

  const beforeDayCount = new Set(beforeDays.map(d => d.createdAt.toISOString().slice(0, 10))).size || 1;
  const afterDayCount = new Set(afterDays.map(d => d.createdAt.toISOString().slice(0, 10))).size || 1;

  return {
    beforeAvg: beforeCount / beforeDayCount,
    afterAvg: afterCount / afterDayCount,
    afterCount: afterDayCount,
  };
}
