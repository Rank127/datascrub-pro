/**
 * Ticketing Agent - AI-powered ticket review and response system
 *
 * This agent automatically reviews new tickets and user comments,
 * determines appropriate actions, and responds to users.
 */

import { PrismaClient } from "@prisma/client";
import Anthropic from "@anthropic-ai/sdk";
import { getSystemUserId } from "@/lib/support/ticket-service";

const prisma = new PrismaClient();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// System prompt for the ticketing agent
const TICKETING_AGENT_PROMPT = `You are a professional customer support representative for GhostMyData, a leading privacy protection service that helps users remove their personal data from data broker websites.

Your role is to:
1. Understand the user's issue from their ticket description
2. Provide professional, courteous, and helpful responses
3. Offer solutions and reassurance
4. Protect the company's reputation at all times
5. Flag important issues for management review

Key information about GhostMyData:
- We scan data broker sites to find user's exposed personal information
- We automatically send opt-out requests to data brokers
- Plans: FREE (10 scans/month, manual guides), PRO ($19.99/mo, 40% OFF sale $11.99/mo, 50 scans, auto removals), ENTERPRISE ($49.99/mo, 40% OFF sale $29.99/mo, unlimited, family plan)
- Removals typically take 2-4 weeks to process
- Users can track removal status in their dashboard

Common issues and solutions:
1. SCAN_ERROR: "We're experiencing high demand. Our team is actively optimizing performance. Please try again shortly."
2. REMOVAL_FAILED: "Data brokers have varying response times. We're persistently working on your behalf and will continue our efforts."
3. PAYMENT_ISSUE: Direct to billing portal with helpful guidance
4. ACCOUNT_ISSUE: Offer password reset assistance via email
5. FEATURE_REQUEST: "Thank you for this valuable feedback! We're always looking to improve and your suggestion has been noted for our product team."

CRITICAL RESPONSE GUIDELINES:
- ALWAYS maintain a professional, positive, and courteous tone
- NEVER speak negatively about GhostMyData or acknowledge shortcomings directly
- NEVER say features are "missing" or "not available" - instead say "currently being enhanced" or "on our roadmap"
- NEVER blame the system or company for issues - frame as "we're working to improve" or "we appreciate your patience"
- For bugs/errors: "We're aware and our technical team is prioritizing this"
- For missing features: "This is valuable feedback that we've shared with our product team for consideration"
- For delays: "We appreciate your patience as we work diligently on your request"
- Always thank users for their patience and for choosing GhostMyData
- End responses positively with confidence in resolution
- If unsure, recommend contacting support@ghostmydata.com for personalized assistance
- Don't share technical implementation details or internal processes

Return your response as JSON with this structure:
{
  "canAutoResolve": boolean,  // true if this can be resolved without human intervention
  "response": string,         // the professional message to send to the user
  "suggestedActions": string[], // internal actions to take (e.g., "retry_scan", "escalate")
  "priority": "LOW" | "NORMAL" | "HIGH" | "URGENT", // suggested priority adjustment
  "needsHumanReview": boolean, // true if a human should review before sending
  "internalNote": string,     // note for support staff (not visible to user)
  "managerReviewItems": string[] // items that need manager attention (feature gaps, complaints, bugs, trends)
}`;

export interface TicketContext {
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
  // Intelligent context
  userHistory?: UserHistory;
  similarTickets?: SimilarTicket[];
  sentiment?: SentimentAnalysis;
}

interface UserHistory {
  accountAge: number; // days
  totalTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number; // hours
  totalScans: number;
  totalExposures: number;
  removalsCompleted: number;
  isVIP: boolean; // Enterprise or long-term customer
  lastInteraction: Date | null;
}

interface SimilarTicket {
  ticketNumber: string;
  type: string;
  subject: string;
  resolution: string | null;
  wasAutoResolved: boolean;
}

interface SentimentAnalysis {
  score: number; // -1 to 1 (negative to positive)
  urgency: "low" | "medium" | "high" | "critical";
  frustration: boolean;
  keywords: string[];
}

