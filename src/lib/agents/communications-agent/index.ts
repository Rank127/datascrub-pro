/**
 * Communications Agent
 *
 * Handles all user communications including:
 * - Email personalization
 * - Timing optimization
 * - Digest generation
 * - Follow-up reminders
 *
 * Replaces cron jobs: follow-up-reminders, removal-digest, free-user-digest
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

const AGENT_ID = "communications-agent";
const AGENT_VERSION = "1.0.0";

// ============================================================================
// TYPES
// ============================================================================

interface SendEmailInput {
  type: string;
  userId: string;
  data?: Record<string, unknown>;
}

interface SendEmailResult {
  sent: boolean;
  emailId?: string;
  message: string;
}

interface DigestInput {
  type?: "daily" | "weekly";
  userFilter?: string[];
  limit?: number;
}

interface DigestResult {
  sent: number;
  skipped: number;
  errors: number;
  results: Array<{
    userId: string;
    status: string;
    message?: string;
  }>;
}

interface ReminderInput {
  type?: "removal" | "scan" | "profile";
  limit?: number;
}

interface ReminderResult {
  sent: number;
  skipped: number;
  results: Array<{
    userId: string;
    type: string;
    status: string;
  }>;
}

// ============================================================================
// COMMUNICATIONS AGENT CLASS
// ============================================================================

class CommunicationsAgent extends BaseAgent {
  readonly id = AGENT_ID;
  readonly name = "Communications Agent";
  readonly domain = AgentDomains.CORE;
  readonly mode = AgentModes.HYBRID;
  readonly version = AGENT_VERSION;
  readonly description =
    "Manages all user communications including emails, digests, and reminders";

  readonly capabilities: AgentCapability[] = [
    {
      id: "send-email",
      name: "Send Email",
      description: "Send a personalized email to a user",
      requiresAI: true,
      estimatedTokens: 300,
    },
    {
      id: "send-digest",
      name: "Send Digest",
      description: "Send digest emails to users",
      requiresAI: false,
      supportsBatch: true,
      rateLimit: 4,
    },
    {
      id: "send-reminder",
      name: "Send Reminder",
      description: "Send follow-up reminders to users",
      requiresAI: false,
      supportsBatch: true,
      rateLimit: 10,
    },
  ];

  protected getSystemPrompt(): string {
    return `You are the Communications Agent for GhostMyData. Personalize email content based on user context and communication preferences.`;
  }

  protected registerHandlers(): void {
    this.handlers.set("send-email", this.handleSendEmail.bind(this));
    this.handlers.set("send-digest", this.handleSendDigest.bind(this));
    this.handlers.set("send-reminder", this.handleSendReminder.bind(this));
  }

  private async handleSendEmail(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<SendEmailResult>> {
    const startTime = Date.now();
    const { type, userId, data } = input as SendEmailInput;

    try {
      // Get user preferences
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          name: true,
          emailNotifications: true,
          plan: true,
        },
      });

      if (!user) {
        return {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: `User ${userId} not found`,
            retryable: false,
          },
          needsHumanReview: false,
          metadata: {
            agentId: this.id,
            capability: "send-email",
            requestId: context.requestId,
            duration: Date.now() - startTime,
            usedFallback: false,
            executedAt: new Date(),
          },
        };
      }

      // Check if user has email notifications enabled
      if (!user.emailNotifications) {
        return this.createSuccessResult<SendEmailResult>(
          {
            sent: false,
            message: "User has email notifications disabled",
          },
          {
            capability: "send-email",
            requestId: context.requestId,
            duration: Date.now() - startTime,
            usedFallback: false,
            executedAt: new Date(),
          }
        );
      }

      // Queue email
      const emailRecord = await prisma.emailQueue.create({
        data: {
          id: nanoid(),
          toEmail: user.email,
          subject: this.getEmailSubject(type),
          htmlContent: this.getEmailTemplate(type, { user, ...data }),
          emailType: type,
          userId,
          context: JSON.stringify(data),
          priority: this.getEmailPriority(type),
        },
      });

      return this.createSuccessResult<SendEmailResult>(
        {
          sent: true,
          emailId: emailRecord.id,
          message: `Email queued for delivery`,
        },
        {
          capability: "send-email",
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
          code: "EMAIL_ERROR",
          message: error instanceof Error ? error.message : "Email failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "send-email",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleSendDigest(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<DigestResult>> {
    const startTime = Date.now();
    const { type = "daily", userFilter, limit = 100 } = input as DigestInput;

    try {
      // Find users due for digest
      const cutoffDate = new Date();
      if (type === "weekly") {
        cutoffDate.setDate(cutoffDate.getDate() - 7);
      } else {
        cutoffDate.setDate(cutoffDate.getDate() - 1);
      }

      const users = await prisma.user.findMany({
        where: {
          emailNotifications: true,
          weeklyReports: true,
          OR: [
            { lastExposureDigestSent: { lt: cutoffDate } },
            { lastExposureDigestSent: null },
          ],
          ...(userFilter ? { plan: { in: userFilter } } : {}),
        },
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
        },
      });

      const results: DigestResult["results"] = [];
      let sent = 0;
      let skipped = 0;
      let errors = 0;

      for (const user of users) {
        try {
          // Get user's recent activity
          const [exposureCount, removalCount] = await Promise.all([
            prisma.exposure.count({
              where: {
                userId: user.id,
                firstFoundAt: { gte: cutoffDate },
              },
            }),
            prisma.removalRequest.count({
              where: {
                userId: user.id,
                status: "VERIFIED",
                completedAt: { gte: cutoffDate },
              },
            }),
          ]);

          // Skip if no activity
          if (exposureCount === 0 && removalCount === 0) {
            skipped++;
            results.push({
              userId: user.id,
              status: "SKIPPED",
              message: "No recent activity",
            });
            continue;
          }

          // Queue digest email
          await prisma.emailQueue.create({
            data: {
              id: nanoid(),
              toEmail: user.email,
              subject: `Your ${type === "weekly" ? "Weekly" : "Daily"} Privacy Report`,
              htmlContent: this.getDigestTemplate({
                user,
                exposureCount,
                removalCount,
                type,
              }),
              emailType: `${type}_digest`,
              userId: user.id,
              priority: 5,
            },
          });

          // Update last sent timestamp
          await prisma.user.update({
            where: { id: user.id },
            data: { lastExposureDigestSent: new Date() },
          });

          sent++;
          results.push({
            userId: user.id,
            status: "SENT",
          });
        } catch {
          errors++;
          results.push({
            userId: user.id,
            status: "ERROR",
          });
        }
      }

      return this.createSuccessResult<DigestResult>(
        {
          sent,
          skipped,
          errors,
          results,
        },
        {
          capability: "send-digest",
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
          code: "DIGEST_ERROR",
          message: error instanceof Error ? error.message : "Digest failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "send-digest",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleSendReminder(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<ReminderResult>> {
    const startTime = Date.now();
    const { type = "removal", limit = 50 } = input as ReminderInput;

    try {
      const results: ReminderResult["results"] = [];
      let sent = 0;
      let skipped = 0;

      if (type === "removal") {
        // Find users with removals requiring action
        const usersWithPendingAction = await prisma.removalRequest.findMany({
          where: {
            status: "REQUIRES_MANUAL",
            updatedAt: {
              // Reminded at least 7 days ago
              lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                emailNotifications: true,
              },
            },
          },
          take: limit,
          distinct: ["userId"],
        });

        for (const removal of usersWithPendingAction) {
          if (!removal.user.emailNotifications) {
            skipped++;
            continue;
          }

          await prisma.emailQueue.create({
            data: {
              id: nanoid(),
              toEmail: removal.user.email,
              subject: "Action Required: Complete Your Data Removal",
              htmlContent: this.getReminderTemplate("removal", {
                user: removal.user,
              }),
              emailType: "removal_reminder",
              userId: removal.user.id,
              priority: 3,
            },
          });

          sent++;
          results.push({
            userId: removal.user.id,
            type: "removal",
            status: "SENT",
          });
        }
      }

      if (type === "scan") {
        // Find users who haven't scanned recently
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const usersNeedingScan = await prisma.user.findMany({
          where: {
            emailNotifications: true,
            plan: { in: ["PRO", "ENTERPRISE"] },
            OR: [
              { lastScanAt: { lt: thirtyDaysAgo } },
              { lastScanAt: null },
            ],
          },
          take: limit,
          select: {
            id: true,
            email: true,
            name: true,
          },
        });

        for (const user of usersNeedingScan) {
          await prisma.emailQueue.create({
            data: {
              id: nanoid(),
              toEmail: user.email,
              subject: "Time to Check Your Privacy Status",
              htmlContent: this.getReminderTemplate("scan", { user }),
              emailType: "scan_reminder",
              userId: user.id,
              priority: 5,
            },
          });

          sent++;
          results.push({
            userId: user.id,
            type: "scan",
            status: "SENT",
          });
        }
      }

      return this.createSuccessResult<ReminderResult>(
        {
          sent,
          skipped,
          results,
        },
        {
          capability: "send-reminder",
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
          code: "REMINDER_ERROR",
          message: error instanceof Error ? error.message : "Reminder failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "send-reminder",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getEmailSubject(type: string): string {
    const subjects: Record<string, string> = {
      welcome: "Welcome to GhostMyData",
      removal_update: "Your Removal Request Update",
      scan_complete: "Your Privacy Scan Results",
      weekly_digest: "Your Weekly Privacy Report",
      daily_digest: "Your Daily Privacy Summary",
    };
    return subjects[type] || "Update from GhostMyData";
  }

  private getEmailPriority(type: string): number {
    const priorities: Record<string, number> = {
      security_alert: 1,
      removal_update: 2,
      scan_complete: 3,
      welcome: 4,
      digest: 5,
    };
    return priorities[type] || 5;
  }

  private getEmailTemplate(type: string, data: Record<string, unknown>): string {
    // Placeholder template - in production this would use a proper templating system
    return `
      <html>
        <body>
          <h1>GhostMyData</h1>
          <p>Email type: ${type}</p>
          <p>Data: ${JSON.stringify(data)}</p>
        </body>
      </html>
    `;
  }

  private getDigestTemplate(data: {
    user: { name?: string | null };
    exposureCount: number;
    removalCount: number;
    type: string;
  }): string {
    return `
      <html>
        <body>
          <h1>Your ${data.type === "weekly" ? "Weekly" : "Daily"} Privacy Report</h1>
          <p>Hi ${data.user.name || "there"},</p>
          <p>Here's your privacy summary:</p>
          <ul>
            <li>New exposures found: ${data.exposureCount}</li>
            <li>Removals completed: ${data.removalCount}</li>
          </ul>
          <p>Keep protecting your privacy!</p>
        </body>
      </html>
    `;
  }

  private getReminderTemplate(type: string, data: { user: { name?: string | null } }): string {
    const templates: Record<string, string> = {
      removal: `
        <p>Hi ${data.user.name || "there"},</p>
        <p>You have data removal requests that need your action to complete.</p>
        <p>Log in to see what steps are needed.</p>
      `,
      scan: `
        <p>Hi ${data.user.name || "there"},</p>
        <p>It's been a while since your last privacy scan.</p>
        <p>Run a new scan to check for new exposures.</p>
      `,
    };

    return `
      <html>
        <body>
          <h1>GhostMyData Reminder</h1>
          ${templates[type] || ""}
        </body>
      </html>
    `;
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

let communicationsAgentInstance: CommunicationsAgent | null = null;

export function getCommunicationsAgent(): CommunicationsAgent {
  if (!communicationsAgentInstance) {
    communicationsAgentInstance = new CommunicationsAgent();
    registerAgent(communicationsAgentInstance);
  }
  return communicationsAgentInstance;
}

export async function sendDailyDigests(limit = 100): Promise<DigestResult> {
  const agent = getCommunicationsAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<DigestResult>(
    "send-digest",
    { type: "daily", limit },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Daily digest failed");
}

export async function sendReminders(
  type: "removal" | "scan" | "profile" = "removal",
  limit = 50
): Promise<ReminderResult> {
  const agent = getCommunicationsAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<ReminderResult>(
    "send-reminder",
    { type, limit },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Reminders failed");
}

export { CommunicationsAgent };
export default getCommunicationsAgent;
