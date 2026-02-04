import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "../src/lib/db";
import { getBestAutomationMethod } from "../src/lib/removers/browser-automation";
import { getDataBrokerInfo } from "../src/lib/removers/data-broker-directory";

async function check() {
  const failed = await prisma.removalRequest.findMany({
    where: { status: "FAILED" },
    include: {
      exposure: { select: { source: true, sourceName: true } },
    },
  });

  console.log("FAILED Removal Requests Analysis:");
  console.log("=".repeat(70));
  console.log(`Total failed: ${failed.length}`);

  for (const req of failed) {
    const best = getBestAutomationMethod(req.exposure.source);
    const broker = getDataBrokerInfo(req.exposure.source);

    console.log();
    console.log(`Source: ${req.exposure.sourceName} (${req.exposure.source})`);
    console.log(`  Method: ${req.method}`);
    console.log(`  Attempts: ${req.attempts}`);
    console.log(`  Last Error: ${req.lastError || "N/A"}`);
    console.log(`  Best automation: ${best.method} (${best.reason})`);
    console.log(`  Has privacy email: ${broker?.privacyEmail || "N/A"}`);
  }

  await prisma.$disconnect();
}

check().catch(console.error);
