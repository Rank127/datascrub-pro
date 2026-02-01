import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { getDataBrokerInfo } from "../src/lib/removers/data-broker-directory";
import {
  processPendingRemovalsBatch,
  retryFailedRemovalsBatch,
  getAutomationStats,
} from "../src/lib/removers/removal-service";

const prisma = new PrismaClient();

// Aggressive but safe limits for queue clearing
const AGGRESSIVE_BATCH_SIZE = 150; // Up from 100
const RETRY_BATCH_SIZE = 50; // Up from 25
const TARGET_CLEARANCE_HOURS = 24;
const BATCHES_PER_HOUR = 2; // Run every 30 minutes instead of every 4 hours

interface QueueAnalysis {
  totalPending: number;
  pendingByBroker: Record<string, number>;
  pendingByMethod: Record<string, number>;
  stuckRemovals: number; // attempts >= 3
  automatable: number;
  requiresManual: number;
  estimatedBatchesNeeded: number;
  estimatedHoursToComplete: number;
}

async function analyzeQueue(): Promise<QueueAnalysis> {
  const now = new Date();

  // Get all pending removals with details
  const pendingRemovals = await prisma.removalRequest.findMany({
    where: { status: "PENDING" },
    include: {
      exposure: {
        select: { source: true, sourceName: true },
      },
    },
  });

  // Analyze by broker
  const pendingByBroker: Record<string, number> = {};
  const pendingByMethod: Record<string, number> = {};
  let automatable = 0;
  let requiresManual = 0;
  let stuckRemovals = 0;

  for (const removal of pendingRemovals) {
    const broker = removal.exposure.source;
    const brokerInfo = getDataBrokerInfo(broker);

    // Count by broker
    pendingByBroker[broker] = (pendingByBroker[broker] || 0) + 1;

    // Count by method
    pendingByMethod[removal.method] = (pendingByMethod[removal.method] || 0) + 1;

    // Check if automatable
    if (brokerInfo?.privacyEmail || brokerInfo?.optOutUrl) {
      automatable++;
    } else {
      requiresManual++;
    }

    // Check if stuck (too many attempts)
    if (removal.attempts >= 3) {
      stuckRemovals++;
    }
  }

  const totalPending = pendingRemovals.length;
  const effectivePending = automatable - stuckRemovals;
  const estimatedBatchesNeeded = Math.ceil(effectivePending / AGGRESSIVE_BATCH_SIZE);
  const estimatedHoursToComplete = estimatedBatchesNeeded / BATCHES_PER_HOUR;

  return {
    totalPending,
    pendingByBroker,
    pendingByMethod,
    stuckRemovals,
    automatable,
    requiresManual,
    estimatedBatchesNeeded,
    estimatedHoursToComplete,
  };
}

async function getBrokerUsageToday(): Promise<Record<string, number>> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const submissions = await prisma.removalRequest.findMany({
    where: {
      status: { in: ["SUBMITTED", "ACKNOWLEDGED", "COMPLETED"] },
      submittedAt: { gte: today },
    },
    include: {
      exposure: { select: { source: true } },
    },
  });

  const usage: Record<string, number> = {};
  for (const sub of submissions) {
    const broker = sub.exposure.source;
    usage[broker] = (usage[broker] || 0) + 1;
  }
  return usage;
}

