/**
 * DataScrub Pro Agent Architecture - Base Agent Class
 *
 * Abstract base class that all agents extend. Provides:
 * - Claude AI integration with fallback
 * - Execution logging and tracking
 * - Health monitoring
 * - Rate limiting
 * - Error handling
 */

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";
import {
  Agent,
  AgentCapability,
  AgentConfig,
  AgentContext,
  AgentDomain,
  AgentError,
  AgentHealthInfo,
  AgentMode,
  AgentResult,
  AgentResultMetadata,
  CapabilityHandler,
  ExecutionStatuses,
  HealthStatus,
  HealthStatuses,
  ManagerReviewItem,
  SuggestedAction,
} from "./types";
import { captureError } from "@/lib/error-reporting";
import { getLessonsForAgent } from "@/lib/agents/learning";

// ============================================================================
// CONSTANTS
// ============================================================================

/** Claude Sonnet — high quality for complex reasoning, customer-facing responses */
export const MODEL_SONNET = "claude-sonnet-4-5-20250929";
/** Claude Haiku — fast and cheap for classification, scoring, template selection */
export const MODEL_HAIKU = "claude-haiku-4-5-20251001";

export type TaskComplexity = "simple" | "complex";

const DEFAULT_MODEL = MODEL_SONNET;
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_TEMPERATURE = 0.3;
const MAX_CONSECUTIVE_FAILURES = 5;

// ============================================================================
// BASE AGENT CLASS
// ============================================================================

export abstract class BaseAgent implements Agent {
  // Required properties
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly domain: AgentDomain;
  abstract readonly mode: AgentMode;
  abstract readonly version: string;
  abstract readonly description: string;
  abstract readonly capabilities: AgentCapability[];

  // Optional properties with defaults
  protected config: AgentConfig;
  protected anthropic: Anthropic | null = null;
  protected isInitialized = false;
  protected executionCount = 0;
  protected lastExecution: Date | null = null;
  protected consecutiveFailures = 0;

  // Capability handlers map
  protected handlers: Map<string, CapabilityHandler> = new Map();

  constructor(config?: Partial<AgentConfig>) {
    // Note: agentId is set to placeholder here and updated in initialize()
    // because abstract properties can't be accessed in the constructor
    this.config = {
      agentId: config?.agentId || "pending-init",
      enabled: true,
      model: DEFAULT_MODEL,
      maxTokens: DEFAULT_MAX_TOKENS,
      temperature: DEFAULT_TEMPERATURE,
      ...config,
    };

    // Initialize Anthropic client if API key is available
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  // ============================================================================
  // ABSTRACT METHODS (must be implemented by subclasses)
  // ============================================================================

  /**
   * Get the system prompt for this agent
   */
  protected abstract getSystemPrompt(): string;

  /**
   * Execute using rule-based logic (fallback when AI is unavailable)
   */
  protected abstract executeRuleBased<T>(
    capability: string,
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<T>>;

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Set the agentId from the abstract property now that it's available
    this.config.agentId = this.id;

    // Register capability handlers
    this.registerHandlers();

    // Verify database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      console.warn(`[${this.name}] Database connection not available`);
    }

    // Verify AI availability
    if (!this.anthropic) {
      console.warn(`[${this.name}] AI not available - will use rule-based mode`);
    }

    this.isInitialized = true;
    console.log(`[${this.name}] Initialized successfully`);
  }

  /**
   * Register capability handlers - override in subclasses
   */
  protected registerHandlers(): void {
    // Subclasses should override this to register their handlers
  }

