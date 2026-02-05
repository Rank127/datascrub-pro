import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// Data Processor sources to exclude from exposures list by default
// These are not Data Brokers and have been whitelisted
const DATA_PROCESSOR_SOURCES = [
  "SYNDIGO", "POWERREVIEWS", "POWER_REVIEWS", "1WORLDSYNC",
  "BAZAARVOICE", "YOTPO", "YOTPO_DATA",
];

// Valid enum values for query params (SQL injection prevention)
const VALID_STATUSES = [
  "ACTIVE", "REMOVAL_PENDING", "REMOVAL_IN_PROGRESS",
  "REMOVAL_FAILED", "REMOVED", "MONITORING", "WHITELISTED"
];
const VALID_SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const VALID_MANUAL_ACTIONS = ["required", "pending", "done", "all"];

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
      // Exclude data processors by default (they're not actionable)
      source: { notIn: DATA_PROCESSOR_SOURCES },
      isWhitelisted: false,
    };

    // Allow viewing whitelisted if explicitly requested
    if (status === "WHITELISTED") {
      delete where.isWhitelisted;
      delete where.source;
    }

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

    // SECURITY: Validate query params against allowed values (SQL injection prevention)
    const safeStatus = status && VALID_STATUSES.includes(status) ? status : null;
    const safeSeverity = severity && VALID_SEVERITIES.includes(severity) ? severity : null;
    const safeManualAction = manualAction && VALID_MANUAL_ACTIONS.includes(manualAction) ? manualAction : null;
    // Source is validated by checking it exists in database later
    const safeSource = source ? source.replace(/[^a-zA-Z0-9_-]/g, '') : null;
    const safeSearch = search ? search.trim().substring(0, 100) : null; // Limit length

    // Build parameterized WHERE clause using Prisma.sql
    const conditions: Prisma.Sql[] = [Prisma.sql`"userId" = ${session.user.id}`];

    // Exclude data processors unless viewing whitelisted
    if (safeStatus !== "WHITELISTED") {
      conditions.push(Prisma.sql`"source" NOT IN (${Prisma.join(DATA_PROCESSOR_SOURCES)})`);
      conditions.push(Prisma.sql`"isWhitelisted" = false`);
    }

    if (safeStatus) conditions.push(Prisma.sql`"status" = ${safeStatus}`);
    if (safeSeverity) conditions.push(Prisma.sql`"severity" = ${safeSeverity}`);
    if (safeSource) conditions.push(Prisma.sql`"source" = ${safeSource}`);
    // Search by source name (case-insensitive) - parameterized
    if (safeSearch) {
      conditions.push(Prisma.sql`"sourceName" ILIKE ${'%' + safeSearch + '%'}`);
    }
    if (excludeManual) conditions.push(Prisma.sql`"requiresManualAction" = false`);
    if (safeManualAction === "required" || safeManualAction === "all") {
      conditions.push(Prisma.sql`"requiresManualAction" = true`);
    } else if (safeManualAction === "pending") {
      conditions.push(Prisma.sql`"requiresManualAction" = true`);
      conditions.push(Prisma.sql`"manualActionTaken" = false`);
    } else if (safeManualAction === "done") {
      conditions.push(Prisma.sql`"requiresManualAction" = true`);
      conditions.push(Prisma.sql`"manualActionTaken" = true`);
    }

    // Use Prisma.sql for safe parameterized query
    // This prevents SQL injection by using prepared statements
    const whereClause = Prisma.join(conditions, ' AND ');
    const offsetValue = (page - 1) * limit;

    // Use raw SQL to sort by status priority, severity, then date - BEFORE pagination
    // This ensures sorting works across all pages, not just per-page
    const exposureIds = await prisma.$queryRaw<{ id: string }[]>`
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
      LIMIT ${limit} OFFSET ${offsetValue}
    `;

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

    // Get stats (excluding data processors)
    const stats = await prisma.exposure.groupBy({
      by: ["status"],
      where: {
        userId: session.user.id,
        source: { notIn: DATA_PROCESSOR_SOURCES },
        isWhitelisted: false,
      },
      _count: true,
    });

    const severityStats = await prisma.exposure.groupBy({
      by: ["severity"],
      where: {
        userId: session.user.id,
        source: { notIn: DATA_PROCESSOR_SOURCES },
        isWhitelisted: false,
      },
      _count: true,
    });

    // Get severity stats for ACTIVE items only (action needed)
    // This shows users what still needs attention, not total historical count
    const activeSeverityStats = await prisma.exposure.groupBy({
      by: ["severity"],
      where: {
        userId: session.user.id,
        status: "ACTIVE",
        source: { notIn: DATA_PROCESSOR_SOURCES },
        isWhitelisted: false,
      },
      _count: true,
    });

    // AI sources to exclude from manual review stats (handled in AI Protection page)
    const AI_SOURCES = [
      "SPAWNING_AI", "LAION_AI", "STABILITY_AI", "OPENAI", "MIDJOURNEY", "META_AI",
      "GOOGLE_AI", "LINKEDIN_AI", "ADOBE_AI", "AMAZON_AI",
      "CLEARVIEW_AI", "PIMEYES", "FACECHECK_ID", "SOCIAL_CATFISH", "TINEYE", "YANDEX_IMAGES",
      "ELEVENLABS", "RESEMBLE_AI", "MURF_AI",
    ];

    // Get manual action stats and removal stats (excluding AI sources and data processors)
    // Stats are BROKER-CENTRIC (sites to visit) not exposure-centric
    const excludedFromManual = [...AI_SOURCES, ...DATA_PROCESSOR_SOURCES];
    const [manualExposuresByBroker, totalRemovalRequests] = await Promise.all([
      // Get all manual exposures grouped by broker with pending/done counts
      prisma.exposure.groupBy({
        by: ["source"],
        where: {
          userId: session.user.id,
          requiresManualAction: true,
          source: { notIn: excludedFromManual },
          isWhitelisted: false,
        },
        _count: { _all: true },
      }),
      prisma.removalRequest.count({
        where: {
          userId: session.user.id,
          status: { notIn: ["CANCELLED"] }, // Exclude cancelled requests
        },
      }),
    ]);

    // Get pending counts per broker (excluding AI sources and data processors)
    const pendingByBroker = await prisma.exposure.groupBy({
      by: ["source"],
      where: {
        userId: session.user.id,
        requiresManualAction: true,
        manualActionTaken: false,
        source: { notIn: excludedFromManual },
        isWhitelisted: false,
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
