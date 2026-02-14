import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";
import { rateLimit, getClientIdentifier, rateLimitResponse } from "@/lib/rate-limit";
import { logAudit } from "@/lib/rbac/audit-log";
import { maskEmail } from "@/lib/rbac/pii-masking";
import { getStripe } from "@/lib/stripe";
import { getCronHealthStatus } from "@/lib/cron-logger";
import {
  ExecutiveStatsResponse,
  FinanceMetrics,
  WebAnalyticsMetrics,
  PlatformMetrics,
  OperationsMetrics,
  ActivitiesMetrics,
  TrendDataPoint,
} from "@/lib/executive/types";
import {
  isGAConfigured,
  getPageViews,
  getActiveUsers,
  getTopPages,
  getTrafficSources,
  getRealTimeUsers,
} from "@/lib/integrations/google-analytics";
import {
  isBingConfigured,
  getSearchPerformance,
  getQueryStats,
  getCrawlStats,
} from "@/lib/integrations/bing-webmaster";

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

    // Rate limit admin endpoint
    const rl = await rateLimit(getClientIdentifier(request, session.user.id), "admin");
    if (!rl.success) return rateLimitResponse(rl);

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
      platform,
    ] = await Promise.all([
      getFinanceMetrics(),
      getWebAnalyticsMetrics(),
      getOperationsMetrics(),
      getActivitiesMetrics(isSuperAdmin),
      getPlatformMetrics(),
    ]);

    const response: ExecutiveStatsResponse = {
      finance,
      analytics,
      operations,
      activities,
      platform,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "private, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[Executive Stats] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// Test accounts excluded from plan distribution counts (not from functionality)
const TEST_ACCOUNT_EMAILS = ["rank1its@gmail.com", "rocky@ghostmydata.com"];

async function getFinanceMetrics(): Promise<FinanceMetrics> {
  const startOfMonth = getStartOfMonth();

  try {
    const stripe = getStripe();

    // Fetch all active subscriptions from Stripe to calculate MRR
    const activeSubscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
      expand: ["data.items.data.price"],
    });

    // Calculate MRR from active subscriptions
    let mrr = 0;

    for (const sub of activeSubscriptions.data) {
      for (const item of sub.items.data) {
        const price = item.price;
        if (price.recurring) {
          // Convert to monthly if yearly
          let monthlyAmount = price.unit_amount || 0;
          if (price.recurring.interval === "year") {
            monthlyAmount = Math.round(monthlyAmount / 12);
          }
          mrr += monthlyAmount;
        }
      }
    }

    // Get subscription counts by status from Stripe
    const [canceledSubs, pastDueSubs] = await Promise.all([
      stripe.subscriptions.list({ status: "canceled", limit: 100 }),
      stripe.subscriptions.list({ status: "past_due", limit: 100 }),
    ]);

    const canceledCount = canceledSubs.data.length;
    const pastDueCount = pastDueSubs.data.length;

    // For accurate counts, use list with pagination or use Stripe's count if available
    // Here we'll fetch actual counts
    let totalActive = 0;
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const batch = await stripe.subscriptions.list({
        status: "active",
        limit: 100,
        starting_after: startingAfter,
      });
      totalActive += batch.data.length;
      hasMore = batch.has_more;
      if (batch.data.length > 0) {
        startingAfter = batch.data[batch.data.length - 1].id;
      }
    }

    // New subscriptions this month
    const startOfMonthTimestamp = Math.floor(startOfMonth.getTime() / 1000);
    const newSubsThisMonth = await stripe.subscriptions.list({
      status: "active",
      created: { gte: startOfMonthTimestamp },
      limit: 100,
    });
    const newSubscriptionsThisMonth = newSubsThisMonth.data.length;

    // Get last month's MRR for growth calculation
    // We'll estimate based on subscriptions that existed before this month
    const lastMonthSubs = await stripe.subscriptions.list({
      status: "active",
      created: { lt: startOfMonthTimestamp },
      limit: 100,
      expand: ["data.items.data.price"],
    });

    let lastMonthMrr = 0;
    for (const sub of lastMonthSubs.data) {
      for (const item of sub.items.data) {
        const price = item.price;
        if (price.recurring) {
          let monthlyAmount = price.unit_amount || 0;
          if (price.recurring.interval === "year") {
            monthlyAmount = Math.round(monthlyAmount / 12);
          }
          lastMonthMrr += monthlyAmount;
        }
      }
    }

    const mrrGrowth = lastMonthMrr > 0 ? ((mrr - lastMonthMrr) / lastMonthMrr) * 100 : 0;

    // Churn: subscriptions canceled this month
    // Stripe doesn't filter by canceled_at, so we fetch recent cancellations and filter
    const recentCancellations = await stripe.subscriptions.list({
      status: "canceled",
      limit: 100,
    });

    // Filter to only those canceled this month
    const canceledThisMonthCount = recentCancellations.data.filter(sub => {
      if (!sub.canceled_at) return false;
      return sub.canceled_at >= startOfMonthTimestamp;
    }).length;

    const activeAtStartOfMonth = totalActive + canceledThisMonthCount;
    const churnRate = activeAtStartOfMonth > 0 ? (canceledThisMonthCount / activeAtStartOfMonth) * 100 : 0;

    // ARPU
    const totalPaidUsers = totalActive;
    const arpu = totalPaidUsers > 0 ? Math.round(mrr / totalPaidUsers) : 0;

    // Get plan distribution from database (matches the popup data source)
    const planDistribution = await prisma.user.groupBy({
      by: ["plan"],
      _count: true,
      where: { email: { notIn: TEST_ACCOUNT_EMAILS } },
    });
    const planCounts = { FREE: 0, PRO: 0, ENTERPRISE: 0 };
    planDistribution.forEach((item) => {
      if (item.plan in planCounts) {
        planCounts[item.plan as keyof typeof planCounts] = item._count;
      }
    });

    return {
      mrr,
      mrrGrowth: Math.round(mrrGrowth * 100) / 100,
      subscriptionsByPlan: planCounts,
      activeSubscriptions: totalActive,
      canceledSubscriptions: canceledCount,
      pastDueSubscriptions: pastDueCount,
      newSubscriptionsThisMonth,
      churnRate: Math.round(churnRate * 100) / 100,
      arpu,
    };
  } catch (error) {
    console.error("[Finance Metrics] Stripe error, falling back to database:", error);

    // Fallback to database-based calculation if Stripe fails
    const subscriptionsByPlan = await prisma.user.groupBy({
      by: ["plan"],
      _count: true,
      where: { email: { notIn: TEST_ACCOUNT_EMAILS } },
    });

    const planCounts = { FREE: 0, PRO: 0, ENTERPRISE: 0 };
    subscriptionsByPlan.forEach((item) => {
      if (item.plan in planCounts) {
        planCounts[item.plan as keyof typeof planCounts] = item._count;
      }
    });

    // Use hardcoded prices as fallback
    const FALLBACK_PRICES = { PRO: 1199, ENTERPRISE: 2999 };
    const mrr = (planCounts.PRO * FALLBACK_PRICES.PRO) + (planCounts.ENTERPRISE * FALLBACK_PRICES.ENTERPRISE);
    const totalPaidUsers = planCounts.PRO + planCounts.ENTERPRISE;

    return {
      mrr,
      mrrGrowth: 0,
      subscriptionsByPlan: planCounts,
      activeSubscriptions: totalPaidUsers,
      canceledSubscriptions: 0,
      pastDueSubscriptions: 0,
      newSubscriptionsThisMonth: 0,
      churnRate: 0,
      arpu: totalPaidUsers > 0 ? Math.round(mrr / totalPaidUsers) : 0,
    };
  }
}

