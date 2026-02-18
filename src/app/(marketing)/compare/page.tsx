import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, CheckCircle, Search, Clock, BarChart3, HeadphonesIcon } from "lucide-react";
import { comparePage } from "@/content/pages";

export const metadata: Metadata = {
  title: comparePage.meta.title,
  description: comparePage.meta.description,
  keywords: comparePage.meta.keywords,
  alternates: {
    canonical: "https://ghostmydata.com/compare",
  },
  openGraph: {
    title: comparePage.meta.title,
    description: comparePage.meta.description,
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
      "2,100+ vs 40+ data brokers",
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
  // Get content sections
  const heroSection = comparePage.sections.find(s => s.id === "hero");
  const whyCompareSection = comparePage.sections.find(s => s.id === "why-compare");
  const whatToLookForSection = comparePage.sections.find(s => s.id === "what-to-look-for");
  const advantageSection = comparePage.sections.find(s => s.id === "ghostmydata-advantage");
  const _comparisonFactorsSection = comparePage.sections.find(s => s.id === "comparison-factors");
  const faqSection = comparePage.sections.find(s => s.id === "faq");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {heroSection?.title || "Compare Data Removal Services"}
        </h1>
        <div className="text-lg text-slate-300 max-w-3xl mx-auto space-y-4">
          {heroSection?.content.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>

      {/* Why Compare Section */}
      {whyCompareSection && (
        <div className="mb-16 p-8 bg-slate-800/30 rounded-2xl border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">{whyCompareSection.title}</h2>
          <div className="text-slate-300 space-y-4">
            {whyCompareSection.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      )}

      {/* What to Look For Section */}
      {whatToLookForSection && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">{whatToLookForSection.title}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <Search className="h-8 w-8 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Coverage</h3>
              <p className="text-slate-400">How many sites do they check? More is better. Look for 200+ sites.</p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <Clock className="h-8 w-8 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Speed</h3>
              <p className="text-slate-400">Auto systems work faster. They don&apos;t miss sites. They follow up on time.</p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <BarChart3 className="h-8 w-8 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Monitoring</h3>
              <p className="text-slate-400">Daily checks catch new data fast. Weekly checks let data spread.</p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <HeadphonesIcon className="h-8 w-8 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Support</h3>
              <p className="text-slate-400">Can you reach them? Good support matters. Look for email, chat, or phone.</p>
            </div>
          </div>
        </div>
      )}

      {/* Master Comparison Table */}
      <div className="mb-16 overflow-x-auto">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Data Removal Service Comparison 2026</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="px-4 py-3 text-left text-slate-300 font-semibold">Feature</th>
              <th className="px-4 py-3 text-left text-emerald-400 font-semibold">GhostMyData</th>
              <th className="px-4 py-3 text-left text-slate-300 font-semibold">DeleteMe</th>
              <th className="px-4 py-3 text-left text-slate-300 font-semibold">Incogni</th>
              <th className="px-4 py-3 text-left text-slate-300 font-semibold">Optery</th>
              <th className="px-4 py-3 text-left text-slate-300 font-semibold">Kanary</th>
              <th className="px-4 py-3 text-left text-slate-300 font-semibold">Privacy Bee</th>
            </tr>
          </thead>
          <tbody className="text-slate-400">
            <tr className="border-b border-slate-800">
              <td className="px-4 py-3 font-medium text-slate-300">Broker Coverage</td>
              <td className="px-4 py-3 text-emerald-400 font-semibold">2,100+</td>
              <td className="px-4 py-3">750+</td>
              <td className="px-4 py-3">180+</td>
              <td className="px-4 py-3">600+</td>
              <td className="px-4 py-3">350+</td>
              <td className="px-4 py-3">1,100+</td>
            </tr>
            <tr className="border-b border-slate-800">
              <td className="px-4 py-3 font-medium text-slate-300">Monthly Price</td>
              <td className="px-4 py-3 text-emerald-400 font-semibold">$9.99/mo</td>
              <td className="px-4 py-3">$10.75/mo</td>
              <td className="px-4 py-3">$7.49/mo</td>
              <td className="px-4 py-3">$9.99/mo</td>
              <td className="px-4 py-3">$8.00/mo</td>
              <td className="px-4 py-3">$15.00/mo</td>
            </tr>
            <tr className="border-b border-slate-800">
              <td className="px-4 py-3 font-medium text-slate-300">Annual Price</td>
              <td className="px-4 py-3 text-emerald-400 font-semibold">$119.88/yr</td>
              <td className="px-4 py-3">$129.00/yr</td>
              <td className="px-4 py-3">$89.88/yr</td>
              <td className="px-4 py-3">$119.88/yr</td>
              <td className="px-4 py-3">$96.00/yr</td>
              <td className="px-4 py-3">$180.00/yr</td>
            </tr>
            <tr className="border-b border-slate-800">
              <td className="px-4 py-3 font-medium text-slate-300">Free Tier</td>
              <td className="px-4 py-3 text-emerald-400 font-semibold">Yes (3 removals/mo)</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3">Scan only</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3">No</td>
            </tr>
            <tr className="border-b border-slate-800">
              <td className="px-4 py-3 font-medium text-slate-300">Dark Web Monitoring</td>
              <td className="px-4 py-3 text-emerald-400 font-semibold">Yes</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3">No</td>
            </tr>
            <tr className="border-b border-slate-800">
              <td className="px-4 py-3 font-medium text-slate-300">Family Plan</td>
              <td className="px-4 py-3 text-emerald-400 font-semibold">Up to 5 profiles</td>
              <td className="px-4 py-3">2 profiles</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3">4 profiles</td>
              <td className="px-4 py-3">5 profiles</td>
              <td className="px-4 py-3">No</td>
            </tr>
            <tr className="border-b border-slate-800">
              <td className="px-4 py-3 font-medium text-slate-300">AI Shield</td>
              <td className="px-4 py-3 text-emerald-400 font-semibold">60+ sources</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3">No</td>
            </tr>
            <tr className="border-b border-slate-800">
              <td className="px-4 py-3 font-medium text-slate-300">Automated Removal</td>
              <td className="px-4 py-3 text-emerald-400 font-semibold">24 AI agents</td>
              <td className="px-4 py-3">Manual team</td>
              <td className="px-4 py-3">Automated</td>
              <td className="px-4 py-3">Automated</td>
              <td className="px-4 py-3">Automated</td>
              <td className="px-4 py-3">Automated</td>
            </tr>
            <tr className="border-b border-slate-800">
              <td className="px-4 py-3 font-medium text-slate-300">Monitoring Frequency</td>
              <td className="px-4 py-3 text-emerald-400 font-semibold">Daily</td>
              <td className="px-4 py-3">Quarterly</td>
              <td className="px-4 py-3">Weekly</td>
              <td className="px-4 py-3">Monthly</td>
              <td className="px-4 py-3">Weekly</td>
              <td className="px-4 py-3">Monthly</td>
            </tr>
            <tr className="border-b border-slate-800">
              <td className="px-4 py-3 font-medium text-slate-300">Custom Requests</td>
              <td className="px-4 py-3 text-emerald-400 font-semibold">Yes</td>
              <td className="px-4 py-3">Limited</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3">Yes (paid)</td>
              <td className="px-4 py-3">No</td>
              <td className="px-4 py-3">Yes</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Competitor Comparisons Grid */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Compare GhostMyData with Top Services</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {comparisons.map((comp) => (
            <Link
              key={comp.slug}
              href={`/compare/${comp.slug}`}
              className="group p-8 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-emerald-500" />
                <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                  GhostMyData vs {comp.competitor}
                </h3>
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
      </div>

      {/* GhostMyData Advantage Section */}
      {advantageSection && (
        <div className="mb-16 p-8 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
          <h2 className="text-2xl font-bold text-white mb-6">{advantageSection.title}</h2>
          <div className="text-slate-300 space-y-4">
            {advantageSection.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {faqSection && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">{faqSection.title}</h2>
          <div className="space-y-4">
            {faqSection.content.split("\n\n").map((item, i) => {
              const lines = item.split("\n");
              const question = lines[0]?.replace(/^\*\*/, "").replace(/\*\*$/, "");
              const answer = lines.slice(1).join(" ");
              if (!question || !answer) return null;
              return (
                <div key={i} className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-2">{question}</h3>
                  <p className="text-slate-400">{answer}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="text-center p-8 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
        <h2 className="text-2xl font-bold text-white mb-4">
          Try GhostMyData Free
        </h2>
        <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
          No card needed. See where your data is exposed before you pay.
          Join thousands who control their data now.
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
