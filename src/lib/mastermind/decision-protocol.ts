/**
 * Mastermind Advisory System - 7-Step Modern Decision Protocol
 *
 * MAP → ANALYZE → DESIGN → SAFETY CHECK → BUILD & SHIP → SELL → GOVERN
 *
 * Each step assigns modern living minds and framing questions.
 */

import { getAdvisor, type Advisor } from "./advisors";

export type ProtocolStep =
  | "MAP"
  | "ANALYZE"
  | "DESIGN"
  | "SAFETY_CHECK"
  | "BUILD_SHIP"
  | "SELL"
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
    name: "MAP — Map the Terrain",
    purpose:
      "Assess the landscape with infrastructure thinking and pattern recognition. What position are we in? What patterns do we see?",
    advisorIds: ["jensen-huang", "magnus-carlsen"],
    questions: [
      "What platform or infrastructure investment makes everything else possible?",
      "What subtle positional advantage can we accumulate that compounds over time?",
      "What do we know vs. what are we assuming?",
      "What patterns from the competitive landscape should inform our strategy?",
    ],
  },
  {
    id: "ANALYZE",
    name: "ANALYZE — Principles & Data Analysis",
    purpose:
      "Apply radical transparency, institutional economics, and contrarian thinking. What does the data honestly tell us?",
    advisorIds: ["ray-dalio", "daron-acemoglu", "tyler-cowen"],
    questions: [
      "What does the data honestly tell us? Are we being radically transparent?",
      "Are we building inclusive systems that create value for all stakeholders?",
      "What does the contrarian view look like, and why might consensus be wrong?",
      "What structural patterns are we missing?",
    ],
  },
  {
    id: "DESIGN",
    name: "DESIGN — Irresistible Solution Design",
    purpose:
      "Create offers so good people feel stupid saying no. Ship fast, iterate responsibly. Build the funnel.",
    advisorIds: ["alex-hormozi", "sam-altman", "russell-brunson"],
    questions: [
      "Is our offer so good people feel stupid saying no?",
      "How do we ship this fast while being responsible?",
      "What's the value ladder and funnel that moves people from awareness to action?",
      "What can we remove to make this simpler and better?",
    ],
  },
  {
    id: "SAFETY_CHECK",
    name: "SAFETY CHECK — What Could Go Wrong?",
    purpose:
      "Before building, run the safety gauntlet. Constitutional AI check, existential risk scan, and burnout society critique.",
    advisorIds: ["dario-amodei", "nick-bostrom", "byung-chul-han"],
    questions: [
      "What could go catastrophically wrong with this plan?",
      "What existential or catastrophic risk have we failed to imagine?",
      "Are we creating genuine value or just feeding the optimization machine?",
      "Would we be comfortable if this decision were fully public?",
    ],
  },
  {
    id: "BUILD_SHIP",
    name: "BUILD & SHIP — Efficient Execution",
    purpose:
      "Build with maximum efficiency per dollar. Ship from research to production. Operational excellence.",
    advisorIds: ["liang-wenfeng", "tim-cook", "andrej-karpathy"],
    questions: [
      "Are we maximizing output per dollar spent?",
      "Can we ship this from research to production this week?",
      "Is our operations world-class? What's the bottleneck?",
      "Are we building something that works in the real world, not just in theory?",
    ],
  },
  {
    id: "SELL",
    name: "SELL — Empathy-Driven Distribution",
    purpose:
      "Use tactical empathy and irresistible offers to connect with customers. Give value before asking.",
    advisorIds: ["chris-voss", "alex-hormozi", "gary-vaynerchuk"],
    questions: [
      "What calibrated question reveals the customer's real constraint?",
      "Are we giving enough value before we ask for anything?",
      "Is our messaging native to each platform and audience?",
      "What's the dream outcome / time × effort equation for the customer?",
    ],
  },
  {
    id: "GOVERN",
    name: "GOVERN — Ethics, Transparency & Legacy",
    purpose:
      "Ensure the decision passes the maximum good test, the front-page test, and creates precedent we're proud of.",
    advisorIds: ["warren-buffett", "peter-singer", "yuval-harari"],
    questions: [
      "Does this pass the front-page test? Would we be proud if it were public?",
      "Does this decision maximize overall well-being?",
      "What story are we telling the world, and is it true?",
      "What precedent does this set for the future?",
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
 * If no steps are specified, includes all 7.
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

  return `## Modern Mastermind Decision Protocol
Apply the 7-step framework (MAP → ANALYZE → DESIGN → SAFETY CHECK → BUILD & SHIP → SELL → GOVERN):

${sections.join("\n\n")}`;
}
