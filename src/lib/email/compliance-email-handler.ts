/**
 * Compliance Email Handler
 *
 * Handles inbound compliance emails by:
 * 1. Parsing using ComplianceAgent.parseComplianceComplaint()
 * 2. Auto-creating support tickets with proper severity
 * 3. Routing legal threats to URGENT priority
 * 4. Handling classification disputes by triggering re-evaluation
 */

import { prisma } from "@/lib/db";
import { createTicket } from "@/lib/support/ticket-service";
import { requestBlocklistAddition } from "@/lib/removers/blocklist";
import {
  getComplianceAgent,
  type ParseComplianceComplaintInput,
  type ParseComplianceComplaintResult,
  type ComplaintType,
  type ComplaintSeverity,
} from "@/lib/agents/compliance-agent";
import { createAgentContext } from "@/lib/agents/base-agent";
import { InvocationTypes } from "@/lib/agents/types";
import { nanoid } from "nanoid";
import { TicketType } from "@/lib/types";

// ============================================================================
// TYPES
// ============================================================================

export interface InboundComplianceEmail {
  messageId?: string;
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  body: string;
  bodyHtml?: string;
  receivedAt?: Date;
  headers?: Record<string, string>;
}

export interface ComplianceEmailHandlerResult {
  success: boolean;
  ticketId?: string;
  ticketNumber?: string;
  complaintId?: string;
  parsedComplaint?: ParseComplianceComplaintResult;
  actions: string[];
  errors: string[];
}

// ============================================================================
// INBOX TYPE DETECTION
// ============================================================================

type InboxType = "DPO" | "LEGAL" | "COMPLIANCE" | "SUPPORT";

const INBOX_PATTERNS: Record<InboxType, RegExp[]> = {
  DPO: [/dpo@/i, /dataprotection@/i, /data\.protection@/i],
  LEGAL: [/legal@/i, /counsel@/i, /attorney@/i],
  COMPLIANCE: [/compliance@/i, /privacy@/i, /gdpr@/i, /ccpa@/i],
  SUPPORT: [/support@/i, /help@/i, /info@/i],
};

function detectInboxType(toEmail: string): InboxType {
  for (const [type, patterns] of Object.entries(INBOX_PATTERNS)) {
    if (patterns.some((p) => p.test(toEmail))) {
      return type as InboxType;
    }
  }
  return "SUPPORT";
}

// ============================================================================
// PRIORITY MAPPING
// ============================================================================

function mapSeverityToPriority(
  severity: ComplaintSeverity,
  requiresImmediate: boolean
): "LOW" | "NORMAL" | "HIGH" | "URGENT" {
  if (requiresImmediate) return "URGENT";
  switch (severity) {
    case "CRITICAL":
      return "URGENT";
    case "HIGH":
      return "HIGH";
    case "MEDIUM":
      return "NORMAL";
    case "LOW":
      return "LOW";
    default:
      return "NORMAL";
  }
}

