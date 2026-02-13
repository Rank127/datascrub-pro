/**
 * Mastermind Advisory System - 5-Layer Organism Model
 *
 * The organization is a living organism with 5 layers:
 *   1. Nucleus — 3-5 Architects (Vision)
 *   2. Mission Teams — Domain squads (Execution)
 *   3. AI Agent Layer — Intelligence amplifier
 *   4. Network Layer — Ecosystem
 *   5. Governance Mesh — Integrity
 */

import type { OrgLayer, MissionDomain } from "./advisors";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface OrgLayerDef {
  id: OrgLayer;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  roles: { title: string; desc: string }[];
  principles: { mind: string; insight: string }[];
  advisorIds: string[];
  relevantAgents: string[];
}

export interface MissionMapping {
  domain: MissionDomain;
  label: string;
  description: string;
  keyAdvisorIds: string[];
  agentIds: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// 5-LAYER ORG MODEL
// ═══════════════════════════════════════════════════════════════════════════

export const ORG_LAYERS: OrgLayerDef[] = [
  {
    id: "nucleus",
    name: "The Nucleus",
    subtitle: "3-5 People — The Vision Layer",
    description:
      "The Nucleus is the smallest, most powerful layer. These 3-5 architects set the 10-year vision, allocate capital, design the culture, and hold veto power on safety. They don't manage — they architect.",
    icon: "🧬",
    roles: [
      { title: "Vision Architect", desc: "Sets the 10-year direction and infrastructure strategy" },
      { title: "Systems Architect", desc: "Designs how technology, people, and AI connect" },
      { title: "Capital Architect", desc: "Allocates resources with discipline and circle of competence" },
      { title: "Culture Architect", desc: "Growth mindset transformation, the human operating system" },
      { title: "Safety Architect", desc: "Veto power on safety. 'What could go catastrophically wrong?'" },
    ],
    principles: [
      { mind: "Jensen Huang", insight: "Build infrastructure, applications will come" },
      { mind: "Warren Buffett", insight: "Circle of competence, never lose money" },
      { mind: "Dario Amodei", insight: "Safety is the architecture, not an afterthought" },
      { mind: "Satya Nadella", insight: "Culture eats strategy. Lead with empathy" },
      { mind: "Demis Hassabis", insight: "Design how the pieces connect into one system" },
    ],
    advisorIds: ["jensen-huang", "demis-hassabis", "warren-buffett", "satya-nadella", "dario-amodei"],
    relevantAgents: [],
  },
  {
    id: "missions",
    name: "Mission Teams",
    subtitle: "10 Domains — The Execution Layer",
    description:
      "Cross-functional squads organized by mission domain. Each team has a clear objective, key minds for inspiration, and mapped GhostMyData agents. Teams operate autonomously with Nucleus-level strategic alignment.",
    icon: "🎯",
    roles: [
      { title: "Growth & Revenue", desc: "Drive user acquisition, conversion, and revenue" },
      { title: "Product & Platform", desc: "Build and ship the core platform" },
      { title: "Commerce & Sales", desc: "Close deals and expand customer relationships" },
      { title: "Legal & Compliance", desc: "Navigate privacy law and regulatory landscape" },
      { title: "Customer & Culture", desc: "Build engaged community and customer success" },
      { title: "Competitive Intel", desc: "Map and outmaneuver the competitive landscape" },
      { title: "Brand & Media", desc: "Create remarkable content that spreads" },
      { title: "Science & Research", desc: "Advance core technology and capabilities" },
      { title: "Global Strategy", desc: "Navigate geopolitical and macro trends" },
      { title: "Economics", desc: "Analyze market dynamics and structural patterns" },
    ],
    principles: [
      { mind: "Alex Hormozi", insight: "Offers so good people feel stupid saying no" },
      { mind: "Sam Altman", insight: "Ship fast, iterate responsibly" },
      { mind: "Chris Voss", insight: "Tactical empathy in every interaction" },
      { mind: "Magnus Carlsen", insight: "Accumulate small advantages that compound" },
      { mind: "MrBeast", insight: "What's the biggest possible version of this?" },
    ],
    advisorIds: [
      "alex-hormozi", "russell-brunson", "neil-patel",
      "sam-altman", "tim-cook", "elon-musk", "mustafa-suleyman",
      "chris-voss", "andy-elliott", "jeremy-miner", "gary-vaynerchuk", "grant-cardone",
      "amal-clooney", "neal-katyal", "david-boies", "fiona-scott-morton", "lina-khan",
      "jordan-peterson", "vanessa-van-edwards", "hikaru-nakamura",
      "magnus-carlsen", "ding-liren", "fabiano-caruana", "ray-dalio",
      "mrbeast", "joe-rogan", "lex-fridman", "taylor-swift",
      "jennifer-doudna", "katalin-kariko", "john-jumper", "feng-zhang",
      "xi-jinping-ext", "modi-ext", "mbs-ext",
      "daron-acemoglu", "claudia-goldin", "mohamed-el-erian", "raghuram-rajan", "tyler-cowen",
    ],
    relevantAgents: [
      "growth-agent", "content-agent", "seo-agent",
      "billing-agent", "removal-agent", "support-agent",
      "competitive-intel-agent",
    ],
  },
  {
    id: "ai-agents",
    name: "The AI Agent Layer",
    subtitle: "24 Agents — Intelligence Amplifier",
    description:
      "AI agents execute at scale what Mission Teams design. Each agent is inspired by specific modern minds. The key principle: efficiency per dollar matters more than raw capability.",
    icon: "🤖",
    roles: [
      { title: "Research Agents", desc: "Gather intelligence, analyze data, surface insights" },
      { title: "Analysis Agents", desc: "Turn research into production-ready decisions" },
      { title: "Customer Agents", desc: "Tactical empathy at scale across all touchpoints" },
      { title: "Content Agents", desc: "Volume + remarkability in content creation" },
      { title: "Code Agents", desc: "Ship code, not papers — production engineering" },
      { title: "Finance Agents", desc: "Real-time financial forecasting and optimization" },
    ],
    principles: [
      { mind: "Liang Wenfeng", insight: "Efficiency per dollar > raw capability" },
      { mind: "Andrej Karpathy", insight: "Research → production is where value lives" },
      { mind: "Vanessa Van Edwards", insight: "Behavioral science powers customer empathy" },
      { mind: "MrBeast", insight: "Volume + remarkability = viral content" },
      { mind: "Ken Griffin", insight: "Speed and precision create competitive edge" },
    ],
    advisorIds: [
      "liang-wenfeng", "andrew-ng", "andrej-karpathy", "yann-lecun",
      "ken-griffin", "cathie-wood", "masayoshi-son",
    ],
    relevantAgents: [
      "removal-agent", "support-agent", "billing-agent",
      "growth-agent", "content-agent", "seo-agent",
      "competitive-intel-agent",
    ],
  },
  {
    id: "network",
    name: "The Network Layer",
    subtitle: "Ecosystem — Partners & Community",
    description:
      "The broader ecosystem of experts, creator partners, advisory circles, and community members. These relationships amplify the organization's reach and bring outside perspectives.",
    icon: "🌐",
    roles: [
      { title: "Expert Network", desc: "On-demand domain experts for specialized questions" },
      { title: "Creator Partners", desc: "Content creators who amplify brand reach" },
      { title: "Advisory Circles", desc: "Rotating advisors for critique and fresh perspective" },
      { title: "Community", desc: "Customers and users as co-creators of value" },
    ],
    principles: [
      { mind: "Robert Cialdini", insight: "Six principles of influence as operating system" },
      { mind: "Scott Adams", insight: "Talent stacking creates unique value" },
      { mind: "Emily Weiss", insight: "Every customer should be a brand evangelist" },
    ],
    advisorIds: ["robert-cialdini", "scott-adams", "emily-weiss"],
    relevantAgents: [],
  },
  {
    id: "governance",
    name: "The Governance Mesh",
    subtitle: "Integrity Layer — Ethics & Oversight",
    description:
      "The integrity layer ensures the organization operates ethically, manages AI risk, maintains radical transparency, and protects customers. Governance pervades all layers.",
    icon: "⚖️",
    roles: [
      { title: "Ethics Council", desc: "Maximum good test on all major decisions" },
      { title: "AI Safety Monitor", desc: "Continuous risk monitoring for all AI systems" },
      { title: "Transparency Engine", desc: "Radical transparency as default operating mode" },
      { title: "Wisdom Council", desc: "Critique, risk assessment, evidence-based review" },
      { title: "Customer Ombudsman", desc: "Honest communication, especially during crises" },
    ],
    principles: [
      { mind: "Peter Singer", insight: "Maximum good for maximum number" },
      { mind: "Geoffrey Hinton", insight: "Continuous AI risk monitoring" },
      { mind: "Ray Dalio", insight: "Radical transparency by default" },
      { mind: "Byung-Chul Han", insight: "Question the imperative to optimize everything" },
      { mind: "Zelenskyy", insight: "Show up, communicate honestly, never hide" },
    ],
    advisorIds: [
      "peter-singer", "yuval-harari", "geoffrey-hinton",
      "byung-chul-han", "nick-bostrom", "zelenskyy",
    ],
    relevantAgents: [],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MISSION-TO-AGENT MAPPINGS
// ═══════════════════════════════════════════════════════════════════════════

export const MISSION_MAPPINGS: MissionMapping[] = [
  {
    domain: "growth-revenue",
    label: "Growth & Revenue",
    description: "Drive user acquisition, conversion, and revenue growth",
    keyAdvisorIds: ["alex-hormozi", "russell-brunson", "neil-patel"],
    agentIds: ["growth-agent", "content-agent"],
  },
  {
    domain: "product-platform",
    label: "Product & Platform",
    description: "Build, ship, and iterate the core privacy platform",
    keyAdvisorIds: ["sam-altman", "tim-cook", "elon-musk", "mustafa-suleyman"],
    agentIds: ["seo-agent"],
  },
  {
    domain: "commerce-sales",
    label: "Commerce & Sales",
    description: "Close deals, expand relationships, maximize customer value",
    keyAdvisorIds: ["chris-voss", "andy-elliott", "jeremy-miner", "gary-vaynerchuk", "grant-cardone"],
    agentIds: ["billing-agent"],
  },
  {
    domain: "legal-compliance",
    label: "Legal & Compliance",
    description: "Navigate privacy law, CCPA/GDPR, data broker regulations",
    keyAdvisorIds: ["amal-clooney", "neal-katyal", "david-boies", "fiona-scott-morton", "lina-khan"],
    agentIds: ["removal-agent"],
  },
  {
    domain: "customer-culture",
    label: "Customer & Culture",
    description: "Build community, drive engagement, ensure customer success",
    keyAdvisorIds: ["jordan-peterson", "vanessa-van-edwards", "hikaru-nakamura"],
    agentIds: ["support-agent"],
  },
  {
    domain: "competitive-intel",
    label: "Competitive Intelligence",
    description: "Map competitive landscape and maintain strategic advantage",
    keyAdvisorIds: ["magnus-carlsen", "ding-liren", "fabiano-caruana", "ray-dalio"],
    agentIds: ["competitive-intel-agent"],
  },
  {
    domain: "brand-media",
    label: "Brand & Media",
    description: "Create remarkable content that builds brand and drives awareness",
    keyAdvisorIds: ["mrbeast", "joe-rogan", "lex-fridman", "taylor-swift"],
    agentIds: ["content-agent"],
  },
  {
    domain: "science-research",
    label: "Science & Research",
    description: "Advance core technology and scientific capabilities",
    keyAdvisorIds: ["jennifer-doudna", "katalin-kariko", "john-jumper", "feng-zhang"],
    agentIds: [],
  },
  {
    domain: "global-strategy",
    label: "Global Strategy",
    description: "Navigate geopolitical trends and international expansion",
    keyAdvisorIds: ["xi-jinping-ext", "modi-ext", "mbs-ext"],
    agentIds: [],
  },
  {
    domain: "economics",
    label: "Economics",
    description: "Analyze market dynamics, structural patterns, and macro trends",
    keyAdvisorIds: ["daron-acemoglu", "claudia-goldin", "mohamed-el-erian", "raghuram-rajan", "tyler-cowen"],
    agentIds: [],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/** Get an org layer definition by ID */
export function getOrgLayer(id: OrgLayer): OrgLayerDef | undefined {
  return ORG_LAYERS.find((l) => l.id === id);
}

/** Get the org layer for a given GhostMyData agent */
export function getLayerForAgent(agentId: string): OrgLayerDef | undefined {
  return ORG_LAYERS.find((l) => l.relevantAgents.includes(agentId));
}

/** Get the mission mapping for a given GhostMyData agent */
export function getMissionForAgent(agentId: string): MissionMapping | undefined {
  return MISSION_MAPPINGS.find((m) => m.agentIds.includes(agentId));
}

/** Get a mission mapping by domain */
export function getMissionMapping(domain: MissionDomain): MissionMapping | undefined {
  return MISSION_MAPPINGS.find((m) => m.domain === domain);
}
