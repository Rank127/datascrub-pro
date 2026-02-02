import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { getDataBrokerInfo } from "../src/lib/removers/data-broker-directory";
import { getEmailQuotaStatus } from "../src/lib/email";
import { getCaptchaSolverStatus } from "../src/lib/removers/captcha-solver";

const prisma = new PrismaClient();

async function checkBlockers() {
  console.log("\n" + "═".repeat(60));
  console.log("           QUEUE BLOCKER ANALYSIS");
  console.log("═".repeat(60));

  // Check email quota
  const emailQuota = getEmailQuotaStatus();
  console.log("\n📧 EMAIL QUOTA:");
  console.log(`  Sent today: ${emailQuota.sent}/${emailQuota.limit}`);
  console.log(`  Remaining: ${emailQuota.remaining}`);
  console.log(`  Status: ${emailQuota.remaining > 0 ? "✅ Available" : "❌ Exhausted"}`);

  // Check captcha solver
  const captchaStatus = await getCaptchaSolverStatus();
  console.log("\n🔐 CAPTCHA SOLVER:");
  console.log(`  Provider: ${captchaStatus.provider}`);
  console.log(`  Enabled: ${captchaStatus.enabled ? "✅ Yes" : "❌ No"}`);
  if (captchaStatus.balance !== null) {
    console.log(`  Balance: $${captchaStatus.balance.toFixed(2)}`);
  }

  // Get pending removals
  const pending = await prisma.removalRequest.findMany({
    where: { status: "PENDING" },
    include: {
      exposure: { select: { source: true, sourceName: true } },
    },
  });

  console.log(`\n📋 PENDING REMOVALS: ${pending.length}`);

  // Analyze why each might be blocked
  const blockers = {
    noEmail: 0,
    noOptOut: 0,
    hasEmail: 0,
    hasOptOut: 0,
    requiresCaptcha: 0,
  };

  const byBroker: Record<string, { count: number; hasEmail: boolean; hasOptOut: boolean }> = {};

  for (const removal of pending) {
    const broker = removal.exposure.source;
    const info = getDataBrokerInfo(broker);

    if (!byBroker[broker]) {
      byBroker[broker] = {
        count: 0,
        hasEmail: !!info?.privacyEmail,
        hasOptOut: !!info?.optOutUrl,
      };
    }
    byBroker[broker].count++;

    if (info?.privacyEmail) {
      blockers.hasEmail++;
    } else {
      blockers.noEmail++;
    }

    if (info?.optOutUrl) {
      blockers.hasOptOut++;
      // Check if opt-out might require captcha
      if (info.optOutUrl.includes("captcha") || info.name?.toLowerCase().includes("captcha")) {
        blockers.requiresCaptcha++;
      }
    } else {
      blockers.noOptOut++;
    }
  }

  console.log("\n📊 REMOVAL METHODS:");
  console.log(`  Has privacy email: ${blockers.hasEmail}`);
  console.log(`  No privacy email: ${blockers.noEmail}`);
  console.log(`  Has opt-out URL: ${blockers.hasOptOut}`);
  console.log(`  No opt-out URL: ${blockers.noOptOut}`);

  // Show top brokers
  const sortedBrokers = Object.entries(byBroker)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 15);

  console.log("\n🏢 TOP PENDING BROKERS:");
  for (const [broker, data] of sortedBrokers) {
    const info = getDataBrokerInfo(broker);
    const methods: string[] = [];
    if (data.hasEmail) methods.push("EMAIL");
    if (data.hasOptOut) methods.push("OPT-OUT");
    if (methods.length === 0) methods.push("NONE");

    console.log(`  ${(info?.name || broker).padEnd(35)} ${data.count.toString().padStart(3)} [${methods.join(", ")}]`);
  }

  // Check email queue
  const queuedEmails = await prisma.emailQueue.count({
    where: { status: "PENDING" },
  });

  console.log(`\n📬 EMAIL QUEUE: ${queuedEmails} emails waiting`);

  // Check broker usage today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySubmissions = await prisma.removalRequest.findMany({
    where: {
      status: { in: ["SUBMITTED", "ACKNOWLEDGED", "COMPLETED"] },
      submittedAt: { gte: today },
    },
    include: {
      exposure: { select: { source: true } },
    },
  });

  const brokerUsage: Record<string, number> = {};
  for (const sub of todaySubmissions) {
    const broker = sub.exposure.source;
    brokerUsage[broker] = (brokerUsage[broker] || 0) + 1;
  }

  const brokersAtLimit = Object.entries(brokerUsage).filter(([, count]) => count >= 25);

  console.log(`\n⚡ BROKER RATE LIMITS:`);
  console.log(`  Brokers used today: ${Object.keys(brokerUsage).length}`);
  console.log(`  Brokers at daily limit (25): ${brokersAtLimit.length}`);

  if (brokersAtLimit.length > 0) {
    console.log("  At limit:");
    for (const [broker, count] of brokersAtLimit) {
      const info = getDataBrokerInfo(broker);
      console.log(`    - ${info?.name || broker}: ${count}/25`);
    }
  }

  // Diagnosis
  console.log("\n" + "═".repeat(60));
  console.log("           DIAGNOSIS");
  console.log("═".repeat(60));

  if (emailQuota.remaining === 0) {
    console.log("\n❌ EMAIL QUOTA EXHAUSTED");
    console.log("   - Wait until tomorrow for quota reset");
    console.log("   - Or increase DAILY_EMAIL_LIMIT in .env.local");
  }

  if (blockers.noEmail > 0 && blockers.noOptOut > 0) {
    const noMethod = pending.filter(r => {
      const info = getDataBrokerInfo(r.exposure.source);
      return !info?.privacyEmail && !info?.optOutUrl;
    }).length;

    if (noMethod > 0) {
      console.log(`\n⚠️ ${noMethod} items have NO removal method`);
      console.log("   - These should be marked as REQUIRES_MANUAL");
      console.log("   - Run with --mark-manual flag");
    }
  }

  if (queuedEmails > 0) {
    console.log(`\n📬 ${queuedEmails} emails in queue waiting to be sent`);
    console.log("   - These will be sent when email quota resets");
  }

  await prisma.$disconnect();
  console.log("\n");
}

checkBlockers().catch(console.error);
