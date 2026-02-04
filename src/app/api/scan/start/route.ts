import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption/crypto";
import { sendExposureAlertEmail } from "@/lib/email";
import { rateLimit, getClientIdentifier, rateLimitResponse } from "@/lib/rate-limit";
import {
  ScanOrchestrator,
  prepareProfileForScan,
} from "@/lib/scanners/scan-orchestrator";
import { CONFIDENCE_THRESHOLDS } from "@/lib/scanners/base-scanner";
import type { Plan, ScanType } from "@/lib/types";
import { z } from "zod";
import { isAdmin } from "@/lib/admin";
import { getEffectivePlan } from "@/lib/family/family-service";
import { generateScreenshotUrl } from "@/lib/screenshots/screenshot-service";
import { createScanErrorTicket } from "@/lib/support/ticket-service";
import { getBestAutomationMethod } from "@/lib/removers/browser-automation";

// Allow longer execution time for scans (Vercel Pro: up to 300s)
export const maxDuration = 120; // 2 minutes should be enough with parallel scanning

const scanRequestSchema = z.object({
  type: z.enum(["FULL", "QUICK", "MONITORING"]),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting (per user)
    const rateLimitResult = rateLimit(session.user.id, "scan");
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const body = await request.json();
    const result = scanRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid scan type" },
        { status: 400 }
      );
    }

    const { type } = result.data;

    // Get user's plan (checks subscription + family membership)
    const userPlan = await getEffectivePlan(session.user.id) as Plan;

    // FREE users can only run FULL scans (not QUICK scans)
    // This ensures they see their complete exposure before upgrading
    if (userPlan === "FREE" && type === "QUICK") {
      return NextResponse.json(
        {
          error: "Quick scans are only available for Pro and Enterprise plans. Please run a Full Scan to see your complete data exposure.",
          requiresUpgrade: true,
          upgradeUrl: "/pricing",
        },
        { status: 403 }
      );
    }

    // Check scan limits based on plan
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const scansThisMonth = await prisma.scan.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: currentMonth },
      },
    });

    const scanLimits: Record<Plan, number> = {
      FREE: 2,
      PRO: 50,
      ENTERPRISE: -1, // unlimited
    };

    const limit = scanLimits[userPlan];
    if (limit !== -1 && scansThisMonth >= limit) {
      return NextResponse.json(
        {
          error: `You've reached your monthly scan limit (${limit} scans). Upgrade your plan for more scans.`,
          requiresUpgrade: true,
          upgradeUrl: "/pricing",
          currentUsage: scansThisMonth,
          limit,
        },
        { status: 403 }
      );
    }

    // Check for existing IN_PROGRESS scan to prevent concurrent scans
    const existingInProgressScan = await prisma.scan.findFirst({
      where: {
        userId: session.user.id,
        status: "IN_PROGRESS",
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingInProgressScan) {
      // Check if it's been running for more than 5 minutes (likely stuck)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (existingInProgressScan.createdAt < fiveMinutesAgo) {
        // Mark the stuck scan as FAILED
        await prisma.scan.update({
          where: { id: existingInProgressScan.id },
          data: {
            status: "FAILED",
            completedAt: new Date(),
          },
        });
        console.log(`[Scan] Marked stuck scan ${existingInProgressScan.id} as FAILED`);
      } else {
        // Recent scan still in progress
        return NextResponse.json(
          {
            error: "A scan is already in progress. Please wait for it to complete.",
            existingScanId: existingInProgressScan.id,
          },
          { status: 409 }
        );
      }
    }

    // Get user's profile
    const profile = await prisma.personalProfile.findFirst({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Please complete your profile before scanning" },
        { status: 400 }
      );
    }

    // Create scan record
    const scan = await prisma.scan.create({
      data: {
        userId: session.user.id,
        type,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    // Prepare profile data for scanning
    const scanInput = await prepareProfileForScan(profile, decrypt);

    // Initialize orchestrator
    const orchestrator = new ScanOrchestrator({
      type: type as ScanType,
      userPlan,
    });

    // Run scan
    const scanResults = await orchestrator.runScan(scanInput);

    // Get existing exposures for this user to avoid duplicates
    const existingExposures = await prisma.exposure.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        source: true,
        sourceName: true,
        sourceUrl: true,
        dataPreview: true,
        status: true,
      },
    });

    // Create a map for quick lookup
    const existingMap = new Map(
      existingExposures.map((e) => [
        `${e.source}:${e.sourceName}:${e.dataPreview || ''}`,
        e,
      ])
    );

    // Filter and process results
    const newExposures: typeof scanResults = [];
    const updatedExposureIds: string[] = [];

    for (const result of scanResults) {
      const key = `${result.source}:${result.sourceName}:${result.dataPreview || ''}`;
      const existing = existingMap.get(key);

      if (existing) {
        // Skip if already in removal process or removed
        if (
          existing.status === "REMOVAL_PENDING" ||
          existing.status === "REMOVAL_IN_PROGRESS" ||
          existing.status === "REMOVED"
        ) {
          console.log(`[Scan] Skipping ${result.sourceName} - already in removal/removed`);
          continue;
        }

        // Update lastSeenAt for existing active exposures
        updatedExposureIds.push(existing.id);
      } else {
        // This is a new exposure
        newExposures.push(result);
      }
    }

    // Update lastSeenAt for existing exposures that were found again
    if (updatedExposureIds.length > 0) {
      await prisma.exposure.updateMany({
        where: { id: { in: updatedExposureIds } },
        data: { lastSeenAt: new Date() },
      });
    }

    // Create only NEW exposures (with proof screenshots for URLs)
    // For "manual check required" items, we auto-create proactive opt-out requests
    // For low-confidence matches, set requiresManualAction = true
    const exposures = await Promise.all(
      newExposures.map((result) => {
        // Generate proof screenshot URL if we have a source URL
        let proofScreenshot: string | null = null;
        if (result.sourceUrl && !result.sourceUrl.startsWith('mailto:')) {
          try {
            proofScreenshot = generateScreenshotUrl(result.sourceUrl, { delay: 2 });
          } catch (e) {
            console.error(`[Scan] Failed to generate screenshot URL for ${result.sourceName}:`, e);
          }
        }

        const isProactiveOptOut = result.rawData?.manualCheckRequired === true;

        // Determine if manual review is required based on confidence score
        const confidenceScore = result.confidence?.score ?? 100; // Default high if no confidence data
        const requiresManualReview = confidenceScore < CONFIDENCE_THRESHOLDS.AUTO_PROCEED;

        // Log confidence-based decisions
        if (requiresManualReview) {
          console.log(
            `[Scan] ${result.sourceName}: Confidence ${confidenceScore} < ${CONFIDENCE_THRESHOLDS.AUTO_PROCEED}, requires manual review`
          );
        }

        return prisma.exposure.create({
          data: {
            userId: session.user.id,
            scanId: scan.id,
            source: result.source,
            sourceUrl: result.sourceUrl || null,
            sourceName: result.sourceName,
            dataType: result.dataType,
            dataPreview: result.dataPreview || null,
            severity: result.severity,
            // Proactive opt-outs go straight to REMOVAL_PENDING (only if high confidence)
            status: isProactiveOptOut && !requiresManualReview ? "REMOVAL_PENDING" : "ACTIVE",
            isWhitelisted: false,
            // Require manual action for low-confidence matches
            requiresManualAction: requiresManualReview,
            // Proof screenshot (captured on-demand when URL is accessed)
            proofScreenshot,
            proofScreenshotAt: proofScreenshot ? new Date() : null,
            // Confidence scoring data
            confidenceScore: result.confidence?.score ?? null,
            confidenceFactors: result.confidence?.factors
              ? JSON.stringify(result.confidence.factors)
              : null,
            matchClassification: result.confidence?.classification ?? null,
            confidenceReasoning: result.confidence?.reasoning
              ? JSON.stringify(result.confidence.reasoning)
              : null,
            validatedAt: result.confidence?.validatedAt ?? null,
            userConfirmed: false,
            userConfirmedAt: null,
          },
        });
      })
    );

    // Create proactive opt-out removal requests for items that would have been "manual review"
    // ONLY for high-confidence matches (AUTO_PROCEED threshold or above)
    const proactiveOptOuts = newExposures.filter(r => {
      const isManualCheck = r.rawData?.manualCheckRequired === true;
      const confidenceScore = r.confidence?.score ?? 100;
      const isHighConfidence = confidenceScore >= CONFIDENCE_THRESHOLDS.AUTO_PROCEED;
      return isManualCheck && isHighConfidence;
    });

    if (proactiveOptOuts.length > 0) {
      const exposureMap = new Map(exposures.map(e => [`${e.source}:${e.sourceName}`, e]));

      await Promise.all(
        proactiveOptOuts.map((result) => {
          const exposure = exposureMap.get(`${result.source}:${result.sourceName}`);
          if (!exposure) return Promise.resolve();

          // Use smart method selection to maximize automation
          const bestMethod = getBestAutomationMethod(result.source);
          const method = bestMethod.method === "MANUAL" ? "MANUAL_GUIDE" :
                        bestMethod.method === "EMAIL" ? "AUTO_EMAIL" : "AUTO_FORM";

          console.log(`[Scan] Creating removal for ${result.source}: ${method} (${bestMethod.reason})`);

          return prisma.removalRequest.create({
            data: {
              userId: session.user.id,
              exposureId: exposure.id,
              status: "PENDING",
              method,
              isProactive: true, // Mark as proactive opt-out
              notes: `Proactive opt-out request. Method: ${bestMethod.reason}. Confidence: ${result.confidence?.score ?? 'N/A'}. ${result.rawData?.optOutInstructions || ''}`,
            },
          });
        })
      );

      console.log(`[Scan] Created ${proactiveOptOuts.length} proactive opt-out requests (high confidence only)`);
    }

    // Log low-confidence matches that were skipped for auto-removal
    const lowConfidenceCount = newExposures.filter(r => {
      const confidenceScore = r.confidence?.score ?? 100;
      return confidenceScore < CONFIDENCE_THRESHOLDS.AUTO_PROCEED;
    }).length;
    if (lowConfidenceCount > 0) {
      console.log(`[Scan] ${lowConfidenceCount} exposures require manual confirmation (confidence < ${CONFIDENCE_THRESHOLDS.AUTO_PROCEED})`);
    }

    console.log(`[Scan] New: ${exposures.length}, Updated: ${updatedExposureIds.length}, Skipped: ${scanResults.length - newExposures.length - updatedExposureIds.length}`);

    // Update scan record and user's lastScanAt
    const completedAt = new Date();
    await Promise.all([
      prisma.scan.update({
        where: { id: scan.id },
        data: {
          status: "COMPLETED",
          completedAt,
          exposuresFound: exposures.length,
          sourcesChecked: orchestrator.getSourcesCheckedCount(),
          progress: 100,
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { lastScanAt: completedAt },
      }),
    ]);

    // Send exposure alert email if exposures found (non-blocking)
    if (exposures.length > 0 && session.user.email) {
      const critical = scanResults.filter(r => r.severity === "CRITICAL").length;
      const high = scanResults.filter(r => r.severity === "HIGH").length;
      const sources = [...new Set(scanResults.map(r => r.sourceName))];

      sendExposureAlertEmail(
        session.user.email,
        session.user.name || "",
        { count: exposures.length, critical, high, sources }
      ).catch(console.error);

      // Create an alert record
      await prisma.alert.create({
        data: {
          userId: session.user.id,
          type: "SCAN_COMPLETED",
          title: "Scan Completed",
          message: `Found ${exposures.length} data exposure${exposures.length !== 1 ? 's' : ''} across ${sources.length} source${sources.length !== 1 ? 's' : ''}.`,
          metadata: JSON.stringify({ scanId: scan.id, exposuresFound: exposures.length }),
        },
      });
    }

    const sourcesChecked = orchestrator.getSourcesCheckedCount();

    // Count exposures by severity for upgrade recommendations
    const severityCounts = {
      critical: exposures.filter(e => e.severity === "CRITICAL").length,
      high: exposures.filter(e => e.severity === "HIGH").length,
      medium: exposures.filter(e => e.severity === "MEDIUM").length,
      low: exposures.filter(e => e.severity === "LOW").length,
    };

    return NextResponse.json({
      scanId: scan.id,
      exposuresFound: exposures.length,
      sourcesChecked,
      status: "COMPLETED",
      severityCounts,
      userPlan,
    });
  } catch (error) {
    console.error("Scan error:", error);

    // Try to mark any in-progress scan as failed for this user
    // We need to get the session again since we might have failed before scan creation
    try {
      const session = await auth();
      if (session?.user?.id) {
        // Find the most recent IN_PROGRESS scan and mark it as FAILED
        const failedScan = await prisma.scan.findFirst({
          where: {
            userId: session.user.id,
            status: "IN_PROGRESS",
          },
          orderBy: { createdAt: "desc" },
        });

        if (failedScan) {
          await prisma.scan.update({
            where: { id: failedScan.id },
            data: {
              status: "FAILED",
              completedAt: new Date(),
            },
          });
          console.log(`[Scan] Marked scan ${failedScan.id} as FAILED due to error`);

          // Create support ticket for the scan error
          const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
          createScanErrorTicket(
            session.user.id,
            failedScan.id,
            errorMessage
          ).catch((ticketError) => {
            console.error("[Scan] Failed to create support ticket:", ticketError);
          });
        }
      }
    } catch (cleanupError) {
      console.error("Failed to cleanup scan status:", cleanupError);
    }

    return NextResponse.json(
      { error: "Scan failed. Please try again." },
      { status: 500 }
    );
  }
}
