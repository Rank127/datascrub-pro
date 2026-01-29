import { PrismaClient } from "@prisma/client";
import { getDataBrokerInfo } from "../src/lib/removers/data-broker-directory";

const prisma = new PrismaClient();

async function testAutomation() {
  // Get all REQUIRES_MANUAL removal requests
  const manualRemovals = await prisma.removalRequest.findMany({
    where: { status: "REQUIRES_MANUAL" },
    select: {
      id: true,
      method: true,
      exposure: {
        select: {
          source: true,
          sourceName: true,
        },
      },
    },
  });

  console.log(`Total REQUIRES_MANUAL removals: ${manualRemovals.length}`);

  let canAutomate = 0;
  let cannotAutomate = 0;
  const sourceStats: Record<string, { canAutomate: number; cannotAutomate: number; reason?: string }> = {};

  for (const removal of manualRemovals) {
    const source = removal.exposure.source;
    const brokerInfo = getDataBrokerInfo(source);

    if (!sourceStats[source]) {
      sourceStats[source] = { canAutomate: 0, cannotAutomate: 0 };
    }

    if (brokerInfo) {
      const supportsEmail = brokerInfo.removalMethod === "EMAIL" || brokerInfo.removalMethod === "BOTH";
      if (supportsEmail && brokerInfo.privacyEmail) {
        canAutomate++;
        sourceStats[source].canAutomate++;
      } else {
        cannotAutomate++;
        sourceStats[source].cannotAutomate++;
        sourceStats[source].reason = !supportsEmail
          ? `removalMethod is ${brokerInfo.removalMethod}`
          : "no privacyEmail";
      }
    } else {
      cannotAutomate++;
      sourceStats[source].cannotAutomate++;
      sourceStats[source].reason = "not in broker directory";
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`  Can automate: ${canAutomate}`);
  console.log(`  Cannot automate: ${cannotAutomate}`);

  // Show sources that can be automated
  const automatable = Object.entries(sourceStats)
    .filter(([, s]) => s.canAutomate > 0)
    .sort((a, b) => b[1].canAutomate - a[1].canAutomate);

  if (automatable.length > 0) {
    console.log(`\n=== Sources that CAN be automated (${automatable.length} sources) ===`);
    for (const [source, stats] of automatable.slice(0, 30)) {
      const broker = getDataBrokerInfo(source);
      console.log(`  ${source}: ${stats.canAutomate} → ${broker?.privacyEmail}`);
    }
  }

  // Show top sources that cannot be automated
  const notAutomatable = Object.entries(sourceStats)
    .filter(([, s]) => s.cannotAutomate > 0 && s.canAutomate === 0)
    .sort((a, b) => b[1].cannotAutomate - a[1].cannotAutomate);

  if (notAutomatable.length > 0) {
    console.log(`\n=== Top sources that CANNOT be automated (${notAutomatable.length} sources) ===`);
    for (const [source, stats] of notAutomatable.slice(0, 15)) {
      console.log(`  ${source}: ${stats.cannotAutomate} (${stats.reason})`);
    }
  }

  await prisma.$disconnect();
}

testAutomation().catch(console.error);
