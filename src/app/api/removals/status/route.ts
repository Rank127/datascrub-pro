import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDataBrokerInfo } from "@/lib/removers/data-broker-directory";
import {
  getUserStatusCategory,
  getUserStatusConfig,
  getEstimatedCompletionDate,
  getETAString,
  getSimplifiedStats,
} from "@/lib/removals/user-status";

// Data Processor sources to exclude from active removal lists
const DATA_PROCESSOR_SOURCES = [
  "SYNDIGO", "POWERREVIEWS", "POWER_REVIEWS", "1WORLDSYNC",
  "BAZAARVOICE", "YOTPO", "YOTPO_DATA",
];

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch removals, excluding cancelled data processor requests
    const removals = await prisma.removalRequest.findMany({
      where: {
        userId: session.user.id,
        // Exclude cancelled requests (typically data processors that were reclassified)
        NOT: {
          AND: [
            { status: "CANCELLED" },
            { exposure: { source: { in: DATA_PROCESSOR_SOURCES } } },
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        exposureId: true,
        status: true,
        method: true,
        submittedAt: true,
        completedAt: true,
        attempts: true,
        lastError: true,
        notes: true,
        verifyAfter: true,
        lastVerifiedAt: true,
        verificationCount: true,
        createdAt: true,
        updatedAt: true,
        // Screenshot proof fields
        beforeScreenshot: true,
        beforeScreenshotAt: true,
        afterScreenshot: true,
        afterScreenshotAt: true,
        formScreenshot: true,
        formScreenshotAt: true,
        exposure: {
          select: {
            id: true,
            source: true,
            sourceName: true,
            sourceUrl: true,
            dataType: true,
            dataPreview: true,
            severity: true,
            proofScreenshot: true,
            proofScreenshotAt: true,
          },
        },
      },
    });

    // Enrich removals with opt-out URLs, user status, and ETAs
    const enrichedRemovals = removals.map((removal) => {
      const brokerInfo = getDataBrokerInfo(removal.exposure.source);
      const userStatusCategory = getUserStatusCategory(removal.status);
      const userStatusConfig = getUserStatusConfig(removal.status);
      const estimatedDays = brokerInfo?.estimatedDays || null;
      const estimatedCompletionDate = getEstimatedCompletionDate(
        removal.submittedAt,
        estimatedDays
      );
      const eta = getETAString(removal.submittedAt, estimatedDays);

      return {
        ...removal,
        optOutUrl: brokerInfo?.optOutUrl || removal.exposure.sourceUrl || null,
        optOutEmail: brokerInfo?.privacyEmail || null,
        estimatedDays,
        // User-facing status fields
        userStatus: userStatusCategory,
        userStatusLabel: userStatusConfig.label,
        userStatusColor: userStatusConfig.bgColor + " " + userStatusConfig.color,
        estimatedCompletionDate: estimatedCompletionDate?.toISOString() || null,
        eta,
      };
    });

    // Sort by user-facing category: in_progress first, then completed, then monitoring
    const categoryPriority: Record<string, number> = {
      in_progress: 1,
      completed: 2,
      monitoring: 3,
    };

    enrichedRemovals.sort((a, b) => {
      const priorityA = categoryPriority[a.userStatus] ?? 99;
      const priorityB = categoryPriority[b.userStatus] ?? 99;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      // Same category: sort by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Get stats (excluding cancelled data processor requests)
    const [stats, manualActionTotal, manualActionDone] = await Promise.all([
      prisma.removalRequest.groupBy({
        by: ["status"],
        where: {
          userId: session.user.id,
          // Exclude cancelled requests from stats
          status: { notIn: ["CANCELLED"] },
        },
        _count: true,
      }),
      prisma.exposure.count({
        where: {
          userId: session.user.id,
          requiresManualAction: true,
          // Only count ACTIVE exposures - ones already in removal don't need action
          status: "ACTIVE",
          source: { notIn: DATA_PROCESSOR_SOURCES },
          isWhitelisted: false,
        },
      }),
      prisma.exposure.count({
        where: {
          userId: session.user.id,
          requiresManualAction: true,
          manualActionTaken: true,
          status: "ACTIVE",
          source: { notIn: DATA_PROCESSOR_SOURCES },
        },
      }),
    ]);

    const rawStats = Object.fromEntries(stats.map((s) => [s.status, s._count]));
    const simplifiedStats = getSimplifiedStats(rawStats);

    return NextResponse.json({
      removals: enrichedRemovals,
      stats: rawStats,
      simplifiedStats,
      manualAction: {
        total: manualActionTotal,
        done: manualActionDone,
        pending: manualActionTotal - manualActionDone,
      },
    });
  } catch (error) {
    console.error("Removals fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch removal requests" },
      { status: 500 }
    );
  }
}
