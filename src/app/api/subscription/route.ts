import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { getEffectivePlanDetails } from "@/lib/family/family-service";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's email for admin check
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    const userIsAdmin = isAdmin(user?.email);

    // Get detailed plan info (checks subscription + family membership)
    const planDetails = await getEffectivePlanDetails(session.user.id);

    return NextResponse.json({
      // Basic info (backwards compatible)
      plan: planDetails.plan,
      status: planDetails.subscriptionInfo?.status || "active",
      currentPeriodEnd: userIsAdmin ? null : (planDetails.subscriptionInfo?.currentPeriodEnd?.toISOString() || null),
      hasStripeSubscription: userIsAdmin ? false : !!planDetails.subscriptionInfo?.stripeSubscriptionId,
      isAdmin: userIsAdmin,

      // New detailed info
      planSource: planDetails.source, // "DIRECT" | "FAMILY" | "STAFF" | "DEFAULT"
      isOwner: planDetails.isOwner,   // true if they own this plan (not inherited)

      // Family info (if applicable)
      familyPlan: planDetails.familyInfo ? {
        familyGroupId: planDetails.familyInfo.familyGroupId,
        familyName: planDetails.familyInfo.familyName,
        role: planDetails.familyInfo.role,           // "OWNER" or "MEMBER"
        ownerName: planDetails.familyInfo.ownerName, // Who pays for the plan
        ownerEmail: planDetails.isOwner ? undefined : planDetails.familyInfo.ownerEmail,
        // Accurate member/seat tracking
        memberCount: planDetails.familyInfo.memberCount,
        pendingInvitations: planDetails.familyInfo.pendingInvitations,
        maxMembers: planDetails.familyInfo.maxMembers,
        spotsRemaining: planDetails.familyInfo.spotsRemaining,
      } : null,
    });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
