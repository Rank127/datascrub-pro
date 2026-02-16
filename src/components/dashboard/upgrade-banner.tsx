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

  // Sidebar-only upgrade banner (card variant removed per dashboard declutter)
  return (
    <div className="mx-3 mb-4 p-4 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30">
      <div className="flex items-center gap-2 mb-2">
        <Crown className="h-4 w-4 text-yellow-500" />
        <span className="text-sm font-semibold text-white">Upgrade to PRO</span>
      </div>
      <p className="text-xs text-slate-300 mb-1">
        {exposureData && exposureData.activeExposures > 0
          ? `You have ${exposureData.activeExposures} exposures on ${exposureData.maxExposureFound} sites. Upgrade to auto-remove them.`
          : "Unlock automated removals & weekly monitoring"}
      </p>
      {exposureData && exposureData.activeExposures > 0 && (
        <p className="text-[10px] text-orange-400 mb-2">Your data is being accessed daily</p>
      )}
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-xs text-slate-500 line-through">$19.99/mo</span>
        <span className="px-1.5 py-0.5 bg-red-500/90 text-white text-[10px] font-bold rounded-full">50% OFF</span>
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-lg font-bold text-white">$9.99</span>
        <span className="text-xs text-slate-400">/mo</span>
      </div>
      <p className="text-[10px] text-slate-500 mb-3">Billed annually at $119.88</p>
      <Button
        size="sm"
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm"
        onClick={() => router.push("/dashboard/checkout?plan=PRO")}
      >
        <Sparkles className="h-3 w-3 mr-1" />
        Upgrade Now
      </Button>
    </div>
  );
}
