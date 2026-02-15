/**
 * Mastermind Advisory System - GhostMyData Business Context
 *
 * Static data about the business that grounds AI advice in reality.
 * Updated periodically as the business evolves.
 */

export interface CompetitorIntel {
  name: string;
  pricing: string;
  approach: string;
  strengths: string;
  weaknesses: string;
}

export interface CompetitiveIntelligence {
  keyCompetitors: CompetitorIntel[];
  ourDifferentiators: string[];
  currentWeaknesses: string[];
  strategicGuidance: string;
}

export interface BusinessContext {
  mission: string;
  valuePropositions: string[];
  userSegments: { name: string; price: string; features: string }[];
  competitors: { name: string; positioning: string }[];
  painPoints: string[];
  uniqueAdvantages: string[];
  currentMetrics?: Record<string, string | number>;
  competitiveIntelligence: CompetitiveIntelligence;
}

export const BUSINESS_CONTEXT: BusinessContext = {
  mission:
    "Remove personal data from data brokers and protect individual privacy at scale. GhostMyData empowers people to take control of their digital footprint.",

  valuePropositions: [
    "Automated scanning across 2,100+ data broker sources",
    "AI-powered removal with 24 autonomous agents",
    "Dark web monitoring and breach alerts",
    "Family plans that protect the whole household",
    "CCPA/GDPR automated legal requests",
    "Weekly re-scanning to catch new exposures",
  ],

  userSegments: [
    {
      name: "Free",
      price: "$0",
      features:
        "Scan-only: see where your data is exposed. No removal. Limited to 1 scan per month.",
    },
    {
      name: "Pro",
      price: "$19.99/mo (40% OFF: $11.99/mo)",
      features:
        "Full automated removal, weekly monitoring, CCPA/GDPR requests, priority support, dark web monitoring.",
    },
    {
      name: "Enterprise",
      price: "$49.99/mo (40% OFF: $29.99/mo)",
      features:
        "Everything in Pro + family plan (up to 5 members), dedicated support, advanced analytics, API access.",
    },
  ],

  competitors: [
    {
      name: "DeleteMe",
      positioning:
        "Premium brand, $129/year, manual process, established reputation, Abine-backed.",
    },
    {
      name: "Incogni",
      positioning:
        "Surfshark-owned, $77.88/year, automated, bundled with VPN, European market strong.",
    },
    {
      name: "Optery",
      positioning:
        "Tech-forward, $249/year for premium, visual proof of removal, enterprise focus.",
    },
    {
      name: "Kanary",
      positioning:
        "Newer entrant, $89/year, family plans, clean UX, growing.",
    },
    {
      name: "Privacy Duck",
      positioning:
        "Boutique, manual process, personal touch, higher price point, small scale.",
    },
  ],

  painPoints: [
    "Low free-to-pro conversion rate (need to demonstrate urgent value)",
    "Broker resistance to removal requests (opt-out forms change frequently)",
    "Privacy regulation complexity across jurisdictions (CCPA, GDPR, state laws)",
    "User education gap (many don't understand the scope of their data exposure)",
    "Retention: users cancel after initial cleanup (need ongoing value demonstration)",
    "Content and SEO in a competitive keyword landscape",
  ],

  uniqueAdvantages: [
    "24 AI agents operating autonomously (most competitors use manual processes)",
    "2,100+ data source coverage (among the broadest in market)",
    "Automated CCPA/GDPR legal letter generation",
    "Family plans with shared management dashboard",
    "Real-time exposure monitoring with instant alerts",
    "AI-powered support and ticket routing",
    "Competitive pricing ($19.99/mo, currently 40% OFF at $11.99/mo vs $10-25/mo industry average)",
  ],

  competitiveIntelligence: {
    keyCompetitors: [
      {
        name: "Incogni (Surfshark)",
        pricing: "$7.49/mo (annual) or $14.98/mo",
        approach:
          "3 simple statuses (In Progress, Completed, Suppressed). Never requires user action. Shows per-broker average resolution time. Broker compliance ratings.",
        strengths:
          "Clean UX, set-and-forget, suppression lists prevent re-collection",
        weaknesses: "Limited to ~180 brokers, no family plans",
      },
      {
        name: "DeleteMe",
        pricing: "$10.75/mo (annual)",
        approach:
          "White-glove concierge. Quarterly PDF reports. 2 statuses only. Users never see internal complexity.",
        strengths: "Simplicity, brand trust, human privacy advisors",
        weaknesses: "Slow (90-day report cycles), limited real-time visibility",
      },
      {
        name: "Optery",
        pricing: "$9/mo - $25/mo",
        approach:
          "4-stage pipeline (Pending > Submitted > Acknowledged > Removed). Screenshots of exposed data. Non-Compliant flag for slow brokers.",
        strengths: "Most transparent, screenshot proof, free tier",
        weaknesses: "Two confusing graphs, complex UI",
      },
      {
        name: "Kanary",
        pricing: "$8/mo (annual)",
        approach:
          "5 statuses including Action Required and Blocked. Per-broker ETAs. User involvement via Copilot feature.",
        strengths:
          "Most granular transparency, high removal rates for engaged users",
        weaknesses: "Requires user action, complex for passive users",
      },
    ],
    ourDifferentiators: [
      "2,100+ brokers (vs 180-500 for competitors)",
      "Family plan up to 5 profiles",
      "AI-powered agent system with 24 autonomous agents",
      "Real-time dashboard (not quarterly reports)",
    ],
    currentWeaknesses: [
      "Dashboard previously showed 8 internal statuses — competitors use 2-3 (now fixed to 3)",
      "No per-broker ETAs shown — Incogni and Kanary show these (now added)",
      "Progress bar framing could be more positive",
      "No broker compliance/non-compliance indicators yet",
    ],
    strategicGuidance:
      "Our UX should match Incogni's simplicity (3 categories, zero user action required) while leveraging our scale advantage (2100+ brokers, family plans). Hide pipeline complexity. Show ETAs. Frame progress positively.",
  },
};

/**
 * Format the business context as a prompt section.
 * Capped at essential information to stay within token budgets.
 */
export function getBusinessContextPrompt(): string {
  const ctx = BUSINESS_CONTEXT;
  const ci = ctx.competitiveIntelligence;

  return `## Business Context: GhostMyData
Mission: ${ctx.mission}

Value Props: ${ctx.valuePropositions.join("; ")}

Plans: ${ctx.userSegments.map((s) => `${s.name} (${s.price}): ${s.features}`).join(" | ")}

Key Challenges: ${ctx.painPoints.join("; ")}

Our Advantages: ${ctx.uniqueAdvantages.join("; ")}

## Competitive Intelligence
${ci.keyCompetitors.map((c) => `${c.name} (${c.pricing}): ${c.approach} | Strengths: ${c.strengths} | Weaknesses: ${c.weaknesses}`).join("\n")}

Our Differentiators: ${ci.ourDifferentiators.join("; ")}
Current Weaknesses: ${ci.currentWeaknesses.join("; ")}
Strategic Guidance: ${ci.strategicGuidance}`;
}
