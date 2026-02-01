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
import { FAQSchema } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "How It Works - 5-Step Data Removal Process",
  description:
    "See how GhostMyData removes your data in 5 steps: profile, scan, review, auto removal, and 24/7 monitoring.",
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
      "Our automated 5-step process finds and removes your data from 2,100+ sources with 98% success rate.",
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
      "Add your info: emails, phones, names, and addresses. We lock it with AES-256. Your data stays safe with us.",
    details: [
      "Add many email addresses",
      "Include past addresses",
      "Add other names you use",
      "SSN for dark web scans (optional)",
    ],
  },
  {
    number: 2,
    icon: Search,
    title: "Run a Full Scan",
    description:
      "Our data broker removal system searches 2,100+ sites for your data. We check data brokers, breach databases, and the dark web.",
    details: [
      "2,100+ data brokers checked",
      "Breach databases scanned",
      "Dark web forums searched",
      "60 AI Shield sources",
    ],
  },
  {
    number: 3,
    icon: ListChecks,
    title: "See Your Results",
    description:
      "View a report of all places your data was found. We sort by risk level so you know what matters most.",
    details: [
      "Risk scores for each exposure",
      "Preview of exposed data",
      "Source links for proof",
      "Keep accounts you want",
    ],
  },
  {
    number: 4,
    icon: Trash2,
    title: "Auto Removal",
    description:
      "Our data removal service sends opt-out requests to all sites. We send CCPA and GDPR requests to remove personal information for you.",
    details: [
      "One-click removal",
      "Auto form filling",
      "Legal requests sent",
      "Track your progress",
    ],
  },
  {
    number: 5,
    icon: Bell,
    title: "Always Watching",
    description:
      "We keep scanning for new exposures. When your data shows up again, we alert you right away.",
    details: [
      "Daily or weekly scans",
      "Instant email alerts",
      "Monthly reports",
      "Verify removals worked",
    ],
  },
];

const guarantees = [
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "Our privacy protection uses AES-256 encryption. We never share your data.",
  },
  {
    icon: CheckCircle,
    title: "98% Success Rate",
    description: "Our data removal service removes data from 98% of data broker sites.",
  },
  {
    icon: Bell,
    title: "24/7 Monitoring",
    description: "We watch for new exposures all day. We help you remove personal information fast.",
  },
];

const faqs = [
  {
    question: "How does GhostMyData find my data?",
    answer: "We scan 2,100+ sites using your name, email, phone, and addresses. We check data brokers, breach databases, and the dark web. Our system finds where your data is exposed.",
  },
  {
    question: "How long does removal take?",
    answer: "Scans finish in minutes. We send removal requests right away. Most data brokers take 1-7 days to remove your data. Some take up to 45 days. We track and follow up on all requests.",
  },
  {
    question: "What info do I need to give?",
    answer: "You need at least your name and email. For a full scan, add phone numbers and addresses. You can also add other names you use. We encrypt all your data with AES-256.",
  },
  {
    question: "Is my data safe with you?",
    answer: "Yes. We use bank-level AES-256 encryption. We only use your info to find and remove your data. We never sell or share it. We follow SOC 2 rules.",
  },
  {
    question: "What happens after removal?",
    answer: "We keep watching for new exposures. Data brokers often re-add info from public records. We alert you if your data shows up again. Then we send new removal requests.",
  },
  {
    question: "Do I need tech skills?",
    answer: "No. GhostMyData is made for everyone. Just create a profile and run a scan. We do the rest. We find exposures, send removal requests, and watch for new data.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
    <FAQSchema faqs={faqs} />
    <div>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How GhostMyData Works
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Our data removal service uses a 5-step process to remove personal information from data brokers.
            We help you delete my data online and provide privacy protection with ongoing monitoring.
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

      {/* FAQ Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="p-6 bg-slate-800/50 rounded-xl border border-slate-700"
            >
              <h3 className="text-lg font-semibold text-white mb-3">
                {faq.question}
              </h3>
              <p className="text-slate-400 text-sm">{faq.answer}</p>
            </div>
          ))}
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
    </>
  );
}
