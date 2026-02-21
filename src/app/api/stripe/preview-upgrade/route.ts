import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe, PLAN_TO_PRICE, getPlanFromPriceId } from "@/lib/stripe";
import { getExistingActiveSubscription } from "@/lib/stripe/sync";
import { z } from "zod";

const PLAN_HIERARCHY: Record<string, number> = {
  FREE: 0,
  PRO: 1,
  ENTERPRISE: 2,
};

const previewSchema = z.object({
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
    const result = previewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { plan, billingPeriod } = result.data;

    // Get the target price ID
    // .trim() guards against env vars with trailing whitespace/newlines
    const priceEnvKey = `STRIPE_${plan}_${billingPeriod.toUpperCase()}_PRICE_ID`;
    const newPriceId = (process.env[priceEnvKey] || PLAN_TO_PRICE[plan]).trim();

    // Get subscription record
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 400 }
      );
    }

    // Get existing active subscription from Stripe
    const existingSubscription = await getExistingActiveSubscription(
      subscription.stripeCustomerId
    );

    if (!existingSubscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    // Check plan hierarchy
    const currentPriceId = existingSubscription.items.data[0]?.price.id || "";
    const currentPlan = getPlanFromPriceId(currentPriceId);
    const currentRank = PLAN_HIERARCHY[currentPlan] ?? 0;
    const newRank = PLAN_HIERARCHY[plan] ?? 0;

    if (newRank <= currentRank) {
      return NextResponse.json(
        {
          error: `You already have an active ${currentPlan} subscription.`,
          currentPlan,
        },
        { status: 400 }
      );
    }

    // Generate proration preview using Stripe's invoice preview
    const preview = await stripe.invoices.createPreview({
      customer: subscription.stripeCustomerId,
      subscription: existingSubscription.id,
      subscription_details: {
        items: [
          {
            id: existingSubscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: "always_invoice",
      },
    });

    // Extract line items — proration lines show credits and charges
    const lineItems = preview.lines.data.map((line) => ({
      description: line.description,
      amount: line.amount, // cents (negative = credit, positive = charge)
      period: {
        start: new Date(line.period.start * 1000).toISOString(),
        end: new Date(line.period.end * 1000).toISOString(),
      },
    }));

    // The total due today (proration amount)
    const prorationAmount = preview.amount_due; // cents

    // Current period end (when the next full-price charge starts)
    const currentPeriodEnd = existingSubscription.items.data[0]?.current_period_end;

    return NextResponse.json({
      prorationAmount, // cents — what gets charged today
      newPlanPrice: preview.lines.data.find((l) => l.amount > 0)?.amount || 0, // recurring charge info
      currency: preview.currency,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : null,
      previousPlan: currentPlan,
      newPlan: plan,
      lineItems,
    });
  } catch (error) {
    console.error("Preview upgrade error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to preview upgrade: ${errorMessage}` },
      { status: 500 }
    );
  }
}
