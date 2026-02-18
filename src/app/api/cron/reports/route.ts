import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWeeklyReportEmail, sendMonthlyScanSummaryEmail } from "@/lib/email";
import type { MonthlyScanSummaryData } from "@/lib/email";
import { getEffectivePlanWithFamily } from "@/lib/family/get-family-plan";
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
    const isMonthlyDay = dayOfMonth === 1;
    if (isMonthlyDay) {
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

    // Split users by frequency
    const monthlyUsers = isMonthlyDay ? users.filter(u => u.reportFrequency === "monthly") : [];
    const regularUsers = users.filter(u => u.reportFrequency !== "monthly");

    // =============================================
    // Daily/Weekly users — existing weekly template
    // =============================================
    if (regularUsers.length > 0) {
      const regularIds = regularUsers.map(u => u.id);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const [activeExposureCounts, newExposureCounts, completedRemovalCounts, pendingRemovalCounts] = await Promise.all([
        prisma.exposure.groupBy({
          by: ["userId"],
          where: { userId: { in: regularIds }, status: "ACTIVE" },
          _count: true,
        }),
        prisma.exposure.groupBy({
          by: ["userId"],
          where: { userId: { in: regularIds }, firstFoundAt: { gte: oneWeekAgo } },
          _count: true,
        }),
        prisma.removalRequest.groupBy({
          by: ["userId"],
          where: { userId: { in: regularIds }, status: "COMPLETED", completedAt: { gte: oneWeekAgo } },
          _count: true,
        }),
        prisma.removalRequest.groupBy({
          by: ["userId"],
          where: { userId: { in: regularIds }, status: { in: ["PENDING", "SUBMITTED", "IN_PROGRESS"] } },
          _count: true,
        }),
      ]);

      const activeMap = new Map(activeExposureCounts.map(r => [r.userId, r._count]));
      const newMap = new Map(newExposureCounts.map(r => [r.userId, r._count]));
      const removedMap = new Map(completedRemovalCounts.map(r => [r.userId, r._count]));
      const pendingMap = new Map(pendingRemovalCounts.map(r => [r.userId, r._count]));

      for (const user of regularUsers) {
        try {
          const totalExposures = activeMap.get(user.id) || 0;
          const newExposures = newMap.get(user.id) || 0;
          const removedThisWeek = removedMap.get(user.id) || 0;
          const pendingRemovals = pendingMap.get(user.id) || 0;

          const riskScore = Math.min(100, Math.max(0, totalExposures * 5));
          const previousRiskScore = Math.min(100, Math.max(0, (totalExposures + removedThisWeek - newExposures) * 5));
          const riskChange = riskScore - previousRiskScore;

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
    }

    // =============================================
    // Monthly users — rich monthly scan summary
    // =============================================
    if (monthlyUsers.length > 0) {
      const monthlyIds = monthlyUsers.map(u => u.id);

      // 30-day and 60-day windows
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);

      // Previous month label
      const prevMonth = new Date(now);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      const monthLabel = prevMonth.toLocaleString("en-US", { month: "long", year: "numeric" });

      // Batch queries for monthly stats
      const [
        activeBySeverity,
        newThisMonth,
        newPrevMonth,
        completedThisMonth,
        totalCompleted,
        pendingRemovals,
        totalExposures,
        topSourcesRaw,
      ] = await Promise.all([
        // Active exposures by severity per user
        prisma.exposure.groupBy({
          by: ["userId", "severity"],
          where: { userId: { in: monthlyIds }, status: "ACTIVE" },
          _count: true,
        }),
        // New exposures this month
        prisma.exposure.groupBy({
          by: ["userId"],
          where: { userId: { in: monthlyIds }, firstFoundAt: { gte: oneMonthAgo } },
          _count: true,
        }),
        // New exposures previous month
        prisma.exposure.groupBy({
          by: ["userId"],
          where: { userId: { in: monthlyIds }, firstFoundAt: { gte: twoMonthsAgo, lt: oneMonthAgo } },
          _count: true,
        }),
        // Removals completed this month
        prisma.removalRequest.groupBy({
          by: ["userId"],
          where: { userId: { in: monthlyIds }, status: "COMPLETED", completedAt: { gte: oneMonthAgo } },
          _count: true,
        }),
        // Total removals completed (all time)
        prisma.removalRequest.groupBy({
          by: ["userId"],
          where: { userId: { in: monthlyIds }, status: "COMPLETED" },
          _count: true,
        }),
        // Pending removals
        prisma.removalRequest.groupBy({
          by: ["userId"],
          where: { userId: { in: monthlyIds }, status: { in: ["PENDING", "SUBMITTED", "IN_PROGRESS"] } },
          _count: true,
        }),
        // Total exposures (all statuses) for protection score
        prisma.exposure.groupBy({
          by: ["userId"],
          where: { userId: { in: monthlyIds } },
          _count: true,
        }),
        // Top sources (active, across all monthly users — we'll filter per-user in the loop)
        prisma.exposure.groupBy({
          by: ["userId", "sourceName"],
          where: { userId: { in: monthlyIds }, status: "ACTIVE" },
          _count: true,
          orderBy: { _count: { id: "desc" } },
        }),
      ]);

      // Build lookup maps
      const newThisMonthMap = new Map(newThisMonth.map(r => [r.userId, r._count]));
      const newPrevMonthMap = new Map(newPrevMonth.map(r => [r.userId, r._count]));
      const completedThisMonthMap = new Map(completedThisMonth.map(r => [r.userId, r._count]));
      const totalCompletedMap = new Map(totalCompleted.map(r => [r.userId, r._count]));
      const pendingMap = new Map(pendingRemovals.map(r => [r.userId, r._count]));
      const totalExpMap = new Map(totalExposures.map(r => [r.userId, r._count]));

      // Build severity maps per user
      const severityMap = new Map<string, Record<string, number>>();
      for (const row of activeBySeverity) {
        const existing = severityMap.get(row.userId) || {};
        existing[row.severity] = row._count;
        severityMap.set(row.userId, existing);
      }

      // Build top sources per user
      const topSourcesMap = new Map<string, Array<{ sourceName: string; count: number }>>();
      for (const row of topSourcesRaw) {
        const existing = topSourcesMap.get(row.userId) || [];
        if (existing.length < 5) {
          existing.push({ sourceName: row.sourceName, count: row._count });
        }
        topSourcesMap.set(row.userId, existing);
      }

      for (const user of monthlyUsers) {
        try {
          const severity = severityMap.get(user.id) || {};
          const activeCount = (severity.CRITICAL || 0) + (severity.HIGH || 0) + (severity.MEDIUM || 0) + (severity.LOW || 0);
          const completed = totalCompletedMap.get(user.id) || 0;
          const total = totalExpMap.get(user.id) || 0;

          // Protection score: % of exposures that have been removed
          const protectionScore = total > 0 ? Math.round((completed / total) * 100) : 100;

          // Previous month's protection score estimate
          const prevCompleted = completed - (completedThisMonthMap.get(user.id) || 0);
          const prevTotal = total - (newThisMonthMap.get(user.id) || 0);
          const previousProtectionScore = prevTotal > 0 ? Math.round((prevCompleted / prevTotal) * 100) : 100;

          const effectivePlan = await getEffectivePlanWithFamily(user.id);

          const summaryData: MonthlyScanSummaryData = {
            totalActiveExposures: activeCount,
            newExposuresThisMonth: newThisMonthMap.get(user.id) || 0,
            previousMonthNewExposures: newPrevMonthMap.get(user.id) || 0,
            criticalCount: severity.CRITICAL || 0,
            highCount: severity.HIGH || 0,
            mediumCount: severity.MEDIUM || 0,
            lowCount: severity.LOW || 0,
            removalsCompletedThisMonth: completedThisMonthMap.get(user.id) || 0,
            totalRemovalsCompleted: completed,
            pendingRemovals: pendingMap.get(user.id) || 0,
            protectionScore,
            previousProtectionScore,
            topSources: topSourcesMap.get(user.id) || [],
            effectivePlan,
            monthLabel,
          };

          const result = await sendMonthlyScanSummaryEmail(user.email, user.name || "", summaryData);

          if (result.success) {
            sentCount++;
          } else {
            errorCount++;
            console.error(`Failed to send monthly report to ${user.email}:`, "error" in result ? result.error : "Unknown error");
          }
        } catch (error) {
          errorCount++;
          console.error(`Error processing monthly report for user ${user.id}:`, error);
        }
      }
    }

    await logCronExecution({
      jobName: "reports",
      status: errorCount > 0 ? "FAILED" : "SUCCESS",
      duration: Date.now() - startTime,
      message: `Sent ${sentCount} reports (${monthlyUsers.length} monthly, ${regularUsers.length} regular), ${errorCount} errors`,
      metadata: { frequencies: frequenciesToProcess, usersProcessed: users.length, monthlyUsers: monthlyUsers.length },
    });

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} reports, ${errorCount} errors`,
      frequencies: frequenciesToProcess,
      usersProcessed: users.length,
      monthlyUsers: monthlyUsers.length,
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