function mapComplaintTypeToTicketType(
  complaintType: ComplaintType
): TicketType {
  switch (complaintType) {
    case "LEGAL_THREAT":
    case "CEASE_DESIST":
      return TicketType.OTHER; // Legal issues
    case "GDPR_REQUEST":
    case "CCPA_REQUEST":
      return TicketType.OTHER; // Compliance requests
    case "CLASSIFICATION_DISPUTE":
    case "DATA_PROCESSOR_NOTICE":
    case "REMOVAL_DISPUTE":
      return TicketType.OTHER; // Classification/removal issues
    default:
      return TicketType.OTHER;
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

/**
 * Handle an inbound compliance email
 *
 * This function:
 * 1. Parses the email using ComplianceAgent
 * 2. Creates a support ticket with appropriate priority
 * 3. Handles special cases (legal threats, classification disputes)
 * 4. Returns the result for further processing
 */
export async function handleComplianceEmail(
  email: InboundComplianceEmail
): Promise<ComplianceEmailHandlerResult> {
  const actions: string[] = [];
  const errors: string[] = [];

  try {
    // Detect inbox type
    const inboxType = detectInboxType(email.to);
    actions.push(`Detected inbox type: ${inboxType}`);

    // Parse the email using ComplianceAgent
    const agent = getComplianceAgent();
    const context = createAgentContext({
      requestId: nanoid(),
      invocationType: InvocationTypes.WEBHOOK,
    });

    const input: ParseComplianceComplaintInput = {
      emailContent: email.body,
      senderEmail: email.from,
      senderName: email.fromName,
      subject: email.subject,
      receivedAt: email.receivedAt || new Date(),
      inboxType,
    };

    const parseResult = await agent.execute<ParseComplianceComplaintResult>(
      "parse-compliance-complaint",
      input,
      context
    );

    if (!parseResult.success || !parseResult.data) {
      errors.push("Failed to parse email: " + (parseResult.error?.message || "Unknown error"));
      // Create a generic ticket for manual review
      const fallbackTicket = await createFallbackTicket(email, inboxType);
      return {
        success: false,
        ticketId: fallbackTicket?.id,
        ticketNumber: fallbackTicket?.ticketNumber,
        actions,
        errors,
      };
    }

    const parsed = parseResult.data;
    actions.push(`Parsed complaint type: ${parsed.complaintType}`);
    actions.push(`Severity: ${parsed.severity}`);

    // Determine priority
    const priority = mapSeverityToPriority(parsed.severity, parsed.requiresImmediateAction);
    actions.push(`Assigned priority: ${priority}`);

    // Find or create a system user for ticket creation
    const systemUser = await prisma.user.findFirst({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
      select: { id: true },
    });

    if (!systemUser) {
      errors.push("No admin user found for ticket creation");
      return { success: false, parsedComplaint: parsed, actions, errors };
    }

    // Create support ticket
    const ticketDescription = formatTicketDescription(email, parsed);
    const ticket = await createTicket({
      userId: systemUser.id,
      type: mapComplaintTypeToTicketType(parsed.complaintType),
      subject: formatTicketSubject(parsed, email.subject),
      description: ticketDescription,
      priority,
      source: "SYSTEM",
    });

    actions.push(`Created ticket: ${ticket.ticketNumber}`);

    // Handle special cases

    // 1. Legal threats - escalate immediately
    if (parsed.complaintType === "LEGAL_THREAT" || parsed.complaintType === "CEASE_DESIST") {
      await handleLegalThreat(ticket.id, parsed, email);
      actions.push("Escalated as legal threat");
    }

    // 2. Classification disputes - trigger re-evaluation and potential blocklist addition
    if (
      parsed.complaintType === "CLASSIFICATION_DISPUTE" ||
      parsed.complaintType === "DATA_PROCESSOR_NOTICE"
    ) {
      const classificationResult = await handleClassificationDispute(
        ticket.id,
        parsed,
        email
      );
      if (classificationResult.blocklistRequested) {
        actions.push(`Blocklist addition requested: ${classificationResult.domain}`);
      }
      actions.push("Triggered classification review");
    }

    // 3. GDPR/CCPA requests - ensure compliance timeline tracking
    if (parsed.complaintType === "GDPR_REQUEST" || parsed.complaintType === "CCPA_REQUEST") {
      await handleComplianceRequest(ticket.id, parsed);
      actions.push(`Compliance request tracked (${parsed.complaintType})`);
    }

    // Update complaint record with ticket reference
    try {
      await prisma.complianceComplaint.updateMany({
        where: {
          senderEmail: email.from,
          subject: email.subject,
          createdAt: { gte: new Date(Date.now() - 60000) }, // Within last minute
        },
        data: {
          ticketId: ticket.id,
          status: "IN_PROGRESS",
        },
      });
    } catch (updateError) {
      console.warn("[ComplianceEmail] Failed to link complaint to ticket:", updateError);
    }

    return {
      success: true,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      parsedComplaint: parsed,
      actions,
      errors,
    };
  } catch (error) {
    console.error("[ComplianceEmail] Handler error:", error);
    errors.push(error instanceof Error ? error.message : "Unknown error");

    // Try to create a fallback ticket
    try {
      const fallbackTicket = await createFallbackTicket(email, detectInboxType(email.to));
      return {
        success: false,
        ticketId: fallbackTicket?.id,
        ticketNumber: fallbackTicket?.ticketNumber,
        actions,
        errors,
      };
    } catch {
      return { success: false, actions, errors };
    }
  }
}

// ============================================================================
// SPECIAL CASE HANDLERS
// ============================================================================

/**
 * Handle legal threats by adding urgent internal notes
 */
async function handleLegalThreat(
  ticketId: string,
  parsed: ParseComplianceComplaintResult,
  email: InboundComplianceEmail
): Promise<void> {
  // Add internal comment with urgency
  await prisma.ticketComment.create({
    data: {
      ticketId,
      authorId: (await getSystemUserId())!,
      content: formatLegalThreatComment(parsed),
      isInternal: true,
    },
  });

  // Update ticket to URGENT if not already
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      priority: "URGENT",
      internalNotes: JSON.stringify({
        legalThreat: true,
        threats: parsed.threats,
        deadlines: parsed.deadlines,
        legalReferences: parsed.legalReferences,
        receivedAt: email.receivedAt || new Date(),
      }),
    },
  });
}

/**
 * Handle classification disputes by triggering re-evaluation
 */
