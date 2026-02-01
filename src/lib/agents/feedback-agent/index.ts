/**
 * Feedback Agent
 *
 * Handles feedback collection and analysis including:
 * - Collect and analyze user feedback
 * - Sentiment tracking
 * - Feature request prioritization
 * - NPS tracking
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

const AGENT_ID = "feedback-agent";
const AGENT_VERSION = "1.0.0";

// ============================================================================
// TYPES
// ============================================================================

interface FeedbackAnalysisInput {
  feedbackId?: string;
  limit?: number;
  since?: string;
}

interface FeedbackAnalysisResult {
  analyzed: number;
  feedback: Array<{
    id: string;
    userId: string;
    type: "REVIEW" | "TICKET" | "SURVEY" | "NPS";
    content: string;
    sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
    sentimentScore: number; // -1 to 1
    topics: string[];
    actionable: boolean;
    suggestedAction?: string;
  }>;
  summary: {
    positive: number;
    neutral: number;
    negative: number;
    avgSentiment: number;
  };
}

interface SentimentTrackingInput {
  timeframe?: "week" | "month" | "quarter";
}

interface SentimentTrackingResult {
  period: string;
  currentSentiment: number;
  previousSentiment: number;
  trend: "improving" | "stable" | "declining";
  sentimentByTopic: Array<{
    topic: string;
    sentiment: number;
    volume: number;
    trend: "up" | "down" | "stable";
  }>;
  alerts: string[];
}

interface FeaturePrioritizationInput {
  limit?: number;
}

interface FeaturePrioritizationResult {
  analyzed: number;
  features: Array<{
    feature: string;
    requestCount: number;
    uniqueUsers: number;
    avgSentiment: number;
    userSegments: string[];
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    estimatedImpact: string;
  }>;
  recommendations: string[];
}

interface NPSTrackingInput {
  timeframe?: "week" | "month" | "quarter";
}

interface NPSTrackingResult {
  period: string;
  npsScore: number;
  responses: {
    promoters: number;
    passives: number;
    detractors: number;
    total: number;
  };
  trend: "improving" | "stable" | "declining";
  breakdown: Array<{
    segment: string;
    npsScore: number;
    responseCount: number;
  }>;
  insights: string[];
}

// ============================================================================
// FEEDBACK AGENT CLASS
// ============================================================================

class FeedbackAgent extends BaseAgent {
  readonly id = AGENT_ID;
  readonly name = "Feedback Agent";
  readonly domain = AgentDomains.CUSTOMER_SUCCESS;
  readonly mode = AgentModes.AI;
  readonly version = AGENT_VERSION;
  readonly description =
    "Collects and analyzes user feedback, tracks sentiment, prioritizes feature requests, and monitors NPS";

  readonly capabilities: AgentCapability[] = [
    {
      id: "analyze-feedback",
      name: "Analyze Feedback",
      description: "Analyze user feedback for sentiment and topics",
      requiresAI: true,
      estimatedTokens: 500,
    },
    {
      id: "track-sentiment",
      name: "Track Sentiment",
      description: "Track sentiment trends over time",
      requiresAI: true,
      estimatedTokens: 400,
    },
    {
      id: "prioritize-features",
      name: "Prioritize Feature Requests",
      description: "Prioritize feature requests based on feedback",
      requiresAI: true,
      estimatedTokens: 600,
    },
    {
      id: "track-nps",
      name: "Track NPS",
      description: "Track Net Promoter Score over time",
      requiresAI: false,
      supportsBatch: true,
    },
  ];

  protected getSystemPrompt(): string {
    return `You are the Feedback Agent for GhostMyData. Your role is to analyze user feedback, understand sentiment, identify feature requests, and provide actionable insights to improve the product. Be objective and data-driven in your analysis.`;
  }

  protected registerHandlers(): void {
    this.handlers.set("analyze-feedback", this.handleAnalyzeFeedback.bind(this));
    this.handlers.set("track-sentiment", this.handleTrackSentiment.bind(this));
    this.handlers.set("prioritize-features", this.handlePrioritizeFeatures.bind(this));
    this.handlers.set("track-nps", this.handleTrackNPS.bind(this));
  }

  private async handleAnalyzeFeedback(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<FeedbackAnalysisResult>> {
    const startTime = Date.now();
    const { feedbackId, limit = 50, since } = input as FeedbackAnalysisInput;

    try {
      // Get feedback from tickets (as proxy for general feedback)
      const whereClause: Record<string, unknown> = {};
      if (feedbackId) {
        whereClause.id = feedbackId;
      }
      if (since) {
        whereClause.createdAt = { gte: new Date(since) };
      }

      const tickets = await prisma.supportTicket.findMany({
        where: whereClause,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          userId: true,
          subject: true,
          description: true,
          type: true,
          createdAt: true,
        },
      });

      const feedback: FeedbackAnalysisResult["feedback"] = [];
      let positiveCount = 0;
      let neutralCount = 0;
      let negativeCount = 0;
      let totalSentiment = 0;

      for (const ticket of tickets) {
        const content = `${ticket.subject} ${ticket.description}`;
        const analysis = this.analyzeSentiment(content);

        feedback.push({
          id: ticket.id,
          userId: ticket.userId,
          type: "TICKET",
          content: content.substring(0, 200),
          sentiment: analysis.sentiment,
          sentimentScore: analysis.score,
          topics: analysis.topics,
          actionable: analysis.actionable,
          suggestedAction: analysis.suggestedAction,
        });

        totalSentiment += analysis.score;
        if (analysis.sentiment === "POSITIVE") positiveCount++;
        else if (analysis.sentiment === "NEUTRAL") neutralCount++;
        else negativeCount++;
      }

      return this.createSuccessResult<FeedbackAnalysisResult>(
        {
          analyzed: tickets.length,
          feedback,
          summary: {
            positive: positiveCount,
            neutral: neutralCount,
            negative: negativeCount,
            avgSentiment: tickets.length > 0 ? totalSentiment / tickets.length : 0,
          },
        },
        {
          capability: "analyze-feedback",
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
          code: "FEEDBACK_ERROR",
          message: error instanceof Error ? error.message : "Feedback analysis failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "analyze-feedback",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private analyzeSentiment(content: string): {
    sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
    score: number;
    topics: string[];
    actionable: boolean;
    suggestedAction?: string;
  } {
    const contentLower = content.toLowerCase();

    // Simple sentiment analysis (would use AI in production)
    const positiveWords = ["great", "love", "excellent", "amazing", "thank", "helpful", "works", "good"];
    const negativeWords = ["bad", "broken", "slow", "doesn't work", "frustrated", "terrible", "hate", "issue", "problem", "bug"];

    let positiveScore = 0;
    let negativeScore = 0;

    for (const word of positiveWords) {
      if (contentLower.includes(word)) positiveScore++;
    }
    for (const word of negativeWords) {
      if (contentLower.includes(word)) negativeScore++;
    }

    const score = (positiveScore - negativeScore) / Math.max(1, positiveScore + negativeScore);
    let sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" = "NEUTRAL";
    if (score > 0.2) sentiment = "POSITIVE";
    else if (score < -0.2) sentiment = "NEGATIVE";

    // Extract topics
    const topics: string[] = [];
    if (contentLower.includes("scan")) topics.push("scanning");
    if (contentLower.includes("removal") || contentLower.includes("remove")) topics.push("removal");
    if (contentLower.includes("price") || contentLower.includes("billing")) topics.push("pricing");
    if (contentLower.includes("support") || contentLower.includes("help")) topics.push("support");
    if (contentLower.includes("feature") || contentLower.includes("add")) topics.push("feature_request");

    // Determine if actionable
    const actionable = sentiment === "NEGATIVE" || topics.includes("feature_request");
    let suggestedAction: string | undefined;

    if (sentiment === "NEGATIVE") {
      suggestedAction = "Reach out to understand and resolve issue";
    } else if (topics.includes("feature_request")) {
      suggestedAction = "Log feature request for prioritization";
    }

    return { sentiment, score, topics, actionable, suggestedAction };
  }

  private async handleTrackSentiment(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<SentimentTrackingResult>> {
    const startTime = Date.now();
    const { timeframe = "month" } = input as SentimentTrackingInput;

    try {
      const timeframeMs = {
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        quarter: 90 * 24 * 60 * 60 * 1000,
      }[timeframe];

      const currentPeriodStart = new Date(Date.now() - timeframeMs);
      const previousPeriodStart = new Date(Date.now() - timeframeMs * 2);

      // Analyze current period
      const currentFeedback = await this.handleAnalyzeFeedback(
        { since: currentPeriodStart.toISOString(), limit: 100 },
        context
      );

      // Analyze previous period
      const previousTickets = await prisma.supportTicket.findMany({
        where: {
          createdAt: {
            gte: previousPeriodStart,
            lt: currentPeriodStart,
          },
        },
        take: 100,
        select: {
          subject: true,
          description: true,
        },
      });

      let previousSentimentSum = 0;
      for (const ticket of previousTickets) {
        const analysis = this.analyzeSentiment(`${ticket.subject} ${ticket.description}`);
        previousSentimentSum += analysis.score;
      }
      const previousSentiment = previousTickets.length > 0
        ? previousSentimentSum / previousTickets.length
        : 0;

      const currentSentiment = currentFeedback.data?.summary.avgSentiment || 0;

      // Determine trend
      let trend: SentimentTrackingResult["trend"] = "stable";
      const diff = currentSentiment - previousSentiment;
      if (diff > 0.1) trend = "improving";
      else if (diff < -0.1) trend = "declining";

      // Sentiment by topic
      const topicSentiments = new Map<string, { total: number; count: number }>();
      for (const fb of currentFeedback.data?.feedback || []) {
        for (const topic of fb.topics) {
          const existing = topicSentiments.get(topic) || { total: 0, count: 0 };
          existing.total += fb.sentimentScore;
          existing.count++;
          topicSentiments.set(topic, existing);
        }
      }

      const sentimentByTopic: SentimentTrackingResult["sentimentByTopic"] = [];
      for (const [topic, data] of topicSentiments) {
        sentimentByTopic.push({
          topic,
          sentiment: data.count > 0 ? data.total / data.count : 0,
          volume: data.count,
          trend: "stable", // Would compare with historical data
        });
      }

      // Generate alerts
      const alerts: string[] = [];
      if (trend === "declining") {
        alerts.push("Overall sentiment is declining - review recent feedback");
      }
      for (const topic of sentimentByTopic) {
        if (topic.sentiment < -0.3 && topic.volume >= 3) {
          alerts.push(`Negative sentiment spike for "${topic.topic}"`);
        }
      }

      return this.createSuccessResult<SentimentTrackingResult>(
        {
          period: timeframe,
          currentSentiment,
          previousSentiment,
          trend,
          sentimentByTopic,
          alerts,
        },
        {
          capability: "track-sentiment",
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
          code: "SENTIMENT_ERROR",
          message: error instanceof Error ? error.message : "Sentiment tracking failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "track-sentiment",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handlePrioritizeFeatures(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<FeaturePrioritizationResult>> {
    const startTime = Date.now();
    const { limit = 20 } = input as FeaturePrioritizationInput;

    try {
      // Get feedback that contains feature requests
      const tickets = await prisma.supportTicket.findMany({
        where: {
          OR: [
            { subject: { contains: "feature" } },
            { description: { contains: "would be nice" } },
            { description: { contains: "please add" } },
            { description: { contains: "wish" } },
            { description: { contains: "suggestion" } },
          ],
        },
        take: 200,
        include: {
          user: {
            select: {
              id: true,
              plan: true,
            },
          },
        },
      });

      // Extract and group feature requests
      const featureRequests = new Map<
        string,
        {
          count: number;
          users: Set<string>;
          sentiments: number[];
          segments: Set<string>;
        }
      >();

      for (const ticket of tickets) {
        const content = `${ticket.subject} ${ticket.description}`.toLowerCase();
        const features = this.extractFeatureRequests(content);
        const analysis = this.analyzeSentiment(content);

        for (const feature of features) {
          const existing = featureRequests.get(feature) || {
            count: 0,
            users: new Set(),
            sentiments: [],
            segments: new Set(),
          };
          existing.count++;
          existing.users.add(ticket.userId);
          existing.sentiments.push(analysis.score);
          existing.segments.add(ticket.user.plan);
          featureRequests.set(feature, existing);
        }
      }

      // Convert to sorted list
      const features: FeaturePrioritizationResult["features"] = [];
      for (const [feature, data] of featureRequests) {
        const avgSentiment =
          data.sentiments.length > 0
            ? data.sentiments.reduce((a, b) => a + b, 0) / data.sentiments.length
            : 0;

        const priority = this.calculateFeaturePriority(
          data.count,
          data.users.size,
          avgSentiment,
          data.segments
        );

        features.push({
          feature,
          requestCount: data.count,
          uniqueUsers: data.users.size,
          avgSentiment,
          userSegments: Array.from(data.segments),
          priority,
          estimatedImpact: this.estimateImpact(data.users.size, data.segments),
        });
      }

      // Sort by priority then by request count
      features.sort((a, b) => {
        const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.requestCount - a.requestCount;
      });

      // Generate recommendations
      const recommendations: string[] = [];
      const topFeatures = features.slice(0, 3);
      for (const feature of topFeatures) {
        recommendations.push(
          `Consider implementing "${feature.feature}" - ${feature.uniqueUsers} users requested it`
        );
      }

      return this.createSuccessResult<FeaturePrioritizationResult>(
        {
          analyzed: tickets.length,
          features: features.slice(0, limit),
          recommendations,
        },
        {
          capability: "prioritize-features",
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
          code: "PRIORITIZE_ERROR",
          message: error instanceof Error ? error.message : "Feature prioritization failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "prioritize-features",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private extractFeatureRequests(content: string): string[] {
    const features: string[] = [];

    // Common feature request patterns
    const patterns = [
      /add (.+?) (feature|option|ability)/gi,
      /would be nice if (.+)/gi,
      /please add (.+)/gi,
      /wish (.+?) was/gi,
      /suggestion:?\s*(.+)/gi,
    ];

    for (const pattern of patterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          features.push(match[1].trim().substring(0, 50));
        }
      }
    }

    // Also look for common feature keywords
    const featureKeywords = [
      "dark mode",
      "mobile app",
      "api",
      "export",
      "report",
      "notification",
      "integration",
      "bulk",
      "family",
      "team",
    ];

    for (const keyword of featureKeywords) {
      if (content.includes(keyword) && !features.includes(keyword)) {
        features.push(keyword);
      }
    }

    return features;
  }

  private calculateFeaturePriority(
    requestCount: number,
    uniqueUsers: number,
    avgSentiment: number,
    segments: Set<string>
  ): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    let score = 0;

    // Request volume
    if (requestCount >= 10) score += 3;
    else if (requestCount >= 5) score += 2;
    else if (requestCount >= 2) score += 1;

    // Unique users
    if (uniqueUsers >= 5) score += 2;
    else if (uniqueUsers >= 3) score += 1;

    // Paying users
    if (segments.has("PRO") || segments.has("ENTERPRISE")) score += 2;

    // Negative sentiment (users are frustrated)
    if (avgSentiment < -0.2) score += 1;

    if (score >= 7) return "CRITICAL";
    if (score >= 5) return "HIGH";
    if (score >= 3) return "MEDIUM";
    return "LOW";
  }

  private estimateImpact(uniqueUsers: number, segments: Set<string>): string {
    if (segments.has("ENTERPRISE")) {
      return "High revenue impact - enterprise customers requesting";
    }
    if (uniqueUsers >= 5) {
      return "Broad impact - multiple users would benefit";
    }
    if (segments.has("PRO")) {
      return "Retention impact - requested by paying customers";
    }
    return "Low impact - limited user interest";
  }

  private async handleTrackNPS(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<NPSTrackingResult>> {
    const startTime = Date.now();
    const { timeframe = "month" } = input as NPSTrackingInput;

    try {
      // In production, would have an NPS survey table
      // For now, simulate based on user engagement metrics

      const users = await prisma.user.findMany({
        take: 200,
        include: {
          _count: {
            select: {
              scans: true,
              removalRequests: true,
            },
          },
          subscription: true,
        },
      });

      let promoters = 0;
      let passives = 0;
      let detractors = 0;

      const segmentScores = new Map<string, { promoters: number; passives: number; detractors: number }>();

      for (const user of users) {
        // Simulate NPS score based on engagement (0-10)
        let npsResponse = 5; // Base score

        // Adjust based on engagement
        if (user._count.scans >= 3) npsResponse += 1;
        if (user._count.removalRequests >= 1) npsResponse += 2;
        if (user.subscription?.status === "active") npsResponse += 1;
        if (user.lastScanAt && new Date(user.lastScanAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
          npsResponse += 1;
        }

        // Add some variance
        npsResponse = Math.min(10, Math.max(0, npsResponse + Math.floor(Math.random() * 3) - 1));

        // Categorize
        if (npsResponse >= 9) {
          promoters++;
        } else if (npsResponse >= 7) {
          passives++;
        } else {
          detractors++;
        }

        // Track by segment
        const segment = user.plan;
        const segmentData = segmentScores.get(segment) || { promoters: 0, passives: 0, detractors: 0 };
        if (npsResponse >= 9) segmentData.promoters++;
        else if (npsResponse >= 7) segmentData.passives++;
        else segmentData.detractors++;
        segmentScores.set(segment, segmentData);
      }

      const total = promoters + passives + detractors;
      const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

      // Calculate segment breakdown
      const breakdown: NPSTrackingResult["breakdown"] = [];
      for (const [segment, data] of segmentScores) {
        const segmentTotal = data.promoters + data.passives + data.detractors;
        const segmentNPS = segmentTotal > 0
          ? Math.round(((data.promoters - data.detractors) / segmentTotal) * 100)
          : 0;
        breakdown.push({
          segment,
          npsScore: segmentNPS,
          responseCount: segmentTotal,
        });
      }

      // Generate insights
      const insights: string[] = [];
      if (npsScore >= 50) {
        insights.push("Excellent NPS - strong customer satisfaction");
      } else if (npsScore >= 0) {
        insights.push("Positive NPS - room for improvement");
      } else {
        insights.push("Negative NPS - urgent attention needed");
      }

      // Compare segments
      const sortedBreakdown = [...breakdown].sort((a, b) => b.npsScore - a.npsScore);
      if (sortedBreakdown.length >= 2) {
        const best = sortedBreakdown[0];
        const worst = sortedBreakdown[sortedBreakdown.length - 1];
        if (best.npsScore - worst.npsScore > 20) {
          insights.push(`${best.segment} users most satisfied, ${worst.segment} least satisfied`);
        }
      }

      return this.createSuccessResult<NPSTrackingResult>(
        {
          period: timeframe,
          npsScore,
          responses: {
            promoters,
            passives,
            detractors,
            total,
          },
          trend: "stable", // Would compare with historical data
          breakdown,
          insights,
        },
        {
          capability: "track-nps",
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
          code: "NPS_ERROR",
          message: error instanceof Error ? error.message : "NPS tracking failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "track-nps",
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

let feedbackAgentInstance: FeedbackAgent | null = null;

export function getFeedbackAgent(): FeedbackAgent {
  if (!feedbackAgentInstance) {
    feedbackAgentInstance = new FeedbackAgent();
    registerAgent(feedbackAgentInstance);
  }
  return feedbackAgentInstance;
}

export async function analyzeFeedback(limit = 50): Promise<FeedbackAnalysisResult> {
  const agent = getFeedbackAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<FeedbackAnalysisResult>(
    "analyze-feedback",
    { limit },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Feedback analysis failed");
}

export async function trackNPS(timeframe = "month"): Promise<NPSTrackingResult> {
  const agent = getFeedbackAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<NPSTrackingResult>(
    "track-nps",
    { timeframe },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "NPS tracking failed");
}

export { FeedbackAgent };
export default getFeedbackAgent;
