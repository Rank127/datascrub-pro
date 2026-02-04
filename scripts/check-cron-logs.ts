/**
 * Check Cron Job Execution Logs
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "../src/lib/db";

async function checkCronLogs() {
  console.log("Recent Cron Job Executions:");
  console.log("=".repeat(90));

  const logs = await prisma.cronLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  if (logs.length === 0) {
    console.log("No cron logs found.");
  } else {
    for (const log of logs) {
      const status = log.status === "SUCCESS" ? "✓" : log.status === "FAILED" ? "✗" : "○";
      const time = new Date(log.createdAt).toLocaleString();
      const duration = log.duration ? `${log.duration}ms` : "-";

      console.log(`${status} ${log.jobName.padEnd(25)} | ${log.status.padEnd(8)} | ${duration.padEnd(8)} | ${time}`);

      if (log.message) {
        // Truncate long messages
        const msg = log.message.length > 100 ? log.message.substring(0, 100) + "..." : log.message;
        console.log(`    → ${msg}`);
      }
    }
  }

  console.log();
  console.log("=".repeat(90));

  // Summary by job
  console.log("\nSummary by Job (last 24 hours):");
  console.log("-".repeat(60));

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const summary = await prisma.cronLog.groupBy({
    by: ["jobName", "status"],
    where: { createdAt: { gte: oneDayAgo } },
    _count: true,
  });

  const jobStats: Record<string, { success: number; failed: number; skipped: number }> = {};

  for (const row of summary) {
    if (!jobStats[row.jobName]) {
      jobStats[row.jobName] = { success: 0, failed: 0, skipped: 0 };
    }
    if (row.status === "SUCCESS") jobStats[row.jobName].success = row._count;
    else if (row.status === "FAILED") jobStats[row.jobName].failed = row._count;
    else jobStats[row.jobName].skipped = row._count;
  }

  for (const [job, stats] of Object.entries(jobStats).sort()) {
    const total = stats.success + stats.failed + stats.skipped;
    const successRate = total > 0 ? Math.round((stats.success / total) * 100) : 0;
    console.log(`  ${job.padEnd(25)} | ✓ ${stats.success} | ✗ ${stats.failed} | ○ ${stats.skipped} | ${successRate}% success`);
  }

  await prisma.$disconnect();
}

checkCronLogs().catch(console.error);
