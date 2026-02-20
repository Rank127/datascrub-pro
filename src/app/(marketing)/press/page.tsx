import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, Shield } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Press Kit | GhostMyData",
  description:
    "GhostMyData press kit for journalists and media. Company overview, product information, key statistics, executive bios, and brand assets for editorial coverage.",
  keywords: [
    "ghostmydata press",
    "data removal press kit",
    "ghostmydata media",
    "privacy service press",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/press",
  },
  openGraph: {
    title: "Press Kit | GhostMyData",
    description:
      "Press resources for journalists covering GhostMyData's data privacy removal service.",
    url: "https://ghostmydata.com/press",
    type: "website",
    images: [
      {
        url: "https://ghostmydata.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "GhostMyData Press Kit",
      },
    ],
  },
};

const keyStats = [
  { stat: "2,100+", label: "Data Brokers Scanned" },
  { stat: "24", label: "AI Agents Deployed" },
  { stat: "50", label: "US States Covered" },
  { stat: "350+", label: "Removal Guides Published" },
];

const milestones = [
  {
    date: "2024",
    title: "GhostMyData Founded",
    description: "Platform launched with initial data broker scanning capabilities.",
  },
  {
    date: "2025",
    title: "AI Agent System Deployed",
    description: "24 AI agents deployed for automated removal processing and compliance tracking.",
  },
  {
    date: "2026",
    title: "2,100+ Broker Coverage",
    description: "Expanded to scan 2,100+ data brokers — the most comprehensive coverage in the industry.",
  },
  {
    date: "2026",
    title: "AI Shield Launch",
    description: "Introduced AI Shield monitoring 60+ AI training data sources for unauthorized data use.",
  },
];

const brandColors = [
  { name: "Emerald", hex: "#10B981", usage: "Primary brand color, CTAs" },
  { name: "Slate 950", hex: "#020617", usage: "Background" },
  { name: "White", hex: "#FFFFFF", usage: "Headings, primary text" },
  { name: "Slate 400", hex: "#94A3B8", usage: "Body text" },
];

export default function PressPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://ghostmydata.com" },
          { name: "Press", url: "https://ghostmydata.com/press" },
        ]}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Press Kit
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to cover GhostMyData. Company information,
              key statistics, executive bios, and brand guidelines.
            </p>
          </div>
        </section>

        {/* Company Overview */}
        <section className="py-16 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-white mb-6">
              Company Overview
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong className="text-white">GhostMyData</strong> is a data
                privacy platform that helps individuals find and remove their
                personal information from data brokers, breach databases, and the
                dark web. The platform scans 2,100+ data brokers — more than any
                competing service — and uses 24 AI agents to automate the removal
                process.
              </p>
              <p>
                Unlike manual removal services that rely on human operators,
                GhostMyData&apos;s AI-powered pipeline submits legally compliant
                removal requests (CCPA, GDPR, and state-specific), tracks
                response deadlines, escalates non-compliant brokers, and
                continuously monitors for re-listings.
              </p>
              <p>
                The company offers a free scan to see your exposure, a Pro
                plan at $9.99/month (billed annually), and an Enterprise plan
                with dark web monitoring, family plans, and daily monitoring at
                $22.50/month (billed annually).
              </p>
            </div>
          </div>
        </section>

        {/* Key Stats */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Key Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {keyStats.map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-2">
                    {item.stat}
                  </div>
                  <div className="text-gray-400 text-sm">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Description */}
        <section className="py-16 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-white mb-6">
              Product Description
            </h2>
            <div className="space-y-6">
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Short Description (50 words)
                </h3>
                <p className="text-gray-300 italic">
                  &quot;GhostMyData is a data privacy platform that scans 2,100+
                  data brokers to find your personal information and automatically
                  submits removal requests using AI agents. It monitors for
                  re-listings and includes dark web breach monitoring. Free tier
                  available, with Pro plans starting at $9.99/month.&quot;
                </p>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  One-Liner
                </h3>
                <p className="text-gray-300 italic">
                  &quot;GhostMyData removes your personal information from 2,100+
                  data brokers automatically using AI.&quot;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Executive Bio */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-white mb-8">
              Executive Team
            </h2>
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-emerald-400">
                      RK
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Rocky Kathuria
                  </h3>
                  <p className="text-emerald-400 font-medium mb-3">
                    Founder & CEO
                  </p>
                  <p className="text-gray-300">
                    Rocky Kathuria founded GhostMyData to solve the growing
                    challenge of personal data exposure online. With expertise in
                    data privacy regulations including CCPA and GDPR, Rocky leads
                    the company&apos;s product development and strategic direction.
                    He is available for interviews on data privacy, data broker
                    practices, and consumer privacy rights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Press Contact */}
        <section className="py-16 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-white mb-6">
              Press Contact
            </h2>
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <Mail className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">Media Inquiries</p>
                  <a
                    href="mailto:press@ghostmydata.com"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    press@ghostmydata.com
                  </a>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                We respond to press inquiries within 24 hours. For urgent
                requests, please include &quot;URGENT&quot; in the subject line.
              </p>
            </div>
          </div>
        </section>

        {/* Brand Assets */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-white mb-8">
              Brand Guidelines
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Logo</h3>
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 flex items-center gap-4">
                  <Shield className="h-12 w-12 text-emerald-500" />
                  <span className="text-2xl font-bold text-white">
                    GhostMyData
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Always display the shield icon alongside the wordmark. Do not
                  alter proportions or colors.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Brand Colors
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {brandColors.map((color) => (
                    <div key={color.name}>
                      <div
                        className="h-16 rounded-lg mb-2 border border-gray-700"
                        style={{ backgroundColor: color.hex }}
                      />
                      <p className="text-white text-sm font-medium">
                        {color.name}
                      </p>
                      <p className="text-gray-500 text-xs">{color.hex}</p>
                      <p className="text-gray-500 text-xs">{color.usage}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="py-16 bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-white mb-8">
              Recent Milestones
            </h2>
            <div className="space-y-6">
              {milestones.map((milestone, i) => (
                <div key={i} className="flex gap-6">
                  <div className="flex-shrink-0 w-16 text-right">
                    <span className="text-emerald-400 font-semibold">
                      {milestone.date}
                    </span>
                  </div>
                  <div className="flex-shrink-0 w-px bg-gray-700 relative">
                    <div className="absolute top-1 -left-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                  </div>
                  <div className="pb-6">
                    <h3 className="text-lg font-semibold text-white">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-400">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Want to Try GhostMyData?
            </h2>
            <p className="text-gray-300 mb-8">
              Start a free scan to see the platform in action. No credit card
              required.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
            >
              Start Free Scan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
