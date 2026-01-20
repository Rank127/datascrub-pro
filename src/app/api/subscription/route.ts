import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    // Get user's plan from User table as fallback
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });

    return NextResponse.json({
      plan: subscription?.plan || user?.plan || "FREE",
      status: subscription?.status || "active",
      currentPeriodEnd: subscription?.stripeCurrentPeriodEnd?.toISOString() || null,
      hasStripeSubscription: !!subscription?.stripeSubscriptionId,
    });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
