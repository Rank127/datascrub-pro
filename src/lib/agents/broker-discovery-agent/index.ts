/**
 * Broker Discovery Agent
 *
 * Self-learning agent that:
 * 1. Discovers which unscanned brokers appear most in exposures (top offenders)
 * 2. Probes broker sites with AI to generate scanner configs
 * 3. Validates dynamic scanners against known profiles
 * 4. Keeps opt-out URLs validated and updated
 *
 * Learning loop: Discover → Probe → Configure → Validate → Enable → Monitor → Re-discover
 */

import { BaseAgent, MODEL_HAIKU, createAgentContext } from "../base-agent";
import { registerAgent } from "../registry";
import {
  AgentDomains,
  AgentModes,
  InvocationTypes,
  type AgentCapability,
  type AgentContext,
  type AgentResult,
} from "../types";
import { prisma } from "@/lib/db";
import { SUPPORTED_DATA_BROKERS } from "@/lib/scanners/data-brokers";
import { scrapeUrl } from "@/lib/scanners/scraping-service";

// Max probes per weekly run to limit cost
const MAX_PROBES_PER_RUN = 5;
// Minimum validation score to enable a scanner
const MIN_VALIDATION_SCORE = 0.5;

// ─── Result Types ───

interface DiscoveryResult {
  topOffenders: Array<{
    source: string;
    count: number;
    hasStaticScanner: boolean;
    hasDynamicScanner: boolean;
  }>;
  candidates: string[];
}

interface ProbeResult {
  brokerKey: string;
  success: boolean;
  configId?: string;
  error?: string;
}

interface ValidationResult {
  scannersChecked: number;
  enabled: number;
  disabled: number;
  pending: number;
}

interface OptOutValidationResult {
  checked: number;
  healthy: number;
  broken: number;
  updated: number;
}

// ─── Agent ───

class BrokerDiscoveryAgent extends BaseAgent {
  constructor() {
    super({ model: MODEL_HAIKU });
  }

  readonly id = "broker-discovery-agent";
  readonly name = "Broker Discovery Agent";
  readonly domain = AgentDomains.INTELLIGENCE;
  readonly mode = AgentModes.HYBRID;
  readonly version = "1.0.0";
  readonly description = "Discovers new data brokers, generates scanner configs, validates opt-out URLs";

  readonly capabilities: AgentCapability[] = [
    {
      id: "discover-top-offenders",
      name: "Discover Top Offenders",
      description: "Query projected exposures to find top unscanned brokers",
      requiresAI: false,
    },
    {
      id: "probe-broker-site",
      name: "Probe Broker Site",
      description: "Fetch broker search page, use AI to generate scanner config",
      requiresAI: true,
      estimatedTokens: 500,
    },
    {
      id: "validate-scanners",
      name: "Validate Dynamic Scanners",
      description: "Test dynamic scanners against known profiles, update validation status",
      requiresAI: false,
    },
    {
      id: "validate-optout-urls",
      name: "Validate Opt-Out URLs",
      description: "HTTP check all opt-out URLs, update health tracking",
      requiresAI: false,
    },
  ];

  protected getSystemPrompt(): string {
    return `You are the Broker Discovery Agent for GhostMyData. You analyze data broker websites to generate scanner configurations.`;
  }

  protected registerHandlers(): void {
    this.handlers.set("discover-top-offenders", this.handleDiscoverTopOffenders.bind(this));
    this.handlers.set("probe-broker-site", this.handleProbeBrokerSite.bind(this));
    this.handlers.set("validate-scanners", this.handleValidateScanners.bind(this));
    this.handlers.set("validate-optout-urls", this.handleValidateOptOutUrls.bind(this));
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
    return this.createErrorResult<T>(
      { code: "UNKNOWN_CAPABILITY", message: `Unknown capability: ${capability}`, retryable: false },
      Date.now(),
      capability,
      context.requestId
    );
  }

  // ─── Capability: discover-top-offenders ───

