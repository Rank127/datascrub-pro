/**
 * DataScrub Pro Agent Architecture - Main Exports
 *
 * This is the main entry point for the agent system.
 * Import from here for all agent-related functionality.
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export * from "./types";

// ============================================================================
// BASE AGENT
// ============================================================================

export { BaseAgent, createAgentContext, generateRequestId } from "./base-agent";

// ============================================================================
// REGISTRY
// ============================================================================

export {
  getRegistry,
  registerAgent,
  unregisterAgent,
  getAgent,
  getAllAgents,
  getAgentsForCapability,
} from "./registry";

export type { RegisteredAgent, AgentSummary, RegistryStats } from "./registry";

// ============================================================================
// ORCHESTRATOR
// ============================================================================

export {
  getOrchestrator,
  orchestrate,
  executeAction,
  executeWorkflow,
  AgentOrchestrator,
} from "./orchestrator";

export type {
  CircuitBreakerState,
  OrchestratorConfig,
} from "./orchestrator";

// ============================================================================
// EVENT BUS
// ============================================================================

export {
  getEventBus,
  subscribe,
  publish,
} from "./orchestrator/event-bus";

export type { Subscription, EventBusStats } from "./orchestrator/event-bus";

// ============================================================================
// ROUTING
// ============================================================================

export {
  getRouter,
  routeRequest,
  Router,
  DEFAULT_ROUTING_RULES,
} from "./orchestrator/routing-rules";

export type {
  RoutingRule,
  RoutingCondition,
  RoutingResult,
} from "./orchestrator/routing-rules";

// ============================================================================
// WORKFLOWS
// ============================================================================

export {
  WorkflowEngine,
  PREDEFINED_WORKFLOWS,
} from "./orchestrator/workflows";

export type {
  Workflow,
  WorkflowStep,
  WorkflowExecutionState,
} from "./orchestrator/workflows";

// ============================================================================
// CORE DOMAIN AGENTS (7)
// ============================================================================

export {
  getRemovalAgent,
  RemovalAgent,
  processBatchRemovals,
  verifyRemovals,
} from "./removal-agent";

export {
  getScanningAgent,
  ScanningAgent,
  runMonthlyRescans,
} from "./scanning-agent";

export {
  getSupportAgent,
  SupportAgent,
  processTicket,
  processPendingTickets,
} from "./support-agent";

export {
  getInsightsAgent,
  InsightsAgent,
  calculateUserRisk,
  generateWeeklyReport,
} from "./insights-agent";

export {
  getCommunicationsAgent,
  CommunicationsAgent,
  sendDailyDigests,
  sendReminders,
} from "./communications-agent";

export {
  getOperationsAgent,
  OperationsAgent,
  runHealthCheck,
  runCleanup,
} from "./operations-agent";

export {
  getBillingAgent,
  BillingAgent,
  syncSubscriptions,
  predictChurn,
} from "./billing-agent";

// ============================================================================
// INTELLIGENCE AGENTS (3)
// ============================================================================

export {
  getBrokerIntelAgent,
  BrokerIntelAgent,
  monitorBrokers,
  detectNewBrokers,
} from "./broker-intel-agent";

export {
  getThreatIntelAgent,
  ThreatIntelAgent,
  monitorDarkWeb,
  detectBreaches,
} from "./threat-intel-agent";

export {
  getCompetitiveIntelAgent,
  CompetitiveIntelAgent,
  monitorCompetitors,
  analyzeFeatureGaps,
} from "./competitive-intel-agent";

// ============================================================================
// CUSTOMER SUCCESS AGENTS (2)
// ============================================================================

export {
  getSuccessAgent,
  SuccessAgent,
  calculateHealthScores,
  detectAtRiskUsers,
} from "./success-agent";

export {
  getFeedbackAgent,
  FeedbackAgent,
  analyzeFeedback,
  trackNPS,
} from "./feedback-agent";

// ============================================================================
// COMPLIANCE & SECURITY AGENTS (2)
// ============================================================================

export {
  getComplianceAgent,
  ComplianceAgent,
  checkCompliance,
  generateLegalTemplate,
} from "./compliance-agent";

export {
  getSecurityAgent,
  SecurityAgent,
  detectThreats,
  preventFraud,
} from "./security-agent";

// ============================================================================
// USER EXPERIENCE AGENTS (3)
// ============================================================================

export {
  getContentAgent,
  ContentAgent,
  generateBlogPost,
  generateHelpArticle,
} from "./content-agent";

export {
  getOnboardingAgent,
  OnboardingAgent,
  personalizeOnboarding,
  trackOnboardingProgress,
} from "./onboarding-agent";

export {
  getSEOAgent,
  SEOAgent,
  runSEOAudit,
  runFullSEOReport,
  getBlogIdeas,
} from "./seo-agent";

// ============================================================================
// GROWTH & REVENUE AGENTS (3)
// ============================================================================

export {
  getGrowthAgent,
  GrowthAgent,
  optimizeReferrals,
  identifyPowerUsers,
} from "./growth-agent";

export {
  getPricingAgent,
  PricingAgent,
  recommendPlan,
} from "./pricing-agent";

export {
  getPartnerAgent,
  PartnerAgent,
  manageAffiliates,
} from "./partner-agent";

// ============================================================================
// SPECIALIZED OPERATIONS AGENTS (3)
// ============================================================================

export {
  getEscalationAgent,
  EscalationAgent,
  handleStubbornBrokers,
} from "./escalation-agent";

export {
  getVerificationAgent,
  VerificationAgent,
  monitorReappearances,
} from "./verification-agent";

export {
  getRegulatoryAgent,
  RegulatoryAgent,
  trackPrivacyLaws,
} from "./regulatory-agent";

// ============================================================================
// META AGENT (1)
// ============================================================================

export {
  getQAAgent,
  QAAgent,
  validateAllAgents,
  generateQAReport,
  runRegressionSuite,
} from "./qa-agent";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

import { getOrchestrator } from "./orchestrator";
import { getRegistry } from "./registry";
import { AgentHealthInfo, HealthStatuses } from "./types";

/**
 * Initialize the entire agent system
 */
