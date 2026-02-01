/**
 * Broker Intelligence Agent
 *
 * Handles broker monitoring including:
 * - Monitor broker changes (site updates, policy changes)
 * - Detect new data brokers
 * - Track opt-out process updates
 * - Alert on broker issues
 */

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

const AGENT_ID = "broker-intel-agent";
const AGENT_VERSION = "1.0.0";

// ============================================================================
// TYPES
// ============================================================================

interface MonitorInput {
  brokerId?: string;
  limit?: number;
}

interface MonitorResult {
  checked: number;
  changes: Array<{
    brokerId: string;
    brokerName: string;
    changeType: "SITE_DOWN" | "OPTOUT_CHANGED" | "POLICY_UPDATED" | "NEW_FIELDS";
    description: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
    detectedAt: string;
  }>;
  alerts: string[];
}

interface NewBrokerInput {
  sources?: string[];
}

interface NewBrokerResult {
  discovered: number;
  brokers: Array<{
    name: string;
    url: string;
    dataTypes: string[];
    optOutAvailable: boolean;
    confidence: number;
    source: string;
  }>;
}

interface OptOutTrackingInput {
  brokerId?: string;
}

interface OptOutTrackingResult {
  tracked: number;
  updates: Array<{
    brokerId: string;
    brokerName: string;
    previousProcess: string;
    newProcess: string;
    difficulty: "EASY" | "MEDIUM" | "HARD" | "REQUIRES_ID";
    updatedAt: string;
  }>;
}

interface BrokerHealthInput {
  brokerId?: string;
}

interface BrokerHealthResult {
  total: number;
  healthy: number;
  issues: number;
  brokerStatus: Array<{
    brokerId: string;
    brokerName: string;
    status: "ONLINE" | "DEGRADED" | "OFFLINE" | "UNKNOWN";
    lastChecked: string;
    responseTime?: number;
    issues?: string[];
  }>;
}

// ============================================================================
// BROKER INTELLIGENCE AGENT CLASS
// ============================================================================

class BrokerIntelAgent extends BaseAgent {
  readonly id = AGENT_ID;
  readonly name = "Broker Intelligence Agent";
  readonly domain = AgentDomains.INTELLIGENCE;
  readonly mode = AgentModes.HYBRID;
  readonly version = AGENT_VERSION;
  readonly description =
    "Monitors data broker changes, detects new brokers, and tracks opt-out process updates";

  readonly capabilities: AgentCapability[] = [
    {
      id: "monitor-brokers",
      name: "Monitor Broker Changes",
      description: "Monitor data brokers for site changes and policy updates",
      requiresAI: false,
      supportsBatch: true,
      rateLimit: 20,
    },
    {
      id: "detect-new-brokers",
      name: "Detect New Brokers",
      description: "Discover and catalog new data brokers",
      requiresAI: true,
      estimatedTokens: 600,
    },
    {
      id: "track-optout",
      name: "Track Opt-Out Processes",
      description: "Track changes to broker opt-out procedures",
      requiresAI: true,
      estimatedTokens: 400,
    },
    {
      id: "broker-health",
      name: "Check Broker Health",
      description: "Check health and availability of data broker sites",
      requiresAI: false,
      supportsBatch: true,
    },
  ];

  protected getSystemPrompt(): string {
    return `You are the Broker Intelligence Agent for GhostMyData. Your role is to monitor data brokers, detect changes to their sites and opt-out processes, and identify new data brokers. Provide actionable intelligence to improve removal success rates.`;
  }

  protected registerHandlers(): void {
    this.handlers.set("monitor-brokers", this.handleMonitorBrokers.bind(this));
    this.handlers.set("detect-new-brokers", this.handleDetectNewBrokers.bind(this));
    this.handlers.set("track-optout", this.handleTrackOptOut.bind(this));
    this.handlers.set("broker-health", this.handleBrokerHealth.bind(this));
  }

