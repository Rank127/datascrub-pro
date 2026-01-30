// Subscription Intelligence System
// Automatically detects and resolves subscription mismatches
// Ensures database always reflects true Stripe state

import { prisma } from "@/lib/db";
import { getStripe, getPlanFromPriceId } from "./index";
import { logAudit } from "@/lib/rbac/audit-log";
import Stripe from "stripe";

const PLAN_HIERARCHY: Record<string, number> = {
  FREE: 0,
  PRO: 1,
  ENTERPRISE: 2,
};

interface SubscriptionState {
  plan: "FREE" | "PRO" | "ENTERPRISE";
  status: "active" | "canceled" | "past_due" | "trialing";
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  periodEnd: Date | null;
  activeCount: number;
  hasDuplicates: boolean;
}

/**
 * Get the true subscription state from Stripe
 */
export async function getStripeSubscriptionState(
  stripeCustomerId: string
): Promise<SubscriptionState> {
  const stripe = getStripe();

  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "all",
    limit: 50,
  });

  const activeSubscriptions = subscriptions.data.filter(
    (sub) => sub.status === "active" || sub.status === "trialing"
  );

  if (activeSubscriptions.length === 0) {
    // Check for past_due
    const pastDue = subscriptions.data.find((sub) => sub.status === "past_due");
    if (pastDue) {
      const priceId = pastDue.items.data[0]?.price.id || "";
      const periodEnd = pastDue.items.data[0]?.current_period_end;
      return {
        plan: getPlanFromPriceId(priceId),
        status: "past_due",
        stripeSubscriptionId: pastDue.id,
        stripePriceId: priceId,
        periodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        activeCount: 0,
        hasDuplicates: false,
      };
    }

    return {
      plan: "FREE",
      status: "canceled",
      stripeSubscriptionId: null,
      stripePriceId: null,
      periodEnd: null,
      activeCount: 0,
      hasDuplicates: false,
    };
  }

  // Find highest tier subscription
  let highest: Stripe.Subscription = activeSubscriptions[0];
  let highestRank = 0;

  for (const sub of activeSubscriptions) {
    const priceId = sub.items.data[0]?.price.id || "";
    const plan = getPlanFromPriceId(priceId);
    const rank = PLAN_HIERARCHY[plan] ?? 0;

    if (rank > highestRank) {
      highest = sub;
      highestRank = rank;
    }
  }

  const priceId = highest.items.data[0]?.price.id || "";
  const periodEnd = highest.items.data[0]?.current_period_end;

  return {
    plan: getPlanFromPriceId(priceId),
    status: highest.status === "trialing" ? "trialing" : "active",
    stripeSubscriptionId: highest.id,
    stripePriceId: priceId,
    periodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    activeCount: activeSubscriptions.length,
    hasDuplicates: activeSubscriptions.length > 1,
  };
}

/**
 * Validate and auto-fix user subscription
 * Call this on login, dashboard load, or any plan-gated action
 * Returns true if subscription was fixed, false if already in sync
 */
