import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Allowed origins for CORS (comma-separated in env, or single origin)
const ALLOWED_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : [];

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

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const hostname = req.headers.get("host") || "";
  const requestOrigin = req.headers.get("origin");
  const isAdminSubdomain = hostname.startsWith("admin.") || hostname.startsWith("192.168.");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS" && isApiRoute) {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(requestOrigin),
    });
  }

  // Handle admin subdomain - rewrite all requests to /admin/*
  if (isAdminSubdomain && !nextUrl.pathname.startsWith("/admin") && !isApiRoute && !nextUrl.pathname.startsWith("/_next")) {
    const newPath = nextUrl.pathname === "/" ? "/admin" : `/admin${nextUrl.pathname}`;
    return NextResponse.rewrite(new URL(newPath, nextUrl));
  }

  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register") ||
    nextUrl.pathname.startsWith("/forgot-password") ||
    nextUrl.pathname.startsWith("/reset-password");

  const isDashboardPage = nextUrl.pathname.startsWith("/dashboard");
  const isAdminPage = nextUrl.pathname.startsWith("/admin");
  const isAdminLoginPage = nextUrl.pathname === "/admin/login";
  const isApiAuthPage = nextUrl.pathname.startsWith("/api/auth");
  const isPublicApiPage = nextUrl.pathname.startsWith("/api/auth/register");
  const isBingVerify = nextUrl.pathname === "/api/bing-verify";
  const isCronRoute = nextUrl.pathname.startsWith("/api/cron");

  // Allow public API routes with CORS headers
  if (isApiAuthPage || isBingVerify || isCronRoute) {
    const response = NextResponse.next();
    if (isApiRoute) {
      return addCorsHeaders(response, requestOrigin);
    }
    return response;
  }

  // Redirect logged-in users away from auth pages (but not on admin subdomain)
  if (isAuthPage && isLoggedIn && !isAdminSubdomain) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Handle admin routes separately
  if (isAdminPage && !isAdminLoginPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", nextUrl));
  }

  // Redirect logged-in admin users away from admin login
  if (isAdminLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
  }

  // Redirect non-logged-in users to login from dashboard
  if (isDashboardPage && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  // Add CORS headers to all API responses
  const response = NextResponse.next();
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
