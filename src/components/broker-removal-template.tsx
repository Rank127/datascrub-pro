import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Clock, Shield, AlertTriangle } from "lucide-react";
import { HowToSchema, FAQSchema, BreadcrumbSchema, HowToStep } from "@/components/seo/structured-data";

export interface RelatedBroker {
  name: string;
  slug: string;
}

export interface BrokerInfo {
  name: string;
  slug: string;
  description: string;
  dataCollected: string[];
  risks: string[];
  optOutUrl: string;
  optOutTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  steps: HowToStep[];
  faqs: { question: string; answer: string }[];
  lastUpdated: string;
  relatedBrokers?: RelatedBroker[];
}

/**
 * Parse ISO 8601 duration (e.g. PT336H, PT48H, PT72H) to human-readable text.
 */
function formatOptOutTime(iso: string): string {
  const match = iso.match(/^PT(\d+)H$/);
  if (!match) return iso;
  const hours = parseInt(match[1], 10);
  if (hours < 24) return `${hours} hours`;
  if (hours === 24) return "24 hours";
  const days = Math.round(hours / 24);
  if (days <= 2) return "1-2 days";
  if (days <= 3) return "2-3 days";
  if (days <= 5) return "3-5 days";
  if (days <= 7) return "3-7 days";
  if (days <= 14) return "7-14 days";
  if (days <= 30) return "7-30 days";
  return `${days} days`;
}

export function BrokerRemovalTemplate({ broker }: { broker: BrokerInfo }) {
  const breadcrumbs = [
    { name: "Home", url: "https://ghostmydata.com" },
    { name: "Remove From", url: "https://ghostmydata.com/remove-from" },
    { name: `Remove from ${broker.name}`, url: `https://ghostmydata.com/remove-from/${broker.slug}` },
  ];

  const readableTime = formatOptOutTime(broker.optOutTime);
  const firstStepSummary = broker.steps.length > 0
    ? broker.steps[0].text.split(".")[0]
    : "visit their opt-out page";

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <HowToSchema
        name={`How to Remove Yourself from ${broker.name}`}
        description={`Step-by-step guide to remove your personal information from ${broker.name}. Learn the opt-out process and protect your privacy.`}
        totalTime={broker.optOutTime}
        steps={broker.steps}
      />
      <FAQSchema faqs={broker.faqs} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300">Home</Link>
          <span>/</span>
          <Link href="/remove-from" className="hover:text-slate-300">Remove From</Link>
          <span>/</span>
          <span className="text-slate-400">{broker.name}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm border border-emerald-500/20">
              Data Broker Removal
            </span>
            <span className={`px-3 py-1 rounded-full text-sm border ${
              broker.difficulty === "Easy"
                ? "bg-green-500/10 text-green-400 border-green-500/20"
                : broker.difficulty === "Medium"
                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}>
              {broker.difficulty} Removal
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How to Remove Yourself from {broker.name} (2026 Guide)
          </h1>

          <p className="text-xl text-slate-400 mb-6">{broker.description}</p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Processing time: {readableTime}
            </span>
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Last updated: {broker.lastUpdated}
            </span>
          </div>
        </header>

        {/* Quick Answer / TL;DR for AI search extraction */}
        <div className="mb-12 p-5 bg-slate-800/50 border border-slate-700 rounded-xl">
          <p className="text-sm font-semibold text-emerald-400 mb-2">Quick Answer</p>
          <p className="text-slate-300">
            To remove yourself from {broker.name}, {firstStepSummary.toLowerCase()}, then follow their opt-out process to submit your removal request.
            The process is rated <strong className="text-white">{broker.difficulty.toLowerCase()}</strong> difficulty and typically takes <strong className="text-white">{readableTime}</strong> to complete.
            {broker.name} is one of 4,000+ data brokers that may have your information — use <Link href="/register" className="text-emerald-400 hover:text-emerald-300 underline">GhostMyData</Link> to remove your data from all of them automatically.
          </p>
        </div>

        {/* Quick Action Box */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 mb-12">
          <h2 className="text-xl font-bold text-white mb-3">Skip the Manual Process</h2>
          <p className="text-slate-400 mb-4">
            GhostMyData automatically removes your data from {broker.name} and 2,100+ other data brokers.
            One-click removal, continuous monitoring, 98% success rate.
          </p>
          <Link href="/register">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Remove My Data Automatically
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* What Data They Collect */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            What Information Does {broker.name} Collect?
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {broker.dataCollected.map((item) => (
              <div key={item} className="flex items-center gap-2 text-slate-300">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Risks */}
        <section className="mb-12 p-6 bg-red-500/5 border border-red-500/20 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-4">
            Why You Should Remove Your Data from {broker.name}
          </h2>
          <ul className="space-y-3">
            {broker.risks.map((risk) => (
              <li key={risk} className="flex items-start gap-2 text-slate-300">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                {risk}
              </li>
            ))}
          </ul>
        </section>

        {/* Step by Step Guide */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            Step-by-Step Removal Guide
          </h2>
          <div className="space-y-6">
            {broker.steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{step.name}</h3>
                  <p className="text-slate-400">{step.text}</p>
                  {step.url && (
                    <a
                      href={step.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 mt-2"
                    >
                      Visit Link <ArrowRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Important Notes */}
        <section className="mb-12 p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-4">Important Notes</h2>
          <ul className="space-y-2 text-slate-400">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              You may have multiple listings - each requires a separate opt-out request
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              Your information may reappear if {broker.name} obtains new data
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              {broker.name} is just one of 4,000+ data brokers - your data is likely on dozens more
            </li>
          </ul>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {broker.faqs.map((faq) => (
              <div key={faq.question} className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-slate-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Guides */}
        {broker.relatedBrokers && broker.relatedBrokers.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">
              Also Remove Yourself From
            </h2>
            <p className="text-slate-400 mb-6">
              Your data is likely on these similar sites too. Remove yourself from all of them to fully protect your privacy.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {broker.relatedBrokers.map((related) => (
                <Link
                  key={related.slug}
                  href={`/remove-from/${related.slug}`}
                  className="group flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-emerald-500/50 transition-colors"
                >
                  <span className="text-slate-300 group-hover:text-emerald-400 transition-colors font-medium">
                    Remove from {related.name}
                  </span>
                  <ArrowRight className="h-4 w-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-4">
              <Link href="/remove-from" className="text-emerald-400 hover:text-emerald-300 underline">
                View all broker removal guides
              </Link>
            </p>
          </section>
        )}

        {/* CTA */}
        <div className="text-center p-8 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl border border-emerald-500/20">
          <h2 className="text-2xl font-bold text-white mb-4">
            Remove Your Data from {broker.name} + 2,100+ More Sites
          </h2>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            Manual removal is time-consuming and requires constant vigilance.
            GhostMyData automates the entire process with continuous monitoring.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8">
                Start Your Free Scan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/compare" className="text-slate-400 hover:text-emerald-400 text-sm underline">
              Compare automated removal services
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
