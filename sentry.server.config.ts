import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: 0.1, // 10% of transactions

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Don't send PII (we're a privacy company)
  sendDefaultPii: false,

  // Environment
  environment: process.env.NODE_ENV,
});
