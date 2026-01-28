// Family Group API
// GET - Get family group info for the authenticated user

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getOrCreateFamilyGroup,
  getFamilyGroupForUser,
  getFamilyMembership,
} from "@/lib/family";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userPlan = user.subscription?.plan || user.plan;

    // Check if user is an Enterprise owner
    if (userPlan === "ENTERPRISE") {
      // Get or create family group for Enterprise user
      const familyGroup = await getOrCreateFamilyGroup(userId);
      return NextResponse.json({
        isOwner: true,
        familyGroup,
      });
    }

    // Check if user is a family member
    const membership = await getFamilyMembership(userId);
    if (membership) {
      return NextResponse.json({
        isOwner: false,
        isMember: true,
        membership,
      });
    }

    // Check if user has any family group at all (they might be the owner in the DB but not Enterprise anymore)
    const existingGroup = await getFamilyGroupForUser(userId);
    if (existingGroup) {
      return NextResponse.json({
        isOwner: existingGroup.ownerId === userId,
        familyGroup: existingGroup,
      });
    }

    // User is not Enterprise and not in a family
    return NextResponse.json({
      isOwner: false,
      isMember: false,
      message: "Family plan is available with Enterprise subscription",
    });
  } catch (error) {
    console.error("Error fetching family info:", error);
    return NextResponse.json(
      { error: "Failed to fetch family info" },
      { status: 500 }
    );
  }
}
