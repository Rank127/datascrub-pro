/**
 * Retry Suppressed Removals
 *
 * Finds removal requests that failed due to suppressed emails
 * and resets them to PENDING so they can be retried with updated email addresses
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Brokers with suppressed/bounced emails that were updated
const FIXED_BROKERS = [
  "INFOGROUP",
  "INFOGROUP_DATA",
  "RESEMBLE_AI",
  "PEEKYOU",
  "ORACLE_DATACLOUD",
  "DATALOGIX",
  "BLUEKAI",
  "ORACLE_MARKETING",
  "MR_NUMBER",
  "TRUECALLER",
  "TRUECALLER_IN",
  "CALLERIDTEST",
  "LIVERAMP",
  "LIVERAMP_DATA",
  "READY_PLAYER_ME",
  "NIELSEN",
];

async function retrySupressedRemovals(dryRun: boolean = true) {
  console.log("RETRY SUPPRESSED REMOVALS");
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log("=".repeat(60));

  // Find removal requests for these brokers that are stuck in SUBMITTED or REQUIRES_MANUAL
  const stuckRemovals = await prisma.removalRequest.findMany({
    where: {
      exposure: {
        source: { in: FIXED_BROKERS },
      },
      status: { in: ["SUBMITTED", "REQUIRES_MANUAL"] },
    },
    include: {
      exposure: {
        select: {
          id: true,
          source: true,
          sourceName: true,
        },
      },
    },
  });

  console.log(`\nFound ${stuckRemovals.length} stuck removals for fixed brokers`);

  // Group by source
  const bySource: Record<string, number> = {};
  for (const r of stuckRemovals) {
    const source = r.exposure?.source || "UNKNOWN";
    bySource[source] = (bySource[source] || 0) + 1;
  }

  console.log("\nBy Source:");
  for (const [source, count] of Object.entries(bySource).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${source.padEnd(25)} ${count}`);
  }

  if (dryRun) {
    console.log("\n[DRY RUN] Would reset these to PENDING for retry");
    await prisma.$disconnect();
    return;
  }

  // Reset to PENDING
  console.log("\nResetting to PENDING...");

  let updated = 0;
  let errors = 0;

  for (const removal of stuckRemovals) {
    try {
      await prisma.removalRequest.update({
        where: { id: removal.id },
        data: {
          status: "PENDING",
          notes: `${removal.notes || ""}\n[${new Date().toISOString()}] Reset for retry - email address updated`,
        },
      });
      updated++;
      console.log(`  Reset ${removal.exposure?.source} (${removal.id.substring(0, 8)}...)`);
    } catch (e) {
      errors++;
      console.error(`  Error resetting ${removal.id}:`, e);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log(`Updated: ${updated}`);
  console.log(`Errors: ${errors}`);

  await prisma.$disconnect();
}

const args = process.argv.slice(2);
const isLive = args.includes("--live");
retrySupressedRemovals(!isLive).catch(console.error);
