import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { logAudit } from "@/lib/rbac/audit-log";
import { sendCancellationEmail, sendReactivationEmail } from "@/lib/email";

// POST /api/subscription/cancel - Cancel subscription at end of billing period
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { immediate = false, reason } = body;

    // Get user's subscription with stats
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            email: true,
            plan: true,
            name: true,
            _count: {
              select: {
                exposures: true,
              }
            }
          },
        },
      },
    });

    // Get removal stats for the email
    const removalStats = await prisma.removalRequest.count({
      where: {
        userId: session.user.id,
        status: { in: ["COMPLETED", "VERIFIED_REMOVED"] },
      },
    });

    if (!subscription?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Get subscription from Stripe to check dates
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    const startDate = new Date(stripeSubscription.start_date * 1000);
    const now = new Date();
    const daysSinceStart = Math.floor(
      (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Determine cancellation type
    // - Under 30 days: Allow immediate cancellation (refund eligible)
    // - Over 30 days OR user chooses: Cancel at period end
    const shouldCancelImmediately = immediate && daysSinceStart < 30;

    let canceledSubscription;
    let periodEnd: Date | null = null;

    if (shouldCancelImmediately) {
      // Immediate cancellation
      canceledSubscription = await stripe.subscriptions.cancel(
        subscription.stripeSubscriptionId
      );

      // Update database immediately
      await prisma.$transaction([
        prisma.subscription.update({
          where: { userId: session.user.id },
          data: {
            status: "canceled",
            plan: "FREE",
            stripeSubscriptionId: null,
            stripePriceId: null,
          },
        }),
        prisma.user.update({
          where: { id: session.user.id },
          data: { plan: "FREE" },
        }),
        prisma.alert.create({
          data: {
            userId: session.user.id,
            type: "SUBSCRIPTION_CANCELED",
            title: "Subscription Canceled",
            message: "Your subscription has been canceled and you've been moved to the Free plan.",
          },
        }),
      ]);
    } else {
      // Cancel at period end - user keeps access until billing cycle ends
      canceledSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        { cancel_at_period_end: true }
      );

      const currentPeriodEnd = (canceledSubscription as { current_period_end?: number }).current_period_end;
      periodEnd = currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : subscription.stripeCurrentPeriodEnd;

      // Update database - keep plan active but mark as canceling
      await prisma.$transaction([
        prisma.subscription.update({
          where: { userId: session.user.id },
          data: {
            status: "canceling", // New status to indicate pending cancellation
            stripeCurrentPeriodEnd: periodEnd,
          },
        }),
        prisma.alert.create({
          data: {
            userId: session.user.id,
            type: "SUBSCRIPTION_UPDATED",
            title: "Subscription Cancellation Scheduled",
            message: `Your subscription will be canceled on ${periodEnd?.toLocaleDateString()}. You'll keep access to all features until then.`,
          },
        }),
      ]);

      // Send cancellation email with remaining time reminder
      if (subscription.user.email && periodEnd) {
        sendCancellationEmail(
          subscription.user.email,
          subscription.user.name || "",
          subscription.plan,
          periodEnd,
          {
            exposuresFound: subscription.user._count?.exposures || 0,
            removalsCompleted: removalStats,
          }
        ).catch((err) => {
          console.error("Failed to send cancellation email:", err);
        });
      }
    }

    // Log the cancellation
    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email || "",
      actorRole: "USER",
      action: "SUBSCRIPTION_CANCELED",
      resource: "subscription",
      resourceId: subscription.id,
      targetUserId: session.user.id,
      targetEmail: session.user.email || "",
      details: {
        previousPlan: subscription.plan,
        immediate: shouldCancelImmediately,
        periodEnd: periodEnd?.toISOString(),
        reason: reason || "User requested cancellation",
        daysSinceStart,
      },
    });

    return NextResponse.json({
      success: true,
      immediate: shouldCancelImmediately,
      periodEnd: periodEnd?.toISOString(),
      message: shouldCancelImmediately
        ? "Subscription canceled immediately"
        : `Subscription will cancel on ${periodEnd?.toLocaleDateString()}. You keep full access until then.`,
    });
  } catch (error) {
    console.error("Subscription cancellation error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}

// DELETE /api/subscription/cancel - Undo pending cancellation
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    });

    if (!subscription?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Check if subscription is set to cancel at period end
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    if (!stripeSubscription.cancel_at_period_end) {
      return NextResponse.json(
        { error: "Subscription is not scheduled for cancellation" },
        { status: 400 }
      );
    }

    // Undo the cancellation
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    // Update database
    await prisma.$transaction([
      prisma.subscription.update({
        where: { userId: session.user.id },
        data: { status: "active" },
      }),
      prisma.alert.create({
        data: {
          userId: session.user.id,
          type: "SUBSCRIPTION_UPDATED",
          title: "Cancellation Reversed",
          message: "Your subscription cancellation has been reversed. Your plan will continue as normal.",
        },
      }),
    ]);

    // Send reactivation email
    if (subscription.user?.email) {
      sendReactivationEmail(
        subscription.user.email,
        subscription.user.name || "",
        subscription.plan
      ).catch((err) => {
        console.error("Failed to send reactivation email:", err);
      });
    }

    return NextResponse.json({
      success: true,
      message: "Subscription cancellation has been reversed",
    });
  } catch (error) {
    console.error("Undo cancellation error:", error);
    return NextResponse.json(
      { error: "Failed to undo cancellation" },
      { status: 500 }
    );
  }
}
