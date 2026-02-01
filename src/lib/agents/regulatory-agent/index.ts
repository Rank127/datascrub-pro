/**
 * Regulatory Agent
 *
 * Handles regulatory operations including:
 * - New privacy law tracking
 * - Jurisdiction handling
 * - International expansion support
 */

import { nanoid } from "nanoid";
import { BaseAgent, createAgentContext } from "../base-agent";
import { AgentCapability, AgentContext, AgentDomains, AgentModes, AgentResult, InvocationTypes } from "../types";
import { registerAgent } from "../registry";

const AGENT_ID = "regulatory-agent";
const AGENT_VERSION = "1.0.0";

interface LawTrackingInput { regions?: string[]; }
interface LawTrackingResult {
  tracked: number;
  laws: Array<{ jurisdiction: string; lawName: string; status: string; effectiveDate?: string; keyRequirements: string[]; impact: string; }>;
  upcoming: Array<{ jurisdiction: string; law: string; expectedDate: string; preparation: string; }>;
}

interface JurisdictionInput { userId?: string; }
interface JurisdictionResult {
  supported: string[];
  userJurisdiction: string;
  applicableLaws: Array<{ law: string; rights: string[]; obligations: string[]; }>;
  recommendations: string[];
}

interface ExpansionInput { targetRegions?: string[]; }
interface ExpansionResult {
  regions: Array<{ region: string; marketSize: string; regulatoryComplexity: string; competitorPresence: string; recommendation: string; requirements: string[]; }>;
  prioritization: string[];
  timeline: string;
}

class RegulatoryAgent extends BaseAgent {
  readonly id = AGENT_ID;
  readonly name = "Regulatory Agent";
  readonly domain = AgentDomains.SPECIALIZED;
  readonly mode = AgentModes.HYBRID;
  readonly version = AGENT_VERSION;
  readonly description = "Tracks privacy laws, handles jurisdictions, and supports international expansion";

  readonly capabilities: AgentCapability[] = [
    { id: "track-laws", name: "Track Laws", description: "Monitor new privacy legislation", requiresAI: true, estimatedTokens: 500 },
    { id: "handle-jurisdiction", name: "Handle Jurisdiction", description: "Determine applicable laws by jurisdiction", requiresAI: false },
    { id: "expansion-support", name: "Expansion Support", description: "Support international expansion", requiresAI: true, estimatedTokens: 600 },
  ];

  protected getSystemPrompt(): string {
    return `You are the Regulatory Agent for GhostMyData. Track privacy regulations worldwide and ensure compliance across all jurisdictions.`;
  }

  protected registerHandlers(): void {
    this.handlers.set("track-laws", this.handleTrackLaws.bind(this));
    this.handlers.set("handle-jurisdiction", this.handleJurisdiction.bind(this));
    this.handlers.set("expansion-support", this.handleExpansionSupport.bind(this));
  }

  private async handleTrackLaws(input: unknown, context: AgentContext): Promise<AgentResult<LawTrackingResult>> {
    const startTime = Date.now();
    const { regions = ["US", "EU", "UK", "CA", "AU"] } = input as LawTrackingInput;
    try {
      const laws = [
        { jurisdiction: "California", lawName: "CPRA", status: "Active", effectiveDate: "2023-01-01", keyRequirements: ["Right to delete", "Right to opt-out", "Data minimization"], impact: "HIGH" },
        { jurisdiction: "Virginia", lawName: "VCDPA", status: "Active", effectiveDate: "2023-01-01", keyRequirements: ["Right to access", "Right to delete", "Opt-out of sale"], impact: "MEDIUM" },
        { jurisdiction: "Colorado", lawName: "CPA", status: "Active", effectiveDate: "2023-07-01", keyRequirements: ["Universal opt-out", "Data protection assessments"], impact: "MEDIUM" },
        { jurisdiction: "EU", lawName: "GDPR", status: "Active", keyRequirements: ["Lawful basis", "Right to erasure", "Data portability", "Breach notification"], impact: "HIGH" },
        { jurisdiction: "UK", lawName: "UK GDPR", status: "Active", keyRequirements: ["Same as EU GDPR", "ICO oversight"], impact: "HIGH" },
      ].filter(l => regions.some(r => l.jurisdiction.includes(r) || r === "EU" && l.jurisdiction === "EU"));

      const upcoming = [
        { jurisdiction: "Texas", law: "TDPSA", expectedDate: "2024-07-01", preparation: "Review data processing for Texas residents" },
        { jurisdiction: "Oregon", law: "OCPA", expectedDate: "2024-07-01", preparation: "Update privacy notices" },
      ];

      return this.createSuccessResult<LawTrackingResult>({
        tracked: laws.length,
        laws,
        upcoming,
      }, { capability: "track-laws", requestId: context.requestId, duration: Date.now() - startTime, usedFallback: false, executedAt: new Date() });
    } catch (error) {
      return { success: false, error: { code: "LAW_ERROR", message: error instanceof Error ? error.message : "Failed", retryable: true }, needsHumanReview: false, metadata: { agentId: this.id, capability: "track-laws", requestId: context.requestId, duration: Date.now() - startTime, usedFallback: false, executedAt: new Date() } };
    }
  }

