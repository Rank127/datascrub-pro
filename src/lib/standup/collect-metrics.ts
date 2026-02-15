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
    avgExecutionTime: number | null;
    avgConfidence: number | null;
    humanReviewRate: number | null;
    errorMessage: string | null;
    failures24h: number;
    successes24h: number;
    recentCapabilities: string[];
    fallbackCount: number;
  }>;
}

export interface CronJobDetail {
  name: string;
  label: string;
  successCount: number;
  failureCount: number;
  lastRun: Date | null;
  isOverdue: boolean;
  isLogging: boolean;
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
  jobDetails: CronJobDetail[];
}

export interface RemovalStatusContext {
  pipelineHealth: "HEALTHY" | "DEGRADED" | "CRITICAL";
  pendingExplanation: string;
  submittedExplanation: string;
  completionRate: number;
  completedAllTime: number;
  requiresManualCount: number;
}

export interface RemovalMetrics {
  pending: number;
  submitted: number;
  completed24h: number;
  failed24h: number;
  totalActive: number;
  avgCompletionHours: number | null;
  methodBreakdown: Array<{ method: string; count: number }>;
  statusContext: RemovalStatusContext;
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

export interface TicketMetrics {
  openCount: number;
  inProgressCount: number;
  waitingUserCount: number;
  resolvedClosed24h: number;
  staleCount: number;
  avgResolutionHours: number | null;
  autoFixedCount24h: number;
  aiResolvedCount24h: number;
  aiCallsAvoided24h: number;
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
  tickets: TicketMetrics;
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
    tickets,
  ] = await Promise.all([
    collectAgentHealth(),
    collectCronHealth(twentyFourHoursAgo),
    collectRemovalMetrics(twentyFourHoursAgo),
    collectScanMetrics(twentyFourHoursAgo),
    collectUserMetrics(twentyFourHoursAgo, sevenDaysAgo),
    collectBrokerMetrics(),
    collectSecurityMetrics(twentyFourHoursAgo),
    collectTicketMetrics(twentyFourHoursAgo),
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
    tickets,
  };
}

async function collectAgentHealth(): Promise<AgentHealthMetrics> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [allAgents, recentExecutions] = await Promise.all([
    prisma.agentHealth.findMany({
      orderBy: { updatedAt: "desc" },
    }),
    prisma.agentExecution.findMany({
      where: { createdAt: { gte: twentyFourHoursAgo } },
      select: { agentId: true, capability: true, usedFallback: true },
    }),
  ]);

  // Group execution data by agentId
  const execsByAgent = new Map<string, { capabilities: Set<string>; fallbackCount: number }>();
  for (const exec of recentExecutions) {
    let entry = execsByAgent.get(exec.agentId);
    if (!entry) {
      entry = { capabilities: new Set(), fallbackCount: 0 };
      execsByAgent.set(exec.agentId, entry);
    }
    entry.capabilities.add(exec.capability);
    if (exec.usedFallback) entry.fallbackCount++;
  }

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
    agents: allAgents.map((a) => {
      const execData = execsByAgent.get(a.agentId);
      return {
        agentId: a.agentId,
        status: a.status,
        successRate24h: a.successRate24h,
        executions24h: a.executions24h,
        estimatedCost24h: a.estimatedCost24h,
        consecutiveFailures: a.consecutiveFailures,
        lastRun: a.lastRun,
        avgExecutionTime: a.avgExecutionTime,
        avgConfidence: a.avgConfidence,
        humanReviewRate: a.humanReviewRate,
        errorMessage: a.errorMessage,
        failures24h: a.failures24h,
        successes24h: a.successes24h,
        recentCapabilities: execData ? Array.from(execData.capabilities) : [],
        fallbackCount: execData?.fallbackCount ?? 0,
      };
    }),
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

  // Build per-job detail from cronStatus + recent logs
  const jobDetails: CronJobDetail[] = cronStatus.jobs.map((job) => {
    const jobLogs = recentLogs.filter((l) => l.jobName === job.name);
    return {
      name: job.name,
      label: job.expectedInterval,
      successCount: jobLogs.filter((l) => l.status === "SUCCESS").length,
      failureCount: jobLogs.filter((l) => l.status === "FAILED").length,
      lastRun: job.lastRun,
      isOverdue: job.isOverdue && !!job.lastRun,
      isLogging: job.lastRun !== null || jobLogs.length > 0,
    };
  });

