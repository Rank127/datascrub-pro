import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, Users, Bot, Eye } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/structured-data";
import { AUTHORS } from "@/lib/blog/authors";

export const metadata: Metadata = {
  title: "About GhostMyData | Our Mission & Team",
  description:
    "Learn about GhostMyData's mission to protect personal privacy. Meet our team and discover how we help individuals remove their data from 2,100+ data brokers.",
  keywords: [
    "about ghostmydata",
    "data removal company",
    "privacy team",
    "data broker removal service",
    "ghostmydata founder",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/about",
  },
  openGraph: {
    title: "About GhostMyData | Our Mission & Team",
    description:
      "Learn about GhostMyData's mission to protect personal privacy and meet our team.",
    url: "https://ghostmydata.com/about",
    type: "website",
    images: [
      {
        url: "https://ghostmydata.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "About GhostMyData",
      },
    ],
  },
};

function PersonSchema({ author }: { author: typeof AUTHORS[string] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    jobTitle: author.role,
    description: author.bio,
    worksFor: {
      "@type": "Organization",
      name: "GhostMyData",
      url: "https://ghostmydata.com",
    },
    knowsAbout: author.expertise,
    sameAs: author.linkedIn ? [author.linkedIn] : [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function AboutPage() {
  const rocky = AUTHORS["rocky-kathuria"];

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://ghostmydata.com" },
          { name: "About", url: "https://ghostmydata.com/about" },
        ]}
      />
      <PersonSchema author={rocky} />

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Your Data Shouldn&apos;t Be For Sale
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              GhostMyData exists because personal privacy is a right, not a
              luxury. We built a platform that fights data brokers at scale —
              so you don&apos;t have to.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Every day, data brokers collect, package, and sell your personal
                information — your name, address, phone number, family members,
                income estimates, and more. There are over 4,000 data brokers
                operating in the US alone, and most people don&apos;t even know
                they exist.
              </p>
              <p>
                Removing yourself from these sites manually is a nightmare. Each
                broker has a different opt-out process — some require forms,
                others require emails, some require postal mail. Even after
                removal, many brokers re-list your data within months.
              </p>
              <p>
                GhostMyData automates this entire process. Our platform scans
                2,100+ data brokers, submits removal requests to every broker
                where you appear, tracks compliance deadlines, and monitors for
                re-listings — automatically.
              </p>
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              What We Do
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 text-center">
                <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mx-auto mb-4">
                  <Eye className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Find Your Data
                </h3>
                <p className="text-gray-400 text-sm">
                  We scan 2,100+ data brokers and the dark web to find where
                  your personal information is exposed.
                </p>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 text-center">
                <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mx-auto mb-4">
                  <Shield className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Remove It
                </h3>
                <p className="text-gray-400 text-sm">
                  We submit legally compliant removal requests to every broker
                  where you appear.
                </p>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 text-center">
                <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mx-auto mb-4">
                  <Bot className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Follow Up
                </h3>
                <p className="text-gray-400 text-sm">
                  We track response deadlines, escalate non-compliant brokers,
                  and verify removals automatically.
                </p>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 text-center">
                <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mx-auto mb-4">
                  <Users className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Keep Watching
                </h3>
                <p className="text-gray-400 text-sm">
                  Continuous monitoring catches re-listings. We remove your data
                  again, as many times as needed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Our Team
            </h2>
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-emerald-400">
                      RK
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {rocky.name}
                  </h3>
                  <p className="text-emerald-400 font-medium mb-4">
                    {rocky.role}
                  </p>
                  <p className="text-gray-300 mb-6">{rocky.bio}</p>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Areas of Expertise
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {rocky.expertise.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm border border-emerald-500/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Take Back Your Privacy?
            </h2>
            <p className="text-gray-300 mb-8">
              Start with a free scan to see where your data is exposed. No
              credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
              >
                Start Free Scan
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="px-8 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors text-center"
              >
                How It Works
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
