/**
 * Test Scanner Health Monitoring
 *
 * Runs a FULL scan for a test user, captures per-scanner outcomes,
 * persists to ScannerHealthLog, and verifies the data.
 */
import { PrismaClient } from "@prisma/client";
import { decrypt } from "../src/lib/encryption/crypto";

const prisma = new PrismaClient();

// Jason Alls — free user who recently scanned
const TEST_USER_ID = "cmlw74p060000ot8xuypy40k3";

async function main() {
  console.log("=== Scanner Health Monitoring Test ===\n");

  // Step 1: Load user profile
  const profile = await prisma.personalProfile.findFirst({
    where: { userId: TEST_USER_ID },
  });

  if (!profile) {
    console.error("No profile found for test user");
    process.exit(1);
  }
  console.log("✓ Profile loaded for user:", TEST_USER_ID);

  // Step 2: Prepare scan input (imported dynamically to avoid Next.js module issues)
  const { prepareProfileForScan, ScanOrchestrator } = await import("../src/lib/scanners/scan-orchestrator");

  const scanInput = await prepareProfileForScan(profile, decrypt);
  console.log("✓ Scan input prepared:", {
    hasName: !!scanInput.fullName,
    emailCount: scanInput.emails?.length || 0,
    hasAddresses: !!scanInput.addresses?.length,
  });

  // Step 3: Create a test scan record
  const scan = await prisma.scan.create({
    data: {
      userId: TEST_USER_ID,
      type: "FULL",
      status: "IN_PROGRESS",
      startedAt: new Date(),
    },
  });
  console.log("✓ Scan record created:", scan.id);

  // Step 4: Create orchestrator and run scan
  console.log("\n--- Running scan (this takes 1-3 minutes) ---\n");
  const startTime = Date.now();

  const orchestrator = await ScanOrchestrator.create({
    type: "FULL",
    userPlan: "FREE",
  });

  console.log(`Scanners loaded: ${orchestrator.getScannerCount()}`);
  console.log(`Scanner names: ${orchestrator.getScannerNames().join(", ")}\n`);

  const results = await orchestrator.runScan(scanInput);
  const duration = Date.now() - startTime;

  console.log(`\n--- Scan completed in ${(duration / 1000).toFixed(1)}s ---`);
  console.log(`Total results: ${results.length}`);

  // Step 5: Get outcomes
  const outcomes = orchestrator.getOutcomes();
  const failedCount = orchestrator.getFailedCount();

  console.log(`\nScanner outcomes: ${outcomes.length}`);
  console.log(`Rejected promises: ${failedCount}\n`);

  // Print outcome table
  console.log("Scanner".padEnd(25) + "Type".padEnd(16) + "Status".padEnd(10) + "Time(ms)".padEnd(10) + "Results".padEnd(8) + "Error");
  console.log("-".repeat(95));
  for (const o of outcomes) {
    console.log(
      o.scannerName.padEnd(25) +
      o.scannerType.padEnd(16) +
      o.status.padEnd(10) +
      String(o.responseTimeMs).padEnd(10) +
      String(o.resultsFound).padEnd(8) +
      (o.errorType ? `${o.errorType}: ${(o.errorMessage || "").substring(0, 40)}` : "")
    );
  }

  // Step 6: Persist to ScannerHealthLog
  console.log("\n--- Persisting to ScannerHealthLog ---");
  await prisma.scannerHealthLog.createMany({
    data: outcomes.map(o => ({
      scanId: scan.id,
      scannerName: o.scannerName,
      scannerType: o.scannerType,
      status: o.status,
      errorType: o.errorType || null,
      errorMessage: o.errorMessage || null,
      responseTimeMs: o.responseTimeMs,
      resultsFound: o.resultsFound,
      httpStatus: o.httpStatus || null,
      proxyUsed: o.proxyUsed || null,
    })),
  });
  console.log(`✓ ${outcomes.length} health log rows inserted`);

  // Step 7: Verify by reading back
  const healthLogs = await prisma.scannerHealthLog.findMany({
    where: { scanId: scan.id },
    orderBy: { scannerName: "asc" },
  });

  console.log(`\n--- Verification: ${healthLogs.length} rows in ScannerHealthLog ---`);

  // Summary stats
  const statusCounts: Record<string, number> = {};
  for (const log of healthLogs) {
    statusCounts[log.status] = (statusCounts[log.status] || 0) + 1;
  }
  console.log("Status breakdown:", statusCounts);

  const brokerLogs = healthLogs.filter(l => l.scannerType === "STATIC_BROKER" || l.scannerType === "DYNAMIC_BROKER");
  const brokerSuccess = brokerLogs.filter(l => l.status === "SUCCESS").length;
  const brokerBlocked = brokerLogs.filter(l => l.status === "BLOCKED").length;
  const brokerEmpty = brokerLogs.filter(l => l.status === "EMPTY").length;
  console.log(`\nBroker scanners: ${brokerLogs.length} total — ${brokerSuccess} SUCCESS, ${brokerBlocked} BLOCKED, ${brokerEmpty} EMPTY`);

  const avgResponseTime = healthLogs.reduce((sum, l) => sum + (l.responseTimeMs || 0), 0) / healthLogs.length;
  console.log(`Average response time: ${Math.round(avgResponseTime)}ms`);

  // Step 8: Mark scan as completed
  await prisma.scan.update({
    where: { id: scan.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      exposuresFound: results.length,
      sourcesChecked: orchestrator.getSourcesCheckedCount(),
      progress: 100,
    },
  });
  console.log(`\n✓ Scan ${scan.id} marked COMPLETED`);

  // Final total count
  const totalCount = await prisma.scannerHealthLog.count();
  console.log(`\n=== Total ScannerHealthLog rows in DB: ${totalCount} ===`);

  console.log("\n✅ Scanner health monitoring test PASSED");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Test failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
