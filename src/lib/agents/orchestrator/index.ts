/**
 * DataScrub Pro Agent Architecture - Orchestrator
 *
 * Central coordinator for all agent operations.
 * Routes requests, manages workflows, handles circuit breaking.
 */

import { nanoid } from "nanoid";
import {
  AgentContext,
  AgentResult,
  InvocationTypes,
  OrchestratorMetadata,
  OrchestratorRequest,
  OrchestratorResponse,
  WorkflowOptions,
} from "../types";
import { getRegistry } from "../registry";
import { getRouter, RoutingResult } from "./routing-rules";
import { getEventBus } from "./event-bus";
import { WorkflowEngine } from "./workflows";
import { getRemediationEngine } from "./remediation-engine";
import { createAgentContext } from "../base-agent";
import { logger } from "@/lib/logger";

// ============================================================================
// TYPES
// ============================================================================

export interface CircuitBreakerState {
  agentId: string;
  isOpen: boolean;
  failures: number;
  lastFailure?: Date;
  openedAt?: Date;
  halfOpenAt?: Date;
}

export interface OrchestratorConfig {
  /** Enable circuit breaker */
  enableCircuitBreaker: boolean;
  /** Failure threshold before opening circuit */
  circuitBreakerThreshold: number;
  /** Time in ms before trying half-open */
  circuitBreakerTimeout: number;
  /** Enable event emission */
  enableEvents: boolean;
  /** Default timeout for agent calls */
  defaultTimeout: number;
  /** Enable parallel execution where possible */
  enableParallelExecution: boolean;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: OrchestratorConfig = {
  enableCircuitBreaker: true,
  circuitBreakerThreshold: 5,
  circuitBreakerTimeout: 60000, // 1 minute
  enableEvents: true,
  defaultTimeout: 30000, // 30 seconds
  enableParallelExecution: true,
};

// ============================================================================
// ORCHESTRATOR CLASS
// ============================================================================

class AgentOrchestrator {
  private static instance: AgentOrchestrator;
  private config: OrchestratorConfig;
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private workflowEngine: WorkflowEngine;
  private isInitialized = false;

  private constructor(config?: Partial<OrchestratorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.workflowEngine = new WorkflowEngine(this.executeAction.bind(this));
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<OrchestratorConfig>): AgentOrchestrator {
    if (!AgentOrchestrator.instance) {
      AgentOrchestrator.instance = new AgentOrchestrator(config);
    }
    return AgentOrchestrator.instance;
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize the orchestrator and all agents
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    logger.debug("[Orchestrator] Initializing...");

    // Initialize all registered agents
    await getRegistry().initializeAll();

    // Set up event handlers
    if (this.config.enableEvents) {
      this.setupEventHandlers();
    }

    // Initialize the remediation engine for auto-handling issues
    await getRemediationEngine().initialize();

    this.isInitialized = true;
    logger.debug("[Orchestrator] Initialization complete");
  }

  /**
   * Set up event handlers for agent events
   */
  private setupEventHandlers(): void {
    const eventBus = getEventBus();

    // Handle agent failures for circuit breaker
    eventBus.subscribe("agent.failed", async (event) => {
      if (this.config.enableCircuitBreaker) {
        this.recordFailure(event.sourceAgentId);
      }
    });

    // Handle agent success to reset circuit breaker
    eventBus.subscribe("agent.completed", async (event) => {
      if (this.config.enableCircuitBreaker) {
        this.recordSuccess(event.sourceAgentId);
      }
    });

    // Handle escalation requests
    eventBus.subscribe("escalation.requested", async (event) => {
      logger.debug(
        `[Orchestrator] Escalation from ${event.sourceAgentId} to ${event.targetAgentId}`
      );
      // Could trigger escalation workflow here
    });
  }

  // ============================================================================
  // MAIN EXECUTION
  // ============================================================================

