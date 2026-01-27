import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";
import { logAudit } from "@/lib/rbac/audit-log";
import { BingIntegrationResponse } from "@/lib/integrations/types";
import {
  isBingConfigured,
  getSearchPerformance,
  getQueryStats,
  getPageStats,
  getCrawlStats,
  getBacklinks,
} from "@/lib/integrations/bing-webmaster";

function getClientIP(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return undefined;
}

export async function GET(request: Request): Promise<NextResponse<BingIntegrationResponse>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { configured: false, topQueries: [], topPages: [], recentBacklinks: [], error: "Unauthorized" },
        { status: 401 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { configured: false, topQueries: [], topPages: [], recentBacklinks: [], error: "User not found" },
        { status: 404 }
      );
    }

    const role = getEffectiveRole(currentUser.email, currentUser.role);

    // SUPER_ADMIN only for integrations
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { configured: false, topQueries: [], topPages: [], recentBacklinks: [], error: "Forbidden" },
        { status: 403 }
      );
    }

    // Log access
    await logAudit({
      actorId: session.user.id,
      actorEmail: currentUser.email || "",
      actorRole: role,
      action: "ACCESS_ADMIN_PANEL",
      resource: "integrations_bing",
      ipAddress: getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      details: { integration: "bing_webmaster" },
    });

    // Check if Bing is configured
    if (!isBingConfigured()) {
      return NextResponse.json({
        configured: false,
        topQueries: [],
        topPages: [],
        recentBacklinks: [],
        error: "Bing Webmaster Tools not configured. Add BING_WEBMASTER_API_KEY and BING_SITE_URL to environment.",
      });
    }

    // Fetch all Bing data in parallel
    const [searchPerformance, topQueries, topPages, crawlStats, backlinks] = await Promise.all([
      getSearchPerformance(),
      getQueryStats(),
      getPageStats(),
      getCrawlStats(),
      getBacklinks(),
    ]);

    return NextResponse.json({
      configured: true,
      searchPerformance: searchPerformance || undefined,
      topQueries,
      topPages,
      crawlStats: crawlStats || undefined,
      recentBacklinks: backlinks,
    });
  } catch (error) {
    console.error("[Bing API] Error:", error);
    return NextResponse.json({
      configured: true,
      topQueries: [],
      topPages: [],
      recentBacklinks: [],
      error: error instanceof Error ? error.message : "Failed to fetch Bing data",
    });
  }
}
