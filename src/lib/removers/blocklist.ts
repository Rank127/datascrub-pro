/**
 * Blocklist - Companies that should NOT receive automated deletion requests
 *
 * This file documents organizations that have been explicitly excluded from
 * our data broker directory because they are Data Processors (not Data Brokers)
 * or for other legal/compliance reasons.
 *
 * DATA PROCESSOR vs DATA BROKER:
 * - Data Broker: Independently collects, sells, or trades personal data
 * - Data Processor: Only processes data on behalf of a Data Controller (client)
 *
 * Per GDPR Articles 28 and 29, Data Processors may only process personal data
 * on documented instructions from their clients. Article 17 (Right to Erasure)
 * places the obligation to assess and fulfill erasure requests solely on the
 * Data Controller, not the Processor.
 *
 * Sending deletion requests to Data Processors:
 * 1. Cannot be actioned (they need Controller authorization)
 * 2. May actually increase data exposure (adding data to systems where it didn't exist)
 * 3. Bypasses the proper legal channel (the Data Controller)
 */

import { prisma } from "@/lib/db";
import { createTicket } from "@/lib/support/ticket-service";

export interface BlocklistedCompany {
  name: string;
  domains: string[];
  reason: string;
  dateAdded: string;
  contactedBy?: string;
  notes?: string;
}

/**
 * Companies that must NOT receive automated deletion/opt-out requests
 */
export const BLOCKLISTED_COMPANIES: BlocklistedCompany[] = [
  {
    name: "Syndigo",
    domains: ["syndigo.com"],
    reason: "Data Processor, not Data Broker. Acts on behalf of retail clients per GDPR Articles 28/29.",
    dateAdded: "2026-02-03",
    contactedBy: "Sean Milford, Head of Global Data Privacy",
    notes: "Parent company of PowerReviews and 1WorldSync. Requested removal on 2026-02-03.",
  },
  {
    name: "PowerReviews",
    domains: ["powerreviews.com"],
    reason: "Data Processor (Syndigo subsidiary). Processes review data on behalf of retailer clients.",
    dateAdded: "2026-02-03",
    contactedBy: "Sean Milford, Head of Global Data Privacy (Syndigo)",
    notes: "Acquired by Syndigo. Only processes data for retail clients who are the Data Controllers.",
  },
  {
    name: "1WorldSync",
    domains: ["1worldsync.com"],
    reason: "Data Processor (Syndigo affiliate). Product content syndication platform.",
    dateAdded: "2026-02-03",
    contactedBy: "Sean Milford, Head of Global Data Privacy (Syndigo)",
    notes: "Syndigo affiliate. Processes product data on behalf of brand/retailer clients.",
  },
];

/**
 * Blocklisted email domains - never send automated emails to these
 */
export const BLOCKLISTED_EMAIL_DOMAINS: string[] = [
  "syndigo.com",
  "powerreviews.com",
  "1worldsync.com",
];

/**
 * Check if a domain is blocklisted
 */
export function isDomainBlocklisted(domain: string): boolean {
  const normalizedDomain = domain.toLowerCase().trim();
  return BLOCKLISTED_EMAIL_DOMAINS.some(
    (blocked) => normalizedDomain === blocked || normalizedDomain.endsWith(`.${blocked}`)
  );
}

/**
 * Check if an email address is blocklisted
 */
export function isEmailBlocklisted(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return false;
  return isDomainBlocklisted(domain);
}

/**
 * Get blocklist entry for a company by domain
 */
export function getBlocklistEntry(domain: string): BlocklistedCompany | undefined {
  const normalizedDomain = domain.toLowerCase().trim();
  return BLOCKLISTED_COMPANIES.find((company) =>
    company.domains.some(
      (d) => normalizedDomain === d || normalizedDomain.endsWith(`.${d}`)
    )
  );
}

// ============================================================================
// BLOCKLIST ADDITION WORKFLOW
// ============================================================================