export async function initializeAgentSystem(): Promise<void> {
  console.log("[AgentSystem] Starting initialization...");

  // Initialize the orchestrator (which initializes all agents)
  await getOrchestrator().initialize();

  console.log("[AgentSystem] Initialization complete");
}

/**
 * Shutdown the entire agent system
 */
export async function shutdownAgentSystem(): Promise<void> {
  console.log("[AgentSystem] Starting shutdown...");

  await getOrchestrator().shutdown();

  console.log("[AgentSystem] Shutdown complete");
}

/**
 * Get health status of all agents
 */
export async function getSystemHealth(): Promise<{
  status: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  agents: Record<string, AgentHealthInfo>;
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
}> {
  const agentHealth = await getRegistry().getAllHealth();

  let healthy = 0;
  let degraded = 0;
  let unhealthy = 0;

  for (const health of Object.values(agentHealth)) {
    switch (health.status) {
      case HealthStatuses.HEALTHY:
        healthy++;
        break;
      case HealthStatuses.DEGRADED:
        degraded++;
        break;
      case HealthStatuses.UNHEALTHY:
      case HealthStatuses.UNKNOWN:
        unhealthy++;
        break;
    }
  }

  const total = healthy + degraded + unhealthy;

  let status: "HEALTHY" | "DEGRADED" | "UNHEALTHY" = "HEALTHY";
  if (unhealthy > 0) {
    status = unhealthy > total / 2 ? "UNHEALTHY" : "DEGRADED";
  } else if (degraded > 0) {
    status = "DEGRADED";
  }

  return {
    status,
    agents: agentHealth,
    summary: { total, healthy, degraded, unhealthy },
  };
}

/**
 * Get system statistics
 */
export function getSystemStats(): {
  registry: ReturnType<typeof getRegistry.prototype.getStats>;
  circuitBreakers: Map<string, unknown>;
} {
  return {
    registry: getRegistry().getStats(),
    circuitBreakers: getOrchestrator().getCircuitBreakerStatus(),
  };
}