  private async handleDiscoverTopOffenders(
    _input: unknown,
    context: AgentContext
  ): Promise<AgentResult<DiscoveryResult>> {
    const startTime = Date.now();

    try {
      // Build set of known scanner keys (static + dynamic)
      const staticKeys = new Set<string>(SUPPORTED_DATA_BROKERS);

      const dynamicConfigs = await prisma.dynamicScannerConfig.findMany({
        select: { brokerKey: true },
      });
      const dynamicKeys = new Set(dynamicConfigs.map((c: { brokerKey: string }) => c.brokerKey));

      // Find top projected exposure sources that don't have scanners
      const topSources = await prisma.exposure.groupBy({
        by: ["source"],
        where: {
          matchClassification: "PROJECTED",
          status: "ACTIVE",
        },
        _count: { source: true },
        orderBy: { _count: { source: "desc" } },
        take: 30,
      });

      const topOffenders = topSources.map((s) => ({
        source: s.source,
        count: s._count.source,
        hasStaticScanner: staticKeys.has(s.source),
        hasDynamicScanner: dynamicKeys.has(s.source),
      }));

      // Candidates = top offenders without any scanner
      const candidates = topOffenders
        .filter((o) => !o.hasStaticScanner && !o.hasDynamicScanner)
        .slice(0, MAX_PROBES_PER_RUN)
        .map((o) => o.source);

      const result: DiscoveryResult = { topOffenders, candidates };

      return this.createSuccessResult<DiscoveryResult>(
        result,
        { capability: "discover-top-offenders", requestId: context.requestId, duration: Date.now() - startTime },
        { confidence: 0.95 }
      );
    } catch (error) {
      return this.createErrorResult<DiscoveryResult>(
        { code: "DISCOVERY_FAILED", message: error instanceof Error ? error.message : String(error), retryable: true },
        startTime,
        "discover-top-offenders",
        context.requestId
      );
    }
  }

  // ─── Capability: probe-broker-site ───

