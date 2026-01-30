// Stripe Subscription Sync Service
// Handles synchronization between Stripe and database
// Prevents duplicate subscriptions and ensures correct plan access

import { prisma } from "@/lib/db";
import { getStripe, getPlanFromPriceId } from "./index";
import { logAudit } from "@/lib/rbac/audit-log";
import Stripe from "stripe";

const PLAN_HIERARCHY: Record<string, number> = {
  FREE: 0,
  PRO: 1,
  ENTERPRISE: 2,
};

export interface SyncResult {
  success: boolean;
  previousPlan: string;
  newPlan: string;
  activeSubscriptions: number;
  canceledDuplicates: number;
  message: string;
}

/**
 * Sync a user's subscription from Stripe to database
 * - Fetches all subscriptions for the customer from Stripe
 * - Uses the highest-tier active subscription
 * - Optionally cancels duplicate subscriptions
 * - Updates database to match Stripe state
 */
export async function syncUserFromStripe(
  userId: string,
  options: { cancelDuplicates?: boolean; dryRun?: boolean } = {}
): Promise<SyncResult> {
  const { cancelDuplicates = false, dryRun = false } = options;
  const stripe = getStripe();

  // Get user and subscription from database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, plan: true },
  });

  if (!user) {
    return {
      success: false,
      previousPlan: "UNKNOWN",
      newPlan: "UNKNOWN",
      activeSubscriptions: 0,
      canceledDuplicates: 0,
      message: "User not found",
    };
  }

  const dbSubscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!dbSubscription?.stripeCustomerId) {
    return {
      success: false,
      previousPlan: user.plan,
      newPlan: user.plan,
      activeSubscriptions: 0,
      canceledDuplicates: 0,
      message: "No Stripe customer ID found",
    };
  }

  // Fetch ALL subscriptions for this customer from Stripe
  const stripeSubscriptions = await stripe.subscriptions.list({
    customer: dbSubscription.stripeCustomerId,
    status: "all",
    limit: 100,
  });

  // Separate active and inactive subscriptions
  const activeSubscriptions = stripeSubscriptions.data.filter(
    (sub) => sub.status === "active" || sub.status === "trialing"
  );

  const previousPlan = user.plan;
  let canceledCount = 0;

  if (activeSubscriptions.length === 0) {
    // No active subscriptions in Stripe - user should be FREE
    if (!dryRun) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { plan: "FREE" },
        }),
        prisma.subscription.update({
          where: { userId },
          data: {
            plan: "FREE",
            status: "canceled",
            stripeSubscriptionId: null,
            stripePriceId: null,
          },
        }),
      ]);
    }

    return {
      success: true,
      previousPlan,
      newPlan: "FREE",
      activeSubscriptions: 0,
      canceledDuplicates: 0,
      message: "No active subscriptions in Stripe. User set to FREE.",
    };
  }

  // Find the highest-tier active subscription
  let highestPlan = "FREE";
  let highestSubscription: Stripe.Subscription | null = null;
  const duplicateSubscriptions: Stripe.Subscription[] = [];

  for (const sub of activeSubscriptions) {
    const priceId = sub.items.data[0]?.price.id || "";
    const plan = getPlanFromPriceId(priceId);
    const planRank = PLAN_HIERARCHY[plan] ?? 0;

    if (planRank > (PLAN_HIERARCHY[highestPlan] ?? 0)) {
      // If we already had a highest, it becomes a duplicate
      if (highestSubscription) {
        duplicateSubscriptions.push(highestSubscription);
      }
      highestPlan = plan;
      highestSubscription = sub;
    } else if (highestSubscription) {
      // This subscription is lower tier, it's a duplicate
      duplicateSubscriptions.push(sub);
    }
  }

  // Cancel duplicates if requested
  if (cancelDuplicates && duplicateSubscriptions.length > 0 && !dryRun) {
    for (const dupSub of duplicateSubscriptions) {
      try {
        await stripe.subscriptions.cancel(dupSub.id);
        canceledCount++;

        await logAudit({
          actorId: "SYSTEM_SYNC",
          actorEmail: "system@ghostmydata.com",
          actorRole: "SYSTEM",
          action: "SUBSCRIPTION_CANCELED",
          resource: "stripe_subscription",
          resourceId: dupSub.id,
          targetUserId: userId,
          targetEmail: user.email,
          details: {
            reason: "Duplicate subscription cleanup",
            canceledPlan: getPlanFromPriceId(dupSub.items.data[0]?.price.id || ""),
            keptPlan: highestPlan,
          },
        });
      } catch (err) {
        console.error(`Failed to cancel duplicate subscription ${dupSub.id}:`, err);
      }
    }
  }

  // Update database to match highest subscription
  if (!dryRun && highestSubscription) {
    const periodEnd = highestSubscription.items.data[0]?.current_period_end;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { plan: highestPlan as "FREE" | "PRO" | "ENTERPRISE" },
      }),
      prisma.subscription.update({
        where: { userId },
        data: {
          plan: highestPlan,
          status: "active",
          stripeSubscriptionId: highestSubscription.id,
          stripePriceId: highestSubscription.items.data[0]?.price.id,
          stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        },
      }),
    ]);

    // Log plan change if it changed
    if (previousPlan !== highestPlan) {
      await logAudit({
        actorId: "SYSTEM_SYNC",
        actorEmail: "system@ghostmydata.com",
        actorRole: "SYSTEM",
        action: PLAN_HIERARCHY[highestPlan] > PLAN_HIERARCHY[previousPlan] ? "PLAN_UPGRADE" : "PLAN_DOWNGRADE",
        resource: "user_plan",
        resourceId: userId,
        targetUserId: userId,
        targetEmail: user.email,
        details: {
          previousPlan,
          newPlan: highestPlan,
          reason: "Synced from Stripe",
          source: "stripe_sync",
        },
      });
    }
  }

  return {
    success: true,
    previousPlan,
    newPlan: highestPlan,
    activeSubscriptions: activeSubscriptions.length,
    canceledDuplicates: canceledCount,
    message: dryRun
      ? `[DRY RUN] Would sync to ${highestPlan}. Found ${activeSubscriptions.length} active subscription(s), ${duplicateSubscriptions.length} duplicate(s).`
      : `Synced to ${highestPlan}. ${canceledCount > 0 ? `Canceled ${canceledCount} duplicate(s).` : ""}`,
  };
}

