import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkPermission } from "@/lib/admin";
import { getDataBrokerInfo } from "@/lib/removers/data-broker-directory";

// POST /api/admin/reprocess-manual-removals
// Re-processes REQUIRES_MANUAL removals to convert them to automated where possible
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's role
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });

    // Only admins can reprocess removals
    if (!checkPermission(currentUser?.email, currentUser?.role, "modify_user_role")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get optional parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId"); // Optional: filter by user
    const dryRun = searchParams.get("dryRun") === "true"; // Preview without changes
    const limit = parseInt(searchParams.get("limit") || "1000");

    // Find all REQUIRES_MANUAL removal requests
    const whereClause: {
      status: string;
      exposure?: { userId: string };
    } = {
      status: "REQUIRES_MANUAL",
    };

    if (userId) {
      whereClause.exposure = { userId };
    }

    const manualRemovals = await prisma.removalRequest.findMany({
      where: whereClause,
      take: limit,
      select: {
        id: true,
        method: true,
        status: true,
        exposure: {
          select: {
            id: true,
            source: true,
            sourceName: true,
            userId: true,
          },
        },
      },
    });

    // Check each removal to see if it can now be automated
    const canAutomate: { id: string; source: string; sourceName: string; privacyEmail: string }[] = [];
    const cannotAutomate: { id: string; source: string; sourceName: string; reason: string }[] = [];

    for (const removal of manualRemovals) {
      const brokerInfo = getDataBrokerInfo(removal.exposure.source);

      if (!brokerInfo) {
        cannotAutomate.push({
          id: removal.id,
          source: removal.exposure.source,
          sourceName: removal.exposure.sourceName || removal.exposure.source,
          reason: "Unknown source - not in broker directory",
        });
        continue;
      }

      const supportsEmail = brokerInfo.removalMethod === "EMAIL" || brokerInfo.removalMethod === "BOTH";

      if (supportsEmail && brokerInfo.privacyEmail) {
        canAutomate.push({
          id: removal.id,
          source: removal.exposure.source,
          sourceName: removal.exposure.sourceName || removal.exposure.source,
          privacyEmail: brokerInfo.privacyEmail,
        });
      } else {
        cannotAutomate.push({
          id: removal.id,
          source: removal.exposure.source,
          sourceName: removal.exposure.sourceName || removal.exposure.source,
          reason: !supportsEmail
            ? `Removal method is ${brokerInfo.removalMethod}, not EMAIL or BOTH`
            : "No privacy email configured",
        });
      }
    }

    // If not a dry run, update the removals that can be automated
    let updated = 0;
    if (!dryRun && canAutomate.length > 0) {
      const idsToUpdate = canAutomate.map(r => r.id);

      const result = await prisma.removalRequest.updateMany({
        where: {
          id: { in: idsToUpdate },
        },
        data: {
          status: "PENDING",
          method: "AUTO_EMAIL",
          lastError: null,
          attempts: 0, // Reset attempts for fresh start
        },
      });

      updated = result.count;

      // Also update exposure status
      const exposureIds = manualRemovals
        .filter(r => idsToUpdate.includes(r.id))
        .map(r => r.exposure.id);

      await prisma.exposure.updateMany({
        where: {
          id: { in: exposureIds },
        },
        data: {
          requiresManualAction: false,
        },
      });

      console.log(`[Admin] Reprocessed ${updated} manual removals to automated by ${currentUser?.email}`);
    }

    // Get source breakdown
    const sourceBreakdown: Record<string, { canAutomate: number; cannotAutomate: number }> = {};

    for (const r of canAutomate) {
      if (!sourceBreakdown[r.source]) {
        sourceBreakdown[r.source] = { canAutomate: 0, cannotAutomate: 0 };
      }
      sourceBreakdown[r.source].canAutomate++;
    }

    for (const r of cannotAutomate) {
      if (!sourceBreakdown[r.source]) {
        sourceBreakdown[r.source] = { canAutomate: 0, cannotAutomate: 0 };
      }
      sourceBreakdown[r.source].cannotAutomate++;
    }

    return NextResponse.json({
      success: true,
      dryRun,
      summary: {
        totalManual: manualRemovals.length,
        canAutomate: canAutomate.length,
        cannotAutomate: cannotAutomate.length,
        updated: dryRun ? 0 : updated,
      },
      sourceBreakdown: Object.entries(sourceBreakdown)
        .map(([source, counts]) => ({ source, ...counts }))
        .sort((a, b) => b.canAutomate - a.canAutomate),
      details: {
        willAutomate: dryRun ? canAutomate.slice(0, 50) : [], // Only show preview in dry run
        cannotAutomate: cannotAutomate.slice(0, 50), // Show first 50 that can't be automated
      },
    });
  } catch (error) {
    console.error("Reprocess manual removals error:", error);
    return NextResponse.json(
      { error: "Failed to reprocess manual removals" },
      { status: 500 }
    );
  }
}

// GET /api/admin/reprocess-manual-removals
// Preview what would be automated (same as POST with dryRun=true)
export async function GET(request: Request) {
  // Add dryRun=true to the URL and forward to POST handler
  const url = new URL(request.url);
  url.searchParams.set("dryRun", "true");

  const newRequest = new Request(url.toString(), {
    method: "POST",
    headers: request.headers,
  });

  return POST(newRequest);
}
