"use client";

import Script from "next/script";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Type for gtag function
type GtagFunction = (...args: unknown[]) => void;

// Get gtag safely
function getGtag(): GtagFunction | null {
  if (typeof window !== "undefined") {
    return (window as typeof window & { gtag?: GtagFunction }).gtag || null;
  }
  return null;
}

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure'
          });
        `}
      </Script>
    </>
  );
}

// Generic event tracking
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Track page views (for client-side navigation)
export function trackPageView(url: string) {
  const gtag = getGtag();
  if (gtag && GA_MEASUREMENT_ID) {
    gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
}

// ==========================================
// CONVERSION EVENTS (mark as conversions in GA4)
// ==========================================

// User signs up
export function trackSignUp(method: string = "email") {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "sign_up", {
      method: method,
    });
  }
}

// User logs in
export function trackLogin(method: string = "email") {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "login", {
      method: method,
    });
  }
}

// User starts a scan
export function trackScanStarted(scanType: string) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "scan_started", {
      scan_type: scanType,
    });
  }
}

// Scan completes
export function trackScanCompleted(scanType: string, exposuresFound: number, sourcesChecked: number) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "scan_completed", {
      scan_type: scanType,
      exposures_found: exposuresFound,
      sources_checked: sourcesChecked,
    });
  }
}

// User requests data removal
export function trackRemovalRequested(source: string, dataType: string) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "removal_requested", {
      source: source,
      data_type: dataType,
    });
  }
}

// User upgrades plan
export function trackPlanUpgrade(plan: string, value?: number) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "plan_upgrade", {
      plan: plan,
      value: value,
      currency: "USD",
    });
  }
}

// User views pricing page
export function trackViewPricing() {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "view_pricing", {
      event_category: "engagement",
    });
  }
}

// User clicks checkout button
export function trackBeginCheckout(plan: string, value: number) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "begin_checkout", {
      currency: "USD",
      value: value,
      items: [{ item_name: plan, price: value }],
    });
  }
}

// User completes profile
export function trackProfileCompleted() {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "profile_completed", {
      event_category: "engagement",
    });
  }
}

// User marks manual review as done
export function trackManualReviewCompleted(source: string) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "manual_review_completed", {
      source: source,
    });
  }
}
