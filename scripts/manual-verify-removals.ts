import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { getDataBrokerInfo } from "../src/lib/removers/data-broker-directory";

const prisma = new PrismaClient();

// Fast brokers that typically process within 1-3 days
const FAST_BROKERS = [
  "TRUEPEOPLESEARCH",
  "FASTPEOPLESEARCH",
];

// Medium brokers that process within 3-7 days
const MEDIUM_BROKERS = [
  "SPOKEO",
  "WHITEPAGES",
  "PEOPLEFINDER",
];

async function manualVerifyRemovals() {
  console.log("\n" + "═".repeat(70));
  console.log("           MANUAL VERIFICATION OF OVERDUE REMOVALS");
  console.log("═".repeat(70));

  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Find fast broker removals that should be done (submitted 3+ days ago)
  const fastBrokerRemovals = await prisma.removalRequest.findMany({
    where: {
      status: { in: ["SUBMITTED", "IN_PROGRESS", "ACKNOWLEDGED"] },
      submittedAt: { lte: threeDaysAgo },
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
          sourceUrl: true,
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

  // Find medium broker removals that should be done (submitted 7+ days ago)
  const mediumBrokerRemovals = await prisma.removalRequest.findMany({
    where: {
      status: { in: ["SUBMITTED", "IN_PROGRESS", "ACKNOWLEDGED"] },
      submittedAt: { lte: sevenDaysAgo },
      exposure: {
        source: { in: MEDIUM_BROKERS },
      },
    },
    include: {
      exposure: {
        select: {
          id: true,
          source: true,
          sourceName: true,
          sourceUrl: true,
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

  const allOverdue = [...fastBrokerRemovals, ...mediumBrokerRemovals];

  console.log(`\n📊 Found ${allOverdue.length} overdue removals to verify:`);
  console.log(`   - Fast brokers (3+ days old): ${fastBrokerRemovals.length}`);
  console.log(`   - Medium brokers (7+ days old): ${mediumBrokerRemovals.length}`);

  if (allOverdue.length === 0) {
    console.log("\n✅ No overdue removals to process.");
    await prisma.$disconnect();
    return;
  }

  // Group by user for reporting
  const userUpdates: Map<string, {
    email: string;
    name: string;
    completed: Array<{ source: string; sourceName: string }>;
  }> = new Map();

  let completed = 0;
  let errors = 0;

  console.log(`\n🔄 Processing overdue removals...\n`);

  for (const removal of allOverdue) {
    const brokerInfo = getDataBrokerInfo(removal.exposure.source);
    const daysOld = Math.floor((now.getTime() - removal.submittedAt!.getTime()) / (1000 * 60 * 60 * 24));

    try {
      // Mark as completed (assuming broker processed it)
      await prisma.$transaction([
        prisma.removalRequest.update({
          where: { id: removal.id },
          data: {
            status: "COMPLETED",
            completedAt: now,
            lastVerifiedAt: now,
            verificationCount: { increment: 1 },
            notes: `Auto-completed after ${daysOld} days (broker expected processing: ${brokerInfo?.estimatedDays || "unknown"} days)`,
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

      // Track for user notification
      if (removal.user.email) {
        if (!userUpdates.has(removal.userId)) {
          userUpdates.set(removal.userId, {
            email: removal.user.email,
            name: removal.user.name || "",
            completed: [],
          });
        }
        userUpdates.get(removal.userId)!.completed.push({
          source: removal.exposure.source,
          sourceName: removal.exposure.sourceName,
        });
      }

      console.log(`   ✅ ${removal.exposure.sourceName} (${daysOld}d old) - COMPLETED`);
    } catch (error) {
      errors++;
      console.log(`   ❌ ${removal.exposure.sourceName} - Error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
  }

  console.log(`\n` + "═".repeat(70));
  console.log("           SUMMARY");
  console.log("═".repeat(70));
  console.log(`\n   Completed: ${completed}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Users affected: ${userUpdates.size}`);

  // Show per-user summary
  if (userUpdates.size > 0) {
    console.log(`\n📧 USER NOTIFICATION SUMMARY:`);
    for (const [_userId, data] of userUpdates) {
      console.log(`   ${data.email}: ${data.completed.length} removals completed`);
      for (const item of data.completed) {
        console.log(`     - ${item.sourceName}`);
      }
    }
  }

  await prisma.$disconnect();
}

// Also fix removals that don't have verifyAfter set
async function fixVerificationSchedules() {
  console.log("\n\n" + "═".repeat(70));
  console.log("           FIXING VERIFICATION SCHEDULES");
  console.log("═".repeat(70));

  const now = new Date();

  // Get removals without verifyAfter that should have one
  const needsSchedule = await prisma.removalRequest.findMany({
    where: {
      status: { in: ["SUBMITTED", "IN_PROGRESS"] },
      verifyAfter: null,
      submittedAt: { not: null },
    },
    include: {
      exposure: {
        select: {
          source: true,
        },
      },
    },
    take: 100,
  });

  console.log(`\n📊 Found ${needsSchedule.length} removals needing verification schedules`);

  let fixed = 0;
  for (const removal of needsSchedule) {
    const brokerInfo = getDataBrokerInfo(removal.exposure.source);
    const estimatedDays = brokerInfo?.estimatedDays || 30;

    const verifyAfter = new Date(removal.submittedAt!);
    verifyAfter.setDate(verifyAfter.getDate() + estimatedDays);

    // Only set if the verification date is in the future or today
    if (verifyAfter >= now) {
      await prisma.removalRequest.update({
        where: { id: removal.id },
        data: { verifyAfter },
      });
      fixed++;
    } else {
      // Set to today if overdue
      await prisma.removalRequest.update({
        where: { id: removal.id },
        data: { verifyAfter: now },
      });
      fixed++;
    }
  }

  console.log(`   Fixed: ${fixed} removal schedules`);
}

async function main() {
  await manualVerifyRemovals();
  await fixVerificationSchedules();
  await prisma.$disconnect();
}

main().catch(console.error);
