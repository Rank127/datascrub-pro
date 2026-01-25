import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Compare Data Removal Services - GhostMyData vs Competitors",
  description:
    "Compare GhostMyData with other data removal services like DeleteMe, Incogni, Optery, and more. Find the best privacy protection service for your needs.",
  keywords: [
    "data removal service comparison",
    "best data removal service",
    "deleteme alternative",
    "incogni alternative",
    "optery alternative",
    "kanary alternative",
    "privacy bee alternative",
    "privacy service comparison",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/compare",
  },
  openGraph: {
    title: "Compare Data Removal Services - GhostMyData vs Competitors",
    description:
      "Compare GhostMyData with DeleteMe, Incogni, Optery, Kanary, and Privacy Bee. Find the best data removal service for your needs.",
    url: "https://ghostmydata.com/compare",
    type: "website",
    images: [
      {
        url: "https://ghostmydata.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "GhostMyData Data Removal Service Comparison",
      },
    ],
  },
};

const comparisons = [
  {
    competitor: "DeleteMe",
    slug: "deleteme",
    description: "Established data removal service since 2011",
    advantages: [
      "GhostMyData has a free tier",
      "Dark web monitoring included",
      "Monthly billing option",
      "2,000+ vs 40+ data brokers",
    ],
  },
  {
    competitor: "Incogni",
    slug: "incogni",
    description: "Budget option from Surfshark",
    advantages: [
      "More comprehensive protection",
      "Family plans available",
      "Free tier to try first",
      "Breach monitoring included",
    ],
  },
  {
    competitor: "Optery",
    slug: "optery",
    description: "Budget-focused with free tier",
    advantages: [
      "3x more data broker coverage",
      "Dark web monitoring included",
      "AI Shield with 60 sources",
      "Better free tier features",
    ],
  },
  {
    competitor: "Kanary",
    slug: "kanary",
    description: "Mobile app focused service",
    advantages: [
      "6x more data broker coverage",
      "Dark web monitoring included",
      "Lower monthly pricing",
      "Breach alerts on all plans",
    ],
  },
  {
    competitor: "Privacy Bee",
    slug: "privacy-bee",
    description: "Enterprise-focused with SOC 2 certification",
    advantages: [
      "Nearly 2x broker coverage",
      "Free tier available",
      "More affordable Enterprise",
      "AI Shield with 60 sources",
    ],
  },
];

export default function ComparePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Compare Data Removal Services
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          See how GhostMyData stacks up against other privacy protection services.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {comparisons.map((comp) => (
          <Link
            key={comp.slug}
            href={`/compare/${comp.slug}`}
            className="group p-8 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-emerald-500" />
              <h2 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                GhostMyData vs {comp.competitor}
              </h2>
            </div>
            <p className="text-slate-400 mb-6">{comp.description}</p>
            <div className="space-y-2 mb-6">
              {comp.advantages.map((adv) => (
                <div key={adv} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  {adv}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-emerald-400 group-hover:text-emerald-300">
              Read full comparison
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center p-8 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
        <h2 className="text-2xl font-bold text-white mb-4">
          Try GhostMyData Free
        </h2>
        <p className="text-slate-400 mb-6">
          No credit card required. See where your data is exposed before committing.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
        >
          Start Your Free Scan
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
