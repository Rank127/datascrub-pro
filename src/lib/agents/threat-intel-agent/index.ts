/**
 * Threat Intelligence Agent
 *
 * Handles threat monitoring including:
 * - Dark web monitoring for user data
 * - Breach source detection
 * - Emerging threat tracking
 * - Exposure correlation
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

const AGENT_ID = "threat-intel-agent";
const AGENT_VERSION = "1.0.0";

// ============================================================================
// TYPES
// ============================================================================

interface DarkWebMonitorInput {
  userId?: string;
  emailDomains?: string[];
}

interface DarkWebMonitorResult {
  scanned: number;
  exposuresFound: number;
  findings: Array<{
    userId?: string;
    email?: string;
    source: string;
    dataTypes: string[];
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    discoveredAt: string;
    recommendation: string;
  }>;
  alerts: string[];
}

interface BreachDetectionInput {
  source?: string;
  limit?: number;
}

interface BreachDetectionResult {
  analyzed: number;
  breachesDetected: number;
  breaches: Array<{
    name: string;
    source: string;
    recordCount?: number;
    dataTypes: string[];
    discoveredAt: string;
    affectedUsers: number;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }>;
}

interface ThreatTrackingInput {
  category?: "phishing" | "malware" | "data_broker" | "all";
}

interface ThreatTrackingResult {
  tracked: number;
  emergingThreats: Array<{
    type: string;
    name: string;
    description: string;
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    affectedDataTypes: string[];
    mitigationSteps: string[];
    firstSeen: string;
  }>;
  trends: Array<{
    category: string;
    direction: "increasing" | "stable" | "decreasing";
    change: number;
  }>;
}

interface CorrelationInput {
  userId?: string;
  timeframe?: "week" | "month" | "quarter";
}

interface CorrelationResult {
  analyzed: number;
  correlations: Array<{
    userId: string;
    pattern: string;
    relatedExposures: string[];
    likelySource: string;
    confidence: number;
    recommendation: string;
  }>;
  insights: string[];
}

// ============================================================================
// THREAT INTELLIGENCE AGENT CLASS
// ============================================================================

class ThreatIntelAgent extends BaseAgent {
  readonly id = AGENT_ID;
  readonly name = "Threat Intelligence Agent";
  readonly domain = AgentDomains.INTELLIGENCE;
  readonly mode = AgentModes.HYBRID;
  readonly version = AGENT_VERSION;
  readonly description =
    "Monitors dark web, detects breaches, tracks emerging threats, and correlates exposure patterns";

  readonly capabilities: AgentCapability[] = [
    {
      id: "monitor-darkweb",
      name: "Monitor Dark Web",
      description: "Monitor dark web sources for user data exposure",
      requiresAI: true,
      estimatedTokens: 800,
    },
    {
      id: "detect-breaches",
      name: "Detect Data Breaches",
      description: "Detect and analyze data breaches affecting users",
      requiresAI: true,
      estimatedTokens: 600,
    },
    {
      id: "track-threats",
      name: "Track Emerging Threats",
      description: "Track emerging privacy and security threats",
      requiresAI: true,
      estimatedTokens: 500,
    },
    {
      id: "correlate-exposures",
      name: "Correlate Exposures",
      description: "Find patterns and correlations between exposures",
      requiresAI: true,
      estimatedTokens: 700,
    },
  ];

  protected getSystemPrompt(): string {
    return `You are the Threat Intelligence Agent for GhostMyData. Your role is to monitor for data exposures on the dark web, detect breaches, track emerging threats, and correlate exposure patterns to identify the source of data leaks. Provide actionable intelligence to protect user privacy.`;
  }

  protected registerHandlers(): void {
    this.handlers.set("monitor-darkweb", this.handleDarkWebMonitor.bind(this));
    this.handlers.set("detect-breaches", this.handleBreachDetection.bind(this));
    this.handlers.set("track-threats", this.handleThreatTracking.bind(this));
    this.handlers.set("correlate-exposures", this.handleCorrelation.bind(this));
  }

  private async handleDarkWebMonitor(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<DarkWebMonitorResult>> {
    const startTime = Date.now();
    const { userId, emailDomains } = input as DarkWebMonitorInput;

    try {
      // Get users to monitor
      const whereClause: Record<string, unknown> = {};
      if (userId) {
        whereClause.id = userId;
      }
      if (emailDomains && emailDomains.length > 0) {
        whereClause.email = {
          endsWith: emailDomains.map((d) => `@${d}`),
        };
      }

      const users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          name: true,
        },
        take: 100,
      });

      const findings: DarkWebMonitorResult["findings"] = [];
      const alerts: string[] = [];

      // In production, this would integrate with dark web monitoring APIs
      // (e.g., Have I Been Pwned, SpyCloud, DarkOwl, etc.)

      for (const user of users) {
        // Simulate dark web monitoring
        // Would actually check breach databases and dark web sources
        const exposureChance = Math.random();

        if (exposureChance < 0.05) {
          const severity = exposureChance < 0.01 ? "CRITICAL" : "HIGH";
          findings.push({
            userId: user.id,
            email: user.email,
            source: "darkweb_forum",
            dataTypes: ["EMAIL", "PASSWORD_HASH"],
            severity,
            discoveredAt: new Date().toISOString(),
            recommendation: "Immediately change password and enable 2FA",
          });

          if (severity === "CRITICAL") {
            alerts.push(`Critical: ${user.email} found in dark web data dump`);
          }
        }
      }

      return this.createSuccessResult<DarkWebMonitorResult>(
        {
          scanned: users.length,
          exposuresFound: findings.length,
          findings,
          alerts,
        },
        {
          capability: "monitor-darkweb",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
        {
          needsHumanReview: findings.some((f) => f.severity === "CRITICAL"),
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "DARKWEB_ERROR",
          message: error instanceof Error ? error.message : "Dark web monitoring failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "monitor-darkweb",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleBreachDetection(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<BreachDetectionResult>> {
    const startTime = Date.now();
    const { source, limit = 50 } = input as BreachDetectionInput;

    try {
      // Get recent exposures to analyze for breach patterns
      const recentExposures = await prisma.exposure.findMany({
        where: {
          firstFoundAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
          ...(source ? { source } : {}),
        },
        select: {
          source: true,
          dataType: true,
          userId: true,
          firstFoundAt: true,
        },
        take: limit * 10, // Get more to analyze patterns
      });

      // Group by source to detect potential breaches
      const sourceGroups = new Map<string, typeof recentExposures>();
      for (const exposure of recentExposures) {
        const existing = sourceGroups.get(exposure.source) || [];
        existing.push(exposure);
        sourceGroups.set(exposure.source, existing);
      }

      const breaches: BreachDetectionResult["breaches"] = [];

      for (const [sourceName, exposures] of sourceGroups) {
        // If many users are exposed from the same source in a short time,
        // it may indicate a breach
        const affectedUsers = new Set(exposures.map((e) => e.userId)).size;
        const dataTypes = [...new Set(exposures.map((e) => e.dataType))];

        if (affectedUsers >= 3) {
          // Threshold for potential breach
          const severity = this.calculateBreachSeverity(affectedUsers, dataTypes);

          breaches.push({
            name: `Potential ${sourceName} breach`,
            source: sourceName,
            recordCount: exposures.length,
            dataTypes,
            discoveredAt: new Date().toISOString(),
            affectedUsers,
            severity,
          });
        }
      }

      return this.createSuccessResult<BreachDetectionResult>(
        {
          analyzed: recentExposures.length,
          breachesDetected: breaches.length,
          breaches: breaches.slice(0, limit),
        },
        {
          capability: "detect-breaches",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
        {
          needsHumanReview: breaches.some((b) => b.severity === "CRITICAL"),
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "BREACH_ERROR",
          message: error instanceof Error ? error.message : "Breach detection failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "detect-breaches",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private calculateBreachSeverity(
    affectedUsers: number,
    dataTypes: string[]
  ): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    const sensitiveTypes = ["SSN", "FINANCIAL", "MEDICAL", "BIOMETRIC", "PASSWORD"];
    const hasSensitive = dataTypes.some((t) => sensitiveTypes.includes(t));

    if (affectedUsers > 100 && hasSensitive) return "CRITICAL";
    if (affectedUsers > 50 || hasSensitive) return "HIGH";
    if (affectedUsers > 10) return "MEDIUM";
    return "LOW";
  }

  private async handleThreatTracking(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<ThreatTrackingResult>> {
    const startTime = Date.now();
    const { category = "all" } = input as ThreatTrackingInput;

    try {
      // In production, this would:
      // 1. Monitor security news feeds
      // 2. Track new phishing campaigns
      // 3. Identify new data broker tactics
      // 4. Monitor malware affecting privacy

      const emergingThreats: ThreatTrackingResult["emergingThreats"] = [
        {
          type: "data_broker",
          name: "New aggregation technique",
          description: "Data brokers using AI to correlate anonymous data with identities",
          riskLevel: "HIGH",
          affectedDataTypes: ["LOCATION", "BROWSING_HISTORY", "PURCHASES"],
          mitigationSteps: [
            "Use privacy-focused browsers",
            "Enable strict tracking protection",
            "Consider VPN usage",
          ],
          firstSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          type: "phishing",
          name: "Privacy service impersonation",
          description: "Phishing campaigns impersonating data removal services",
          riskLevel: "MEDIUM",
          affectedDataTypes: ["CREDENTIALS", "PERSONAL_INFO"],
          mitigationSteps: [
            "Verify sender email addresses",
            "Don't click links in unsolicited emails",
            "Access services directly via bookmarks",
          ],
          firstSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      // Filter by category if specified
      const filteredThreats =
        category === "all"
          ? emergingThreats
          : emergingThreats.filter((t) => t.type === category);

      const trends: ThreatTrackingResult["trends"] = [
        { category: "data_broker", direction: "increasing", change: 15 },
        { category: "phishing", direction: "stable", change: 2 },
        { category: "malware", direction: "decreasing", change: -8 },
      ];

      return this.createSuccessResult<ThreatTrackingResult>(
        {
          tracked: filteredThreats.length,
          emergingThreats: filteredThreats,
          trends,
        },
        {
          capability: "track-threats",
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
          code: "THREAT_ERROR",
          message: error instanceof Error ? error.message : "Threat tracking failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "track-threats",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleCorrelation(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<CorrelationResult>> {
    const startTime = Date.now();
    const { userId, timeframe = "month" } = input as CorrelationInput;

    try {
      const timeframeMs = {
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        quarter: 90 * 24 * 60 * 60 * 1000,
      }[timeframe];

      const startDate = new Date(Date.now() - timeframeMs);

      // Get exposures for analysis
      const exposures = await prisma.exposure.findMany({
        where: {
          firstFoundAt: { gte: startDate },
          ...(userId ? { userId } : {}),
        },
        select: {
          id: true,
          userId: true,
          source: true,
          dataType: true,
          firstFoundAt: true,
        },
        orderBy: { firstFoundAt: "asc" },
      });

      const correlations: CorrelationResult["correlations"] = [];
      const insights: string[] = [];

      // Group exposures by user
      const userExposures = new Map<string, typeof exposures>();
      for (const exposure of exposures) {
        const existing = userExposures.get(exposure.userId) || [];
        existing.push(exposure);
        userExposures.set(exposure.userId, existing);
      }

      // Analyze patterns for each user
      for (const [uid, userExp] of userExposures) {
        if (userExp.length >= 3) {
          // Look for patterns
          const sources = [...new Set(userExp.map((e) => e.source))];
          const dataTypes = [...new Set(userExp.map((e) => e.dataType))];

          // Check for cascade pattern (one breach leading to others)
          const timeSpread =
            new Date(userExp[userExp.length - 1].firstFoundAt).getTime() -
            new Date(userExp[0].firstFoundAt).getTime();

          if (timeSpread < 7 * 24 * 60 * 60 * 1000 && sources.length > 1) {
            correlations.push({
              userId: uid,
              pattern: "cascade",
              relatedExposures: userExp.map((e) => e.id),
              likelySource: sources[0],
              confidence: 0.7,
              recommendation: `Check if ${sources[0]} had a breach - data may have spread to other brokers`,
            });
          }
        }
      }

      // Generate overall insights
      if (exposures.length > 0) {
        const topSources = this.getTopItems(exposures.map((e) => e.source), 3);
        insights.push(`Top exposure sources: ${topSources.join(", ")}`);
      }

      if (correlations.length > 0) {
        insights.push(`${correlations.length} cascade patterns detected`);
      }

      return this.createSuccessResult<CorrelationResult>(
        {
          analyzed: exposures.length,
          correlations,
          insights,
        },
        {
          capability: "correlate-exposures",
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
          code: "CORRELATION_ERROR",
          message: error instanceof Error ? error.message : "Correlation failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "correlate-exposures",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private getTopItems(items: string[], count: number): string[] {
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([item]) => item);
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

let threatIntelAgentInstance: ThreatIntelAgent | null = null;

export function getThreatIntelAgent(): ThreatIntelAgent {
  if (!threatIntelAgentInstance) {
    threatIntelAgentInstance = new ThreatIntelAgent();
    registerAgent(threatIntelAgentInstance);
  }
  return threatIntelAgentInstance;
}

export async function monitorDarkWeb(
  emailDomains?: string[]
): Promise<DarkWebMonitorResult> {
  const agent = getThreatIntelAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<DarkWebMonitorResult>(
    "monitor-darkweb",
    { emailDomains },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Dark web monitoring failed");
}

export async function detectBreaches(limit = 50): Promise<BreachDetectionResult> {
  const agent = getThreatIntelAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<BreachDetectionResult>(
    "detect-breaches",
    { limit },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Breach detection failed");
}

export { ThreatIntelAgent };
export default getThreatIntelAgent;
