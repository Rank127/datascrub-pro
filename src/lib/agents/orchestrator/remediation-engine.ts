/**
 * DataScrub Pro Agent Architecture - Remediation Engine
 *
 * Handles automatic issue detection and remediation across all agents.
 * Provides graceful fallback when auto-remediation isn't possible.
 */

import { nanoid } from "nanoid";
import { getEventBus, subscribe } from "./event-bus";
import { getRegistry } from "../registry";
import { createAgentContext } from "../base-agent";
import {
  AgentContext,
  AgentEvent,
  AgentResult,
  InvocationTypes,
  Priority,
  PriorityLevel,
  SuggestedAction,
} from "../types";
import {
  createAgentTicket,
  getMethodologyForIssue,
} from "@/lib/support/ticket-service";

// ============================================================================
// TYPES
// ============================================================================

export type IssueSeverity = "critical" | "high" | "medium" | "low" | "info";

export interface DetectedIssue {
  /** Unique issue ID */
  id: string;
  /** Issue type/category */
  type: string;
  /** Severity level */
  severity: IssueSeverity;
  /** Human-readable description */
  description: string;
  /** Agent that detected this issue */
  sourceAgentId: string;
  /** Affected resource (URL, file, etc) */
  affectedResource?: string;
  /** Technical details */
  details?: Record<string, unknown>;
  /** Suggested remediation actions */
  suggestedActions?: RemediationAction[];
  /** Whether this can be auto-remediated */
  canAutoRemediate: boolean;
  /** Detection timestamp */
  detectedAt: Date;
}

export interface RemediationAction {
  /** Action ID */
  id: string;
  /** Action type */
  type: RemediationActionType;
  /** Target agent to perform the action */
  targetAgentId: string;
  /** Capability to invoke */
  capability: string;
  /** Input for the action */
  input: Record<string, unknown>;
  /** Priority */
  priority: PriorityLevel;
  /** Whether to auto-execute */
  autoExecute: boolean;
  /** Description of what this action does */
  description: string;
  /** Dependencies - other action IDs that must complete first */
  dependsOn?: string[];
}

export type RemediationActionType =
  | "fix" // Direct fix
  | "generate" // Generate content/code
  | "update" // Update existing content
  | "delete" // Remove problematic content
  | "notify" // Notify human
  | "escalate" // Escalate to another agent/human
  | "verify"; // Verify a fix was applied

export interface RemediationPlan {
  /** Plan ID */
  id: string;
  /** Issue being remediated */
  issue: DetectedIssue;
  /** Ordered list of actions to take */
  actions: RemediationAction[];
  /** Current status */
  status: RemediationStatus;
  /** Results from executed actions */
  actionResults: Map<string, AgentResult>;
  /** Created timestamp */
  createdAt: Date;
  /** Started timestamp */
  startedAt?: Date;
  /** Completed timestamp */
  completedAt?: Date;
  /** Error if failed */
  error?: string;
}

export type RemediationStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | "needs_human_review"
  | "partially_completed";

export interface RemediationRule {
  /** Rule ID */
  id: string;
  /** Issue type pattern to match */
  issueTypePattern: string | RegExp;
  /** Severity levels to handle */
  severityLevels: IssueSeverity[];
  /** Whether to auto-remediate */
  autoRemediate: boolean;
  /** Max attempts before escalating */
  maxAttempts: number;
  /** Action generator function */
  generateActions: (issue: DetectedIssue) => RemediationAction[];
  /** Whether this rule is enabled */
  enabled: boolean;
}

export interface RemediationStats {
  totalIssuesDetected: number;
  totalAutoRemediated: number;
  totalEscalated: number;
  totalFailed: number;
  pendingRemediation: number;
  averageRemediationTime: number;
  issuesByType: Record<string, number>;
  issuesBySeverity: Record<IssueSeverity, number>;
}

// ============================================================================
// REMEDIATION RULES
// ============================================================================

