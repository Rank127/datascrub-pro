"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UpgradeBanner() {
  const router = useRouter();
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [exposureData, setExposureData] = useState<{
    activeExposures: number;
    maxExposureFound: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, statsRes] = await Promise.all([
          fetch("/api/subscription"),
          fetch("/api/dashboard/stats"),
        ]);
        if (subRes.ok) {
          const data = await subRes.json();
          setPlan(data.plan);
        }
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setExposureData({
            activeExposures: stats.stats?.activeExposures ?? 0,
            maxExposureFound: stats.maxExposure?.found ?? 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Don't show if loading or user is already on a paid plan
  if (loading || !plan || plan !== "FREE") {
    return null;
  }

  // Sidebar-only upgrade banner with both plan options
  return (
    <div className="mx-3 mb-4 p-4 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600">
      <div className="flex items-center gap-2 mb-2">
        <Crown className="h-4 w-4 text-yellow-500" />
        <span className="text-sm font-semibold text-white">Upgrade Your Plan</span>
      </div>
      <p className="text-xs text-slate-300 mb-3">
        {exposureData && exposureData.activeExposures > 0
          ? `You have ${exposureData.activeExposures} exposures. Upgrade to auto-remove them.`
          : "Unlock automated removals & monitoring"}
      </p>

      {/* Enterprise Row — Best Value */}
      <button
        type="button"
        className="w-full text-left p-2.5 rounded-lg border border-purple-500/40 bg-purple-500/10 mb-2 hover:bg-purple-500/20 transition-colors"
        onClick={() => router.push("/dashboard/checkout?plan=ENTERPRISE")}
      >
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs font-semibold text-purple-300">Enterprise</span>
          <span className="px-1.5 py-0.5 bg-purple-600 text-white text-[9px] font-bold rounded-full">Best Value</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-white">$22.50</span>
          <span className="text-[10px] text-slate-400">/mo</span>
          <span className="text-[10px] text-slate-500 line-through ml-1">$49.99</span>
          <span className="text-[9px] text-red-400 font-semibold ml-1">55% OFF</span>
        </div>
        <p className="text-[10px] text-purple-400/80 mt-0.5">Dark web monitoring, family plan & more</p>
      </button>

      {/* Pro Row */}
      <button
        type="button"
        className="w-full text-left p-2.5 rounded-lg border border-slate-600 bg-slate-700/30 mb-3 hover:bg-slate-700/50 transition-colors"
        onClick={() => router.push("/dashboard/checkout?plan=PRO")}
      >
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs font-semibold text-emerald-300">Pro</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-white">$9.99</span>
          <span className="text-[10px] text-slate-400">/mo</span>
          <span className="text-[10px] text-slate-500 line-through ml-1">$19.99</span>
          <span className="text-[9px] text-red-400 font-semibold ml-1">50% OFF</span>
        </div>
      </button>

      <Button
        size="sm"
        className="w-full bg-purple-600 hover:bg-purple-700 text-sm"
        onClick={() => router.push("/dashboard/checkout")}
      >
        <Sparkles className="h-3 w-3 mr-1" />
        Compare Plans
      </Button>
    </div>
  );
}
