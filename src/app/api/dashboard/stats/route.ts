import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectivePlan } from "@/lib/admin";
import { DataSourceNames } from "@/lib/types";
import { getSubsidiaries, getConsolidationParent, isParentBroker, getDataBrokerInfo } from "@/lib/removers/data-broker-directory";

// AI Protection source categories
const AI_TRAINING_SOURCES = [
  "LAION_AI", "STABILITY_AI", "OPENAI", "MIDJOURNEY", "META_AI",
  "GOOGLE_AI", "LINKEDIN_AI", "ADOBE_AI", "AMAZON_AI"
];
const FACIAL_RECOGNITION_SOURCES = [
  "CLEARVIEW_AI", "PIMEYES", "FACECHECK_ID", "SOCIAL_CATFISH", "TINEYE", "YANDEX_IMAGES"
];
const VOICE_CLONING_SOURCES = ["ELEVENLABS", "RESEMBLE_AI", "MURF_AI"];
const ALL_AI_SOURCES = [...AI_TRAINING_SOURCES, ...FACIAL_RECOGNITION_SOURCES, ...VOICE_CLONING_SOURCES];

// Time estimates for manual removal (minutes)
const MINUTES_PER_REMOVAL = 45;
const HOURLY_VALUE = 15; // $15/hour value of time

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user info for plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, email: true },
    });
    const userPlan = getEffectivePlan(user?.email, user?.plan || "FREE");

    // Fetch all stats in parallel
    const [
      totalExposures,
      activeExposures,
      removedExposures,
      whitelistedItems,
      pendingRemovals,
      totalRemovalRequests,
      manualActionTotal,
      manualActionDone,
      recentExposures,
      removalsByCategory,
      aiTrainingExposures,
      facialRecognitionExposures,
      voiceCloningExposures,
      aiOptedOutExposures,
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
      // Pending removals (in progress)
      prisma.removalRequest.count({
        where: {
          userId,
          status: { in: ["PENDING", "SUBMITTED", "IN_PROGRESS"] },
        },
      }),
      // Total removal requests submitted
      prisma.removalRequest.count({
        where: { userId },
      }),
      // Manual action total
      prisma.exposure.count({
        where: { userId, requiresManualAction: true },
      }),
      // Manual action done
      prisma.exposure.count({
        where: { userId, requiresManualAction: true, manualActionTaken: true },
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
          requiresManualAction: true,
          manualActionTaken: true,
        },
      }),
      // Removal progress by category
      prisma.removalRequest.groupBy({
        by: ["status"],
        where: { userId },
        _count: true,
      }),
      // AI Protection stats
      prisma.exposure.count({
        where: { userId, source: { in: AI_TRAINING_SOURCES } },
      }),
      prisma.exposure.count({
        where: { userId, source: { in: FACIAL_RECOGNITION_SOURCES } },
      }),
      prisma.exposure.count({
        where: { userId, source: { in: VOICE_CLONING_SOURCES } },
      }),
      prisma.exposure.count({
        where: { userId, source: { in: ALL_AI_SOURCES }, status: "REMOVED" },
      }),
    ]);

    // Calculate Protection Score (positive framing - opposite of risk)
    // 100% protected = all exposures removed, 0% = none removed
    const protectionScore = totalExposures > 0
      ? Math.round((removedExposures / totalExposures) * 100)
      : 100; // No exposures = fully protected

    // Calculate Time Saved
    const completedRemovals = await prisma.removalRequest.count({
      where: { userId, status: "COMPLETED" },
    });
    const timeSavedMinutes = completedRemovals * MINUTES_PER_REMOVAL;
    const timeSavedHours = Math.round(timeSavedMinutes / 60);
    const timeSaved = {
      hours: timeSavedHours,
      minutes: timeSavedMinutes,
      estimatedValue: Math.round(timeSavedHours * HOURLY_VALUE),
    };

    // Calculate Week-over-Week Trends
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [
      currentWeekExposures,
      previousWeekExposures,
      currentWeekRemovals,
      previousWeekRemovals,
    ] = await Promise.all([
      // Current week exposures found
      prisma.exposure.count({
        where: {
          userId,
          firstFoundAt: { gte: oneWeekAgo },
        },
      }),
      // Previous week exposures found
      prisma.exposure.count({
        where: {
          userId,
          firstFoundAt: { gte: twoWeeksAgo, lt: oneWeekAgo },
        },
      }),
      // Current week removals completed
      prisma.removalRequest.count({
        where: {
          userId,
          status: "COMPLETED",
          completedAt: { gte: oneWeekAgo },
        },
      }),
      // Previous week removals completed
      prisma.removalRequest.count({
        where: {
          userId,
          status: "COMPLETED",
          completedAt: { gte: twoWeeksAgo, lt: oneWeekAgo },
        },
      }),
    ]);

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const trends = {
      exposures: {
        current: currentWeekExposures,
        previous: previousWeekExposures,
        changePercent: calculateChange(currentWeekExposures, previousWeekExposures),
      },
      removals: {
        current: currentWeekRemovals,
        previous: previousWeekRemovals,
        changePercent: calculateChange(currentWeekRemovals, previousWeekRemovals),
      },
    };

    // Per-Broker Stats - group exposures and removals by source
    const exposuresBySource = await prisma.exposure.groupBy({
      by: ["source"],
      where: { userId },
      _count: { id: true },
    });

    const removalsBySource = await prisma.removalRequest.findMany({
      where: { userId },
      select: {
        status: true,
        completedAt: true,
        submittedAt: true,
        exposure: { select: { source: true } },
      },
    });

    // Build broker stats with consolidation info
    const brokerStatsMap = new Map<string, {
      source: string;
      sourceName: string;
      exposureCount: number;
      completedCount: number;
      inProgressCount: number;
      pendingCount: number;
      status: string;
      lastCompletedAt?: Date;
      // Consolidation fields
      isParent: boolean;
      subsidiaryCount: number;
      subsidiaries: string[];
      consolidatesTo: string | null;
      parentName: string | null;
    }>();

    // Initialize with exposure counts and consolidation info
    for (const exp of exposuresBySource) {
      const subsidiaries = getSubsidiaries(exp.source);
      const consolidatesTo = getConsolidationParent(exp.source);
      const parentBrokerInfo = consolidatesTo ? getDataBrokerInfo(consolidatesTo) : null;

      brokerStatsMap.set(exp.source, {
        source: exp.source,
        sourceName: DataSourceNames[exp.source as keyof typeof DataSourceNames] || exp.source,
        exposureCount: exp._count.id,
        completedCount: 0,
        inProgressCount: 0,
        pendingCount: 0,
        status: "PENDING",
        // Consolidation info
        isParent: subsidiaries.length > 0,
        subsidiaryCount: subsidiaries.length,
        subsidiaries,
        consolidatesTo,
        parentName: parentBrokerInfo?.name || null,
      });
    }

    // Add removal counts
    for (const removal of removalsBySource) {
      const source = removal.exposure.source;
      const stats = brokerStatsMap.get(source);
      if (stats) {
        if (removal.status === "COMPLETED") {
          stats.completedCount++;
          if (!stats.lastCompletedAt || (removal.completedAt && removal.completedAt > stats.lastCompletedAt)) {
            stats.lastCompletedAt = removal.completedAt || undefined;
          }
        } else if (removal.status === "IN_PROGRESS" || removal.status === "SUBMITTED") {
          stats.inProgressCount++;
        } else if (removal.status === "PENDING") {
          stats.pendingCount++;
        }
      }
    }

    // Calculate status for each broker
    for (const stats of brokerStatsMap.values()) {
      if (stats.completedCount === stats.exposureCount && stats.exposureCount > 0) {
        stats.status = "COMPLETED";
      } else if (stats.completedCount > 0) {
        stats.status = "PARTIAL";
      } else if (stats.inProgressCount > 0) {
        stats.status = "IN_PROGRESS";
      } else {
        stats.status = "PENDING";
      }
    }

    // Convert to array and sort by exposure count
    const brokerStats = Array.from(brokerStatsMap.values())
      .sort((a, b) => b.exposureCount - a.exposureCount)
      .slice(0, 10); // Top 10 brokers

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

    const [dataBrokerRemovals, breachRemovals, socialRemovals, aiProtectionRemovals] = await Promise.all([
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
      prisma.removalRequest.findMany({
        where: {
          userId,
          exposure: { source: { in: ALL_AI_SOURCES } },
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
        totalRemovalRequests,
        riskScore,
        manualAction: {
          total: manualActionTotal,
          done: manualActionDone,
          pending: manualActionTotal - manualActionDone,
        },
        aiProtection: {
          total: aiTrainingExposures + facialRecognitionExposures + voiceCloningExposures,
          aiTraining: aiTrainingExposures,
          facialRecognition: facialRecognitionExposures,
          voiceCloning: voiceCloningExposures,
          optedOut: aiOptedOutExposures,
        },
        userPlan,
      },
      // NEW: Protection metrics
      protectionScore,
      timeSaved,
      trends,
      brokerStats,
      // Existing
      recentExposures,
      removalProgress: {
        dataBrokers: calculateProgress(dataBrokerRemovals),
        breaches: calculateProgress(breachRemovals),
        socialMedia: calculateProgress(socialRemovals),
        aiProtection: calculateProgress(aiProtectionRemovals),
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