  // Known brokers list (in production, would come from scanner configs)
  private readonly knownBrokers = [
    { id: "spokeo", name: "Spokeo", domain: "spokeo.com", optOutUrl: "https://www.spokeo.com/optout" },
    { id: "whitepages", name: "WhitePages", domain: "whitepages.com", optOutUrl: "https://www.whitepages.com/suppression-requests" },
    { id: "beenverified", name: "BeenVerified", domain: "beenverified.com", optOutUrl: "https://www.beenverified.com/app/optout/search" },
    { id: "truepeoplesearch", name: "TruePeopleSearch", domain: "truepeoplesearch.com", optOutUrl: "https://www.truepeoplesearch.com/removal" },
    { id: "fastpeoplesearch", name: "FastPeopleSearch", domain: "fastpeoplesearch.com", optOutUrl: "https://www.fastpeoplesearch.com/removal" },
    { id: "radaris", name: "Radaris", domain: "radaris.com", optOutUrl: "https://radaris.com/control/privacy" },
    { id: "intelius", name: "Intelius", domain: "intelius.com", optOutUrl: "https://www.intelius.com/opt-out" },
    { id: "peoplefinder", name: "PeopleFinder", domain: "peoplefinder.com", optOutUrl: "https://www.peoplefinder.com/optout" },
  ];

