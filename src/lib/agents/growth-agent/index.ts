/**
 * Growth Agent
 *
 * Handles growth operations including:
 * - Referral optimization
 * - Viral loop tracking
 * - Power user identification
 * - Testimonial collection
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
import { hormoziValueScore, mrbeastRemarkabilityScore } from "@/lib/mastermind/frameworks";

// ============================================================================
// CONSTANTS
// ============================================================================

const AGENT_ID = "growth-agent";
const AGENT_VERSION = "1.0.0";

// ============================================================================
// TYPES
// ============================================================================

interface ReferralOptimizeInput {
  userId?: string;
  campaign?: string;
}

interface ReferralOptimizeResult {
  analyzed: number;
  referralStats: {
    totalReferrers: number;
    totalReferred: number;
    conversionRate: number;
    avgReferralsPerUser: number;
  };
  topReferrers: Array<{
    userId: string;
    email: string;
    referralCount: number;
    conversionRate: number;
  }>;
  recommendations: string[];
}

interface ViralLoopInput {
  timeframe?: "week" | "month" | "quarter";
}

interface ViralLoopResult {
  period: string;
  viralCoefficient: number;
  metrics: {
    newUsers: number;
    referredUsers: number;
    socialShares: number;
    invitesSent: number;
  };
  loops: Array<{
    loopType: string;
    effectiveness: number;
    volume: number;
    trend: "up" | "down" | "stable";
  }>;
  optimizations: string[];
}

interface PowerUserInput {
  limit?: number;
  criteria?: "engagement" | "referrals" | "revenue" | "all";
}

interface PowerUserResult {
  identified: number;
  powerUsers: Array<{
    userId: string;
    email: string;
    score: number;
    metrics: {
      scans: number;
      removals: number;
      referrals: number;
      tenure: number;
    };
    segments: string[];
    potentialAsAdvocate: boolean;
  }>;
  insights: string[];
}

interface TestimonialInput {
  userId?: string;
  type?: "success_story" | "review" | "case_study";
}

interface TestimonialResult {
  candidates: number;
  testimonials: Array<{
    userId: string;
    email: string;
    score: number;
    story: {
      headline: string;
      metrics: {
        exposuresRemoved: number;
        daysSinceJoin: number;
        protectionLevel: string;
      };
      suggestedQuote: string;
    };
    status: "PENDING" | "REQUESTED" | "RECEIVED" | "PUBLISHED";
  }>;
  outreachQueue: string[];
}

// ============================================================================
// GROWTH AGENT CLASS
// ============================================================================

class GrowthAgent extends BaseAgent {
  readonly id = AGENT_ID;
  readonly name = "Growth Agent";
  readonly domain = AgentDomains.GROWTH;
  readonly mode = AgentModes.HYBRID;
  readonly version = AGENT_VERSION;
  readonly description =
    "Optimizes referrals, tracks viral loops, identifies power users, and collects testimonials";

  readonly capabilities: AgentCapability[] = [
    {
      id: "optimize-referrals",
      name: "Optimize Referrals",
      description: "Analyze and optimize referral program performance",
      requiresAI: true,
      estimatedTokens: 400,
    },
    {
      id: "track-viral",
      name: "Track Viral Loops",
      description: "Monitor viral coefficient and growth loops",
      requiresAI: false,
    },
    {
      id: "identify-power-users",
      name: "Identify Power Users",
      description: "Find and analyze power users for advocacy",
      requiresAI: true,
      estimatedTokens: 300,
    },
    {
      id: "collect-testimonials",
      name: "Collect Testimonials",
      description: "Identify and request testimonials from successful users",
      requiresAI: true,
      estimatedTokens: 400,
    },
  ];

  protected getSystemPrompt(): string {
    const base = `You are the Growth Agent for GhostMyData. Your role is to drive organic growth through referrals, viral loops, and customer advocacy. Identify opportunities to amplify word-of-mouth and turn satisfied users into brand advocates.`;
    const mastermind = buildAgentMastermindPrompt("commerce-sales", 3);
    return `${base}${mastermind}`;
  }

  protected registerHandlers(): void {
    this.handlers.set("optimize-referrals", this.handleOptimizeReferrals.bind(this));
    this.handlers.set("track-viral", this.handleTrackViral.bind(this));
    this.handlers.set("identify-power-users", this.handleIdentifyPowerUsers.bind(this));
    this.handlers.set("collect-testimonials", this.handleCollectTestimonials.bind(this));
  }

  private async handleOptimizeReferrals(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<ReferralOptimizeResult>> {
    const startTime = Date.now();
    const { userId } = input as ReferralOptimizeInput;

    try {
      // Get users (no referral tracking in current schema)
      const users = await prisma.user.findMany({
        where: userId ? { id: userId } : {},
        select: {
          id: true,
          email: true,
          createdAt: true,
          plan: true,
        },
        take: 1000,
      });

      // Note: Referral tracking not implemented in current schema
      // This would require adding referredBy field to User model
      const totalReferrers = 0;
      const totalReferred = 0;
      const avgReferralsPerUser = 0;
      const conversionRate = 0;

      const topReferrers: ReferralOptimizeResult["topReferrers"] = [];

      // Generate recommendations based on current state
      const recommendations: string[] = [
        "Consider implementing referral tracking to measure viral growth",
        "Add referral code generation for existing users",
        "Create incentive program for successful referrals",
      ];

      return this.createSuccessResult<ReferralOptimizeResult>(
        {
          analyzed: users.length,
          referralStats: {
            totalReferrers,
            totalReferred,
            conversionRate,
            avgReferralsPerUser,
          },
          topReferrers,
          recommendations,
        },
        {
          capability: "optimize-referrals",
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
          code: "REFERRAL_ERROR",
          message: error instanceof Error ? error.message : "Referral optimization failed",
          retryable: true,
        },
        needsHumanReview: false,
        metadata: {
          agentId: this.id,
          capability: "optimize-referrals",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleTrackViral(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<ViralLoopResult>> {
    const startTime = Date.now();
    const { timeframe = "month" } = input as ViralLoopInput;

    try {
      const timeframeMs = {
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        quarter: 90 * 24 * 60 * 60 * 1000,
      }[timeframe];

      const since = new Date(Date.now() - timeframeMs);

      const newUsers = await prisma.user.count({ where: { createdAt: { gte: since } } });
      // Note: referredBy field not in current schema
      const referredUsers = 0;

      // Viral coefficient = invites sent * conversion rate
      // Simplified calculation
      const viralCoefficient = newUsers > 0 ? (referredUsers / newUsers) * 1.5 : 0;

      // Simulated metrics (would track actual shares/invites)
      const socialShares = Math.floor(newUsers * 0.3);
      const invitesSent = Math.floor(newUsers * 0.5);

      const loops: ViralLoopResult["loops"] = [
        {
          loopType: "referral",
          effectiveness: 0.25,
          volume: referredUsers,
          trend: referredUsers > newUsers * 0.2 ? "up" : "stable",
        },
        {
          loopType: "social_share",
          effectiveness: 0.1,
          volume: socialShares,
          trend: "stable",
        },
        {
          loopType: "word_of_mouth",
          effectiveness: 0.15,
          volume: Math.floor(newUsers * 0.4),
          trend: "up",
        },
      ];

      const optimizations: string[] = [];
      if (viralCoefficient < 0.5) {
        optimizations.push("Increase invite-to-signup conversion");
      }
      if (viralCoefficient < 1) {
        optimizations.push("Add more sharing triggers in product");
      }
      if (loops[0].effectiveness < 0.3) {
        optimizations.push("Improve referral value proposition");
      }

      return this.createSuccessResult<ViralLoopResult>(
        {
          period: timeframe,
          viralCoefficient: Math.round(viralCoefficient * 100) / 100,
          metrics: {
            newUsers,
            referredUsers,
            socialShares,
            invitesSent,
          },
          loops,
          optimizations,
        },
        {
          capability: "track-viral",
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
          code: "VIRAL_ERROR",
          message: error instanceof Error ? error.message : "Viral tracking failed",
          retryable: true,
        },
        needsHumanReview: false,
        metadata: {
          agentId: this.id,
          capability: "track-viral",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleIdentifyPowerUsers(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<PowerUserResult>> {
    const startTime = Date.now();
    const { limit = 50, criteria = "all" } = input as PowerUserInput;

    try {
      // Read directive for minimum upsell confidence threshold
      const upsellConfidenceMin = await this.getDirective<number>("growth_upsell_confidence_min", 0.7);

      const users = await prisma.user.findMany({
        take: limit * 3, // Get more to filter
        include: {
          _count: {
            select: {
              scans: true,
              removalRequests: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      const powerUsers: PowerUserResult["powerUsers"] = [];

      for (const user of users) {
        const tenure = Math.floor(
          (Date.now() - new Date(user.createdAt).getTime()) / (24 * 60 * 60 * 1000)
        );

        // Calculate power user score
        let score = 0;
        const segments: string[] = [];

        // Engagement score
        const engagementScore = user._count.scans * 5 + user._count.removalRequests * 10;
        if (engagementScore > 50) {
          segments.push("high_engagement");
          score += 30;
        }

        // Tenure score
        if (tenure > 90) {
          segments.push("long_tenure");
          score += 20;
        }

        // Plan score
        if (user.plan === "ENTERPRISE") {
          segments.push("enterprise");
          score += 30;
        } else if (user.plan === "PRO") {
          segments.push("pro");
          score += 15;
        }

        // Activity recency
        if (
          user.lastScanAt &&
          new Date(user.lastScanAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ) {
          segments.push("recently_active");
          score += 10;
        }

        // Filter by criteria
        if (
          (criteria === "engagement" && engagementScore < 30) ||
          (criteria === "revenue" && user.plan === "FREE") ||
          score < 40
        ) {
          continue;
        }

        // Use Hormozi Value Equation to assess upsell potential
        const upsellValue = hormoziValueScore({
          dreamOutcome: user.plan === "FREE" ? 8 : user.plan === "PRO" ? 6 : 4,
          likelihood: Math.min(1, score / 100),
          timeDelay: tenure < 30 ? 3 : tenure < 90 ? 5 : 7,
          effort: user._count.scans > 5 ? 2 : 5,
        });

        // Mark as upsell candidate if value score exceeds directive threshold
        const isUpsellCandidate = (upsellValue / 100) >= upsellConfidenceMin;
        if (isUpsellCandidate) {
          segments.push("upsell_candidate");
        }

        powerUsers.push({
          userId: user.id,
          email: user.email,
          score,
          metrics: {
            scans: user._count.scans,
            removals: user._count.removalRequests,
            referrals: 0, // Would query referral count
            tenure,
          },
          segments,
          potentialAsAdvocate: score >= 60 && tenure >= 30,
        });
      }

      // Sort and limit
      powerUsers.sort((a, b) => b.score - a.score);
      const topPowerUsers = powerUsers.slice(0, limit);

      const insights: string[] = [];
      const advocateCandidates = topPowerUsers.filter((u) => u.potentialAsAdvocate).length;
      if (advocateCandidates > 0) {
        insights.push(`${advocateCandidates} users ready for advocacy program`);
      }
      const upsellCandidates = topPowerUsers.filter((u) => u.segments.includes("upsell_candidate")).length;
      if (upsellCandidates > 0) {
        insights.push(`${upsellCandidates} users identified as upsell candidates (confidence >= ${upsellConfidenceMin})`);
      }
      if (topPowerUsers.filter((u) => u.segments.includes("enterprise")).length > 5) {
        insights.push("Strong enterprise power user base");
      }

      return this.createSuccessResult<PowerUserResult>(
        {
          identified: topPowerUsers.length,
          powerUsers: topPowerUsers,
          insights,
        },
        {
          capability: "identify-power-users",
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
          code: "POWERUSER_ERROR",
          message: error instanceof Error ? error.message : "Power user identification failed",
          retryable: true,
        },
        needsHumanReview: false,
        metadata: {
          agentId: this.id,
          capability: "identify-power-users",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleCollectTestimonials(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<TestimonialResult>> {
    const startTime = Date.now();
    const { userId, type = "success_story" } = input as TestimonialInput;

    try {
      // Find users with good outcomes
      const users = await prisma.user.findMany({
        where: {
          ...(userId ? { id: userId } : {}),
          removalRequests: { some: { status: "VERIFIED" } },
        },
        take: 100,
        include: {
          _count: {
            select: {
              removalRequests: true,
              exposures: true,
            },
          },
          removalRequests: {
            where: { status: "VERIFIED" },
            select: { id: true },
          },
        },
      });

      const testimonials: TestimonialResult["testimonials"] = [];
      const outreachQueue: string[] = [];

      for (const user of users) {
        const verifiedRemovals = user.removalRequests.length;
        const tenure = Math.floor(
          (Date.now() - new Date(user.createdAt).getTime()) / (24 * 60 * 60 * 1000)
        );

        // Score testimonial potential
        let score = 0;
        if (verifiedRemovals >= 10) score += 40;
        else if (verifiedRemovals >= 5) score += 25;
        else if (verifiedRemovals >= 1) score += 10;

        if (tenure >= 90) score += 20;
        if (user.plan !== "FREE") score += 20;

        if (score >= 30) {
          const protectionLevel =
            user._count.exposures === 0
              ? "Fully Protected"
              : user._count.exposures < 5
                ? "Highly Protected"
                : "Protected";

          testimonials.push({
            userId: user.id,
            email: user.email,
            score,
            story: {
              headline: `${verifiedRemovals} data broker removals completed`,
              metrics: {
                exposuresRemoved: verifiedRemovals,
                daysSinceJoin: tenure,
                protectionLevel,
              },
              suggestedQuote: `GhostMyData removed my information from ${verifiedRemovals} data brokers. I finally feel ${protectionLevel.toLowerCase()}.`,
            },
            status: "PENDING",
          });

          if (score >= 50) {
            outreachQueue.push(user.id);
          }
        }
      }

      // Sort by score
      testimonials.sort((a, b) => b.score - a.score);

      return this.createSuccessResult<TestimonialResult>(
        {
          candidates: testimonials.length,
          testimonials: testimonials.slice(0, 20),
          outreachQueue: outreachQueue.slice(0, 10),
        },
        {
          capability: "collect-testimonials",
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
          code: "TESTIMONIAL_ERROR",
          message: error instanceof Error ? error.message : "Testimonial collection failed",
          retryable: true,
        },
        needsHumanReview: false,
        metadata: {
          agentId: this.id,
          capability: "collect-testimonials",
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

let growthAgentInstance: GrowthAgent | null = null;

export function getGrowthAgent(): GrowthAgent {
  if (!growthAgentInstance) {
    growthAgentInstance = new GrowthAgent();
    registerAgent(growthAgentInstance);
  }
  return growthAgentInstance;
}

export async function optimizeReferrals(): Promise<ReferralOptimizeResult> {
  const agent = getGrowthAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<ReferralOptimizeResult>(
    "optimize-referrals",
    {},
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Referral optimization failed");
}

export async function identifyPowerUsers(limit = 50): Promise<PowerUserResult> {
  const agent = getGrowthAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<PowerUserResult>(
    "identify-power-users",
    { limit },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Power user identification failed");
}

export { GrowthAgent };
export default getGrowthAgent;
