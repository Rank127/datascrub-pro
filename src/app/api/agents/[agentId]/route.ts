/**
 * Agent System API - Direct Agent Invocation
 *
 * GET /api/agents/[agentId] - Get agent details
 * POST /api/agents/[agentId] - Execute an agent capability
 */

import { NextRequest, NextResponse } from "next/server";
import { getRegistry, createAgentContext, InvocationTypes } from "@/lib/agents";
import { nanoid } from "nanoid";

interface RouteParams {
  params: Promise<{
    agentId: string;
  }>;
}

/**
 * GET /api/agents/[agentId] - Get agent details and health
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { agentId } = await params;

  try {
    const registry = getRegistry();
    const agent = registry.getAgent(agentId);

    if (!agent) {
      return NextResponse.json(
        { success: false, error: `Agent '${agentId}' not found` },
        { status: 404 }
      );
    }

    const config = registry.getAgentConfig(agentId);
    const health = await agent.getHealth();

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        domain: agent.domain,
        mode: agent.mode,
        version: agent.version,
        description: agent.description,
        capabilities: agent.capabilities,
        enabled: config?.enabled ?? true,
      },
      health,
    });
  } catch (error) {
    console.error(`[API /agents/${agentId}] Error:`, error);
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
 * POST /api/agents/[agentId] - Execute an agent capability
 *
 * Body:
 * {
 *   capability: string;     // Required: capability to execute
 *   input: unknown;         // Required: input for the capability
 *   context?: {             // Optional: execution context
 *     userId?: string;
 *     priority?: string;
 *     preferAI?: boolean;
 *     metadata?: object;
 *   }
 * }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { agentId } = await params;

  try {
    const body = await request.json();
    const { capability, input, context: contextOverrides } = body;

    if (!capability) {
      return NextResponse.json(
        { success: false, error: "Missing required field: capability" },
        { status: 400 }
      );
    }

    const registry = getRegistry();
    const agent = registry.getAgent(agentId);

    if (!agent) {
      return NextResponse.json(
        { success: false, error: `Agent '${agentId}' not found` },
        { status: 404 }
      );
    }

    // Check if agent is available
    const available = await agent.isAvailable();
    if (!available) {
      return NextResponse.json(
        { success: false, error: `Agent '${agentId}' is not available` },
        { status: 503 }
      );
    }

    // Create execution context
    const context = createAgentContext({
      requestId: nanoid(),
      invocationType: InvocationTypes.ON_DEMAND,
      ...contextOverrides,
    });

    // Execute the capability
    const result = await agent.execute(capability, input, context);

    return NextResponse.json({
      success: result.success,
      result: {
        data: result.data,
        confidence: result.confidence,
        needsHumanReview: result.needsHumanReview,
        managerReviewItems: result.managerReviewItems,
        suggestedActions: result.suggestedActions,
        warnings: result.warnings,
      },
      metadata: result.metadata,
      error: result.error,
    });
  } catch (error) {
    console.error(`[API /agents/${agentId}] Execution error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
