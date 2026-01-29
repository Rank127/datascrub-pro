/**
 * Cleanup script to remove fake "potential exposures" created by AllBrokersScanner
 *
 * The AllBrokersScanner was creating 2,100+ "manual check required" items for
 * EVERY broker in the directory, even if the user wasn't actually listed.
 * This overwhelmed users with impossible manual review tasks.
 *
 * This script deletes those fake exposures, keeping only:
 * - Real confirmed exposures from actual scraping
 * - Legitimate manual check items (FastPeopleSearch, PeopleFinders)
 *
 * Run with: npx ts-node scripts/cleanup-fake-exposures.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Legitimate manual check sources (sites with real bot protection)
const LEGITIMATE_MANUAL_SOURCES = [
  "FASTPEOPLESEARCH",
  "PEOPLEFINDER",
  "PEOPLEFINDERS",
];

async function cleanupFakeExposures() {
  console.log("Starting cleanup of fake exposures...\n");

  // Find all fake exposures from AllBrokersScanner
  // These have dataPreview like "Check if listed on X" or "Manual check required"
  const fakeExposures = await prisma.exposure.findMany({
    where: {
      requiresManualAction: true,
      OR: [
        { dataPreview: { contains: "Check if listed on" } },
        { dataPreview: { contains: "Manual check required" } },
      ],
      // Don't delete legitimate manual check sources
      NOT: {
        source: { in: LEGITIMATE_MANUAL_SOURCES },
      },
    },
    select: {
      id: true,
      source: true,
      sourceName: true,
      dataPreview: true,
      userId: true,
    },
  });

  console.log(`Found ${fakeExposures.length} fake exposures to delete\n`);

  if (fakeExposures.length === 0) {
    console.log("No fake exposures found. Database is clean.");
    return;
  }

  // Group by user for reporting
  const byUser = new Map<string, number>();
  const bySource = new Map<string, number>();

  for (const exp of fakeExposures) {
    byUser.set(exp.userId, (byUser.get(exp.userId) || 0) + 1);
    bySource.set(exp.source, (bySource.get(exp.source) || 0) + 1);
  }

  console.log("Fake exposures by user:");
  for (const [userId, count] of byUser.entries()) {
    console.log(`  ${userId}: ${count} items`);
  }

  console.log("\nTop sources with fake exposures:");
  const sortedSources = [...bySource.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
  for (const [source, count] of sortedSources) {
    console.log(`  ${source}: ${count}`);
  }

  // Delete in batches to avoid timeout
  const BATCH_SIZE = 500;
  const ids = fakeExposures.map((e) => e.id);
  let deleted = 0;

  console.log(`\nDeleting ${ids.length} fake exposures in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);

    // First delete any related removal requests
    const removalResult = await prisma.removalRequest.deleteMany({
      where: { exposureId: { in: batch } },
    });
    if (removalResult.count > 0) {
      console.log(`  Deleted ${removalResult.count} related removal requests`);
    }

    // Then delete the exposures
    const result = await prisma.exposure.deleteMany({
      where: { id: { in: batch } },
    });
    deleted += result.count;
    console.log(`  Deleted batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.count} items (total: ${deleted})`);
  }

  console.log(`\nCleanup complete. Deleted ${deleted} fake exposures.`);

  // Verify
  const remaining = await prisma.exposure.count({
    where: {
      requiresManualAction: true,
      OR: [
        { dataPreview: { contains: "Check if listed on" } },
        { dataPreview: { contains: "Manual check required" } },
      ],
      NOT: {
        source: { in: LEGITIMATE_MANUAL_SOURCES },
      },
    },
  });

  console.log(`Remaining fake exposures: ${remaining}`);
}

cleanupFakeExposures()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
