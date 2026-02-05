import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDataBrokerInfo } from "@/lib/removers/data-broker-directory";

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

    // Enrich removals with opt-out URLs from data broker directory
    const enrichedRemovals = removals.map((removal) => {
      const brokerInfo = getDataBrokerInfo(removal.exposure.source);
      return {
        ...removal,
        optOutUrl: brokerInfo?.optOutUrl || removal.exposure.sourceUrl || null,
        optOutEmail: brokerInfo?.privacyEmail || null,
        estimatedDays: brokerInfo?.estimatedDays || null,
      };
    });

    // Sort by priority: items needing attention first, then by date
    const statusPriority: Record<string, number> = {
      REQUIRES_MANUAL: 1,  // Needs user to fill form - highest priority
      FAILED: 2,           // Failed, needs attention
      PENDING: 3,          // Queued, waiting to be processed
      IN_PROGRESS: 4,      // Being processed
      SUBMITTED: 5,        // Email sent, waiting for response
      ACKNOWLEDGED: 6,     // Breach alert
      COMPLETED: 7,        // Done - lowest priority
      CANCELLED: 8,
    };

    enrichedRemovals.sort((a, b) => {
      const priorityA = statusPriority[a.status] ?? 99;
      const priorityB = statusPriority[b.status] ?? 99;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      // Same priority: sort by date (newest first)
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

    return NextResponse.json({
      removals: enrichedRemovals,
      stats: Object.fromEntries(stats.map((s) => [s.status, s._count])),
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
