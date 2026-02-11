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
import { sendManualActionRequiredEmail } from "@/lib/email";
import { DATA_BROKER_DIRECTORY } from "@/lib/removers/data-broker-directory";

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

interface EmailDeliveryResult {
  totalEmails: number;
  delivered: number;
  bounced: number;
  suppressed: number;
  deliveryRate: number;
  problemEmails: Array<{
    email: string;
    status: string;
    domain: string;
  }>;
  actionsToken: Array<{
    action: string;
    source: string;
    email: string;
    reason: string;
  }>;
  removalRequestsUpdated: number;
}

type ReturnEmailCategory = "CONFIRMED_REMOVAL" | "NO_RECORD" | "REQUIRES_MANUAL" | "UNKNOWN";

interface ParsedReturnEmail {
  broker: string;
  category: ReturnEmailCategory;
  userName: string;
  userEmail: string;
  instructions?: string;
  originalSubject?: string;
}

interface ReturnEmailProcessResult {
  processed: number;
  confirmedRemovals: number;
  noRecordFound: number;
  requiresManual: number;
  unknown: number;
  updates: Array<{
    broker: string;
    userName: string;
    action: string;
    status: string;
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
    {
      id: "monitor-email-delivery",
      name: "Monitor Email Delivery",
      description: "Monitor Resend email delivery, fix bounced/suppressed addresses",
      requiresAI: false,
      rateLimit: 12, // Max 12 per hour (run every 5 min during active hours)
    },
    {
      id: "process-return-emails",
      name: "Process Return Emails",
      description: "Parse and process broker return emails, update removal requests",
      requiresAI: false,
      rateLimit: 24, // Max 24 per hour
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
    this.handlers.set("monitor-email-delivery", this.handleMonitorEmailDelivery.bind(this));
    this.handlers.set("process-return-emails", this.handleProcessReturnEmails.bind(this));
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

  private async handleMonitorEmailDelivery(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<EmailDeliveryResult>> {
    const startTime = Date.now();

    try {
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      if (!RESEND_API_KEY) {
        return this.createSuccessResult<EmailDeliveryResult>(
          {
            totalEmails: 0,
            delivered: 0,
            bounced: 0,
            suppressed: 0,
            deliveryRate: 0,
            problemEmails: [],
            actionsToken: [],
            removalRequestsUpdated: 0,
          },
          {
            capability: "monitor-email-delivery",
            requestId: context.requestId,
            duration: Date.now() - startTime,
            usedFallback: false,
            executedAt: new Date(),
          }
        );
      }

      // Fetch emails from Resend API
      const response = await fetch("https://api.resend.com/emails", {
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Resend API error: ${response.status}`);
      }

      interface ResendEmail {
        id: string;
        to: string[];
        subject: string;
        last_event: string;
      }

      const data = await response.json() as { data: ResendEmail[] };
      const emails = data.data || [];

      // Analyze email statuses
      const deliveredStatuses = ["delivered", "sent", "opened", "clicked"];
      const problemStatuses = ["bounced", "failed", "rejected", "suppressed"];

      let delivered = 0;
      let bounced = 0;
      let suppressed = 0;
      const problemEmails: EmailDeliveryResult["problemEmails"] = [];

      for (const email of emails) {
        const status = (email.last_event || "").toLowerCase();
        const toEmail = email.to?.[0] || "";
        const domain = toEmail.split("@")[1] || "unknown";

        if (deliveredStatuses.includes(status)) {
          delivered++;
        } else if (status === "bounced" || status === "failed" || status === "rejected") {
          bounced++;
          problemEmails.push({ email: toEmail, status, domain });
        } else if (status === "suppressed") {
          suppressed++;
          problemEmails.push({ email: toEmail, status, domain });
        }
      }

      const actionsToken: EmailDeliveryResult["actionsToken"] = [];
      const removalRequestsUpdated = 0;

      // If we found problem emails, update affected removal requests
      if (problemEmails.length > 0) {
        // Get unique problem email addresses
        const uniqueProblemEmails = [...new Set(problemEmails.map((e) => e.email))];

        // Find removal requests that were sent to these emails
        for (const problemEmail of uniqueProblemEmails) {
          // Find exposures from sources that might use this email
          const affectedRequests = await prisma.removalRequest.findMany({
            where: {
              status: { in: ["SUBMITTED", "PENDING"] },
              method: { in: ["AUTO_EMAIL", "EMAIL"] },
            },
            include: {
              exposure: { select: { id: true, source: true, sourceName: true } },
            },
            take: 100,
          });

          // Check which requests might be affected (based on the email in their notes or source)
          for (const req of affectedRequests) {
            // Check if this request's broker uses the problem email
            // We'll log the action and update if needed
            const isBounced = problemEmails.some(
              (p) => p.email === problemEmail && (p.status === "bounced" || p.status === "failed")
            );
            const isSuppressed = problemEmails.some(
              (p) => p.email === problemEmail && p.status === "suppressed"
            );

            if (isBounced || isSuppressed) {
              const reason = isBounced
                ? "Email bounced - address invalid"
                : "Email suppressed - recipient blocked";

              actionsToken.push({
                action: "flag_for_review",
                source: req.exposure.source,
                email: problemEmail,
                reason,
              });
            }
          }
        }

        // Update removal requests for known bounced/suppressed sources
        // This is a targeted update for sources we've identified
        const knownBouncedSources = problemEmails
          .filter((e) => e.status === "bounced" || e.status === "failed")
          .map((e) => e.domain.split(".")[0].toUpperCase());

        if (knownBouncedSources.length > 0) {
          // Log for monitoring - actual directory updates should be done manually
          // to avoid accidental data corruption
          console.log(
            `[Operations Agent] Detected bounced emails from: ${knownBouncedSources.join(", ")}`
          );
        }
      }

      const deliveryRate =
        emails.length > 0 ? Math.round((delivered / emails.length) * 100) : 100;

      // Create alert if delivery rate is low
      if (deliveryRate < 80 && emails.length > 10) {
        await prisma.alert.create({
          data: {
            userId: "system",
            type: "SYSTEM_ALERT",
            title: "Low Email Delivery Rate",
            message: `Email delivery rate is ${deliveryRate}%. ${bounced} bounced, ${suppressed} suppressed out of ${emails.length} total.`,
            metadata: JSON.stringify({
              deliveryRate,
              bounced,
              suppressed,
              problemEmails: problemEmails.slice(0, 10),
            }),
          },
        }).catch(() => {
          // Alert creation might fail if userId "system" doesn't exist
          console.log(`[Operations Agent] Low delivery rate alert: ${deliveryRate}%`);
        });
      }

      return this.createSuccessResult<EmailDeliveryResult>(
        {
          totalEmails: emails.length,
          delivered,
          bounced,
          suppressed,
          deliveryRate,
          problemEmails,
          actionsToken,
          removalRequestsUpdated,
        },
        {
          capability: "monitor-email-delivery",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
        {
          needsHumanReview: bounced > 0 || suppressed > 0,
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "EMAIL_MONITOR_ERROR",
          message: error instanceof Error ? error.message : "Email monitoring failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "monitor-email-delivery",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleProcessReturnEmails(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<ReturnEmailProcessResult>> {
    const startTime = Date.now();
    const { emailContent } = input as { emailContent: string };

    if (!emailContent) {
      return {
        success: false,
        error: {
          code: "NO_EMAIL_CONTENT",
          message: "No email content provided",
          retryable: false,
        },
        needsHumanReview: false,
        metadata: {
          agentId: this.id,
          capability: "process-return-emails",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }

    const parsedEmails = this.parseReturnEmails(emailContent);
    const updates: ReturnEmailProcessResult["updates"] = [];
    let confirmedRemovals = 0;
    let noRecordFound = 0;
    let requiresManual = 0;
    let unknown = 0;

    for (const email of parsedEmails) {
      switch (email.category) {
        case "CONFIRMED_REMOVAL":
          confirmedRemovals++;
          // Update removal request to IN_PROGRESS
          await this.updateRemovalRequest(email, "IN_PROGRESS", email.instructions);
          updates.push({
            broker: email.broker,
            userName: email.userName,
            action: "Updated to IN_PROGRESS",
            status: "Broker confirmed removal initiated",
          });
          break;

        case "NO_RECORD":
          noRecordFound++;
          // Mark as REMOVED - no action needed
          await this.updateRemovalRequest(email, "REMOVED", "No record found - user data not present");
          updates.push({
            broker: email.broker,
            userName: email.userName,
            action: "Marked as REMOVED",
            status: "Broker confirmed no record exists",
          });
          break;

        case "REQUIRES_MANUAL":
          requiresManual++;
          // Update to REQUIRES_MANUAL with instructions
          await this.updateRemovalRequest(email, "REQUIRES_MANUAL", email.instructions);
          updates.push({
            broker: email.broker,
            userName: email.userName,
            action: "Marked REQUIRES_MANUAL",
            status: email.instructions || "Manual action required",
          });
          break;

        default:
          unknown++;
          updates.push({
            broker: email.broker,
            userName: email.userName,
            action: "Flagged for review",
            status: "Could not determine response category",
          });
      }
    }

    return this.createSuccessResult<ReturnEmailProcessResult>(
      {
        processed: parsedEmails.length,
        confirmedRemovals,
        noRecordFound,
        requiresManual,
        unknown,
        updates,
      },
      {
        capability: "process-return-emails",
        requestId: context.requestId,
        duration: Date.now() - startTime,
        usedFallback: false,
        executedAt: new Date(),
      },
      {
        needsHumanReview: unknown > 0,
      }
    );
  }

  private parseReturnEmails(content: string): ParsedReturnEmail[] {
    const emails: ParsedReturnEmail[] = [];

    // Split by common email separators
    const sections = content.split(/\*{20,}|\-{20,}/);

    // Known broker response patterns
    const brokerPatterns: Array<{
      broker: string;
      patterns: RegExp[];
      category: ReturnEmailCategory;
      instructions?: string;
    }> = [
      // Confirmed Removals
      {
        broker: "LUSHA",
        patterns: [/lusha/i, /initiated the process to delete/i],
        category: "CONFIRMED_REMOVAL",
      },
      {
        broker: "ZOOMINFO",
        patterns: [/zoominfo/i, /added your information to the removal queue/i],
        category: "CONFIRMED_REMOVAL",
      },

      // No Record Found
      {
        broker: "REALTYHOP",
        patterns: [/realtyhop/i, /do not have a record of you/i],
        category: "NO_RECORD",
      },
      {
        broker: "FINDAGRAVE",
        patterns: [/find a grave/i, /returned no results/i],
        category: "NO_RECORD",
      },

      // Requires Manual Action
      {
        broker: "ZEROBOUNCE",
        patterns: [/zerobounce/i, /verify your identity/i],
        category: "REQUIRES_MANUAL",
        instructions: "Verify identity: Confirm last payment date to ZeroBounce",
      },
      {
        broker: "STABILITY_AI",
        patterns: [/stability\.ai|stability ai/i, /delete account.*button|fill out this form/i],
        category: "REQUIRES_MANUAL",
        instructions: "Use https://stability.ai/privacy-center to delete account or opt-out",
      },
      {
        broker: "COMMON_CRAWL",
        patterns: [/common\s*crawl/i, /provide us with the exact location/i],
        category: "REQUIRES_MANUAL",
        instructions: "Provide specific URL where personal data is located",
      },
      {
        broker: "FACEAPP",
        patterns: [/faceapp/i, /Send Privacy Request feature within the FaceApp/i],
        category: "REQUIRES_MANUAL",
        instructions: "Use the Send Privacy Request feature within the FaceApp mobile app",
      },
      {
        broker: "HUGGINGFACE",
        patterns: [/hugging\s*face/i, /delete your account.*settings/i],
        category: "REQUIRES_MANUAL",
        instructions: "Delete account at https://huggingface.co/settings/account",
      },
      {
        broker: "ELEVENLABS",
        patterns: [/elevenlabs/i, /official form.*Data Subject Request/i],
        category: "REQUIRES_MANUAL",
        instructions: "Submit formal DSR at ElevenLabs official form",
      },
      {
        broker: "FULLCONTACT",
        patterns: [/fullcontact/i, /Privacy Choices portal/i],
        category: "REQUIRES_MANUAL",
        instructions: "Visit FullContact Privacy Choices portal to verify identity",
      },
      {
        broker: "EPSILON",
        patterns: [/epsilon/i, /Consumer Privacy Portal/i],
        category: "REQUIRES_MANUAL",
        instructions: "Visit https://legal.epsilon.com/dsr/ or call 1-866-267-3861",
      },
      {
        broker: "FINDYMAIL",
        patterns: [/findymail/i, /professional email address/i],
        category: "REQUIRES_MANUAL",
        instructions: "Provide professional/work email address (not personal Gmail)",
      },
      {
        broker: "DUN_BRADSTREET",
        patterns: [/dun.*bradstreet/i, /not able to associate the information/i],
        category: "REQUIRES_MANUAL",
        instructions: "Visit Dun & Bradstreet Privacy Trust Center with more identifying info",
      },
    ];

    for (const section of sections) {
      if (!section.trim()) continue;

      // Extract user name from the original request
      const nameMatch = section.match(/Full Name:\s*([^\n]+)/i);
      const emailMatch = section.match(/Email:\s*([^\n]+)/i);
      const subjectMatch = section.match(/Subject:\s*([^\n]+)/i);

      const userName = nameMatch?.[1]?.trim() || "Unknown";
      const userEmail = emailMatch?.[1]?.trim() || "Unknown";
      const subject = subjectMatch?.[1]?.trim();

      // Try to match broker patterns
      for (const bp of brokerPatterns) {
        const matchesBroker = bp.patterns.some((p) => p.test(section));
        if (matchesBroker) {
          emails.push({
            broker: bp.broker,
            category: bp.category,
            userName,
            userEmail,
            instructions: bp.instructions,
            originalSubject: subject,
          });
          break;
        }
      }
    }

    return emails;
  }

  private async updateRemovalRequest(
    email: ParsedReturnEmail,
    status: string,
    notes?: string
  ): Promise<void> {
    try {
      // Find the user by email
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email.userEmail },
            { email: email.userEmail.toLowerCase() },
          ],
        },
        select: { id: true, email: true, name: true },
      });

      if (!user) {
        console.log(`[Operations Agent] User not found for email: ${email.userEmail}`);
        return;
      }

      // Find matching removal request
      const removalRequest = await prisma.removalRequest.findFirst({
        where: {
          exposure: {
            userId: user.id,
            source: { contains: email.broker },
          },
          status: { in: ["SUBMITTED", "PENDING"] },
        },
        include: {
          exposure: { select: { id: true, source: true } },
        },
      });

      if (!removalRequest) {
        console.log(`[Operations Agent] No pending removal request found for ${email.broker}/${email.userName}`);
        return;
      }

      // Update removal request
      await prisma.removalRequest.update({
        where: { id: removalRequest.id },
        data: {
          status: status === "REMOVED" ? "COMPLETED" : status,
          method: status === "REQUIRES_MANUAL" ? "MANUAL_GUIDE" : removalRequest.method,
          notes: notes ? `${removalRequest.notes || ""}\n[Auto-processed] ${notes}`.trim() : removalRequest.notes,
        },
      });

      // Update exposure if needed
      if (status === "REQUIRES_MANUAL") {
        await prisma.exposure.update({
          where: { id: removalRequest.exposure.id },
          data: {
            requiresManualAction: true,
          },
        });

        // Send notification email to user about manual action required
        try {
          const brokerInfo = DATA_BROKER_DIRECTORY[email.broker];
          if (user.email) {
            await sendManualActionRequiredEmail(
              user.email,
              user.name || email.userName || "there",
              {
                brokerName: brokerInfo?.name || email.broker,
                brokerKey: email.broker,
                optOutUrl: brokerInfo?.optOutUrl,
                instructions: notes || email.instructions || "Please follow the broker's opt-out process.",
                originalRequestDate: removalRequest.createdAt,
              }
            );
            console.log(`[Operations Agent] Sent manual action email to ${user.email} for ${email.broker}`);
          }
        } catch (emailError) {
          console.error(`[Operations Agent] Failed to send manual action email:`, emailError);
        }
      } else if (status === "REMOVED") {
        await prisma.exposure.update({
          where: { id: removalRequest.exposure.id },
          data: {
            status: "REMOVED",
            lastSeenAt: new Date(),
          },
        });
      }

      console.log(`[Operations Agent] Updated ${email.broker} removal for ${email.userName}: ${status}`);
    } catch (error) {
      console.error(`[Operations Agent] Failed to update removal request:`, error);
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
  await agent.initialize();

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
  await agent.initialize();

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

export async function runEmailDeliveryMonitor(): Promise<EmailDeliveryResult> {
  const agent = getOperationsAgent();
  await agent.initialize();

  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<EmailDeliveryResult>(
    "monitor-email-delivery",
    {},
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Email delivery monitoring failed");
}

export async function processReturnEmails(emailContent: string): Promise<ReturnEmailProcessResult> {
  const agent = getOperationsAgent();
  await agent.initialize();

  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.MANUAL,
  });

  const result = await agent.execute<ReturnEmailProcessResult>(
    "process-return-emails",
    { emailContent },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Return email processing failed");
}

export { OperationsAgent };
export type { EmailDeliveryResult, ReturnEmailProcessResult };
export default getOperationsAgent;
