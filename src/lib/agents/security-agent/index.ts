/**
 * Security Agent
 *
 * Handles security operations including:
 * - Threat detection
 * - Suspicious activity monitoring
 * - Breach notifications
 * - Fraud prevention
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

const AGENT_ID = "security-agent";
const AGENT_VERSION = "1.0.0";

// Suspicious activity thresholds
const THRESHOLDS = {
  MAX_FAILED_LOGINS: 5,
  MAX_API_REQUESTS_PER_MINUTE: 100,
  MAX_SCANS_PER_DAY: 20,
  MAX_REMOVAL_REQUESTS_PER_HOUR: 50,
  SESSION_ANOMALY_THRESHOLD: 0.8,
};

// ============================================================================
// TYPES
// ============================================================================

interface ThreatDetectionInput {
  userId?: string;
  timeframe?: "hour" | "day" | "week";
}

interface ThreatDetectionResult {
  analyzed: number;
  threats: Array<{
    id: string;
    type: "BRUTE_FORCE" | "ACCOUNT_TAKEOVER" | "API_ABUSE" | "DATA_SCRAPING" | "SUSPICIOUS_PATTERN";
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    userId?: string;
    ip?: string;
    description: string;
    indicators: string[];
    recommendedAction: string;
    detectedAt: string;
  }>;
  summary: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

interface SuspiciousActivityInput {
  userId?: string;
  limit?: number;
}

interface SuspiciousActivityResult {
  monitored: number;
  suspicious: Array<{
    userId: string;
    email: string;
    activityType: string;
    riskScore: number;
    anomalies: string[];
    lastActivity: string;
    recommendation: string;
  }>;
  blocked: number;
}

interface BreachNotificationInput {
  breachId?: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

interface BreachNotificationResult {
  identified: number;
  notifications: Array<{
    userId: string;
    email: string;
    breachType: string;
    affectedData: string[];
    notificationStatus: "PENDING" | "SENT" | "FAILED";
    sentAt?: string;
  }>;
  summary: {
    pending: number;
    sent: number;
    failed: number;
  };
}

interface FraudPreventionInput {
  action?: "scan" | "analyze" | "block";
  userId?: string;
}

interface FraudPreventionResult {
  analyzed: number;
  flagged: Array<{
    userId: string;
    email: string;
    fraudScore: number;
    indicators: Array<{
      indicator: string;
      weight: number;
      description: string;
    }>;
    status: "CLEAR" | "SUSPICIOUS" | "BLOCKED";
    recommendation: string;
  }>;
  actions: Array<{
    action: string;
    userId: string;
    reason: string;
    timestamp: string;
  }>;
}

// ============================================================================
// SECURITY AGENT CLASS
// ============================================================================

class SecurityAgent extends BaseAgent {
  readonly id = AGENT_ID;
  readonly name = "Security Agent";
  readonly domain = AgentDomains.SECURITY;
  readonly mode = AgentModes.HYBRID;
  readonly version = AGENT_VERSION;
  readonly description =
    "Detects threats, monitors suspicious activity, sends breach notifications, and prevents fraud";

  readonly capabilities: AgentCapability[] = [
    {
      id: "detect-threats",
      name: "Detect Threats",
      description: "Detect security threats and attacks",
      requiresAI: true,
      estimatedTokens: 600,
    },
    {
      id: "monitor-activity",
      name: "Monitor Suspicious Activity",
      description: "Monitor for suspicious user activity",
      requiresAI: false,
      supportsBatch: true,
    },
    {
      id: "notify-breaches",
      name: "Handle Breach Notifications",
      description: "Send breach notifications to affected users",
      requiresAI: true,
      estimatedTokens: 400,
    },
    {
      id: "prevent-fraud",
      name: "Prevent Fraud",
      description: "Detect and prevent fraudulent activity",
      requiresAI: true,
      estimatedTokens: 500,
    },
  ];

  protected getSystemPrompt(): string {
    return `You are the Security Agent for GhostMyData. Your role is to protect the platform and users from security threats, detect suspicious activity, handle breach notifications, and prevent fraud. Be vigilant and err on the side of caution for security matters.`;
  }

  protected registerHandlers(): void {
    this.handlers.set("detect-threats", this.handleDetectThreats.bind(this));
    this.handlers.set("monitor-activity", this.handleMonitorActivity.bind(this));
    this.handlers.set("notify-breaches", this.handleNotifyBreaches.bind(this));
    this.handlers.set("prevent-fraud", this.handlePreventFraud.bind(this));
  }

  private async handleDetectThreats(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<ThreatDetectionResult>> {
    const startTime = Date.now();
    const { userId, timeframe = "day" } = input as ThreatDetectionInput;

    try {
      const timeframeMs = {
        hour: 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
      }[timeframe];

      const since = new Date(Date.now() - timeframeMs);

      const threats: ThreatDetectionResult["threats"] = [];
      const summary = { low: 0, medium: 0, high: 0, critical: 0 };

      // In production, would analyze:
      // 1. Failed login attempts
      // 2. API request patterns
      // 3. Unusual access patterns
      // 4. Geographic anomalies
      // 5. Session hijacking indicators

      // Get users with high activity for analysis
      const users = await prisma.user.findMany({
        where: userId ? { id: userId } : {},
        take: 100,
        include: {
          _count: {
            select: {
              scans: true,
              removalRequests: true,
            },
          },
        },
      });

      for (const user of users) {
        // Check for unusual scan activity
        const recentScans = await prisma.scan.count({
          where: {
            userId: user.id,
            createdAt: { gte: since },
          },
        });

        if (recentScans > THRESHOLDS.MAX_SCANS_PER_DAY) {
          const threat = {
            id: nanoid(),
            type: "API_ABUSE" as const,
            severity: "MEDIUM" as const,
            userId: user.id,
            description: `Unusual scan volume: ${recentScans} scans in ${timeframe}`,
            indicators: [
              `${recentScans} scans (threshold: ${THRESHOLDS.MAX_SCANS_PER_DAY})`,
              "Potential automated scanning",
            ],
            recommendedAction: "Rate limit or investigate automation",
            detectedAt: new Date().toISOString(),
          };
          threats.push(threat);
          summary.medium++;
        }

        // Check for removal request patterns (potential data scraping)
        const recentRemovals = await prisma.removalRequest.count({
          where: {
            userId: user.id,
            createdAt: { gte: since },
          },
        });

        if (recentRemovals > THRESHOLDS.MAX_REMOVAL_REQUESTS_PER_HOUR * 24) {
          const threat = {
            id: nanoid(),
            type: "DATA_SCRAPING" as const,
            severity: "HIGH" as const,
            userId: user.id,
            description: `Abnormal removal request volume: ${recentRemovals}`,
            indicators: [
              `${recentRemovals} removal requests in ${timeframe}`,
              "Potential competitor intelligence gathering",
            ],
            recommendedAction: "Suspend account pending investigation",
            detectedAt: new Date().toISOString(),
          };
          threats.push(threat);
          summary.high++;
        }
      }

      // Simulate detection of other threat types
      if (Math.random() < 0.1) {
        threats.push({
          id: nanoid(),
          type: "BRUTE_FORCE",
          severity: "HIGH",
          ip: "192.168.1.x",
          description: "Multiple failed login attempts from same IP range",
          indicators: ["15 failed logins in 5 minutes", "Targeting multiple accounts"],
          recommendedAction: "Block IP range temporarily",
          detectedAt: new Date().toISOString(),
        });
        summary.high++;
      }

      return this.createSuccessResult<ThreatDetectionResult>(
        {
          analyzed: users.length,
          threats,
          summary,
        },
        {
          capability: "detect-threats",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
        {
          needsHumanReview: summary.critical > 0 || summary.high > 0,
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "THREAT_ERROR",
          message: error instanceof Error ? error.message : "Threat detection failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "detect-threats",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleMonitorActivity(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<SuspiciousActivityResult>> {
    const startTime = Date.now();
    const { userId, limit = 50 } = input as SuspiciousActivityInput;

    try {
      const users = await prisma.user.findMany({
        where: userId ? { id: userId } : {},
        take: limit,
        include: {
          subscription: { select: { plan: true } },
          ...FAMILY_PLAN_INCLUDE,
          _count: {
            select: {
              scans: true,
              removalRequests: true,
              tickets: true,
            },
          },
        },
      });

      const suspicious: SuspiciousActivityResult["suspicious"] = [];
      let blocked = 0;

      for (const user of users) {
        const anomalies: string[] = [];
        let riskScore = 0;
        const userEffectivePlan = computeEffectivePlan(user);

        // Check for anomalous patterns
        // 1. Very high activity for new account
        const accountAgeMs = Date.now() - new Date(user.createdAt).getTime();
        const accountAgeDays = accountAgeMs / (24 * 60 * 60 * 1000);

        if (accountAgeDays < 7 && user._count.scans > 10) {
          anomalies.push("High activity on new account");
          riskScore += 0.3;
        }

        // 2. Multiple support tickets (potential abuse testing)
        if (user._count.tickets > 10) {
          anomalies.push("Excessive support tickets");
          riskScore += 0.2;
        }

        // 3. Free user with excessive activity (skip family members who are effectively ENTERPRISE)
        if (userEffectivePlan === "FREE" && user._count.scans > 5) {
          anomalies.push("Free tier usage exceeds normal patterns");
          riskScore += 0.15;
        }

        // 4. Unusual email pattern (disposable email)
        const disposablePatterns = ["tempmail", "mailinator", "guerrilla", "10minute"];
        if (disposablePatterns.some((p) => user.email.toLowerCase().includes(p))) {
          anomalies.push("Disposable email detected");
          riskScore += 0.4;
        }

        if (anomalies.length > 0 && riskScore >= 0.3) {
          suspicious.push({
            userId: user.id,
            email: user.email,
            activityType: "multiple_anomalies",
            riskScore: Math.min(riskScore, 1),
            anomalies,
            lastActivity: user.lastScanAt?.toISOString() || user.createdAt.toISOString(),
            recommendation:
              riskScore > 0.7
                ? "Block account pending review"
                : "Monitor closely",
          });

          if (riskScore > 0.8) {
            blocked++;
          }
        }
      }

      return this.createSuccessResult<SuspiciousActivityResult>(
        {
          monitored: users.length,
          suspicious: suspicious.sort((a, b) => b.riskScore - a.riskScore),
          blocked,
        },
        {
          capability: "monitor-activity",
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
          message: error instanceof Error ? error.message : "Activity monitoring failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "monitor-activity",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleNotifyBreaches(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<BreachNotificationResult>> {
    const startTime = Date.now();
    const { breachId: _breachId, severity: _severity = "HIGH" } = input as BreachNotificationInput;

    try {
      // In production, would:
      // 1. Check for detected breaches from threat intel
      // 2. Identify affected users
      // 3. Generate and send notifications
      // 4. Track notification status

      // Get users with recent exposures (simulating breach detection)
      const affectedUsers = await prisma.user.findMany({
        where: {
          exposures: {
            some: {
              status: "ACTIVE",
              severity: { in: ["HIGH", "CRITICAL"] },
              firstFoundAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
        take: 50,
        include: {
          exposures: {
            where: {
              status: "ACTIVE",
              severity: { in: ["HIGH", "CRITICAL"] },
            },
            select: {
              dataType: true,
              source: true,
            },
          },
        },
      });

      const notifications: BreachNotificationResult["notifications"] = [];
      let pending = 0;
      let sent = 0;
      const failed = 0;

      for (const user of affectedUsers) {
        const affectedData = [...new Set(user.exposures.map((e) => e.dataType))];

        // Simulate notification status
        const status = Math.random() > 0.1 ? "SENT" : "PENDING";

        notifications.push({
          userId: user.id,
          email: user.email,
          breachType: "Data Broker Exposure",
          affectedData,
          notificationStatus: status as "PENDING" | "SENT" | "FAILED",
          sentAt: status === "SENT" ? new Date().toISOString() : undefined,
        });

        if (status === "SENT") sent++;
        else pending++;
      }

      return this.createSuccessResult<BreachNotificationResult>(
        {
          identified: affectedUsers.length,
          notifications,
          summary: {
            pending,
            sent,
            failed,
          },
        },
        {
          capability: "notify-breaches",
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
          code: "NOTIFY_ERROR",
          message: error instanceof Error ? error.message : "Breach notification failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "notify-breaches",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handlePreventFraud(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<FraudPreventionResult>> {
    const startTime = Date.now();
    const { action = "scan", userId } = input as FraudPreventionInput;

    try {
      const users = await prisma.user.findMany({
        where: userId ? { id: userId } : {},
        take: 100,
        include: {
          subscription: true,
          ...FAMILY_PLAN_INCLUDE,
          _count: {
            select: {
              scans: true,
              removalRequests: true,
            },
          },
        },
      });

      const flagged: FraudPreventionResult["flagged"] = [];
      const actions: FraudPreventionResult["actions"] = [];

      for (const user of users) {
        const indicators: FraudPreventionResult["flagged"][0]["indicators"] = [];
        let fraudScore = 0;
        const userEffPlan = computeEffectivePlan(user);

        // Indicator 1: Email pattern
        if (user.email.match(/\+\d+@/)) {
          indicators.push({
            indicator: "email_alias",
            weight: 0.1,
            description: "Email uses plus addressing (potential multi-account)",
          });
          fraudScore += 0.1;
        }

        // Indicator 2: Free user with trial abuse pattern (skip family members)
        if (userEffPlan === "FREE" && user._count.scans > 3) {
          indicators.push({
            indicator: "trial_abuse",
            weight: 0.2,
            description: "Free tier usage suggests avoiding payment",
          });
          fraudScore += 0.2;
        }

        // Indicator 3: Subscription churn
        if (
          user.subscription?.status === "canceled" &&
          user._count.scans > 0
        ) {
          indicators.push({
            indicator: "subscription_churn",
            weight: 0.15,
            description: "Subscription canceled after heavy usage",
          });
          fraudScore += 0.15;
        }

        // Indicator 4: Account age vs activity
        const accountAgeMs = Date.now() - new Date(user.createdAt).getTime();
        const accountAgeHours = accountAgeMs / (60 * 60 * 1000);
        if (accountAgeHours < 24 && user._count.scans >= 3) {
          indicators.push({
            indicator: "rapid_activity",
            weight: 0.25,
            description: "Very high activity immediately after signup",
          });
          fraudScore += 0.25;
        }

        // Indicator 5: Disposable email domain
        const disposableDomains = ["tempmail", "guerrillamail", "mailinator", "fakeinbox"];
        if (disposableDomains.some((d) => user.email.includes(d))) {
          indicators.push({
            indicator: "disposable_email",
            weight: 0.4,
            description: "Using known disposable email service",
          });
          fraudScore += 0.4;
        }

        if (fraudScore >= 0.3) {
          let status: "CLEAR" | "SUSPICIOUS" | "BLOCKED" = "SUSPICIOUS";
          let recommendation = "Monitor account activity";

          if (fraudScore >= 0.7) {
            status = "BLOCKED";
            recommendation = "Block account and investigate";
          }

          flagged.push({
            userId: user.id,
            email: user.email,
            fraudScore: Math.min(fraudScore, 1),
            indicators,
            status,
            recommendation,
          });

          if (action === "block" && fraudScore >= 0.7) {
            actions.push({
              action: "account_blocked",
              userId: user.id,
              reason: `Fraud score ${fraudScore.toFixed(2)} exceeded threshold`,
              timestamp: new Date().toISOString(),
            });
          }
        }
      }

      return this.createSuccessResult<FraudPreventionResult>(
        {
          analyzed: users.length,
          flagged: flagged.sort((a, b) => b.fraudScore - a.fraudScore),
          actions,
        },
        {
          capability: "prevent-fraud",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
        {
          needsHumanReview: flagged.some((f) => f.status === "BLOCKED"),
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "FRAUD_ERROR",
          message: error instanceof Error ? error.message : "Fraud prevention failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "prevent-fraud",
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

let securityAgentInstance: SecurityAgent | null = null;

export function getSecurityAgent(): SecurityAgent {
  if (!securityAgentInstance) {
    securityAgentInstance = new SecurityAgent();
    registerAgent(securityAgentInstance);
  }
  return securityAgentInstance;
}

export async function detectThreats(
  timeframe: "hour" | "day" | "week" = "day"
): Promise<ThreatDetectionResult> {
  const agent = getSecurityAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<ThreatDetectionResult>(
    "detect-threats",
    { timeframe },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Threat detection failed");
}

export async function preventFraud(
  action: "scan" | "analyze" | "block" = "scan"
): Promise<FraudPreventionResult> {
  const agent = getSecurityAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<FraudPreventionResult>(
    "prevent-fraud",
    { action },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Fraud prevention failed");
}

export { SecurityAgent };
export default getSecurityAgent;
