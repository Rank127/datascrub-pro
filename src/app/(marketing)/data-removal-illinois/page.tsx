import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/structured-data";
import { Shield, Scale, Clock, FileText, Fingerprint } from "lucide-react";

export const metadata: Metadata = {
  title: "Illinois Data Removal Services | BIPA Compliance | GhostMyData",
  description:
    "Exercise your BIPA rights with GhostMyData. Illinois residents can request deletion of personal and biometric information from data brokers under the Biometric Information Privacy Act.",
  keywords: [
    "illinois data removal",
    "bipa data removal",
    "illinois privacy rights",
    "bipa opt out",
    "illinois data broker removal",
    "bipa compliance",
    "biometric information privacy act",
    "delete my data illinois",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/data-removal-illinois",
  },
  openGraph: {
    title: "Illinois Data Removal Services | BIPA Compliance | GhostMyData",
    description:
      "Exercise your BIPA rights. Remove your personal and biometric information from data brokers in Illinois.",
    url: "https://ghostmydata.com/data-removal-illinois",
    type: "website",
  },
};

const bipaRights = [
  {
    title: "Biometric Data Protection",
    description: "Companies must obtain written consent before collecting your fingerprints, face scans, or other biometric data",
    icon: Fingerprint,
  },
  {
    title: "Right to Sue (Private Right of Action)",
    description: "Illinois is the only state that lets individuals sue companies directly for biometric privacy violations",
    icon: Scale,
  },
  {
    title: "Data Retention Limits",
    description: "Organizations must destroy biometric data when the purpose for collection has been fulfilled or within 3 years",
    icon: Clock,
  },
  {
    title: "Written Policy Required",
    description: "Companies must publish a publicly available retention schedule and guidelines for destroying biometric data",
    icon: FileText,
  },
];

const illinoisStats = [
  { stat: "12.8M+", label: "Illinois Residents" },
  { stat: "500+", label: "Data Brokers Operating in IL" },
  { stat: "$5,000", label: "Max BIPA Violation Per Incident" },
  { stat: "Private", label: "Right of Action for Individuals" },
];

const faqs = [
  {
    question: "What is BIPA?",
    answer:
      "The Biometric Information Privacy Act (BIPA) is an Illinois state law that regulates the collection, use, and storage of biometric identifiers such as fingerprints, facial geometry, and iris scans. It is considered the strongest biometric privacy law in the United States.",
  },
  {
    question: "Why is BIPA considered the strongest biometric law?",
    answer:
      "BIPA is unique because it provides a private right of action, meaning individuals can sue companies directly for violations without needing to show actual harm. Statutory damages range from $1,000 for negligent violations to $5,000 for intentional or reckless violations per incident.",
  },
  {
    question: "What data is protected under BIPA?",
    answer:
      "BIPA protects biometric identifiers including fingerprints, retina or iris scans, voiceprints, and scans of hand or face geometry. It does not cover writing samples, written signatures, photographs, demographic data, or physical descriptions.",
  },
  {
    question: "Do Illinois residents have rights over non-biometric data?",
    answer:
      "Yes. In addition to BIPA, Illinois has the Personal Information Protection Act (PIPA) which requires breach notification for personal data. Illinois residents also benefit from federal protections and can exercise data removal rights through GhostMyData.",
  },
  {
    question: "Does BIPA apply to data brokers?",
    answer:
      "Yes, data brokers that collect or use biometric data of Illinois residents must comply with BIPA. Additionally, many data brokers collect personal information beyond biometrics that Illinois residents can request to have removed.",
  },
  {
    question: "How does GhostMyData help Illinois residents?",
    answer:
      "GhostMyData automates data removal requests to data brokers on behalf of Illinois residents, tracks responses, follows up on delayed requests, and provides documentation of your removal efforts to support your privacy rights under BIPA and other applicable laws.",
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

export default function IllinoisDataRemovalPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://ghostmydata.com" },
          { name: "Illinois Data Removal", url: "https://ghostmydata.com/data-removal-illinois" },
        ]}
      />
      <FAQSchema faqs={faqs} />

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-4xl">🏛️</span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                BIPA Protected
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-6">
              Illinois Data Removal Services
            </h1>
            <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto mb-8">
              Exercise your Biometric Information Privacy Act (BIPA) rights.
              GhostMyData helps Illinois residents remove their personal
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
                View Illinois Plans
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {illinoisStats.map((item) => (
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

        {/* BIPA Rights Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-white text-center mb-4">
              Your BIPA Rights
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              The Biometric Information Privacy Act gives Illinois residents the strongest biometric data protections in the nation
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {bipaRights.map((right) => (
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
              Top Data Brokers Targeting Illinois Residents
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              These data brokers collect and sell information about Illinois residents
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
              How GhostMyData Helps Illinois Residents
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
                  We submit legally compliant data deletion requests to data
                  brokers on your behalf under BIPA and other Illinois privacy laws.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Compliance Tracking
                </h3>
                <p className="text-gray-400">
                  We track response deadlines and follow up on
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
              Illinois Privacy Frequently Asked Questions
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
              Protect Your Illinois Privacy Rights
            </h2>
            <p className="text-gray-300 mb-8">
              Don&apos;t let data brokers profit from your personal information.
              Exercise your BIPA rights with GhostMyData.
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
