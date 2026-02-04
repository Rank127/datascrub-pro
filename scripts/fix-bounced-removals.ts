/**
 * Fix removal requests for bounced/suppressed email addresses
 *
 * Updates removal requests that were sent to invalid emails to REQUIRES_MANUAL.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { prisma } from "../src/lib/db";

const BOUNCED_SOURCES = [
  "LAION_AI",
  "GETTY_AI",
  "SMARTBACKGROUNDCHECKS",
];

const SUPPRESSED_SOURCES = [
  "PIMEYES",
  "SOCIAL_CATFISH",
];

const ALL_AFFECTED_SOURCES = [...BOUNCED_SOURCES, ...SUPPRESSED_SOURCES];

async function fixBouncedRemovals() {
  console.log("=".repeat(70));
  console.log("FIX BOUNCED/SUPPRESSED REMOVAL REQUESTS");
  console.log("=".repeat(70));
  console.log();

  // Find affected removal requests
  const affectedRequests = await prisma.removalRequest.findMany({
    where: {
      exposure: {
        source: { in: ALL_AFFECTED_SOURCES },
      },
      status: { in: ["SUBMITTED", "PENDING"] },
      method: { in: ["AUTO_EMAIL", "EMAIL"] },
    },
    include: {
      exposure: { select: { id: true, source: true, sourceName: true } },
    },
  });

  console.log(`Found ${affectedRequests.length} affected removal requests`);
  console.log();

  if (affectedRequests.length === 0) {
    console.log("No requests to update.");
    await prisma.$disconnect();
    return;
  }

  // Group by source
  const bySource = new Map<string, typeof affectedRequests>();
  for (const req of affectedRequests) {
    const source = req.exposure.source;
    if (!bySource.has(source)) {
      bySource.set(source, []);
    }
    bySource.get(source)!.push(req);
  }

  console.log("Affected requests by source:");
  console.log("-".repeat(50));
  for (const [source, reqs] of bySource) {
    const isBounced = BOUNCED_SOURCES.includes(source);
    const reason = isBounced ? "bounced" : "suppressed";
    console.log(`  ${source.padEnd(25)}: ${reqs.length} (${reason})`);
  }
  console.log();

  // Update requests to REQUIRES_MANUAL with explanation
  console.log("Updating requests...");

  let updated = 0;
  for (const req of affectedRequests) {
    const isBounced = BOUNCED_SOURCES.includes(req.exposure.source);
    const reason = isBounced
      ? "Email bounced - address is invalid"
      : "Email suppressed - recipient blocked our emails";

    await prisma.removalRequest.update({
      where: { id: req.id },
      data: {
        status: "REQUIRES_MANUAL",
        method: "MANUAL_GUIDE",
        notes: `${reason}. Please use the opt-out form at the broker's website.`,
      },
    });

    // Also update exposure to require manual action
    await prisma.exposure.update({
      where: { id: req.exposure.id },
      data: {
        requiresManualAction: true,
        status: "REMOVAL_PENDING",
      },
    });

    updated++;
  }

  console.log(`Updated ${updated} removal requests to REQUIRES_MANUAL`);
  console.log();

  // Summary
  console.log("=".repeat(70));
  console.log("SUMMARY:");
  console.log("-".repeat(50));
  console.log(`  Bounced emails fixed:    ${BOUNCED_SOURCES.length} sources`);
  console.log(`  Suppressed emails fixed: ${SUPPRESSED_SOURCES.length} sources`);
  console.log(`  Requests updated:        ${updated}`);
  console.log();
  console.log("These brokers now require manual opt-out via their web forms.");
  console.log("=".repeat(70));

  await prisma.$disconnect();
}

fixBouncedRemovals().catch(console.error);
