/**
 * DataScrub Pro Agent Architecture - Core Type Definitions
 *
 * This file contains all shared types and interfaces for the agent system.
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export const AgentDomains = {
  CORE: "CORE",
  META: "META",
  COMPLIANCE: "COMPLIANCE",
  SECURITY: "SECURITY",
  USER_EXPERIENCE: "USER_EXPERIENCE",
  INTELLIGENCE: "INTELLIGENCE",
  CUSTOMER_SUCCESS: "CUSTOMER_SUCCESS",
  GROWTH: "GROWTH",
  REVENUE: "REVENUE",
  SPECIALIZED: "SPECIALIZED",
} as const;

export type AgentDomain = (typeof AgentDomains)[keyof typeof AgentDomains];

export const AgentModes = {
  AI: "AI",
  RULE_BASED: "RULE_BASED",
  HYBRID: "HYBRID",
} as const;

export type AgentMode = (typeof AgentModes)[keyof typeof AgentModes];

export const InvocationTypes = {
  CRON: "CRON",
  ON_DEMAND: "ON_DEMAND",
  EVENT: "EVENT",
  WEBHOOK: "WEBHOOK",
  MANUAL: "MANUAL",
} as const;

export type InvocationType =
  (typeof InvocationTypes)[keyof typeof InvocationTypes];

export const ExecutionStatuses = {
  PENDING: "PENDING",
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  TIMEOUT: "TIMEOUT",
} as const;

export type ExecutionStatus =
  (typeof ExecutionStatuses)[keyof typeof ExecutionStatuses];

export const HealthStatuses = {
  HEALTHY: "HEALTHY",
  DEGRADED: "DEGRADED",
  UNHEALTHY: "UNHEALTHY",
  UNKNOWN: "UNKNOWN",
} as const;

export type HealthStatus = (typeof HealthStatuses)[keyof typeof HealthStatuses];

export const Priority = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  URGENT: "URGENT",
  CRITICAL: "CRITICAL",
} as const;

export type PriorityLevel = (typeof Priority)[keyof typeof Priority];

// ============================================================================
// AGENT CAPABILITY DEFINITIONS
// ============================================================================

/**
 * Represents a single capability an agent can perform
 */
export interface AgentCapability {
  /** Unique identifier for this capability */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of what this capability does */
  description: string;
  /** Whether this capability requires AI (vs rule-based) */
  requiresAI: boolean;
  /** Expected input schema (simplified) */
  inputSchema?: Record<string, unknown>;
  /** Expected output schema (simplified) */
  outputSchema?: Record<string, unknown>;
  /** Rate limit per hour (0 = unlimited) */
  rateLimit?: number;
  /** Whether this capability can run in batch mode */
  supportsBatch?: boolean;
  /** Estimated token usage per invocation */
  estimatedTokens?: number;
}

// ============================================================================
// AGENT CONTEXT
// ============================================================================

/**
 * Context passed to every agent execution
 */
export interface AgentContext {
  /** Unique request ID for tracing */
  requestId: string;
  /** How this execution was triggered */
  invocationType: InvocationType;
  /** User ID if applicable */
  userId?: string;
  /** Tenant/organization ID for multi-tenancy */
  tenantId?: string;
  /** Priority level for this execution */
  priority?: PriorityLevel;
  /** Parent request ID for chained executions */
  parentRequestId?: string;
  /** Correlation ID for distributed tracing */
  correlationId?: string;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Whether to use AI or fallback to rules */
  preferAI?: boolean;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Retry count if this is a retry */
  retryCount?: number;
  /** Max retries allowed */
  maxRetries?: number;
  /** Timestamp when request was created */
  createdAt: Date;
}

// ============================================================================
// AGENT RESULTS
// ============================================================================

/**
 * Result from an agent execution
 */
export interface AgentResult<T = unknown> {
  /** Whether the execution was successful */
  success: boolean;
  /** The result data */
  data?: T;
  /** Error information if failed */
  error?: AgentError;
  /** Confidence score (0-1) for AI-generated results */
  confidence?: number;
  /** Whether human review is recommended */
  needsHumanReview: boolean;
  /** Items flagged for manager review */
  managerReviewItems?: ManagerReviewItem[];
  /** Execution metadata */
  metadata: AgentResultMetadata;
  /** Suggested follow-up actions */
  suggestedActions?: SuggestedAction[];
  /** Warnings that don't prevent success */
  warnings?: string[];
}