async function handleClassificationDispute(
  ticketId: string,
  parsed: ParseComplianceComplaintResult,
  email: InboundComplianceEmail
): Promise<{ blocklistRequested: boolean; domain?: string }> {
  // Extract domain from sender
  const senderDomain = email.from.split("@")[1]?.toLowerCase();
  if (!senderDomain) {
    return { blocklistRequested: false };
  }

  // Check if they're claiming to be a Data Processor
  if (parsed.classificationImplications?.claimedClassification === "DATA_PROCESSOR") {
    // Request blocklist addition for review
    const result = await requestBlocklistAddition({
      domain: senderDomain,
      companyName: parsed.sender.company || senderDomain,
      reason: `Classification dispute received. Sender claims to be a Data Processor. ${parsed.keyPoints.join(" ")}`,
      classification: "DATA_PROCESSOR",
      confidence: parsed.classificationImplications.shouldReclassify ? 0.8 : 0.6,
      source: "COMPLIANCE_COMPLAINT",
      contactInfo: {
        name: parsed.sender.name,
        email: parsed.sender.email,
        title: parsed.sender.role,
      },
      legalBasis: parsed.legalReferences.join("; ") || undefined,
      notes: `From email: "${email.subject}". Key points: ${parsed.keyPoints.join("; ")}`,
    });

    if (result.success) {
      // Add comment to ticket linking to blocklist request
      await prisma.ticketComment.create({
        data: {
          ticketId,
          authorId: (await getSystemUserId())!,
          content: `**Blocklist Addition Requested**\n\nDomain: ${senderDomain}\nTicket: ${result.ticketNumber}\n\nThe sender claims to be a Data Processor. A blocklist addition request has been created for manual review.`,
          isInternal: true,
        },
      });

      return { blocklistRequested: true, domain: senderDomain };
    }
  }

  return { blocklistRequested: false };
}

/**
 * Handle GDPR/CCPA compliance requests
 */
async function handleComplianceRequest(
  ticketId: string,
  parsed: ParseComplianceComplaintResult
): Promise<void> {
  // Calculate response deadline
  const isGDPR = parsed.complaintType === "GDPR_REQUEST";
  const deadlineDays = isGDPR ? 30 : 45; // GDPR: 30 days, CCPA: 45 days
  const deadline = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000);

  // Add internal comment with deadline tracking
  await prisma.ticketComment.create({
    data: {
      ticketId,
      authorId: (await getSystemUserId())!,
      content: `**${isGDPR ? "GDPR" : "CCPA"} Compliance Request**\n\n` +
        `**Response Deadline:** ${deadline.toISOString().split("T")[0]} (${deadlineDays} days)\n\n` +
        `**Requested Actions:**\n${parsed.requestedActions.map((a) => `- ${a}`).join("\n") || "See email content"}\n\n` +
        `**Legal References:** ${parsed.legalReferences.join(", ") || "None cited"}`,
      isInternal: true,
    },
  });

  // Update ticket with compliance metadata
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      internalNotes: JSON.stringify({
        complianceRequest: parsed.complaintType,
        deadline: deadline.toISOString(),
        requestedActions: parsed.requestedActions,
        legalReferences: parsed.legalReferences,
      }),
    },
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getSystemUserId(): Promise<string | null> {
  try {
    const user = await prisma.user.findFirst({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
      select: { id: true },
    });
    return user?.id || null;
  } catch {
    return null;
  }
}

async function createFallbackTicket(
  email: InboundComplianceEmail,
  inboxType: InboxType
): Promise<{ id: string; ticketNumber: string } | null> {
  try {
    const systemUserId = await getSystemUserId();
    if (!systemUserId) return null;

    return await createTicket({
      userId: systemUserId,
      type: "OTHER",
      subject: `[COMPLIANCE] ${email.subject}`,
      description: `**Automated parsing failed - requires manual review**\n\n` +
        `**From:** ${email.fromName ? `${email.fromName} <${email.from}>` : email.from}\n` +
        `**To:** ${email.to}\n` +
        `**Inbox Type:** ${inboxType}\n\n` +
        `---\n\n${email.body.slice(0, 5000)}`,
      priority: "NORMAL",
      source: "SYSTEM",
    });
  } catch {
    return null;
  }
}

function formatTicketSubject(
  parsed: ParseComplianceComplaintResult,
  originalSubject: string
): string {
  const typePrefix: Record<ComplaintType, string> = {
    LEGAL_THREAT: "[LEGAL THREAT]",
    CEASE_DESIST: "[CEASE & DESIST]",
    CLASSIFICATION_DISPUTE: "[CLASSIFICATION]",
    GDPR_REQUEST: "[GDPR]",
    CCPA_REQUEST: "[CCPA]",
    DATA_PROCESSOR_NOTICE: "[DATA PROCESSOR]",
    OPT_OUT_CONFIRMATION: "[OPT-OUT CONFIRM]",
    REMOVAL_DISPUTE: "[REMOVAL DISPUTE]",
    GENERAL_INQUIRY: "[INQUIRY]",
    OTHER: "[COMPLIANCE]",
  };

  const prefix = typePrefix[parsed.complaintType] || "[COMPLIANCE]";
  const truncatedSubject = originalSubject.length > 80
    ? originalSubject.slice(0, 77) + "..."
    : originalSubject;

  return `${prefix} ${truncatedSubject}`;
}

