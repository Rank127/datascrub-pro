/**
 * Mastermind Advisory System - Barrel Exports
 *
 * Central export point for all mastermind modules.
 */

// Core advisors
export {
  type Advisor,
  type AdvisorDomain,
  type AdvisorEra,
  type OrgLayer,
  type MissionDomain,
  type OperatingLayer,
  MODERN_ADVISORS,
  HISTORICAL_ADVISORS,
  ALL_ADVISORS,
  getAdvisor,
  getAdvisorsByOrgLayer,
  getAdvisorsByMission,
  getAdvisorsByDomain,
  getAdvisorsByOperatingLayer,
  getModernAdvisors,
  getHistoricalAdvisors,
  getUniqueAdvisors,
  getNucleusAdvisors,
  getAllDomains,
} from "./advisors";

// Org structure
export {
  type OrgLayerDef,
  type MissionMapping,
  ORG_LAYERS,
  MISSION_MAPPINGS,
  getOrgLayer,
  getLayerForAgent,
  getMissionForAgent,
  getMissionMapping,
} from "./org-structure";

// Operating layers
export {
  type LayerDefinition,
  LAYERS,
  getLayer,
  getLayerAdvisors,
  getKeyLayerAdvisors,
} from "./layers";

// Decision protocol
export {
  type ProtocolStep,
  getProtocolStep,
  getAllProtocolSteps,
  getDecisionProtocolPrompt,
} from "./decision-protocol";

// Invocations
export {
  type Invocation,
  INVOCATIONS,
  resolveInvocation,
  getAllInvocations,
  getInvocationsByMode,
} from "./invocations";

// Prompt builder
export {
  type MastermindPromptOptions,
  buildMastermindPrompt,
  buildAgentMastermindPrompt,
} from "./prompt-builder";

// Business context
export {
  type BusinessContext,
  BUSINESS_CONTEXT,
  getBusinessContextPrompt,
} from "./business-context";

// Playbooks
export {
  type Playbook,
  PLAYBOOKS,
  getPlaybook,
  getAllPlaybooks,
} from "./playbooks";
