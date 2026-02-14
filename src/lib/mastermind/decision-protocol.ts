/**
 * Mastermind Advisory System - 11-Step Decision Protocol (Feb 2026)
 *
 * MAP → ANALYZE → DESIGN OFFER → DESIGN EXPERIENCE → SAFETY CHECK →
 * BUILD & SHIP → GROW ORGANICALLY → SELL → OPTIMIZE → PROTECT → GOVERN
 */

import { getAdvisor, type Advisor } from "./advisors";

export type ProtocolStep =
  | "MAP"
  | "ANALYZE"
  | "DESIGN_OFFER"
  | "DESIGN_EXPERIENCE"
  | "SAFETY_CHECK"
  | "BUILD_SHIP"
  | "GROW_ORGANICALLY"
  | "SELL"
  | "OPTIMIZE"
  | "PROTECT"
  | "GOVERN";

interface StepDefinition {
  id: ProtocolStep;
  name: string;
  purpose: string;
  advisorIds: string[];
  questions: string[];
}

const PROTOCOL_STEPS: StepDefinition[] = [
  {
    id: "MAP",
    name: "MAP — Map the Landscape",
    purpose: "Assess the competitive and technology landscape with infrastructure thinking, partnership strategy, and pattern recognition.",
    advisorIds: ["sun-tzu", "jensen-huang", "satya-nadella"],
    questions: [
      "What's the full competitive and technology landscape?",
      "Where is the infrastructure layer we should own?",
      "What patterns do we intuit that data doesn't yet confirm?",
      "What partnership opportunities amplify our position?",
    ],
  },
  {
    id: "ANALYZE",
    name: "ANALYZE — Principles & Data Analysis",
    purpose: "Apply cycle awareness, institutional thinking, empirical evidence, and first principles to understand the situation deeply.",
    advisorIds: ["ray-dalio", "daron-acemoglu", "tyler-cowen", "einstein"],
    questions: [
      "Where are we in the economic/technology cycle?",
      "What institutional dynamics are at play?",
      "What does the empirical evidence actually say?",
      "What are we assuming that might be wrong? (First principles)",
    ],
  },
  {
    id: "DESIGN_OFFER",
    name: "DESIGN THE OFFER — Irresistible Value",
    purpose: "Create offers so good people feel stupid saying no. Make frontier technology accessible. Design the conversion architecture.",
    advisorIds: ["alex-hormozi", "sam-altman", "russell-brunson"],
    questions: [
      "What's the irresistible offer?",
      "How do we make frontier technology accessible?",
      "What's the conversion architecture?",
      "What's the dream outcome / time x effort equation for the customer?",
    ],
  },
  {
    id: "DESIGN_EXPERIENCE",
    name: "DESIGN THE EXPERIENCE — Human-Centered Design",
    purpose: "Design how it feels, how it looks, and what world we're creating for the customer. Simplify relentlessly.",
    advisorIds: ["jony-ive", "dieter-rams", "jobs"],
    questions: [
      "How does it feel? How does it look?",
      "What world are we creating for the customer?",
      "What can we remove to make it simpler?",
      "Is every remaining element essential and beautiful?",
    ],
  },
  {
    id: "SAFETY_CHECK",
    name: "SAFETY CHECK — What Could Go Wrong?",
    purpose: "Before building, run the safety gauntlet: constitutional AI check, security review, inversion, intellectual honesty.",
    advisorIds: ["dario-amodei", "bruce-schneier", "munger", "feynman"],
    questions: [
      "What could go catastrophically wrong?",
      "Are we fooling ourselves about any assumption?",
      "Is our security proportional to our exposure?",
      "Is our safety infrastructure proportional to our capability?",
    ],
  },
  {
    id: "BUILD_SHIP",
    name: "BUILD & SHIP — Efficient Execution",
    purpose: "Build efficiently — capability per dollar. Ship at scale with flawless execution. Test rapidly. Iterate.",
    advisorIds: ["liang-wenfeng", "tim-cook", "andrej-karpathy", "edison"],
    questions: [
      "Are we maximizing capability per dollar?",
      "Can we ship this to production this week?",
      "Is our operations world-class? What's the bottleneck?",
      "Don't let perfect be the enemy of shipped.",
    ],
  },
  {
    id: "GROW_ORGANICALLY",
    name: "GROW ORGANICALLY — Sustainable Growth",
    purpose: "Leverage other people's audiences. Engineer relevance for AI search surfaces. Create content that compounds.",
    advisorIds: ["rand-fishkin", "mike-king", "neil-patel", "ogilvy"],
    questions: [
      "What audiences can we leverage without paid ads?",
      "Are we engineering relevance for AI search surfaces?",
      "What content compounds over time?",
      "Is every piece of content the best version of its concept?",
    ],
  },
  {
    id: "SELL",
    name: "SELL — Empathy-Driven Distribution",
    purpose: "Negotiate with tactical empathy. Make the offer irresistible. Be everywhere attention is underpriced.",
    advisorIds: ["chris-voss", "alex-hormozi", "gary-vaynerchuk", "ogilvy"],
    questions: [
      "What calibrated question reveals the customer's real constraint?",
      "Is our offer truly irresistible?",
      "Are we where attention is underpriced?",
      "Research what works, then do more of it.",
    ],
  },
  {
    id: "OPTIMIZE",
    name: "OPTIMIZE — Performance & Efficiency",
    purpose: "Ensure tools and scripts perform at peak. Eliminate waste. Decide what to build vs. buy as a managed service.",
    advisorIds: ["kelsey-hightower", "taiichi-ohno", "tim-cook", "liang-wenfeng"],
    questions: [
      "Are our tools and scripts performing at peak efficiency?",
      "Are we over-engineering anything we should buy as a service?",
      "Where is waste in our system? Eliminate it.",
      "Is capability-per-dollar maximized?",
    ],
  },
  {
    id: "PROTECT",
    name: "PROTECT — Security & Defense",
    purpose: "Train the human layer against social engineering. Test adversarially. Embed security in the architecture.",
    advisorIds: ["kevin-mitnick", "bruce-schneier", "katie-moussouris", "parisa-tabriz"],
    questions: [
      "Is our human layer trained against social engineering?",
      "Have we tested adversarially?",
      "Is security embedded, not bolted on?",
      "What single-point-of-failure could take us down?",
    ],
  },
  {
    id: "GOVERN",
    name: "GOVERN — Ethics, Transparency & Legacy",
    purpose: "Ensure decisions pass the front-page test, act with virtue on what we control, question assumptions, and govern proportionally.",
    advisorIds: ["warren-buffett", "marcus-aurelius", "socrates", "dario-amodei"],
    questions: [
      "Would we be comfortable with this on the front page?",
      "What is within our control, and are we acting with virtue?",
      "What assumptions haven't we questioned?",
      "Is our governance proportional to our power?",
    ],
  },
];

