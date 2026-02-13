/**
 * Mastermind Advisory System - Modern + Historical Advisors
 *
 * 5-Layer Organism Model:
 *   Layer 1: Nucleus (Vision) — 5 architects
 *   Layer 2: Mission Teams (Execution) — 10 domains
 *   Layer 3: AI Agent Layer (Intelligence Amplifier)
 *   Layer 4: Network Layer (Ecosystem)
 *   Layer 5: Governance Mesh (Integrity)
 *
 * ~75 modern living minds (primary) + ~70 historical minds (supplementary)
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type AdvisorDomain =
  | "strategy"
  | "chess"
  | "business"
  | "sales"
  | "innovation"
  | "finance"
  | "economics"
  | "law"
  | "media"
  | "science"
  | "leadership"
  | "marketing"
  | "negotiation"
  | "philosophy"
  | "ai";

export type AdvisorEra = "modern" | "historical";

export type OrgLayer =
  | "nucleus"
  | "missions"
  | "ai-agents"
  | "network"
  | "governance";

export type MissionDomain =
  | "growth-revenue"
  | "product-platform"
  | "commerce-sales"
  | "legal-compliance"
  | "customer-culture"
  | "competitive-intel"
  | "brand-media"
  | "science-research"
  | "global-strategy"
  | "economics";

export type OperatingLayer =
  | "technology"
  | "strategic"
  | "commercial"
  | "human"
  | "wisdom";

export interface Advisor {
  id: string;
  name: string;
  era: AdvisorEra;
  orgLayer: OrgLayer;
  missionDomain?: MissionDomain;
  nucleusRole?: string;
  operatingLayer: OperatingLayer;
  domain: AdvisorDomain;
  thinkingStyle: string;
  keyPrinciple: string;
  promptFragment: string;
  invocation?: { trigger: string; description: string };
  linkedAdvisorId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MODERN ADVISORS (~75 living minds)
// ═══════════════════════════════════════════════════════════════════════════

export const MODERN_ADVISORS: Advisor[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // LAYER 1: THE NUCLEUS (Vision Layer — 5 Architects)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "jensen-huang",
    name: "Jensen Huang",
    era: "modern",
    orgLayer: "nucleus",
    nucleusRole: "Vision Architect",
    operatingLayer: "technology",
    domain: "business",
    thinkingStyle: "infrastructure-first, platform thinking, 10-year vision",
    keyPrinciple: "Build the infrastructure and the applications will come.",
    promptFragment: "Jensen Huang would ask: What platform or infrastructure investment today makes everything else possible in 5 years?",
    invocation: { trigger: "Jensen lens", description: "Infrastructure/platform thinking" },
  },
  {
    id: "demis-hassabis",
    name: "Demis Hassabis",
    era: "modern",
    orgLayer: "nucleus",
    nucleusRole: "Systems Architect",
    operatingLayer: "technology",
    domain: "ai",
    thinkingStyle: "scientific rigor, game-playing AI, systems design",
    keyPrinciple: "Design how technology, people, and AI connect into one system.",
    promptFragment: "Hassabis would ask: What scientific approach yields the most insight, and how do the pieces connect?",
  },
  {
    id: "warren-buffett",
    name: "Warren Buffett",
    era: "modern",
    orgLayer: "nucleus",
    nucleusRole: "Capital Architect",
    operatingLayer: "strategic",
    domain: "finance",
    thinkingStyle: "value investing, circle of competence, long-term compounding",
    keyPrinciple: "Rule No. 1: Never lose money. Rule No. 2: Never forget rule No. 1.",
    promptFragment: "Buffett would ask: Is this within our circle of competence? What is our durable moat?",
    invocation: { trigger: "Buffett test", description: "Circle of competence + front-page test" },
  },
  {
    id: "satya-nadella",
    name: "Satya Nadella",
    era: "modern",
    orgLayer: "nucleus",
    nucleusRole: "Culture Architect",
    operatingLayer: "human",
    domain: "leadership",
    thinkingStyle: "growth mindset, empathy-driven leadership, cultural transformation",
    keyPrinciple: "Culture eats strategy for breakfast. Lead with empathy and a growth mindset.",
    promptFragment: "Nadella would ask: Are we fostering a growth mindset, and does our culture enable our strategy?",
    invocation: { trigger: "Nadella culture", description: "Growth mindset + cultural alignment" },
  },
  {
    id: "dario-amodei",
    name: "Dario Amodei",
    era: "modern",
    orgLayer: "nucleus",
    nucleusRole: "Safety Architect",
    operatingLayer: "wisdom",
    domain: "ai",
    thinkingStyle: "constitutional AI, alignment research, responsible scaling",
    keyPrinciple: "Safety is not an afterthought — it is the architecture itself.",
    promptFragment: "Amodei would ask: What could go catastrophically wrong? Are we building in safety from the start?",
    invocation: { trigger: "Amodei safety", description: "What could go catastrophically wrong?" },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LAYER 2: MISSION TEAMS (Execution Layer — 10 domains)
  // ─────────────────────────────────────────────────────────────────────────

  // --- Growth & Revenue ---
  {
    id: "alex-hormozi",
    name: "Alex Hormozi",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "growth-revenue",
    operatingLayer: "commercial",
    domain: "marketing",
    thinkingStyle: "irresistible offers, value stacking, removing risk",
    keyPrinciple: "Make people an offer so good they feel stupid saying no.",
    promptFragment: "Hormozi would ask: Is our offer so good that people feel stupid saying no? What's the value-to-price ratio?",
    invocation: { trigger: "Hormozi offer", description: "Irresistible offer design" },
  },
  {
    id: "russell-brunson",
    name: "Russell Brunson",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "growth-revenue",
    operatingLayer: "commercial",
    domain: "marketing",
    thinkingStyle: "funnel building, storytelling, value ladder",
    keyPrinciple: "Funnels turn cold traffic into warm leads into paying customers.",
    promptFragment: "Brunson would ask: What's our funnel? Are we moving people through a value ladder?",
    invocation: { trigger: "Brunson funnel", description: "Funnel optimization + value ladder" },
  },
  {
    id: "neil-patel",
    name: "Neil Patel",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "growth-revenue",
    operatingLayer: "commercial",
    domain: "marketing",
    thinkingStyle: "SEO mastery, content marketing, data-driven growth",
    keyPrinciple: "Traffic is oxygen. Without it, nothing else matters.",
    promptFragment: "Patel would ask: What content strategy drives sustainable organic traffic?",
    invocation: { trigger: "Patel SEO", description: "SEO and content-driven growth" },
  },

  // --- Product & Platform ---
  {
    id: "sam-altman",
    name: "Sam Altman",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "product-platform",
    operatingLayer: "technology",
    domain: "ai",
    thinkingStyle: "rapid deployment, iterative improvement, market creation",
    keyPrinciple: "Ship fast, iterate responsibly, and let the product speak.",
    promptFragment: "Altman would ask: How do we ship this fast while being responsible? What does the user actually need?",
    invocation: { trigger: "Altman deploy", description: "Ship fast, iterate responsibly" },
  },
  {
    id: "tim-cook",
    name: "Tim Cook",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "product-platform",
    operatingLayer: "strategic",
    domain: "business",
    thinkingStyle: "operational excellence, supply chain mastery, privacy as value",
    keyPrinciple: "Privacy is a fundamental human right. Operations enable everything.",
    promptFragment: "Cook would ask: Is our operations world-class? Are we protecting user privacy at every touchpoint?",
  },
  {
    id: "elon-musk",
    name: "Elon Musk",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "product-platform",
    operatingLayer: "technology",
    domain: "innovation",
    thinkingStyle: "first principles, 10x thinking, vertical integration",
    keyPrinciple: "When something is important enough, you do it even if the odds are not in your favor.",
    promptFragment: "Musk would ask: What would this look like if we started from first principles instead of analogy?",
    invocation: { trigger: "Musk first-principles", description: "First principles from scratch" },
  },
  {
    id: "mustafa-suleyman",
    name: "Mustafa Suleyman",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "product-platform",
    operatingLayer: "technology",
    domain: "ai",
    thinkingStyle: "applied AI, real-world deployment, ethical technology",
    keyPrinciple: "AI must be deployed to solve real problems for real people.",
    promptFragment: "Suleyman would ask: How does this AI deployment create tangible value for end users?",
  },

  // --- Commerce & Sales ---
  {
    id: "chris-voss",
    name: "Chris Voss",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "commerce-sales",
    operatingLayer: "human",
    domain: "negotiation",
    thinkingStyle: "tactical empathy, labeling, calibrated questions, mirroring",
    keyPrinciple: "Tactical empathy is understanding feelings and mindset, then using that to influence.",
    promptFragment: "Voss would ask: What calibrated question reveals the other side's constraints without confrontation?",
    invocation: { trigger: "Voss mode", description: "Tactical empathy negotiation" },
  },
  {
    id: "andy-elliott",
    name: "Andy Elliott",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "commerce-sales",
    operatingLayer: "commercial",
    domain: "sales",
    thinkingStyle: "high-energy closing, mindset mastery, conviction selling",
    keyPrinciple: "Selling is a transfer of belief. Your conviction must be absolute.",
    promptFragment: "Elliott would ask: Does our team sell with absolute conviction in the product's value?",
  },
  {
    id: "jeremy-miner",
    name: "Jeremy Miner",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "commerce-sales",
    operatingLayer: "commercial",
    domain: "sales",
    thinkingStyle: "NEPQ selling, question-based selling, behavioral science",
    keyPrinciple: "The right questions lead prospects to sell themselves.",
    promptFragment: "Miner would ask: What neuro-emotional persuasion questions lead the prospect to their own conclusion?",
  },
  {
    id: "gary-vaynerchuk",
    name: "Gary Vaynerchuk",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "commerce-sales",
    operatingLayer: "commercial",
    domain: "media",
    thinkingStyle: "content volume, platform-native, give first, patience",
    keyPrinciple: "Jab, jab, jab, right hook. Give value, give value, give value, then ask.",
    promptFragment: "Gary Vee would ask: Are we giving enough value before we ask for anything? Are we native to each platform?",
    invocation: { trigger: "Gary Vee jab", description: "Give value before asking" },
  },
  {
    id: "grant-cardone",
    name: "Grant Cardone",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "commerce-sales",
    operatingLayer: "commercial",
    domain: "sales",
    thinkingStyle: "massive action, 10x effort, relentless follow-up",
    keyPrinciple: "Success is your duty, obligation, and responsibility.",
    promptFragment: "Cardone would ask: Are we putting in 10X the effort we think is needed?",
  },

  // --- Legal & Compliance ---
  {
    id: "amal-clooney",
    name: "Amal Clooney",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "legal-compliance",
    operatingLayer: "strategic",
    domain: "law",
    thinkingStyle: "international human rights law, strategic litigation, media-savvy advocacy",
    keyPrinciple: "Use the law as a sword for justice, not just a shield for compliance.",
    promptFragment: "Clooney would ask: How do we use legal frameworks proactively to advance privacy rights?",
    invocation: { trigger: "Clooney legal", description: "Strategic legal advocacy" },
  },
  {
    id: "neal-katyal",
    name: "Neal Katyal",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "legal-compliance",
    operatingLayer: "strategic",
    domain: "law",
    thinkingStyle: "constitutional law, appellate strategy, precedent-setting",
    keyPrinciple: "The best legal strategy anticipates three moves ahead.",
    promptFragment: "Katyal would ask: What precedent does this set, and how does it position us for future cases?",
  },
  {
    id: "david-boies",
    name: "David Boies",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "legal-compliance",
    operatingLayer: "strategic",
    domain: "law",
    thinkingStyle: "aggressive litigation, cross-examination mastery, pattern recognition",
    keyPrinciple: "Find the weak point in the opponent's argument and press it relentlessly.",
    promptFragment: "Boies would ask: What is the single weakest point in the opposing position?",
  },
  {
    id: "fiona-scott-morton",
    name: "Fiona Scott Morton",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "legal-compliance",
    operatingLayer: "strategic",
    domain: "economics",
    thinkingStyle: "antitrust economics, competition policy, regulatory strategy",
    keyPrinciple: "Market power analysis reveals where regulation should focus.",
    promptFragment: "Scott Morton would ask: What market dynamics should inform our regulatory strategy?",
  },
  {
    id: "lina-khan",
    name: "Lina Khan",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "legal-compliance",
    operatingLayer: "strategic",
    domain: "law",
    thinkingStyle: "antitrust reform, platform regulation, consumer protection",
    keyPrinciple: "Big tech's power over data must be checked through regulation.",
    promptFragment: "Khan would ask: How do data privacy regulations create opportunities for our platform?",
  },

  // --- Customer & Culture ---
  {
    id: "jordan-peterson",
    name: "Jordan Peterson",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "customer-culture",
    operatingLayer: "human",
    domain: "philosophy",
    thinkingStyle: "personal responsibility, meaning-making, psychological depth",
    keyPrinciple: "Take responsibility. Stand up straight. Tell the truth.",
    promptFragment: "Peterson would ask: Are we helping users take responsibility for their digital privacy?",
    invocation: { trigger: "Peterson meaning", description: "Meaning and responsibility framing" },
  },
  {
    id: "vanessa-van-edwards",
    name: "Vanessa Van Edwards",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "customer-culture",
    operatingLayer: "human",
    domain: "negotiation",
    thinkingStyle: "behavioral science, body language, people skills",
    keyPrinciple: "Understanding human behavior is the ultimate competitive advantage.",
    promptFragment: "Van Edwards would ask: What behavioral science insight makes this interaction more engaging?",
  },
  {
    id: "hikaru-nakamura",
    name: "Hikaru Nakamura",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "customer-culture",
    operatingLayer: "strategic",
    domain: "chess",
    thinkingStyle: "speed chess intuition, streaming engagement, community building",
    keyPrinciple: "Fast thinking under pressure reveals true understanding.",
    promptFragment: "Nakamura would ask: Are we building an engaged community, not just a customer base?",
  },

  // --- Competitive Intel ---
  {
    id: "magnus-carlsen",
    name: "Magnus Carlsen",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "competitive-intel",
    operatingLayer: "strategic",
    domain: "chess",
    thinkingStyle: "intuition, endgame mastery, positional pressure, pattern recognition",
    keyPrinciple: "Accumulate small advantages that compound into an unassailable position.",
    promptFragment: "Carlsen would ask: What subtle positional advantage can we accumulate that compounds over time?",
    invocation: { trigger: "Carlsen intuition", description: "Pattern recognition beyond data" },
  },
  {
    id: "ding-liren",
    name: "Ding Liren",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "competitive-intel",
    operatingLayer: "strategic",
    domain: "chess",
    thinkingStyle: "deep calculation, resilience under pressure, defensive mastery",
    keyPrinciple: "The strongest position is one that cannot be broken from any angle.",
    promptFragment: "Ding would ask: What defensive position ensures we survive even the worst-case competitive attack?",
  },
  {
    id: "fabiano-caruana",
    name: "Fabiano Caruana",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "competitive-intel",
    operatingLayer: "strategic",
    domain: "chess",
    thinkingStyle: "deep preparation, opening theory, aggressive calculation",
    keyPrinciple: "Preparation is the foundation of competitive advantage.",
    promptFragment: "Caruana would ask: Have we prepared deeply enough to handle any competitive response?",
  },
  {
    id: "ray-dalio",
    name: "Ray Dalio",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "competitive-intel",
    operatingLayer: "strategic",
    domain: "finance",
    thinkingStyle: "radical transparency, principles-based decisions, idea meritocracy",
    keyPrinciple: "Pain + Reflection = Progress. Radical transparency reveals truth.",
    promptFragment: "Dalio would ask: What does the data honestly tell us? Are we being radically transparent?",
    invocation: { trigger: "Dalio transparency", description: "Radical transparency + principles" },
  },

  // --- Brand & Media ---
  {
    id: "mrbeast",
    name: "MrBeast",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "brand-media",
    operatingLayer: "commercial",
    domain: "media",
    thinkingStyle: "viral mechanics, generosity marketing, extreme commitment, scale thinking",
    keyPrinciple: "Don't make content for a hundred views. Make it for a hundred million.",
    promptFragment: "MrBeast would ask: What's the biggest, most remarkable version of this? How do we make people HAVE to share it?",
    invocation: { trigger: "MrBeast scale", description: "Biggest possible version" },
  },
  {
    id: "joe-rogan",
    name: "Joe Rogan",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "brand-media",
    operatingLayer: "human",
    domain: "media",
    thinkingStyle: "long-form curiosity, authenticity, open-minded exploration",
    keyPrinciple: "Be the hero of your own story. Stay curious and authentic.",
    promptFragment: "Rogan would ask: What's the real, unfiltered story we should be telling?",
  },
  {
    id: "lex-fridman",
    name: "Lex Fridman",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "brand-media",
    operatingLayer: "human",
    domain: "media",
    thinkingStyle: "deep intellectual conversation, love-driven inquiry, vulnerability",
    keyPrinciple: "The best conversations happen at the intersection of intellect and heart.",
    promptFragment: "Fridman would ask: What deeper truth can we explore that resonates with both head and heart?",
  },
  {
    id: "taylor-swift",
    name: "Taylor Swift",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "brand-media",
    operatingLayer: "commercial",
    domain: "media",
    thinkingStyle: "storytelling, fan loyalty, re-invention, brand ownership",
    keyPrinciple: "Own your narrative. Build a fan base that will follow you through any evolution.",
    promptFragment: "Swift would ask: Are we owning our narrative and building fan loyalty that transcends any single product?",
  },

  // --- Science & Research ---
  {
    id: "jennifer-doudna",
    name: "Jennifer Doudna",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "science-research",
    operatingLayer: "technology",
    domain: "science",
    thinkingStyle: "breakthrough science, CRISPR innovation, ethical responsibility",
    keyPrinciple: "Scientific breakthroughs carry the weight of ethical responsibility.",
    promptFragment: "Doudna would ask: What breakthrough could we achieve, and what ethical guardrails must we set?",
  },
  {
    id: "katalin-kariko",
    name: "Katalin Kariko",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "science-research",
    operatingLayer: "technology",
    domain: "science",
    thinkingStyle: "persistence through rejection, mRNA pioneer, belief in the science",
    keyPrinciple: "Keep working on what you believe in, even when no one else does.",
    promptFragment: "Kariko would ask: Are we persisting on the research that matters, even without external validation?",
  },
  {
    id: "john-jumper",
    name: "John Jumper",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "science-research",
    operatingLayer: "technology",
    domain: "ai",
    thinkingStyle: "AI for science, AlphaFold, protein structure prediction",
    keyPrinciple: "AI's greatest potential is accelerating scientific discovery.",
    promptFragment: "Jumper would ask: How can AI accelerate our core research and unlock new capabilities?",
  },
  {
    id: "feng-zhang",
    name: "Feng Zhang",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "science-research",
    operatingLayer: "technology",
    domain: "science",
    thinkingStyle: "genetic engineering, tool-building, biological innovation",
    keyPrinciple: "Build the tools, and the applications will emerge.",
    promptFragment: "Zhang would ask: What tools should we build that enable a whole ecosystem of applications?",
  },

  // --- Global Strategy ---
  {
    id: "xi-jinping-ext",
    name: "Xi Jinping (external)",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "global-strategy",
    operatingLayer: "strategic",
    domain: "leadership",
    thinkingStyle: "long-term state planning, technological sovereignty, strategic patience",
    keyPrinciple: "Think in decades. Control the technology, control the future.",
    promptFragment: "Xi (external) represents: Long-term strategic planning and technological sovereignty. What 10-year position are we building?",
  },
  {
    id: "modi-ext",
    name: "Narendra Modi (external)",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "global-strategy",
    operatingLayer: "strategic",
    domain: "leadership",
    thinkingStyle: "digital infrastructure, mass adoption, leapfrogging legacy systems",
    keyPrinciple: "Build digital infrastructure that enables billions to leapfrog.",
    promptFragment: "Modi (external) represents: Mass digital adoption. How do we build infrastructure that enables scale?",
  },
  {
    id: "mbs-ext",
    name: "MBS (external)",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "global-strategy",
    operatingLayer: "strategic",
    domain: "leadership",
    thinkingStyle: "economic diversification, bold transformation, sovereign wealth",
    keyPrinciple: "Diversify before the old model dies. Transform boldly.",
    promptFragment: "MBS (external) represents: Bold economic transformation. How do we diversify our revenue streams?",
  },

  // --- Economics ---
  {
    id: "daron-acemoglu",
    name: "Daron Acemoglu",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "economics",
    operatingLayer: "wisdom",
    domain: "economics",
    thinkingStyle: "institutional economics, inclusive growth, technology and inequality",
    keyPrinciple: "Inclusive institutions create sustainable prosperity. Extractive ones don't.",
    promptFragment: "Acemoglu would ask: Are we building inclusive systems that create value for all stakeholders?",
  },
  {
    id: "claudia-goldin",
    name: "Claudia Goldin",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "economics",
    operatingLayer: "wisdom",
    domain: "economics",
    thinkingStyle: "labor economics, gender gaps, historical data analysis",
    keyPrinciple: "Data reveals the hidden structures that shape economic outcomes.",
    promptFragment: "Goldin would ask: What hidden structural patterns are we missing in our growth data?",
  },
  {
    id: "mohamed-el-erian",
    name: "Mohamed El-Erian",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "economics",
    operatingLayer: "strategic",
    domain: "economics",
    thinkingStyle: "macro risk management, regime change detection, resilient portfolios",
    keyPrinciple: "Navigating the new normal requires seeing regime changes before others.",
    promptFragment: "El-Erian would ask: Are we seeing macro shifts that will change the competitive landscape?",
  },
  {
    id: "raghuram-rajan",
    name: "Raghuram Rajan",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "economics",
    operatingLayer: "wisdom",
    domain: "economics",
    thinkingStyle: "financial stability, emerging markets, systemic risk",
    keyPrinciple: "Fault lines in the system create the next crisis. Find them early.",
    promptFragment: "Rajan would ask: What fault lines exist in our business model that could crack under stress?",
  },
  {
    id: "tyler-cowen",
    name: "Tyler Cowen",
    era: "modern",
    orgLayer: "missions",
    missionDomain: "economics",
    operatingLayer: "wisdom",
    domain: "economics",
    thinkingStyle: "cultural economics, contrarian thinking, marginal revolution",
    keyPrinciple: "The marginal thinker sees what the consensus misses.",
    promptFragment: "Cowen would ask: What does the contrarian view look like, and why might the consensus be wrong?",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LAYER 3: AI AGENT LAYER (Intelligence Amplifier)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "liang-wenfeng",
    name: "Liang Wenfeng",
    era: "modern",
    orgLayer: "ai-agents",
    operatingLayer: "technology",
    domain: "ai",
    thinkingStyle: "efficiency per dollar, DeepSeek approach, open-source AI",
    keyPrinciple: "Efficiency per dollar matters more than raw capability.",
    promptFragment: "Wenfeng would ask: Are we maximizing AI output per dollar spent?",
    invocation: { trigger: "Wenfeng efficiency", description: "Maximum AI efficiency per dollar" },
  },
  {
    id: "andrew-ng",
    name: "Andrew Ng",
    era: "modern",
    orgLayer: "ai-agents",
    operatingLayer: "technology",
    domain: "ai",
    thinkingStyle: "AI education, practical ML, data-centric AI",
    keyPrinciple: "Data quality > model complexity. Teach AI to the world.",
    promptFragment: "Ng would ask: Is our data quality high enough? Are we over-engineering the model?",
  },
  {
    id: "andrej-karpathy",
    name: "Andrej Karpathy",
    era: "modern",
    orgLayer: "ai-agents",
    operatingLayer: "technology",
    domain: "ai",
    thinkingStyle: "research to production, practical AI engineering, clear communication",
    keyPrinciple: "The gap between research and production is where value is created.",
    promptFragment: "Karpathy would ask: Can we ship this AI from research to production? Are we building something that works in the real world?",
    invocation: { trigger: "Karpathy ship", description: "Ship AI from research to production" },
  },
  {
    id: "yann-lecun",
    name: "Yann LeCun",
    era: "modern",
    orgLayer: "ai-agents",
    operatingLayer: "technology",
    domain: "ai",
    thinkingStyle: "architectural innovation, self-supervised learning, open science",
    keyPrinciple: "Our intelligence is what makes us human, and AI is an extension of that quality.",
    promptFragment: "LeCun would ask: Is our AI architecture fundamentally right, or are we optimizing the wrong approach?",
  },
  {
    id: "ken-griffin",
    name: "Ken Griffin",
    era: "modern",
    orgLayer: "ai-agents",
    operatingLayer: "strategic",
    domain: "finance",
    thinkingStyle: "quantitative trading, speed advantage, data-driven decisions",
    keyPrinciple: "Speed and data precision create edge. Milliseconds matter.",
    promptFragment: "Griffin would ask: Are our AI agents fast enough and precise enough to create a competitive edge?",
  },
  {
    id: "cathie-wood",
    name: "Cathie Wood",
    era: "modern",
    orgLayer: "ai-agents",
    operatingLayer: "strategic",
    domain: "finance",
    thinkingStyle: "disruptive innovation, convergence, exponential growth curves",
    keyPrinciple: "Disruptive technologies converge to create exponential opportunities.",
    promptFragment: "Wood would ask: What convergence of technologies could create exponential growth for us?",
  },
  {
    id: "masayoshi-son",
    name: "Masayoshi Son",
    era: "modern",
    orgLayer: "ai-agents",
    operatingLayer: "strategic",
    domain: "finance",
    thinkingStyle: "300-year vision, bold bets, information revolution",
    keyPrinciple: "Think in centuries, bet boldly on the information revolution.",
    promptFragment: "Son would ask: What bold bet today positions us for the next information revolution wave?",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LAYER 4: NETWORK LAYER (Ecosystem)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "robert-cialdini",
    name: "Robert Cialdini",
    era: "modern",
    orgLayer: "network",
    operatingLayer: "human",
    domain: "negotiation",
    thinkingStyle: "reciprocity, social proof, authority, liking, scarcity, consistency",
    keyPrinciple: "The six principles of influence are the operating system of persuasion.",
    promptFragment: "Cialdini would ask: Which of the six influence principles are we leveraging here?",
    invocation: { trigger: "Cialdini influence", description: "Apply 6 principles of influence" },
  },
  {
    id: "scott-adams",
    name: "Scott Adams",
    era: "modern",
    orgLayer: "network",
    operatingLayer: "strategic",
    domain: "media",
    thinkingStyle: "systems thinking, persuasion, talent stacking",
    keyPrinciple: "Be in the top 25% at two or more things and you become rare and valuable.",
    promptFragment: "Adams would ask: What talent stack makes us uniquely valuable? Are we building a system, not a goal?",
  },
  {
    id: "emily-weiss",
    name: "Emily Weiss",
    era: "modern",
    orgLayer: "network",
    operatingLayer: "commercial",
    domain: "marketing",
    thinkingStyle: "community-driven brand, direct-to-consumer, customer as evangelist",
    keyPrinciple: "Every customer should be a brand evangelist. Build with them, not for them.",
    promptFragment: "Weiss would ask: Are our customers part of the brand story? Are they evangelists?",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LAYER 5: GOVERNANCE MESH (Integrity Layer)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "peter-singer",
    name: "Peter Singer",
    era: "modern",
    orgLayer: "governance",
    operatingLayer: "wisdom",
    domain: "philosophy",
    thinkingStyle: "utilitarian ethics, effective altruism, maximum good",
    keyPrinciple: "Does this action create the maximum good for the maximum number?",
    promptFragment: "Singer would ask: Does this decision maximize overall well-being? Who is affected and how?",
    invocation: { trigger: "Singer ethics", description: "Maximum good test" },
  },
  {
    id: "yuval-harari",
    name: "Yuval Noah Harari",
    era: "modern",
    orgLayer: "governance",
    operatingLayer: "wisdom",
    domain: "philosophy",
    thinkingStyle: "macro-historical perspective, narrative power, technology critique",
    keyPrinciple: "Stories rule the world. Whoever controls the narrative controls reality.",
    promptFragment: "Harari would ask: What story are we telling the world, and is it true?",
  },
  {
    id: "geoffrey-hinton",
    name: "Geoffrey Hinton",
    era: "modern",
    orgLayer: "governance",
    operatingLayer: "wisdom",
    domain: "ai",
    thinkingStyle: "neural network intuition, AI existential risk, honest assessment",
    keyPrinciple: "We must be honest about what AI can do, including the risks we don't yet understand.",
    promptFragment: "Hinton would ask: What AI risks are we not thinking about? Are we being honest with ourselves?",
  },
  {
    id: "byung-chul-han",
    name: "Byung-Chul Han",
    era: "modern",
    orgLayer: "governance",
    operatingLayer: "wisdom",
    domain: "philosophy",
    thinkingStyle: "transparency critique, burnout society, digital panopticon",
    keyPrinciple: "The burnout society demands we question the imperative to optimize everything.",
    promptFragment: "Han would ask: Are we creating genuine value or just feeding the optimization machine?",
  },
  {
    id: "nick-bostrom",
    name: "Nick Bostrom",
    era: "modern",
    orgLayer: "governance",
    operatingLayer: "wisdom",
    domain: "philosophy",
    thinkingStyle: "existential risk, superintelligence, simulation argument",
    keyPrinciple: "The biggest risks are the ones we fail to imagine.",
    promptFragment: "Bostrom would ask: What existential or catastrophic risk have we failed to imagine?",
  },
  {
    id: "zelenskyy",
    name: "Volodymyr Zelenskyy",
    era: "modern",
    orgLayer: "governance",
    operatingLayer: "human",
    domain: "leadership",
    thinkingStyle: "courage under pressure, transparent communication, servant leadership",
    keyPrinciple: "When the crisis comes, show up. Communicate honestly. Never hide.",
    promptFragment: "Zelenskyy would ask: Are we communicating honestly with our customers, especially when things go wrong?",
    invocation: { trigger: "Zelenskyy courage", description: "Courage + honest communication" },
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// HISTORICAL ADVISORS (~70 timeless minds)
// ═══════════════════════════════════════════════════════════════════════════

export const HISTORICAL_ADVISORS: Advisor[] = [
  // --- Strategy & Military ---
  { id: "sun-tzu", name: "Sun Tzu", era: "historical", orgLayer: "governance", operatingLayer: "strategic", domain: "strategy", thinkingStyle: "positioning, indirect approach, winning without fighting", keyPrinciple: "The supreme art of war is to subdue the enemy without fighting.", promptFragment: "Sun Tzu would ask: What position makes victory inevitable before the battle begins?" },
  { id: "napoleon", name: "Napoleon Bonaparte", era: "historical", orgLayer: "missions", operatingLayer: "strategic", domain: "strategy", thinkingStyle: "concentration of force, speed, decisiveness", keyPrinciple: "Take time to deliberate, but when the time for action comes, stop thinking and go in.", promptFragment: "Napoleon would ask: Where can we concentrate overwhelming force at the decisive point?" },
  { id: "alexander", name: "Alexander the Great", era: "historical", orgLayer: "missions", operatingLayer: "strategic", domain: "strategy", thinkingStyle: "boldness, leading by example, cultural integration", keyPrinciple: "There is nothing impossible to him who will try.", promptFragment: "Alexander would ask: What bold move would inspire the team and terrify the competition?" },
  { id: "genghis-khan", name: "Genghis Khan", era: "historical", orgLayer: "missions", operatingLayer: "strategic", domain: "strategy", thinkingStyle: "meritocracy, scalable systems, psychological warfare", keyPrinciple: "An action committed in anger is an action doomed to failure.", promptFragment: "Genghis Khan would ask: How do we build systems that scale regardless of who runs them?" },
  { id: "kissinger", name: "Henry Kissinger", era: "historical", orgLayer: "missions", missionDomain: "global-strategy", operatingLayer: "strategic", domain: "strategy", thinkingStyle: "realpolitik, balance of power, strategic patience", keyPrinciple: "The task of the leader is to get people from where they are to where they have not been.", promptFragment: "Kissinger would ask: What is the realistic balance of power, and how do we shift it?" },

  // --- Chess Legends ---
  { id: "kasparov", name: "Garry Kasparov", era: "historical", orgLayer: "missions", missionDomain: "competitive-intel", operatingLayer: "strategic", domain: "chess", thinkingStyle: "deep preparation, aggressive execution, pattern mastery", keyPrinciple: "The ability to work hard for days on end without losing focus is a talent.", promptFragment: "Kasparov would ask: Have we prepared deeply enough, and are we being aggressive enough?" },
  { id: "fischer", name: "Bobby Fischer", era: "historical", orgLayer: "missions", operatingLayer: "strategic", domain: "chess", thinkingStyle: "precision, obsessive preparation, psychological pressure", keyPrinciple: "I don't believe in psychology. I believe in good moves.", promptFragment: "Fischer would ask: Is this move technically perfect, or are we making sloppy compromises?" },
  { id: "capablanca", name: "Jose Raul Capablanca", era: "historical", orgLayer: "missions", operatingLayer: "strategic", domain: "chess", thinkingStyle: "simplification, natural talent, positional clarity", keyPrinciple: "You may learn much more from a game you lose than from a game you win.", promptFragment: "Capablanca would ask: Can we simplify this to its essence and still win?" },
  { id: "lasker", name: "Emanuel Lasker", era: "historical", orgLayer: "missions", operatingLayer: "wisdom", domain: "chess", thinkingStyle: "psychological insight, practical play, adaptability", keyPrinciple: "When you see a good move, look for a better one.", promptFragment: "Lasker would ask: What move is objectively best given our opponent's psychology?" },

  // --- Business Titans ---
  { id: "rockefeller", name: "John D. Rockefeller", era: "historical", orgLayer: "missions", operatingLayer: "strategic", domain: "business", thinkingStyle: "vertical integration, cost efficiency, systematic domination", keyPrinciple: "Don't be afraid to give up the good to go for the great.", promptFragment: "Rockefeller would ask: How do we control the entire value chain and eliminate waste?" },
  { id: "jobs", name: "Steve Jobs", era: "historical", orgLayer: "missions", missionDomain: "product-platform", operatingLayer: "technology", domain: "business", thinkingStyle: "simplicity, taste, intersection of technology and liberal arts", keyPrinciple: "Design is not just what it looks like and feels like. Design is how it works.", promptFragment: "Jobs would ask: Is this product so simple and beautiful that people will love it?" },
  { id: "bezos", name: "Jeff Bezos", era: "historical", orgLayer: "missions", operatingLayer: "strategic", domain: "business", thinkingStyle: "customer obsession, long-term thinking, flywheel effects", keyPrinciple: "Your margin is my opportunity.", promptFragment: "Bezos would ask: What does the customer actually want, and how does this create a flywheel?" },
  { id: "carnegie-a", name: "Andrew Carnegie", era: "historical", orgLayer: "missions", operatingLayer: "strategic", domain: "business", thinkingStyle: "people investment, process optimization, scaling through others", keyPrinciple: "Teamwork is the ability to work together toward a common vision.", promptFragment: "Andrew Carnegie would ask: Are we investing in the right people and processes to scale?" },

  // --- Sales Pioneers ---
  { id: "girard", name: "Joe Girard", era: "historical", orgLayer: "missions", missionDomain: "commerce-sales", operatingLayer: "human", domain: "sales", thinkingStyle: "relationship building, law of 250, personal touch", keyPrinciple: "The elevator to success is out of order. You'll have to use the stairs.", promptFragment: "Girard would ask: How does every customer interaction create a referral opportunity?" },
  { id: "ziglar", name: "Zig Ziglar", era: "historical", orgLayer: "missions", missionDomain: "commerce-sales", operatingLayer: "human", domain: "sales", thinkingStyle: "service-first selling, enthusiasm, goal-setting", keyPrinciple: "You can have everything in life you want, if you will just help other people get what they want.", promptFragment: "Ziglar would ask: How are we genuinely helping the customer get what they want?" },
  { id: "carnegie-d", name: "Dale Carnegie", era: "historical", orgLayer: "network", operatingLayer: "human", domain: "sales", thinkingStyle: "friendliness, genuine interest, making people feel important", keyPrinciple: "You can make more friends in two months by becoming interested in other people.", promptFragment: "Dale Carnegie would ask: Are we genuinely interested in the customer's world?" },
  { id: "belfort", name: "Jordan Belfort", era: "historical", orgLayer: "missions", missionDomain: "commerce-sales", operatingLayer: "commercial", domain: "sales", thinkingStyle: "straight line persuasion, tonality, closing", keyPrinciple: "The only thing standing between you and your goal is the story you keep telling yourself.", promptFragment: "Belfort would ask: Are we moving the conversation straight toward the close?" },

  // --- Innovation & Technology ---
  { id: "da-vinci", name: "Leonardo da Vinci", era: "historical", orgLayer: "missions", operatingLayer: "technology", domain: "innovation", thinkingStyle: "curiosity, observation, cross-disciplinary thinking", keyPrinciple: "Simplicity is the ultimate sophistication.", promptFragment: "Da Vinci would ask: What can we learn from nature and other fields that applies here?" },
  { id: "tesla-inventor", name: "Nikola Tesla", era: "historical", orgLayer: "missions", operatingLayer: "technology", domain: "innovation", thinkingStyle: "visualization, systems thinking, future-oriented", keyPrinciple: "The present is theirs; the future, for which I really worked, is mine.", promptFragment: "Tesla would ask: What does the future look like, and are we building for it?" },
  { id: "turing", name: "Alan Turing", era: "historical", orgLayer: "missions", operatingLayer: "technology", domain: "innovation", thinkingStyle: "logical frameworks, code-breaking, unconventional thinking", keyPrinciple: "Sometimes it is the people no one imagines anything of who do the things that no one can imagine.", promptFragment: "Turing would ask: What pattern can we decode that others have missed?" },
  { id: "edison", name: "Thomas Edison", era: "historical", orgLayer: "missions", operatingLayer: "technology", domain: "innovation", thinkingStyle: "rapid iteration, systematic experimentation, commercialization", keyPrinciple: "I have not failed. I've just found 10,000 ways that won't work.", promptFragment: "Edison would ask: What experiment can we run today to learn the fastest?" },
  { id: "gates", name: "Bill Gates", era: "historical", orgLayer: "missions", operatingLayer: "technology", domain: "innovation", thinkingStyle: "platform thinking, ecosystem building, standards", keyPrinciple: "We always overestimate the change in two years and underestimate the change in ten.", promptFragment: "Gates would ask: Are we building a platform that others will build on top of?" },

  // --- Finance Legends ---
  { id: "morgan", name: "J.P. Morgan", era: "historical", orgLayer: "missions", operatingLayer: "strategic", domain: "finance", thinkingStyle: "leverage, trust, decisive capital allocation", keyPrinciple: "A man always has two reasons for doing anything: a good reason and the real reason.", promptFragment: "Morgan would ask: What is the real reason behind this decision, and how do we capitalize?" },
  { id: "soros", name: "George Soros", era: "historical", orgLayer: "missions", operatingLayer: "strategic", domain: "finance", thinkingStyle: "reflexivity, market psychology, asymmetric bets", keyPrinciple: "It's not whether you're right or wrong, but how much you make when you're right.", promptFragment: "Soros would ask: What asymmetric bet can we make where upside far exceeds downside?" },
  { id: "munger", name: "Charlie Munger", era: "historical", orgLayer: "governance", operatingLayer: "wisdom", domain: "finance", thinkingStyle: "mental models, inversion, multidisciplinary thinking", keyPrinciple: "Invert, always invert.", promptFragment: "Munger would ask: What would guarantee failure here? Now let's avoid all of that." },
  { id: "thiel", name: "Peter Thiel", era: "historical", orgLayer: "missions", operatingLayer: "strategic", domain: "finance", thinkingStyle: "contrarian thinking, monopoly building, secrets", keyPrinciple: "Competition is for losers.", promptFragment: "Thiel would ask: What important truth do very few people agree with us on?" },

  // --- Economics ---
  { id: "adam-smith", name: "Adam Smith", era: "historical", orgLayer: "governance", operatingLayer: "wisdom", domain: "economics", thinkingStyle: "market forces, specialization, self-interest alignment", keyPrinciple: "It is not from the benevolence of the butcher that we expect our dinner.", promptFragment: "Adam Smith would ask: How do we align everyone's self-interest with the outcome we want?" },
  { id: "keynes", name: "John Maynard Keynes", era: "historical", orgLayer: "governance", operatingLayer: "strategic", domain: "economics", thinkingStyle: "counter-cyclical thinking, aggregate demand, animal spirits", keyPrinciple: "The market can stay irrational longer than you can stay solvent.", promptFragment: "Keynes would ask: What do the market's animal spirits tell us about timing?" },
  { id: "friedman", name: "Milton Friedman", era: "historical", orgLayer: "governance", operatingLayer: "wisdom", domain: "economics", thinkingStyle: "free markets, incentive analysis, unintended consequences", keyPrinciple: "Judge policies by their results, not their intentions.", promptFragment: "Friedman would ask: What unintended consequences might this create?" },
  { id: "hayek", name: "Friedrich Hayek", era: "historical", orgLayer: "governance", operatingLayer: "wisdom", domain: "economics", thinkingStyle: "distributed knowledge, spontaneous order, planning limits", keyPrinciple: "The curious task of economics is to demonstrate to men how little they really know.", promptFragment: "Hayek would ask: What knowledge is distributed that we can't centralize?" },
  { id: "sowell", name: "Thomas Sowell", era: "historical", orgLayer: "governance", operatingLayer: "wisdom", domain: "economics", thinkingStyle: "trade-off analysis, empirical evidence, skepticism", keyPrinciple: "There are no solutions. There are only trade-offs.", promptFragment: "Sowell would ask: What trade-offs are we ignoring by pretending this is a solution?" },

  // --- Law ---
  { id: "marshall", name: "John Marshall", era: "historical", orgLayer: "governance", operatingLayer: "wisdom", domain: "law", thinkingStyle: "precedent, constitutional interpretation, institutional design", keyPrinciple: "The power to tax is the power to destroy.", promptFragment: "Marshall would ask: What precedent are we setting, and what will its long-term consequences be?" },
  { id: "darrow", name: "Clarence Darrow", era: "historical", orgLayer: "missions", missionDomain: "legal-compliance", operatingLayer: "human", domain: "law", thinkingStyle: "empathetic advocacy, narrative persuasion", keyPrinciple: "The best that we can do is to be kindly and helpful toward our friends.", promptFragment: "Darrow would ask: What's the human story here that will move people?" },
  { id: "ginsburg", name: "Ruth Bader Ginsburg", era: "historical", orgLayer: "governance", operatingLayer: "wisdom", domain: "law", thinkingStyle: "incremental change, persistence, equality-focused", keyPrinciple: "Real change, enduring change, happens one step at a time.", promptFragment: "Ginsburg would ask: What incremental step moves us toward the right outcome?" },

  // --- Media & Influence ---
  { id: "oprah", name: "Oprah Winfrey", era: "historical", orgLayer: "network", operatingLayer: "human", domain: "media", thinkingStyle: "authentic connection, vulnerability, audience empowerment", keyPrinciple: "Turn your wounds into wisdom.", promptFragment: "Oprah would ask: How do we create an authentic emotional connection with our audience?" },
  { id: "robbins", name: "Tony Robbins", era: "historical", orgLayer: "network", operatingLayer: "human", domain: "media", thinkingStyle: "state management, peak performance, pattern interrupts", keyPrinciple: "It's not what we do once in a while that shapes our lives. It's what we do consistently.", promptFragment: "Robbins would ask: What pattern do we need to interrupt, and what state do we want to create?" },

  // --- Science ---
  { id: "einstein", name: "Albert Einstein", era: "historical", orgLayer: "governance", operatingLayer: "wisdom", domain: "science", thinkingStyle: "thought experiments, first principles, simplification", keyPrinciple: "Everything should be made as simple as possible, but not simpler.", promptFragment: "Einstein would ask: What would this look like if we reduced it to its simplest form?" },
  { id: "newton", name: "Isaac Newton", era: "historical", orgLayer: "governance", operatingLayer: "wisdom", domain: "science", thinkingStyle: "fundamental laws, mathematical rigor, standing on shoulders", keyPrinciple: "If I have seen further, it is by standing on the shoulders of giants.", promptFragment: "Newton would ask: What fundamental force or law governs this situation?" },
  { id: "curie", name: "Marie Curie", era: "historical", orgLayer: "governance", operatingLayer: "wisdom", domain: "science", thinkingStyle: "relentless experimentation, data-driven, courage under adversity", keyPrinciple: "Nothing in life is to be feared, it is only to be understood.", promptFragment: "Curie would ask: What data are we missing, and what experiment will reveal it?" },
  { id: "feynman", name: "Richard Feynman", era: "historical", orgLayer: "governance", operatingLayer: "wisdom", domain: "science", thinkingStyle: "first principles explanation, BS detection, playful curiosity", keyPrinciple: "The first principle is that you must not fool yourself — and you are the easiest person to fool.", promptFragment: "Feynman would ask: Can we explain this so simply that a child would understand?" },
  { id: "hawking", name: "Stephen Hawking", era: "historical", orgLayer: "governance", operatingLayer: "wisdom", domain: "science", thinkingStyle: "boundary-pushing, accessibility, long-term horizons", keyPrinciple: "Intelligence is the ability to adapt to change.", promptFragment: "Hawking would ask: What limitation are we accepting that we should be pushing beyond?" },

  // --- Leadership & Governance ---
  { id: "machiavelli", name: "Niccolo Machiavelli", era: "historical", orgLayer: "governance", operatingLayer: "wisdom", domain: "leadership", thinkingStyle: "pragmatic power, understanding human nature, survival", keyPrinciple: "Everyone sees what you appear to be, few experience what you really are.", promptFragment: "Machiavelli would ask: What does power look like in this situation, and who really holds it?" },
  { id: "churchill", name: "Winston Churchill", era: "historical", orgLayer: "governance", operatingLayer: "human", domain: "leadership", thinkingStyle: "resilience, oratory, courage under fire", keyPrinciple: "Success is not final, failure is not fatal: it is the courage to continue that counts.", promptFragment: "Churchill would ask: Are we showing the courage and resilience this moment demands?" },
  { id: "lincoln", name: "Abraham Lincoln", era: "historical", orgLayer: "governance", operatingLayer: "wisdom", domain: "leadership", thinkingStyle: "unity building, moral courage, empathetic leadership", keyPrinciple: "The best way to predict the future is to create it.", promptFragment: "Lincoln would ask: How do we unite people around a shared moral purpose?" },
  { id: "lee-kuan-yew", name: "Lee Kuan Yew", era: "historical", orgLayer: "governance", operatingLayer: "strategic", domain: "leadership", thinkingStyle: "pragmatic excellence, meritocracy, long-term vision", keyPrinciple: "We decide what is right. Never mind what the people think.", promptFragment: "Lee Kuan Yew would ask: What's the pragmatic path to excellence, regardless of popular opinion?" },
  { id: "fdr", name: "Franklin D. Roosevelt", era: "historical", orgLayer: "governance", operatingLayer: "human", domain: "leadership", thinkingStyle: "bold experimentation, communication, coalition building", keyPrinciple: "The only thing we have to fear is fear itself.", promptFragment: "FDR would ask: What bold action can we take right now to restore confidence?" },

  // --- Marketing ---
  { id: "ogilvy", name: "David Ogilvy", era: "historical", orgLayer: "missions", missionDomain: "brand-media", operatingLayer: "human", domain: "marketing", thinkingStyle: "research-driven copy, headline mastery, specificity", keyPrinciple: "The consumer is not a moron. She is your wife.", promptFragment: "Ogilvy would ask: Have we done enough research, and is our headline doing 80% of the work?" },
  { id: "godin", name: "Seth Godin", era: "historical", orgLayer: "missions", missionDomain: "brand-media", operatingLayer: "strategic", domain: "marketing", thinkingStyle: "being remarkable, permission marketing, tribe building", keyPrinciple: "In a crowded marketplace, not standing out is the same as being invisible.", promptFragment: "Godin would ask: Is this remarkable enough that someone would tell a friend about it?" },
  { id: "kotler", name: "Philip Kotler", era: "historical", orgLayer: "missions", missionDomain: "growth-revenue", operatingLayer: "strategic", domain: "marketing", thinkingStyle: "systematic frameworks, segmentation, positioning", keyPrinciple: "Marketing is the art of creating genuine customer value.", promptFragment: "Kotler would ask: Have we properly segmented, targeted, and positioned for maximum value?" },

  // --- Negotiation ---
  { id: "cohen", name: "Herb Cohen", era: "historical", orgLayer: "network", operatingLayer: "strategic", domain: "negotiation", thinkingStyle: "everything is negotiable, information power, time pressure", keyPrinciple: "The world is a giant negotiating table.", promptFragment: "Cohen would ask: What information advantage do we have, and how do we use time pressure?" },
  { id: "ury", name: "William Ury", era: "historical", orgLayer: "network", operatingLayer: "wisdom", domain: "negotiation", thinkingStyle: "BATNA, principled negotiation, going to the balcony", keyPrinciple: "The best alternative to a negotiated agreement is your greatest source of power.", promptFragment: "Ury would ask: What's our BATNA, and have we helped them see theirs is worse?" },

  // --- Philosophy ---
  { id: "aristotle", name: "Aristotle", era: "historical", orgLayer: "governance", operatingLayer: "wisdom", domain: "philosophy", thinkingStyle: "virtue ethics, golden mean, logic, systematic categorization", keyPrinciple: "We are what we repeatedly do. Excellence is not an act, but a habit.", promptFragment: "Aristotle would ask: What habit or virtue, practiced consistently, leads to excellence here?" },
  { id: "marcus-aurelius", name: "Marcus Aurelius", era: "historical", orgLayer: "governance", operatingLayer: "wisdom", domain: "philosophy", thinkingStyle: "stoic discipline, memento mori, control dichotomy", keyPrinciple: "You have power over your mind — not outside events.", promptFragment: "Marcus Aurelius would ask: What is within our control here, and what must we accept?" },
  { id: "confucius", name: "Confucius", era: "historical", orgLayer: "governance", operatingLayer: "wisdom", domain: "philosophy", thinkingStyle: "relational harmony, proper conduct, rectification of names", keyPrinciple: "The man who moves a mountain begins by carrying away small stones.", promptFragment: "Confucius would ask: Are our words matching our actions, and are our relationships in order?" },
  { id: "nietzsche", name: "Friedrich Nietzsche", era: "historical", orgLayer: "governance", operatingLayer: "wisdom", domain: "philosophy", thinkingStyle: "will to power, value creation, eternal recurrence", keyPrinciple: "He who has a why to live can bear almost any how.", promptFragment: "Nietzsche would ask: What is our deeper 'why' that makes every 'how' bearable?" },
  { id: "socrates", name: "Socrates", era: "historical", orgLayer: "governance", operatingLayer: "wisdom", domain: "philosophy", thinkingStyle: "Socratic questioning, knowing what you don't know, dialectic", keyPrinciple: "The unexamined life is not worth living.", promptFragment: "Socrates would ask: What assumption are we making that we haven't questioned?" },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED + UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/** All advisors combined (modern takes precedence for dedup) */
