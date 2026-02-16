"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Lock,
  CheckCircle,
  ArrowRight,
  Loader2,
  Crown,
  Zap,
  Users,
  Globe,
  Star,
  ArrowUpCircle,
} from "lucide-react";
import { LoadingSpinner } from "@/components/dashboard/loading-spinner";
import { trackBeginCheckout } from "@/components/analytics/google-analytics";
import { trackEvent, PostHogEvents } from "@/components/analytics/posthog-provider";

const PLANS = {
  PRO: {
    name: "Pro",
    badge: "Most Popular",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    price: "$9.99",
    originalPrice: "$19.99",
    period: "/mo",
    annualPrice: "$119.88/year",
    discount: "50% OFF",
    icon: <Zap className="h-6 w-6 text-emerald-400" />,
    features: [
      "50 scans per month",
      "Automated removal requests",
      "Weekly monitoring scans",
      "Priority support",
      "Email & form opt-out automation",
      "Removal tracking dashboard",
    ],
    color: "emerald",
  },
  ENTERPRISE: {
    name: "Enterprise",
    badge: "Maximum Protection",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    price: "$22.50",
    originalPrice: "$49.99",
    period: "/mo",
    annualPrice: "$269.95/year",
    discount: "55% OFF",
    icon: <Crown className="h-6 w-6 text-purple-400" />,
    features: [
      "Unlimited scans",
      "Automated removal from 2,000+ brokers",
      "Dark web monitoring",
      "Family plan — up to 5 profiles",
      "Daily monitoring",
      "API access",
      "Dedicated support & verification",
    ],
    color: "purple",
  },
} as const;

