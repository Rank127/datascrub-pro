/**
 * Mastermind Advisory System - Central Prompt Builder
 *
 * Assembles advisor perspectives, protocol steps, and business context
 * into a single prompt section. Token-budgeted (~800 tokens max).
 *
 * Selection priority: Invocation > Mission > Org Layer > Operating Layer > Default (Nucleus)
 */

import {
  type Advisor,
  type OrgLayer,
  type MissionDomain,
  type OperatingLayer,
  getAdvisor,
  getAdvisorsByOrgLayer,
  getAdvisorsByMission,
  getAdvisorsByOperatingLayer,
  getNucleusAdvisors,
  MODERN_ADVISORS,
  ALL_ADVISORS,
} from "./advisors";
import { getDecisionProtocolPrompt, type ProtocolStep } from "./decision-protocol";
import { getBusinessContextPrompt } from "./business-context";
import { resolveInvocation } from "./invocations";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface MastermindPromptOptions {
  orgLayer?: OrgLayer;
  mission?: MissionDomain;
  layers?: OperatingLayer[];
  protocol?: ProtocolStep[];
  invocation?: string;
  maxAdvisors?: number;
  era?: "modern" | "historical" | "both";
  includeBusinessContext?: boolean;
  scenario?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Build a mastermind advisory prompt section.
 *
 * @param options - Configuration for advisor selection and prompt composition
 * @returns A formatted string to append to any system prompt
 */
export function buildMastermindPrompt(options: MastermindPromptOptions = {}): string {
  const {
    orgLayer,
    mission,
    layers,
    protocol,
    invocation,
    maxAdvisors = 5,
    era = "modern",
    includeBusinessContext = false,
    scenario,
  } = options;

  const sections: string[] = [];

  // --- Header ---
  sections.push("## Mastermind Advisory Council");

  // --- Resolve advisors ---
  let selectedAdvisors: Advisor[] = [];

  // Priority 1: Invocation command
  if (invocation) {
    const inv = resolveInvocation(invocation);
    if (inv) {
      selectedAdvisors = inv.advisorIds
        .map((id) => getAdvisor(id))
        .filter((a): a is Advisor => a !== undefined);
      sections.push(`Mode: ${inv.trigger} — ${inv.description}`);
    }
  }

  // Priority 2: Mission domain
  if (selectedAdvisors.length === 0 && mission) {
    selectedAdvisors = getAdvisorsByMission(mission);
    sections.push(`Mission Focus: ${mission}`);
  }

  // Priority 3: Org layer
  if (selectedAdvisors.length === 0 && orgLayer) {
    selectedAdvisors = getAdvisorsByOrgLayer(orgLayer);
    sections.push(`Layer Focus: ${orgLayer}`);
  }

  // Priority 4: Operating layer(s)
  if (selectedAdvisors.length === 0 && layers && layers.length > 0) {
    for (const layer of layers) {
      selectedAdvisors.push(...getAdvisorsByOperatingLayer(layer));
    }
    sections.push(`Operating Layers: ${layers.join(", ")}`);
  }

  // Default: Nucleus
  if (selectedAdvisors.length === 0) {
    selectedAdvisors = getNucleusAdvisors();
    sections.push("Advisory: Nucleus (5 Architects)");
  }

  // --- Filter by era ---
  if (era === "modern") {
    selectedAdvisors = selectedAdvisors.filter((a) => a.era === "modern");
  } else if (era === "historical") {
    selectedAdvisors = selectedAdvisors.filter((a) => a.era === "historical");
  }
  // "both" = no filter

  // --- Cap advisors ---
  if (selectedAdvisors.length > maxAdvisors) {
    selectedAdvisors = selectedAdvisors.slice(0, maxAdvisors);
  }

  // --- Advisor section ---
  if (selectedAdvisors.length > 0) {
    const advisorLines = selectedAdvisors.map((a) => {
      const roleLabel = a.nucleusRole || a.missionDomain || a.orgLayer;
      return `- **${a.name}** (${roleLabel}): ${a.promptFragment}`;
    });
    sections.push(`\nConsider these perspectives:\n${advisorLines.join("\n")}`);
  }

  // --- Scenario ---
  if (scenario) {
    sections.push(`\nScenario: ${scenario}`);
  }

  // --- Protocol ---
  if (protocol && protocol.length > 0) {
    sections.push(`\n${getDecisionProtocolPrompt(protocol)}`);
  }

  // --- Business context ---
  if (includeBusinessContext) {
    sections.push(`\n${getBusinessContextPrompt()}`);
  }

  return sections.join("\n");
}

/**
 * Build a compact mastermind prompt for agent system prompts.
 * Lighter weight (~300 tokens) for injection into existing prompts.
 */
export function buildAgentMastermindPrompt(mission: MissionDomain, maxAdvisors = 3): string {
  let advisors = getAdvisorsByMission(mission).filter((a) => a.era === "modern");
  if (advisors.length > maxAdvisors) {
    advisors = advisors.slice(0, maxAdvisors);
  }

  if (advisors.length === 0) return "";

  const lines = advisors.map(
    (a) => `- ${a.name}: ${a.keyPrinciple}`
  );

  return `\n## Advisory Wisdom (${mission})
Channel these modern minds in your analysis:
${lines.join("\n")}

Apply their thinking style to every decision, but keep your response format unchanged.`;
}
