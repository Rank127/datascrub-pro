// Family Invitation API
// POST - Send a new family invitation

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createInvitation, getOrCreateFamilyGroup } from "@/lib/family";
import { prisma } from "@/lib/db";
import { sendFamilyInvitationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's plan - must be Enterprise
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userPlan = user.subscription?.plan || user.plan;
    if (userPlan !== "ENTERPRISE") {
      return NextResponse.json(
        { error: "Family plan is only available with Enterprise subscription" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Can't invite yourself
    if (email.toLowerCase() === user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "You cannot invite yourself" },
        { status: 400 }
      );
    }

    // Get or create family group
    const familyGroup = await getOrCreateFamilyGroup(userId);

    // Create invitation
    const result = await createInvitation(familyGroup.id, email, userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Send invitation email
    let emailSent = true;
    try {
      // Get the token for the email
      const invitation = await prisma.familyInvitation.findFirst({
        where: {
          familyGroupId: familyGroup.id,
          email: email.toLowerCase(),
          status: "PENDING",
        },
        orderBy: { createdAt: "desc" },
      });

      if (invitation) {
        await sendFamilyInvitationEmail(
          email,
          invitation.token,
          user.name || user.email,
          familyGroup.name
        );
      }
    } catch (emailError) {
      emailSent = false;
      const { captureError } = await import("@/lib/error-reporting");
      captureError("family-invite", emailError instanceof Error ? emailError : new Error(String(emailError)));
    }

    return NextResponse.json({
      success: true,
      invitation: result.invitation,
      ...(emailSent ? {} : { warning: "Invitation created but email delivery failed. The invitee can use the invitation link directly." }),
    });
  } catch (error) {
    console.error("Error creating family invitation:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}
