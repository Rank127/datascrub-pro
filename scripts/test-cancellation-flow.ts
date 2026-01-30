// Test script for subscription cancellation flow
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
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover" as Stripe.LatestApiVersion,
});

async function testCancellationFlow() {
  const args = process.argv.slice(2);
  const userEmail = args[0] || "sandeepgupta";
  const action = args[1] || "check"; // check, cancel, reactivate

  console.log("=== Subscription Cancellation Flow Test ===\n");

  // Find user
  const user = await prisma.user.findFirst({
    where: { email: { contains: userEmail, mode: "insensitive" } },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      _count: {
        select: { exposures: true },
      },
    },
  });

  if (!user) {
    console.log(`User not found: ${userEmail}`);
    return;
  }

  console.log("User:", user.name, `(${user.email})`);
  console.log("Current Plan:", user.plan);
  console.log("Exposures Found:", user._count.exposures);

  // Get subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  if (!subscription) {
    console.log("\nNo subscription record found");
    return;
  }

  console.log("\n=== Database Subscription ===");
  console.log("Status:", subscription.status);
  console.log("Plan:", subscription.plan);
  console.log("Stripe Customer ID:", subscription.stripeCustomerId);
  console.log("Stripe Subscription ID:", subscription.stripeSubscriptionId);
  console.log("Period End:", subscription.stripeCurrentPeriodEnd?.toISOString());

  // Get Stripe subscription if exists
  if (subscription.stripeSubscriptionId) {
    console.log("\n=== Stripe Subscription ===");
    try {
      const stripeSub = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
      );

      console.log("Status:", stripeSub.status);
      console.log("Cancel at Period End:", stripeSub.cancel_at_period_end);

      const periodEnd = stripeSub.items.data[0]?.current_period_end;
      if (periodEnd) {
        const endDate = new Date(periodEnd * 1000);
        const daysRemaining = Math.ceil(
          (endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        console.log("Period End:", endDate.toISOString());
        console.log("Days Remaining:", daysRemaining);
      }

      if (action === "cancel") {
        console.log("\n=== Simulating Cancellation ===");

        if (stripeSub.cancel_at_period_end) {
          console.log("Subscription is already set to cancel at period end");
        } else {
          console.log("Setting cancel_at_period_end = true...");

          const updated = await stripe.subscriptions.update(
            subscription.stripeSubscriptionId,
            { cancel_at_period_end: true }
          );

          const newPeriodEnd = updated.items.data[0]?.current_period_end;
          const endDate = newPeriodEnd ? new Date(newPeriodEnd * 1000) : null;
          const daysRemaining = endDate
            ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : 0;

          // Update database
          await prisma.$transaction([
            prisma.subscription.update({
              where: { userId: user.id },
              data: {
                status: "canceling",
                stripeCurrentPeriodEnd: endDate,
              },
            }),
            prisma.alert.create({
              data: {
                userId: user.id,
                type: "SUBSCRIPTION_UPDATED",
                title: "Subscription Cancellation Scheduled",
                message: `Your subscription will be canceled on ${endDate?.toLocaleDateString()}. You'll keep access to all features until then.`,
              },
            }),
          ]);

          console.log("\n✓ Cancellation scheduled");
          console.log("  Status: canceling");
          console.log("  Access until:", endDate?.toLocaleDateString());
          console.log("  Days remaining:", daysRemaining);

          // Test email content (don't actually send)
          console.log("\n=== Email Would Be Sent ===");
          console.log("To:", user.email);
          console.log("Subject:", `⏰ You have ${daysRemaining} days left to use your GhostMyData ${subscription.plan} features`);
          console.log("Key message: You still have full access until", endDate?.toLocaleDateString());
        }
      } else if (action === "reactivate") {
        console.log("\n=== Simulating Reactivation ===");

        if (!stripeSub.cancel_at_period_end) {
          console.log("Subscription is not set to cancel - nothing to reactivate");
        } else {
          console.log("Setting cancel_at_period_end = false...");

          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: false,
          });

          await prisma.$transaction([
            prisma.subscription.update({
              where: { userId: user.id },
              data: { status: "active" },
            }),
            prisma.alert.create({
              data: {
                userId: user.id,
                type: "SUBSCRIPTION_UPDATED",
                title: "Cancellation Reversed",
                message: "Your subscription cancellation has been reversed. Your plan will continue as normal.",
              },
            }),
          ]);

          console.log("\n✓ Cancellation reversed");
          console.log("  Status: active");
          console.log("  Subscription continues normally");

          console.log("\n=== Email Would Be Sent ===");
          console.log("To:", user.email);
          console.log("Subject:", `🎉 Your GhostMyData ${subscription.plan} subscription is back!`);
        }
      }
    } catch (err) {
      console.error("Stripe error:", err);
    }
  } else {
    console.log("\nNo active Stripe subscription to test");
  }

  // Get removal stats
  const removalStats = await prisma.removalRequest.count({
    where: {
      userId: user.id,
      status: { in: ["COMPLETED", "VERIFIED_REMOVED"] },
    },
  });
  console.log("\n=== User Stats for Email ===");
  console.log("Exposures Found:", user._count.exposures);
  console.log("Removals Completed:", removalStats);
}

testCancellationFlow()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
