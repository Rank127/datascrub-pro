import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkFailed() {
  const failed = await prisma.removalRequest.findMany({
    where: { status: "FAILED" },
    include: {
      exposure: { select: { source: true, sourceName: true, dataType: true } },
      user: { select: { email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  console.log(`\n${"═".repeat(60)}`);
  console.log("           FAILED REMOVALS ANALYSIS");
  console.log(`${"═".repeat(60)}`);
  console.log(`\nTotal failed: ${failed.length}\n`);

  // Group by source
  const bySource: Record<string, { count: number; errors: string[] }> = {};

  for (const removal of failed) {
    const source = removal.exposure.source;
    if (!bySource[source]) {
      bySource[source] = { count: 0, errors: [] };
    }
    bySource[source].count++;
    if (removal.lastError && !bySource[source].errors.includes(removal.lastError)) {
      bySource[source].errors.push(removal.lastError);
    }
  }

  // Sort by count
  const sorted = Object.entries(bySource).sort((a, b) => b[1].count - a[1].count);

  console.log("BY SOURCE:");
  for (const [source, data] of sorted) {
    console.log(`\n  ${source}: ${data.count} failed`);
    if (data.errors.length > 0) {
      console.log("    Errors:");
      for (const error of data.errors.slice(0, 3)) {
        console.log(`      - ${error.substring(0, 100)}${error.length > 100 ? "..." : ""}`);
      }
    }
  }

  // Group by error type
  const byError: Record<string, number> = {};
  for (const removal of failed) {
    const error = removal.lastError || "No error message";
    const shortError = error.substring(0, 50);
    byError[shortError] = (byError[shortError] || 0) + 1;
  }

  console.log("\n\nBY ERROR TYPE:");
  const sortedErrors = Object.entries(byError).sort((a, b) => b[1] - a[1]);
  for (const [error, count] of sortedErrors.slice(0, 10)) {
    console.log(`  ${count}x: ${error}...`);
  }

  // Show attempts distribution
  const byAttempts: Record<number, number> = {};
  for (const removal of failed) {
    byAttempts[removal.attempts] = (byAttempts[removal.attempts] || 0) + 1;
  }

  console.log("\n\nBY ATTEMPTS:");
  for (const [attempts, count] of Object.entries(byAttempts).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    console.log(`  ${attempts} attempts: ${count} items`);
  }

  // Check if any can be retried (attempts < 5)
  const canRetry = failed.filter(f => f.attempts < 5);
  console.log(`\n\nCAN BE RETRIED (< 5 attempts): ${canRetry.length}`);

  await prisma.$disconnect();
}

checkFailed().catch(console.error);
