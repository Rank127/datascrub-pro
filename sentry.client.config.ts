import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: 0.1, // 10% of transactions in production

  // Session replay for debugging user-facing errors
  replaysSessionSampleRate: 0, // Don't record all sessions
  replaysOnErrorSampleRate: 1.0, // Record 100% of sessions with errors

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Filter out noisy errors
  ignoreErrors: [
    // Browser extensions
    "ResizeObserver loop",
    "Non-Error promise rejection captured",
    // Network errors users can't control
    "Failed to fetch",
    "NetworkError",
    "Load failed",
    // Next.js navigation
    "NEXT_NOT_FOUND",
    "NEXT_REDIRECT",
  ],

  // Don't send PII (we're a privacy company)
  sendDefaultPii: false,

  // Environment
  environment: process.env.NODE_ENV,
});