/** Get a specific protocol step */
export function getProtocolStep(stepId: ProtocolStep): StepDefinition | undefined {
  return PROTOCOL_STEPS.find((s) => s.id === stepId);
}

/** Get all protocol steps */
export function getAllProtocolSteps(): StepDefinition[] {
  return PROTOCOL_STEPS;
}

/**
 * Build a formatted prompt section for selected protocol steps.
 * If no steps are specified, includes all 11.
 */
export function getDecisionProtocolPrompt(steps?: ProtocolStep[]): string {
  const selectedSteps = steps
    ? PROTOCOL_STEPS.filter((s) => steps.includes(s.id))
    : PROTOCOL_STEPS;

  if (selectedSteps.length === 0) return "";

  const sections = selectedSteps.map((step) => {
    const advisors = step.advisorIds
      .map((id) => getAdvisor(id))
      .filter((a): a is Advisor => a !== undefined);

    const advisorLine = advisors
      .map((a) => `${a.name} (${a.domain})`)
      .join(", ");

    const questionLines = step.questions
      .map((q) => `  - ${q}`)
      .join("\n");

    return `### ${step.name}
Advisors: ${advisorLine}
Purpose: ${step.purpose}
Key Questions:
${questionLines}`;
  });

  return `## Mastermind Decision Protocol (11-Step)
Apply the framework (MAP → ANALYZE → DESIGN OFFER → DESIGN EXPERIENCE → SAFETY CHECK → BUILD & SHIP → GROW ORGANICALLY → SELL → OPTIMIZE → PROTECT → GOVERN):

${sections.join("\n\n")}`;
}
