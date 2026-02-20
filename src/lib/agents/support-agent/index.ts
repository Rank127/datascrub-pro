/**
 * Support Agent
 *
 * Handles customer support operations including:
 * - Ticket classification and analysis
 * - AI-powered response generation
 * - Escalation detection
 * - Auto-resolution when appropriate
 *
 * Replaces/enhances: ticketing-agent cron job
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
import { buildAgentMastermindPrompt } from "@/lib/mastermind";
import { recordOutcome } from "@/lib/agents/learning";

// ============================================================================
// CONSTANTS
// ============================================================================

const AGENT_ID = "support-agent";
const AGENT_VERSION = "1.0.0";
const MAX_TOKENS = 2048;

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const SUPPORT_AGENT_SYSTEM_PROMPT = `You are the Support Agent for GhostMyData, a privacy protection service that helps users remove their personal information from data brokers and monitors for data breaches.

Your role is to analyze and respond to customer support tickets with empathy, accuracy, and efficiency.

ABOUT GHOSTMYDATA:
- We help users protect their privacy by scanning for personal data exposures
- We automate removal requests to data brokers
- We monitor for new exposures and data breaches
- Plans: FREE (basic scanning), PRO (full removal automation), ENTERPRISE (family + advanced features)

TICKET TYPES:
- SCAN_ERROR: Issues with scans failing or timing out
- REMOVAL_FAILED: Removal requests that didn't complete
- PAYMENT_ISSUE: Billing or subscription problems
- ACCOUNT_ISSUE: Login, password, or account access
- FEATURE_REQUEST: Suggestions for new features
- OTHER: General inquiries

RESPONSE GUIDELINES:
1. Be empathetic and professional
2. Acknowledge the user's concern
3. Explain what's happening in simple terms
4. Provide clear next steps
5. Never admit to bugs or failures - frame as "we're investigating" or "working to resolve"
6. Never share technical details with users
7. If you can't resolve, escalate gracefully

PRIORITY ASSESSMENT:
- LOW: General questions, feature requests
- NORMAL: Standard issues with workarounds
- HIGH: Significant functionality issues
- URGENT: Security concerns, payment failures, VIP users

PROFILE & SCAN ACCURACY:
- Email-only profiles (no name) ARE valid — an exact email match on a broker scores 100% confidence
- Phone-only profiles ARE valid — an exact phone match scores 100% confidence
- More complete profiles (name + email/phone + address + DOB) find more exposures and match more accurately
- The scan page shows a profile completeness checklist — this is expected, not an error
- If a user reports "no exposures found", first check if their profile has enough data to match against

AUTO-RESOLUTION CRITERIA:
- Can auto-resolve if the issue is clearly a user misunderstanding
- Can auto-resolve if standard troubleshooting will fix it
- Cannot auto-resolve payment issues, security issues, or complex technical problems

Always respond with valid JSON:
{
  "canAutoResolve": boolean,
  "response": "User-facing response message",
  "internalNotes": "Notes for support team",
  "suggestedActions": ["action1", "action2"],
  "priority": "LOW|NORMAL|HIGH|URGENT",
  "needsHumanReview": boolean,
  "needsEscalation": boolean,
  "escalationReason": "optional reason",
  "managerReviewItems": [{"category": "...", "description": "..."}]
}`;

// ============================================================================
// TYPES
// ============================================================================

interface AnalyzeTicketInput {
  ticketId: string;
  includeContext?: boolean;
}

interface AnalysisResult {
  ticketId: string;
  type: string;
  priority: string;
  sentiment: string;
  canAutoResolve: boolean;
  suggestedResponse?: string;
  suggestedActions: string[];
  needsEscalation: boolean;
  escalationReason?: string;
  internalNotes?: string;
  confidence: number;
}

interface GenerateResponseInput {
  ticketId: string;
  analysis?: AnalysisResult;
  tone?: "professional" | "friendly" | "empathetic";
}

interface ResponseResult {
  ticketId: string;
  response: string;
  canAutoResolve: boolean;
  priority: string;
  suggestedActions: string[];
}

interface ProcessTicketInput {
  ticketId: string;
  autoResolve?: boolean;
}

interface ProcessResult {
  ticketId: string;
  status: string;
  wasAutoResolved: boolean;
  response?: string;
  needsHumanReview: boolean;
}

interface ProcessBatchInput {
  limit?: number;
  statuses?: string[];
}

interface BatchResult {
  processed: number;
  autoResolved: number;
  needsReview: number;
  results: ProcessResult[];
}

// ============================================================================
// SUPPORT AGENT CLASS
// ============================================================================

class SupportAgent extends BaseAgent {
  readonly id = AGENT_ID;
  readonly name = "Support Agent";
  readonly domain = AgentDomains.CORE;
  readonly mode = AgentModes.AI;
  readonly version = AGENT_VERSION;
  readonly description =
    "Analyzes support tickets, generates responses, and handles escalation";

  readonly capabilities: AgentCapability[] = [
    {
      id: "analyze-ticket",
      name: "Analyze Support Ticket",
      description: "Analyze a ticket to determine priority, sentiment, and resolution path",
      requiresAI: true,
      estimatedTokens: 1000,
    },
    {
      id: "generate-response",
      name: "Generate Response",
      description: "Generate an AI-powered response to a support ticket",
      requiresAI: true,
      estimatedTokens: 800,
    },
    {
      id: "process-ticket",
      name: "Process Ticket",
      description: "Full ticket processing including analysis and response",
      requiresAI: true,
      estimatedTokens: 1500,
    },
    {
      id: "process-batch",
      name: "Process Batch",
      description: "Process multiple pending tickets",
      requiresAI: true,
      supportsBatch: true,
      rateLimit: 5,
    },
  ];

  protected getSystemPrompt(): string {
    const mastermind = buildAgentMastermindPrompt("behavior-lab", 3);
    return `${SUPPORT_AGENT_SYSTEM_PROMPT}${mastermind}`;
  }

  protected registerHandlers(): void {
    this.handlers.set("analyze-ticket", this.handleAnalyzeTicket.bind(this));
    this.handlers.set("generate-response", this.handleGenerateResponse.bind(this));
    this.handlers.set("process-ticket", this.handleProcessTicket.bind(this));
    this.handlers.set("process-batch", this.handleProcessBatch.bind(this));
  }

  // ============================================================================
  // CAPABILITY HANDLERS
  // ============================================================================

  private async handleAnalyzeTicket(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<AnalysisResult>> {
    const startTime = Date.now();
    const { ticketId, includeContext = true } = input as AnalyzeTicketInput;

    try {
      // Fetch ticket with related data
      const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              plan: true,
              createdAt: true,
            },
          },
          comments: {
            orderBy: { createdAt: "asc" },
            take: 10,
          },
        },
      });

      if (!ticket) {
        return {
          success: false,
          error: {
            code: "TICKET_NOT_FOUND",
            message: `Ticket ${ticketId} not found`,
            retryable: false,
          },
          needsHumanReview: false,
          metadata: {
            agentId: this.id,
            capability: "analyze-ticket",
            requestId: context.requestId,
            duration: Date.now() - startTime,
            usedFallback: false,
            executedAt: new Date(),
          },
        };
      }

      // Build context for AI
      const ticketContext = await this.buildTicketContext(ticket, includeContext);

      // Call AI for analysis
      if (!this.anthropic) {
        // Fallback to rule-based analysis
        return this.ruleBasedAnalysis(ticket, context, startTime);
      }

      const message = await this.anthropic.messages.create({
        model: this.config.model || "claude-sonnet-4-5-20250929",
        max_tokens: MAX_TOKENS,
        system: this.getSystemPrompt(),
        messages: [
          {
            role: "user",
            content: `Analyze this support ticket and provide your assessment:

TICKET #${ticket.ticketNumber}
Type: ${ticket.type}
Status: ${ticket.status}
Current Priority: ${ticket.priority}
Subject: ${ticket.subject}
Description: ${ticket.description}

${ticketContext}

Provide a detailed analysis in JSON format.`,
          },
        ],
      });

      // Parse AI response
      const textContent = message.content.find((c) => c.type === "text");
      if (!textContent || textContent.type !== "text") {
        throw new Error("No text response from AI");
      }

      const parsed = this.parseAIResponse<{
        canAutoResolve?: boolean;
        response?: string;
        priority?: string;
        suggestedActions?: string[];
        needsHumanReview?: boolean;
        needsEscalation?: boolean;
        escalationReason?: string;
        internalNotes?: string;
        sentiment?: string;
        confidence?: number;
      }>(textContent.text);

      const tokensUsed =
        (message.usage?.input_tokens || 0) + (message.usage?.output_tokens || 0);

      return this.createSuccessResult<AnalysisResult>(
        {
          ticketId,
          type: ticket.type,
          priority: parsed.data?.priority || ticket.priority,
          sentiment: parsed.data?.sentiment || "neutral",
          canAutoResolve: parsed.data?.canAutoResolve || false,
          suggestedResponse: parsed.data?.response,
          suggestedActions: parsed.data?.suggestedActions || [],
          needsEscalation: parsed.data?.needsEscalation || false,
          escalationReason: parsed.data?.escalationReason,
          internalNotes: parsed.data?.internalNotes,
          confidence: parsed.data?.confidence || 0.7,
        },
        {
          capability: "analyze-ticket",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          tokensUsed,
          model: this.config.model,
          usedFallback: false,
          executedAt: new Date(),
        },
        {
          confidence: parsed.data?.confidence || 0.7,
          needsHumanReview: parsed.data?.needsHumanReview,
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "ANALYZE_ERROR",
          message: error instanceof Error ? error.message : "Analysis failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "analyze-ticket",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleGenerateResponse(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<ResponseResult>> {
    const startTime = Date.now();
    const { ticketId, analysis, tone = "professional" } = input as GenerateResponseInput;

    try {
      // Fetch ticket
      const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
          user: { select: { name: true, email: true, plan: true } },
        },
      });

      if (!ticket) {
        return {
          success: false,
          error: {
            code: "TICKET_NOT_FOUND",
            message: `Ticket ${ticketId} not found`,
            retryable: false,
          },
          needsHumanReview: false,
          metadata: {
            agentId: this.id,
            capability: "generate-response",
            requestId: context.requestId,
            duration: Date.now() - startTime,
            usedFallback: false,
            executedAt: new Date(),
          },
        };
      }

      if (!this.anthropic) {
        // Fallback to template response
        return this.templateResponse(ticket, context, startTime);
      }

      const message = await this.anthropic.messages.create({
        model: this.config.model || "claude-sonnet-4-5-20250929",
        max_tokens: MAX_TOKENS,
        system: this.getSystemPrompt(),
        messages: [
          {
            role: "user",
            content: `Generate a ${tone} response for this support ticket:

TICKET #${ticket.ticketNumber}
Type: ${ticket.type}
Subject: ${ticket.subject}
Description: ${ticket.description}
User: ${ticket.user.name || "Customer"} (${ticket.user.plan} plan)
${analysis ? `\nPrevious Analysis:\n${JSON.stringify(analysis, null, 2)}` : ""}

Generate a helpful, empathetic response in JSON format.`,
          },
        ],
      });

      const textContent = message.content.find((c) => c.type === "text");
      if (!textContent || textContent.type !== "text") {
        throw new Error("No text response from AI");
      }

      const parsed = this.parseAIResponse<{
        response?: string;
        canAutoResolve?: boolean;
        priority?: string;
        suggestedActions?: string[];
      }>(textContent.text);

      const tokensUsed =
        (message.usage?.input_tokens || 0) + (message.usage?.output_tokens || 0);

      return this.createSuccessResult<ResponseResult>(
        {
          ticketId,
          response: parsed.data?.response || "Thank you for contacting GhostMyData support. We're reviewing your request and will get back to you shortly.",
          canAutoResolve: parsed.data?.canAutoResolve || false,
          priority: parsed.data?.priority || ticket.priority,
          suggestedActions: parsed.data?.suggestedActions || [],
        },
        {
          capability: "generate-response",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          tokensUsed,
          model: this.config.model,
          usedFallback: false,
          executedAt: new Date(),
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "RESPONSE_ERROR",
          message: error instanceof Error ? error.message : "Response generation failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "generate-response",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleProcessTicket(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<ProcessResult>> {
    const startTime = Date.now();
    const { ticketId, autoResolve = true } = input as ProcessTicketInput;

    try {
      // First analyze the ticket
      const analysisResult = await this.handleAnalyzeTicket(
        { ticketId, includeContext: true },
        context
      );

      if (!analysisResult.success || !analysisResult.data) {
        return {
          success: false,
          error: analysisResult.error || {
            code: "ANALYSIS_FAILED",
            message: "Failed to analyze ticket",
            retryable: true,
          },
          needsHumanReview: true,
          metadata: {
            agentId: this.id,
            capability: "process-ticket",
            requestId: context.requestId,
            duration: Date.now() - startTime,
            usedFallback: false,
            executedAt: new Date(),
          },
        };
      }

      const analysis = analysisResult.data;

      // Generate response
      const responseResult = await this.handleGenerateResponse(
        { ticketId, analysis },
        context
      );

      if (!responseResult.success || !responseResult.data) {
        return {
          success: false,
          error: responseResult.error || {
            code: "RESPONSE_FAILED",
            message: "Failed to generate response",
            retryable: true,
          },
          needsHumanReview: true,
          metadata: {
            agentId: this.id,
            capability: "process-ticket",
            requestId: context.requestId,
            duration: Date.now() - startTime,
            usedFallback: false,
            executedAt: new Date(),
          },
        };
      }

      const response = responseResult.data;
      let wasAutoResolved = false;

      // Auto-resolve if appropriate
      if (autoResolve && analysis.canAutoResolve && !analysis.needsEscalation) {
        // Add response as comment
        await prisma.ticketComment.create({
          data: {
            id: nanoid(),
            ticketId,
            authorId: "system", // System user ID
            content: response.response,
            isInternal: false,
          },
        });

        // Update ticket status
        await prisma.supportTicket.update({
          where: { id: ticketId },
          data: {
            status: "RESOLVED",
            priority: response.priority,
            resolution: "Auto-resolved by Support Agent",
            resolvedAt: new Date(),
            internalNotes: analysis.internalNotes,
            lastActivityAt: new Date(),
          },
        });

        wasAutoResolved = true;

        // Record learning outcome — auto-resolved successfully
        recordOutcome({
          agentId: this.id,
          capability: "process-ticket",
          outcomeType: "SUCCESS",
          context: { ticketId, ticketType: analysis.type, autoResolved: true },
          outcome: { priority: response.priority, responseLength: response.response.length },
        }).catch(() => {});
      } else {
        // Record learning outcome — needed human review
        recordOutcome({
          agentId: this.id,
          capability: "process-ticket",
          outcomeType: analysis.needsEscalation ? "PARTIAL" : "PARTIAL",
          context: { ticketId, ticketType: analysis.type, needsEscalation: analysis.needsEscalation },
          outcome: { priority: response.priority, escalated: analysis.needsEscalation },
        }).catch(() => {});

        // Save draft response and update status
        await prisma.supportTicket.update({
          where: { id: ticketId },
          data: {
            status: analysis.needsEscalation ? "IN_PROGRESS" : "IN_PROGRESS",
            priority: response.priority,
            internalNotes: `${analysis.internalNotes || ""}\n\nDraft Response:\n${response.response}`,
            lastActivityAt: new Date(),
          },
        });
      }

      return this.createSuccessResult<ProcessResult>(
        {
          ticketId,
          status: wasAutoResolved ? "RESOLVED" : "IN_PROGRESS",
          wasAutoResolved,
          response: response.response,
          needsHumanReview: !wasAutoResolved || analysis.needsEscalation,
        },
        {
          capability: "process-ticket",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          tokensUsed:
            (analysisResult.metadata.tokensUsed || 0) +
            (responseResult.metadata.tokensUsed || 0),
          usedFallback: false,
          executedAt: new Date(),
        },
        {
          needsHumanReview: !wasAutoResolved || analysis.needsEscalation,
          managerReviewItems: analysis.needsEscalation
            ? [
                {
                  category: "escalation",
                  description: analysis.escalationReason || "Ticket needs escalation",
                  priority: "HIGH",
                },
              ]
            : undefined,
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "PROCESS_ERROR",
          message: error instanceof Error ? error.message : "Processing failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "process-ticket",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleProcessBatch(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<BatchResult>> {
    const startTime = Date.now();
    const inputOpts = input as ProcessBatchInput;
    const directiveBatchSize = await this.getDirective<number>("support_batch_size", 20);
    const limit = inputOpts.limit ?? directiveBatchSize;
    const statuses = inputOpts.statuses ?? ["OPEN", "IN_PROGRESS"];

    try {
      // Get pending tickets
      const tickets = await prisma.supportTicket.findMany({
        where: {
          status: { in: statuses },
        },
        orderBy: [
          { priority: "desc" },
          { createdAt: "asc" },
        ],
        take: limit,
        select: { id: true },
      });

      const results: ProcessResult[] = [];
      let autoResolved = 0;
      let needsReview = 0;

      for (const ticket of tickets) {
        const result = await this.handleProcessTicket(
          { ticketId: ticket.id, autoResolve: true },
          context
        );

        if (result.success && result.data) {
          results.push(result.data);
          if (result.data.wasAutoResolved) {
            autoResolved++;
          }
          if (result.data.needsHumanReview) {
            needsReview++;
          }
        }

        // Small delay between tickets
        await this.sleep(200);
      }

      return this.createSuccessResult<BatchResult>(
        {
          processed: results.length,
          autoResolved,
          needsReview,
          results,
        },
        {
          capability: "process-batch",
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
          code: "BATCH_ERROR",
          message: error instanceof Error ? error.message : "Batch processing failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "process-batch",
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

  private async buildTicketContext(
    ticket: { userId: string; user: { id: string; plan: string; createdAt: Date } },
    includeContext: boolean
  ): Promise<string> {
    if (!includeContext) return "";

    // Get user stats
    const [scanCount, exposureCount, ticketCount] = await Promise.all([
      prisma.scan.count({ where: { userId: ticket.userId } }),
      prisma.exposure.count({ where: { userId: ticket.userId } }),
      prisma.supportTicket.count({
        where: { userId: ticket.userId, status: "RESOLVED" },
      }),
    ]);

    const accountAge = Math.floor(
      (Date.now() - new Date(ticket.user.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return `
USER CONTEXT:
- Plan: ${ticket.user.plan}
- Account Age: ${accountAge} days
- Total Scans: ${scanCount}
- Total Exposures: ${exposureCount}
- Previous Resolved Tickets: ${ticketCount}`;
  }

  private async ruleBasedAnalysis(
    ticket: { id: string; type: string; priority: string; description: string },
    context: AgentContext,
    startTime: number
  ): Promise<AgentResult<AnalysisResult>> {
    // Simple rule-based classification
    const description = ticket.description.toLowerCase();
    let priority = ticket.priority;
    let canAutoResolve = false;
    const suggestedActions: string[] = [];

    // Detect urgency keywords
    if (description.includes("urgent") || description.includes("asap")) {
      priority = "HIGH";
    }
    if (description.includes("security") || description.includes("breach")) {
      priority = "URGENT";
      suggestedActions.push("review_security_concern");
    }

    // Read directive-driven auto-resolve types
    const autoResolveTypes = await this.getDirective<string[]>(
      "support_auto_resolve_types",
      ["FEATURE_REQUEST"]
    );

    // Auto-resolve detection (directive-driven)
    if (
      autoResolveTypes.includes(ticket.type) ||
      description.includes("suggestion")
    ) {
      canAutoResolve = true;
    }

    return this.createSuccessResult<AnalysisResult>(
      {
        ticketId: ticket.id,
        type: ticket.type,
        priority,
        sentiment: "neutral",
        canAutoResolve,
        suggestedActions,
        needsEscalation: priority === "URGENT",
        confidence: 0.5,
      },
      {
        capability: "analyze-ticket",
        requestId: context.requestId,
        duration: Date.now() - startTime,
        usedFallback: true,
        executedAt: new Date(),
      },
      { confidence: 0.5 }
    );
  }

  private templateResponse(
    ticket: { id: string; type: string; subject: string },
    context: AgentContext,
    startTime: number
  ): AgentResult<ResponseResult> {
    const templates: Record<string, string> = {
      SCAN_ERROR:
        "Thank you for reporting this scan issue. Our team is investigating the problem and we'll have it resolved shortly. Please try running your scan again in a few minutes.",
      REMOVAL_FAILED:
        "We apologize for the inconvenience with your removal request. Our team is actively working to resolve this and will update you soon. In the meantime, the removal will be retried automatically.",
      PAYMENT_ISSUE:
        "Thank you for reaching out about your billing concern. A member of our team will review your account and get back to you within 24 hours.",
      ACCOUNT_ISSUE:
        "We're sorry you're experiencing account issues. Please try resetting your password using the 'Forgot Password' link. If the issue persists, we'll assist you further.",
      FEATURE_REQUEST:
        "Thank you for your suggestion! We appreciate your feedback and will share it with our product team for consideration.",
      OTHER:
        "Thank you for contacting GhostMyData support. We've received your message and will respond within 24 hours.",
    };

    return this.createSuccessResult<ResponseResult>(
      {
        ticketId: ticket.id,
        response: templates[ticket.type] || templates.OTHER,
        canAutoResolve: ticket.type === "FEATURE_REQUEST",
        priority: "NORMAL",
        suggestedActions: [],
      },
      {
        capability: "generate-response",
        requestId: context.requestId,
        duration: Date.now() - startTime,
        usedFallback: true,
        executedAt: new Date(),
      }
    );
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
// AGENT INSTANCE & REGISTRATION
// ============================================================================

let supportAgentInstance: SupportAgent | null = null;

export function getSupportAgent(): SupportAgent {
  if (!supportAgentInstance) {
    supportAgentInstance = new SupportAgent();
    registerAgent(supportAgentInstance);
  }
  return supportAgentInstance;
}

export async function processTicket(ticketId: string): Promise<ProcessResult> {
  const agent = getSupportAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.ON_DEMAND,
  });

  const result = await agent.execute<ProcessResult>(
    "process-ticket",
    { ticketId },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Ticket processing failed");
}

export async function processPendingTickets(limit = 20): Promise<BatchResult> {
  const agent = getSupportAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<BatchResult>(
    "process-batch",
    { limit },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Batch processing failed");
}

export { SupportAgent };
export default getSupportAgent;
