import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";
import { logAudit } from "@/lib/rbac/audit-log";
import { DatabaseIntegrationResponse, DatabaseTable, DatabaseBusinessMetrics } from "@/lib/integrations/types";

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

    // Get business metrics
    const [
      usersByPlan,
      removalsByStatus,
      exposuresByStatus,
      scansByStatus,
      subscriptionsByStatus,
    ] = await Promise.all([
      // Users by plan
      prisma.user.groupBy({
        by: ["plan"],
        _count: { id: true },
      }),
      // Removals by status
      prisma.removalRequest.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      // Exposures by status
      prisma.exposure.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      // Scans by status
      prisma.scan.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      // Subscriptions by status
      prisma.subscription.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    // Process user counts by plan
    const userCounts = {
      free: 0,
      pro: 0,
      enterprise: 0,
      total: 0,
    };
    for (const row of usersByPlan) {
      const count = row._count.id;
      userCounts.total += count;
      if (row.plan === "FREE") userCounts.free = count;
      else if (row.plan === "PRO") userCounts.pro = count;
      else if (row.plan === "ENTERPRISE") userCounts.enterprise = count;
    }

    // Process removal counts by status
    // Actual statuses: PENDING, SUBMITTED, IN_PROGRESS, COMPLETED, FAILED, REQUIRES_MANUAL, ACKNOWLEDGED
    const removalCounts = {
      pending: 0,
      inProgress: 0,
      completed: 0,
      failed: 0,
      total: 0,
    };
    for (const row of removalsByStatus) {
      const count = row._count.id;
      removalCounts.total += count;
      if (row.status === "PENDING") removalCounts.pending += count;
      else if (row.status === "SUBMITTED") removalCounts.inProgress += count;
      else if (row.status === "IN_PROGRESS") removalCounts.inProgress += count;
      else if (row.status === "COMPLETED") removalCounts.completed += count;
      else if (row.status === "ACKNOWLEDGED") removalCounts.completed += count; // Non-removable sources - user informed
      else if (row.status === "FAILED") removalCounts.failed += count;
      else if (row.status === "REQUIRES_MANUAL") removalCounts.pending += count; // Manual = still pending action
    }

    // Process exposure counts by status
    // Actual statuses: ACTIVE, REMOVAL_PENDING, REMOVAL_IN_PROGRESS, REMOVED, WHITELISTED, MONITORING
    const exposureCounts = {
      active: 0,
      removalPending: 0,
      removalInProgress: 0,
      removed: 0,
      whitelisted: 0,
      monitoring: 0,
      total: 0,
    };
    for (const row of exposuresByStatus) {
      const count = row._count.id;
      exposureCounts.total += count;
      if (row.status === "ACTIVE" || row.status === "FOUND") exposureCounts.active += count;
      else if (row.status === "REMOVAL_PENDING") exposureCounts.removalPending += count;
      else if (row.status === "REMOVAL_IN_PROGRESS") exposureCounts.removalInProgress += count;
      else if (row.status === "REMOVED") exposureCounts.removed += count;
      else if (row.status === "WHITELISTED") exposureCounts.whitelisted += count;
      else if (row.status === "MONITORING") exposureCounts.monitoring += count; // Non-removable - monitoring only
    }

    // Process scan counts by status
    const scanCounts = {
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      total: 0,
    };
    for (const row of scansByStatus) {
      const count = row._count.id;
      scanCounts.total += count;
      if (row.status === "PENDING") scanCounts.pending = count;
      else if (row.status === "RUNNING") scanCounts.running = count;
      else if (row.status === "COMPLETED") scanCounts.completed = count;
      else if (row.status === "FAILED") scanCounts.failed = count;
    }

    // Process subscription counts
    const subscriptionCounts = {
      active: 0,
      canceled: 0,
      total: 0,
    };
    for (const row of subscriptionsByStatus) {
      const count = row._count.id;
      subscriptionCounts.total += count;
      if (row.status === "active") subscriptionCounts.active = count;
      else if (row.status === "canceled") subscriptionCounts.canceled = count;
    }

    const businessMetrics: DatabaseBusinessMetrics = {
      users: userCounts,
      removals: removalCounts,
      exposures: exposureCounts,
      scans: scanCounts,
      subscriptions: subscriptionCounts,
    };

    const response: DatabaseIntegrationResponse = {
      configured: true,
      tables,
      totalSize: formatBytes(totalSizeBytes),
      connectionStatus,
      latencyMs,
      businessMetrics,
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
