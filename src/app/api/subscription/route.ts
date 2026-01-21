import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isAdmin, getEffectivePlan } from "@/lib/admin";

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
      select: { plan: true, email: true },
    });

    const userIsAdmin = isAdmin(user?.email);
    const effectivePlan = getEffectivePlan(user?.email, subscription?.plan || user?.plan || "FREE");

    return NextResponse.json({
      plan: effectivePlan,
      status: subscription?.status || "active",
      currentPeriodEnd: userIsAdmin ? null : (subscription?.stripeCurrentPeriodEnd?.toISOString() || null),
      hasStripeSubscription: userIsAdmin ? false : !!subscription?.stripeSubscriptionId,
      isAdmin: userIsAdmin,
    });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
