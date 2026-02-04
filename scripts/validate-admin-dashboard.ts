import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function validate() {
  console.log("=".repeat(60));
  console.log("ADMIN DASHBOARD VALIDATION");
  console.log("=".repeat(60));
  console.log();

  // Total exposures
  const totalExposures = await prisma.exposure.count();

  // Exposures by status
  const exposuresByStatus = await prisma.exposure.groupBy({
    by: ["status"],
    _count: true,
  });

  // Active exposures (not REMOVED/WHITELISTED)
  const activeExposures = await prisma.exposure.count({
    where: { status: { notIn: ["REMOVED", "WHITELISTED"] } },
  });

  console.log("EXPOSURES:");
  console.log("-".repeat(40));
  console.log(`Total Exposures:       ${totalExposures}`);
  console.log(`Active Exposures:      ${activeExposures}`);
  console.log();
  console.log("By Status:");
  for (const s of exposuresByStatus.sort((a, b) => b._count - a._count)) {
    console.log(`  ${s.status.padEnd(22)} ${s._count}`);
  }

  // Removal requests
  const totalRemovals = await prisma.removalRequest.count();
  const pendingRemovals = await prisma.removalRequest.count({
    where: { status: "PENDING" },
  });

  const removalsByStatus = await prisma.removalRequest.groupBy({
    by: ["status"],
    _count: true,
  });

  console.log();
  console.log("REMOVAL REQUESTS:");
  console.log("-".repeat(40));
  console.log(`Total Requests:        ${totalRemovals}`);
  console.log(`Pending Queue:         ${pendingRemovals}`);
  console.log();
  console.log("By Status:");
  for (const s of removalsByStatus.sort((a, b) => b._count - a._count)) {
    console.log(`  ${s.status.padEnd(22)} ${s._count}`);
  }

  // Calculate ACTUAL Pending Queue as dashboard does
  const pendingRemovalRequests = await prisma.removalRequest.count({
    where: { status: { in: ["PENDING", "SUBMITTED"] } },
  });

  const manualActionQueue = await prisma.exposure.count({
    where: {
      requiresManualAction: true,
      manualActionTaken: false,
    },
  });

  const actualPendingQueue = pendingRemovalRequests + manualActionQueue;

  console.log();
  console.log("DASHBOARD 'PENDING QUEUE' BREAKDOWN:");
  console.log("-".repeat(40));
  console.log(`Pending+Submitted Removals: ${pendingRemovalRequests}`);
  console.log(`Manual Action Queue:        ${manualActionQueue}`);
  console.log(`Total (Dashboard Logic):    ${actualPendingQueue}`);

  // Dashboard comparison
  console.log();
  console.log("=".repeat(60));
  console.log("DASHBOARD COMPARISON:");
  console.log("-".repeat(40));
  console.log(`Dashboard shows "Exposures Found": 10,166`);
  console.log(`Database Total Exposures:          ${totalExposures}`);
  console.log(`Match: ${totalExposures === 10166 ? "✅ YES" : "❌ NO (off by " + (totalExposures - 10166) + ")"}`);
  console.log();
  console.log(`Dashboard shows "Pending Queue": 8,515`);
  console.log(`Database Pending Queue:          ${actualPendingQueue}`);
  console.log(`Match: ${actualPendingQueue === 8515 ? "✅ YES" : "❌ NO (off by " + (actualPendingQueue - 8515) + ")"}`);

  await prisma.$disconnect();
}

validate().catch(console.error);
