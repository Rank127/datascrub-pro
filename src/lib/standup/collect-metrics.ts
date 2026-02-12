/**
 * Daily Standup - Metrics Collection
 *
 * Queries 8 data sources in parallel to build a complete picture
 * of system health over the last 24 hours.
 */

import { prisma } from "@/lib/db";
import { getCronHealthStatus } from "@/lib/cron-logger";

const TEST_ACCOUNT_EMAILS = ["rank1its@gmail.com", "rocky@ghostmydata.com"];

export interface AgentHealthMetrics {
  total: number;
  healthy: number;
  degraded: number;
  failed: number;
  totalCost24h: number;
  totalTokens24h: number;
  totalExecutions24h: number;
  agents: Array<{
    agentId: string;
    status: string;
    successRate24h: number | null;
    executions24h: number;
    estimatedCost24h: number;
    consecutiveFailures: number;
    lastRun: Date | null;
  }>;
}

export interface CronHealthMetrics {
  totalJobs: number;
  successCount24h: number;
  failureCount24h: number;
  overdueJobs: string[];
  recentFailures: Array<{
    jobName: string;
    message: string | null;
    createdAt: Date;
  }>;
}

export interface RemovalMetrics {
  pending: number;
  submitted: number;
  completed24h: number;
  failed24h: number;
  totalActive: number;
  avgCompletionHours: number | null;
  methodBreakdown: Array<{ method: string; count: number }>;
}

export interface ScanMetrics {
  completed24h: number;
  failed24h: number;
  exposuresFound24h: number;
  inProgress: number;
}

export interface PlanDistribution {
  FREE: number;
  PRO: number;
  ENTERPRISE: number;
}

export interface UserMetrics {
  totalUsers: number;
  newSignups24h: number;
  activeUsers7d: number;
  planDistribution: PlanDistribution;
}

export interface BrokerMetrics {
  totalBrokers: number;
  topPerformers: Array<{
    source: string;
    sourceName: string | null;
    successRate: number;
    removalsCompleted: number;
  }>;
  worstPerformers: Array<{
    source: string;
    sourceName: string | null;
    successRate: number;
    falsePositiveRate: number;
  }>;
}

export interface SecurityMetrics {
  adminActions24h: number;
  planChanges24h: number;
  failedActions24h: number;
  recentAdminActions: Array<{
    action: string;
    actorEmail: string;
    createdAt: Date;
  }>;
}

export interface StandupMetrics {
  collectedAt: string;
  periodStart: string;
  periodEnd: string;
  agents: AgentHealthMetrics;
  crons: CronHealthMetrics;
  removals: RemovalMetrics;
  scans: ScanMetrics;
  users: UserMetrics;
  brokers: BrokerMetrics;
  security: SecurityMetrics;
}

export async function collectStandupMetrics(): Promise<StandupMetrics> {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    agents,
    crons,
    removals,
    scans,
    users,
    brokers,
    security,
  ] = await Promise.all([
    collectAgentHealth(),
    collectCronHealth(twentyFourHoursAgo),
    collectRemovalMetrics(twentyFourHoursAgo),
    collectScanMetrics(twentyFourHoursAgo),
    collectUserMetrics(twentyFourHoursAgo, sevenDaysAgo),
    collectBrokerMetrics(),
    collectSecurityMetrics(twentyFourHoursAgo),
  ]);

  return {
    collectedAt: now.toISOString(),
    periodStart: twentyFourHoursAgo.toISOString(),
    periodEnd: now.toISOString(),
    agents,
    crons,
    removals,
    scans,
    users,
    brokers,
    security,
  };
}

async function collectAgentHealth(): Promise<AgentHealthMetrics> {
  const allAgents = await prisma.agentHealth.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const healthy = allAgents.filter((a) => a.status === "HEALTHY").length;
  const degraded = allAgents.filter((a) => a.status === "DEGRADED").length;
  const failed = allAgents.filter(
    (a) => a.status === "FAILED" || a.status === "CRITICAL"
  ).length;

  return {
    total: allAgents.length,
    healthy,
    degraded,
    failed,
    totalCost24h: allAgents.reduce((sum, a) => sum + a.estimatedCost24h, 0),
    totalTokens24h: allAgents.reduce((sum, a) => sum + a.tokensUsed24h, 0),
    totalExecutions24h: allAgents.reduce((sum, a) => sum + a.executions24h, 0),
    agents: allAgents.map((a) => ({
      agentId: a.agentId,
      status: a.status,
      successRate24h: a.successRate24h,
      executions24h: a.executions24h,
      estimatedCost24h: a.estimatedCost24h,
      consecutiveFailures: a.consecutiveFailures,
      lastRun: a.lastRun,
    })),
  };
}

