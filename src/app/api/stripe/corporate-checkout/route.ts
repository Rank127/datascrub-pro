import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe, getCorporatePriceId } from "@/lib/stripe";
import { CORPORATE_TIERS } from "@/lib/corporate/types";

const SELF_SERVE_TIERS = ["CORP_10", "CORP_25"];
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ghostmydata.com";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { tier, companyName } = body as { tier: string; companyName: string };

  if (!tier || !companyName?.trim()) {
    return NextResponse.json(
      { error: "Missing required fields: tier and companyName" },
      { status: 400 }
    );
  }

  // Validate tier
  const tierData = CORPORATE_TIERS.find((t) => t.id === tier);
  if (!tierData) {
    return NextResponse.json({ error: "Invalid corporate tier" }, { status: 400 });
  }

  // Large/XL tiers use Net 30 invoice billing — not self-serve checkout
  if (!SELF_SERVE_TIERS.includes(tier)) {
    return NextResponse.json(
      {
        error: "Large and XL plans require a sales consultation for Net 30 invoice billing.",
        contactSales: true,
      },
      { status: 400 }
    );
  }

  // Prevent duplicate corporate accounts
  const existing = await prisma.corporateAccount.findUnique({
    where: { adminUserId: session.user.id },
  });
  if (existing) {
    return NextResponse.json(
      { error: "You already have a corporate account" },
      { status: 409 }
    );
  }

  try {
    const stripe = getStripe();
    const priceId = getCorporatePriceId(tier);

    // Get or create Stripe customer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    // Look up existing Stripe customer or create one
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    const customerId =
      customers.data[0]?.id ||
      (
        await stripe.customers.create({
          email: user.email,
          name: companyName,
          metadata: { userId: session.user.id, type: "corporate" },
        })
      ).id;

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        userId: session.user.id,
        tier,
        companyName: companyName.trim(),
        type: "corporate",
      },
      success_url: `${APP_URL}/dashboard/corporate-welcome?tier=${tier}`,
      cancel_url: `${APP_URL}/corporate?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[Corporate Checkout] Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
