/**
 * Onboarding Agent
 *
 * Handles user onboarding including:
 * - Personalized onboarding flows
 * - First-scan guidance
 * - Feature recommendations
 * - Progress tracking
 */

import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";
import { computeEffectivePlan, FAMILY_PLAN_INCLUDE } from "@/lib/family";
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

const AGENT_ID = "onboarding-agent";
const AGENT_VERSION = "1.0.0";

// Onboarding milestones
const MILESTONES = [
  { id: "account_created", name: "Account Created", order: 1 },
  { id: "profile_complete", name: "Profile Completed", order: 2 },
  { id: "first_scan", name: "First Scan Run", order: 3 },
  { id: "results_reviewed", name: "Results Reviewed", order: 4 },
  { id: "first_removal", name: "First Removal Initiated", order: 5 },
  { id: "notifications_configured", name: "Notifications Configured", order: 6 },
];

// ============================================================================
// TYPES
// ============================================================================

interface OnboardingFlowInput {
  userId: string;
  currentStep?: string;
}

interface OnboardingFlowResult {
  userId: string;
  currentStep: string;
  completedSteps: string[];
  nextSteps: Array<{
    step: string;
    title: string;
    description: string;
    actionUrl: string;
    estimatedTime: string;
  }>;
  progressPercent: number;
  personalization: {
    welcomeMessage: string;
    primaryGoal: string;
    suggestedActions: string[];
  };
}

interface FirstScanGuideInput {
  userId: string;
}

interface FirstScanGuideResult {
  userId: string;
  guideSteps: Array<{
    step: number;
    title: string;
    description: string;
    tips: string[];
    expectedOutcome: string;
  }>;
  whatToExpect: string[];
  afterScan: string[];
}

interface FeatureRecommendationInput {
  userId: string;
  context?: "dashboard" | "scan_results" | "removal" | "settings";
}

interface FeatureRecommendationResult {
  userId: string;
  recommendations: Array<{
    feature: string;
    title: string;
    description: string;
    benefit: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    actionUrl: string;
    dismissed?: boolean;
  }>;
  basedOn: string[];
}

interface ProgressTrackingInput {
  userId?: string;
  limit?: number;
}

interface ProgressTrackingResult {
  tracked: number;
  userProgress: Array<{
    userId: string;
    email: string;
    onboardingStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "STALLED";
    progressPercent: number;
    completedMilestones: string[];
    nextMilestone?: string;
    daysInOnboarding: number;
    needsIntervention: boolean;
  }>;
  summary: {
    notStarted: number;
    inProgress: number;
    completed: number;
    stalled: number;
  };
}

// ============================================================================
// ONBOARDING AGENT CLASS
// ============================================================================

class OnboardingAgent extends BaseAgent {
  readonly id = AGENT_ID;
  readonly name = "Onboarding Agent";
  readonly domain = AgentDomains.USER_EXPERIENCE;
  readonly mode = AgentModes.HYBRID;
  readonly version = AGENT_VERSION;
  readonly description =
    "Personalizes onboarding flows, guides first scans, recommends features, and tracks progress";

  readonly capabilities: AgentCapability[] = [
    {
      id: "personalize-flow",
      name: "Personalize Onboarding Flow",
      description: "Create personalized onboarding experience for users",
      requiresAI: true,
      estimatedTokens: 400,
    },
    {
      id: "guide-first-scan",
      name: "Guide First Scan",
      description: "Provide guidance for user's first privacy scan",
      requiresAI: false,
    },
    {
      id: "recommend-features",
      name: "Recommend Features",
      description: "Suggest features based on user behavior and needs",
      requiresAI: true,
      estimatedTokens: 300,
    },
    {
      id: "track-progress",
      name: "Track Onboarding Progress",
      description: "Monitor user onboarding progress and identify stalled users",
      requiresAI: false,
      supportsBatch: true,
    },
  ];

  protected getSystemPrompt(): string {
    return `You are the Onboarding Agent for GhostMyData. Your role is to help new users get started with the platform, understand their privacy needs, and guide them to valuable features. Be welcoming, helpful, and focused on user success.`;
  }

  protected registerHandlers(): void {
    this.handlers.set("personalize-flow", this.handlePersonalizeFlow.bind(this));
    this.handlers.set("guide-first-scan", this.handleGuideFirstScan.bind(this));
    this.handlers.set("recommend-features", this.handleRecommendFeatures.bind(this));
    this.handlers.set("track-progress", this.handleTrackProgress.bind(this));
  }

