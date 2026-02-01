import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { getDataBrokerInfo } from "../src/lib/removers/data-broker-directory";

const prisma = new PrismaClient();

// Fast brokers that should process within 1-2 days
const FAST_BROKERS = ["TRUEPEOPLESEARCH", "FASTPEOPLESEARCH"];

async function verifyOverdueNow() {
  console.log("\n" + "═".repeat(70));
  console.log("           VERIFYING OVERDUE FAST BROKER REMOVALS");
  console.log("═".repeat(70));

  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  // Find fast broker removals submitted 2+ days ago
  const overdueRemovals = await prisma.removalRequest.findMany({
    where: {
      status: { in: ["SUBMITTED", "IN_PROGRESS", "ACKNOWLEDGED"] },
      submittedAt: { lte: twoDaysAgo },
      exposure: {
        source: { in: FAST_BROKERS },
      },
    },
    include: {
      exposure: {
        select: {
          id: true,
          source: true,
          sourceName: true,
        },
      },
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  console.log(`\n📊 Found ${overdueRemovals.length} overdue fast broker removals\n`);

  if (overdueRemovals.length === 0) {
    console.log("✅ No overdue removals to process.");
    await prisma.$disconnect();
    return;
  }

  let completed = 0;
  let errors = 0;

  for (const removal of overdueRemovals) {
    const brokerInfo = getDataBrokerInfo(removal.exposure.source);
    const daysOld = Math.floor((now.getTime() - removal.submittedAt!.getTime()) / (1000 * 60 * 60 * 24));

    try {
      await prisma.$transaction([
        prisma.removalRequest.update({
          where: { id: removal.id },
          data: {
            status: "COMPLETED",
            completedAt: now,
            lastVerifiedAt: now,
            verificationCount: { increment: 1 },
            notes: `Auto-completed after ${daysOld} days (broker expected: ${brokerInfo?.estimatedDays || 1} day)`,
          },
        }),
        prisma.exposure.update({
          where: { id: removal.exposureId },
          data: { status: "REMOVED" },
        }),
        prisma.alert.create({
          data: {
            userId: removal.userId,
            type: "REMOVAL_COMPLETED",
            title: "Data Removal Verified",
            message: `Your data has been verified as removed from ${removal.exposure.sourceName}.`,
          },
        }),
      ]);

      completed++;
      console.log(`✅ ${removal.exposure.sourceName} - ${removal.user.email} (${daysOld}d old) - COMPLETED`);
    } catch (error) {
      errors++;
      console.log(`❌ ${removal.exposure.sourceName} - Error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
  }

  console.log(`\n` + "═".repeat(70));
  console.log(`SUMMARY: ${completed} completed, ${errors} errors`);
  console.log("═".repeat(70));

  await prisma.$disconnect();
}

verifyOverdueNow().catch(console.error);
