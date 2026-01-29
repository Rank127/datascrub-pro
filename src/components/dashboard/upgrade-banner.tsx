"use client";

import { useState, useEffect } from "react";
import { Crown, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UpgradeBanner() {
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch("/api/subscription");
        if (response.ok) {
          const data = await response.json();
          setPlan(data.plan);
        }
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "PRO" }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to start checkout. Please try again.");
        console.error("Checkout error:", data);
      }
    } catch (err) {
      setError("Connection error. Please try again.");
      console.error("Failed to start checkout:", err);
    } finally {
      setUpgradeLoading(false);
    }
  };

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
      <p className="text-xs text-slate-300 mb-3">
        Unlock automated removals & weekly monitoring
      </p>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-xs text-slate-500 line-through">$19.99</span>
        <span className="text-lg font-bold text-white">$11.99</span>
        <span className="text-xs text-slate-400">/mo</span>
        <span className="ml-1 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded">
          40% OFF
        </span>
      </div>
      {error && (
        <p className="text-xs text-red-400 mb-2">{error}</p>
      )}
      <Button
        size="sm"
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm"
        onClick={handleUpgrade}
        disabled={upgradeLoading}
      >
        {upgradeLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Sparkles className="h-3 w-3 mr-1" />
            Upgrade Now
          </>
        )}
      </Button>
    </div>
  );
}