/**
 * Request parameters for adding a domain to the blocklist
 */
export interface BlocklistAdditionRequest {
  domain: string;
  companyName: string;
  reason: string;
  classification: "DATA_PROCESSOR" | "OTHER";
  confidence: number;
  source: "COMPLIANCE_COMPLAINT" | "AGENT_CLASSIFICATION" | "MANUAL_REVIEW" | "LEGAL_NOTICE";
  contactInfo?: {
    name?: string;
    email?: string;
    title?: string;
  };
  legalBasis?: string;
  notes?: string;
  requestedBy?: string; // User ID of requester
  relatedComplaintId?: string; // If triggered by a complaint
  relatedClassificationId?: string; // If triggered by classification
}

/**
 * Result of a blocklist addition request
 */
export interface BlocklistAdditionResult {
  success: boolean;
  ticketId?: string;
  ticketNumber?: string;
  auditLogId?: string;
  message: string;
  autoApproved: boolean;
}

/**
 * Request to add a domain to the blocklist.
 *
 * This function creates a support ticket for manual review rather than
 * automatically modifying the blocklist. This ensures human oversight
 * for compliance-sensitive decisions.
 *
 * Auto-approval thresholds:
 * - ≥0.9 confidence from trusted sources may be auto-approved (future)
 * - Currently all requests require manual review
 *
 * @param request - The blocklist addition request details
 * @returns Result with ticket information for tracking
 */
