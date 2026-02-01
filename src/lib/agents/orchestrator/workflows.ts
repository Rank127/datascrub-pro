/**
 * DataScrub Pro Agent Architecture - Workflows
 *
 * Multi-agent workflow definitions and execution.
 * Allows chaining multiple agents together for complex operations.
 */

import { nanoid } from "nanoid";
import {
  AgentContext,
  AgentResult,
  OrchestratorMetadata,
  OrchestratorResponse,
  WorkflowOptions,
} from "../types";

// ============================================================================
// TYPES
// ============================================================================

export interface WorkflowStep {
  /** Step identifier */
  id: string;
  /** Step name */
  name: string;
  /** Agent action to execute (agent.capability format) */
  action: string;
  /** Input for this step (can reference previous step outputs) */
  input: unknown | ((previousResults: Map<string, AgentResult>) => unknown);
  /** Whether this step is required (if false, failure won't stop workflow) */
  required?: boolean;
  /** Condition to check before executing */
  condition?: (previousResults: Map<string, AgentResult>) => boolean;
  /** Transform the result before passing to next step */
  transformResult?: (result: AgentResult) => AgentResult;
  /** Retry configuration */
  retries?: number;
  /** Timeout in milliseconds */
  timeout?: number;
}

export interface Workflow {
  /** Workflow identifier */
  id: string;
  /** Workflow name */
  name: string;
  /** Description */
  description: string;
  /** Workflow steps */
  steps: WorkflowStep[];
  /** Default options */
  options?: WorkflowOptions;
  /** Whether this workflow is enabled */
  enabled: boolean;
  /** Version string */
  version: string;
}

export interface WorkflowExecutionState {
  /** Execution ID */
  id: string;
  /** Workflow being executed */
  workflowId: string;
  /** Current step index */
  currentStep: number;
  /** Results from each step */
  stepResults: Map<string, AgentResult>;
  /** Start time */
  startedAt: Date;
  /** Status */
  status: "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  /** Error if failed */
  error?: string;
}

// ============================================================================
// PREDEFINED WORKFLOWS
// ============================================================================

