/**
 * Emergency Compliance Halt — Stop All Pending Outbound Communications
 *
 * Usage:
 *   npx tsx scripts/compliance-halt.ts --dry-run    # Preview only (default)
 *   npx tsx scripts/compliance-halt.ts --execute     # Actually cancel
 *
 * What it does:
 *   1. Cancels all PENDING + SUBMITTED RemovalRequests with compliance audit note
 *   2. Cancels all QUEUED EmailQueue entries
 *   3. Sets compliance_freeze strategic directive to true
 *   4. Logs results to CronLog
 *
 * Context:
 *   Legal pushback from ZipRecruiter (C&D), ZeroBounce (GDPR DSR), Syndigo
 *   shows our broker directory includes companies that are NOT statutory data
 *   brokers under CA Civil Code § 1798.99.80(d). This halts all outbound while
 *   we audit and reclassify the directory.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const isDryRun = !process.argv.includes("--execute");

async function complianceHalt() {
  console.log("=== COMPLIANCE HALT ===");
  console.log(`Mode: ${isDryRun ? "DRY RUN (preview only)" : "EXECUTE (live changes)"}`);
  console.log("");

  const startTime = Date.now();

  // 1. Count pending/submitted removal requests
  const pendingRemovals = await prisma.removalRequest.count({
    where: { status: { in: ["PENDING", "SUBMITTED"] } },
  });

  const removalsByStatus = await prisma.removalRequest.groupBy({
    by: ["status"],
    where: { status: { in: ["PENDING", "SUBMITTED"] } },
    _count: true,
  });

  console.log(`Removal Requests to cancel: ${pendingRemovals}`);
  for (const group of removalsByStatus) {
    console.log(`  ${group.status}: ${group._count}`);
  }

  // 2. Count queued emails
  const queuedEmails = await prisma.emailQueue.count({
    where: { status: "QUEUED" },
  });
  console.log(`Email Queue entries to cancel: ${queuedEmails}`);
  console.log("");

  if (isDryRun) {
    console.log("--- DRY RUN --- No changes made.");
    console.log("Run with --execute to apply changes.");
    await prisma.$disconnect();
    return;
  }

  // === EXECUTE MODE ===

  // 3. Cancel all pending/submitted removal requests
  const cancelledRemovals = await prisma.removalRequest.updateMany({
    where: { status: { in: ["PENDING", "SUBMITTED"] } },
    data: {
      status: "CANCELLED",
      notes: "COMPLIANCE HALT: Cancelled pending audit of broker directory classifications per CA Civil Code § 1798.99.80(d). See compliance-halt script run " + new Date().toISOString(),
    },
  });
  console.log(`Cancelled ${cancelledRemovals.count} removal requests`);

  // 4. Cancel all queued emails
  const cancelledEmails = await prisma.emailQueue.updateMany({
    where: { status: "QUEUED" },
    data: {
      status: "CANCELLED",
      lastError: "COMPLIANCE HALT: All outbound halted pending broker directory audit",
    },
  });
  console.log(`Cancelled ${cancelledEmails.count} email queue entries`);

  // 5. Set compliance_freeze directive
  await prisma.strategicDirective.upsert({
    where: {
      category_key: {
        category: "compliance",
        key: "compliance_freeze",
      },
    },
    update: {
      value: true,
      rationale: "Emergency halt: broker directory audit required after legal pushback (ZipRecruiter C&D, ZeroBounce GDPR DSR, Syndigo). All outbound removals frozen until reclassification complete.",
      source: "compliance-halt-script",
      isActive: true,
    },
    create: {
      category: "compliance",
      key: "compliance_freeze",
      value: true,
      rationale: "Emergency halt: broker directory audit required after legal pushback (ZipRecruiter C&D, ZeroBounce GDPR DSR, Syndigo). All outbound removals frozen until reclassification complete.",
      source: "compliance-halt-script",
      isActive: true,
    },
  });
  console.log("Set compliance_freeze directive = true");

  // 6. Log to CronLog
  const duration = Date.now() - startTime;
  await prisma.cronLog.create({
    data: {
      jobName: "compliance-halt",
      status: "SUCCESS",
      duration,
      message: `Compliance halt executed: ${cancelledRemovals.count} removals cancelled, ${cancelledEmails.count} emails cancelled, freeze directive set`,
      metadata: JSON.stringify({
        removalsCount: cancelledRemovals.count,
        emailsCount: cancelledEmails.count,
        removalsByStatus: removalsByStatus.map(g => ({ status: g.status, count: g._count })),
        freezeDirectiveSet: true,
        executedAt: new Date().toISOString(),
      }),
    },
  });
  console.log("Logged to CronLog");

  console.log("\n=== COMPLIANCE HALT COMPLETE ===");
  console.log("Next steps:");
  console.log("  1. Deploy broker directory reclassifications (Part 2)");
  console.log("  2. Run cancel-nonbroker-removals.ts (Part 3)");
  console.log("  3. Deploy compliance monitor cron (Part 4)");
  console.log("  4. Unfreeze: set compliance_freeze = false");

  await prisma.$disconnect();
}

complianceHalt().catch((err) => {
  console.error("FATAL:", err);
  prisma.$disconnect();
  process.exit(1);
});