interface AgentResponse {
  canAutoResolve: boolean;
  response: string;
  suggestedActions: string[];
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  needsHumanReview: boolean;
  internalNote: string;
  managerReviewItems: string[]; // Items flagged for manager attention
}

// Sentiment keywords for analysis
const NEGATIVE_KEYWORDS = [
  "frustrated", "angry", "terrible", "awful", "worst", "unacceptable",
  "ridiculous", "scam", "fraud", "lawsuit", "attorney", "lawyer",
  "refund", "cancel", "disappointed", "furious", "outraged", "incompetent"
];

const URGENCY_KEYWORDS = [
  "urgent", "asap", "immediately", "emergency", "critical", "deadline",
  "today", "now", "help", "please help", "desperate"
];

/**
 * Get user history for intelligent context
 */
async function getUserHistory(userId: string): Promise<UserHistory> {
  try {
    const [user, tickets, scans, exposures, removals] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true, plan: true },
      }),
      prisma.supportTicket.findMany({
        where: { userId },
        select: { status: true, resolvedAt: true, createdAt: true },
      }),
      prisma.scan.count({ where: { userId } }),
      prisma.exposure.count({ where: { userId } }),
      prisma.removalRequest.count({
        where: { exposure: { userId }, status: "COMPLETED" },
      }),
    ]);

    const resolvedTickets = tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED");
    const ticketsWithResolution = resolvedTickets.filter((t) => t.resolvedAt);
    const avgResolutionTime = ticketsWithResolution.length > 0
      ? ticketsWithResolution.reduce((sum, t) => {
            if (!t.resolvedAt) return sum;
            const diff = t.resolvedAt.getTime() - t.createdAt.getTime();
            return sum + diff / (1000 * 60 * 60); // hours
          }, 0) / ticketsWithResolution.length
      : 0;

    const accountAge = user
      ? Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const lastTicket = tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    return {
      accountAge,
      totalTickets: tickets.length,
      resolvedTickets: resolvedTickets.length,
      averageResolutionTime: avgResolutionTime,
      totalScans: scans,
      totalExposures: exposures,
      removalsCompleted: removals,
      isVIP: user?.plan === "ENTERPRISE" || accountAge > 180, // Enterprise or 6+ months
      lastInteraction: lastTicket?.createdAt || null,
    };
  } catch (error) {
    console.error("Failed to get user history:", error);
    return {
      accountAge: 0,
      totalTickets: 0,
      resolvedTickets: 0,
      averageResolutionTime: 0,
      totalScans: 0,
      totalExposures: 0,
      removalsCompleted: 0,
      isVIP: false,
      lastInteraction: null,
    };
  }
}

/**
 * Find similar resolved tickets for context
 */
async function findSimilarTickets(type: string, subject: string): Promise<SimilarTicket[]> {
  try {
    // Find resolved tickets of same type
    const tickets = await prisma.supportTicket.findMany({
      where: {
        type,
        status: { in: ["RESOLVED", "CLOSED"] },
        resolution: { not: null },
      },
      select: {
        ticketNumber: true,
        type: true,
        subject: true,
        resolution: true,
        comments: {
          where: { content: { contains: "auto-resolved" } },
          select: { id: true },
        },
      },
      orderBy: { resolvedAt: "desc" },
      take: 5,
    });

    return tickets.map((t) => ({
      ticketNumber: t.ticketNumber,
      type: t.type,
      subject: t.subject,
      resolution: t.resolution,
      wasAutoResolved: t.comments.length > 0,
    }));
  } catch (error) {
    console.error("Failed to find similar tickets:", error);
    return [];
  }
}

/**
 * Analyze sentiment of ticket text
 */
