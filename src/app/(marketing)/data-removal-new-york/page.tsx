import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/structured-data";
import { Shield, Scale, FileText, Users, MapPin, Building } from "lucide-react";

export const metadata: Metadata = {
  title: "New York Data Removal Services | NY Privacy Rights | GhostMyData",
  description:
    "Protect your privacy in New York. Remove your personal information from data brokers with GhostMyData's comprehensive data removal service.",
  keywords: [
    "new york data removal",
    "ny data broker removal",
    "new york privacy rights",
    "delete my data new york",
    "nyc data removal",
    "new york privacy protection",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/data-removal-new-york",
  },
  openGraph: {
    title: "New York Data Removal Services | NY Privacy Rights | GhostMyData",
    description:
      "Remove your personal information from data brokers in New York.",
    url: "https://ghostmydata.com/data-removal-new-york",
    type: "website",
  },
};

const nyRights = [
  {
    title: "SHIELD Act Protection",
    description: "Data security requirements for businesses handling NY resident data",
    icon: Shield,
  },
  {
    title: "Data Breach Notification",
    description: "Right to be notified when your data is compromised",
    icon: FileText,
  },
  {
    title: "Social Security Protection",
    description: "Restrictions on SSN collection and display",
    icon: Users,
  },
  {
    title: "Biometric Data Rights",
    description: "Protection for fingerprints and facial recognition data",
    icon: Scale,
  },
];

const nyStats = [
  { stat: "19M+", label: "New York Residents" },
  { stat: "350+", label: "Data Brokers in NY" },
  { stat: "2020", label: "SHIELD Act Effective" },
  { stat: "#3", label: "Most Targeted State" },
];

const faqs = [
  {
    question: "What privacy laws protect New York residents?",
    answer:
      "New York residents are protected by the SHIELD Act (Stop Hacks and Improve Electronic Data Security), which requires businesses to implement reasonable data security safeguards and notify consumers of data breaches.",
  },
  {
    question: "Is there a comprehensive privacy law in New York?",
    answer:
      "While New York has strong sector-specific privacy laws, a comprehensive consumer privacy law (like CCPA) is still being debated. The SHIELD Act and existing laws still provide significant protections.",
  },
  {
    question: "What is the NY SHIELD Act?",
    answer:
      "The SHIELD Act requires any business that collects private information of New York residents to implement and maintain reasonable security safeguards, regardless of where the business is located.",
  },
  {
    question: "Can I request data brokers delete my information in NY?",
    answer:
      "While NY doesn't have a specific data broker deletion law, many data brokers honor removal requests. GhostMyData submits removal requests on your behalf to 150+ data broker sites.",
  },
  {
    question: "Are NYC residents at higher risk from data brokers?",
    answer:
      "Yes, New York City residents often have more data exposed due to higher property values, more public records, and greater online activity. GhostMyData covers NYC-specific data sources.",
  },
  {
    question: "How does GhostMyData help New York residents?",
    answer:
      "GhostMyData monitors 150+ data broker sites, automatically submits removal requests, tracks their completion, and provides ongoing monitoring to protect your privacy.",
  },
];

export default function NewYorkDataRemovalPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://ghostmydata.com" },
          { name: "New York Data Removal", url: "https://ghostmydata.com/data-removal-new-york" },
        ]}
      />
      <FAQSchema faqs={faqs} />

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-4xl">🗽</span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                SHIELD Act Protected
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-6">
              New York Data Removal Services
            </h1>
            <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto mb-8">
              Protect your privacy in the Empire State. GhostMyData helps New York
              residents remove their personal information from data brokers.
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
              {nyStats.map((item) => (
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

        {/* NY Rights Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-white text-center mb-4">
              Your New York Privacy Rights
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              New York has multiple laws protecting your personal information
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {nyRights.map((right) => (
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

        {/* NYC Special Section */}
        <section className="py-16 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Special Protection for NYC Residents
                </h2>
                <p className="text-gray-300 mb-6">
                  New York City residents face unique privacy challenges due to
                  high property values, extensive public records, and the city&apos;s
                  status as a business hub.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-gray-300">
                    <Building className="h-5 w-5 text-cyan-400" />
                    Property records with high valuations
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <FileText className="h-5 w-5 text-cyan-400" />
                    Business registration information
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <Users className="h-5 w-5 text-cyan-400" />
                    Professional licensing data
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <MapPin className="h-5 w-5 text-cyan-400" />
                    Detailed address histories
                  </li>
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island", "Long Island", "Buffalo", "Rochester"].map((area) => (
                  <div
                    key={area}
                    className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center"
                  >
                    <MapPin className="h-4 w-4 text-cyan-400 mx-auto mb-2" />
                    <span className="text-white text-sm">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              New York Privacy FAQ
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
              Protect Your New York Privacy
            </h2>
            <p className="text-gray-300 mb-8">
              Don&apos;t let data brokers profit from your personal information.
              Start protecting your privacy today.
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
