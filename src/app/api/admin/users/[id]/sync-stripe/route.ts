import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkPermission } from "@/lib/admin";
import { syncUserFromStripe, getCustomerSubscriptions } from "@/lib/stripe/sync";
import { getPlanFromPriceId } from "@/lib/stripe";

// GET - View Stripe subscription status for a user
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });

    if (!checkPermission(currentUser?.email, currentUser?.role, "modify_user_plan")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: userId } = await params;

    // Get user and subscription from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, plan: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const dbSubscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!dbSubscription?.stripeCustomerId) {
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
        },
        database: {
          plan: dbSubscription?.plan || "FREE",
          status: dbSubscription?.status || "none",
          stripeCustomerId: null,
        },
        stripe: {
          subscriptions: [],
          activeSubscriptions: 0,
          highestPlan: "FREE",
        },
        inSync: user.plan === "FREE",
        message: "No Stripe customer ID found",
      });
    }

    // Fetch subscriptions from Stripe
    const stripeSubscriptions = await getCustomerSubscriptions(dbSubscription.stripeCustomerId);

    const activeSubscriptions = stripeSubscriptions.filter(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );

    // Determine highest plan from active subscriptions
    let highestPlan = "FREE";
    const PLAN_HIERARCHY: Record<string, number> = { FREE: 0, PRO: 1, ENTERPRISE: 2 };

    for (const sub of activeSubscriptions) {
      const priceId = sub.items.data[0]?.price.id || "";
      const plan = getPlanFromPriceId(priceId);
      if ((PLAN_HIERARCHY[plan] ?? 0) > (PLAN_HIERARCHY[highestPlan] ?? 0)) {
        highestPlan = plan;
      }
    }

    const subscriptionDetails = stripeSubscriptions.map((sub) => ({
      id: sub.id,
      status: sub.status,
      plan: getPlanFromPriceId(sub.items.data[0]?.price.id || ""),
      priceId: sub.items.data[0]?.price.id,
      currentPeriodEnd: sub.items.data[0]?.current_period_end
        ? new Date(sub.items.data[0].current_period_end * 1000).toISOString()
        : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      startDate: new Date(sub.start_date * 1000).toISOString(),
    }));

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
      database: {
        plan: dbSubscription.plan,
        status: dbSubscription.status,
        stripeCustomerId: dbSubscription.stripeCustomerId,
        stripeSubscriptionId: dbSubscription.stripeSubscriptionId,
      },
      stripe: {
        subscriptions: subscriptionDetails,
        activeSubscriptions: activeSubscriptions.length,
        highestPlan,
      },
      inSync: user.plan === highestPlan,
      hasDuplicates: activeSubscriptions.length > 1,
      message: user.plan === highestPlan
        ? "Database is in sync with Stripe"
        : `Mismatch: Database shows ${user.plan}, Stripe shows ${highestPlan}`,
    });
  } catch (error) {
    console.error("Stripe sync check error:", error);
    return NextResponse.json(
      { error: "Failed to check Stripe status" },
      { status: 500 }
    );
  }
}

// POST - Sync user from Stripe (fix mismatches)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });

    if (!checkPermission(currentUser?.email, currentUser?.role, "modify_user_plan")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: userId } = await params;
    const body = await request.json().catch(() => ({}));
    const { cancelDuplicates = false, dryRun = false } = body;

    const result = await syncUserFromStripe(userId, { cancelDuplicates, dryRun });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Stripe sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync from Stripe" },
      { status: 500 }
    );
  }
}
