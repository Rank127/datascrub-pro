import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all stats in parallel
    const [
      totalExposures,
      activeExposures,
      removedExposures,
      whitelistedItems,
      pendingRemovals,
      recentExposures,
      removalsByCategory,
    ] = await Promise.all([
      // Total exposures
      prisma.exposure.count({
        where: { userId },
      }),
      // Active exposures (not removed, not whitelisted)
      prisma.exposure.count({
        where: {
          userId,
          status: "ACTIVE",
          isWhitelisted: false,
        },
      }),
      // Removed exposures
      prisma.exposure.count({
        where: {
          userId,
          status: "REMOVED",
        },
      }),
      // Whitelisted items
      prisma.whitelist.count({
        where: { userId },
      }),
      // Pending removals
      prisma.removalRequest.count({
        where: {
          userId,
          status: { in: ["PENDING", "SUBMITTED", "IN_PROGRESS"] },
        },
      }),
      // Recent exposures (last 5)
      prisma.exposure.findMany({
        where: { userId },
        orderBy: { firstFoundAt: "desc" },
        take: 5,
        select: {
          id: true,
          source: true,
          sourceName: true,
          sourceUrl: true,
          dataType: true,
          dataPreview: true,
          severity: true,
          status: true,
          isWhitelisted: true,
          firstFoundAt: true,
        },
      }),
      // Removal progress by category
      prisma.removalRequest.groupBy({
        by: ["status"],
        where: { userId },
        _count: true,
      }),
    ]);

    // Calculate risk score based on exposures
    // Higher score = higher risk (more active exposures)
    let riskScore = 0;
    if (totalExposures > 0) {
      // Base score from active exposures ratio
      const activeRatio = activeExposures / Math.max(totalExposures, 1);
      riskScore = Math.round(activeRatio * 100);

      // Adjust based on severity if we have active exposures
      if (activeExposures > 0) {
        const criticalCount = await prisma.exposure.count({
          where: { userId, status: "ACTIVE", severity: "CRITICAL" },
        });
        const highCount = await prisma.exposure.count({
          where: { userId, status: "ACTIVE", severity: "HIGH" },
        });

        // Add severity penalties
        riskScore = Math.min(100, riskScore + (criticalCount * 10) + (highCount * 5));
      }
    }

    // Get removal progress by source category
    const dataBrokerSources = ["SPOKEO", "WHITEPAGES", "BEENVERIFIED", "INTELIUS", "PEOPLEFINDER", "TRUEPEOPLESEARCH", "RADARIS"];
    const breachSources = ["HAVEIBEENPWNED", "DEHASHED", "BREACH_DB"];
    const socialSources = ["LINKEDIN", "FACEBOOK", "TWITTER", "INSTAGRAM", "TIKTOK", "REDDIT"];

    const [dataBrokerRemovals, breachRemovals, socialRemovals] = await Promise.all([
      prisma.removalRequest.findMany({
        where: {
          userId,
          exposure: { source: { in: dataBrokerSources } },
        },
        select: { status: true },
      }),
      prisma.removalRequest.findMany({
        where: {
          userId,
          exposure: { source: { in: breachSources } },
        },
        select: { status: true },
      }),
      prisma.removalRequest.findMany({
        where: {
          userId,
          exposure: { source: { in: socialSources } },
        },
        select: { status: true },
      }),
    ]);

    const calculateProgress = (removals: { status: string }[]) => {
      const total = removals.length;
      const completed = removals.filter(r => r.status === "COMPLETED").length;
      return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
    };

    return NextResponse.json({
      stats: {
        totalExposures,
        activeExposures,
        removedExposures,
        whitelistedItems,
        pendingRemovals,
        riskScore,
      },
      recentExposures,
      removalProgress: {
        dataBrokers: calculateProgress(dataBrokerRemovals),
        breaches: calculateProgress(breachRemovals),
        socialMedia: calculateProgress(socialRemovals),
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