  /**
   * Execute an orchestrator request
   */
  async execute<T = unknown>(
    request: OrchestratorRequest
  ): Promise<OrchestratorResponse<T>> {
    const startTime = Date.now();
    const requestId = request.context.requestId || nanoid();

    // Create full context
    const context = createAgentContext({
      ...request.context,
      requestId,
      createdAt: new Date(),
    });

    // Check if this is a workflow
    if (request.workflow || request.action.startsWith("workflow.")) {
      const workflowId = request.action.replace("workflow.", "");
      return this.executeWorkflow<T>(
        workflowId,
        request.input,
        context,
        request.workflow
      );
    }

    // Route the request
    const route = getRouter().route(request.action, request.input, context);

    if (!route.found) {
      return {
        success: false,
        results: [],
        errors: [
          {
            code: "NO_ROUTE",
            message: `No route found for action '${request.action}'`,
            retryable: false,
          },
        ],
        metadata: this.createEmptyMetadata(startTime),
      };
    }

    // Execute the action
    try {
      const result = await this.executeRoute<T>(route, context);

      return {
        success: result.success,
        results: [result],
        metadata: {
          totalDuration: Date.now() - startTime,
          agentsInvoked: 1,
          totalTokensUsed: result.metadata.tokensUsed || 0,
          executionPath: [route.agentId!],
          usedFallbacks: result.metadata.usedFallback,
        },
      };
    } catch (error) {
      const agentError =
        error instanceof Error
          ? { code: "EXECUTION_ERROR", message: error.message, retryable: true }
          : { code: "UNKNOWN_ERROR", message: String(error), retryable: true };

      return {
        success: false,
        results: [],
        errors: [agentError],
        metadata: this.createEmptyMetadata(startTime),
      };
    }
  }

  /**
   * Execute a routed request
   */
  private async executeRoute<T>(
    route: RoutingResult,
    context: AgentContext
  ): Promise<AgentResult<T>> {
    const { agentId, capability, input, fallbackAgentId } = route;

    // Check circuit breaker
    if (this.config.enableCircuitBreaker && this.isCircuitOpen(agentId!)) {
      logger.debug(`[Orchestrator] Circuit open for '${agentId}', using fallback`);

      if (fallbackAgentId) {
        return this.executeAgent<T>(fallbackAgentId, capability!, input, context);
      }

      throw new Error(`Circuit breaker open for agent '${agentId}'`);
    }

    // Get the agent
    const agent = getRegistry().getAgent(agentId!);
    if (!agent) {
      throw new Error(`Agent '${agentId}' not found`);
    }

    // Check availability
    const available = await agent.isAvailable();
    if (!available) {
      if (fallbackAgentId) {
        logger.debug(
          `[Orchestrator] Agent '${agentId}' unavailable, using fallback '${fallbackAgentId}'`
        );
        return this.executeAgent<T>(fallbackAgentId, capability!, input, context);
      }
      throw new Error(`Agent '${agentId}' is not available`);
    }

    // Execute
    return this.executeAgent<T>(agentId!, capability!, input, context);
  }

