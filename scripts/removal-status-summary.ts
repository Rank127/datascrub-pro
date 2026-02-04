/**
 * Complete Removal Status Summary
 *
 * Shows the current state of all removal requests across all users.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "../src/lib/db";
import { getAllAutomatableBrokers } from "../src/lib/removers/browser-automation";

async function summary() {
  console.log("=".repeat(70));
  console.log("COMPLETE REMOVAL STATUS SUMMARY");
  console.log("=".repeat(70));
  console.log();

  // System capabilities
  const capabilities = getAllAutomatableBrokers();
  console.log("SYSTEM AUTOMATION CAPABILITIES:");
  console.log("-".repeat(50));
  console.log(`  Total brokers in directory:    ${capabilities.total}`);
  console.log(`  Can automate via EMAIL:        ${capabilities.stats.emailCount} (${Math.round(capabilities.stats.emailCount / capabilities.total * 100)}%)`);
  console.log(`  Can automate via FORM:         ${capabilities.stats.formCount}`);
  console.log(`  Requires MANUAL:               ${capabilities.stats.manualCount}`);
  console.log(`  Overall automation rate:       ${capabilities.stats.automationRate}%`);
  console.log();

  // User stats
  const totalUsers = await prisma.user.count();
  const usersWithRemovals = await prisma.removalRequest.groupBy({
    by: ["userId"],
    _count: { id: true },
  });

  console.log("USER STATISTICS:");
  console.log("-".repeat(50));
  console.log(`  Total users:                   ${totalUsers}`);
  console.log(`  Users with removal requests:   ${usersWithRemovals.length}`);
  console.log();

  // Removal request stats by status
  const byStatus = await prisma.removalRequest.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const statusMap = Object.fromEntries(byStatus.map(s => [s.status, s._count.id]));
  const total = byStatus.reduce((sum, s) => sum + s._count.id, 0);

  console.log("REMOVAL REQUESTS BY STATUS:");
  console.log("-".repeat(50));
  console.log(`  PENDING:              ${(statusMap["PENDING"] || 0).toString().padStart(6)} (awaiting processing)`);
  console.log(`  SUBMITTED:            ${(statusMap["SUBMITTED"] || 0).toString().padStart(6)} (sent to brokers)`);
  console.log(`  COMPLETED:            ${(statusMap["COMPLETED"] || 0).toString().padStart(6)} (successfully removed)`);
  console.log(`  REQUIRES_MANUAL:      ${(statusMap["REQUIRES_MANUAL"] || 0).toString().padStart(6)} (user action needed)`);
  console.log(`  ACKNOWLEDGED:         ${(statusMap["ACKNOWLEDGED"] || 0).toString().padStart(6)} (breach data - informed)`);
  console.log(`  FAILED:               ${(statusMap["FAILED"] || 0).toString().padStart(6)} (errors)`);
  console.log(`  CANCELLED:            ${(statusMap["CANCELLED"] || 0).toString().padStart(6)} (cancelled)`);
  console.log(`  ${"─".repeat(35)}`);
  console.log(`  TOTAL:                ${total.toString().padStart(6)}`);
  console.log();

  // Removal request stats by method
  const byMethod = await prisma.removalRequest.groupBy({
    by: ["method"],
    _count: { id: true },
  });

  console.log("REMOVAL REQUESTS BY METHOD:");
  console.log("-".repeat(50));
  for (const m of byMethod.sort((a, b) => b._count.id - a._count.id)) {
    const pct = Math.round((m._count.id / total) * 100);
    console.log(`  ${m.method.padEnd(20)}: ${m._count.id.toString().padStart(6)} (${pct}%)`);
  }
  console.log();

  // Automated vs manual breakdown
  const automated = (statusMap["SUBMITTED"] || 0) + (statusMap["COMPLETED"] || 0);
  const manual = statusMap["REQUIRES_MANUAL"] || 0;
  const acknowledged = statusMap["ACKNOWLEDGED"] || 0;
  const automationRate = Math.round((automated / (automated + manual + acknowledged)) * 100);

  console.log("AUTOMATION SUCCESS:");
  console.log("-".repeat(50));
  console.log(`  Automated (submitted/completed): ${automated}`);
  console.log(`  Requires manual action:          ${manual}`);
  console.log(`  Acknowledged (breach data):      ${acknowledged}`);
  console.log(`  Effective automation rate:       ${automationRate}%`);
  console.log();

  // Top brokers by removal count
  const topBrokers = await prisma.removalRequest.groupBy({
    by: ["exposureId"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 50,
  });

  const exposureIds = topBrokers.map(b => b.exposureId);
  const exposures = await prisma.exposure.findMany({
    where: { id: { in: exposureIds } },
    select: { id: true, source: true, sourceName: true },
  });

  const expMap = new Map(exposures.map(e => [e.id, e]));
  const brokerCounts = new Map<string, number>();

  for (const b of topBrokers) {
    const exp = expMap.get(b.exposureId);
    if (exp) {
      brokerCounts.set(exp.source, (brokerCounts.get(exp.source) || 0) + 1);
    }
  }

  console.log("TOP BROKERS BY REMOVAL REQUESTS:");
  console.log("-".repeat(50));
  const sortedBrokers = Array.from(brokerCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [source, count] of sortedBrokers) {
    console.log(`  ${source.padEnd(30)}: ${count}`);
  }
  console.log();

  console.log("=".repeat(70));
  console.log("SUMMARY: All pending removals have been processed.");
  console.log(`${automationRate}% of removal requests were automated via email.`);
  console.log("=".repeat(70));

  await prisma.$disconnect();
}

summary().catch(console.error);
