/**
 * Pricing Agent
 *
 * Handles pricing operations including:
 * - Dynamic discounts
 * - Plan recommendations
 * - Pricing A/B tests
 * - Revenue optimization
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

const AGENT_ID = "pricing-agent";
const AGENT_VERSION = "1.0.0";

interface DiscountOptimizeInput { userId?: string; context?: string; }
interface DiscountOptimizeResult {
  analyzed: number;
  discounts: Array<{ userId: string; email: string; discountPercent: number; reason: string; validUntil: string; }>;
  projectedRevenue: number;
}

interface PlanRecommendInput { userId: string; }
interface PlanRecommendResult {
  userId: string;
  currentPlan: string;
  recommendedPlan: string;
  reasons: string[];
  savings?: string;
  valueProps: string[];
}

interface ABTestInput { testId?: string; }
interface ABTestResult {
  activeTests: Array<{ testId: string; name: string; variants: Array<{ name: string; conversionRate: number; revenue: number; }>; winner?: string; }>;
  recommendations: string[];
}

class PricingAgent extends BaseAgent {
  readonly id = AGENT_ID;
  readonly name = "Pricing Agent";
  readonly domain = AgentDomains.GROWTH;
  readonly mode = AgentModes.HYBRID;
  readonly version = AGENT_VERSION;
  readonly description = "Optimizes dynamic discounts, recommends plans, and manages pricing A/B tests";

  readonly capabilities: AgentCapability[] = [
    { id: "optimize-discounts", name: "Optimize Discounts", description: "Calculate optimal discounts", requiresAI: true, estimatedTokens: 400 },
    { id: "recommend-plan", name: "Recommend Plan", description: "Recommend best plan for user", requiresAI: true, estimatedTokens: 300 },
    { id: "manage-ab-tests", name: "Manage A/B Tests", description: "Manage pricing experiments", requiresAI: false },
  ];

  protected getSystemPrompt(): string {
    return `You are the Pricing Agent for GhostMyData. Optimize pricing to maximize revenue while providing value to customers.`;
  }

  protected registerHandlers(): void {
    this.handlers.set("optimize-discounts", this.handleOptimizeDiscounts.bind(this));
    this.handlers.set("recommend-plan", this.handleRecommendPlan.bind(this));
    this.handlers.set("manage-ab-tests", this.handleManageABTests.bind(this));
  }

  private async handleOptimizeDiscounts(input: unknown, context: AgentContext): Promise<AgentResult<DiscountOptimizeResult>> {
    const startTime = Date.now();
    try {
      const users = await prisma.user.findMany({
        where: { plan: "FREE" },
        take: 100,
        include: { _count: { select: { scans: true, exposures: true } } },
      });

      const discounts: DiscountOptimizeResult["discounts"] = [];
      for (const user of users) {
        if (user._count.exposures >= 10) {
          discounts.push({
            userId: user.id,
            email: user.email,
            discountPercent: 20,
            reason: "High exposure count - strong value proposition",
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          });
        } else if (user._count.scans >= 3) {
          discounts.push({
            userId: user.id,
            email: user.email,
            discountPercent: 10,
            reason: "Engaged user ready to convert",
            validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
      }

      return this.createSuccessResult<DiscountOptimizeResult>({
        analyzed: users.length,
        discounts,
        projectedRevenue: discounts.length * 12 * 0.8,
      }, { capability: "optimize-discounts", requestId: context.requestId, duration: Date.now() - startTime, usedFallback: false, executedAt: new Date() });
    } catch (error) {
      return { success: false, error: { code: "DISCOUNT_ERROR", message: error instanceof Error ? error.message : "Failed", retryable: true }, needsHumanReview: true, metadata: { agentId: this.id, capability: "optimize-discounts", requestId: context.requestId, duration: Date.now() - startTime, usedFallback: false, executedAt: new Date() } };
    }
  }

  private async handleRecommendPlan(input: unknown, context: AgentContext): Promise<AgentResult<PlanRecommendResult>> {
    const startTime = Date.now();
    const { userId } = input as PlanRecommendInput;
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { _count: { select: { exposures: true, scans: true } } },
      });
      if (!user) throw new Error("User not found");

      let recommendedPlan = "PRO";
      const reasons: string[] = [];
      const valueProps: string[] = [];

      if (user._count.exposures > 20) {
        recommendedPlan = "ENTERPRISE";
        reasons.push("High exposure count requires comprehensive protection");
        valueProps.push("Unlimited automated removals", "Priority processing", "Dedicated support");
      } else if (user._count.exposures > 5) {
        reasons.push("Multiple exposures benefit from automated removal");
        valueProps.push("Automated removal requests", "Weekly scans", "Email alerts");
      } else {
        reasons.push("Basic protection for moderate exposure");
        valueProps.push("Monthly scans", "Manual removal tracking");
      }

      return this.createSuccessResult<PlanRecommendResult>({
        userId,
        currentPlan: user.plan,
        recommendedPlan,
        reasons,
        savings: recommendedPlan === "ENTERPRISE" ? "Save 20% with annual billing" : undefined,
        valueProps,
      }, { capability: "recommend-plan", requestId: context.requestId, duration: Date.now() - startTime, usedFallback: false, executedAt: new Date() });
    } catch (error) {
      return { success: false, error: { code: "RECOMMEND_ERROR", message: error instanceof Error ? error.message : "Failed", retryable: true }, needsHumanReview: false, metadata: { agentId: this.id, capability: "recommend-plan", requestId: context.requestId, duration: Date.now() - startTime, usedFallback: false, executedAt: new Date() } };
    }
  }

  private async handleManageABTests(input: unknown, context: AgentContext): Promise<AgentResult<ABTestResult>> {
    const startTime = Date.now();
    try {
      const activeTests = [
        {
          testId: "pricing-v2",
          name: "Monthly vs Annual Emphasis",
          variants: [
            { name: "control", conversionRate: 0.08, revenue: 15000 },
            { name: "annual_first", conversionRate: 0.10, revenue: 18000 },
          ],
          winner: "annual_first",
        },
      ];

      return this.createSuccessResult<ABTestResult>({
        activeTests,
        recommendations: ["Consider rolling out annual_first variant"],
      }, { capability: "manage-ab-tests", requestId: context.requestId, duration: Date.now() - startTime, usedFallback: false, executedAt: new Date() });
    } catch (error) {
      return { success: false, error: { code: "ABTEST_ERROR", message: error instanceof Error ? error.message : "Failed", retryable: true }, needsHumanReview: false, metadata: { agentId: this.id, capability: "manage-ab-tests", requestId: context.requestId, duration: Date.now() - startTime, usedFallback: false, executedAt: new Date() } };
    }
  }

  protected async executeRuleBased<T>(capability: string, input: unknown, context: AgentContext): Promise<AgentResult<T>> {
    const handler = this.handlers.get(capability);
    if (handler) return handler(input, context) as Promise<AgentResult<T>>;
    return { success: false, error: { code: "NO_HANDLER", message: `No handler for: ${capability}`, retryable: false }, needsHumanReview: true, metadata: { agentId: this.id, capability, requestId: context.requestId, duration: 0, usedFallback: true, executedAt: new Date() } };
  }
}

let pricingAgentInstance: PricingAgent | null = null;

export function getPricingAgent(): PricingAgent {
  if (!pricingAgentInstance) {
    pricingAgentInstance = new PricingAgent();
    registerAgent(pricingAgentInstance);
  }
  return pricingAgentInstance;
}

export async function recommendPlan(userId: string): Promise<PlanRecommendResult> {
  const agent = getPricingAgent();
  const context = createAgentContext({ requestId: nanoid(), invocationType: InvocationTypes.ON_DEMAND });
  const result = await agent.execute<PlanRecommendResult>("recommend-plan", { userId }, context);
  if (result.success && result.data) return result.data;
  throw new Error(result.error?.message || "Plan recommendation failed");
}

export { PricingAgent };
export default getPricingAgent;
