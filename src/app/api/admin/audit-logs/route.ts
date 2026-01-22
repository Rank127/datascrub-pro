import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole, checkPermission } from "@/lib/admin";
import { logDataAccess } from "@/lib/rbac";

// GET /api/admin/audit-logs - View audit logs
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's role
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });

    const role = getEffectiveRole(currentUser?.email, currentUser?.role);

    // Check permission
    if (!checkPermission(currentUser?.email, currentUser?.role, "view_audit_logs")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const actorId = searchParams.get("actorId") || "";
    const targetUserId = searchParams.get("targetUserId") || "";
    const action = searchParams.get("action") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: Record<string, unknown> = {};

    if (actorId) where.actorId = actorId;
    if (targetUserId) where.targetUserId = targetUserId;
    if (action) where.action = action;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, Date>).gte = new Date(startDate);
      if (endDate) (where.createdAt as Record<string, Date>).lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Log that audit logs were viewed
    await logDataAccess(
      { id: session.user.id, email: currentUser?.email || "", role },
      "VIEW_AUDIT_LOGS",
      "audit_logs",
      undefined,
      undefined,
      request
    );

    // Get unique actions for filtering
    const actions = await prisma.auditLog.findMany({
      select: { action: true },
      distinct: ["action"],
    });

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        actions: actions.map(a => a.action),
      },
    });
  } catch (error) {
    console.error("Audit logs fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