async function getWebAnalyticsMetrics(): Promise<WebAnalyticsMetrics> {
  // Fetch Google Analytics data
  const gaConfigured = isGAConfigured();
  let gaPageViews = null;
  let gaActiveUsers = null;
  let gaRealTimeUsers = null;
  let gaTopPages: { path: string; views: number }[] = [];
  let gaTrafficSources: { source: string; sessions: number }[] = [];

  if (gaConfigured) {
    try {
      const [pageViews, activeUsers, realTimeUsers, topPages, trafficSources] = await Promise.all([
        getPageViews(),
        getActiveUsers(),
        getRealTimeUsers(),
        getTopPages(10),
        getTrafficSources(),
      ]);
      gaPageViews = pageViews;
      gaActiveUsers = activeUsers;
      gaRealTimeUsers = realTimeUsers;
      gaTopPages = topPages;
      gaTrafficSources = trafficSources;
    } catch (error) {
      console.error("[Web Analytics] GA fetch error:", error);
    }
  }

  // Fetch Bing data
  const bingConfigured = isBingConfigured();
  let bingSearchPerformance = null;
  let bingTopQueries: { query: string; impressions: number; clicks: number; ctr: number; position: number }[] = [];
  let bingCrawlStats = null;

  if (bingConfigured) {
    try {
      const [searchPerf, queries, crawl] = await Promise.all([
        getSearchPerformance(),
        getQueryStats(),
        getCrawlStats(),
      ]);
      bingSearchPerformance = searchPerf;
      bingTopQueries = queries;
      bingCrawlStats = crawl ? {
        crawledPages: crawl.crawledPages,
        crawlErrors: crawl.crawlErrors,
        inIndex: crawl.inIndex,
      } : null;
    } catch (error) {
      console.error("[Web Analytics] Bing fetch error:", error);
    }
  }

  return {
    googleAnalytics: {
      configured: gaConfigured,
      pageViews: gaPageViews || undefined,
      activeUsers: gaActiveUsers || undefined,
      realTimeUsers: gaRealTimeUsers || undefined,
      topPages: gaTopPages,
      trafficSources: gaTrafficSources,
    },
    bing: {
      configured: bingConfigured,
      searchPerformance: bingSearchPerformance || undefined,
      topQueries: bingTopQueries,
      crawlStats: bingCrawlStats || undefined,
    },
  };
}

