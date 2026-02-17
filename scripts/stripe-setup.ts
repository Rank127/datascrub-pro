/**
 * Stripe Product & Price Setup Script
 *
 * Creates the required Stripe products and prices for GhostMyData plans.
 * Run once to set up, then copy the outputted env vars to Vercel.
 *
 * Usage:
 *   npx tsx scripts/stripe-setup.ts
 *   npx tsx scripts/stripe-setup.ts --dry-run
 *
 * Requires: STRIPE_SECRET_KEY in .env.local
 */

import Stripe from "stripe";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const DRY_RUN = process.argv.includes("--dry-run");

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY not found in .env.local");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-01-28.clover" as Stripe.LatestApiVersion,
});

interface PlanConfig {
  name: string;
  description: string;
  envVar: string;
  amountCents: number; // annual price in cents
  interval: "year";
  metadata: Record<string, string>;
}

const PLANS: PlanConfig[] = [
  {
    name: "GhostMyData Pro (Annual)",
    description: "Pro plan — unlimited scans, automated removals, email alerts. $9.99/mo billed annually.",
    envVar: "STRIPE_PRO_YEARLY_PRICE_ID",
    amountCents: 11988, // $119.88/year
    interval: "year",
    metadata: { plan: "PRO", billing: "yearly" },
  },
  {
    name: "GhostMyData Enterprise (Annual)",
    description: "Enterprise plan — everything in Pro plus family sharing, priority support, AI protection. $22.50/mo billed annually.",
    envVar: "STRIPE_ENTERPRISE_YEARLY_PRICE_ID",
    amountCents: 26995, // $269.95/year
    interval: "year",
    metadata: { plan: "ENTERPRISE", billing: "yearly" },
  },
  {
    name: "GhostMyData Corporate 10 (Annual)",
    description: "Corporate plan — 10 seats, centralized dashboard, Net 30 billing available.",
    envVar: "STRIPE_CORPORATE_10_YEARLY_PRICE_ID",
    amountCents: 199900, // $1,999/year
    interval: "year",
    metadata: { plan: "CORPORATE", tier: "CORP_10", billing: "yearly" },
  },
  {
    name: "GhostMyData Corporate 25 (Annual)",
    description: "Corporate plan — 25 seats, centralized dashboard, Net 30 billing available.",
    envVar: "STRIPE_CORPORATE_25_YEARLY_PRICE_ID",
    amountCents: 399900, // $3,999/year
    interval: "year",
    metadata: { plan: "CORPORATE", tier: "CORP_25", billing: "yearly" },
  },
  {
    name: "GhostMyData Corporate 50 (Annual)",
    description: "Corporate plan — 50 seats, dedicated account manager.",
    envVar: "STRIPE_CORPORATE_50_YEARLY_PRICE_ID",
    amountCents: 699900, // $6,999/year
    interval: "year",
    metadata: { plan: "CORPORATE", tier: "CORP_50", billing: "yearly" },
  },
  {
    name: "GhostMyData Corporate 100 (Annual)",
    description: "Corporate plan — 100 seats, dedicated account manager, custom SLA.",
    envVar: "STRIPE_CORPORATE_100_YEARLY_PRICE_ID",
    amountCents: 1199900, // $11,999/year
    interval: "year",
    metadata: { plan: "CORPORATE", tier: "CORP_100", billing: "yearly" },
  },
  {
    name: "GhostMyData Family Add-on (Annual)",
    description: "Additional family seat — per member, per year.",
    envVar: "STRIPE_FAMILY_ADDON_YEARLY_PRICE_ID",
    amountCents: 12000, // $120/year
    interval: "year",
    metadata: { plan: "FAMILY_ADDON", billing: "yearly" },
  },
];

async function checkExistingProducts(): Promise<Map<string, string>> {
  const existing = new Map<string, string>();
  const products = await stripe.products.list({ limit: 100, active: true });

  for (const product of products.data) {
    // Check if any of our plans already exist by name match
    for (const plan of PLANS) {
      if (product.name === plan.name) {
        // Find active price for this product
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
          limit: 10,
        });
        const matchingPrice = prices.data.find(
          (p) => p.unit_amount === plan.amountCents && p.recurring?.interval === plan.interval
        );
        if (matchingPrice) {
          existing.set(plan.envVar, matchingPrice.id);
        }
      }
    }
  }
  return existing;
}

