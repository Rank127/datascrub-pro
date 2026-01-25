import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";
import { logAudit } from "@/lib/rbac/audit-log";
import { maskEmail } from "@/lib/rbac/pii-masking";
import {
  ExecutiveStatsResponse,
  FinanceMetrics,
  AnalyticsMetrics,
  OperationsMetrics,
  ActivitiesMetrics,
  TrendDataPoint,
  PLAN_PRICING,
} from "@/lib/executive/types";

// Helper to get client IP
function getClientIP(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return undefined;
}

// Helper to get start of current month
function getStartOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// Helper to get start of last month
function getStartOfLastMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 1, 1);
}

// Helper to get date N days ago
function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
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

    // Restrict to ADMIN, LEGAL, SUPER_ADMIN only
    if (!["ADMIN", "LEGAL", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isSuperAdmin = role === "SUPER_ADMIN";

    // Log access to executive dashboard
    await logAudit({
      actorId: session.user.id,
      actorEmail: currentUser.email || "",
      actorRole: role,
      action: "ACCESS_ADMIN_PANEL",
      resource: "executive_dashboard",
      ipAddress: getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      details: { dashboard: "executive" },
    });

    // Fetch all data in parallel for performance
    const [
      finance,
      analytics,
      operations,
      activities,
    ] = await Promise.all([
      getFinanceMetrics(),
      getAnalyticsMetrics(),
      getOperationsMetrics(),
      getActivitiesMetrics(isSuperAdmin),
    ]);

    const response: ExecutiveStatsResponse = {
      finance,
      analytics,
      operations,
      activities,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Executive Stats] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

async function getFinanceMetrics(): Promise<FinanceMetrics> {
  const startOfMonth = getStartOfMonth();
  const startOfLastMonth = getStartOfLastMonth();

  // Get subscription counts by plan
  const subscriptionsByPlan = await prisma.user.groupBy({
    by: ["plan"],
    _count: true,
  });

  const planCounts = {
    FREE: 0,
    PRO: 0,
    ENTERPRISE: 0,
  };

  subscriptionsByPlan.forEach((item) => {
    if (item.plan in planCounts) {
      planCounts[item.plan as keyof typeof planCounts] = item._count;
    }
  });

  // Get subscription status counts
  const subscriptionStatuses = await prisma.subscription.groupBy({
    by: ["status"],
    _count: true,
  });

  let activeSubscriptions = 0;
  let canceledSubscriptions = 0;
  let pastDueSubscriptions = 0;

  subscriptionStatuses.forEach((item) => {
    if (item.status === "active") activeSubscriptions = item._count;
    else if (item.status === "canceled") canceledSubscriptions = item._count;
    else if (item.status === "past_due") pastDueSubscriptions = item._count;
  });

  // New subscriptions this month
  const newSubscriptionsThisMonth = await prisma.subscription.count({
    where: {
      createdAt: { gte: startOfMonth },
      status: "active",
    },
  });

  // Calculate MRR
  const mrr = (planCounts.PRO * PLAN_PRICING.PRO) + (planCounts.ENTERPRISE * PLAN_PRICING.ENTERPRISE);

  // Calculate last month MRR for growth
  const lastMonthPro = await prisma.user.count({
    where: {
      plan: "PRO",
      createdAt: { lt: startOfMonth },
    },
  });
  const lastMonthEnterprise = await prisma.user.count({
    where: {
      plan: "ENTERPRISE",
      createdAt: { lt: startOfMonth },
    },
  });
  const lastMonthMrr = (lastMonthPro * PLAN_PRICING.PRO) + (lastMonthEnterprise * PLAN_PRICING.ENTERPRISE);
  const mrrGrowth = lastMonthMrr > 0 ? ((mrr - lastMonthMrr) / lastMonthMrr) * 100 : 0;

  // Churn rate (canceled this month / active at start of month)
  const canceledThisMonth = await prisma.subscription.count({
    where: {
      status: "canceled",
      updatedAt: { gte: startOfMonth },
    },
  });
  const activeAtStartOfMonth = activeSubscriptions + canceledThisMonth;
  const churnRate = activeAtStartOfMonth > 0 ? (canceledThisMonth / activeAtStartOfMonth) * 100 : 0;

  // ARPU
  const totalPaidUsers = planCounts.PRO + planCounts.ENTERPRISE;
  const arpu = totalPaidUsers > 0 ? mrr / totalPaidUsers : 0;

  return {
    mrr,
    mrrGrowth: Math.round(mrrGrowth * 100) / 100,
    subscriptionsByPlan: planCounts,
    activeSubscriptions,
    canceledSubscriptions,
    pastDueSubscriptions,
    newSubscriptionsThisMonth,
    churnRate: Math.round(churnRate * 100) / 100,
    arpu: Math.round(arpu),
  };
}

async function getAnalyticsMetrics(): Promise<AnalyticsMetrics> {
  const startOfMonth = getStartOfMonth();
  const startOfLastMonth = getStartOfLastMonth();

  // Total counts
  const [totalUsers, totalExposures, totalRemovals, completedRemovals, completedScans, totalScans] = await Promise.all([
    prisma.user.count(),
    prisma.exposure.count(),
    prisma.removalRequest.count(),
    prisma.removalRequest.count({ where: { status: "COMPLETED" } }),
    prisma.scan.count({ where: { status: "COMPLETED" } }),
    prisma.scan.count(),
  ]);

  // New users this month
  const newUsersThisMonth = await prisma.user.count({
    where: { createdAt: { gte: startOfMonth } },
  });

  // Users last month (for growth rate)
  const usersLastMonth = await prisma.user.count({
    where: { createdAt: { lt: startOfMonth } },
  });
  const userGrowthRate = usersLastMonth > 0 ? ((totalUsers - usersLastMonth) / usersLastMonth) * 100 : 0;

  // Success rates
  const removalSuccessRate = totalRemovals > 0 ? (completedRemovals / totalRemovals) * 100 : 0;
  const scanCompletionRate = totalScans > 0 ? (completedScans / totalScans) * 100 : 0;

  // Average exposures per user
  const avgExposuresPerUser = totalUsers > 0 ? totalExposures / totalUsers : 0;

  // Get trends for last 12 months
  const trends = await getTrends();

  return {
    totalUsers,
    newUsersThisMonth,
    userGrowthRate: Math.round(userGrowthRate * 100) / 100,
    totalExposures,
    totalRemovals: completedRemovals,
    removalSuccessRate: Math.round(removalSuccessRate * 100) / 100,
    scanCompletionRate: Math.round(scanCompletionRate * 100) / 100,
    avgExposuresPerUser: Math.round(avgExposuresPerUser * 100) / 100,
    trends,
  };
}

async function getTrends(): Promise<{ users: TrendDataPoint[]; exposures: TrendDataPoint[]; removals: TrendDataPoint[] }> {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  // User trends by month
  const userTrends = await prisma.user.groupBy({
    by: ["createdAt"],
    _count: true,
    where: {
      createdAt: { gte: twelveMonthsAgo },
    },
  });

  // Aggregate by month
  const usersByMonth: Record<string, number> = {};
  const exposuresByMonth: Record<string, number> = {};
  const removalsByMonth: Record<string, number> = {};

  // Initialize all months
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    usersByMonth[key] = 0;
    exposuresByMonth[key] = 0;
    removalsByMonth[key] = 0;
  }

  // Get actual data
  const users = await prisma.user.findMany({
    where: { createdAt: { gte: twelveMonthsAgo } },
    select: { createdAt: true },
  });

  users.forEach((u) => {
    const key = `${u.createdAt.getFullYear()}-${String(u.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (usersByMonth[key] !== undefined) {
      usersByMonth[key]++;
    }
  });

  const exposures = await prisma.exposure.findMany({
    where: { firstFoundAt: { gte: twelveMonthsAgo } },
    select: { firstFoundAt: true },
  });

  exposures.forEach((e) => {
    const key = `${e.firstFoundAt.getFullYear()}-${String(e.firstFoundAt.getMonth() + 1).padStart(2, "0")}`;
    if (exposuresByMonth[key] !== undefined) {
      exposuresByMonth[key]++;
    }
  });

  const removals = await prisma.removalRequest.findMany({
    where: {
      completedAt: { gte: twelveMonthsAgo },
      status: "COMPLETED",
    },
    select: { completedAt: true },
  });

  removals.forEach((r) => {
    if (r.completedAt) {
      const key = `${r.completedAt.getFullYear()}-${String(r.completedAt.getMonth() + 1).padStart(2, "0")}`;
      if (removalsByMonth[key] !== undefined) {
        removalsByMonth[key]++;
      }
    }
  });

  return {
    users: Object.entries(usersByMonth).map(([date, value]) => ({ date, value })),
    exposures: Object.entries(exposuresByMonth).map(([date, value]) => ({ date, value })),
    removals: Object.entries(removalsByMonth).map(([date, value]) => ({ date, value })),
  };
}

async function getOperationsMetrics(): Promise<OperationsMetrics> {
  // Pending and in-progress removals
  const [pendingRemovalRequests, inProgressRemovals] = await Promise.all([
    prisma.removalRequest.count({
      where: { status: { in: ["PENDING", "SUBMITTED"] } },
    }),
    prisma.removalRequest.count({
      where: { status: "IN_PROGRESS" },
    }),
  ]);

  // Manual action queue
  const manualActionQueue = await prisma.exposure.count({
    where: {
      requiresManualAction: true,
      manualActionTaken: false,
    },
  });

  // Custom removal backlog (Enterprise)
  const customRemovalBacklog = await prisma.customRemovalRequest.count({
    where: { status: { in: ["PENDING", "ASSIGNED", "IN_PROGRESS"] } },
  });

  // Average removal time (in hours)
  const completedRemovals = await prisma.removalRequest.findMany({
    where: {
      status: "COMPLETED",
      submittedAt: { not: null },
      completedAt: { not: null },
    },
    select: {
      submittedAt: true,
      completedAt: true,
    },
    take: 100,
    orderBy: { completedAt: "desc" },
  });

  let avgRemovalTimeHours = 0;
  if (completedRemovals.length > 0) {
    const totalHours = completedRemovals.reduce((sum, r) => {
      if (r.submittedAt && r.completedAt) {
        return sum + (r.completedAt.getTime() - r.submittedAt.getTime()) / (1000 * 60 * 60);
      }
      return sum;
    }, 0);
    avgRemovalTimeHours = totalHours / completedRemovals.length;
  }

  // Removal status breakdown
  const removalStatusCounts = await prisma.removalRequest.groupBy({
    by: ["status"],
    _count: true,
  });

  const removalsByStatus: Record<string, number> = {};
  removalStatusCounts.forEach((item) => {
    removalsByStatus[item.status] = item._count;
  });

  // Removal method breakdown
  const removalMethodCounts = await prisma.removalRequest.groupBy({
    by: ["method"],
    _count: true,
  });

  const removalsByMethod: Record<string, number> = {};
  removalMethodCounts.forEach((item) => {
    if (item.method) {
      removalsByMethod[item.method] = item._count;
    }
  });

  // System health metrics
  const [completedScans, totalScans, completedRemovalsCount, totalRemovalsCount] = await Promise.all([
    prisma.scan.count({ where: { status: "COMPLETED" } }),
    prisma.scan.count(),
    prisma.removalRequest.count({ where: { status: "COMPLETED" } }),
    prisma.removalRequest.count(),
  ]);

  const lastScan = await prisma.scan.findFirst({
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  return {
    pendingRemovalRequests,
    inProgressRemovals,
    manualActionQueue,
    customRemovalBacklog,
    avgRemovalTimeHours: Math.round(avgRemovalTimeHours * 100) / 100,
    systemHealth: {
      scanSuccessRate: totalScans > 0 ? Math.round((completedScans / totalScans) * 100) : 100,
      removalSuccessRate: totalRemovalsCount > 0 ? Math.round((completedRemovalsCount / totalRemovalsCount) * 100) : 100,
      lastScanTime: lastScan?.createdAt.toISOString() || null,
    },
    removalsByStatus,
    removalsByMethod,
  };
}

async function getActivitiesMetrics(isSuperAdmin: boolean): Promise<ActivitiesMetrics> {
  const sevenDaysAgo = getDaysAgo(7);
  const thirtyDaysAgo = getDaysAgo(30);

  // Recent signups
  const recentSignups = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      createdAt: true,
    },
  });

  // Recent scans
  const recentScans = await prisma.scan.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      type: true,
      status: true,
      exposuresFound: true,
      sourcesChecked: true,
      createdAt: true,
      user: {
        select: { email: true },
      },
    },
  });

  // Recent audit logs
  const recentAuditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      actorEmail: true,
      action: true,
      resource: true,
      targetEmail: true,
      success: true,
      createdAt: true,
    },
  });

  // Active users in last 7 days
  const activeUsersLast7Days = await prisma.user.count({
    where: {
      OR: [
        { scans: { some: { createdAt: { gte: sevenDaysAgo } } } },
        { exposures: { some: { lastSeenAt: { gte: sevenDaysAgo } } } },
      ],
    },
  });

  // Active users in last 30 days
  const activeUsersLast30Days = await prisma.user.count({
    where: {
      OR: [
        { scans: { some: { createdAt: { gte: thirtyDaysAgo } } } },
        { exposures: { some: { lastSeenAt: { gte: thirtyDaysAgo } } } },
      ],
    },
  });

  // Top users by activity
  const topUsers = await prisma.user.findMany({
    take: 10,
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      _count: {
        select: {
          scans: true,
          exposures: true,
        },
      },
      scans: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
    orderBy: [
      { scans: { _count: "desc" } },
      { exposures: { _count: "desc" } },
    ],
  });

  // Mask emails if not super admin
  const maskFn = isSuperAdmin ? (e: string) => e : maskEmail;

  return {
    recentSignups: recentSignups.map((u) => ({
      id: u.id,
      email: maskFn(u.email),
      name: u.name,
      plan: u.plan,
      createdAt: u.createdAt.toISOString(),
    })),
    recentScans: recentScans.map((s) => ({
      id: s.id,
      userEmail: maskFn(s.user.email),
      type: s.type,
      status: s.status,
      exposuresFound: s.exposuresFound,
      sourcesChecked: s.sourcesChecked,
      createdAt: s.createdAt.toISOString(),
    })),
    recentAuditLogs: recentAuditLogs.map((a) => ({
      id: a.id,
      actorEmail: maskFn(a.actorEmail),
      action: a.action,
      resource: a.resource,
      targetEmail: a.targetEmail ? maskFn(a.targetEmail) : null,
      success: a.success,
      createdAt: a.createdAt.toISOString(),
    })),
    activeUsersLast7Days,
    activeUsersLast30Days,
    topUsersByActivity: topUsers.map((u) => ({
      id: u.id,
      email: maskFn(u.email),
      name: u.name,
      plan: u.plan,
      scansCount: u._count.scans,
      exposuresCount: u._count.exposures,
      lastActive: u.scans[0]?.createdAt.toISOString() || "",
    })),
  };
}
