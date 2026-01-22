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
import type { Plan, ScanType } from "@/lib/types";
import { z } from "zod";
import { isAdmin, getEffectivePlan } from "@/lib/admin";

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

    // Get user's plan
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, email: true },
    });

    // Admin users get ENTERPRISE access
    const userPlan = getEffectivePlan(user?.email, user?.plan || "FREE") as Plan;

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

    // Save exposures
    const exposures = await Promise.all(
      scanResults.map((result) =>
        prisma.exposure.create({
          data: {
            userId: session.user.id,
            scanId: scan.id,
            source: result.source,
            sourceUrl: result.sourceUrl || null,
            sourceName: result.sourceName,
            dataType: result.dataType,
            dataPreview: result.dataPreview || null,
            severity: result.severity,
            status: "ACTIVE",
            isWhitelisted: false,
          },
        })
      )
    );

    // Update scan record
    await prisma.scan.update({
      where: { id: scan.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        exposuresFound: exposures.length,
        sourcesChecked: orchestrator.getScannerCount(),
        progress: 100,
      },
    });

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

    return NextResponse.json({
      scanId: scan.id,
      exposuresFound: exposures.length,
      sourcesChecked: orchestrator.getScannerCount(),
      status: "COMPLETED",
    });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "Scan failed. Please try again." },
      { status: 500 }
    );
  }
}
