import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";
import { logAudit } from "@/lib/rbac/audit-log";
import { DatabaseIntegrationResponse, DatabaseTable } from "@/lib/integrations/types";

function getClientIP(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return undefined;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
      resource: "integrations_database",
      ipAddress: getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      details: { integration: "database" },
    });

    // Measure connection latency
    const startTime = Date.now();
    let connectionStatus: "healthy" | "degraded" | "error" = "healthy";
    let latencyMs = 0;

    try {
      // Health check query
      await prisma.$queryRaw`SELECT 1`;
      latencyMs = Date.now() - startTime;

      // If latency is high, mark as degraded
      if (latencyMs > 1000) {
        connectionStatus = "degraded";
      }
    } catch {
      connectionStatus = "error";
      latencyMs = Date.now() - startTime;
    }

    // Get table statistics using Prisma counts (more portable than raw SQL)
    const tables: DatabaseTable[] = [];

    // Count rows in main tables
    const tableCounts = await Promise.all([
      prisma.user.count().then((count: number) => ({ name: "User", count })),
      prisma.scan.count().then((count: number) => ({ name: "Scan", count })),
      prisma.exposure.count().then((count: number) => ({ name: "Exposure", count })),
      prisma.removalRequest.count().then((count: number) => ({ name: "RemovalRequest", count })),
      prisma.subscription.count().then((count: number) => ({ name: "Subscription", count })),
      prisma.auditLog.count().then((count: number) => ({ name: "AuditLog", count })),
      prisma.personalProfile.count().then((count: number) => ({ name: "PersonalProfile", count })),
      prisma.customRemovalRequest.count().then((count: number) => ({ name: "CustomRemovalRequest", count })),
      prisma.dNCRegistration.count().then((count: number) => ({ name: "DNCRegistration", count })),
      prisma.whitelist.count().then((count: number) => ({ name: "Whitelist", count })),
    ]);

    // Get database size (PostgreSQL specific)
    let totalSizeBytes = 0;
    try {
      const sizeResult = await prisma.$queryRaw<{ pg_database_size: bigint }[]>`
        SELECT pg_database_size(current_database())
      `;
      if (sizeResult[0]) {
        totalSizeBytes = Number(sizeResult[0].pg_database_size);
      }
    } catch {
      // If this fails (e.g., not PostgreSQL), estimate from row counts
      totalSizeBytes = tableCounts.reduce((sum: number, t: { name: string; count: number }) => sum + t.count * 500, 0); // rough estimate
    }

    // Get individual table sizes (PostgreSQL specific)
    try {
      const tableSizes = await prisma.$queryRaw<{ relname: string; size: bigint }[]>`
        SELECT relname, pg_total_relation_size(relid) as size
        FROM pg_catalog.pg_statio_user_tables
        ORDER BY pg_total_relation_size(relid) DESC
        LIMIT 20
      `;

      for (const tableCount of tableCounts) {
        const sizeInfo = tableSizes.find(
          (s) => s.relname.toLowerCase() === tableCount.name.toLowerCase()
        );
        tables.push({
          name: tableCount.name,
          rowCount: tableCount.count,
          size: sizeInfo ? formatBytes(Number(sizeInfo.size)) : "N/A",
        });
      }
    } catch {
      // Fall back to counts only
      for (const tableCount of tableCounts) {
        tables.push({
          name: tableCount.name,
          rowCount: tableCount.count,
          size: "N/A",
        });
      }
    }

    // Sort by row count descending
    tables.sort((a, b) => b.rowCount - a.rowCount);

    const response: DatabaseIntegrationResponse = {
      configured: true,
      tables,
      totalSize: formatBytes(totalSizeBytes),
      connectionStatus,
      latencyMs,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Integrations/Database] Error:", error);
    return NextResponse.json(
      {
        configured: true,
        tables: [],
        totalSize: "Unknown",
        connectionStatus: "error" as const,
        latencyMs: 0,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
