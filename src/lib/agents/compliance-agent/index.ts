/**
 * Compliance Agent
 *
 * Handles compliance operations including:
 * - GDPR/CCPA tracking
 * - Legal templates generation
 * - Regulatory monitoring
 * - Data retention policy enforcement
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
import {
  BLOCKLISTED_COMPANIES,
  BLOCKLISTED_EMAIL_DOMAINS,
  isDomainBlocklisted,
  getBlocklistEntry,
  type BlocklistedCompany,
} from "@/lib/removers/blocklist";
import { getDataBrokerInfo, type DataBrokerInfo } from "@/lib/removers/data-broker-directory";

// ============================================================================
// CONSTANTS
// ============================================================================

const AGENT_ID = "compliance-agent";
const AGENT_VERSION = "1.0.0";

// Supported jurisdictions
const JURISDICTIONS = {
  GDPR: { name: "GDPR", regions: ["EU", "EEA", "UK"] },
  CCPA: { name: "CCPA/CPRA", regions: ["CA", "US"] },
  VCDPA: { name: "VCDPA", regions: ["VA", "US"] },
  CPA: { name: "CPA", regions: ["CO", "US"] },
  CTDPA: { name: "CTDPA", regions: ["CT", "US"] },
  LGPD: { name: "LGPD", regions: ["BR"] },
};

// ============================================================================
// TYPES
// ============================================================================

interface ComplianceCheckInput {
  userId?: string;
  jurisdiction?: string;
}

interface ComplianceCheckResult {
  checked: number;
  compliant: number;
  issues: Array<{
    userId: string;
    issue: string;
    jurisdiction: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    remediation: string;
    deadline?: string;
  }>;
  summary: {
    gdprCompliant: number;
    ccpaCompliant: number;
    total: number;
  };
}

interface LegalTemplateInput {
  type: "deletion_request" | "access_request" | "portability_request" | "objection";
  userId: string;
  brokerName?: string;
  jurisdiction?: string;
}

interface LegalTemplateResult {
  template: {
    type: string;
    subject: string;
    body: string;
    legalBasis: string;
    jurisdiction: string;
  };
  instructions: string[];
  timeline: string;
}

interface DataRetentionInput {
  dryRun?: boolean;
}

interface DataRetentionResult {
  scanned: number;
  toDelete: number;
  deleted: number;
  retained: number;
  categories: Array<{
    category: string;
    count: number;
    retentionPeriod: string;
    action: "KEEP" | "DELETE" | "ARCHIVE";
  }>;
}

interface RegulatoryMonitorInput {
  regions?: string[];
}

interface RegulatoryMonitorResult {
  monitored: number;
  updates: Array<{
    jurisdiction: string;
    updateType: "NEW_LAW" | "AMENDMENT" | "ENFORCEMENT" | "GUIDANCE";
    title: string;
    summary: string;
    effectiveDate?: string;
    impact: "LOW" | "MEDIUM" | "HIGH";
    actionRequired?: string;
  }>;
  upcoming: Array<{
    jurisdiction: string;
    event: string;
    date: string;
    preparation: string;
  }>;
}

// ============================================================================
// NEW CAPABILITY TYPES - Entity Classification & Compliance
// ============================================================================

/**
 * Entity classification types
 * DATA_BROKER: Independently collects, sells, or trades personal data
 * DATA_PROCESSOR: Only processes data on behalf of a Data Controller (client)
 * UNKNOWN: Unable to determine classification with confidence
 */
export type EntityClassificationType = "DATA_BROKER" | "DATA_PROCESSOR" | "UNKNOWN";

/**
 * Classification source - how the classification was determined
 */
export type ClassificationSource =
  | "BLOCKLIST"           // Found in blocklist
  | "DIRECTORY"           // Found in data broker directory
  | "RULE_BASED"          // Determined by pattern matching
  | "AI_ANALYSIS"         // Determined by AI
  | "MANUAL_OVERRIDE"     // Manually set by admin
  | "CACHED";             // Retrieved from cache

// --- validate-entity-classification ---

export interface ValidateEntityClassificationInput {
  domain: string;                    // Domain to classify (e.g., "syndigo.com")
  companyName?: string;              // Optional company name for context
  context?: {                        // Optional additional context
    sourceUrl?: string;              // URL where data was found
    dataType?: string;               // Type of data (email, phone, etc.)
    existingExposureId?: string;     // If validating for an existing exposure
  };
  skipCache?: boolean;               // Force fresh classification
}

export interface ValidateEntityClassificationResult {
  domain: string;
  classification: EntityClassificationType;
  confidence: number;                 // 0-1 confidence score
  source: ClassificationSource;
  reasoning: string;                  // Human-readable explanation
  blockedFromRemoval: boolean;        // Whether removal should be blocked
  parentCompany?: string;             // Parent company if known (e.g., "Syndigo")
  subsidiaries?: string[];            // Known subsidiaries
  legalBasis?: string;                // Legal basis for classification (e.g., "GDPR Article 28")
  suggestedAction?: "PROCEED" | "BLOCK" | "REVIEW" | "ADD_TO_BLOCKLIST";
  cachedAt?: Date;                    // When this classification was cached
}

// --- assess-blocklist-compliance ---

export interface AssessBlocklistComplianceInput {
  domains?: string[];                 // Specific domains to audit (empty = all)
  checkStaleness?: boolean;           // Check for stale entries (default: true)
  staleDays?: number;                 // Days before entry is considered stale (default: 180)
  validateLegalBasis?: boolean;       // Verify legal justification exists (default: true)
}

export interface BlocklistAuditEntry {
  domain: string;
  companyName: string;
  dateAdded: string;
  daysSinceAdded: number;
  hasLegalJustification: boolean;
  hasContactInfo: boolean;
  issues: string[];
  recommendation: "KEEP" | "REVIEW" | "REMOVE";
}

export interface AssessBlocklistComplianceResult {
  totalEntries: number;
  auditedEntries: number;
  healthyEntries: number;
  entriesWithIssues: number;
  staleEntries: number;
  missingJustification: number;
  entries: BlocklistAuditEntry[];
  overallHealth: "GOOD" | "NEEDS_ATTENTION" | "CRITICAL";
  recommendations: string[];
}

// --- detect-processor-relationships ---

export interface DetectProcessorRelationshipsInput {
  domain: string;                     // Domain to check for relationships
  companyName?: string;               // Company name for lookup
  checkSubsidiaries?: boolean;        // Check for subsidiaries (default: true)
  checkParent?: boolean;              // Check for parent company (default: true)
  depth?: number;                     // How deep to traverse relationships (default: 2)
}

export interface EntityRelationship {
  entity: string;                     // Domain or company name
  relationship: "PARENT" | "SUBSIDIARY" | "AFFILIATE" | "ACQUIRED_BY" | "MERGED_WITH";
  confidence: number;
  source: string;                     // Where this relationship was found
  classification?: EntityClassificationType;
  isBlocklisted: boolean;
}

export interface DetectProcessorRelationshipsResult {
  domain: string;
  companyName?: string;
  relationships: EntityRelationship[];
  hasBlocklistedRelationship: boolean;  // Any related entity is blocklisted
  blocklistedRelationships: string[];   // List of blocklisted related entities
  recommendation: "SAFE" | "CAUTION" | "BLOCK";
  reasoning: string;
}

// --- parse-compliance-complaint ---

export interface ParseComplianceComplaintInput {
  emailContent: string;               // Raw email content (headers + body)
  senderEmail: string;                // Sender email address
  senderName?: string;                // Sender name if available
  subject: string;                    // Email subject line
  receivedAt?: Date;                  // When email was received
  inboxType?: "DPO" | "LEGAL" | "COMPLIANCE" | "SUPPORT"; // Which inbox received it
}

export type ComplaintType =
  | "LEGAL_THREAT"                    // Threat of legal action
  | "CEASE_DESIST"                    // Cease and desist letter
  | "CLASSIFICATION_DISPUTE"          // Disputing our entity classification
  | "GDPR_REQUEST"                    // GDPR data subject request
  | "CCPA_REQUEST"                    // CCPA consumer request
  | "DATA_PROCESSOR_NOTICE"           // Notice that entity is a data processor
  | "OPT_OUT_CONFIRMATION"            // Confirmation of opt-out
  | "REMOVAL_DISPUTE"                 // Disputing removal request
  | "GENERAL_INQUIRY"                 // General compliance inquiry
  | "OTHER";