export const PREDEFINED_WORKFLOWS: Workflow[] = [
  // =========================================================================
  // FULL REMOVAL PIPELINE
  // =========================================================================
  {
    id: "full-removal-pipeline",
    name: "Full Removal Pipeline",
    description:
      "Complete removal workflow: strategy selection -> execution -> verification",
    enabled: true,
    version: "1.0.0",
    steps: [
      {
        id: "select-strategy",
        name: "Select Removal Strategy",
        action: "removal.strategy",
        input: (prev: Map<string, AgentResult>) => prev.get("input")?.data || {},
        required: true,
      },
      {
        id: "execute-removal",
        name: "Execute Removal",
        action: "removal.execute",
        input: (prev: Map<string, AgentResult>) => ({
          ...((prev.get("select-strategy")?.data as object) || {}),
          exposureId: (prev.get("input")?.data as { exposureId?: string })?.exposureId,
        }),
        required: true,
        condition: (prev: Map<string, AgentResult>) => prev.get("select-strategy")?.success === true,
      },
      {
        id: "verify-removal",
        name: "Verify Removal",
        action: "removal.verify",
        input: (prev: Map<string, AgentResult>) => ({
          removalRequestId: (prev.get("execute-removal")?.data as { removalRequestId?: string })?.removalRequestId,
        }),
        required: false,
        condition: (prev: Map<string, AgentResult>) => prev.get("execute-removal")?.success === true,
      },
      {
        id: "notify-user",
        name: "Notify User",
        action: "communications.email",
        input: (prev: Map<string, AgentResult>) => ({
          type: "removal_update",
          userId: (prev.get("input")?.data as { userId?: string })?.userId,
          removalResult: prev.get("verify-removal")?.data || prev.get("execute-removal")?.data,
        }),
        required: false,
      },
    ],
  },

  // =========================================================================
  // COMPLETE SCAN PIPELINE
  // =========================================================================
  {
    id: "complete-scan-pipeline",
    name: "Complete Scan Pipeline",
    description:
      "Full scan workflow: run scan -> analyze results -> calculate risk -> generate insights",
    enabled: true,
    version: "1.0.0",
    steps: [
      {
        id: "run-scan",
        name: "Run Scan",
        action: "scanning.run",
        input: (prev: Map<string, AgentResult>) => prev.get("input")?.data || {},
        required: true,
        timeout: 300000, // 5 minutes
      },
      {
        id: "analyze-results",
        name: "Analyze Results",
        action: "scanning.analyze",
        input: (prev: Map<string, AgentResult>) => ({
          scanId: (prev.get("run-scan")?.data as { scanId?: string })?.scanId,
          exposures: (prev.get("run-scan")?.data as { exposures?: unknown })?.exposures,
        }),
        required: true,
        condition: (prev: Map<string, AgentResult>) => prev.get("run-scan")?.success === true,
      },
      {
        id: "calculate-risk",
        name: "Calculate Risk Score",
        action: "insights.risk",
        input: (prev: Map<string, AgentResult>) => ({
          userId: (prev.get("input")?.data as { userId?: string })?.userId,
          scanResults: prev.get("analyze-results")?.data,
        }),
        required: false,
      },
      {
        id: "check-health",
        name: "Calculate User Health",
        action: "success.health",
        input: (prev: Map<string, AgentResult>) => ({
          userId: (prev.get("input")?.data as { userId?: string })?.userId,
          riskScore: (prev.get("calculate-risk")?.data as { riskScore?: number })?.riskScore,
        }),
        required: false,
      },
    ],
  },

  // =========================================================================
  // SUPPORT TICKET WORKFLOW
  // =========================================================================
  {
    id: "support-ticket-workflow",
    name: "Support Ticket Workflow",
    description:
      "Process support ticket: analyze -> generate response -> update ticket",
    enabled: true,
    version: "1.0.0",
    steps: [
      {
        id: "analyze-ticket",
        name: "Analyze Ticket",
        action: "support.analyze",
        input: (prev: Map<string, AgentResult>) => prev.get("input")?.data || {},
        required: true,
      },
      {
        id: "generate-response",
        name: "Generate Response",
        action: "support.respond",
        input: (prev: Map<string, AgentResult>) => ({
          ticketId: (prev.get("input")?.data as { ticketId?: string })?.ticketId,
          analysis: prev.get("analyze-ticket")?.data,
        }),
        required: true,
        condition: (prev: Map<string, AgentResult>) => prev.get("analyze-ticket")?.success === true,
      },
      {
        id: "check-escalation",
        name: "Check for Escalation",
        action: "escalation.broker",
        input: (prev: Map<string, AgentResult>) => ({
          ticketId: (prev.get("input")?.data as { ticketId?: string })?.ticketId,
          analysis: prev.get("analyze-ticket")?.data,
        }),
        required: false,
        condition: (prev: Map<string, AgentResult>) => {
          const analysis = prev.get("analyze-ticket")?.data as {
            priority?: string;
            needsEscalation?: boolean;
          } | undefined;
          return analysis?.priority === "URGENT" || analysis?.needsEscalation === true;
        },
      },
    ],
  },

  // =========================================================================
  // DAILY OPERATIONS WORKFLOW
  // =========================================================================
  {
    id: "daily-operations",
    name: "Daily Operations Workflow",
    description:
      "Daily maintenance: health check -> cleanup -> link check -> digest",
    enabled: true,
    version: "1.0.0",
    options: {
      parallel: false,
      stopOnError: false,
    },
    steps: [
      {
        id: "health-check",
        name: "System Health Check",
        action: "operations.health",
        input: {},
        required: true,
      },
      {
        id: "cleanup",
        name: "System Cleanup",
        action: "operations.cleanup",
        input: {},
        required: false,
      },
      {
        id: "link-check",
        name: "Check Links",
        action: "operations.links",
        input: {},
        required: false,
      },
      {
        id: "send-digest",
        name: "Send Daily Digest",
        action: "communications.digest",
        input: (prev: Map<string, AgentResult>) => ({
          healthResults: prev.get("health-check")?.data,
        }),
        required: false,
      },
    ],
  },

  // =========================================================================
  // USER ONBOARDING WORKFLOW
  // =========================================================================
  {
    id: "user-onboarding",
    name: "User Onboarding Workflow",
    description:
      "New user onboarding: personalize -> first scan guide -> welcome email",
    enabled: true,
    version: "1.0.0",
    steps: [
      {
        id: "personalize",
        name: "Personalize Onboarding",
        action: "onboarding.personalize",
        input: (prev: Map<string, AgentResult>) => prev.get("input")?.data || {},
        required: true,
      },
      {
        id: "first-scan-guide",
        name: "First Scan Guide",
        action: "onboarding.guide",
        input: (prev: Map<string, AgentResult>) => ({
          userId: (prev.get("input")?.data as { userId?: string })?.userId,
          preferences: prev.get("personalize")?.data,
        }),
        required: true,
      },
      {
        id: "welcome-email",
        name: "Send Welcome Email",
        action: "communications.email",
        input: (prev: Map<string, AgentResult>) => ({
          type: "welcome",
          userId: (prev.get("input")?.data as { userId?: string })?.userId,
          onboardingData: prev.get("personalize")?.data,
        }),
        required: false,
      },
    ],
  },

  // =========================================================================
  // CHURN PREVENTION WORKFLOW
  // =========================================================================
  {
    id: "churn-prevention",
    name: "Churn Prevention Workflow",
    description:
      "Detect and prevent churn: predict churn -> analyze feedback -> proactive outreach",
    enabled: true,
    version: "1.0.0",
    steps: [
      {
        id: "predict-churn",
        name: "Predict Churn",
        action: "billing.churn",
        input: (prev: Map<string, AgentResult>) => prev.get("input")?.data || {},
        required: true,
      },
      {
        id: "analyze-feedback",
        name: "Analyze User Feedback",
        action: "feedback.analyze",
        input: (prev: Map<string, AgentResult>) => ({
          userId: (prev.get("input")?.data as { userId?: string })?.userId,
        }),
        required: false,
        condition: (prev: Map<string, AgentResult>) => {
          const churnData = prev.get("predict-churn")?.data as {
            churnRisk?: number;
          } | undefined;
          return (churnData?.churnRisk || 0) > 0.5;
        },
      },
      {
        id: "proactive-outreach",
        name: "Proactive Outreach",
        action: "success.outreach",
        input: (prev: Map<string, AgentResult>) => ({
          userId: (prev.get("input")?.data as { userId?: string })?.userId,
          churnPrediction: prev.get("predict-churn")?.data,
          feedbackAnalysis: prev.get("analyze-feedback")?.data,
        }),
        required: false,
        condition: (prev: Map<string, AgentResult>) => {
          const churnData = prev.get("predict-churn")?.data as {
            churnRisk?: number;
          } | undefined;
          return (churnData?.churnRisk || 0) > 0.7;
        },
      },
    ],
  },

  // =========================================================================
  // COMPLIANCE CHECK WORKFLOW
  // =========================================================================
  {
    id: "compliance-check",
    name: "Compliance Check Workflow",
    description: "Full compliance check: GDPR -> CCPA -> data retention",
    enabled: true,
    version: "1.0.0",
    options: {
      parallel: true,
    },
    steps: [
      {
        id: "gdpr-check",
        name: "GDPR Compliance Check",
        action: "compliance.gdpr",
        input: (prev: Map<string, AgentResult>) => prev.get("input")?.data || {},
        required: true,
      },
      {
        id: "ccpa-check",
        name: "CCPA Compliance Check",
        action: "compliance.ccpa",
        input: (prev: Map<string, AgentResult>) => prev.get("input")?.data || {},
        required: true,
      },
      {
        id: "retention-check",
        name: "Data Retention Check",
        action: "compliance.retention",
        input: (prev: Map<string, AgentResult>) => prev.get("input")?.data || {},
        required: false,
      },
    ],
  },

  // =========================================================================
  // INTELLIGENCE GATHERING WORKFLOW
  // =========================================================================
  {
    id: "intelligence-gathering",
    name: "Intelligence Gathering Workflow",
    description:
      "Gather all intelligence: broker intel -> threat intel -> competitive intel",
    enabled: true,
    version: "1.0.0",
    options: {
      parallel: true,
    },
    steps: [
      {
        id: "broker-intel",
        name: "Broker Intelligence",
        action: "intel.broker",
        input: {},
        required: true,
      },
      {
        id: "threat-intel",
        name: "Threat Intelligence",
        action: "intel.threat",
        input: {},
        required: false,
      },
      {
        id: "competitive-intel",
        name: "Competitive Intelligence",
        action: "intel.competitive",
        input: {},
        required: false,
      },
    ],
  },

  // =========================================================================
  // QA FULL SUITE WORKFLOW
  // =========================================================================
  {
    id: "qa-full-suite",
    name: "QA Full Suite Workflow",
    description: "Run full QA: validate all agents -> regression tests -> report",
    enabled: true,
    version: "1.0.0",
    steps: [
      {
        id: "validate-all",
        name: "Validate All Agents",
        action: "qa.validate",
        input: { validateAll: true },
        required: true,
        timeout: 600000, // 10 minutes
      },
      {
        id: "run-regression",
        name: "Run Regression Tests",
        action: "qa.regression",
        input: (prev: Map<string, AgentResult>) => ({
          validationResults: prev.get("validate-all")?.data,
        }),
        required: true,
        condition: (prev: Map<string, AgentResult>) => prev.get("validate-all")?.success === true,
      },
      {
        id: "generate-report",
        name: "Generate QA Report",
        action: "qa.report",
        input: (prev: Map<string, AgentResult>) => ({
          validationResults: prev.get("validate-all")?.data,
          regressionResults: prev.get("run-regression")?.data,
        }),
        required: true,
      },
    ],
  },

  // =========================================================================
  // SEO REMEDIATION WORKFLOW
  // =========================================================================
  {
    id: "seo-remediation",
    name: "SEO Remediation Workflow",
    description: "Auto-remediate SEO issues: generate fix -> apply -> verify",
    enabled: true,
    version: "1.0.0",
    steps: [
      {
        id: "generate-meta",
        name: "Generate Meta Tags",
        action: "content.generate-meta",
        input: (prev: Map<string, AgentResult>) => {
          const inputData = prev.get("input")?.data as {
            url?: string;
            issueType?: string;
          } | undefined;
          return {
            url: inputData?.url,
            issueType: inputData?.issueType,
          };
        },
        required: true,
      },
      {
        id: "verify-fix",
        name: "Verify Fix Applied",
        action: "seo.technical-audit",
        input: (prev: Map<string, AgentResult>) => {
          const inputData = prev.get("input")?.data as { url?: string } | undefined;
          return {
            pages: [inputData?.url],
          };
        },
        required: false,
        condition: (prev: Map<string, AgentResult>) => prev.get("generate-meta")?.success === true,
      },
      {
        id: "notify-completion",
        name: "Notify Remediation Complete",
        action: "operations.create-alert",
        input: (prev: Map<string, AgentResult>) => ({
          alertType: "seo_remediation_complete",
          severity: "low",
          message: "SEO issue auto-remediated",
          data: {
            generatedMeta: prev.get("generate-meta")?.data,
            verificationResult: prev.get("verify-fix")?.data,
          },
        }),
        required: false,
      },
    ],
  },

  // =========================================================================
  // SEO FULL AUDIT WITH AUTO-REMEDIATION
  // =========================================================================
  {
    id: "seo-audit-remediate",
    name: "SEO Audit with Auto-Remediation",
    description: "Run full SEO audit and auto-fix issues: audit -> generate fixes -> send report",
    enabled: true,
    version: "1.0.0",
    steps: [
      {
        id: "run-audit",
        name: "Run SEO Audit",
        action: "seo.full-report",
        input: (prev: Map<string, AgentResult>) => prev.get("input")?.data || {},
        required: true,
        timeout: 300000, // 5 minutes
      },
      {
        id: "generate-content-fixes",
        name: "Generate Content Fixes",
        action: "content.generate-meta",
        input: (prev: Map<string, AgentResult>) => {
          const auditData = prev.get("run-audit")?.data as {
            report?: {
              criticalIssues?: string[];
            };
          } | undefined;
          // Get first critical issue URL if any
          const criticalIssues = auditData?.report?.criticalIssues || [];
          const urlMatch = criticalIssues[0]?.match(/^(https?:\/\/[^\s:]+|\/[^\s:]*)/);
          return {
            url: urlMatch?.[1] || "/",
            issueType: "missing_meta",
            batch: criticalIssues.slice(0, 5),
          };
        },
        required: false,
        condition: (prev: Map<string, AgentResult>) => {
          const auditData = prev.get("run-audit")?.data as {
            report?: { criticalIssues?: string[] };
          } | undefined;
          return (auditData?.report?.criticalIssues?.length || 0) > 0;
        },
      },
      {
        id: "generate-blog-ideas",
        name: "Generate Blog Ideas",
        action: "seo.blog-ideas",
        input: { limit: 5 },
        required: false,
        condition: (prev: Map<string, AgentResult>) => prev.get("run-audit")?.success === true,
      },
      {
        id: "send-report",
        name: "Send SEO Report",
        action: "communications.email",
        input: (prev: Map<string, AgentResult>) => ({
          type: "seo_report",
          auditResults: prev.get("run-audit")?.data,
          contentFixes: prev.get("generate-content-fixes")?.data,
          blogIdeas: prev.get("generate-blog-ideas")?.data,
        }),
        required: false,
      },
    ],
  },

  // =========================================================================
  // CONTENT GENERATION WORKFLOW
  // =========================================================================
  {
    id: "content-generation",
    name: "Content Generation Workflow",
    description: "Generate and optimize content: generate -> optimize SEO -> review",
    enabled: true,
    version: "1.0.0",
    steps: [
      {
        id: "generate-content",
        name: "Generate Content",
        action: "content.generate-blog",
        input: (prev: Map<string, AgentResult>) => prev.get("input")?.data || {},
        required: true,
      },
      {
        id: "optimize-seo",
        name: "Optimize for SEO",
        action: "content.optimize-seo",
        input: (prev: Map<string, AgentResult>) => {
          const contentData = prev.get("generate-content")?.data as {
            content?: string;
            keywords?: string[];
          } | undefined;
          return {
            content: contentData?.content || "",
            targetKeywords: contentData?.keywords || [],
          };
        },
        required: true,
        condition: (prev: Map<string, AgentResult>) => prev.get("generate-content")?.success === true,
      },
      {
        id: "flag-for-review",
        name: "Flag for Human Review",
        action: "operations.create-alert",
        input: (prev: Map<string, AgentResult>) => ({
          alertType: "content_review_needed",
          severity: "low",
          message: "New content ready for review",
          data: {
            content: prev.get("generate-content")?.data,
            seoAnalysis: prev.get("optimize-seo")?.data,
          },
        }),
        required: false,
      },
    ],
  },
];

