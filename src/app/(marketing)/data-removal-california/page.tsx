import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/structured-data";
import { Shield, Scale, Clock, FileText, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "California Data Removal Services | CCPA Compliance | GhostMyData",
  description:
    "Exercise your CCPA rights with GhostMyData. California residents can request deletion of personal information from data brokers under the California Consumer Privacy Act.",
  keywords: [
    "california data removal",
    "ccpa data removal",
    "california privacy rights",
    "ccpa opt out",
    "california data broker removal",
    "ccpa compliance",
    "california consumer privacy act",
    "delete my data california",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/data-removal-california",
  },
  openGraph: {
    title: "California Data Removal Services | CCPA Compliance | GhostMyData",
    description:
      "Exercise your CCPA rights. Remove your personal information from data brokers in California.",
    url: "https://ghostmydata.com/data-removal-california",
    type: "website",
  },
};

const ccpaRights = [
  {
    title: "Right to Know",
    description: "Request disclosure of what personal information businesses have collected about you",
    icon: FileText,
  },
  {
    title: "Right to Delete",
    description: "Request deletion of personal information collected about you",
    icon: Shield,
  },
  {
    title: "Right to Opt-Out",
    description: "Opt out of the sale or sharing of your personal information",
    icon: Users,
  },
  {
    title: "Right to Non-Discrimination",
    description: "Companies cannot discriminate against you for exercising your privacy rights",
    icon: Scale,
  },
];

const californiaStats = [
  { stat: "39M+", label: "California Residents" },
  { stat: "500+", label: "Data Brokers Operating in CA" },
  { stat: "$7,500", label: "Max CCPA Violation Fine" },
  { stat: "45 Days", label: "Required Response Time" },
];

const faqs = [
  {
    question: "What is the CCPA?",
    answer:
      "The California Consumer Privacy Act (CCPA) is a state law that gives California residents greater control over their personal information. It requires businesses to disclose data collection practices and allows consumers to request deletion of their data.",
  },
  {
    question: "Who is covered by the CCPA?",
    answer:
      "CCPA applies to California residents and businesses that collect personal information and meet certain thresholds (annual revenue over $25M, data on 100,000+ consumers, or 50%+ revenue from selling data).",
  },
  {
    question: "How long do companies have to respond to CCPA requests?",
    answer:
      "Businesses must respond to CCPA requests within 45 days. They can extend this by an additional 45 days if necessary, but must notify you of the extension.",
  },
  {
    question: "Can I sue a company for CCPA violations?",
    answer:
      "Consumers can sue for data breaches resulting from a company's failure to maintain reasonable security. For other violations, you can file a complaint with the California Attorney General.",
  },
  {
    question: "Does CCPA apply to data brokers?",
    answer:
      "Yes, data brokers are specifically covered under CCPA. California also requires data brokers to register with the state, making it easier to identify and submit removal requests.",
  },
  {
    question: "How does GhostMyData help with CCPA compliance?",
    answer:
      "GhostMyData automates CCPA deletion requests to data brokers on your behalf, tracks responses, follows up on delayed requests, and provides documentation of your removal efforts.",
  },
];

const topCaliforniaBrokers = [
  { name: "Spokeo", difficulty: "Easy", time: "24-72 hours" },
  { name: "WhitePages", difficulty: "Medium", time: "48-72 hours" },
  { name: "BeenVerified", difficulty: "Easy", time: "24-48 hours" },
  { name: "Intelius", difficulty: "Medium", time: "72 hours" },
  { name: "Radaris", difficulty: "Hard", time: "7-30 days" },
  { name: "MyLife", difficulty: "Hard", time: "7-14 days" },
];

export default function CaliforniaDataRemovalPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://ghostmydata.com" },
          { name: "California Data Removal", url: "https://ghostmydata.com/data-removal-california" },
        ]}
      />
      <FAQSchema faqs={faqs} />

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-4xl">🐻</span>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                CCPA Protected
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-6">
              California Data Removal Services
            </h1>
            <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto mb-8">
              Exercise your California Consumer Privacy Act (CCPA) rights.
              GhostMyData helps California residents remove their personal
              information from data brokers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition-colors text-center"
              >
                Start Free Scan
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors text-center"
              >
                View California Plans
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {californiaStats.map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
                    {item.stat}
                  </div>
                  <div className="text-gray-400 text-sm">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CCPA Rights Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-white text-center mb-4">
              Your CCPA Rights
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              The California Consumer Privacy Act gives you powerful rights over your personal data
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ccpaRights.map((right) => (
                <div
                  key={right.title}
                  className="bg-gray-900/50 border border-gray-700 rounded-xl p-6"
                >
                  <div className="p-3 bg-cyan-500/10 rounded-lg w-fit mb-4">
                    <right.icon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {right.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{right.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Brokers Section */}
        <section className="py-16 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-white text-center mb-4">
              Top Data Brokers Targeting Californians
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              These data brokers collect and sell information about California residents
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topCaliforniaBrokers.map((broker) => (
                <div
                  key={broker.name}
                  className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {broker.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Removal: {broker.time}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      broker.difficulty === "Easy"
                        ? "bg-green-500/20 text-green-400"
                        : broker.difficulty === "Medium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {broker.difficulty}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/remove-from"
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                View all data broker removal guides →
              </Link>
            </div>
          </div>
        </section>

        {/* How GhostMyData Helps */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              How GhostMyData Helps California Residents
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Automated CCPA Requests
                </h3>
                <p className="text-gray-400">
                  We submit legally compliant CCPA deletion requests to data
                  brokers on your behalf.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  45-Day Compliance Tracking
                </h3>
                <p className="text-gray-400">
                  We track the 45-day CCPA response deadline and follow up on
                  non-compliant brokers.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Compliance Documentation
                </h3>
                <p className="text-gray-400">
                  Get detailed reports of all removal requests for your records
                  or legal purposes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              CCPA Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 border border-gray-700 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Protect Your California Privacy Rights
            </h2>
            <p className="text-gray-300 mb-8">
              Don&apos;t let data brokers profit from your personal information.
              Exercise your CCPA rights with GhostMyData.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition-colors"
              >
                Start Free Scan
              </Link>
              <Link
                href="/how-it-works"
                className="px-8 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Learn How It Works
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