/**
 * Check if user has existing active subscription before creating new one
 * Returns the existing subscription if found, or null
 */
export async function getExistingActiveSubscription(
  stripeCustomerId: string
): Promise<Stripe.Subscription | null> {
  const stripe = getStripe();

  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "active",
    limit: 10,
  });

  if (subscriptions.data.length > 0) {
    // Return the highest tier subscription
    let highest: Stripe.Subscription | null = null;
    let highestRank = -1;

    for (const sub of subscriptions.data) {
      const priceId = sub.items.data[0]?.price.id || "";
      const plan = getPlanFromPriceId(priceId);
      const rank = PLAN_HIERARCHY[plan] ?? 0;

      if (rank > highestRank) {
        highest = sub;
        highestRank = rank;
      }
    }

    return highest;
  }

  return null;
}

/**
 * Upgrade an existing subscription instead of creating a new one
 */
export async function upgradeSubscription(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe();

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Update the subscription to the new price
  const updated = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: "create_prorations", // Pro-rate the difference
  });

  return updated;
}

/**
 * Cancel subscription with proper handling based on billing period
 * - Under 30 days: Immediate cancellation with refund eligibility
 * - Over 30 days: Cancel at period end
 */
export async function cancelSubscription(
  subscriptionId: string,
  options: { immediate?: boolean; reason?: string } = {}
): Promise<{ canceledAt: Date | null; cancelAtPeriodEnd: boolean; refundEligible: boolean }> {
  const stripe = getStripe();

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Calculate days since subscription started
  const startDate = new Date(subscription.start_date * 1000);
  const now = new Date();
  const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const refundEligible = daysSinceStart < 30;

  if (options.immediate || refundEligible) {
    // Immediate cancellation
    const canceled = await stripe.subscriptions.cancel(subscriptionId);
    return {
      canceledAt: new Date(canceled.canceled_at! * 1000),
      cancelAtPeriodEnd: false,
      refundEligible,
    };
  } else {
    // Cancel at period end
    const updated = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return {
      canceledAt: null,
      cancelAtPeriodEnd: true,
      refundEligible: false,
    };
  }
}

/**
 * Get all subscriptions for a customer from Stripe
 */
export async function getCustomerSubscriptions(
  stripeCustomerId: string
): Promise<Stripe.Subscription[]> {
  const stripe = getStripe();

  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "all",
    limit: 100,
  });

  return subscriptions.data;
}
