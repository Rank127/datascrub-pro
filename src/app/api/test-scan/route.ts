/**
 * TEST ENDPOINT - Remove after testing!
 *
 * Runs a scan without authentication for testing purposes.
 * Protected by a secret key.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ScanOrchestrator, prepareProfileForScan } from "@/lib/scanners/scan-orchestrator";
import { decrypt } from "@/lib/encryption/crypto";

// Simple secret to prevent random access
const TEST_SECRET = "ghostmydata-test-2026";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const userId = searchParams.get("userId");

  // Verify secret
  if (secret !== TEST_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  try {
    // Get a user with a profile to scan
    let user;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profiles: true },
      });
    } else {
      // Get first user with a profile
      user = await prisma.user.findFirst({
        where: { profiles: { some: {} } },
        include: { profiles: true },
      });
    }

    if (!user || user.profiles.length === 0) {
      return NextResponse.json({
        error: "No user with profile found",
        hint: "Add ?userId=xxx to specify a user"
      }, { status: 404 });
    }

    const profile = user.profiles[0];

    // Prepare scan input
    const scanInput = await prepareProfileForScan(profile, decrypt);

    console.log("[TestScan] Starting scan for user:", user.email);
    console.log("[TestScan] Profile data:", {
      fullName: scanInput.fullName,
      emails: scanInput.emails?.length || 0,
      phones: scanInput.phones?.length || 0,
      addresses: scanInput.addresses?.length || 0,
    });

    // Create scan record
    const scan = await prisma.scan.create({
      data: {
        userId: user.id,
        type: "FULL",
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    // Initialize orchestrator
    const orchestrator = new ScanOrchestrator({
      type: "FULL",
      userPlan: user.plan,
    });

    console.log("[TestScan] Scanners:", orchestrator.getScannerNames());

    // Run scan
    const startTime = Date.now();
    const results = await orchestrator.runScan(scanInput);
    const duration = Date.now() - startTime;

    console.log(`[TestScan] Scan completed in ${duration}ms with ${results.length} results`);

    // Group results by source
    const resultsBySource: Record<string, number> = {};
    for (const result of results) {
      resultsBySource[result.source] = (resultsBySource[result.source] || 0) + 1;
    }

    // Update scan record
    await prisma.scan.update({
      where: { id: scan.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        exposuresFound: results.length,
        sourcesChecked: orchestrator.getScannerCount(),
      },
    });

    // Save exposures to database
    let savedCount = 0;
    for (const result of results) {
      try {
        await prisma.exposure.upsert({
          where: {
            userId_source_sourceName_dataType: {
              userId: user.id,
              source: result.source,
              sourceName: result.sourceName,
              dataType: result.dataType,
            },
          },
          update: {
            lastSeenAt: new Date(),
            sourceUrl: result.sourceUrl,
            dataPreview: result.dataPreview,
            severity: result.severity,
            scanId: scan.id,
          },
          create: {
            userId: user.id,
            scanId: scan.id,
            source: result.source,
            sourceName: result.sourceName,
            sourceUrl: result.sourceUrl,
            dataType: result.dataType,
            dataPreview: result.dataPreview,
            severity: result.severity,
            status: "ACTIVE",
          },
        });
        savedCount++;
      } catch (e) {
        console.error("[TestScan] Error saving exposure:", e);
      }
    }

    return NextResponse.json({
      success: true,
      scanId: scan.id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      profile: {
        fullName: scanInput.fullName,
        emailCount: scanInput.emails?.length || 0,
        phoneCount: scanInput.phones?.length || 0,
        addressCount: scanInput.addresses?.length || 0,
      },
      scanners: orchestrator.getScannerNames(),
      scannerCount: orchestrator.getScannerCount(),
      results: {
        total: results.length,
        saved: savedCount,
        bySource: resultsBySource,
      },
      duration: `${duration}ms`,
      sampleResults: results.slice(0, 10).map(r => ({
        source: r.source,
        sourceName: r.sourceName,
        dataType: r.dataType,
        dataPreview: r.dataPreview?.substring(0, 50),
        severity: r.severity,
      })),
    });
  } catch (error) {
    console.error("[TestScan] Error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Scan failed",
    }, { status: 500 });
  }
}
