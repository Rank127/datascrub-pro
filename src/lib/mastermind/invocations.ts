/**
 * Mastermind Advisory System - 45+ Invocation Commands (Feb 2026)
 *
 * Classic Invocations (Historical Masterminds)
 * Modern Invocations (Living Masterminds)
 * Expansion Invocations (New Categories)
 * Group Deliberation Modes
 */

import type { MissionDomain, OrgLayer, OperatingLayer } from "./advisors";

export interface Invocation {
  trigger: string;
  description: string;
  advisorIds: string[];
  mode: "single" | "group" | "protocol";
  orgLayer?: OrgLayer;
  mission?: MissionDomain;
  operatingLayer?: OperatingLayer;
}

export const INVOCATIONS: Invocation[] = [
  // ─── Classic Invocations (Historical Masterminds) ─────────────────────
  {
    trigger: "Board Meeting",
    description: "Full 7-section strategic analysis from 15+ minds",
    advisorIds: ["warren-buffett", "ray-dalio", "robert-cialdini", "rand-fishkin", "jensen-huang", "dario-amodei", "alex-hormozi", "mike-king", "daniel-miessler", "kelsey-hightower", "sam-altman", "chris-voss", "mrbeast", "amal-clooney"],
    mode: "group",
    orgLayer: "board",
  },
  {
    trigger: "Jobs edit",
    description: "Strip everything to its essence",
    advisorIds: ["jobs"],
    mode: "single",
  },
  {
    trigger: "Munger inversion",
    description: "What would guarantee failure? Avoid those things",
    advisorIds: ["munger"],
    mode: "single",
  },
  {
    trigger: "Buffett test",
    description: "Circle of competence + margin of safety + long-term check",
    advisorIds: ["warren-buffett"],
    mode: "single",
  },
  {
    trigger: "Voss mode",
    description: "Tactical empathy for negotiation or tough conversation",
    advisorIds: ["chris-voss"],
    mode: "single",
  },
  {
    trigger: "Ogilvy review",
    description: "Evaluate copy/messaging for selling power",
    advisorIds: ["ogilvy"],
    mode: "single",
  },
  {
    trigger: "Hormozi offer",
    description: "Design an irresistible offer using the value equation",
    advisorIds: ["alex-hormozi"],
    mode: "single",
  },
  {
    trigger: "10X it",
    description: "Cardone energy — what would 10X action look like?",
    advisorIds: ["grant-cardone"],
    mode: "single",
  },
  {
    trigger: "Safety check",
    description: "Hinton + Amodei + Feynman risk assessment",
    advisorIds: ["geoffrey-hinton", "dario-amodei", "feynman"],
    mode: "group",
  },
  {
    trigger: "Philosopher's Council",
    description: "Socrates + Marcus Aurelius + Nietzsche on meaning/ethics",
    advisorIds: ["socrates", "marcus-aurelius", "nietzsche"],
    mode: "group",
  },
  {
    trigger: "Feynman test",
    description: "Am I fooling myself? Can I explain this simply?",
    advisorIds: ["feynman"],
    mode: "single",
  },
  {
    trigger: "First principles",
    description: "Einstein + Musk breakdown to fundamentals",
    advisorIds: ["einstein", "elon-musk"],
    mode: "group",
  },
  {
    trigger: "Da Vinci connect",
    description: "What cross-domain connections am I missing?",
    advisorIds: ["da-vinci"],
    mode: "single",
  },
  {
    trigger: "The Contrarian Question",
    description: "Thiel: What important truth do few agree with you on?",
    advisorIds: ["thiel"],
    mode: "single",
  },
  {
    trigger: "Sun Tzu positioning",
    description: "Full competitive landscape analysis",
    advisorIds: ["sun-tzu"],
    mode: "single",
  },
  {
    trigger: "Socrates question",
    description: "Ask me 5 questions I'm afraid to answer",
    advisorIds: ["socrates"],
    mode: "single",
  },

  // ─── Modern Invocations (Living Masterminds) ─────────────────────────
  {
    trigger: "Jensen lens",
    description: "Infrastructure/platform thinking — what layer should we own?",
    advisorIds: ["jensen-huang"],
    mode: "single",
  },
  {
    trigger: "Altman deploy",
    description: "Take complex technology and make it accessible at scale",
    advisorIds: ["sam-altman"],
    mode: "single",
  },
  {
    trigger: "Nadella operator",
    description: "Operational excellence — partnerships, culture, execution",
    advisorIds: ["satya-nadella"],
    mode: "single",
  },
  {
    trigger: "Dalio cycles",
    description: "Where are we in the economic/technology cycle?",
    advisorIds: ["ray-dalio"],
    mode: "single",
  },
  {
    trigger: "Hassabis science",
    description: "How can AI accelerate scientific discovery for this problem?",
    advisorIds: ["demis-hassabis"],
    mode: "single",
  },
  {
    trigger: "Amodei safety",
    description: "Risk assessment — what could go catastrophically wrong?",
    advisorIds: ["dario-amodei"],
    mode: "single",
  },
  {
    trigger: "Fishkin intuition",
    description: "What would a profitable bootstrapped company do here?",
    advisorIds: ["rand-fishkin"],
    mode: "single",
  },
  {
    trigger: "Wenfeng efficiency",
    description: "How do we build this at 1/10th the expected cost?",
    advisorIds: ["liang-wenfeng"],
    mode: "single",
  },
  {
    trigger: "MrBeast scale",
    description: "What's the biggest possible version of this concept?",
    advisorIds: ["mrbeast"],
    mode: "single",
  },
  {
    trigger: "Brunson funnel",
    description: "Design the conversion architecture for this customer journey",
    advisorIds: ["russell-brunson"],
    mode: "single",
  },
  {
    trigger: "Gary Vee attention",
    description: "Where is attention underpriced right now?",
    advisorIds: ["gary-vaynerchuk"],
    mode: "single",
  },
  {
    trigger: "Cowen evidence",
    description: "What does the empirical evidence actually say?",
    advisorIds: ["tyler-cowen"],
    mode: "single",
  },
  {
    trigger: "Zelenskyy crisis",
    description: "Crisis communication — be visible, honest, and brave",
    advisorIds: ["zelenskyy"],
    mode: "single",
  },
  {
    trigger: "Karpathy ship",
    description: "Ship AI from research to production",
    advisorIds: ["andrej-karpathy"],
    mode: "single",
  },
  {
    trigger: "Cialdini influence",
    description: "Apply the 7 principles of influence ethically",
    advisorIds: ["robert-cialdini"],
    mode: "single",
  },
  {
    trigger: "Patel SEO",
    description: "SEO and content-driven growth strategy",
    advisorIds: ["neil-patel"],
    mode: "single",
  },
  {
    trigger: "Clooney legal",
    description: "Strategic legal advocacy — law as sword, not shield",
    advisorIds: ["amal-clooney"],
    mode: "single",
  },
  {
    trigger: "Peterson meaning",
    description: "Meaning and responsibility framing",
    advisorIds: ["jordan-peterson"],
    mode: "single",
  },
  {
    trigger: "Singer ethics",
    description: "Maximum good test — does this maximize well-being?",
    advisorIds: ["peter-singer"],
    mode: "single",
  },

  // ─── Expansion Invocations (New Categories) ──────────────────────────
  {
    trigger: "Fishkin growth",
    description: "Bootstrapped organic growth — other people's audiences, no paid ads",
    advisorIds: ["rand-fishkin"],
    mode: "single",
    operatingLayer: "seo-growth",
  },
  {
    trigger: "King relevance",
    description: "AI search optimization — passage-level, AI Overviews, LLM retrieval",
    advisorIds: ["mike-king"],
    mode: "single",
    operatingLayer: "seo-growth",
  },
  {
    trigger: "Miessler augment",
    description: "AI-security integration — what would 10,000 employees do?",
    advisorIds: ["daniel-miessler"],
    mode: "single",
    operatingLayer: "security",
  },
  {
    trigger: "Hightower simplify",
    description: "Infrastructure audit — are we over-engineering? Use managed services?",
    advisorIds: ["kelsey-hightower"],
    mode: "single",
    operatingLayer: "infrastructure",
  },
  {
    trigger: "Rams simplify",
    description: "Apply 'less, but better' to any product or system",
    advisorIds: ["dieter-rams"],
    mode: "single",
    operatingLayer: "design",
  },
  {
    trigger: "Ive materiality",
    description: "How does this product feel? What's the emotional connection?",
    advisorIds: ["jony-ive"],
    mode: "single",
    operatingLayer: "design",
  },
  {
    trigger: "Mitnick audit",
    description: "Social engineering vulnerability assessment",
    advisorIds: ["kevin-mitnick"],
    mode: "single",
    operatingLayer: "security",
  },
  {
    trigger: "Khan mastery",
    description: "Are we building on solid foundations or skipping prerequisites?",
    advisorIds: ["sal-khan"],
    mode: "single",
  },
  {
    trigger: "Livermore read",
    description: "What is market psychology telling us right now?",
    advisorIds: ["livermore"],
    mode: "single",
  },
  {
    trigger: "Toyota audit",
    description: "Lean/kaizen assessment — where is waste in our system?",
    advisorIds: ["taiichi-ohno"],
    mode: "single",
    operatingLayer: "infrastructure",
  },
  {
    trigger: "Fishkin zebra",
    description: "Are we building a Zebra (sustainable) or chasing a Unicorn (unsustainable)?",
    advisorIds: ["rand-fishkin"],
    mode: "single",
  },
  {
    trigger: "King patent",
    description: "What does Google's actual system architecture tell us about ranking?",
    advisorIds: ["mike-king"],
    mode: "single",
    operatingLayer: "seo-growth",
  },
  {
    trigger: "Miessler fabric",
    description: "How do we build AI-powered automation for this security/ops workflow?",
    advisorIds: ["daniel-miessler"],
    mode: "single",
    operatingLayer: "security",
  },
  {
    trigger: "Hightower managed",
    description: "Should we build this or buy it as a managed service?",
    advisorIds: ["kelsey-hightower"],
    mode: "single",
    operatingLayer: "infrastructure",
  },
  {
    trigger: "Duckworth grit",
    description: "Do we have the perseverance and passion to persist?",
    advisorIds: ["angela-duckworth"],
    mode: "single",
  },

  // ─── Group Deliberation Modes ────────────────────────────────────────
  {
    trigger: "Modern Board Meeting",
    description: "Full analysis from 10+ living masterminds",
    advisorIds: [
      "jensen-huang", "warren-buffett", "dario-amodei", "rand-fishkin",
      "alex-hormozi", "chris-voss", "magnus-carlsen",
      "mrbeast", "ray-dalio", "sam-altman", "mike-king", "daniel-miessler",
    ],
    mode: "group",
  },
  {
    trigger: "Full Board Meeting",
    description: "All 240+ minds — historical AND modern — weigh in",
    advisorIds: [
      "warren-buffett", "ray-dalio", "robert-cialdini", "rand-fishkin",
      "jensen-huang", "sam-altman", "dario-amodei", "alex-hormozi",
      "sun-tzu", "einstein", "feynman", "socrates", "marcus-aurelius",
      "mike-king", "daniel-miessler", "kelsey-hightower",
    ],
    mode: "group",
  },
  {
    trigger: "Safety Council",
    description: "Full safety review — Amodei, Schneier, Hinton, Mitnick assess risks",
    advisorIds: ["dario-amodei", "bruce-schneier", "geoffrey-hinton", "kevin-mitnick", "daniel-miessler"],
    mode: "group",
  },
  {
    trigger: "Growth War Room",
    description: "Revenue + SEO sprint — Hormozi, Fishkin, King, Patel, MrBeast",
    advisorIds: ["alex-hormozi", "rand-fishkin", "mike-king", "neil-patel", "mrbeast", "gary-vaynerchuk"],
    mode: "group",
    mission: "seo-organic-growth",
  },
  {
    trigger: "Security War Room",
    description: "Full security assessment — Hyppönen, Miessler, Schneier, Mitnick, Tabriz",
    advisorIds: ["mikko-hypponen", "daniel-miessler", "bruce-schneier", "kevin-mitnick", "parisa-tabriz"],
    mode: "group",
    mission: "security-defense",
  },
  {
    trigger: "Design Sprint",
    description: "Product design review — Ive, Rams, Jobs, Ingels, Maeda",
    advisorIds: ["jony-ive", "dieter-rams", "jobs", "bjarke-ingels", "john-maeda"],
    mode: "group",
    operatingLayer: "design",
  },
];

/** Resolve an invocation command (case-insensitive) */
export function resolveInvocation(command: string): Invocation | undefined {
  const normalized = command.toLowerCase().trim();
  return INVOCATIONS.find((inv) => inv.trigger.toLowerCase() === normalized);
}

/** Get all available invocations */
export function getAllInvocations(): Invocation[] {
  return INVOCATIONS;
}

/** Get invocations by mode */
export function getInvocationsByMode(mode: Invocation["mode"]): Invocation[] {
  return INVOCATIONS.filter((inv) => inv.mode === mode);
}
