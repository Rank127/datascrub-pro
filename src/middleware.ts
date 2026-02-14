import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Allowed origins for CORS (comma-separated in env, or single origin)
const ALLOWED_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : [];

// Admin IP allowlist (comma-separated, optional security feature)
const ADMIN_IP_ALLOWLIST = process.env.ADMIN_IP_ALLOWLIST
  ? process.env.ADMIN_IP_ALLOWLIST.split(",").map((ip) => ip.trim())
  : [];

// Content Security Policy - balances security with functionality
const CSP_DIRECTIVES = [
  "default-src 'self'",
  // Scripts: self + inline (Next.js hydration) + Stripe + Google Analytics
  // unsafe-eval only in development (needed for HMR)
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : ""} https://js.stripe.com https://checkout.stripe.com https://www.googletagmanager.com`,
  // Styles: self + inline (CSS-in-JS, Tailwind)
  "style-src 'self' 'unsafe-inline'",
  // Images: self + data URIs + HTTPS sources (for screenshots, avatars)
  "img-src 'self' data: https: blob:",
  // Fonts: self + common font CDNs
  "font-src 'self' https://fonts.gstatic.com",
  // Connect: API endpoints + Stripe + analytics + Sentry + PostHog
  "connect-src 'self' https://api.stripe.com https://*.supabase.co https://*.upstash.io wss://*.upstash.io https://vitals.vercel-insights.com https://www.google-analytics.com https://*.ingest.sentry.io https://us.i.posthog.com",
  // Frames: Stripe checkout
  "frame-src https://js.stripe.com https://checkout.stripe.com",
  // Object/media restrictions
  "object-src 'none'",
  "media-src 'self'",
  // Base URI restriction
  "base-uri 'self'",
  // Form actions
  "form-action 'self'",
  // Frame ancestors (clickjacking protection)
  "frame-ancestors 'none'",
  // Upgrade insecure requests in production
  ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
];

// Security headers for all responses
const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": CSP_DIRECTIVES.join("; "),
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  ...(process.env.NODE_ENV === "production"
    ? { "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload" }
    : {}),
};

// Get CORS headers with dynamic origin validation
function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  // If no allowed origins configured, allow same-origin only (no CORS header)
  // If origin matches allowed list, reflect it back
  const origin =
    requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)
      ? requestOrigin
      : ALLOWED_ORIGINS[0] || "";

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

// Helper to add CORS headers to response
function addCorsHeaders(response: NextResponse, requestOrigin: string | null): NextResponse {
  const corsHeaders = getCorsHeaders(requestOrigin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });
  return response;
}

// Helper to add security headers to response
function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Get client IP from request headers
function getClientIP(request: NextRequest): string {
  // Check various headers in order of reliability
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  const vercelForwardedFor = request.headers.get("x-vercel-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const forwardedFor = request.headers.get("x-forwarded-for");

  return (
    cfConnectingIp ||
    vercelForwardedFor ||
    realIp ||
    forwardedFor?.split(",")[0].trim() ||
    "unknown"
  );
}

// Check if IP is in admin allowlist
function isIPAllowed(ip: string): boolean {
  // If no allowlist configured, allow all (for development flexibility)
  if (ADMIN_IP_ALLOWLIST.length === 0) {
    return true;
  }
  // Check exact match or CIDR notation support
  return ADMIN_IP_ALLOWLIST.some((allowedIP) => {
    // Support CIDR notation (e.g., 192.168.1.0/24)
    if (allowedIP.includes("/")) {
      return isIPInCIDR(ip, allowedIP);
    }
    // Exact match
    return ip === allowedIP;
  });
}

// Simple CIDR check (IPv4 only)
function isIPInCIDR(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split("/");
  const mask = ~(2 ** (32 - parseInt(bits)) - 1);
  const ipNum = ipToNumber(ip);
  const rangeNum = ipToNumber(range);
  return (ipNum & mask) === (rangeNum & mask);
}

function ipToNumber(ip: string): number {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return 0;
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const hostname = req.headers.get("host") || "";
  const requestOrigin = req.headers.get("origin");
  const isAdminSubdomain = hostname.startsWith("admin.") || hostname.startsWith("192.168.");
  const clientIP = getClientIP(req);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS" && isApiRoute) {
    const response = new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(requestOrigin),
    });
    return addSecurityHeaders(response);
  }

  // Handle admin subdomain - rewrite all requests to /admin/*
  if (isAdminSubdomain && !nextUrl.pathname.startsWith("/admin") && !isApiRoute && !nextUrl.pathname.startsWith("/_next")) {
    const newPath = nextUrl.pathname === "/" ? "/admin" : `/admin${nextUrl.pathname}`;
    const response = NextResponse.rewrite(new URL(newPath, nextUrl));
    return addSecurityHeaders(response);
  }

  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register") ||
    nextUrl.pathname.startsWith("/forgot-password") ||
    nextUrl.pathname.startsWith("/reset-password");

  const isDashboardPage = nextUrl.pathname.startsWith("/dashboard");
  const isAdminPage = nextUrl.pathname.startsWith("/admin");
  const isAdminLoginPage = nextUrl.pathname === "/admin/login";
  const isAdminApiRoute = nextUrl.pathname.startsWith("/api/admin");
  const isApiAuthPage = nextUrl.pathname.startsWith("/api/auth");
  const isPublicApiPage = nextUrl.pathname.startsWith("/api/auth/register");
  const isBingVerify = nextUrl.pathname === "/api/bing-verify";
  const isCronRoute = nextUrl.pathname.startsWith("/api/cron");

  // SECURITY: IP allowlist check for admin routes
  if ((isAdminPage || isAdminApiRoute) && !isIPAllowed(clientIP)) {
    console.warn(`[Security] Blocked admin access from IP: ${clientIP}`);
    const response = new NextResponse(
      JSON.stringify({ error: "Access denied" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
    return addSecurityHeaders(response);
  }

  // Allow public API routes with CORS and security headers
  if (isApiAuthPage || isBingVerify || isCronRoute) {
    const response = NextResponse.next();
    addSecurityHeaders(response);
    if (isApiRoute) {
      return addCorsHeaders(response, requestOrigin);
    }
    return response;
  }

  // Redirect logged-in users away from auth pages (but not on admin subdomain)
  if (isAuthPage && isLoggedIn && !isAdminSubdomain) {
    const response = NextResponse.redirect(new URL("/dashboard", nextUrl));
    return addSecurityHeaders(response);
  }

  // Handle admin routes separately
  if (isAdminPage && !isAdminLoginPage && !isLoggedIn) {
    const response = NextResponse.redirect(new URL("/admin/login", nextUrl));
    return addSecurityHeaders(response);
  }

  // Redirect logged-in admin users away from admin login
  if (isAdminLoginPage && isLoggedIn) {
    const response = NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
    return addSecurityHeaders(response);
  }

  // Redirect non-logged-in users to login from dashboard
  if (isDashboardPage && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname);
    const response = NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
    return addSecurityHeaders(response);
  }

  // Add security headers and CORS headers to all responses
  const response = NextResponse.next();
  addSecurityHeaders(response);
  if (isApiRoute) {
    return addCorsHeaders(response, requestOrigin);
  }

  return response;
});

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
