import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

/**
 * User Confirmation Endpoint for Low-Confidence Exposures
 *
 * When a scan finds a potential match with low confidence (<80),
 * the user must confirm whether it's actually their data before
 * we proceed with auto-removal.
 *
 * - If confirmed: Set userConfirmed=true, allow auto-removal to proceed
 * - If rejected: Mark as WHITELISTED, cancel any pending removal requests
 */

const confirmRequestSchema = z.object({
  exposureId: z.string(),
  confirmed: z.boolean(),
  reason: z.string().optional(), // Optional reason for rejection
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = confirmRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: result.error.issues },
        { status: 400 }
      );
    }

    const { exposureId, confirmed, reason } = result.data;

    // Get the exposure and verify ownership
    const exposure = await prisma.exposure.findUnique({
      where: { id: exposureId },
      include: {
        removalRequest: true,
      },
    });

    if (!exposure) {
      return NextResponse.json(
        { error: "Exposure not found" },
        { status: 404 }
      );
    }

    if (exposure.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - you don't own this exposure" },
        { status: 403 }
      );
    }

    const now = new Date();

    if (confirmed) {
      // User confirmed this IS their data
      // Allow auto-removal to proceed

      await prisma.$transaction(async (tx) => {
        // Update exposure with confirmation
        await tx.exposure.update({
          where: { id: exposureId },
          data: {
            userConfirmed: true,
            userConfirmedAt: now,
            requiresManualAction: false, // No longer requires manual action
          },
        });

        // If there's a pending removal request, update its notes
        if (exposure.removalRequest) {
          await tx.removalRequest.update({
            where: { id: exposure.removalRequest.id },
            data: {
              notes:
                (exposure.removalRequest.notes || "") +
                ` User confirmed at ${now.toISOString()}.`,
            },
          });
        }

        // Create an alert
        await tx.alert.create({
          data: {
            userId: session.user.id,
            type: "EXPOSURE_CONFIRMED",
            title: "Exposure Confirmed",
            message: `You confirmed the data found on ${exposure.sourceName} is yours. Auto-removal can now proceed.`,
          },
        });
      });

      console.log(
        `[Exposure Confirm] User ${session.user.id} CONFIRMED exposure ${exposureId} (${exposure.sourceName})`
      );

      return NextResponse.json({
        success: true,
        message: "Exposure confirmed. Auto-removal can now proceed.",
        exposure: {
          id: exposureId,
          userConfirmed: true,
          userConfirmedAt: now,
        },
      });
    } else {
      // User rejected this - it's NOT their data (false positive)
      // Mark as whitelisted and cancel any pending removals

      await prisma.$transaction(async (tx) => {
        // Update exposure - mark as whitelisted
        await tx.exposure.update({
          where: { id: exposureId },
          data: {
            userConfirmed: false,
            userConfirmedAt: now,
            isWhitelisted: true,
            status: "WHITELISTED",
            requiresManualAction: false,
          },
        });

        // Cancel any pending removal request
        if (exposure.removalRequest) {
          await tx.removalRequest.update({
            where: { id: exposure.removalRequest.id },
            data: {
              status: "CANCELLED",
              notes:
                (exposure.removalRequest.notes || "") +
                ` User rejected as false positive at ${now.toISOString()}.` +
                (reason ? ` Reason: ${reason}` : ""),
            },
          });
        }

        // Add to whitelist
        await tx.whitelist.create({
          data: {
            userId: session.user.id,
            source: exposure.source,
            sourceUrl: exposure.sourceUrl,
            sourceName: exposure.sourceName,
            reason: reason || "User rejected as false positive (not their data)",
          },
        });

        // Create an alert
        await tx.alert.create({
          data: {
            userId: session.user.id,
            type: "EXPOSURE_REJECTED",
            title: "False Positive Reported",
            message: `You indicated the data found on ${exposure.sourceName} is not yours. It has been whitelisted.`,
          },
        });
      });

      console.log(
        `[Exposure Confirm] User ${session.user.id} REJECTED exposure ${exposureId} (${exposure.sourceName}) as false positive`
      );

      return NextResponse.json({
        success: true,
        message: "Exposure marked as false positive and whitelisted.",
        exposure: {
          id: exposureId,
          userConfirmed: false,
          isWhitelisted: true,
        },
      });
    }
  } catch (error) {
    console.error("Exposure confirm error:", error);
    return NextResponse.json(
      { error: "Failed to process confirmation" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check confirmation status of an exposure
 */
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const exposureId = searchParams.get("exposureId");

    if (!exposureId) {
      return NextResponse.json(
        { error: "exposureId query parameter required" },
        { status: 400 }
      );
    }

    const exposure = await prisma.exposure.findUnique({
      where: { id: exposureId },
      select: {
        id: true,
        userId: true,
        sourceName: true,
        confidenceScore: true,
        matchClassification: true,
        confidenceReasoning: true,
        userConfirmed: true,
        userConfirmedAt: true,
        requiresManualAction: true,
        isWhitelisted: true,
      },
    });

    if (!exposure) {
      return NextResponse.json(
        { error: "Exposure not found" },
        { status: 404 }
      );
    }

    if (exposure.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Parse reasoning if it exists
    let reasoning: string[] = [];
    if (exposure.confidenceReasoning) {
      try {
        reasoning = JSON.parse(exposure.confidenceReasoning);
      } catch {
        reasoning = [];
      }
    }

    return NextResponse.json({
      id: exposure.id,
      sourceName: exposure.sourceName,
      confidenceScore: exposure.confidenceScore,
      matchClassification: exposure.matchClassification,
      confidenceReasoning: reasoning,
      userConfirmed: exposure.userConfirmed,
      userConfirmedAt: exposure.userConfirmedAt,
      requiresManualAction: exposure.requiresManualAction,
      isWhitelisted: exposure.isWhitelisted,
      needsConfirmation:
        !exposure.userConfirmed &&
        !exposure.isWhitelisted &&
        exposure.requiresManualAction,
    });
  } catch (error) {
    console.error("Exposure confirm GET error:", error);
    return NextResponse.json(
      { error: "Failed to get confirmation status" },
      { status: 500 }
    );
  }
}
