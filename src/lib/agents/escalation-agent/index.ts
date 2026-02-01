/**
 * Escalation Agent
 *
 * Handles escalation operations including:
 * - Stubborn broker handling
 * - Legal escalation
 * - Complex case management
 */

import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";
import { BaseAgent, createAgentContext } from "../base-agent";
import { AgentCapability, AgentContext, AgentDomains, AgentModes, AgentResult, InvocationTypes } from "../types";
import { registerAgent } from "../registry";

const AGENT_ID = "escalation-agent";
const AGENT_VERSION = "1.0.0";

interface StubbornBrokerInput { brokerId?: string; limit?: number; }
interface StubbornBrokerResult {
  analyzed: number;
  stubbornBrokers: Array<{ brokerId: string; name: string; failedAttempts: number; lastAttempt: string; recommendedAction: string; }>;
  escalationQueue: Array<{ brokerId: string; priority: string; action: string; }>;
}

interface LegalEscalationInput { caseId?: string; }
interface LegalEscalationResult {
  pendingCases: number;
  cases: Array<{ caseId: string; brokerId: string; brokerName: string; status: string; daysOpen: number; legalBasis: string; nextStep: string; }>;
  templates: string[];
}

interface ComplexCaseInput { userId?: string; }
interface ComplexCaseResult {
  cases: Array<{ caseId: string; userId: string; complexity: string; issues: string[]; suggestedApproach: string; estimatedResolution: string; }>;
  insights: string[];
}

class EscalationAgent extends BaseAgent {
  readonly id = AGENT_ID;
  readonly name = "Escalation Agent";
  readonly domain = AgentDomains.SPECIALIZED;
  readonly mode = AgentModes.HYBRID;
  readonly version = AGENT_VERSION;
  readonly description = "Handles stubborn brokers, legal escalation, and complex cases";

  readonly capabilities: AgentCapability[] = [
    { id: "handle-stubborn", name: "Handle Stubborn Brokers", description: "Manage non-compliant brokers", requiresAI: true, estimatedTokens: 500 },
    { id: "legal-escalation", name: "Legal Escalation", description: "Escalate to legal action", requiresAI: true, estimatedTokens: 600 },
    { id: "complex-cases", name: "Complex Cases", description: "Manage complex removal cases", requiresAI: true, estimatedTokens: 500 },
  ];

  protected getSystemPrompt(): string {
    return `You are the Escalation Agent for GhostMyData. Handle difficult cases requiring escalation, including stubborn brokers and legal action.`;
  }

  protected registerHandlers(): void {
    this.handlers.set("handle-stubborn", this.handleStubbornBrokers.bind(this));
    this.handlers.set("legal-escalation", this.handleLegalEscalation.bind(this));
    this.handlers.set("complex-cases", this.handleComplexCases.bind(this));
  }

  private async handleStubbornBrokers(input: unknown, context: AgentContext): Promise<AgentResult<StubbornBrokerResult>> {
    const startTime = Date.now();
    try {
      // Get failed removals with their exposure (which has broker info)
      const failedRemovals = await prisma.removalRequest.findMany({
        where: { status: "FAILED" },
        include: {
          exposure: {
            select: { source: true, sourceName: true },
          },
        },
      });

      // Group by broker source
      const brokerFailures = new Map<string, { name: string; count: number; lastAttempt: Date }>();
      for (const removal of failedRemovals) {
        const source = removal.exposure.source;
        const existing = brokerFailures.get(source);
        if (existing) {
          existing.count++;
          if (removal.updatedAt > existing.lastAttempt) {
            existing.lastAttempt = removal.updatedAt;
          }
        } else {
          brokerFailures.set(source, {
            name: removal.exposure.sourceName,
            count: 1,
            lastAttempt: removal.updatedAt,
          });
        }
      }

      const stubbornBrokers: StubbornBrokerResult["stubbornBrokers"] = [];
      const escalationQueue: StubbornBrokerResult["escalationQueue"] = [];

      // Filter to brokers with 3+ failures
      for (const [brokerId, data] of brokerFailures) {
        if (data.count >= 3) {
          stubbornBrokers.push({
            brokerId,
            name: data.name,
            failedAttempts: data.count,
            lastAttempt: data.lastAttempt.toISOString(),
            recommendedAction: data.count >= 5 ? "Legal escalation" : "Alternative approach",
          });
          if (data.count >= 5) {
            escalationQueue.push({ brokerId, priority: "HIGH", action: "Prepare cease and desist" });
          }
        }
      }

      return this.createSuccessResult<StubbornBrokerResult>({
        analyzed: brokerFailures.size,
        stubbornBrokers: stubbornBrokers.slice(0, 20),
        escalationQueue,
      }, { capability: "handle-stubborn", requestId: context.requestId, duration: Date.now() - startTime, usedFallback: false, executedAt: new Date() });
    } catch (error) {
      return { success: false, error: { code: "STUBBORN_ERROR", message: error instanceof Error ? error.message : "Failed", retryable: true }, needsHumanReview: true, metadata: { agentId: this.id, capability: "handle-stubborn", requestId: context.requestId, duration: Date.now() - startTime, usedFallback: false, executedAt: new Date() } };
    }
  }

