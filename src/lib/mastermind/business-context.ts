/**
 * Mastermind Advisory System - GhostMyData Business Context
 *
 * Static data about the business that grounds AI advice in reality.
 * Updated periodically as the business evolves.
 */

export interface BusinessContext {
  mission: string;
  valuePropositions: string[];
  userSegments: { name: string; price: string; features: string }[];
  competitors: { name: string; positioning: string }[];
  painPoints: string[];
  uniqueAdvantages: string[];
  currentMetrics?: Record<string, string | number>;
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
      price: "$11.99/mo",
      features:
        "Full automated removal, weekly monitoring, CCPA/GDPR requests, priority support, dark web monitoring.",
    },
    {
      name: "Enterprise",
      price: "$49.99/mo",
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
    "Competitive pricing ($11.99/mo vs $10-25/mo industry average)",
  ],
};

/**
 * Format the business context as a prompt section.
 * Capped at essential information to stay within token budgets.
 */
export function getBusinessContextPrompt(): string {
  const ctx = BUSINESS_CONTEXT;
  return `## Business Context: GhostMyData
Mission: ${ctx.mission}

Value Props: ${ctx.valuePropositions.join("; ")}

Plans: ${ctx.userSegments.map((s) => `${s.name} (${s.price}): ${s.features}`).join(" | ")}

Competitors: ${ctx.competitors.map((c) => `${c.name} — ${c.positioning}`).join("; ")}

Key Challenges: ${ctx.painPoints.join("; ")}

Our Advantages: ${ctx.uniqueAdvantages.join("; ")}`;
}