async function createProductAndPrice(plan: PlanConfig): Promise<string> {
  console.log(`  Creating product: ${plan.name}...`);

  const product = await stripe.products.create({
    name: plan.name,
    description: plan.description,
    metadata: plan.metadata,
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: plan.amountCents,
    currency: "usd",
    recurring: { interval: plan.interval },
    metadata: plan.metadata,
  });

  return price.id;
}

async function checkWebhook(): Promise<void> {
  console.log("\n📡 Checking webhook endpoints...");
  const webhooks = await stripe.webhookEndpoints.list({ limit: 20 });

  const requiredEvents = [
    "checkout.session.completed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.payment_succeeded",
    "invoice.payment_failed",
    "charge.refunded",
  ];

  const ghostmydataWebhook = webhooks.data.find(
    (w) => w.url.includes("ghostmydata.com") && w.status === "enabled"
  );

  if (ghostmydataWebhook) {
    console.log(`  ✅ Webhook found: ${ghostmydataWebhook.url}`);
    const missingEvents = requiredEvents.filter(
      (e) => !ghostmydataWebhook.enabled_events.includes(e as Stripe.WebhookEndpoint.EnabledEvent)
    );
    if (missingEvents.length > 0) {
      console.log(`  ⚠️  Missing events: ${missingEvents.join(", ")}`);
      console.log("     Add these in Stripe Dashboard > Developers > Webhooks");
    } else {
      console.log("  ✅ All required events configured");
    }
    console.log(`  Secret hint: ${ghostmydataWebhook.secret ? "Set" : "Retrieve from Stripe Dashboard"}`);
  } else {
    console.log("  ❌ No webhook endpoint found for ghostmydata.com");
    console.log("\n  To create:");
    console.log("  1. Go to https://dashboard.stripe.com/webhooks");
    console.log("  2. Add endpoint: https://ghostmydata.com/api/stripe/webhook");
    console.log(`  3. Select events: ${requiredEvents.join(", ")}`);
    console.log("  4. Copy the signing secret to STRIPE_WEBHOOK_SECRET in Vercel");
  }
}

async function main() {
  console.log("🔧 GhostMyData Stripe Setup\n");
  console.log(`Mode: ${DRY_RUN ? "DRY RUN (no changes)" : "LIVE"}`);
  console.log(`Stripe key: ${process.env.STRIPE_SECRET_KEY?.startsWith("sk_live") ? "LIVE" : "TEST"} mode\n`);

  // Check for existing products
  console.log("🔍 Checking for existing products...");
  const existing = await checkExistingProducts();

  if (existing.size > 0) {
    console.log(`  Found ${existing.size} existing price(s):`);
    for (const [envVar, priceId] of existing) {
      console.log(`    ${envVar}=${priceId}`);
    }
  }

  // Create missing products
  const envVars: Record<string, string> = {};
  let created = 0;

  for (const plan of PLANS) {
    if (existing.has(plan.envVar)) {
      envVars[plan.envVar] = existing.get(plan.envVar)!;
      console.log(`  ⏭️  ${plan.name} — already exists`);
      continue;
    }

    if (DRY_RUN) {
      console.log(`  🔸 Would create: ${plan.name} ($${(plan.amountCents / 100).toFixed(2)}/${plan.interval})`);
      envVars[plan.envVar] = `price_WOULD_BE_CREATED_${plan.envVar}`;
    } else {
      const priceId = await createProductAndPrice(plan);
      envVars[plan.envVar] = priceId;
      console.log(`  ✅ Created: ${plan.name} → ${priceId}`);
      created++;
    }
  }

  // Check webhook
  await checkWebhook();

  // Output env vars
  console.log("\n" + "=".repeat(60));
  console.log("📋 Environment Variables for Vercel:\n");
  for (const [key, value] of Object.entries(envVars)) {
    console.log(`${key}=${value}`);
  }

  if (process.env.STRIPE_WEBHOOK_SECRET) {
    console.log(`STRIPE_WEBHOOK_SECRET=${process.env.STRIPE_WEBHOOK_SECRET}`);
  } else {
    console.log("STRIPE_WEBHOOK_SECRET=<get from Stripe Dashboard>");
  }

  console.log("\n" + "=".repeat(60));
  console.log(`\n✅ Done. ${DRY_RUN ? "0" : created} product(s) created, ${existing.size} already existed.`);

  if (!DRY_RUN && created > 0) {
    console.log("\nNext steps:");
    console.log("1. Copy the env vars above to Vercel: vercel env add");
    console.log("2. Set up webhook endpoint in Stripe Dashboard if not done");
    console.log("3. Test a checkout flow on staging/preview");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
