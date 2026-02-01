import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Shield, DollarSign, Zap, Users } from "lucide-react";
import { FAQSchema, BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "GhostMyData vs Incogni Comparison (2026)",
  description:
    "Compare GhostMyData vs Incogni data removal services. See pricing, features, coverage, and which offers better privacy protection.",
  keywords: [
    "ghostmydata vs incogni",
    "incogni alternative",
    "incogni comparison",
    "best data removal service",
    "surfshark incogni vs ghostmydata",
    "incogni review",
    "data broker removal comparison",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/compare/incogni",
  },
  openGraph: {
    title: "GhostMyData vs Incogni - Data Removal Comparison",
    description:
      "Detailed comparison of GhostMyData and Incogni. Find out which privacy service is right for you.",
    url: "https://ghostmydata.com/compare/incogni",
    type: "article",
    images: [
      {
        url: "https://ghostmydata.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "GhostMyData vs Incogni Comparison",
      },
    ],
  },
};

const faqs = [
  {
    question: "Is GhostMyData better than Incogni?",
    answer: "GhostMyData has more features. It has dark web alerts, breach alerts, and covers 2,100+ sites vs 35+ for Incogni. Incogni is cheaper but has fewer features.",
  },
  {
    question: "How much does Incogni cost?",
    answer: "Incogni costs $6.49/month yearly or $12.99/month. GhostMyData has a free tier. Paid plans start at $11.99/month with more features.",
  },
  {
    question: "Does Incogni have dark web monitoring?",
    answer: "No. Incogni only does data broker removal. GhostMyData has dark web alerts in its Enterprise plan.",
  },
  {
    question: "Can I try these for free?",
    answer: "GhostMyData has a free tier with a full scan. Incogni has no free tier but offers a 30-day refund.",
  },
  {
    question: "Which covers more data brokers?",
    answer: "GhostMyData covers 2,100+ sites plus 60 AI Shield sources. Incogni covers about 35+ sites.",
  },
];

const comparisonData = [
  {
    feature: "Starting Price",
    ghostmydata: "Free (paid from $11.99/mo)",
    incogni: "$6.49/mo (annual) or $12.99/mo",
    winner: "ghostmydata",
  },
  {
    feature: "Free Tier",
    ghostmydata: "Yes",
    incogni: "No",
    winner: "ghostmydata",
  },
  {
    feature: "Data Brokers Covered",
    ghostmydata: "2,100+ (plus 60 AI Shield sources)",
    incogni: "35+",
    winner: "ghostmydata",
  },
  {
    feature: "Dark Web Monitoring",
    ghostmydata: "Yes",
    incogni: "No",
    winner: "ghostmydata",
  },
  {
    feature: "Breach Monitoring",
    ghostmydata: "Yes",
    incogni: "No",
    winner: "ghostmydata",
  },
  {
    feature: "Family Plans",
    ghostmydata: "Yes (5 profiles)",
    incogni: "No",
    winner: "ghostmydata",
  },
  {
    feature: "Do Not Call Registration",
    ghostmydata: "Yes (Enterprise)",
    incogni: "No",
    winner: "ghostmydata",
  },
  {
    feature: "VPN Bundle",
    ghostmydata: "No",
    incogni: "Yes (Surfshark)",
    winner: "incogni",
  },
  {
    feature: "Dashboard Quality",
    ghostmydata: "Detailed real-time",
    incogni: "Basic progress view",
    winner: "ghostmydata",
  },
  {
    feature: "Parent Company",
    ghostmydata: "Independent",
    incogni: "Surfshark (Nord Security)",
    winner: "tie",
  },
  {
    feature: "Money-Back Guarantee",
    ghostmydata: "30 days",
    incogni: "30 days",
    winner: "tie",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://ghostmydata.com" },
  { name: "Compare", url: "https://ghostmydata.com/compare" },
  { name: "GhostMyData vs Incogni", url: "https://ghostmydata.com/compare/incogni" },
];

export default function CompareIncogniPage() {
  return (
    <>
    <BreadcrumbSchema items={breadcrumbs} />
    <FAQSchema faqs={faqs} />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          GhostMyData vs Incogni
        </h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
          Compare two popular data removal services to find the best protection
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
          <strong className="text-white">GhostMyData</strong> has more features.
          It has dark web alerts and covers more sites.
          <strong className="text-white"> Incogni</strong> is a budget option for Surfshark users.
        </p>
        <p className="text-slate-400">
          Pick GhostMyData for full protection. Pick Incogni for the cheapest price.
        </p>
      </div>

      {/* Key Differences */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-4">
            <Shield className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">More Protection</h3>
          <p className="text-slate-400">
            GhostMyData has dark web and breach alerts.
            Incogni only removes data from brokers.
          </p>
        </div>

        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-4">
            <DollarSign className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Free Tier</h3>
          <p className="text-slate-400">
            GhostMyData lets you scan for free first.
            Incogni needs payment to see results.
          </p>
        </div>

        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-4">
            <Users className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Family Plans</h3>
          <p className="text-slate-400">
            GhostMyData has family plans for up to 5 people.
            Incogni is only for one person.
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
                <th className="text-center py-4 px-4 text-slate-300 font-semibold">Incogni</th>
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
                  <td className={`py-4 px-4 text-center ${row.winner === "incogni" ? "text-blue-400" : "text-slate-400"}`}>
                    <div className="flex items-center justify-center gap-2">
                      {row.winner === "incogni" && <CheckCircle className="h-4 w-4" />}
                      {row.incogni}
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

          {/* Incogni */}
          <div className="p-8 bg-slate-800/50 rounded-2xl border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-4">Incogni</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-300">Free Plan</span>
                <span className="text-slate-500">Not available</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-300">Monthly</span>
                <span className="text-white font-semibold">$12.99/mo</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-300">Annual</span>
                <span className="text-white font-semibold">$6.49/mo</span>
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
          Why Choose GhostMyData Over Incogni
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            "Dark web monitoring included",
            "Breach notification alerts",
            "Free tier to try first",
            "More data brokers covered (2,100+ vs 35+)",
            "Family plans available",
            "More detailed reporting dashboard",
            "Independent company (not bundled)",
            "Faster average removal times",
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              <span className="text-slate-300">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* When to Choose Incogni */}
      <div className="mb-16 p-8 bg-slate-800/30 rounded-2xl border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4">When to Choose Incogni</h2>
        <p className="text-slate-400 mb-4">
          Incogni might be right if:
        </p>
        <ul className="space-y-2 text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-slate-500">•</span>
            You use Surfshark VPN and want a bundle
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-500">•</span>
            Budget is key and you can pay yearly ($6.49/mo)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-500">•</span>
            You only need basic broker removal
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