  /**
   * Main execution entry point
   */
  async execute<T = unknown>(
    capability: string,
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<T>> {
    const startTime = Date.now();
    const requestId = context.requestId || nanoid();

    // Validate capability exists
    const cap = this.capabilities.find((c) => c.id === capability);
    if (!cap) {
      return this.createErrorResult<T>(
        {
          code: "INVALID_CAPABILITY",
          message: `Capability '${capability}' not found on agent '${this.id}'`,
          retryable: false,
        },
        startTime,
        capability,
        requestId
      );
    }

    // Check if agent is enabled
    if (!this.config.enabled) {
      return this.createErrorResult<T>(
        {
          code: "AGENT_DISABLED",
          message: `Agent '${this.id}' is currently disabled`,
          retryable: false,
        },
        startTime,
        capability,
        requestId
      );
    }

    // Log execution start
    await this.logExecutionStart(capability, requestId, context, input);

    try {
      // Execute the capability
      const result = await this.doExecute<T>(capability, input, context, cap);

      // Update execution tracking
      this.executionCount++;
      this.lastExecution = new Date();
      if (result.success) {
        this.consecutiveFailures = 0;
      } else {
        this.consecutiveFailures++;
      }

      // Log execution completion
      await this.logExecutionComplete(
        capability,
        requestId,
        result,
        Date.now() - startTime
      );

      return result;
    } catch (error) {
      this.consecutiveFailures++;
      const agentError = this.normalizeError(error);

      // Log execution failure
      await this.logExecutionFailure(capability, requestId, agentError);

      return this.createErrorResult<T>(
        agentError,
        startTime,
        capability,
        requestId
      );
    }
  }

  /**
   * Check if agent is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.config.enabled) return false;
    if (this.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) return false;
    return true;
  }

  /**
   * Get agent health status
   */
  async getHealth(): Promise<AgentHealthInfo> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get execution stats from database
    const stats = {
      executions24h: 0,
      successes24h: 0,
      failures24h: 0,
      tokensUsed24h: 0,
      avgDuration: 0,
    };

    try {
      const executions = await prisma.agentExecution.findMany({
        where: {
          agentId: this.id,
          startedAt: { gte: oneDayAgo },
        },
        select: {
          status: true,
          tokensUsed: true,
          duration: true,
        },
      });

      stats.executions24h = executions.length;
      stats.successes24h = executions.filter(
        (e) => e.status === "COMPLETED"
      ).length;
      stats.failures24h = executions.filter((e) => e.status === "FAILED").length;
      stats.tokensUsed24h = executions.reduce(
        (sum, e) => sum + (e.tokensUsed || 0),
        0
      );
      stats.avgDuration =
        executions.length > 0
          ? executions.reduce((sum, e) => sum + (e.duration || 0), 0) /
            executions.length
          : 0;
    } catch {
      // Database might not have the table yet
    }

    // Determine health status
    let status: HealthStatus = HealthStatuses.HEALTHY;
    let errorMessage: string | undefined;

    if (this.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      status = HealthStatuses.UNHEALTHY;
      errorMessage = `${this.consecutiveFailures} consecutive failures`;
    } else if (this.consecutiveFailures > 0) {
      status = HealthStatuses.DEGRADED;
      errorMessage = `${this.consecutiveFailures} recent failures`;
    } else if (!this.anthropic && this.mode !== "RULE_BASED") {
      status = HealthStatuses.DEGRADED;
      errorMessage = "AI not available, using fallback mode";
    }

    // Estimate cost (Claude pricing: ~$3/1M input, ~$15/1M output tokens)
    const estimatedCost24h = (stats.tokensUsed24h / 1000000) * 9; // Approximate average

    return {
      agentId: this.id,
      status,
      lastRun: this.lastExecution || undefined,
      lastSuccess:
        stats.successes24h > 0 ? this.lastExecution || undefined : undefined,
      lastFailure:
        stats.failures24h > 0 ? this.lastExecution || undefined : undefined,
      consecutiveFailures: this.consecutiveFailures,
      successRate24h:
        stats.executions24h > 0
          ? stats.successes24h / stats.executions24h
          : undefined,
      avgExecutionTime: stats.avgDuration || undefined,
      aiAvailable: !!this.anthropic,
      errorMessage,
      metrics: {
        executions24h: stats.executions24h,
        successes24h: stats.successes24h,
        failures24h: stats.failures24h,
        tokensUsed24h: stats.tokensUsed24h,
        estimatedCost24h,
      },
    };
  }

  /**
   * Cleanup resources
   */
  async shutdown(): Promise<void> {
    this.isInitialized = false;
    console.log(`[${this.name}] Shutdown complete`);
  }

