/**
 * Health Intelligence — Trend Analyzer
 *
 * Computes linear regression on 12 health metrics extracted from CronLog
 * metadata and live DB aggregates. Pure DB queries + arithmetic — $0 AI cost.
 */

import { prisma } from "@/lib/db";

// ============================================================================
// TYPES
// ============================================================================

export type TrendDirection = "improving" | "degrading" | "stable" | "insufficient_data";

export type MetricCategory = "agent" | "cron" | "removal" | "scan" | "broker";

export interface TrendResult {
  slope: number;           // Raw slope
  normalizedSlope: number; // Slope / mean(y) — comparable across metrics
  r2: number;              // Coefficient of determination (0-1)
  direction: TrendDirection;
  dataPoints: number;
}

export interface TrendAnalysis {
  metric: string;
  category: MetricCategory;
  trend7d: TrendResult;
  trend14d: TrendResult;
  latestValue: number;
  meanValue: number;
  description: string;    // Human-readable summary
}

export interface DataPoint {
  date: Date;
  value: number;
}

// ============================================================================
// TREND COMPUTATION — Linear regression with R²
// ============================================================================

export function computeTrendDirection(series: DataPoint[]): TrendResult {
  if (series.length < 3) {
    return { slope: 0, normalizedSlope: 0, r2: 0, direction: "insufficient_data", dataPoints: series.length };
  }

  const n = series.length;
  // Convert dates to day offsets for regression
  const minTime = series[0].date.getTime();
  const xs = series.map(p => (p.date.getTime() - minTime) / (1000 * 60 * 60 * 24));
  const ys = series.map(p => p.value);

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) {
    return { slope: 0, normalizedSlope: 0, r2: 0, direction: "stable", dataPoints: n };
  }

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // R² calculation
  const meanY = sumY / n;
  const ssRes = ys.reduce((acc, y, i) => acc + (y - (intercept + slope * xs[i])) ** 2, 0);
  const ssTot = ys.reduce((acc, y) => acc + (y - meanY) ** 2, 0);
  const r2 = ssTot === 0 ? 0 : Math.max(0, 1 - ssRes / ssTot);

  // Normalize slope by mean to make it comparable across metrics
  const normalizedSlope = meanY === 0 ? 0 : slope / Math.abs(meanY);

  let direction: TrendDirection;
  if (Math.abs(normalizedSlope) < 0.05) {
    direction = "stable";
  } else {
    direction = normalizedSlope > 0 ? "improving" : "degrading";
  }

  return { slope, normalizedSlope, r2, direction, dataPoints: n };
}

// ============================================================================
// METRIC EXTRACTION — Parse CronLog metadata into time series
// ============================================================================

interface CronLogRow {
  jobName: string;
  createdAt: Date;
  metadata: string | null;
  duration: number | null;
  status: string;
}

