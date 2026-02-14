"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { trackViewPricing, trackBeginCheckout } from "@/components/analytics/google-analytics";
import { trackEvent, PostHogEvents } from "@/components/analytics/posthog-provider";
import { useEffect } from "react";

interface PricingButtonProps {
  planName: string;
  price: number;
  ctaText: string;
  ctaLink: string;
  popular?: boolean;
}

export function PricingButton({ planName, price, ctaText, ctaLink, popular = false }: PricingButtonProps) {
  const handleClick = () => {
    if (planName !== "Free") {
      trackBeginCheckout(planName, price);
      trackEvent(PostHogEvents.UPGRADE_CLICKED, { plan: planName, price });
    }
  };

  return (
    <Link href={ctaLink} onClick={handleClick}>
      <Button
        className={`w-full transition-transform ${
          popular
            ? "bg-emerald-600 hover:bg-emerald-700 animate-glow-pulse hover:scale-105"
            : "bg-slate-700 hover:bg-slate-600"
        }`}
        size="lg"
      >
        {ctaText}
      </Button>
    </Link>
  );
}

export function PricingPageTracker() {
  useEffect(() => {
    trackViewPricing();
  }, []);

  return null;
}
