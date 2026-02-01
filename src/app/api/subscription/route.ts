import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { getEffectivePlan } from "@/lib/family/family-service";

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

    // Get user's email for admin check
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    const userIsAdmin = isAdmin(user?.email);
    // Get effective plan (checks subscription + family membership)
    const effectivePlan = await getEffectivePlan(session.user.id);

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
