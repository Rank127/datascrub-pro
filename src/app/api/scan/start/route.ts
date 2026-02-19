import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption/crypto";
import { queueExposureAlert } from "@/lib/email";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import {
  ScanOrchestrator,
  prepareProfileForScan,
} from "@/lib/scanners/scan-orchestrator";
import { CONFIDENCE_THRESHOLDS } from "@/lib/scanners/base-scanner";
import type { Plan, ScanType } from "@/lib/types";
import { z } from "zod";
import { isAdmin as _isAdmin } from "@/lib/admin";
import { getEffectivePlan } from "@/lib/family/family-service";
import { generateScreenshotUrl } from "@/lib/screenshots/screenshot-service";
import { createScanErrorTicket } from "@/lib/support/ticket-service";

// Allow longer execution time for scans (Vercel Pro: up to 300s)
export const maxDuration = 300; // Full scans with 8-9 broker batches need headroom

const scanRequestSchema = z.object({
  type: z.enum(["FULL", "QUICK", "MONITORING"]),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting (per user) - uses Upstash Redis in production
    const rateLimitResult = await rateLimit(session.user.id, "scan");
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

    const scanLimits: Record<Plan, number> = {
      FREE: 2,
      PRO: 50,
      ENTERPRISE: -1, // unlimited
    };

    const limit = scanLimits[userPlan];

    // Atomically check quotas, concurrent scans, profile, and create scan
    // Prevents double-submission and quota bypass via concurrent requests
    const txResult = await prisma.$transaction(async (tx) => {
      const scansThisMonth = await tx.scan.count({
        where: {
          userId: session.user.id,
          createdAt: { gte: currentMonth },
        },
      });

      if (limit !== -1 && scansThisMonth >= limit) {
        return { ok: false as const, code: "QUOTA" as const, scansThisMonth, limit };
      }

      const existingInProgressScan = await tx.scan.findFirst({
        where: {
          userId: session.user.id,
          status: "IN_PROGRESS",
        },
        orderBy: { createdAt: "desc" },
      });

      if (existingInProgressScan) {
        const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
        if (existingInProgressScan.createdAt < threeMinutesAgo) {
          await tx.scan.update({
            where: { id: existingInProgressScan.id },
            data: { status: "FAILED", completedAt: new Date() },
          });
          console.log(`[Scan] Marked stuck scan ${existingInProgressScan.id} as FAILED`);
        } else {
          return { ok: false as const, code: "IN_PROGRESS" as const, scanId: existingInProgressScan.id };
        }
      }

      const foundProfile = await tx.personalProfile.findFirst({
        where: { userId: session.user.id },
      });

      if (!foundProfile) {
        return { ok: false as const, code: "NO_PROFILE" as const };
      }

      const newScan = await tx.scan.create({
        data: {
          userId: session.user.id,
          type,
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
      });

      return { ok: true as const, scan: newScan, profile: foundProfile };
    });

    if (!txResult.ok) {
      switch (txResult.code) {
        case "QUOTA":
          return NextResponse.json(
            {
              error: `You've reached your monthly scan limit (${txResult.limit} scans). Upgrade your plan for more scans.`,
              requiresUpgrade: true,
              upgradeUrl: "/pricing",
              currentUsage: txResult.scansThisMonth,
              limit: txResult.limit,
            },
            { status: 403 }
          );
        case "IN_PROGRESS":
          return NextResponse.json(
            {
              error: "A scan is already in progress. Please wait for it to complete.",
              existingScanId: txResult.scanId,
            },
            { status: 409 }
          );
        case "NO_PROFILE":
          return NextResponse.json(
            { error: "Please complete your profile before scanning" },
            { status: 400 }
          );
      }
    }

    const { scan, profile } = txResult;

    // Prepare profile data for scanning
    const scanInput = await prepareProfileForScan(profile, decrypt);

    // Initialize orchestrator
    const orchestrator = new ScanOrchestrator({
      type: type as ScanType,
      userPlan,
    });

    // Run scan
    console.log(`[Scan] Starting ${type} scan for user ${session.user.id}...`);
    const scanResults = await orchestrator.runScan(scanInput);

    // Log scan results summary
    const resultsByConfidence = {
      confirmed: scanResults.filter(r => (r.confidence?.score ?? 100) >= 80).length,
      likely: scanResults.filter(r => {
        const score = r.confidence?.score ?? 100;
        return score >= 60 && score < 80;
      }).length,
      possible: scanResults.filter(r => {
        const score = r.confidence?.score ?? 100;
        return score >= 40 && score < 60;
      }).length,
      rejected: scanResults.filter(r => (r.confidence?.score ?? 100) < 40).length,
    };
    console.log(
      `[Scan] Raw results: ${scanResults.length} total ` +
      `(${resultsByConfidence.confirmed} confirmed, ${resultsByConfidence.likely} likely, ` +
      `${resultsByConfidence.possible} possible, ${resultsByConfidence.rejected} rejected)`
    );

    // Get existing exposures for this user to avoid duplicates (only non-removed)
    const existingExposures = await prisma.exposure.findMany({
      where: {
        userId: session.user.id,
        status: { not: "REMOVED" },
      },
      select: {
        id: true,
        source: true,
        sourceName: true,
        sourceUrl: true,
        dataPreview: true,
        status: true,
      },
      take: 1000,
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
    // All exposures start as ACTIVE - users manually initiate removals
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
            // All exposures start as ACTIVE - users manually initiate removals
            status: "ACTIVE",
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

    // Queue exposure alert for daily consolidated digest (non-blocking, respects preferences)
    if (exposures.length > 0 && session.user.email) {
      const critical = exposures.filter(e => e.severity === "CRITICAL").length;
      const high = exposures.filter(e => e.severity === "HIGH").length;
      const sources = [...new Set(exposures.map(e => e.sourceName))];

      queueExposureAlert(
        session.user.id,
        { count: exposures.length, critical, high, sources }
      ).catch((e) => { import("@/lib/error-reporting").then(m => m.captureError("scan-exposure-queue", e instanceof Error ? e : new Error(String(e)))); });

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

      // SMS notifications temporarily disabled - coming in future release
      // Requires 10DLC registration for US carrier compliance
      // Will be re-enabled once carrier registration is complete
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
