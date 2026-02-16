import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { stripe, getPlanFromPriceId } from "@/lib/stripe";
import { sendSubscriptionEmail, sendRefundConfirmationEmail, sendCorporateWelcomeEmail } from "@/lib/email";
import { createPaymentIssueTicket } from "@/lib/support/ticket-service";
import { activateCorporateAccount, handleOverdueInvoice } from "@/lib/corporate/billing";
import { captureError } from "@/lib/error-reporting";
import { logAudit } from "@/lib/rbac/audit-log";
import { CORPORATE_TIERS } from "@/lib/corporate/types";
import Stripe from "stripe";

// Helper to log plan changes for admin dashboard tracking
async function logPlanChange(
  userId: string,
  userEmail: string,
  previousPlan: string,
  newPlan: string,
  reason?: string
) {
  const planRank: Record<string, number> = { FREE: 0, PRO: 1, ENTERPRISE: 2 };
  const prevRank = planRank[previousPlan] ?? 0;
  const newRank = planRank[newPlan] ?? 0;

  let action: "PLAN_UPGRADE" | "PLAN_DOWNGRADE" = "PLAN_UPGRADE";
  if (newPlan === "FREE") {
    action = "PLAN_DOWNGRADE";
  } else if (newRank < prevRank) {
    action = "PLAN_DOWNGRADE";
  }

  await logAudit({
    actorId: "STRIPE_WEBHOOK",
    actorEmail: "stripe@system",
    actorRole: "SYSTEM",
    action,
    resource: "user_plan",
    resourceId: userId,
    targetUserId: userId,
    targetEmail: userEmail,
    details: {
      previousPlan,
      newPlan,
      reason: reason || "Stripe subscription change",
      source: "stripe_webhook",
    },
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.type === "corporate") {
          await handleCorporateCheckoutCompleted(session);
        } else {
          await handleCheckoutCompleted(session);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        // Check if this is a corporate subscription
        if (subscription.metadata?.type === "corporate") {
          await handleCorporateSubscriptionDeleted(subscription);
        } else {
          await handleSubscriptionDeleted(subscription);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        // Handle corporate invoice payments
        if (invoice.metadata?.type === "corporate_annual") {
          await activateCorporateAccount(invoice.id);
        }
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // Handle corporate invoice failures
        if (invoice.metadata?.type === "corporate_annual") {
          await handleOverdueInvoice(invoice.id);
        }
        await handlePaymentFailed(invoice);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan as "PRO" | "ENTERPRISE";

  if (!userId || !plan) {
    console.error("Missing metadata in checkout session");
    return;
  }

  const subscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : session.subscription?.id;

  if (!subscriptionId) {
    console.error("Missing subscription ID in checkout session");
    return;
  }

  // Fetch the subscription details
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Get user details for email
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  // Get current period end from subscription items (with null safety)
  const firstItem = stripeSubscription.items?.data?.[0];
  const currentPeriodEnd = firstItem?.current_period_end;
  const periodEndDate = currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null;
  const priceId = firstItem?.price?.id;

  await prisma.$transaction([
    // Update subscription record
    prisma.subscription.upsert({
      where: { userId },
      update: {
        stripeSubscriptionId: subscriptionId,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: periodEndDate,
        plan,
        status: "active",
      },
      create: {
        userId,
        stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id || "",
        stripeSubscriptionId: subscriptionId,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: periodEndDate,
        plan,
        status: "active",
      },
    }),
    // Update user's plan
    prisma.user.update({
      where: { id: userId },
      data: { plan },
    }),
    // Create alert
    prisma.alert.create({
      data: {
        userId,
        type: "SUBSCRIPTION_UPDATED",
        title: "Subscription Activated",
        message: `Your ${plan} subscription is now active. Enjoy your premium features!`,
      },
    }),
  ]);

  // Send subscription confirmation email (non-blocking)
  if (user?.email) {
    sendSubscriptionEmail(user.email, user.name || "", plan).catch((e) => captureError("stripe-subscription-email", e instanceof Error ? e : new Error(String(e))));
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer?.id;
  if (!customerId) {
    console.error("Missing customer ID in subscription update");
    return;
  }

  // Find user by Stripe customer ID
  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
    include: { user: { select: { email: true, plan: true } } },
  });

  if (!existingSubscription) {
    console.error("No subscription found for customer:", customerId);
    return;
  }

  const subFirstItem = subscription.items?.data?.[0];
  const priceId = subFirstItem?.price?.id;
  const currentPeriodEnd = subFirstItem?.current_period_end;
  const periodEndDate = currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null;
  const newPlan = getPlanFromPriceId(priceId || "");
  const previousPlan = existingSubscription.user.plan;
  const status = subscription.status === "active" ? "active" :
                 subscription.status === "past_due" ? "past_due" : "canceled";

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: periodEndDate,
        plan: newPlan,
        status,
      },
    }),
    prisma.user.update({
      where: { id: existingSubscription.userId },
      data: { plan: newPlan },
    }),
  ]);

  // Log plan change if plan actually changed
  if (previousPlan !== newPlan) {
    await logPlanChange(
      existingSubscription.userId,
      existingSubscription.user.email,
      previousPlan,
      newPlan,
      "Subscription updated via Stripe"
    );
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer?.id;
  if (!customerId) {
    console.error("Missing customer ID in subscription deletion");
    return;
  }

  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
    include: { user: { select: { email: true, plan: true } } },
  });

  if (!existingSubscription) {
    return;
  }

  const previousPlan = existingSubscription.user.plan;

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        plan: "FREE",
        status: "canceled",
        stripeSubscriptionId: null,
        stripePriceId: null,
      },
    }),
    prisma.user.update({
      where: { id: existingSubscription.userId },
      data: { plan: "FREE" },
    }),
    prisma.alert.create({
      data: {
        userId: existingSubscription.userId,
        type: "SUBSCRIPTION_CANCELED",
        title: "Subscription Canceled",
        message: "Your subscription has been canceled. You've been moved to the Free plan.",
      },
    }),
  ]);

  // Log the cancellation for admin dashboard
  if (previousPlan !== "FREE") {
    await logAudit({
      actorId: "STRIPE_WEBHOOK",
      actorEmail: "stripe@system",
      actorRole: "SYSTEM",
      action: "SUBSCRIPTION_CANCELED",
      resource: "user_plan",
      resourceId: existingSubscription.userId,
      targetUserId: existingSubscription.userId,
      targetEmail: existingSubscription.user.email,
      details: {
        previousPlan,
        newPlan: "FREE",
        reason: "Subscription canceled",
        source: "stripe_webhook",
      },
    });
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === "string"
    ? invoice.customer
    : invoice.customer?.id;
  if (!customerId) {
    console.error("Missing customer ID in payment succeeded");
    return;
  }

  const subscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!subscription) {
    return;
  }

  await prisma.alert.create({
    data: {
      userId: subscription.userId,
      type: "PAYMENT_SUCCEEDED",
      title: "Payment Successful",
      message: `Your payment of $${(invoice.amount_paid / 100).toFixed(2)} was successful.`,
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === "string"
    ? invoice.customer
    : invoice.customer?.id;
  if (!customerId) {
    console.error("Missing customer ID in payment failed");
    return;
  }

  const subscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!subscription) {
    return;
  }

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "past_due" },
    }),
    prisma.alert.create({
      data: {
        userId: subscription.userId,
        type: "PAYMENT_FAILED",
        title: "Payment Failed",
        message: "Your payment failed. Please update your payment method to continue using premium features.",
      },
    }),
  ]);

  // Create support ticket for payment failure (non-blocking)
  const failureReason = invoice.last_finalization_error?.message ||
                        invoice.status_transitions?.finalized_at ? "Payment declined" : "Unknown error";
  createPaymentIssueTicket(
    subscription.userId,
    subscription.id,
    failureReason
  ).catch((e) => captureError("stripe-payment-ticket", e instanceof Error ? e : new Error(String(e))));
}

