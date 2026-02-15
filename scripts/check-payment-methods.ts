// Check payment methods for a customer
import { readFileSync } from "fs";
import { join } from "path";

const envPath = join(process.cwd(), ".env.local");
try {
  const envContent = readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const idx = line.indexOf("=");
    if (idx > 0) {
      const key = line.substring(0, idx).trim();
      const value = line.substring(idx + 1).replace(/^["']|["']$/g, "");
      if (key && !process.env[key]) process.env[key] = value;
    }
  });
} catch (_e) {}

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover" as Stripe.LatestApiVersion,
});

async function checkPaymentMethods() {
  const args = process.argv.slice(2);
  const cleanupFlag = args.includes("--cleanup");
  const customerId = args.find(arg => arg.startsWith("cus_")) || args.find(arg => !arg.startsWith("--"));

  if (!customerId) {
    console.log("Usage: npx tsx scripts/check-payment-methods.ts <customer_id> [--cleanup]");
    console.log("Example: npx tsx scripts/check-payment-methods.ts cus_abc123");
    console.log("         npx tsx scripts/check-payment-methods.ts cus_abc123 --cleanup");
    process.exit(1);
  }

  console.log("=== Payment Methods for Customer ===\n");
  console.log("Customer ID:", customerId);

  // Get all payment methods
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });

  console.log(`\nFound ${paymentMethods.data.length} payment method(s):\n`);

  for (const pm of paymentMethods.data) {
    console.log(`  ID: ${pm.id}`);
    console.log(`  Brand: ${pm.card?.brand}`);
    console.log(`  Last 4: ${pm.card?.last4}`);
    console.log(`  Exp: ${pm.card?.exp_month}/${pm.card?.exp_year}`);
    console.log(`  Created: ${new Date(pm.created * 1000).toISOString()}`);
    console.log("");
  }

  // Check for duplicates (same last4 and exp)
  const seen = new Map<string, Stripe.PaymentMethod[]>();
  for (const pm of paymentMethods.data) {
    const key = `${pm.card?.brand}-${pm.card?.last4}-${pm.card?.exp_month}/${pm.card?.exp_year}`;
    if (!seen.has(key)) {
      seen.set(key, []);
    }
    seen.get(key)!.push(pm);
  }

  const duplicates = Array.from(seen.entries()).filter(([, pms]) => pms.length > 1);

  if (duplicates.length > 0) {
    console.log("=== DUPLICATE PAYMENT METHODS FOUND ===\n");
    for (const [key, pms] of duplicates) {
      console.log(`Card: ${key}`);
      console.log(`Count: ${pms.length} duplicates`);
      console.log("IDs:", pms.map(p => p.id).join(", "));
      console.log("");
    }

    if (cleanupFlag) {
      console.log("=== Cleaning up duplicates ===\n");
      for (const [_key, pms] of duplicates) {
        // Keep the newest one, delete the rest
        const sorted = pms.sort((a, b) => b.created - a.created);
        const keep = sorted[0];
        const toDelete = sorted.slice(1);

        console.log(`Keeping: ${keep.id} (created ${new Date(keep.created * 1000).toISOString()})`);
        for (const pm of toDelete) {
          console.log(`Deleting: ${pm.id} (created ${new Date(pm.created * 1000).toISOString()})`);
          await stripe.paymentMethods.detach(pm.id);
          console.log(`  ✓ Deleted`);
        }
      }
    } else {
      console.log("To clean up duplicates, run:");
      console.log("  npx tsx scripts/check-payment-methods.ts --cleanup");
    }
  } else {
    console.log("No duplicate payment methods found.");
  }
}

checkPaymentMethods().catch(console.error);
