import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// CORS headers for API routes
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
};

// Helper to add CORS headers to response
function addCorsHeaders(response: NextResponse): NextResponse {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const hostname = req.headers.get("host") || "";
  const isAdminSubdomain = hostname.startsWith("admin.");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS" && isApiRoute) {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
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
      return addCorsHeaders(response);
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
    return addCorsHeaders(response);
  }

  return response;
});

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