  // ============================================================================
  // PROTECTED METHODS
  // ============================================================================

  /**
   * Core execution logic with AI/fallback handling
   */
  protected async doExecute<T>(
    capability: string,
    input: unknown,
    context: AgentContext,
    cap: AgentCapability
  ): Promise<AgentResult<T>> {
    // Check for registered handler first
    const handler = this.handlers.get(capability);
    if (handler) {
      return handler(input, context) as Promise<AgentResult<T>>;
    }

    // Try AI execution if available and capability requires it
    if (this.anthropic && (cap.requiresAI || context.preferAI !== false)) {
      try {
        return await this.executeWithAI<T>(capability, input, context);
      } catch (error) {
        console.warn(
          `[${this.name}] AI execution failed, falling back to rules:`,
          error
        );
        // Fall through to rule-based execution
      }
    }

    // Use rule-based execution
    const result = await this.executeRuleBased<T>(capability, input, context);

    // Mark that fallback was used
    result.metadata.usedFallback = true;

    return result;
  }

  /**
   * Execute using Claude AI
   */
  protected async executeWithAI<T>(
    capability: string,
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<T>> {
    const startTime = Date.now();
    const requestId = context.requestId || nanoid();

    if (!this.anthropic) {
      throw new Error("Anthropic client not initialized");
    }

    // Build the user message
    const userMessage = this.buildUserMessage(capability, input, context);

    // Inject learning context (appends learned patterns if any exist)
    const learningContext = await this.getLearningContext(capability, input);
    const systemPrompt = this.getSystemPrompt() + learningContext;

    // Call Claude
    const response = await this.anthropic.messages.create({
      model: this.config.model || DEFAULT_MODEL,
      max_tokens: this.config.maxTokens || DEFAULT_MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    // Extract text response
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse JSON response
    const parsed = this.parseAIResponse<T>(textContent.text);

    // Calculate tokens used
    const tokensUsed =
      (response.usage?.input_tokens || 0) +
      (response.usage?.output_tokens || 0);

    return {
      success: true,
      data: parsed.data,
      confidence: parsed.confidence,
      needsHumanReview: parsed.needsHumanReview || false,
      managerReviewItems: parsed.managerReviewItems,
      suggestedActions: parsed.suggestedActions,
      metadata: {
        agentId: this.id,
        capability,
        requestId,
        duration: Date.now() - startTime,
        tokensUsed,
        model: this.config.model || DEFAULT_MODEL,
        usedFallback: false,
        executedAt: new Date(),
      },
    };
  }

  /**
   * Build user message for AI
   */
  protected buildUserMessage(
    capability: string,
    input: unknown,
    context: AgentContext
  ): string {
    return `
CAPABILITY: ${capability}
REQUEST_ID: ${context.requestId}
INVOCATION_TYPE: ${context.invocationType}
${context.userId ? `USER_ID: ${context.userId}` : ""}
${context.metadata ? `METADATA: ${JSON.stringify(context.metadata)}` : ""}

INPUT:
${JSON.stringify(input, null, 2)}

Please process this request and return a JSON response.
`;
  }

  /**
   * Parse AI response into structured format
   */
  protected parseAIResponse<T>(text: string): {
    data?: T;
    confidence?: number;
    needsHumanReview?: boolean;
    managerReviewItems?: ManagerReviewItem[];
    suggestedActions?: SuggestedAction[];
  } {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          data: parsed.data || parsed.result || parsed,
          confidence: parsed.confidence,
          needsHumanReview: parsed.needsHumanReview,
          managerReviewItems: parsed.managerReviewItems,
          suggestedActions: parsed.suggestedActions,
        };
      }
      // If no JSON, return the text as data
      return { data: text as unknown as T };
    } catch {
      // Return raw text if parsing fails
      return { data: text as unknown as T };
    }
  }

  /**
   * Create an error result
   */
  protected createErrorResult<T>(
    error: AgentError,
    startTime: number,
    capability: string,
    requestId: string
  ): AgentResult<T> {
    return {
      success: false,
      error,
      needsHumanReview: true,
      metadata: {
        agentId: this.id,
        capability,
        requestId,
        duration: Date.now() - startTime,
        usedFallback: false,
        executedAt: new Date(),
      },
    };
  }

