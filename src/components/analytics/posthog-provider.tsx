"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!POSTHOG_KEY) return;

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      ip: false, // Don't send IP addresses (GDPR)
      property_denylist: ["$ip"], // Strip IP from all events
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") {
          ph.debug();
        }
      },
    });
  }, []);

  if (!POSTHOG_KEY) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

// Track key conversion events
export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (!POSTHOG_KEY) return;
  posthog.capture(event, properties);
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!POSTHOG_KEY) return;
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