async function getPlatformMetrics(): Promise<PlatformMetrics> {
  const startOfMonth = getStartOfMonth();

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
  // Granular queue breakdown
  const [
    toProcessCount,
    awaitingResponseCount,
    requiresManualCount,
    inProgressRemovals,
  ] = await Promise.all([
    prisma.removalRequest.count({ where: { status: "PENDING" } }),
    prisma.removalRequest.count({ where: { status: "SUBMITTED" } }),
    prisma.removalRequest.count({ where: { status: "REQUIRES_MANUAL" } }),
    prisma.removalRequest.count({ where: { status: "IN_PROGRESS" } }),
  ]);

  // Legacy combined count for backwards compatibility
  const pendingRemovalRequests = toProcessCount + awaitingResponseCount;

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

  // Calculate total pipeline
  const totalPipeline = toProcessCount + awaitingResponseCount + requiresManualCount + manualActionQueue;

  // --- Cron Health ---
  let cronHealth: OperationsMetrics["cronHealth"];
  try {
    const cronStatus = await getCronHealthStatus();
    const failedJobs = cronStatus.jobs.filter(j => j.lastStatus === "FAILED");
    const overdueJobs = cronStatus.jobs.filter(j => j.isOverdue);
    const healthyJobs = cronStatus.jobs.filter(j => !j.isOverdue && j.lastStatus !== "FAILED");
    // Show critical crons first: overdue, then failed, then healthy — limit to 8
    const criticalJobs = [
      ...overdueJobs,
      ...failedJobs.filter(j => !j.isOverdue),
    ].slice(0, 8).map(j => ({
      name: j.name,
      lastRun: j.lastRun?.toISOString() || null,
      lastStatus: j.lastStatus,
      isOverdue: j.isOverdue,
      expectedInterval: j.expectedInterval,
    }));
    cronHealth = {
      total: cronStatus.jobs.length,
      healthy: healthyJobs.length,
      overdue: overdueJobs.length,
      failed: failedJobs.length,
      criticalJobs,
    };
  } catch (err) {
    console.error("[Executive Stats] Cron health fetch failed:", err);
  }

  // --- Ticket SLA ---
  let ticketSLA: OperationsMetrics["ticketSLA"];
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

    const [openCount, inProgressCount, waitingUserCount, resolvedToday] = await Promise.all([
      prisma.supportTicket.count({ where: { status: "OPEN" } }),
      prisma.supportTicket.count({ where: { status: "IN_PROGRESS" } }),
      prisma.supportTicket.count({ where: { status: "WAITING_USER" } }),
      prisma.supportTicket.count({
        where: { status: { in: ["RESOLVED", "CLOSED"] }, resolvedAt: { gte: twentyFourHoursAgo } },
      }),
    ]);

    // SLA breaches: OPEN or IN_PROGRESS tickets older than 4 hours with no resolution
    const breachedSLAs = await prisma.supportTicket.count({
      where: {
        status: { in: ["OPEN", "IN_PROGRESS"] },
        lastActivityAt: { lt: fourHoursAgo },
      },
    });

    // Average response time (time from creation to first comment)
    const recentResolved = await prisma.supportTicket.findMany({
      where: {
        resolvedAt: { gte: twentyFourHoursAgo },
      },
      select: { createdAt: true, resolvedAt: true, assignedAt: true },
      take: 50,
    });

    let avgResponseHours: number | null = null;
    const withAssignment = recentResolved.filter(t => t.assignedAt);
    if (withAssignment.length > 0) {
      const totalHrs = withAssignment.reduce((sum, t) => {
        return sum + (t.assignedAt!.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60);
      }, 0);
      avgResponseHours = Math.round((totalHrs / withAssignment.length) * 10) / 10;
    }

    let avgResolutionHours: number | null = null;
    const withResolution = recentResolved.filter(t => t.resolvedAt);
    if (withResolution.length > 0) {
      const totalHrs = withResolution.reduce((sum, t) => {
        return sum + (t.resolvedAt!.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = Math.round((totalHrs / withResolution.length) * 10) / 10;
    }

    // Auto-fixed today from cron logs
    let autoFixedToday = 0;
    try {
      const cronLogs = await prisma.cronLog.findMany({
        where: {
          jobName: "ticketing-agent",
          createdAt: { gte: twentyFourHoursAgo },
          status: { in: ["SUCCESS", "PARTIAL"] },
        },
        select: { metadata: true },
      });
      for (const log of cronLogs) {
        const meta = log.metadata as Record<string, number> | null;
        if (meta?.autoFixed) autoFixedToday += meta.autoFixed;
      }
    } catch { /* metadata parsing failure is non-critical */ }

    ticketSLA = {
      openTickets: openCount,
      inProgressTickets: inProgressCount,
      waitingUserTickets: waitingUserCount,
      breachedSLAs,
      avgResponseHours,
      avgResolutionHours,
      resolvedToday,
      autoFixedToday,
    };
  } catch (err) {
    console.error("[Executive Stats] Ticket SLA fetch failed:", err);
  }

  // --- B2: Agent Performance ---
  let agentPerformance: OperationsMetrics["agentPerformance"];
  try {
    const agentHealthRows = await prisma.agentHealth.findMany({
      orderBy: { updatedAt: "desc" },
    });

    const agents = agentHealthRows.map((a) => ({
      agentId: a.agentId,
      status: a.status,
      successRate: a.successRate24h ?? 0,
      avgDuration: a.avgExecutionTime ?? 0,
      executions: a.executions24h,
      estimatedCost: a.estimatedCost24h ?? 0,
      avgConfidence: a.avgConfidence,
      humanReviewRate: a.humanReviewRate ?? 0,
    }));

    const healthyAgents = agents.filter(a => a.status === "HEALTHY").length;
    const degradedAgents = agents.filter(a => a.status === "DEGRADED").length;
    const failedAgents = agents.filter(a => a.status === "FAILED" || a.status === "OFFLINE").length;
    const totalCost24h = agents.reduce((sum, a) => sum + a.estimatedCost, 0);
    const totalExecutions24h = agents.reduce((sum, a) => sum + a.executions, 0);

    agentPerformance = {
      totalAgents: agents.length,
      healthyAgents,
      degradedAgents,
      failedAgents,
      totalCost24h,
      totalExecutions24h,
      agents,
    };
  } catch (err) {
    console.error("[Executive Stats] Agent performance fetch failed:", err);
  }

  // --- B2: Broker Intelligence ---
  let brokerIntelligence: OperationsMetrics["brokerIntelligence"];
  try {
    const brokerRows = await prisma.brokerIntelligence.findMany({
      where: { removalsSent: { gte: 3 } },
      orderBy: { successRate: "desc" },
    });

    const topPerformers = brokerRows.slice(0, 5).map(b => ({
      source: b.source,
      sourceName: b.sourceName,
      successRate: b.successRate,
      removalsCompleted: b.removalsCompleted,
      removalsSent: b.removalsSent,
    }));

    const worstPerformers = [...brokerRows]
      .sort((a, b) => a.successRate - b.successRate)
      .slice(0, 5)
      .map(b => ({
        source: b.source,
        sourceName: b.sourceName,
        successRate: b.successRate,
        falsePositiveRate: b.falsePositiveRate ?? 0,
        removalsSent: b.removalsSent,
      }));

    brokerIntelligence = {
      totalBrokers: brokerRows.length,
      topPerformers,
      worstPerformers,
    };
  } catch (err) {
    console.error("[Executive Stats] Broker intelligence fetch failed:", err);
  }

  // --- B2: Remediation Savings ---
  let remediationSavings: OperationsMetrics["remediationSavings"];
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [logsToday, logs7d] = await Promise.all([
      prisma.cronLog.findMany({
        where: { jobName: "ticketing-agent", createdAt: { gte: twentyFourHoursAgo }, status: { in: ["SUCCESS", "PARTIAL"] } },
        select: { metadata: true },
      }),
      prisma.cronLog.findMany({
        where: { jobName: "ticketing-agent", createdAt: { gte: sevenDaysAgo }, status: { in: ["SUCCESS", "PARTIAL"] } },
        select: { metadata: true },
      }),
    ]);

    let autoFixedToday = 0, aiCallsAvoidedToday = 0;
    for (const log of logsToday) {
      const meta = log.metadata as Record<string, number> | null;
      if (meta?.autoFixed) autoFixedToday += meta.autoFixed;
      if (meta?.aiCallsAvoided) aiCallsAvoidedToday += meta.aiCallsAvoided;
    }

    let autoFixed7d = 0, aiCallsAvoided7d = 0;
    for (const log of logs7d) {
      const meta = log.metadata as Record<string, number> | null;
      if (meta?.autoFixed) autoFixed7d += meta.autoFixed;
      if (meta?.aiCallsAvoided) aiCallsAvoided7d += meta.aiCallsAvoided;
    }

    // Estimate cost saved: ~$0.015 per AI call avoided (Haiku pricing)
    const estimatedCostSaved7d = Math.round(aiCallsAvoided7d * 1.5); // 1.5 cents per call

    remediationSavings = { autoFixedToday, autoFixed7d, aiCallsAvoidedToday, aiCallsAvoided7d, estimatedCostSaved7d };
  } catch (err) {
    console.error("[Executive Stats] Remediation savings fetch failed:", err);
  }

  // --- B2: Queue Velocity ---
  let queueVelocity: OperationsMetrics["queueVelocity"];
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [completedLast24h, completedLast7d, runsLast24h] = await Promise.all([
      prisma.removalRequest.count({
        where: { status: "COMPLETED", completedAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.removalRequest.count({
        where: { status: "COMPLETED", completedAt: { gte: sevenDaysAgo } },
      }),
      prisma.cronLog.count({
        where: {
          jobName: { in: ["process-removals", "clear-pending-queue"] },
          createdAt: { gte: twentyFourHoursAgo },
          status: "SUCCESS",
        },
      }),
    ]);

    queueVelocity = {
      itemsProcessedLast24h: completedLast24h,
      itemsProcessedLast7d: completedLast7d,
      avgItemsPerHour24h: Math.round((completedLast24h / 24) * 10) / 10,
      avgItemsPerRun: runsLast24h > 0 ? Math.round((completedLast24h / runsLast24h) * 10) / 10 : 0,
      runsLast24h,
    };
  } catch (err) {
    console.error("[Executive Stats] Queue velocity fetch failed:", err);
  }

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
    queueBreakdown: {
      toProcess: toProcessCount,
      awaitingResponse: awaitingResponseCount,
      requiresManual: requiresManualCount,
      manualExposures: manualActionQueue,
      totalPipeline,
    },
    cronHealth,
    ticketSLA,
    agentPerformance,
    brokerIntelligence,
    remediationSavings,
    queueVelocity,
  };
}

// Helper to calculate effective plan considering family membership
function calculateEffectivePlan(
  userPlan: string,
  familyMembership: { familyGroup: { owner: { subscription: { plan: string } | null } } } | null
): string {
  // If user is a family member, check if owner has Enterprise
  if (familyMembership?.familyGroup?.owner?.subscription?.plan === "ENTERPRISE") {
    return "ENTERPRISE";
  }
  return userPlan;
}

async function getActivitiesMetrics(isSuperAdmin: boolean): Promise<ActivitiesMetrics> {
  const sevenDaysAgo = getDaysAgo(7);
  const thirtyDaysAgo = getDaysAgo(30);

  // Recent signups - include family membership to calculate effective plan
  const recentSignups = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      createdAt: true,
      familyMembership: {
        select: {
          familyGroup: {
            select: {
              owner: {
                select: {
                  subscription: {
                    select: { plan: true },
                  },
                },
              },
            },
          },
        },
      },
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

  // Recent plan changes from audit logs
  const planChangeActions = [
    "UPDATE_USER_PLAN",      // Admin manual change
    "MODIFY_USER_PLAN",      // Legacy admin change
    "PLAN_UPGRADE",          // Stripe upgrade
    "PLAN_DOWNGRADE",        // Stripe downgrade
    "SUBSCRIPTION_UPDATED",  // Legacy
    "SUBSCRIPTION_CANCELED", // Stripe cancellation/refund
  ];
  const recentPlanChangeLogs = await prisma.auditLog.findMany({
    where: {
      action: { in: planChangeActions },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      actorEmail: true,
      targetEmail: true,
      targetUserId: true,
      action: true,
      details: true,
      createdAt: true,
    },
  });

  // Parse plan change details from audit logs
  const recentPlanChanges = recentPlanChangeLogs.map((log) => {
    // Parse details - it's stored as JSON string or object
    let details: Record<string, unknown> = {};
    if (log.details) {
      try {
        details = typeof log.details === "string" ? JSON.parse(log.details) : (log.details as Record<string, unknown>);
      } catch {
        details = {};
      }
    }

    const previousPlan = String(details.previousPlan || details.oldPlan || details.from || "FREE");
    const newPlan = String(details.newPlan || details.plan || details.to || "FREE");

    // Determine change type
    const planRank: Record<string, number> = { FREE: 0, PRO: 1, ENTERPRISE: 2 };
    const prevRank = planRank[previousPlan] ?? 0;
    const newRank = planRank[newPlan] ?? 0;

    let changeType: "upgrade" | "downgrade" | "cancel" = "upgrade";
    if (newPlan === "FREE" || newPlan === "CANCELED") {
      changeType = "cancel";
    } else if (newRank < prevRank) {
      changeType = "downgrade";
    }

    return {
      id: log.id,
      userId: log.targetUserId || "",
      userEmail: log.targetEmail || log.actorEmail,
      userName: details.userName ? String(details.userName) : details.name ? String(details.name) : null,
      previousPlan,
      newPlan,
      changeType,
      reason: details.reason ? String(details.reason) : details.cancelReason ? String(details.cancelReason) : undefined,
      createdAt: log.createdAt.toISOString(),
    };
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

  // Top users by activity - include family membership to calculate effective plan
  const topUsers = await prisma.user.findMany({
    take: 10,
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      familyMembership: {
        select: {
          familyGroup: {
            select: {
              owner: {
                select: {
                  subscription: {
                    select: { plan: true },
                  },
                },
              },
            },
          },
        },
      },
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
      effectivePlan: calculateEffectivePlan(u.plan, u.familyMembership),
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
    recentPlanChanges: recentPlanChanges.map((p) => ({
      ...p,
      userEmail: maskFn(p.userEmail),
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
      effectivePlan: calculateEffectivePlan(u.plan, u.familyMembership),
      scansCount: u._count.scans,
      exposuresCount: u._count.exposures,
      lastActive: u.scans[0]?.createdAt.toISOString() || "",
    })),
  };
}
