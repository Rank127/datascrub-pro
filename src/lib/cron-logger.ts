/**
 * Cron Job Logger - Tracks cron execution for monitoring
 */

import { prisma } from "@/lib/db";

export interface CronLogEntry {
  jobName: string;
  status: "SUCCESS" | "FAILED" | "SKIPPED" | "PARTIAL";
  duration?: number;
  message?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log a cron job execution
 */
export async function logCronExecution(entry: CronLogEntry): Promise<void> {
  try {
    await prisma.cronLog.create({
      data: {
        jobName: entry.jobName,
        status: entry.status,
        duration: entry.duration,
        message: entry.message,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
      },
    });
  } catch (error) {
    // Don't throw - logging failures shouldn't break cron jobs
    console.error("[CronLogger] Failed to log cron execution:", error);
  }
}

/**
 * Get the last successful run for a cron job
 */
export async function getLastSuccessfulRun(jobName: string): Promise<Date | null> {
  try {
    const lastRun = await prisma.cronLog.findFirst({
      where: {
        jobName,
        status: "SUCCESS",
      },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    return lastRun?.createdAt || null;
  } catch (error) {
    console.error("[CronLogger] Failed to get last run:", error);
    return null;
  }
}

/**
 * Get cron job status summary for health check
 */
export async function getCronHealthStatus(): Promise<{
  jobs: Array<{
    name: string;
    lastRun: Date | null;
    lastStatus: string | null;
    isOverdue: boolean;
    expectedInterval: string;
  }>;
  hasOverdueJobs: boolean;
}> {
  // Define expected cron schedules (in hours)
  const cronSchedules: Record<string, { interval: number; label: string }> = {
    "health-check": { interval: 25, label: "Daily" },
    "ticketing-agent": { interval: 25, label: "Daily" },
    "process-removals": { interval: 3, label: "Every 2 hours" },
    "verify-removals": { interval: 25, label: "Daily" },
    "reports": { interval: 170, label: "Weekly" },
    "follow-up-reminders": { interval: 25, label: "Daily" },
    "link-checker": { interval: 25, label: "Daily" },
    "close-resolved-tickets": { interval: 25, label: "Daily" },
    "seo-agent": { interval: 6, label: "Every 4 hours" },
    "free-user-digest": { interval: 170, label: "Weekly" },
    "monthly-rescan": { interval: 750, label: "Monthly" },
    "daily-standup": { interval: 25, label: "Daily" },
    "removal-digest": { interval: 25, label: "Daily" },
    "content-optimizer": { interval: 25, label: "Daily" },
    "clear-pending-queue": { interval: 2, label: "Hourly" },
    "drip-campaigns": { interval: 25, label: "Daily" },
    "email-monitor": { interval: 13, label: "12-hour" },
    "dashboard-validation": { interval: 25, label: "Daily" },
    "auto-verify-fast-brokers": { interval: 25, label: "Daily" },
    "cleanup-data-processors": { interval: 25, label: "Daily" },
    "auto-process-manual-queue": { interval: 9, label: "8-hour" },
    "security-scan": { interval: 25, label: "Daily" },
    "mastermind-weekly": { interval: 170, label: "Weekly" },
    "competitive-monitor": { interval: 170, label: "Weekly" },
    "growth-analysis": { interval: 170, label: "Weekly" },
    "broker-compliance": { interval: 25, label: "Daily" },
    "blog-publisher": { interval: 90, label: "Twice weekly" },
  };

  const jobs: Array<{
    name: string;
    lastRun: Date | null;
    lastStatus: string | null;
    isOverdue: boolean;
    expectedInterval: string;
  }> = [];

  let hasOverdueJobs = false;

  for (const [jobName, schedule] of Object.entries(cronSchedules)) {
    try {
      const lastLog = await prisma.cronLog.findFirst({
        where: { jobName },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true, status: true },
      });

      const lastRun = lastLog?.createdAt || null;
      const lastStatus = lastLog?.status || null;

      // Check if overdue (hasn't run within expected interval + 1 hour buffer)
      const isOverdue = lastRun
        ? Date.now() - lastRun.getTime() > (schedule.interval + 1) * 60 * 60 * 1000
        : true; // Never ran = overdue (but only after system has been deployed)

      // Don't mark as overdue if this specific job has never logged (new job)
      const hasJobLogged = await prisma.cronLog.count({ where: { jobName } }) > 0;
      const effectiveOverdue = hasJobLogged ? isOverdue : false;

      if (effectiveOverdue && lastRun) {
        hasOverdueJobs = true;
      }

      jobs.push({
        name: jobName,
        lastRun,
        lastStatus,
        isOverdue: effectiveOverdue,
        expectedInterval: schedule.label,
      });
    } catch (error) {
      console.error(`[CronLogger] Failed to check ${jobName}:`, error);
      jobs.push({
        name: jobName,
        lastRun: null,
        lastStatus: "ERROR",
        isOverdue: false,
        expectedInterval: cronSchedules[jobName]?.label || "Unknown",
      });
    }
  }

  return { jobs, hasOverdueJobs };
}

/**
 * A4: Get retrigger count for a cron job within a time window
 */
export async function getRetriggerCount(jobName: string, windowHours: number): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - windowHours * 60 * 60 * 1000);
    return await prisma.cronLog.count({
      where: {
        jobName,
        status: "RETRIGGER" as string,
        createdAt: { gte: cutoff },
      },
    });
  } catch (error) {
    console.error("[CronLogger] Failed to get retrigger count:", error);
    return 0;
  }
}

/**
 * A4: Log a retrigger attempt for a cron job
 */
export async function logRetriggerAttempt(jobName: string, success: boolean): Promise<void> {
  try {
    await prisma.cronLog.create({
      data: {
        jobName,
        status: "RETRIGGER" as string,
        message: success ? `Retrigger of ${jobName} succeeded` : `Retrigger of ${jobName} failed`,
        metadata: JSON.stringify({ success, triggeredAt: new Date().toISOString() }),
      },
    });
  } catch (error) {
    console.error("[CronLogger] Failed to log retrigger attempt:", error);
  }
}

/**
 * Clean up old cron logs (keep last 30 days)
 */
export async function cleanupOldCronLogs(): Promise<number> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await prisma.cronLog.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
      },
    });
    return result.count;
  } catch (error) {
    console.error("[CronLogger] Failed to cleanup old logs:", error);
    return 0;
  }
}
