import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const source = searchParams.get("source");
    const manualAction = searchParams.get("manualAction"); // "required", "pending", "done", "all"
    const excludeManual = searchParams.get("excludeManual") === "true"; // Exclude manual review items
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    if (severity) {
      where.severity = severity;
    }

    if (source) {
      where.source = source;
    }

    // Exclude manual review items (for main exposures page)
    if (excludeManual) {
      where.requiresManualAction = false;
    }

    // Filter by manual action status (for manual review page)
    if (manualAction === "required" || manualAction === "all") {
      where.requiresManualAction = true;
    } else if (manualAction === "pending") {
      where.requiresManualAction = true;
      where.manualActionTaken = false;
    } else if (manualAction === "done") {
      where.requiresManualAction = true;
      where.manualActionTaken = true;
    }

    // Status priority: ACTIVE first (needs action), then in-progress, then completed/monitoring
    const statusPriority: Record<string, number> = {
      ACTIVE: 0,           // Needs action - top
      REMOVAL_PENDING: 1,  // In progress
      REMOVAL_IN_PROGRESS: 1, // In progress
      REMOVAL_FAILED: 2,   // Needs attention
      REMOVED: 3,          // Completed - bottom
      MONITORING: 3,       // Breach data - can't be removed, just monitored
      WHITELISTED: 4,      // User chose to keep - bottom
    };

    const [rawExposures, total] = await Promise.all([
      prisma.exposure.findMany({
        where,
        orderBy: [{ firstFoundAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          removalRequest: {
            select: {
              id: true,
              status: true,
              method: true,
            },
          },
        },
      }),
      prisma.exposure.count({ where }),
    ]);

    // Sort: action needed on top, removal in progress at bottom
    // Secondary sort by severity (HIGH first), then by date
    const severityPriority: Record<string, number> = {
      CRITICAL: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
    };

    const exposures = rawExposures.sort((a, b) => {
      // First by status priority (ACTIVE on top)
      const statusDiff = (statusPriority[a.status] ?? 5) - (statusPriority[b.status] ?? 5);
      if (statusDiff !== 0) return statusDiff;

      // Within same status, sort by severity (HIGH first)
      const sevDiff = (severityPriority[a.severity] ?? 5) - (severityPriority[b.severity] ?? 5);
      if (sevDiff !== 0) return sevDiff;

      // Finally by date (newest first)
      return new Date(b.firstFoundAt).getTime() - new Date(a.firstFoundAt).getTime();
    });

    // Get stats
    const stats = await prisma.exposure.groupBy({
      by: ["status"],
      where: { userId: session.user.id },
      _count: true,
    });

    const severityStats = await prisma.exposure.groupBy({
      by: ["severity"],
      where: { userId: session.user.id },
      _count: true,
    });

    // AI sources to exclude from manual review stats (handled in AI Protection page)
    const AI_SOURCES = [
      "SPAWNING_AI", "LAION_AI", "STABILITY_AI", "OPENAI", "MIDJOURNEY", "META_AI",
      "GOOGLE_AI", "LINKEDIN_AI", "ADOBE_AI", "AMAZON_AI",
      "CLEARVIEW_AI", "PIMEYES", "FACECHECK_ID", "SOCIAL_CATFISH", "TINEYE", "YANDEX_IMAGES",
      "ELEVENLABS", "RESEMBLE_AI", "MURF_AI",
    ];

    // Get manual action stats and removal stats (excluding AI sources for manual review)
    // Stats are BROKER-CENTRIC (sites to visit) not exposure-centric
    const [manualExposuresByBroker, totalRemovalRequests] = await Promise.all([
      // Get all manual exposures grouped by broker with pending/done counts
      prisma.exposure.groupBy({
        by: ["source"],
        where: {
          userId: session.user.id,
          requiresManualAction: true,
          source: { notIn: AI_SOURCES },
        },
        _count: { _all: true },
      }),
      prisma.removalRequest.count({
        where: { userId: session.user.id },
      }),
    ]);

    // Get pending counts per broker
    const pendingByBroker = await prisma.exposure.groupBy({
      by: ["source"],
      where: {
        userId: session.user.id,
        requiresManualAction: true,
        manualActionTaken: false,
        source: { notIn: AI_SOURCES },
      },
      _count: { _all: true },
    });

    const pendingBrokerSet = new Set(pendingByBroker.map(b => b.source));
    const totalBrokers = manualExposuresByBroker.length;
    const brokersPending = pendingBrokerSet.size;
    const brokersReviewed = totalBrokers - brokersPending;

    return NextResponse.json({
      exposures,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        byStatus: Object.fromEntries(
          stats.map((s) => [s.status, s._count])
        ),
        bySeverity: Object.fromEntries(
          severityStats.map((s) => [s.severity, s._count])
        ),
        manualAction: {
          // Broker-centric stats (what user actually needs to act on)
          brokers: totalBrokers,           // Total unique sites
          pending: brokersPending,          // Sites with pending reviews
          done: brokersReviewed,            // Sites fully reviewed
        },
        totalRemovalRequests,
      },
    });
  } catch (error) {
    console.error("Exposures fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exposures" },
      { status: 500 }
    );
  }
}

const updateSchema = z.object({
  exposureId: z.string(),
  action: z.enum(["whitelist", "unwhitelist", "markDone", "markUndone"]),
});

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { exposureId, action } = result.data;

    // Verify ownership
    const exposure = await prisma.exposure.findFirst({
      where: {
        id: exposureId,
        userId: session.user.id,
      },
    });

    if (!exposure) {
      return NextResponse.json(
        { error: "Exposure not found" },
        { status: 404 }
      );
    }

    if (action === "whitelist") {
      // Update exposure and create whitelist entry
      await Promise.all([
        prisma.exposure.update({
          where: { id: exposureId },
          data: {
            isWhitelisted: true,
            status: "WHITELISTED",
          },
        }),
        prisma.whitelist.create({
          data: {
            userId: session.user.id,
            source: exposure.source,
            sourceUrl: exposure.sourceUrl,
            sourceName: exposure.sourceName,
          },
        }),
      ]);
    } else if (action === "unwhitelist") {
      // Remove from whitelist
      await Promise.all([
        prisma.exposure.update({
          where: { id: exposureId },
          data: {
            isWhitelisted: false,
            status: "ACTIVE",
          },
        }),
        prisma.whitelist.deleteMany({
          where: {
            userId: session.user.id,
            source: exposure.source,
            sourceName: exposure.sourceName,
          },
        }),
      ]);
    } else if (action === "markDone") {
      // Mark manual action as taken
      await prisma.exposure.update({
        where: { id: exposureId },
        data: {
          manualActionTaken: true,
          manualActionTakenAt: new Date(),
        },
      });
    } else if (action === "markUndone") {
      // Unmark manual action
      await prisma.exposure.update({
        where: { id: exposureId },
        data: {
          manualActionTaken: false,
          manualActionTakenAt: null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Exposure update error:", error);
    return NextResponse.json(
      { error: "Failed to update exposure" },
      { status: 500 }
    );
  }
}
