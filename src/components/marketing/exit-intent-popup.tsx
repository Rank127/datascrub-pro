"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Shield, ArrowRight, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      // Only trigger when mouse leaves through the top of the viewport
      if (e.clientY <= 0 && !hasShown) {
        // Check if already shown this session
        const shown = sessionStorage.getItem("exitPopupShown");
        if (!shown) {
          setIsVisible(true);
          setHasShown(true);
          sessionStorage.setItem("exitPopupShown", "true");
        }
      }
    },
    [hasShown]
  );

  useEffect(() => {
    // Don't show on mobile
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return;
    }

    // Check if already shown
    const shown = sessionStorage.getItem("exitPopupShown");
    if (shown) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasShown(true);
      return;
    }

    // Add delay before enabling exit intent (5 seconds)
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseLeave]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-blue-500" />

        <div className="p-8 text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
            <Gift className="h-8 w-8 text-emerald-400" />
          </div>

          {/* Headline */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Wait! Don&apos;t Leave Exposed
          </h2>

          {/* Subheadline */}
          <p className="text-slate-400 mb-6 max-w-sm mx-auto">
            Your personal data is being sold right now. See exactly where
            you&apos;re exposed with a free scan — no credit card required.
          </p>

          {/* Offer box */}
          <div className="bg-slate-700/50 rounded-xl p-4 mb-6 border border-slate-600">
            <div className="flex items-center justify-center gap-3">
              <Shield className="h-6 w-6 text-emerald-500" />
              <div className="text-left">
                <div className="text-white font-semibold">Free Privacy Scan</div>
                <div className="text-sm text-slate-400">
                  Scan <span className="text-emerald-400 font-bold">2,100+ data sources</span> in 60 seconds
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link href="/register" className="block">
              <Button
                size="lg"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg"
              >
                Start Free Scan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <button
              onClick={handleClose}
              className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
            >
              No thanks, I&apos;ll check back later
            </button>
          </div>

          {/* Trust text */}
          <p className="text-xs text-slate-500 mt-4">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
