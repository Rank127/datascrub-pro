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
    const search = searchParams.get("search"); // Search by company/source name
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

    // Search by company/source name (case-insensitive)
    if (search && search.trim()) {
      where.sourceName = {
        contains: search.trim(),
        mode: "insensitive",
      };
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

    // Build WHERE clause conditions for raw query
    const conditions: string[] = [`"userId" = '${session.user.id}'`];
    if (status) conditions.push(`"status" = '${status}'`);
    if (severity) conditions.push(`"severity" = '${severity}'`);
    if (source) conditions.push(`"source" = '${source}'`);
    // Search by source name (case-insensitive)
    if (search && search.trim()) {
      const escapedSearch = search.trim().replace(/'/g, "''");
      conditions.push(`"sourceName" ILIKE '%${escapedSearch}%'`);
    }
    if (excludeManual) conditions.push(`"requiresManualAction" = false`);
    if (manualAction === "required" || manualAction === "all") {
      conditions.push(`"requiresManualAction" = true`);
    } else if (manualAction === "pending") {
      conditions.push(`"requiresManualAction" = true`);
      conditions.push(`"manualActionTaken" = false`);
    } else if (manualAction === "done") {
      conditions.push(`"requiresManualAction" = true`);
      conditions.push(`"manualActionTaken" = true`);
    }
    const whereClause = conditions.join(" AND ");

    // Use raw SQL to sort by status priority, severity, then date - BEFORE pagination
    // This ensures sorting works across all pages, not just per-page
    const exposureIds = await prisma.$queryRawUnsafe<{ id: string }[]>(`
      SELECT id FROM "Exposure"
      WHERE ${whereClause}
      ORDER BY
        CASE status
          WHEN 'ACTIVE' THEN 0
          WHEN 'REMOVAL_PENDING' THEN 1
          WHEN 'REMOVAL_IN_PROGRESS' THEN 1
          WHEN 'REMOVAL_FAILED' THEN 2
          WHEN 'REMOVED' THEN 3
          WHEN 'MONITORING' THEN 3
          WHEN 'WHITELISTED' THEN 4
          ELSE 5
        END ASC,
        CASE severity
          WHEN 'CRITICAL' THEN 0
          WHEN 'HIGH' THEN 1
          WHEN 'MEDIUM' THEN 2
          WHEN 'LOW' THEN 3
          ELSE 4
        END ASC,
        "firstFoundAt" DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `);

    const total = await prisma.exposure.count({ where });

    // Fetch full exposure data with relations, maintaining order
    const orderedIds = exposureIds.map(e => e.id);
    const exposuresUnordered = await prisma.exposure.findMany({
      where: { id: { in: orderedIds } },
      include: {
        removalRequest: {
          select: {
            id: true,
            status: true,
            method: true,
          },
        },
      },
    });

    // Restore the sorted order from the raw query
    const exposures = orderedIds.map(id => exposuresUnordered.find(e => e.id === id)!).filter(Boolean);

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

    // Get severity stats for ACTIVE items only (action needed)
    // This shows users what still needs attention, not total historical count
    const activeSeverityStats = await prisma.exposure.groupBy({
      by: ["severity"],
      where: { userId: session.user.id, status: "ACTIVE" },
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
        // Severity counts for ACTIVE items only (what still needs action)
        activeBySeverity: Object.fromEntries(
          activeSeverityStats.map((s) => [s.severity, s._count])
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
