/**
 * Agent System API - Health Status
 *
 * GET /api/agents/health - Get health status of all agents
 */

import { NextResponse } from "next/server";
import { getSystemHealth, getOrchestrator } from "@/lib/agents";
import { auth } from "@/lib/auth";
import { isAdmin, getEnvBasedRole } from "@/lib/admin";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = getEnvBasedRole(session.user.email || "");
    if (!isAdmin(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const health = await getSystemHealth();
    const orchestrator = getOrchestrator();
    const circuitBreakers = orchestrator.getCircuitBreakerStatus();

    // Convert Map to object for JSON serialization
    const circuitBreakerStatus: Record<string, unknown> = {};
    for (const [key, value] of circuitBreakers) {
      circuitBreakerStatus[key] = value;
    }

    // Determine overall system health for HTTP status code
    let httpStatus = 200;
    if (health.status === "UNHEALTHY") {
      httpStatus = 503; // Service Unavailable
    } else if (health.status === "DEGRADED") {
      httpStatus = 207; // Multi-Status (partial success)
    }

    return NextResponse.json(
      {
        success: health.status !== "UNHEALTHY",
        status: health.status,
        agents: health.agents,
        summary: health.summary,
        circuitBreakers: circuitBreakerStatus,
        timestamp: new Date().toISOString(),
      },
      { status: httpStatus }
    );
  } catch (error) {
    console.error("[API /agents/health] Error:", error);
    return NextResponse.json(
      {
        success: false,
        status: "UNHEALTHY",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
