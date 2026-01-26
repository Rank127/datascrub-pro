import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { executeRemoval } from "@/lib/removers/removal-service";
import { getDataBrokerInfo, getSubsidiaries, isParentBroker } from "@/lib/removers/data-broker-directory";
import { getEmailQuotaStatus, sendBulkRemovalSummaryEmail, canSendEmail } from "@/lib/email";
import { z } from "zod";
import type { Plan, RemovalMethod } from "@/lib/types";
import { getEffectivePlan } from "@/lib/admin";

// Max emails per bulk operation to avoid quota exhaustion
const MAX_BULK_EMAILS = 80; // Leave buffer for other system emails

const bulkRequestSchema = z.object({
  exposureIds: z.array(z.string()).optional(),
  mode: z.enum(["all_parents", "selected", "all_pending"]).default("all_parents"),
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

  return "AUTO_EMAIL";
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = bulkRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { exposureIds, mode } = result.data;
    const userId = session.user.id;

    // Check user's plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, email: true },
    });

    const userPlan = getEffectivePlan(user?.email, user?.plan || "FREE") as Plan;

    // Only PRO and ENTERPRISE can use bulk removal
    if (userPlan === "FREE") {
      return NextResponse.json(
        {
          error: "Bulk removal requires a PRO or ENTERPRISE plan",
          requiresUpgrade: true,
          upgradeUrl: "/pricing",
        },
        { status: 403 }
      );
    }

    // Check email quota before processing
    const quotaStatus = getEmailQuotaStatus();
    if (quotaStatus.remaining < 5) {
      return NextResponse.json(
        {
          error: "Daily email quota nearly exhausted. Try again tomorrow.",
          quotaStatus,
        },
        { status: 429 }
      );
    }

    // Get user info for summary email
    const userName = session.user.name || user?.email?.split("@")[0] || "User";
    const userEmail = user?.email || session.user.email;

    // Get exposures to process based on mode
    let exposuresToProcess: { id: string; source: string; sourceName: string }[] = [];

    if (mode === "selected" && exposureIds && exposureIds.length > 0) {
      // Process only selected exposures
      exposuresToProcess = await prisma.exposure.findMany({
        where: {
          id: { in: exposureIds },
          userId,
          isWhitelisted: false,
          status: { notIn: ["REMOVED", "REMOVAL_PENDING", "REMOVAL_IN_PROGRESS"] },
        },
        select: { id: true, source: true, sourceName: true },
      });
    } else if (mode === "all_parents") {
      // Get all exposures that are parent brokers (have subsidiaries)
      const allExposures = await prisma.exposure.findMany({
        where: {
          userId,
          isWhitelisted: false,
          status: { notIn: ["REMOVED", "REMOVAL_PENDING", "REMOVAL_IN_PROGRESS"] },
        },
        select: { id: true, source: true, sourceName: true },
      });

      // Filter to only parent brokers
      exposuresToProcess = allExposures.filter(exp => isParentBroker(exp.source));

      // Also include standalone brokers (not parents and not subsidiaries)
      const standaloneExposures = allExposures.filter(exp => {
        const subsidiaries = getSubsidiaries(exp.source);
        const brokerInfo = getDataBrokerInfo(exp.source);
        return subsidiaries.length === 0 && !brokerInfo?.consolidatesTo;
      });

      exposuresToProcess = [...exposuresToProcess, ...standaloneExposures];
    } else if (mode === "all_pending") {
      // Get all pending exposures
      exposuresToProcess = await prisma.exposure.findMany({
        where: {
          userId,
          isWhitelisted: false,
          status: { notIn: ["REMOVED", "REMOVAL_PENDING", "REMOVAL_IN_PROGRESS"] },
        },
        select: { id: true, source: true, sourceName: true },
      });
    }

    if (exposuresToProcess.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending exposures to process",
        processed: 0,
        results: [],
      });
    }

    // Process each exposure
    const results: {
      exposureId: string;
      source: string;
      sourceName: string;
      success: boolean;
      message: string;
      consolidatedCount: number;
    }[] = [];

    let totalProcessed = 0;
    let totalConsolidated = 0;
    let successCount = 0;
    let failCount = 0;
    let emailsSent = 0;
    const processedSources: string[] = [];

    // Limit processing based on email quota
    const maxToProcess = Math.min(exposuresToProcess.length, MAX_BULK_EMAILS, quotaStatus.remaining);
    const exposuresToActuallyProcess = exposuresToProcess.slice(0, maxToProcess);

    for (const exposure of exposuresToActuallyProcess) {
      // Check if removal already exists
      const existingRequest = await prisma.removalRequest.findUnique({
        where: { exposureId: exposure.id },
      });

      if (existingRequest) {
        results.push({
          exposureId: exposure.id,
          source: exposure.source,
          sourceName: exposure.sourceName,
          success: true,
          message: "Already submitted",
          consolidatedCount: 0,
        });
        continue;
      }

      try {
        // Get subsidiaries for this broker
        const subsidiaryKeys = getSubsidiaries(exposure.source);

        // Find subsidiary exposures
        let consolidatedExposures: { id: string; source: string; sourceName: string }[] = [];
        if (subsidiaryKeys.length > 0) {
          consolidatedExposures = await prisma.exposure.findMany({
            where: {
              userId,
              source: { in: subsidiaryKeys },
              isWhitelisted: false,
              status: { notIn: ["REMOVED", "REMOVAL_PENDING", "REMOVAL_IN_PROGRESS"] },
            },
            select: { id: true, source: true, sourceName: true },
          });
        }

        // Create removal request
        const method = getRemovalMethod(exposure.source);
        const removalRequest = await prisma.removalRequest.create({
          data: {
            userId,
            exposureId: exposure.id,
            method,
            status: "PENDING",
            notes: consolidatedExposures.length > 0
              ? `Bulk removal - covers ${consolidatedExposures.length} subsidiary exposures`
              : "Bulk removal request",
          },
        });

        // Update exposure status and mark manual action as done
        await prisma.exposure.update({
          where: { id: exposure.id },
          data: {
            status: "REMOVAL_PENDING",
            manualActionTaken: true,
            manualActionTakenAt: new Date(),
          },
        });

        // Handle subsidiary exposures
        for (const subExposure of consolidatedExposures) {
          const existingSub = await prisma.removalRequest.findUnique({
            where: { exposureId: subExposure.id },
          });

          if (!existingSub) {
            await prisma.removalRequest.create({
              data: {
                userId,
                exposureId: subExposure.id,
                method: "AUTO_EMAIL",
                status: "PENDING",
                notes: `Auto-created via bulk removal from ${exposure.sourceName}`,
              },
            });

            await prisma.exposure.update({
              where: { id: subExposure.id },
              data: {
                status: "REMOVAL_PENDING",
                manualActionTaken: true,
                manualActionTakenAt: new Date(),
              },
            });
          }
        }

        // Check if we can still send emails
        if (!canSendEmail()) {
          results.push({
            exposureId: exposure.id,
            source: exposure.source,
            sourceName: exposure.sourceName,
            success: false,
            message: "Daily email quota reached - will retry tomorrow",
            consolidatedCount: 0,
          });
          break; // Stop processing more
        }

        // Execute the removal (skip user notification - we'll send summary at end)
        const executionResult = await executeRemoval(removalRequest.id, userId, {
          skipUserNotification: true,
        });

        results.push({
          exposureId: exposure.id,
          source: exposure.source,
          sourceName: exposure.sourceName,
          success: executionResult.success,
          message: executionResult.message,
          consolidatedCount: consolidatedExposures.length,
        });

        totalProcessed++;
        totalConsolidated += consolidatedExposures.length;
        if (executionResult.success) {
          successCount++;
          emailsSent++;
          processedSources.push(exposure.sourceName);
        } else {
          failCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Bulk removal error for ${exposure.source}:`, error);
        results.push({
          exposureId: exposure.id,
          source: exposure.source,
          sourceName: exposure.sourceName,
          success: false,
          message: error instanceof Error ? error.message : "Unknown error",
          consolidatedCount: 0,
        });
        failCount++;
      }
    }

    // Send a single summary email to user instead of per-removal notifications
    if (successCount > 0 && userEmail) {
      try {
        await sendBulkRemovalSummaryEmail(userEmail, userName, {
          totalProcessed: successCount,
          successCount,
          failCount,
          sources: processedSources,
          consolidatedCount: totalConsolidated,
        });
      } catch (emailError) {
        console.error("Failed to send bulk removal summary email:", emailError);
        // Don't fail the whole request if summary email fails
      }
    }

    // Get updated quota status
    const finalQuotaStatus = getEmailQuotaStatus();

    return NextResponse.json({
      success: true,
      message: `Processed ${totalProcessed} parent brokers, consolidated ${totalConsolidated} subsidiaries`,
      summary: {
        totalProcessed,
        totalConsolidated,
        totalExposuresCovered: totalProcessed + totalConsolidated,
        successCount,
        failCount,
        emailsSent,
        skippedDueToQuota: exposuresToProcess.length - exposuresToActuallyProcess.length,
      },
      emailQuota: finalQuotaStatus,
      results,
    });

  } catch (error) {
    console.error("Bulk removal error:", error);
    return NextResponse.json(
      { error: "Failed to process bulk removal" },
      { status: 500 }
    );
  }
}

// GET endpoint to get bulk removal stats/preview
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all pending exposures
    const pendingExposures = await prisma.exposure.findMany({
      where: {
        userId,
        isWhitelisted: false,
        status: { notIn: ["REMOVED", "REMOVAL_PENDING", "REMOVAL_IN_PROGRESS"] },
      },
      select: { id: true, source: true, sourceName: true },
    });

    // Categorize exposures
    const parentBrokers: typeof pendingExposures = [];
    const standaloneBrokers: typeof pendingExposures = [];
    const subsidiaryBrokers: typeof pendingExposures = [];

    for (const exp of pendingExposures) {
      const subsidiaries = getSubsidiaries(exp.source);
      const brokerInfo = getDataBrokerInfo(exp.source);

      if (subsidiaries.length > 0) {
        parentBrokers.push(exp);
      } else if (brokerInfo?.consolidatesTo) {
        subsidiaryBrokers.push(exp);
      } else {
        standaloneBrokers.push(exp);
      }
    }

    // Calculate how many actions needed
    const actionsNeeded = parentBrokers.length + standaloneBrokers.length;
    const totalExposures = pendingExposures.length;
    const actionsSaved = totalExposures - actionsNeeded;

    // Get email quota status
    const quotaStatus = getEmailQuotaStatus();

    return NextResponse.json({
      totalPendingExposures: totalExposures,
      parentBrokers: parentBrokers.length,
      standaloneBrokers: standaloneBrokers.length,
      subsidiaryBrokers: subsidiaryBrokers.length,
      actionsNeeded,
      actionsSaved,
      savingsPercent: totalExposures > 0 ? Math.round((actionsSaved / totalExposures) * 100) : 0,
      emailQuota: quotaStatus,
      canProcessToday: Math.min(actionsNeeded, quotaStatus.remaining, MAX_BULK_EMAILS),
      preview: {
        parents: parentBrokers.map(e => ({
          source: e.source,
          name: e.sourceName,
          subsidiaryCount: getSubsidiaries(e.source).length,
        })),
        standalone: standaloneBrokers.slice(0, 10).map(e => ({
          source: e.source,
          name: e.sourceName,
        })),
      },
    });

  } catch (error) {
    console.error("Bulk removal stats error:", error);
    return NextResponse.json(
      { error: "Failed to get bulk removal stats" },
      { status: 500 }
    );
  }
}
