/**
 * Mastermind Advisory System - Pre-Built Playbooks
 *
 * Common scenarios mapped to specific advisor combos and protocol steps.
 * Each playbook returns pre-configured options for buildMastermindPrompt().
 */

import type { MastermindPromptOptions } from "./prompt-builder";

export interface Playbook {
  id: string;
  name: string;
  description: string;
  promptOptions: MastermindPromptOptions;
}

export const PLAYBOOKS: Playbook[] = [
  {
    id: "pricing_review",
    name: "Pricing Review",
    description: "Evaluate pricing strategy with Nucleus + Commerce/Sales minds",
    promptOptions: {
      orgLayer: "nucleus",
      mission: "commerce-sales",
      protocol: ["ANALYZE", "DESIGN", "SELL"],
      maxAdvisors: 6,
      includeBusinessContext: true,
      scenario: "Review our pricing tiers and value propositions for optimization opportunities.",
    },
  },
  {
    id: "content_strategy",
    name: "Content Strategy",
    description: "Plan content roadmap with Brand/Media + Growth/Revenue minds",
    promptOptions: {
      mission: "brand-media",
      protocol: ["MAP", "DESIGN", "SELL"],
      maxAdvisors: 5,
      includeBusinessContext: true,
      scenario: "Design a content strategy that drives organic growth and brand awareness.",
    },
  },
  {
    id: "legal_response",
    name: "Legal Response",
    description: "Navigate legal/compliance challenges with the Legal team",
    promptOptions: {
      mission: "legal-compliance",
      protocol: ["MAP", "ANALYZE", "SAFETY_CHECK"],
      maxAdvisors: 5,
      includeBusinessContext: true,
      scenario: "Evaluate legal risks and develop a compliance strategy.",
    },
  },
  {
    id: "churn_prevention",
    name: "Churn Prevention",
    description: "Reduce churn with Customer/Culture + Commerce/Sales minds",
    promptOptions: {
      mission: "customer-culture",
      protocol: ["MAP", "ANALYZE", "DESIGN", "SELL"],
      maxAdvisors: 5,
      includeBusinessContext: true,
      scenario: "Identify churn drivers and design retention interventions.",
    },
  },
  {
    id: "growth_stalling",
    name: "Growth Stalling",
    description: "Diagnose and fix stalled growth with Growth team + Nucleus",
    promptOptions: {
      orgLayer: "nucleus",
      mission: "growth-revenue",
      protocol: ["MAP", "ANALYZE", "DESIGN", "BUILD_SHIP", "SELL"],
      maxAdvisors: 7,
      includeBusinessContext: true,
      scenario: "Growth has stalled. Diagnose root causes and design a recovery plan.",
    },
  },
  {
    id: "competitive_threat",
    name: "Competitive Threat",
    description: "Respond to competitive threats with Intel team + Nucleus",
    promptOptions: {
      orgLayer: "nucleus",
      mission: "competitive-intel",
      protocol: ["MAP", "ANALYZE", "SAFETY_CHECK", "DESIGN"],
      maxAdvisors: 6,
      includeBusinessContext: true,
      scenario: "A competitor has made a significant move. Assess impact and formulate response.",
    },
  },
  {
    id: "pre_mortem",
    name: "Pre-Mortem",
    description: "Safety-first pre-mortem analysis before a major launch",
    promptOptions: {
      invocation: "Safety Council",
      protocol: ["SAFETY_CHECK", "GOVERN"],
      maxAdvisors: 5,
      includeBusinessContext: true,
      scenario: "Imagine this initiative has failed catastrophically. What went wrong?",
    },
  },
  {
    id: "weekly_strategic",
    name: "Weekly Strategic Review",
    description: "Full 7-step protocol with Nucleus for weekly board meeting",
    promptOptions: {
      invocation: "Board Meeting",
      protocol: ["MAP", "ANALYZE", "DESIGN", "SAFETY_CHECK", "BUILD_SHIP", "SELL", "GOVERN"],
      maxAdvisors: 5,
      includeBusinessContext: true,
      scenario: "Weekly strategic review of business operations and performance.",
    },
  },
];

/** Get a playbook by ID */
export function getPlaybook(id: string): Playbook | undefined {
  return PLAYBOOKS.find((p) => p.id === id);
}

/** Get all available playbooks */
export function getAllPlaybooks(): Playbook[] {
  return PLAYBOOKS;
}