async function handleRefund(charge: Stripe.Charge) {
  const customerId = typeof charge.customer === "string"
    ? charge.customer
    : charge.customer?.id;

  if (!customerId) {
    console.error("No customer ID in refund charge");
    return;
  }

  const subscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
    include: {
      user: {
        select: { email: true, name: true },
      },
    },
  });

  if (!subscription) {
    console.error("No subscription found for refund customer:", customerId);
    return;
  }

  const refundAmount = charge.amount_refunded / 100;
  const isFullRefund = charge.refunded && charge.amount === charge.amount_refunded;

  if (isFullRefund) {
    const previousPlan = subscription.plan;

    // Full refund - cancel subscription and downgrade to FREE
    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          plan: "FREE",
          status: "canceled",
          stripeSubscriptionId: null,
          stripePriceId: null,
        },
      }),
      prisma.user.update({
        where: { id: subscription.userId },
        data: { plan: "FREE" },
      }),
      prisma.alert.create({
        data: {
          userId: subscription.userId,
          type: "REFUND_PROCESSED",
          title: "Refund Processed",
          message: `A full refund of $${refundAmount.toFixed(2)} has been processed. Your account has been moved to the Free plan.`,
        },
      }),
    ]);

    // Log the refund-triggered cancellation for admin dashboard
    if (previousPlan !== "FREE") {
      await logAudit({
        actorId: "STRIPE_WEBHOOK",
        actorEmail: "stripe@system",
        actorRole: "SYSTEM",
        action: "SUBSCRIPTION_CANCELED",
        resource: "user_plan",
        resourceId: subscription.userId,
        targetUserId: subscription.userId,
        targetEmail: subscription.user?.email || "",
        details: {
          previousPlan,
          newPlan: "FREE",
          reason: `Full refund of $${refundAmount.toFixed(2)}`,
          source: "stripe_refund",
        },
      });
    }

    // Cancel the Stripe subscription if it exists
    if (subscription.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      } catch (err) {
        console.error("Failed to cancel Stripe subscription after refund:", err);
      }
    }
  } else {
    // Partial refund - just notify the user
    await prisma.alert.create({
      data: {
        userId: subscription.userId,
        type: "REFUND_PROCESSED",
        title: "Partial Refund Processed",
        message: `A partial refund of $${refundAmount.toFixed(2)} has been processed.`,
      },
    });
  }

  // Send refund confirmation email
  if (subscription.user?.email) {
    sendRefundConfirmationEmail(
      subscription.user.email,
      subscription.user.name || "",
      refundAmount,
      isFullRefund
    ).catch((e) => captureError("stripe-refund-email", e instanceof Error ? e : new Error(String(e))));
  }
}

