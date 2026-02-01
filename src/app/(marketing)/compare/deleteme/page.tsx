import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, ArrowRight, Shield, DollarSign, Clock, Zap } from "lucide-react";
import { FAQSchema, BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "GhostMyData vs DeleteMe: Full Comparison (2026)",
  description:
    "Compare GhostMyData vs DeleteMe: pricing, features, coverage, and success rates. Find the best data removal service.",
  keywords: [
    "ghostmydata vs deleteme",
    "deleteme alternative",
    "deleteme comparison",
    "best data removal service",
    "data broker removal comparison",
    "deleteme review",
    "privacy service comparison",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/compare/deleteme",
  },
  openGraph: {
    title: "GhostMyData vs DeleteMe - Data Removal Service Comparison",
    description:
      "Side-by-side comparison of GhostMyData and DeleteMe. Find out which data removal service offers better value.",
    url: "https://ghostmydata.com/compare/deleteme",
    type: "article",
    images: [
      {
        url: "https://ghostmydata.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "GhostMyData vs DeleteMe Comparison",
      },
    ],
  },
};

const faqs = [
  {
    question: "Is GhostMyData better than DeleteMe?",
    answer: "GhostMyData has more features for a similar price. It offers dark web monitoring, a free tier, and monthly billing. DeleteMe has been around since 2011 but lacks dark web alerts.",
  },
  {
    question: "How much does DeleteMe cost?",
    answer: "DeleteMe costs $129/year with no monthly option. GhostMyData has a free tier and paid plans from $11.99/month.",
  },
  {
    question: "Which service covers more data brokers?",
    answer: "GhostMyData covers 2,100+ sites plus 60 AI Shield sources. DeleteMe covers about 40+ sites. GhostMyData has wider coverage.",
  },
  {
    question: "Does DeleteMe have dark web monitoring?",
    answer: "No. DeleteMe does not watch the dark web. GhostMyData does in its Enterprise plan.",
  },
  {
    question: "Can I try these for free?",
    answer: "GhostMyData has a free tier with a full scan and guides. DeleteMe has no free tier but offers a 30-day refund.",
  },
];

