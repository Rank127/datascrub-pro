import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/structured-data";
import { Shield, Clock, FileText, Scale } from "lucide-react";
import { STATE_DATA, getAllStateSlugs } from "@/lib/state-data";

interface Props {
  params: Promise<{ state: string }>;
}

export async function generateStaticParams() {
  return getAllStateSlugs().map((state) => ({ state }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: slug } = await params;
  const stateInfo = STATE_DATA[slug];

  if (!stateInfo) {
    return { title: "State Not Found" };
  }

  const title = `${stateInfo.name} Data Removal Services | ${stateInfo.lawAcronym} | GhostMyData`;
  const description = `Exercise your ${stateInfo.lawAcronym} rights with GhostMyData. ${stateInfo.name} residents can request deletion of personal information from data brokers.`;

  return {
    title,
    description,
    keywords: [
      `${stateInfo.name.toLowerCase()} data removal`,
      `${stateInfo.lawAcronym.toLowerCase()} data removal`,
      `${stateInfo.name.toLowerCase()} privacy rights`,
      `${stateInfo.lawAcronym.toLowerCase()} opt out`,
      `${stateInfo.name.toLowerCase()} data broker removal`,
      `delete my data ${stateInfo.name.toLowerCase()}`,
    ],
    alternates: {
      canonical: `https://ghostmydata.com/data-removal/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://ghostmydata.com/data-removal/${slug}`,
      type: "website",
      images: [
        {
          url: "https://ghostmydata.com/og-image.png",
          width: 1200,
          height: 630,
          alt: `${stateInfo.name} Data Removal Services`,
        },
      ],
    },
  };
}

const icons = [FileText, Shield, Scale, Clock];

export default async function StateDataRemovalPage({ params }: Props) {
  const { state: slug } = await params;
  const stateInfo = STATE_DATA[slug];

  if (!stateInfo) {
    notFound();
  }

  // Get a few neighboring state slugs for cross-linking
  const allSlugs = getAllStateSlugs();
  const currentIndex = allSlugs.indexOf(slug);
  const nearbyStates = allSlugs
    .filter((_, i) => i !== currentIndex)
    .slice(0, 5)
    .map((s) => STATE_DATA[s])
    .filter(Boolean);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://ghostmydata.com" },
          {
            name: `${stateInfo.name} Data Removal`,
            url: `https://ghostmydata.com/data-removal/${slug}`,
          },
        ]}
      />
      <FAQSchema faqs={stateInfo.faqs} />

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-4xl">{stateInfo.emoji}</span>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                {stateInfo.badgeText}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-6">
              {stateInfo.name} Data Removal Services
            </h1>
            <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto mb-8">
              {stateInfo.heroDescription}
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
              {stateInfo.stats.map((item) => (
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
              Your {stateInfo.lawAcronym} Rights
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              {stateInfo.lawName} ({stateInfo.lawYear}) gives you important rights over your personal data
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stateInfo.rights.map((right, i) => {
                const Icon = icons[i % icons.length];
                return (
                  <div
                    key={right.title}
                    className="bg-gray-900/50 border border-gray-700 rounded-xl p-6"
                  >
                    <div className="p-3 bg-cyan-500/10 rounded-lg w-fit mb-4">
                      <Icon className="h-6 w-6 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {right.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{right.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Data Brokers Section */}
        <section className="py-16 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-white text-center mb-4">
              Top Data Brokers Targeting {stateInfo.name} Residents
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              These data brokers collect and sell information about {stateInfo.name} residents
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stateInfo.topBrokers.map((broker) => (
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
              How GhostMyData Helps {stateInfo.name} Residents
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Automated {stateInfo.lawAcronym} Requests
                </h3>
                <p className="text-gray-400">
                  We submit legally compliant {stateInfo.lawAcronym} deletion requests to data
                  brokers on your behalf.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {stateInfo.responseTimeDays}-Day Compliance Tracking
                </h3>
                <p className="text-gray-400">
                  We track the {stateInfo.responseTimeDays}-day response deadline and follow up on
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
              {stateInfo.name} Privacy FAQ
            </h2>
            <div className="space-y-4">
              {stateInfo.faqs.map((faq, index) => (
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

        {/* Cross-links to other states */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Data Removal in Other States
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {nearbyStates.map((s) => (
                <Link
                  key={s.slug}
                  href={`/data-removal/${s.slug}`}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors text-sm"
                >
                  {s.emoji} {s.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {stateInfo.ctaText}
            </h2>
            <p className="text-gray-300 mb-8">
              Don&apos;t let data brokers profit from your personal information.
              Exercise your {stateInfo.lawAcronym} rights with GhostMyData.
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