  private async handleLegalEscalation(input: unknown, context: AgentContext): Promise<AgentResult<LegalEscalationResult>> {
    const startTime = Date.now();
    try {
      // Simulated legal cases
      const cases = [
        { caseId: "legal-001", brokerId: "broker-x", brokerName: "DataBrokerX", status: "PENDING", daysOpen: 45, legalBasis: "GDPR Article 17", nextStep: "Send formal demand letter" },
        { caseId: "legal-002", brokerId: "broker-y", brokerName: "PeopleSearch Pro", status: "IN_PROGRESS", daysOpen: 30, legalBasis: "CCPA §1798.105", nextStep: "Await response to demand" },
      ];

      return this.createSuccessResult<LegalEscalationResult>({
        pendingCases: cases.length,
        cases,
        templates: ["Cease and Desist", "GDPR Demand", "CCPA Demand", "Regulatory Complaint"],
      }, { capability: "legal-escalation", requestId: context.requestId, duration: Date.now() - startTime, usedFallback: false, executedAt: new Date() });
    } catch (error) {
      return { success: false, error: { code: "LEGAL_ERROR", message: error instanceof Error ? error.message : "Failed", retryable: true }, needsHumanReview: true, metadata: { agentId: this.id, capability: "legal-escalation", requestId: context.requestId, duration: Date.now() - startTime, usedFallback: false, executedAt: new Date() } };
    }
  }

  private async handleComplexCases(input: unknown, context: AgentContext): Promise<AgentResult<ComplexCaseResult>> {
    const startTime = Date.now();
    const { userId } = input as ComplexCaseInput;
    try {
      const users = await prisma.user.findMany({
        where: userId ? { id: userId } : { exposures: { some: { severity: "CRITICAL" } } },
        take: 20,
        include: { _count: { select: { exposures: true, removalRequests: true } } },
      });

      const cases = users.filter(u => u._count.exposures > 20 || u._count.removalRequests > 30).map(u => ({
        caseId: `case-${u.id.slice(0, 8)}`,
        userId: u.id,
        complexity: u._count.exposures > 50 ? "HIGH" : "MEDIUM",
        issues: ["High volume exposures", "Multiple failed removals"],
        suggestedApproach: "Prioritized batch removal with manual follow-up",
        estimatedResolution: "2-4 weeks",
      }));

      return this.createSuccessResult<ComplexCaseResult>({
        cases,
        insights: [`${cases.length} complex cases identified`],
      }, { capability: "complex-cases", requestId: context.requestId, duration: Date.now() - startTime, usedFallback: false, executedAt: new Date() });
    } catch (error) {
      return { success: false, error: { code: "COMPLEX_ERROR", message: error instanceof Error ? error.message : "Failed", retryable: true }, needsHumanReview: true, metadata: { agentId: this.id, capability: "complex-cases", requestId: context.requestId, duration: Date.now() - startTime, usedFallback: false, executedAt: new Date() } };
    }
  }

  protected async executeRuleBased<T>(capability: string, input: unknown, context: AgentContext): Promise<AgentResult<T>> {
    const handler = this.handlers.get(capability);
    if (handler) return handler(input, context) as Promise<AgentResult<T>>;
    return { success: false, error: { code: "NO_HANDLER", message: `No handler for: ${capability}`, retryable: false }, needsHumanReview: true, metadata: { agentId: this.id, capability, requestId: context.requestId, duration: 0, usedFallback: true, executedAt: new Date() } };
  }
}

let escalationAgentInstance: EscalationAgent | null = null;

export function getEscalationAgent(): EscalationAgent {
  if (!escalationAgentInstance) {
    escalationAgentInstance = new EscalationAgent();
    registerAgent(escalationAgentInstance);
  }
  return escalationAgentInstance;
}

export async function handleStubbornBrokers(): Promise<StubbornBrokerResult> {
  const agent = getEscalationAgent();
  const context = createAgentContext({ requestId: nanoid(), invocationType: InvocationTypes.CRON });
  const result = await agent.execute<StubbornBrokerResult>("handle-stubborn", {}, context);
  if (result.success && result.data) return result.data;
  throw new Error(result.error?.message || "Stubborn broker handling failed");
}

export { EscalationAgent };
export default getEscalationAgent;
