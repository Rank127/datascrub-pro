"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { useConsent } from "@/lib/consent/consent-context";
import { isAnalyticsConsented } from "@/lib/consent/consent-utils";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { effectiveConsent } = useConsent();

  // Initialize PostHog once (with opt-out by default)
  useEffect(() => {
    if (!POSTHOG_KEY) return;

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      opt_out_capturing_by_default: true,
      ip: false,
      property_denylist: ["$ip"],
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") {
          ph.debug();
        }
      },
    });
  }, []);

  // React to consent changes
  useEffect(() => {
    if (!POSTHOG_KEY) return;

    if (effectiveConsent.analytics) {
      posthog.opt_in_capturing();
    } else {
      posthog.opt_out_capturing();
    }
  }, [effectiveConsent.analytics]);

  if (!POSTHOG_KEY) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

// Track key conversion events
export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (!POSTHOG_KEY || !isAnalyticsConsented()) return;
  posthog.capture(event, properties);
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!POSTHOG_KEY || !isAnalyticsConsented()) return;
  posthog.identify(userId, properties);
}

// Pre-defined conversion events
export const PostHogEvents = {
  SCAN_STARTED: "scan_started",
  SCAN_COMPLETED: "scan_completed",
  REMOVAL_REQUESTED: "removal_requested",
  UPGRADE_CLICKED: "upgrade_clicked",
  PLAN_CHANGED: "plan_changed",
  REGISTRATION_COMPLETED: "registration_completed",
} as const;
