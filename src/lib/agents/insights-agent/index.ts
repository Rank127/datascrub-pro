/**
 * Insights Agent
 *
 * Handles analytics and insights including:
 * - Risk scoring
 * - Report generation
 * - Predictions and recommendations
 *
 * Replaces cron jobs: reports
 */

import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";
import { BaseAgent, createAgentContext, MODEL_HAIKU } from "../base-agent";
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

const AGENT_ID = "insights-agent";
const AGENT_VERSION = "1.0.0";

// ============================================================================
// TYPES
// ============================================================================

interface RiskInput {
  userId: string;
  scanResults?: unknown;
}

interface RiskResult {
  userId: string;
  riskScore: number; // 0-100
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  recommendations: string[];
}

interface ReportInput {
  type?: "weekly" | "monthly" | "executive";
  userId?: string;
}

interface ReportResult {
  type: string;
  generatedAt: string;
  metrics: {
    totalUsers?: number;
    activeUsers?: number;
    totalScans?: number;
    totalExposures?: number;
    removalRate?: number;
    avgRiskScore?: number;
  };
  highlights: string[];
  trends?: Array<{
    metric: string;
    direction: "up" | "down" | "stable";
    change: number;
  }>;
}

interface PredictInput {
  type: "exposure" | "removal" | "growth";
  timeframe?: "week" | "month" | "quarter";
}

interface PredictResult {
  type: string;
  timeframe: string;
  predictions: Array<{
    metric: string;
    currentValue: number;
    predictedValue: number;
    confidence: number;
  }>;
  insights: string[];
}

// ============================================================================
// INSIGHTS AGENT CLASS
// ============================================================================

class InsightsAgent extends BaseAgent {
  constructor() {
    super({ model: MODEL_HAIKU }); // Risk scoring is formulaic → Haiku
  }

  readonly id = AGENT_ID;
  readonly name = "Insights Agent";
  readonly domain = AgentDomains.CORE;
  readonly mode = AgentModes.HYBRID;
  readonly version = AGENT_VERSION;
  readonly description =
    "Generates risk scores, reports, predictions, and actionable insights";

  readonly capabilities: AgentCapability[] = [
    {
      id: "calculate-risk",
      name: "Calculate Risk Score",
      description: "Calculate privacy risk score for a user",
      requiresAI: true,
      estimatedTokens: 300,
    },
    {
      id: "generate-report",
      name: "Generate Report",
      description: "Generate analytics reports",
      requiresAI: true,
      estimatedTokens: 600,
    },
    {
      id: "predict",
      name: "Generate Predictions",
      description: "Generate predictions based on historical data",
      requiresAI: true,
      estimatedTokens: 400,
    },
  ];

  protected getSystemPrompt(): string {
    return `You are the Insights Agent for GhostMyData. Analyze data to generate risk scores, insights, and predictions.`;
  }

  protected registerHandlers(): void {
    this.handlers.set("calculate-risk", this.handleCalculateRisk.bind(this));
    this.handlers.set("generate-report", this.handleGenerateReport.bind(this));
    this.handlers.set("predict", this.handlePredict.bind(this));
  }

