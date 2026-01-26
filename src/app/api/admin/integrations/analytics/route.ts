import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";
import { logAudit } from "@/lib/rbac/audit-log";
import {
  isGAConfigured,
  getPageViews,
  getActiveUsers,
  getTopPages,
  getTrafficSources,
  getConversions,
} from "@/lib/integrations/google-analytics";
import { AnalyticsIntegrationResponse } from "@/lib/integrations/types";

function getClientIP(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return undefined;
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const role = getEffectiveRole(currentUser.email, currentUser.role);

    // SUPER_ADMIN only for integrations
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Log access
    await logAudit({
      actorId: session.user.id,
      actorEmail: currentUser.email || "",
      actorRole: role,
      action: "ACCESS_ADMIN_PANEL",
      resource: "integrations_analytics",
      ipAddress: getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      details: { integration: "google_analytics" },
    });

    // Check if Google Analytics is configured
    if (!isGAConfigured()) {
      const response: AnalyticsIntegrationResponse = {
        configured: false,
        topPages: [],
        trafficSources: [],
        conversions: [],
        error: "Google Analytics not configured. Set GOOGLE_SERVICE_ACCOUNT_KEY and GA_PROPERTY_ID.",
      };
      return NextResponse.json(response);
    }

    // Fetch GA data in parallel
    const [pageViews, activeUsers, topPages, trafficSources, conversions] =
      await Promise.all([
        getPageViews(),
        getActiveUsers(),
        getTopPages(10),
        getTrafficSources(),
        getConversions(),
      ]);

    // Debug logging
    console.log("[GA Debug] pageViews:", JSON.stringify(pageViews));
    console.log("[GA Debug] activeUsers:", JSON.stringify(activeUsers));
    console.log("[GA Debug] topPages:", JSON.stringify(topPages));
    console.log("[GA Debug] trafficSources:", JSON.stringify(trafficSources));

    const response: AnalyticsIntegrationResponse = {
      configured: true,
      pageViews: pageViews || undefined,
      activeUsers: activeUsers || undefined,
      topPages,
      trafficSources,
      conversions,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Integrations/Analytics] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
