import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function analyze() {
  console.log("MANUAL ACTION QUEUE ANALYSIS");
  console.log("=".repeat(60));

  // By source
  const bySource = await prisma.exposure.groupBy({
    by: ["source"],
    where: { requiresManualAction: true, manualActionTaken: false },
    _count: true,
    orderBy: { _count: { source: "desc" } },
  });

  console.log("\nBy Source:");
  for (const s of bySource.slice(0, 20)) {
    console.log("  " + s.source.padEnd(30) + s._count);
  }

  // By status
  const byStatus = await prisma.exposure.groupBy({
    by: ["status"],
    where: { requiresManualAction: true, manualActionTaken: false },
    _count: true,
    orderBy: { _count: { status: "desc" } },
  });

  console.log("\nBy Status:");
  for (const s of byStatus) {
    console.log("  " + s.status.padEnd(25) + s._count);
  }

  // Check if they have removal requests
  const withRemoval = await prisma.exposure.count({
    where: {
      requiresManualAction: true,
      manualActionTaken: false,
      removalRequest: { isNot: null },
    },
  });

  const withoutRemoval = await prisma.exposure.count({
    where: {
      requiresManualAction: true,
      manualActionTaken: false,
      removalRequest: null,
    },
  });

  console.log("\nRemoval Request Status:");
  console.log("  With removal request:    " + withRemoval);
  console.log("  Without removal request: " + withoutRemoval);

  // Check why they're marked manual - sample some records
  const samples = await prisma.exposure.findMany({
    where: { requiresManualAction: true, manualActionTaken: false },
    select: {
      id: true,
      source: true,
      status: true,
      sourceUrl: true,
      confidenceScore: true,
      matchClassification: true,
      removalNotes: true,
    },
    take: 10,
  });

  console.log("\nSample Records (first 10):");
  for (const s of samples) {
    console.log(`  ${s.source.padEnd(25)} | ${s.status.padEnd(20)} | Confidence: ${s.confidenceScore ?? "N/A"}`);
    if (s.removalNotes) console.log(`    Notes: ${s.removalNotes.substring(0, 60)}...`);
  }

  // Check sources that might be automatable (known data brokers with standard removal processes)
  const knownAutomatableBrokers = [
    "TRUEPEOPLESEARCH",
    "FASTPEOPLESEARCH",
    "WHITEPAGES",
    "SPOKEO",
    "BEENVERIFIED",
    "INSTANTCHECKMATE",
    "INTELIUS",
    "USPHONEBOOK",
    "THATSTHEM",
    "RADARIS",
  ];

  const automatableCount = await prisma.exposure.count({
    where: {
      requiresManualAction: true,
      manualActionTaken: false,
      source: { in: knownAutomatableBrokers },
    },
  });

  console.log("\nAutomation Potential:");
  console.log(`  Known automatable brokers: ${automatableCount} exposures`);
  console.log(`  May need manual review:    ${7122 - automatableCount} exposures`);

  await prisma.$disconnect();
}

analyze().catch(console.error);
