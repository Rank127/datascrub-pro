"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Search,
  Bell,
  Users,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { LoadingSpinner } from "@/components/dashboard/loading-spinner";

const PLAN_NAMES: Record<string, string> = {
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

export default function WelcomePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <WelcomeContent />
    </Suspense>
  );
}

function WelcomeContent() {
  const searchParams = useSearchParams();
  const planKey = (searchParams.get("plan") || "PRO").toUpperCase();
  const planName = PLAN_NAMES[planKey] || "Pro";
  const isEnterprise = planKey === "ENTERPRISE";

  const steps = [
    {
      icon: <Search className="h-6 w-6 text-emerald-400" />,
      title: "Run Your First Protected Scan",
      description: "Discover where your personal data is exposed across 2,000+ sites",
      href: "/dashboard/scan",
      primary: true,
    },
    {
      icon: <Bell className="h-6 w-6 text-blue-400" />,
      title: "Set Up Monitoring Alerts",
      description: "Get notified instantly when new exposures are detected",
      href: "/dashboard/settings",
      primary: false,
    },
    ...(isEnterprise
      ? [
          {
            icon: <Users className="h-6 w-6 text-purple-400" />,
            title: "Invite Family Members",
            description: "Protect up to 5 family members under your plan",
            href: "/dashboard/settings",
            primary: false,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl text-center">
        {/* Confetti-like dots */}
        <div className="relative mb-8">
          {/* Decorative floating dots */}
          <div className="absolute -top-4 left-1/4 w-2 h-2 rounded-full bg-emerald-400/60 animate-float" />
          <div className="absolute -top-2 right-1/3 w-1.5 h-1.5 rounded-full bg-purple-400/60 animate-float animation-delay-200" />
          <div className="absolute top-0 left-1/3 w-1 h-1 rounded-full bg-blue-400/60 animate-float animation-delay-400" />
          <div className="absolute -top-3 right-1/4 w-2.5 h-2.5 rounded-full bg-yellow-400/40 animate-float animation-delay-300" />
          <div className="absolute -top-1 left-[45%] w-1.5 h-1.5 rounded-full bg-emerald-300/50 animate-float animation-delay-500" />
          <div className="absolute top-2 right-[40%] w-1 h-1 rounded-full bg-pink-400/50 animate-float animation-delay-100" />

          {/* Animated Shield */}
          <div className="inline-flex items-center justify-center animate-scale-in">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 animate-glow-pulse">
                <Shield className="h-12 w-12 text-emerald-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center animate-scale-in animation-delay-300">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="animate-fade-in-up animation-delay-200">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="text-gradient-emerald">
              Welcome to {planName}!
            </span>
          </h1>
          <p className="text-lg text-slate-400 mb-2">
            Your privacy protection is now active
          </p>
          <p className="text-sm text-slate-500">
            Let&apos;s get you started with your first protected scan
          </p>
        </div>

        {/* Get Started Cards */}
        <div className="mt-10 space-y-4 animate-fade-in-up animation-delay-400">
          {steps.map((step, _index) => (
            <Link key={step.title} href={step.href} className="block group">
              <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                step.primary
                  ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15 hover:border-emerald-500/50"
                  : "bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600"
              }`}>
                <div className={`p-3 rounded-lg shrink-0 ${
                  step.primary ? "bg-emerald-500/20" : "bg-slate-700/50"
                }`}>
                  {step.icon}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {step.description}
                  </p>
                </div>
                <ArrowRight className={`h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 ${
                  step.primary ? "text-emerald-400" : "text-slate-500"
                }`} />
              </div>
              {step.primary && (
                <div className="mt-2">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 animate-glow-pulse h-11 text-sm font-semibold">
                    <Search className="mr-2 h-4 w-4" />
                    Start My First Scan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Trust Line */}
        <div className="mt-8 animate-fade-in animation-delay-600">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Lock className="h-3 w-3" />
            <span>Your data is protected by AES-256 encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}
