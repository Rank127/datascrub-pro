"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, Users, QrCode, ArrowRight, Loader2 } from "lucide-react";
import { CORPORATE_TIERS } from "@/lib/corporate/types";

export default function CorporateWelcomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    }>
      <CorporateWelcomeContent />
    </Suspense>
  );
}

function CorporateWelcomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tier = searchParams.get("tier");
  const [tierData, setTierData] = useState<(typeof CORPORATE_TIERS)[0] | null>(null);

  useEffect(() => {
    if (tier) {
      const found = CORPORATE_TIERS.find((t) => t.id === tier);
      setTierData(found || null);
    }
  }, [tier]);

  if (!tierData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Loading your corporate account...</p>
          <button
            onClick={() => router.push("/dashboard/corporate-admin")}
            className="text-violet-400 hover:text-violet-300"
          >
            Go to Admin Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-violet-500/10 mb-6">
            <Shield className="w-10 h-10 text-violet-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Your Corporate Account is Ready!
          </h1>
          <p className="text-slate-400 text-lg">
            {tierData.name} Plan — {tierData.maxSeats} employee seats activated
          </p>
        </div>

        {/* Plan Details Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Plan Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-sm text-slate-400">Tier</p>
              <p className="text-lg font-semibold text-violet-400">{tierData.name}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-sm text-slate-400">Seats</p>
              <p className="text-lg font-semibold text-white">{tierData.maxSeats}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-sm text-slate-400">Per Seat/Month</p>
              <p className="text-lg font-semibold text-emerald-400">
                ${(tierData.perSeatMonthly / 100).toFixed(2)}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-sm text-slate-400">Savings vs Enterprise</p>
              <p className="text-lg font-semibold text-emerald-400">
                {tierData.savingsVsEnterprise}%
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="space-y-4 mb-8">
          <button
            onClick={() => router.push("/dashboard/corporate-admin")}
            className="w-full flex items-center gap-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl p-4 transition-colors"
          >
            <Users className="w-6 h-6 flex-shrink-0" />
            <div className="text-left flex-1">
              <p className="font-semibold">Invite Your Team</p>
              <p className="text-sm text-violet-200">
                Send email invitations to team members
              </p>
            </div>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => router.push("/dashboard/corporate-admin")}
            className="w-full flex items-center gap-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl p-4 transition-colors border border-slate-700"
          >
            <QrCode className="w-6 h-6 flex-shrink-0 text-violet-400" />
            <div className="text-left flex-1">
              <p className="font-semibold">Generate QR Codes</p>
              <p className="text-sm text-slate-400">
                Create QR codes for instant onboarding
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