interface ProrationPreview {
  prorationAmount: number;
  newPlanPrice: number;
  currency: string;
  currentPeriodEnd: string | null;
  previousPlan: string;
  newPlan: string;
  lineItems: Array<{
    description: string;
    amount: number;
    period: { start: string; end: string };
  }>;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function daysUntil(isoDate: string): number {
  const now = new Date();
  const end = new Date(isoDate);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPlan = (searchParams.get("plan") || "ENTERPRISE").toUpperCase() as keyof typeof PLANS;
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof PLANS>(
    initialPlan in PLANS ? initialPlan : "ENTERPRISE"
  );
  const plan = PLANS[selectedPlan];
  const planKey = selectedPlan;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upgrade preview state
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [isUpgrade, setIsUpgrade] = useState(false);
  const [preview, setPreview] = useState<ProrationPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // On mount: check if user has an existing subscription
  useEffect(() => {
    async function checkForUpgrade() {
      try {
        const subRes = await fetch("/api/subscription");
        if (!subRes.ok) {
          setCheckingSubscription(false);
          return;
        }
        const subData = await subRes.json();

        // If user has an active Stripe subscription and is upgrading
        if (subData.hasStripeSubscription && subData.plan) {
          const hierarchy: Record<string, number> = { FREE: 0, PRO: 1, ENTERPRISE: 2 };
          const currentRank = hierarchy[subData.plan] ?? 0;
          const targetRank = hierarchy[planKey] ?? 0;

          if (targetRank > currentRank && currentRank > 0) {
            // This is an upgrade from a paid plan — fetch proration preview
            setIsUpgrade(true);
            try {
              const previewRes = await fetch("/api/stripe/preview-upgrade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan: planKey }),
              });
              const previewData = await previewRes.json();
              if (previewRes.ok) {
                setPreview(previewData);
              } else {
                setPreviewError(previewData.error || "Unable to preview upgrade cost.");
              }
            } catch {
              setPreviewError("Unable to preview upgrade cost.");
            }
          }
        }
      } catch {
        // If subscription check fails, fall through to normal checkout
      } finally {
        setCheckingSubscription(false);
      }
    }

    checkForUpgrade();
  }, [selectedPlan]);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    trackBeginCheckout(plan.name, parseFloat(plan.price.replace("$", "")));
    trackEvent(PostHogEvents.UPGRADE_CLICKED, { plan: planKey, source: "checkout_page" });

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, billingPeriod: "yearly" }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else if (data.upgraded) {
        // Direct upgrade (already had a subscription)
        router.push(`/dashboard/welcome?plan=${planKey}`);
      } else {
        setError(data.error || "Failed to start checkout. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isPro = selectedPlan === "PRO";

  // Show loading while checking subscription status
  if (checkingSubscription) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto" />
          <p className="text-slate-400 text-sm">Preparing your checkout...</p>
        </div>
      </div>
    );
  }

  // ── Upgrade confirmation UI for existing subscribers ──
  if (isUpgrade && preview) {
    const remainingDays = preview.currentPeriodEnd
      ? daysUntil(preview.currentPeriodEnd)
      : null;

    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4">
              <ArrowUpCircle className="h-8 w-8 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Confirm Your Upgrade
            </h1>
            <p className="text-slate-400">
              {preview.previousPlan} &rarr; {preview.newPlan}
            </p>
          </div>

          {/* Proration Card */}
          <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-slate-900 p-6 mb-6 animate-fade-in-up">
            {/* Amount due today */}
            <div className="text-center mb-6">
              <p className="text-sm text-slate-400 mb-1">Amount due today</p>
              <p className="text-4xl font-bold text-white">
                {formatCents(preview.prorationAmount)}
              </p>
              {remainingDays !== null && remainingDays > 0 && (
                <p className="text-sm text-slate-400 mt-1">
                  Prorated for the remaining {remainingDays} day{remainingDays !== 1 ? "s" : ""} of your billing cycle
                </p>
              )}
            </div>

            {/* Line items breakdown */}
            {preview.lineItems.length > 0 && (
              <div className="border-t border-slate-700 pt-4 mb-4 space-y-2">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Breakdown</p>
                {preview.lineItems.map((item, i) => (
                  <div key={i} className="flex items-start justify-between text-sm">
                    <span className="text-slate-300 flex-1 pr-4">{item.description}</span>
                    <span className={`font-mono whitespace-nowrap ${item.amount < 0 ? "text-emerald-400" : "text-white"}`}>
                      {item.amount < 0 ? "−" : ""}{formatCents(Math.abs(item.amount))}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Next charge info */}
            <div className="border-t border-slate-700 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Then starting next cycle</span>
                <span className="text-white font-semibold">
                  {PLANS[planKey]?.price || formatCents(preview.newPlanPrice)}/mo
                </span>
              </div>
              {preview.currentPeriodEnd && (
                <p className="text-xs text-slate-500 mt-1">
                  Next billing date: {new Date(preview.currentPeriodEnd).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-4 mb-6 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              <span>Encrypted</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>30-day guarantee</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span>Powered by Stripe</span>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}
            <Button
              size="lg"
              className="w-full text-base font-semibold h-12 bg-purple-600 hover:bg-purple-700 transition-transform hover:scale-[1.02]"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Confirm Upgrade &mdash; {formatCents(preview.prorationAmount)}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            <button
              type="button"
              className="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors py-2"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Upgrade flow but preview failed — show error with fallback ──
  if (isUpgrade && previewError) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-orange-500/20 border border-orange-500/30 mb-4">
            <ArrowUpCircle className="h-8 w-8 text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Upgrade to {plan.name}</h1>
          <p className="text-sm text-orange-400 mb-6">{previewError}</p>
          <p className="text-slate-400 text-sm mb-6">
            We couldn&apos;t calculate the exact prorated amount. You can proceed and Stripe will charge the prorated difference to your card on file.
          </p>
          <div className="space-y-3">
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            <Button
              size="lg"
              className="w-full text-base font-semibold h-12 bg-purple-600 hover:bg-purple-700"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Proceed with Upgrade
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            <button
              type="button"
              className="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors py-2"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Normal checkout flow for new subscribers (FREE → paid) ──
  const ENTERPRISE_EXTRAS = [
    "Dark web monitoring",
    "Family plan — up to 5 profiles",
    "AI Shield protection",
    "Daily monitoring",
    "API access",
    "Do Not Call registry",
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">
            Choose Your Protection
          </h1>
          <p className="text-slate-400">
            Select a plan and take control of your personal data
          </p>
        </div>

        {/* Plan Picker — Two Columns */}
        <div className="grid md:grid-cols-2 gap-6 mb-8 animate-fade-in-up">
          {/* Pro Card */}
          <button
            type="button"
            className={`text-left rounded-xl border-2 p-6 transition-all ${
              selectedPlan === "PRO"
                ? "border-emerald-500 bg-gradient-to-br from-emerald-900/30 to-slate-900 shadow-lg shadow-emerald-500/10"
                : "border-slate-700 bg-slate-800/50 hover:border-slate-500"
            }`}
            onClick={() => setSelectedPlan("PRO")}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/20">
                  <Zap className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Pro</h2>
                  <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full border mt-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    Most Popular
                  </span>
                </div>
              </div>
              <span className="px-2 py-1 bg-red-500/90 text-white text-xs font-bold rounded-full">
                50% OFF
              </span>
            </div>
            <div className="mb-5">
              <span className="text-sm text-slate-500 line-through">$19.99/mo</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">$9.99</span>
                <span className="text-slate-400">/mo</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">Billed annually at $119.88/year</div>
            </div>
            <ul className="space-y-2">
              {PLANS.PRO.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                  {feature}
                </li>
              ))}
            </ul>
          </button>

          {/* Enterprise Card — Recommended */}
          <button
            type="button"
            className={`relative text-left rounded-xl border-2 p-6 transition-all ${
              selectedPlan === "ENTERPRISE"
                ? "border-purple-500 bg-gradient-to-br from-purple-900/30 to-slate-900 shadow-lg shadow-purple-500/20 ring-1 ring-purple-500/30"
                : "border-slate-700 bg-slate-800/50 hover:border-slate-500"
            }`}
            onClick={() => setSelectedPlan("ENTERPRISE")}
          >
            {/* Recommended Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full shadow-lg shadow-purple-500/30">
                Recommended
              </span>
            </div>
            <div className="flex items-start justify-between mb-4 mt-1">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-500/20">
                  <Crown className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Enterprise</h2>
                  <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full border mt-1 bg-purple-500/20 text-purple-400 border-purple-500/30">
                    Maximum Protection
                  </span>
                </div>
              </div>
              <span className="px-2 py-1 bg-red-500/90 text-white text-xs font-bold rounded-full">
                55% OFF
              </span>
            </div>
            <div className="mb-5">
              <span className="text-sm text-slate-500 line-through">$49.99/mo</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">$22.50</span>
                <span className="text-slate-400">/mo</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">Billed annually at $269.95/year</div>
            </div>
            <ul className="space-y-2">
              {PLANS.ENTERPRISE.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle className="h-4 w-4 shrink-0 text-purple-400" />
                  {feature}
                </li>
              ))}
            </ul>
          </button>
        </div>

        {/* Why Enterprise? — only show when Enterprise is selected */}
        {selectedPlan === "ENTERPRISE" && (
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5 mb-8 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-purple-300">Why Enterprise?</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ENTERPRISE_EXTRAS.map((extra) => (
                <div key={extra} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0 text-purple-400" />
                  {extra}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Everything in Pro plus comprehensive protection for you and your entire family.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-5 gap-6">
          {/* Left Column — What Happens Next (3/5) */}
          <div className="md:col-span-3 space-y-6 animate-fade-in-up">
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="text-sm font-semibold text-white mb-4">What happens next</h3>
              <div className="space-y-4">
                {[
                  { step: "1", label: "Pay securely via Stripe", desc: "256-bit encrypted, PCI Level 1 compliant" },
                  { step: "2", label: "Account upgraded instantly", desc: "No waiting — features unlock immediately" },
                  { step: "3", label: "Run your first protected scan", desc: "Start removing your data right away" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isPro
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    }`}>
                      {item.step}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column — Trust Signals + CTA (2/5) */}
          <div className="md:col-span-2 space-y-5 animate-fade-in-up animation-delay-200">
            {/* Trust Badges */}
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Secure Checkout</h3>
              {[
                { icon: <Lock className="h-4 w-4 text-emerald-400" />, text: "256-bit encrypted checkout" },
                { icon: <Shield className="h-4 w-4 text-emerald-400" />, text: "30-day money-back guarantee" },
                { icon: <Globe className="h-4 w-4 text-blue-400" />, text: "Powered by Stripe — PCI Level 1" },
                { icon: <Users className="h-4 w-4 text-purple-400" />, text: "Trusted by thousands of users" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="p-1.5 rounded-md bg-slate-700/50">
                    {item.icon}
                  </div>
                  <span className="text-sm text-slate-300">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Cost Comparison */}
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-orange-400" />
                <h3 className="text-sm font-semibold text-orange-300">Why it pays for itself</h3>
              </div>
              <p className="text-sm text-slate-300 mb-2">
                The average identity theft victim spends <span className="text-white font-semibold">$1,343</span> out of pocket and <span className="text-white font-semibold">200+ hours</span> resolving it.
              </p>
              <p className="text-xs text-slate-400">
                Your protection costs just {plan.price}/mo (billed annually) — less than a coffee a week.
              </p>
            </div>

            {/* Testimonial */}
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
              <p className="text-sm text-slate-300 italic mb-3">
                &quot;Within a week of upgrading, GhostMyData had already removed my data from 15 broker sites. Worth every penny.&quot;
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                  M
                </div>
                <div>
                  <p className="text-xs font-medium text-white">Michael R.</p>
                  <p className="text-xs text-slate-500">Pro subscriber</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="space-y-3">
              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}
              <Button
                size="lg"
                className={`w-full text-base font-semibold h-12 transition-transform hover:scale-[1.02] ${
                  isPro
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-purple-600 hover:bg-purple-700 animate-glow-pulse"
                }`}
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Get {plan.name} — {plan.price}/mo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              <p className="text-xs text-slate-500 text-center">
                30-day money-back guarantee. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
