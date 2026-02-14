"use client";

import { FAQSchema } from "@/components/seo/structured-data";

const faqs = [
  {
    question: "How does GhostMyData find my info?",
    answer: "We scan 2,100+ sites. We check Spokeo, WhitePages, and more. We also check breach databases and the dark web. We search for your emails, phones, names, and addresses.",
  },
  {
    question: "How long does removal take?",
    answer: "Most removals take 1-7 days. Some sites take 2-4 weeks. We keep watching and resend requests if your data comes back.",
  },
  {
    question: "Is my info safe with you?",
    answer: "Yes. We use AES-256 encryption. Your data is locked at rest and in transit. We never sell it. We use SOC 2 Type II servers.",
  },
  {
    question: "Can I try it for free?",
    answer: "Yes. Our free plan scans for your data. You get removal guides too. No card needed. Upgrade anytime.",
  },
  {
    question: "What do paid plans add?",
    answer: "Paid plans automate removals. You get ongoing monitoring. Enterprise adds dark web alerts and priority support.",
  },
  {
    question: "Will my data stay gone?",
    answer: "Brokers keep collecting data. Your info may come back. That's why we monitor. We send new removal requests when needed.",
  },
  {
    question: "Do you send CCPA and GDPR requests?",
    answer: "Yes. We send legal removal requests for you. CCPA is for California. GDPR is for Europe. Companies must honor these.",
  },
  {
    question: "Can I protect my family?",
    answer: "Yes. Enterprise covers up to 5 people. Each person gets their own scans and dashboard.",
  },
];

export function FAQSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <FAQSchema faqs={faqs} />
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Everything you need to know about protecting your personal data
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {faqs.map((faq) => (
          <div
            key={faq.question}
            className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 card-hover-glow"
          >
            <h3 className="text-lg font-semibold text-white mb-3">
              {faq.question}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