export interface AgentResultMetadata {
  /** Agent that produced this result */
  agentId: string;
  /** Capability that was executed */
  capability: string;
  /** Request ID */
  requestId: string;
  /** Execution duration in milliseconds */
  duration: number;
  /** Tokens used (if AI was involved) */
  tokensUsed?: number;
  /** Model used (if AI was involved) */
  model?: string;
  /** Whether fallback was used */
  usedFallback: boolean;
  /** Timestamp of execution */
  executedAt: Date;
}

export interface AgentError {
  /** Error code for programmatic handling */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Technical details (not shown to users) */
  details?: string;
  /** Stack trace (only in development) */
  stack?: string;
  /** Whether this error is retryable */
  retryable: boolean;
  /** Suggested retry delay in milliseconds */
  retryAfter?: number;
}

export interface ManagerReviewItem {
  /** Category of the item needing review */
  category: string;
  /** Description of what needs review */
  description: string;
  /** Priority level */
  priority: PriorityLevel;
  /** Related entity IDs */
  relatedIds?: Record<string, string>;
  /** Suggested action */
  suggestedAction?: string;
}

export interface SuggestedAction {
  /** Action identifier */
  action: string;
  /** Human-readable description */
  description: string;
  /** Target agent for this action */
  targetAgent?: string;
  /** Input for the action */
  input?: Record<string, unknown>;
  /** Priority of this action */
  priority?: PriorityLevel;
  /** Whether to execute automatically */
  autoExecute?: boolean;
}

// ============================================================================
// AGENT HEALTH
// ============================================================================

export interface AgentHealthInfo {
  /** Agent ID */
  agentId: string;
  /** Current health status */
  status: HealthStatus;
  /** When the agent last ran */
  lastRun?: Date;
  /** When the agent last succeeded */
  lastSuccess?: Date;
  /** When the agent last failed */
  lastFailure?: Date;
  /** Consecutive failure count */
  consecutiveFailures: number;
  /** Success rate over last 24 hours */
  successRate24h?: number;
  /** Average execution time in milliseconds */
  avgExecutionTime?: number;
  /** Whether AI is available for this agent */
  aiAvailable: boolean;
  /** Error message if unhealthy */
  errorMessage?: string;
  /** Detailed health metrics */
  metrics?: AgentHealthMetrics;
}

export interface AgentHealthMetrics {
  /** Total executions in last 24 hours */
  executions24h: number;
  /** Successful executions in last 24 hours */
  successes24h: number;
  /** Failed executions in last 24 hours */
  failures24h: number;
  /** AI token usage in last 24 hours */
  tokensUsed24h: number;
  /** Estimated cost in USD for last 24 hours */
  estimatedCost24h: number;
  /** Average confidence score */
  avgConfidence?: number;
  /** Human review rate */
  humanReviewRate?: number;
}

// ============================================================================
// ORCHESTRATOR TYPES
// ============================================================================

/**
 * Request to the orchestrator
 */
export interface OrchestratorRequest {
  /** Action to perform (agent.capability or workflow name) */
  action: string;
  /** Input data */
  input: unknown;
  /** Execution context */
  context: Partial<AgentContext>;
  /** Workflow options */
  workflow?: WorkflowOptions;
}

export interface WorkflowOptions {
  /** Whether to run steps in parallel where possible */
  parallel?: boolean;
  /** Whether to stop on first error */
  stopOnError?: boolean;
  /** Timeout for entire workflow in milliseconds */
  timeout?: number;
  /** Whether to save intermediate results */
  saveIntermediateResults?: boolean;
}

/**
 * Response from the orchestrator
 */
export interface OrchestratorResponse<T = unknown> {
  /** Whether all operations succeeded */
  success: boolean;
  /** Results from executed agents */
  results: AgentResult<T>[];
  /** Aggregated metadata */
  metadata: OrchestratorMetadata;
  /** Errors that occurred */
  errors?: AgentError[];
}

