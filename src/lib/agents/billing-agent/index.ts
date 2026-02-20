/**
 * Billing Agent
 *
 * Handles billing operations including:
 * - Churn prediction
 * - Upsell detection
 * - Subscription sync
 *
 * Replaces cron jobs: sync-subscriptions
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
import { buildAgentMastermindPrompt } from "@/lib/mastermind";
import { hormoziValueScore, buffettCompetenceCheck } from "@/lib/mastermind/frameworks";
import { recordOutcome } from "@/lib/agents/learning";
import { createRecommendation } from "@/lib/promo";

// ============================================================================
// CONSTANTS
// ============================================================================

const AGENT_ID = "billing-agent";
const AGENT_VERSION = "1.0.0";

// ============================================================================
// TYPES
// ============================================================================

interface SyncInput {
  userId?: string;
  limit?: number;
}

interface SyncResult {
  synced: number;
  errors: number;
  changes: Array<{
    userId: string;
    change: string;
    oldValue?: string;
    newValue?: string;
  }>;
}

interface ChurnInput {
  userId?: string;
  limit?: number;
}

interface ChurnResult {
  analyzed: number;
  atRisk: number;
  predictions: Array<{
    userId: string;
    churnRisk: number;
    factors: string[];
    recommendedAction?: string;
  }>;
}

interface UpsellInput {
  userId?: string;
  limit?: number;
}

interface UpsellResult {
  analyzed: number;
  opportunities: number;
  recommendations: Array<{
    userId: string;
    currentPlan: string;
    recommendedPlan: string;
    reason: string;
    confidence: number;
  }>;
}

// ============================================================================
// BILLING AGENT CLASS
// ============================================================================

class BillingAgent extends BaseAgent {
  readonly id = AGENT_ID;
  readonly name = "Billing Agent";
  readonly domain = AgentDomains.CORE;
  readonly mode = AgentModes.HYBRID;
  readonly version = AGENT_VERSION;
  readonly description =
    "Manages billing operations including churn prediction, upsell detection, and subscription sync";

  readonly capabilities: AgentCapability[] = [
    {
      id: "sync-subscriptions",
      name: "Sync Subscriptions",
      description: "Sync subscription data with Stripe",
      requiresAI: false,
      supportsBatch: true,
      rateLimit: 10,
    },
    {
      id: "predict-churn",
      name: "Predict Churn",
      description: "Predict which users are at risk of churning",
      requiresAI: true,
      estimatedTokens: 500,
    },
    {
      id: "detect-upsell",
      name: "Detect Upsell Opportunities",
      description: "Identify users who would benefit from plan upgrades",
      requiresAI: true,
      estimatedTokens: 400,
    },
  ];

  protected getSystemPrompt(): string {
    const base = `You are the Billing Agent for GhostMyData. Analyze user behavior to predict churn and identify upsell opportunities.

HARD CONSTRAINT — PRICING IS READ-ONLY:
You must NEVER modify, suggest modifications to, or generate directives that change:
- Stripe price IDs, plan prices, or billing amounts
- Discount codes, coupons, or trial periods
- Free tier limits or removal quotas
- Any pricing-related configuration
Pricing changes require manual admin action via Stripe dashboard. Your role is ANALYSIS ONLY.`;
    const mastermind = buildAgentMastermindPrompt("commerce-sales", 3);
    return `${base}${mastermind}`;
  }

  protected registerHandlers(): void {
    this.handlers.set("sync-subscriptions", this.handleSyncSubscriptions.bind(this));
    this.handlers.set("predict-churn", this.handlePredictChurn.bind(this));
    this.handlers.set("detect-upsell", this.handleDetectUpsell.bind(this));
  }

  private async handleSyncSubscriptions(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<SyncResult>> {
    const startTime = Date.now();
    const { userId, limit = 100 } = input as SyncInput;

    try {
      // Get subscriptions that might be out of sync
      const subscriptions = await prisma.subscription.findMany({
        where: userId ? { userId } : {},
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              plan: true,
            },
          },
        },
      });

      const changes: SyncResult["changes"] = [];
      let errors = 0;

      for (const sub of subscriptions) {
        try {
          // Check if user plan matches subscription
          if (sub.user.plan !== sub.plan) {
            // Update user plan to match subscription
            await prisma.user.update({
              where: { id: sub.userId },
              data: { plan: sub.plan },
            });

            changes.push({
              userId: sub.userId,
              change: "plan_updated",
              oldValue: sub.user.plan,
              newValue: sub.plan,
            });
          }

          // Check for expired subscriptions
          if (
            sub.stripeCurrentPeriodEnd &&
            sub.stripeCurrentPeriodEnd < new Date() &&
            sub.status === "active"
          ) {
            await prisma.subscription.update({
              where: { id: sub.id },
              data: { status: "expired" },
            });

            changes.push({
              userId: sub.userId,
              change: "subscription_expired",
            });
          }
        } catch {
          errors++;
        }
      }

      return this.createSuccessResult<SyncResult>(
        {
          synced: subscriptions.length - errors,
          errors,
          changes,
        },
        {
          capability: "sync-subscriptions",
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
          code: "SYNC_ERROR",
          message: error instanceof Error ? error.message : "Sync failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "sync-subscriptions",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handlePredictChurn(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<ChurnResult>> {
    const startTime = Date.now();
    const { userId, limit = 50 } = input as ChurnInput;

    try {
      // Get paying users with their activity metrics
      const users = await prisma.user.findMany({
        where: {
          plan: { in: ["PRO", "ENTERPRISE"] },
          ...(userId ? { id: userId } : {}),
        },
        take: limit,
        include: {
          subscription: true,
          _count: {
            select: {
              scans: true,
              exposures: true,
              removalRequests: true,
              tickets: true,
            },
          },
        },
      });

      const predictions: ChurnResult["predictions"] = [];
      let atRisk = 0;

      for (const user of users) {
        const factors: string[] = [];
        let riskScore = 0;

        // Factor: No recent scans
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        if (!user.lastScanAt || user.lastScanAt < thirtyDaysAgo) {
          factors.push("No recent scans");
          riskScore += 0.2;
        }

        // Factor: Low engagement
        if (user._count.scans < 2) {
          factors.push("Low scan count");
          riskScore += 0.15;
        }

        // Factor: No removals initiated
        if (user._count.removalRequests === 0) {
          factors.push("No removal requests");
          riskScore += 0.1;
        }

        // Factor: Support tickets (negative experience)
        if (user._count.tickets > 3) {
          factors.push("Multiple support tickets");
          riskScore += 0.25;
        }

        // Factor: Approaching subscription end
        if (
          user.subscription?.stripeCurrentPeriodEnd &&
          new Date(user.subscription.stripeCurrentPeriodEnd).getTime() -
            Date.now() <
            7 * 24 * 60 * 60 * 1000
        ) {
          factors.push("Subscription ending soon");
          riskScore += 0.2;
        }

        // Hormozi Value Equation: low perceived value = high churn risk
        const valueScore = hormoziValueScore({
          dreamOutcome: user._count.exposures > 5 ? 8 : 5, // More exposures = higher dream outcome
          likelihood: user._count.removalRequests > 0 ? 0.7 : 0.3, // Completed removals = higher confidence
          timeDelay: user._count.scans < 2 ? 7 : 3, // Low engagement = feels slow
          effort: user.plan === "ENTERPRISE" ? 2 : 5, // Higher plan = lower friction
        });
        // Low value score (< 30) adds churn risk
        if (valueScore < 30) {
          riskScore += 0.15;
          factors.push(`Low Hormozi value score (${valueScore}/100)`);
        }

        // Read directive for churn risk threshold
        const churnThreshold = await this.getDirective<number>("billing_churn_risk_threshold", 0.5);

        // Normalize risk score
        const churnRisk = Math.min(riskScore, 1);

        if (churnRisk > churnThreshold) {
          atRisk++;
        }

        predictions.push({
          userId: user.id,
          churnRisk,
          factors,
          recommendedAction:
            churnRisk > 0.7
              ? "Immediate outreach recommended"
              : churnRisk > 0.5
                ? "Monitor and engage"
                : undefined,
        });
      }

      // Record churn predictions as outcomes (for later validation against actual cancellations)
      for (const pred of predictions.filter((p) => p.churnRisk > 0.3)) {
        recordOutcome({
          agentId: this.id,
          capability: "predict-churn",
          outcomeType: "PARTIAL", // Will be updated to SUCCESS/FAILURE when validated
          context: { userId: pred.userId, churnRisk: pred.churnRisk },
          outcome: { factors: pred.factors, recommendedAction: pred.recommendedAction },
        }).catch(() => {});
      }

      return this.createSuccessResult<ChurnResult>(
        {
          analyzed: users.length,
          atRisk,
          predictions: predictions.filter((p) => p.churnRisk > 0.3),
        },
        {
          capability: "predict-churn",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
        {
          needsHumanReview: atRisk > 5,
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "CHURN_ERROR",
          message: error instanceof Error ? error.message : "Prediction failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "predict-churn",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleDetectUpsell(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<UpsellResult>> {
    const startTime = Date.now();
    const { userId, limit = 50 } = input as UpsellInput;

    try {
      // Get free users with high engagement
      const users = await prisma.user.findMany({
        where: {
          plan: "FREE",
          ...(userId ? { id: userId } : {}),
        },
        take: limit,
        include: {
          _count: {
            select: {
              scans: true,
              exposures: true,
            },
          },
        },
      });

      const recommendations: UpsellResult["recommendations"] = [];

      for (const user of users) {
        let confidence = 0;
        let reason = "";

        // High exposure count indicates need for removal service
        if (user._count.exposures >= 10) {
          confidence = Math.min(0.5 + user._count.exposures * 0.02, 0.95);
          reason = `${user._count.exposures} exposures found - would benefit from automated removal`;
        }
        // Multiple scans shows active engagement
        else if (user._count.scans >= 3) {
          confidence = 0.6;
          reason = "Active user with multiple scans - likely to convert";
        }
        // Recent activity
        else if (user.lastScanAt && user.lastScanAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
          confidence = 0.4;
          reason = "Recently active - good time to present upgrade options";
        }

        // Read directive for minimum upsell confidence
        const minConfidence = await this.getDirective<number>("growth_upsell_confidence_min", 0.4);

        if (confidence >= minConfidence) {
          // Buffett competence check: is this upsell within our circle?
          const competenceResult = buffettCompetenceCheck({
            isWithinExpertise: true, // Privacy protection is our core competence
            hasMarginOfSafety: user._count.exposures >= 5, // Real value to deliver
            frontPageTest: true, // We'd be proud of this recommendation
            isSimpleToExplain: confidence >= 0.6, // High confidence = clear reason
          });

          if (competenceResult.proceed) {
            recommendations.push({
              userId: user.id,
              currentPlan: "FREE",
              recommendedPlan: "PRO",
              reason: `${reason}${competenceResult.confidence === "HIGH" ? " (high-confidence recommendation)" : ""}`,
              confidence,
            });

            // Fire-and-forget: create promo recommendation for admin review
            createRecommendation({
              userId: user.id,
              promoType: "DISCOUNT",
              reason: `${reason}${competenceResult.confidence === "HIGH" ? " (high-confidence recommendation)" : ""}`,
              confidence,
              agentId: this.id,
            }).catch(() => {});
          }
        }
      }

      return this.createSuccessResult<UpsellResult>(
        {
          analyzed: users.length,
          opportunities: recommendations.length,
          recommendations: recommendations.sort((a, b) => b.confidence - a.confidence),
        },
        {
          capability: "detect-upsell",
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
          code: "UPSELL_ERROR",
          message: error instanceof Error ? error.message : "Detection failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "detect-upsell",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
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

let billingAgentInstance: BillingAgent | null = null;

export function getBillingAgent(): BillingAgent {
  if (!billingAgentInstance) {
    billingAgentInstance = new BillingAgent();
    registerAgent(billingAgentInstance);
  }
  return billingAgentInstance;
}

export async function syncSubscriptions(limit = 100): Promise<SyncResult> {
  const agent = getBillingAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<SyncResult>(
    "sync-subscriptions",
    { limit },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Sync failed");
}

export async function predictChurn(limit = 50): Promise<ChurnResult> {
  const agent = getBillingAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<ChurnResult>(
    "predict-churn",
    { limit },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Churn prediction failed");
}

export { BillingAgent };
export default getBillingAgent;
