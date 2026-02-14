/**
 * Agent System API - Metrics Dashboard
 *
 * GET /api/agents/metrics - Get detailed metrics for all agents
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRegistry, getEventBus } from "@/lib/agents";
import { auth } from "@/lib/auth";
import { isAdmin, getEnvBasedRole } from "@/lib/admin";

interface AgentMetricsSummary {
  agentId: string;
  executions: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  };
  performance: {
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
  };
  ai: {
    tokensUsed: number;
    avgConfidence: number;
    fallbackRate: number;
    estimatedCost: number;
  };
  review: {
    humanReviewCount: number;
    humanReviewRate: number;
  };
}

/**
 * GET /api/agents/metrics - Get agent metrics
 *
 * Query params:
 * - period: "1h" | "24h" | "7d" | "30d" (default: "24h")
 * - agentId: string (optional, filter to specific agent)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = getEnvBasedRole(session.user.email || "");
    if (!isAdmin(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "24h";
    const agentIdFilter = searchParams.get("agentId");

    // Calculate time range
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case "1h":
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // 24h
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Build query conditions
    const where: Record<string, unknown> = {
      startedAt: { gte: startDate },
    };
    if (agentIdFilter) {
      where.agentId = agentIdFilter;
    }

    // Fetch executions from database
    let executions: Array<{
      agentId: string;
      status: string;
      duration: number | null;
      tokensUsed: number | null;
      confidence: number | null;
      usedFallback: boolean;
      needsHumanReview: boolean;
    }> = [];

    try {
      executions = await prisma.agentExecution.findMany({
        where,
        select: {
          agentId: true,
          status: true,
          duration: true,
          tokensUsed: true,
          confidence: true,
          usedFallback: true,
          needsHumanReview: true,
        },
      });
    } catch {
      // Table might not exist yet
      console.warn("[API /agents/metrics] AgentExecution table not available");
    }

    // Group by agent
    const agentMetrics: Record<string, AgentMetricsSummary> = {};

    for (const exec of executions) {
      if (!agentMetrics[exec.agentId]) {
        agentMetrics[exec.agentId] = {
          agentId: exec.agentId,
          executions: {
            total: 0,
            successful: 0,
            failed: 0,
            successRate: 0,
          },
          performance: {
            avgDuration: 0,
            minDuration: Infinity,
            maxDuration: 0,
          },
          ai: {
            tokensUsed: 0,
            avgConfidence: 0,
            fallbackRate: 0,
            estimatedCost: 0,
          },
          review: {
            humanReviewCount: 0,
            humanReviewRate: 0,
          },
        };
      }

      const metrics = agentMetrics[exec.agentId];
      metrics.executions.total++;

      if (exec.status === "COMPLETED") {
        metrics.executions.successful++;
      } else if (exec.status === "FAILED") {
        metrics.executions.failed++;
      }

      if (exec.duration) {
        metrics.performance.minDuration = Math.min(
          metrics.performance.minDuration,
          exec.duration
        );
        metrics.performance.maxDuration = Math.max(
          metrics.performance.maxDuration,
          exec.duration
        );
      }

      if (exec.tokensUsed) {
        metrics.ai.tokensUsed += exec.tokensUsed;
      }

      if (exec.usedFallback) {
        metrics.ai.fallbackRate++;
      }

      if (exec.needsHumanReview) {
        metrics.review.humanReviewCount++;
      }

      if (exec.confidence !== null) {
        metrics.ai.avgConfidence += exec.confidence;
      }
    }

    // Calculate averages and rates
    for (const metrics of Object.values(agentMetrics)) {
      const total = metrics.executions.total;
      if (total > 0) {
        metrics.executions.successRate =
          metrics.executions.successful / total;
        metrics.ai.fallbackRate = metrics.ai.fallbackRate / total;
        metrics.review.humanReviewRate =
          metrics.review.humanReviewCount / total;

        // Calculate average duration from executions
        const durationSum = executions
          .filter((e) => e.agentId === metrics.agentId && e.duration)
          .reduce((sum, e) => sum + (e.duration || 0), 0);
        const durationCount = executions.filter(
          (e) => e.agentId === metrics.agentId && e.duration
        ).length;
        metrics.performance.avgDuration =
          durationCount > 0 ? durationSum / durationCount : 0;

        // Calculate average confidence
        const confidenceExecs = executions.filter(
          (e) => e.agentId === metrics.agentId && e.confidence !== null
        );
        if (confidenceExecs.length > 0) {
          metrics.ai.avgConfidence =
            metrics.ai.avgConfidence / confidenceExecs.length;
        }

        // Estimate cost (Claude pricing: ~$3/1M input, ~$15/1M output tokens)
        metrics.ai.estimatedCost = (metrics.ai.tokensUsed / 1000000) * 9;
      }

      // Fix Infinity for minDuration
      if (metrics.performance.minDuration === Infinity) {
        metrics.performance.minDuration = 0;
      }
    }

    // Get event bus stats
    const eventBus = getEventBus();
    const eventStats = eventBus.getStats();

    // Get registry stats
    const registry = getRegistry();
    const registryStats = registry.getStats();

    return NextResponse.json({
      success: true,
      period,
      timeRange: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
      agents: Object.values(agentMetrics),
      totals: {
        executions: executions.length,
        successful: executions.filter((e) => e.status === "COMPLETED").length,
        failed: executions.filter((e) => e.status === "FAILED").length,
        tokensUsed: executions.reduce((sum, e) => sum + (e.tokensUsed || 0), 0),
        estimatedCost:
          (executions.reduce((sum, e) => sum + (e.tokensUsed || 0), 0) /
            1000000) *
          9,
      },
      events: eventStats,
      registry: registryStats,
    });
  } catch (error) {
    console.error("[API /agents/metrics] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
