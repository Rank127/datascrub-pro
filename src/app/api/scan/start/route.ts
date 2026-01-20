import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption/crypto";
import {
  ScanOrchestrator,
  prepareProfileForScan,
} from "@/lib/scanners/scan-orchestrator";
import type { Plan, ScanType } from "@/lib/types";
import { z } from "zod";

const scanRequestSchema = z.object({
  type: z.enum(["FULL", "QUICK", "MONITORING"]),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      select: { plan: true },
    });

    const userPlan = (user?.plan || "FREE") as Plan;

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
      FREE: 1,
      PRO: 10,
      ENTERPRISE: -1, // unlimited
    };

    const limit = scanLimits[userPlan];
    if (limit !== -1 && scansThisMonth >= limit) {
      return NextResponse.json(
        { error: "Monthly scan limit reached. Please upgrade your plan." },
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