  /**
   * Normalize any error into AgentError format
   */
  protected normalizeError(error: unknown): AgentError {
    if (error instanceof Error) {
      const isRateLimited =
        error.message.includes("rate") || error.message.includes("429");
      const isTimeout =
        error.message.includes("timeout") || error.message.includes("ETIMEDOUT");

      return {
        code: isRateLimited
          ? "RATE_LIMITED"
          : isTimeout
            ? "TIMEOUT"
            : "EXECUTION_ERROR",
        message: error.message,
        details: error.stack,
        retryable: isRateLimited || isTimeout,
        retryAfter: isRateLimited ? 60000 : isTimeout ? 5000 : undefined,
      };
    }

    return {
      code: "UNKNOWN_ERROR",
      message: String(error),
      retryable: true,
    };
  }

  // ============================================================================
  // LOGGING METHODS
  // ============================================================================

  /**
   * Log execution start to database
   */
  protected async logExecutionStart(
    capability: string,
    requestId: string,
    context: AgentContext,
    input: unknown
  ): Promise<void> {
    try {
      await prisma.agentExecution.create({
        data: {
          id: nanoid(),
          agentId: this.id,
          capability,
          requestId,
          invocationType: context.invocationType,
          status: ExecutionStatuses.RUNNING,
          input: JSON.stringify(input),
          model: this.config.model || DEFAULT_MODEL,
          startedAt: new Date(),
        },
      });
    } catch (error) {
      // Log but don't fail the execution
      captureError(`[${this.name}] Failed to log execution start`, error);
    }
  }

  /**
   * Log execution completion to database
   */
  protected async logExecutionComplete<T>(
    capability: string,
    requestId: string,
    result: AgentResult<T>,
    duration: number
  ): Promise<void> {
    try {
      await prisma.agentExecution.update({
        where: { requestId },
        data: {
          status: result.success
            ? ExecutionStatuses.COMPLETED
            : ExecutionStatuses.FAILED,
          output: JSON.stringify(result.data),
          error: result.error ? JSON.stringify(result.error) : null,
          confidence: result.confidence,
          needsHumanReview: result.needsHumanReview,
          completedAt: new Date(),
          duration,
          tokensUsed: result.metadata.tokensUsed,
        },
      });
    } catch (error) {
      captureError(`[${this.name}] Failed to log execution complete`, error);
    }
  }