const DEFAULT_REMEDIATION_RULES: RemediationRule[] = [
  // SEO - Missing Meta Tags
  {
    id: "seo-missing-meta",
    issueTypePattern: /^seo\.(missing_title|missing_description|missing_og_tags)$/,
    severityLevels: ["critical", "high", "medium"],
    autoRemediate: true,
    maxAttempts: 2,
    enabled: true,
    generateActions: (issue) => [
      {
        id: nanoid(),
        type: "generate",
        targetAgentId: "content-agent",
        capability: "generate-meta",
        input: {
          url: issue.affectedResource,
          issueType: issue.type,
          currentContent: issue.details?.currentContent,
        },
        priority: Priority.HIGH,
        autoExecute: true,
        description: `Generate missing meta content for ${issue.affectedResource}`,
      },
      {
        id: nanoid(),
        type: "verify",
        targetAgentId: "seo-agent",
        capability: "technical-audit",
        input: {
          pages: [issue.affectedResource],
        },
        priority: Priority.NORMAL,
        autoExecute: true,
        description: "Verify meta tags were applied correctly",
        dependsOn: [], // Will be set dynamically
      },
    ],
  },

  // SEO - Content Quality Issues
  {
    id: "seo-content-quality",
    issueTypePattern: /^seo\.(thin_content|low_readability|keyword_stuffing)$/,
    severityLevels: ["high", "medium"],
    autoRemediate: true,
    maxAttempts: 2,
    enabled: true,
    generateActions: (issue) => [
      {
        id: nanoid(),
        type: "generate",
        targetAgentId: "content-agent",
        capability: "optimize-content",
        input: {
          url: issue.affectedResource,
          issueType: issue.type,
          currentContent: issue.details?.content,
          targetKeywords: issue.details?.targetKeywords,
        },
        priority: Priority.NORMAL,
        autoExecute: true,
        description: `Optimize content for ${issue.affectedResource}`,
      },
    ],
  },

  // SEO - Technical Issues (sitemap, robots.txt)
  {
    id: "seo-technical",
    issueTypePattern: /^seo\.(missing_sitemap|invalid_robots|broken_links)$/,
    severityLevels: ["critical", "high"],
    autoRemediate: true, // Will create ticket with methodology
    maxAttempts: 1,
    enabled: true,
    generateActions: (issue) => [
      {
        id: nanoid(),
        type: "escalate",
        targetAgentId: "ticket-creator",
        capability: "create-ticket",
        input: {
          issueType: issue.type,
          severity: issue.severity,
          title: `Technical SEO Issue: ${issue.type.replace("seo.", "").replace(/_/g, " ")}`,
          description: issue.description,
          affectedResource: issue.affectedResource,
          recommendation: issue.details?.recommendation,
        },
        priority: Priority.HIGH,
        autoExecute: true,
        description: `Create ticket with fix methodology for: ${issue.type}`,
      },
    ],
  },

  // SEO - Missing Blog Content
  {
    id: "seo-missing-content",
    issueTypePattern: /^seo\.content_gap$/,
    severityLevels: ["medium", "low"],
    autoRemediate: true,
    maxAttempts: 1,
    enabled: true,
    generateActions: (issue) => [
      {
        id: nanoid(),
        type: "generate",
        targetAgentId: "content-agent",
        capability: "generate-blog-post",
        input: {
          topic: issue.details?.suggestedTopic,
          keywords: issue.details?.targetKeywords,
          priority: issue.severity,
        },
        priority: Priority.LOW,
        autoExecute: false, // Draft for review
        description: `Generate blog post draft: ${issue.details?.suggestedTopic}`,
      },
    ],
  },

  // Security Issues - Create ticket with investigation methodology
  {
    id: "security-vulnerability",
    issueTypePattern: /^security\./,
    severityLevels: ["critical", "high", "medium", "low"],
    autoRemediate: true, // Will create ticket with methodology
    maxAttempts: 1,
    enabled: true,
    generateActions: (issue) => [
      {
        id: nanoid(),
        type: "escalate",
        targetAgentId: "ticket-creator",
        capability: "create-ticket",
        input: {
          issueType: issue.type,
          severity: issue.severity,
          title: `🔒 Security Issue: ${issue.type.replace("security.", "").replace(/_/g, " ")}`,
          description: issue.description,
          affectedResource: issue.affectedResource,
          recommendation: issue.details?.recommendation,
        },
        priority: Priority.CRITICAL,
        autoExecute: true,
        description: `Create URGENT ticket for security issue: ${issue.type}`,
      },
    ],
  },

  // Compliance Issues - Create ticket with compliance methodology
  {
    id: "compliance-violation",
    issueTypePattern: /^compliance\./,
    severityLevels: ["critical", "high"],
    autoRemediate: true, // Will create ticket with methodology
    maxAttempts: 1,
    enabled: true,
    generateActions: (issue) => [
      {
        id: nanoid(),
        type: "escalate",
        targetAgentId: "ticket-creator",
        capability: "create-ticket",
        input: {
          issueType: issue.type,
          severity: issue.severity,
          title: `⚖️ Compliance Issue: ${issue.type.replace("compliance.", "").replace(/_/g, " ")}`,
          description: issue.description,
          affectedResource: issue.affectedResource,
          recommendation: issue.details?.recommendation,
        },
        priority: Priority.CRITICAL,
        autoExecute: true,
        description: `Create URGENT ticket for compliance issue: ${issue.type}`,
      },
    ],
  },

  // Performance Issues - Create ticket with performance methodology
  {
    id: "performance-degradation",
    issueTypePattern: /^performance\./,
    severityLevels: ["critical", "high"],
    autoRemediate: true, // Will create ticket with methodology
    maxAttempts: 1,
    enabled: true,
    generateActions: (issue) => [
      {
        id: nanoid(),
        type: "escalate",
        targetAgentId: "ticket-creator",
        capability: "create-ticket",
        input: {
          issueType: issue.type,
          severity: issue.severity,
          title: `⚡ Performance Issue: ${issue.type.replace("performance.", "").replace(/_/g, " ")}`,
          description: issue.description,
          affectedResource: issue.affectedResource,
          metrics: issue.details?.metrics,
        },
        priority: Priority.HIGH,
        autoExecute: true,
        description: `Create ticket for performance issue`,
      },
    ],
  },
];

