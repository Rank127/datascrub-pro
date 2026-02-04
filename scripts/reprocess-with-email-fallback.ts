/**
 * Reprocess REQUIRES_MANUAL and FORM requests with email fallback
 *
 * This script identifies requests that were marked manual but could now
 * be automated via email, and reprocesses them.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "../src/lib/db";
import { getBestAutomationMethod } from "../src/lib/removers/browser-automation";
import { executeRemoval } from "../src/lib/removers/removal-service";

async function reprocess() {
  console.log("=".repeat(70));
  console.log("REPROCESS REMOVALS WITH EMAIL FALLBACK");
  console.log("=".repeat(70));
  console.log();

  // Find REQUIRES_MANUAL or FORM requests that might now be automatable
  const candidates = await prisma.removalRequest.findMany({
    where: {
      OR: [
        { status: "REQUIRES_MANUAL" },
        { status: "PENDING", method: { in: ["FORM", "AUTO_FORM"] } },
      ],
    },
    include: {
      exposure: { select: { source: true, sourceName: true } },
      user: { select: { id: true } },
    },
    take: 100,
  });

  console.log(`Found ${candidates.length} candidates to check`);
  console.log();

  const canAutomate: typeof candidates = [];
  const stillManual: typeof candidates = [];

  // Check each one
  for (const req of candidates) {
    const best = getBestAutomationMethod(req.exposure.source);
    if (best.canAutomate && best.method === "EMAIL") {
      canAutomate.push(req);
    } else {
      stillManual.push(req);
    }
  }

  console.log(`Can automate via email: ${canAutomate.length}`);
  console.log(`Still require manual:   ${stillManual.length}`);
  console.log();

  if (canAutomate.length === 0) {
    console.log("No requests found that can be reprocessed with email fallback.");
    console.log("The current REQUIRES_MANUAL requests are legitimately non-automatable:");
    console.log("- Breach databases (data already leaked, can't un-leak)");
    console.log("- Form-only brokers without privacyEmail");
    console.log("- AI services with form-only removal");
    await prisma.$disconnect();
    return;
  }

  // Group by source for clarity
  const bySource = new Map<string, number>();
  for (const req of canAutomate) {
    const source = req.exposure.source;
    bySource.set(source, (bySource.get(source) || 0) + 1);
  }

  console.log("Requests that can now be automated via email:");
  console.log("-".repeat(50));
  for (const [source, count] of bySource) {
    console.log(`  ${source.padEnd(30)}: ${count}`);
  }
  console.log();

  // Ask for confirmation before processing
  const args = process.argv.slice(2);
  const dryRun = !args.includes("--execute");

  if (dryRun) {
    console.log("DRY RUN - use --execute flag to actually reprocess");
    console.log();
    await prisma.$disconnect();
    return;
  }

  console.log("EXECUTING reprocessing...");
  console.log("-".repeat(50));

  let success = 0;
  let failed = 0;

  for (const req of canAutomate.slice(0, 20)) {
    console.log(`Processing ${req.exposure.sourceName} (${req.exposure.source})...`);

    try {
      // Reset status to PENDING so it can be reprocessed
      await prisma.removalRequest.update({
        where: { id: req.id },
        data: {
          status: "PENDING",
          method: "AUTO_EMAIL", // Update method to email
          notes: `Reprocessed with email fallback at ${new Date().toISOString()}`,
        },
      });

      // Execute the removal (will use email now)
      const result = await executeRemoval(req.id, req.user.id);

      if (result.success) {
        console.log(`  ✓ Success: ${result.message}`);
        success++;
      } else {
        console.log(`  ✗ Failed: ${result.message}`);
        failed++;
      }
    } catch (error) {
      console.log(`  ✗ Error: ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log();
  console.log("-".repeat(50));
  console.log(`Reprocessed: ${success} success, ${failed} failed`);

  await prisma.$disconnect();
}

reprocess().catch(console.error);
