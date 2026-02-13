/**
 * Competitive Intelligence Agent
 *
 * Handles competitive monitoring including:
 * - Monitor competitor services
 * - Track pricing changes
 * - Feature gap analysis
 * - Market trend analysis
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
import { carlsenPositionalScore } from "@/lib/mastermind/frameworks";

// ============================================================================
// CONSTANTS
// ============================================================================

const AGENT_ID = "competitive-intel-agent";
const AGENT_VERSION = "1.0.0";

// Known competitors for monitoring
const COMPETITORS = [
  { name: "DeleteMe", domain: "joindeleteme.com", tier: "premium" },
  { name: "Privacy Duck", domain: "privacyduck.com", tier: "mid" },
  { name: "Kanary", domain: "kanary.com", tier: "premium" },
  { name: "Incogni", domain: "incogni.com", tier: "budget" },
  { name: "Optery", domain: "optery.com", tier: "premium" },
];

// ============================================================================
// TYPES
// ============================================================================

interface CompetitorMonitorInput {
  competitor?: string;
}

interface CompetitorMonitorResult {
  monitored: number;
  changes: Array<{
    competitor: string;
    changeType: "PRICING" | "FEATURE" | "MARKETING" | "BROKER_COUNT";
    description: string;
    impact: "LOW" | "MEDIUM" | "HIGH";
    detectedAt: string;
  }>;
  alerts: string[];
}

interface PricingTrackingInput {
  competitor?: string;
}

interface PricingTrackingResult {
  tracked: number;
  pricingData: Array<{
    competitor: string;
    plans: Array<{
      name: string;
      price: number;
      billingCycle: "monthly" | "annual";
      features: string[];
    }>;
    lastUpdated: string;
    priceChange?: {
      direction: "up" | "down";
      percentage: number;
    };
  }>;
  insights: string[];
}

interface FeatureGapInput {
  ourFeatures?: string[];
}

interface FeatureGapResult {
  analyzed: number;
  gaps: Array<{
    feature: string;
    competitors: string[];
    priority: "LOW" | "MEDIUM" | "HIGH";
    estimatedImpact: string;
  }>;
  advantages: Array<{
    feature: string;
    description: string;
  }>;
  recommendations: string[];
}

interface MarketTrendsInput {
  timeframe?: "month" | "quarter" | "year";
}

interface MarketTrendsResult {
  period: string;
  trends: Array<{
    trend: string;
    direction: "growing" | "stable" | "declining";
    relevance: "LOW" | "MEDIUM" | "HIGH";
    description: string;
  }>;
  opportunities: string[];
  threats: string[];
}

// ============================================================================
// COMPETITIVE INTELLIGENCE AGENT CLASS
// ============================================================================

class CompetitiveIntelAgent extends BaseAgent {
  readonly id = AGENT_ID;
  readonly name = "Competitive Intelligence Agent";
  readonly domain = AgentDomains.INTELLIGENCE;
  readonly mode = AgentModes.HYBRID;
  readonly version = AGENT_VERSION;
  readonly description =
    "Monitors competitors, tracks pricing changes, analyzes feature gaps, and identifies market trends";

  readonly capabilities: AgentCapability[] = [
    {
      id: "monitor-competitors",
      name: "Monitor Competitors",
      description: "Monitor competitor services for changes",
      requiresAI: true,
      estimatedTokens: 500,
    },
    {
      id: "track-pricing",
      name: "Track Pricing",
      description: "Track competitor pricing changes",
      requiresAI: false,
      supportsBatch: true,
    },
    {
      id: "analyze-gaps",
      name: "Analyze Feature Gaps",
      description: "Analyze feature gaps compared to competitors",
      requiresAI: true,
      estimatedTokens: 700,
    },
    {
      id: "analyze-trends",
      name: "Analyze Market Trends",
      description: "Analyze privacy market trends",
      requiresAI: true,
      estimatedTokens: 600,
    },
  ];

  protected getSystemPrompt(): string {
    const base = `You are the Competitive Intelligence Agent for GhostMyData. Your role is to monitor competitors in the data privacy and removal space, track their pricing and features, identify gaps and opportunities, and analyze market trends. Provide strategic intelligence to maintain competitive advantage.`;
    const mastermind = buildAgentMastermindPrompt("competitive-intel", 3);
    return `${base}${mastermind}`;
  }

  protected registerHandlers(): void {
    this.handlers.set("monitor-competitors", this.handleMonitorCompetitors.bind(this));
    this.handlers.set("track-pricing", this.handleTrackPricing.bind(this));
    this.handlers.set("analyze-gaps", this.handleAnalyzeGaps.bind(this));
    this.handlers.set("analyze-trends", this.handleAnalyzeTrends.bind(this));
  }

  private async handleMonitorCompetitors(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<CompetitorMonitorResult>> {
    const startTime = Date.now();
    const { competitor } = input as CompetitorMonitorInput;

    try {
      const competitorsToMonitor = competitor
        ? COMPETITORS.filter((c) => c.name.toLowerCase() === competitor.toLowerCase())
        : COMPETITORS;

      const changes: CompetitorMonitorResult["changes"] = [];
      const alerts: string[] = [];

      for (const comp of competitorsToMonitor) {
        // In production, this would:
        // 1. Fetch competitor websites
        // 2. Compare with stored snapshots
        // 3. Use AI to detect meaningful changes

        // Simulate detection of changes
        const changeChance = Math.random();

        if (changeChance < 0.1) {
          changes.push({
            competitor: comp.name,
            changeType: "PRICING",
            description: `${comp.name} updated their pricing structure`,
            impact: "HIGH",
            detectedAt: new Date().toISOString(),
          });
          alerts.push(`Pricing change detected: ${comp.name}`);
        } else if (changeChance < 0.2) {
          changes.push({
            competitor: comp.name,
            changeType: "FEATURE",
            description: `${comp.name} launched a new feature`,
            impact: "MEDIUM",
            detectedAt: new Date().toISOString(),
          });
        } else if (changeChance < 0.25) {
          changes.push({
            competitor: comp.name,
            changeType: "BROKER_COUNT",
            description: `${comp.name} increased their broker coverage`,
            impact: "MEDIUM",
            detectedAt: new Date().toISOString(),
          });
        }
      }

      return this.createSuccessResult<CompetitorMonitorResult>(
        {
          monitored: competitorsToMonitor.length,
          changes,
          alerts,
        },
        {
          capability: "monitor-competitors",
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
          code: "MONITOR_ERROR",
          message: error instanceof Error ? error.message : "Competitor monitoring failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "monitor-competitors",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleTrackPricing(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<PricingTrackingResult>> {
    const startTime = Date.now();
    const { competitor } = input as PricingTrackingInput;

    try {
      const competitorsToTrack = competitor
        ? COMPETITORS.filter((c) => c.name.toLowerCase() === competitor.toLowerCase())
        : COMPETITORS;

      // Simulated pricing data (in production, would scrape competitor sites)
      const pricingData: PricingTrackingResult["pricingData"] = competitorsToTrack.map((comp) => ({
        competitor: comp.name,
        plans: this.getCompetitorPlans(comp.name, comp.tier),
        lastUpdated: new Date().toISOString(),
        priceChange: Math.random() < 0.2
          ? {
              direction: Math.random() < 0.5 ? "up" : "down",
              percentage: Math.floor(Math.random() * 15) + 5,
            }
          : undefined,
      }));

      // Generate insights
      const insights: string[] = [];
      const avgMonthlyPrice =
        pricingData.reduce(
          (sum, p) => sum + (p.plans.find((plan) => plan.billingCycle === "monthly")?.price || 0),
          0
        ) / pricingData.length;

      insights.push(`Average monthly price in market: $${avgMonthlyPrice.toFixed(2)}`);

      const priceChanges = pricingData.filter((p) => p.priceChange);
      if (priceChanges.length > 0) {
        insights.push(`${priceChanges.length} competitors changed pricing recently`);
      }

      return this.createSuccessResult<PricingTrackingResult>(
        {
          tracked: competitorsToTrack.length,
          pricingData,
          insights,
        },
        {
          capability: "track-pricing",
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
          code: "PRICING_ERROR",
          message: error instanceof Error ? error.message : "Pricing tracking failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "track-pricing",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private getCompetitorPlans(
    name: string,
    tier: string
  ): PricingTrackingResult["pricingData"][0]["plans"] {
    const basePrice = tier === "premium" ? 15 : tier === "mid" ? 10 : 7;

    return [
      {
        name: "Basic",
        price: basePrice,
        billingCycle: "monthly",
        features: ["Basic removal", "Monthly scans", "Email support"],
      },
      {
        name: "Pro",
        price: basePrice * 2,
        billingCycle: "monthly",
        features: ["Full removal", "Weekly scans", "Priority support", "Dark web monitoring"],
      },
      {
        name: "Annual",
        price: basePrice * 12 * 0.8, // 20% discount
        billingCycle: "annual",
        features: ["Full removal", "Weekly scans", "Priority support", "Dark web monitoring"],
      },
    ];
  }

  private async handleAnalyzeGaps(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<FeatureGapResult>> {
    const startTime = Date.now();
    const { ourFeatures = [] } = input as FeatureGapInput;

    try {
      // Our features (would come from config in production)
      const ghostMyDataFeatures = ourFeatures.length > 0 ? ourFeatures : [
        "Automated removal",
        "Weekly scans",
        "Email notifications",
        "Dashboard",
        "API access",
        "Family plans",
        "Risk scoring",
      ];

      // Competitor features (would be tracked over time in production)
      const competitorFeatures: Record<string, string[]> = {
        DeleteMe: ["Automated removal", "Quarterly scans", "Phone support", "Dark web monitoring", "Identity theft insurance"],
        "Privacy Duck": ["Automated removal", "Monthly scans", "VPN included", "Password manager"],
        Kanary: ["Automated removal", "Real-time monitoring", "Credit monitoring", "Social media cleanup"],
        Incogni: ["Automated removal", "Weekly reports", "Browser extension", "International coverage"],
        Optery: ["Automated removal", "Daily scans", "Enterprise API", "SSO integration", "HIPAA compliance"],
      };

      // Find gaps - features competitors have that we don't
      const allCompetitorFeatures = new Set(
        Object.values(competitorFeatures).flat()
      );
      const ourFeatureSet = new Set(ghostMyDataFeatures);

      const gaps: FeatureGapResult["gaps"] = [];
      for (const feature of allCompetitorFeatures) {
        if (!ourFeatureSet.has(feature)) {
          const competitorsWithFeature = Object.entries(competitorFeatures)
            .filter(([, features]) => features.includes(feature))
            .map(([name]) => name);

          // Use Carlsen Positional Score to rank gaps by strategic value
          const positionalScore = carlsenPositionalScore({
            shortTermGain: Math.min(10, competitorsWithFeature.length * 2.5),
            longTermPosition: this.isHighValueFeature(feature) ? 8 : 5,
            opponentOptions: Math.min(10, competitorsWithFeature.length * 2),
            flexibility: competitorsWithFeature.length <= 2 ? 8 : 5,
          });

          // Derive priority from positional score
          const priority: "LOW" | "MEDIUM" | "HIGH" =
            positionalScore >= 65 ? "HIGH" : positionalScore >= 40 ? "MEDIUM" : "LOW";

          gaps.push({
            feature,
            competitors: competitorsWithFeature,
            priority,
            estimatedImpact: this.estimateFeatureImpact(feature),
          });
        }
      }

      // Find our advantages - features we have that competitors don't
      const advantages: FeatureGapResult["advantages"] = [];
      for (const feature of ghostMyDataFeatures) {
        const competitorsWithFeature = Object.entries(competitorFeatures)
          .filter(([, features]) => features.includes(feature))
          .map(([name]) => name);

        if (competitorsWithFeature.length < 2) {
          advantages.push({
            feature,
            description: `Only ${competitorsWithFeature.length || "no"} competitor(s) offer this`,
          });
        }
      }

      // Generate recommendations
      const recommendations = gaps
        .filter((g) => g.priority === "HIGH")
        .map((g) => `Consider adding ${g.feature} - ${g.competitors.length} competitors have it`);

      return this.createSuccessResult<FeatureGapResult>(
        {
          analyzed: Object.keys(competitorFeatures).length,
          gaps: gaps.sort((a, b) => {
            const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }),
          advantages,
          recommendations,
        },
        {
          capability: "analyze-gaps",
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
          code: "GAP_ERROR",
          message: error instanceof Error ? error.message : "Gap analysis failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "analyze-gaps",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private isHighValueFeature(feature: string): boolean {
    const highValueFeatures = [
      "Dark web monitoring",
      "Identity theft insurance",
      "Credit monitoring",
      "Real-time monitoring",
      "HIPAA compliance",
      "Enterprise API",
    ];
    return highValueFeatures.includes(feature);
  }

  private calculateFeaturePriority(
    feature: string,
    competitorCount: number
  ): "LOW" | "MEDIUM" | "HIGH" {
    const highPriorityFeatures = [
      "Dark web monitoring",
      "Identity theft insurance",
      "Credit monitoring",
      "Real-time monitoring",
    ];

    if (highPriorityFeatures.includes(feature) || competitorCount >= 3) {
      return "HIGH";
    }
    if (competitorCount >= 2) {
      return "MEDIUM";
    }
    return "LOW";
  }

  private estimateFeatureImpact(feature: string): string {
    const impactMap: Record<string, string> = {
      "Dark web monitoring": "High value add for premium users, drives upgrades",
      "Identity theft insurance": "Strong differentiator, reduces churn",
      "Credit monitoring": "Complementary service, increases stickiness",
      "VPN included": "Bundling opportunity, attracts privacy-conscious users",
      "Phone support": "Improves customer satisfaction, reduces tickets",
    };

    return impactMap[feature] || "Could attract new users and improve retention";
  }

  private async handleAnalyzeTrends(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<MarketTrendsResult>> {
    const startTime = Date.now();
    const { timeframe = "quarter" } = input as MarketTrendsInput;

    try {
      // In production, would analyze:
      // 1. Search trends for privacy terms
      // 2. News coverage of data privacy
      // 3. Regulatory announcements
      // 4. Competitor funding/acquisitions
      // 5. Social media sentiment

      const trends: MarketTrendsResult["trends"] = [
        {
          trend: "Privacy regulation expansion",
          direction: "growing",
          relevance: "HIGH",
          description: "More states implementing CCPA-like laws",
        },
        {
          trend: "Consumer privacy awareness",
          direction: "growing",
          relevance: "HIGH",
          description: "Post-breach headlines driving demand for privacy services",
        },
        {
          trend: "Enterprise privacy demand",
          direction: "growing",
          relevance: "MEDIUM",
          description: "Companies offering privacy benefits to employees",
        },
        {
          trend: "Data broker consolidation",
          direction: "stable",
          relevance: "MEDIUM",
          description: "Major brokers acquiring smaller ones",
        },
        {
          trend: "DIY privacy tools",
          direction: "declining",
          relevance: "LOW",
          description: "Users preferring managed services over manual opt-outs",
        },
      ];

      const opportunities = [
        "Enterprise/B2B market is underserved",
        "Family plans have high demand but limited offerings",
        "International expansion as GDPR awareness grows",
        "Integration partnerships with password managers/VPNs",
      ];

      const threats = [
        "Big tech companies may offer built-in privacy features",
        "Regulatory changes could affect business model",
        "Consolidation in market could create dominant player",
        "Data brokers evolving opt-out processes to be harder",
      ];

      return this.createSuccessResult<MarketTrendsResult>(
        {
          period: timeframe,
          trends,
          opportunities,
          threats,
        },
        {
          capability: "analyze-trends",
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
          code: "TRENDS_ERROR",
          message: error instanceof Error ? error.message : "Trend analysis failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "analyze-trends",
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

let competitiveIntelAgentInstance: CompetitiveIntelAgent | null = null;

export function getCompetitiveIntelAgent(): CompetitiveIntelAgent {
  if (!competitiveIntelAgentInstance) {
    competitiveIntelAgentInstance = new CompetitiveIntelAgent();
    registerAgent(competitiveIntelAgentInstance);
  }
  return competitiveIntelAgentInstance;
}

export async function monitorCompetitors(): Promise<CompetitorMonitorResult> {
  const agent = getCompetitiveIntelAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<CompetitorMonitorResult>(
    "monitor-competitors",
    {},
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Competitor monitoring failed");
}

export async function analyzeFeatureGaps(): Promise<FeatureGapResult> {
  const agent = getCompetitiveIntelAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.ON_DEMAND,
  });

  const result = await agent.execute<FeatureGapResult>(
    "analyze-gaps",
    {},
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Feature gap analysis failed");
}

export { CompetitiveIntelAgent };
export default getCompetitiveIntelAgent;
