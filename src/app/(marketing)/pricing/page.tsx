import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, X, Shield } from "lucide-react";
import { FAQSchema, PricingSchema } from "@/components/seo/structured-data";
import { PricingButton, PricingPageTracker } from "@/components/pricing/pricing-button";
import { AnimatedSection, AnimatedCard } from "@/components/marketing/animated-sections";

export const metadata: Metadata = {
  title: "Pricing - Affordable Data Removal Plans",
  description:
    "Choose free, Pro ($9.99/mo billed annually), or Enterprise data removal plans. Up to 55% OFF. Automated removal, continuous monitoring, and dark web protection.",
  keywords: [
    "data removal pricing",
    "privacy protection cost",
    "data broker removal service price",
    "personal data removal plans",
    "cheap data removal service",
    "affordable privacy protection",
    "GhostMyData pricing",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/pricing",
  },
  openGraph: {
    title: "Pricing - GhostMyData Data Removal Plans",
    description:
      "Affordable data removal plans starting free. Pro plan $9.99/mo billed annually (50% OFF) with automated removal.",
    url: "https://ghostmydata.com/pricing",
    type: "website",
    images: [
      {
        url: "https://ghostmydata.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "GhostMyData Pricing - Data Removal Plans",
      },
    ],
  },
};

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Get started with basic data discovery",
    features: [
      { text: "1 email scan per month", included: true },
      { text: "1 phone scan per month", included: true },
      { text: "Basic exposure report", included: true },
      { text: "Manual removal guides", included: true },
      { text: "Automated removal requests", included: false },
      { text: "Continuous monitoring", included: false },
      { text: "Dark web monitoring", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started",
    ctaLink: "/register",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    originalPrice: "$19.99",
    annualPrice: "$119.88/year",
    description: "Full protection for individuals",
    features: [
      { text: "Unlimited email scans", included: true },
      { text: "Unlimited phone scans", included: true },
      { text: "Full PII profile scanning", included: true },
      { text: "Automated removal requests", included: true },
      { text: "Weekly monitoring", included: true },
      { text: "10 scans per month", included: true },
      { text: "Priority support", included: true },
      { text: "Do Not Call (DNC) registration", included: false },
    ],
    cta: "Start Free Trial",
    ctaLink: "/register",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$22.50",
    originalPrice: "$49.99",
    annualPrice: "$269.95/year",
    description: "Complete protection for families",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited scans", included: true },
      { text: "Dark web monitoring", included: true },
      { text: "AI Shield - deepfake defense (50+ sources)", included: true },
      { text: "Do Not Call (DNC) registration", included: true },
      { text: "Family plan (5 profiles)", included: true },
      { text: "Dedicated support", included: true },
      { text: "Custom removal requests", included: true },
      { text: "API access", included: true },
    ],
    cta: "Start Free Trial",
    ctaLink: "/register",
    popular: false,
  },
];

const faqs = [
  {
    question: "How does the free trial work?",
    answer:
      "Start with a free scan to see your data. Then try Pro or Enterprise free for 14 days. No credit card needed to start.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. All paid plans are billed annually. Cancel any time you want. Within 30 days of purchase, you get a full refund. After 30 days, you keep access until your annual period ends. No fees to cancel.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We take Visa, MasterCard, and American Express. We also take PayPal. All payments are safe with Stripe.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes. Full refund within 30 days of purchase, no questions asked. After 30 days, you keep full access until your annual billing period ends — no partial refunds.",
  },
  {
    question: "What's in the family plan?",
    answer:
      "The Enterprise plan covers up to 5 people. Each person gets their own profile. Great for families.",
  },
  {
    question: "How fast does removal work?",
    answer:
      "Most sites process requests in 2-4 weeks. Some are faster. We keep you updated on every request.",
  },
  {
    question: "How many sites do you scan?",
    answer:
      "We scan 2,100+ data broker sites. This includes Spokeo, WhitePages, and BeenVerified. We also check the dark web.",
  },
  {
    question: "Is my data safe with you?",
    answer:
      "Yes. We use bank-grade encryption. We never sell your data. Your info is locked down tight.",
  },
  {
    question: "What happens after data is removed?",
    answer:
      "We keep monitoring to make sure your data stays gone. If a site re-lists you, we send another removal request automatically. You stay protected.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Yes, you can change plans any time. When you upgrade, you get instant access to new features. When you downgrade, changes apply at the next billing cycle.",
  },
];

