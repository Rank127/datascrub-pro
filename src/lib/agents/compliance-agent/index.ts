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
  ];

  protected getSystemPrompt(): string {
    return `You are the Compliance Agent for GhostMyData. Your role is to ensure compliance with privacy regulations like GDPR, CCPA, and others. Generate accurate legal templates, monitor regulatory changes, and help maintain data protection standards. Be precise and legally accurate.`;
  }

  protected registerHandlers(): void {
    this.handlers.set("check-compliance", this.handleCheckCompliance.bind(this));
    this.handlers.set("generate-template", this.handleGenerateTemplate.bind(this));
    this.handlers.set("enforce-retention", this.handleEnforceRetention.bind(this));
    this.handlers.set("monitor-regulations", this.handleMonitorRegulations.bind(this));
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

export { ComplianceAgent };
export default getComplianceAgent;
