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
  // ============================================================================
  // DIRECT RELATIONSHIP PLATFORMS (NOT DATA BROKERS)
  // Per Cal. Civ. Code § 1798.99.80(d) and similar state laws, a "data broker"
  // is a business that collects and sells personal info of consumers with whom
  // the business does NOT have a direct relationship.
  // These platforms have direct user relationships - users create accounts and
  // provide their own data voluntarily.
  // ============================================================================
  {
    name: "ZipRecruiter",
    domains: ["ziprecruiter.com"],
    reason: "NOT a data broker - direct user relationship. Users create accounts and provide their own data. Per Cal. Civ. Code § 1798.99.80(d).",
    dateAdded: "2026-02-06",
    contactedBy: "Crystal Skelton, VP Corporate Counsel",
    notes: "Received C&D letter on 2026-02-06. Users delete accounts directly via settings or privacy@ziprecruiter.com.",
  },
  {
    name: "Indeed",
    domains: ["indeed.com"],
    reason: "NOT a data broker - direct user relationship. Users create accounts and provide their own job search data.",
    dateAdded: "2026-02-06",
    notes: "Job search platform. Users delete accounts directly via settings.",
  },
  {
    name: "LinkedIn",
    domains: ["linkedin.com"],
    reason: "NOT a data broker - direct user relationship. Users create accounts and manage their own professional profiles.",
    dateAdded: "2026-02-06",
    notes: "Professional networking platform. Users delete accounts directly via settings.",
  },
  {
    name: "TheLadders",
    domains: ["theladders.com"],
    reason: "NOT a data broker - direct user relationship. Users create accounts for job searching.",
    dateAdded: "2026-02-06",
    notes: "Job search platform. Users delete accounts directly via settings.",
  },
  {
    name: "Glassdoor",
    domains: ["glassdoor.com"],
    reason: "NOT a data broker - direct user relationship. Users create accounts for job searching and company reviews.",
    dateAdded: "2026-02-06",
    notes: "Job search and company review platform. Users delete accounts directly via settings.",
  },
  {
    name: "AngelList / Wellfound",
    domains: ["angel.co", "wellfound.com"],
    reason: "NOT a data broker - direct user relationship. Users create accounts for startup jobs and investing.",
    dateAdded: "2026-02-06",
    notes: "Startup job platform. Wellfound is rebranded AngelList Talent. Users delete accounts directly.",
  },
  {
    name: "Greenhouse",
    domains: ["greenhouse.io"],
    reason: "NOT a data broker - ATS platform where users apply for jobs directly. Direct relationship through job applications.",
    dateAdded: "2026-02-06",
    notes: "Applicant Tracking System. Users apply through employer career pages. Delete via employer or privacy@greenhouse.io.",
  },
  {
    name: "Lever",
    domains: ["lever.co"],
    reason: "NOT a data broker - ATS platform where users apply for jobs directly. Direct relationship through job applications.",
    dateAdded: "2026-02-06",
    notes: "Applicant Tracking System. Users apply through employer career pages. Delete via employer or privacy@lever.co.",
  },
  {
    name: "SmartRecruiters",
    domains: ["smartrecruiters.com"],
    reason: "NOT a data broker - ATS platform where users apply for jobs directly. Direct relationship through job applications.",
    dateAdded: "2026-02-06",
    notes: "Applicant Tracking System. Users apply through employer career pages.",
  },
  {
    name: "Jobvite",
    domains: ["jobvite.com"],
    reason: "NOT a data broker - ATS platform where users apply for jobs directly. Direct relationship through job applications.",
    dateAdded: "2026-02-06",
    notes: "Applicant Tracking System. Users apply through employer career pages.",
  },
  {
    name: "Workday",
    domains: ["workday.com"],
    reason: "NOT a data broker - HR/ATS platform where users apply for jobs directly. Direct relationship through job applications.",
    dateAdded: "2026-02-06",
    notes: "HR and Applicant Tracking System. Users apply through employer career pages.",
  },

  // ============================================================================
  // SERVICE PLATFORMS (DIRECT RELATIONSHIP - NOT DATA BROKERS)
  // Users create accounts and provide their own data voluntarily.
  // ============================================================================
  {
    name: "Muck Rack",
    domains: ["muckrack.com"],
    reason: "NOT a data broker - PR/journalism platform. Journalists create profiles; PR pros subscribe. Direct user relationships.",
    dateAdded: "2026-02-06",
    notes: "Media database for PR professionals. Journalists opt-in to be discoverable. Users delete accounts via settings.",
  },
  {
    name: "RateMyProfessors",
    domains: ["ratemyprofessors.com"],
    reason: "NOT a data broker - Review platform with direct user relationships. Users submit their own reviews.",
    dateAdded: "2026-02-06",
    notes: "Professor review site. Reviews are user-generated content. Professors can claim profiles.",
  },
  {
    name: "Apartments.com",
    domains: ["apartments.com"],
    reason: "NOT a data broker - Rental listing platform. Users search and contact landlords directly.",
    dateAdded: "2026-02-06",
    notes: "Owned by CoStar Group. Users create accounts to save searches. Landlords list properties directly.",
  },
  {
    name: "Zumper",
    domains: ["zumper.com"],
    reason: "NOT a data broker - Rental listing platform. Users search and apply for rentals directly.",
    dateAdded: "2026-02-06",
    notes: "Rental platform. Users create accounts to apply for apartments. Direct landlord-tenant matching.",
  },
  {
    name: "TheKnot",
    domains: ["theknot.com"],
    reason: "NOT a data broker - Wedding planning platform. Couples create accounts and share their own wedding details.",
    dateAdded: "2026-02-06",
    notes: "Wedding planning site. Couples voluntarily share wedding info. Users delete accounts via settings.",
  },
  {
    name: "WeddingWire",
    domains: ["weddingwire.com"],
    reason: "NOT a data broker - Wedding planning platform. Couples create accounts and share their own wedding details.",
    dateAdded: "2026-02-06",
    notes: "Wedding planning site (owned by The Knot Worldwide). Couples voluntarily share info.",
  },
  {
    name: "Zola",
    domains: ["zola.com"],
    reason: "NOT a data broker - Wedding registry and planning platform. Couples create accounts and registries.",
    dateAdded: "2026-02-06",
    notes: "Wedding registry platform. Couples voluntarily create registries and share with guests.",
  },

  // ============================================================================
  // REAL ESTATE BROKERAGES & iBUYERS (DIRECT RELATIONSHIP - NOT DATA BROKERS)
  // Users hire agents, sell/buy homes directly. Per Cal. Civ. Code § 1798.99.80(d).
  // ============================================================================
  {
    name: "RE/MAX",
    domains: ["remax.com", "remax.net"],
    reason: "NOT a data broker - real estate brokerage with direct client relationships. Users hire agents directly.",
    dateAdded: "2026-02-13",
    notes: "Real estate franchise. Clients engage agents directly for buying/selling homes.",
  },
  {
    name: "Century 21",
    domains: ["century21.com"],
    reason: "NOT a data broker - real estate brokerage with direct client relationships. Users hire agents directly.",
    dateAdded: "2026-02-13",
    notes: "Real estate franchise. Clients engage agents directly for buying/selling homes.",
  },
  {
    name: "Coldwell Banker",
    domains: ["coldwellbanker.com"],
    reason: "NOT a data broker - real estate brokerage with direct client relationships. Users hire agents directly.",
    dateAdded: "2026-02-13",
    notes: "Real estate franchise. Clients engage agents directly for buying/selling homes.",
  },
  {
    name: "Keller Williams",
    domains: ["kw.com"],
    reason: "NOT a data broker - real estate brokerage with direct client relationships. Users hire agents directly.",
    dateAdded: "2026-02-13",
    notes: "Real estate franchise. Clients engage agents directly for buying/selling homes.",
  },
  {
    name: "Compass Real Estate",
    domains: ["compass.com"],
    reason: "NOT a data broker - real estate brokerage with direct client relationships. Users hire agents directly.",
    dateAdded: "2026-02-13",
    notes: "Real estate brokerage. Clients engage agents directly for buying/selling homes.",
  },
  {
    name: "Opendoor",
    domains: ["opendoor.com"],
    reason: "NOT a data broker - iBuyer platform with direct seller relationships. Users sell homes directly to Opendoor.",
    dateAdded: "2026-02-13",
    notes: "iBuyer platform. Sellers interact directly with Opendoor to sell their homes.",
  },
  {
    name: "Offerpad",
    domains: ["offerpad.com"],
    reason: "NOT a data broker - iBuyer platform with direct seller relationships. Users sell homes directly to Offerpad.",
    dateAdded: "2026-02-13",
    notes: "iBuyer platform. Sellers interact directly with Offerpad to sell their homes.",
  },
  {
    name: "HomeLight",
    domains: ["homelight.com"],
    reason: "NOT a data broker - real estate referral platform with direct user relationships. Users request agent matches.",
    dateAdded: "2026-02-13",
    notes: "Agent matching platform. Users create accounts and request agent recommendations.",
  },

  // ============================================================================
  // GENEALOGY & HEALTHCARE PLATFORMS (DIRECT RELATIONSHIP - NOT DATA BROKERS)
  // Users create accounts, upload personal data, and interact directly.
  // ============================================================================
  {
    name: "Ancestry",
    domains: ["ancestry.com"],
    reason: "NOT a data broker - genealogy platform with direct user relationships. Users create accounts, upload family trees, and submit DNA samples.",
    dateAdded: "2026-02-13",
    notes: "Genealogy platform. Users voluntarily create accounts and provide their own data including DNA. Delete via account settings.",
  },
  {
    name: "MyHeritage",
    domains: ["myheritage.com"],
    reason: "NOT a data broker - genealogy platform with direct user relationships. Users create accounts, upload family trees, and submit DNA samples.",
    dateAdded: "2026-02-13",
    notes: "Genealogy platform. Users voluntarily create accounts and provide their own data including DNA. Delete via account settings.",
  },
  {
    name: "Zocdoc",
    domains: ["zocdoc.com"],
    reason: "NOT a data broker - healthcare appointment platform with direct user relationships. Patients and doctors create accounts.",
    dateAdded: "2026-02-13",
    notes: "Healthcare appointment booking. Patients create accounts to book appointments with doctors who also have accounts.",
  },
  {
    name: "Doximity",
    domains: ["doximity.com"],
    reason: "NOT a data broker - physician networking platform with direct user relationships. Doctors create and manage their own profiles.",
    dateAdded: "2026-02-13",
    notes: "Physician networking platform. Doctors create accounts and manage their professional profiles directly.",
  },

  // ============================================================================
  // DATA PROCESSORS (NOT DATA BROKERS)
  // Per GDPR Articles 28/29, Data Processors only process data on behalf of
  // Data Controllers (their clients). Deletion requests should go to the
  // Data Controller, not the Processor.
  // ============================================================================
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
  {
    name: "Bazaarvoice",
    domains: ["bazaarvoice.com"],
    reason: "Data Processor, not Data Broker. Processes reviews/UGC on behalf of retailer clients per GDPR Articles 28/29.",
    dateAdded: "2026-02-03",
    notes: "UGC and reviews platform. Retailers are the Data Controllers - Bazaarvoice only processes data on their behalf.",
  },
  {
    name: "Yotpo",
    domains: ["yotpo.com"],
    reason: "Data Processor, not Data Broker. Processes reviews/UGC on behalf of retailer clients per GDPR Articles 28/29.",
    dateAdded: "2026-02-03",
    notes: "E-commerce marketing platform including reviews. Retailers are the Data Controllers - Yotpo only processes data on their behalf.",
  },
  // ============================================================================
  // DATING PLATFORMS (DIRECT RELATIONSHIP — NOT DATA BROKERS)
  // Users create accounts and voluntarily provide their own data.
  // ============================================================================
  {
    name: "Match.com",
    domains: ["match.com"],
    reason: "NOT a data broker - direct user relationship. Users create accounts and voluntarily provide personal data. Per Cal. Civ. Code § 1798.99.80(d).",
    dateAdded: "2026-02-16",
    notes: "Dating platform. Users delete accounts directly via settings.",
  },
  {
    name: "Bumble",
    domains: ["bumble.com"],
    reason: "NOT a data broker - direct user relationship. Users create accounts and voluntarily provide personal data. Per Cal. Civ. Code § 1798.99.80(d).",
    dateAdded: "2026-02-16",
    notes: "Dating platform. Users delete accounts directly via settings.",
  },
  {
    name: "Hinge",
    domains: ["hinge.co"],
    reason: "NOT a data broker - direct user relationship. Users create accounts and voluntarily provide personal data. Per Cal. Civ. Code § 1798.99.80(d).",
    dateAdded: "2026-02-16",
    notes: "Dating platform (owned by Match Group). Users delete accounts directly via settings.",
  },
  {
    name: "OkCupid",
    domains: ["okcupid.com"],
    reason: "NOT a data broker - direct user relationship. Users create accounts and voluntarily provide personal data. Per Cal. Civ. Code § 1798.99.80(d).",
    dateAdded: "2026-02-16",
    notes: "Dating platform (owned by Match Group). Users delete accounts directly via settings.",
  },
  {
    name: "Plenty of Fish",
    domains: ["pof.com"],
    reason: "NOT a data broker - direct user relationship. Users create accounts and voluntarily provide personal data. Per Cal. Civ. Code § 1798.99.80(d).",
    dateAdded: "2026-02-16",
    notes: "Dating platform (owned by Match Group). Users delete accounts directly via settings.",
  },
  {
    name: "Tinder",
    domains: ["tinder.com"],
    reason: "NOT a data broker - direct user relationship. Users create accounts and voluntarily provide personal data. Per Cal. Civ. Code § 1798.99.80(d).",
    dateAdded: "2026-02-16",
    notes: "Dating platform (owned by Match Group). Users delete accounts directly via settings.",
  },
  // ============================================================================
  // CONSENT-BASED BACKGROUND CHECK FIRMS (DIRECT RELATIONSHIP — NOT DATA BROKERS)
  // Employers/consumers pay for checks, subjects consent per FCRA § 604.
  // ============================================================================
  {
    name: "HireRight",
    domains: ["hireright.com"],
    reason: "NOT a data broker - consent-based background check firm. Subjects consent per FCRA § 604. Per Cal. Civ. Code § 1798.99.80(d).",
    dateAdded: "2026-02-16",
    notes: "Employment background check company. Operates under FCRA consent requirements.",
  },
  {
    name: "Sterling",
    domains: ["sterlingcheck.com", "sterlingbackcheck.com"],
    reason: "NOT a data broker - consent-based background check firm. Subjects consent per FCRA § 604. Per Cal. Civ. Code § 1798.99.80(d).",
    dateAdded: "2026-02-16",
    notes: "Employment background check company. Operates under FCRA consent requirements.",
  },
  {
    name: "Checkr",
    domains: ["checkr.com"],
    reason: "NOT a data broker - consent-based background check firm. Subjects consent per FCRA § 604. Per Cal. Civ. Code § 1798.99.80(d).",
    dateAdded: "2026-02-16",
    notes: "Employment background check company. Operates under FCRA consent requirements.",
  },
  {
    name: "GoodHire",
    domains: ["goodhire.com"],
    reason: "NOT a data broker - consent-based background check firm. Subjects consent per FCRA § 604. Per Cal. Civ. Code § 1798.99.80(d).",
    dateAdded: "2026-02-16",
    notes: "Employment background check company (Checkr subsidiary). Operates under FCRA consent requirements.",
  },
  {
    name: "Accurate Background",
    domains: ["accuratebackground.com"],
    reason: "NOT a data broker - consent-based background check firm. Subjects consent per FCRA § 604. Per Cal. Civ. Code § 1798.99.80(d).",
    dateAdded: "2026-02-16",
    notes: "Employment background check company. Operates under FCRA consent requirements.",
  },
  // ============================================================================
  // USER-GENERATED CONTENT REVIEW PLATFORMS (DIRECT RELATIONSHIP — NOT DATA BROKERS)
  // Users voluntarily create accounts and post their own reviews.
  // ============================================================================
  {
    name: "Trustpilot",
    domains: ["trustpilot.com"],
    reason: "NOT a data broker - direct user relationship. Users voluntarily create accounts and post reviews. Per Cal. Civ. Code § 1798.99.80(d).",
    dateAdded: "2026-02-16",
    notes: "User-generated review platform. Users manage their own reviews and accounts.",
  },
  {
    name: "ConsumerAffairs",
    domains: ["consumeraffairs.com"],
    reason: "NOT a data broker - direct user relationship. Users voluntarily create accounts and post reviews. Per Cal. Civ. Code § 1798.99.80(d).",
    dateAdded: "2026-02-16",
    notes: "User-generated review platform. Users manage their own reviews and accounts.",
  },
  {
    name: "Sitejabber",
    domains: ["sitejabber.com"],
    reason: "NOT a data broker - direct user relationship. Users voluntarily create accounts and post reviews. Per Cal. Civ. Code § 1798.99.80(d).",
    dateAdded: "2026-02-16",
    notes: "User-generated review platform. Users manage their own reviews and accounts.",
  },
  {
    name: "PissedConsumer",
    domains: ["pissedconsumer.com"],
    reason: "NOT a data broker - direct user relationship. Users voluntarily create accounts and post reviews. Per Cal. Civ. Code § 1798.99.80(d).",
    dateAdded: "2026-02-16",
    notes: "User-generated review platform. Users manage their own reviews and accounts.",
  },
  {
    name: "ComplaintsBoard",
    domains: ["complaintsboard.com"],
    reason: "NOT a data broker - direct user relationship. Users voluntarily create accounts and post reviews. Per Cal. Civ. Code § 1798.99.80(d).",
    dateAdded: "2026-02-16",
    notes: "User-generated review platform. Users manage their own reviews and accounts.",
  },
];

