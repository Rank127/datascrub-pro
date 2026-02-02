import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkStatus() {
  const statuses = await prisma.removalRequest.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  console.log("\nRemoval Request Status Counts:");
  for (const row of statuses) {
    console.log(`  ${row.status}: ${row._count.id}`);
  }

  // Check pending items' methods
  const pendingMethods = await prisma.removalRequest.groupBy({
    by: ["method"],
    where: { status: "PENDING" },
    _count: { id: true },
  });

  console.log("\nPending Items by Method:");
  for (const row of pendingMethods) {
    console.log(`  ${row.method || "NULL"}: ${row._count.id}`);
  }

  // Check items with high attempts (potential issues)
  const highAttempts = await prisma.removalRequest.findMany({
    where: { attempts: { gte: 3 } },
    include: { exposure: { select: { source: true, sourceName: true } } },
    orderBy: { attempts: "desc" },
    take: 20,
  });

  if (highAttempts.length > 0) {
    console.log("\nHigh Attempt Items (3+ attempts):");
    for (const item of highAttempts) {
      console.log(`  ${item.exposure.sourceName} [${item.status}]: ${item.attempts} attempts`);
      if (item.lastError) {
        console.log(`    Error: ${item.lastError.substring(0, 80)}...`);
      }
    }
  }

  // Check REQUIRES_MANUAL breakdown by source
  const manualBySource = await prisma.removalRequest.groupBy({
    by: ["exposureId"],
    where: { status: "REQUIRES_MANUAL" },
    _count: { id: true },
  });

  if (manualBySource.length > 0) {
    const exposureIds = manualBySource.map(m => m.exposureId);
    const exposures = await prisma.exposure.findMany({
      where: { id: { in: exposureIds } },
      select: { id: true, source: true },
    });

    const sourceMap = new Map(exposures.map(e => [e.id, e.source]));
    const bySource: Record<string, number> = {};

    for (const m of manualBySource) {
      const source = sourceMap.get(m.exposureId) || "UNKNOWN";
      bySource[source] = (bySource[source] || 0) + m._count.id;
    }

    const sorted = Object.entries(bySource).sort((a, b) => b[1] - a[1]).slice(0, 15);

    console.log("\nREQUIRES_MANUAL by Source (top 15):");
    for (const [source, count] of sorted) {
      console.log(`  ${source}: ${count}`);
    }
  }

  await prisma.$disconnect();
}

checkStatus().catch(console.error);