export interface OrchestratorMetadata {
  /** Total duration in milliseconds */
  totalDuration: number;
  /** Number of agents invoked */
  agentsInvoked: number;
  /** Total tokens used */
  totalTokensUsed: number;
  /** Workflow execution path */
  executionPath: string[];
  /** Whether any fallbacks were used */
  usedFallbacks: boolean;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface AgentEvent {
  /** Event ID */
  id: string;
  /** Event type */
  type: AgentEventType;
  /** Source agent ID */
  sourceAgentId: string;
  /** Target agent ID (if specific) */
  targetAgentId?: string;
  /** Event payload */
  payload: unknown;
  /** Timestamp */
  timestamp: Date;
  /** Correlation ID for tracing */
  correlationId?: string;
}

export type AgentEventType =
  | "agent.started"
  | "agent.completed"
  | "agent.failed"
  | "agent.needs_review"
  | "workflow.started"
  | "workflow.completed"
  | "workflow.failed"
  | "escalation.requested"
  | "data.updated"
  | "alert.triggered"
  | "custom";

export type AgentEventHandler = (event: AgentEvent) => Promise<void>;

// ============================================================================
// AGENT INTERFACE
// ============================================================================

/**
 * Core interface that all agents must implement
 */
export interface Agent {
  /** Unique agent identifier */
  readonly id: string;
  /** Human-readable name */
  readonly name: string;
  /** Agent domain/category */
  readonly domain: AgentDomain;
  /** Operating mode */
  readonly mode: AgentMode;
  /** Version string */
  readonly version: string;
  /** List of capabilities */
  readonly capabilities: AgentCapability[];
  /** Description of what this agent does */
  readonly description: string;

