import { NextResponse } from "next/server";
import {
  getRemediationEngine,
  reportIssue,
  type DetectedIssue,
} from "@/lib/agents";

// Verify authorization
const CRON_SECRET = process.env.CRON_SECRET;

function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  if (!CRON_SECRET) return true; // No secret configured
  return authHeader === `Bearer ${CRON_SECRET}`;
}

/**
 * GET /api/agents/remediation
 * Get remediation engine status, active plans, and statistics
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const engine = getRemediationEngine();
    const stats = engine.getStats();
    const activePlans = engine.getActivePlans();
    const recentPlans = engine.getCompletedPlans(20);
    const recentIssues = engine.getIssueHistory(50);
    const rules = engine.getRules();

    return NextResponse.json({
      success: true,
      stats,
      activePlans: activePlans.map((plan) => ({
        id: plan.id,
        issueType: plan.issue.type,
        issueSeverity: plan.issue.severity,
        status: plan.status,
        actionCount: plan.actions.length,
        createdAt: plan.createdAt,
        startedAt: plan.startedAt,
      })),
      recentPlans: recentPlans.map((plan) => ({
        id: plan.id,
        issueType: plan.issue.type,
        issueSeverity: plan.issue.severity,
        status: plan.status,
        actionCount: plan.actions.length,
        completedAt: plan.completedAt,
        duration: plan.startedAt && plan.completedAt
          ? plan.completedAt.getTime() - plan.startedAt.getTime()
          : null,
      })),
      recentIssues: recentIssues.slice(-20).map((issue) => ({
        id: issue.id,
        type: issue.type,
        severity: issue.severity,
        description: issue.description.substring(0, 100),
        url: issue.affectedResource,
        canAutoRemediate: issue.canAutoRemediate,
        detectedAt: issue.detectedAt,
      })),
      rules: rules.map((rule) => ({
        id: rule.id,
        pattern: rule.issueTypePattern.toString(),
        severityLevels: rule.severityLevels,
        autoRemediate: rule.autoRemediate,
        enabled: rule.enabled,
      })),
    });
  } catch (error) {
    console.error("[Remediation API] Error:", error);
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
 * POST /api/agents/remediation
 * Actions:
 * - report: Report a new issue for remediation
 * - approve: Approve a pending remediation plan
 * - reject: Reject a pending remediation plan
 * - enable-rule: Enable a remediation rule
 * - disable-rule: Disable a remediation rule
 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, ...params } = body;

    const engine = getRemediationEngine();

    switch (action) {
      case "report": {
        // Report a new issue for remediation
        const issue: Omit<DetectedIssue, "id" | "detectedAt"> = {
          type: params.type,
          severity: params.severity || "medium",
          description: params.description,
          sourceAgentId: params.sourceAgentId || "api",
          affectedResource: params.url,
          details: params.details,
          canAutoRemediate: params.canAutoRemediate ?? true,
        };

        const plan = await reportIssue(issue);

        return NextResponse.json({
          success: true,
          message: plan
            ? `Issue reported, remediation plan created: ${plan.id}`
            : "Issue reported, no matching remediation rule found",
          planId: plan?.id,
        });
      }

      case "approve": {
        // Approve a pending plan
        const { planId } = params;
        if (!planId) {
          return NextResponse.json(
            { error: "planId is required" },
            { status: 400 }
          );
        }

        await engine.approvePlan(planId);

        return NextResponse.json({
          success: true,
          message: `Plan ${planId} approved and execution started`,
        });
      }

      case "reject": {
        // Reject a pending plan
        const { planId, reason } = params;
        if (!planId) {
          return NextResponse.json(
            { error: "planId is required" },
            { status: 400 }
          );
        }

        engine.rejectPlan(planId, reason);

        return NextResponse.json({
          success: true,
          message: `Plan ${planId} rejected`,
        });
      }

      case "enable-rule": {
        const { ruleId } = params;
        if (!ruleId) {
          return NextResponse.json(
            { error: "ruleId is required" },
            { status: 400 }
          );
        }

        engine.setRuleEnabled(ruleId, true);

        return NextResponse.json({
          success: true,
          message: `Rule ${ruleId} enabled`,
        });
      }

      case "disable-rule": {
        const { ruleId } = params;
        if (!ruleId) {
          return NextResponse.json(
            { error: "ruleId is required" },
            { status: 400 }
          );
        }

        engine.setRuleEnabled(ruleId, false);

        return NextResponse.json({
          success: true,
          message: `Rule ${ruleId} disabled`,
        });
      }

      default:
        return NextResponse.json(
          {
            error: `Unknown action: ${action}`,
            availableActions: [
              "report",
              "approve",
              "reject",
              "enable-rule",
              "disable-rule",
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[Remediation API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
