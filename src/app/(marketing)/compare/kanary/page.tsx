import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Shield, Smartphone, Zap, Users } from "lucide-react";
import { FAQSchema, BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "GhostMyData vs Kanary: Complete Comparison (2026)",
  description:
    "Compare GhostMyData vs Kanary data removal services. See pricing, features, data broker coverage, and mobile app capabilities.",
  keywords: [
    "ghostmydata vs kanary",
    "kanary alternative",
    "kanary comparison",
    "best data removal service",
    "kanary review",
    "data broker removal comparison",
    "kanary pricing",
    "kanary mobile app",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/compare/kanary",
  },
  openGraph: {
    title: "GhostMyData vs Kanary - Data Removal Comparison",
    description:
      "Detailed comparison of GhostMyData and Kanary. Find out which privacy service is right for you.",
    url: "https://ghostmydata.com/compare/kanary",
    type: "article",
    images: [
      {
        url: "https://ghostmydata.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "GhostMyData vs Kanary Comparison",
      },
    ],
  },
};

const faqs = [
  {
    question: "Is GhostMyData better than Kanary?",
    answer: "GhostMyData offers more comprehensive protection with 2,100+ data brokers (plus 60 AI Shield sources), dark web monitoring, and breach alerts. Kanary uses a threat-model approach and covers 12,887 unique sites but has a different focus. For overall data broker removal, GhostMyData is the better choice.",
  },
  {
    question: "How much does Kanary cost compared to GhostMyData?",
    answer: "Kanary has a free Community tier, Professional at $9.99/month, and a 50% family member discount. GhostMyData offers a free tier and paid plans starting at $11.99/month (40% OFF) with more features included.",
  },
  {
    question: "Does Kanary have a mobile app?",
    answer: "Yes, Kanary is one of the few data removal services with iOS and Android apps. GhostMyData currently offers a responsive web app with mobile app planned for future release.",
  },
  {
    question: "What makes Kanary different?",
    answer: "Kanary is Y Combinator-backed, uses a threat-model approach, covers Google search results and social media, claims 12,887 unique sites, pledges no AI/LLM data sharing, retains logs for only 1 week, and has an active Discord/Reddit community.",
  },
  {
    question: "Does Kanary have dark web monitoring?",
    answer: "No, Kanary does not offer dark web monitoring. GhostMyData includes dark web monitoring in its Enterprise plan, scanning for your data on dark web marketplaces and forums.",
  },
];

const comparisonData = [
  {
    feature: "Starting Price",
    ghostmydata: "Free (paid from $19.99/mo, 40% OFF)",
    kanary: "Free (Professional $9.99/mo)",
    winner: "ghostmydata",
  },
  {
    feature: "Free Tier",
    ghostmydata: "Yes - full scan",
    kanary: "Community tier (limited)",
    winner: "ghostmydata",
  },
  {
    feature: "Sites Covered",
    ghostmydata: "2,100+ (plus 60 AI Shield sources)",
    kanary: "12,887 unique sites (threat-model)",
    winner: "kanary",
  },
  {
    feature: "Dark Web Monitoring",
    ghostmydata: "Yes (Enterprise)",
    kanary: "No",
    winner: "ghostmydata",
  },
  {
    feature: "Breach Monitoring",
    ghostmydata: "Yes (all plans)",
    kanary: "No",
    winner: "ghostmydata",
  },
  {
    feature: "Mobile App",
    ghostmydata: "Web app (mobile planned)",
    kanary: "iOS & Android",
    winner: "kanary",
  },
  {
    feature: "Family Plans",
    ghostmydata: "5 profiles",
    kanary: "Up to 10 members",
    winner: "kanary",
  },
  {
    feature: "Do Not Call Registration",
    ghostmydata: "Yes (Enterprise)",
    kanary: "No",
    winner: "ghostmydata",
  },
  {
    feature: "Google & Social Media",
    ghostmydata: "No",
    kanary: "Yes (Google results + social)",
    winner: "kanary",
  },
  {
    feature: "AI/LLM Data Sharing",
    ghostmydata: "Never shared with training",
    kanary: "No AI/LLM sharing pledge",
    winner: "tie",
  },
  {
    feature: "Log Retention",
    ghostmydata: "90 days",
    kanary: "1 week",
    winner: "kanary",
  },
  {
    feature: "Community",
    ghostmydata: "Email support",
    kanary: "Discord + Reddit community",
    winner: "kanary",
  },
  {
    feature: "Backed By",
    ghostmydata: "Independent",
    kanary: "Y Combinator",
    winner: "kanary",
  },
  {
    feature: "Family Discount",
    ghostmydata: "Enterprise plan (5 profiles)",
    kanary: "50% off per family member",
    winner: "kanary",
  },
  {
    feature: "Money-Back Guarantee",
    ghostmydata: "30 days",
    kanary: "Free Community tier",
    winner: "tie",
  },
];

const breadcrumbs = [
  { name: "Home", url: "https://ghostmydata.com" },
  { name: "Compare", url: "https://ghostmydata.com/compare" },
  { name: "GhostMyData vs Kanary", url: "https://ghostmydata.com/compare/kanary" },
];