export async function requestBlocklistAddition(
  request: BlocklistAdditionRequest
): Promise<BlocklistAdditionResult> {
  const normalizedDomain = request.domain.toLowerCase().trim();

  try {
    // Check if domain is already blocklisted
    const existingEntry = getBlocklistEntry(normalizedDomain);
    if (existingEntry) {
      return {
        success: true,
        message: `Domain ${normalizedDomain} is already blocklisted (${existingEntry.name})`,
        autoApproved: false,
      };
    }

    // Determine priority based on confidence and source
    let priority: "LOW" | "NORMAL" | "HIGH" | "URGENT" = "NORMAL";
    if (request.source === "LEGAL_NOTICE" || request.source === "COMPLIANCE_COMPLAINT") {
      priority = "HIGH";
    }
    if (request.confidence >= 0.95) {
      priority = "HIGH";
    }

    // Create support ticket for review
    const ticketDescription = formatBlocklistTicketDescription(request);

    // Find a system user ID for the ticket
    let systemUserId: string;
    try {
      const systemUser = await prisma.user.findFirst({
        where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
        select: { id: true },
      });
      systemUserId = systemUser?.id || request.requestedBy || "system";
    } catch {
      systemUserId = request.requestedBy || "system";
    }

    const ticket = await createTicket({
      userId: systemUserId,
      type: "OTHER",
      subject: `[BLOCKLIST REQUEST] Add ${request.companyName} (${normalizedDomain})`,
      description: ticketDescription,
      priority,
      source: "SYSTEM",
    });

    // Log to audit trail
    let auditLogId: string | undefined;
    try {
      const auditLog = await prisma.blocklistAuditLog.create({
        data: {
          domain: normalizedDomain,
          companyName: request.companyName,
          action: "ADD",
          reason: request.reason,
          newValue: JSON.stringify({
            domain: normalizedDomain,
            companyName: request.companyName,
            classification: request.classification,
            confidence: request.confidence,
            source: request.source,
            legalBasis: request.legalBasis,
            contactInfo: request.contactInfo,
          }),
          actorType: request.requestedBy ? "USER" : "AGENT",
          actorId: request.requestedBy,
          complaintId: request.relatedComplaintId,
          classificationId: request.relatedClassificationId,
          ticketId: ticket.id,
          notes: request.notes,
        },
      });
      auditLogId = auditLog.id;
    } catch (error) {
      console.warn("[Blocklist] Failed to create audit log:", error);
    }

    console.log(`[Blocklist] Created addition request for ${normalizedDomain} - Ticket: ${ticket.ticketNumber}`);

    return {
      success: true,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      auditLogId,
      message: `Blocklist addition request created for ${request.companyName}. Ticket: ${ticket.ticketNumber}`,
      autoApproved: false,
    };
  } catch (error) {
    console.error(`[Blocklist] Error requesting addition for ${normalizedDomain}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create blocklist request",
      autoApproved: false,
    };
  }
}

/**
 * Format the ticket description for a blocklist addition request
 */
function formatBlocklistTicketDescription(request: BlocklistAdditionRequest): string {
  const lines: string[] = [
    `## Blocklist Addition Request`,
    ``,
    `**Domain:** ${request.domain}`,
    `**Company:** ${request.companyName}`,
    `**Classification:** ${request.classification}`,
    `**Confidence:** ${(request.confidence * 100).toFixed(1)}%`,
    `**Source:** ${request.source}`,
    ``,
    `### Reason`,
    request.reason,
    ``,
  ];

  if (request.legalBasis) {
    lines.push(`### Legal Basis`);
    lines.push(request.legalBasis);
    lines.push(``);
  }

  if (request.contactInfo) {
    lines.push(`### Contact Information`);
    if (request.contactInfo.name) lines.push(`- **Name:** ${request.contactInfo.name}`);
    if (request.contactInfo.title) lines.push(`- **Title:** ${request.contactInfo.title}`);
    if (request.contactInfo.email) lines.push(`- **Email:** ${request.contactInfo.email}`);
    lines.push(``);
  }

  if (request.notes) {
    lines.push(`### Additional Notes`);
    lines.push(request.notes);
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(`### Action Required`);
  lines.push(`1. Review the classification and evidence`);
  lines.push(`2. Verify the company is indeed a Data Processor (not a Data Broker)`);
  lines.push(`3. If approved, manually add to \`src/lib/removers/blocklist.ts\``);
  lines.push(`4. Update the ticket with resolution`);
  lines.push(``);
  lines.push(`### Code to Add (if approved)`);
  lines.push("```typescript");
  lines.push(`{`);
  lines.push(`  name: "${request.companyName}",`);
  lines.push(`  domains: ["${request.domain}"],`);
  lines.push(`  reason: "${request.reason.replace(/"/g, '\\"')}",`);
  lines.push(`  dateAdded: "${new Date().toISOString().split("T")[0]}",`);
  if (request.contactInfo?.name) {
    lines.push(`  contactedBy: "${request.contactInfo.name}${request.contactInfo.title ? `, ${request.contactInfo.title}` : ""}",`);
  }
  if (request.notes) {
    lines.push(`  notes: "${request.notes.replace(/"/g, '\\"')}",`);
  }
  lines.push(`},`);
  lines.push("```");

  return lines.join("\n");
}

/**
 * Check if a blocklist addition should be auto-approved
 * Currently returns false - all additions require manual review
 * Future: Could auto-approve high-confidence classifications from trusted sources
 */
export function shouldAutoApproveBlocklistAddition(request: BlocklistAdditionRequest): boolean {
  // Currently all additions require manual review for compliance safety
  // Future enhancement: Could auto-approve if:
  // - confidence >= 0.95 AND
  // - source is LEGAL_NOTICE or COMPLIANCE_COMPLAINT AND
  // - has valid contact info
  return false;
}

/**
 * Get pending blocklist addition requests
 */
export async function getPendingBlocklistRequests(): Promise<Array<{
  domain: string;
  companyName: string | null;
  ticketId: string | null;
  createdAt: Date;
}>> {
  try {
    const pendingLogs = await prisma.blocklistAuditLog.findMany({
      where: {
        action: "ADD",
        // Only include if there's a ticket that's not resolved
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        domain: true,
        companyName: true,
        ticketId: true,
        createdAt: true,
      },
    });

    return pendingLogs;
  } catch {
    return [];
  }
}
