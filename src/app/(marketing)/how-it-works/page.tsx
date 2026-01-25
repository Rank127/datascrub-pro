import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  User,
  Search,
  ListChecks,
  Trash2,
  Shield,
  Bell,
  CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works - 5-Step Data Removal Process",
  description:
    "Learn how GhostMyData removes your personal data in 5 simple steps: Create profile, scan 2,000+ sources, review exposures, automated removal, and continuous monitoring.",
  keywords: [
    "how data removal works",
    "data broker opt out process",
    "remove personal information online",
    "automated data removal",
    "personal data scan",
    "data exposure monitoring",
    "CCPA removal process",
    "GDPR data deletion",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/how-it-works",
  },
  openGraph: {
    title: "How GhostMyData Works - 5-Step Data Removal",
    description:
      "Our automated 5-step process finds and removes your data from 2,000+ sources with 98% success rate.",
    url: "https://ghostmydata.com/how-it-works",
    type: "website",
    images: [
      {
        url: "https://ghostmydata.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "How GhostMyData Works - Data Removal Process",
      },
    ],
  },
};

const steps = [
  {
    number: 1,
    icon: User,
    title: "Create Your Profile",
    description:
      "Enter your personal information including email addresses, phone numbers, names, and addresses. All data is encrypted with AES-256 encryption.",
    details: [
      "Add multiple email addresses",
      "Include past addresses",
      "Add aliases and maiden names",
      "Optional: SSN for dark web monitoring",
    ],
  },
  {
    number: 2,
    icon: Search,
    title: "Run a Comprehensive Scan",
    description:
      "Our system searches across 2,000+ data sources including data brokers, breach databases, dark web forums, social media platforms, and 60 AI Shield sources.",
    details: [
      "2,000+ data brokers (Spokeo, WhitePages, etc.)",
      "Breach databases (Have I Been Pwned, LeakCheck)",
      "Dark web marketplaces and forums",
      "60 AI Shield sources (5 categories)",
    ],
  },
  {
    number: 3,
    icon: ListChecks,
    title: "Review Your Exposures",
    description:
      "View a detailed report of everywhere your personal information was found, sorted by severity and risk level.",
    details: [
      "Risk score based on exposure severity",
      "Detailed preview of exposed data",
      "Source URLs and verification",
      "Whitelist accounts you want to keep",
    ],
  },
  {
    number: 4,
    icon: Trash2,
    title: "Automated Removal",
    description:
      "We automatically submit opt-out requests to data brokers and send CCPA/GDPR removal requests on your behalf.",
    details: [
      "One-click removal requests",
      "Automated form submissions",
      "CCPA/GDPR compliant requests",
      "Track removal progress",
    ],
  },
  {
    number: 5,
    icon: Bell,
    title: "Continuous Monitoring",
    description:
      "Our system continuously monitors for new exposures and alerts you immediately when your data appears somewhere new.",
    details: [
      "Weekly or daily scans",
      "Instant email alerts",
      "Monthly protection reports",
      "Re-scan and verify removals",
    ],
  },
];

const guarantees = [
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "Your data is protected with AES-256 encryption and never shared.",
  },
  {
    icon: CheckCircle,
    title: "98% Success Rate",
    description: "Our automated removal system has a 98% success rate with data brokers.",
  },
  {
    icon: Bell,
    title: "24/7 Monitoring",
    description: "Continuous monitoring ensures you're always protected against new exposures.",
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How GhostMyData Works
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Our 5-step process finds and removes your personal data from across
            the internet, then keeps you protected with continuous monitoring.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-800 hidden md:block" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`flex flex-col md:flex-row gap-8 items-start ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Step number indicator */}
                <div className="hidden md:flex flex-1 justify-end">
                  {index % 2 === 0 && (
                    <div className="max-w-md text-right">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-slate-400 mb-4">{step.description}</p>
                      <ul className="space-y-2">
                        {step.details.map((detail) => (
                          <li
                            key={detail}
                            className="flex items-center justify-end gap-2 text-slate-300"
                          >
                            {detail}
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Center icon */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border-4 border-slate-950">
                    <step.icon className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                    {step.number}
                  </div>
                </div>

                <div className="flex-1 md:hidden">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 mb-4">{step.description}</p>
                  <ul className="space-y-2">
                    {step.details.map((detail) => (
                      <li
                        key={detail}
                        className="flex items-center gap-2 text-slate-300"
                      >
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="hidden md:flex flex-1">
                  {index % 2 === 1 && (
                    <div className="max-w-md">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-slate-400 mb-4">{step.description}</p>
                      <ul className="space-y-2">
                        {step.details.map((detail) => (
                          <li
                            key={detail}
                            className="flex items-center gap-2 text-slate-300"
                          >
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Our Guarantee
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {guarantees.map((guarantee) => (
              <div
                key={guarantee.title}
                className="text-center p-6 bg-slate-800/50 rounded-xl border border-slate-700"
              >
                <div className="inline-flex p-4 bg-emerald-500/10 rounded-full mb-4">
                  <guarantee.icon className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {guarantee.title}
                </h3>
                <p className="text-slate-400">{guarantee.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Take Control?
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            Start with a free scan to see where your data is exposed. No credit
            card required.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8">
              Start Your Free Scan
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