async function collectCronHealth(
  since: Date
): Promise<CronHealthMetrics> {
  const [cronStatus, recentLogs] = await Promise.all([
    getCronHealthStatus(),
    prisma.cronLog.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const successCount = recentLogs.filter((l) => l.status === "SUCCESS").length;
  const failureCount = recentLogs.filter((l) => l.status === "FAILED").length;
  const overdueJobs = cronStatus.jobs
    .filter((j) => j.isOverdue && j.lastRun)
    .map((j) => j.name);

  const recentFailures = recentLogs
    .filter((l) => l.status === "FAILED")
    .slice(0, 5)
    .map((l) => ({
      jobName: l.jobName,
      message: l.message,
      createdAt: l.createdAt,
    }));

  return {
    totalJobs: cronStatus.jobs.length,
    successCount24h: successCount,
    failureCount24h: failureCount,
    overdueJobs,
    recentFailures,
  };
}

async function collectRemovalMetrics(
  since: Date
): Promise<RemovalMetrics> {
  const [pending, submitted, completed24h, failed24h, methodGroups, completedRecords] =
    await Promise.all([
      prisma.removalRequest.count({ where: { status: "PENDING" } }),
      prisma.removalRequest.count({ where: { status: "SUBMITTED" } }),
      prisma.removalRequest.count({
        where: { status: "COMPLETED", completedAt: { gte: since } },
      }),
      prisma.removalRequest.count({
        where: { status: "FAILED", updatedAt: { gte: since } },
      }),
      prisma.removalRequest.groupBy({
        by: ["method"],
        where: { completedAt: { gte: since } },
        _count: true,
      }),
      prisma.removalRequest.findMany({
        where: { status: "COMPLETED", completedAt: { gte: since } },
        select: { createdAt: true, completedAt: true },
      }),
    ]);

  let avgCompletionHours: number | null = null;
  if (completedRecords.length > 0) {
    const totalHours = completedRecords.reduce((sum, r) => {
      if (!r.completedAt) return sum;
      return sum + (r.completedAt.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60);
    }, 0);
    avgCompletionHours = Math.round((totalHours / completedRecords.length) * 10) / 10;
  }

  return {
    pending,
    submitted,
    completed24h,
    failed24h,
    totalActive: pending + submitted,
    avgCompletionHours,
    methodBreakdown: methodGroups.map((g) => ({
      method: g.method,
      count: g._count,
    })),
  };
}

async function collectScanMetrics(since: Date): Promise<ScanMetrics> {
  const [completed, failed, inProgress, exposureResult] = await Promise.all([
    prisma.scan.count({
      where: { status: "COMPLETED", completedAt: { gte: since } },
    }),
    prisma.scan.count({
      where: { status: "FAILED", completedAt: { gte: since } },
    }),
    prisma.scan.count({ where: { status: "IN_PROGRESS" } }),
    prisma.scan.aggregate({
      where: { completedAt: { gte: since } },
      _sum: { exposuresFound: true },
    }),
  ]);

  return {
    completed24h: completed,
    failed24h: failed,
    exposuresFound24h: exposureResult._sum.exposuresFound || 0,
    inProgress,
  };
}

async function collectUserMetrics(
  since24h: Date,
  since7d: Date
): Promise<UserMetrics> {
  const [totalUsers, newSignups, activeUsers, planGroups] = await Promise.all([
    prisma.user.count({
      where: { email: { notIn: TEST_ACCOUNT_EMAILS } },
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: since24h },
        email: { notIn: TEST_ACCOUNT_EMAILS },
      },
    }),
    prisma.user.count({
      where: {
        updatedAt: { gte: since7d },
        email: { notIn: TEST_ACCOUNT_EMAILS },
      },
    }),
    prisma.user.groupBy({
      by: ["plan"],
      where: { email: { notIn: TEST_ACCOUNT_EMAILS } },
      _count: true,
    }),
  ]);

  const planDistribution: PlanDistribution = { FREE: 0, PRO: 0, ENTERPRISE: 0 };
  for (const g of planGroups) {
    if (g.plan === "FREE" || g.plan === "PRO" || g.plan === "ENTERPRISE") {
      planDistribution[g.plan] = g._count;
    }
  }

  return {
    totalUsers,
    newSignups24h: newSignups,
    activeUsers7d: activeUsers,
    planDistribution,
  };
}

async function collectBrokerMetrics(): Promise<BrokerMetrics> {
  const allBrokers = await prisma.brokerIntelligence.findMany({
    where: { removalsSent: { gt: 0 } },
    orderBy: { successRate: "desc" },
  });

  const topPerformers = allBrokers.slice(0, 3).map((b) => ({
    source: b.source,
    sourceName: b.sourceName,
    successRate: b.successRate,
    removalsCompleted: b.removalsCompleted,
  }));

  const worstPerformers = allBrokers
    .filter((b) => b.removalsSent >= 3)
    .sort((a, b) => a.successRate - b.successRate)
    .slice(0, 3)
    .map((b) => ({
      source: b.source,
      sourceName: b.sourceName,
      successRate: b.successRate,
      falsePositiveRate: b.falsePositiveRate,
    }));

  return {
    totalBrokers: allBrokers.length,
    topPerformers,
    worstPerformers,
  };
}

async function collectSecurityMetrics(
  since: Date
): Promise<SecurityMetrics> {
  const [adminActions, planChanges, failedActions, recentActions] =
    await Promise.all([
      prisma.auditLog.count({
        where: { createdAt: { gte: since }, actorRole: "ADMIN" },
      }),
      prisma.auditLog.count({
        where: {
          createdAt: { gte: since },
          action: { contains: "PLAN" },
        },
      }),
      prisma.auditLog.count({
        where: { createdAt: { gte: since }, success: false },
      }),
      prisma.auditLog.findMany({
        where: { createdAt: { gte: since }, actorRole: "ADMIN" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { action: true, actorEmail: true, createdAt: true },
      }),
    ]);

  return {
    adminActions24h: adminActions,
    planChanges24h: planChanges,
    failedActions24h: failedActions,
    recentAdminActions: recentActions,
  };
}
