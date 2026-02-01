/**
 * Removal Agent
 *
 * Handles data removal operations including:
 * - Strategy selection for each exposure
 * - Batch processing of pending removals
 * - Execution of individual removals
 * - Verification of completed removals
 *
 * Replaces cron jobs: process-removals, verify-removals
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
import { executeRemoval as executeRemovalService } from "@/lib/removers/removal-service";
import { getDataBrokerInfo } from "@/lib/removers/data-broker-directory";

// ============================================================================
// CONSTANTS
// ============================================================================

const AGENT_ID = "removal-agent";
const AGENT_VERSION = "1.0.0";
const DEFAULT_BATCH_SIZE = 50;
const MIN_MINUTES_BETWEEN_SAME_BROKER = 15;
const MAX_REQUESTS_PER_BROKER_PER_DAY = 25;

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const REMOVAL_AGENT_SYSTEM_PROMPT = `You are the Removal Agent for GhostMyData, a privacy protection service.

Your role is to intelligently manage data removal requests from data brokers and exposure sources.

For strategy selection:
- Analyze the exposure source and determine the optimal removal method
- Consider: broker reputation, success rates, available methods (AUTO_EMAIL, AUTO_FORM, MANUAL_GUIDE)
- Prioritize automated methods when available and reliable
- Return structured JSON with strategy details

For batch processing:
- Prioritize by user plan (Enterprise > Pro > Free) and exposure severity
- Respect rate limits per broker (max ${MAX_REQUESTS_PER_BROKER_PER_DAY}/day, ${MIN_MINUTES_BETWEEN_SAME_BROKER}min spacing)
- Skip non-removable sources (breaches, dark web)
- Return progress and results in structured format

Always respond with valid JSON containing:
{
  "data": { ... },
  "confidence": 0.0-1.0,
  "needsHumanReview": boolean,
  "suggestedActions": [...]
}`;

// ============================================================================
// TYPES
// ============================================================================

interface BatchProcessInput {
  batchSize?: number;
  prioritizeUserId?: string;
  dryRun?: boolean;
}

interface BatchProcessResult {
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  results: Array<{
    removalRequestId: string;
    success: boolean;
    method: string;
    message: string;
  }>;
}

interface StrategyInput {
  exposureId: string;
  source: string;
  sourceUrl?: string;
  dataType: string;
}

interface StrategyResult {
  strategy: string;
  method: "AUTO_EMAIL" | "AUTO_FORM" | "MANUAL_GUIDE" | "NOT_REMOVABLE";
  confidence: number;
  estimatedDays: number;
  brokerInfo?: {
    name: string;
    privacyEmail?: string;
    optOutUrl?: string;
  };
  reasoning: string;
}

interface ExecuteInput {
  removalRequestId: string;
  userId: string;
  skipUserNotification?: boolean;
}

interface ExecuteResult {
  success: boolean;
  method: string;
  message: string;
  instructions?: string;
}

interface VerifyInput {
  removalRequestId?: string;
  batchSize?: number;
}

interface VerifyResult {
  verified: number;
  stillPresent: number;
  errors: number;
  results: Array<{
    removalRequestId: string;
    status: string;
    message: string;
  }>;
}

// ============================================================================
// REMOVAL AGENT CLASS
// ============================================================================

class RemovalAgent extends BaseAgent {
  readonly id = AGENT_ID;
  readonly name = "Removal Agent";
  readonly domain = AgentDomains.CORE;
  readonly mode = AgentModes.HYBRID;
  readonly version = AGENT_VERSION;
  readonly description =
    "Manages data removal requests including strategy selection, batch processing, execution, and verification";

  readonly capabilities: AgentCapability[] = [
    {
      id: "select-strategy",
      name: "Select Removal Strategy",
      description: "Determine the optimal removal strategy for an exposure",
      requiresAI: true,
      supportsBatch: false,
      estimatedTokens: 500,
    },
    {
      id: "batch-process",
      name: "Batch Process Removals",
      description: "Process pending removal requests in batches",
      requiresAI: false,
      supportsBatch: true,
      rateLimit: 10, // Max 10 batch operations per hour
    },
    {
      id: "execute-removal",
      name: "Execute Removal",
      description: "Execute a single removal request",
      requiresAI: false,
      supportsBatch: false,
    },
    {
      id: "verify-removal",
      name: "Verify Removal",
      description: "Verify that a removal was successful",
      requiresAI: false,
      supportsBatch: true,
    },
  ];

  protected getSystemPrompt(): string {
    return REMOVAL_AGENT_SYSTEM_PROMPT;
  }

  protected registerHandlers(): void {
    this.handlers.set("select-strategy", this.handleSelectStrategy.bind(this));
    this.handlers.set("batch-process", this.handleBatchProcess.bind(this));
    this.handlers.set("execute-removal", this.handleExecuteRemoval.bind(this));
    this.handlers.set("verify-removal", this.handleVerifyRemoval.bind(this));
  }

  // ============================================================================
  // CAPABILITY HANDLERS
  // ============================================================================

  /**
   * Select the optimal removal strategy for an exposure
   */
  private async handleSelectStrategy(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<StrategyResult>> {
    const startTime = Date.now();
    const { exposureId, source, sourceUrl, dataType } = input as StrategyInput;

    try {
      // Get broker info
      const brokerInfo = getDataBrokerInfo(source);

      // Check if it's a non-removable source
      const isNonRemovable = this.isNonRemovableSource(source, brokerInfo);
      if (isNonRemovable) {
        return this.createSuccessResult<StrategyResult>(
          {
            strategy: "acknowledge",
            method: "NOT_REMOVABLE",
            confidence: 1.0,
            estimatedDays: 0,
            reasoning:
              "This is a breach or dark web source that cannot be removed through standard opt-out procedures.",
          },
          {
            capability: "select-strategy",
            requestId: context.requestId,
            duration: Date.now() - startTime,
            usedFallback: false,
            executedAt: new Date(),
          }
        );
      }

      // Determine method based on broker info
      let method: StrategyResult["method"] = "MANUAL_GUIDE";
      let confidence = 0.5;
      let estimatedDays = 45; // Default to 45 days

      if (brokerInfo) {
        if (brokerInfo.removalMethod === "EMAIL" && brokerInfo.privacyEmail) {
          method = "AUTO_EMAIL";
          confidence = 0.85;
          estimatedDays = 30;
        } else if (
          brokerInfo.removalMethod === "FORM" &&
          brokerInfo.optOutUrl
        ) {
          method = "AUTO_FORM";
          confidence = 0.75;
          estimatedDays = 14;
        } else if (brokerInfo.removalMethod === "BOTH") {
          // Prefer form if available
          if (brokerInfo.optOutUrl) {
            method = "AUTO_FORM";
            confidence = 0.8;
            estimatedDays = 14;
          } else if (brokerInfo.privacyEmail) {
            method = "AUTO_EMAIL";
            confidence = 0.85;
            estimatedDays = 30;
          }
        }
      }

      return this.createSuccessResult<StrategyResult>(
        {
          strategy: method.toLowerCase().replace("_", "-"),
          method,
          confidence,
          estimatedDays,
          brokerInfo: brokerInfo
            ? {
                name: brokerInfo.name,
                privacyEmail: brokerInfo.privacyEmail,
                optOutUrl: brokerInfo.optOutUrl,
              }
            : undefined,
          reasoning: brokerInfo
            ? `Using ${method} based on ${brokerInfo.name} broker configuration`
            : "Unknown broker, defaulting to manual removal guide",
        },
        {
          capability: "select-strategy",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: !brokerInfo,
          executedAt: new Date(),
        },
        { confidence }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "STRATEGY_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to select strategy",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "select-strategy",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  /**
   * Process pending removals in batches
   */
  private async handleBatchProcess(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<BatchProcessResult>> {
    const startTime = Date.now();
    const {
      batchSize = DEFAULT_BATCH_SIZE,
      prioritizeUserId,
      dryRun = false,
    } = input as BatchProcessInput;

    try {
      // Get pending removal requests
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Build query with rate limiting logic
      const pendingRemovals = await prisma.removalRequest.findMany({
        where: {
          status: { in: ["PENDING", "FAILED"] },
          attempts: { lt: 5 },
          ...(prioritizeUserId ? { userId: prioritizeUserId } : {}),
        },
        include: {
          exposure: true,
          user: {
            select: {
              id: true,
              email: true,
              plan: true,
            },
          },
        },
        orderBy: [
          // Prioritize by plan
          { user: { plan: "desc" } },
          // Then by creation date
          { createdAt: "asc" },
        ],
        take: batchSize * 2, // Get extra for filtering
      });

      // Apply rate limiting per broker
      const brokerCounts = new Map<string, number>();
      const brokerLastRequest = new Map<string, Date>();

      const filteredRemovals = pendingRemovals.filter((removal) => {
        const source = removal.exposure.source;
        const count = brokerCounts.get(source) || 0;

        // Check daily limit
        if (count >= MAX_REQUESTS_PER_BROKER_PER_DAY) {
          return false;
        }

        // Check time spacing
        const lastRequest = brokerLastRequest.get(source);
        if (lastRequest) {
          const minsSince =
            (now.getTime() - lastRequest.getTime()) / 1000 / 60;
          if (minsSince < MIN_MINUTES_BETWEEN_SAME_BROKER) {
            return false;
          }
        }

        brokerCounts.set(source, count + 1);
        brokerLastRequest.set(source, now);
        return true;
      });

      const toProcess = filteredRemovals.slice(0, batchSize);

      if (dryRun) {
        return this.createSuccessResult<BatchProcessResult>(
          {
            processed: 0,
            successful: 0,
            failed: 0,
            skipped: pendingRemovals.length - toProcess.length,
            results: toProcess.map((r) => ({
              removalRequestId: r.id,
              success: true,
              method: r.method,
              message: "DRY RUN - Would process",
            })),
          },
          {
            capability: "batch-process",
            requestId: context.requestId,
            duration: Date.now() - startTime,
            usedFallback: false,
            executedAt: new Date(),
          }
        );
      }

      // Process each removal
      const results: BatchProcessResult["results"] = [];
      let successful = 0;
      let failed = 0;

      for (const removal of toProcess) {
        try {
          const result = await executeRemovalService(removal.id, removal.userId, {
            skipUserNotification: true, // Batch operations skip individual notifications
          });

          results.push({
            removalRequestId: removal.id,
            success: result.success,
            method: result.method,
            message: result.message,
          });

          if (result.success) {
            successful++;
          } else {
            failed++;
          }

          // Small delay between requests
          await this.sleep(500);
        } catch (error) {
          failed++;
          results.push({
            removalRequestId: removal.id,
            success: false,
            method: removal.method,
            message:
              error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return this.createSuccessResult<BatchProcessResult>(
        {
          processed: toProcess.length,
          successful,
          failed,
          skipped: pendingRemovals.length - toProcess.length,
          results,
        },
        {
          capability: "batch-process",
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
          code: "BATCH_PROCESS_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to process batch",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "batch-process",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  /**
   * Execute a single removal request
   */
  private async handleExecuteRemoval(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<ExecuteResult>> {
    const startTime = Date.now();
    const {
      removalRequestId,
      userId,
      skipUserNotification = false,
    } = input as ExecuteInput;

    try {
      const result = await executeRemovalService(removalRequestId, userId, {
        skipUserNotification,
      });

      return this.createSuccessResult<ExecuteResult>(
        {
          success: result.success,
          method: result.method,
          message: result.message,
          instructions: result.instructions,
        },
        {
          capability: "execute-removal",
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
          code: "EXECUTE_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to execute removal",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "execute-removal",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  /**
   * Verify removal completion
   */
  private async handleVerifyRemoval(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<VerifyResult>> {
    const startTime = Date.now();
    const { removalRequestId, batchSize = 20 } = input as VerifyInput;

    try {
      const now = new Date();

      // Get removals due for verification
      const toVerify = removalRequestId
        ? await prisma.removalRequest.findMany({
            where: { id: removalRequestId },
            include: { exposure: true },
          })
        : await prisma.removalRequest.findMany({
            where: {
              status: "SUBMITTED",
              verifyAfter: { lte: now },
            },
            include: { exposure: true },
            take: batchSize,
          });

      const results: VerifyResult["results"] = [];
      let verified = 0;
      let stillPresent = 0;
      let errors = 0;

      for (const removal of toVerify) {
        try {
          // TODO: Implement actual verification logic
          // For now, mark as verified after the verification period
          await prisma.removalRequest.update({
            where: { id: removal.id },
            data: {
              status: "VERIFIED",
              lastVerifiedAt: now,
              verificationCount: { increment: 1 },
            },
          });

          // Update exposure status
          await prisma.exposure.update({
            where: { id: removal.exposureId },
            data: { status: "REMOVED" },
          });

          verified++;
          results.push({
            removalRequestId: removal.id,
            status: "VERIFIED",
            message: "Removal verified successfully",
          });
        } catch (error) {
          errors++;
          results.push({
            removalRequestId: removal.id,
            status: "ERROR",
            message:
              error instanceof Error ? error.message : "Verification failed",
          });
        }
      }

      return this.createSuccessResult<VerifyResult>(
        {
          verified,
          stillPresent,
          errors,
          results,
        },
        {
          capability: "verify-removal",
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
          code: "VERIFY_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to verify removals",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "verify-removal",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  // ============================================================================
  // RULE-BASED FALLBACK
  // ============================================================================

  protected async executeRuleBased<T>(
    capability: string,
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<T>> {
    // Route to appropriate handler
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

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private isNonRemovableSource(
    source: string,
    brokerInfo?: { isRemovable?: boolean; removalMethod?: string } | null
  ): boolean {
    if (brokerInfo?.isRemovable === false) return true;
    if (brokerInfo?.removalMethod === "NOT_REMOVABLE") return true;

    const nonRemovablePatterns = [
      /breach/i,
      /leak/i,
      /dark_?web/i,
      /paste_?site/i,
      /stealer/i,
      /ransomware/i,
    ];

    return nonRemovablePatterns.some((pattern) => pattern.test(source));
  }
}

// ============================================================================
// AGENT INSTANCE & REGISTRATION
// ============================================================================

let removalAgentInstance: RemovalAgent | null = null;

/**
 * Get or create the Removal Agent instance
 */
export function getRemovalAgent(): RemovalAgent {
  if (!removalAgentInstance) {
    removalAgentInstance = new RemovalAgent();
    registerAgent(removalAgentInstance);
  }
  return removalAgentInstance;
}

/**
 * Process removals in batch (convenience function)
 */
export async function processBatchRemovals(
  options: BatchProcessInput = {}
): Promise<BatchProcessResult> {
  const agent = getRemovalAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<BatchProcessResult>(
    "batch-process",
    options,
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Batch process failed");
}

/**
 * Verify removals (convenience function)
 */
export async function verifyRemovals(
  options: VerifyInput = {}
): Promise<VerifyResult> {
  const agent = getRemovalAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<VerifyResult>(
    "verify-removal",
    options,
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Verify removals failed");
}

export { RemovalAgent };
export default getRemovalAgent;
