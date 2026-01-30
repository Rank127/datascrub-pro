// Script to check and fix user subscription issues by syncing from Stripe
// Usage: npx tsx scripts/fix-user-subscription.ts <email> [--fix] [--cancel-duplicates]
import { readFileSync } from "fs";
import { join } from "path";

const envPath = join(process.cwd(), ".env.local");
try {
  const envContent = readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").replace(/^["']|["']$/g, "");
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  });
} catch (e) {
  // .env.local might not exist
}

import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover" as Stripe.LatestApiVersion,
});

const PLAN_HIERARCHY: Record<string, number> = {
  FREE: 0,
  PRO: 1,
  ENTERPRISE: 2,
};

function getPlanFromPriceId(priceId: string): "PRO" | "ENTERPRISE" | "FREE" {
  const proPrices = [
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  ];
  const enterprisePrices = [
    process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
    process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
  ];

  if (proPrices.includes(priceId)) return "PRO";
  if (enterprisePrices.includes(priceId)) return "ENTERPRISE";

  // Fallback: check price amount or name
  return "FREE";
}

async function checkAndFix() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes("--fix");
  const cancelDuplicates = args.includes("--cancel-duplicates");
  const emailArg = args.find(arg => !arg.startsWith("--") && arg.includes("@"));

  if (!emailArg) {
    console.log("Usage: npx tsx scripts/fix-user-subscription.ts <email> [--fix] [--cancel-duplicates]");
    console.log("");
    console.log("Options:");
    console.log("  <email>              User email to check/fix");
    console.log("  --fix                Apply fixes (default is dry-run)");
    console.log("  --cancel-duplicates  Cancel duplicate subscriptions in Stripe");
    console.log("");
    console.log("Example:");
    console.log("  npx tsx scripts/fix-user-subscription.ts user@example.com");
    console.log("  npx tsx scripts/fix-user-subscription.ts user@example.com --fix");
    console.log("  npx tsx scripts/fix-user-subscription.ts user@example.com --fix --cancel-duplicates");
    process.exit(1);
  }

  const user = await prisma.user.findFirst({
    where: { email: { equals: emailArg, mode: "insensitive" } },
    select: { id: true, email: true, plan: true, name: true }
  });

  if (!user) {
    console.log(`User not found: ${emailArg}`);
    return;
  }

  const dbSubscription = await prisma.subscription.findUnique({
    where: { userId: user.id }
  });

  console.log("=== Current Database State ===");
  console.log("User:", user.name, `(${user.email})`);
  console.log("User.plan:", user.plan);
  console.log("Subscription.plan:", dbSubscription?.plan);
  console.log("Subscription.status:", dbSubscription?.status);
  console.log("Stripe Customer ID:", dbSubscription?.stripeCustomerId);
  console.log("Stripe Subscription ID:", dbSubscription?.stripeSubscriptionId);
  console.log("");

  if (!dbSubscription?.stripeCustomerId) {
    console.log("ERROR: No Stripe customer ID found");
    return;
  }

  // Fetch subscriptions from Stripe
  console.log("=== Fetching from Stripe ===");
  const stripeSubscriptions = await stripe.subscriptions.list({
    customer: dbSubscription.stripeCustomerId,
    status: "all",
    limit: 100,
  });

  console.log(`Found ${stripeSubscriptions.data.length} subscription(s) in Stripe:\n`);

  const activeSubscriptions: Stripe.Subscription[] = [];

  for (const sub of stripeSubscriptions.data) {
    const priceId = sub.items.data[0]?.price.id || "";
    const amount = sub.items.data[0]?.price.unit_amount || 0;
    const plan = amount === 1199 ? "PRO" : amount === 2999 ? "ENTERPRISE" : getPlanFromPriceId(priceId);
    const periodEnd = sub.items.data[0]?.current_period_end;

    console.log(`  Subscription: ${sub.id}`);
    console.log(`    Status: ${sub.status}`);
    console.log(`    Plan: ${plan} ($${(amount / 100).toFixed(2)}/mo)`);
    console.log(`    Price ID: ${priceId}`);
    console.log(`    Period End: ${periodEnd ? new Date(periodEnd * 1000).toISOString() : "N/A"}`);
    console.log(`    Cancel at Period End: ${sub.cancel_at_period_end}`);
    console.log("");

    if (sub.status === "active" || sub.status === "trialing") {
      activeSubscriptions.push(sub);
    }
  }

  console.log(`Active subscriptions: ${activeSubscriptions.length}`);

  if (activeSubscriptions.length === 0) {
    console.log("\nNo active subscriptions in Stripe.");
    if (!dryRun) {
      console.log("Setting user to FREE...");
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { plan: "FREE" },
        }),
        prisma.subscription.update({
          where: { userId: user.id },
          data: {
            plan: "FREE",
            status: "canceled",
            stripeSubscriptionId: null,
            stripePriceId: null,
          },
        }),
      ]);
      console.log("Done. User set to FREE.");
    } else {
      console.log("[DRY RUN] Would set user to FREE.");
    }
    return;
  }

  // Find highest plan
  let highestPlan = "FREE";
  let highestSubscription: Stripe.Subscription | null = null;
  const duplicates: Stripe.Subscription[] = [];

  for (const sub of activeSubscriptions) {
    const amount = sub.items.data[0]?.price.unit_amount || 0;
    const plan = amount === 1199 ? "PRO" : amount === 2999 ? "ENTERPRISE" : "FREE";
    const planRank = PLAN_HIERARCHY[plan] ?? 0;

    if (planRank > (PLAN_HIERARCHY[highestPlan] ?? 0)) {
      if (highestSubscription) {
        duplicates.push(highestSubscription);
      }
      highestPlan = plan;
      highestSubscription = sub;
    } else if (highestSubscription) {
      duplicates.push(sub);
    }
  }

  console.log(`\nHighest active plan: ${highestPlan}`);
  console.log(`Duplicate subscriptions: ${duplicates.length}`);

  if (duplicates.length > 0) {
    console.log("\nDuplicate subscriptions to cancel:");
    for (const dup of duplicates) {
      const amount = dup.items.data[0]?.price.unit_amount || 0;
      console.log(`  - ${dup.id} ($${(amount / 100).toFixed(2)}/mo)`);
    }
  }

  console.log("\n=== Recommended Actions ===");
  console.log(`1. Update database to: ${highestPlan}`);
  if (duplicates.length > 0) {
    console.log(`2. Cancel ${duplicates.length} duplicate subscription(s) in Stripe`);
  }

  if (!dryRun && highestSubscription) {
    console.log("\n=== Applying Fix ===");

    const periodEnd = highestSubscription.items.data[0]?.current_period_end;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { plan: highestPlan as "FREE" | "PRO" | "ENTERPRISE" },
      }),
      prisma.subscription.update({
        where: { userId: user.id },
        data: {
          plan: highestPlan,
          status: "active",
          stripeSubscriptionId: highestSubscription.id,
          stripePriceId: highestSubscription.items.data[0]?.price.id,
          stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        },
      }),
      prisma.alert.create({
        data: {
          userId: user.id,
          type: "SUBSCRIPTION_UPDATED",
          title: "Subscription Restored",
          message: `Your ${highestPlan} subscription has been restored. We apologize for the inconvenience.`,
        },
      }),
    ]);

    console.log(`Database updated to ${highestPlan}`);

    if (cancelDuplicates && duplicates.length > 0) {
      console.log("\nCanceling duplicate subscriptions...");
      for (const dup of duplicates) {
        try {
          await stripe.subscriptions.cancel(dup.id);
          console.log(`  Canceled: ${dup.id}`);
        } catch (err) {
          console.error(`  Failed to cancel ${dup.id}:`, err);
        }
      }
    }

    console.log("\nDone!");
  } else {
    console.log("\n[DRY RUN] No changes made.");
    console.log("To apply fix, run: npx tsx scripts/fix-sandeep-subscription.ts --fix");
    if (duplicates.length > 0) {
      console.log("To also cancel duplicates: npx tsx scripts/fix-sandeep-subscription.ts --fix --cancel-duplicates");
    }
  }
}

checkAndFix().catch(console.error).finally(() => prisma.$disconnect());