  private async handleProbeBrokerSite(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<ProbeResult>> {
    const startTime = Date.now();
    const { brokerKey, sampleUrl } = input as { brokerKey: string; sampleUrl?: string };

    try {
      // Build a sample search URL from broker key
      const brokerName = brokerKey.toLowerCase().replace(/_/g, "");
      const url = sampleUrl || `https://www.${brokerName}.com`;

      // Fetch the page via ScrapingBee
      const scrapeResult = await scrapeUrl(url, {
        renderJs: true,
        timeout: 20000,
        premiumProxy: true,
      });

      if (!scrapeResult.success) {
        return this.createSuccessResult<ProbeResult>(
          { brokerKey, success: false, error: scrapeResult.error || "Failed to fetch" },
          { capability: "probe-broker-site", requestId: context.requestId, duration: Date.now() - startTime },
        );
      }

      // Truncate HTML for AI analysis (first 8K chars is enough for structure)
      const htmlSample = scrapeResult.html.substring(0, 8000);

      // Ask Haiku to analyze the site and generate parsing rules
      if (!this.anthropic) {
        return this.createSuccessResult<ProbeResult>(
          { brokerKey, success: false, error: "AI not available (no API key)" },
          { capability: "probe-broker-site", requestId: context.requestId, duration: Date.now() - startTime },
        );
      }

      const aiResponse = await this.anthropic.messages.create({
        model: MODEL_HAIKU,
        max_tokens: 1024,
        system: `You are analyzing a data broker website to create an automated scanner config.
Return ONLY valid JSON with this structure:
{
  "searchUrlTemplate": "URL with {firstName}, {lastName}, {state}, {city} placeholders",
  "baseUrl": "https://example.com",
  "optOutUrl": "URL or null",
  "optOutEmail": "email or null",
  "parsingRules": {
    "noResultIndicators": ["no results found", "0 records"],
    "resultIndicators": ["view full report", "records found"],
    "extractionPatterns": {
      "name": "regex with capture group or null",
      "location": "regex with capture group or null",
      "age": "regex with capture group or null"
    }
  }
}
If the site doesn't look like a people-search/data-broker, return {"error": "not a data broker"}.`,
        messages: [{
          role: "user",
          content: `Analyze this data broker site HTML and generate scanner config.\n\nBroker key: ${brokerKey}\nURL: ${url}\n\nHTML sample:\n${htmlSample}`,
        }],
      });

      const aiText = aiResponse.content[0]?.type === "text" ? aiResponse.content[0].text : "";

      // Parse AI response
      let config: Record<string, unknown>;
      try {
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON in AI response");
        config = JSON.parse(jsonMatch[0]);
      } catch {
        return this.createSuccessResult<ProbeResult>(
          { brokerKey, success: false, error: "AI returned invalid JSON" },
          { capability: "probe-broker-site", requestId: context.requestId, duration: Date.now() - startTime },
        );
      }

      if (config.error) {
        return this.createSuccessResult<ProbeResult>(
          { brokerKey, success: false, error: String(config.error) },
          { capability: "probe-broker-site", requestId: context.requestId, duration: Date.now() - startTime },
        );
      }

      // Save to DB (disabled by default, pending validation)
      const saved = await prisma.dynamicScannerConfig.upsert({
        where: { brokerKey },
        create: {
          brokerKey,
          brokerName: brokerKey.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
          enabled: false,
          searchUrlTemplate: String(config.searchUrlTemplate || `${url}/name/{firstName}-{lastName}`),
          baseUrl: String(config.baseUrl || url),
          optOutUrl: config.optOutUrl ? String(config.optOutUrl) : null,
          optOutEmail: config.optOutEmail ? String(config.optOutEmail) : null,
          parsingRules: JSON.stringify(config.parsingRules || { noResultIndicators: [], resultIndicators: [] }),
          discoveredBy: "agent",
          discoveryScore: 0,
          validationStatus: "PENDING",
        },
        update: {
          optOutUrl: config.optOutUrl ? String(config.optOutUrl) : undefined,
          optOutEmail: config.optOutEmail ? String(config.optOutEmail) : undefined,
          parsingRules: JSON.stringify(config.parsingRules || { noResultIndicators: [], resultIndicators: [] }),
          searchUrlTemplate: config.searchUrlTemplate ? String(config.searchUrlTemplate) : undefined,
        },
      });

      return this.createSuccessResult<ProbeResult>(
        { brokerKey, success: true, configId: saved.id },
        { capability: "probe-broker-site", requestId: context.requestId, duration: Date.now() - startTime },
        { confidence: 0.7 }
      );
    } catch (error) {
      return this.createErrorResult<ProbeResult>(
        { code: "PROBE_FAILED", message: error instanceof Error ? error.message : String(error), retryable: true },
        startTime,
        "probe-broker-site",
        context.requestId
      );
    }
  }

  // ─── Capability: validate-scanners ───

  private async handleValidateScanners(
    _input: unknown,
    context: AgentContext
  ): Promise<AgentResult<ValidationResult>> {
    const startTime = Date.now();

    try {
      const configs = await prisma.dynamicScannerConfig.findMany({
        where: {
          validationStatus: { in: ["PENDING", "VALIDATED"] },
        },
        orderBy: { discoveryScore: "desc" },
        take: 20,
      });

      let enabled = 0;
      let disabled = 0;
      let pending = 0;

      for (const config of configs) {
        try {
          // Quick HTTP check of the search URL template (with dummy name)
          const testUrl = config.searchUrlTemplate
            .replace(/\{firstName\}/gi, "john")
            .replace(/\{lastName\}/gi, "smith")
            .replace(/\{fullName\}/gi, "john-smith")
            .replace(/\{city\}/gi, "")
            .replace(/\{state\}/gi, "")
            .replace(/\/+$/g, "");

          const result = await scrapeUrl(testUrl, {
            renderJs: false,
            timeout: 15000,
            premiumProxy: config.usePremiumProxy,
          });

          if (result.success && result.html.length > 500) {
            let rules: { noResultIndicators?: string[]; resultIndicators?: string[] };
            try {
              rules = JSON.parse(config.parsingRules);
            } catch {
              rules = {};
            }

            const htmlLower = result.html.toLowerCase();
            const hasNoResult = (rules.noResultIndicators || []).some((i: string) =>
              htmlLower.includes(i.toLowerCase())
            );
            const hasResult = (rules.resultIndicators || []).some((i: string) =>
              htmlLower.includes(i.toLowerCase())
            );

            if (hasNoResult || hasResult) {
              const score = hasResult ? 0.7 : 0.5;

              if (score >= MIN_VALIDATION_SCORE && config.validationStatus === "PENDING") {
                await prisma.dynamicScannerConfig.update({
                  where: { id: config.id },
                  data: {
                    validationStatus: "VALIDATED",
                    validationScore: score,
                    lastValidatedAt: new Date(),
                    enabled: true,
                  },
                });
                enabled++;
              } else {
                await prisma.dynamicScannerConfig.update({
                  where: { id: config.id },
                  data: {
                    validationScore: score,
                    lastValidatedAt: new Date(),
                  },
                });
                pending++;
              }
            } else {
              pending++;
              await prisma.dynamicScannerConfig.update({
                where: { id: config.id },
                data: { lastValidatedAt: new Date(), validationScore: 0.2 },
              });
            }
          } else {
            const updated = await prisma.dynamicScannerConfig.update({
              where: { id: config.id },
              data: {
                consecutiveFailures: { increment: 1 },
                lastValidatedAt: new Date(),
              },
            });

            if (updated.consecutiveFailures >= 3) {
              await prisma.dynamicScannerConfig.update({
                where: { id: config.id },
                data: { validationStatus: "DISABLED", enabled: false },
              });
              disabled++;
            } else {
              pending++;
            }
          }
        } catch {
          pending++;
        }
      }

      return this.createSuccessResult<ValidationResult>(
        { scannersChecked: configs.length, enabled, disabled, pending },
        { capability: "validate-scanners", requestId: context.requestId, duration: Date.now() - startTime },
        { confidence: 0.9 }
      );
    } catch (error) {
      return this.createErrorResult<ValidationResult>(
        { code: "VALIDATION_FAILED", message: error instanceof Error ? error.message : String(error), retryable: true },
        startTime,
        "validate-scanners",
        context.requestId
      );
    }
  }

  // ─── Capability: validate-optout-urls ───

  private async handleValidateOptOutUrls(
    _input: unknown,
    context: AgentContext
  ): Promise<AgentResult<OptOutValidationResult>> {
    const startTime = Date.now();

    try {
      const dynamicConfigs = await prisma.dynamicScannerConfig.findMany({
        where: {
          optOutUrl: { not: null },
          enabled: true,
        },
        select: { id: true, brokerKey: true, brokerName: true, optOutUrl: true },
      });

      let checked = 0;
      let healthy = 0;
      let broken = 0;
      let updated = 0;

      for (const config of dynamicConfigs) {
        if (!config.optOutUrl) continue;
        checked++;

        try {
          const response = await fetch(config.optOutUrl, {
            method: "HEAD",
            redirect: "follow",
            signal: AbortSignal.timeout(10000),
          });

          if (response.ok) {
            healthy++;

            if (response.url !== config.optOutUrl) {
              await prisma.dynamicScannerConfig.update({
                where: { id: config.id },
                data: { optOutUrl: response.url },
              });
              updated++;
            }
          } else {
            broken++;
          }

          await prisma.brokerOptOutHealth.upsert({
            where: { brokerKey: config.brokerKey },
            create: {
              brokerKey: config.brokerKey,
              brokerName: config.brokerName,
              optOutUrl: config.optOutUrl,
              lastCheckAt: new Date(),
              lastHttpStatus: response.status,
              isHealthy: response.ok,
              consecutiveFailures: response.ok ? 0 : 1,
            },
            update: {
              optOutUrl: config.optOutUrl,
              lastCheckAt: new Date(),
              lastHttpStatus: response.status,
              isHealthy: response.ok,
              consecutiveFailures: response.ok ? 0 : { increment: 1 },
            },
          });
        } catch (fetchError) {
          broken++;

          await prisma.brokerOptOutHealth.upsert({
            where: { brokerKey: config.brokerKey },
            create: {
              brokerKey: config.brokerKey,
              brokerName: config.brokerName,
              optOutUrl: config.optOutUrl,
              lastCheckAt: new Date(),
              lastHttpStatus: 0,
              isHealthy: false,
              consecutiveFailures: 1,
              lastError: fetchError instanceof Error ? fetchError.message : String(fetchError),
            },
            update: {
              lastCheckAt: new Date(),
              lastHttpStatus: 0,
              isHealthy: false,
              consecutiveFailures: { increment: 1 },
              lastError: fetchError instanceof Error ? fetchError.message : String(fetchError),
            },
          });
        }
      }

      return this.createSuccessResult<OptOutValidationResult>(
        { checked, healthy, broken, updated },
        { capability: "validate-optout-urls", requestId: context.requestId, duration: Date.now() - startTime },
        { confidence: 0.95 }
      );
    } catch (error) {
      return this.createErrorResult<OptOutValidationResult>(
        { code: "OPTOUT_VALIDATION_FAILED", message: error instanceof Error ? error.message : String(error), retryable: true },
        startTime,
        "validate-optout-urls",
        context.requestId
      );
    }
  }
}

// ─── Singleton & Registry ───

let brokerDiscoveryAgentInstance: BrokerDiscoveryAgent | null = null;

export function getBrokerDiscoveryAgent(): BrokerDiscoveryAgent {
  if (!brokerDiscoveryAgentInstance) {
    brokerDiscoveryAgentInstance = new BrokerDiscoveryAgent();
    registerAgent(brokerDiscoveryAgentInstance);
  }
  return brokerDiscoveryAgentInstance;
}

/**
 * Run the full discovery pipeline (used by cron)
 * Returns summary of actions taken.
 */
export async function runBrokerDiscovery(): Promise<{
  discovered: DiscoveryResult;
  probed: ProbeResult[];
  validated: ValidationResult;
  optOutChecks: OptOutValidationResult;
}> {
  const agent = getBrokerDiscoveryAgent();
  await agent.initialize();

  const context = createAgentContext({
    invocationType: InvocationTypes.CRON,
  });

  // Step 1: Discover top offenders
  const discoveryResult = await agent.execute<DiscoveryResult>(
    "discover-top-offenders",
    {},
    context
  );
  const discovered = discoveryResult.data || { topOffenders: [], candidates: [] };

  // Step 2: Probe candidates (up to MAX_PROBES_PER_RUN)
  const probed: ProbeResult[] = [];
  for (const candidate of discovered.candidates.slice(0, MAX_PROBES_PER_RUN)) {
    const probeResult = await agent.execute<ProbeResult>(
      "probe-broker-site",
      { brokerKey: candidate },
      context
    );
    if (probeResult.data) {
      probed.push(probeResult.data);
    }
  }

  // Step 3: Validate existing dynamic scanners
  const validationResult = await agent.execute<ValidationResult>(
    "validate-scanners",
    {},
    context
  );
  const validated = validationResult.data || { scannersChecked: 0, enabled: 0, disabled: 0, pending: 0 };

  // Step 4: Check opt-out URLs
  const optOutResult = await agent.execute<OptOutValidationResult>(
    "validate-optout-urls",
    {},
    context
  );
  const optOutChecks = optOutResult.data || { checked: 0, healthy: 0, broken: 0, updated: 0 };

  return { discovered, probed, validated, optOutChecks };
}

export { BrokerDiscoveryAgent };
export default getBrokerDiscoveryAgent;
