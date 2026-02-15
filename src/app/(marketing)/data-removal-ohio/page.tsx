import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/structured-data";
import { Shield, Scale, Clock, CheckCircle, AlertTriangle, FileText, Users, Building } from "lucide-react";

export const metadata: Metadata = {
  title: "Ohio Data Removal Services | Ohio Data Protection Act | GhostMyData",
  description:
    "Protect your privacy as an Ohio resident. GhostMyData helps you remove personal information from data brokers and understand your rights under the Ohio Data Protection Act.",
  keywords: [
    "ohio data removal",
    "ohio data protection act",
    "ohio privacy rights",
    "ohio data broker removal",
    "ohio privacy compliance",
    "ohio data protection",
    "delete my data ohio",
    "ohio consumer privacy",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/data-removal-ohio",
  },
  openGraph: {
    title: "Ohio Data Removal Services | Ohio Data Protection Act | GhostMyData",
    description:
      "Protect your privacy in Ohio. Remove your personal information from data brokers with GhostMyData.",
    url: "https://ghostmydata.com/data-removal-ohio",
    type: "website",
  },
};

const ohioRights = [
  {
    title: "Data Protection Incentive",
    description: "Ohio rewards businesses that implement strong data protection programs with an affirmative legal defense against breach claims",
    icon: Shield,
  },
  {
    title: "Breach Notification",
    description: "Ohio requires businesses to notify residents promptly when their personal information is compromised in a data breach",
    icon: AlertTriangle,
  },
  {
    title: "Security Standards",
    description: "The Ohio Data Protection Act encourages businesses to adopt recognized cybersecurity frameworks like NIST and ISO 27001",
    icon: CheckCircle,
  },
  {
    title: "Consumer Protection",
    description: "Ohio's Consumer Sales Practices Act provides additional protections against deceptive data collection and use",
    icon: Scale,
  },
];

const ohioStats = [
  { stat: "11.8M+", label: "Ohio Residents" },
  { stat: "500+", label: "Data Brokers Operating in OH" },
  { stat: "2024", label: "Data Protection Act Enacted" },
  { stat: "Prompt", label: "Breach Notification Required" },
];

const faqs = [
  {
    question: "What is the Ohio Data Protection Act?",
    answer:
      "The Ohio Data Protection Act (SB 220, enacted 2024) is a state law that provides businesses with an affirmative defense against data breach lawsuits if they implement and maintain a cybersecurity program that conforms to recognized industry frameworks such as NIST, ISO 27001, or HIPAA.",
  },
  {
    question: "Does Ohio have a comprehensive consumer privacy law?",
    answer:
      "Ohio is actively developing consumer privacy legislation. While the Data Protection Act focuses on business cybersecurity incentives, Ohio residents can still exercise data removal rights through services like GhostMyData that submit removal requests to data brokers on your behalf.",
  },
  {
    question: "What are Ohio's breach notification requirements?",
    answer:
      "Ohio law requires businesses to notify affected residents in a reasonable timeframe after discovering a data breach involving personal information such as Social Security numbers, driver's license numbers, or financial account information.",
  },
  {
    question: "Can Ohio residents request data deletion from data brokers?",
    answer:
      "Yes. While Ohio does not yet mandate deletion rights like California's CCPA, most data brokers honor removal requests. GhostMyData automates the process of finding and requesting removal of your data from hundreds of brokers.",
  },
  {
    question: "What personal information does Ohio law protect?",
    answer:
      "Ohio protects personal information including Social Security numbers, driver's license or state ID numbers, account numbers with access codes, and other identifying information when combined with a person's name.",
  },
  {
    question: "How does GhostMyData help Ohio residents?",
    answer:
      "GhostMyData scans hundreds of data brokers for your personal information, automates removal requests, tracks responses, follows up on delayed removals, and provides documentation of your data removal efforts for Ohio residents.",
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

export default function OhioDataRemovalPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://ghostmydata.com" },
          { name: "Ohio Data Removal", url: "https://ghostmydata.com/data-removal-ohio" },
        ]}
      />
      <FAQSchema faqs={faqs} />

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-4xl">🦌</span>
              <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                Data Protection Act
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-6">
              Ohio Data Removal Services
            </h1>
            <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto mb-8">
              Protect your privacy under Ohio&apos;s Data Protection Act.
              GhostMyData helps Ohio residents remove their personal
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
                View Ohio Plans
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {ohioStats.map((item) => (
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
              Ohio Data Protection Rights
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              The Ohio Data Protection Act incentivizes businesses to protect your personal data through strong cybersecurity programs
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ohioRights.map((right) => (
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
              Top Data Brokers Targeting Ohio Residents
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              These data brokers collect and sell information about Ohio residents
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
              How GhostMyData Helps Ohio Residents
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
                  brokers on your behalf to protect your Ohio privacy rights.
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
              Ohio Privacy Frequently Asked Questions
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
              Protect Your Ohio Privacy Rights
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
