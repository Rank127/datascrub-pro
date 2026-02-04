/**
 * Test Auto-Process Manual Queue
 *
 * Simulates the cron job logic to show what would be processed.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Sources to EXCLUDE (data processors handled separately)
const EXCLUDED_SOURCES = [
  "SYNDIGO", "POWERREVIEWS", "1WORLDSYNC", "SALSIFY", "AKENEO",
  "RIVERSAND", "STIBO", "CONTENTSERV", "INFORMATICA_MDM", "TIBCO_MDM",
  "INRIVER", "PIMCORE", "SALES_LAYER", "PLYTIX", "CATSY",
  "EGGHEADS", "PROFISEE", "SEMARCHY",
];

const AUTO_PROCESS_MIN_CONFIDENCE = 30; // Lower threshold - all scanner sources are validated
const BATCH_SIZE = 200;

async function test(dryRun: boolean = true) {
  console.log("AUTO-PROCESS MANUAL QUEUE TEST");
  console.log(`Mode: ${dryRun ? "DRY RUN (no changes)" : "LIVE (making changes)"}`);
  console.log("=".repeat(70));

  // Current manual queue stats
  const totalManualQueue = await prisma.exposure.count({
    where: { requiresManualAction: true, manualActionTaken: false },
  });

  console.log(`\nCurrent Manual Queue: ${totalManualQueue} exposures`);

  // What would be auto-processed (all sources except excluded, with confidence >= threshold or null)
  const autoProcessable = await prisma.exposure.count({
    where: {
      requiresManualAction: true,
      manualActionTaken: false,
      status: "ACTIVE",
      source: { notIn: EXCLUDED_SOURCES },
      removalRequest: null,
      OR: [
        { confidenceScore: { gte: AUTO_PROCESS_MIN_CONFIDENCE } },
        { confidenceScore: null },
      ],
    },
  });

  console.log(`Auto-Processable (all except excluded): ${autoProcessable}`);

  // Breakdown by source (top 20)
  const bySource = await prisma.exposure.groupBy({
    by: ["source"],
    where: {
      requiresManualAction: true,
      manualActionTaken: false,
      status: "ACTIVE",
      source: { notIn: EXCLUDED_SOURCES },
      removalRequest: null,
      OR: [
        { confidenceScore: { gte: AUTO_PROCESS_MIN_CONFIDENCE } },
        { confidenceScore: null },
      ],
    },
    _count: true,
    orderBy: { _count: { source: "desc" } },
  });

  console.log("\nBy Source (Top 20):");
  for (const s of bySource.slice(0, 20)) {
    console.log(`  ${s.source.padEnd(30)} ${s._count}`);
  }
  console.log(`  ... (${bySource.length} unique sources total)`);

  // What would remain
  const remainAfterAuto = await prisma.exposure.count({
    where: {
      requiresManualAction: true,
      manualActionTaken: false,
      OR: [
        { source: { in: EXCLUDED_SOURCES } }, // Excluded/data processors
        {
          AND: [
            { source: { notIn: EXCLUDED_SOURCES } },
            { confidenceScore: { lt: AUTO_PROCESS_MIN_CONFIDENCE } },
            { NOT: { confidenceScore: null } },
          ],
        }, // Very low confidence
        {
          AND: [
            { source: { notIn: EXCLUDED_SOURCES } },
            { status: { not: "ACTIVE" } },
          ],
        }, // Already in progress
        {
          AND: [
            { source: { notIn: EXCLUDED_SOURCES } },
            { removalRequest: { isNot: null } },
          ],
        }, // Already has removal
      ],
    },
  });

  console.log(`\nWould remain in manual queue: ${remainAfterAuto}`);
  console.log(`Reduction: ${totalManualQueue} -> ${remainAfterAuto} (${Math.round((1 - remainAfterAuto / totalManualQueue) * 100)}% reduction)`);

  // Low confidence exposures that need manual review
  const lowConfidence = await prisma.exposure.count({
    where: {
      requiresManualAction: true,
      manualActionTaken: false,
      confidenceScore: { lt: AUTO_PROCESS_MIN_CONFIDENCE },
      NOT: { confidenceScore: null },
    },
  });
  console.log(`\nLow confidence (<${AUTO_PROCESS_MIN_CONFIDENCE}) requiring review: ${lowConfidence}`);

  // Live mode - actually process
  if (!dryRun) {
    console.log("\n" + "=".repeat(70));
    console.log("PROCESSING...");
    console.log("=".repeat(70));

    const exposures = await prisma.exposure.findMany({
      where: {
        requiresManualAction: true,
        manualActionTaken: false,
        status: "ACTIVE",
        source: { notIn: EXCLUDED_SOURCES },
        removalRequest: null,
        OR: [
          { confidenceScore: { gte: AUTO_PROCESS_MIN_CONFIDENCE } },
          { confidenceScore: null },
        ],
      },
      select: {
        id: true,
        userId: true,
        source: true,
        sourceName: true,
        confidenceScore: true,
      },
      take: BATCH_SIZE,
      orderBy: { firstFoundAt: "asc" },
    });

    let created = 0;
    let errors = 0;

    for (const exposure of exposures) {
      try {
        await prisma.$transaction([
          prisma.removalRequest.create({
            data: {
              userId: exposure.userId,
              exposureId: exposure.id,
              status: "PENDING",
              method: "AUTO_EMAIL",
              isProactive: false,
              notes: `Auto-processed from manual queue. Source: ${exposure.source}. Confidence: ${exposure.confidenceScore ?? 'legacy'}.`,
            },
          }),
          prisma.exposure.update({
            where: { id: exposure.id },
            data: {
              status: "REMOVAL_PENDING",
              manualActionTaken: true,
              manualActionTakenAt: new Date(),
              userConfirmed: true,
              userConfirmedAt: new Date(),
            },
          }),
        ]);
        created++;
        console.log(`  Created removal for ${exposure.source} (${exposure.id.substring(0, 8)}...)`);
      } catch (e) {
        errors++;
        console.error(`  Error for ${exposure.id}:`, e);
      }
    }

    console.log(`\nProcessed: ${exposures.length}, Created: ${created}, Errors: ${errors}`);

    // New manual queue count
    const newTotal = await prisma.exposure.count({
      where: { requiresManualAction: true, manualActionTaken: false },
    });
    console.log(`New manual queue size: ${newTotal}`);
  }

  await prisma.$disconnect();
}

const args = process.argv.slice(2);
const isLive = args.includes("--live");
test(!isLive).catch(console.error);
