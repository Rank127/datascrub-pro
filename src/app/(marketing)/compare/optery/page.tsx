import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Shield, DollarSign, Zap, Database } from "lucide-react";
import { FAQSchema, BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "GhostMyData vs Optery: Complete Comparison (2026)",
  description:
    "Compare GhostMyData vs Optery data removal services. See pricing, features, data broker coverage, and which service offers better privacy protection.",
  keywords: [
    "ghostmydata vs optery",
    "optery alternative",
    "optery comparison",
    "best data removal service",
    "optery review",
    "data broker removal comparison",
    "optery pricing",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/compare/optery",
  },
  openGraph: {
    title: "GhostMyData vs Optery - Data Removal Comparison",
    description:
      "Detailed comparison of GhostMyData and Optery. Find out which privacy service is right for you.",
    url: "https://ghostmydata.com/compare/optery",
    type: "article",
    images: [
      {
        url: "https://ghostmydata.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "GhostMyData vs Optery Comparison",
      },
    ],
  },
};

const faqs = [
  {
    question: "Is GhostMyData better than Optery?",
    answer: "GhostMyData covers 2,100+ sites vs 370-635 for Optery. It also has dark web and breach alerts. Optery is cheaper but has fewer features.",
  },
  {
    question: "How much does Optery cost?",
    answer: "Optery starts at $39/year ($3.25/mo). Their top plan is $249/year. GhostMyData has a free tier. Pro costs $11.99/mo with more features.",
  },
  {
    question: "Does Optery have dark web monitoring?",
    answer: "No. Optery has no dark web alerts at any price. GhostMyData does in its Enterprise plan.",
  },
  {
    question: "Which covers more data brokers?",
    answer: "GhostMyData covers 2,100+ sites plus 60 AI Shield sources. Optery covers 370-635 sites based on plan.",
  },
  {
    question: "Does Optery have a free tier?",
    answer: "Optery has a limited free tier with self-service guides. GhostMyData's free tier has a full scan of 2,100+ sites.",
  },
];

