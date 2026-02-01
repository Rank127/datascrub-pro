/**
 * Operations Agent
 *
 * Handles system operations including:
 * - Health checks
 * - Link validation
 * - System cleanup
 * - Anomaly detection
 *
 * Replaces cron jobs: health-check, link-checker
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

const AGENT_ID = "operations-agent";
const AGENT_VERSION = "1.0.0";

// ============================================================================
// TYPES
// ============================================================================

interface HealthCheckResult {
  status: "PASS" | "WARN" | "FAIL";
  checks: Array<{
    name: string;
    status: "PASS" | "WARN" | "FAIL";
    message: string;
    duration?: number;
  }>;
  timestamp: string;
  duration: number;
}

interface LinkCheckInput {
  limit?: number;
  olderThanDays?: number;
}

interface LinkCheckResult {
  checked: number;
  valid: number;
  invalid: number;
  errors: number;
  results: Array<{
    exposureId: string;
    url: string;
    status: "VALID" | "INVALID" | "ERROR";
    statusCode?: number;
  }>;
}

interface CleanupResult {
  logsDeleted: number;
  oldScansArchived: number;
  staleSessionsCleared: number;
  duration: number;
}

interface AnomalyResult {
  anomaliesDetected: number;
  alerts: Array<{
    type: string;
    severity: string;
    message: string;
    data?: unknown;
  }>;
}

// ============================================================================
// OPERATIONS AGENT CLASS
// ============================================================================

class OperationsAgent extends BaseAgent {
  readonly id = AGENT_ID;
  readonly name = "Operations Agent";
  readonly domain = AgentDomains.CORE;
  readonly mode = AgentModes.HYBRID;
  readonly version = AGENT_VERSION;
  readonly description =
    "Manages system health, link validation, cleanup, and anomaly detection";

  readonly capabilities: AgentCapability[] = [
    {
      id: "health-check",
      name: "Health Check",
      description: "Run comprehensive system health checks",
      requiresAI: false,
      rateLimit: 60, // Max 60 per hour
    },
    {
      id: "check-links",
      name: "Check Links",
      description: "Verify exposure URLs are still valid",
      requiresAI: false,
      supportsBatch: true,
      rateLimit: 10,
    },
    {
      id: "cleanup",
      name: "System Cleanup",
      description: "Clean up old logs, sessions, and archives",
      requiresAI: false,
      rateLimit: 4, // Max 4 per hour
    },
    {
      id: "detect-anomalies",
      name: "Detect Anomalies",
      description: "Detect system anomalies and unusual patterns",
      requiresAI: true,
      estimatedTokens: 300,
    },
  ];

  protected getSystemPrompt(): string {
    return `You are the Operations Agent for GhostMyData. Analyze system metrics and logs to detect anomalies and potential issues.`;
  }

  protected registerHandlers(): void {
    this.handlers.set("health-check", this.handleHealthCheck.bind(this));
    this.handlers.set("check-links", this.handleCheckLinks.bind(this));
    this.handlers.set("cleanup", this.handleCleanup.bind(this));
    this.handlers.set("detect-anomalies", this.handleDetectAnomalies.bind(this));
  }

  private async handleHealthCheck(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<HealthCheckResult>> {
    const startTime = Date.now();
    const checks: HealthCheckResult["checks"] = [];

    // Database check
    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      checks.push({
        name: "database",
        status: "PASS",
        message: "Database connection healthy",
        duration: Date.now() - dbStart,
      });
    } catch (error) {
      checks.push({
        name: "database",
        status: "FAIL",
        message: error instanceof Error ? error.message : "Database error",
      });
    }

    // Check recent cron executions
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentCrons = await prisma.cronLog.count({
        where: { createdAt: { gte: oneDayAgo } },
      });

      checks.push({
        name: "cron_jobs",
        status: recentCrons > 0 ? "PASS" : "WARN",
        message:
          recentCrons > 0
            ? `${recentCrons} cron executions in last 24h`
            : "No cron executions in last 24h",
      });
    } catch {
      checks.push({
        name: "cron_jobs",
        status: "WARN",
        message: "Could not check cron status",
      });
    }

    // Check pending removals backlog
    try {
      const pendingRemovals = await prisma.removalRequest.count({
        where: { status: "PENDING" },
      });

      checks.push({
        name: "removal_queue",
        status: pendingRemovals < 100 ? "PASS" : pendingRemovals < 500 ? "WARN" : "FAIL",
        message: `${pendingRemovals} pending removal requests`,
      });
    } catch {
      checks.push({
        name: "removal_queue",
        status: "WARN",
        message: "Could not check removal queue",
      });
    }

    // Check support ticket backlog
    try {
      const openTickets = await prisma.supportTicket.count({
        where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      });

      checks.push({
        name: "support_queue",
        status: openTickets < 50 ? "PASS" : openTickets < 200 ? "WARN" : "FAIL",
        message: `${openTickets} open support tickets`,
      });
    } catch {
      checks.push({
        name: "support_queue",
        status: "WARN",
        message: "Could not check support queue",
      });
    }

    // Check email queue
    try {
      const pendingEmails = await prisma.emailQueue.count({
        where: { status: "QUEUED" },
      });

      checks.push({
        name: "email_queue",
        status: pendingEmails < 100 ? "PASS" : pendingEmails < 500 ? "WARN" : "FAIL",
        message: `${pendingEmails} emails in queue`,
      });
    } catch {
      checks.push({
        name: "email_queue",
        status: "WARN",
        message: "Could not check email queue",
      });
    }

    // Determine overall status
    const hasFailure = checks.some((c) => c.status === "FAIL");
    const hasWarning = checks.some((c) => c.status === "WARN");
    const overallStatus: HealthCheckResult["status"] = hasFailure
      ? "FAIL"
      : hasWarning
        ? "WARN"
        : "PASS";

    return this.createSuccessResult<HealthCheckResult>(
      {
        status: overallStatus,
        checks,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      },
      {
        capability: "health-check",
        requestId: context.requestId,
        duration: Date.now() - startTime,
        usedFallback: false,
        executedAt: new Date(),
      },
      {
        needsHumanReview: hasFailure,
      }
    );
  }

  private async handleCheckLinks(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<LinkCheckResult>> {
    const startTime = Date.now();
    const { limit = 100, olderThanDays = 7 } = input as LinkCheckInput;

    try {
      const cutoffDate = new Date(
        Date.now() - olderThanDays * 24 * 60 * 60 * 1000
      );

      // Get exposures with URLs that haven't been checked recently
      const exposures = await prisma.exposure.findMany({
        where: {
          sourceUrl: { not: null },
          status: "ACTIVE",
          lastSeenAt: { lt: cutoffDate },
        },
        take: limit,
        select: {
          id: true,
          sourceUrl: true,
        },
      });

      const results: LinkCheckResult["results"] = [];
      let valid = 0;
      let invalid = 0;
      let errors = 0;

      for (const exposure of exposures) {
        if (!exposure.sourceUrl) continue;

        try {
          // Attempt to fetch the URL (HEAD request would be better in production)
          const response = await fetch(exposure.sourceUrl, {
            method: "HEAD",
            signal: AbortSignal.timeout(10000),
          });

          if (response.ok) {
            valid++;
            results.push({
              exposureId: exposure.id,
              url: exposure.sourceUrl,
              status: "VALID",
              statusCode: response.status,
            });

            // Update last seen
            await prisma.exposure.update({
              where: { id: exposure.id },
              data: { lastSeenAt: new Date() },
            });
          } else {
            invalid++;
            results.push({
              exposureId: exposure.id,
              url: exposure.sourceUrl,
              status: "INVALID",
              statusCode: response.status,
            });
          }
        } catch {
          errors++;
          results.push({
            exposureId: exposure.id,
            url: exposure.sourceUrl,
            status: "ERROR",
          });
        }

        // Small delay between requests
        await this.sleep(500);
      }

      return this.createSuccessResult<LinkCheckResult>(
        {
          checked: exposures.length,
          valid,
          invalid,
          errors,
          results,
        },
        {
          capability: "check-links",
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
          code: "LINK_CHECK_ERROR",
          message: error instanceof Error ? error.message : "Link check failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "check-links",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleCleanup(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<CleanupResult>> {
    const startTime = Date.now();

    try {
      // Delete old cron logs (> 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const deletedLogs = await prisma.cronLog.deleteMany({
        where: { createdAt: { lt: thirtyDaysAgo } },
      });

      // Delete old agent executions (> 30 days)
      let agentExecutionsDeleted = 0;
      try {
        const result = await prisma.agentExecution.deleteMany({
          where: { createdAt: { lt: thirtyDaysAgo } },
        });
        agentExecutionsDeleted = result.count;
      } catch {
        // Table might not exist yet
      }

      // Archive old completed scans (> 90 days)
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const oldScans = await prisma.scan.updateMany({
        where: {
          status: "COMPLETED",
          completedAt: { lt: ninetyDaysAgo },
        },
        data: {
          status: "ARCHIVED",
        },
      });

      // Delete expired sessions
      const expiredSessions = await prisma.session.deleteMany({
        where: { expires: { lt: new Date() } },
      });

      return this.createSuccessResult<CleanupResult>(
        {
          logsDeleted: deletedLogs.count + agentExecutionsDeleted,
          oldScansArchived: oldScans.count,
          staleSessionsCleared: expiredSessions.count,
          duration: Date.now() - startTime,
        },
        {
          capability: "cleanup",
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
          code: "CLEANUP_ERROR",
          message: error instanceof Error ? error.message : "Cleanup failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "cleanup",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleDetectAnomalies(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<AnomalyResult>> {
    const startTime = Date.now();
    const alerts: AnomalyResult["alerts"] = [];

    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      // Check for unusual failure rates
      const recentRemovals = await prisma.removalRequest.groupBy({
        by: ["status"],
        where: { updatedAt: { gte: oneDayAgo } },
        _count: true,
      });

      const failed = recentRemovals.find((r) => r.status === "FAILED")?._count || 0;
      const total = recentRemovals.reduce((sum, r) => sum + r._count, 0);
      const failureRate = total > 0 ? failed / total : 0;

      if (failureRate > 0.3) {
        alerts.push({
          type: "high_failure_rate",
          severity: "HIGH",
          message: `High removal failure rate: ${(failureRate * 100).toFixed(1)}%`,
          data: { failureRate, failed, total },
        });
      }

      // Check for cron job failures
      const recentCronFailures = await prisma.cronLog.count({
        where: {
          createdAt: { gte: oneHourAgo },
          status: "FAILED",
        },
      });

      if (recentCronFailures > 3) {
        alerts.push({
          type: "cron_failures",
          severity: "HIGH",
          message: `Multiple cron failures in last hour: ${recentCronFailures}`,
          data: { count: recentCronFailures },
        });
      }

      // Check for unusual user signups (spam detection)
      const recentSignups = await prisma.user.count({
        where: { createdAt: { gte: oneHourAgo } },
      });

      if (recentSignups > 50) {
        alerts.push({
          type: "unusual_signups",
          severity: "MEDIUM",
          message: `Unusual signup volume: ${recentSignups} in last hour`,
          data: { count: recentSignups },
        });
      }

      return this.createSuccessResult<AnomalyResult>(
        {
          anomaliesDetected: alerts.length,
          alerts,
        },
        {
          capability: "detect-anomalies",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
        {
          needsHumanReview: alerts.some((a) => a.severity === "HIGH"),
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "ANOMALY_ERROR",
          message: error instanceof Error ? error.message : "Detection failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "detect-anomalies",
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

let operationsAgentInstance: OperationsAgent | null = null;

export function getOperationsAgent(): OperationsAgent {
  if (!operationsAgentInstance) {
    operationsAgentInstance = new OperationsAgent();
    registerAgent(operationsAgentInstance);
  }
  return operationsAgentInstance;
}

export async function runHealthCheck(): Promise<HealthCheckResult> {
  const agent = getOperationsAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<HealthCheckResult>(
    "health-check",
    {},
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Health check failed");
}

export async function runCleanup(): Promise<CleanupResult> {
  const agent = getOperationsAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<CleanupResult>("cleanup", {}, context);

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Cleanup failed");
}

export { OperationsAgent };
export default getOperationsAgent;
