import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";
import { logAudit } from "@/lib/rbac/audit-log";
import {
  isVercelConfigured,
  getProject,
  getDeployments,
  getAnalytics,
} from "@/lib/integrations/vercel";
import { VercelIntegrationResponse } from "@/lib/integrations/types";

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
      resource: "integrations_vercel",
      ipAddress: getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      details: { integration: "vercel" },
    });

    // Check if Vercel is configured
    if (!isVercelConfigured()) {
      const response: VercelIntegrationResponse = {
        configured: false,
        deployments: [],
        error: "Vercel integration not configured. Set VERCEL_ACCESS_TOKEN and VERCEL_PROJECT_ID.",
      };
      return NextResponse.json(response);
    }

    // Fetch Vercel data in parallel
    const [project, deployments, analytics] = await Promise.all([
      getProject(),
      getDeployments(10),
      getAnalytics(),
    ]);

    console.log("[Vercel API] Fetched data:", {
      project: project?.name,
      deploymentsCount: deployments?.length,
      hasAnalytics: !!analytics
    });

    const response: VercelIntegrationResponse = {
      configured: true,
      project: project || undefined,
      deployments: deployments || [],
      analytics,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Integrations/Vercel] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
