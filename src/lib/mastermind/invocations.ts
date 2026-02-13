/**
 * Mastermind Advisory System - Invocation Commands
 *
 * ~25 invocation shortcuts that map to specific advisor perspectives
 * or group deliberation modes. Used in the prompt system and dashboard.
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
  // ─── Single-mind invocations ─────────────────────────────────────────
  {
    trigger: "Jensen lens",
    description: "Infrastructure/platform thinking — what investment today makes everything possible?",
    advisorIds: ["jensen-huang"],
    mode: "single",
  },
  {
    trigger: "Hormozi offer",
    description: "Irresistible offer design — is the offer so good people feel stupid saying no?",
    advisorIds: ["alex-hormozi"],
    mode: "single",
  },
  {
    trigger: "Voss mode",
    description: "Tactical empathy negotiation — calibrated questions, labeling, mirroring",
    advisorIds: ["chris-voss"],
    mode: "single",
  },
  {
    trigger: "Altman deploy",
    description: "Ship fast, iterate responsibly — what's the fastest path to production?",
    advisorIds: ["sam-altman"],
    mode: "single",
  },
  {
    trigger: "Buffett test",
    description: "Circle of competence + front-page test — is this within our moat?",
    advisorIds: ["warren-buffett"],
    mode: "single",
  },
  {
    trigger: "Carlsen intuition",
    description: "Pattern recognition beyond data — what subtle advantage compounds over time?",
    advisorIds: ["magnus-carlsen"],
    mode: "single",
  },
  {
    trigger: "MrBeast scale",
    description: "Biggest possible version — how do we make this so remarkable people HAVE to share it?",
    advisorIds: ["mrbeast"],
    mode: "single",
  },
  {
    trigger: "Amodei safety",
    description: "What could go catastrophically wrong? Safety-first architecture review.",
    advisorIds: ["dario-amodei"],
    mode: "single",
  },
  {
    trigger: "Dalio transparency",
    description: "Radical transparency — what does the data honestly tell us?",
    advisorIds: ["ray-dalio"],
    mode: "single",
  },
  {
    trigger: "Nadella culture",
    description: "Growth mindset — does our culture enable our strategy?",
    advisorIds: ["satya-nadella"],
    mode: "single",
  },
  {
    trigger: "Brunson funnel",
    description: "Funnel optimization — value ladder from awareness to action",
    advisorIds: ["russell-brunson"],
    mode: "single",
  },
  {
    trigger: "Patel SEO",
    description: "SEO and content-driven growth — sustainable organic traffic strategy",
    advisorIds: ["neil-patel"],
    mode: "single",
  },
  {
    trigger: "Clooney legal",
    description: "Strategic legal advocacy — use law as a sword, not just a shield",
    advisorIds: ["amal-clooney"],
    mode: "single",
  },
  {
    trigger: "Peterson meaning",
    description: "Meaning and responsibility — are we helping users take ownership?",
    advisorIds: ["jordan-peterson"],
    mode: "single",
  },
  {
    trigger: "Singer ethics",
    description: "Maximum good test — does this maximize overall well-being?",
    advisorIds: ["peter-singer"],
    mode: "single",
  },
  {
    trigger: "Musk first-principles",
    description: "First principles from scratch — rebuild from physics, not analogy",
    advisorIds: ["elon-musk"],
    mode: "single",
  },
  {
    trigger: "Wenfeng efficiency",
    description: "Maximum AI efficiency per dollar — DeepSeek approach to resource allocation",
    advisorIds: ["liang-wenfeng"],
    mode: "single",
  },
  {
    trigger: "Karpathy ship",
    description: "Research to production — ship AI that works in the real world",
    advisorIds: ["andrej-karpathy"],
    mode: "single",
  },
  {
    trigger: "Gary Vee jab",
    description: "Give value before asking — jab, jab, jab, right hook",
    advisorIds: ["gary-vaynerchuk"],
    mode: "single",
  },
  {
    trigger: "Cialdini influence",
    description: "Apply the 6 principles of influence — reciprocity, scarcity, authority, etc.",
    advisorIds: ["robert-cialdini"],
    mode: "single",
  },
  {
    trigger: "Zelenskyy courage",
    description: "Courage under pressure — show up, communicate honestly, never hide",
    advisorIds: ["zelenskyy"],
    mode: "single",
  },

  // ─── Group deliberation modes ──────────────────────────────────────────
  {
    trigger: "Board Meeting",
    description: "Full Nucleus deliberation — all 5 Architects weigh in on a strategic decision",
    advisorIds: ["jensen-huang", "demis-hassabis", "warren-buffett", "satya-nadella", "dario-amodei"],
    mode: "group",
    orgLayer: "nucleus",
  },
  {
    trigger: "Modern Board Meeting",
    description: "Full analysis from 10+ top modern minds across all layers",
    advisorIds: [
      "jensen-huang", "warren-buffett", "dario-amodei",
      "alex-hormozi", "chris-voss", "magnus-carlsen",
      "mrbeast", "ray-dalio", "peter-singer", "sam-altman",
    ],
    mode: "group",
  },
  {
    trigger: "Safety Council",
    description: "Full safety review — Amodei, Bostrom, Han, Hinton assess risks",
    advisorIds: ["dario-amodei", "nick-bostrom", "byung-chul-han", "geoffrey-hinton"],
    mode: "group",
    orgLayer: "governance",
  },
  {
    trigger: "Growth War Room",
    description: "Revenue-focused sprint — Hormozi, Brunson, Patel, MrBeast, Gary Vee",
    advisorIds: ["alex-hormozi", "russell-brunson", "neil-patel", "mrbeast", "gary-vaynerchuk"],
    mode: "group",
    mission: "growth-revenue",
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