const comparisonData = [
  {
    feature: "Starting Price",
    ghostmydata: "Free (paid from $11.99/mo)",
    optery: "$3.25/mo (annual billing)",
    winner: "optery",
  },
  {
    feature: "Free Tier",
    ghostmydata: "Yes - full scan + guides",
    optery: "Limited self-service",
    winner: "ghostmydata",
  },
  {
    feature: "Data Brokers Covered",
    ghostmydata: "2,100+ (plus 60 AI Shield sources)",
    optery: "370-635 (varies by plan)",
    winner: "ghostmydata",
  },
  {
    feature: "Dark Web Monitoring",
    ghostmydata: "Yes (Enterprise)",
    optery: "No",
    winner: "ghostmydata",
  },
  {
    feature: "Breach Monitoring",
    ghostmydata: "Yes (all plans)",
    optery: "No",
    winner: "ghostmydata",
  },
  {
    feature: "Family Plans",
    ghostmydata: "Yes (5 profiles)",
    optery: "Business plans only",
    winner: "ghostmydata",
  },
  {
    feature: "Do Not Call Registration",
    ghostmydata: "Yes (Enterprise)",
    optery: "No",
    winner: "ghostmydata",
  },
  {
    feature: "Custom Removal Requests",
    ghostmydata: "Yes (Enterprise)",
    optery: "Yes (Ultimate tier)",
    winner: "tie",
  },
  {
    feature: "Dashboard Quality",
    ghostmydata: "Real-time with detailed tracking",
    optery: "Before/after screenshots",
    winner: "tie",
  },
  {
    feature: "Money-Back Guarantee",
    ghostmydata: "30 days",
    optery: "30 days",
    winner: "tie",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://ghostmydata.com" },
  { name: "Compare", url: "https://ghostmydata.com/compare" },
  { name: "GhostMyData vs Optery", url: "https://ghostmydata.com/compare/optery" },
];

export default function CompareOpteryPage() {
  return (
    <>
    <BreadcrumbSchema items={breadcrumbs} />
    <FAQSchema faqs={faqs} />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          GhostMyData vs Optery
        </h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
          Compare two data removal services to find the best protection
          for your personal information.
        </p>
      </div>

      {/* Quick Verdict */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 mb-16">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="h-6 w-6 text-emerald-500" />
          Quick Verdict
        </h2>
        <p className="text-slate-300 text-lg mb-4">
          <strong className="text-white">GhostMyData</strong> has dark web alerts and 3x more coverage.
          <strong className="text-white"> Optery</strong> is cheaper but has fewer features.
        </p>
        <p className="text-slate-400">
          Pick GhostMyData for full protection. Pick Optery if you want the cheapest option.
        </p>
      </div>

      {/* Key Differences */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-4">
            <Database className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">More Coverage</h3>
          <p className="text-slate-400">
            GhostMyData covers 2,100+ sites plus 60 AI Shield sources.
            Optery covers 370-635 sites based on plan.
          </p>
        </div>

        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-4">
            <Shield className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">More Security</h3>
          <p className="text-slate-400">
            GhostMyData has dark web and breach alerts.
            Optery only does data broker removal.
          </p>
        </div>

        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-4">
            <DollarSign className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Better Free Tier</h3>
          <p className="text-slate-400">
            GhostMyData&apos;s free tier has a full scan.
            Optery&apos;s free tier only has self-service guides.
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          Feature Comparison
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-4 px-4 text-slate-400 font-medium">Feature</th>
                <th className="text-center py-4 px-4 text-emerald-400 font-semibold">GhostMyData</th>
                <th className="text-center py-4 px-4 text-slate-300 font-semibold">Optery</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row) => (
                <tr key={row.feature} className="border-b border-slate-800">
                  <td className="py-4 px-4 text-slate-300">{row.feature}</td>
                  <td className={`py-4 px-4 text-center ${row.winner === "ghostmydata" ? "text-emerald-400" : "text-slate-400"}`}>
                    <div className="flex items-center justify-center gap-2">
                      {row.winner === "ghostmydata" && <CheckCircle className="h-4 w-4" />}
                      {row.ghostmydata}
                    </div>
                  </td>
                  <td className={`py-4 px-4 text-center ${row.winner === "optery" ? "text-blue-400" : "text-slate-400"}`}>
                    <div className="flex items-center justify-center gap-2">
                      {row.winner === "optery" && <CheckCircle className="h-4 w-4" />}
                      {row.optery}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing Comparison */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Pricing Breakdown</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* GhostMyData */}
          <div className="p-8 bg-emerald-500/10 rounded-2xl border-2 border-emerald-500">
            <h3 className="text-2xl font-bold text-white mb-4">GhostMyData</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-emerald-500/20">
                <span className="text-slate-300">Free Plan</span>
                <span className="text-white font-semibold">$0</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-emerald-500/20">
                <span className="text-slate-300">Pro Plan</span>
                <span className="text-white font-semibold">$11.99/mo</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-300">Enterprise (dark web)</span>
                <span className="text-white font-semibold">$29.99/mo</span>
              </div>
            </div>
            <p className="text-emerald-400 text-sm mt-4">
              Includes: Dark web monitoring, breach alerts, 2,100+ data brokers, 60 AI Shield sources
            </p>
          </div>

          {/* Optery */}
          <div className="p-8 bg-slate-800/50 rounded-2xl border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-4">Optery</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-300">Free Basic</span>
                <span className="text-white font-semibold">$0 (limited)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-300">Core (370 sites)</span>
                <span className="text-white font-semibold">$3.25/mo (annual)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-300">Extended (540 sites)</span>
                <span className="text-white font-semibold">$12.42/mo (annual)</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-300">Ultimate (635 sites)</span>
                <span className="text-white font-semibold">$20.75/mo (annual)</span>
              </div>
            </div>
            <p className="text-slate-500 text-sm mt-4">
              Data broker removal only - no dark web or breach monitoring
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose GhostMyData */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          Why Choose GhostMyData Over Optery
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            "Dark web monitoring included",
            "Breach notification alerts",
            "3x more data broker coverage (2,100+ vs 635)",
            "AI Shield with 60 additional sources",
            "Family plans for 5 profiles",
            "Do Not Call Registry integration",
            "Custom removal requests (Enterprise)",
            "More comprehensive free tier",
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              <span className="text-slate-300">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* When to Choose Optery */}
      <div className="mb-16 p-8 bg-slate-800/30 rounded-2xl border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4">When to Choose Optery</h2>
        <p className="text-slate-400 mb-4">
          Optery might be right if:
        </p>
        <ul className="space-y-2 text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-slate-500">-</span>
            Budget is key and $39/year is your limit
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-500">-</span>
            You only need basic broker removal
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-500">-</span>
            You like their screenshot proof system
          </li>
        </ul>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="p-6 bg-slate-800/50 rounded-xl border border-slate-700"
            >
              <h3 className="text-lg font-semibold text-white mb-2">
                {faq.question}
              </h3>
              <p className="text-slate-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center p-8 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl border border-emerald-500/20">
        <h2 className="text-3xl font-bold text-white mb-4">
          See What GhostMyData Can Do For You
        </h2>
        <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
          Start with a free scan - no credit card required. See exactly where
          your personal data is exposed before you decide.
        </p>
        <Link href="/register">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8">
            Start Your Free Scan
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
    </>
  );
}