  private async handleCalculateRisk(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<RiskResult>> {
    const startTime = Date.now();
    const { userId } = input as RiskInput;

    try {
      // Get user's exposure data
      const [exposures, removals] = await Promise.all([
        prisma.exposure.findMany({
          where: { userId, status: "ACTIVE" },
          select: {
            severity: true,
            dataType: true,
            source: true,
          },
        }),
        prisma.removalRequest.count({
          where: { userId, status: "VERIFIED" },
        }),
      ]);

      // Calculate risk factors
      const factors: RiskResult["factors"] = [];
      let totalRisk = 0;

      // Factor: High severity exposures
      const highSeverity = exposures.filter(
        (e) => e.severity === "HIGH" || e.severity === "CRITICAL"
      ).length;
      if (highSeverity > 0) {
        const impact = Math.min(highSeverity * 10, 40);
        totalRisk += impact;
        factors.push({
          factor: "high_severity_exposures",
          impact,
          description: `${highSeverity} high/critical severity exposures found`,
        });
      }

      // Factor: Sensitive data types
      const sensitiveTypes = ["SSN", "FINANCIAL", "MEDICAL", "BIOMETRIC"];
      const sensitiveExposures = exposures.filter((e) =>
        sensitiveTypes.includes(e.dataType)
      ).length;
      if (sensitiveExposures > 0) {
        const impact = Math.min(sensitiveExposures * 15, 35);
        totalRisk += impact;
        factors.push({
          factor: "sensitive_data",
          impact,
          description: `${sensitiveExposures} exposures contain sensitive data`,
        });
      }

      // Factor: Total exposure count
      if (exposures.length > 10) {
        const impact = Math.min((exposures.length - 10) * 2, 20);
        totalRisk += impact;
        factors.push({
          factor: "exposure_volume",
          impact,
          description: `${exposures.length} total active exposures`,
        });
      }

      // Factor: Low removal rate
      const totalExposures = exposures.length + removals;
      if (totalExposures > 0) {
        const removalRate = removals / totalExposures;
        if (removalRate < 0.3) {
          const impact = 15;
          totalRisk += impact;
          factors.push({
            factor: "low_removal_rate",
            impact,
            description: `Only ${(removalRate * 100).toFixed(0)}% of exposures removed`,
          });
        }
      }

      // Normalize risk score
      const riskScore = Math.min(Math.round(totalRisk), 100);

      // Determine risk level
      let riskLevel: RiskResult["riskLevel"] = "LOW";
      if (riskScore >= 75) riskLevel = "CRITICAL";
      else if (riskScore >= 50) riskLevel = "HIGH";
      else if (riskScore >= 25) riskLevel = "MEDIUM";

      // Generate recommendations
      const recommendations: string[] = [];
      if (highSeverity > 0) {
        recommendations.push("Prioritize removal of high-severity exposures");
      }
      if (sensitiveExposures > 0) {
        recommendations.push("Consider credit monitoring for sensitive data exposure");
      }
      if (exposures.length > removals) {
        recommendations.push("Review and initiate pending removal requests");
      }
      if (riskScore > 50) {
        recommendations.push("Run a comprehensive privacy scan");
      }

      return this.createSuccessResult<RiskResult>(
        {
          userId,
          riskScore,
          riskLevel,
          factors,
          recommendations,
        },
        {
          capability: "calculate-risk",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
        { confidence: 0.85 }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "RISK_ERROR",
          message: error instanceof Error ? error.message : "Risk calculation failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "calculate-risk",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleGenerateReport(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<ReportResult>> {
    const startTime = Date.now();
    const { type = "weekly" } = input as ReportInput;

    try {
      const now = new Date();
      let startDate: Date;

      if (type === "monthly") {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (type === "executive") {
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      } else {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Gather metrics
      const [
        totalUsers,
        newUsers,
        totalScans,
        totalExposures,
        removalsCompleted,
        activeExposures,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: startDate } } }),
        prisma.scan.count({ where: { createdAt: { gte: startDate } } }),
        prisma.exposure.count({ where: { firstFoundAt: { gte: startDate } } }),
        prisma.removalRequest.count({
          where: { status: "VERIFIED", completedAt: { gte: startDate } },
        }),
        prisma.exposure.count({ where: { status: "ACTIVE" } }),
      ]);

      // Calculate metrics
      const removalRate =
        totalExposures > 0 ? removalsCompleted / totalExposures : 0;

      // Generate highlights
      const highlights: string[] = [];

      if (newUsers > 0) {
        highlights.push(`${newUsers} new users joined this period`);
      }
      if (removalsCompleted > 0) {
        highlights.push(`${removalsCompleted} successful data removals`);
      }
      if (removalRate > 0.5) {
        highlights.push(
          `Strong removal rate: ${(removalRate * 100).toFixed(0)}%`
        );
      }
      if (totalScans > totalUsers) {
        highlights.push("High user engagement with scans");
      }

      // Calculate trends (simplified - would use historical data in production)
      const trends: ReportResult["trends"] = [
        {
          metric: "users",
          direction: newUsers > 0 ? "up" : "stable",
          change: newUsers,
        },
        {
          metric: "exposures",
          direction:
            totalExposures > activeExposures ? "down" : "up",
          change: totalExposures - activeExposures,
        },
      ];

      return this.createSuccessResult<ReportResult>(
        {
          type,
          generatedAt: now.toISOString(),
          metrics: {
            totalUsers,
            activeUsers: newUsers,
            totalScans,
            totalExposures,
            removalRate,
          },
          highlights,
          trends,
        },
        {
          capability: "generate-report",
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
          code: "REPORT_ERROR",
          message: error instanceof Error ? error.message : "Report generation failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "generate-report",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handlePredict(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<PredictResult>> {
    const startTime = Date.now();
    const { type = "growth", timeframe = "month" } = input as PredictInput;

    try {
      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get historical data for predictions
      const [
        currentUsers,
        lastMonthUsers,
        currentExposures,
        lastMonthExposures,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { lt: oneMonthAgo } } }),
        prisma.exposure.count({ where: { status: "ACTIVE" } }),
        prisma.exposure.count({
          where: { firstFoundAt: { lt: oneMonthAgo }, status: "ACTIVE" },
        }),
      ]);

      const predictions: PredictResult["predictions"] = [];
      const insights: string[] = [];

      if (type === "growth") {
        const userGrowthRate =
          lastMonthUsers > 0
            ? (currentUsers - lastMonthUsers) / lastMonthUsers
            : 0.1;
        const predictedUsers = Math.round(
          currentUsers * (1 + userGrowthRate)
        );

        predictions.push({
          metric: "users",
          currentValue: currentUsers,
          predictedValue: predictedUsers,
          confidence: 0.7,
        });

        if (userGrowthRate > 0.1) {
          insights.push("Strong user growth trajectory");
        } else if (userGrowthRate < 0) {
          insights.push("User growth slowing - consider marketing initiatives");
        }
      }

      if (type === "exposure") {
        const exposureRate =
          lastMonthExposures > 0
            ? (currentExposures - lastMonthExposures) / lastMonthExposures
            : 0;
        const predictedExposures = Math.round(
          currentExposures * (1 + exposureRate * 0.5)
        );

        predictions.push({
          metric: "exposures",
          currentValue: currentExposures,
          predictedValue: predictedExposures,
          confidence: 0.6,
        });

        if (exposureRate > 0.2) {
          insights.push("Exposure volume increasing - scale removal capacity");
        }
      }

      return this.createSuccessResult<PredictResult>(
        {
          type,
          timeframe,
          predictions,
          insights,
        },
        {
          capability: "predict",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
        { confidence: 0.65 }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "PREDICT_ERROR",
          message: error instanceof Error ? error.message : "Prediction failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "predict",
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

let insightsAgentInstance: InsightsAgent | null = null;

export function getInsightsAgent(): InsightsAgent {
  if (!insightsAgentInstance) {
    insightsAgentInstance = new InsightsAgent();
    registerAgent(insightsAgentInstance);
  }
  return insightsAgentInstance;
}

export async function calculateUserRisk(userId: string): Promise<RiskResult> {
  const agent = getInsightsAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.ON_DEMAND,
  });

  const result = await agent.execute<RiskResult>(
    "calculate-risk",
    { userId },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Risk calculation failed");
}

export async function generateWeeklyReport(): Promise<ReportResult> {
  const agent = getInsightsAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<ReportResult>(
    "generate-report",
    { type: "weekly" },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Report generation failed");
}

export { InsightsAgent };
export default getInsightsAgent;
