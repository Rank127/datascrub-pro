import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { processPendingRemovalsBatch, retryFailedRemovalsBatch, getAutomationStats } from "../src/lib/removers/removal-service";
import { runVerificationBatch, getRemovalsDueForVerification } from "../src/lib/removers/verification-service";
import { getDataBrokerInfo } from "../src/lib/removers/data-broker-directory";

const prisma = new PrismaClient();

interface RemovalStats {
  total: number;
  byStatus: Record<string, number>;
  byMethod: Record<string, number>;
  byBroker: Record<string, { total: number; completed: number; pending: number; failed: number }>;
  recentlyCompleted: Array<{ id: string; source: string; completedAt: Date | null }>;
  pendingVerification: number;
  requiresManualAction: number;
}

async function collectRemovalData(): Promise<RemovalStats> {
  console.log("\n📊 Collecting removal request data...\n");

  // Get all removal requests with detailed info
  const removals = await prisma.removalRequest.findMany({
    include: {
      exposure: {
        select: {
          source: true,
          sourceName: true,
          dataType: true,
          severity: true,
        },
      },
      user: {
        select: {
          email: true,
          plan: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Initialize stats
  const stats: RemovalStats = {
    total: removals.length,
    byStatus: {},
    byMethod: {},
    byBroker: {},
    recentlyCompleted: [],
    pendingVerification: 0,
    requiresManualAction: 0,
  };

  const now = new Date();

  for (const removal of removals) {
    // Count by status
    stats.byStatus[removal.status] = (stats.byStatus[removal.status] || 0) + 1;

    // Count by method
    stats.byMethod[removal.method] = (stats.byMethod[removal.method] || 0) + 1;

    // Count by broker
    const broker = removal.exposure.source;
    if (!stats.byBroker[broker]) {
      stats.byBroker[broker] = { total: 0, completed: 0, pending: 0, failed: 0 };
    }
    stats.byBroker[broker].total++;

    if (removal.status === "COMPLETED" || removal.status === "VERIFIED") {
      stats.byBroker[broker].completed++;
    } else if (removal.status === "FAILED") {
      stats.byBroker[broker].failed++;
    } else {
      stats.byBroker[broker].pending++;
    }

    // Track recently completed (last 7 days)
    if (removal.completedAt && removal.status === "COMPLETED") {
      const daysSinceCompleted = (now.getTime() - removal.completedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCompleted <= 7) {
        stats.recentlyCompleted.push({
          id: removal.id,
          source: removal.exposure.sourceName,
          completedAt: removal.completedAt,
        });
      }
    }

    // Count pending verification
    if (removal.verifyAfter && removal.verifyAfter <= now && removal.status === "SUBMITTED") {
      stats.pendingVerification++;
    }

    // Count manual actions
    if (removal.status === "REQUIRES_MANUAL") {
      stats.requiresManualAction++;
    }
  }

  return stats;
}

async function displayStats(stats: RemovalStats) {
  console.log("═".repeat(60));
  console.log("           REMOVAL REQUEST STATUS REPORT");
  console.log("═".repeat(60));

  console.log(`\n📈 OVERVIEW`);
  console.log(`   Total Removal Requests: ${stats.total}`);
  console.log(`   Pending Verification: ${stats.pendingVerification}`);
  console.log(`   Requires Manual Action: ${stats.requiresManualAction}`);

  console.log(`\n📊 BY STATUS:`);
  const statusOrder = ["COMPLETED", "VERIFIED", "SUBMITTED", "IN_PROGRESS", "PENDING", "ACKNOWLEDGED", "REQUIRES_MANUAL", "FAILED"];
  for (const status of statusOrder) {
    const count = stats.byStatus[status] || 0;
    if (count > 0) {
      const pct = ((count / stats.total) * 100).toFixed(1);
      const bar = "█".repeat(Math.round(count / stats.total * 30));
      console.log(`   ${status.padEnd(16)} ${count.toString().padStart(5)} (${pct}%) ${bar}`);
    }
  }

  console.log(`\n📬 BY METHOD:`);
  for (const [method, count] of Object.entries(stats.byMethod).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${method.padEnd(16)} ${count}`);
  }

  // Top 15 brokers by volume
  console.log(`\n🏢 TOP BROKERS BY REMOVAL VOLUME:`);
  const sortedBrokers = Object.entries(stats.byBroker)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 15);

  console.log(`   ${"Broker".padEnd(25)} ${"Total".padStart(6)} ${"Done".padStart(6)} ${"Pend".padStart(6)} ${"Fail".padStart(6)} ${"Rate".padStart(7)}`);
  console.log(`   ${"-".repeat(25)} ${"-".repeat(6)} ${"-".repeat(6)} ${"-".repeat(6)} ${"-".repeat(6)} ${"-".repeat(7)}`);

  for (const [broker, data] of sortedBrokers) {
    const successRate = data.total > 0 ? ((data.completed / data.total) * 100).toFixed(0) + "%" : "N/A";
    const brokerInfo = getDataBrokerInfo(broker);
    const displayName = brokerInfo?.name || broker;
    console.log(`   ${displayName.substring(0, 25).padEnd(25)} ${data.total.toString().padStart(6)} ${data.completed.toString().padStart(6)} ${data.pending.toString().padStart(6)} ${data.failed.toString().padStart(6)} ${successRate.padStart(7)}`);
  }

  if (stats.recentlyCompleted.length > 0) {
    console.log(`\n✅ RECENTLY COMPLETED (Last 7 Days): ${stats.recentlyCompleted.length}`);
    for (const item of stats.recentlyCompleted.slice(0, 10)) {
      const date = item.completedAt ? item.completedAt.toLocaleDateString() : "Unknown";
      console.log(`   - ${item.source} (${date})`);
    }
    if (stats.recentlyCompleted.length > 10) {
      console.log(`   ... and ${stats.recentlyCompleted.length - 10} more`);
    }
  }
}

async function runAgents() {
  console.log("\n" + "═".repeat(60));
  console.log("           RUNNING REMOVAL AGENTS");
  console.log("═".repeat(60));

  // Step 1: Get current automation stats
  console.log("\n📊 Current Automation Stats:");
  const automationStats = await getAutomationStats();
  console.log(`   Total Removals: ${automationStats.totalRemovals}`);
  console.log(`   Automation Rate: ${automationStats.automationRate}%`);
  console.log(`   By Status:`, automationStats.byStatus);

  // Step 2: Process pending removals
  console.log("\n🔄 Processing Pending Removals...");
  const pendingResult = await processPendingRemovalsBatch(50);
  console.log(`   Processed: ${pendingResult.processed}`);
  console.log(`   Successful: ${pendingResult.successful}`);
  console.log(`   Failed: ${pendingResult.failed}`);
  console.log(`   Skipped (rate-limited): ${pendingResult.skipped}`);
  console.log(`   Emails Sent: ${pendingResult.emailsSent}`);

  if (pendingResult.brokerDistribution && Object.keys(pendingResult.brokerDistribution).length > 0) {
    console.log("\n   Broker Distribution:");
    const sorted = Object.entries(pendingResult.brokerDistribution)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 10);
    for (const [broker, count] of sorted) {
      console.log(`     ${broker}: ${count}`);
    }
  }

  // Step 3: Retry failed removals
  console.log("\n🔁 Retrying Failed Removals...");
  const retryResult = await retryFailedRemovalsBatch(25);
  console.log(`   Processed: ${retryResult.processed}`);
  console.log(`   Retried: ${retryResult.retried}`);
  console.log(`   Still Failed: ${retryResult.stillFailed}`);
  console.log(`   Skipped (limit): ${retryResult.skippedDueToLimit}`);

  // Step 4: Check verifications due
  console.log("\n🔍 Checking Verification Queue...");
  const verificationsDue = await getRemovalsDueForVerification(100);
  console.log(`   Removals Due for Verification: ${verificationsDue.length}`);

  if (verificationsDue.length > 0) {
    console.log("\n📋 Running Verification Batch...");
    const verifyResult = await runVerificationBatch();
    console.log(`   Processed: ${verifyResult.processed}`);
    console.log(`   Verified Complete: ${verifyResult.completed}`);
    console.log(`   Still Pending: ${verifyResult.pending}`);
    console.log(`   Failed: ${verifyResult.failed}`);
    console.log(`   Digest Emails Sent: ${verifyResult.emailsSent}`);
  }

  return { pendingResult, retryResult };
}

async function main() {
  console.log("\n🚀 DataScrub Pro - Removal Agent Runner");
  console.log(`   Started at: ${new Date().toISOString()}`);

  try {
    // Collect initial data
    const initialStats = await collectRemovalData();
    console.log("\n📊 INITIAL STATE:");
    await displayStats(initialStats);

    // Run the agents
    await runAgents();

    // Collect final data
    const finalStats = await collectRemovalData();
    console.log("\n📊 FINAL STATE:");
    await displayStats(finalStats);

    // Show changes
    console.log("\n" + "═".repeat(60));
    console.log("           CHANGES SUMMARY");
    console.log("═".repeat(60));

    const completedChange = (finalStats.byStatus["COMPLETED"] || 0) - (initialStats.byStatus["COMPLETED"] || 0);
    const pendingChange = (finalStats.byStatus["PENDING"] || 0) - (initialStats.byStatus["PENDING"] || 0);
    const submittedChange = (finalStats.byStatus["SUBMITTED"] || 0) - (initialStats.byStatus["SUBMITTED"] || 0);

    console.log(`   Completed: ${completedChange >= 0 ? "+" : ""}${completedChange}`);
    console.log(`   Submitted: ${submittedChange >= 0 ? "+" : ""}${submittedChange}`);
    console.log(`   Pending: ${pendingChange >= 0 ? "+" : ""}${pendingChange}`);

  } catch (error) {
    console.error("\n❌ Error:", error);
  } finally {
    await prisma.$disconnect();
    console.log(`\n✅ Completed at: ${new Date().toISOString()}`);
  }
}

main();
