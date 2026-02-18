import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    // Total removal counts and status distribution
    const [
      totalRemovals,
      completedRemovals,
      pendingRemovals,
      submittedRemovals,
      inProgressRemovals,
    ] = await Promise.all([
      prisma.removalRequest.count(),
      prisma.removalRequest.count({ where: { status: "COMPLETED" } }),
      prisma.removalRequest.count({ where: { status: "PENDING" } }),
      prisma.removalRequest.count({ where: { status: "SUBMITTED" } }),
      prisma.removalRequest.count({ where: { status: "IN_PROGRESS" } }),
    ]);

    // Average completion time (completed removals only)
    const completedWithDates = await prisma.removalRequest.findMany({
      where: {
        status: "COMPLETED",
        submittedAt: { not: null },
        completedAt: { not: null },
      },
      select: { submittedAt: true, completedAt: true },
    });

    let avgCompletionHours = 0;
    if (completedWithDates.length > 0) {
      const totalHours = completedWithDates.reduce((sum, r) => {
        if (r.submittedAt && r.completedAt) {
          return (
            sum +
            (r.completedAt.getTime() - r.submittedAt.getTime()) /
              (1000 * 60 * 60)
          );
        }
        return sum;
      }, 0);
      avgCompletionHours = Math.round(totalHours / completedWithDates.length);
    }

    // Broker intelligence — top 10 fastest and slowest
    const brokerIntel = await prisma.brokerIntelligence.findMany({
      where: { removalsSent: { gt: 5 } },
      select: {
        sourceName: true,
        source: true,
        successRate: true,
        removalsCompleted: true,
        removalsSent: true,
      },
      orderBy: { successRate: "desc" },
    });

    const topBrokers = brokerIntel.slice(0, 10).map((b) => ({
      name: b.sourceName || b.source,
      successRate: Math.round(b.successRate),
      completedRemovals: b.removalsCompleted,
    }));

    const worstBrokers = brokerIntel
      .slice(-10)
      .reverse()
      .map((b) => ({
        name: b.sourceName || b.source,
        successRate: Math.round(b.successRate),
        completedRemovals: b.removalsCompleted,
      }));

    // Exposure severity distribution
    const exposureSeverity = await prisma.exposure.groupBy({
      by: ["severity"],
      _count: { id: true },
    });

    const severityDistribution = exposureSeverity.reduce(
      (acc, e) => {
        acc[e.severity || "UNKNOWN"] = e._count.id;
        return acc;
      },
      {} as Record<string, number>
    );

    // Removal method breakdown
    const methodBreakdown = await prisma.removalRequest.groupBy({
      by: ["method"],
      _count: { id: true },
    });

    const removalMethods = methodBreakdown.reduce(
      (acc, m) => {
        acc[m.method] = m._count.id;
        return acc;
      },
      {} as Record<string, number>
    );

    // Total brokers tracked
    const totalBrokers = await prisma.brokerIntelligence.count();

    // Success rate
    const successRate =
      totalRemovals > 0
        ? Math.round((completedRemovals / totalRemovals) * 100)
        : 0;

    return NextResponse.json({
      overview: {
        totalRemovals,
        completedRemovals,
        successRate,
        avgCompletionHours,
        totalBrokersTracked: totalBrokers,
      },
      statusDistribution: {
        completed: completedRemovals,
        pending: pendingRemovals,
        submitted: submittedRemovals,
        inProgress: inProgressRemovals,
      },
      severityDistribution,
      removalMethods,
      topBrokers,
      worstBrokers,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[public-stats] Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