function parseCronLogMetadata(row: CronLogRow): Record<string, unknown> | null {
  if (!row.metadata) return null;
  try {
    return typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractMetricFromLogs(
  logs: CronLogRow[],
  jobName: string,
  metadataKey: string,
  filterFn?: (row: CronLogRow) => boolean
): DataPoint[] {
  return logs
    .filter(l => l.jobName === jobName && l.status === "SUCCESS" && (!filterFn || filterFn(l)))
    .map(l => {
      const meta = parseCronLogMetadata(l);
      if (!meta || meta[metadataKey] === undefined) return null;
      const value = Number(meta[metadataKey]);
      if (isNaN(value)) return null;
      return { date: l.createdAt, value };
    })
    .filter((p): p is DataPoint => p !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

export async function analyzeHealthTrends(): Promise<TrendAnalysis[]> {
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Fetch all CronLog entries for the last 14 days (one query)
  const allLogs = await prisma.cronLog.findMany({
    where: { createdAt: { gte: fourteenDaysAgo } },
    select: {
      jobName: true,
      createdAt: true,
      metadata: true,
      duration: true,
      status: true,
    },
    orderBy: { createdAt: "asc" },
  }) as CronLogRow[];

  // Live DB aggregate for current-point metrics
  const pendingCount = await prisma.removalRequest.count({ where: { status: "PENDING" } });

  const analyses: TrendAnalysis[] = [];

  // --- Metric 1: Healthy Agent Count ---
  const agentHealthSeries = extractMetricFromLogs(allLogs, "daily-standup", "agentsHealthy");
  if (agentHealthSeries.length > 0) {
    analyses.push(buildAnalysis(
      "healthy_agent_count", "agent", agentHealthSeries, sevenDaysAgo,
      "Number of agents in HEALTHY status"
    ));
  }

  // --- Metric 2: Daily Cron Failures (inverted — lower is better) ---
  const cronFailSeries = extractMetricFromLogs(allLogs, "daily-standup", "cronFailures");
  if (cronFailSeries.length > 0) {
    const inverted = cronFailSeries.map(p => ({ ...p, value: -p.value }));
    const analysis = buildAnalysis(
      "daily_cron_failures", "cron", inverted, sevenDaysAgo,
      "Daily cron failures (inverted: improving means fewer failures)"
    );
    // Fix latest/mean to show actual (non-inverted) values
    analysis.latestValue = cronFailSeries[cronFailSeries.length - 1].value;
    analysis.meanValue = cronFailSeries.reduce((s, p) => s + p.value, 0) / cronFailSeries.length;
    analyses.push(analysis);
  }

  // --- Metric 3: Removal Success Rate ---
  // Calculate daily success rates from removal request data
  const removalSuccessRateSeries = await computeRemovalSuccessRateSeries(fourteenDaysAgo);
  if (removalSuccessRateSeries.length > 0) {
    analyses.push(buildAnalysis(
      "removal_success_rate", "removal", removalSuccessRateSeries, sevenDaysAgo,
      "Removal request completion rate (COMPLETED / (COMPLETED + FAILED))"
    ));
  }

  // --- Metric 4: Removals Completed/Day ---
  const removalsCompletedSeries = extractMetricFromLogs(allLogs, "daily-standup", "removalsCompleted");
  if (removalsCompletedSeries.length > 0) {
    analyses.push(buildAnalysis(
      "removals_completed_per_day", "removal", removalsCompletedSeries, sevenDaysAgo,
      "Number of removals completed in each 24h reporting period"
    ));
  }

  // --- Metric 5: Scans Completed/Day ---
  const scansCompletedSeries = extractMetricFromLogs(allLogs, "daily-standup", "scansCompleted");
  if (scansCompletedSeries.length > 0) {
    analyses.push(buildAnalysis(
      "scans_completed_per_day", "scan", scansCompletedSeries, sevenDaysAgo,
      "Number of scans completed in each 24h reporting period"
    ));
  }

  // --- Metric 6: AI Cost/Day ---
  const aiCostSeries = extractMetricFromLogs(allLogs, "daily-standup", "aiCost");
  if (aiCostSeries.length > 0) {
    // For cost, lower is better — invert for trend direction
    const inverted = aiCostSeries.map(p => ({ ...p, value: -p.value }));
    const analysis = buildAnalysis(
      "ai_cost_per_day", "agent", inverted, sevenDaysAgo,
      "Daily AI API cost (inverted: improving means lower cost)"
    );
    analysis.latestValue = aiCostSeries[aiCostSeries.length - 1].value;
    analysis.meanValue = aiCostSeries.reduce((s, p) => s + p.value, 0) / aiCostSeries.length;
    analyses.push(analysis);
  }

  // --- Metric 7: Process Removals Avg Duration ---
  const processRemovalLogs = allLogs.filter(
    l => l.jobName === "process-removals" && l.status === "SUCCESS" && l.duration != null
  );
  const durationSeries: DataPoint[] = processRemovalLogs.map(l => ({
    date: l.createdAt,
    value: l.duration!,
  }));
  if (durationSeries.length > 0) {
    // Lower duration is better — invert
    const inverted = durationSeries.map(p => ({ ...p, value: -p.value }));
    const analysis = buildAnalysis(
      "process_removals_duration", "cron", inverted, sevenDaysAgo,
      "Process-removals cron execution time in ms (inverted: improving means faster)"
    );
    analysis.latestValue = durationSeries[durationSeries.length - 1].value;
    analysis.meanValue = durationSeries.reduce((s, p) => s + p.value, 0) / durationSeries.length;
    analyses.push(analysis);
  }

  // --- Metric 8: Health Check Passes ---
  const healthCheckLogs = allLogs.filter(l => l.jobName === "health-check" && l.status === "SUCCESS");
  const passedSeries: DataPoint[] = healthCheckLogs
    .map(l => {
      const meta = parseCronLogMetadata(l);
      if (!meta || meta.passed === undefined) return null;
      return { date: l.createdAt, value: Number(meta.passed) };
    })
    .filter((p): p is DataPoint => p !== null);
  if (passedSeries.length > 0) {
    analyses.push(buildAnalysis(
      "health_check_passes", "cron", passedSeries, sevenDaysAgo,
      "Number of health check tests passing"
    ));
  }

  // --- Metric 9: Process Removals Failures/Day ---
  const prFailLogs = allLogs.filter(l => l.jobName === "process-removals" && l.status === "FAILED");
  // Group by day
  const failsByDay = groupByDay(prFailLogs.map(l => ({ date: l.createdAt, value: 1 })));
  if (failsByDay.length > 0) {
    // Lower is better — invert
    const inverted = failsByDay.map(p => ({ ...p, value: -p.value }));
    const analysis = buildAnalysis(
      "process_removals_failures_per_day", "removal", inverted, sevenDaysAgo,
      "Process-removals cron failures per day (inverted: improving means fewer failures)"
    );
    analysis.latestValue = failsByDay[failsByDay.length - 1].value;
    analysis.meanValue = failsByDay.reduce((s, p) => s + p.value, 0) / failsByDay.length;
    analyses.push(analysis);
  }

  // --- Metric 10: Lessons Extracted/Day ---
  const lessonsSeries = extractMetricFromLogs(allLogs, "agent-learning", "lessonsExtracted");
  if (lessonsSeries.length > 0) {
    analyses.push(buildAnalysis(
      "lessons_extracted_per_day", "agent", lessonsSeries, sevenDaysAgo,
      "Number of learning lessons extracted per day"
    ));
  }

  // --- Metric 11: Pending Queue Size (single snapshot) ---
  analyses.push({
    metric: "pending_queue_size",
    category: "removal",
    trend7d: { slope: 0, normalizedSlope: 0, r2: 0, direction: "insufficient_data", dataPoints: 1 },
    trend14d: { slope: 0, normalizedSlope: 0, r2: 0, direction: "insufficient_data", dataPoints: 1 },
    latestValue: pendingCount,
    meanValue: pendingCount,
    description: "Current pending removal queue size (snapshot — trend available once standup logs removalsPending)",
  });

  // --- Metric 12: Broker False Positive Rate ---
  const fpRateSeries = await computeBrokerFPRateSeries(fourteenDaysAgo);
  if (fpRateSeries.length > 0) {
    // Lower FP rate is better — invert
    const inverted = fpRateSeries.map(p => ({ ...p, value: -p.value }));
    const analysis = buildAnalysis(
      "broker_false_positive_rate", "broker", inverted, sevenDaysAgo,
      "Broker false positive rate from operations agent outcomes (inverted: improving means lower FP)"
    );
    analysis.latestValue = fpRateSeries[fpRateSeries.length - 1].value;
    analysis.meanValue = fpRateSeries.reduce((s, p) => s + p.value, 0) / fpRateSeries.length;
    analyses.push(analysis);
  }

  return analyses;
}

// ============================================================================
// HELPERS
// ============================================================================

function buildAnalysis(
  metric: string,
  category: MetricCategory,
  series: DataPoint[],
  sevenDaysAgo: Date,
  description: string
): TrendAnalysis {
  const series7d = series.filter(p => p.date >= sevenDaysAgo);
  const trend7d = computeTrendDirection(series7d);
  const trend14d = computeTrendDirection(series);

  const latest = series[series.length - 1]?.value ?? 0;
  const mean = series.length > 0
    ? series.reduce((s, p) => s + p.value, 0) / series.length
    : 0;

  return { metric, category, trend7d, trend14d, latestValue: latest, meanValue: mean, description };
}

function groupByDay(points: DataPoint[]): DataPoint[] {
  const byDay = new Map<string, { date: Date; total: number }>();
  for (const p of points) {
    const key = p.date.toISOString().slice(0, 10);
    const existing = byDay.get(key);
    if (existing) {
      existing.total += p.value;
    } else {
      byDay.set(key, { date: new Date(key), total: p.value });
    }
  }
  return Array.from(byDay.values())
    .map(d => ({ date: d.date, value: d.total }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

async function computeRemovalSuccessRateSeries(since: Date): Promise<DataPoint[]> {
  try {
    const dailyStats = await prisma.$queryRaw<Array<{
      day: Date;
      completed: bigint;
      failed: bigint;
    }>>`
      SELECT
        DATE_TRUNC('day', "updatedAt") as day,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed
      FROM "RemovalRequest"
      WHERE "updatedAt" >= ${since}
        AND status IN ('COMPLETED', 'FAILED')
      GROUP BY DATE_TRUNC('day', "updatedAt")
      ORDER BY day ASC
    `;

    return dailyStats
      .map(row => {
        const total = Number(row.completed) + Number(row.failed);
        if (total === 0) return null;
        return {
          date: new Date(row.day),
          value: Number(row.completed) / total,
        };
      })
      .filter((p): p is DataPoint => p !== null);
  } catch {
    return [];
  }
}

async function computeBrokerFPRateSeries(since: Date): Promise<DataPoint[]> {
  try {
    const dailyFP = await prisma.$queryRaw<Array<{
      day: Date;
      total: bigint;
      false_positives: bigint;
    }>>`
      SELECT
        DATE_TRUNC('day', "createdAt") as day,
        COUNT(*) as total,
        COUNT(CASE WHEN "outcomeType" = 'REJECTED' THEN 1 END) as false_positives
      FROM "AgentOutcome"
      WHERE "agentId" = 'operations-agent'
        AND "createdAt" >= ${since}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY day ASC
    `;

    return dailyFP
      .map(row => {
        const total = Number(row.total);
        if (total === 0) return null;
        return {
          date: new Date(row.day),
          value: Number(row.false_positives) / total,
        };
      })
      .filter((p): p is DataPoint => p !== null);
  } catch {
    return [];
  }
}
