/**
 * Mastermind Advisory System - Pre-Built Playbooks (Feb 2026)
 *
 * Common scenarios mapped to specific advisor combos and protocol steps.
 * Updated for 11-step protocol and 14 divisions.
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
    description: "Evaluate pricing strategy with Board + Commerce/Sales minds",
    promptOptions: {
      orgLayer: "board",
      mission: "commerce-sales",
      protocol: ["ANALYZE", "DESIGN_OFFER", "SELL"],
      maxAdvisors: 6,
      includeBusinessContext: true,
      scenario: "Review our pricing tiers and value propositions for optimization opportunities.",
    },
  },
  {
    id: "content_strategy",
    name: "Content Strategy",
    description: "Plan content roadmap with Brand/Attention + SEO/Growth minds",
    promptOptions: {
      mission: "brand-attention",
      protocol: ["MAP", "DESIGN_OFFER", "GROW_ORGANICALLY", "SELL"],
      maxAdvisors: 6,
      includeBusinessContext: true,
      scenario: "Design a content strategy that drives organic growth and brand awareness.",
    },
  },
  {
    id: "seo_growth",
    name: "SEO & Organic Growth Sprint",
    description: "Organic growth strategy with Fishkin, King, Patel, and the Growth War Room",
    promptOptions: {
      mission: "seo-organic-growth",
      protocol: ["MAP", "ANALYZE", "GROW_ORGANICALLY", "OPTIMIZE"],
      maxAdvisors: 7,
      includeBusinessContext: true,
      scenario: "Design a bootstrapped organic growth strategy for AI search, traditional SEO, and audience leverage.",
    },
  },
  {
    id: "legal_response",
    name: "Legal Response",
    description: "Navigate legal/compliance challenges with the Legal division",
    promptOptions: {
      mission: "legal-compliance",
      protocol: ["MAP", "ANALYZE", "SAFETY_CHECK", "PROTECT"],
      maxAdvisors: 5,
      includeBusinessContext: true,
      scenario: "Evaluate legal risks and develop a compliance strategy.",
    },
  },
  {
    id: "security_audit",
    name: "Security Audit",
    description: "Full security assessment with the Security & AI Defense division",
    promptOptions: {
      invocation: "Security War Room",
      protocol: ["SAFETY_CHECK", "PROTECT", "OPTIMIZE"],
      maxAdvisors: 5,
      includeBusinessContext: true,
      scenario: "Conduct a full security audit of our platform and identify vulnerabilities.",
    },
  },
  {
    id: "churn_prevention",
    name: "Churn Prevention",
    description: "Reduce churn with Behavior Lab + Commerce minds",
    promptOptions: {
      mission: "behavior-lab",
      protocol: ["MAP", "ANALYZE", "DESIGN_EXPERIENCE", "SELL"],
      maxAdvisors: 6,
      includeBusinessContext: true,
      scenario: "Identify churn drivers and design retention interventions using behavioral science.",
    },
  },
  {
    id: "growth_stalling",
    name: "Growth Stalling",
    description: "Diagnose and fix stalled growth with Board + Growth War Room",
    promptOptions: {
      invocation: "Growth War Room",
      protocol: ["MAP", "ANALYZE", "DESIGN_OFFER", "GROW_ORGANICALLY", "BUILD_SHIP", "SELL"],
      maxAdvisors: 8,
      includeBusinessContext: true,
      scenario: "Growth has stalled. Diagnose root causes and design a recovery plan.",
    },
  },
  {
    id: "competitive_threat",
    name: "Competitive Threat",
    description: "Respond to competitive threats with Global Strategy + Board",
    promptOptions: {
      orgLayer: "board",
      mission: "global-strategy",
      protocol: ["MAP", "ANALYZE", "SAFETY_CHECK", "DESIGN_OFFER"],
      maxAdvisors: 6,
      includeBusinessContext: true,
      scenario: "A competitor has made a significant move. Assess impact and formulate response.",
    },
  },
  {
    id: "design_sprint",
    name: "Design Sprint",
    description: "Product design review with Ive, Rams, Jobs, and the Design division",
    promptOptions: {
      invocation: "Design Sprint",
      protocol: ["DESIGN_EXPERIENCE", "BUILD_SHIP"],
      maxAdvisors: 5,
      includeBusinessContext: true,
      scenario: "Redesign a key user experience to be simpler, more beautiful, and more engaging.",
    },
  },
  {
    id: "pre_mortem",
    name: "Pre-Mortem",
    description: "Safety-first pre-mortem analysis before a major launch",
    promptOptions: {
      invocation: "Safety Council",
      protocol: ["SAFETY_CHECK", "PROTECT", "GOVERN"],
      maxAdvisors: 5,
      includeBusinessContext: true,
      scenario: "Imagine this initiative has failed catastrophically. What went wrong?",
    },
  },
  {
    id: "weekly_strategic",
    name: "Weekly Strategic Review",
    description: "Full 11-step protocol with Board for weekly board meeting",
    promptOptions: {
      invocation: "Board Meeting",
      protocol: ["MAP", "ANALYZE", "DESIGN_OFFER", "DESIGN_EXPERIENCE", "SAFETY_CHECK", "BUILD_SHIP", "GROW_ORGANICALLY", "SELL", "OPTIMIZE", "PROTECT", "GOVERN"],
      maxAdvisors: 10,
      includeBusinessContext: true,
      scenario: "Weekly strategic review of business operations and performance.",
    },
  },
  {
    id: "infrastructure_review",
    name: "Infrastructure Review",
    description: "Performance audit with Hightower, Ohno, Cook, and the Infrastructure division",
    promptOptions: {
      mission: "infrastructure-performance",
      protocol: ["OPTIMIZE", "PROTECT", "BUILD_SHIP"],
      maxAdvisors: 5,
      includeBusinessContext: true,
      scenario: "Audit our infrastructure. What should we build vs. buy? Where is waste?",
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
