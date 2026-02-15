/**
 * Customer Success Agent
 *
 * Handles customer success operations including:
 * - User health scoring
 * - Proactive outreach
 * - Milestone tracking and celebrations
 * - At-risk user detection
 */

import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";
import { BaseAgent, createAgentContext } from "../base-agent";
import {
  AgentCapability,
  AgentContext,
  AgentDomains,
  AgentModes,
  AgentResult,
  InvocationTypes,
} from "../types";
import { registerAgent } from "../registry";

// ============================================================================
// CONSTANTS
// ============================================================================

const AGENT_ID = "success-agent";
const AGENT_VERSION = "1.0.0";

// ============================================================================
// TYPES
// ============================================================================

interface HealthScoreInput {
  userId?: string;
  limit?: number;
}

interface HealthScoreResult {
  scored: number;
  scores: Array<{
    userId: string;
    email: string;
    healthScore: number; // 0-100
    healthStatus: "THRIVING" | "HEALTHY" | "AT_RISK" | "CRITICAL";
    factors: Array<{
      factor: string;
      score: number;
      weight: number;
    }>;
    recommendations: string[];
  }>;
  summary: {
    thriving: number;
    healthy: number;
    atRisk: number;
    critical: number;
  };
}

interface ProactiveOutreachInput {
  trigger?: "milestone" | "at_risk" | "inactive" | "all";
  limit?: number;
}

interface ProactiveOutreachResult {
  identified: number;
  outreachQueue: Array<{
    userId: string;
    email: string;
    reason: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    suggestedAction: string;
    suggestedMessage?: string;
  }>;
}

interface MilestoneInput {
  userId?: string;
}

interface MilestoneResult {
  checked: number;
  milestones: Array<{
    userId: string;
    email: string;
    milestone: string;
    achievedAt: string;
    celebrationSent: boolean;
  }>;
  upcoming: Array<{
    userId: string;
    milestone: string;
    progressPercent: number;
  }>;
}

interface AtRiskInput {
  threshold?: number; // Health score threshold
  limit?: number;
}

interface AtRiskResult {
  analyzed: number;
  atRiskUsers: Array<{
    userId: string;
    email: string;
    healthScore: number;
    daysUntilRenewal?: number;
    riskFactors: string[];
    interventionSuggestion: string;
    urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }>;
  interventionPlan: string[];
}

// ============================================================================
// CUSTOMER SUCCESS AGENT CLASS
// ============================================================================

class SuccessAgent extends BaseAgent {
  readonly id = AGENT_ID;
  readonly name = "Customer Success Agent";
  readonly domain = AgentDomains.CUSTOMER_SUCCESS;
  readonly mode = AgentModes.HYBRID;
  readonly version = AGENT_VERSION;
  readonly description =
    "Monitors user health, triggers proactive outreach, celebrates milestones, and identifies at-risk users";

  readonly capabilities: AgentCapability[] = [
    {
      id: "calculate-health",
      name: "Calculate Health Scores",
      description: "Calculate customer health scores based on engagement",
      requiresAI: false,
      supportsBatch: true,
    },
    {
      id: "proactive-outreach",
      name: "Identify Outreach Opportunities",
      description: "Identify users who would benefit from proactive contact",
      requiresAI: true,
      estimatedTokens: 400,
    },
    {
      id: "track-milestones",
      name: "Track Milestones",
      description: "Track and celebrate user milestones",
      requiresAI: false,
      supportsBatch: true,
    },
    {
      id: "detect-at-risk",
      name: "Detect At-Risk Users",
      description: "Identify users at risk of churning",
      requiresAI: true,
      estimatedTokens: 500,
    },
  ];

  protected getSystemPrompt(): string {
    return `You are the Customer Success Agent for GhostMyData. Your role is to ensure customers are successful with the platform by monitoring their health, identifying opportunities for proactive outreach, celebrating their milestones, and intervening when users show signs of disengagement. Be helpful, empathetic, and focused on customer value.`;
  }

  protected registerHandlers(): void {
    this.handlers.set("calculate-health", this.handleCalculateHealth.bind(this));
    this.handlers.set("proactive-outreach", this.handleProactiveOutreach.bind(this));
    this.handlers.set("track-milestones", this.handleTrackMilestones.bind(this));
    this.handlers.set("detect-at-risk", this.handleDetectAtRisk.bind(this));
  }

