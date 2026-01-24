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

    const [exposures, total] = await Promise.all([
      prisma.exposure.findMany({
        where,
        orderBy: [{ severity: "desc" }, { firstFoundAt: "desc" }],
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

    // Get manual action stats and removal stats
    const [manualActionStats, manualActionDone, totalRemovalRequests] = await Promise.all([
      prisma.exposure.aggregate({
        where: { userId: session.user.id, requiresManualAction: true },
        _count: true,
      }),
      prisma.exposure.aggregate({
        where: { userId: session.user.id, requiresManualAction: true, manualActionTaken: true },
        _count: true,
      }),
      prisma.removalRequest.count({
        where: { userId: session.user.id },
      }),
    ]);

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
          total: manualActionStats._count,
          done: manualActionDone._count,
          pending: manualActionStats._count - manualActionDone._count,
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
