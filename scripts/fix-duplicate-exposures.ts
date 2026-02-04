/**
 * Fix Duplicate Exposures
 *
 * Finds and merges duplicate exposures (same user + source).
 * Keeps the most recent exposure, updates removal requests to point to it,
 * and marks older duplicates as REMOVED.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface DuplicateGroup {
  userId: string;
  source: string;
  count: bigint;
  ids: string[];
  statuses: string[];
  createdDates: Date[];
}

async function findDuplicates(): Promise<DuplicateGroup[]> {
  // Find duplicates by userId + source + sourceUrl (same criteria as QA agent)
  const duplicates = await prisma.$queryRaw<DuplicateGroup[]>`
    SELECT
      "userId",
      source,
      COUNT(*) as count,
      array_agg(id ORDER BY "firstFoundAt" DESC) as ids,
      array_agg(status ORDER BY "firstFoundAt" DESC) as statuses,
      array_agg("firstFoundAt" ORDER BY "firstFoundAt" DESC) as "createdDates"
    FROM "Exposure"
    WHERE status NOT IN ('REMOVED', 'WHITELISTED')
      AND "sourceUrl" IS NOT NULL
    GROUP BY "userId", source, "sourceUrl"
    HAVING COUNT(*) > 1
    ORDER BY count DESC
  `;

  return duplicates;
}

async function fixDuplicates(dryRun: boolean = true): Promise<{
  groupsFound: number;
  exposuresMerged: number;
  removalRequestsUpdated: number;
  errors: number;
}> {
  const stats = {
    groupsFound: 0,
    exposuresMerged: 0,
    removalRequestsUpdated: 0,
    errors: 0,
  };

  console.log("=".repeat(80));
  console.log("FIX DUPLICATE EXPOSURES");
  console.log(`Mode: ${dryRun ? "DRY RUN (no changes)" : "LIVE (making changes)"}`);
  console.log("=".repeat(80));
  console.log();

  const duplicates = await findDuplicates();
  stats.groupsFound = duplicates.length;

  if (duplicates.length === 0) {
    console.log("No duplicate exposures found!");
    return stats;
  }

  console.log(`Found ${duplicates.length} duplicate groups\n`);

  for (const group of duplicates) {
    const keepId = group.ids[0]; // Most recent (first in DESC order)
    const removeIds = group.ids.slice(1); // Older duplicates

    console.log(`User: ${group.userId.substring(0, 8)}... | Source: ${group.source}`);
    console.log(`  Keep: ${keepId} (${group.statuses[0]})`);
    console.log(`  Remove: ${removeIds.length} duplicates`);

    if (dryRun) {
      stats.exposuresMerged += removeIds.length;
      continue;
    }

    try {
      // Check if the keep exposure already has a removal request
      const keepHasRemoval = await prisma.removalRequest.findUnique({
        where: { exposureId: keepId },
      });

      // Step 1: Handle removal requests on duplicate exposures
      for (const oldId of removeIds) {
        const oldRemoval = await prisma.removalRequest.findUnique({
          where: { exposureId: oldId },
        });

        if (oldRemoval) {
          if (keepHasRemoval) {
            // Both have removal requests - delete the duplicate one
            await prisma.removalRequest.delete({
              where: { id: oldRemoval.id },
            });
            console.log(`    Deleted duplicate removal request from ${oldId.substring(0, 8)}...`);
            stats.removalRequestsUpdated++;
          } else {
            // Move the removal request to the keep exposure
            await prisma.removalRequest.update({
              where: { id: oldRemoval.id },
              data: { exposureId: keepId },
            });
            console.log(`    Moved removal request from ${oldId.substring(0, 8)}... to ${keepId.substring(0, 8)}...`);
            stats.removalRequestsUpdated++;
          }
        }
      }

      // Step 2: Mark old exposures as REMOVED
      await prisma.exposure.updateMany({
        where: { id: { in: removeIds } },
        data: {
          status: "REMOVED",
          isWhitelisted: false,
        },
      });

      stats.exposuresMerged += removeIds.length;
      console.log(`    ✓ Merged ${removeIds.length} duplicate(s)`);
    } catch (error) {
      stats.errors++;
      console.log(`    ✗ Error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
  }

  console.log();
  console.log("=".repeat(80));
  console.log("SUMMARY");
  console.log("=".repeat(80));
  console.log(`Groups found:           ${stats.groupsFound}`);
  console.log(`Exposures merged:       ${stats.exposuresMerged}`);
  console.log(`Removal requests moved: ${stats.removalRequestsUpdated}`);
  console.log(`Errors:                 ${stats.errors}`);

  return stats;
}

async function main() {
  const args = process.argv.slice(2);
  const isLive = args.includes("--live");

  try {
    await fixDuplicates(!isLive);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