function analyzeSentiment(text: string): SentimentAnalysis {
  const lowerText = text.toLowerCase();

  // Count negative keywords
  const negativeCount = NEGATIVE_KEYWORDS.filter((kw) => lowerText.includes(kw)).length;
  const urgencyCount = URGENCY_KEYWORDS.filter((kw) => lowerText.includes(kw)).length;

  // Check for frustration indicators
  const hasExclamation = (text.match(/!/g) || []).length > 2;
  const hasAllCaps = /[A-Z]{5,}/.test(text);
  const hasFrustration = negativeCount > 0 || hasExclamation || hasAllCaps;

  // Calculate sentiment score (-1 to 1)
  let score = 0;
  if (negativeCount > 3) score = -1;
  else if (negativeCount > 1) score = -0.5;
  else if (negativeCount === 1) score = -0.2;
  else if (lowerText.includes("thank")) score = 0.3;
  else score = 0;

  // Determine urgency
  let urgency: "low" | "medium" | "high" | "critical" = "low";
  if (urgencyCount > 2 || lowerText.includes("lawsuit") || lowerText.includes("attorney")) {
    urgency = "critical";
  } else if (urgencyCount > 0 || negativeCount > 2) {
    urgency = "high";
  } else if (negativeCount > 0 || hasExclamation) {
    urgency = "medium";
  }

  // Extract keywords found
  const keywords = [
    ...NEGATIVE_KEYWORDS.filter((kw) => lowerText.includes(kw)),
    ...URGENCY_KEYWORDS.filter((kw) => lowerText.includes(kw)),
  ];

  return { score, urgency, frustration: hasFrustration, keywords };
}

/**
 * Enrich ticket context with intelligent data
 */
async function enrichContext(context: TicketContext, userId: string): Promise<TicketContext> {
  const [userHistory, similarTickets] = await Promise.all([
    getUserHistory(userId),
    findSimilarTickets(context.type, context.subject),
  ]);

  const sentiment = analyzeSentiment(
    `${context.subject} ${context.description} ${context.newComment || ""}`
  );

  return {
    ...context,
    userHistory,
    similarTickets,
    sentiment,
  };
}

/**
 * Analyze a ticket and generate an appropriate response
 */
