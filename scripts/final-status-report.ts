import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { getDataBrokerInfo } from "../src/lib/removers/data-broker-directory";

const prisma = new PrismaClient();

async function finalStatusReport() {
  console.log("\n" + "═".repeat(80));
  console.log("              DATASCRUB PRO - REMOVAL STATUS FINAL REPORT");
  console.log("              Generated: " + new Date().toISOString());
  console.log("═".repeat(80));

  const now = new Date();

  // Get all counts
  const [
    totalRemovals,
    completedCount,
    submittedCount,
    pendingCount,
    acknowledgedCount,
    requiresManualCount,
    failedCount,
    recentCompletions,
    totalExposures,
    removedExposures,
    activeExposures,
    totalUsers,
    usersWithRemovals,
  ] = await Promise.all([
    prisma.removalRequest.count(),
    prisma.removalRequest.count({ where: { status: "COMPLETED" } }),
    prisma.removalRequest.count({ where: { status: "SUBMITTED" } }),
    prisma.removalRequest.count({ where: { status: "PENDING" } }),
    prisma.removalRequest.count({ where: { status: "ACKNOWLEDGED" } }),
    prisma.removalRequest.count({ where: { status: "REQUIRES_MANUAL" } }),
    prisma.removalRequest.count({ where: { status: "FAILED" } }),
    prisma.removalRequest.findMany({
      where: {
        status: "COMPLETED",
        completedAt: { not: null },
      },
      orderBy: { completedAt: "desc" },
      take: 10,
      include: {
        exposure: { select: { source: true, sourceName: true } },
        user: { select: { email: true } },
      },
    }),
    prisma.exposure.count(),
    prisma.exposure.count({ where: { status: "REMOVED" } }),
    prisma.exposure.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
    prisma.removalRequest.groupBy({ by: ["userId"], _count: true }).then(r => r.length),
  ]);

  console.log("\n📊 REMOVAL REQUEST SUMMARY");
  console.log("-".repeat(40));
  console.log(`Total Removal Requests:    ${totalRemovals.toLocaleString()}`);
  console.log();
  console.log(`  ✅ COMPLETED:            ${completedCount.toLocaleString().padStart(6)} (${((completedCount / totalRemovals) * 100).toFixed(1)}%)`);
  console.log(`  📤 SUBMITTED:            ${submittedCount.toLocaleString().padStart(6)} (${((submittedCount / totalRemovals) * 100).toFixed(1)}%)`);
  console.log(`  ⏳ PENDING:              ${pendingCount.toLocaleString().padStart(6)} (${((pendingCount / totalRemovals) * 100).toFixed(1)}%)`);
  console.log(`  📬 ACKNOWLEDGED:         ${acknowledgedCount.toLocaleString().padStart(6)} (${((acknowledgedCount / totalRemovals) * 100).toFixed(1)}%)`);
  console.log(`  👤 REQUIRES MANUAL:      ${requiresManualCount.toLocaleString().padStart(6)} (${((requiresManualCount / totalRemovals) * 100).toFixed(1)}%)`);
  console.log(`  ❌ FAILED:               ${failedCount.toLocaleString().padStart(6)} (${((failedCount / totalRemovals) * 100).toFixed(1)}%)`);

  console.log("\n📈 EXPOSURE STATUS");
  console.log("-".repeat(40));
  console.log(`Total Exposures:           ${totalExposures.toLocaleString()}`);
  console.log(`  🗑️  Removed:              ${removedExposures.toLocaleString().padStart(6)}`);
  console.log(`  🔴 Active:               ${activeExposures.toLocaleString().padStart(6)}`);

  console.log("\n👥 USER STATISTICS");
  console.log("-".repeat(40));
  console.log(`Total Users:               ${totalUsers}`);
  console.log(`Users with Removals:       ${usersWithRemovals}`);

  // Broker completion stats
  const completedByBroker = await prisma.removalRequest.groupBy({
    by: ["exposureId"],
    where: { status: "COMPLETED" },
  });

  const exposureIds = completedByBroker.map(r => r.exposureId);
  const completedExposures = await prisma.exposure.findMany({
    where: { id: { in: exposureIds } },
    select: { source: true },
  });

  const brokerCompletions: Record<string, number> = {};
  for (const exp of completedExposures) {
    brokerCompletions[exp.source] = (brokerCompletions[exp.source] || 0) + 1;
  }

  if (Object.keys(brokerCompletions).length > 0) {
    console.log("\n🏢 COMPLETIONS BY BROKER");
    console.log("-".repeat(40));
    for (const [broker, count] of Object.entries(brokerCompletions).sort((a, b) => b[1] - a[1])) {
      const info = getDataBrokerInfo(broker);
      console.log(`  ${(info?.name || broker).padEnd(25)} ${count}`);
    }
  }

  if (recentCompletions.length > 0) {
    console.log("\n✅ RECENT COMPLETIONS");
    console.log("-".repeat(40));
    for (const r of recentCompletions) {
      const completedDate = r.completedAt ? r.completedAt.toLocaleString() : "N/A";
      console.log(`  ${r.exposure.sourceName.padEnd(25)} ${completedDate}`);
      console.log(`    User: ${r.user.email}`);
    }
  }

  // Upcoming verifications
  const upcomingVerifications = await prisma.removalRequest.count({
    where: {
      status: { in: ["SUBMITTED", "IN_PROGRESS"] },
      verifyAfter: {
        lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  console.log("\n📅 VERIFICATION PIPELINE");
  console.log("-".repeat(40));
  console.log(`Verifications due in next 7 days: ${upcomingVerifications}`);

  // Automation rate
  const autoRemovable = submittedCount + acknowledgedCount + completedCount;
  const automationRate = totalRemovals > 0 ? ((autoRemovable / totalRemovals) * 100).toFixed(1) : "0";

  console.log("\n⚙️ AUTOMATION METRICS");
  console.log("-".repeat(40));
  console.log(`Automation Rate:           ${automationRate}%`);
  console.log(`Auto-processed:            ${autoRemovable.toLocaleString()}`);
  console.log(`Requires Manual:           ${requiresManualCount.toLocaleString()}`);

  console.log("\n" + "═".repeat(80));
  console.log("                              END OF REPORT");
  console.log("═".repeat(80));

  await prisma.$disconnect();
}

finalStatusReport().catch(console.error);
