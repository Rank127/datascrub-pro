/**
 * Mastermind Advisory System - 10 Thinking Layers (Feb 2026)
 *
 * 1. Strategic — How to Think
 * 2. Execution — How to Build & Ship
 * 3. Technology — How to Build with AI
 * 4. Commercial — How to Sell & Grow
 * 5. Human — How to Lead & Communicate
 * 6. Wisdom — How to Decide Under Uncertainty
 * 7. SEO & Organic Growth — How to Grow Without Burning Cash
 * 8. Design — How to Make Things People Love
 * 9. Infrastructure — How to Keep Tools & Scripts Performing
 * 10. Security — How to Protect What You Build
 */

import { ALL_ADVISORS, type Advisor, type OperatingLayer } from "./advisors";

export interface LayerDefinition {
  id: OperatingLayer;
  name: string;
  question: string;
  description: string;
  keyAdvisorIds: string[];
  frameworks: { mind: string; insight: string }[];
}

export const LAYERS: LayerDefinition[] = [
  {
    id: "strategic",
    name: "Strategic",
    question: "How to Think",
    description:
      "Before taking ANY action, apply these frameworks: competitive positioning, platform play, regret minimization, circle of competence, first principles, inversion, reflexivity, contrarian thinking, partnerships, bootstrapped intuition, and cycle awareness.",
    keyAdvisorIds: [
      "sun-tzu", "jensen-huang", "warren-buffett", "ray-dalio",
      "satya-nadella", "rand-fishkin", "magnus-carlsen",
    ],
    frameworks: [
      { mind: "Sun Tzu", insight: "What is the competitive landscape? Win before fighting." },
      { mind: "Jensen Huang", insight: "Own the infrastructure layer, not just the application layer." },
      { mind: "Bezos", insight: "Will we regret NOT doing this in 10 years?" },
      { mind: "Buffett", insight: "Do we understand this domain deeply enough to act?" },
      { mind: "Munger", insight: "What would guarantee failure? Avoid those things." },
      { mind: "Soros", insight: "How will our actions change the environment?" },
      { mind: "Thiel", insight: "What important truth do very few people agree with us on?" },
      { mind: "Nadella", insight: "The best strategy is often partnering, not building everything." },
      { mind: "Fishkin", insight: "When data is ambiguous, ask: what would a profitable 3-person company do?" },
      { mind: "Dalio", insight: "Know where you are in the economic/technology cycle." },
    ],
  },
  {
    id: "execution",
    name: "Execution",
    question: "How to Build & Ship",
    description:
      "When building, creating, or implementing: simplicity, rapid iteration, first principles manufacturing, system control, speed, vision, efficiency per dollar, flawless operations, and pragmatic shipping.",
    keyAdvisorIds: [
      "jobs", "edison", "elon-musk", "liang-wenfeng",
      "tim-cook", "andrej-karpathy", "napoleon",
    ],
    frameworks: [
      { mind: "Jobs", insight: "Remove everything that isn't essential. Then remove more." },
      { mind: "Edison", insight: "Build fast, test fast, learn fast." },
      { mind: "Musk", insight: "What does this cost at the physics level?" },
      { mind: "Rockefeller", insight: "Do we control the critical parts of the value chain?" },
      { mind: "Napoleon", insight: "While others deliberate, we move. Speed is a weapon." },
      { mind: "Tesla (inventor)", insight: "What does this look like 10 years from now?" },
      { mind: "Wenfeng", insight: "Capability per dollar matters more than raw capability." },
      { mind: "Cook", insight: "Flawless supply chain execution at massive scale." },
      { mind: "Karpathy", insight: "The best research is useless if it can't ship." },
    ],
  },
  {
    id: "technology",
    name: "Technology",
    question: "How to Build with AI",
    description:
      "For technology and AI-specific decisions: platform infrastructure, AI-science convergence, safety measures, paradigm limits, accessibility, and frugal innovation.",
    keyAdvisorIds: [
      "jensen-huang", "demis-hassabis", "dario-amodei",
      "yann-lecun", "sam-altman", "liang-wenfeng",
    ],
    frameworks: [
      { mind: "Jensen Huang", insight: "Build the platform that enables a thousand use cases." },
      { mind: "Hassabis", insight: "AI should accelerate scientific discovery, not just automate tasks." },
      { mind: "Amodei", insight: "Every capability must have a corresponding safety measure." },
      { mind: "LeCun", insight: "The current paradigm has limits. Fund research into what comes next." },
      { mind: "Altman", insight: "Frontier technology should become accessible to everyone." },
      { mind: "Wenfeng", insight: "Do more with radically less." },
    ],
  },
  {
    id: "commercial",
    name: "Commercial",
    question: "How to Sell & Grow",
    description:
      "When dealing with customers, pricing, and growth: irresistible offer design, research-driven copy, funnel optimization, tactical empathy, attention arbitrage, scale thinking, ethical persuasion, relationship building, and service-first selling.",
    keyAdvisorIds: [
      "alex-hormozi", "russell-brunson", "chris-voss",
      "gary-vaynerchuk", "mrbeast", "robert-cialdini", "neil-patel",
    ],
    frameworks: [
      { mind: "Hormozi", insight: "Dream outcome x perceived likelihood / time delay / effort = irresistible value." },
      { mind: "Ogilvy", insight: "Research what she responds to, then sell." },
      { mind: "Brunson", insight: "Every customer journey is a funnel. Optimize every step." },
      { mind: "Voss", insight: "Label emotions. Use calibrated questions. Listen more than talk." },
      { mind: "Gary Vee", insight: "Go where attention is underpriced." },
      { mind: "MrBeast", insight: "Every piece of content should be the biggest possible version." },
      { mind: "Cialdini", insight: "Apply reciprocity, social proof, authority, scarcity, liking, and unity — ethically." },
      { mind: "Girard", insight: "Every customer knows 250 people. Treat every interaction accordingly." },
      { mind: "Ziglar", insight: "Help enough people get what they want, and you'll get what you want." },
    ],
  },
  {
    id: "human",
    name: "Human",
    question: "How to Lead & Communicate",
    description:
      "When dealing with people, teams, and culture: empathy, growth mindset, authenticity, crisis communication, people science, deep listening, and grit.",
    keyAdvisorIds: [
      "satya-nadella", "zelenskyy", "vanessa-van-edwards",
      "lex-fridman", "angela-duckworth", "jordan-peterson",
    ],
    frameworks: [
      { mind: "Carnegie", insight: "Make the other person feel like the most important person in the world." },
      { mind: "Nadella", insight: "Reward learning, not just knowing. Cultures that learn, win." },
      { mind: "Oprah", insight: "Vulnerability builds trust faster than perfection." },
      { mind: "Zelenskyy", insight: "In crisis, be visible, be honest, be brave." },
      { mind: "Van Edwards", insight: "Communication is 93% non-verbal. Master the signals." },
      { mind: "Fridman", insight: "The best conversations happen when you genuinely want to understand." },
      { mind: "Duckworth", insight: "Perseverance + passion predicts success better than talent or IQ." },
    ],
  },
  {
    id: "wisdom",
    name: "Wisdom",
    question: "How to Decide Under Uncertainty",
    description:
      "When facing hard choices, ethical dilemmas, or unknown territory: Socratic questioning, Stoic discipline, the golden mean, realism, intellectual honesty, inversion, empiricism, institutional thinking, and challenging convention.",
    keyAdvisorIds: [
      "socrates", "marcus-aurelius", "aristotle",
      "feynman", "munger", "tyler-cowen", "daron-acemoglu",
    ],
    frameworks: [
      { mind: "Socrates", insight: "What are we assuming? Is it actually true?" },
      { mind: "Marcus Aurelius", insight: "What is within our control? Focus only on that." },
      { mind: "Aristotle", insight: "The right answer is usually between two extremes." },
      { mind: "Machiavelli", insight: "What does the world actually look like, not what do we wish?" },
      { mind: "Feynman", insight: "The first principle is that you must not fool yourself." },
      { mind: "Munger", insight: "What would guarantee failure? Avoid those things." },
      { mind: "Cowen", insight: "What does the evidence actually say, stripped of narrative?" },
      { mind: "Acemoglu", insight: "Are we building institutions that will outlast us?" },
      { mind: "Nietzsche", insight: "Are we following convention out of genuine belief, or fear?" },
    ],
  },
  {
    id: "seo-growth",
    name: "SEO & Organic Growth",
    question: "How to Grow Without Burning Cash",
    description:
      "For bootstrapped companies that need sustainable, compounding growth: audience leverage, relevance engineering, organic content at scale, research-driven approach, skyscraper technique, and anti-hustle growth.",
    keyAdvisorIds: [
      "rand-fishkin", "mike-king", "neil-patel",
      "ogilvy", "godin", "halbert",
    ],
    frameworks: [
      { mind: "Fishkin", insight: "Use other people's audiences to grow your own." },
      { mind: "King", insight: "SEO is no longer keywords — it's engineering relevance across AI search surfaces." },
      { mind: "Patel", insight: "Organic content at scale is the most durable growth engine." },
      { mind: "Ogilvy", insight: "Know what your audience responds to before creating anything." },
      { mind: "Godin", insight: "Find what's already working, then make something 10x better." },
      { mind: "Fishkin", insight: "Profitability first. 3 people can outproduce 50 with the right focus." },
    ],
  },
  {
    id: "design",
    name: "Design",
    question: "How to Make Things People Love",
    description:
      "For product design, architecture, and user experience: less but better, ephemeralization, materiality, yes-is-more, elegant problem solving, and organic growth from context.",
    keyAdvisorIds: [
      "jony-ive", "dieter-rams", "buckminster-fuller",
      "bjarke-ingels", "eames", "frank-lloyd-wright",
    ],
    frameworks: [
      { mind: "Rams", insight: "Remove everything unnecessary. Then remove more." },
      { mind: "Fuller", insight: "Every iteration should require fewer resources for more output." },
      { mind: "Ive", insight: "The emotional connection between human and product is everything." },
      { mind: "Ingels", insight: "Don't compromise — find the design that satisfies all simultaneously." },
      { mind: "Eames", insight: "Design is solving problems elegantly across every medium." },
      { mind: "Wright", insight: "Products and spaces should feel like they grew naturally from context." },
    ],
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    question: "How to Keep Tools & Scripts Performing",
    description:
      "For performance engineering, DevOps, and operational efficiency: pragmatic simplicity, lean/waste elimination, flawless execution, SRE+security+performance convergence, speed of delivery, and capability per dollar.",
    keyAdvisorIds: [
      "kelsey-hightower", "taiichi-ohno", "tim-cook",
      "fred-smith", "liang-wenfeng", "andy-jassy",
    ],
    frameworks: [
      { mind: "Hightower", insight: "Don't over-optimize for problems you don't have. Use managed services." },
      { mind: "Ohno", insight: "Eliminate waste relentlessly. Every process should add value or be removed." },
      { mind: "Cook", insight: "Flawless execution at scale. Lock up the critical components." },
      { mind: "Hightower", insight: "SRE, security, and performance engineering are converging." },
      { mind: "Fred Smith", insight: "Speed of delivery is a competitive weapon. Ship fast, iterate faster." },
      { mind: "Wenfeng", insight: "Capability per dollar matters more than raw capability." },
    ],
  },
  {
    id: "security",
    name: "Security",
    question: "How to Protect What You Build",
    description:
      "For cybersecurity, risk management, and defense: social engineering awareness, systems thinking, adversarial testing, security-by-default, precaution, and AI augmentation for security.",
    keyAdvisorIds: [
      "mikko-hypponen", "daniel-miessler", "kevin-mitnick",
      "bruce-schneier", "katie-moussouris", "parisa-tabriz",
    ],
    frameworks: [
      { mind: "Mitnick", insight: "The weakest link is always human. Train for it." },
      { mind: "Schneier", insight: "Security is not a product. It's a process embedded in every system." },
      { mind: "Moussouris", insight: "Pay people to find your vulnerabilities before enemies do." },
      { mind: "Tabriz", insight: "Build security into the architecture, not bolted on after." },
      { mind: "Hinton", insight: "People building powerful technology must sound the alarm." },
      { mind: "Miessler", insight: "Use AI to give every security professional 10,000x leverage." },
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
