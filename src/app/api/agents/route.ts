/**
 * Agent System API - List All Agents
 *
 * GET /api/agents - List all registered agents and their capabilities
 */

import { NextResponse } from "next/server";
import { getRegistry, getSystemStats } from "@/lib/agents";
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

    const registry = getRegistry();
    const summaries = registry.getAgentSummaries();
    const stats = getSystemStats();

    return NextResponse.json({
      success: true,
      agents: summaries,
      stats: {
        totalAgents: stats.registry.totalAgents,
        enabledAgents: stats.registry.enabledAgents,
        byDomain: stats.registry.byDomain,
        byMode: stats.registry.byMode,
        totalCapabilities: stats.registry.totalCapabilities,
      },
    });
  } catch (error) {
    console.error("[API /agents] Error listing agents:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
