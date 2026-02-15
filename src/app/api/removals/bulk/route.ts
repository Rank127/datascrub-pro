import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDataBrokerInfo, getSubsidiaries, isParentBroker, getOptOutInstructions } from "@/lib/removers/data-broker-directory";
import { getEmailQuotaStatus, sendBulkRemovalSummaryEmail, sendBulkCCPARemovalRequest, canSendEmail } from "@/lib/email";
import { z } from "zod";
import type { Plan, RemovalMethod } from "@/lib/types";
import { getEffectivePlan } from "@/lib/family/family-service";
import { calculateVerifyAfterDate } from "@/lib/removers/verification-service";

// Max emails per bulk operation to avoid quota exhaustion
const MAX_BULK_EMAILS = 80; // Leave buffer for other system emails

// Format data type for display in emails
function formatDataType(dataType: string): string {
  const typeMap: Record<string, string> = {
    EMAIL: "Email Address",
    PHONE: "Phone Number",
    NAME: "Full Name",
    ADDRESS: "Physical Address",
    DOB: "Date of Birth",
    SSN: "Social Security Number",
    PHOTO: "Photo/Image",
    USERNAME: "Username",
    FINANCIAL: "Financial Information",
    COMBINED_PROFILE: "Combined Personal Profile",
  };

  return typeMap[dataType] || dataType;
}

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

    // Check user's plan (checks subscription + family membership)
    const userPlan = await getEffectivePlan(userId) as Plan;

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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
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

    // Get full exposure data for grouping
    const fullExposures = await prisma.exposure.findMany({
      where: {
        id: { in: exposuresToProcess.map(e => e.id) },
      },
      select: {
        id: true,
        source: true,
        sourceName: true,
        dataType: true,
        sourceUrl: true,
      },
    });

    // Group exposures by broker privacy email for consolidated emails
    const brokerGroups = new Map<string, {
      brokerName: string;
      privacyEmail: string;
      exposures: typeof fullExposures;
    }>();

    const manualExposures: typeof fullExposures = [];

    for (const exposure of fullExposures) {
      const brokerInfo = getDataBrokerInfo(exposure.source);

      if (brokerInfo?.privacyEmail) {
        const key = brokerInfo.privacyEmail.toLowerCase();
        let group = brokerGroups.get(key);
        if (!group) {
          group = {
            brokerName: brokerInfo.name,
            privacyEmail: brokerInfo.privacyEmail,
            exposures: [],
          };
          brokerGroups.set(key, group);
        }
        group.exposures.push(exposure);
      } else {
        // No known privacy email - requires manual removal
        manualExposures.push(exposure);
      }
    }

    console.log(`[Bulk Removal] Grouped into ${brokerGroups.size} broker emails + ${manualExposures.length} manual`);

    // Process results
    const results: {
      exposureId: string;
      source: string;
      sourceName: string;
      success: boolean;
      message: string;
      consolidatedCount: number;
    }[] = [];

    let totalProcessed = 0;
    const totalConsolidated = 0;
    let successCount = 0;
    let failCount = 0;
    let emailsSent = 0;
    const processedSources: string[] = [];

    // Get user's profile for removal request details
    const profile = await prisma.personalProfile.findFirst({
      where: { userId },
      select: { fullName: true },
    });
    const fullUserName = profile?.fullName || userName;

    // Pre-load all existing removal requests for these exposures (avoid N+1)
    const allExposureIds = fullExposures.map(e => e.id);
    const existingRemovalRequests = await prisma.removalRequest.findMany({
      where: { exposureId: { in: allExposureIds } },
      select: { exposureId: true },
    });
    const existingRemovalSet = new Set(existingRemovalRequests.map(r => r.exposureId));

    // Process each broker group with ONE consolidated email
    for (const [_privacyEmail, group] of brokerGroups) {
      // Check email quota before sending
      if (!canSendEmail()) {
        console.log("[Bulk Removal] Email quota exhausted, stopping");
        for (const exposure of group.exposures) {
          results.push({
            exposureId: exposure.id,
            source: exposure.source,
            sourceName: exposure.sourceName,
            success: false,
            message: "Daily email quota reached - queued for later",
            consolidatedCount: 0,
          });
        }
        failCount += group.exposures.length;
        continue;
      }

      try {
        // Atomically create removal requests and update exposures
        const newExposures = group.exposures.filter(e => !existingRemovalSet.has(e.id));
        await prisma.$transaction(async (tx) => {
          if (newExposures.length > 0) {
            await tx.removalRequest.createMany({
              data: newExposures.map(exposure => ({
                userId,
                exposureId: exposure.id,
                method: getRemovalMethod(exposure.source),
                status: "PENDING",
                notes: `Bulk removal - consolidated with ${group.exposures.length - 1} other exposures to ${group.brokerName}`,
              })),
              skipDuplicates: true,
            });
          }

          await tx.exposure.updateMany({
            where: { id: { in: group.exposures.map(e => e.id) } },
            data: {
              status: "REMOVAL_PENDING",
              manualActionTaken: true,
              manualActionTakenAt: new Date(),
            },
          });
        });

        // Send ONE consolidated CCPA email for all exposures to this broker
        const emailResult = await sendBulkCCPARemovalRequest({
          toEmail: group.privacyEmail,
          brokerName: group.brokerName,
          fromName: fullUserName,
          fromEmail: userEmail!,
          exposures: group.exposures.map(e => ({
            dataType: formatDataType(e.dataType),
            sourceUrl: e.sourceUrl,
          })),
        });

        if (emailResult.success) {
          // Mark all exposures in this group as submitted
          const verifyAfter = calculateVerifyAfterDate(group.exposures[0].source);

          await prisma.$transaction([
            prisma.removalRequest.updateMany({
              where: {
                exposureId: { in: group.exposures.map(e => e.id) },
              },
              data: {
                status: "SUBMITTED",
                submittedAt: new Date(),
                verifyAfter,
              },
            }),
            prisma.exposure.updateMany({
              where: {
                id: { in: group.exposures.map(e => e.id) },
              },
              data: {
                status: "REMOVAL_IN_PROGRESS",
              },
            }),
          ]);

          emailsSent++;
          successCount += group.exposures.length;
          totalProcessed += group.exposures.length;
          processedSources.push(group.brokerName);

          for (const exposure of group.exposures) {
            results.push({
              exposureId: exposure.id,
              source: exposure.source,
              sourceName: exposure.sourceName,
              success: true,
              message: `Consolidated CCPA request sent to ${group.brokerName} (${group.exposures.length} records)`,
              consolidatedCount: group.exposures.length - 1,
            });
          }

          console.log(`[Bulk Removal] Sent consolidated email to ${group.brokerName} for ${group.exposures.length} exposures`);
        } else {
          for (const exposure of group.exposures) {
            results.push({
              exposureId: exposure.id,
              source: exposure.source,
              sourceName: exposure.sourceName,
              success: false,
              message: `Failed to send email to ${group.brokerName}`,
              consolidatedCount: 0,
            });
          }
          failCount += group.exposures.length;
        }

        // Small delay between broker emails
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        console.error(`Bulk removal error for ${group.brokerName}:`, error);
        for (const exposure of group.exposures) {
          results.push({
            exposureId: exposure.id,
            source: exposure.source,
            sourceName: exposure.sourceName,
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
            consolidatedCount: 0,
          });
        }
        failCount += group.exposures.length;
      }
    }

    // Handle manual exposures (no known privacy email) and collect their info for the summary email
    const manualRemovalDetails: Array<{
      sourceName: string;
      source: string;
      optOutUrl?: string;
      instructions?: string;
    }> = [];

    // Create removal requests for manual exposures that don't have one yet
    const newManualExposures = manualExposures.filter(e => !existingRemovalSet.has(e.id));
    if (newManualExposures.length > 0) {
      await prisma.removalRequest.createMany({
        data: newManualExposures.map(exposure => {
          const instructions = getOptOutInstructions(exposure.source);
          return {
            userId,
            exposureId: exposure.id,
            method: "MANUAL_GUIDE",
            status: "REQUIRES_MANUAL",
            notes: instructions || "No known privacy email - manual removal required",
          };
        }),
        skipDuplicates: true,
      });
    }

    // Batch update all manual exposures
    if (manualExposures.length > 0) {
      await prisma.exposure.updateMany({
        where: { id: { in: manualExposures.map(e => e.id) } },
        data: {
          status: "REMOVAL_PENDING",
          manualActionTaken: true,
          manualActionTakenAt: new Date(),
        },
      });
    }

    // Collect manual removal info for results and summary email
    for (const exposure of manualExposures) {
      const brokerInfo = getDataBrokerInfo(exposure.source);
      const instructions = getOptOutInstructions(exposure.source);

      manualRemovalDetails.push({
        sourceName: exposure.sourceName,
        source: exposure.source,
        optOutUrl: brokerInfo?.optOutUrl,
        instructions: instructions,
      });

      results.push({
        exposureId: exposure.id,
        source: exposure.source,
        sourceName: exposure.sourceName,
        success: true,
        message: "Requires manual removal - no known privacy email",
        consolidatedCount: 0,
      });
      totalProcessed++;
    }

    // Send a single summary email to user with ALL info (auto + manual)
    if ((successCount > 0 || manualExposures.length > 0) && userEmail) {
      try {
        await sendBulkRemovalSummaryEmail(userEmail, userName, {
          totalProcessed: successCount + manualExposures.length,
          successCount,
          failCount,
          sources: [...new Set(processedSources)], // Unique broker names for auto-submitted
          consolidatedCount: totalConsolidated,
          manualRemovals: manualRemovalDetails, // All manual removal details
          emailsSent,
        });
      } catch (emailError) {
        console.error("Failed to send bulk removal summary email:", emailError);
      }
    }

    // Get updated quota status
    const finalQuotaStatus = getEmailQuotaStatus();

    return NextResponse.json({
      success: true,
      message: `Sent ${emailsSent} consolidated emails covering ${successCount} exposures`,
      summary: {
        totalProcessed,
        totalConsolidated: successCount, // How many exposures were covered by consolidated emails
        totalExposuresCovered: successCount + manualExposures.length,
        successCount,
        failCount,
        emailsSent, // Number of actual emails sent (much lower than exposures!)
        manualRequired: manualExposures.length,
        brokerEmailsSaved: successCount - emailsSent, // How many emails we saved by consolidating
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
export async function GET(_request: Request) {
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