export default function CompareKanaryPage() {
  return (
    <>
    <BreadcrumbSchema items={breadcrumbs} />
    <FAQSchema faqs={faqs} />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          GhostMyData vs Kanary
        </h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
          Compare these two data removal services to find the best protection
          for your personal information.
        </p>
        <p className="text-sm text-slate-500 mb-8">Last updated: February 15, 2026</p>
      </div>

      {/* Quick Verdict */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 mb-16">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="h-6 w-6 text-emerald-500" />
          Quick Verdict
        </h2>
        <p className="text-slate-300 text-lg mb-4">
          <strong className="text-white">GhostMyData</strong> offers more comprehensive protection with
          dark web monitoring, breach alerts, and 6x more data broker coverage.
          <strong className="text-white"> Kanary</strong> has a mobile app advantage but covers fewer
          brokers and lacks advanced security features.
        </p>
        <p className="text-slate-400">
          Choose GhostMyData for complete privacy protection. Choose Kanary if you
          prioritize having a native mobile app over comprehensive coverage.
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
            GhostMyData includes dark web monitoring and breach alerts.
            Kanary only offers data broker removal.
          </p>
        </div>

        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-4">
            <Smartphone className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Mobile Access</h3>
          <p className="text-slate-400">
            Kanary has iOS/Android apps. GhostMyData offers a responsive
            web app with native apps planned.
          </p>
        </div>

        <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-4">
            <Users className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Family Coverage</h3>
          <p className="text-slate-400">
            Kanary supports 10 family members. GhostMyData covers 5 profiles
            with more features per profile.
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
                <th className="text-center py-4 px-4 text-slate-300 font-semibold">Kanary</th>
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
                  <td className={`py-4 px-4 text-center ${row.winner === "kanary" ? "text-blue-400" : "text-slate-400"}`}>
                    <div className="flex items-center justify-center gap-2">
                      {row.winner === "kanary" && <CheckCircle className="h-4 w-4" />}
                      {row.kanary}
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
                <span><span className="line-through text-slate-500 mr-1">$19.99</span><span className="text-white font-semibold">$11.99/mo</span></span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-300">Enterprise (dark web)</span>
                <span><span className="line-through text-slate-500 mr-1">$49.99</span><span className="text-white font-semibold">$29.99/mo</span></span>
              </div>
            </div>
            <p className="text-emerald-400 text-sm mt-4">
              Includes: Dark web monitoring, breach alerts, 2,100+ data brokers, 60 AI Shield sources
            </p>
          </div>

          {/* Kanary */}
          <div className="p-8 bg-slate-800/50 rounded-2xl border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-4">Kanary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-300">Community (free)</span>
                <span className="text-white font-semibold">$0</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-300">Professional</span>
                <span className="text-white font-semibold">$9.99/mo</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-300">Family Members</span>
                <span className="text-white font-semibold">50% off each</span>
              </div>
            </div>
            <p className="text-slate-500 text-sm mt-4">
              Threat-model approach, Google + social media coverage, Y Combinator backed
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose GhostMyData */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          Why Choose GhostMyData Over Kanary
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            "Dark web monitoring included",
            "Breach notification alerts",
            "6x more data broker coverage (2,100+ vs 310)",
            "AI Shield with 60 additional sources",
            "Free tier with full scan capability",
            "Do Not Call Registry integration",
            "Lower sale price ($11.99 vs $14.99)",
            "Custom removal requests (Enterprise)",
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              <span className="text-slate-300">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* When to Choose Kanary */}
      <div className="mb-16 p-8 bg-slate-800/30 rounded-2xl border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4">When to Choose Kanary</h2>
        <p className="text-slate-400 mb-4">
          Kanary might be the better choice if:
        </p>
        <ul className="space-y-2 text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-slate-500">-</span>
            You need a native mobile app for iOS or Android
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-500">-</span>
            You want Google search result and social media removal
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-500">-</span>
            You prefer minimal log retention (1-week policy)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-500">-</span>
            You want a community (Discord/Reddit) and a 50% family discount
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

      {/* Cross-links to broker removal guides */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-4">Start Removing Your Data Now</h2>
        <p className="text-slate-400 mb-6">
          While you decide on an automated service, start protecting your privacy today with our free step-by-step removal guides.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "Spokeo", slug: "spokeo" },
            { name: "Whitepages", slug: "whitepages" },
            { name: "BeenVerified", slug: "beenverified" },
            { name: "TruthFinder", slug: "truthfinder" },
            { name: "FastPeopleSearch", slug: "fastpeoplesearch" },
          ].map((broker) => (
            <Link
              key={broker.slug}
              href={`/remove-from/${broker.slug}`}
              className="group flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-emerald-500/50 transition-colors"
            >
              <span className="text-slate-300 group-hover:text-emerald-400 transition-colors">
                Remove from {broker.name}
              </span>
              <ArrowRight className="h-4 w-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
          <Link
            href="/remove-from"
            className="group flex items-center justify-between p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20 hover:border-emerald-500/50 transition-colors"
          >
            <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors">
              View All 25 Guides
            </span>
            <ArrowRight className="h-4 w-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </Link>
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