  /**
   * Log execution failure to database
   */
  protected async logExecutionFailure(
    capability: string,
    requestId: string,
    error: AgentError
  ): Promise<void> {
    try {
      await prisma.agentExecution.update({
        where: { requestId },
        data: {
          status: ExecutionStatuses.FAILED,
          error: JSON.stringify(error),
          completedAt: new Date(),
        },
      });
    } catch (updateError) {
      captureError(`[${this.name}] Failed to log execution failure`, updateError);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Create a successful result
   */
  protected createSuccessResult<T>(
    data: T,
    metadata: Partial<AgentResultMetadata>,
    options?: {
      confidence?: number;
      needsHumanReview?: boolean;
      managerReviewItems?: ManagerReviewItem[];
      suggestedActions?: SuggestedAction[];
      warnings?: string[];
    }
  ): AgentResult<T> {
    return {
      success: true,
      data,
      confidence: options?.confidence,
      needsHumanReview: options?.needsHumanReview || false,
      managerReviewItems: options?.managerReviewItems,
      suggestedActions: options?.suggestedActions,
      warnings: options?.warnings,
      metadata: {
        agentId: this.id,
        capability: metadata.capability || "unknown",
        requestId: metadata.requestId || nanoid(),
        duration: metadata.duration || 0,
        tokensUsed: metadata.tokensUsed,
        model: metadata.model,
        usedFallback: metadata.usedFallback || false,
        executedAt: metadata.executedAt || new Date(),
      },
    };
  }

  /**
   * Get the appropriate model for a task complexity level.
   * 'simple' → Haiku (classification, scoring, template matching)
   * 'complex' → Sonnet (content generation, customer-facing responses)
   */
  protected getModel(complexity: TaskComplexity = "complex"): string {
    // If agent has a custom model override, use that
    if (this.config.model && this.config.model !== DEFAULT_MODEL) {
      return this.config.model;
    }
    return complexity === "simple" ? MODEL_HAIKU : MODEL_SONNET;
  }

  /**
   * Execute using Claude AI with a specific model
   */
  protected async executeWithModel<T>(
    capability: string,
    input: unknown,
    context: AgentContext,
    model: string
  ): Promise<AgentResult<T>> {
    const startTime = Date.now();
    const requestId = context.requestId || nanoid();

    if (!this.anthropic) {
      throw new Error("Anthropic client not initialized");
    }

    const userMessage = this.buildUserMessage(capability, input, context);

    // Inject learning context
    const learningContext = await this.getLearningContext(capability, input);
    const systemPrompt = this.getSystemPrompt() + learningContext;

    const response = await this.anthropic.messages.create({
      model,
      max_tokens: this.config.maxTokens || DEFAULT_MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    const parsed = this.parseAIResponse<T>(textContent.text);
    const tokensUsed =
      (response.usage?.input_tokens || 0) +
      (response.usage?.output_tokens || 0);

    return {
      success: true,
      data: parsed.data,
      confidence: parsed.confidence,
      needsHumanReview: parsed.needsHumanReview || false,
      managerReviewItems: parsed.managerReviewItems,
      suggestedActions: parsed.suggestedActions,
      metadata: {
        agentId: this.id,
        capability,
        requestId,
        duration: Date.now() - startTime,
        tokensUsed,
        model,
        usedFallback: false,
        executedAt: new Date(),
      },
    };
  }

  /**
   * Sleep utility for rate limiting
   */
  protected async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry with exponential backoff
   */
  protected async withRetry<T>(
    fn: () => Promise<T>,
    maxAttempts = 3,
    initialDelay = 1000
  ): Promise<T> {
    let lastError: Error | undefined;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxAttempts) {
          console.warn(
            `[${this.name}] Attempt ${attempt} failed, retrying in ${delay}ms:`,
            lastError.message
          );
          await this.sleep(delay);
          delay *= 2; // Exponential backoff
        }
      }
    }

    throw lastError;
  }

  /**
   * Read a strategic directive with typed fallback.
   * Returns defaultValue if directive doesn't exist or DB is unavailable.
   */
  protected async getDirective<T>(key: string, defaultValue: T): Promise<T> {
    const { getDirective } = await import("@/lib/mastermind/directives");
    return getDirective(key, defaultValue);
  }

  /**
   * Get learning context for a capability — recent lessons from past outcomes.
   * Override in subclasses for domain-specific learning context.
   * Returns empty string if no lessons exist (adds zero overhead).
   */
  protected async getLearningContext(
    capability: string,
    _input?: unknown
  ): Promise<string> {
    return getLessonsForAgent(this.id, capability, 5);
  }

  /**
   * Get agent configuration value
   */
  protected getConfigValue<T>(key: string, defaultValue: T): T {
    if (this.config.custom && key in this.config.custom) {
      return this.config.custom[key] as T;
    }
    return defaultValue;
  }

  /**
   * Check if a feature is enabled
   */
  protected isFeatureEnabled(feature: string): boolean {
    return this.config.features?.[feature] ?? false;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a new agent context
 */
export function createAgentContext(
  partial: Partial<AgentContext> & { requestId?: string; invocationType?: string }
): AgentContext {
  return {
    requestId: partial.requestId || nanoid(),
    invocationType: (partial.invocationType as AgentContext["invocationType"]) || "ON_DEMAND",
    userId: partial.userId,
    tenantId: partial.tenantId,
    priority: partial.priority,
    parentRequestId: partial.parentRequestId,
    correlationId: partial.correlationId,
    timeout: partial.timeout,
    preferAI: partial.preferAI ?? true,
    metadata: partial.metadata,
    retryCount: partial.retryCount ?? 0,
    maxRetries: partial.maxRetries ?? 3,
    createdAt: partial.createdAt || new Date(),
  };
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return nanoid();
}
