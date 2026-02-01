/**
 * Agent System API - QA Endpoint
 *
 * POST /api/agents/qa - Trigger QA runs
 * GET /api/agents/qa - Get QA status
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getRegistry,
  orchestrate,
  InvocationTypes,
  getSystemHealth,
} from "@/lib/agents";
import { nanoid } from "nanoid";

/**
 * POST /api/agents/qa - Trigger QA validation
 *
 * Body:
 * {
 *   type: "validate" | "regression" | "full";  // Type of QA run
 *   agentId?: string;                          // Optional: validate specific agent
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = "validate", agentId } = body;

    if (type === "full") {
      // Run full QA suite workflow
      const response = await orchestrate({
        action: "workflow.qa-full-suite",
        input: { validateAll: true },
        context: {
          requestId: nanoid(),
          invocationType: InvocationTypes.MANUAL,
        },
      });

      return NextResponse.json({
        success: response.success,
        type: "full",
        results: response.results,
        metadata: response.metadata,
        errors: response.errors,
      });
    }

    if (type === "regression") {
      // Run regression tests
      const response = await orchestrate({
        action: "qa.regression",
        input: { agentId },
        context: {
          requestId: nanoid(),
          invocationType: InvocationTypes.MANUAL,
        },
      });

      return NextResponse.json({
        success: response.success,
        type: "regression",
        results: response.results,
        metadata: response.metadata,
        errors: response.errors,
      });
    }

    // Default: validate agents
    const registry = getRegistry();
    const agents = agentId
      ? [registry.getAgent(agentId)].filter(Boolean)
      : registry.getAllAgents();

    const validationResults = await Promise.all(
      agents.map(async (agent) => {
        if (!agent) return null;

        try {
          const health = await agent.getHealth();
          const isAvailable = await agent.isAvailable();

          return {
            agentId: agent.id,
            name: agent.name,
            status: health.status,
            isAvailable,
            consecutiveFailures: health.consecutiveFailures,
            aiAvailable: health.aiAvailable,
            capabilityCount: agent.capabilities.length,
            issues: health.errorMessage ? [health.errorMessage] : [],
          };
        } catch (error) {
          return {
            agentId: agent.id,
            name: agent.name,
            status: "ERROR",
            isAvailable: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    const results = validationResults.filter(Boolean);
    const healthyCount = results.filter(
      (r) => r?.status === "HEALTHY"
    ).length;
    const degradedCount = results.filter(
      (r) => r?.status === "DEGRADED"
    ).length;
    const unhealthyCount = results.filter(
      (r) => r?.status === "UNHEALTHY" || r?.status === "ERROR"
    ).length;

    return NextResponse.json({
      success: unhealthyCount === 0,
      type: "validate",
      summary: {
        total: results.length,
        healthy: healthyCount,
        degraded: degradedCount,
        unhealthy: unhealthyCount,
      },
      results,
    });
  } catch (error) {
    console.error("[API /agents/qa] Error:", error);
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
 * GET /api/agents/qa - Get current QA status
 */
export async function GET() {
  try {
    const health = await getSystemHealth();
    const registry = getRegistry();
    const stats = registry.getStats();

    // Build capability coverage report
    const agents = registry.getAllAgents();
    const capabilityCoverage = agents.map((agent) => ({
      agentId: agent.id,
      capabilities: agent.capabilities.map((c) => ({
        id: c.id,
        name: c.name,
        requiresAI: c.requiresAI,
        supportsBatch: c.supportsBatch,
      })),
    }));

    return NextResponse.json({
      success: true,
      systemHealth: health.status,
      summary: health.summary,
      stats: {
        totalAgents: stats.totalAgents,
        enabledAgents: stats.enabledAgents,
        totalCapabilities: stats.totalCapabilities,
        byDomain: stats.byDomain,
        byMode: stats.byMode,
      },
      capabilityCoverage,
      lastChecked: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API /agents/qa] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
