import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe, PLAN_TO_PRICE, getPlanFromPriceId } from "@/lib/stripe";
import { getExistingActiveSubscription, upgradeSubscription } from "@/lib/stripe/sync";
import { logAudit } from "@/lib/rbac/audit-log";
import { z } from "zod";

const PLAN_HIERARCHY: Record<string, number> = {
  FREE: 0,
  PRO: 1,
  ENTERPRISE: 2,
};

const checkoutSchema = z.object({
  plan: z.enum(["PRO", "ENTERPRISE"]),
  billingPeriod: z.enum(["monthly", "yearly"]).optional().default("yearly"),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { plan, billingPeriod } = result.data;

    // Get the price ID based on plan and billing period
    const priceEnvKey = `STRIPE_${plan}_${billingPeriod.toUpperCase()}_PRICE_ID`;
    const priceId = process.env[priceEnvKey] || PLAN_TO_PRICE[plan];

    // Get or create Stripe customer
    let subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: session.user.email!,
        name: session.user.name || undefined,
        metadata: {
          userId: session.user.id,
        },
      });
      customerId = customer.id;

      // Create or update subscription record
      subscription = await prisma.subscription.upsert({
        where: { userId: session.user.id },
        update: { stripeCustomerId: customerId },
        create: {
          userId: session.user.id,
          stripeCustomerId: customerId,
          plan: "FREE",
          status: "active",
        },
      });
    }

    // Check for existing active subscription - PREVENT DUPLICATES
    const existingSubscription = await getExistingActiveSubscription(customerId);

    if (existingSubscription) {
      const currentPriceId = existingSubscription.items.data[0]?.price.id || "";
      const currentPlan = getPlanFromPriceId(currentPriceId);
      const currentRank = PLAN_HIERARCHY[currentPlan] ?? 0;
      const newRank = PLAN_HIERARCHY[plan] ?? 0;

      if (newRank <= currentRank) {
        // User already has equal or higher plan
        return NextResponse.json(
          {
            error: `You already have an active ${currentPlan} subscription. To change plans, please manage your subscription in the billing portal.`,
            currentPlan,
            existingSubscriptionId: existingSubscription.id,
          },
          { status: 400 }
        );
      }

      // Upgrade existing subscription instead of creating new
      try {
        const upgraded = await upgradeSubscription(existingSubscription.id, priceId);

        // Update database
        const periodEnd = upgraded.items.data[0]?.current_period_end;
        await prisma.$transaction([
          prisma.subscription.update({
            where: { userId: session.user.id },
            data: {
              stripeSubscriptionId: upgraded.id,
              stripePriceId: priceId,
              stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
              plan,
              status: "active",
            },
          }),
          prisma.user.update({
            where: { id: session.user.id },
            data: { plan },
          }),
          prisma.alert.create({
            data: {
              userId: session.user.id,
              type: "SUBSCRIPTION_UPDATED",
              title: "Plan Upgraded",
              message: `Your subscription has been upgraded from ${currentPlan} to ${plan}!`,
            },
          }),
        ]);

        // Log the upgrade
        await logAudit({
          actorId: session.user.id,
          actorEmail: session.user.email || "",
          actorRole: "USER",
          action: "PLAN_UPGRADE",
          resource: "user_plan",
          resourceId: session.user.id,
          targetUserId: session.user.id,
          targetEmail: session.user.email || "",
          details: {
            previousPlan: currentPlan,
            newPlan: plan,
            reason: "In-app upgrade",
            source: "checkout_upgrade",
          },
        });

        return NextResponse.json({
          success: true,
          upgraded: true,
          message: `Upgraded from ${currentPlan} to ${plan}`,
          previousPlan: currentPlan,
          newPlan: plan,
        });
      } catch (upgradeError) {
        console.error("Upgrade failed, falling back to checkout:", upgradeError);
        // If upgrade fails, proceed to normal checkout
      }
    }

    // Create checkout session for new subscription
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL;
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/welcome?plan=${plan}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      metadata: {
        userId: session.user.id,
        plan,
      },
      // Prevent creating if already subscribed
      subscription_data: {
        metadata: {
          userId: session.user.id,
          plan,
        },
      },
      // Checkout experience enhancements
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      phone_number_collection: { enabled: true },
      custom_text: {
        submit: {
          message: "Your data protection starts immediately. 30-day money-back guarantee.",
        },
        after_submit: {
          message: "Welcome to GhostMyData! Redirecting you to start protecting your data...",
        },
      },
      // Session expires in 30 minutes (urgency)
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create checkout session: ${errorMessage}` },
      { status: 500 }
    );
  }
}
