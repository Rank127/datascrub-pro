import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectivePlan } from "@/lib/admin";

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
