import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Shield, Database, Zap, DollarSign } from "lucide-react";
import { FAQSchema, BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "GhostMyData vs Privacy Bee: Complete Comparison (2026)",
  description:
    "Compare GhostMyData vs Privacy Bee data removal services. See pricing, data broker coverage, dark web monitoring, and which offers better value.",
  keywords: [
    "ghostmydata vs privacy bee",
    "privacy bee alternative",
    "privacy bee comparison",
    "best data removal service",
    "privacy bee review",
    "data broker removal comparison",
    "privacy bee pricing",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/compare/privacy-bee",
  },
  openGraph: {
    title: "GhostMyData vs Privacy Bee - Data Removal Comparison",
    description:
      "Detailed comparison of GhostMyData and Privacy Bee. Find out which privacy service is right for you.",
    url: "https://ghostmydata.com/compare/privacy-bee",
    type: "article",
    images: [
      {
        url: "https://ghostmydata.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "GhostMyData vs Privacy Bee Comparison",
      },
    ],
  },
};

const faqs = [
  {
    question: "Is GhostMyData better than Privacy Bee?",
    answer: "GhostMyData offers more data broker coverage (2,000+ vs 1,033) at a lower price point with additional AI Shield sources. Privacy Bee includes dark web monitoring in Pro tier while GhostMyData includes it in Enterprise. For overall value, GhostMyData is the better choice.",
  },
  {
    question: "How much does Privacy Bee cost compared to GhostMyData?",
    answer: "Privacy Bee Essentials costs ~$95/year, Pro is $197/year, and Signature is $799/year. GhostMyData offers a free tier, with Pro at $143.88/year and Enterprise at $359.88/year including more broker coverage.",
  },
  {
    question: "Which service covers more data brokers?",
    answer: "GhostMyData covers 2,000+ data brokers plus 60 AI Shield sources. Privacy Bee covers 1,033 data brokers. GhostMyData offers nearly double the coverage.",
  },
  {
    question: "Does Privacy Bee have dark web monitoring?",
    answer: "Yes, Privacy Bee includes dark web monitoring starting at their Pro tier ($197/year). GhostMyData includes dark web monitoring in the Enterprise plan ($359.88/year) but offers more broker coverage overall.",
  },
  {
    question: "Which service offers better value?",
    answer: "GhostMyData offers better value with a free tier, more data broker coverage (2,000+ vs 1,033), and lower starting prices. Privacy Bee charges more for fewer features at the entry level.",
  },
];

