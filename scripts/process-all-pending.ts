/**
 * Process ALL pending removals for ALL users with the new automation logic
 *
 * This ensures every user benefits from the email fallback enhancement.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "../src/lib/db";
import { getBestAutomationMethod } from "../src/lib/removers/browser-automation";
import { processPendingRemovalsBatch, retryFailedRemovalsBatch } from "../src/lib/removers/removal-service";

async function processAll() {
  console.log("=".repeat(70));
  console.log("PROCESS ALL PENDING REMOVALS FOR ALL USERS");
  console.log("=".repeat(70));
  console.log();

  // Get overview of all pending requests
  const pendingByUser = await prisma.removalRequest.groupBy({
    by: ["userId"],
    where: { status: "PENDING" },
    _count: { id: true },
  });

  console.log(`Users with pending removals: ${pendingByUser.length}`);
  console.log(`Total pending requests: ${pendingByUser.reduce((sum, u) => sum + u._count.id, 0)}`);
  console.log();

  // Get breakdown by method
  const pendingByMethod = await prisma.removalRequest.groupBy({
    by: ["method"],
    where: { status: "PENDING" },
    _count: { id: true },
  });

  console.log("Pending by Method:");
  console.log("-".repeat(40));
  for (const m of pendingByMethod) {
    console.log(`  ${m.method.padEnd(20)}: ${m._count.id}`);
  }
  console.log();

  // Check which pending FORM requests can now use email
  const pendingFormRequests = await prisma.removalRequest.findMany({
    where: {
      status: "PENDING",
      method: { in: ["FORM", "AUTO_FORM"] },
    },
    include: {
      exposure: { select: { source: true, sourceName: true } },
    },
  });

  let canUseEmail = 0;
  let mustBeManual = 0;
  const bySource = new Map<string, { canEmail: number; manual: number }>();

  for (const req of pendingFormRequests) {
    const best = getBestAutomationMethod(req.exposure.source);
    const source = req.exposure.source;

    if (!bySource.has(source)) {
      bySource.set(source, { canEmail: 0, manual: 0 });
    }

    if (best.canAutomate && best.method === "EMAIL") {
      canUseEmail++;
      bySource.get(source)!.canEmail++;
    } else {
      mustBeManual++;
      bySource.get(source)!.manual++;
    }
  }

  console.log("Pending FORM requests analysis:");
  console.log("-".repeat(50));
  console.log(`  Can fallback to email: ${canUseEmail}`);
  console.log(`  Must be manual:        ${mustBeManual}`);
  console.log();

  if (canUseEmail > 0) {
    console.log("Sources that can use email fallback:");
    for (const [source, counts] of bySource) {
      if (counts.canEmail > 0) {
        console.log(`  ${source.padEnd(30)}: ${counts.canEmail} requests`);
      }
    }
    console.log();

    // Update these requests to use AUTO_EMAIL method
    console.log("Updating FORM requests to AUTO_EMAIL where email is available...");

    for (const req of pendingFormRequests) {
      const best = getBestAutomationMethod(req.exposure.source);
      if (best.canAutomate && best.method === "EMAIL") {
        await prisma.removalRequest.update({
          where: { id: req.id },
          data: { method: "AUTO_EMAIL" },
        });
      }
    }
    console.log(`Updated ${canUseEmail} requests to AUTO_EMAIL`);
    console.log();
  }

  // Now process all pending removals in batches
  console.log("=".repeat(70));
  console.log("PROCESSING PENDING REMOVALS");
  console.log("=".repeat(70));
  console.log();

  let totalProcessed = 0;
  let totalSuccessful = 0;
  let totalFailed = 0;
  let batchNum = 0;
  const maxBatches = 10; // Process up to 10 batches (200 removals)

  while (batchNum < maxBatches) {
    batchNum++;
    console.log(`\nBatch ${batchNum}/${maxBatches}:`);
    console.log("-".repeat(40));

    const result = await processPendingRemovalsBatch(20);

    totalProcessed += result.processed;
    totalSuccessful += result.successful;
    totalFailed += result.failed;

    console.log(`  Processed: ${result.processed}`);
    console.log(`  Successful: ${result.successful}`);
    console.log(`  Failed: ${result.failed}`);
    console.log(`  Skipped: ${result.skipped}`);

    // If no more pending, stop
    if (result.processed === 0) {
      console.log("\nNo more pending removals to process.");
      break;
    }

    // Small delay between batches
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  // Also retry failed removals
  console.log();
  console.log("=".repeat(70));
  console.log("RETRYING FAILED REMOVALS");
  console.log("=".repeat(70));

  const retryResult = await retryFailedRemovalsBatch(20);
  console.log(`  Retried: ${retryResult.retried}`);
  console.log(`  Still failed: ${retryResult.stillFailed}`);

  // Final summary
  console.log();
  console.log("=".repeat(70));
  console.log("FINAL SUMMARY");
  console.log("=".repeat(70));
  console.log(`  Total processed: ${totalProcessed}`);
  console.log(`  Total successful: ${totalSuccessful}`);
  console.log(`  Total failed: ${totalFailed}`);
  console.log(`  Retried: ${retryResult.retried}`);

  // Get final stats
  const finalStats = await prisma.removalRequest.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  console.log();
  console.log("Current Status Distribution:");
  console.log("-".repeat(40));
  for (const s of finalStats) {
    console.log(`  ${s.status.padEnd(20)}: ${s._count.id}`);
  }

  await prisma.$disconnect();
}

processAll().catch(console.error);