// ============================================================================
// WORKFLOW ENGINE
// ============================================================================

export class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map();
  private executions: Map<string, WorkflowExecutionState> = new Map();
  private executeAction: (
    action: string,
    input: unknown,
    context: AgentContext
  ) => Promise<AgentResult>;

  constructor(
    executeAction: (
      action: string,
      input: unknown,
      context: AgentContext
    ) => Promise<AgentResult>
  ) {
    this.executeAction = executeAction;

    // Register predefined workflows
    for (const workflow of PREDEFINED_WORKFLOWS) {
      this.workflows.set(workflow.id, workflow);
    }
  }

  /**
   * Register a workflow
   */
  registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
    console.log(`[WorkflowEngine] Registered workflow '${workflow.id}'`);
  }

  /**
   * Get a workflow by ID
   */
  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Execute a workflow
   */
  async execute<T = unknown>(
    workflowId: string,
    input: unknown,
    context: AgentContext,
    options?: WorkflowOptions
  ): Promise<OrchestratorResponse<T>> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return {
        success: false,
        results: [],
        errors: [
          {
            code: "WORKFLOW_NOT_FOUND",
            message: `Workflow '${workflowId}' not found`,
            retryable: false,
          },
        ],
        metadata: this.createEmptyMetadata(),
      };
    }

    if (!workflow.enabled) {
      return {
        success: false,
        results: [],
        errors: [
          {
            code: "WORKFLOW_DISABLED",
            message: `Workflow '${workflowId}' is disabled`,
            retryable: false,
          },
        ],
        metadata: this.createEmptyMetadata(),
      };
    }

    const startTime = Date.now();
    const executionId = nanoid();
    const mergedOptions = { ...workflow.options, ...options };

    // Create execution record
    const execution: WorkflowExecutionState = {
      id: executionId,
      workflowId,
      currentStep: 0,
      stepResults: new Map(),
      startedAt: new Date(),
      status: "RUNNING",
    };

    // Store initial input
    execution.stepResults.set("input", {
      success: true,
      data: input,
      needsHumanReview: false,
      metadata: {
        agentId: "workflow",
        capability: "input",
        requestId: context.requestId,
        duration: 0,
        usedFallback: false,
        executedAt: new Date(),
      },
    });

    this.executions.set(executionId, execution);

    const results: AgentResult[] = [];
    const executionPath: string[] = [];
    let totalTokensUsed = 0;
    let usedFallbacks = false;
    let overallSuccess = true;

    try {
      if (mergedOptions?.parallel) {
        // Execute all steps in parallel
        const stepPromises = workflow.steps.map((step) =>
          this.executeStep(step, execution, context)
        );

        const stepResults = await Promise.allSettled(stepPromises);

        for (let i = 0; i < stepResults.length; i++) {
          const step = workflow.steps[i];
          const result = stepResults[i];

          if (result.status === "fulfilled" && result.value) {
            execution.stepResults.set(step.id, result.value);
            results.push(result.value);
            executionPath.push(step.id);
            totalTokensUsed += result.value.metadata.tokensUsed || 0;
            if (result.value.metadata.usedFallback) usedFallbacks = true;
            if (!result.value.success && step.required) overallSuccess = false;
          } else if (step.required) {
            overallSuccess = false;
          }
        }
      } else {
        // Execute steps sequentially
        for (const step of workflow.steps) {
          execution.currentStep++;

          const result = await this.executeStep(step, execution, context);

          if (result) {
            execution.stepResults.set(step.id, result);
            results.push(result);
            executionPath.push(step.id);
            totalTokensUsed += result.metadata.tokensUsed || 0;
            if (result.metadata.usedFallback) usedFallbacks = true;

            if (!result.success && step.required) {
              overallSuccess = false;
              if (mergedOptions?.stopOnError) {
                break;
              }
            }
          }
        }
      }

      execution.status = overallSuccess ? "COMPLETED" : "FAILED";
    } catch (error) {
      execution.status = "FAILED";
      execution.error =
        error instanceof Error ? error.message : String(error);
      overallSuccess = false;
    }

    return {
      success: overallSuccess,
      results: results as AgentResult<T>[],
      metadata: {
        totalDuration: Date.now() - startTime,
        agentsInvoked: results.length,
        totalTokensUsed,
        executionPath,
        usedFallbacks,
      },
    };
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(
    step: WorkflowStep,
    execution: WorkflowExecutionState,
    context: AgentContext
  ): Promise<AgentResult | null> {
    // Check condition
    if (step.condition && !step.condition(execution.stepResults)) {
      console.log(
        `[WorkflowEngine] Skipping step '${step.id}' - condition not met`
      );
      return null;
    }

    // Resolve input
    const input =
      typeof step.input === "function"
        ? step.input(execution.stepResults)
        : step.input;

    // Execute with retries
    let lastError: Error | undefined;
    const maxRetries = step.retries || 0;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.executeAction(step.action, input, {
          ...context,
          timeout: step.timeout || context.timeout,
        });

        // Transform result if needed
        if (step.transformResult) {
          return step.transformResult(result);
        }

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries) {
          await this.sleep(1000 * (attempt + 1)); // Exponential backoff
        }
      }
    }

    // All retries failed
    return {
      success: false,
      error: {
        code: "STEP_FAILED",
        message: lastError?.message || "Step execution failed",
        retryable: false,
      },
      needsHumanReview: true,
      metadata: {
        agentId: "workflow",
        capability: step.id,
        requestId: context.requestId,
        duration: 0,
        usedFallback: false,
        executedAt: new Date(),
      },
    };
  }

  /**
   * Create empty metadata
   */
  private createEmptyMetadata(): OrchestratorMetadata {
    return {
      totalDuration: 0,
      agentsInvoked: 0,
      totalTokensUsed: 0,
      executionPath: [],
      usedFallbacks: false,
    };
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get execution by ID
   */
  getExecution(executionId: string): WorkflowExecutionState | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Cancel an execution
   */
  cancelExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === "RUNNING") {
      execution.status = "CANCELLED";
      return true;
    }
    return false;
  }
}

export default WorkflowEngine;