/**
 * Blocklisted email domains - never send automated emails to these
 */
export const BLOCKLISTED_EMAIL_DOMAINS: string[] = [
  // Job platforms (direct relationship)
  "ziprecruiter.com",
  "indeed.com",
  "linkedin.com",
  "theladders.com",
  "glassdoor.com",
  "angel.co",
  "wellfound.com",
  "greenhouse.io",
  "lever.co",
  "smartrecruiters.com",
  "jobvite.com",
  "workday.com",
  // Real estate brokerages (direct relationship)
  "remax.com",
  "remax.net",
  "century21.com",
  "coldwellbanker.com",
  "kw.com",
  "compass.com",
  "opendoor.com",
  "offerpad.com",
  "homelight.com",
  // Genealogy platforms (direct relationship)
  "ancestry.com",
  "myheritage.com",
  // Healthcare platforms (direct relationship)
  "zocdoc.com",
  "doximity.com",
  // Service platforms (direct relationship)
  "muckrack.com",
  "ratemyprofessors.com",
  "apartments.com",
  "zumper.com",
  "theknot.com",
  "weddingwire.com",
  "zola.com",
  // Data processors
  "syndigo.com",
  "powerreviews.com",
  "1worldsync.com",
  "bazaarvoice.com",
  "yotpo.com",
  // Dating platforms (direct relationship)
  "match.com",
  "bumble.com",
  "hinge.co",
  "okcupid.com",
  "pof.com",
  "tinder.com",
  // Background check firms (consent-based, not data brokers)
  "hireright.com",
  "sterlingcheck.com",
  "sterlingbackcheck.com",
  "checkr.com",
  "goodhire.com",
  "accuratebackground.com",
  // Review platforms (direct relationship)
  "trustpilot.com",
  "consumeraffairs.com",
  "sitejabber.com",
  "pissedconsumer.com",
  "complaintsboard.com",
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
export function shouldAutoApproveBlocklistAddition(_request: BlocklistAdditionRequest): boolean {
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