async function processQueueAggressively() {
  console.log("\n" + "═".repeat(70));
  console.log("       INTELLIGENT QUEUE PROCESSOR - AGGRESSIVE MODE");
  console.log("═".repeat(70));
  console.log(`Started: ${new Date().toISOString()}`);

  // Analyze current queue
  console.log("\n📊 QUEUE ANALYSIS");
  console.log("-".repeat(50));

  const analysis = await analyzeQueue();

  console.log(`Total Pending: ${analysis.totalPending}`);
  console.log(`  - Automatable: ${analysis.automatable}`);
  console.log(`  - Requires Manual: ${analysis.requiresManual}`);
  console.log(`  - Stuck (3+ attempts): ${analysis.stuckRemovals}`);
  console.log(`\nEstimated batches needed: ${analysis.estimatedBatchesNeeded}`);
  console.log(`Estimated hours to complete: ${analysis.estimatedHoursToComplete.toFixed(1)}`);

  // Show top brokers with pending
  console.log("\n📋 TOP BROKERS WITH PENDING:");
  const sortedBrokers = Object.entries(analysis.pendingByBroker)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  for (const [broker, count] of sortedBrokers) {
    const info = getDataBrokerInfo(broker);
    console.log(`  ${(info?.name || broker).padEnd(30)} ${count}`);
  }

  // Check today's broker usage
  console.log("\n📈 BROKER USAGE TODAY:");
  const brokerUsage = await getBrokerUsageToday();
  const topUsage = Object.entries(brokerUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (topUsage.length > 0) {
    for (const [broker, count] of topUsage) {
      const info = getDataBrokerInfo(broker);
      const remaining = 25 - count;
      console.log(`  ${(info?.name || broker).padEnd(30)} ${count}/25 (${remaining} remaining)`);
    }
  } else {
    console.log("  No submissions today yet");
  }

  // Calculate available capacity
  const brokersWithPending = Object.keys(analysis.pendingByBroker).length;
  const theoreticalCapacity = brokersWithPending * 25; // Max 25 per broker per day
  const usedCapacity = Object.values(brokerUsage).reduce((sum, count) => sum + count, 0);
  const remainingCapacity = theoreticalCapacity - usedCapacity;

  console.log(`\n⚡ CAPACITY ANALYSIS:`);
  console.log(`  Brokers with pending: ${brokersWithPending}`);
  console.log(`  Theoretical daily capacity: ${theoreticalCapacity}`);
  console.log(`  Used today: ${usedCapacity}`);
  console.log(`  Remaining capacity: ${remainingCapacity}`);

  if (analysis.totalPending === 0) {
    console.log("\n✅ QUEUE IS EMPTY - Nothing to process!");
    await prisma.$disconnect();
    return;
  }

  // Process pending removals with aggressive batch size
  console.log("\n" + "═".repeat(70));
  console.log("       PROCESSING QUEUE");
  console.log("═".repeat(70));

  let totalProcessed = 0;
  let totalSuccessful = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  let batchCount = 0;
  const maxBatches = 10; // Safety limit for single run

  while (batchCount < maxBatches) {
    batchCount++;
    console.log(`\n🔄 BATCH ${batchCount}/${maxBatches}`);

    // Process pending
    const pendingResult = await processPendingRemovalsBatch(AGGRESSIVE_BATCH_SIZE);

    console.log(`  Pending: processed=${pendingResult.processed}, successful=${pendingResult.successful}, failed=${pendingResult.failed}, skipped=${pendingResult.skipped}`);

    totalProcessed += pendingResult.processed;
    totalSuccessful += pendingResult.successful;
    totalFailed += pendingResult.failed;
    totalSkipped += pendingResult.skipped;

    // Process retries
    const retryResult = await retryFailedRemovalsBatch(RETRY_BATCH_SIZE);
    console.log(`  Retries: retried=${retryResult.retried}, stillFailed=${retryResult.stillFailed}`);

    // Check if we've exhausted the queue or hit rate limits
    if (pendingResult.processed === 0 && pendingResult.skipped === 0) {
      console.log(`\n✅ Queue exhausted or all brokers at daily limit`);
      break;
    }

    // If everything is being skipped, we've hit rate limits
    if (pendingResult.processed > 0 && pendingResult.successful === 0 && pendingResult.skipped === pendingResult.processed) {
      console.log(`\n⚠️ All removals being skipped (rate limits reached)`);
      break;
    }

    // Brief pause between batches (30 seconds)
    if (batchCount < maxBatches) {
      console.log(`  Waiting 30s before next batch...`);
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }

  // Final stats
  const finalAnalysis = await analyzeQueue();
  const stats = await getAutomationStats();

  console.log("\n" + "═".repeat(70));
  console.log("       PROCESSING COMPLETE");
  console.log("═".repeat(70));
  console.log(`\n📊 RESULTS:`);
  console.log(`  Batches run: ${batchCount}`);
  console.log(`  Total processed: ${totalProcessed}`);
  console.log(`  Successful: ${totalSuccessful}`);
  console.log(`  Failed: ${totalFailed}`);
  console.log(`  Skipped: ${totalSkipped}`);

  console.log(`\n📈 QUEUE STATUS:`);
  console.log(`  Before: ${analysis.totalPending} pending`);
  console.log(`  After: ${finalAnalysis.totalPending} pending`);
  console.log(`  Cleared: ${analysis.totalPending - finalAnalysis.totalPending}`);

  console.log(`\n⚙️ AUTOMATION STATS:`);
  console.log(`  Total removals: ${stats.totalRemovals}`);
  console.log(`  Automation rate: ${stats.automationRate}%`);

  // Recommendations
  if (finalAnalysis.totalPending > 0) {
    console.log(`\n💡 RECOMMENDATIONS:`);

    if (finalAnalysis.stuckRemovals > 0) {
      console.log(`  - ${finalAnalysis.stuckRemovals} removals stuck with 3+ attempts - consider resetting attempts`);
    }

    if (finalAnalysis.requiresManual > 0) {
      console.log(`  - ${finalAnalysis.requiresManual} require manual processing - move to REQUIRES_MANUAL status`);
    }

    const brokersAtLimit = topUsage.filter(([, count]) => count >= 25).length;
    if (brokersAtLimit > 0) {
      console.log(`  - ${brokersAtLimit} brokers at daily limit - run again tomorrow`);
    }

    console.log(`  - Schedule next run in 30-60 minutes for continued processing`);
  } else {
    console.log(`\n🎉 ALL PENDING REMOVALS PROCESSED!`);
  }

  console.log(`\nCompleted: ${new Date().toISOString()}`);
  await prisma.$disconnect();
}

// Also provide a function to reset stuck removals
async function resetStuckRemovals() {
  console.log("\n🔧 Resetting stuck removals (attempts >= 3)...");

  const result = await prisma.removalRequest.updateMany({
    where: {
      status: "PENDING",
      attempts: { gte: 3 },
    },
    data: {
      attempts: 0,
      lastError: null,
      notes: "Attempts reset by queue processor",
    },
  });

  console.log(`  Reset ${result.count} stuck removals`);
  return result.count;
}

// Move non-automatable to REQUIRES_MANUAL
async function markNonAutomatable() {
  console.log("\n🔧 Marking non-automatable removals...");

  const pending = await prisma.removalRequest.findMany({
    where: { status: "PENDING" },
    include: {
      exposure: { select: { source: true } },
    },
  });

  let marked = 0;
  for (const removal of pending) {
    const brokerInfo = getDataBrokerInfo(removal.exposure.source);

    // If no email or opt-out URL, it's not automatable
    if (!brokerInfo?.privacyEmail && !brokerInfo?.optOutUrl) {
      await prisma.removalRequest.update({
        where: { id: removal.id },
        data: {
          status: "REQUIRES_MANUAL",
          method: "MANUAL_GUIDE",
          notes: "No automated removal method available for this broker",
        },
      });
      marked++;
    }
  }

  console.log(`  Marked ${marked} as REQUIRES_MANUAL`);
  return marked;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--reset-stuck")) {
    await resetStuckRemovals();
  }

  if (args.includes("--mark-manual")) {
    await markNonAutomatable();
  }

  await processQueueAggressively();
}

main().catch(console.error);