  private async handlePersonalizeFlow(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<OnboardingFlowResult>> {
    const startTime = Date.now();
    const { userId, currentStep } = input as OnboardingFlowInput;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: { select: { plan: true } },
          ...FAMILY_PLAN_INCLUDE,
          _count: {
            select: {
              scans: true,
              exposures: true,
              removalRequests: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Determine completed steps
      const completedSteps: string[] = ["account_created"];

      if (user.name) {
        completedSteps.push("profile_complete");
      }
      if (user._count.scans > 0) {
        completedSteps.push("first_scan");
        completedSteps.push("results_reviewed");
      }
      if (user._count.removalRequests > 0) {
        completedSteps.push("first_removal");
      }
      if (user.smsPhoneVerified) {
        completedSteps.push("notifications_configured");
      }

      // Calculate progress
      const progressPercent = Math.round((completedSteps.length / MILESTONES.length) * 100);

      // Determine next steps
      const nextSteps = MILESTONES.filter((m) => !completedSteps.includes(m.id))
        .slice(0, 3)
        .map((m) => ({
          step: m.id,
          title: m.name,
          description: this.getStepDescription(m.id),
          actionUrl: this.getStepActionUrl(m.id),
          estimatedTime: this.getStepEstimatedTime(m.id),
        }));

      // Generate personalization
      const welcomeMessage = user.name
        ? `Welcome back, ${user.name.split(" ")[0]}!`
        : "Welcome to GhostMyData!";

      const primaryGoal = this.determinePrimaryGoal(completedSteps, user._count);

      const suggestedActions = this.getSuggestedActions(completedSteps, computeEffectivePlan(user));

      return this.createSuccessResult<OnboardingFlowResult>(
        {
          userId,
          currentStep: currentStep || nextSteps[0]?.step || "completed",
          completedSteps,
          nextSteps,
          progressPercent,
          personalization: {
            welcomeMessage,
            primaryGoal,
            suggestedActions,
          },
        },
        {
          capability: "personalize-flow",
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
          code: "ONBOARDING_ERROR",
          message: error instanceof Error ? error.message : "Onboarding personalization failed",
          retryable: true,
        },
        needsHumanReview: false,
        metadata: {
          agentId: this.id,
          capability: "personalize-flow",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private getStepDescription(stepId: string): string {
    const descriptions: Record<string, string> = {
      account_created: "Your account is set up and ready to use",
      profile_complete: "Add your name, email, phone, and address for best scan results",
      first_scan: "Run your first privacy scan to find your data online",
      results_reviewed: "Review your scan results and understand your exposure",
      first_removal: "Start removing your data from data brokers",
      notifications_configured: "Set up alerts for new exposures and updates",
    };
    return descriptions[stepId] || "";
  }

  private getStepActionUrl(stepId: string): string {
    const urls: Record<string, string> = {
      profile_complete: "/settings/profile",
      first_scan: "/scan",
      results_reviewed: "/dashboard",
      first_removal: "/removals",
      notifications_configured: "/settings/notifications",
    };
    return urls[stepId] || "/dashboard";
  }

  private getStepEstimatedTime(stepId: string): string {
    const times: Record<string, string> = {
      profile_complete: "2 minutes",
      first_scan: "5 minutes",
      results_reviewed: "10 minutes",
      first_removal: "5 minutes",
      notifications_configured: "2 minutes",
    };
    return times[stepId] || "5 minutes";
  }

  private determinePrimaryGoal(
    completedSteps: string[],
    counts: { scans: number; exposures: number; removalRequests: number }
  ): string {
    if (!completedSteps.includes("first_scan")) {
      return "Discover where your personal data appears online";
    }
    if (counts.exposures > 0 && counts.removalRequests === 0) {
      return "Start removing your exposed data";
    }
    if (counts.removalRequests > 0) {
      return "Monitor your privacy and maintain protection";
    }
    return "Protect your personal information";
  }

  private getSuggestedActions(completedSteps: string[], plan: string): string[] {
    const actions: string[] = [];

    if (!completedSteps.includes("first_scan")) {
      actions.push("Run your first privacy scan");
    }
    if (completedSteps.includes("first_scan") && !completedSteps.includes("first_removal")) {
      actions.push("Review and remove found exposures");
    }
    if (plan === "FREE") {
      actions.push("Upgrade to automate your privacy protection");
    }
    if (!completedSteps.includes("notifications_configured")) {
      actions.push("Set up privacy alerts");
    }

    return actions.slice(0, 3);
  }

  private async handleGuideFirstScan(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<FirstScanGuideResult>> {
    const startTime = Date.now();
    const { userId } = input as FirstScanGuideInput;

    try {
      const _user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });

      const guideSteps = [
        {
          step: 1,
          title: "Complete Your Profile",
          description: "The more info you provide, the more exposures we can find. Even just an email works — but adding your name, phone, address, and date of birth gives the best results.",
          tips: [
            "Email-only profiles will find exact email matches on data brokers",
            "Adding your full name dramatically increases the number of exposures found",
            "Include phone numbers, home addresses, and date of birth for maximum coverage",
            "Add any previous names or aliases you've used",
          ],
          expectedOutcome: "More complete profiles find more exposures across data broker sites",
        },
        {
          step: 2,
          title: "Start the Scan",
          description: "Click 'Start Scan' to begin searching for your personal data",
          tips: [
            "The scan typically takes 2-5 minutes",
            "You can close the page - we'll email you when done",
            "First scans search over 200+ data brokers",
          ],
          expectedOutcome: "Comprehensive search of known data broker sites",
        },
        {
          step: 3,
          title: "Review Results",
          description: "See where your information appears online",
          tips: [
            "Results are sorted by severity",
            "Click each result to see details",
            "Don't worry - we can help remove your data",
          ],
          expectedOutcome: "Clear understanding of your online exposure",
        },
      ];

      const whatToExpect = [
        "Most people have data on 10-50 data broker sites",
        "Common exposures include name, address, and phone number",
        "Some sites may have outdated or incorrect information",
        "Results show where your data is publicly accessible",
      ];

      const afterScan = [
        "Review each exposure to understand the risk",
        "Prioritize high-severity exposures for removal",
        "Set up monitoring for ongoing protection",
        "Consider upgrading for automated removal",
      ];

      return this.createSuccessResult<FirstScanGuideResult>(
        {
          userId,
          guideSteps,
          whatToExpect,
          afterScan,
        },
        {
          capability: "guide-first-scan",
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
          code: "GUIDE_ERROR",
          message: error instanceof Error ? error.message : "First scan guide failed",
          retryable: true,
        },
        needsHumanReview: false,
        metadata: {
          agentId: this.id,
          capability: "guide-first-scan",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleRecommendFeatures(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<FeatureRecommendationResult>> {
    const startTime = Date.now();
    const { userId, context: featureContext = "dashboard" } = input as FeatureRecommendationInput;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: { select: { plan: true } },
          ...FAMILY_PLAN_INCLUDE,
          _count: {
            select: {
              scans: true,
              exposures: true,
              removalRequests: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const recommendations: FeatureRecommendationResult["recommendations"] = [];
      const basedOn: string[] = [];
      const userPlanEff = computeEffectivePlan(user);

      // Recommend based on user state (use effective plan to include family members)
      if (userPlanEff === "FREE" && user._count.exposures > 5) {
        recommendations.push({
          feature: "auto_removal",
          title: "Automated Removal",
          description: "Let us automatically remove your data from data brokers",
          benefit: `Remove ${user._count.exposures} exposures without manual effort`,
          priority: "HIGH",
          actionUrl: "/upgrade",
        });
        basedOn.push("high_exposure_count");
      }

      if (user._count.scans < 2) {
        recommendations.push({
          feature: "scheduled_scans",
          title: "Scheduled Scans",
          description: "Set up regular scans to catch new exposures",
          benefit: "Stay protected with automatic monitoring",
          priority: "MEDIUM",
          actionUrl: "/settings/scans",
        });
        basedOn.push("low_scan_frequency");
      }

      if (!user.smsPhoneVerified) {
        recommendations.push({
          feature: "notifications",
          title: "Privacy Alerts",
          description: "Get notified when we find new exposures",
          benefit: "Never miss a privacy threat",
          priority: "MEDIUM",
          actionUrl: "/settings/notifications",
        });
        basedOn.push("notifications_not_configured");
      }

      if (featureContext === "scan_results" && user._count.exposures > 0) {
        recommendations.push({
          feature: "risk_report",
          title: "Privacy Risk Report",
          description: "Get a detailed analysis of your privacy risks",
          benefit: "Understand and prioritize your privacy concerns",
          priority: "LOW",
          actionUrl: "/reports/risk",
        });
        basedOn.push("has_exposures");
      }

      return this.createSuccessResult<FeatureRecommendationResult>(
        {
          userId,
          recommendations: recommendations.slice(0, 3),
          basedOn,
        },
        {
          capability: "recommend-features",
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
          code: "RECOMMEND_ERROR",
          message: error instanceof Error ? error.message : "Feature recommendation failed",
          retryable: true,
        },
        needsHumanReview: false,
        metadata: {
          agentId: this.id,
          capability: "recommend-features",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleTrackProgress(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<ProgressTrackingResult>> {
    const startTime = Date.now();
    const { userId, limit = 100 } = input as ProgressTrackingInput;

    try {
      const users = await prisma.user.findMany({
        where: userId ? { id: userId } : {},
        take: limit,
        include: {
          _count: {
            select: {
              scans: true,
              removalRequests: true,
            },
          },
        },
      });

      const summary = { notStarted: 0, inProgress: 0, completed: 0, stalled: 0 };
      const userProgress: ProgressTrackingResult["userProgress"] = [];

      for (const user of users) {
        const completedMilestones: string[] = ["account_created"];
        if (user.name) completedMilestones.push("profile_complete");
        if (user._count.scans > 0) {
          completedMilestones.push("first_scan");
          completedMilestones.push("results_reviewed");
        }
        if (user._count.removalRequests > 0) completedMilestones.push("first_removal");
        if (user.smsPhoneVerified) completedMilestones.push("notifications_configured");

        const progressPercent = Math.round((completedMilestones.length / MILESTONES.length) * 100);
        const daysInOnboarding = Math.floor(
          (Date.now() - new Date(user.createdAt).getTime()) / (24 * 60 * 60 * 1000)
        );

        let onboardingStatus: ProgressTrackingResult["userProgress"][0]["onboardingStatus"];
        let needsIntervention = false;

        if (progressPercent === 0) {
          onboardingStatus = "NOT_STARTED";
          summary.notStarted++;
        } else if (progressPercent === 100) {
          onboardingStatus = "COMPLETED";
          summary.completed++;
        } else if (daysInOnboarding > 7 && progressPercent < 50) {
          onboardingStatus = "STALLED";
          needsIntervention = true;
          summary.stalled++;
        } else {
          onboardingStatus = "IN_PROGRESS";
          summary.inProgress++;
        }

        const nextMilestone = MILESTONES.find((m) => !completedMilestones.includes(m.id));

        userProgress.push({
          userId: user.id,
          email: user.email,
          onboardingStatus,
          progressPercent,
          completedMilestones,
          nextMilestone: nextMilestone?.id,
          daysInOnboarding,
          needsIntervention,
        });
      }

      return this.createSuccessResult<ProgressTrackingResult>(
        {
          tracked: users.length,
          userProgress,
          summary,
        },
        {
          capability: "track-progress",
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
          code: "TRACKING_ERROR",
          message: error instanceof Error ? error.message : "Progress tracking failed",
          retryable: true,
        },
        needsHumanReview: false,
        metadata: {
          agentId: this.id,
          capability: "track-progress",
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

let onboardingAgentInstance: OnboardingAgent | null = null;

export function getOnboardingAgent(): OnboardingAgent {
  if (!onboardingAgentInstance) {
    onboardingAgentInstance = new OnboardingAgent();
    registerAgent(onboardingAgentInstance);
  }
  return onboardingAgentInstance;
}

export async function personalizeOnboarding(userId: string): Promise<OnboardingFlowResult> {
  const agent = getOnboardingAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.ON_DEMAND,
  });

  const result = await agent.execute<OnboardingFlowResult>(
    "personalize-flow",
    { userId },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Onboarding personalization failed");
}

export async function trackOnboardingProgress(limit = 100): Promise<ProgressTrackingResult> {
  const agent = getOnboardingAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<ProgressTrackingResult>(
    "track-progress",
    { limit },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Progress tracking failed");
}

export { OnboardingAgent };
export default getOnboardingAgent;
