import type { Metadata } from "next";
import { PrivacyScoreQuiz } from "@/components/marketing/privacy-score-quiz";
import { Shield, CheckCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Privacy Score Tool | Check Your Online Privacy Risk",
  description:
    "Take our free 2-minute privacy quiz to discover your online privacy risk score. Find out how exposed your personal data is and get personalized recommendations.",
  keywords: [
    "privacy score",
    "privacy quiz",
    "online privacy test",
    "data privacy check",
    "personal data exposure",
    "privacy risk assessment",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/privacy-score",
  },
  openGraph: {
    title: "Free Privacy Score Tool - GhostMyData",
    description:
      "Take our free 2-minute quiz to discover your online privacy risk score.",
    url: "https://ghostmydata.com/privacy-score",
    type: "website",
  },
};

export default function PrivacyScorePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-6">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-400">Free Privacy Tool</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              What&apos;s Your Privacy Score?
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Take this 2-minute quiz to discover how exposed your personal data is online.
              Get personalized recommendations to protect yourself.
            </p>
          </div>

          {/* Quiz Component */}
          <PrivacyScoreQuiz />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Why Check Your Privacy Score?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Understand Your Risk",
                description:
                  "Know exactly how vulnerable your personal information is to data brokers, hackers, and scammers.",
              },
              {
                title: "Get Actionable Advice",
                description:
                  "Receive personalized recommendations based on your specific privacy habits and exposure level.",
              },
              {
                title: "Take Control",
                description:
                  "Learn the steps you can take today to reduce your digital footprint and protect your identity.",
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="p-6 bg-slate-800/50 rounded-xl border border-slate-700"
              >
                <CheckCircle className="h-8 w-8 text-emerald-500 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-slate-400 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Want to See Your Actual Exposed Data?
          </h2>
          <p className="text-slate-400 mb-8">
            The quiz gives you a risk estimate. Our free scan shows you exactly where your personal
            information appears on data broker sites, breach databases, and the dark web.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
          >
            Run Free Data Scan
            <Shield className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