export default function PricingPage() {
  return (
    <>
      <FAQSchema faqs={faqs} />
      <PricingSchema />
      <PricingPageTracker />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Header */}
      <AnimatedSection>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Start free and upgrade when you&apos;re
            ready. All plans include our data removal service to help delete your data from the web.
          </p>
          <p className="text-lg text-slate-500 max-w-xl mx-auto mt-4">
            No hidden fees. No contracts. Cancel any time. We scan 2,100+ data broker sites to find and remove your info.
            Every plan includes our easy-to-use dashboard where you can track removal progress in real time.
          </p>
        </div>
      </AnimatedSection>

      {/* Trust Bar */}
      <AnimatedSection>
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          <div className="flex items-center gap-2 text-slate-400">
            <Shield className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-medium">2,100+ data sources scanned</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-medium">30-day money-back guarantee</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-medium">Trusted by thousands of users</span>
          </div>
        </div>
      </AnimatedSection>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-24">
        {plans.map((plan, index) => (
          <AnimatedCard key={plan.name} delay={(index + 1) * 100 as 100 | 200 | 300}>
            <div
              className={`relative p-8 rounded-2xl h-full ${
                plan.popular
                  ? "bg-emerald-500/10 border-2 border-emerald-500 animate-border-glow glow-emerald scale-105"
                  : "bg-slate-800/50 border border-slate-700 card-hover-glow"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full text-sm font-semibold text-white shadow-lg glow-emerald-sm">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  {plan.originalPrice && plan.name === "Pro" && (
                    <span className="px-2 py-0.5 bg-red-500/90 text-white text-xs font-bold rounded-full">50% OFF</span>
                  )}
                  {plan.originalPrice && plan.name === "Enterprise" && (
                    <span className="px-2 py-0.5 bg-red-500/90 text-white text-xs font-bold rounded-full">55% OFF</span>
                  )}
                </div>
                <div className="mb-2">
                  {plan.originalPrice && (
                    <div className="text-sm text-slate-500 line-through">{plan.originalPrice}/month</div>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400">/mo</span>
                  </div>
                  {(plan as typeof plans[number] & { annualPrice?: string }).annualPrice && (
                    <div className="text-xs text-slate-500 mt-1">Billed annually at {(plan as typeof plans[number] & { annualPrice?: string }).annualPrice}</div>
                  )}
                </div>
                <p className="text-slate-400">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3">
                    {feature.included ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span
                      className={
                        feature.included ? "text-slate-300" : "text-slate-500"
                      }
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <PricingButton
                planName={plan.name}
                price={parseFloat(plan.price.replace("$", "")) || 0}
                ctaText={plan.cta}
                ctaLink={plan.ctaLink}
                popular={plan.popular}
              />
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* 30-Day Money-Back Guarantee */}
      <AnimatedSection>
        <div className="max-w-2xl mx-auto mb-24 p-8 bg-slate-800/50 rounded-2xl border border-emerald-500/20 text-center card-hover-glow">
          <Shield className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">30-Day Money-Back Guarantee</h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Try any paid plan completely risk-free. If you&apos;re not satisfied with our data removal service within 30 days, we&apos;ll give you a full refund — no questions asked.
          </p>
        </div>
      </AnimatedSection>

      {/* FAQs */}
      <AnimatedSection>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 card-hover-glow"
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-slate-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </div>
    </>
  );
}