  /**
   * Execute an agent capability
   */
  execute<T = unknown>(
    capability: string,
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<T>>;

  /**
   * Check if the agent is available and can execute
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get current health status
   */
  getHealth(): Promise<AgentHealthInfo>;

  /**
   * Initialize the agent (called on startup)
   */
  initialize?(): Promise<void>;

  /**
   * Cleanup resources (called on shutdown)
   */
  shutdown?(): Promise<void>;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface AgentConfig {
  /** Agent ID */
  agentId: string;
  /** Whether agent is enabled */
  enabled: boolean;
  /** AI model to use */
  model?: string;
  /** Maximum tokens per request */
  maxTokens?: number;
  /** Temperature for AI responses */
  temperature?: number;
  /** Rate limits */
  rateLimits?: RateLimitConfig;
  /** Retry configuration */
  retry?: RetryConfig;
  /** Feature flags */
  features?: Record<string, boolean>;
  /** Custom configuration */
  custom?: Record<string, unknown>;
}

export interface RateLimitConfig {
  /** Requests per minute */
  requestsPerMinute?: number;
  /** Requests per hour */
  requestsPerHour?: number;
  /** Requests per day */
  requestsPerDay?: number;
  /** Tokens per minute */
  tokensPerMinute?: number;
  /** Tokens per day */
  tokensPerDay?: number;
}

export interface RetryConfig {
  /** Maximum retry attempts */
  maxAttempts: number;
  /** Initial delay in milliseconds */
  initialDelay: number;
  /** Maximum delay in milliseconds */
  maxDelay: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier: number;
  /** Errors that should trigger retry */
  retryableErrors?: string[];
}

// ============================================================================
// BATCH PROCESSING TYPES
// ============================================================================

export interface BatchRequest<T = unknown> {
  /** Unique batch ID */
  batchId: string;
  /** Items to process */
  items: T[];
  /** Batch options */
  options?: BatchOptions;
}

export interface BatchOptions {
  /** Maximum concurrent items */
  concurrency?: number;
  /** Delay between items in milliseconds */
  delayBetweenItems?: number;
  /** Whether to continue on item failure */
  continueOnError?: boolean;
  /** Progress callback */
  onProgress?: (progress: BatchProgress) => void;
}

export interface BatchProgress {
  /** Total items */
  total: number;
  /** Completed items */
  completed: number;
  /** Failed items */
  failed: number;
  /** Current item being processed */
  current?: unknown;
  /** Estimated time remaining in milliseconds */
  estimatedTimeRemaining?: number;
}

export interface BatchResult<T = unknown> {
  /** Batch ID */
  batchId: string;
  /** Total items processed */
  totalItems: number;
  /** Successful items */
  successCount: number;
  /** Failed items */
  failedCount: number;
  /** Individual results */
  results: Array<{
    item: unknown;
    result?: AgentResult<T>;
    error?: AgentError;
  }>;
  /** Total duration in milliseconds */
  duration: number;
}

// ============================================================================
// PROMPT TYPES
// ============================================================================

export interface PromptVersion {
  /** Version ID */
  id: string;
  /** Prompt name/identifier */
  name: string;
  /** Version number */
  version: number;
  /** The prompt content */
  content: string;
  /** Variables in the prompt */
  variables?: string[];
  /** Model this prompt is optimized for */
  model?: string;
  /** Whether this is the active version */
  isActive: boolean;
  /** Performance metrics */
  metrics?: PromptMetrics;
  /** Created timestamp */
  createdAt: Date;
  /** Notes about this version */
  notes?: string;
}

export interface PromptMetrics {
  /** Number of times used */
  usageCount: number;
  /** Average confidence score */
  avgConfidence: number;
  /** Success rate */
  successRate: number;
  /** Average tokens used */
  avgTokens: number;
  /** Human review rate */
  humanReviewRate: number;
}

// ============================================================================
// A/B TESTING TYPES
// ============================================================================

export interface ABTest {
  /** Test ID */
  id: string;
  /** Test name */
  name: string;
  /** Description */
  description?: string;
  /** Agent this test applies to */
  agentId: string;
  /** Capability being tested */
  capability?: string;
  /** Test variants */
  variants: ABTestVariant[];
  /** Traffic allocation (must sum to 1) */
  trafficAllocation: Record<string, number>;
  /** Whether test is active */
  isActive: boolean;
  /** Start date */
  startDate: Date;
  /** End date (optional) */
  endDate?: Date;
  /** Minimum sample size per variant */
  minSampleSize?: number;
  /** Success metric */
  successMetric: string;
}

export interface ABTestVariant {
  /** Variant ID */
  id: string;
  /** Variant name (e.g., "control", "treatment_a") */
  name: string;
  /** Configuration overrides */
  config: Partial<AgentConfig>;
  /** Prompt version to use (if applicable) */
  promptVersion?: string;
  /** Results collected */
  results?: ABTestResults;
}

export interface ABTestResults {
  /** Sample size */
  sampleSize: number;
  /** Success count */
  successCount: number;
  /** Success rate */
  successRate: number;
  /** Average confidence */
  avgConfidence: number;
  /** Average duration */
  avgDuration: number;
  /** Statistical significance (p-value) */
  pValue?: number;
}

// ============================================================================
// OBSERVABILITY TYPES
// ============================================================================

export interface AgentMetrics {
  /** Agent ID */
  agentId: string;
  /** Timestamp */
  timestamp: Date;
  /** Metric name */
  name: string;
  /** Metric value */
  value: number;
  /** Metric unit */
  unit?: string;
  /** Tags for grouping */
  tags?: Record<string, string>;
}

export interface AgentTrace {
  /** Trace ID */
  traceId: string;
  /** Span ID */
  spanId: string;
  /** Parent span ID */
  parentSpanId?: string;
  /** Operation name */
  operationName: string;
  /** Agent ID */
  agentId: string;
  /** Start time */
  startTime: Date;
  /** End time */
  endTime?: Date;
  /** Duration in milliseconds */
  duration?: number;
  /** Status */
  status: "OK" | "ERROR";
  /** Tags */
  tags?: Record<string, string>;
  /** Logs/events */
  logs?: TraceLog[];
}

export interface TraceLog {
  /** Timestamp */
  timestamp: Date;
  /** Log level */
  level: "DEBUG" | "INFO" | "WARN" | "ERROR";
  /** Message */
  message: string;
  /** Additional fields */
  fields?: Record<string, unknown>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Helper type to create a context with defaults
 */
export type PartialContext = Partial<AgentContext> &
  Pick<AgentContext, "requestId" | "invocationType">;

/**
 * Helper type for agent capability handlers
 */
export type CapabilityHandler<TInput = unknown, TOutput = unknown> = (
  input: TInput,
  context: AgentContext
) => Promise<AgentResult<TOutput>>;

/**
 * Map of capability ID to handler
 */
export type CapabilityHandlerMap = Record<string, CapabilityHandler>;

/**
 * Agent factory function type
 */
export type AgentFactory = (config?: AgentConfig) => Agent;
