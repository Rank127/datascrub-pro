import { withSentryConfig } from "@sentry/nextjs";
import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // CORS is handled by middleware for dynamic origin support with credentials
    ];
  },
  async redirects() {
    return [
      { source: "/data-removal-california", destination: "/data-removal/california", permanent: true },
      { source: "/data-removal-texas", destination: "/data-removal/texas", permanent: true },
      { source: "/data-removal-new-york", destination: "/data-removal/new-york", permanent: true },
      { source: "/data-removal-florida", destination: "/data-removal/florida", permanent: true },
      { source: "/data-removal-illinois", destination: "/data-removal/illinois", permanent: true },
      { source: "/data-removal-pennsylvania", destination: "/data-removal/pennsylvania", permanent: true },
      { source: "/data-removal-ohio", destination: "/data-removal/ohio", permanent: true },
      { source: "/data-removal-georgia", destination: "/data-removal/georgia", permanent: true },
      { source: "/data-removal-north-carolina", destination: "/data-removal/north-carolina", permanent: true },
      { source: "/data-removal-michigan", destination: "/data-removal/michigan", permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/BingSiteAuth.xml",
        destination: "/api/bing-verify",
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Bundle optimization - tree-shake large packages
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "recharts",
      "date-fns",
    ],
  },
  // Enable compression
  compress: true,
  // Minimize output
  productionBrowserSourceMaps: false,
};

export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  // Suppress source map upload warnings when SENTRY_AUTH_TOKEN is not set
  silent: !process.env.SENTRY_AUTH_TOKEN,

  // Upload source maps for better stack traces
  widenClientFileUpload: true,

  // Disable Sentry telemetry
  telemetry: false,

  // Source map configuration
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
