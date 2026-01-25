import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/structured-data";
import { Shield, Scale, Clock, CheckCircle, FileText, Users, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Texas Data Removal Services | TDPSA Privacy Rights | GhostMyData",
  description:
    "Protect your privacy under the Texas Data Privacy and Security Act. Remove your personal information from data brokers operating in Texas.",
  keywords: [
    "texas data removal",
    "tdpsa data removal",
    "texas privacy rights",
    "texas data broker removal",
    "texas data privacy act",
    "delete my data texas",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/data-removal-texas",
  },
  openGraph: {
    title: "Texas Data Removal Services | TDPSA Privacy Rights | GhostMyData",
    description:
      "Exercise your Texas privacy rights. Remove your personal information from data brokers.",
    url: "https://ghostmydata.com/data-removal-texas",
    type: "website",
  },
};

const texasRights = [
  {
    title: "Right to Access",
    description: "Know what personal data businesses have collected about you",
    icon: FileText,
  },
  {
    title: "Right to Delete",
    description: "Request deletion of your personal data from businesses",
    icon: Shield,
  },
  {
    title: "Right to Correct",
    description: "Correct inaccurate personal data held by businesses",
    icon: CheckCircle,
  },
  {
    title: "Right to Opt-Out",
    description: "Opt out of data sales, targeted advertising, and profiling",
    icon: Users,
  },
];

const texasStats = [
  { stat: "30M+", label: "Texas Residents" },
  { stat: "400+", label: "Data Brokers in TX" },
  { stat: "2024", label: "TDPSA Effective" },
  { stat: "45 Days", label: "Response Deadline" },
];

const faqs = [
  {
    question: "What is the TDPSA?",
    answer:
      "The Texas Data Privacy and Security Act (TDPSA) is a comprehensive privacy law that gives Texas residents rights over their personal data, including the right to access, delete, and opt-out of data sales.",
  },
  {
    question: "When did TDPSA take effect?",
    answer:
      "The Texas Data Privacy and Security Act took effect on July 1, 2024, making Texas one of the states with comprehensive privacy legislation.",
  },
  {
    question: "Who must comply with TDPSA?",
    answer:
      "Businesses that conduct business in Texas or target Texas residents and process personal data of 100,000+ consumers, or derive 50%+ revenue from selling personal data of 25,000+ consumers.",
  },
  {
    question: "How long do businesses have to respond to TDPSA requests?",
    answer:
      "Businesses must respond to consumer requests within 45 days, with a possible 45-day extension if reasonably necessary.",
  },
  {
    question: "Can I sue under TDPSA?",
    answer:
      "TDPSA does not provide a private right of action. Enforcement is handled by the Texas Attorney General, who can impose civil penalties up to $7,500 per violation.",
  },
  {
    question: "How does GhostMyData help Texas residents?",
    answer:
      "GhostMyData automates opt-out and deletion requests to data brokers under TDPSA, tracks compliance deadlines, and provides documentation of all removal efforts.",
  },
];

export default function TexasDataRemovalPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://ghostmydata.com" },
          { name: "Texas Data Removal", url: "https://ghostmydata.com/data-removal-texas" },
        ]}
      />
      <FAQSchema faqs={faqs} />

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-4xl">🤠</span>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium">
                TDPSA Protected
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-6">
              Texas Data Removal Services
            </h1>
            <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto mb-8">
              Exercise your Texas Data Privacy and Security Act (TDPSA) rights.
              GhostMyData helps Texas residents remove their personal information from data brokers.
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

        {/* Stats Section */}
        <section className="py-12 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {texasStats.map((item) => (
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

        {/* TDPSA Rights Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-white text-center mb-4">
              Your TDPSA Rights
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              The Texas Data Privacy and Security Act gives you control over your personal information
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {texasRights.map((right) => (
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

        {/* Major Texas Cities */}
        <section className="py-16 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-white text-center mb-4">
              Serving All Texas Cities
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              GhostMyData protects residents across the Lone Star State
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Lubbock", "Laredo", "Irving"].map((city) => (
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
              TDPSA Frequently Asked Questions
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
              Protect Your Texas Privacy Rights
            </h2>
            <p className="text-gray-300 mb-8">
              Don&apos;t let data brokers profit from your personal information.
              Exercise your TDPSA rights with GhostMyData.
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