// ============================================================================
// REMEDIATION ENGINE CLASS
// ============================================================================

class RemediationEngine {
  private static instance: RemediationEngine;
  private rules: Map<string, RemediationRule> = new Map();
  private activePlans: Map<string, RemediationPlan> = new Map();
  private completedPlans: RemediationPlan[] = [];
  private issueHistory: DetectedIssue[] = [];
  private subscriptionIds: string[] = [];
  private maxHistorySize = 500;
  private isInitialized = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): RemediationEngine {
    if (!RemediationEngine.instance) {
      RemediationEngine.instance = new RemediationEngine();
    }
    return RemediationEngine.instance;
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize the remediation engine
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log("[RemediationEngine] Initializing...");

    // Load default rules
    for (const rule of DEFAULT_REMEDIATION_RULES) {
      this.rules.set(rule.id, rule);
    }

    // Subscribe to relevant events
    this.subscribeToEvents();

    this.isInitialized = true;
    console.log(
      `[RemediationEngine] Initialized with ${this.rules.size} remediation rules`
    );
  }

  /**
   * Subscribe to events that may contain issues
   */
  private subscribeToEvents(): void {
    const eventBus = getEventBus();

    // Listen for agent completed events (may contain detected issues)
    const completedSubId = eventBus.subscribe(
      "agent.completed",
      async (event) => {
        await this.handleAgentCompleted(event);
      }
    );
    this.subscriptionIds.push(completedSubId);

    // Listen for custom issue events
    const customSubId = eventBus.subscribe("custom", async (event) => {
      const payload = event.payload as { eventName?: string };
      if (payload.eventName === "issue.detected") {
        await this.handleIssueDetected(event);
      }
    });
    this.subscriptionIds.push(customSubId);

    // Listen for alert events that may need remediation
    const alertSubId = eventBus.subscribe("alert.triggered", async (event) => {
      await this.handleAlert(event);
    });
    this.subscriptionIds.push(alertSubId);

    console.log("[RemediationEngine] Subscribed to events");
  }

  /**
   * Shutdown the engine
   */
  async shutdown(): Promise<void> {
    const eventBus = getEventBus();
    for (const subId of this.subscriptionIds) {
      eventBus.unsubscribe(subId);
    }
    this.subscriptionIds = [];
    this.isInitialized = false;
    console.log("[RemediationEngine] Shutdown complete");
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle agent completed events
   */
  private async handleAgentCompleted(event: AgentEvent): Promise<void> {
    const payload = event.payload as {
      capability?: string;
      result?: {
        data?: {
          issues?: DetectedIssue[];
          criticalIssues?: Array<{ type: string; description: string; url?: string }>;
          warnings?: Array<{ type: string; description: string; url?: string }>;
        };
      };
    };

    // Check if result contains issues
    const result = payload.result?.data;
    if (!result) return;

    // Handle explicit issues array
    if (result.issues && Array.isArray(result.issues)) {
      for (const issue of result.issues) {
        await this.processIssue({
          ...issue,
          sourceAgentId: event.sourceAgentId,
          detectedAt: new Date(),
        });
      }
    }

    // Handle SEO-style critical issues
    if (result.criticalIssues && Array.isArray(result.criticalIssues)) {
      for (const issue of result.criticalIssues) {
        await this.processIssue({
          id: nanoid(),
          type: `seo.${issue.type.toLowerCase().replace(/\s+/g, "_")}`,
          severity: "critical",
          description: issue.description,
          sourceAgentId: event.sourceAgentId,
          affectedResource: issue.url,
          canAutoRemediate: this.canAutoRemediate(`seo.${issue.type.toLowerCase()}`),
          detectedAt: new Date(),
        });
      }
    }

    // Handle warnings as medium-severity issues
    if (result.warnings && Array.isArray(result.warnings)) {
      for (const warning of result.warnings) {
        await this.processIssue({
          id: nanoid(),
          type: `seo.${warning.type.toLowerCase().replace(/\s+/g, "_")}`,
          severity: "medium",
          description: warning.description,
          sourceAgentId: event.sourceAgentId,
          affectedResource: warning.url,
          canAutoRemediate: this.canAutoRemediate(`seo.${warning.type.toLowerCase()}`),
          detectedAt: new Date(),
        });
      }
    }
  }

  /**
   * Handle explicit issue detected events
   */
  private async handleIssueDetected(event: AgentEvent): Promise<void> {
    const payload = event.payload as { issue?: DetectedIssue };
    if (payload.issue) {
      await this.processIssue({
        ...payload.issue,
        sourceAgentId: event.sourceAgentId,
        detectedAt: new Date(),
      });
    }
  }

  /**
   * Handle alert events
   */
  private async handleAlert(event: AgentEvent): Promise<void> {
    const payload = event.payload as {
      alertType?: string;
      message?: string;
      data?: unknown;
    };

    // Convert certain alerts to issues for remediation
    if (payload.alertType?.startsWith("seo_") ||
        payload.alertType?.startsWith("security_") ||
        payload.alertType?.startsWith("compliance_")) {
      await this.processIssue({
        id: nanoid(),
        type: payload.alertType,
        severity: "high",
        description: payload.message || "Alert triggered",
        sourceAgentId: event.sourceAgentId,
        details: payload.data as Record<string, unknown>,
        canAutoRemediate: false,
        detectedAt: new Date(),
      });
    }
  }

  // ============================================================================
  // ISSUE PROCESSING
  // ============================================================================

  /**
   * Process a detected issue
   */
  async processIssue(issue: DetectedIssue): Promise<RemediationPlan | null> {
    console.log(
      `[RemediationEngine] Processing issue: ${issue.type} (severity: ${issue.severity})`
    );

    // Add to history
    this.issueHistory.push(issue);
    if (this.issueHistory.length > this.maxHistorySize) {
      this.issueHistory.shift();
    }

    // Find matching rule
    const rule = this.findMatchingRule(issue);
    if (!rule) {
      console.log(
        `[RemediationEngine] No remediation rule found for issue type: ${issue.type}`
      );
      return null;
    }

    if (!rule.enabled) {
      console.log(`[RemediationEngine] Rule ${rule.id} is disabled`);
      return null;
    }

    // Generate remediation plan
    const plan = this.createRemediationPlan(issue, rule);
    this.activePlans.set(plan.id, plan);

    console.log(
      `[RemediationEngine] Created remediation plan ${plan.id} with ${plan.actions.length} actions`
    );

    // Execute if auto-remediation is enabled
    if (rule.autoRemediate && issue.canAutoRemediate) {
      await this.executePlan(plan);
    } else {
      // Emit event for manual review
      await getEventBus().emitCustom(
        "remediation-engine",
        "remediation.needs_review",
        { plan, issue }
      );
    }

    return plan;
  }

  /**
   * Find a matching remediation rule for an issue
   */
  private findMatchingRule(issue: DetectedIssue): RemediationRule | null {
    for (const rule of this.rules.values()) {
      // Check issue type pattern
      const pattern = rule.issueTypePattern;
      const matches =
        typeof pattern === "string"
          ? issue.type === pattern
          : pattern.test(issue.type);

      if (matches && rule.severityLevels.includes(issue.severity)) {
        return rule;
      }
    }
    return null;
  }

  /**
   * Check if an issue type can be auto-remediated
   */
  private canAutoRemediate(issueType: string): boolean {
    for (const rule of this.rules.values()) {
      const pattern = rule.issueTypePattern;
      const matches =
        typeof pattern === "string"
          ? issueType === pattern || issueType.startsWith(pattern.replace(/\$$/, ""))
          : pattern.test(issueType);

      if (matches) {
        return rule.autoRemediate;
      }
    }
    return false;
  }

  /**
   * Create a remediation plan for an issue
   */
  private createRemediationPlan(
    issue: DetectedIssue,
    rule: RemediationRule
  ): RemediationPlan {
    const actions = rule.generateActions(issue);

    // Set up dependencies for verification actions
    const generateActions = actions.filter((a) => a.type !== "verify");
    const verifyActions = actions.filter((a) => a.type === "verify");

    for (const verifyAction of verifyActions) {
      verifyAction.dependsOn = generateActions.map((a) => a.id);
    }

    return {
      id: nanoid(),
      issue,
      actions,
      status: "pending",
      actionResults: new Map(),
      createdAt: new Date(),
    };
  }

  // ============================================================================
  // PLAN EXECUTION
  // ============================================================================

  /**
   * Execute a remediation plan
   */
  async executePlan(plan: RemediationPlan): Promise<void> {
    console.log(`[RemediationEngine] Executing plan ${plan.id}`);

    plan.status = "in_progress";
    plan.startedAt = new Date();

    // Emit plan started event
    await getEventBus().emitCustom("remediation-engine", "remediation.started", {
      planId: plan.id,
      issueType: plan.issue.type,
    });

    try {
      // Execute actions in dependency order
      const completedActions = new Set<string>();
      let hasFailure = false;

      while (completedActions.size < plan.actions.length && !hasFailure) {
        // Find actions ready to execute
        const readyActions = plan.actions.filter((action) => {
          if (completedActions.has(action.id)) return false;
          if (!action.autoExecute) return false;

          // Check dependencies
          if (action.dependsOn) {
            for (const depId of action.dependsOn) {
              if (!completedActions.has(depId)) return false;
              // Check if dependency succeeded
              const depResult = plan.actionResults.get(depId);
              if (!depResult?.success) return false;
            }
          }

          return true;
        });

        if (readyActions.length === 0) {
          // No more actions can be executed
          break;
        }

        // Execute ready actions (could be parallelized)
        for (const action of readyActions) {
          const result = await this.executeAction(action, plan);
          plan.actionResults.set(action.id, result);
          completedActions.add(action.id);

          if (!result.success) {
            hasFailure = true;
            console.log(
              `[RemediationEngine] Action ${action.id} failed: ${result.error?.message}`
            );
          }
        }
      }

      // Determine final status
      const allAutoExecuteActions = plan.actions.filter((a) => a.autoExecute);
      const successCount = [...plan.actionResults.values()].filter(
        (r) => r.success
      ).length;

      if (successCount === allAutoExecuteActions.length) {
        plan.status = "completed";
      } else if (successCount > 0) {
        plan.status = "partially_completed";
      } else {
        plan.status = "failed";
      }

      plan.completedAt = new Date();

      // Move to completed plans
      this.activePlans.delete(plan.id);
      this.completedPlans.push(plan);
      if (this.completedPlans.length > this.maxHistorySize) {
        this.completedPlans.shift();
      }

      // Emit completion event
      await getEventBus().emitCustom(
        "remediation-engine",
        "remediation.completed",
        {
          planId: plan.id,
          status: plan.status,
          successCount,
          totalActions: plan.actions.length,
        }
      );

      console.log(
        `[RemediationEngine] Plan ${plan.id} completed with status: ${plan.status}`
      );
    } catch (error) {
      plan.status = "failed";
      plan.error = error instanceof Error ? error.message : "Unknown error";
      plan.completedAt = new Date();

      // Emit failure event
      await getEventBus().emitCustom(
        "remediation-engine",
        "remediation.failed",
        {
          planId: plan.id,
          error: plan.error,
        }
      );

      console.error(
        `[RemediationEngine] Plan ${plan.id} failed:`,
        error
      );
    }
  }

  /**
   * Execute a single remediation action
   */
  private async executeAction(
    action: RemediationAction,
    plan: RemediationPlan
  ): Promise<AgentResult> {
    console.log(
      `[RemediationEngine] Executing action ${action.id}: ${action.description}`
    );

    // Special handler for ticket creation
    if (action.targetAgentId === "ticket-creator") {
      return this.createTicketAction(action, plan);
    }

    const registry = getRegistry();
    const agent = registry.getAgent(action.targetAgentId);

    if (!agent) {
      return {
        success: false,
        error: {
          code: "AGENT_NOT_FOUND",
          message: `Agent ${action.targetAgentId} not found`,
          retryable: false,
        },
        needsHumanReview: true,
        metadata: {
          agentId: action.targetAgentId,
          capability: action.capability,
          requestId: nanoid(),
          duration: 0,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }

    const context: AgentContext = createAgentContext({
      requestId: nanoid(),
      invocationType: InvocationTypes.EVENT,
      priority: action.priority,
      parentRequestId: plan.id,
      metadata: {
        remediationPlanId: plan.id,
        issueId: plan.issue.id,
        issueType: plan.issue.type,
      },
    });

    try {
      const result = await agent.execute(action.capability, action.input, context);
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: "EXECUTION_ERROR",
          message: error instanceof Error ? error.message : "Action execution failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: action.targetAgentId,
          capability: action.capability,
          requestId: context.requestId,
          duration: 0,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  /**
   * Create a support ticket with methodology-based fix plan
   */
  private async createTicketAction(
    action: RemediationAction,
    plan: RemediationPlan
  ): Promise<AgentResult> {
    const startTime = Date.now();
    const input = action.input as {
      issueType: string;
      severity: string;
      title: string;
      description: string;
      affectedResource?: string;
      recommendation?: string;
    };

    try {
      // Get methodology for this issue type
      const methodologyData = getMethodologyForIssue(
        input.issueType,
        input.affectedResource
      );

      if (!methodologyData) {
        // Create a generic methodology
        const genericMethodology = {
          methodology: {
            summary: `Investigate and resolve: ${input.title}`,
            estimatedEffort: "medium" as const,
            requiredSkills: ["Technical expertise"],
            steps: [
              {
                order: 1,
                title: "Investigate the issue",
                description: input.description,
                action: "investigate" as const,
                expectedOutcome: "Root cause identified",
              },
              {
                order: 2,
                title: "Implement fix",
                description: input.recommendation || "Apply appropriate fix based on investigation",
                action: "implement" as const,
                expectedOutcome: "Issue resolved",
              },
              {
                order: 3,
                title: "Verify resolution",
                description: "Confirm the issue is fully resolved",
                action: "verify" as const,
                expectedOutcome: "Issue confirmed resolved",
              },
            ],
          },
          documentation: [] as Array<{ title: string; url: string; type: "official" | "guide" | "reference" | "example" }>,
        };

        const ticket = await createAgentTicket({
          agentId: plan.issue.sourceAgentId,
          issueType: input.issueType,
          severity: input.severity as "critical" | "high" | "medium" | "low",
          title: input.title,
          description: input.description,
          affectedResource: input.affectedResource,
          methodology: genericMethodology.methodology,
          documentation: genericMethodology.documentation,
        });

        return {
          success: true,
          data: {
            ticketId: ticket.id,
            ticketNumber: ticket.ticketNumber,
            message: `Ticket created: ${ticket.ticketNumber}`,
          },
          needsHumanReview: false,
          metadata: {
            agentId: "ticket-creator",
            capability: "create-ticket",
            requestId: nanoid(),
            duration: Date.now() - startTime,
            usedFallback: false,
            executedAt: new Date(),
          },
        };
      }

      // Create ticket with methodology
      const ticket = await createAgentTicket({
        agentId: plan.issue.sourceAgentId,
        issueType: input.issueType,
        severity: input.severity as "critical" | "high" | "medium" | "low",
        title: input.title,
        description: input.description,
        affectedResource: input.affectedResource,
        methodology: methodologyData.methodology,
        documentation: methodologyData.documentation,
      });

      console.log(
        `[RemediationEngine] Created ticket ${ticket.ticketNumber} for ${input.issueType}`
      );

      // Emit event for ticket creation
      await getEventBus().emitCustom(
        "remediation-engine",
        "ticket.created",
        {
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          issueType: input.issueType,
          severity: input.severity,
        }
      );

      return {
        success: true,
        data: {
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          message: `Ticket created with methodology: ${ticket.ticketNumber}`,
        },
        needsHumanReview: false,
        metadata: {
          agentId: "ticket-creator",
          capability: "create-ticket",
          requestId: nanoid(),
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    } catch (error) {
      console.error("[RemediationEngine] Failed to create ticket:", error);

      return {
        success: false,
        error: {
          code: "TICKET_CREATION_FAILED",
          message: error instanceof Error ? error.message : "Failed to create ticket",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: "ticket-creator",
          capability: "create-ticket",
          requestId: nanoid(),
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  // ============================================================================
  // MANUAL CONTROLS
  // ============================================================================

  /**
   * Manually trigger remediation for an issue
   */
  async triggerRemediation(issue: DetectedIssue): Promise<RemediationPlan | null> {
    return this.processIssue(issue);
  }

  /**
   * Approve and execute a pending plan
   */
  async approvePlan(planId: string): Promise<void> {
    const plan = this.activePlans.get(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    if (plan.status !== "pending" && plan.status !== "needs_human_review") {
      throw new Error(`Plan ${planId} is not pending approval`);
    }

    // Enable auto-execute on all actions
    for (const action of plan.actions) {
      action.autoExecute = true;
    }

    await this.executePlan(plan);
  }

  /**
   * Reject a pending plan
   */
  rejectPlan(planId: string, reason?: string): void {
    const plan = this.activePlans.get(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    plan.status = "failed";
    plan.error = reason || "Plan rejected by user";
    plan.completedAt = new Date();

    this.activePlans.delete(planId);
    this.completedPlans.push(plan);

    console.log(`[RemediationEngine] Plan ${planId} rejected: ${reason}`);
  }

  // ============================================================================
  // RULE MANAGEMENT
  // ============================================================================

  /**
   * Add or update a remediation rule
   */
  addRule(rule: RemediationRule): void {
    this.rules.set(rule.id, rule);
    console.log(`[RemediationEngine] Added/updated rule: ${rule.id}`);
  }

  /**
   * Remove a remediation rule
   */
  removeRule(ruleId: string): boolean {
    const result = this.rules.delete(ruleId);
    if (result) {
      console.log(`[RemediationEngine] Removed rule: ${ruleId}`);
    }
    return result;
  }

  /**
   * Enable/disable a rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
      console.log(
        `[RemediationEngine] Rule ${ruleId} ${enabled ? "enabled" : "disabled"}`
      );
    }
  }

  /**
   * Get all rules
   */
  getRules(): RemediationRule[] {
    return Array.from(this.rules.values());
  }

  // ============================================================================
  // QUERIES
  // ============================================================================

  /**
   * Get active plans
   */
  getActivePlans(): RemediationPlan[] {
    return Array.from(this.activePlans.values());
  }

  /**
   * Get a specific plan
   */
  getPlan(planId: string): RemediationPlan | null {
    return (
      this.activePlans.get(planId) ||
      this.completedPlans.find((p) => p.id === planId) ||
      null
    );
  }

  /**
   * Get completed plans
   */
  getCompletedPlans(limit = 50): RemediationPlan[] {
    return this.completedPlans.slice(-limit);
  }

  /**
   * Get issue history
   */
  getIssueHistory(limit = 100): DetectedIssue[] {
    return this.issueHistory.slice(-limit);
  }

  /**
   * Get statistics
   */
  getStats(): RemediationStats {
    const issuesByType: Record<string, number> = {};
    const issuesBySeverity: Record<IssueSeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    for (const issue of this.issueHistory) {
      issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
      issuesBySeverity[issue.severity]++;
    }

    const completedWithSuccess = this.completedPlans.filter(
      (p) => p.status === "completed"
    );
    const remediationTimes = completedWithSuccess
      .filter((p) => p.startedAt && p.completedAt)
      .map((p) => p.completedAt!.getTime() - p.startedAt!.getTime());

    return {
      totalIssuesDetected: this.issueHistory.length,
      totalAutoRemediated: completedWithSuccess.length,
      totalEscalated: this.completedPlans.filter(
        (p) => p.status === "needs_human_review"
      ).length,
      totalFailed: this.completedPlans.filter((p) => p.status === "failed")
        .length,
      pendingRemediation: this.activePlans.size,
      averageRemediationTime:
        remediationTimes.length > 0
          ? remediationTimes.reduce((a, b) => a + b, 0) / remediationTimes.length
          : 0,
      issuesByType,
      issuesBySeverity,
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Get the global remediation engine instance
 */
export function getRemediationEngine(): RemediationEngine {
  return RemediationEngine.getInstance();
}

/**
 * Report an issue for potential remediation
 */
export async function reportIssue(
  issue: Omit<DetectedIssue, "id" | "detectedAt">
): Promise<RemediationPlan | null> {
  const engine = getRemediationEngine();
  return engine.processIssue({
    ...issue,
    id: nanoid(),
    detectedAt: new Date(),
  });
}

/**
 * Helper to emit an issue detection event
 */
export async function emitIssue(
  sourceAgentId: string,
  issue: Omit<DetectedIssue, "id" | "sourceAgentId" | "detectedAt">
): Promise<void> {
  const eventBus = getEventBus();
  await eventBus.emitCustom(sourceAgentId, "issue.detected", {
    issue: {
      ...issue,
      id: nanoid(),
      sourceAgentId,
      detectedAt: new Date(),
    },
  });
}

export default RemediationEngine;