export async function validateAndSyncSubscription(
  userId: string,
  options: { autoFix?: boolean; silent?: boolean } = {}
): Promise<{
  inSync: boolean;
  fixed: boolean;
  previousPlan: string;
  currentPlan: string;
  message: string;
}> {
  const { autoFix = true, silent = false } = options;

  // Get user and subscription from database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, plan: true },
  });

  if (!user) {
    return {
      inSync: true,
      fixed: false,
      previousPlan: "UNKNOWN",
      currentPlan: "UNKNOWN",
      message: "User not found",
    };
  }

  const dbSubscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  // No Stripe customer = FREE plan, nothing to sync
  if (!dbSubscription?.stripeCustomerId) {
    if (user.plan !== "FREE") {
      // User has paid plan but no Stripe customer - fix to FREE
      if (autoFix) {
        await prisma.user.update({
          where: { id: userId },
          data: { plan: "FREE" },
        });
      }
      return {
        inSync: false,
        fixed: autoFix,
        previousPlan: user.plan,
        currentPlan: "FREE",
        message: "No Stripe customer found, reset to FREE",
      };
    }
    return {
      inSync: true,
      fixed: false,
      previousPlan: user.plan,
      currentPlan: user.plan,
      message: "No Stripe customer, FREE plan correct",
    };
  }

  // Get true state from Stripe
  const stripeState = await getStripeSubscriptionState(dbSubscription.stripeCustomerId);

  // Check if in sync
  const dbPlan = user.plan;
  const stripePlan = stripeState.plan;
  const inSync = dbPlan === stripePlan;

  if (inSync && dbSubscription.stripeSubscriptionId === stripeState.stripeSubscriptionId) {
    return {
      inSync: true,
      fixed: false,
      previousPlan: dbPlan,
      currentPlan: stripePlan,
      message: "Subscription in sync",
    };
  }

  // Out of sync - fix if autoFix enabled
  if (!autoFix) {
    return {
      inSync: false,
      fixed: false,
      previousPlan: dbPlan,
      currentPlan: stripePlan,
      message: `Mismatch detected: DB=${dbPlan}, Stripe=${stripePlan}`,
    };
  }

  // Apply fix
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { plan: stripePlan },
    }),
    prisma.subscription.update({
      where: { userId },
      data: {
        plan: stripePlan,
        status: stripeState.status === "canceled" ? "canceled" : "active",
        stripeSubscriptionId: stripeState.stripeSubscriptionId,
        stripePriceId: stripeState.stripePriceId,
        stripeCurrentPeriodEnd: stripeState.periodEnd,
      },
    }),
  ]);

  // Log the auto-fix (unless silent)
  if (!silent) {
    const action = PLAN_HIERARCHY[stripePlan] > PLAN_HIERARCHY[dbPlan]
      ? "PLAN_UPGRADE"
      : "PLAN_DOWNGRADE";

    await logAudit({
      actorId: "SYSTEM_SYNC",
      actorEmail: "system@ghostmydata.com",
      actorRole: "SYSTEM",
      action,
      resource: "user_plan",
      resourceId: userId,
      targetUserId: userId,
      targetEmail: user.email,
      details: {
        previousPlan: dbPlan,
        newPlan: stripePlan,
        reason: "Auto-sync from Stripe",
        source: "subscription_intelligence",
        hadDuplicates: stripeState.hasDuplicates,
      },
    });
  }

  // Notify user if plan changed significantly
  if (dbPlan !== stripePlan && !silent) {
    await prisma.alert.create({
      data: {
        userId,
        type: "SUBSCRIPTION_UPDATED",
        title: "Subscription Updated",
        message: `Your subscription has been updated to ${stripePlan}. This reflects your current billing status.`,
      },
    });
  }

  return {
    inSync: false,
    fixed: true,
    previousPlan: dbPlan,
    currentPlan: stripePlan,
    message: `Auto-fixed: ${dbPlan} → ${stripePlan}`,
  };
}

/**
 * Check subscription before allowing plan-gated features
 * Use this as a guard before premium features
 * Respects billing period end - users keep access until period ends
 */
