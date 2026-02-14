import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendRescanReminderEmail } from "@/lib/email";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";
import { logCronExecution } from "@/lib/cron-logger";

// Cron job to remind FREE users to run monthly scans and auto-trigger scans for paid users
// Runs on the 1st of each month at 10 AM UTC
// Vercel cron: "0 10 1 * *"

export const maxDuration = 300;

export async function GET(request: Request) {
  const startTime = Date.now();

  // Verify cron secret
  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return cronUnauthorizedResponse(authResult.reason);
  }

  console.log("[Monthly Rescan] Starting monthly rescan job...");

  const stats = {
    freeUsersReminded: 0,
    proUsersQueued: 0,
    enterpriseUsersQueued: 0,
    emailsSent: 0,
    scansQueued: 0,
    errors: 0,
  };

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get active users who haven't scanned in the last 30 days (batched to prevent memory exhaustion)
    const BATCH_SIZE = 500;
    const usersNeedingScan = await prisma.user.findMany({
      where: {
        emailVerified: { not: null }, // Only verified users
        OR: [
          { scans: { none: {} } }, // Never scanned
          {
            scans: {
              none: {
                createdAt: { gte: thirtyDaysAgo },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        scans: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
        exposures: {
          where: { status: "ACTIVE" },
          select: { id: true },
        },
        profiles: {
          select: { id: true },
          take: 1,
        },
      },
      take: BATCH_SIZE,
      orderBy: { createdAt: "asc" },
    });

    console.log(`[Monthly Rescan] Found ${usersNeedingScan.length} users needing scan`);

    for (const user of usersNeedingScan) {
      if (!user.email || user.profiles.length === 0) continue;

      try {
        const lastScanDate = user.scans[0]?.createdAt || null;
        const exposureCount = user.exposures.length;

        if (user.plan === "FREE") {
          // FREE users: Send reminder email to scan manually
          await sendRescanReminderEmail(
            user.email,
            user.name || "",
            lastScanDate,
            exposureCount
          );
          stats.freeUsersReminded++;
          stats.emailsSent++;
        } else {
          // PRO/ENTERPRISE users: Queue automatic scan
          await prisma.scan.create({
            data: {
              userId: user.id,
              type: "MONITORING",
              status: "PENDING",
            },
          });

          if (user.plan === "PRO") {
            stats.proUsersQueued++;
          } else {
            stats.enterpriseUsersQueued++;
          }
          stats.scansQueued++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`[Monthly Rescan] Error processing user ${user.id}:`, error);
        stats.errors++;
      }
    }

    // Also check for users with MONITORING scan type enabled
    // These users should get automatic weekly/daily scans based on their plan
    const usersWithMonitoring = await prisma.user.findMany({
      where: {
        plan: { in: ["PRO", "ENTERPRISE"] },
        profiles: { some: {} },
      },
      select: {
        id: true,
        plan: true,
        scans: {
          where: { type: "MONITORING" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
      take: BATCH_SIZE,
      orderBy: { createdAt: "asc" },
    });

    // Queue monitoring scans for users who haven't had one recently
    for (const user of usersWithMonitoring) {
      const lastMonitoringScan = user.scans[0]?.createdAt;
      const scanInterval = user.plan === "ENTERPRISE" ? 1 : 7; // days
      const intervalMs = scanInterval * 24 * 60 * 60 * 1000;

      if (!lastMonitoringScan || (now.getTime() - lastMonitoringScan.getTime()) > intervalMs) {
        try {
          // Check if there's already a pending scan
          const pendingScan = await prisma.scan.findFirst({
            where: {
              userId: user.id,
              status: "PENDING",
            },
          });

          if (!pendingScan) {
            await prisma.scan.create({
              data: {
                userId: user.id,
                type: "MONITORING",
                status: "PENDING",
              },
            });
            stats.scansQueued++;
          }
        } catch (error) {
          stats.errors++;
        }
      }
    }

    const durationMs = Date.now() - startTime;
    const duration = `${durationMs}ms`;
    console.log(`[Monthly Rescan] Completed in ${duration}:`, stats);

    await logCronExecution({
      jobName: "monthly-rescan",
      status: stats.errors > 0 ? "FAILED" : "SUCCESS",
      duration: durationMs,
      message: `Reminded ${stats.freeUsersReminded} free users, queued ${stats.scansQueued} scans`,
      metadata: stats as unknown as Record<string, unknown>,
    });

    return NextResponse.json({
      success: true,
      stats,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Monthly Rescan] Fatal error:", error);
    await logCronExecution({
      jobName: "monthly-rescan",
      status: "FAILED",
      duration: Date.now() - startTime,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stats,
        duration: `${Date.now() - startTime}ms`,
      },
      { status: 500 }
    );
  }
}
