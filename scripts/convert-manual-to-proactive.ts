/**
 * Convert existing "Manual Review" exposures to proactive opt-out removal requests
 *
 * Instead of asking users to manually check sites, we now automatically
 * send opt-out requests to all brokers proactively.
 *
 * Run with: npx tsx scripts/convert-manual-to-proactive.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function convertManualToProactive() {
  console.log("Converting manual review items to proactive opt-outs...\n");

  // Find all manual review exposures that don't have removal requests yet
  const manualExposures = await prisma.exposure.findMany({
    where: {
      requiresManualAction: true,
      removalRequest: null, // No removal request yet
    },
    select: {
      id: true,
      userId: true,
      source: true,
      sourceName: true,
      sourceUrl: true,
      status: true,
    },
  });

  console.log(`Found ${manualExposures.length} manual review items to convert\n`);

  if (manualExposures.length === 0) {
    console.log("No manual review items to convert.");
    return;
  }

  // Group by user for reporting
  const byUser = new Map<string, number>();
  for (const exp of manualExposures) {
    byUser.set(exp.userId, (byUser.get(exp.userId) || 0) + 1);
  }

  console.log("Items by user:");
  for (const [userId, count] of byUser.entries()) {
    console.log(`  ${userId}: ${count} items`);
  }

  // Convert in batches
  const BATCH_SIZE = 100;
  let converted = 0;

  console.log(`\nConverting ${manualExposures.length} items in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < manualExposures.length; i += BATCH_SIZE) {
    const batch = manualExposures.slice(i, i + BATCH_SIZE);

    // Create removal requests for each exposure
    await prisma.$transaction(
      batch.map((exp) =>
        prisma.removalRequest.create({
          data: {
            userId: exp.userId,
            exposureId: exp.id,
            status: "PENDING",
            method: exp.sourceUrl?.startsWith("mailto:") ? "EMAIL" : "FORM",
            isProactive: true,
            notes: "Converted from manual review to proactive opt-out",
          },
        })
      )
    );

    // Update exposure status to REMOVAL_PENDING and clear manual action flag
    await prisma.exposure.updateMany({
      where: { id: { in: batch.map((e) => e.id) } },
      data: {
        status: "REMOVAL_PENDING",
        requiresManualAction: false,
      },
    });

    converted += batch.length;
    console.log(`  Converted batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} items (total: ${converted})`);
  }

  console.log(`\nConversion complete. Converted ${converted} manual review items to proactive opt-outs.`);

  // Verify
  const remainingManual = await prisma.exposure.count({
    where: { requiresManualAction: true },
  });

  console.log(`Remaining manual review items: ${remainingManual}`);
}

convertManualToProactive()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
