/**
 * Agent System API - Orchestrator Endpoint
 *
 * POST /api/agents/orchestrate - Execute actions and workflows through the orchestrator
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/admin";
import {
  getOrchestrator,
  orchestrate,
  InvocationTypes,
} from "@/lib/agents";
import { nanoid } from "nanoid";

/**
 * POST /api/agents/orchestrate - Execute through orchestrator
 *
 * Body:
 * {
 *   action: string;         // Required: action or workflow to execute
 *   input: unknown;         // Required: input data
 *   context?: {             // Optional: execution context
 *     userId?: string;
 *     priority?: string;
 *     preferAI?: boolean;
 *     metadata?: object;
 *   }
 *   workflow?: {            // Optional: workflow options
 *     parallel?: boolean;
 *     stopOnError?: boolean;
 *     timeout?: number;
 *   }
 * }
 *
 * Examples:
 * - Action: { action: "removal.batch", input: { batchSize: 100 } }
 * - Workflow: { action: "workflow.full-removal-pipeline", input: { exposureId: "xyz" } }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!checkPermission(session.user.email, (session.user as { role?: string }).role, "manage_system_config")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, input, context: contextOverrides, workflow: workflowOptions } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Missing required field: action" },
        { status: 400 }
      );
    }

    // Determine if this is a workflow execution
    const isWorkflow = action.startsWith("workflow.") || workflowOptions;

    // Build the request
    const orchestratorRequest = {
      action,
      input: input || {},
      context: {
        requestId: nanoid(),
        invocationType: InvocationTypes.ON_DEMAND,
        ...contextOverrides,
      },
      workflow: workflowOptions,
    };

    // Execute through orchestrator
    const response = await orchestrate(orchestratorRequest);

    return NextResponse.json({
      success: response.success,
      results: response.results.map((r) => ({
        success: r.success,
        data: r.data,
        confidence: r.confidence,
        needsHumanReview: r.needsHumanReview,
        warnings: r.warnings,
        error: r.error,
      })),
      metadata: response.metadata,
      errors: response.errors,
      isWorkflow,
    });
  } catch (error) {
    console.error("[API /agents/orchestrate] Error:", error);
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
 * GET /api/agents/orchestrate - Get available workflows
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!checkPermission(session.user.email, (session.user as { role?: string }).role, "manage_system_config")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const orchestrator = getOrchestrator();
    const workflowEngine = orchestrator.getWorkflowEngine();
    const workflows = workflowEngine.getAllWorkflows();

    return NextResponse.json({
      success: true,
      workflows: workflows.map((w) => ({
        id: w.id,
        name: w.name,
        description: w.description,
        enabled: w.enabled,
        version: w.version,
        steps: w.steps.map((s) => ({
          id: s.id,
          name: s.name,
          action: s.action,
          required: s.required ?? true,
        })),
      })),
    });
  } catch (error) {
    console.error("[API /agents/orchestrate] Error listing workflows:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
