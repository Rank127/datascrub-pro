/**
 * Agent System API - QA Reports
 *
 * GET /api/agents/qa/report - Get QA reports
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRegistry, getSystemHealth } from "@/lib/agents";

/**
 * GET /api/agents/qa/report - Get comprehensive QA report
 *
 * Query params:
 * - period: "24h" | "7d" | "30d" (default: "24h")
 * - format: "summary" | "detailed" (default: "summary")
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "24h";
    const format = searchParams.get("format") || "summary";

    // Calculate time range
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // 24h
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get current system health
    const health = await getSystemHealth();
    const registry = getRegistry();
    const stats = registry.getStats();

    // Get execution data from database
    let executionStats = {
      total: 0,
      successful: 0,
      failed: 0,
      avgDuration: 0,
      avgConfidence: 0,
      tokensUsed: 0,
      humanReviewRate: 0,
      fallbackRate: 0,
    };

    let agentBreakdown: Array<{
      agentId: string;
      executions: number;
      successRate: number;
      avgDuration: number;
      issues: string[];
    }> = [];

    try {
      const executions = await prisma.agentExecution.findMany({
        where: {
          startedAt: { gte: startDate },
        },
        select: {
          agentId: true,
          status: true,
          duration: true,
          confidence: true,
          tokensUsed: true,
          needsHumanReview: true,
          usedFallback: true,
          error: true,
        },
      });

      if (executions.length > 0) {
        executionStats.total = executions.length;
        executionStats.successful = executions.filter(
          (e) => e.status === "COMPLETED"
        ).length;
        executionStats.failed = executions.filter(
          (e) => e.status === "FAILED"
        ).length;
        executionStats.tokensUsed = executions.reduce(
          (sum, e) => sum + (e.tokensUsed || 0),
          0
        );

        const withDuration = executions.filter((e) => e.duration);
        executionStats.avgDuration =
          withDuration.length > 0
            ? withDuration.reduce((sum, e) => sum + (e.duration || 0), 0) /
              withDuration.length
            : 0;

        const withConfidence = executions.filter((e) => e.confidence !== null);
        executionStats.avgConfidence =
          withConfidence.length > 0
            ? withConfidence.reduce((sum, e) => sum + (e.confidence || 0), 0) /
              withConfidence.length
            : 0;

        executionStats.humanReviewRate =
          executions.filter((e) => e.needsHumanReview).length /
          executions.length;
        executionStats.fallbackRate =
          executions.filter((e) => e.usedFallback).length / executions.length;

        // Build agent breakdown
        const agentGroups: Record<
          string,
          { executions: number; successful: number; durations: number[]; errors: string[] }
        > = {};

        for (const exec of executions) {
          if (!agentGroups[exec.agentId]) {
            agentGroups[exec.agentId] = {
              executions: 0,
              successful: 0,
              durations: [],
              errors: [],
            };
          }

          agentGroups[exec.agentId].executions++;
          if (exec.status === "COMPLETED") {
            agentGroups[exec.agentId].successful++;
          }
          if (exec.duration) {
            agentGroups[exec.agentId].durations.push(exec.duration);
          }
          if (exec.error) {
            try {
              const errorData = JSON.parse(exec.error);
              if (errorData.message && !agentGroups[exec.agentId].errors.includes(errorData.message)) {
                agentGroups[exec.agentId].errors.push(errorData.message);
              }
            } catch {
              // Not valid JSON
            }
          }
        }

        agentBreakdown = Object.entries(agentGroups).map(([agentId, data]) => ({
          agentId,
          executions: data.executions,
          successRate: data.executions > 0 ? data.successful / data.executions : 0,
          avgDuration:
            data.durations.length > 0
              ? data.durations.reduce((a, b) => a + b, 0) / data.durations.length
              : 0,
          issues: data.errors.slice(0, 5), // Limit to 5 unique errors
        }));
      }
    } catch {
      console.warn("[API /agents/qa/report] AgentExecution table not available");
    }

    // Build report based on format
    if (format === "detailed") {
      return NextResponse.json({
        success: true,
        report: {
          generatedAt: now.toISOString(),
          period,
          timeRange: {
            start: startDate.toISOString(),
            end: now.toISOString(),
          },
          systemHealth: {
            status: health.status,
            summary: health.summary,
            agents: health.agents,
          },
          registryStats: stats,
          executionStats,
          agentBreakdown,
          recommendations: generateRecommendations(health, executionStats, agentBreakdown),
        },
      });
    }

    // Summary format
    return NextResponse.json({
      success: true,
      report: {
        generatedAt: now.toISOString(),
        period,
        systemHealth: health.status,
        healthSummary: health.summary,
        registryStats: {
          totalAgents: stats.totalAgents,
          enabledAgents: stats.enabledAgents,
          totalCapabilities: stats.totalCapabilities,
        },
        executionStats: {
          total: executionStats.total,
          successRate:
            executionStats.total > 0
              ? executionStats.successful / executionStats.total
              : 0,
          avgDuration: Math.round(executionStats.avgDuration),
          tokensUsed: executionStats.tokensUsed,
        },
        issues: agentBreakdown
          .filter((a) => a.issues.length > 0)
          .map((a) => ({
            agentId: a.agentId,
            issueCount: a.issues.length,
          })),
      },
    });
  } catch (error) {
    console.error("[API /agents/qa/report] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Generate recommendations based on health and execution data
 */
function generateRecommendations(
  health: Awaited<ReturnType<typeof getSystemHealth>>,
  executionStats: {
    total: number;
    successful: number;
    failed: number;
    avgDuration: number;
    avgConfidence: number;
    humanReviewRate: number;
    fallbackRate: number;
  },
  agentBreakdown: Array<{
    agentId: string;
    successRate: number;
    issues: string[];
  }>
): string[] {
  const recommendations: string[] = [];

  // System health recommendations
  if (health.status === "UNHEALTHY") {
    recommendations.push(
      "CRITICAL: System is unhealthy. Investigate failing agents immediately."
    );
  } else if (health.status === "DEGRADED") {
    recommendations.push(
      "WARNING: System is degraded. Some agents may not be performing optimally."
    );
  }

  // Check for agents with low success rates
  const lowSuccessAgents = agentBreakdown.filter((a) => a.successRate < 0.8);
  if (lowSuccessAgents.length > 0) {
    recommendations.push(
      `Review agents with low success rates: ${lowSuccessAgents.map((a) => a.agentId).join(", ")}`
    );
  }

  // Check high fallback rate
  if (executionStats.fallbackRate > 0.3) {
    recommendations.push(
      "High fallback rate detected. Verify AI availability and consider increasing model reliability."
    );
  }

  // Check high human review rate
  if (executionStats.humanReviewRate > 0.2) {
    recommendations.push(
      "High human review rate. Consider improving agent confidence or adjusting thresholds."
    );
  }

  // Check low confidence
  if (executionStats.avgConfidence > 0 && executionStats.avgConfidence < 0.7) {
    recommendations.push(
      "Low average confidence scores. Review prompts and consider prompt optimization."
    );
  }

  // Check slow performance
  if (executionStats.avgDuration > 10000) {
    recommendations.push(
      "Average execution time is high. Consider optimizing slow agents or implementing caching."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("All systems are operating within normal parameters.");
  }

  return recommendations;
}
