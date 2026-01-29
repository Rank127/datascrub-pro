import { config } from "dotenv";
config({ path: ".env.local" });

import { processPendingRemovalsBatch } from "../src/lib/removers/removal-service";

async function run() {
  console.log("RESEND_API_KEY configured:", !!process.env.RESEND_API_KEY);
  console.log("RESEND_FROM_EMAIL:", process.env.RESEND_FROM_EMAIL);
  console.log("\nProcessing pending removals...\n");

  const result = await processPendingRemovalsBatch(20);

  console.log("\nResults:");
  console.log(`  Processed: ${result.processed}`);
  console.log(`  Successful: ${result.successful}`);
  console.log(`  Failed: ${result.failed}`);
  console.log(`  Skipped: ${result.skipped}`);
  console.log(`  Emails Sent: ${result.emailsSent}`);

  if (result.brokerDistribution && Object.keys(result.brokerDistribution).length > 0) {
    console.log("\nBroker Distribution:");
    Object.entries(result.brokerDistribution).slice(0, 15).forEach(([broker, count]) => {
      console.log(`  ${broker}: ${count}`);
    });
  }
}

run().catch(console.error);
