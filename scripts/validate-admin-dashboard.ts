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

  // Removal requests by status
  const totalRemovals = await prisma.removalRequest.count();
  const removalsByStatus = await prisma.removalRequest.groupBy({
    by: ["status"],
    _count: true,
  });

  console.log();
  console.log("REMOVAL REQUESTS:");
  console.log("-".repeat(40));
  console.log(`Total Requests:        ${totalRemovals}`);
  console.log();
  console.log("By Status:");
  for (const s of removalsByStatus.sort((a, b) => b._count - a._count)) {
    console.log(`  ${s.status.padEnd(22)} ${s._count}`);
  }

  // NEW: Queue Pipeline Breakdown (matches dashboard)
  const [toProcess, awaitingResponse, requiresManual, manualExposures, completed] = await Promise.all([
    prisma.removalRequest.count({ where: { status: "PENDING" } }),
    prisma.removalRequest.count({ where: { status: "SUBMITTED" } }),
    prisma.removalRequest.count({ where: { status: "REQUIRES_MANUAL" } }),
    prisma.exposure.count({ where: { requiresManualAction: true, manualActionTaken: false } }),
    prisma.removalRequest.count({ where: { status: "COMPLETED" } }),
  ]);

  const totalPipeline = toProcess + awaitingResponse + requiresManual + manualExposures;

  console.log();
  console.log("=".repeat(60));
  console.log("QUEUE PIPELINE (Dashboard View)");
  console.log("=".repeat(60));
  console.log();
  console.log("┌────────────┬────────────┬────────────┬────────────┬────────────┐");
  console.log("│  To Send   │  Awaiting  │  No Email  │   Manual   │ Completed  │");
  console.log("│  (PENDING) │ (SUBMITTED)│ (REQ_MAN)  │  (Review)  │            │");
  console.log("├────────────┼────────────┼────────────┼────────────┼────────────┤");
  console.log(`│ ${toProcess.toString().padStart(8)}   │ ${awaitingResponse.toString().padStart(8)}   │ ${requiresManual.toString().padStart(8)}   │ ${manualExposures.toString().padStart(8)}   │ ${completed.toString().padStart(8)}   │`);
  console.log("└────────────┴────────────┴────────────┴────────────┴────────────┘");
  console.log();
  console.log(`Total in Pipeline: ${totalPipeline.toLocaleString()}`);
  console.log();

  // Status indicators
  console.log("Status:");
  if (toProcess === 0) {
    console.log("  ✅ All items processed - no pending emails to send");
  } else if (toProcess < 100) {
    console.log(`  ✅ Queue nearly clear - only ${toProcess} items to process`);
  } else {
    console.log(`  ⚠️  ${toProcess} items waiting to be processed`);
  }

  if (awaitingResponse > 0) {
    console.log(`  📧 ${awaitingResponse.toLocaleString()} emails sent, awaiting broker response`);
  }

  if (requiresManual > 0) {
    console.log(`  🔧 ${requiresManual.toLocaleString()} items need form submission (no email option)`);
  }

  if (manualExposures > 0) {
    console.log(`  👁️  ${manualExposures} exposures need manual review`);
  }

  await prisma.$disconnect();
}

validate().catch(console.error);
