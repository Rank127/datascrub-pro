import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/structured-data";
import { Shield, Scale, Clock, AlertTriangle, FileText, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Georgia Data Removal Services | Personal Identity Protection | GhostMyData",
  description:
    "Protect your privacy as a Georgia resident. GhostMyData helps you remove personal information from data brokers and exercise your rights under Georgia's Personal Identity Protection Act.",
  keywords: [
    "georgia data removal",
    "georgia privacy rights",
    "georgia personal identity protection act",
    "georgia data broker removal",
    "georgia privacy compliance",
    "georgia breach notification",
    "delete my data georgia",
    "georgia ssn protection",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/data-removal-georgia",
  },
  openGraph: {
    title: "Georgia Data Removal Services | Personal Identity Protection | GhostMyData",
    description:
      "Protect your privacy in Georgia. Remove your personal information from data brokers with GhostMyData.",
    url: "https://ghostmydata.com/data-removal-georgia",
    type: "website",
  },
};

const georgiaRights = [
  {
    title: "SSN Disclosure Protection",
    description: "Georgia law prohibits the public display, transmission, and unauthorized use of Social Security numbers",
    icon: Lock,
  },
  {
    title: "Breach Notification",
    description: "Businesses must notify Georgia residents promptly when their personal information is exposed in a data breach",
    icon: AlertTriangle,
  },
  {
    title: "Identity Theft Protections",
    description: "Georgia provides robust identity theft protections including security freeze rights for credit reports",
    icon: Shield,
  },
  {
    title: "Consumer Remedies",
    description: "Georgia's Fair Business Practices Act provides consumers with remedies against deceptive data practices",
    icon: Scale,
  },
];

const georgiaStats = [
  { stat: "10.9M+", label: "Georgia Residents" },
  { stat: "500+", label: "Data Brokers Operating in GA" },
  { stat: "Strong", label: "SSN Protection Laws" },
  { stat: "Prompt", label: "Breach Notification Required" },
];

const faqs = [
  {
    question: "What is the Georgia Personal Identity Protection Act?",
    answer:
      "The Georgia Personal Identity Protection Act protects residents from unauthorized use and disclosure of Social Security numbers. It prohibits businesses from publicly displaying SSNs, printing them on ID cards or mailings, and transmitting them over unsecured channels.",
  },
  {
    question: "What are Georgia's breach notification requirements?",
    answer:
      "Georgia's breach notification law requires businesses and government entities to notify affected individuals in the most expedient time possible when a data breach exposes personal information such as Social Security numbers, driver's license numbers, or financial account information.",
  },
  {
    question: "Does Georgia have a comprehensive consumer privacy law?",
    answer:
      "Georgia does not yet have a comprehensive consumer privacy law equivalent to California's CCPA. However, Georgia residents benefit from the Personal Identity Protection Act, breach notification laws, and federal protections. GhostMyData helps you exercise data removal rights regardless.",
  },
  {
    question: "Can Georgia residents request data deletion from data brokers?",
    answer:
      "Yes. While Georgia law does not mandate a specific right to deletion, most data brokers honor removal requests. GhostMyData automates the process of finding your personal information across hundreds of brokers and submitting removal requests on your behalf.",
  },
  {
    question: "What personal information does Georgia law protect?",
    answer:
      "Georgia law protects personal information including Social Security numbers, driver's license numbers, state ID numbers, financial account numbers with access codes, and other information that could be used for identity theft.",
  },
  {
    question: "How does GhostMyData help Georgia residents?",
    answer:
      "GhostMyData scans hundreds of data brokers for your personal information, automates removal requests, tracks responses, follows up on delayed removals, and provides documentation of your data removal efforts for Georgia residents.",
  },
];

const topBrokers = [
  { name: "Spokeo", difficulty: "Easy", time: "24-72 hours" },
  { name: "WhitePages", difficulty: "Medium", time: "48-72 hours" },
  { name: "BeenVerified", difficulty: "Easy", time: "24-48 hours" },
  { name: "Intelius", difficulty: "Medium", time: "72 hours" },
  { name: "Radaris", difficulty: "Hard", time: "7-30 days" },
  { name: "MyLife", difficulty: "Hard", time: "7-14 days" },
];

export default function GeorgiaDataRemovalPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://ghostmydata.com" },
          { name: "Georgia Data Removal", url: "https://ghostmydata.com/data-removal-georgia" },
        ]}
      />
      <FAQSchema faqs={faqs} />

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-4xl">🍑</span>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium">
                Identity Protection Act
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-6">
              Georgia Data Removal Services
            </h1>
            <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto mb-8">
              Protect your privacy under Georgia&apos;s Personal Identity Protection Act.
              GhostMyData helps Georgia residents remove their personal
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
                View Georgia Plans
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {georgiaStats.map((item) => (
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

        {/* Rights Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-white text-center mb-4">
              Your Georgia Privacy Rights
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              Georgia law provides important protections for your personal identity and breach notification rights
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {georgiaRights.map((right) => (
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
              Top Data Brokers Targeting Georgia Residents
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              These data brokers collect and sell information about Georgia residents
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topBrokers.map((broker) => (
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
              How GhostMyData Helps Georgia Residents
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Automated Removal Requests
                </h3>
                <p className="text-gray-400">
                  We submit data deletion requests to data
                  brokers on your behalf to protect your Georgia privacy rights.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Response Tracking
                </h3>
                <p className="text-gray-400">
                  We track data broker response times and follow up on
                  non-compliant brokers to ensure your data is removed.
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
              Georgia Privacy Frequently Asked Questions
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
              Protect Your Georgia Privacy Rights
            </h2>
            <p className="text-gray-300 mb-8">
              Don&apos;t let data brokers profit from your personal information.
              Take control of your data with GhostMyData.
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