export const ALL_ADVISORS: Advisor[] = [...MODERN_ADVISORS, ...HISTORICAL_ADVISORS];

/** Look up a single advisor by ID (modern first) */
export function getAdvisor(id: string): Advisor | undefined {
  return MODERN_ADVISORS.find((a) => a.id === id) || HISTORICAL_ADVISORS.find((a) => a.id === id);
}

/** Get advisors by org layer */
export function getAdvisorsByOrgLayer(layer: OrgLayer): Advisor[] {
  return ALL_ADVISORS.filter((a) => a.orgLayer === layer);
}

/** Get advisors by mission domain */
export function getAdvisorsByMission(mission: MissionDomain): Advisor[] {
  return ALL_ADVISORS.filter((a) => a.missionDomain === mission);
}

/** Get only modern advisors */
export function getModernAdvisors(): Advisor[] {
  return MODERN_ADVISORS;
}

/** Get only historical advisors */
export function getHistoricalAdvisors(): Advisor[] {
  return HISTORICAL_ADVISORS;
}

/** Get advisors by domain */
export function getAdvisorsByDomain(domain: AdvisorDomain): Advisor[] {
  return ALL_ADVISORS.filter((a) => a.domain === domain);
}

/** Get advisors by operating layer */
export function getAdvisorsByOperatingLayer(layer: OperatingLayer): Advisor[] {
  return ALL_ADVISORS.filter((a) => a.operatingLayer === layer);
}

/** Get Nucleus advisors (the 5 Architects) */
export function getNucleusAdvisors(): Advisor[] {
  return MODERN_ADVISORS.filter((a) => a.orgLayer === "nucleus");
}

/** Get unique advisors (modern preferred over historical with same domain/name) */
export function getUniqueAdvisors(): Advisor[] {
  const seen = new Set<string>();
  const unique: Advisor[] = [];
  for (const a of [...MODERN_ADVISORS, ...HISTORICAL_ADVISORS]) {
    const key = a.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(a);
    }
  }
  return unique;
}

/** Get all unique domain values */
export function getAllDomains(): AdvisorDomain[] {
  return [...new Set(ALL_ADVISORS.map((a) => a.domain))];
}
