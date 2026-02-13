import type { Metadata } from "next";
import { CheckCircle, X, Zap, Shield, Star } from "lucide-react";
import { FAQSchema, PricingSchema } from "@/components/seo/structured-data";
import { PricingButton, PricingPageTracker } from "@/components/pricing/pricing-button";

export const metadata: Metadata = {
  title: "Pricing - Affordable Data Removal Plans",
  description:
    "Choose free, Pro ($11.99/mo), or Enterprise data removal plans. 40% off sale. Automated removal, continuous monitoring, and dark web protection.",
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
      "Affordable data removal plans starting free. Pro plan $11.99/mo with automated removal. 40% off introductory sale.",
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
    originalPrice: null,
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
    sale: false,
  },
  {
    name: "Pro",
    price: "$11.99",
    originalPrice: "$19.99",
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
    sale: true,
  },
  {
    name: "Enterprise",
    price: "$29.99",
    originalPrice: "$49.99",
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
    sale: true,
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
      "Yes. Cancel any time you want. You keep access until your paid period ends. No fees to cancel.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We take Visa, MasterCard, and American Express. We also take PayPal. All payments are safe with Stripe.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes. We have a 30-day money-back promise. If you're not happy, we refund you. Just ask support.",
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
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-full border border-orange-500/30 mb-6">
          <Zap className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-semibold text-orange-400">
            Limited Time: 40% OFF Flash Sale
          </span>
        </div>
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

      {/* Trust Bar */}
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
          <Star className="h-5 w-5 text-yellow-400" />
          <span className="text-sm font-medium">4.9/5 from 500+ reviews</span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-24">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative p-8 rounded-2xl ${
              plan.popular
                ? "bg-emerald-500/10 border-2 border-emerald-500"
                : "bg-slate-800/50 border border-slate-700"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 rounded-full text-sm font-semibold text-white">
                Most Popular
              </div>
            )}
            {plan.sale && (
              <div className="absolute -top-4 -right-4 px-3 py-1 bg-orange-500 rounded-full text-sm font-bold text-white">
                40% OFF
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="mb-2">
                {plan.originalPrice && (
                  <span className="text-lg text-slate-500 line-through mr-2">{plan.originalPrice}</span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400">/month</span>
                </div>
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
        ))}
      </div>

      {/* 30-Day Money-Back Guarantee */}
      <div className="max-w-2xl mx-auto mb-24 p-8 bg-slate-800/50 rounded-2xl border border-emerald-500/20 text-center">
        <Shield className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-3">30-Day Money-Back Guarantee</h2>
        <p className="text-slate-400 max-w-lg mx-auto">
          Try any paid plan completely risk-free. If you&apos;re not satisfied with our data removal service within 30 days, we&apos;ll give you a full refund — no questions asked.
        </p>
      </div>

      {/* FAQs */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="p-6 bg-slate-800/50 rounded-xl border border-slate-700"
            >
              <h3 className="text-lg font-semibold text-white mb-2">
                {faq.question}
              </h3>
              <p className="text-slate-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