function formatTicketDescription(
  email: InboundComplianceEmail,
  parsed: ParseComplianceComplaintResult
): string {
  const lines: string[] = [
    `## Inbound Compliance Email`,
    ``,
    `**From:** ${email.fromName ? `${email.fromName} <${email.from}>` : email.from}`,
    `**Subject:** ${email.subject}`,
    `**Received:** ${(email.receivedAt || new Date()).toISOString()}`,
    ``,
    `---`,
    ``,
    `### Analysis`,
    ``,
    `**Type:** ${parsed.complaintType}`,
    `**Severity:** ${parsed.severity}`,
    `**Requires Immediate Action:** ${parsed.requiresImmediateAction ? "YES" : "No"}`,
    ``,
  ];

  if (parsed.keyPoints.length > 0) {
    lines.push(`### Key Points`);
    lines.push(``);
    parsed.keyPoints.forEach((point) => lines.push(`- ${point}`));
    lines.push(``);
  }

  if (parsed.requestedActions.length > 0) {
    lines.push(`### Requested Actions`);
    lines.push(``);
    parsed.requestedActions.forEach((action) => lines.push(`- ${action}`));
    lines.push(``);
  }

  if (parsed.threats.length > 0) {
    lines.push(`### Threats Made`);
    lines.push(``);
    parsed.threats.forEach((threat) => lines.push(`- ${threat}`));
    lines.push(``);
  }

  if (parsed.deadlines.length > 0) {
    lines.push(`### Deadlines`);
    lines.push(``);
    parsed.deadlines.forEach((d) =>
      lines.push(`- ${d.description}${d.isUrgent ? " (URGENT)" : ""}`)
    );
    lines.push(``);
  }

  if (parsed.legalReferences.length > 0) {
    lines.push(`### Legal References`);
    lines.push(``);
    lines.push(parsed.legalReferences.join(", "));
    lines.push(``);
  }

  if (parsed.suggestedResponse) {
    lines.push(`### Suggested Response`);
    lines.push(``);
    lines.push(parsed.suggestedResponse);
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(``);
  lines.push(`### Original Email Content`);
  lines.push(``);
  lines.push("```");
  lines.push(email.body.slice(0, 5000));
  if (email.body.length > 5000) {
    lines.push(`\n... [truncated - ${email.body.length - 5000} more characters]`);
  }
  lines.push("```");

  return lines.join("\n");
}

function formatLegalThreatComment(parsed: ParseComplianceComplaintResult): string {
  const lines: string[] = [
    `**LEGAL THREAT DETECTED**`,
    ``,
    `This email contains legal threats that require immediate attention.`,
    ``,
  ];

  if (parsed.threats.length > 0) {
    lines.push(`**Threats:**`);
    parsed.threats.forEach((t) => lines.push(`- ${t}`));
    lines.push(``);
  }

  if (parsed.deadlines.length > 0) {
    lines.push(`**Deadlines:**`);
    parsed.deadlines.forEach((d) =>
      lines.push(`- ${d.description}${d.isUrgent ? " **(URGENT)**" : ""}`)
    );
    lines.push(``);
  }

  if (parsed.legalReferences.length > 0) {
    lines.push(`**Legal References Cited:**`);
    lines.push(parsed.legalReferences.join(", "));
    lines.push(``);
  }

  lines.push(`**Recommended Actions:**`);
  lines.push(`1. Escalate to legal counsel immediately`);
  lines.push(`2. Do not respond without legal review`);
  lines.push(`3. Preserve all related communications`);
  lines.push(`4. Document timeline of events`);

  return lines.join("\n");
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

/**
 * Process multiple compliance emails in batch
 * Useful for processing emails from a queue or webhook endpoint
 */
export async function processComplianceEmailBatch(
  emails: InboundComplianceEmail[]
): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: ComplianceEmailHandlerResult[];
}> {
  const results: ComplianceEmailHandlerResult[] = [];
  let successful = 0;
  let failed = 0;

  for (const email of emails) {
    try {
      const result = await handleComplianceEmail(email);
      results.push(result);
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
      results.push({
        success: false,
        actions: [],
        errors: [error instanceof Error ? error.message : "Unknown error"],
      });
    }

    // Small delay between processing to avoid overwhelming the system
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(
    `[ComplianceEmail] Batch complete: ${successful}/${emails.length} successful, ${failed} failed`
  );

  return {
    total: emails.length,
    successful,
    failed,
    results,
  };
}
