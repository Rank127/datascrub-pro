import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWeeklyReportEmail } from "@/lib/email";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";
import { logCronExecution } from "@/lib/cron-logger";

export const maxDuration = 120;

// GET /api/cron/reports - Send periodic report emails
export async function GET(request: Request) {
  // Verify this is a legitimate cron request
  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return cronUnauthorizedResponse(authResult.reason);
  }

  const startTime = Date.now();
  try {
    // Determine which frequencies to process based on current day
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayOfMonth = now.getDate();

    const frequenciesToProcess: string[] = ["daily"];

    // Weekly reports on Monday (day 1)
    if (dayOfWeek === 1) {
      frequenciesToProcess.push("weekly");
    }

    // Monthly reports on the 1st
    if (dayOfMonth === 1) {
      frequenciesToProcess.push("monthly");
    }

    // Fetch users who want reports and have email notifications enabled
    // Limit to 200 per run to prevent memory exhaustion and cron timeouts
    const users = await prisma.user.findMany({
      where: {
        emailNotifications: true,
        weeklyReports: true,
        reportFrequency: { in: frequenciesToProcess },
      },
      select: {
        id: true,
        email: true,
        name: true,
        reportFrequency: true,
      },
      take: 200,
      orderBy: { createdAt: "asc" },
    });

    let sentCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Calculate stats for this user
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const [totalExposures, newExposures, removedThisWeek, pendingRemovals] = await Promise.all([
          prisma.exposure.count({
            where: { userId: user.id, status: "ACTIVE" },
          }),
          prisma.exposure.count({
            where: {
              userId: user.id,
              firstFoundAt: { gte: oneWeekAgo },
            },
          }),
          prisma.removalRequest.count({
            where: {
              userId: user.id,
              status: "COMPLETED",
              completedAt: { gte: oneWeekAgo },
            },
          }),
          prisma.removalRequest.count({
            where: {
              userId: user.id,
              status: { in: ["PENDING", "SUBMITTED", "IN_PROGRESS"] },
            },
          }),
        ]);

        // Calculate risk score (simplified)
        const riskScore = Math.min(100, Math.max(0, totalExposures * 5));

        // Get previous week's total to calculate change
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const previousWeekExposures = await prisma.exposure.count({
          where: {
            userId: user.id,
            firstFoundAt: { lte: oneWeekAgo, gte: twoWeeksAgo },
          },
        });

        const previousRiskScore = Math.min(100, Math.max(0, (totalExposures + removedThisWeek - newExposures) * 5));
        const riskChange = riskScore - previousRiskScore;

        // Send the report email
        const result = await sendWeeklyReportEmail(user.email, user.name || "", {
          totalExposures,
          newExposures,
          removedThisWeek,
          pendingRemovals,
          riskScore,
          riskChange,
        });

        if (result.success) {
          sentCount++;
        } else {
          errorCount++;
          console.error(`Failed to send report to ${user.email}:`, "error" in result ? result.error : "Unknown error");
        }
      } catch (error) {
        errorCount++;
        console.error(`Error processing report for user ${user.id}:`, error);
      }
    }

    await logCronExecution({
      jobName: "reports",
      status: errorCount > 0 ? "FAILED" : "SUCCESS",
      duration: Date.now() - startTime,
      message: `Sent ${sentCount} reports, ${errorCount} errors`,
      metadata: { frequencies: frequenciesToProcess, usersProcessed: users.length },
    });

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} reports, ${errorCount} errors`,
      frequencies: frequenciesToProcess,
      usersProcessed: users.length,
    });
  } catch (error) {
    console.error("Cron reports error:", error);
    await logCronExecution({
      jobName: "reports",
      status: "FAILED",
      duration: Date.now() - startTime,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to process reports" },
      { status: 500 }
    );
  }
}