  private async handleJurisdiction(input: unknown, context: AgentContext): Promise<AgentResult<JurisdictionResult>> {
    const startTime = Date.now();
    try {
      const supported = ["US", "CA", "UK", "EU", "AU"];
      const applicableLaws = [
        { law: "CCPA/CPRA", rights: ["Right to know", "Right to delete", "Right to opt-out"], obligations: ["Honor requests within 45 days", "Provide opt-out mechanism"] },
        { law: "GDPR", rights: ["Right to erasure", "Right to access", "Right to portability"], obligations: ["Process within 30 days", "Lawful basis required"] },
      ];

      return this.createSuccessResult<JurisdictionResult>({
        supported,
        userJurisdiction: "US-CA", // Would determine from user data
        applicableLaws,
        recommendations: ["Ensure CCPA compliance for California users", "Maintain GDPR compliance for EU users"],
      }, { capability: "handle-jurisdiction", requestId: context.requestId, duration: Date.now() - startTime, usedFallback: false, executedAt: new Date() });
    } catch (error) {
      return { success: false, error: { code: "JURISDICTION_ERROR", message: error instanceof Error ? error.message : "Failed", retryable: true }, needsHumanReview: false, metadata: { agentId: this.id, capability: "handle-jurisdiction", requestId: context.requestId, duration: Date.now() - startTime, usedFallback: false, executedAt: new Date() } };
    }
  }

  private async handleExpansionSupport(input: unknown, context: AgentContext): Promise<AgentResult<ExpansionResult>> {
    const startTime = Date.now();
    const { targetRegions = ["EU", "UK", "AU", "CA"] } = input as ExpansionInput;
    try {
      const regions = targetRegions.map(region => ({
        region,
        marketSize: region === "EU" ? "Large" : region === "UK" ? "Medium" : "Small",
        regulatoryComplexity: region === "EU" ? "High" : "Medium",
        competitorPresence: region === "EU" ? "High" : "Low",
        recommendation: region === "EU" ? "Priority expansion target" : "Secondary market",
        requirements: region === "EU"
          ? ["GDPR compliance", "EU representative", "DPO appointment", "Local data brokers research"]
          : ["Local privacy law compliance", "Broker network expansion"],
      }));

      return this.createSuccessResult<ExpansionResult>({
        regions,
        prioritization: ["EU", "UK", "CA", "AU"],
        timeline: "Q1: EU preparation, Q2: UK launch, Q3-Q4: CA and AU",
      }, { capability: "expansion-support", requestId: context.requestId, duration: Date.now() - startTime, usedFallback: false, executedAt: new Date() });
    } catch (error) {
      return { success: false, error: { code: "EXPANSION_ERROR", message: error instanceof Error ? error.message : "Failed", retryable: true }, needsHumanReview: false, metadata: { agentId: this.id, capability: "expansion-support", requestId: context.requestId, duration: Date.now() - startTime, usedFallback: false, executedAt: new Date() } };
    }
  }

  protected async executeRuleBased<T>(capability: string, input: unknown, context: AgentContext): Promise<AgentResult<T>> {
    const handler = this.handlers.get(capability);
    if (handler) return handler(input, context) as Promise<AgentResult<T>>;
    return { success: false, error: { code: "NO_HANDLER", message: `No handler for: ${capability}`, retryable: false }, needsHumanReview: true, metadata: { agentId: this.id, capability, requestId: context.requestId, duration: 0, usedFallback: true, executedAt: new Date() } };
  }
}

let regulatoryAgentInstance: RegulatoryAgent | null = null;

export function getRegulatoryAgent(): RegulatoryAgent {
  if (!regulatoryAgentInstance) {
    regulatoryAgentInstance = new RegulatoryAgent();
    registerAgent(regulatoryAgentInstance);
  }
  return regulatoryAgentInstance;
}

export async function trackPrivacyLaws(regions?: string[]): Promise<LawTrackingResult> {
  const agent = getRegulatoryAgent();
  const context = createAgentContext({ requestId: nanoid(), invocationType: InvocationTypes.CRON });
  const result = await agent.execute<LawTrackingResult>("track-laws", { regions }, context);
  if (result.success && result.data) return result.data;
  throw new Error(result.error?.message || "Law tracking failed");
}

export { RegulatoryAgent };
export default getRegulatoryAgent;
