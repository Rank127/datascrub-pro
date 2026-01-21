import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe, PLAN_TO_PRICE } from "@/lib/stripe";
import { z } from "zod";

const checkoutSchema = z.object({
  plan: z.enum(["PRO", "ENTERPRISE"]),
  billingPeriod: z.enum(["monthly", "yearly"]).optional().default("monthly"),
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

    // Get the price ID based on plan and billing period
    const priceEnvKey = `STRIPE_${plan}_${billingPeriod.toUpperCase()}_PRICE_ID`;
    const priceId = process.env[priceEnvKey] || PLAN_TO_PRICE[plan];

    // Create checkout session
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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL}/dashboard/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL}/dashboard/settings?canceled=true`,
      metadata: {
        userId: session.user.id,
        plan,
      },
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
