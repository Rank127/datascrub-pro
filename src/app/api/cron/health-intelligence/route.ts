/**
 * Health Intelligence Cron — Daily 6:30 AM UTC
 *
 * 4-phase self-improving feedback loop:
 * 1. Trend Analysis — linear regression on 12 health metrics
 * 2. Self-Evaluation — score past adaptations, auto-revert failures
 * 3. Threshold Adaptation — 6 rules propose directive changes
 * 4. Quality Monitoring — 6 anti-pattern detectors
 *
 * Cost: $0.00/run — pure DB queries and arithmetic, zero AI calls.
 */

import { NextResponse } from "next/server";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";
import { logCronExecution } from "@/lib/cron-logger";
import {
  analyzeHealthTrends,
  proposeAdaptationsFromTrends,
  applyAdaptations,
  evaluatePastAdaptations,
  generateRuntimeQualityInsights,
} from "@/lib/health-intelligence";
import type { TrendAnalysis, AdaptationResult, EvaluationResult, QualityInsight } from "@/lib/health-intelligence";

export const maxDuration = 120;

const JOB_NAME = "health-intelligence";
const DEADLINE_MS = 100_000;

export async function GET(request: Request) {
  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return cronUnauthorizedResponse(authResult.reason);
  }

  const startTime = Date.now();

  try {
    let trends: TrendAnalysis[] = [];
    let adaptationResult: AdaptationResult = { proposed: [], applied: [], skippedCooldown: [] };
    let evaluationResult: EvaluationResult = { evaluated: 0, reverted: 0, details: [] };
    let qualityInsights: QualityInsight[] = [];

    // Phase 1: Trend Analysis
    const phase1Start = Date.now();
    try {
      trends = await analyzeHealthTrends();
      console.log(`[HealthIntelligence] Phase 1: Analyzed ${trends.length} metrics in ${Date.now() - phase1Start}ms`);
    } catch (error) {
      console.error("[HealthIntelligence] Phase 1 failed:", error instanceof Error ? error.message : error);
    }

    if (Date.now() - startTime > DEADLINE_MS) {
      return finalize(startTime, "PARTIAL", trends, adaptationResult, evaluationResult, qualityInsights, "Timed out after Phase 1");
    }

    // Phase 2: Self-Evaluation (check past adaptations)
    const phase2Start = Date.now();
    try {
      evaluationResult = await evaluatePastAdaptations();
      console.log(`[HealthIntelligence] Phase 2: Evaluated ${evaluationResult.evaluated} adaptations, reverted ${evaluationResult.reverted} in ${Date.now() - phase2Start}ms`);
    } catch (error) {
      console.error("[HealthIntelligence] Phase 2 failed:", error instanceof Error ? error.message : error);
    }

    if (Date.now() - startTime > DEADLINE_MS) {
      return finalize(startTime, "PARTIAL", trends, adaptationResult, evaluationResult, qualityInsights, "Timed out after Phase 2");
    }

    // Phase 3: Threshold Adaptation (propose + apply changes)
    const phase3Start = Date.now();
    try {
      const proposals = proposeAdaptationsFromTrends(trends);
      adaptationResult = await applyAdaptations(proposals);
      console.log(`[HealthIntelligence] Phase 3: ${adaptationResult.applied.length} adaptations applied, ${adaptationResult.skippedCooldown.length} on cooldown in ${Date.now() - phase3Start}ms`);
    } catch (error) {
      console.error("[HealthIntelligence] Phase 3 failed:", error instanceof Error ? error.message : error);
    }

    if (Date.now() - startTime > DEADLINE_MS) {
      return finalize(startTime, "PARTIAL", trends, adaptationResult, evaluationResult, qualityInsights, "Timed out after Phase 3");
    }

    // Phase 4: Quality Monitoring
    const phase4Start = Date.now();
    try {
      qualityInsights = await generateRuntimeQualityInsights();
      console.log(`[HealthIntelligence] Phase 4: ${qualityInsights.length} quality insights in ${Date.now() - phase4Start}ms`);
    } catch (error) {
      console.error("[HealthIntelligence] Phase 4 failed:", error instanceof Error ? error.message : error);
    }

    return finalize(startTime, "SUCCESS", trends, adaptationResult, evaluationResult, qualityInsights);
  } catch (error) {
    const duration = Date.now() - startTime;
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error("[HealthIntelligence] Fatal error:", message);

    await logCronExecution({
      jobName: JOB_NAME,
      status: "FAILED",
      duration,
      message,
    });

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

async function finalize(
  startTime: number,
  status: "SUCCESS" | "PARTIAL",
  trends: TrendAnalysis[],
  adaptationResult: AdaptationResult,
  evaluationResult: EvaluationResult,
  qualityInsights: QualityInsight[],
  partialReason?: string,
): Promise<Response> {
  const duration = Date.now() - startTime;

  const degrading = trends.filter(t => t.trend7d.direction === "degrading");
  const improving = trends.filter(t => t.trend7d.direction === "improving");
  const criticalInsights = qualityInsights.filter(i => i.severity === "CRITICAL");

  const message = [
    `${trends.length} trends analyzed`,
    `(${improving.length} improving, ${degrading.length} degrading)`,
    `${adaptationResult.applied.length} adaptations applied`,
    `${evaluationResult.evaluated} past evaluations (${evaluationResult.reverted} reverted)`,
    `${qualityInsights.length} quality insights (${criticalInsights.length} critical)`,
    partialReason ? `[${partialReason}]` : "",
  ].filter(Boolean).join(", ");

  await logCronExecution({
    jobName: JOB_NAME,
    status,
    duration,
    message,
    metadata: {
      trendsAnalyzed: trends.length,
      trendsImproving: improving.length,
      trendsDegrading: degrading.length,
      trendsStable: trends.filter(t => t.trend7d.direction === "stable").length,
      trendsInsufficient: trends.filter(t => t.trend7d.direction === "insufficient_data").length,
      adaptationsProposed: adaptationResult.proposed.length,
      adaptationsApplied: adaptationResult.applied.length,
      adaptationsSkippedCooldown: adaptationResult.skippedCooldown,
      adaptationKeys: adaptationResult.applied.map(a => a.directiveKey),
      pastEvaluated: evaluationResult.evaluated,
      pastReverted: evaluationResult.reverted,
      qualityInsights: qualityInsights.length,
      qualityCritical: criticalInsights.length,
      qualityWarnings: qualityInsights.filter(i => i.severity === "WARNING").length,
      degradingMetrics: degrading.map(t => ({
        metric: t.metric,
        slope: t.trend7d.normalizedSlope,
        latest: t.latestValue,
      })),
      criticalInsightMessages: criticalInsights.map(i => i.message),
    },
  });

  return NextResponse.json({
    success: true,
    status,
    duration,
    trends: {
      total: trends.length,
      improving: improving.length,
      degrading: degrading.length,
      stable: trends.filter(t => t.trend7d.direction === "stable").length,
      insufficientData: trends.filter(t => t.trend7d.direction === "insufficient_data").length,
    },
    adaptations: {
      proposed: adaptationResult.proposed.length,
      applied: adaptationResult.applied.length,
      skippedCooldown: adaptationResult.skippedCooldown,
    },
    evaluation: {
      checked: evaluationResult.evaluated,
      reverted: evaluationResult.reverted,
    },
    quality: {
      total: qualityInsights.length,
      critical: criticalInsights.length,
      warnings: qualityInsights.filter(i => i.severity === "WARNING").length,
    },
  });
}
