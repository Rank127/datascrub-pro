import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get subscription with Stripe customer ID
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found. Please subscribe first." },
        { status: 400 }
      );
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL}/dashboard/settings`;
    const configId = process.env.STRIPE_PORTAL_CONFIG_ID;

    // Try with custom config first, fall back to default if it fails
    let portalSession;
    if (configId) {
      try {
        portalSession = await stripe.billingPortal.sessions.create({
          customer: subscription.stripeCustomerId,
          configuration: configId,
          return_url: returnUrl,
        });
      } catch (configError) {
        console.error("Portal config error, falling back to default:", configError);
        portalSession = await stripe.billingPortal.sessions.create({
          customer: subscription.stripeCustomerId,
          return_url: returnUrl,
        });
      }
    } else {
      portalSession = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: returnUrl,
      });
    }

    if (!portalSession?.url) {
      return NextResponse.json(
        { error: "Stripe returned no portal URL. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Portal error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create billing portal session: ${msg}` },
      { status: 500 }
    );
  }
}
