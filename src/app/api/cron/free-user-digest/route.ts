import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendFreeUserExposureDigest } from "@/lib/email";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";
import { logCronExecution } from "@/lib/cron-logger";

// Average time per manual removal (in minutes)
const MINUTES_PER_REMOVAL = 45;

// GET /api/cron/free-user-digest - Send weekly exposure digest to free users
export async function GET(request: Request) {
  // Verify this is a legitimate cron request
  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return cronUnauthorizedResponse(authResult.reason);
  }

  const startTime = Date.now();
  try {
    // Find FREE users with exposures who:
    // 1. Have email notifications enabled
    // 2. Have at least 1 active exposure
    // 3. Haven't received this email in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const freeUsersWithExposures = await prisma.user.findMany({
      where: {
        plan: "FREE",
        emailNotifications: true,
        // Has at least one active exposure
        exposures: {
          some: {
            status: "ACTIVE",
          },
        },
        // Hasn't received digest recently (check via last exposure digest sent)
        OR: [
          { lastExposureDigestSent: null },
          { lastExposureDigestSent: { lt: oneWeekAgo } },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        lastScanAt: true,
        exposures: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            source: true,
            sourceName: true,
            dataType: true,
            severity: true,
          },
        },
      },
      // Limit to prevent overwhelming the email quota
      take: 50,
    });

    let sentCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const user of freeUsersWithExposures) {
      try {
        // Skip users with no email
        if (!user.email) {
          skippedCount++;
          continue;
        }

        // Calculate exposure stats
        const exposures = user.exposures;
        const criticalExposures = exposures.filter(e => e.severity === "CRITICAL").length;
        const highExposures = exposures.filter(e => e.severity === "HIGH").length;
        const mediumExposures = exposures.filter(e => e.severity === "MEDIUM").length;

        // Get unique sources and data types
        const topSources = [...new Set(exposures.map(e => e.sourceName || e.source))].slice(0, 10);
        const dataTypesExposed = [...new Set(exposures.map(e => e.dataType))];

        // Calculate estimated time to remove manually
        const estimatedTimeToRemove = Math.ceil((exposures.length * MINUTES_PER_REMOVAL) / 60);

        // Send the digest email
        const result = await sendFreeUserExposureDigest(user.email, user.name || "", {
          totalExposures: exposures.length,
          criticalExposures,
          highExposures,
          mediumExposures,
          topSources,
          dataTypesExposed,
          estimatedTimeToRemove,
          lastScanDate: user.lastScanAt,
        });

        if (result.success) {
          sentCount++;

          // Update lastExposureDigestSent timestamp
          await prisma.user.update({
            where: { id: user.id },
            data: { lastExposureDigestSent: new Date() },
          });
        } else {
          errorCount++;
          console.error(`Failed to send digest to ${user.email}:`, "error" in result ? result.error : "Unknown error");
        }
      } catch (error) {
        errorCount++;
        console.error(`Error processing digest for user ${user.id}:`, error);
      }
    }

    await logCronExecution({
      jobName: "free-user-digest",
      status: errorCount > 0 ? "FAILED" : "SUCCESS",
      duration: Date.now() - startTime,
      message: `Sent ${sentCount} digests, ${errorCount} errors, ${skippedCount} skipped`,
    });

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} digests, ${errorCount} errors, ${skippedCount} skipped`,
      usersProcessed: freeUsersWithExposures.length,
      sentCount,
      errorCount,
      skippedCount,
    });
  } catch (error) {
    console.error("Cron free-user-digest error:", error);
    await logCronExecution({
      jobName: "free-user-digest",
      status: "FAILED",
      duration: Date.now() - startTime,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to process free user digests" },
      { status: 500 }
    );
  }
}