export async function verifyPlanAccess(
  userId: string,
  requiredPlan: "PRO" | "ENTERPRISE"
): Promise<{
  hasAccess: boolean;
  currentPlan: string;
  wasFixed: boolean;
  isCanceling: boolean;
  periodEnd: Date | null;
}> {
  // Get subscription details including period end
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: {
      user: {
        select: { plan: true },
      },
    },
  });

  if (!subscription) {
    return {
      hasAccess: false,
      currentPlan: "FREE",
      wasFixed: false,
      isCanceling: false,
      periodEnd: null,
    };
  }

  const isCanceling = subscription.status === "canceling";
  const periodEnd = subscription.stripeCurrentPeriodEnd;

  // If canceling but still within billing period, user keeps access
  if (isCanceling && periodEnd) {
    const now = new Date();
    if (now < periodEnd) {
      // User still has access until period end
      const currentPlan = subscription.plan;
      const requiredRank = PLAN_HIERARCHY[requiredPlan];
      const currentRank = PLAN_HIERARCHY[currentPlan] ?? 0;

      return {
        hasAccess: currentRank >= requiredRank,
        currentPlan,
        wasFixed: false,
        isCanceling: true,
        periodEnd,
      };
    } else {
      // Period has ended, should be on FREE now - trigger sync
      const syncResult = await validateAndSyncSubscription(userId, { silent: true });
      return {
        hasAccess: false,
        currentPlan: syncResult.currentPlan,
        wasFixed: syncResult.fixed,
        isCanceling: false,
        periodEnd: null,
      };
    }
  }

  // Normal sync for active subscriptions
  const syncResult = await validateAndSyncSubscription(userId, { silent: true });

  const requiredRank = PLAN_HIERARCHY[requiredPlan];
  const currentRank = PLAN_HIERARCHY[syncResult.currentPlan] ?? 0;

  return {
    hasAccess: currentRank >= requiredRank,
    currentPlan: syncResult.currentPlan,
    wasFixed: syncResult.fixed,
    isCanceling: false,
    periodEnd: subscription.stripeCurrentPeriodEnd,
  };
}

/**
 * Cleanup duplicate subscriptions for a customer
 * Keeps only the highest-tier subscription
 */
export async function cleanupDuplicateSubscriptions(
  stripeCustomerId: string
): Promise<{ canceled: number; kept: string | null }> {
  const stripe = getStripe();

  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "active",
    limit: 50,
  });

  if (subscriptions.data.length <= 1) {
    return { canceled: 0, kept: subscriptions.data[0]?.id || null };
  }

  // Find highest tier
  let highest: Stripe.Subscription = subscriptions.data[0];
  let highestRank = 0;

  for (const sub of subscriptions.data) {
    const priceId = sub.items.data[0]?.price.id || "";
    const plan = getPlanFromPriceId(priceId);
    const rank = PLAN_HIERARCHY[plan] ?? 0;

    if (rank > highestRank) {
      highest = sub;
      highestRank = rank;
    }
  }

  // Cancel all others
  let canceledCount = 0;
  for (const sub of subscriptions.data) {
    if (sub.id !== highest.id) {
      try {
        await stripe.subscriptions.cancel(sub.id);
        canceledCount++;
      } catch (err) {
        console.error(`Failed to cancel duplicate subscription ${sub.id}:`, err);
      }
    }
  }

  return { canceled: canceledCount, kept: highest.id };
}

/**
 * Batch sync all users - for periodic maintenance
 * Returns summary of fixes applied
 */
export async function batchSyncAllSubscriptions(options: {
  dryRun?: boolean;
  limit?: number;
}): Promise<{
  checked: number;
  inSync: number;
  fixed: number;
  errors: number;
  details: Array<{ userId: string; email: string; from: string; to: string }>;
}> {
  const { dryRun = false, limit = 100 } = options;

  // Get all users with Stripe customers
  const subscriptions = await prisma.subscription.findMany({
    where: {
      stripeCustomerId: { not: null },
    },
    include: {
      user: {
        select: { id: true, email: true, plan: true },
      },
    },
    take: limit,
  });

  const results = {
    checked: 0,
    inSync: 0,
    fixed: 0,
    errors: 0,
    details: [] as Array<{ userId: string; email: string; from: string; to: string }>,
  };

  for (const sub of subscriptions) {
    results.checked++;

    try {
      const syncResult = await validateAndSyncSubscription(sub.userId, {
        autoFix: !dryRun,
        silent: true,
      });

      if (syncResult.inSync) {
        results.inSync++;
      } else if (syncResult.fixed || dryRun) {
        results.fixed++;
        results.details.push({
          userId: sub.userId,
          email: sub.user.email,
          from: syncResult.previousPlan,
          to: syncResult.currentPlan,
        });
      }
    } catch (err) {
      results.errors++;
      console.error(`Failed to sync user ${sub.userId}:`, err);
    }
  }

  return results;
}
