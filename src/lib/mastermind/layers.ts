/**
 * Mastermind Advisory System - 5 Operating Principle Layers
 *
 * Updated for the Modern Mastermind model:
 *   - Technology: How to Build
 *   - Strategic: How to Position
 *   - Commercial: How to Sell & Grow
 *   - Human: How to Lead
 *   - Wisdom: How to Decide
 */

import { ALL_ADVISORS, type Advisor, type OperatingLayer } from "./advisors";

export interface LayerDefinition {
  id: OperatingLayer;
  name: string;
  question: string;
  description: string;
  keyAdvisorIds: string[];
}

export const LAYERS: LayerDefinition[] = [
  {
    id: "technology",
    name: "Technology",
    question: "How to Build",
    description:
      "Advisors who design infrastructure, architect AI systems, and turn ideas into shipped products. They think in platforms, efficiency, and production-grade engineering.",
    keyAdvisorIds: [
      "jensen-huang",
      "liang-wenfeng",
      "andrej-karpathy",
      "yann-lecun",
      "dario-amodei",
      "sam-altman",
      "elon-musk",
    ],
  },
  {
    id: "strategic",
    name: "Strategic",
    question: "How to Position",
    description:
      "Advisors who see the whole board, identify competitive advantages, and build long-term positioning. They think in decades, moats, and radical transparency.",
    keyAdvisorIds: [
      "jensen-huang",
      "satya-nadella",
      "magnus-carlsen",
      "ray-dalio",
      "warren-buffett",
      "tim-cook",
      "mohamed-el-erian",
    ],
  },
  {
    id: "commercial",
    name: "Commercial",
    question: "How to Sell & Grow",
    description:
      "Advisors who master offers, funnels, content, and closing. They turn attention into revenue through irresistible value and relentless distribution.",
    keyAdvisorIds: [
      "alex-hormozi",
      "russell-brunson",
      "neil-patel",
      "chris-voss",
      "gary-vaynerchuk",
      "mrbeast",
      "grant-cardone",
    ],
  },
  {
    id: "human",
    name: "Human",
    question: "How to Lead",
    description:
      "Advisors who master empathy, culture, communication, and courage. They build teams, inspire trust, and lead through crisis with authenticity.",
    keyAdvisorIds: [
      "satya-nadella",
      "jordan-peterson",
      "zelenskyy",
      "vanessa-van-edwards",
      "lex-fridman",
      "joe-rogan",
      "amal-clooney",
    ],
  },
  {
    id: "wisdom",
    name: "Wisdom",
    question: "How to Decide",
    description:
      "Advisors who navigate ambiguity, question assumptions, and ensure ethical integrity. They critique, assess risk, demand evidence, and protect against catastrophe.",
    keyAdvisorIds: [
      "yuval-harari",
      "byung-chul-han",
      "nick-bostrom",
      "peter-singer",
      "tyler-cowen",
      "daron-acemoglu",
      "geoffrey-hinton",
    ],
  },
];

/** Get the layer definition by ID */
export function getLayer(id: OperatingLayer): LayerDefinition | undefined {
  return LAYERS.find((l) => l.id === id);
}

/** Get advisors assigned to a specific operating layer */
export function getLayerAdvisors(layerId: OperatingLayer): Advisor[] {
  return ALL_ADVISORS.filter((a) => a.operatingLayer === layerId);
}

/** Get the key/representative advisors for a layer */
export function getKeyLayerAdvisors(layerId: OperatingLayer): Advisor[] {
  const layer = getLayer(layerId);
  if (!layer) return [];
  return layer.keyAdvisorIds
    .map((id) => ALL_ADVISORS.find((a) => a.id === id))
    .filter((a): a is Advisor => a !== undefined);
}
