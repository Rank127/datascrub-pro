import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "../src/lib/db";
import { getBestAutomationMethod } from "../src/lib/removers/browser-automation";

async function check() {
  console.log("=".repeat(70));
  console.log("REMOVAL REQUEST STATUS CHECK");
  console.log("=".repeat(70));
  console.log();

  // Get removal request stats by status
  const byStatus = await prisma.removalRequest.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  console.log("Removal Requests by Status:");
  console.log("-".repeat(40));
  let total = 0;
  for (const s of byStatus) {
    console.log(`  ${s.status.padEnd(20)}: ${s._count.id}`);
    total += s._count.id;
  }
  console.log(`  ${"TOTAL".padEnd(20)}: ${total}`);
  console.log();

  // Get removal request stats by method
  const byMethod = await prisma.removalRequest.groupBy({
    by: ["method"],
    _count: { id: true },
  });

  console.log("Removal Requests by Method:");
  console.log("-".repeat(40));
  for (const m of byMethod) {
    console.log(`  ${m.method.padEnd(20)}: ${m._count.id}`);
  }
  console.log();

  // Check REQUIRES_MANUAL requests that might benefit from email fallback
  const manualRequests = await prisma.removalRequest.findMany({
    where: { status: "REQUIRES_MANUAL" },
    include: {
      exposure: { select: { source: true, sourceName: true } },
    },
    take: 30,
  });

  if (manualRequests.length > 0) {
    console.log("REQUIRES_MANUAL requests (candidates for reprocessing with email fallback):");
    console.log("-".repeat(70));

    let canAutomate = 0;
    let stillManual = 0;

    for (const r of manualRequests) {
      const best = getBestAutomationMethod(r.exposure.source);
      const status = best.canAutomate ? "✓ CAN EMAIL" : "✗ MANUAL";
      console.log(`  ${status.padEnd(14)} ${r.exposure.sourceName.padEnd(30)} (${r.exposure.source})`);

      if (best.canAutomate) canAutomate++;
      else stillManual++;
    }

    console.log();
    console.log(`Summary: ${canAutomate} can now be automated via email, ${stillManual} still require manual`);
  } else {
    console.log("No REQUIRES_MANUAL requests found.");
  }
  console.log();

  // Also check FAILED requests
  const failedRequests = await prisma.removalRequest.findMany({
    where: { status: "FAILED" },
    include: {
      exposure: { select: { source: true, sourceName: true } },
    },
    take: 20,
  });

  if (failedRequests.length > 0) {
    console.log("FAILED requests (may be retryable with email):");
    console.log("-".repeat(70));

    for (const r of failedRequests) {
      const best = getBestAutomationMethod(r.exposure.source);
      const status = best.canAutomate ? "✓ CAN RETRY" : "✗ MANUAL";
      console.log(`  ${status.padEnd(14)} ${r.exposure.sourceName.padEnd(30)} (${r.exposure.source})`);
    }
  } else {
    console.log("No FAILED requests found.");
  }

  await prisma.$disconnect();
}

check().catch(console.error);
