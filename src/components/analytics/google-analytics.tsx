"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

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

// Route change tracker component
function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && GA_MEASUREMENT_ID) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      trackPageView(url);
    }
  }, [pathname, searchParams]);

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
            cookie_flags: 'SameSite=None;Secure',
            send_page_view: true,
            allow_google_signals: true,
            allow_ad_personalization_signals: false
          });

          // Track JavaScript errors
          window.addEventListener('error', function(e) {
            gtag('event', 'exception', {
              description: e.message + ' at ' + e.filename + ':' + e.lineno,
              fatal: false
            });
          });
        `}
      </Script>
      <Suspense fallback={null}>
        <RouteChangeTracker />
      </Suspense>
    </>
  );
}

// ==========================================
// CORE TRACKING FUNCTIONS
// ==========================================

// Track page views (for client-side navigation)
export function trackPageView(url: string) {
  const gtag = getGtag();
  if (gtag && GA_MEASUREMENT_ID) {
    gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
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

// ==========================================
// USER IDENTIFICATION & PROPERTIES
// ==========================================

// Set user ID for cross-device tracking (call after login)
export function setUserId(userId: string) {
  const gtag = getGtag();
  if (gtag && GA_MEASUREMENT_ID) {
    gtag("config", GA_MEASUREMENT_ID, {
      user_id: userId,
    });
  }
}

// Set user properties for segmentation
export function setUserProperties(properties: {
  plan?: string;
  account_age_days?: number;
  total_exposures?: number;
  total_removals?: number;
  has_completed_scan?: boolean;
  signup_source?: string;
}) {
  const gtag = getGtag();
  if (gtag) {
    gtag("set", "user_properties", properties);
  }
}

// Clear user ID on logout
export function clearUserId() {
  const gtag = getGtag();
  if (gtag && GA_MEASUREMENT_ID) {
    gtag("config", GA_MEASUREMENT_ID, {
      user_id: null,
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

// Removal completed successfully
export function trackRemovalCompleted(source: string, daysToComplete: number) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "removal_completed", {
      source: source,
      days_to_complete: daysToComplete,
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

// ==========================================
// ENHANCED ECOMMERCE (GA4 format)
// ==========================================

// User views pricing page
export function trackViewPricing() {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "view_item_list", {
      item_list_id: "pricing_plans",
      item_list_name: "Pricing Plans",
      items: [
        { item_id: "free", item_name: "Free Plan", price: 0 },
        { item_id: "pro", item_name: "Pro Plan", price: 11.99 },
        { item_id: "enterprise", item_name: "Enterprise Plan", price: 29.99 },
      ],
    });
  }
}

// User selects a plan
export function trackSelectPlan(plan: string, price: number) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "select_item", {
      item_list_id: "pricing_plans",
      item_list_name: "Pricing Plans",
      items: [{ item_id: plan.toLowerCase(), item_name: `${plan} Plan`, price: price }],
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
      items: [{
        item_id: plan.toLowerCase(),
        item_name: `${plan} Plan`,
        price: value,
        quantity: 1
      }],
    });
  }
}

// User adds payment info
export function trackAddPaymentInfo(plan: string, value: number) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "add_payment_info", {
      currency: "USD",
      value: value,
      payment_type: "card",
      items: [{
        item_id: plan.toLowerCase(),
        item_name: `${plan} Plan`,
        price: value,
        quantity: 1
      }],
    });
  }
}

// Purchase completed (call from Stripe webhook or success page)
export function trackPurchase(transactionId: string, plan: string, value: number) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "purchase", {
      transaction_id: transactionId,
      currency: "USD",
      value: value,
      items: [{
        item_id: plan.toLowerCase(),
        item_name: `${plan} Plan`,
        price: value,
        quantity: 1
      }],
    });
  }
}

// User upgrades plan
export function trackPlanUpgrade(fromPlan: string, toPlan: string, value: number) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "plan_upgrade", {
      from_plan: fromPlan,
      to_plan: toPlan,
      value: value,
      currency: "USD",
    });
  }
}

// User cancels subscription
export function trackSubscriptionCanceled(plan: string, reason?: string) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "subscription_canceled", {
      plan: plan,
      cancellation_reason: reason || "not_specified",
    });
  }
}

// ==========================================
// ENGAGEMENT EVENTS
// ==========================================

// Track feature usage
export function trackFeatureUsed(featureName: string, details?: Record<string, unknown>) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "feature_used", {
      feature_name: featureName,
      ...details,
    });
  }
}

// Track scroll depth (call at 25%, 50%, 75%, 100%)
export function trackScrollDepth(percentage: number, pagePath: string) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "scroll", {
      percent_scrolled: percentage,
      page_path: pagePath,
    });
  }
}

// Track time on page
export function trackTimeOnPage(seconds: number, pagePath: string) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "timing_complete", {
      name: "time_on_page",
      value: seconds,
      page_path: pagePath,
    });
  }
}

// Track outbound link clicks
export function trackOutboundLink(url: string) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "click", {
      event_category: "outbound",
      event_label: url,
      transport_type: "beacon",
    });
  }
}

// Track file downloads
export function trackDownload(fileName: string, fileType: string) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "file_download", {
      file_name: fileName,
      file_extension: fileType,
    });
  }
}

// Track search queries
export function trackSearch(searchTerm: string, resultsCount?: number) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "search", {
      search_term: searchTerm,
      results_count: resultsCount,
    });
  }
}

// Track CTA clicks
export function trackCTAClick(ctaName: string, ctaLocation: string) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "cta_click", {
      cta_name: ctaName,
      cta_location: ctaLocation,
    });
  }
}

// Track video engagement
export function trackVideoEngagement(action: "play" | "pause" | "complete", videoTitle: string, percentWatched?: number) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", `video_${action}`, {
      video_title: videoTitle,
      percent_watched: percentWatched,
    });
  }
}

// ==========================================
// ERROR & EXCEPTION TRACKING
// ==========================================

// Track application errors
export function trackError(errorMessage: string, errorSource: string, fatal: boolean = false) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "exception", {
      description: `${errorSource}: ${errorMessage}`,
      fatal: fatal,
    });
  }
}

// Track API errors
export function trackAPIError(endpoint: string, statusCode: number, errorMessage?: string) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "api_error", {
      api_endpoint: endpoint,
      status_code: statusCode,
      error_message: errorMessage,
    });
  }
}

// ==========================================
// A/B TESTING SUPPORT
// ==========================================

// Track experiment exposure
export function trackExperiment(experimentId: string, variantId: string) {
  const gtag = getGtag();
  if (gtag) {
    gtag("event", "experiment_impression", {
      experiment_id: experimentId,
      variant_id: variantId,
    });
  }
}
