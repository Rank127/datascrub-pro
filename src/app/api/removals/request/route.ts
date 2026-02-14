import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { executeRemoval } from "@/lib/removers/removal-service";
import { getDataBrokerInfo, getSubsidiaries, getConsolidationParent, isParentBroker } from "@/lib/removers/data-broker-directory";
import { z } from "zod";
import type { Plan, RemovalMethod } from "@/lib/types";
import { isAdmin } from "@/lib/admin";
import { getEffectivePlan } from "@/lib/family/family-service";

const requestSchema = z.object({
  exposureId: z.string(),
});

// Determine removal method based on data source
function getRemovalMethod(source: string): RemovalMethod {
  const broker = getDataBrokerInfo(source);

  if (broker) {
    if (broker.removalMethod === "EMAIL" || broker.removalMethod === "BOTH") {
      return "AUTO_EMAIL";
    }
    if (broker.removalMethod === "FORM") {
      return "AUTO_FORM";
    }
  }

  const socialMedia = [
    "LINKEDIN",
    "FACEBOOK",
    "TWITTER",
    "INSTAGRAM",
    "TIKTOK",
    "REDDIT",
    "PINTEREST",
    "YOUTUBE",
  ];

  if (socialMedia.includes(source)) {
    return "MANUAL_GUIDE";
  }

  if (source.includes("DARK_WEB") || source.includes("PASTE_SITE")) {
    return "MANUAL_GUIDE"; // Can't automate dark web removal
  }

  // Default to email for breach databases
  return "AUTO_EMAIL";
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { exposureId } = result.data;

    // Check user's plan (checks subscription + family membership)
    const userPlan = await getEffectivePlan(session.user.id) as Plan;

    // Check removal limits based on plan
    const removalLimits: Record<Plan, number> = {
      FREE: 3,
      PRO: -1, // unlimited
      ENTERPRISE: -1, // unlimited
    };

    const limit = removalLimits[userPlan];

    // Atomically check quota, validate exposure, check duplicates, and create request
    // Prevents quota bypass and duplicate removals via concurrent requests
    const txResult = await prisma.$transaction(async (tx) => {
      if (limit !== -1) {
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);

        const removalsThisMonth = await tx.removalRequest.count({
          where: {
            userId: session.user.id,
            createdAt: { gte: currentMonth },
          },
        });

        if (removalsThisMonth >= limit) {
          return { ok: false as const, code: "QUOTA" as const, removalsThisMonth, limit };
        }
      }

      const exposure = await tx.exposure.findFirst({
        where: {
          id: exposureId,
          userId: session.user.id,
        },
      });

      if (!exposure) {
        return { ok: false as const, code: "NOT_FOUND" as const };
      }

      if (exposure.isWhitelisted) {
        return { ok: false as const, code: "WHITELISTED" as const };
      }

      const existingRequest = await tx.removalRequest.findUnique({
        where: { exposureId },
      });

      if (existingRequest) {
        return { ok: false as const, code: "DUPLICATE" as const, existingRequest };
      }

      const method = getRemovalMethod(exposure.source);

      const subsidiaryKeys = getSubsidiaries(exposure.source);
      const isParent = subsidiaryKeys.length > 0;

      let consolidatedExposures: { id: string; source: string; sourceName: string }[] = [];
      if (isParent) {
        consolidatedExposures = await tx.exposure.findMany({
          where: {
            userId: session.user.id,
            source: { in: subsidiaryKeys },
            isWhitelisted: false,
            status: { notIn: ["REMOVED", "REMOVAL_PENDING", "REMOVAL_IN_PROGRESS"] },
          },
          select: { id: true, source: true, sourceName: true },
        });
      }

      const removalRequest = await tx.removalRequest.create({
        data: {
          userId: session.user.id,
          exposureId,
          method,
          status: "PENDING",
          notes: consolidatedExposures.length > 0
            ? `Consolidated removal - covers ${consolidatedExposures.length} subsidiary exposures`
            : undefined,
        },
      });

      await tx.exposure.update({
        where: { id: exposureId },
        data: {
          status: "REMOVAL_PENDING",
          manualActionTaken: true,
          manualActionTakenAt: new Date(),
        },
      });

      return { ok: true as const, exposure, removalRequest, consolidatedExposures, method };
    });

    if (!txResult.ok) {
      switch (txResult.code) {
        case "QUOTA":
          return NextResponse.json(
            {
              error: `You've reached your monthly removal limit (${txResult.limit} removals). Upgrade your plan for unlimited removals.`,
              requiresUpgrade: true,
              upgradeUrl: "/pricing",
              currentUsage: txResult.removalsThisMonth,
              limit: txResult.limit,
            },
            { status: 403 }
          );
        case "NOT_FOUND":
          return NextResponse.json(
            { error: "Exposure not found" },
            { status: 404 }
          );
        case "WHITELISTED":
          return NextResponse.json(
            { error: "Cannot remove whitelisted items" },
            { status: 400 }
          );
        case "DUPLICATE":
          return NextResponse.json(
            { error: "Removal already requested", request: txResult.existingRequest },
            { status: 400 }
          );
      }
    }

    const { exposure, removalRequest, consolidatedExposures } = txResult;

    // Handle consolidated subsidiary exposures (batch)
    const consolidatedRequests: string[] = [];
    if (consolidatedExposures.length > 0) {
      // Batch-check which subsidiaries already have removal requests
      const existingSubRequests = await prisma.removalRequest.findMany({
        where: { exposureId: { in: consolidatedExposures.map(e => e.id) } },
        select: { exposureId: true },
      });
      const existingSubSet = new Set(existingSubRequests.map(r => r.exposureId));

      const newSubExposures = consolidatedExposures.filter(e => !existingSubSet.has(e.id));

      if (newSubExposures.length > 0) {
        // Batch create removal requests for new subsidiaries
        await prisma.removalRequest.createMany({
          data: newSubExposures.map(subExposure => ({
            userId: session.user.id,
            exposureId: subExposure.id,
            method: "AUTO_EMAIL" as const,
            status: "PENDING",
            notes: `Auto-created via consolidated removal from ${exposure.sourceName}. Will be completed when parent removal is confirmed.`,
          })),
          skipDuplicates: true,
        });

        // Batch update subsidiary exposure statuses
        await prisma.exposure.updateMany({
          where: { id: { in: newSubExposures.map(e => e.id) } },
          data: {
            status: "REMOVAL_PENDING",
            manualActionTaken: true,
            manualActionTakenAt: new Date(),
          },
        });

        // Fetch created request IDs
        const createdRequests = await prisma.removalRequest.findMany({
          where: { exposureId: { in: newSubExposures.map(e => e.id) } },
          select: { id: true },
        });
        consolidatedRequests.push(...createdRequests.map(r => r.id));
      }
    }

    // Execute the removal (send emails, provide instructions)
    const executionResult = await executeRemoval(
      removalRequest.id,
      session.user.id
    );

    // Get updated request
    const updatedRequest = await prisma.removalRequest.findUnique({
      where: { id: removalRequest.id },
    });

    // Build response message
    let message = executionResult.message;
    if (consolidatedExposures.length > 0) {
      const subNames = consolidatedExposures.map(e => e.sourceName).slice(0, 5).join(", ");
      const moreCount = consolidatedExposures.length > 5 ? ` and ${consolidatedExposures.length - 5} more` : "";
      message += `\n\n✓ BONUS: This removal also covers ${consolidatedExposures.length} related sites: ${subNames}${moreCount}`;
    }

    return NextResponse.json({
      request: updatedRequest,
      message,
      method: executionResult.method,
      instructions: executionResult.instructions,
      success: executionResult.success,
      consolidated: {
        count: consolidatedExposures.length,
        exposures: consolidatedExposures.map(e => ({ source: e.source, name: e.sourceName })),
      },
    });
  } catch (error) {
    console.error("Removal request error:", error);
    return NextResponse.json(
      { error: "Failed to create removal request" },
      { status: 500 }
    );
  }
}
