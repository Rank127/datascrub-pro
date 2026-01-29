/**
 * Ticketing Agent - AI-powered ticket review and response system
 *
 * This agent automatically reviews new tickets and user comments,
 * determines appropriate actions, and responds to users.
 */

import { PrismaClient } from "@prisma/client";
import Anthropic from "@anthropic-ai/sdk";

const prisma = new PrismaClient();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// System prompt for the ticketing agent
const TICKETING_AGENT_PROMPT = `You are a helpful customer support agent for GhostMyData, a privacy protection service that helps users remove their personal data from data broker websites.

Your role is to:
1. Understand the user's issue from their ticket description
2. Provide helpful, empathetic responses
3. Offer solutions when possible
4. Know when to escalate to human support

Key information about GhostMyData:
- We scan data broker sites to find user's exposed personal information
- We automatically send opt-out requests to data brokers
- Plans: FREE (10 scans/month, manual guides), PRO ($11.99/mo, 50 scans, auto removals), ENTERPRISE ($29.99/mo, unlimited, family plan)
- Removals typically take 2-4 weeks to process
- Users can track removal status in their dashboard

Common issues and solutions:
1. SCAN_ERROR: Usually temporary - recommend retrying in a few hours or trying a different browser
2. REMOVAL_FAILED: Data brokers can be slow - we'll keep trying automatically
3. PAYMENT_ISSUE: Direct to billing portal or suggest updating payment method
4. ACCOUNT_ISSUE: Password resets via email, contact support for locked accounts
5. FEATURE_REQUEST: Thank them and note we'll consider it

Response guidelines:
- Be concise but helpful (2-4 sentences for simple issues, more for complex)
- Use a friendly, professional tone
- Never promise specific timeframes for removals
- If unsure, recommend contacting support@ghostmydata.com
- Don't share technical implementation details

Return your response as JSON with this structure:
{
  "canAutoResolve": boolean,  // true if this can be resolved without human intervention
  "response": string,         // the message to send to the user
  "suggestedActions": string[], // internal actions to take (e.g., "retry_scan", "escalate")
  "priority": "LOW" | "NORMAL" | "HIGH" | "URGENT", // suggested priority adjustment
  "needsHumanReview": boolean, // true if a human should review before sending
  "internalNote": string      // note for support staff (not visible to user)
}`;

interface TicketContext {
  id: string;
  ticketNumber: string;
  type: string;
  status: string;
  priority: string;
  subject: string;
  description: string;
  userName: string;
  userEmail: string;
  userPlan: string;
  errorDetails?: string | null;
  linkedScan?: {
    status: string;
    error?: string | null;
  } | null;
  linkedRemoval?: {
    status: string;
    attempts: number;
    brokerName?: string;
  } | null;
  previousComments: Array<{
    content: string;
    isFromUser: boolean;
    createdAt: Date;
  }>;
  newComment?: string;
}

interface AgentResponse {
  canAutoResolve: boolean;
  response: string;
  suggestedActions: string[];
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  needsHumanReview: boolean;
  internalNote: string;
}

/**
 * Analyze a ticket and generate an appropriate response
 */
