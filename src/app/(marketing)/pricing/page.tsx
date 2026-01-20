import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, X } from "lucide-react";

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
    description: "Full protection for individuals",
    features: [
      { text: "Unlimited email scans", included: true },
      { text: "Unlimited phone scans", included: true },
      { text: "Full PII profile scanning", included: true },
      { text: "Automated removal requests", included: true },
      { text: "Weekly monitoring", included: true },
      { text: "10 scans per month", included: true },
      { text: "Priority support", included: true },
      { text: "Dark web monitoring", included: false },
    ],
    cta: "Start Free Trial",
    ctaLink: "/register",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$29.99",
    description: "Complete protection for families",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited scans", included: true },
      { text: "Dark web monitoring", included: true },
      { text: "Family plan (5 profiles)", included: true },
      { text: "Daily monitoring", included: true },
      { text: "Dedicated support", included: true },
      { text: "API access", included: true },
      { text: "Custom integrations", included: true },
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
      "Start with a free scan to see your exposure level. If you decide to upgrade, you'll get a 14-day free trial of the Pro or Enterprise plan with full access to all features.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal through our secure payment processor, Stripe.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 30-day money-back guarantee. If you're not satisfied with our service, contact support for a full refund.",
  },
  {
    question: "What's included in the family plan?",
    answer:
      "The Enterprise family plan allows you to protect up to 5 different people with their own profiles and monitoring. Perfect for protecting your whole household.",
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Choose the plan that fits your needs. Start free, upgrade when you&apos;re
          ready.
        </p>
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

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-slate-400">/month</span>
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

            <Link href={plan.ctaLink}>
              <Button
                className={`w-full ${
                  plan.popular
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
                size="lg"
              >
                {plan.cta}
              </Button>
            </Link>
          </div>
        ))}
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
  );
}