export type ComplaintSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface ParsedComplaintParty {
  name?: string;
  email?: string;
  company?: string;
  role?: string;                      // e.g., "Head of Global Data Privacy"
  domains?: string[];                 // Related domains mentioned
}

export interface ParseComplianceComplaintResult {
  complaintType: ComplaintType;
  severity: ComplaintSeverity;
  requiresImmediateAction: boolean;

  // Parsed content
  sender: ParsedComplaintParty;
  mentionedEntities: string[];        // Companies/domains mentioned
  legalReferences: string[];          // Legal citations (GDPR Article X, etc.)
  deadlines: Array<{
    description: string;
    date?: Date;
    isUrgent: boolean;
  }>;

  // Key extractions
  keyPoints: string[];                // Main points from the email
  requestedActions: string[];         // What they're asking us to do
  threats: string[];                  // Any threats made

  // Recommendations
  suggestedPriority: "URGENT" | "HIGH" | "NORMAL" | "LOW";
  suggestedCategory: string;          // For ticket routing
  suggestedResponse: string;          // Draft response or talking points

  // Entity classification implications
  classificationImplications?: {
    domain: string;
    currentClassification?: EntityClassificationType;
    claimedClassification: EntityClassificationType;
    shouldReclassify: boolean;
    evidence: string[];
  };
}

// ============================================================================
// COMPLIANCE AGENT CLASS
// ============================================================================

class ComplianceAgent extends BaseAgent {
  readonly id = AGENT_ID;
  readonly name = "Compliance Agent";
  readonly domain = AgentDomains.COMPLIANCE;
  readonly mode = AgentModes.HYBRID;
  readonly version = AGENT_VERSION;
  readonly description =
    "Manages GDPR/CCPA compliance, generates legal templates, monitors regulations, and enforces data retention";

  readonly capabilities: AgentCapability[] = [
    {
      id: "check-compliance",
      name: "Check Compliance Status",
      description: "Check user and system compliance with privacy regulations",
      requiresAI: false,
      supportsBatch: true,
    },
    {
      id: "generate-template",
      name: "Generate Legal Template",
      description: "Generate legal request templates (DSAR, deletion, etc.)",
      requiresAI: true,
      estimatedTokens: 400,
    },
    {
      id: "enforce-retention",
      name: "Enforce Data Retention",
      description: "Enforce data retention policies",
      requiresAI: false,
      supportsBatch: true,
    },
    {
      id: "monitor-regulations",
      name: "Monitor Regulations",
      description: "Monitor regulatory updates and changes",
      requiresAI: true,
      estimatedTokens: 500,
    },
    // New capabilities for proactive compliance
    {
      id: "validate-entity-classification",
      name: "Validate Entity Classification",
      description: "Determine if an entity is a Data Broker vs Data Processor before sending removal requests",
      requiresAI: false, // Hybrid: rule-based first, AI fallback
      supportsBatch: true,
      estimatedTokens: 300,
    },
    {
      id: "assess-blocklist-compliance",
      name: "Assess Blocklist Compliance",
      description: "Audit blocklist entries for staleness, legal justification, and proper documentation",
      requiresAI: false, // Rule-based
      supportsBatch: false,
    },
    {
      id: "detect-processor-relationships",
      name: "Detect Processor Relationships",
      description: "Identify parent/subsidiary relationships between entities (e.g., PowerReviews → Syndigo)",
      requiresAI: false, // Hybrid: rule-based first, AI for unknown
      estimatedTokens: 400,
    },
    {
      id: "parse-compliance-complaint",
      name: "Parse Compliance Complaint",
      description: "Parse inbound emails for compliance issues, legal threats, and classification disputes",
      requiresAI: true, // Hybrid: pattern matching + AI
      estimatedTokens: 600,
    },
  ];

  protected getSystemPrompt(): string {
    return `You are the Compliance Agent for GhostMyData. Your role is to ensure compliance with privacy regulations like GDPR, CCPA, and others. Generate accurate legal templates, monitor regulatory changes, and help maintain data protection standards. Be precise and legally accurate.`;
  }

  protected registerHandlers(): void {
    this.handlers.set("check-compliance", this.handleCheckCompliance.bind(this));
    this.handlers.set("generate-template", this.handleGenerateTemplate.bind(this));
    this.handlers.set("enforce-retention", this.handleEnforceRetention.bind(this));
    this.handlers.set("monitor-regulations", this.handleMonitorRegulations.bind(this));
    // New capability handlers
    this.handlers.set("validate-entity-classification", this.handleValidateEntityClassification.bind(this));
    this.handlers.set("assess-blocklist-compliance", this.handleAssessBlocklistCompliance.bind(this));
    this.handlers.set("detect-processor-relationships", this.handleDetectProcessorRelationships.bind(this));
    this.handlers.set("parse-compliance-complaint", this.handleParseComplianceComplaint.bind(this));
  }