const comparisonData = [
  {
    feature: "Starting Price",
    ghostmydata: "Free (paid from $11.99/mo)",
    deleteme: "$10.75/mo (billed annually)",
    winner: "ghostmydata",
  },
  {
    feature: "Free Tier",
    ghostmydata: "Yes - includes scan + manual guides",
    deleteme: "No",
    winner: "ghostmydata",
  },
  {
    feature: "Monthly Billing Option",
    ghostmydata: "Yes",
    deleteme: "No (annual only)",
    winner: "ghostmydata",
  },
  {
    feature: "Data Brokers Covered",
    ghostmydata: "2,100+ (plus 60 AI Shield sources)",
    deleteme: "40+",
    winner: "ghostmydata",
  },
  {
    feature: "Dark Web Monitoring",
    ghostmydata: "Yes (Enterprise plan)",
    deleteme: "No",
    winner: "ghostmydata",
  },
  {
    feature: "Breach Monitoring",
    ghostmydata: "Yes (all plans)",
    deleteme: "Limited",
    winner: "ghostmydata",
  },
  {
    feature: "Family Plans",
    ghostmydata: "Yes (up to 5 profiles)",
    deleteme: "Yes (2 people)",
    winner: "ghostmydata",
  },
  {
    feature: "Do Not Call Registration",
    ghostmydata: "Yes (Enterprise)",
    deleteme: "No",
    winner: "ghostmydata",
  },
  {
    feature: "Removal Time",
    ghostmydata: "1-7 days average",
    deleteme: "7-14 days average",
    winner: "ghostmydata",
  },
  {
    feature: "Privacy Reports",
    ghostmydata: "Real-time dashboard",
    deleteme: "Quarterly reports",
    winner: "ghostmydata",
  },
  {
    feature: "Company Founded",
    ghostmydata: "2024",
    deleteme: "2011",
    winner: "deleteme",
  },
  {
    feature: "Money-Back Guarantee",
    ghostmydata: "30 days",
    deleteme: "30 days",
    winner: "tie",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://ghostmydata.com" },
  { name: "Compare", url: "https://ghostmydata.com/compare" },
  { name: "GhostMyData vs DeleteMe", url: "https://ghostmydata.com/compare/deleteme" },
];

export default function CompareDeleteMePage() {
  return (
    <>
    <BreadcrumbSchema items={breadcrumbs} />
    <FAQSchema faqs={faqs} />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          GhostMyData vs DeleteMe
        </h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
          A detailed comparison to help you choose the best data removal service
          for your privacy needs.
        </p>
      </div>

      {/* Quick Verdict */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 mb-16">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="h-6 w-6 text-emerald-500" />
          Quick Verdict
        </h2>
        <p className="text-slate-300 text-lg mb-4">
          <strong className="text-white">GhostMyData</strong> has more features for less money.
          It includes dark web alerts and a free tier.
          <strong className="text-white"> DeleteMe</strong> has been around longer but lacks dark web monitoring.
        </p>
        <p className="text-slate-400">
          Pick GhostMyData for better value. Pick DeleteMe if you want a company with a longer history.
        </p>
      </div>

      {/* Key Differences */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-4">
            <DollarSign className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Better Pricing</h3>
          <p className="text-slate-400">
            GhostMyData has a free tier. Paid plans start at $11.99/mo.
            DeleteMe costs $129/year with no monthly option.
          </p>
        </div>

        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-4">
            <Shield className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">More Protection</h3>
          <p className="text-slate-400">
            GhostMyData has dark web alerts and breach alerts.
            DeleteMe only removes data from brokers.
          </p>
        </div>

        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-4">
            <Clock className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Faster Removals</h3>
          <p className="text-slate-400">
            GhostMyData removes data in 1-7 days on average.
            DeleteMe takes 7-14 days.
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          Feature-by-Feature Comparison
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-4 px-4 text-slate-400 font-medium">Feature</th>
                <th className="text-center py-4 px-4 text-emerald-400 font-semibold">GhostMyData</th>
                <th className="text-center py-4 px-4 text-slate-300 font-semibold">DeleteMe</th>
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
                  <td className={`py-4 px-4 text-center ${row.winner === "deleteme" ? "text-blue-400" : "text-slate-400"}`}>
                    <div className="flex items-center justify-center gap-2">
                      {row.winner === "deleteme" && <CheckCircle className="h-4 w-4" />}
                      {row.deleteme}
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
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Pricing Comparison</h2>
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
                <span className="text-slate-300">Pro Plan (monthly)</span>
                <span className="text-white font-semibold">$11.99/mo</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-emerald-500/20">
                <span className="text-slate-300">Pro Plan (annual)</span>
                <span className="text-white font-semibold">$95.88/yr</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-300">Enterprise (with dark web)</span>
                <span className="text-white font-semibold">$29.99/mo</span>
              </div>
            </div>
          </div>

          {/* DeleteMe */}
          <div className="p-8 bg-slate-800/50 rounded-2xl border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-4">DeleteMe</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-300">Free Plan</span>
                <span className="text-slate-500">Not available</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-300">Individual (monthly)</span>
                <span className="text-slate-500">Not available</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-300">Individual (annual)</span>
                <span className="text-white font-semibold">$129/yr</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-300">Family (2 people)</span>
                <span className="text-white font-semibold">$229/yr</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose GhostMyData */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          Why Choose GhostMyData Over DeleteMe
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            "Free tier to try before you buy",
            "Dark web monitoring included",
            "Monthly billing option available",
            "More data brokers covered (2,100+)",
            "Faster removal processing",
            "Real-time dashboard vs quarterly reports",
            "Larger family plans (5 profiles)",
            "Breach monitoring on all plans",
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              <span className="text-slate-300">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* When to Choose DeleteMe */}
      <div className="mb-16 p-8 bg-slate-800/30 rounded-2xl border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4">When to Choose DeleteMe</h2>
        <p className="text-slate-400 mb-4">
          DeleteMe might be right if:
        </p>
        <ul className="space-y-2 text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-slate-500">•</span>
            You want an older, well-known company (since 2011)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-500">•</span>
            You&apos;re okay paying yearly
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-500">•</span>
            You don&apos;t need dark web alerts
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
          Ready to Try GhostMyData?
        </h2>
        <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
          Start with a free scan to see where your data is exposed.
          No credit card required, no commitment.
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
