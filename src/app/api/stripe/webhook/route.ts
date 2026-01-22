import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { stripe, getPlanFromPriceId } from "@/lib/stripe";
import { sendSubscriptionEmail, sendRefundConfirmationEmail } from "@/lib/email";
import Stripe from "stripe";

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
        await handleCheckoutCompleted(session);
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
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
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

  const subscriptionId = session.subscription as string;

  // Fetch the subscription details
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;

  // Get user details for email
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  // Get current period end from subscription items
  const currentPeriodEnd = stripeSubscription.items.data[0]?.current_period_end;
  const periodEndDate = currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null;

  await prisma.$transaction([
    // Update subscription record
    prisma.subscription.upsert({
      where: { userId },
      update: {
        stripeSubscriptionId: subscriptionId,
        stripePriceId: stripeSubscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: periodEndDate,
        plan,
        status: "active",
      },
      create: {
        userId,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: subscriptionId,
        stripePriceId: stripeSubscription.items.data[0]?.price.id,
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
    sendSubscriptionEmail(user.email, user.name || "", plan).catch(console.error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!existingSubscription) {
    console.error("No subscription found for customer:", customerId);
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
  const periodEndDate = currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null;
  const plan = getPlanFromPriceId(priceId || "");
  const status = subscription.status === "active" ? "active" :
                 subscription.status === "past_due" ? "past_due" : "canceled";

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: periodEndDate,
        plan,
        status,
      },
    }),
    prisma.user.update({
      where: { id: existingSubscription.userId },
      data: { plan },
    }),
  ]);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!existingSubscription) {
    return;
  }

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
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

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
  const customerId = invoice.customer as string;

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
}

async function handleRefund(charge: Stripe.Charge) {
  const customerId = charge.customer as string;

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
    ).catch(console.error);
  }
}
