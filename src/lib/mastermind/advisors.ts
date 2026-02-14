/**
 * Mastermind Advisory System - Complete Codex (Feb 2026)
 *
 * 19 Categories | 140+ Historical | 100+ Modern | 240+ Minds Total
 * Board of Directors + C-Suite + 14 Divisions
 * 10 Thinking Layers | 11-Step Protocol | 45+ Invocations
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type AdvisorDomain =
  | "strategy"
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
  | "ai"
  | "design"
  | "cybersecurity"
  | "education"
  | "investing"
  | "supply-chain"
  | "psychology";

export type AdvisorEra = "modern" | "historical";

export type OrgLayer = "board" | "c-suite" | "divisions";

export type MissionDomain =
  | "ai-rd"
  | "science-research"
  | "capital-trading"
  | "product-design"
  | "commerce-sales"
  | "seo-organic-growth"
  | "security-defense"
  | "infrastructure-performance"
  | "academy"
  | "behavior-lab"
  | "legal-compliance"
  | "economics-policy"
  | "brand-attention"
  | "global-strategy";

export type OperatingLayer =
  | "strategic"
  | "execution"
  | "technology"
  | "commercial"
  | "human"
  | "wisdom"
  | "seo-growth"
  | "design"
  | "infrastructure"
  | "security";

export interface Advisor {
  id: string;
  name: string;
  era: AdvisorEra;
  orgLayer: OrgLayer;
  missionDomain?: MissionDomain;
  corpRole?: string;
  operatingLayer: OperatingLayer;
  domain: AdvisorDomain;
  thinkingStyle: string;
  keyPrinciple: string;
  promptFragment: string;
  invocation?: { trigger: string; description: string };
}

// ═══════════════════════════════════════════════════════════════════════════
// MODERN ADVISORS (100+ living minds)
// ═══════════════════════════════════════════════════════════════════════════

export const MODERN_ADVISORS: Advisor[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // BOARD OF DIRECTORS
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "warren-buffett",
    name: "Warren Buffett",
    era: "modern",
    orgLayer: "board",
    corpRole: "Chairman",
    operatingLayer: "strategic",
    domain: "finance",
    thinkingStyle: "value investing, circle of competence, long-term compounding, margin of safety",
    keyPrinciple: "Rule No. 1: Never lose money. Rule No. 2: Never forget rule No. 1.",
    promptFragment: "Buffett would ask: Is this within our circle of competence? What is our durable moat?",
    invocation: { trigger: "Buffett test", description: "Circle of competence + margin of safety + long-term check" },
  },
  {
    id: "ray-dalio",
    name: "Ray Dalio",
    era: "modern",
    orgLayer: "board",
    corpRole: "Vice Chairman",
    operatingLayer: "strategic",
    domain: "finance",
    thinkingStyle: "radical transparency, principles-based decisions, macro cycles, debt cycles",
    keyPrinciple: "Pain + Reflection = Progress. Radical transparency reveals truth.",
    promptFragment: "Dalio would ask: What does the data honestly tell us? Where are we in the economic/technology cycle?",
    invocation: { trigger: "Dalio cycles", description: "Where are we in the economic/technology cycle?" },
  },
  {
    id: "robert-cialdini",
    name: "Robert Cialdini",
    era: "modern",
    orgLayer: "board",
    corpRole: "Director of Behavioral Science",
    operatingLayer: "human",
    domain: "negotiation",
    thinkingStyle: "reciprocity, social proof, authority, liking, scarcity, consistency, unity",
    keyPrinciple: "The seven principles of influence are the operating system of persuasion.",
    promptFragment: "Cialdini would ask: Which of the seven influence principles are we leveraging here?",
    invocation: { trigger: "Cialdini influence", description: "Apply 7 principles of influence" },
  },
  {
    id: "rand-fishkin",
    name: "Rand Fishkin",
    era: "modern",
    orgLayer: "board",
    corpRole: "Director of Sustainable Growth / Chief Organic Growth Officer",
    operatingLayer: "seo-growth",
    domain: "marketing",
    thinkingStyle: "bootstrapped growth, audience intelligence, other people's audiences, anti-hustle, zebra not unicorn",
    keyPrinciple: "Our biggest growth lever is using other people's audiences to grow our own.",
    promptFragment: "Fishkin would ask: What would a profitable 3-person company do? Are we building a Zebra or chasing a Unicorn?",
    invocation: { trigger: "Fishkin growth", description: "Bootstrapped organic growth — other people's audiences, no paid ads" },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // C-SUITE (16 Roles)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "jensen-huang",
    name: "Jensen Huang",
    era: "modern",
    orgLayer: "c-suite",
    corpRole: "CEO",
    operatingLayer: "technology",
    domain: "business",
    thinkingStyle: "infrastructure-first, platform thinking, 10-year vision, AI chips",
    keyPrinciple: "Build the infrastructure and the applications will come.",
    promptFragment: "Jensen Huang would ask: What platform or infrastructure investment today makes everything else possible in 5 years?",
    invocation: { trigger: "Jensen lens", description: "Infrastructure/platform thinking — what layer should we own?" },
  },
  {
    id: "satya-nadella",
    name: "Satya Nadella",
    era: "modern",
    orgLayer: "c-suite",
    corpRole: "President & COO",
    operatingLayer: "human",
    domain: "leadership",
    thinkingStyle: "growth mindset, empathy-driven leadership, cultural transformation, partnerships",
    keyPrinciple: "Culture eats strategy for breakfast. Lead with empathy and a growth mindset.",
    promptFragment: "Nadella would ask: Are we fostering a growth mindset, and does our culture enable our strategy?",
    invocation: { trigger: "Nadella operator", description: "Operational excellence — partnerships, culture, execution" },
  },
  {
    id: "sam-altman",
    name: "Sam Altman",
    era: "modern",
    orgLayer: "c-suite",
    corpRole: "Chief Product Officer",
    operatingLayer: "technology",
    domain: "ai",
    thinkingStyle: "rapid deployment, iterative improvement, market creation, accessibility",
    keyPrinciple: "Ship fast, iterate responsibly, and let the product speak.",
    promptFragment: "Altman would ask: How do we ship this fast while being responsible? What does the user actually need?",
    invocation: { trigger: "Altman deploy", description: "Take complex technology and make it accessible at scale" },
  },
  {
    id: "demis-hassabis",
    name: "Demis Hassabis",
    era: "modern",
    orgLayer: "c-suite",
    corpRole: "CTO",
    operatingLayer: "technology",
    domain: "ai",
    thinkingStyle: "scientific rigor, AI-science convergence, AlphaFold, systems design",
    keyPrinciple: "AI's greatest potential is accelerating scientific discovery.",
    promptFragment: "Hassabis would ask: How can AI accelerate scientific discovery for this problem?",
    invocation: { trigger: "Hassabis science", description: "How can AI accelerate scientific discovery for this problem?" },
  },
  {
    id: "dario-amodei",
    name: "Dario Amodei",
    era: "modern",
    orgLayer: "c-suite",
    corpRole: "Chief Safety Officer",
    operatingLayer: "wisdom",
    domain: "ai",
    thinkingStyle: "constitutional AI, alignment research, responsible scaling, interpretability",
    keyPrinciple: "Safety is not an afterthought — it is the architecture itself.",
    promptFragment: "Amodei would ask: What could go catastrophically wrong? Are we building in safety from the start?",
    invocation: { trigger: "Amodei safety", description: "Risk assessment — what could go catastrophically wrong?" },
  },
  {
    id: "tim-cook",
    name: "Tim Cook",
    era: "modern",
    orgLayer: "c-suite",
    corpRole: "COO — Supply Chain",
    operatingLayer: "infrastructure",
    domain: "business",
    thinkingStyle: "operational excellence, supply chain mastery, privacy as value, flawless execution",
    keyPrinciple: "Privacy is a fundamental human right. Operations enable everything.",
    promptFragment: "Cook would ask: Is our operations world-class? Are we protecting user privacy at every touchpoint?",
  },
  {
    id: "alex-hormozi",
    name: "Alex Hormozi",
    era: "modern",
    orgLayer: "c-suite",
    corpRole: "Chief Revenue Officer",
    operatingLayer: "commercial",
    domain: "marketing",
    thinkingStyle: "irresistible offers, value stacking, removing risk, radical transparency",
    keyPrinciple: "Make people an offer so good they feel stupid saying no.",
    promptFragment: "Hormozi would ask: Is our offer so good that people feel stupid saying no? What's the value-to-price ratio?",
    invocation: { trigger: "Hormozi offer", description: "Design an irresistible offer using the value equation" },
  },
  {
    id: "amal-clooney",
    name: "Amal Clooney",
    era: "modern",
    orgLayer: "c-suite",
    corpRole: "General Counsel",
    operatingLayer: "strategic",
    domain: "law",
    thinkingStyle: "international human rights law, strategic litigation, moral authority",
    keyPrinciple: "Use the law as a sword for justice, not just a shield for compliance.",
    promptFragment: "Clooney would ask: How do we use legal frameworks proactively to advance privacy rights?",
    invocation: { trigger: "Clooney legal", description: "Strategic legal advocacy" },
  },
  {
    id: "daron-acemoglu",
    name: "Daron Acemoglu",
    era: "modern",
    orgLayer: "c-suite",
    corpRole: "Chief Economist",
    operatingLayer: "wisdom",
    domain: "economics",
    thinkingStyle: "institutional economics, inclusive growth, AI economic impact, inequality",
    keyPrinciple: "Inclusive institutions create sustainable prosperity. Extractive ones don't.",
    promptFragment: "Acemoglu would ask: Are we building inclusive systems that create value for all stakeholders?",
  },
  {
    id: "mrbeast",
    name: "MrBeast",
    era: "modern",
    orgLayer: "c-suite",
    corpRole: "Chief Brand & Media",
    operatingLayer: "commercial",
    domain: "media",
    thinkingStyle: "viral mechanics, generosity marketing, extreme commitment, scale thinking, algorithms",
    keyPrinciple: "Don't make content for a hundred views. Make it for a hundred million.",
    promptFragment: "MrBeast would ask: What's the biggest, most remarkable version of this? How do we make people HAVE to share it?",
    invocation: { trigger: "MrBeast scale", description: "What's the biggest possible version of this concept?" },
  },
  {
    id: "mikko-hypponen",
    name: "Mikko Hyppönen",
    era: "modern",
    orgLayer: "c-suite",
    corpRole: "CISO",
    operatingLayer: "security",
    domain: "cybersecurity",
    thinkingStyle: "global cybersecurity leadership, threat landscape, policy, TED-level communication",
    keyPrinciple: "If it's smart, it's vulnerable. Security is everyone's responsibility.",
    promptFragment: "Hyppönen would ask: What is our actual threat model, and are we defending against the right adversaries?",
  },
  {
    id: "jony-ive",
    name: "Jony Ive",
    era: "modern",
    orgLayer: "c-suite",
    corpRole: "Chief Design Officer",
    operatingLayer: "design",
    domain: "design",
    thinkingStyle: "minimalism, materiality, emotional connection, removing the unnecessary",
    keyPrinciple: "True simplicity is derived from so much more than just the absence of clutter.",
    promptFragment: "Ive would ask: How does this product feel? What's the emotional connection between human and product?",
    invocation: { trigger: "Ive materiality", description: "How does this product feel? What's the emotional connection?" },
  },
  {
    id: "mike-king",
    name: "Mike King",
    era: "modern",
    orgLayer: "c-suite",
    corpRole: "Chief Relevance Engineer",
    operatingLayer: "seo-growth",
    domain: "marketing",
    thinkingStyle: "AI search optimization, relevance engineering, passage-level optimization, information retrieval",
    keyPrinciple: "Do you all really want to stay the janitors of the web? This is our moment to be something different.",
    promptFragment: "King would ask: Are we engineering relevance across all search surfaces — AI Overviews, AI Mode, and LLM retrieval?",
    invocation: { trigger: "King relevance", description: "AI search optimization — passage-level, AI Overviews, LLM retrieval" },
  },
  {
    id: "daniel-miessler",
    name: "Daniel Miessler",
    era: "modern",
    orgLayer: "c-suite",
    corpRole: "VP of AI-Security Integration",
    operatingLayer: "security",
    domain: "cybersecurity",
    thinkingStyle: "AI-security convergence, Fabric framework, SecLists, offensive security, automation",
    keyPrinciple: "Stop asking what's possible with AI. Start asking: What would you do with 10,000 employees?",
    promptFragment: "Miessler would ask: How do we build AI-powered automation for this security/ops workflow?",
    invocation: { trigger: "Miessler augment", description: "AI-security integration — what would 10,000 employees do?" },
  },
  {
    id: "kelsey-hightower",
    name: "Kelsey Hightower",
    era: "modern",
    orgLayer: "c-suite",
    corpRole: "Chief Performance Architect",
    operatingLayer: "infrastructure",
    domain: "supply-chain",
    thinkingStyle: "managed services, Kubernetes, cloud-native, simplicity, don't over-optimize",
    keyPrinciple: "Before you over-optimize for a problem you may not even have, ask: how bad is it really?",
    promptFragment: "Hightower would ask: Are we over-engineering this? Should we build or buy as a managed service?",
    invocation: { trigger: "Hightower simplify", description: "Infrastructure audit — are we over-engineering? Use managed services?" },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DIVISIONS — AI R&D
  // ─────────────────────────────────────────────────────────────────────────
  { id: "liang-wenfeng", name: "Liang Wenfeng", era: "modern", orgLayer: "divisions", missionDomain: "ai-rd", operatingLayer: "technology", domain: "ai",
    thinkingStyle: "efficiency per dollar, DeepSeek approach, open-source AI", keyPrinciple: "Efficiency per dollar matters more than raw capability.",
    promptFragment: "Wenfeng would ask: Are we maximizing AI output per dollar spent?",
    invocation: { trigger: "Wenfeng efficiency", description: "How do we build this at 1/10th the expected cost?" } },
  { id: "andrew-ng", name: "Andrew Ng", era: "modern", orgLayer: "divisions", missionDomain: "ai-rd", operatingLayer: "technology", domain: "ai",
    thinkingStyle: "AI education, practical ML, data-centric AI", keyPrinciple: "Data quality > model complexity. Teach AI to the world.",
    promptFragment: "Ng would ask: Is our data quality high enough? Are we over-engineering the model?" },
  { id: "andrej-karpathy", name: "Andrej Karpathy", era: "modern", orgLayer: "divisions", missionDomain: "ai-rd", operatingLayer: "execution", domain: "ai",
    thinkingStyle: "research to production, practical AI engineering, clear communication", keyPrinciple: "The gap between research and production is where value is created.",
    promptFragment: "Karpathy would ask: Can we ship this AI from research to production? Does it work in the real world?",
    invocation: { trigger: "Karpathy ship", description: "Ship AI from research to production" } },
  { id: "yann-lecun", name: "Yann LeCun", era: "modern", orgLayer: "divisions", missionDomain: "ai-rd", operatingLayer: "technology", domain: "ai",
    thinkingStyle: "architectural innovation, self-supervised learning, open science, contrarianism", keyPrinciple: "Our intelligence is what makes us human, and AI is an extension of that quality.",
    promptFragment: "LeCun would ask: Is our AI architecture fundamentally right, or are we optimizing the wrong approach?" },
  { id: "mustafa-suleyman", name: "Mustafa Suleyman", era: "modern", orgLayer: "divisions", missionDomain: "ai-rd", operatingLayer: "technology", domain: "ai",
    thinkingStyle: "applied AI, real-world deployment, ethical technology", keyPrinciple: "AI must be deployed to solve real problems for real people.",
    promptFragment: "Suleyman would ask: How does this AI deployment create tangible value for end users?" },
  { id: "geoffrey-hinton", name: "Geoffrey Hinton", era: "modern", orgLayer: "divisions", missionDomain: "ai-rd", operatingLayer: "wisdom", domain: "ai",
    thinkingStyle: "neural network intuition, AI existential risk, honest assessment", keyPrinciple: "We must be honest about what AI can do, including the risks we don't yet understand.",
    promptFragment: "Hinton would ask: What AI risks are we not thinking about? Are we being honest with ourselves?" },
  { id: "nick-bostrom", name: "Nick Bostrom", era: "modern", orgLayer: "divisions", missionDomain: "ai-rd", operatingLayer: "wisdom", domain: "philosophy",
    thinkingStyle: "existential risk, superintelligence, simulation argument", keyPrinciple: "The biggest risks are the ones we fail to imagine.",
    promptFragment: "Bostrom would ask: What existential or catastrophic risk have we failed to imagine?" },

  // ─────────────────────────────────────────────────────────────────────────
  // DIVISIONS — Science
  // ─────────────────────────────────────────────────────────────────────────
  { id: "jennifer-doudna", name: "Jennifer Doudna", era: "modern", orgLayer: "divisions", missionDomain: "science-research", operatingLayer: "technology", domain: "science",
    thinkingStyle: "breakthrough science, CRISPR innovation, ethical responsibility", keyPrinciple: "Scientific breakthroughs carry the weight of ethical responsibility.",
    promptFragment: "Doudna would ask: What breakthrough could we achieve, and what ethical guardrails must we set?" },
  { id: "katalin-kariko", name: "Katalin Kariko", era: "modern", orgLayer: "divisions", missionDomain: "science-research", operatingLayer: "technology", domain: "science",
    thinkingStyle: "persistence through rejection, mRNA pioneer, belief in the science", keyPrinciple: "Keep working on what you believe in, even when no one else does.",
    promptFragment: "Kariko would ask: Are we persisting on the research that matters, even without external validation?" },
  { id: "john-jumper", name: "John Jumper", era: "modern", orgLayer: "divisions", missionDomain: "science-research", operatingLayer: "technology", domain: "ai",
    thinkingStyle: "AI for science, AlphaFold, protein structure prediction", keyPrinciple: "AI's greatest potential is accelerating scientific discovery.",
    promptFragment: "Jumper would ask: How can AI accelerate our core research and unlock new capabilities?" },
  { id: "feng-zhang", name: "Feng Zhang", era: "modern", orgLayer: "divisions", missionDomain: "science-research", operatingLayer: "technology", domain: "science",
    thinkingStyle: "genetic engineering, tool-building, biological innovation", keyPrinciple: "Build the tools, and the applications will emerge.",
    promptFragment: "Zhang would ask: What tools should we build that enable a whole ecosystem of applications?" },

  // ─────────────────────────────────────────────────────────────────────────
  // DIVISIONS — Capital & Trading
  // ─────────────────────────────────────────────────────────────────────────
  { id: "ken-griffin", name: "Ken Griffin", era: "modern", orgLayer: "divisions", missionDomain: "capital-trading", operatingLayer: "strategic", domain: "investing",
    thinkingStyle: "quantitative trading, speed advantage, data-driven decisions, algorithmic finance", keyPrinciple: "Speed and data precision create edge. Milliseconds matter.",
    promptFragment: "Griffin would ask: Are our systems fast enough and precise enough to create a competitive edge?" },
  { id: "cathie-wood", name: "Cathie Wood", era: "modern", orgLayer: "divisions", missionDomain: "capital-trading", operatingLayer: "strategic", domain: "investing",
    thinkingStyle: "disruptive innovation, convergence, exponential growth curves, thematic investing", keyPrinciple: "Disruptive technologies converge to create exponential opportunities.",
    promptFragment: "Wood would ask: What convergence of technologies could create exponential growth for us?" },
  { id: "masayoshi-son", name: "Masayoshi Son", era: "modern", orgLayer: "divisions", missionDomain: "capital-trading", operatingLayer: "strategic", domain: "investing",
    thinkingStyle: "300-year vision, bold bets, information revolution, technology-scale investments", keyPrinciple: "Think in centuries, bet boldly on the information revolution.",
    promptFragment: "Son would ask: What bold bet today positions us for the next information revolution wave?" },

  // ─────────────────────────────────────────────────────────────────────────
  // DIVISIONS — Product & Design
  // ─────────────────────────────────────────────────────────────────────────
  { id: "elon-musk", name: "Elon Musk", era: "modern", orgLayer: "divisions", missionDomain: "product-design", operatingLayer: "execution", domain: "innovation",
    thinkingStyle: "first principles, 10x thinking, vertical integration, multi-domain", keyPrinciple: "When something is important enough, you do it even if the odds are not in your favor.",
    promptFragment: "Musk would ask: What would this look like if we started from first principles instead of analogy?",
    invocation: { trigger: "First principles", description: "Einstein + Musk breakdown to fundamentals" } },
  { id: "bjarke-ingels", name: "Bjarke Ingels", era: "modern", orgLayer: "divisions", missionDomain: "product-design", operatingLayer: "design", domain: "design",
    thinkingStyle: "yes is more, hedonistic sustainability, impossible-looking buildings", keyPrinciple: "Don't compromise between competing requirements — find the design that satisfies all simultaneously.",
    promptFragment: "Ingels would ask: Can we find the design that satisfies ALL competing requirements, not just compromise?" },
  { id: "neri-oxman", name: "Neri Oxman", era: "modern", orgLayer: "divisions", missionDomain: "product-design", operatingLayer: "design", domain: "design",
    thinkingStyle: "bio-computational design, material ecology, structures that grow", keyPrinciple: "Nature is the ultimate designer — grow, don't just build.",
    promptFragment: "Oxman would ask: Can we create a system that grows and adapts rather than being statically built?" },
  { id: "john-maeda", name: "John Maeda", era: "modern", orgLayer: "divisions", missionDomain: "product-design", operatingLayer: "design", domain: "design",
    thinkingStyle: "laws of simplicity, design-technology bridge, computational design", keyPrinciple: "Simplicity is about subtracting the obvious and adding the meaningful.",
    promptFragment: "Maeda would ask: What's obvious here that we should subtract? What's meaningful we should add?" },

  // ─────────────────────────────────────────────────────────────────────────
  // DIVISIONS — Commerce & Sales
  // ─────────────────────────────────────────────────────────────────────────
  { id: "russell-brunson", name: "Russell Brunson", era: "modern", orgLayer: "divisions", missionDomain: "commerce-sales", operatingLayer: "commercial", domain: "marketing",
    thinkingStyle: "funnel building, storytelling, value ladder", keyPrinciple: "Funnels turn cold traffic into warm leads into paying customers.",
    promptFragment: "Brunson would ask: What's our funnel? Are we moving people through a value ladder?",
    invocation: { trigger: "Brunson funnel", description: "Design the conversion architecture for this customer journey" } },
  { id: "neil-patel", name: "Neil Patel", era: "modern", orgLayer: "divisions", missionDomain: "commerce-sales", operatingLayer: "seo-growth", domain: "marketing",
    thinkingStyle: "SEO mastery, content marketing, data-driven growth", keyPrinciple: "Traffic is oxygen. Without it, nothing else matters.",
    promptFragment: "Patel would ask: What content strategy drives sustainable organic traffic?",
    invocation: { trigger: "Patel SEO", description: "SEO and content-driven growth" } },
  { id: "chris-voss", name: "Chris Voss", era: "modern", orgLayer: "divisions", missionDomain: "commerce-sales", operatingLayer: "human", domain: "negotiation",
    thinkingStyle: "tactical empathy, labeling, calibrated questions, mirroring", keyPrinciple: "Tactical empathy is understanding feelings and mindset, then using that to influence.",
    promptFragment: "Voss would ask: What calibrated question reveals the other side's constraints without confrontation?",
    invocation: { trigger: "Voss mode", description: "Tactical empathy for negotiation or tough conversation" } },
  { id: "andy-elliott", name: "Andy Elliott", era: "modern", orgLayer: "divisions", missionDomain: "commerce-sales", operatingLayer: "commercial", domain: "sales",
    thinkingStyle: "high-energy closing, mindset mastery, conviction selling", keyPrinciple: "Selling is a transfer of belief. Your conviction must be absolute.",
    promptFragment: "Elliott would ask: Does our team sell with absolute conviction in the product's value?" },
  { id: "jeremy-miner", name: "Jeremy Miner", era: "modern", orgLayer: "divisions", missionDomain: "commerce-sales", operatingLayer: "commercial", domain: "sales",
    thinkingStyle: "NEPQ selling, question-based selling, behavioral science", keyPrinciple: "The right questions lead prospects to sell themselves.",
    promptFragment: "Miner would ask: What neuro-emotional persuasion questions lead the prospect to their own conclusion?" },
  { id: "gary-vaynerchuk", name: "Gary Vaynerchuk", era: "modern", orgLayer: "divisions", missionDomain: "commerce-sales", operatingLayer: "commercial", domain: "media",
    thinkingStyle: "content volume, platform-native, give first, patience, attention arbitrage", keyPrinciple: "Jab, jab, jab, right hook. Give value, give value, give value, then ask.",
    promptFragment: "Gary Vee would ask: Are we giving enough value before we ask? Where is attention underpriced right now?",
    invocation: { trigger: "Gary Vee attention", description: "Where is attention underpriced right now?" } },
  { id: "grant-cardone", name: "Grant Cardone", era: "modern", orgLayer: "divisions", missionDomain: "commerce-sales", operatingLayer: "commercial", domain: "sales",
    thinkingStyle: "massive action, 10x effort, relentless follow-up", keyPrinciple: "Success is your duty, obligation, and responsibility.",
    promptFragment: "Cardone would ask: Are we putting in 10X the effort we think is needed?",
    invocation: { trigger: "10X it", description: "Cardone energy — what would 10X action look like?" } },
  { id: "emily-weiss", name: "Emily Weiss", era: "modern", orgLayer: "divisions", missionDomain: "commerce-sales", operatingLayer: "commercial", domain: "marketing",
    thinkingStyle: "community-driven brand, direct-to-consumer, customer as evangelist", keyPrinciple: "Every customer should be a brand evangelist. Build with them, not for them.",
    promptFragment: "Weiss would ask: Are our customers part of the brand story? Are they evangelists?" },

  // ─────────────────────────────────────────────────────────────────────────
  // DIVISIONS — Security & AI Defense
  // ─────────────────────────────────────────────────────────────────────────
  { id: "katie-moussouris", name: "Katie Moussouris", era: "modern", orgLayer: "divisions", missionDomain: "security-defense", operatingLayer: "security", domain: "cybersecurity",
    thinkingStyle: "bug bounty programs, hacker-powered security, vulnerability disclosure", keyPrinciple: "Pay people to find your vulnerabilities before enemies do.",
    promptFragment: "Moussouris would ask: Have we tested adversarially? Are we paying people to break our systems?" },
  { id: "parisa-tabriz", name: "Parisa Tabriz", era: "modern", orgLayer: "divisions", missionDomain: "security-defense", operatingLayer: "security", domain: "cybersecurity",
    thinkingStyle: "security-by-default, Chrome security, secure architecture for billions", keyPrinciple: "Build security into the architecture, not bolted on after.",
    promptFragment: "Tabriz would ask: Is security embedded in our architecture, or bolted on as an afterthought?" },
  { id: "marcus-hutchins", name: "Marcus Hutchins", era: "modern", orgLayer: "divisions", missionDomain: "security-defense", operatingLayer: "security", domain: "cybersecurity",
    thinkingStyle: "malware analysis, WannaCry hero, defensive security research", keyPrinciple: "One person with the right skills at the right time can stop a global threat.",
    promptFragment: "Hutchins would ask: What single-point-of-failure could take us down, and do we have someone who can stop it?" },

  // ─────────────────────────────────────────────────────────────────────────
  // DIVISIONS — Infrastructure & Performance
  // ─────────────────────────────────────────────────────────────────────────
  { id: "andy-jassy", name: "Andy Jassy", era: "modern", orgLayer: "divisions", missionDomain: "infrastructure-performance", operatingLayer: "infrastructure", domain: "business",
    thinkingStyle: "cloud infrastructure, supply chain of compute, digital logistics", keyPrinciple: "Build the supply chain of compute that powers everything.",
    promptFragment: "Jassy would ask: Are we building infrastructure that powers a thousand use cases or just one?" },
  { id: "ryan-petersen", name: "Ryan Petersen", era: "modern", orgLayer: "divisions", missionDomain: "infrastructure-performance", operatingLayer: "infrastructure", domain: "supply-chain",
    thinkingStyle: "global logistics, supply chain visibility, operating system for trade", keyPrinciple: "Make the invisible visible — logistics transparency is a competitive advantage.",
    promptFragment: "Petersen would ask: Can we see every step in our operational pipeline, or are there blind spots?" },
  { id: "marc-lore", name: "Marc Lore", era: "modern", orgLayer: "divisions", missionDomain: "infrastructure-performance", operatingLayer: "infrastructure", domain: "supply-chain",
    thinkingStyle: "real-time pricing, supply chain proximity, food logistics innovation", keyPrinciple: "Real-time optimization of supply chain proximity creates impossible-to-match pricing.",
    promptFragment: "Lore would ask: How can we use proximity and real-time data to optimize delivery?" },

  // ─────────────────────────────────────────────────────────────────────────
  // DIVISIONS — Academy
  // ─────────────────────────────────────────────────────────────────────────
  { id: "sal-khan", name: "Sal Khan", era: "modern", orgLayer: "divisions", missionDomain: "academy", operatingLayer: "technology", domain: "education",
    thinkingStyle: "free education at scale, AI tutoring, Khanmigo, mastery-based learning", keyPrinciple: "Free world-class education for everyone, everywhere.",
    promptFragment: "Khan would ask: Are we building on solid foundations or skipping prerequisites?",
    invocation: { trigger: "Khan mastery", description: "Are we building on solid foundations or skipping prerequisites?" } },
  { id: "barbara-oakley", name: "Barbara Oakley", era: "modern", orgLayer: "divisions", missionDomain: "academy", operatingLayer: "technology", domain: "education",
    thinkingStyle: "learning how to learn, diffuse mode, chunking, deliberate practice", keyPrinciple: "The best learning happens when you alternate between focused and diffuse thinking.",
    promptFragment: "Oakley would ask: Are we creating conditions for both focused and diffuse mode thinking?" },
  { id: "luis-von-ahn", name: "Luis von Ahn", era: "modern", orgLayer: "divisions", missionDomain: "academy", operatingLayer: "technology", domain: "education",
    thinkingStyle: "gamified learning, Duolingo, behavioral psychology, addictive education", keyPrinciple: "The best education feels like a game you can't stop playing.",
    promptFragment: "Von Ahn would ask: Have we gamified learning so users can't stop coming back?" },
  { id: "scott-young", name: "Scott Young", era: "modern", orgLayer: "divisions", missionDomain: "academy", operatingLayer: "execution", domain: "education",
    thinkingStyle: "ultralearning, self-directed education, rapid skill acquisition", keyPrinciple: "Ultralearning: aggressive, self-directed learning that works.",
    promptFragment: "Young would ask: What's the most aggressive learning path to mastery here?" },

  // ─────────────────────────────────────────────────────────────────────────
  // DIVISIONS — Behavior Lab
  // ─────────────────────────────────────────────────────────────────────────
  { id: "bj-fogg", name: "BJ Fogg", era: "modern", orgLayer: "divisions", missionDomain: "behavior-lab", operatingLayer: "human", domain: "psychology",
    thinkingStyle: "Fogg Behavior Model, tiny habits, motivation × ability × prompt", keyPrinciple: "Behavior = Motivation × Ability × Prompt. Make it tiny to make it happen.",
    promptFragment: "Fogg would ask: Is the desired behavior easy enough and prompted at the right moment?" },
  { id: "angela-duckworth", name: "Angela Duckworth", era: "modern", orgLayer: "divisions", missionDomain: "behavior-lab", operatingLayer: "human", domain: "psychology",
    thinkingStyle: "grit research, perseverance + passion, deliberate practice", keyPrinciple: "Grit — perseverance and passion for long-term goals — predicts success better than talent.",
    promptFragment: "Duckworth would ask: Do we have the grit to persist through the hard middle?",
    invocation: { trigger: "Duckworth grit", description: "Do we have the perseverance and passion to persist?" } },
  { id: "dan-ariely", name: "Dan Ariely", era: "modern", orgLayer: "divisions", missionDomain: "behavior-lab", operatingLayer: "human", domain: "psychology",
    thinkingStyle: "predictably irrational, pricing psychology, motivation design", keyPrinciple: "Humans are predictably irrational — design for how they actually behave, not how they should.",
    promptFragment: "Ariely would ask: What predictable irrationality should we design for in our user experience?" },
  { id: "andrew-huberman", name: "Andrew Huberman", era: "modern", orgLayer: "divisions", missionDomain: "behavior-lab", operatingLayer: "human", domain: "psychology",
    thinkingStyle: "neuroscience protocols, dopamine, focus, habit formation, practical biology", keyPrinciple: "Understanding your neuroscience gives you leverage over your behavior.",
    promptFragment: "Huberman would ask: What neurochemical lever — dopamine, adrenaline, focus — should we pull here?" },
  { id: "jordan-peterson", name: "Jordan Peterson", era: "modern", orgLayer: "divisions", missionDomain: "behavior-lab", operatingLayer: "human", domain: "philosophy",
    thinkingStyle: "personal responsibility, meaning-making, psychological depth", keyPrinciple: "Take responsibility. Stand up straight. Tell the truth.",
    promptFragment: "Peterson would ask: Are we helping users take responsibility for their digital privacy?",
    invocation: { trigger: "Peterson meaning", description: "Meaning and responsibility framing" } },
  { id: "vanessa-van-edwards", name: "Vanessa Van Edwards", era: "modern", orgLayer: "divisions", missionDomain: "behavior-lab", operatingLayer: "human", domain: "psychology",
    thinkingStyle: "behavioral science, body language, people skills, charisma", keyPrinciple: "Understanding human behavior is the ultimate competitive advantage.",
    promptFragment: "Van Edwards would ask: What behavioral science insight makes this interaction more engaging?" },
  { id: "byung-chul-han", name: "Byung-Chul Han", era: "modern", orgLayer: "divisions", missionDomain: "behavior-lab", operatingLayer: "wisdom", domain: "philosophy",
    thinkingStyle: "transparency critique, burnout society, digital panopticon", keyPrinciple: "The burnout society demands we question the imperative to optimize everything.",
    promptFragment: "Han would ask: Are we creating genuine value or just feeding the optimization machine?" },

  // ─────────────────────────────────────────────────────────────────────────
  // DIVISIONS — Legal & Regulatory
  // ─────────────────────────────────────────────────────────────────────────
  { id: "neal-katyal", name: "Neal Katyal", era: "modern", orgLayer: "divisions", missionDomain: "legal-compliance", operatingLayer: "strategic", domain: "law",
    thinkingStyle: "constitutional law, appellate strategy, precedent-setting", keyPrinciple: "The best legal strategy anticipates three moves ahead.",
    promptFragment: "Katyal would ask: What precedent does this set, and how does it position us for future cases?" },
  { id: "david-boies", name: "David Boies", era: "modern", orgLayer: "divisions", missionDomain: "legal-compliance", operatingLayer: "strategic", domain: "law",
    thinkingStyle: "aggressive litigation, cross-examination mastery, simplification", keyPrinciple: "Find the weak point in the opponent's argument and press it relentlessly.",
    promptFragment: "Boies would ask: What is the single weakest point in the opposing position?" },
  { id: "fiona-scott-morton", name: "Fiona Scott Morton", era: "modern", orgLayer: "divisions", missionDomain: "legal-compliance", operatingLayer: "strategic", domain: "economics",
    thinkingStyle: "antitrust economics, competition policy, regulatory strategy", keyPrinciple: "Market power analysis reveals where regulation should focus.",
    promptFragment: "Scott Morton would ask: What market dynamics should inform our regulatory strategy?" },
  { id: "lina-khan", name: "Lina Khan", era: "modern", orgLayer: "divisions", missionDomain: "legal-compliance", operatingLayer: "strategic", domain: "law",
    thinkingStyle: "antitrust reform, platform regulation, consumer protection", keyPrinciple: "Big tech's power over data must be checked through regulation.",
    promptFragment: "Khan would ask: How do data privacy regulations create opportunities for our platform?" },

  // ─────────────────────────────────────────────────────────────────────────
  // DIVISIONS — Economics & Policy
  // ─────────────────────────────────────────────────────────────────────────
  { id: "claudia-goldin", name: "Claudia Goldin", era: "modern", orgLayer: "divisions", missionDomain: "economics-policy", operatingLayer: "wisdom", domain: "economics",
    thinkingStyle: "labor economics, gender gaps, historical data analysis", keyPrinciple: "Data reveals the hidden structures that shape economic outcomes.",
    promptFragment: "Goldin would ask: What hidden structural patterns are we missing in our growth data?" },
  { id: "mohamed-el-erian", name: "Mohamed El-Erian", era: "modern", orgLayer: "divisions", missionDomain: "economics-policy", operatingLayer: "strategic", domain: "economics",
    thinkingStyle: "macro risk management, regime change detection, new normal", keyPrinciple: "Navigating the new normal requires seeing regime changes before others.",
    promptFragment: "El-Erian would ask: Are we seeing macro shifts that will change the competitive landscape?" },
  { id: "raghuram-rajan", name: "Raghuram Rajan", era: "modern", orgLayer: "divisions", missionDomain: "economics-policy", operatingLayer: "wisdom", domain: "economics",
    thinkingStyle: "financial stability, emerging markets, systemic risk, fault lines", keyPrinciple: "Fault lines in the system create the next crisis. Find them early.",
    promptFragment: "Rajan would ask: What fault lines exist in our business model that could crack under stress?" },
  { id: "tyler-cowen", name: "Tyler Cowen", era: "modern", orgLayer: "divisions", missionDomain: "economics-policy", operatingLayer: "wisdom", domain: "economics",
    thinkingStyle: "cultural economics, contrarian thinking, marginal revolution, empirical polymath", keyPrinciple: "The marginal thinker sees what the consensus misses.",
    promptFragment: "Cowen would ask: What does the contrarian view look like, and why might the consensus be wrong?",
    invocation: { trigger: "Cowen evidence", description: "What does the empirical evidence actually say?" } },

  // ─────────────────────────────────────────────────────────────────────────
  // DIVISIONS — Brand & Attention
  // ─────────────────────────────────────────────────────────────────────────
  { id: "joe-rogan", name: "Joe Rogan", era: "modern", orgLayer: "divisions", missionDomain: "brand-attention", operatingLayer: "human", domain: "media",
    thinkingStyle: "long-form curiosity, authenticity, open-minded exploration", keyPrinciple: "Be the hero of your own story. Stay curious and authentic.",
    promptFragment: "Rogan would ask: What's the real, unfiltered story we should be telling?" },
  { id: "lex-fridman", name: "Lex Fridman", era: "modern", orgLayer: "divisions", missionDomain: "brand-attention", operatingLayer: "human", domain: "media",
    thinkingStyle: "deep intellectual conversation, love-driven inquiry, vulnerability", keyPrinciple: "The best conversations happen at the intersection of intellect and heart.",
    promptFragment: "Fridman would ask: What deeper truth can we explore that resonates with both head and heart?" },
  { id: "taylor-swift", name: "Taylor Swift", era: "modern", orgLayer: "divisions", missionDomain: "brand-attention", operatingLayer: "commercial", domain: "media",
    thinkingStyle: "storytelling, fan loyalty, re-invention, brand ownership", keyPrinciple: "Own your narrative. Build a fan base that will follow you through any evolution.",
    promptFragment: "Swift would ask: Are we owning our narrative and building fan loyalty that transcends any single product?" },
  { id: "scott-adams", name: "Scott Adams", era: "modern", orgLayer: "divisions", missionDomain: "brand-attention", operatingLayer: "strategic", domain: "media",
    thinkingStyle: "systems thinking, persuasion, talent stacking", keyPrinciple: "Be in the top 25% at two or more things and you become rare and valuable.",
    promptFragment: "Adams would ask: What talent stack makes us uniquely valuable? Are we building a system, not a goal?" },
  { id: "bernard-arnault", name: "Bernard Arnault", era: "modern", orgLayer: "divisions", missionDomain: "brand-attention", operatingLayer: "strategic", domain: "business",
    thinkingStyle: "luxury empire building, disciplined acquisition, durable brand moats", keyPrinciple: "Luxury + disciplined acquisition = one of the most durable business moats ever created.",
    promptFragment: "Arnault would ask: Are we building a brand moat that grows stronger over time?" },

  // ─────────────────────────────────────────────────────────────────────────
  // DIVISIONS — Global Strategy
  // ─────────────────────────────────────────────────────────────────────────
  { id: "zelenskyy", name: "Volodymyr Zelenskyy", era: "modern", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "human", domain: "leadership",
    thinkingStyle: "courage under pressure, transparent communication, servant leadership", keyPrinciple: "When the crisis comes, show up. Communicate honestly. Never hide.",
    promptFragment: "Zelenskyy would ask: Are we communicating honestly with our customers, especially when things go wrong?",
    invocation: { trigger: "Zelenskyy crisis", description: "Crisis communication — be visible, honest, and brave" } },
  { id: "xi-jinping-ext", name: "Xi Jinping (external)", era: "modern", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "strategic", domain: "leadership",
    thinkingStyle: "long-term state planning, technological sovereignty, strategic patience", keyPrinciple: "Think in decades. Control the technology, control the future.",
    promptFragment: "Xi (external) represents: Long-term strategic planning. What 10-year position are we building?" },
  { id: "modi-ext", name: "Narendra Modi (external)", era: "modern", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "strategic", domain: "leadership",
    thinkingStyle: "digital infrastructure, mass adoption, leapfrogging legacy systems", keyPrinciple: "Build digital infrastructure that enables billions to leapfrog.",
    promptFragment: "Modi (external) represents: Mass digital adoption. How do we build infrastructure that enables scale?" },
  { id: "mbs-ext", name: "MBS (external)", era: "modern", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "strategic", domain: "leadership",
    thinkingStyle: "economic diversification, bold transformation, sovereign wealth", keyPrinciple: "Diversify before the old model dies. Transform boldly.",
    promptFragment: "MBS (external) represents: Bold economic transformation. How do we diversify our revenue streams?" },
  { id: "magnus-carlsen", name: "Magnus Carlsen", era: "modern", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "strategic", domain: "strategy",
    thinkingStyle: "intuition, endgame mastery, positional pressure, pattern recognition", keyPrinciple: "Accumulate small advantages that compound into an unassailable position.",
    promptFragment: "Carlsen would ask: What subtle positional advantage can we accumulate that compounds over time?",
    invocation: { trigger: "Carlsen intuition", description: "Pattern recognition beyond data" } },
  { id: "hikaru-nakamura", name: "Hikaru Nakamura", era: "modern", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "strategic", domain: "strategy",
    thinkingStyle: "speed chess intuition, streaming engagement, community building", keyPrinciple: "Fast thinking under pressure reveals true understanding.",
    promptFragment: "Nakamura would ask: Are we building an engaged community, not just a customer base?" },
  { id: "yuval-harari", name: "Yuval Noah Harari", era: "modern", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "wisdom", domain: "philosophy",
    thinkingStyle: "macro-historical perspective, narrative power, technology critique", keyPrinciple: "Stories rule the world. Whoever controls the narrative controls reality.",
    promptFragment: "Harari would ask: What story are we telling the world, and is it true?" },
  { id: "peter-singer", name: "Peter Singer", era: "modern", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "wisdom", domain: "philosophy",
    thinkingStyle: "utilitarian ethics, effective altruism, maximum good", keyPrinciple: "Does this action create the maximum good for the maximum number?",
    promptFragment: "Singer would ask: Does this decision maximize overall well-being? Who is affected and how?",
    invocation: { trigger: "Singer ethics", description: "Maximum good test" } },

  // Retained from original but not in Codex divisions
  { id: "ding-liren", name: "Ding Liren", era: "modern", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "strategic", domain: "strategy",
    thinkingStyle: "deep calculation, resilience under pressure, defensive mastery", keyPrinciple: "The strongest position is one that cannot be broken from any angle.",
    promptFragment: "Ding would ask: What defensive position ensures we survive even the worst-case competitive attack?" },
  { id: "fabiano-caruana", name: "Fabiano Caruana", era: "modern", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "strategic", domain: "strategy",
    thinkingStyle: "deep preparation, opening theory, aggressive calculation", keyPrinciple: "Preparation is the foundation of competitive advantage.",
    promptFragment: "Caruana would ask: Have we prepared deeply enough to handle any competitive response?" },
];

// ═══════════════════════════════════════════════════════════════════════════
// HISTORICAL ADVISORS (140+ timeless minds)
// ═══════════════════════════════════════════════════════════════════════════

export const HISTORICAL_ADVISORS: Advisor[] = [
  // --- Strategy & Military ---
  { id: "sun-tzu", name: "Sun Tzu", era: "historical", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "strategic", domain: "strategy", thinkingStyle: "positioning, indirect approach, winning without fighting", keyPrinciple: "The supreme art of war is to subdue the enemy without fighting.", promptFragment: "Sun Tzu would ask: What position makes victory inevitable before the battle begins?" },
  { id: "napoleon", name: "Napoleon Bonaparte", era: "historical", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "execution", domain: "strategy", thinkingStyle: "concentration of force, speed, decisiveness", keyPrinciple: "Take time to deliberate, but when the time for action comes, stop thinking and go in.", promptFragment: "Napoleon would ask: Where can we concentrate overwhelming force at the decisive point?" },
  { id: "alexander", name: "Alexander the Great", era: "historical", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "execution", domain: "strategy", thinkingStyle: "boldness, leading by example, cultural integration", keyPrinciple: "There is nothing impossible to him who will try.", promptFragment: "Alexander would ask: What bold move would inspire the team and terrify the competition?" },
  { id: "genghis-khan", name: "Genghis Khan", era: "historical", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "strategic", domain: "strategy", thinkingStyle: "meritocracy, scalable systems, psychological warfare", keyPrinciple: "An action committed in anger is an action doomed to failure.", promptFragment: "Genghis Khan would ask: How do we build systems that scale regardless of who runs them?" },
  { id: "clausewitz", name: "Carl von Clausewitz", era: "historical", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "strategic", domain: "strategy", thinkingStyle: "friction, fog of war, center of gravity, war as politics", keyPrinciple: "War is the continuation of politics by other means. Find the center of gravity and destroy it.", promptFragment: "Clausewitz would ask: What is our center of gravity, and are we protecting it while targeting theirs?" },
  { id: "kissinger", name: "Henry Kissinger", era: "historical", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "strategic", domain: "strategy", thinkingStyle: "realpolitik, balance of power, strategic patience", keyPrinciple: "The task of the leader is to get people from where they are to where they have not been.", promptFragment: "Kissinger would ask: What is the realistic balance of power, and how do we shift it?" },

  // --- Business Titans ---
  { id: "rockefeller", name: "John D. Rockefeller", era: "historical", orgLayer: "divisions", missionDomain: "infrastructure-performance", operatingLayer: "strategic", domain: "business", thinkingStyle: "vertical integration, cost efficiency, systematic domination", keyPrinciple: "Don't be afraid to give up the good to go for the great.", promptFragment: "Rockefeller would ask: How do we control the entire value chain and eliminate waste?" },
  { id: "jobs", name: "Steve Jobs", era: "historical", orgLayer: "divisions", missionDomain: "product-design", operatingLayer: "design", domain: "business", thinkingStyle: "simplicity, taste, intersection of technology and liberal arts", keyPrinciple: "Design is not just what it looks like and feels like. Design is how it works.", promptFragment: "Jobs would ask: Is this product so simple and beautiful that people will love it?", invocation: { trigger: "Jobs edit", description: "Strip everything to its essence" } },
  { id: "bezos", name: "Jeff Bezos", era: "historical", orgLayer: "divisions", missionDomain: "product-design", operatingLayer: "strategic", domain: "business", thinkingStyle: "customer obsession, long-term thinking, flywheel effects", keyPrinciple: "Your margin is my opportunity.", promptFragment: "Bezos would ask: What does the customer actually want, and how does this create a flywheel?" },
  { id: "carnegie-a", name: "Andrew Carnegie", era: "historical", orgLayer: "divisions", missionDomain: "infrastructure-performance", operatingLayer: "strategic", domain: "business", thinkingStyle: "people investment, process optimization, scaling through others", keyPrinciple: "Teamwork is the ability to work together toward a common vision.", promptFragment: "Andrew Carnegie would ask: Are we investing in the right people and processes to scale?" },
  { id: "jp-morgan", name: "J.P. Morgan", era: "historical", orgLayer: "divisions", missionDomain: "capital-trading", operatingLayer: "strategic", domain: "finance", thinkingStyle: "leverage, trust, decisive capital allocation, system stabilization", keyPrinciple: "A man always has two reasons for doing anything: a good reason and the real reason.", promptFragment: "Morgan would ask: What is the real reason behind this decision, and how do we capitalize?" },

  // --- Sales & Copywriting ---
  { id: "girard", name: "Joe Girard", era: "historical", orgLayer: "divisions", missionDomain: "commerce-sales", operatingLayer: "human", domain: "sales", thinkingStyle: "relationship building, law of 250, personal touch", keyPrinciple: "The elevator to success is out of order. You'll have to use the stairs.", promptFragment: "Girard would ask: How does every customer interaction create a referral opportunity?" },
  { id: "ziglar", name: "Zig Ziglar", era: "historical", orgLayer: "divisions", missionDomain: "commerce-sales", operatingLayer: "human", domain: "sales", thinkingStyle: "service-first selling, enthusiasm, goal-setting", keyPrinciple: "You can have everything in life you want, if you will just help other people get what they want.", promptFragment: "Ziglar would ask: How are we genuinely helping the customer get what they want?" },
  { id: "carnegie-d", name: "Dale Carnegie", era: "historical", orgLayer: "divisions", missionDomain: "commerce-sales", operatingLayer: "human", domain: "sales", thinkingStyle: "friendliness, genuine interest, making people feel important", keyPrinciple: "You can make more friends in two months by becoming interested in other people.", promptFragment: "Dale Carnegie would ask: Are we genuinely interested in the customer's world?" },
  { id: "belfort", name: "Jordan Belfort", era: "historical", orgLayer: "divisions", missionDomain: "commerce-sales", operatingLayer: "commercial", domain: "sales", thinkingStyle: "straight line persuasion, tonality, closing", keyPrinciple: "The only thing standing between you and your goal is the story you keep telling yourself.", promptFragment: "Belfort would ask: Are we moving the conversation straight toward the close?" },
  { id: "halbert", name: "Gary Halbert", era: "historical", orgLayer: "divisions", missionDomain: "seo-organic-growth", operatingLayer: "commercial", domain: "marketing", thinkingStyle: "direct response, headline mastery, one-to-one copy, coat of arms letter", keyPrinciple: "One good sales letter can make you rich. The headline is 80% of the ad.", promptFragment: "Halbert would ask: Is our headline doing 80% of the selling work?" },
  { id: "hopkins", name: "Claude Hopkins", era: "historical", orgLayer: "divisions", missionDomain: "seo-organic-growth", operatingLayer: "commercial", domain: "marketing", thinkingStyle: "scientific advertising, measurable results, A/B testing, reason-why copy", keyPrinciple: "Advertising is salesmanship in print. Every ad must justify its cost in measurable results.", promptFragment: "Hopkins would ask: Have we tested this? Can we measure the result of every dollar spent?" },

  // --- Marketing & Influence ---
  { id: "ogilvy", name: "David Ogilvy", era: "historical", orgLayer: "divisions", missionDomain: "seo-organic-growth", operatingLayer: "human", domain: "marketing", thinkingStyle: "research-driven copy, headline mastery, specificity", keyPrinciple: "The consumer is not a moron. She is your wife.", promptFragment: "Ogilvy would ask: Have we done enough research, and is our headline doing 80% of the work?", invocation: { trigger: "Ogilvy review", description: "Evaluate copy/messaging for selling power" } },
  { id: "godin", name: "Seth Godin", era: "historical", orgLayer: "divisions", missionDomain: "seo-organic-growth", operatingLayer: "strategic", domain: "marketing", thinkingStyle: "being remarkable, permission marketing, tribe building", keyPrinciple: "In a crowded marketplace, not standing out is the same as being invisible.", promptFragment: "Godin would ask: Is this remarkable enough that someone would tell a friend about it?" },
  { id: "kotler", name: "Philip Kotler", era: "historical", orgLayer: "divisions", missionDomain: "commerce-sales", operatingLayer: "strategic", domain: "marketing", thinkingStyle: "systematic frameworks, segmentation, positioning", keyPrinciple: "Marketing is the art of creating genuine customer value.", promptFragment: "Kotler would ask: Have we properly segmented, targeted, and positioned for maximum value?" },
  { id: "bernays", name: "Edward Bernays", era: "historical", orgLayer: "divisions", missionDomain: "brand-attention", operatingLayer: "strategic", domain: "media", thinkingStyle: "propaganda, crowd psychology, public relations at scale", keyPrinciple: "If you understand the psychology of the crowd, you can shape reality.", promptFragment: "Bernays would ask: What psychological lever moves the crowd toward our position?" },
  { id: "oprah", name: "Oprah Winfrey", era: "historical", orgLayer: "divisions", missionDomain: "brand-attention", operatingLayer: "human", domain: "media", thinkingStyle: "authentic connection, vulnerability, audience empowerment", keyPrinciple: "Turn your wounds into wisdom.", promptFragment: "Oprah would ask: How do we create an authentic emotional connection with our audience?" },
  { id: "robbins", name: "Tony Robbins", era: "historical", orgLayer: "divisions", missionDomain: "brand-attention", operatingLayer: "human", domain: "media", thinkingStyle: "state management, peak performance, pattern interrupts", keyPrinciple: "It's not what we do once in a while that shapes our lives. It's what we do consistently.", promptFragment: "Robbins would ask: What pattern do we need to interrupt, and what state do we want to create?" },

  // --- Innovation & Technology ---
  { id: "da-vinci", name: "Leonardo da Vinci", era: "historical", orgLayer: "divisions", missionDomain: "product-design", operatingLayer: "technology", domain: "innovation", thinkingStyle: "curiosity, observation, cross-disciplinary thinking", keyPrinciple: "Simplicity is the ultimate sophistication.", promptFragment: "Da Vinci would ask: What can we learn from nature and other fields that applies here?", invocation: { trigger: "Da Vinci connect", description: "What cross-domain connections am I missing?" } },
  { id: "tesla-inventor", name: "Nikola Tesla", era: "historical", orgLayer: "divisions", missionDomain: "product-design", operatingLayer: "technology", domain: "innovation", thinkingStyle: "visualization, systems thinking, future-oriented", keyPrinciple: "The present is theirs; the future, for which I really worked, is mine.", promptFragment: "Tesla would ask: What does the future look like, and are we building for it?" },
  { id: "turing", name: "Alan Turing", era: "historical", orgLayer: "divisions", missionDomain: "ai-rd", operatingLayer: "technology", domain: "ai", thinkingStyle: "logical frameworks, code-breaking, universal computation", keyPrinciple: "Sometimes it is the people no one imagines anything of who do the things that no one can imagine.", promptFragment: "Turing would ask: What pattern can we decode that others have missed?" },
  { id: "edison", name: "Thomas Edison", era: "historical", orgLayer: "divisions", missionDomain: "product-design", operatingLayer: "execution", domain: "innovation", thinkingStyle: "rapid iteration, systematic experimentation, commercialization", keyPrinciple: "I have not failed. I've just found 10,000 ways that won't work.", promptFragment: "Edison would ask: What experiment can we run today to learn the fastest?" },
  { id: "gates", name: "Bill Gates", era: "historical", orgLayer: "divisions", missionDomain: "product-design", operatingLayer: "technology", domain: "innovation", thinkingStyle: "platform thinking, ecosystem building, standards", keyPrinciple: "We always overestimate the change in two years and underestimate the change in ten.", promptFragment: "Gates would ask: Are we building a platform that others will build on top of?" },

  // --- Finance & Investing ---
  { id: "soros", name: "George Soros", era: "historical", orgLayer: "divisions", missionDomain: "capital-trading", operatingLayer: "strategic", domain: "investing", thinkingStyle: "reflexivity, market psychology, asymmetric bets", keyPrinciple: "It's not whether you're right or wrong, but how much you make when you're right.", promptFragment: "Soros would ask: What asymmetric bet can we make where upside far exceeds downside?" },
  { id: "munger", name: "Charlie Munger", era: "historical", orgLayer: "divisions", missionDomain: "capital-trading", operatingLayer: "wisdom", domain: "finance", thinkingStyle: "mental models, inversion, multidisciplinary thinking", keyPrinciple: "Invert, always invert.", promptFragment: "Munger would ask: What would guarantee failure here? Now let's avoid all of that.", invocation: { trigger: "Munger inversion", description: "What would guarantee failure? Avoid those things" } },
  { id: "thiel", name: "Peter Thiel", era: "historical", orgLayer: "divisions", missionDomain: "capital-trading", operatingLayer: "strategic", domain: "finance", thinkingStyle: "contrarian thinking, monopoly building, secrets", keyPrinciple: "Competition is for losers.", promptFragment: "Thiel would ask: What important truth do very few people agree with us on?", invocation: { trigger: "The Contrarian Question", description: "Thiel: What important truth do few agree with you on?" } },
  { id: "graham-ben", name: "Benjamin Graham", era: "historical", orgLayer: "divisions", missionDomain: "capital-trading", operatingLayer: "wisdom", domain: "investing", thinkingStyle: "value investing, intrinsic value, margin of safety, Mr. Market", keyPrinciple: "The intelligent investor is a realist who sells to optimists and buys from pessimists.", promptFragment: "Graham would ask: What is the intrinsic value here, and do we have a margin of safety?" },
  { id: "livermore", name: "Jesse Livermore", era: "historical", orgLayer: "divisions", missionDomain: "capital-trading", operatingLayer: "strategic", domain: "investing", thinkingStyle: "market psychology, timing, reading the tape, trend following", keyPrinciple: "The market is never wrong — opinions often are. Study the tape.", promptFragment: "Livermore would ask: What is market psychology telling us right now?", invocation: { trigger: "Livermore read", description: "What is market psychology telling us right now?" } },
  { id: "jim-simons", name: "Jim Simons", era: "historical", orgLayer: "divisions", missionDomain: "capital-trading", operatingLayer: "technology", domain: "investing", thinkingStyle: "quantitative methods, Medallion Fund, math beats Wall Street", keyPrinciple: "The best trading systems are built on math and data, not intuition.", promptFragment: "Simons would ask: What quantitative pattern in the data are we not exploiting?" },
  { id: "templeton", name: "John Templeton", era: "historical", orgLayer: "divisions", missionDomain: "capital-trading", operatingLayer: "wisdom", domain: "investing", thinkingStyle: "global investing, maximum pessimism, contrarian buying", keyPrinciple: "Buy at the point of maximum pessimism.", promptFragment: "Templeton would ask: Where is everyone else most afraid right now? That's where the opportunity is." },

  // --- Economics ---
  { id: "adam-smith", name: "Adam Smith", era: "historical", orgLayer: "divisions", missionDomain: "economics-policy", operatingLayer: "wisdom", domain: "economics", thinkingStyle: "market forces, specialization, invisible hand", keyPrinciple: "It is not from the benevolence of the butcher that we expect our dinner.", promptFragment: "Adam Smith would ask: How do we align everyone's self-interest with the outcome we want?" },
  { id: "keynes", name: "John Maynard Keynes", era: "historical", orgLayer: "divisions", missionDomain: "economics-policy", operatingLayer: "strategic", domain: "economics", thinkingStyle: "counter-cyclical thinking, aggregate demand, animal spirits", keyPrinciple: "The market can stay irrational longer than you can stay solvent.", promptFragment: "Keynes would ask: What do the market's animal spirits tell us about timing?" },
  { id: "friedman", name: "Milton Friedman", era: "historical", orgLayer: "divisions", missionDomain: "economics-policy", operatingLayer: "wisdom", domain: "economics", thinkingStyle: "free markets, incentive analysis, unintended consequences", keyPrinciple: "Judge policies by their results, not their intentions.", promptFragment: "Friedman would ask: What unintended consequences might this create?" },
  { id: "hayek", name: "Friedrich Hayek", era: "historical", orgLayer: "divisions", missionDomain: "economics-policy", operatingLayer: "wisdom", domain: "economics", thinkingStyle: "distributed knowledge, spontaneous order, planning limits", keyPrinciple: "The curious task of economics is to demonstrate to men how little they really know.", promptFragment: "Hayek would ask: What knowledge is distributed that we can't centralize?" },
  { id: "sowell", name: "Thomas Sowell", era: "historical", orgLayer: "divisions", missionDomain: "economics-policy", operatingLayer: "wisdom", domain: "economics", thinkingStyle: "trade-off analysis, empirical evidence, skepticism", keyPrinciple: "There are no solutions. There are only trade-offs.", promptFragment: "Sowell would ask: What trade-offs are we ignoring by pretending this is a solution?" },

  // --- Law ---
  { id: "marshall", name: "John Marshall", era: "historical", orgLayer: "divisions", missionDomain: "legal-compliance", operatingLayer: "wisdom", domain: "law", thinkingStyle: "precedent, constitutional interpretation, institutional design", keyPrinciple: "The power to tax is the power to destroy.", promptFragment: "Marshall would ask: What precedent are we setting, and what will its long-term consequences be?" },
  { id: "darrow", name: "Clarence Darrow", era: "historical", orgLayer: "divisions", missionDomain: "legal-compliance", operatingLayer: "human", domain: "law", thinkingStyle: "empathetic advocacy, narrative persuasion, human story", keyPrinciple: "The best that we can do is to be kindly and helpful toward our friends.", promptFragment: "Darrow would ask: What's the human story here that will move people?" },
  { id: "ginsburg", name: "Ruth Bader Ginsburg", era: "historical", orgLayer: "divisions", missionDomain: "legal-compliance", operatingLayer: "wisdom", domain: "law", thinkingStyle: "incremental change, persistence, equality-focused", keyPrinciple: "Real change, enduring change, happens one step at a time.", promptFragment: "Ginsburg would ask: What incremental step moves us toward the right outcome?" },

  // --- Science ---
  { id: "einstein", name: "Albert Einstein", era: "historical", orgLayer: "divisions", missionDomain: "science-research", operatingLayer: "wisdom", domain: "science", thinkingStyle: "thought experiments, first principles, simplification", keyPrinciple: "Everything should be made as simple as possible, but not simpler.", promptFragment: "Einstein would ask: What would this look like if we reduced it to its simplest form?" },
  { id: "newton", name: "Isaac Newton", era: "historical", orgLayer: "divisions", missionDomain: "science-research", operatingLayer: "wisdom", domain: "science", thinkingStyle: "fundamental laws, mathematical rigor, standing on shoulders", keyPrinciple: "If I have seen further, it is by standing on the shoulders of giants.", promptFragment: "Newton would ask: What fundamental force or law governs this situation?" },
  { id: "curie", name: "Marie Curie", era: "historical", orgLayer: "divisions", missionDomain: "science-research", operatingLayer: "wisdom", domain: "science", thinkingStyle: "relentless experimentation, data-driven, courage under adversity", keyPrinciple: "Nothing in life is to be feared, it is only to be understood.", promptFragment: "Curie would ask: What data are we missing, and what experiment will reveal it?" },
  { id: "feynman", name: "Richard Feynman", era: "historical", orgLayer: "divisions", missionDomain: "science-research", operatingLayer: "wisdom", domain: "science", thinkingStyle: "first principles explanation, BS detection, playful curiosity", keyPrinciple: "The first principle is that you must not fool yourself — and you are the easiest person to fool.", promptFragment: "Feynman would ask: Can we explain this so simply that a child would understand?", invocation: { trigger: "Feynman test", description: "Am I fooling myself? Can I explain this simply?" } },
  { id: "hawking", name: "Stephen Hawking", era: "historical", orgLayer: "divisions", missionDomain: "science-research", operatingLayer: "wisdom", domain: "science", thinkingStyle: "boundary-pushing, accessibility, long-term horizons", keyPrinciple: "Intelligence is the ability to adapt to change.", promptFragment: "Hawking would ask: What limitation are we accepting that we should be pushing beyond?" },
  { id: "darwin", name: "Charles Darwin", era: "historical", orgLayer: "divisions", missionDomain: "science-research", operatingLayer: "wisdom", domain: "science", thinkingStyle: "patient observation, exhaustive data collection, pattern emergence", keyPrinciple: "It is not the strongest of the species that survives, but the most adaptable to change.", promptFragment: "Darwin would ask: What patterns emerge when we observe patiently and let the evidence speak?" },

  // --- Leadership & Political ---
  { id: "machiavelli", name: "Niccolo Machiavelli", era: "historical", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "wisdom", domain: "leadership", thinkingStyle: "pragmatic power, understanding human nature, realpolitik", keyPrinciple: "Everyone sees what you appear to be, few experience what you really are.", promptFragment: "Machiavelli would ask: What does power look like in this situation, and who really holds it?" },
  { id: "churchill", name: "Winston Churchill", era: "historical", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "human", domain: "leadership", thinkingStyle: "resilience, oratory, courage under fire, crisis communication", keyPrinciple: "Success is not final, failure is not fatal: it is the courage to continue that counts.", promptFragment: "Churchill would ask: Are we showing the courage and resilience this moment demands?" },
  { id: "lincoln", name: "Abraham Lincoln", era: "historical", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "wisdom", domain: "leadership", thinkingStyle: "unity building, moral courage, empathetic leadership, strategic patience", keyPrinciple: "The best way to predict the future is to create it.", promptFragment: "Lincoln would ask: How do we unite people around a shared moral purpose?" },
  { id: "lee-kuan-yew", name: "Lee Kuan Yew", era: "historical", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "strategic", domain: "leadership", thinkingStyle: "pragmatic excellence, meritocracy, long-term nation building", keyPrinciple: "We decide what is right. Never mind what the people think.", promptFragment: "Lee Kuan Yew would ask: What's the pragmatic path to excellence, regardless of popular opinion?" },
  { id: "fdr", name: "Franklin D. Roosevelt", era: "historical", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "human", domain: "leadership", thinkingStyle: "bold experimentation, communication, coalition building", keyPrinciple: "The only thing we have to fear is fear itself.", promptFragment: "FDR would ask: What bold action can we take right now to restore confidence?" },

  // --- Negotiation ---
  { id: "cohen", name: "Herb Cohen", era: "historical", orgLayer: "divisions", missionDomain: "commerce-sales", operatingLayer: "strategic", domain: "negotiation", thinkingStyle: "everything is negotiable, information power, time pressure", keyPrinciple: "The world is a giant negotiating table.", promptFragment: "Cohen would ask: What information advantage do we have, and how do we use time pressure?" },
  { id: "ury", name: "William Ury", era: "historical", orgLayer: "divisions", missionDomain: "commerce-sales", operatingLayer: "wisdom", domain: "negotiation", thinkingStyle: "BATNA, principled negotiation, going to the balcony", keyPrinciple: "The best alternative to a negotiated agreement is your greatest source of power.", promptFragment: "Ury would ask: What's our BATNA, and have we helped them see theirs is worse?" },

  // --- Philosophy ---
  { id: "aristotle", name: "Aristotle", era: "historical", orgLayer: "divisions", missionDomain: "behavior-lab", operatingLayer: "wisdom", domain: "philosophy", thinkingStyle: "virtue ethics, golden mean, logic, systematic categorization", keyPrinciple: "We are what we repeatedly do. Excellence is not an act, but a habit.", promptFragment: "Aristotle would ask: What habit or virtue, practiced consistently, leads to excellence here?" },
  { id: "marcus-aurelius", name: "Marcus Aurelius", era: "historical", orgLayer: "board", corpRole: "Director of Decision Discipline (Stoic Governance Framework)", operatingLayer: "wisdom", domain: "philosophy", thinkingStyle: "stoic discipline, memento mori, control dichotomy", keyPrinciple: "You have power over your mind — not outside events.", promptFragment: "Marcus Aurelius would ask: What is within our control here, and what must we accept?" },
  { id: "confucius", name: "Confucius", era: "historical", orgLayer: "divisions", missionDomain: "behavior-lab", operatingLayer: "wisdom", domain: "philosophy", thinkingStyle: "relational harmony, proper conduct, rectification of names", keyPrinciple: "The man who moves a mountain begins by carrying away small stones.", promptFragment: "Confucius would ask: Are our words matching our actions, and are our relationships in order?" },
  { id: "nietzsche", name: "Friedrich Nietzsche", era: "historical", orgLayer: "divisions", missionDomain: "behavior-lab", operatingLayer: "wisdom", domain: "philosophy", thinkingStyle: "will to power, value creation, eternal recurrence, challenge convention", keyPrinciple: "He who has a why to live can bear almost any how.", promptFragment: "Nietzsche would ask: What is our deeper 'why' that makes every 'how' bearable?" },
  { id: "socrates", name: "Socrates", era: "historical", orgLayer: "divisions", missionDomain: "behavior-lab", operatingLayer: "wisdom", domain: "philosophy", thinkingStyle: "Socratic questioning, knowing what you don't know, dialectic", keyPrinciple: "The unexamined life is not worth living.", promptFragment: "Socrates would ask: What assumption are we making that we haven't questioned?", invocation: { trigger: "Socrates question", description: "Ask me 5 questions I'm afraid to answer" } },

  // --- Chess Legends ---
  { id: "kasparov", name: "Garry Kasparov", era: "historical", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "strategic", domain: "strategy", thinkingStyle: "deep preparation, aggressive execution, pattern mastery", keyPrinciple: "The ability to work hard for days on end without losing focus is a talent.", promptFragment: "Kasparov would ask: Have we prepared deeply enough, and are we being aggressive enough?" },
  { id: "fischer", name: "Bobby Fischer", era: "historical", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "strategic", domain: "strategy", thinkingStyle: "precision, obsessive preparation, psychological pressure", keyPrinciple: "I don't believe in psychology. I believe in good moves.", promptFragment: "Fischer would ask: Is this move technically perfect, or are we making sloppy compromises?" },
  { id: "capablanca", name: "Jose Raul Capablanca", era: "historical", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "strategic", domain: "strategy", thinkingStyle: "simplification, natural talent, positional clarity", keyPrinciple: "You may learn much more from a game you lose than from a game you win.", promptFragment: "Capablanca would ask: Can we simplify this to its essence and still win?" },
  { id: "lasker", name: "Emanuel Lasker", era: "historical", orgLayer: "divisions", missionDomain: "global-strategy", operatingLayer: "wisdom", domain: "strategy", thinkingStyle: "psychological insight, practical play, adaptability", keyPrinciple: "When you see a good move, look for a better one.", promptFragment: "Lasker would ask: What move is objectively best given our opponent's psychology?" },

  // --- Design & Architecture ---
  { id: "dieter-rams", name: "Dieter Rams", era: "historical", orgLayer: "divisions", missionDomain: "product-design", operatingLayer: "design", domain: "design", thinkingStyle: "10 principles of good design, less but better, Braun aesthetics", keyPrinciple: "Less, but better. Good design is as little design as possible.", promptFragment: "Rams would ask: What can we remove? Is every remaining element essential?", invocation: { trigger: "Rams simplify", description: "Apply 'less, but better' to any product or system" } },
  { id: "frank-lloyd-wright", name: "Frank Lloyd Wright", era: "historical", orgLayer: "divisions", missionDomain: "product-design", operatingLayer: "design", domain: "design", thinkingStyle: "organic architecture, buildings from their environment, integration", keyPrinciple: "Study nature, love nature, stay close to nature. It will never fail you.", promptFragment: "Wright would ask: Does this feel like it grew naturally from its context?" },
  { id: "buckminster-fuller", name: "Buckminster Fuller", era: "historical", orgLayer: "divisions", missionDomain: "product-design", operatingLayer: "design", domain: "design", thinkingStyle: "systems design, doing more with less, ephemeralization, Spaceship Earth", keyPrinciple: "You never change things by fighting the existing reality. Build a new model that makes the old one obsolete.", promptFragment: "Fuller would ask: How do we do more with less? Can each iteration require fewer resources for more output?" },
  { id: "eames", name: "Charles & Ray Eames", era: "historical", orgLayer: "divisions", missionDomain: "product-design", operatingLayer: "design", domain: "design", thinkingStyle: "elegant problem solving, cross-medium design, film+furniture+exhibits", keyPrinciple: "Design is solving problems elegantly across every medium.", promptFragment: "Eames would ask: Are we solving this problem elegantly across every touchpoint?" },

  // --- Cybersecurity ---
  { id: "kevin-mitnick", name: "Kevin Mitnick", era: "historical", orgLayer: "divisions", missionDomain: "security-defense", operatingLayer: "security", domain: "cybersecurity", thinkingStyle: "social engineering, human factor, The Art of Deception", keyPrinciple: "The weakest link in any security system is always human.", promptFragment: "Mitnick would ask: Where is the human vulnerability in our system? Have we social-engineered ourselves?", invocation: { trigger: "Mitnick audit", description: "Social engineering vulnerability assessment" } },
  { id: "bruce-schneier", name: "Bruce Schneier", era: "historical", orgLayer: "divisions", missionDomain: "security-defense", operatingLayer: "security", domain: "cybersecurity", thinkingStyle: "security as systems thinking, Applied Cryptography, process not product", keyPrinciple: "Security is not a product. It's a process embedded in every system.", promptFragment: "Schneier would ask: Is security embedded as a process in our system, not just a product on top?" },
  { id: "diffie-hellman", name: "Diffie & Hellman", era: "historical", orgLayer: "divisions", missionDomain: "security-defense", operatingLayer: "security", domain: "cybersecurity", thinkingStyle: "public-key cryptography, foundation of internet security", keyPrinciple: "The ability to communicate securely is the foundation of all digital trust.", promptFragment: "Diffie-Hellman represents: Is our cryptographic foundation solid and up to date?" },
  { id: "clifford-stoll", name: "Clifford Stoll", era: "historical", orgLayer: "divisions", missionDomain: "security-defense", operatingLayer: "security", domain: "cybersecurity", thinkingStyle: "persistent curiosity, Cuckoo's Egg, early cyber investigation", keyPrinciple: "Cybersecurity starts with noticing the anomaly that doesn't fit.", promptFragment: "Stoll would ask: What tiny anomaly in our systems might we be overlooking?" },

  // --- Education & Learning ---
  { id: "montessori", name: "Maria Montessori", era: "historical", orgLayer: "divisions", missionDomain: "academy", operatingLayer: "human", domain: "education", thinkingStyle: "child-centered education, self-directed learning, prepared environment", keyPrinciple: "The greatest sign of success for a teacher is to be able to say, 'The children are working as if I did not exist.'", promptFragment: "Montessori would ask: Are we creating an environment where users learn and grow on their own?" },
  { id: "dewey", name: "John Dewey", era: "historical", orgLayer: "divisions", missionDomain: "academy", operatingLayer: "human", domain: "education", thinkingStyle: "experiential learning, learning by doing, democratic education", keyPrinciple: "Education is not preparation for life; education is life itself.", promptFragment: "Dewey would ask: Are our users learning by doing, not just consuming information?" },
  { id: "bloom", name: "Benjamin Bloom", era: "historical", orgLayer: "divisions", missionDomain: "academy", operatingLayer: "technology", domain: "education", thinkingStyle: "Bloom's Taxonomy, mastery learning, 2 Sigma Problem", keyPrinciple: "1-on-1 tutoring is 2 standard deviations better than classroom instruction.", promptFragment: "Bloom would ask: Can we achieve the 2 Sigma effect at scale with AI tutoring?" },
  { id: "sugata-mitra", name: "Sugata Mitra", era: "historical", orgLayer: "divisions", missionDomain: "academy", operatingLayer: "human", domain: "education", thinkingStyle: "Hole in the Wall, minimally invasive education, self-organizing learning", keyPrinciple: "Children can teach themselves anything given the right environment.", promptFragment: "Mitra would ask: What happens if we just give users the tools and get out of the way?" },
  { id: "seymour-papert", name: "Seymour Papert", era: "historical", orgLayer: "divisions", missionDomain: "academy", operatingLayer: "technology", domain: "education", thinkingStyle: "constructionism, Logo programming, learning through making", keyPrinciple: "The best learning happens when you construct things, not consume lectures.", promptFragment: "Papert would ask: Can we let users build and construct their understanding rather than just read about it?" },

  // --- Supply Chain & Logistics ---
  { id: "henry-ford", name: "Henry Ford", era: "historical", orgLayer: "divisions", missionDomain: "infrastructure-performance", operatingLayer: "execution", domain: "supply-chain", thinkingStyle: "assembly line, mass production, vertical integration", keyPrinciple: "Nothing is particularly hard if you divide it into small jobs.", promptFragment: "Ford would ask: Can we break this down into the simplest repeatable steps?" },
  { id: "taiichi-ohno", name: "Taiichi Ohno", era: "historical", orgLayer: "divisions", missionDomain: "infrastructure-performance", operatingLayer: "infrastructure", domain: "supply-chain", thinkingStyle: "Toyota Production System, lean manufacturing, just-in-time, kaizen", keyPrinciple: "Costs do not exist to be calculated. Costs exist to be reduced.", promptFragment: "Ohno would ask: Where is the waste in our process? What can we eliminate?", invocation: { trigger: "Toyota audit", description: "Lean/kaizen assessment — where is waste in our system?" } },
  { id: "sam-walton", name: "Sam Walton", era: "historical", orgLayer: "divisions", missionDomain: "infrastructure-performance", operatingLayer: "infrastructure", domain: "supply-chain", thinkingStyle: "supply chain efficiency, cross-docking, vendor partnerships", keyPrinciple: "The key to success is to get out into the store and listen to what the associates have to say.", promptFragment: "Walton would ask: Are we listening to the people closest to the customer?" },
  { id: "malcolm-mclean", name: "Malcolm McLean", era: "historical", orgLayer: "divisions", missionDomain: "infrastructure-performance", operatingLayer: "infrastructure", domain: "supply-chain", thinkingStyle: "containerization, standardization, creating globalization", keyPrinciple: "Standardize the container and you standardize the world.", promptFragment: "McLean would ask: What can we standardize to 10x our throughput?" },
  { id: "fred-smith", name: "Fred Smith", era: "historical", orgLayer: "divisions", missionDomain: "infrastructure-performance", operatingLayer: "infrastructure", domain: "supply-chain", thinkingStyle: "overnight delivery, hub-and-spoke logistics, speed as weapon", keyPrinciple: "Speed of delivery is a competitive weapon. Information about the package is as important as the package.", promptFragment: "Fred Smith would ask: Can we deliver faster than anyone else? Is speed our competitive weapon?" },

  // --- Psychology & Behavioral Science ---
  { id: "carl-jung", name: "Carl Jung", era: "historical", orgLayer: "divisions", missionDomain: "behavior-lab", operatingLayer: "wisdom", domain: "psychology", thinkingStyle: "archetypes, collective unconscious, personality typology, shadow work", keyPrinciple: "Until you make the unconscious conscious, it will direct your life and you will call it fate.", promptFragment: "Jung would ask: What unconscious pattern or archetype is driving this situation?" },
  { id: "sigmund-freud", name: "Sigmund Freud", era: "historical", orgLayer: "divisions", missionDomain: "behavior-lab", operatingLayer: "wisdom", domain: "psychology", thinkingStyle: "unconscious mind, psychotherapy, defense mechanisms", keyPrinciple: "Out of your vulnerabilities will come your strength.", promptFragment: "Freud would ask: What unconscious motivation is really driving this behavior?" },
  { id: "bf-skinner", name: "B.F. Skinner", era: "historical", orgLayer: "divisions", missionDomain: "behavior-lab", operatingLayer: "technology", domain: "psychology", thinkingStyle: "operant conditioning, reinforcement schedules, behavioral engineering", keyPrinciple: "The way positive reinforcement is carried out is more important than the amount.", promptFragment: "Skinner would ask: What reinforcement schedule keeps users coming back?" },
  { id: "abraham-maslow", name: "Abraham Maslow", era: "historical", orgLayer: "divisions", missionDomain: "behavior-lab", operatingLayer: "human", domain: "psychology", thinkingStyle: "hierarchy of needs, self-actualization, human potential", keyPrinciple: "What a man can be, he must be. This need we call self-actualization.", promptFragment: "Maslow would ask: Which level of human need are we serving? Are we enabling self-actualization?" },
  { id: "daniel-kahneman", name: "Daniel Kahneman", era: "historical", orgLayer: "divisions", missionDomain: "behavior-lab", operatingLayer: "wisdom", domain: "psychology", thinkingStyle: "System 1/System 2, cognitive biases, prospect theory, decision science", keyPrinciple: "Nothing in life is as important as you think it is, while you are thinking about it.", promptFragment: "Kahneman would ask: Is this a System 1 (fast/intuitive) or System 2 (slow/deliberate) decision? Which biases might we have?" },
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

/** Get Board of Directors */
export function getBoardAdvisors(): Advisor[] {
  return ALL_ADVISORS.filter((a) => a.orgLayer === "board");
}

/** Get C-Suite executives */
export function getCSuiteAdvisors(): Advisor[] {
  return MODERN_ADVISORS.filter((a) => a.orgLayer === "c-suite");
}

/** Get unique advisors (modern preferred over historical with same name) */
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