  return {
    totalJobs: cronStatus.jobs.length,
    successCount24h: successCount,
    failureCount24h: failureCount,
    overdueJobs,
    recentFailures,
    jobDetails,
  };
}

async function collectRemovalMetrics(
  since: Date
): Promise<RemovalMetrics> {
  const [pending, submitted, completed24h, failed24h, methodGroups, completedRecords, completedAllTime, requiresManualCount, totalAllTime] =
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
      prisma.removalRequest.count({ where: { status: "COMPLETED" } }),
      prisma.removalRequest.count({ where: { status: "REQUIRES_MANUAL" } }),
      prisma.removalRequest.count(),
    ]);

  let avgCompletionHours: number | null = null;
  if (completedRecords.length > 0) {
    const totalHours = completedRecords.reduce((sum, r) => {
      if (!r.completedAt) return sum;
      return sum + (r.completedAt.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60);
    }, 0);
    avgCompletionHours = Math.round((totalHours / completedRecords.length) * 10) / 10;
  }

  // Determine pipeline health
  const failureRate24h = (pending + submitted) > 0
    ? failed24h / (pending + submitted + completed24h + failed24h)
    : 0;
  const pipelineHealth: "HEALTHY" | "DEGRADED" | "CRITICAL" =
    failureRate24h > 0.3 ? "CRITICAL" : failureRate24h > 0.1 ? "DEGRADED" : "HEALTHY";

  const completionRate = totalAllTime > 0
    ? Math.round((completedAllTime / totalAllTime) * 1000) / 10
    : 0;

  const statusContext: RemovalStatusContext = {
    pipelineHealth,
    pendingExplanation: `${pending} requests queued for processing. These are batched and sent every hour via clear-pending-queue cron (capacity: 3,600/day). This is NORMAL operational state.`,
    submittedExplanation: `${submitted} emails sent to brokers, awaiting their legal 45-day CCPA/GDPR response window. This is NORMAL — brokers typically respond in 7-45 days.`,
    completionRate,
    completedAllTime,
    requiresManualCount,
  };

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
    statusContext,
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

async function collectTicketMetrics(
  since: Date
): Promise<TicketMetrics> {
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

  const [openCount, inProgressCount, waitingUserCount, resolvedClosed24h, staleCount, resolvedTickets, ticketingLogs] =
    await Promise.all([
      prisma.supportTicket.count({ where: { status: "OPEN" } }),
      prisma.supportTicket.count({ where: { status: "IN_PROGRESS" } }),
      prisma.supportTicket.count({ where: { status: "WAITING_USER" } }),
      prisma.supportTicket.count({
        where: {
          status: { in: ["RESOLVED", "CLOSED"] },
          updatedAt: { gte: since },
        },
      }),
      prisma.supportTicket.count({
        where: {
          status: "OPEN",
          lastActivityAt: { lt: fourHoursAgo },
        },
      }),
      prisma.supportTicket.findMany({
        where: {
          resolvedAt: { gte: since },
        },
        select: { createdAt: true, resolvedAt: true },
      }),
      // Query cron logs for ticketing-agent to extract auto-fix savings
      prisma.cronLog.findMany({
        where: {
          jobName: "ticketing-agent",
          createdAt: { gte: since },
        },
        select: { metadata: true },
      }),
    ]);

  let avgResolutionHours: number | null = null;
  if (resolvedTickets.length > 0) {
    const totalHours = resolvedTickets.reduce((sum, t) => {
      if (!t.resolvedAt) return sum;
      return sum + (t.resolvedAt.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60);
    }, 0);
    avgResolutionHours = Math.round((totalHours / resolvedTickets.length) * 10) / 10;
  }

  // Aggregate auto-fix savings from ticketing-agent cron logs
  let autoFixedCount24h = 0;
  let aiResolvedCount24h = 0;
  for (const log of ticketingLogs) {
    const meta = log.metadata as Record<string, unknown> | null;
    if (meta) {
      autoFixedCount24h += (meta.autoFixed as number) || 0;
      aiResolvedCount24h += (meta.autoResolved as number) || 0;
    }
  }

  return {
    openCount,
    inProgressCount,
    waitingUserCount,
    resolvedClosed24h,
    staleCount,
    avgResolutionHours,
    autoFixedCount24h,
    aiResolvedCount24h,
    aiCallsAvoided24h: autoFixedCount24h, // Each auto-fix = 1 AI call saved
  };
}