  private async handleCalculateHealth(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<HealthScoreResult>> {
    const startTime = Date.now();
    const { userId, limit = 100 } = input as HealthScoreInput;

    try {
      const users = await prisma.user.findMany({
        where: userId ? { id: userId } : {},
        take: limit,
        include: {
          _count: {
            select: {
              scans: true,
              exposures: true,
              removalRequests: true,
            },
          },
          subscription: {
            select: {
              status: true,
              stripeCurrentPeriodEnd: true,
            },
          },
        },
      });

      const scores: HealthScoreResult["scores"] = [];
      const summary = { thriving: 0, healthy: 0, atRisk: 0, critical: 0 };

      for (const user of users) {
        const factors: HealthScoreResult["scores"][0]["factors"] = [];

        // Factor 1: Recent activity (weight: 30%)
        const daysSinceLastScan = user.lastScanAt
          ? Math.floor((Date.now() - new Date(user.lastScanAt).getTime()) / (24 * 60 * 60 * 1000))
          : 999;
        const activityScore = Math.max(0, 100 - daysSinceLastScan * 3);
        factors.push({ factor: "recent_activity", score: activityScore, weight: 0.3 });

        // Factor 2: Engagement depth (weight: 25%)
        const engagementScore = Math.min(
          100,
          user._count.scans * 10 + user._count.removalRequests * 5
        );
        factors.push({ factor: "engagement_depth", score: engagementScore, weight: 0.25 });

        // Factor 3: Value realization (weight: 25%)
        const valueScore = user._count.removalRequests > 0
          ? Math.min(100, 50 + user._count.removalRequests * 10)
          : user._count.exposures > 0
            ? 30
            : 10;
        factors.push({ factor: "value_realization", score: valueScore, weight: 0.25 });

        // Factor 4: Subscription health (weight: 20%)
        let subscriptionScore = 50;
        if (user.subscription?.status === "active") {
          subscriptionScore = 100;
          if (user.subscription.stripeCurrentPeriodEnd) {
            const daysUntilRenewal = Math.floor(
              (new Date(user.subscription.stripeCurrentPeriodEnd).getTime() - Date.now()) /
                (24 * 60 * 60 * 1000)
            );
            if (daysUntilRenewal < 7) subscriptionScore = 70;
          }
        } else if (user.plan === "FREE") {
          subscriptionScore = 60;
        }
        factors.push({ factor: "subscription_health", score: subscriptionScore, weight: 0.2 });

        // Calculate weighted health score
        const healthScore = Math.round(
          factors.reduce((sum, f) => sum + f.score * f.weight, 0)
        );

        // Determine health status
        let healthStatus: HealthScoreResult["scores"][0]["healthStatus"];
        if (healthScore >= 80) {
          healthStatus = "THRIVING";
          summary.thriving++;
        } else if (healthScore >= 60) {
          healthStatus = "HEALTHY";
          summary.healthy++;
        } else if (healthScore >= 40) {
          healthStatus = "AT_RISK";
          summary.atRisk++;
        } else {
          healthStatus = "CRITICAL";
          summary.critical++;
        }

        // Generate recommendations
        const recommendations: string[] = [];
        if (activityScore < 50) {
          recommendations.push("Re-engage user with scan reminder");
        }
        if (valueScore < 50) {
          recommendations.push("Help user initiate first removal");
        }
        if (subscriptionScore < 70 && user.plan !== "FREE") {
          recommendations.push("Proactive outreach before renewal");
        }

        scores.push({
          userId: user.id,
          email: user.email,
          healthScore,
          healthStatus,
          factors,
          recommendations,
        });
      }

      return this.createSuccessResult<HealthScoreResult>(
        {
          scored: users.length,
          scores,
          summary,
        },
        {
          capability: "calculate-health",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "HEALTH_ERROR",
          message: error instanceof Error ? error.message : "Health calculation failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "calculate-health",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleProactiveOutreach(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<ProactiveOutreachResult>> {
    const startTime = Date.now();
    const { trigger = "all", limit = 50 } = input as ProactiveOutreachInput;

    try {
      const outreachQueue: ProactiveOutreachResult["outreachQueue"] = [];

      // Get users based on trigger type
      if (trigger === "all" || trigger === "inactive") {
        const inactiveUsers = await prisma.user.findMany({
          where: {
            lastScanAt: {
              lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days
            },
          },
          take: limit,
          select: {
            id: true,
            email: true,
            name: true,
            lastScanAt: true,
          },
        });

        for (const user of inactiveUsers) {
          outreachQueue.push({
            userId: user.id,
            email: user.email,
            reason: "Inactive for 14+ days",
            priority: "MEDIUM",
            suggestedAction: "Send re-engagement email",
            suggestedMessage: `Hi ${user.name?.split(" ")[0] || "there"}, we noticed you haven't run a scan recently. Your data exposure may have changed - would you like to check?`,
          });
        }
      }

      if (trigger === "all" || trigger === "at_risk") {
        // Users with subscription ending soon
        const atRiskUsers = await prisma.user.findMany({
          where: {
            subscription: {
              status: "active",
              stripeCurrentPeriodEnd: {
                gte: new Date(),
                lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
              },
            },
          },
          take: limit,
          include: {
            subscription: true,
          },
        });

        for (const user of atRiskUsers) {
          outreachQueue.push({
            userId: user.id,
            email: user.email,
            reason: "Subscription renewing soon",
            priority: "HIGH",
            suggestedAction: "Check-in before renewal",
            suggestedMessage: `Hi ${user.name?.split(" ")[0] || "there"}, your subscription renews soon. We'd love to hear how we can make GhostMyData even better for you.`,
          });
        }
      }

      if (trigger === "all" || trigger === "milestone") {
        // Users who recently completed first removal
        const milestoneUsers = await prisma.user.findMany({
          where: {
            removalRequests: {
              some: {
                status: "VERIFIED",
                completedAt: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                },
              },
            },
          },
          take: limit,
          include: {
            _count: {
              select: { removalRequests: true },
            },
          },
        });

        for (const user of milestoneUsers) {
          if (user._count.removalRequests === 1) {
            outreachQueue.push({
              userId: user.id,
              email: user.email,
              reason: "First successful removal",
              priority: "LOW",
              suggestedAction: "Send congratulations",
              suggestedMessage: `Congratulations! Your first data removal has been verified. Your privacy is getting stronger.`,
            });
          }
        }
      }

      return this.createSuccessResult<ProactiveOutreachResult>(
        {
          identified: outreachQueue.length,
          outreachQueue: outreachQueue.sort((a, b) => {
            const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }),
        },
        {
          capability: "proactive-outreach",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "OUTREACH_ERROR",
          message: error instanceof Error ? error.message : "Outreach identification failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "proactive-outreach",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleTrackMilestones(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<MilestoneResult>> {
    const startTime = Date.now();
    const { userId } = input as MilestoneInput;

    try {
      const milestones: MilestoneResult["milestones"] = [];
      const upcoming: MilestoneResult["upcoming"] = [];

      const users = await prisma.user.findMany({
        where: userId ? { id: userId } : {},
        take: 100,
        include: {
          _count: {
            select: {
              scans: true,
              removalRequests: true,
              exposures: true,
            },
          },
          removalRequests: {
            where: { status: "VERIFIED" },
            select: { completedAt: true },
            orderBy: { completedAt: "desc" },
            take: 1,
          },
        },
      });

      const milestoneDefinitions = [
        { name: "First Scan", check: (u: typeof users[0]) => u._count.scans >= 1, threshold: 1, metric: "scans" },
        { name: "5 Scans", check: (u: typeof users[0]) => u._count.scans >= 5, threshold: 5, metric: "scans" },
        { name: "First Removal", check: (u: typeof users[0]) => u._count.removalRequests >= 1, threshold: 1, metric: "removals" },
        { name: "10 Removals", check: (u: typeof users[0]) => u._count.removalRequests >= 10, threshold: 10, metric: "removals" },
        { name: "50 Removals", check: (u: typeof users[0]) => u._count.removalRequests >= 50, threshold: 50, metric: "removals" },
      ];

      for (const user of users) {
        for (const milestone of milestoneDefinitions) {
          if (milestone.check(user)) {
            // Check if we already celebrated this milestone (simplified check)
            const recentRemoval = user.removalRequests[0];

            milestones.push({
              userId: user.id,
              email: user.email,
              milestone: milestone.name,
              achievedAt: recentRemoval?.completedAt?.toISOString() || new Date().toISOString(),
              celebrationSent: false, // Would track in a separate table in production
            });
          } else {
            // Track progress toward milestone
            const currentValue =
              milestone.metric === "scans"
                ? user._count.scans
                : user._count.removalRequests;
            const progress = Math.min(100, (currentValue / milestone.threshold) * 100);

            if (progress >= 50 && progress < 100) {
              upcoming.push({
                userId: user.id,
                milestone: milestone.name,
                progressPercent: Math.round(progress),
              });
            }
          }
        }
      }

      return this.createSuccessResult<MilestoneResult>(
        {
          checked: users.length,
          milestones: milestones.slice(0, 50), // Limit output
          upcoming: upcoming.slice(0, 50),
        },
        {
          capability: "track-milestones",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "MILESTONE_ERROR",
          message: error instanceof Error ? error.message : "Milestone tracking failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "track-milestones",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleDetectAtRisk(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<AtRiskResult>> {
    const startTime = Date.now();
    const { threshold = 50, limit = 50 } = input as AtRiskInput;

    try {
      // First calculate health scores
      const healthResult = await this.handleCalculateHealth({ limit: limit * 2 }, context);

      if (!healthResult.success || !healthResult.data) {
        throw new Error("Failed to calculate health scores");
      }

      const atRiskUsers: AtRiskResult["atRiskUsers"] = [];

      for (const score of healthResult.data.scores) {
        if (score.healthScore <= threshold) {
          const riskFactors: string[] = [];
          let urgency: AtRiskResult["atRiskUsers"][0]["urgency"] = "LOW";

          // Analyze risk factors
          for (const factor of score.factors) {
            if (factor.score < 40) {
              riskFactors.push(`Low ${factor.factor.replace("_", " ")}`);
            }
          }

          // Determine urgency
          if (score.healthStatus === "CRITICAL") {
            urgency = "CRITICAL";
          } else if (score.healthScore < 30) {
            urgency = "HIGH";
          } else if (score.healthScore < 40) {
            urgency = "MEDIUM";
          }

          // Generate intervention suggestion
          const intervention = this.generateInterventionSuggestion(score.factors, riskFactors);

          atRiskUsers.push({
            userId: score.userId,
            email: score.email,
            healthScore: score.healthScore,
            riskFactors,
            interventionSuggestion: intervention,
            urgency,
          });
        }
      }

      // Generate intervention plan
      const interventionPlan = this.generateInterventionPlan(atRiskUsers);

      return this.createSuccessResult<AtRiskResult>(
        {
          analyzed: healthResult.data.scored,
          atRiskUsers: atRiskUsers
            .sort((a, b) => {
              const urgencyOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
              return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
            })
            .slice(0, limit),
          interventionPlan,
        },
        {
          capability: "detect-at-risk",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
        {
          needsHumanReview: atRiskUsers.some((u) => u.urgency === "CRITICAL"),
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "ATRISK_ERROR",
          message: error instanceof Error ? error.message : "At-risk detection failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "detect-at-risk",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private generateInterventionSuggestion(
    factors: HealthScoreResult["scores"][0]["factors"],
    _riskFactors: string[]
  ): string {
    // Find the lowest scoring factor
    const lowestFactor = factors.reduce((lowest, current) =>
      current.score < lowest.score ? current : lowest
    );

    const interventions: Record<string, string> = {
      recent_activity: "Send re-engagement email with scan reminder",
      engagement_depth: "Schedule product walkthrough call",
      value_realization: "Help complete first removal request",
      subscription_health: "Offer personalized success check-in",
    };

    return interventions[lowestFactor.factor] || "Schedule customer success call";
  }

  private generateInterventionPlan(
    atRiskUsers: AtRiskResult["atRiskUsers"]
  ): string[] {
    const plan: string[] = [];

    const criticalCount = atRiskUsers.filter((u) => u.urgency === "CRITICAL").length;
    const highCount = atRiskUsers.filter((u) => u.urgency === "HIGH").length;

    if (criticalCount > 0) {
      plan.push(`Immediate: Contact ${criticalCount} critical users within 24 hours`);
    }
    if (highCount > 0) {
      plan.push(`This week: Reach out to ${highCount} high-urgency users`);
    }

    // Group by intervention type
    const interventions = new Map<string, number>();
    for (const user of atRiskUsers) {
      const count = interventions.get(user.interventionSuggestion) || 0;
      interventions.set(user.interventionSuggestion, count + 1);
    }

    for (const [intervention, count] of interventions) {
      plan.push(`${intervention}: ${count} user(s)`);
    }

    return plan;
  }

  protected async executeRuleBased<T>(
    capability: string,
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<T>> {
    const handler = this.handlers.get(capability);
    if (handler) {
      return handler(input, context) as Promise<AgentResult<T>>;
    }

    return {
      success: false,
      error: {
        code: "NO_HANDLER",
        message: `No handler for capability: ${capability}`,
        retryable: false,
      },
      needsHumanReview: true,
      metadata: {
        agentId: this.id,
        capability,
        requestId: context.requestId,
        duration: 0,
        usedFallback: true,
        executedAt: new Date(),
      },
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

let successAgentInstance: SuccessAgent | null = null;

export function getSuccessAgent(): SuccessAgent {
  if (!successAgentInstance) {
    successAgentInstance = new SuccessAgent();
    registerAgent(successAgentInstance);
  }
  return successAgentInstance;
}

export async function calculateHealthScores(limit = 100): Promise<HealthScoreResult> {
  const agent = getSuccessAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<HealthScoreResult>(
    "calculate-health",
    { limit },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Health calculation failed");
}

export async function detectAtRiskUsers(threshold = 50): Promise<AtRiskResult> {
  const agent = getSuccessAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<AtRiskResult>(
    "detect-at-risk",
    { threshold },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "At-risk detection failed");
}

export { SuccessAgent };
export default getSuccessAgent;
