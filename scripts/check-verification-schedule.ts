import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { getDataBrokerInfo } from "../src/lib/removers/data-broker-directory";

const prisma = new PrismaClient();

async function checkVerificationSchedule() {
  console.log("\n" + "═".repeat(70));
  console.log("           VERIFICATION SCHEDULE ANALYSIS");
  console.log("═".repeat(70));

  const now = new Date();

  // Get removals with their verification schedules
  const removals = await prisma.removalRequest.findMany({
    where: {
      status: { in: ["SUBMITTED", "IN_PROGRESS", "ACKNOWLEDGED"] },
    },
    select: {
      id: true,
      status: true,
      submittedAt: true,
      verifyAfter: true,
      lastVerifiedAt: true,
      verificationCount: true,
      exposure: {
        select: {
          source: true,
          sourceName: true,
        },
      },
    },
    orderBy: { verifyAfter: "asc" },
    take: 100,
  });

  console.log(`\n📊 Analyzing verification schedule for ${removals.length} removals...\n`);

  // Group by verification status
  const dueNow = removals.filter(r => r.verifyAfter && r.verifyAfter <= now);
  const dueWithinWeek = removals.filter(r => {
    if (!r.verifyAfter) return false;
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return r.verifyAfter > now && r.verifyAfter <= weekFromNow;
  });
  const noSchedule = removals.filter(r => !r.verifyAfter);

  console.log(`📋 Verification Schedule:`);
  console.log(`   Due now: ${dueNow.length}`);
  console.log(`   Due within 7 days: ${dueWithinWeek.length}`);
  console.log(`   No schedule set: ${noSchedule.length}`);

  if (dueNow.length > 0) {
    console.log(`\n⏰ REMOVALS DUE FOR VERIFICATION NOW:`);
    for (const r of dueNow.slice(0, 10)) {
      const brokerInfo = getDataBrokerInfo(r.exposure.source);
      console.log(`   - ${brokerInfo?.name || r.exposure.source}`);
      console.log(`     ID: ${r.id}`);
      console.log(`     Submitted: ${r.submittedAt?.toISOString()}`);
      console.log(`     Verify After: ${r.verifyAfter?.toISOString()}`);
      console.log(`     Attempts: ${r.verificationCount}`);
    }
  }

  if (dueWithinWeek.length > 0) {
    console.log(`\n📅 UPCOMING VERIFICATIONS (next 7 days):`);
    const byDate: Record<string, number> = {};
    for (const r of dueWithinWeek) {
      const dateStr = r.verifyAfter!.toLocaleDateString();
      byDate[dateStr] = (byDate[dateStr] || 0) + 1;
    }
    for (const [date, count] of Object.entries(byDate).sort()) {
      console.log(`   ${date}: ${count} removals`);
    }
  }

  // Check for removals that should have verifyAfter set but don't
  console.log(`\n\n🔧 CHECKING REMOVALS WITHOUT VERIFICATION SCHEDULE:`);

  const noScheduleDetails = await prisma.removalRequest.findMany({
    where: {
      status: { in: ["SUBMITTED", "IN_PROGRESS", "ACKNOWLEDGED"] },
      verifyAfter: null,
    },
    select: {
      id: true,
      status: true,
      submittedAt: true,
      exposure: {
        select: {
          source: true,
          sourceName: true,
        },
      },
    },
    take: 20,
  });

  if (noScheduleDetails.length > 0) {
    console.log(`   Found ${noScheduleDetails.length} removals without verification schedule:`);
    for (const r of noScheduleDetails.slice(0, 10)) {
      const brokerInfo = getDataBrokerInfo(r.exposure.source);
      const expectedDays = brokerInfo?.estimatedDays || 30;
      console.log(`   - ${brokerInfo?.name || r.exposure.source} (expected: ${expectedDays} days)`);
      console.log(`     ID: ${r.id}, Submitted: ${r.submittedAt?.toLocaleDateString()}`);
    }

    // Offer to fix these
    console.log(`\n   ⚠️  These removals need verifyAfter dates set!`);
  }

  // Check last verification run
  const lastVerified = await prisma.removalRequest.findFirst({
    where: { lastVerifiedAt: { not: null } },
    orderBy: { lastVerifiedAt: "desc" },
    select: { lastVerifiedAt: true },
  });

  console.log(`\n\n📊 VERIFICATION SYSTEM STATUS:`);
  if (lastVerified?.lastVerifiedAt) {
    const daysSinceVerification = Math.floor(
      (now.getTime() - lastVerified.lastVerifiedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    console.log(`   Last verification run: ${lastVerified.lastVerifiedAt.toISOString()} (${daysSinceVerification} days ago)`);
  } else {
    console.log(`   ⚠️  No verifications have ever been run!`);
  }

  await prisma.$disconnect();
}

checkVerificationSchedule().catch(console.error);
