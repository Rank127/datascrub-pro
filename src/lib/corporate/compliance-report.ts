// Corporate Compliance Report Generator

import { prisma } from "@/lib/db";

export interface ComplianceReport {
  accountSummary: {
    companyName: string;
    tier: string;
    totalSeats: number;
    activeSeats: number;
    activeSince: string;
    reportPeriod: { start: string; end: string };
  };
  employeeMetrics: Array<{
    seatId: string;
    employeeName: string | null;
    employeeEmail: string;
    onboardedAt: string | null;
    exposuresFound: number;
    removalsSubmitted: number;
    removalsCompleted: number;
    completionRate: number;
  }>;
  brokerCoverage: {
    totalBrokersScanned: number;
    uniqueBrokersWithRemovals: number;
  };
  aggregatedStats: {
    totalExposures: number;
    totalRemovalsSubmitted: number;
    totalRemovalsCompleted: number;
    overallCompletionRate: number;
    averageRemovalTimeDays: number;
  };
}

/**
 * Generate a quarterly compliance report for a corporate account.
 */
export async function generateQuarterlyReport(
  corporateAccountId: string
): Promise<ComplianceReport | null> {
  const account = await prisma.corporateAccount.findUnique({
    where: { id: corporateAccountId },
    include: {
      seats: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!account) return null;

  // Determine quarter boundaries
  const now = new Date();
  const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
  const quarterStart = new Date(now.getFullYear(), quarterMonth, 1);
  const quarterEnd = new Date(now.getFullYear(), quarterMonth + 3, 0, 23, 59, 59);

  const activeSeats = account.seats.filter((s) => s.userId && s.status === "ACTIVE");
  const userIds = activeSeats.map((s) => s.userId!);

  // Batch query exposures and removals for all users in the quarter
  const exposures = userIds.length > 0
    ? await prisma.exposure.groupBy({
        by: ["userId"],
        where: {
          userId: { in: userIds },
          firstFoundAt: { gte: quarterStart, lte: quarterEnd },
        },
        _count: true,
      })
    : [];

  const removals = userIds.length > 0
    ? await prisma.removalRequest.findMany({
        where: {
          userId: { in: userIds },
          createdAt: { gte: quarterStart, lte: quarterEnd },
        },
        select: {
          userId: true,
          status: true,
          method: true,
          submittedAt: true,
          completedAt: true,
          exposure: { select: { sourceName: true } },
        },
      })
    : [];

  const exposureMap = new Map(
    exposures.map((e) => [e.userId, e._count])
  );

  // Per-user removal stats
  const removalsByUser = new Map<string, typeof removals>();
  for (const r of removals) {
    if (!removalsByUser.has(r.userId)) {
      removalsByUser.set(r.userId, []);
    }
    removalsByUser.get(r.userId)!.push(r);
  }

  const employeeMetrics = activeSeats.map((seat) => {
    const userRemovals = removalsByUser.get(seat.userId!) || [];
    const submitted = userRemovals.length;
    const completed = userRemovals.filter((r) => r.status === "COMPLETED").length;
    return {
      seatId: seat.id,
      employeeName: seat.user?.name || null,
      employeeEmail: seat.user?.email || "",
      onboardedAt: seat.onboardedAt?.toISOString() || null,
      exposuresFound: exposureMap.get(seat.userId!) || 0,
      removalsSubmitted: submitted,
      removalsCompleted: completed,
      completionRate: submitted > 0 ? Math.round((completed / submitted) * 100) : 0,
    };
  });

  // Broker coverage — use exposure.sourceName as broker identifier
  const uniqueBrokers = new Set(removals.map((r) => r.exposure.sourceName));
  const brokersWithCompleted = new Set(
    removals.filter((r) => r.status === "COMPLETED").map((r) => r.exposure.sourceName)
  );

  // Average removal time (for completed removals)
  const completedRemovals = removals.filter(
    (r) => r.status === "COMPLETED" && r.submittedAt && r.completedAt
  );
  let avgTimeDays = 0;
  if (completedRemovals.length > 0) {
    const totalMs = completedRemovals.reduce((sum, r) => {
      return sum + (r.completedAt!.getTime() - r.submittedAt!.getTime());
    }, 0);
    avgTimeDays = Math.round(totalMs / completedRemovals.length / (1000 * 60 * 60 * 24) * 10) / 10;
  }

  const totalSubmitted = removals.length;
  const totalCompleted = removals.filter((r) => r.status === "COMPLETED").length;

  return {
    accountSummary: {
      companyName: account.name,
      tier: account.tier,
      totalSeats: account.maxSeats,
      activeSeats: activeSeats.length,
      activeSince: account.createdAt.toISOString(),
      reportPeriod: {
        start: quarterStart.toISOString(),
        end: quarterEnd.toISOString(),
      },
    },
    employeeMetrics,
    brokerCoverage: {
      totalBrokersScanned: uniqueBrokers.size,
      uniqueBrokersWithRemovals: brokersWithCompleted.size,
    },
    aggregatedStats: {
      totalExposures: employeeMetrics.reduce((s, e) => s + e.exposuresFound, 0),
      totalRemovalsSubmitted: totalSubmitted,
      totalRemovalsCompleted: totalCompleted,
      overallCompletionRate:
        totalSubmitted > 0 ? Math.round((totalCompleted / totalSubmitted) * 100) : 0,
      averageRemovalTimeDays: avgTimeDays,
    },
  };
}