  /**
   * Execute a specific agent capability
   */
  private async executeAgent<T>(
    agentId: string,
    capability: string,
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<T>> {
    const agent = getRegistry().getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent '${agentId}' not found`);
    }

    // Emit start event
    if (this.config.enableEvents) {
      await getEventBus().emitAgentStarted(agentId, capability, context.requestId);
    }

    try {
      const result = await agent.execute<T>(capability, input, context);

      // Emit completion or failure event
      if (this.config.enableEvents) {
        if (result.success) {
          await getEventBus().emitAgentCompleted(
            agentId,
            capability,
            context.requestId,
            result.data
          );
        } else {
          await getEventBus().emitAgentFailed(
            agentId,
            capability,
            context.requestId,
            result.error
          );
        }

        // Emit needs review event if applicable
        if (result.needsHumanReview) {
          await getEventBus().emitNeedsReview(
            agentId,
            context.requestId,
            "Agent flagged for review",
            result.data
          );
        }
      }

      return result;
    } catch (error) {
      // Emit failure event
      if (this.config.enableEvents) {
        await getEventBus().emitAgentFailed(
          agentId,
          capability,
          context.requestId,
          error
        );
      }
      throw error;
    }
  }

  /**
   * Execute an action (used by workflow engine)
   */
  private async executeAction(
    action: string,
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult> {
    const route = getRouter().route(action, input, context);

    if (!route.found) {
      return {
        success: false,
        error: {
          code: "NO_ROUTE",
          message: `No route found for action '${action}'`,
          retryable: false,
        },
        needsHumanReview: false,
        metadata: {
          agentId: "orchestrator",
          capability: action,
          requestId: context.requestId,
          duration: 0,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }

    return this.executeRoute(route, context);
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow<T>(
    workflowId: string,
    input: unknown,
    context: AgentContext,
    options?: WorkflowOptions
  ): Promise<OrchestratorResponse<T>> {
    return this.workflowEngine.execute<T>(workflowId, input, context, options);
  }

  // ============================================================================
  // CIRCUIT BREAKER
  // ============================================================================

  /**
   * Check if circuit is open for an agent
   */
  private isCircuitOpen(agentId: string): boolean {
    const state = this.circuitBreakers.get(agentId);
    if (!state || !state.isOpen) return false;

    // Check if we should try half-open
    const now = Date.now();
    if (
      state.openedAt &&
      now - state.openedAt.getTime() > this.config.circuitBreakerTimeout
    ) {
      state.halfOpenAt = new Date();
      logger.debug(`[Orchestrator] Circuit half-open for '${agentId}'`);
      return false; // Allow one request through
    }

    return true;
  }

  /**
   * Record a failure for circuit breaker
   */
  private recordFailure(agentId: string): void {
    let state = this.circuitBreakers.get(agentId);

    if (!state) {
      state = {
        agentId,
        isOpen: false,
        failures: 0,
      };
      this.circuitBreakers.set(agentId, state);
    }

    state.failures++;
    state.lastFailure = new Date();

    if (state.failures >= this.config.circuitBreakerThreshold) {
      state.isOpen = true;
      state.openedAt = new Date();
      logger.debug(
        `[Orchestrator] Circuit OPEN for '${agentId}' after ${state.failures} failures`
      );

      // Emit alert
      if (this.config.enableEvents) {
        getEventBus().emitAlert(
          "orchestrator",
          "circuit_open",
          `Circuit breaker opened for agent '${agentId}'`,
          { agentId, failures: state.failures }
        );
      }
    }
  }

  /**
   * Record a success for circuit breaker
   */
  private recordSuccess(agentId: string): void {
    const state = this.circuitBreakers.get(agentId);
    if (!state) return;

    // If half-open and successful, close the circuit
    if (state.halfOpenAt) {
      state.isOpen = false;
      state.failures = 0;
      state.halfOpenAt = undefined;
      state.openedAt = undefined;
      logger.debug(`[Orchestrator] Circuit CLOSED for '${agentId}'`);
    }
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(): Map<string, CircuitBreakerState> {
    return new Map(this.circuitBreakers);
  }

  /**
   * Reset circuit breaker for an agent
   */
  resetCircuitBreaker(agentId: string): void {
    this.circuitBreakers.delete(agentId);
    logger.debug(`[Orchestrator] Circuit breaker reset for '${agentId}'`);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Create empty metadata object
   */
  private createEmptyMetadata(startTime: number): OrchestratorMetadata {
    return {
      totalDuration: Date.now() - startTime,
      agentsInvoked: 0,
      totalTokensUsed: 0,
      executionPath: [],
      usedFallbacks: false,
    };
  }

  /**
   * Get orchestrator configuration
   */
  getConfig(): OrchestratorConfig {
    return { ...this.config };
  }

  /**
   * Update orchestrator configuration
   */
  updateConfig(config: Partial<OrchestratorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get workflow engine
   */
  getWorkflowEngine(): WorkflowEngine {
    return this.workflowEngine;
  }

  /**
   * Shutdown the orchestrator
   */
  async shutdown(): Promise<void> {
    logger.debug("[Orchestrator] Shutting down...");
    await getRemediationEngine().shutdown();
    await getRegistry().shutdownAll();
    this.isInitialized = false;
    logger.debug("[Orchestrator] Shutdown complete");
  }

  /**
   * Get the remediation engine
   */
  getRemediationEngine() {
    return getRemediationEngine();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Get the global orchestrator instance
 */
export function getOrchestrator(
  config?: Partial<OrchestratorConfig>
): AgentOrchestrator {
  return AgentOrchestrator.getInstance(config);
}

/**
 * Execute a request through the orchestrator
 */
export async function orchestrate<T = unknown>(
  request: OrchestratorRequest
): Promise<OrchestratorResponse<T>> {
  return getOrchestrator().execute<T>(request);
}

/**
 * Execute an action directly
 */
export async function executeAction<T = unknown>(
  action: string,
  input: unknown,
  context?: Partial<AgentContext>
): Promise<OrchestratorResponse<T>> {
  return orchestrate<T>({
    action,
    input,
    context: context || { invocationType: InvocationTypes.ON_DEMAND },
  });
}

/**
 * Execute a workflow
 */
export async function executeWorkflow<T = unknown>(
  workflowId: string,
  input: unknown,
  context?: Partial<AgentContext>,
  options?: WorkflowOptions
): Promise<OrchestratorResponse<T>> {
  const fullContext = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.ON_DEMAND,
    ...context,
  });

  return getOrchestrator().executeWorkflow<T>(
    workflowId,
    input,
    fullContext,
    options
  );
}

export { AgentOrchestrator };
export default AgentOrchestrator;
