/**
 * Mastermind Advisory System - Corporate Org Structure (Feb 2026)
 *
 * Board of Directors + C-Suite + 14 Divisions
 * Replaces the 5-Layer Organism Model with a bootstrapped corporate structure.
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
// 3-TIER ORG MODEL: Board + C-Suite + Divisions
// ═══════════════════════════════════════════════════════════════════════════

export const ORG_LAYERS: OrgLayerDef[] = [
  {
    id: "board",
    name: "Board of Directors",
    subtitle: "5 Directors — Strategic Governance",
    description:
      "The Board sets long-term direction, allocates capital, ensures ethical governance, and provides strategic oversight. Includes one historical framework (Marcus Aurelius — Stoic Decision Discipline).",
    icon: "🏛️",
    roles: [
      { title: "Chairman", desc: "Capital allocation, long-term thinking, margin of safety (Buffett)" },
      { title: "Vice Chairman", desc: "Macro cycles, principles, risk management (Dalio)" },
      { title: "Director of Behavioral Science", desc: "Influence ethics, persuasion science (Cialdini)" },
      { title: "Director of Decision Discipline", desc: "Stoic governance — what is within our control? (Marcus Aurelius framework)" },
      { title: "Director of Sustainable Growth", desc: "Bootstrapped strategy, anti-hustle, zebra not unicorn (Fishkin)" },
    ],
    principles: [
      { mind: "Warren Buffett", insight: "Circle of competence, never lose money, front-page test" },
      { mind: "Ray Dalio", insight: "Radical transparency, know where you are in the cycle" },
      { mind: "Robert Cialdini", insight: "Seven principles of influence as operating system" },
      { mind: "Marcus Aurelius", insight: "Focus only on what is within your control" },
      { mind: "Rand Fishkin", insight: "Be a Zebra — sustainable, profitable growth" },
    ],
    advisorIds: ["warren-buffett", "ray-dalio", "robert-cialdini", "rand-fishkin", "marcus-aurelius"],
    relevantAgents: [],
  },
  {
    id: "c-suite",
    name: "C-Suite",
    subtitle: "16 Executives — Operational Leadership",
    description:
      "The executive team translates board strategy into operational reality. Each role maps to a specific domain of excellence. The C-Suite is designed for a bootstrapped AI, cybersecurity & growth company.",
    icon: "👔",
    roles: [
      { title: "CEO", desc: "Platform strategy, infrastructure dominance (Jensen Huang)" },
      { title: "President & COO", desc: "Growth mindset, operational transformation (Nadella)" },
      { title: "Chief Product Officer", desc: "Frontier tech to accessible products (Altman)" },
      { title: "CTO", desc: "AI for scientific discovery (Hassabis)" },
      { title: "Chief Safety Officer", desc: "Responsible AI, constitutional AI (Amodei)" },
      { title: "COO — Supply Chain", desc: "Greatest operator in history (Cook)" },
      { title: "Chief Revenue Officer", desc: "Offer design, radical transparency (Hormozi)" },
      { title: "General Counsel", desc: "International law, moral authority (Clooney)" },
      { title: "Chief Economist", desc: "Institutions, AI economic impact (Acemoglu)" },
      { title: "Chief Brand & Media", desc: "Attention, algorithms, scale (MrBeast)" },
      { title: "CISO", desc: "Global cybersecurity leadership (Hyppönen)" },
      { title: "Chief Design Officer", desc: "Product aesthetics, materiality (Ive)" },
      { title: "Chief Organic Growth", desc: "SEO, audience intelligence, bootstrapped marketing (Fishkin)" },
      { title: "Chief Relevance Engineer", desc: "AI search, technical SEO, passage optimization (King)" },
      { title: "VP of AI-Security", desc: "AI + cybersecurity convergence (Miessler)" },
      { title: "Chief Performance Architect", desc: "Infrastructure, DevOps, managed services (Hightower)" },
    ],
    principles: [
      { mind: "Jensen Huang", insight: "Build infrastructure, applications will come" },
      { mind: "Dario Amodei", insight: "Safety is the architecture, not an afterthought" },
      { mind: "Alex Hormozi", insight: "Offers so good people feel stupid saying no" },
      { mind: "Mike King", insight: "Engineer relevance across all search surfaces" },
      { mind: "Kelsey Hightower", insight: "Don't over-optimize for problems you don't have" },
    ],
    advisorIds: [
      "jensen-huang", "satya-nadella", "sam-altman", "demis-hassabis", "dario-amodei",
      "tim-cook", "alex-hormozi", "amal-clooney", "daron-acemoglu", "mrbeast",
      "mikko-hypponen", "jony-ive", "mike-king", "daniel-miessler", "kelsey-hightower",
    ],
    relevantAgents: [
      "removal-agent", "support-agent", "billing-agent",
      "growth-agent", "content-agent", "seo-agent",
      "competitive-intel-agent",
    ],
  },
  {
    id: "divisions",
    name: "14 Divisions",
    subtitle: "160+ Minds — Execution & Expertise",
    description:
      "Cross-functional divisions organized by domain. Each division has C-Suite heads and domain experts from 19 categories spanning strategy, technology, commerce, security, design, education, and more.",
    icon: "🎯",
    roles: [
      { title: "AI R&D", desc: "Frontier AI research and efficient innovation" },
      { title: "Science", desc: "AI-powered scientific discovery" },
      { title: "Capital & Trading", desc: "Capital allocation, quantitative strategy" },
      { title: "Product & Design", desc: "Product development, UX, visual design" },
      { title: "Commerce & Sales", desc: "Revenue, deals, customer relationships" },
      { title: "SEO & Organic Growth", desc: "Search optimization, content, audience leverage" },
      { title: "Security & AI Defense", desc: "Cybersecurity, adversarial testing, AI defense" },
      { title: "Infrastructure & Performance", desc: "DevOps, supply chain, lean operations" },
      { title: "Academy", desc: "Education, learning design, mastery" },
      { title: "Behavior Lab", desc: "Psychology, behavioral science, decision-making" },
      { title: "Legal & Regulatory", desc: "Law, compliance, antitrust, rights" },
      { title: "Economics & Policy", desc: "Macro analysis, institutional design" },
      { title: "Brand & Attention", desc: "Media, content, cultural impact" },
      { title: "Global Strategy", desc: "Geopolitics, competitive positioning" },
    ],
    principles: [
      { mind: "Liang Wenfeng", insight: "Efficiency per dollar > raw capability" },
      { mind: "Rand Fishkin", insight: "Use other people's audiences to grow your own" },
      { mind: "Daniel Miessler", insight: "AI gives security professionals 10,000x leverage" },
      { mind: "Kelsey Hightower", insight: "Use managed services, don't build what you can buy" },
      { mind: "BJ Fogg", insight: "Behavior = Motivation x Ability x Prompt" },
    ],
    advisorIds: [], // Too many to list — use MISSION_MAPPINGS for per-division lookup
    relevantAgents: [
      "removal-agent", "support-agent", "billing-agent",
      "growth-agent", "content-agent", "seo-agent",
      "competitive-intel-agent",
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 14 DIVISION MAPPINGS
// ═══════════════════════════════════════════════════════════════════════════

export const MISSION_MAPPINGS: MissionMapping[] = [
  {
    domain: "ai-rd",
    label: "AI R&D",
    description: "Frontier AI research, efficient innovation, and responsible development",
    keyAdvisorIds: ["demis-hassabis", "sam-altman", "yann-lecun", "liang-wenfeng", "andrew-ng", "andrej-karpathy", "geoffrey-hinton"],
    agentIds: [],
  },
  {
    domain: "science-research",
    label: "Science",
    description: "AI-powered scientific discovery across biology, chemistry, and materials science",
    keyAdvisorIds: ["demis-hassabis", "jennifer-doudna", "katalin-kariko", "john-jumper", "feng-zhang"],
    agentIds: [],
  },
  {
    domain: "capital-trading",
    label: "Capital & Trading",
    description: "Capital allocation, quantitative strategy, and financial architecture",
    keyAdvisorIds: ["warren-buffett", "ken-griffin", "ray-dalio", "cathie-wood", "masayoshi-son", "graham-ben", "jim-simons", "livermore"],
    agentIds: [],
  },
  {
    domain: "product-design",
    label: "Product & Design",
    description: "Product development, UX, industrial design, and user experience architecture",
    keyAdvisorIds: ["sam-altman", "jony-ive", "tim-cook", "elon-musk", "dieter-rams", "bjarke-ingels", "neri-oxman", "jobs"],
    agentIds: ["seo-agent"],
  },
  {
    domain: "commerce-sales",
    label: "Commerce & Sales",
    description: "Revenue generation, deal-making, funnel optimization, and customer relationships",
    keyAdvisorIds: ["alex-hormozi", "russell-brunson", "neil-patel", "andy-elliott", "chris-voss", "gary-vaynerchuk", "jeremy-miner"],
    agentIds: ["billing-agent"],
  },
  {
    domain: "seo-organic-growth",
    label: "SEO & Organic Growth",
    description: "Search engine optimization, AI search surfaces, content strategy, and audience leverage",
    keyAdvisorIds: ["rand-fishkin", "mike-king", "neil-patel", "godin", "ogilvy", "halbert", "hopkins"],
    agentIds: ["growth-agent", "content-agent", "seo-agent"],
  },
  {
    domain: "security-defense",
    label: "Security & AI Defense",
    description: "Cybersecurity, adversarial testing, social engineering defense, and AI security integration",
    keyAdvisorIds: ["mikko-hypponen", "daniel-miessler", "kevin-mitnick", "bruce-schneier", "katie-moussouris", "parisa-tabriz", "marcus-hutchins"],
    agentIds: [],
  },
  {
    domain: "infrastructure-performance",
    label: "Infrastructure & Performance",
    description: "DevOps, supply chain optimization, lean operations, and managed services strategy",
    keyAdvisorIds: ["kelsey-hightower", "tim-cook", "taiichi-ohno", "henry-ford", "andy-jassy", "ryan-petersen"],
    agentIds: [],
  },
  {
    domain: "academy",
    label: "Academy",
    description: "Education, learning design, AI tutoring, mastery-based skill development",
    keyAdvisorIds: ["montessori", "sal-khan", "dewey", "andrew-ng", "barbara-oakley", "bloom"],
    agentIds: [],
  },
  {
    domain: "behavior-lab",
    label: "Behavior Lab",
    description: "Psychology, behavioral science, decision-making, habit formation, and cognitive bias",
    keyAdvisorIds: ["daniel-kahneman", "carl-jung", "bj-fogg", "angela-duckworth", "dan-ariely", "andrew-huberman"],
    agentIds: [],
  },
  {
    domain: "legal-compliance",
    label: "Legal & Regulatory",
    description: "Privacy law, CCPA/GDPR, antitrust, rights advocacy, and regulatory strategy",
    keyAdvisorIds: ["amal-clooney", "neal-katyal", "david-boies", "fiona-scott-morton", "lina-khan", "marshall"],
    agentIds: ["removal-agent"],
  },
  {
    domain: "economics-policy",
    label: "Economics & Policy",
    description: "Macro analysis, institutional design, labor economics, and AI economic impact",
    keyAdvisorIds: ["daron-acemoglu", "claudia-goldin", "mohamed-el-erian", "raghuram-rajan", "tyler-cowen", "sowell"],
    agentIds: [],
  },
  {
    domain: "brand-attention",
    label: "Brand & Attention",
    description: "Media, content creation, cultural impact, attention arbitrage, and brand building",
    keyAdvisorIds: ["mrbeast", "joe-rogan", "lex-fridman", "taylor-swift", "gary-vaynerchuk", "oprah"],
    agentIds: ["content-agent"],
  },
  {
    domain: "global-strategy",
    label: "Global Strategy",
    description: "Geopolitics, competitive positioning, crisis leadership, and multi-front operations",
    keyAdvisorIds: ["sun-tzu", "satya-nadella", "jensen-huang", "zelenskyy", "clausewitz", "magnus-carlsen"],
    agentIds: ["competitive-intel-agent"],
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