export async function analyzeTicket(context: TicketContext): Promise<AgentResponse> {
  // Build context message for the AI
  const contextMessage = buildContextMessage(context);

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: contextMessage,
        },
      ],
      system: TICKETING_AGENT_PROMPT,
    });

    // Extract text content from response
    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    // Parse JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse AI response as JSON");
    }

    const response: AgentResponse = JSON.parse(jsonMatch[0]);
    return response;
  } catch (error) {
    console.error("Ticketing agent error:", error);
    // Return safe fallback response
    return {
      canAutoResolve: false,
      response: "",
      suggestedActions: ["escalate_to_human"],
      priority: "NORMAL",
      needsHumanReview: true,
      internalNote: `AI agent failed to process: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Build a context message for the AI from ticket data
 */
function buildContextMessage(context: TicketContext): string {
  let message = `Please analyze this support ticket and provide an appropriate response.

TICKET DETAILS:
- Ticket #: ${context.ticketNumber}
- Type: ${context.type}
- Status: ${context.status}
- Priority: ${context.priority}
- Subject: ${context.subject}
- Description: ${context.description}

USER INFO:
- Name: ${context.userName}
- Plan: ${context.userPlan}
`;

  if (context.errorDetails) {
    message += `\nERROR DETAILS:\n${context.errorDetails}\n`;
  }

  if (context.linkedScan) {
    message += `\nLINKED SCAN:
- Status: ${context.linkedScan.status}
${context.linkedScan.error ? `- Error: ${context.linkedScan.error}` : ""}
`;
  }

  if (context.linkedRemoval) {
    message += `\nLINKED REMOVAL REQUEST:
- Status: ${context.linkedRemoval.status}
- Attempts: ${context.linkedRemoval.attempts}
${context.linkedRemoval.brokerName ? `- Data Broker: ${context.linkedRemoval.brokerName}` : ""}
`;
  }

  if (context.previousComments.length > 0) {
    message += `\nPREVIOUS CONVERSATION:\n`;
    context.previousComments.forEach((comment) => {
      const sender = comment.isFromUser ? "User" : "Support";
      message += `[${sender}]: ${comment.content}\n`;
    });
  }

  if (context.newComment) {
    message += `\nNEW USER MESSAGE:\n${context.newComment}\n`;
  }

  message += `\nPlease analyze and respond with JSON as specified.`;

  return message;
}

/**
 * Process a new ticket - analyze and optionally respond
 */
export async function processNewTicket(ticketId: string): Promise<{
  success: boolean;
  autoResolved: boolean;
  message: string;
}> {
  try {
    // Fetch ticket with all related data
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            plan: true,
          },
        },
        scan: {
          select: {
            status: true,
            error: true,
          },
        },
        removalRequest: {
          select: {
            status: true,
            attempts: true,
            exposure: {
              select: {
                sourceName: true,
              },
            },
          },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: { id: true, role: true },
            },
          },
        },
      },
    });

    if (!ticket) {
      return { success: false, autoResolved: false, message: "Ticket not found" };
    }

    // Build context for AI
    const context: TicketContext = {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      type: ticket.type,
      status: ticket.status,
      priority: ticket.priority,
      subject: ticket.subject,
      description: ticket.description,
      userName: ticket.user.name || "User",
      userEmail: ticket.user.email || "",
      userPlan: ticket.user.plan || "FREE",
      errorDetails: ticket.errorDetails,
      linkedScan: ticket.scan,
      linkedRemoval: ticket.removalRequest
        ? {
            status: ticket.removalRequest.status,
            attempts: ticket.removalRequest.attempts,
            brokerName: ticket.removalRequest.exposure?.sourceName,
          }
        : null,
      previousComments: ticket.comments.map((c) => ({
        content: c.content,
        isFromUser: c.author.role === "USER",
        createdAt: c.createdAt,
      })),
    };

    // Get AI analysis
    const analysis = await analyzeTicket(context);

    // Log the analysis as internal note
    await prisma.ticketComment.create({
      data: {
        ticketId: ticket.id,
        authorId: ticket.userId, // System comment attributed to system
        content: `[AI AGENT ANALYSIS]\n${analysis.internalNote}\nSuggested actions: ${analysis.suggestedActions.join(", ")}`,
        isInternal: true,
      },
    });

    // Update priority if suggested
    if (analysis.priority !== ticket.priority) {
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { priority: analysis.priority },
      });
    }

    // If can auto-resolve and no human review needed, send response
    if (analysis.canAutoResolve && !analysis.needsHumanReview && analysis.response) {
      // Add the response as a comment
      await prisma.ticketComment.create({
        data: {
          ticketId: ticket.id,
          authorId: ticket.userId, // Will be updated to system user
          content: analysis.response,
          isInternal: false,
        },
      });

      // Update ticket status
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: {
          status: "RESOLVED",
          resolution: analysis.response,
          resolvedAt: new Date(),
          lastActivityAt: new Date(),
        },
      });

      // Send email notification
      await sendTicketResponseEmail(ticket.user.email!, ticket.user.name!, ticket.ticketNumber, analysis.response);

      return {
        success: true,
        autoResolved: true,
        message: "Ticket auto-resolved by AI agent",
      };
    }

    // If response generated but needs human review
    if (analysis.response && analysis.needsHumanReview) {
      // Save draft response as internal note
      await prisma.ticketComment.create({
        data: {
          ticketId: ticket.id,
          authorId: ticket.userId,
          content: `[AI DRAFT RESPONSE - NEEDS REVIEW]\n${analysis.response}`,
          isInternal: true,
        },
      });

      return {
        success: true,
        autoResolved: false,
        message: "AI generated draft response for human review",
      };
    }

    return {
      success: true,
      autoResolved: false,
      message: "Ticket analyzed, requires human attention",
    };
  } catch (error) {
    console.error("Error processing ticket:", error);
    return {
      success: false,
      autoResolved: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Process a new comment on an existing ticket
 */
export async function processNewComment(
  ticketId: string,
  commentContent: string
): Promise<{
  success: boolean;
  responded: boolean;
  message: string;
}> {
  try {
    // Fetch ticket with context
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            plan: true,
          },
        },
        scan: {
          select: {
            status: true,
            error: true,
          },
        },
        removalRequest: {
          select: {
            status: true,
            attempts: true,
            exposure: {
              select: {
                sourceName: true,
              },
            },
          },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: { id: true, role: true },
            },
          },
        },
      },
    });

    if (!ticket) {
      return { success: false, responded: false, message: "Ticket not found" };
    }

    // Don't process closed tickets
    if (ticket.status === "CLOSED") {
      return { success: false, responded: false, message: "Ticket is closed" };
    }

    // Build context with new comment
    const context: TicketContext = {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      type: ticket.type,
      status: ticket.status,
      priority: ticket.priority,
      subject: ticket.subject,
      description: ticket.description,
      userName: ticket.user.name || "User",
      userEmail: ticket.user.email || "",
      userPlan: ticket.user.plan || "FREE",
      errorDetails: ticket.errorDetails,
      linkedScan: ticket.scan,
      linkedRemoval: ticket.removalRequest
        ? {
            status: ticket.removalRequest.status,
            attempts: ticket.removalRequest.attempts,
            brokerName: ticket.removalRequest.exposure?.sourceName,
          }
        : null,
      previousComments: ticket.comments
        .filter((c) => !c.isInternal)
        .map((c) => ({
          content: c.content,
          isFromUser: c.author.role === "USER",
          createdAt: c.createdAt,
        })),
      newComment: commentContent,
    };

    // Get AI analysis
    const analysis = await analyzeTicket(context);

    // Log analysis
    await prisma.ticketComment.create({
      data: {
        ticketId: ticket.id,
        authorId: ticket.userId,
        content: `[AI AGENT ANALYSIS - User Comment]\n${analysis.internalNote}`,
        isInternal: true,
      },
    });

    // Update ticket status if it was waiting for user
    if (ticket.status === "WAITING_USER") {
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: {
          status: "OPEN",
          lastActivityAt: new Date(),
        },
      });
    }

    // If AI can respond without human review
    if (!analysis.needsHumanReview && analysis.response) {
      await prisma.ticketComment.create({
        data: {
          ticketId: ticket.id,
          authorId: ticket.userId,
          content: analysis.response,
          isInternal: false,
        },
      });

      // Update ticket
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: {
          status: analysis.canAutoResolve ? "RESOLVED" : "IN_PROGRESS",
          lastActivityAt: new Date(),
          ...(analysis.canAutoResolve && {
            resolution: analysis.response,
            resolvedAt: new Date(),
          }),
        },
      });

      // Send email
      await sendTicketResponseEmail(
        ticket.user.email!,
        ticket.user.name!,
        ticket.ticketNumber,
        analysis.response
      );

      return {
        success: true,
        responded: true,
        message: analysis.canAutoResolve ? "Comment processed and ticket resolved" : "AI response sent",
      };
    }

    // Save draft for human review
    if (analysis.response) {
      await prisma.ticketComment.create({
        data: {
          ticketId: ticket.id,
          authorId: ticket.userId,
          content: `[AI DRAFT RESPONSE]\n${analysis.response}`,
          isInternal: true,
        },
      });
    }

    return {
      success: true,
      responded: false,
      message: "Comment analyzed, requires human review",
    };
  } catch (error) {
    console.error("Error processing comment:", error);
    return {
      success: false,
      responded: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send email notification for ticket response
 */
async function sendTicketResponseEmail(
  email: string,
  name: string,
  ticketNumber: string,
  response: string
): Promise<void> {
  try {
    // Import email function dynamically to avoid circular deps
    const { sendTicketStatusUpdateEmail } = await import("@/lib/email");
    await sendTicketStatusUpdateEmail(email, name, {
      ticketNumber,
      status: "RESOLVED",
      comment: response,
    } as any);
  } catch (error) {
    console.error("Failed to send ticket response email:", error);
  }
}

/**
 * Get agent statistics
 */
export async function getAgentStats(): Promise<{
  totalProcessed: number;
  autoResolved: number;
  pendingReview: number;
  averageResponseTime: number;
}> {
  // Count tickets with AI analysis comments
  const aiComments = await prisma.ticketComment.count({
    where: {
      content: {
        startsWith: "[AI AGENT",
      },
      isInternal: true,
    },
  });

  const autoResolved = await prisma.supportTicket.count({
    where: {
      resolution: {
        not: null,
      },
      comments: {
        some: {
          content: {
            contains: "auto-resolved by AI",
          },
        },
      },
    },
  });

  const pendingReview = await prisma.ticketComment.count({
    where: {
      content: {
        startsWith: "[AI DRAFT RESPONSE",
      },
      isInternal: true,
    },
  });

  return {
    totalProcessed: aiComments,
    autoResolved,
    pendingReview,
    averageResponseTime: 0, // TODO: Calculate from timestamps
  };
}
