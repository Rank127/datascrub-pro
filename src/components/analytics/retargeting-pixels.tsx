"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useConsent } from "@/lib/consent/consent-context";
import { isMarketingConsented } from "@/lib/consent/consent-utils";

// Environment variables for pixel IDs
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const GOOGLE_ADS_CONVERSION_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// Route change tracker component (uses useSearchParams, must be wrapped in Suspense)
function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { effectiveConsent } = useConsent();

  // Track page views on route change
  useEffect(() => {
    if (!effectiveConsent.marketing) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    // Facebook page view
    if (FB_PIXEL_ID && window.fbq) {
      window.fbq("track", "PageView");
    }

    // Google Ads page view
    if (GOOGLE_ADS_ID && window.gtag) {
      window.gtag("config", GOOGLE_ADS_ID, { page_path: url });
    }
  }, [pathname, searchParams, effectiveConsent.marketing]);

  return null;
}

export function RetargetingPixels() {
  const { effectiveConsent } = useConsent();

  // Initialize Facebook Pixel
  useEffect(() => {
    if (!FB_PIXEL_ID || !effectiveConsent.marketing) return;

    // Initialize fbq
    const initFbq = () => {
      const n = (window.fbq = function (...args: unknown[]) {
        if (n.callMethod) {
          n.callMethod(...args);
        } else {
          n.queue.push(args);
        }
      } as typeof window.fbq & { callMethod?: (...args: unknown[]) => void; queue: unknown[]; push: (args: unknown[]) => void; loaded: boolean; version: string });
      if (!window._fbq) window._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
    };

    initFbq();

    // Load Facebook Pixel script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://connect.facebook.net/en_US/fbevents.js`;
    document.head.appendChild(script);

    // Initialize pixel
    window.fbq("init", FB_PIXEL_ID);
    window.fbq("track", "PageView");

    return () => {
      const existingScript = document.querySelector('script[src*="fbevents.js"]');
      if (existingScript) existingScript.remove();
    };
  }, [effectiveConsent.marketing]);

  // Initialize Google Ads
  useEffect(() => {
    if (!GOOGLE_ADS_ID || !effectiveConsent.marketing) return;

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: unknown[]) {
      window.dataLayer.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", GOOGLE_ADS_ID);

    // Load Google Ads script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector(`script[src*="${GOOGLE_ADS_ID}"]`);
      if (existingScript) existingScript.remove();
    };
  }, [effectiveConsent.marketing]);

  return (
    <Suspense fallback={null}>
      <RouteChangeTracker />
    </Suspense>
  );
}

// Conversion tracking functions
export function trackFacebookEvent(event: string, params?: Record<string, unknown>) {
  if (!isMarketingConsented()) return;
  if (FB_PIXEL_ID && typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event, params);
  }
}

export function trackGoogleConversion(conversionLabel?: string) {
  if (!isMarketingConsented()) return;
  if (GOOGLE_ADS_ID && typeof window !== "undefined" && window.gtag) {
    const conversionId = conversionLabel || GOOGLE_ADS_CONVERSION_ID;
    if (conversionId) {
      window.gtag("event", "conversion", {
        send_to: `${GOOGLE_ADS_ID}/${conversionId}`,
      });
    }
  }
}

// Pre-built event helpers
export const trackEvents = {
  // Lead events
  lead: () => {
    trackFacebookEvent("Lead");
    trackGoogleConversion();
  },

  // Registration events
  completeRegistration: (value?: number) => {
    trackFacebookEvent("CompleteRegistration", value ? { value, currency: "USD" } : undefined);
    trackGoogleConversion();
  },

  // Start trial
  startTrial: () => {
    trackFacebookEvent("StartTrial");
    trackGoogleConversion();
  },

  // Purchase/Subscribe
  purchase: (value: number) => {
    trackFacebookEvent("Purchase", { value, currency: "USD" });
    trackGoogleConversion();
  },

  // Add to cart (pricing page view)
  viewContent: (contentName: string) => {
    trackFacebookEvent("ViewContent", { content_name: contentName });
  },

  // Initiate checkout
  initiateCheckout: (value: number) => {
    trackFacebookEvent("InitiateCheckout", { value, currency: "USD" });
  },
};
