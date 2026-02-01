import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { getDataBrokerInfo, DATA_BROKER_DIRECTORY } from "../src/lib/removers/data-broker-directory";

const prisma = new PrismaClient();

// Expected processing times by broker (in days)
const EXPECTED_PROCESSING_DAYS: Record<string, number> = {
  TRUEPEOPLESEARCH: 1,
  FASTPEOPLESEARCH: 1,
  SPOKEO: 3,
  WHITEPAGES: 5,
  PEOPLEFINDER: 5,
  BEENVERIFIED: 7,
  INTELIUS: 7,
  RADARIS: 14,
  PIPL: 45,
};

async function analyzeRemovalsByBroker() {
  console.log("\n" + "═".repeat(70));
  console.log("           BROKER REMOVAL ANALYSIS - Checking Broker Processing");
  console.log("═".repeat(70));

  const now = new Date();

  // Get all SUBMITTED removals with their submission dates
  const submittedRemovals = await prisma.removalRequest.findMany({
    where: {
      status: { in: ["SUBMITTED", "ACKNOWLEDGED", "IN_PROGRESS"] },
    },
    include: {
      exposure: {
        select: {
          source: true,
          sourceName: true,
          sourceUrl: true,
          dataType: true,
        },
      },
      user: {
        select: {
          email: true,
          plan: true,
        },
      },
    },
    orderBy: { submittedAt: "asc" },
  });

  console.log(`\n📊 Total Submitted/Acknowledged Removals: ${submittedRemovals.length}`);

  // Analyze by broker
  const brokerAnalysis: Record<string, {
    total: number;
    overdue: number;
    avgDaysWaiting: number;
    oldestSubmission: Date | null;
    samples: Array<{ id: string; submittedAt: Date | null; daysWaiting: number; email: string }>;
  }> = {};

  for (const removal of submittedRemovals) {
    const broker = removal.exposure.source;
    const expectedDays = EXPECTED_PROCESSING_DAYS[broker] || 30;

    if (!brokerAnalysis[broker]) {
      brokerAnalysis[broker] = {
        total: 0,
        overdue: 0,
        avgDaysWaiting: 0,
        oldestSubmission: null,
        samples: [],
      };
    }

    brokerAnalysis[broker].total++;

    if (removal.submittedAt) {
      const daysWaiting = Math.floor((now.getTime() - removal.submittedAt.getTime()) / (1000 * 60 * 60 * 24));

      if (daysWaiting > expectedDays) {
        brokerAnalysis[broker].overdue++;
      }

      // Track oldest
      if (!brokerAnalysis[broker].oldestSubmission || removal.submittedAt < brokerAnalysis[broker].oldestSubmission) {
        brokerAnalysis[broker].oldestSubmission = removal.submittedAt;
      }

      // Keep samples of overdue
      if (daysWaiting > expectedDays && brokerAnalysis[broker].samples.length < 3) {
        brokerAnalysis[broker].samples.push({
          id: removal.id,
          submittedAt: removal.submittedAt,
          daysWaiting,
          email: removal.user.email || "unknown",
        });
      }
    }
  }

  // Calculate averages
  for (const broker of Object.keys(brokerAnalysis)) {
    const brokerRemovals = submittedRemovals.filter(r => r.exposure.source === broker && r.submittedAt);
    if (brokerRemovals.length > 0) {
      const totalDays = brokerRemovals.reduce((sum, r) => {
        return sum + Math.floor((now.getTime() - r.submittedAt!.getTime()) / (1000 * 60 * 60 * 24));
      }, 0);
      brokerAnalysis[broker].avgDaysWaiting = Math.round(totalDays / brokerRemovals.length);
    }
  }

  // Sort by overdue count
  const sortedBrokers = Object.entries(brokerAnalysis)
    .filter(([, data]) => data.overdue > 0)
    .sort((a, b) => b[1].overdue - a[1].overdue);

  console.log(`\n⚠️  OVERDUE REMOVALS BY BROKER (should have been processed by now):`);
  console.log(`${"Broker".padEnd(30)} ${"Total".padStart(6)} ${"Overdue".padStart(8)} ${"Exp Days".padStart(9)} ${"Avg Wait".padStart(9)} ${"Oldest".padStart(12)}`);
  console.log("-".repeat(80));

  for (const [broker, data] of sortedBrokers.slice(0, 20)) {
    const brokerInfo = getDataBrokerInfo(broker);
    const displayName = (brokerInfo?.name || broker).substring(0, 28);
    const expectedDays = EXPECTED_PROCESSING_DAYS[broker] || 30;
    const oldestDate = data.oldestSubmission ? data.oldestSubmission.toLocaleDateString() : "N/A";

    console.log(
      `${displayName.padEnd(30)} ${data.total.toString().padStart(6)} ${data.overdue.toString().padStart(8)} ${(expectedDays + "d").padStart(9)} ${(data.avgDaysWaiting + "d").padStart(9)} ${oldestDate.padStart(12)}`
    );
  }

  // Show sample overdue removals that need attention
  console.log(`\n\n📋 SAMPLE OVERDUE REMOVALS NEEDING ATTENTION:`);
  console.log("-".repeat(80));

  let sampleCount = 0;
  for (const [broker, data] of sortedBrokers) {
    if (data.samples.length > 0 && sampleCount < 15) {
      const brokerInfo = getDataBrokerInfo(broker);
      console.log(`\n${brokerInfo?.name || broker}:`);
      for (const sample of data.samples) {
        console.log(`   ID: ${sample.id}`);
        console.log(`   Submitted: ${sample.submittedAt?.toISOString()} (${sample.daysWaiting} days ago)`);
        console.log(`   User: ${sample.email}`);
        if (brokerInfo?.optOutUrl) {
          console.log(`   Opt-out URL: ${brokerInfo.optOutUrl}`);
        }
        sampleCount++;
        if (sampleCount >= 15) break;
      }
    }
  }

  // Show brokers that ARE completing (if any have completed)
  const completedRemovals = await prisma.removalRequest.findMany({
    where: { status: "COMPLETED" },
    include: {
      exposure: { select: { source: true, sourceName: true } },
    },
  });

  if (completedRemovals.length > 0) {
    console.log(`\n\n✅ COMPLETED REMOVALS BY BROKER:`);
    const completedByBroker: Record<string, number> = {};
    for (const r of completedRemovals) {
      completedByBroker[r.exposure.source] = (completedByBroker[r.exposure.source] || 0) + 1;
    }
    for (const [broker, count] of Object.entries(completedByBroker).sort((a, b) => b[1] - a[1])) {
      const info = getDataBrokerInfo(broker);
      console.log(`   ${info?.name || broker}: ${count}`);
    }
  } else {
    console.log(`\n\n⚠️  NO COMPLETED REMOVALS FOUND`);
    console.log(`   This indicates the verification system is not running or has issues.`);
  }

  // Check verification status
  console.log(`\n\n🔍 VERIFICATION STATUS:`);
  const verificationDue = await prisma.removalRequest.count({
    where: {
      status: { in: ["SUBMITTED", "IN_PROGRESS"] },
      verifyAfter: { lte: now },
    },
  });
  console.log(`   Removals due for verification: ${verificationDue}`);

  const neverVerified = await prisma.removalRequest.count({
    where: {
      status: { in: ["SUBMITTED", "IN_PROGRESS"] },
      lastVerifiedAt: null,
    },
  });
  console.log(`   Never verified: ${neverVerified}`);

  // Summary
  console.log(`\n\n` + "═".repeat(70));
  console.log("           SUMMARY & RECOMMENDATIONS");
  console.log("═".repeat(70));

  const totalOverdue = sortedBrokers.reduce((sum, [, data]) => sum + data.overdue, 0);
  console.log(`\n1. Total overdue removals: ${totalOverdue}`);
  console.log(`2. Brokers with overdue removals: ${sortedBrokers.length}`);

  if (completedRemovals.length === 0) {
    console.log(`\n⚠️  CRITICAL: No removals have been marked as completed.`);
    console.log(`   Recommendations:`);
    console.log(`   - Check the verification cron job is running`);
    console.log(`   - Verify the ENCRYPTION_KEY environment variable is correct`);
    console.log(`   - Run manual verification for a sample of old submissions`);
  }

  await prisma.$disconnect();
}

analyzeRemovalsByBroker().catch(console.error);
