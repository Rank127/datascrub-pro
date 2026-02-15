import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/structured-data";
import { Scale, FileText, Users, MapPin, Sun, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Florida Data Removal Services | FL Privacy Protection | GhostMyData",
  description:
    "Protect your privacy in Florida. Remove your personal information from data brokers. Florida has unique privacy challenges due to open records laws.",
  keywords: [
    "florida data removal",
    "florida data broker removal",
    "florida privacy rights",
    "delete my data florida",
    "florida public records removal",
    "florida privacy protection",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/data-removal-florida",
  },
  openGraph: {
    title: "Florida Data Removal Services | FL Privacy Protection | GhostMyData",
    description:
      "Remove your personal information from data brokers in Florida.",
    url: "https://ghostmydata.com/data-removal-florida",
    type: "website",
  },
};

const floridaChallenges = [
  {
    title: "Sunshine Law Exposure",
    description: "Florida's open records laws make more personal data publicly accessible",
    icon: Sun,
  },
  {
    title: "Property Records",
    description: "Extensive property and homestead exemption data is easily searchable",
    icon: FileText,
  },
  {
    title: "Voter Registration",
    description: "Voter registration data including address and party affiliation is public",
    icon: Users,
  },
  {
    title: "Court Records",
    description: "Civil and criminal court records are widely accessible online",
    icon: Scale,
  },
];

const floridaStats = [
  { stat: "22M+", label: "Florida Residents" },
  { stat: "450+", label: "Data Brokers in FL" },
  { stat: "#2", label: "Most Exposed State" },
  { stat: "100%", label: "Public Records Online" },
];

const faqs = [
  {
    question: "Why is Florida data removal more challenging?",
    answer:
      "Florida's Sunshine Law makes government records exceptionally accessible, meaning more personal data ends up in data broker databases. Property records, voter registration, court records, and more are easily searchable.",
  },
  {
    question: "What is Florida's Sunshine Law?",
    answer:
      "Florida's Government-in-the-Sunshine Law provides broad public access to government meetings and records. While promoting transparency, it also means personal information in government records is more accessible than in other states.",
  },
  {
    question: "Can I remove my information from Florida public records?",
    answer:
      "Some categories of individuals (domestic violence victims, law enforcement, judges) can request exemptions from public records. For others, GhostMyData focuses on removing data from commercial data brokers who aggregate this information.",
  },
  {
    question: "Are Florida homeowners at higher risk?",
    answer:
      "Yes, Florida property records include detailed ownership information, homestead exemption status, and property values. Data brokers actively scrape this data, making homeowners particularly exposed.",
  },
  {
    question: "Does Florida have a privacy law like CCPA?",
    answer:
      "Florida passed the Florida Digital Bill of Rights in 2023, which gives consumers rights to access, delete, and opt-out of data sales. It takes effect July 1, 2024 for businesses meeting certain thresholds.",
  },
  {
    question: "How does GhostMyData help Florida residents?",
    answer:
      "GhostMyData removes your information from 150+ data broker sites, monitors for re-appearance, and provides ongoing protection. We understand Florida's unique challenges and target brokers that specialize in Florida records.",
  },
];

export default function FloridaDataRemovalPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://ghostmydata.com" },
          { name: "Florida Data Removal", url: "https://ghostmydata.com/data-removal-florida" },
        ]}
      />
      <FAQSchema faqs={faqs} />

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-4xl">🌴</span>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium">
                Sunshine State
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-6">
              Florida Data Removal Services
            </h1>
            <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto mb-8">
              Florida&apos;s open records laws mean your data is more exposed than most states.
              GhostMyData helps Florida residents take back control of their personal information.
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
                View Plans
              </Link>
            </div>
          </div>
        </section>

        {/* Warning Banner */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-orange-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-orange-400 mb-2">
                    Florida Has Unique Privacy Challenges
                  </h3>
                  <p className="text-gray-300">
                    Florida&apos;s Sunshine Law makes it one of the most transparent states
                    in the nation - but this also means your personal information is more
                    easily accessible to data brokers than residents of other states.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {floridaStats.map((item) => (
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

        {/* Challenges Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-white text-center mb-4">
              Florida Privacy Challenges
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              Understanding why Florida residents need extra privacy protection
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {floridaChallenges.map((challenge) => (
                <div
                  key={challenge.title}
                  className="bg-gray-900/50 border border-gray-700 rounded-xl p-6"
                >
                  <div className="p-3 bg-orange-500/10 rounded-lg w-fit mb-4">
                    <challenge.icon className="h-6 w-6 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {challenge.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{challenge.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Major Florida Cities */}
        <section className="py-16 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-white text-center mb-4">
              Serving All Florida Cities
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              GhostMyData protects residents across the Sunshine State
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale", "West Palm Beach", "St. Petersburg", "Hialeah", "Tallahassee", "Cape Coral", "Pembroke Pines", "Hollywood"].map((city) => (
                <div
                  key={city}
                  className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center"
                >
                  <MapPin className="h-4 w-4 text-cyan-400 mx-auto mb-2" />
                  <span className="text-white text-sm">{city}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Florida Privacy FAQ
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
        <section className="py-16 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Protect Your Florida Privacy
            </h2>
            <p className="text-gray-300 mb-8">
              Florida&apos;s open records laws make privacy protection essential.
              Start protecting your personal information today.
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition-colors"
            >
              Start Free Scan
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
