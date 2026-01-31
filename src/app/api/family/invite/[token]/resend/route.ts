// Resend Family Invitation API
// POST - Resend an invitation with new token and extended expiry

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resendInvitation } from "@/lib/family";
import { sendFamilyInvitationEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required" },
        { status: 400 }
      );
    }

    // Get invitation by token OR by ID (frontend may pass either)
    let invitation = await prisma.familyInvitation.findUnique({
      where: { token },
      include: {
        familyGroup: {
          include: {
            owner: { select: { name: true, email: true } },
          },
        },
      },
    });

    // If not found by token, try finding by ID
    if (!invitation) {
      invitation = await prisma.familyInvitation.findUnique({
        where: { id: token },
        include: {
          familyGroup: {
            include: {
              owner: { select: { name: true, email: true } },
            },
          },
        },
      });
    }

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    const result = await resendInvitation(invitation.id, session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Get the updated invitation with new token
    const updatedInvitation = await prisma.familyInvitation.findUnique({
      where: { id: invitation.id },
    });

    // Send the invitation email with the new token
    if (updatedInvitation) {
      try {
        await sendFamilyInvitationEmail(
          updatedInvitation.email,
          updatedInvitation.token,
          invitation.familyGroup.owner.name || invitation.familyGroup.owner.email,
          invitation.familyGroup.name
        );
      } catch (emailError) {
        console.error("Failed to send invitation email:", emailError);
        // Don't fail the request
      }
    }

    return NextResponse.json({
      success: true,
      invitation: result.invitation,
      message: "Invitation resent successfully",
    });
  } catch (error) {
    console.error("Error resending invitation:", error);
    return NextResponse.json(
      { error: "Failed to resend invitation" },
      { status: 500 }
    );
  }
}