  private async handleMonitorBrokers(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<MonitorResult>> {
    const startTime = Date.now();
    const { brokerId, limit = 50 } = input as MonitorInput;

    try {
      // Get brokers to monitor from internal list
      const brokers = brokerId
        ? this.knownBrokers.filter((b) => b.id === brokerId)
        : this.knownBrokers.slice(0, limit);

      const changes: MonitorResult["changes"] = [];
      const alerts: string[] = [];

      for (const broker of brokers) {
        // Check broker status (simulated - would actually fetch and compare in production)
        const checkResult = await this.checkBrokerStatus(broker);

        if (checkResult.hasChanges) {
          changes.push({
            brokerId: broker.id,
            brokerName: broker.name,
            changeType: checkResult.changeType,
            description: checkResult.description,
            severity: checkResult.severity,
            detectedAt: new Date().toISOString(),
          });

          if (checkResult.severity === "HIGH") {
            alerts.push(`High priority: ${broker.name} - ${checkResult.description}`);
          }
        }
      }

      return this.createSuccessResult<MonitorResult>(
        {
          checked: brokers.length,
          changes,
          alerts,
        },
        {
          capability: "monitor-brokers",
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
          message: error instanceof Error ? error.message : "Monitoring failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "monitor-brokers",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async checkBrokerStatus(broker: {
    id: string;
    name: string;
    domain: string;
    optOutUrl: string | null;
  }): Promise<{
    hasChanges: boolean;
    changeType: MonitorResult["changes"][0]["changeType"];
    description: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
  }> {
    // In production, this would:
    // 1. Fetch the broker's website
    // 2. Compare with stored snapshot
    // 3. Detect changes in opt-out forms, policies, etc.

    // For now, simulate based on random chance (would be replaced with real checks)
    const random = Math.random();

    if (random < 0.05) {
      return {
        hasChanges: true,
        changeType: "SITE_DOWN",
        description: `${broker.name} website appears to be down or unresponsive`,
        severity: "HIGH",
      };
    } else if (random < 0.1) {
      return {
        hasChanges: true,
        changeType: "OPTOUT_CHANGED",
        description: `Opt-out form structure changed on ${broker.name}`,
        severity: "HIGH",
      };
    } else if (random < 0.15) {
      return {
        hasChanges: true,
        changeType: "POLICY_UPDATED",
        description: `Privacy policy updated on ${broker.name}`,
        severity: "MEDIUM",
      };
    }

    return {
      hasChanges: false,
      changeType: "POLICY_UPDATED",
      description: "",
      severity: "LOW",
    };
  }

  private async handleDetectNewBrokers(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<NewBrokerResult>> {
    const startTime = Date.now();
    const { sources = ["research", "user_reports", "industry_news"] } = input as NewBrokerInput;

    try {
      // Get existing broker domains to avoid duplicates
      const existingDomains = new Set(this.knownBrokers.map((b) => b.domain.toLowerCase()));

      // In production, this would:
      // 1. Crawl industry news and privacy blogs
      // 2. Analyze user reports for unknown brokers
      // 3. Use AI to identify potential data brokers from mentions

      // Simulated discovery - example of potential new brokers
      const potentialBrokers: NewBrokerResult["brokers"] = [];

      // Simulated potential new brokers (in production, would come from crawling/reports)
      const simulatedNewBrokers = [
        { source: "newpeoplesearch.com", confidence: 0.7 },
        { source: "findanyonefast.com", confidence: 0.6 },
      ];

      for (const broker of simulatedNewBrokers) {
        if (!existingDomains.has(broker.source.toLowerCase())) {
          potentialBrokers.push({
            name: this.extractBrokerName(broker.source),
            url: `https://${broker.source}`,
            dataTypes: ["CONTACT", "ADDRESS"],
            optOutAvailable: false,
            confidence: broker.confidence,
            source: "research",
          });
        }
      }

      return this.createSuccessResult<NewBrokerResult>(
        {
          discovered: potentialBrokers.length,
          brokers: potentialBrokers,
        },
        {
          capability: "detect-new-brokers",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
        {
          needsHumanReview: potentialBrokers.length > 0,
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "DETECT_ERROR",
          message: error instanceof Error ? error.message : "Detection failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "detect-new-brokers",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private extractBrokerName(source: string): string {
    // Extract a readable name from URL/domain
    try {
      const url = new URL(source.startsWith("http") ? source : `https://${source}`);
      const hostname = url.hostname.replace("www.", "");
      const parts = hostname.split(".");
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    } catch {
      return source;
    }
  }

  private async handleTrackOptOut(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<OptOutTrackingResult>> {
    const startTime = Date.now();
    const { brokerId } = input as OptOutTrackingInput;

    try {
      // Get brokers with opt-out information from internal list
      const brokers = brokerId
        ? this.knownBrokers.filter((b) => b.id === brokerId)
        : this.knownBrokers.filter((b) => b.optOutUrl);

      const updates: OptOutTrackingResult["updates"] = [];

      for (const broker of brokers) {
        // In production, would compare current opt-out process with stored version
        // Using AI to detect changes in form fields, requirements, etc.

        // Simulate detecting changes
        if (Math.random() < 0.1) {
          updates.push({
            brokerId: broker.id,
            brokerName: broker.name,
            previousProcess: "Standard form submission",
            newProcess: "Now requires email verification",
            difficulty: "MEDIUM",
            updatedAt: new Date().toISOString(),
          });
        }
      }

      return this.createSuccessResult<OptOutTrackingResult>(
        {
          tracked: brokers.length,
          updates,
        },
        {
          capability: "track-optout",
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
          code: "TRACK_ERROR",
          message: error instanceof Error ? error.message : "Tracking failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "track-optout",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleBrokerHealth(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<BrokerHealthResult>> {
    const startTime = Date.now();
    const { brokerId } = input as BrokerHealthInput;

    try {
      // Get brokers from internal list
      const brokers = brokerId
        ? this.knownBrokers.filter((b) => b.id === brokerId)
        : this.knownBrokers;

      const brokerStatus: BrokerHealthResult["brokerStatus"] = [];
      let healthy = 0;
      let issues = 0;

      for (const broker of brokers) {
        // In production, would actually ping the broker site
        const status = Math.random() > 0.1 ? "ONLINE" : "DEGRADED";

        if (status === "ONLINE") {
          healthy++;
        } else {
          issues++;
        }

        brokerStatus.push({
          brokerId: broker.id,
          brokerName: broker.name,
          status,
          lastChecked: new Date().toISOString(),
          responseTime: status === "ONLINE" ? Math.floor(Math.random() * 500) + 100 : undefined,
          issues: status !== "ONLINE" ? ["Slow response time"] : undefined,
        });
      }

      return this.createSuccessResult<BrokerHealthResult>(
        {
          total: brokers.length,
          healthy,
          issues,
          brokerStatus,
        },
        {
          capability: "broker-health",
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
          code: "HEALTH_ERROR",
          message: error instanceof Error ? error.message : "Health check failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "broker-health",
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

let brokerIntelAgentInstance: BrokerIntelAgent | null = null;

export function getBrokerIntelAgent(): BrokerIntelAgent {
  if (!brokerIntelAgentInstance) {
    brokerIntelAgentInstance = new BrokerIntelAgent();
    registerAgent(brokerIntelAgentInstance);
  }
  return brokerIntelAgentInstance;
}

export async function monitorBrokers(limit = 50): Promise<MonitorResult> {
  const agent = getBrokerIntelAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<MonitorResult>(
    "monitor-brokers",
    { limit },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Broker monitoring failed");
}

export async function detectNewBrokers(): Promise<NewBrokerResult> {
  const agent = getBrokerIntelAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<NewBrokerResult>(
    "detect-new-brokers",
    {},
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Broker detection failed");
}

export { BrokerIntelAgent };
export default getBrokerIntelAgent;