const comparisonData = [
  {
    feature: "Starting Price",
    ghostmydata: "Free (paid from $11.99/mo)",
    privacybee: "$8/mo (~$95/yr)",
    winner: "ghostmydata",
  },
  {
    feature: "Free Tier",
    ghostmydata: "Yes - full scan",
    privacybee: "Assessment only",
    winner: "ghostmydata",
  },
  {
    feature: "Data Brokers Covered",
    ghostmydata: "2,000+ (plus 60 AI Shield sources)",
    privacybee: "1,033",
    winner: "ghostmydata",
  },
  {
    feature: "Dark Web Monitoring",
    ghostmydata: "Yes (Enterprise)",
    privacybee: "Yes (Pro+)",
    winner: "tie",
  },
  {
    feature: "Breach Monitoring",
    ghostmydata: "Yes (all plans)",
    privacybee: "Limited",
    winner: "ghostmydata",
  },
  {
    feature: "Family Plans",
    ghostmydata: "5 profiles",
    privacybee: "Multi-user available",
    winner: "tie",
  },
  {
    feature: "Do Not Call Registration",
    ghostmydata: "Yes (Enterprise)",
    privacybee: "No",
    winner: "ghostmydata",
  },
  {
    feature: "Custom Removals",
    ghostmydata: "Yes (Enterprise)",
    privacybee: "Unlimited (Pro+)",
    winner: "tie",
  },
  {
    feature: "SOC 2 Certified",
    ghostmydata: "Compliant",
    privacybee: "Type II",
    winner: "privacybee",
  },
  {
    feature: "Company Location",
    ghostmydata: "US-based",
    privacybee: "US-based",
    winner: "tie",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://ghostmydata.com" },
  { name: "Compare", url: "https://ghostmydata.com/compare" },
  { name: "GhostMyData vs Privacy Bee", url: "https://ghostmydata.com/compare/privacy-bee" },
];

export default function ComparePrivacyBeePage() {
  return (
    <>
    <BreadcrumbSchema items={breadcrumbs} />
    <FAQSchema faqs={faqs} />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          GhostMyData vs Privacy Bee
        </h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
          Compare two comprehensive data removal services to find the best protection
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
          <strong className="text-white">GhostMyData</strong> offers nearly double the data broker coverage
          (2,000+ vs 1,033) at a lower price point with a free tier.
          <strong className="text-white"> Privacy Bee</strong> has SOC 2 Type II certification and white-glove
          service options for premium customers.
        </p>
        <p className="text-slate-400">
          Choose GhostMyData for more coverage and better value. Choose Privacy Bee if you
          prioritize SOC 2 Type II certification or need premium white-glove service.
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
            GhostMyData covers 2,000+ data brokers plus 60 AI Shield sources.
            Privacy Bee covers 1,033 data brokers.
          </p>
        </div>

        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-4">
            <DollarSign className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Better Pricing</h3>
          <p className="text-slate-400">
            GhostMyData offers a free tier and lower entry pricing.
            Privacy Bee starts at ~$95/year with no free option.
          </p>
        </div>

        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-4">
            <Shield className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Compliance</h3>
          <p className="text-slate-400">
            Privacy Bee has SOC 2 Type II certification.
            Both services offer enterprise-grade security.
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
                <th className="text-center py-4 px-4 text-slate-300 font-semibold">Privacy Bee</th>
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
                  <td className={`py-4 px-4 text-center ${row.winner === "privacybee" ? "text-blue-400" : "text-slate-400"}`}>
                    <div className="flex items-center justify-center gap-2">
                      {row.winner === "privacybee" && <CheckCircle className="h-4 w-4" />}
                      {row.privacybee}
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
                <span className="text-white font-semibold">$11.99/mo ($143.88/yr)</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-300">Enterprise (dark web)</span>
                <span className="text-white font-semibold">$29.99/mo ($359.88/yr)</span>
              </div>
            </div>
            <p className="text-emerald-400 text-sm mt-4">
              Includes: 2,000+ data brokers, 60 AI Shield sources, breach alerts
            </p>
          </div>

          {/* Privacy Bee */}
          <div className="p-8 bg-slate-800/50 rounded-2xl border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-4">Privacy Bee</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-300">Free Assessment</span>
                <span className="text-white font-semibold">$0 (limited)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-300">Essentials</span>
                <span className="text-white font-semibold">$8/mo (~$95/yr)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-300">Pro (dark web)</span>
                <span className="text-white font-semibold">$18/mo ($197/yr)</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-300">Signature</span>
                <span className="text-white font-semibold">$67/mo ($799/yr)</span>
              </div>
            </div>
            <p className="text-slate-500 text-sm mt-4">
              1,033 data brokers - dark web monitoring on Pro+
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose GhostMyData */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          Why Choose GhostMyData Over Privacy Bee
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            "Nearly 2x data broker coverage (2,000+ vs 1,033)",
            "60 additional AI Shield sources",
            "Free tier with full scan capability",
            "Lower entry price ($11.99 vs $18 for comparable features)",
            "Do Not Call Registry integration",
            "Breach monitoring on all plans",
            "Family plan with 5 profiles",
            "More affordable Enterprise tier",
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              <span className="text-slate-300">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* When to Choose Privacy Bee */}
      <div className="mb-16 p-8 bg-slate-800/30 rounded-2xl border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4">When to Choose Privacy Bee</h2>
        <p className="text-slate-400 mb-4">
          Privacy Bee might be the better choice if:
        </p>
        <ul className="space-y-2 text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-slate-500">-</span>
            You require SOC 2 Type II certification for compliance reasons
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-500">-</span>
            You need white-glove service with dedicated US-based analysts (Signature tier)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-500">-</span>
            You prefer their 181,000+ custom site database for niche removals
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