export async function analyzeTicket(context: TicketContext): Promise<AgentResponse> {
  // Build context message for the AI
  const contextMessage = buildContextMessage(context);

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
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
      managerReviewItems: [],
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

  // Add intelligent context if available
  if (context.userHistory) {
    const h = context.userHistory;
    message += `
USER HISTORY (IMPORTANT - adjust response accordingly):
- Account age: ${h.accountAge} days
- VIP status: ${h.isVIP ? "YES - prioritize this user" : "No"}
- Previous tickets: ${h.totalTickets} (${h.resolvedTickets} resolved)
- Avg resolution time: ${h.averageResolutionTime.toFixed(1)} hours
- Total scans: ${h.totalScans}
- Exposures found: ${h.totalExposures}
- Removals completed: ${h.removalsCompleted}
`;
    if (h.isVIP) {
      message += `NOTE: This is a VIP customer. Provide premium support with extra care and urgency.\n`;
    }
    if (h.totalTickets > 3) {
      message += `NOTE: Returning customer with multiple tickets. Reference their history positively.\n`;
    }
  }

  // Add sentiment analysis
  if (context.sentiment) {
    const s = context.sentiment;
    message += `
SENTIMENT ANALYSIS:
- Overall sentiment: ${s.score < 0 ? "Negative" : s.score > 0 ? "Positive" : "Neutral"} (${s.score.toFixed(1)})
- Urgency level: ${s.urgency.toUpperCase()}
- Frustration detected: ${s.frustration ? "YES - be extra empathetic" : "No"}
${s.keywords.length > 0 ? `- Keywords detected: ${s.keywords.join(", ")}` : ""}
`;
    if (s.frustration) {
      message += `IMPORTANT: User appears frustrated. Lead with empathy, acknowledge their concern, and assure prompt resolution.\n`;
    }
    if (s.urgency === "critical") {
      message += `CRITICAL: This may need immediate human escalation. Flag for manager review.\n`;
    }
  }

  // Add similar resolved tickets for reference
  if (context.similarTickets && context.similarTickets.length > 0) {
    message += `
SIMILAR RESOLVED TICKETS (use as reference for consistent responses):
`;
    context.similarTickets.slice(0, 3).forEach((t, i) => {
      message += `${i + 1}. ${t.ticketNumber}: ${t.subject}
   Resolution: ${t.resolution?.substring(0, 200)}...
   Auto-resolved: ${t.wasAutoResolved ? "Yes" : "No"}
`;
    });
  }

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

  message += `\nPlease analyze and respond with JSON as specified. Consider user history, sentiment, and similar tickets when formulating your response.`;

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

    // Fetch linked scan and removal request separately if IDs exist
    let linkedScan = null;
    let linkedRemoval = null;

    if (ticket?.scanId) {
      const scan = await prisma.scan.findUnique({
        where: { id: ticket.scanId },
        select: { status: true },
      });
      if (scan) {
        linkedScan = { status: scan.status, error: null };
      }
    }

    if (ticket?.removalRequestId) {
      const removal = await prisma.removalRequest.findUnique({
        where: { id: ticket.removalRequestId },
        include: {
          exposure: {
            select: { sourceName: true },
          },
        },
      });
      if (removal) {
        linkedRemoval = {
          status: removal.status,
          attempts: removal.attempts,
          brokerName: removal.exposure?.sourceName,
        };
      }
    }

    if (!ticket) {
      return { success: false, autoResolved: false, message: "Ticket not found" };
    }

    // Build base context for AI
    const baseContext: TicketContext = {
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
      linkedScan,
      linkedRemoval,
      previousComments: ticket.comments.map((c) => ({
        content: c.content,
        isFromUser: c.author.role === "USER",
        createdAt: c.createdAt,
      })),
    };

    // Enrich context with intelligent data (user history, similar tickets, sentiment)
    const context = await enrichContext(baseContext, ticket.userId);

    // Get AI analysis with full context
    const analysis = await analyzeTicket(context);

    // Build internal note with manager review items
    let internalContent = `[AI AGENT ANALYSIS]\n${analysis.internalNote}\nSuggested actions: ${analysis.suggestedActions.join(", ")}`;

    if (analysis.managerReviewItems && analysis.managerReviewItems.length > 0) {
      internalContent += `\n\n[MANAGER REVIEW REQUIRED]\n${analysis.managerReviewItems.map((item, i) => `${i + 1}. ${item}`).join("\n")}`;
    }

    // Log the analysis as internal note
    await prisma.ticketComment.create({
      data: {
        ticketId: ticket.id,
        authorId: ticket.userId, // System comment attributed to system
        content: internalContent,
        isInternal: true,
      },
    });

    // If there are manager review items, flag for manager attention
    if (analysis.managerReviewItems && analysis.managerReviewItems.length > 0) {
      await logManagerReviewItems(ticket.id, ticket.ticketNumber, analysis.managerReviewItems);
    }

    // Update priority if suggested
    if (analysis.priority !== ticket.priority) {
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { priority: analysis.priority },
      });
    }

    // If can auto-resolve and no human review needed, send response
    if (analysis.canAutoResolve && !analysis.needsHumanReview && analysis.response) {
      // Add the response as a system comment (not as the ticket owner)
      const systemId = await getSystemUserId(ticket.userId);
      await prisma.ticketComment.create({
        data: {
          ticketId: ticket.id,
          authorId: systemId,
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

    // Fetch linked scan and removal request separately if IDs exist
    let linkedScan2 = null;
    let linkedRemoval2 = null;

    if (ticket.scanId) {
      const scan = await prisma.scan.findUnique({
        where: { id: ticket.scanId },
        select: { status: true },
      });
      if (scan) {
        linkedScan2 = { status: scan.status, error: null };
      }
    }

    if (ticket.removalRequestId) {
      const removal = await prisma.removalRequest.findUnique({
        where: { id: ticket.removalRequestId },
        include: {
          exposure: {
            select: { sourceName: true },
          },
        },
      });
      if (removal) {
        linkedRemoval2 = {
          status: removal.status,
          attempts: removal.attempts,
          brokerName: removal.exposure?.sourceName,
        };
      }
    }

    // Build base context with new comment
    const baseContext: TicketContext = {
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
      linkedScan: linkedScan2,
      linkedRemoval: linkedRemoval2,
      previousComments: ticket.comments
        .filter((c) => !c.isInternal)
        .map((c) => ({
          content: c.content,
          isFromUser: c.author.role === "USER",
          createdAt: c.createdAt,
        })),
      newComment: commentContent,
    };

    // Enrich context with intelligent data (user history, similar tickets, sentiment)
    const context = await enrichContext(baseContext, ticket.userId);

    // Get AI analysis with full context
    const analysis = await analyzeTicket(context);

    // Build internal note with manager review items
    let commentAnalysisContent = `[AI AGENT ANALYSIS - User Comment]\n${analysis.internalNote}`;

    if (analysis.managerReviewItems && analysis.managerReviewItems.length > 0) {
      commentAnalysisContent += `\n\n[MANAGER REVIEW REQUIRED]\n${analysis.managerReviewItems.map((item, i) => `${i + 1}. ${item}`).join("\n")}`;
    }

    // Log analysis
    await prisma.ticketComment.create({
      data: {
        ticketId: ticket.id,
        authorId: ticket.userId,
        content: commentAnalysisContent,
        isInternal: true,
      },
    });

    // If there are manager review items, flag for manager attention
    if (analysis.managerReviewItems && analysis.managerReviewItems.length > 0) {
      await logManagerReviewItems(ticket.id, ticket.ticketNumber, analysis.managerReviewItems);
    }

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
      subject: "Support Request",
      status: "RESOLVED",
      comment: response,
    });
  } catch (error) {
    console.error("Failed to send ticket response email:", error);
  }
}

