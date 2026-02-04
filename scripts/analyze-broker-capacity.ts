import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function analyze() {
  console.log("BROKER CAPACITY ANALYSIS");
  console.log("=".repeat(60));

  // Count unique brokers in pending queue
  const pendingWithExposures = await prisma.removalRequest.findMany({
    where: { status: "PENDING" },
    select: { exposure: { select: { source: true } } },
    take: 10000,
  });

  const uniqueSources = new Set(pendingWithExposures.map((r) => r.exposure.source));

  // Count submissions today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const submittedToday = await prisma.removalRequest.count({
    where: {
      status: { in: ["SUBMITTED", "ACKNOWLEDGED", "COMPLETED"] },
      submittedAt: { gte: today },
    },
  });

  // Count by broker today
  const byBrokerToday = await prisma.$queryRaw<Array<{ source: string; count: bigint }>>`
    SELECT e.source, COUNT(*) as count
    FROM "RemovalRequest" r
    JOIN "Exposure" e ON r."exposureId" = e.id
    WHERE r.status IN ('SUBMITTED', 'ACKNOWLEDGED', 'COMPLETED')
      AND r."submittedAt" >= ${today}
    GROUP BY e.source
    ORDER BY count DESC
    LIMIT 20
  `;

  console.log("\nUnique brokers in pending queue: " + uniqueSources.size);
  console.log("Submitted today: " + submittedToday);

  console.log("\nTop brokers submitted today:");
  for (const b of byBrokerToday) {
    console.log(`  ${b.source.padEnd(30)} ${b.count}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("CURRENT LIMITS:");
  console.log("  MAX_REQUESTS_PER_BROKER_PER_DAY: 25");
  console.log("  MIN_MINUTES_BETWEEN_SAME_BROKER: 15 min");
  console.log("  Batch size: 500 pending + 100 retry");

  console.log("\n" + "=".repeat(60));
  console.log("CAPACITY CALCULATIONS:");
  console.log(`  Theoretical max (${uniqueSources.size} brokers × 25/day): ${uniqueSources.size * 25} emails/day`);
  console.log("  Actual batch limit (6 batches × 500): 3,000 emails/day");
  console.log("  Resend Pro limit: 50,000/month ≈ 1,667/day");

  console.log("\n" + "=".repeat(60));
  console.log("RECOMMENDED AGGRESSIVE SETTINGS:");
  console.log("  MAX_REQUESTS_PER_BROKER_PER_DAY: 100 (4x increase)");
  console.log("  MIN_MINUTES_BETWEEN_SAME_BROKER: 2 min (7.5x faster)");
  console.log("  Batch size: 1000 pending + 200 retry (2x increase)");
  console.log("  Run frequency: Every 2 hours instead of 4 hours");
  console.log("");
  console.log("  This would allow: ~12,000 emails/day (within Resend limits)");
  console.log("  Backlog clearance: ~6,400 / 1,000 per batch = ~7 batches = 1 day");

  await prisma.$disconnect();
}

analyze().catch(console.error);