  private async handleCheckCompliance(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<ComplianceCheckResult>> {
    const startTime = Date.now();
    const { userId, jurisdiction } = input as ComplianceCheckInput;

    try {
      const users = await prisma.user.findMany({
        where: userId ? { id: userId } : {},
        take: 100,
        include: {
          exposures: {
            where: { status: "ACTIVE" },
            select: { id: true, dataType: true },
          },
          removalRequests: {
            where: { status: { in: ["PENDING", "SUBMITTED"] } },
            select: { id: true, createdAt: true },
          },
        },
      });

      const issues: ComplianceCheckResult["issues"] = [];
      let gdprCompliant = 0;
      let ccpaCompliant = 0;

      for (const user of users) {
        let userGdprCompliant = true;
        let userCcpaCompliant = true;

        // Check GDPR compliance
        if (!jurisdiction || jurisdiction === "GDPR") {
          // Check: Data subject rights - deletion requests should be processed within 30 days
          const oldPendingRemovals = user.removalRequests.filter(
            (r) => new Date(r.createdAt).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000
          );
          if (oldPendingRemovals.length > 0) {
            userGdprCompliant = false;
            issues.push({
              userId: user.id,
              issue: "Deletion requests pending over 30 days",
              jurisdiction: "GDPR",
              severity: "HIGH",
              remediation: "Process outstanding deletion requests immediately",
              deadline: "Immediate",
            });
          }

          // Check: Sensitive data requires explicit consent
          const sensitiveData = user.exposures.filter((e) =>
            ["MEDICAL", "BIOMETRIC", "POLITICAL", "RELIGIOUS"].includes(e.dataType)
          );
          if (sensitiveData.length > 0) {
            // Would check consent records in production
            issues.push({
              userId: user.id,
              issue: `${sensitiveData.length} exposures contain special category data`,
              jurisdiction: "GDPR",
              severity: "MEDIUM",
              remediation: "Verify explicit consent or other legal basis exists",
            });
          }
        }

        // Check CCPA compliance
        if (!jurisdiction || jurisdiction === "CCPA") {
          // Check: Provide opt-out mechanism
          // Check: Respond to requests within 45 days
          const oldRequests = user.removalRequests.filter(
            (r) => new Date(r.createdAt).getTime() < Date.now() - 45 * 24 * 60 * 60 * 1000
          );
          if (oldRequests.length > 0) {
            userCcpaCompliant = false;
            issues.push({
              userId: user.id,
              issue: "Requests pending over 45 days",
              jurisdiction: "CCPA",
              severity: "HIGH",
              remediation: "Process outstanding requests within CCPA timeline",
              deadline: "Immediate",
            });
          }
        }

        if (userGdprCompliant) gdprCompliant++;
        if (userCcpaCompliant) ccpaCompliant++;
      }

      return this.createSuccessResult<ComplianceCheckResult>(
        {
          checked: users.length,
          compliant: gdprCompliant, // Simplified - would combine jurisdictions
          issues,
          summary: {
            gdprCompliant,
            ccpaCompliant,
            total: users.length,
          },
        },
        {
          capability: "check-compliance",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
        {
          needsHumanReview: issues.some((i) => i.severity === "CRITICAL" || i.severity === "HIGH"),
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "COMPLIANCE_ERROR",
          message: error instanceof Error ? error.message : "Compliance check failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "check-compliance",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleGenerateTemplate(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<LegalTemplateResult>> {
    const startTime = Date.now();
    const {
      type,
      userId,
      brokerName = "[Data Broker Name]",
      jurisdiction = "GDPR",
    } = input as LegalTemplateInput;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userName = user.name || "Data Subject";
      const templates = this.getTemplates(type, userName, user.email, brokerName, jurisdiction);

      return this.createSuccessResult<LegalTemplateResult>(
        {
          template: templates.template,
          instructions: templates.instructions,
          timeline: templates.timeline,
        },
        {
          capability: "generate-template",
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
          code: "TEMPLATE_ERROR",
          message: error instanceof Error ? error.message : "Template generation failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "generate-template",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private getTemplates(
    type: LegalTemplateInput["type"],
    userName: string,
    email: string,
    brokerName: string,
    jurisdiction: string
  ): {
    template: LegalTemplateResult["template"];
    instructions: string[];
    timeline: string;
  } {
    const templates: Record<
      string,
      {
        subject: string;
        body: string;
        legalBasis: string;
        instructions: string[];
        timeline: string;
      }
    > = {
      deletion_request: {
        subject: `Data Deletion Request - ${userName}`,
        body: `Dear ${brokerName} Privacy Team,

I am writing to exercise my right to erasure (also known as the "right to be forgotten") under ${
          jurisdiction === "GDPR" ? "Article 17 of the General Data Protection Regulation (GDPR)" : "the California Consumer Privacy Act (CCPA)"
        }.

I request that you delete all personal data you hold about me, including but not limited to:
- Name and contact information
- Address and location data
- Online identifiers
- Any other personal information

My details for identification purposes:
- Full Name: ${userName}
- Email: ${email}

Please confirm deletion within ${jurisdiction === "GDPR" ? "30" : "45"} days as required by law.

I expect you to take reasonable steps to verify my identity before processing this request.

Sincerely,
${userName}`,
        legalBasis:
          jurisdiction === "GDPR"
            ? "Article 17 GDPR - Right to erasure"
            : "CCPA §1798.105 - Right to deletion",
        instructions: [
          "Send this letter via the broker's official opt-out channel",
          "Keep a copy for your records",
          "Note the date sent for compliance tracking",
          "Follow up if no response within the timeline",
        ],
        timeline:
          jurisdiction === "GDPR"
            ? "Response required within 30 days (extendable by 60 days for complex requests)"
            : "Response required within 45 days (extendable by 45 days with notice)",
      },
      access_request: {
        subject: `Data Access Request (DSAR) - ${userName}`,
        body: `Dear ${brokerName} Privacy Team,

I am exercising my right of access under ${
          jurisdiction === "GDPR" ? "Article 15 of the General Data Protection Regulation (GDPR)" : "the California Consumer Privacy Act (CCPA)"
        }.

Please provide me with:
1. Confirmation of whether you process my personal data
2. A copy of all personal data you hold about me
3. The purposes of processing
4. Categories of data concerned
5. Recipients or categories of recipients
6. Retention periods
7. Source of the data if not collected from me

My details for identification:
- Full Name: ${userName}
- Email: ${email}

Please respond within the statutory timeframe.

Sincerely,
${userName}`,
        legalBasis:
          jurisdiction === "GDPR"
            ? "Article 15 GDPR - Right of access"
            : "CCPA §1798.100 - Right to know",
        instructions: [
          "Submit through the broker's designated privacy channel",
          "Be prepared to verify your identity",
          "Keep records of all communications",
          "Note: Some data may be withheld if it affects others' rights",
        ],
        timeline:
          jurisdiction === "GDPR"
            ? "Response required within 30 days"
            : "Response required within 45 days",
      },
      portability_request: {
        subject: `Data Portability Request - ${userName}`,
        body: `Dear ${brokerName} Privacy Team,

I am exercising my right to data portability under ${
          jurisdiction === "GDPR"
            ? "Article 20 of the General Data Protection Regulation (GDPR)"
            : "applicable data protection law"
        }.

Please provide my personal data in a structured, commonly used, and machine-readable format (such as JSON or CSV).

My details for identification:
- Full Name: ${userName}
- Email: ${email}

Sincerely,
${userName}`,
        legalBasis: "Article 20 GDPR - Right to data portability",
        instructions: [
          "This right applies to data processed by automated means",
          "Data should be provided in a machine-readable format",
          "You may request transmission directly to another controller",
        ],
        timeline: "Response required within 30 days",
      },
      objection: {
        subject: `Objection to Data Processing - ${userName}`,
        body: `Dear ${brokerName} Privacy Team,

I am exercising my right to object to the processing of my personal data under ${
          jurisdiction === "GDPR" ? "Article 21 of the General Data Protection Regulation (GDPR)" : "applicable data protection law"
        }.

I object to:
- Processing for direct marketing purposes
- Processing based on legitimate interests
- Profiling

Please cease processing my data immediately for the above purposes.

My details for identification:
- Full Name: ${userName}
- Email: ${email}

Sincerely,
${userName}`,
        legalBasis: "Article 21 GDPR - Right to object",
        instructions: [
          "Objection to direct marketing must be honored immediately",
          "For other processing, controller may demonstrate compelling grounds",
          "Keep proof of your objection",
        ],
        timeline: "Immediate for direct marketing; reasonable time for other objections",
      },
    };

    const selected = templates[type] || templates.deletion_request;

    return {
      template: {
        type,
        subject: selected.subject,
        body: selected.body,
        legalBasis: selected.legalBasis,
        jurisdiction,
      },
      instructions: selected.instructions,
      timeline: selected.timeline,
    };
  }

  private async handleEnforceRetention(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<DataRetentionResult>> {
    const startTime = Date.now();
    const { dryRun = true } = input as DataRetentionInput;

    try {
      // Define retention policies
      const retentionPolicies = [
        { category: "scan_results", retentionDays: 365, table: "scan" },
        { category: "exposure_data", retentionDays: 730, table: "exposure" },
        { category: "removal_logs", retentionDays: 1095, table: "removalRequest" },
        { category: "support_tickets", retentionDays: 1095, table: "ticket" },
        { category: "user_activity", retentionDays: 365, table: "activityLog" },
      ];

      const categories: DataRetentionResult["categories"] = [];
      let totalToDelete = 0;
      let totalDeleted = 0;
      let totalRetained = 0;
      let totalScanned = 0;

      for (const policy of retentionPolicies) {
        const cutoffDate = new Date(Date.now() - policy.retentionDays * 24 * 60 * 60 * 1000);

        // Count records to delete
        let toDeleteCount = 0;
        let retainedCount = 0;

        try {
          if (policy.table === "scan") {
            toDeleteCount = await prisma.scan.count({
              where: { createdAt: { lt: cutoffDate } },
            });
            retainedCount = await prisma.scan.count({
              where: { createdAt: { gte: cutoffDate } },
            });
          } else if (policy.table === "ticket") {
            toDeleteCount = await prisma.supportTicket.count({
              where: {
                status: "CLOSED",
                updatedAt: { lt: cutoffDate },
              },
            });
            retainedCount = await prisma.supportTicket.count({
              where: {
                OR: [{ status: { not: "CLOSED" } }, { updatedAt: { gte: cutoffDate } }],
              },
            });
          }
          // Add more tables as needed
        } catch {
          // Table might not exist or other error
          continue;
        }

        totalToDelete += toDeleteCount;
        totalRetained += retainedCount;
        totalScanned += toDeleteCount + retainedCount;

        // Perform deletion if not dry run
        if (!dryRun && toDeleteCount > 0) {
          try {
            if (policy.table === "scan") {
              await prisma.scan.deleteMany({
                where: { createdAt: { lt: cutoffDate } },
              });
              totalDeleted += toDeleteCount;
            } else if (policy.table === "ticket") {
              await prisma.supportTicket.deleteMany({
                where: {
                  status: "CLOSED",
                  updatedAt: { lt: cutoffDate },
                },
              });
              totalDeleted += toDeleteCount;
            }
          } catch {
            // Log error but continue
          }
        }

        categories.push({
          category: policy.category,
          count: toDeleteCount + retainedCount,
          retentionPeriod: `${policy.retentionDays} days`,
          action: toDeleteCount > 0 ? (dryRun ? "DELETE" : "DELETE") : "KEEP",
        });
      }

      return this.createSuccessResult<DataRetentionResult>(
        {
          scanned: totalScanned,
          toDelete: totalToDelete,
          deleted: dryRun ? 0 : totalDeleted,
          retained: totalRetained,
          categories,
        },
        {
          capability: "enforce-retention",
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
          code: "RETENTION_ERROR",
          message: error instanceof Error ? error.message : "Retention enforcement failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "enforce-retention",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleMonitorRegulations(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<RegulatoryMonitorResult>> {
    const startTime = Date.now();
    const { regions = ["US", "EU"] } = input as RegulatoryMonitorInput;

    try {
      // In production, this would:
      // 1. Monitor regulatory news feeds
      // 2. Track legislative calendars
      // 3. Parse enforcement actions
      // 4. Use AI to summarize and assess impact

      const updates: RegulatoryMonitorResult["updates"] = [
        {
          jurisdiction: "CCPA/CPRA",
          updateType: "ENFORCEMENT",
          title: "California AG privacy enforcement update",
          summary: "Increased enforcement focus on data broker registration requirements",
          impact: "MEDIUM",
          actionRequired: "Verify all broker partnerships maintain proper registration",
        },
        {
          jurisdiction: "GDPR",
          updateType: "GUIDANCE",
          title: "EDPB guidance on data portability",
          summary: "Clarification on machine-readable formats for data portability requests",
          effectiveDate: new Date().toISOString(),
          impact: "LOW",
        },
      ];

      const upcoming: RegulatoryMonitorResult["upcoming"] = [
        {
          jurisdiction: "Colorado",
          event: "CPA enforcement begins",
          date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          preparation: "Review Colorado resident data handling procedures",
        },
        {
          jurisdiction: "Texas",
          event: "TDPSA effective date",
          date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          preparation: "Prepare for new state privacy law requirements",
        },
      ];

      // Filter by requested regions
      const filteredUpdates = updates.filter((u) =>
        regions.some((r) =>
          u.jurisdiction.toLowerCase().includes(r.toLowerCase()) ||
          (r === "US" && ["CCPA", "CPRA", "VCDPA", "CPA", "CTDPA"].some((j) => u.jurisdiction.includes(j))) ||
          (r === "EU" && u.jurisdiction.includes("GDPR"))
        )
      );

      return this.createSuccessResult<RegulatoryMonitorResult>(
        {
          monitored: Object.keys(JURISDICTIONS).length,
          updates: filteredUpdates,
          upcoming,
        },
        {
          capability: "monitor-regulations",
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
          code: "MONITOR_ERROR",
          message: error instanceof Error ? error.message : "Regulation monitoring failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "monitor-regulations",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  // ============================================================================
  // NEW CAPABILITY HANDLERS
  // ============================================================================

  /**
   * Validate Entity Classification
   * Determines if an entity is a Data Broker or Data Processor
   * Uses hybrid approach: blocklist → rule-based patterns → AI fallback
   */
  private async handleValidateEntityClassification(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<ValidateEntityClassificationResult>> {
    const startTime = Date.now();
    const {
      domain,
      companyName,
      context: inputContext,
      skipCache = false,
    } = input as ValidateEntityClassificationInput;

    try {
      const normalizedDomain = domain.toLowerCase().trim();

      // Step 1: Check blocklist first (fastest)
      const blocklistEntry = getBlocklistEntry(normalizedDomain);
      if (blocklistEntry) {
        const result: ValidateEntityClassificationResult = {
          domain: normalizedDomain,
          classification: "DATA_PROCESSOR",
          confidence: 1.0,
          source: "BLOCKLIST",
          reasoning: `${blocklistEntry.name} is blocklisted: ${blocklistEntry.reason}`,
          blockedFromRemoval: true,
          parentCompany: blocklistEntry.notes?.includes("Parent company of")
            ? blocklistEntry.name
            : undefined,
          legalBasis: "GDPR Articles 28/29 - Data Processor obligations",
          suggestedAction: "BLOCK",
        };

        // Log classification to database
        await this.logEntityClassification(result, context.requestId);

        return this.createSuccessResult<ValidateEntityClassificationResult>(
          result,
          {
            capability: "validate-entity-classification",
            requestId: context.requestId,
            duration: Date.now() - startTime,
            usedFallback: false,
            executedAt: new Date(),
          },
          { confidence: 1.0 }
        );
      }

      // Step 2: Check data broker directory (indicates it's a known broker)
      const brokerInfo = getDataBrokerInfo(normalizedDomain.toUpperCase().replace(/\./g, "_"));
      if (brokerInfo) {
        const result: ValidateEntityClassificationResult = {
          domain: normalizedDomain,
          classification: "DATA_BROKER",
          confidence: 0.95,
          source: "DIRECTORY",
          reasoning: `${brokerInfo.name} is a known data broker in our directory`,
          blockedFromRemoval: false,
          parentCompany: brokerInfo.parentCompany,
          subsidiaries: brokerInfo.subsidiaries,
          suggestedAction: "PROCEED",
        };

        return this.createSuccessResult<ValidateEntityClassificationResult>(
          result,
          {
            capability: "validate-entity-classification",
            requestId: context.requestId,
            duration: Date.now() - startTime,
            usedFallback: false,
            executedAt: new Date(),
          },
          { confidence: 0.95 }
        );
      }

      // Step 3: Check cached classification (if not skipping cache)
      if (!skipCache) {
        try {
          const cached = await prisma.entityClassification.findFirst({
            where: {
              domain: normalizedDomain,
              createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // 30 day cache
            },
            orderBy: { createdAt: "desc" },
          });

          if (cached) {
            const result: ValidateEntityClassificationResult = {
              domain: normalizedDomain,
              classification: cached.classification as EntityClassificationType,
              confidence: cached.confidence,
              source: "CACHED",
              reasoning: cached.reasoning,
              blockedFromRemoval: cached.classification === "DATA_PROCESSOR",
              parentCompany: cached.parentCompany || undefined,
              suggestedAction: cached.classification === "DATA_PROCESSOR" ? "BLOCK" : "PROCEED",
              cachedAt: cached.createdAt,
            };

            return this.createSuccessResult<ValidateEntityClassificationResult>(
              result,
              {
                capability: "validate-entity-classification",
                requestId: context.requestId,
                duration: Date.now() - startTime,
                usedFallback: false,
                executedAt: new Date(),
              },
              { confidence: cached.confidence }
            );
          }
        } catch {
          // Database table might not exist yet, continue
        }
      }

      // Step 4: Rule-based pattern matching
      const ruleBasedResult = this.applyClassificationRules(normalizedDomain, companyName);
      if (ruleBasedResult.confidence >= 0.8) {
        // Log classification to database
        await this.logEntityClassification(ruleBasedResult, context.requestId);

        return this.createSuccessResult<ValidateEntityClassificationResult>(
          ruleBasedResult,
          {
            capability: "validate-entity-classification",
            requestId: context.requestId,
            duration: Date.now() - startTime,
            usedFallback: false,
            executedAt: new Date(),
          },
          { confidence: ruleBasedResult.confidence }
        );
      }

      // Step 5: AI fallback for uncertain cases
      if (this.anthropic && context.preferAI !== false) {
        try {
          const aiResult = await this.classifyWithAI(normalizedDomain, companyName, context);
          if (aiResult.confidence >= 0.7) {
            await this.logEntityClassification(aiResult, context.requestId);

            return this.createSuccessResult<ValidateEntityClassificationResult>(
              aiResult,
              {
                capability: "validate-entity-classification",
                requestId: context.requestId,
                duration: Date.now() - startTime,
                usedFallback: false,
                executedAt: new Date(),
              },
              { confidence: aiResult.confidence }
            );
          }
        } catch (error) {
          console.warn(`[ComplianceAgent] AI classification failed for ${domain}:`, error);
        }
      }

      // Step 6: Return unknown with low confidence - needs human review
      const unknownResult: ValidateEntityClassificationResult = {
        domain: normalizedDomain,
        classification: "UNKNOWN",
        confidence: ruleBasedResult.confidence,
        source: "RULE_BASED",
        reasoning: ruleBasedResult.reasoning || "Unable to determine entity classification with confidence",
        blockedFromRemoval: false, // Fail open - don't block on uncertainty
        suggestedAction: "REVIEW",
      };

      return this.createSuccessResult<ValidateEntityClassificationResult>(
        unknownResult,
        {
          capability: "validate-entity-classification",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: true,
          executedAt: new Date(),
        },
        { confidence: ruleBasedResult.confidence, needsHumanReview: true }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "CLASSIFICATION_ERROR",
          message: error instanceof Error ? error.message : "Entity classification failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "validate-entity-classification",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  /**
   * Apply rule-based classification patterns
   */
  private applyClassificationRules(
    domain: string,
    companyName?: string
  ): ValidateEntityClassificationResult {
    const reasons: string[] = [];
    let score = 0.5; // Start at neutral

    // Patterns that indicate DATA_PROCESSOR
    const processorPatterns = [
      { pattern: /review/i, weight: 0.3, reason: "Contains 'review' - may be a review aggregator (processor)" },
      { pattern: /widget|embed/i, weight: 0.2, reason: "Contains widget/embed - likely a service provider" },
      { pattern: /api\.|sdk\./i, weight: 0.2, reason: "API/SDK subdomain - developer service" },
      { pattern: /sync|syndication/i, weight: 0.3, reason: "Contains sync/syndication - likely a processor" },
      { pattern: /platform|saas|service/i, weight: 0.15, reason: "Platform/SaaS indicator" },
      { pattern: /analytics|tracking/i, weight: 0.15, reason: "Analytics/tracking service" },
    ];

    // Patterns that indicate DATA_BROKER
    const brokerPatterns = [
      { pattern: /people|person|search/i, weight: 0.3, reason: "Contains people search terms" },
      { pattern: /lookup|finder|locator/i, weight: 0.3, reason: "Lookup/finder service" },
      { pattern: /records|public|background/i, weight: 0.25, reason: "Public records indicator" },
      { pattern: /verify|check/i, weight: 0.15, reason: "Verification service" },
      { pattern: /data.*broker|broker.*data/i, weight: 0.4, reason: "Explicit data broker terminology" },
      { pattern: /opt-?out/i, weight: 0.2, reason: "Has opt-out process (broker requirement)" },
    ];

    // Check processor patterns
    for (const p of processorPatterns) {
      if (p.pattern.test(domain) || (companyName && p.pattern.test(companyName))) {
        score -= p.weight;
        reasons.push(p.reason);
      }
    }

    // Check broker patterns
    for (const p of brokerPatterns) {
      if (p.pattern.test(domain) || (companyName && p.pattern.test(companyName))) {
        score += p.weight;
        reasons.push(p.reason);
      }
    }

    // Clamp score to 0-1
    score = Math.max(0, Math.min(1, score));

    // Determine classification based on score
    let classification: EntityClassificationType;
    let confidence: number;

    if (score >= 0.7) {
      classification = "DATA_BROKER";
      confidence = score;
    } else if (score <= 0.3) {
      classification = "DATA_PROCESSOR";
      confidence = 1 - score;
    } else {
      classification = "UNKNOWN";
      confidence = 0.5 - Math.abs(score - 0.5);
    }

    return {
      domain,
      classification,
      confidence,
      source: "RULE_BASED",
      reasoning: reasons.length > 0 ? reasons.join("; ") : "No strong classification signals found",
      blockedFromRemoval: classification === "DATA_PROCESSOR",
      suggestedAction: classification === "DATA_PROCESSOR" ? "BLOCK" :
                       classification === "DATA_BROKER" ? "PROCEED" : "REVIEW",
    };
  }

  /**
   * Use AI to classify entities with uncertain rule-based results
   */
  private async classifyWithAI(
    domain: string,
    companyName?: string,
    context?: AgentContext
  ): Promise<ValidateEntityClassificationResult> {
    if (!this.anthropic) {
      throw new Error("AI not available");
    }

    const prompt = `Analyze whether the following entity is a "Data Broker" or "Data Processor":

Domain: ${domain}
${companyName ? `Company Name: ${companyName}` : ""}

Definitions:
- DATA_BROKER: A company that independently collects, aggregates, buys, sells, or trades personal data without a direct relationship with the data subjects. Examples: Spokeo, BeenVerified, WhitePages.
- DATA_PROCESSOR: A company that only processes personal data on behalf of other companies (Data Controllers). They do not independently sell data. Examples: Stripe (payment processor), PowerReviews (processes reviews for retailers), Twilio (messaging on behalf of clients).

Based on the domain name and any knowledge you have about this company, classify it.

Respond in JSON format:
{
  "classification": "DATA_BROKER" | "DATA_PROCESSOR" | "UNKNOWN",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation",
  "parentCompany": "Parent company name if known",
  "isKnownProcessor": true/false,
  "evidence": ["Key facts supporting classification"]
}`;

    const response = await this.anthropic.messages.create({
      model: this.config.model || "claude-sonnet-4-5-20250929",
      max_tokens: 500,
      temperature: 0.1,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON in AI response");
    }

    const aiResponse = JSON.parse(jsonMatch[0]);

    return {
      domain,
      classification: aiResponse.classification || "UNKNOWN",
      confidence: aiResponse.confidence || 0.5,
      source: "AI_ANALYSIS",
      reasoning: aiResponse.reasoning || "AI classification",
      blockedFromRemoval: aiResponse.classification === "DATA_PROCESSOR",
      parentCompany: aiResponse.parentCompany,
      suggestedAction: aiResponse.classification === "DATA_PROCESSOR" ? "BLOCK" :
                       aiResponse.classification === "DATA_BROKER" ? "PROCEED" : "REVIEW",
    };
  }

  /**
   * Log entity classification to database
   */
  private async logEntityClassification(
    result: ValidateEntityClassificationResult,
    requestId: string
  ): Promise<void> {
    try {
      await prisma.entityClassification.create({
        data: {
          domain: result.domain,
          classification: result.classification,
          confidence: result.confidence,
          source: result.source,
          reasoning: result.reasoning,
          parentCompany: result.parentCompany,
          blockedFromRemoval: result.blockedFromRemoval,
          requestId,
        },
      });
    } catch (error) {
      // Table might not exist yet - log but don't fail
      console.warn("[ComplianceAgent] Failed to log classification:", error);
    }
  }

  /**
   * Assess Blocklist Compliance
   * Audits blocklist entries for staleness and proper documentation
   */
  private async handleAssessBlocklistCompliance(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<AssessBlocklistComplianceResult>> {
    const startTime = Date.now();
    const {
      domains,
      checkStaleness = true,
      staleDays = 180,
      validateLegalBasis = true,
    } = input as AssessBlocklistComplianceInput;

    try {
      const entriesToAudit = domains
        ? BLOCKLISTED_COMPANIES.filter((c) =>
            domains.some((d) => c.domains.includes(d.toLowerCase()))
          )
        : BLOCKLISTED_COMPANIES;

      const auditedEntries: BlocklistAuditEntry[] = [];
      let healthyCount = 0;
      let staleCount = 0;
      let missingJustificationCount = 0;

      const now = new Date();

      for (const company of entriesToAudit) {
        const issues: string[] = [];
        const dateAdded = new Date(company.dateAdded);
        const daysSinceAdded = Math.floor(
          (now.getTime() - dateAdded.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Check staleness
        if (checkStaleness && daysSinceAdded > staleDays) {
          issues.push(`Entry is ${daysSinceAdded} days old (threshold: ${staleDays})`);
          staleCount++;
        }

        // Check legal justification
        const hasLegalJustification = !!(
          company.reason &&
          (company.reason.includes("GDPR") ||
            company.reason.includes("Article") ||
            company.reason.includes("Data Processor") ||
            company.reason.includes("Controller"))
        );

        if (validateLegalBasis && !hasLegalJustification) {
          issues.push("Missing explicit legal justification (GDPR Article reference)");
          missingJustificationCount++;
        }

        // Check contact info
        const hasContactInfo = !!company.contactedBy;
        if (!hasContactInfo) {
          issues.push("Missing contact information (who requested addition)");
        }

        // Determine recommendation
        let recommendation: "KEEP" | "REVIEW" | "REMOVE";
        if (issues.length === 0) {
          recommendation = "KEEP";
          healthyCount++;
        } else if (issues.length >= 2 || daysSinceAdded > staleDays * 2) {
          recommendation = "REVIEW";
        } else {
          recommendation = "KEEP";
          healthyCount++;
        }

        auditedEntries.push({
          domain: company.domains[0],
          companyName: company.name,
          dateAdded: company.dateAdded,
          daysSinceAdded,
          hasLegalJustification,
          hasContactInfo,
          issues,
          recommendation,
        });
      }

      // Determine overall health
      const issueRate = (auditedEntries.length - healthyCount) / auditedEntries.length;
      let overallHealth: "GOOD" | "NEEDS_ATTENTION" | "CRITICAL";
      if (issueRate < 0.1) {
        overallHealth = "GOOD";
      } else if (issueRate < 0.3) {
        overallHealth = "NEEDS_ATTENTION";
      } else {
        overallHealth = "CRITICAL";
      }

      // Generate recommendations
      const recommendations: string[] = [];
      if (staleCount > 0) {
        recommendations.push(`Review ${staleCount} stale entries for continued relevance`);
      }
      if (missingJustificationCount > 0) {
        recommendations.push(
          `Add legal justification to ${missingJustificationCount} entries`
        );
      }
      if (auditedEntries.some((e) => !e.hasContactInfo)) {
        recommendations.push("Document contact information for all entries");
      }

      return this.createSuccessResult<AssessBlocklistComplianceResult>(
        {
          totalEntries: BLOCKLISTED_COMPANIES.length,
          auditedEntries: auditedEntries.length,
          healthyEntries: healthyCount,
          entriesWithIssues: auditedEntries.length - healthyCount,
          staleEntries: staleCount,
          missingJustification: missingJustificationCount,
          entries: auditedEntries,
          overallHealth,
          recommendations,
        },
        {
          capability: "assess-blocklist-compliance",
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
          code: "BLOCKLIST_AUDIT_ERROR",
          message: error instanceof Error ? error.message : "Blocklist audit failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "assess-blocklist-compliance",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  /**
   * Detect Processor Relationships
   * Identifies parent/subsidiary relationships between entities
   */
  private async handleDetectProcessorRelationships(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<DetectProcessorRelationshipsResult>> {
    const startTime = Date.now();
    const {
      domain,
      companyName,
      checkSubsidiaries = true,
      checkParent = true,
      depth = 2,
    } = input as DetectProcessorRelationshipsInput;

    try {
      const normalizedDomain = domain.toLowerCase().trim();
      const relationships: EntityRelationship[] = [];
      let hasBlocklistedRelationship = false;
      const blocklistedRelationships: string[] = [];

      // Step 1: Check if domain itself is blocklisted
      const directBlocklist = getBlocklistEntry(normalizedDomain);
      if (directBlocklist) {
        hasBlocklistedRelationship = true;
        blocklistedRelationships.push(directBlocklist.name);
      }

      // Step 2: Check blocklist for relationships mentioned in notes
      for (const company of BLOCKLISTED_COMPANIES) {
        // Check if this domain is mentioned as a subsidiary
        if (company.notes) {
          const notesLower = company.notes.toLowerCase();
          if (
            notesLower.includes(normalizedDomain) ||
            (companyName && notesLower.includes(companyName.toLowerCase()))
          ) {
            relationships.push({
              entity: company.name,
              relationship: "PARENT",
              confidence: 0.9,
              source: "BLOCKLIST_NOTES",
              classification: "DATA_PROCESSOR",
              isBlocklisted: true,
            });
            hasBlocklistedRelationship = true;
            blocklistedRelationships.push(company.name);
          }
        }

        // Check if company is a known subsidiary of this domain
        if (company.domains.some((d) => d === normalizedDomain)) {
          // This is a direct match - check for parent mention
          if (company.notes?.includes("Parent company")) {
            const parentMatch = company.notes.match(/Parent company of ([^.]+)/);
            if (parentMatch) {
              relationships.push({
                entity: parentMatch[1].trim(),
                relationship: "SUBSIDIARY",
                confidence: 0.9,
                source: "BLOCKLIST_NOTES",
                isBlocklisted: isDomainBlocklisted(normalizedDomain),
              });
            }
          }
        }
      }

      // Step 3: Check data broker directory for relationships
      const brokerKey = normalizedDomain.toUpperCase().replace(/\./g, "_");
      const brokerInfo = getDataBrokerInfo(brokerKey);
      if (brokerInfo) {
        // Check for subsidiaries
        if (checkSubsidiaries && brokerInfo.subsidiaries) {
          for (const sub of brokerInfo.subsidiaries) {
            const subBlocklisted = BLOCKLISTED_COMPANIES.some((c) =>
              c.domains.some((d) => d.toLowerCase().includes(sub.toLowerCase()))
            );
            relationships.push({
              entity: sub,
              relationship: "SUBSIDIARY",
              confidence: 0.95,
              source: "DATA_BROKER_DIRECTORY",
              isBlocklisted: subBlocklisted,
            });
            if (subBlocklisted) {
              hasBlocklistedRelationship = true;
              blocklistedRelationships.push(sub);
            }
          }
        }

        // Check for parent company
        if (checkParent && brokerInfo.parentCompany) {
          const parentBlocklisted = BLOCKLISTED_COMPANIES.some(
            (c) => c.name.toLowerCase() === brokerInfo.parentCompany?.toLowerCase()
          );
          relationships.push({
            entity: brokerInfo.parentCompany,
            relationship: "PARENT",
            confidence: 0.95,
            source: "DATA_BROKER_DIRECTORY",
            isBlocklisted: parentBlocklisted,
          });
          if (parentBlocklisted) {
            hasBlocklistedRelationship = true;
            blocklistedRelationships.push(brokerInfo.parentCompany);
          }
        }

        // Check for consolidation
        if (brokerInfo.consolidatesTo) {
          const consolidationBlocklisted = isDomainBlocklisted(brokerInfo.consolidatesTo);
          relationships.push({
            entity: brokerInfo.consolidatesTo,
            relationship: "PARENT",
            confidence: 0.95,
            source: "DATA_BROKER_DIRECTORY",
            isBlocklisted: consolidationBlocklisted,
          });
          if (consolidationBlocklisted) {
            hasBlocklistedRelationship = true;
            blocklistedRelationships.push(brokerInfo.consolidatesTo);
          }
        }
      }

      // Determine recommendation
      let recommendation: "SAFE" | "CAUTION" | "BLOCK";
      let reasoning: string;

      if (hasBlocklistedRelationship) {
        recommendation = "BLOCK";
        reasoning = `Domain has blocklisted relationships: ${blocklistedRelationships.join(", ")}. ` +
          "These entities are classified as Data Processors.";
      } else if (relationships.length > 0) {
        recommendation = "CAUTION";
        reasoning = `Found ${relationships.length} relationships. Review before proceeding with removal.`;
      } else {
        recommendation = "SAFE";
        reasoning = "No blocklisted relationships found. Domain appears to be independent.";
      }

      return this.createSuccessResult<DetectProcessorRelationshipsResult>(
        {
          domain: normalizedDomain,
          companyName,
          relationships,
          hasBlocklistedRelationship,
          blocklistedRelationships,
          recommendation,
          reasoning,
        },
        {
          capability: "detect-processor-relationships",
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
          code: "RELATIONSHIP_DETECTION_ERROR",
          message: error instanceof Error ? error.message : "Relationship detection failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "detect-processor-relationships",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  /**
   * Parse Compliance Complaint
   * Parses inbound emails for compliance issues, legal threats, classification disputes
   */
  private async handleParseComplianceComplaint(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<ParseComplianceComplaintResult>> {
    const startTime = Date.now();
    const {
      emailContent,
      senderEmail,
      senderName,
      subject,
      receivedAt,
      inboxType = "COMPLIANCE",
    } = input as ParseComplianceComplaintInput;

    try {
      // Step 1: Rule-based pattern matching for quick classification
      const ruleBasedResult = this.applyComplaintPatterns(
        emailContent,
        subject,
        senderEmail,
        senderName
      );

      // Step 2: For complex cases or uncertain results, use AI
      let finalResult: ParseComplianceComplaintResult;

      if (
        this.anthropic &&
        context.preferAI !== false &&
        (ruleBasedResult.complaintType === "OTHER" ||
          ruleBasedResult.severity === "CRITICAL" ||
          ruleBasedResult.requiresImmediateAction)
      ) {
        try {
          finalResult = await this.parseComplaintWithAI(
            emailContent,
            subject,
            senderEmail,
            senderName,
            ruleBasedResult
          );
        } catch (error) {
          console.warn("[ComplianceAgent] AI complaint parsing failed:", error);
          finalResult = ruleBasedResult;
        }
      } else {
        finalResult = ruleBasedResult;
      }

      // Log complaint to database
      try {
        await prisma.complianceComplaint.create({
          data: {
            senderEmail,
            senderName: senderName || null,
            subject,
            complaintType: finalResult.complaintType,
            severity: finalResult.severity,
            requiresImmediateAction: finalResult.requiresImmediateAction,
            keyPoints: JSON.stringify(finalResult.keyPoints),
            requestedActions: JSON.stringify(finalResult.requestedActions),
            mentionedEntities: JSON.stringify(finalResult.mentionedEntities),
            parsedAt: new Date(),
            inboxType,
            requestId: context.requestId,
          },
        });
      } catch (error) {
        console.warn("[ComplianceAgent] Failed to log complaint:", error);
      }

      return this.createSuccessResult<ParseComplianceComplaintResult>(
        finalResult,
        {
          capability: "parse-compliance-complaint",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: !this.anthropic,
          executedAt: new Date(),
        },
        {
          needsHumanReview: finalResult.requiresImmediateAction || finalResult.severity === "CRITICAL",
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "COMPLAINT_PARSE_ERROR",
          message: error instanceof Error ? error.message : "Complaint parsing failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "parse-compliance-complaint",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  /**
   * Apply rule-based patterns to classify complaints
   */
  private applyComplaintPatterns(
    content: string,
    subject: string,
    senderEmail: string,
    senderName?: string
  ): ParseComplianceComplaintResult {
    const contentLower = content.toLowerCase();
    const subjectLower = subject.toLowerCase();
    const combined = `${subjectLower} ${contentLower}`;

    // Pattern definitions
    const patterns = {
      LEGAL_THREAT: [/legal action/i, /lawsuit/i, /attorney/i, /counsel/i, /litigation/i, /sue/i],
      CEASE_DESIST: [/cease and desist/i, /cease & desist/i, /demand letter/i, /formal notice/i],
      CLASSIFICATION_DISPUTE: [
        /data processor/i,
        /not a data broker/i,
        /incorrectly classified/i,
        /misclassified/i,
        /gdpr article 28/i,
        /we process.*on behalf/i,
        /we do not sell/i,
      ],
      GDPR_REQUEST: [/gdpr/i, /article 17/i, /article 15/i, /right to erasure/i, /right to be forgotten/i],
      CCPA_REQUEST: [/ccpa/i, /california consumer/i, /do not sell/i, /1798\./],
      DATA_PROCESSOR_NOTICE: [
        /data processor/i,
        /process.*on behalf/i,
        /controller.*processor/i,
        /service provider/i,
        /gdpr article 28/i,
      ],
      OPT_OUT_CONFIRMATION: [/confirmation/i, /opt.*out.*complete/i, /removed.*data/i, /deletion.*confirmed/i],
      REMOVAL_DISPUTE: [/dispute.*removal/i, /incorrect.*removal/i, /wrongful/i, /in error/i],
    };

    // Detect complaint type
    let complaintType: ComplaintType = "GENERAL_INQUIRY";
    let maxMatches = 0;

    for (const [type, typePatterns] of Object.entries(patterns)) {
      const matches = typePatterns.filter((p) => p.test(combined)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        complaintType = type as ComplaintType;
      }
    }

    // Extract mentioned domains/entities
    const domainPattern = /(?:https?:\/\/)?(?:www\.)?([a-z0-9-]+(?:\.[a-z]{2,})+)/gi;
    const mentionedEntities: string[] = [];
    let match;
    while ((match = domainPattern.exec(content)) !== null) {
      mentionedEntities.push(match[1]);
    }

    // Extract legal references
    const legalRefPatterns = [
      /GDPR Article \d+/gi,
      /Article \d+ of (?:the )?GDPR/gi,
      /CCPA §?\d+/gi,
      /California Civil Code/gi,
      /EU Regulation \d+\/\d+/gi,
    ];
    const legalReferences: string[] = [];
    for (const pattern of legalRefPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        legalReferences.push(...matches);
      }
    }

    // Determine severity
    let severity: ComplaintSeverity = "LOW";
    const requiresImmediateAction =
      complaintType === "LEGAL_THREAT" ||
      complaintType === "CEASE_DESIST" ||
      /urgent/i.test(combined) ||
      /immediate/i.test(combined) ||
      /within \d+ (?:hours?|days?)/i.test(combined);

    if (complaintType === "LEGAL_THREAT" || complaintType === "CEASE_DESIST") {
      severity = "CRITICAL";
    } else if (
      complaintType === "CLASSIFICATION_DISPUTE" ||
      complaintType === "DATA_PROCESSOR_NOTICE"
    ) {
      severity = "HIGH";
    } else if (complaintType === "GDPR_REQUEST" || complaintType === "CCPA_REQUEST") {
      severity = "MEDIUM";
    }

    // Extract deadlines
    const deadlines: ParseComplianceComplaintResult["deadlines"] = [];
    const deadlinePatterns = [
      /within (\d+) (hours?|days?|weeks?)/gi,
      /by (\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
      /deadline[:\s]+([^\n.]+)/gi,
      /respond by ([^\n.]+)/gi,
    ];
    for (const pattern of deadlinePatterns) {
      let m;
      while ((m = pattern.exec(content)) !== null) {
        deadlines.push({
          description: m[0],
          isUrgent: /hour|24|48|urgent/i.test(m[0]),
        });
      }
    }

    // Extract threats
    const threats: string[] = [];
    const threatPatterns = [
      /will (?:take|pursue) legal action/gi,
      /contact(?:ing)? (?:our )?(?:lawyers?|attorneys?|counsel)/gi,
      /file a complaint with/gi,
      /report(?:ing)? to (?:the )?(?:ICO|DPA|FTC|AG)/gi,
      /statutory damages/gi,
    ];
    for (const pattern of threatPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        threats.push(...matches);
      }
    }

    // Build key points
    const keyPoints: string[] = [];
    if (complaintType === "CLASSIFICATION_DISPUTE" || complaintType === "DATA_PROCESSOR_NOTICE") {
      keyPoints.push("Sender claims to be a Data Processor, not a Data Broker");
      if (legalReferences.length > 0) {
        keyPoints.push(`References: ${legalReferences.join(", ")}`);
      }
    }
    if (threats.length > 0) {
      keyPoints.push(`Contains ${threats.length} threat(s)`);
    }
    if (mentionedEntities.length > 0) {
      keyPoints.push(`Mentions entities: ${mentionedEntities.slice(0, 3).join(", ")}`);
    }

    // Extract requested actions
    const requestedActions: string[] = [];
    const actionPatterns = [
      /please (?:immediately )?(?:remove|delete|cease)/gi,
      /we (?:request|demand|require) (?:that )?(?:you )?/gi,
      /stop sending/gi,
      /add.*to.*blocklist/gi,
      /update.*classification/gi,
    ];
    for (const pattern of actionPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        requestedActions.push(...matches.map((m) => m.trim()));
      }
    }

    // Determine classification implications if it's a classification dispute
    let classificationImplications: ParseComplianceComplaintResult["classificationImplications"];
    if (complaintType === "CLASSIFICATION_DISPUTE" || complaintType === "DATA_PROCESSOR_NOTICE") {
      // Try to extract the domain they're complaining about
      const senderDomain = senderEmail.split("@")[1];
      classificationImplications = {
        domain: senderDomain,
        claimedClassification: "DATA_PROCESSOR",
        shouldReclassify: severity === "HIGH" || severity === "CRITICAL",
        evidence: keyPoints,
      };
    }

    // Generate suggested response
    let suggestedResponse = "";
    switch (complaintType) {
      case "CLASSIFICATION_DISPUTE":
      case "DATA_PROCESSOR_NOTICE":
        suggestedResponse =
          "Thank you for reaching out. We take data classification seriously. " +
          "We have flagged your domain for review and will update our records accordingly. " +
          "We will ensure no further removal requests are sent to your organization.";
        break;
      case "LEGAL_THREAT":
      case "CEASE_DESIST":
        suggestedResponse =
          "This matter has been escalated to our legal team for immediate review. " +
          "We take such matters seriously and will respond within the required timeframe.";
        break;
      default:
        suggestedResponse =
          "Thank you for contacting us. We have received your inquiry and will respond shortly.";
    }

    return {
      complaintType,
      severity,
      requiresImmediateAction,
      sender: {
        name: senderName,
        email: senderEmail,
        company: senderEmail.split("@")[1],
        domains: [senderEmail.split("@")[1]],
      },
      mentionedEntities,
      legalReferences,
      deadlines,
      keyPoints,
      requestedActions,
      threats,
      suggestedPriority: requiresImmediateAction ? "URGENT" : severity === "CRITICAL" ? "URGENT" : severity === "HIGH" ? "HIGH" : "NORMAL",
      suggestedCategory: complaintType === "LEGAL_THREAT" ? "LEGAL" : "COMPLIANCE",
      suggestedResponse,
      classificationImplications,
    };
  }

  /**
   * Use AI to parse complex complaints
   */
  private async parseComplaintWithAI(
    content: string,
    subject: string,
    senderEmail: string,
    senderName?: string,
    ruleBasedResult?: ParseComplianceComplaintResult
  ): Promise<ParseComplianceComplaintResult> {
    if (!this.anthropic) {
      throw new Error("AI not available");
    }

    const prompt = `Analyze this compliance email and extract key information:

From: ${senderName || "Unknown"} <${senderEmail}>
Subject: ${subject}

Content:
${content.slice(0, 3000)}

Initial analysis detected: ${ruleBasedResult?.complaintType || "Unknown"} (severity: ${ruleBasedResult?.severity || "Unknown"})

Please analyze and provide:
1. Complaint type (LEGAL_THREAT, CEASE_DESIST, CLASSIFICATION_DISPUTE, GDPR_REQUEST, CCPA_REQUEST, DATA_PROCESSOR_NOTICE, OPT_OUT_CONFIRMATION, REMOVAL_DISPUTE, GENERAL_INQUIRY, or OTHER)
2. Severity (CRITICAL, HIGH, MEDIUM, or LOW)
3. Key points (main concerns/claims)
4. Requested actions (what they want us to do)
5. Any threats made
6. Legal references cited
7. Deadlines mentioned
8. If claiming to be a Data Processor, evaluate the validity of that claim

Respond in JSON format.`;

    const response = await this.anthropic.messages.create({
      model: this.config.model || "claude-sonnet-4-5-20250929",
      max_tokens: 1000,
      temperature: 0.1,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Return rule-based result if AI parsing fails
      return ruleBasedResult!;
    }

    const aiResponse = JSON.parse(jsonMatch[0]);

    // Merge AI insights with rule-based results
    return {
      ...ruleBasedResult!,
      complaintType: aiResponse.complaintType || ruleBasedResult?.complaintType || "OTHER",
      severity: aiResponse.severity || ruleBasedResult?.severity || "MEDIUM",
      keyPoints: aiResponse.keyPoints || ruleBasedResult?.keyPoints || [],
      requestedActions: aiResponse.requestedActions || ruleBasedResult?.requestedActions || [],
      threats: aiResponse.threats || ruleBasedResult?.threats || [],
      legalReferences: aiResponse.legalReferences || ruleBasedResult?.legalReferences || [],
      suggestedResponse: aiResponse.suggestedResponse || ruleBasedResult?.suggestedResponse || "",
    };
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
// EXPORTS
// ============================================================================

let complianceAgentInstance: ComplianceAgent | null = null;

export function getComplianceAgent(): ComplianceAgent {
  if (!complianceAgentInstance) {
    complianceAgentInstance = new ComplianceAgent();
    registerAgent(complianceAgentInstance);
  }
  return complianceAgentInstance;
}

export async function checkCompliance(
  jurisdiction?: string
): Promise<ComplianceCheckResult> {
  const agent = getComplianceAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<ComplianceCheckResult>(
    "check-compliance",
    { jurisdiction },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Compliance check failed");
}

export async function generateLegalTemplate(
  type: LegalTemplateInput["type"],
  userId: string,
  brokerName?: string
): Promise<LegalTemplateResult> {
  const agent = getComplianceAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.ON_DEMAND,
  });

  const result = await agent.execute<LegalTemplateResult>(
    "generate-template",
    { type, userId, brokerName },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Template generation failed");
}

// ============================================================================
// NEW CAPABILITY CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Validate entity classification before sending removal requests.
 * Returns classification result with recommendation on whether to proceed.
 *
 * @example
 * const result = await validateEntityClassification({ domain: "syndigo.com" });
 * if (result.blockedFromRemoval) {
 *   console.log(`Blocked: ${result.reasoning}`);
 * }
 */
export async function validateEntityClassification(
  input: ValidateEntityClassificationInput
): Promise<ValidateEntityClassificationResult> {
  const agent = getComplianceAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.ON_DEMAND,
  });

  const result = await agent.execute<ValidateEntityClassificationResult>(
    "validate-entity-classification",
    input,
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  // Return a safe default on error (fail open)
  return {
    domain: input.domain,
    classification: "UNKNOWN",
    confidence: 0,
    source: "RULE_BASED",
    reasoning: result.error?.message || "Classification failed",
    blockedFromRemoval: false,
    suggestedAction: "PROCEED",
  };
}

/**
 * Audit blocklist entries for compliance.
 * Checks for stale entries, missing legal justification, etc.
 *
 * @example
 * const audit = await assessBlocklistCompliance({ staleDays: 90 });
 * console.log(`Health: ${audit.overallHealth}, Issues: ${audit.entriesWithIssues}`);
 */
export async function assessBlocklistCompliance(
  input: AssessBlocklistComplianceInput = {}
): Promise<AssessBlocklistComplianceResult> {
  const agent = getComplianceAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<AssessBlocklistComplianceResult>(
    "assess-blocklist-compliance",
    input,
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Blocklist audit failed");
}

/**
 * Detect processor relationships for an entity.
 * Identifies parent companies, subsidiaries, and blocklisted relationships.
 *
 * @example
 * const relationships = await detectProcessorRelationships({ domain: "powerreviews.com" });
 * if (relationships.hasBlocklistedRelationship) {
 *   console.log(`Blocklisted via: ${relationships.blocklistedRelationships.join(", ")}`);
 * }
 */
export async function detectProcessorRelationships(
  input: DetectProcessorRelationshipsInput
): Promise<DetectProcessorRelationshipsResult> {
  const agent = getComplianceAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.ON_DEMAND,
  });

  const result = await agent.execute<DetectProcessorRelationshipsResult>(
    "detect-processor-relationships",
    input,
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  // Return safe default on error
  return {
    domain: input.domain,
    relationships: [],
    hasBlocklistedRelationship: false,
    blocklistedRelationships: [],
    recommendation: "SAFE",
    reasoning: result.error?.message || "Relationship detection failed",
  };
}

/**
 * Parse a compliance complaint email.
 * Extracts complaint type, severity, legal threats, deadlines, etc.
 *
 * @example
 * const parsed = await parseComplianceComplaint({
 *   emailContent: "We are a data processor, not a broker...",
 *   senderEmail: "legal@company.com",
 *   subject: "Data Classification Dispute",
 * });
 * console.log(`Type: ${parsed.complaintType}, Severity: ${parsed.severity}`);
 */
export async function parseComplianceComplaint(
  input: ParseComplianceComplaintInput
): Promise<ParseComplianceComplaintResult> {
  const agent = getComplianceAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.WEBHOOK,
  });

  const result = await agent.execute<ParseComplianceComplaintResult>(
    "parse-compliance-complaint",
    input,
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Complaint parsing failed");
}

export { ComplianceAgent };
export default getComplianceAgent;