// ==========================================
// CORPORATE WEBHOOK HANDLERS
// ==========================================

async function handleCorporateCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier;
  const companyName = session.metadata?.companyName;

  if (!userId || !tier || !companyName) {
    console.error("[Corporate Webhook] Missing metadata in checkout session");
    return;
  }

  const tierData = CORPORATE_TIERS.find((t) => t.id === tier);
  if (!tierData) {
    console.error("[Corporate Webhook] Unknown tier:", tier);
    return;
  }

  const subscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : session.subscription?.id;

  const customerId = typeof session.customer === "string"
    ? session.customer
    : session.customer?.id;

  // Check for existing account (idempotency)
  const existing = await prisma.corporateAccount.findUnique({
    where: { adminUserId: userId },
  });
  if (existing) {
    console.log("[Corporate Webhook] Account already exists for user:", userId);
    return;
  }

  // Create corporate account + empty seats in a transaction
  await prisma.$transaction(async (tx) => {
    const account = await tx.corporateAccount.create({
      data: {
        name: companyName,
        tier,
        maxSeats: tierData.maxSeats,
        adminUserId: userId,
        stripeCustomerId: customerId || null,
        stripeSubscriptionId: subscriptionId || null,
        status: "ACTIVE",
      },
    });

    // Create empty seats
    const seatData = Array.from({ length: tierData.maxSeats }, () => ({
      corporateAccountId: account.id,
      status: "INVITED" as const,
    }));

    await tx.corporateSeat.createMany({ data: seatData });

    // Update user plan
    await tx.user.update({
      where: { id: userId },
      data: { plan: "ENTERPRISE" },
    });

    // Create welcome alert
    await tx.alert.create({
      data: {
        userId,
        type: "SUBSCRIPTION_UPDATED",
        title: "Corporate Plan Activated",
        message: `Your ${tierData.name} Corporate Plan with ${tierData.maxSeats} seats is now active!`,
      },
    });
  });

  // Send welcome email (non-blocking)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (user?.email) {
    sendCorporateWelcomeEmail(
      user.email,
      companyName,
      tier,
      tierData.maxSeats
    ).catch((e) => captureError("corporate-welcome-email", e instanceof Error ? e : new Error(String(e))));
  }

  // Log audit
  await logAudit({
    actorId: "STRIPE_WEBHOOK",
    actorEmail: "stripe@system",
    actorRole: "SYSTEM",
    action: "PLAN_UPGRADE",
    resource: "corporate_account",
    resourceId: userId,
    targetUserId: userId,
    targetEmail: user?.email || "",
    details: {
      tier,
      companyName,
      maxSeats: tierData.maxSeats,
      source: "stripe_corporate_checkout",
    },
  });
}

async function handleCorporateSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  const account = await prisma.corporateAccount.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
    include: { seats: { where: { status: "ACTIVE" } } },
  });

  if (!account) {
    console.log("[Corporate Webhook] No account found for subscription:", subscriptionId);
    return;
  }

  // Suspend account and deactivate all seats
  await prisma.$transaction(async (tx) => {
    await tx.corporateAccount.update({
      where: { id: account.id },
      data: { status: "SUSPENDED" },
    });

    // Deactivate all active seats
    await tx.corporateSeat.updateMany({
      where: { corporateAccountId: account.id, status: "ACTIVE" },
      data: { status: "DEACTIVATED" },
    });

    // Downgrade all seat-holder users to FREE
    const userIds = account.seats.map((s) => s.userId).filter(Boolean) as string[];
    if (userIds.length > 0) {
      await tx.user.updateMany({
        where: { id: { in: userIds } },
        data: { plan: "FREE" },
      });
    }

    // Downgrade admin user
    await tx.user.update({
      where: { id: account.adminUserId },
      data: { plan: "FREE" },
    });

    await tx.alert.create({
      data: {
        userId: account.adminUserId,
        type: "SUBSCRIPTION_CANCELED",
        title: "Corporate Plan Canceled",
        message: "Your corporate subscription has been canceled. All seats have been deactivated.",
      },
    });
  });
}