/**
 * Log items that need manager review
 * Creates a record in the database for managers to review
 */
async function logManagerReviewItems(
  ticketId: string,
  ticketNumber: string,
  items: string[]
): Promise<void> {
  try {
    // Create a manager review record
    // This could be a separate table, but for now we'll use a high-visibility internal comment
    // and also send an email notification to admins

    const reviewContent = `[MANAGER REVIEW QUEUE]
Ticket: ${ticketNumber}
Date: ${new Date().toISOString()}

Items requiring attention:
${items.map((item, i) => `${i + 1}. ${item}`).join("\n")}

Please review and take appropriate action.`;

    // Add to a manager review queue comment
    await prisma.ticketComment.create({
      data: {
        ticketId,
        authorId: (await prisma.user.findFirst({ where: { role: "ADMIN" } }))?.id || ticketId,
        content: reviewContent,
        isInternal: true,
      },
    });

    // Send email to admins (non-blocking)
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
      if (adminEmails.length > 0) {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "noreply@ghostmydata.com",
          to: adminEmails,
          subject: `[Manager Review] Ticket ${ticketNumber} - Action Required`,
          html: `
            <h2>Manager Review Required</h2>
            <p><strong>Ticket:</strong> ${ticketNumber}</p>
            <h3>Items Requiring Attention:</h3>
            <ul>
              ${items.map((item) => `<li>${item}</li>`).join("")}
            </ul>
            <p>Please review the ticket in the admin dashboard.</p>
          `,
        });
      }
    } catch (emailError) {
      console.error("Failed to send manager review email:", emailError);
    }

    console.log(`[Ticketing Agent] Manager review items logged for ticket ${ticketNumber}:`, items);
  } catch (error) {
    console.error("Failed to log manager review items:", error);
  }
}

/**
 * Get manager review items for dashboard
 */
export async function getManagerReviewItems(): Promise<
  Array<{
    ticketId: string;
    ticketNumber: string;
    items: string[];
    createdAt: Date;
  }>
> {
  const comments = await prisma.ticketComment.findMany({
    where: {
      content: {
        startsWith: "[MANAGER REVIEW QUEUE]",
      },
      isInternal: true,
    },
    include: {
      ticket: {
        select: {
          id: true,
          ticketNumber: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return comments.map((c) => {
    // Parse items from the comment content
    const itemsMatch = c.content.match(/Items requiring attention:\n([\s\S]*?)(?:\n\nPlease|$)/);
    const itemsText = itemsMatch ? itemsMatch[1] : "";
    const items = itemsText
      .split("\n")
      .filter((line) => line.match(/^\d+\./))
      .map((line) => line.replace(/^\d+\.\s*/, "").trim());

    return {
      ticketId: c.ticket.id,
      ticketNumber: c.ticket.ticketNumber,
      items,
      createdAt: c.createdAt,
    };
  });
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
