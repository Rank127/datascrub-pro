// Family Invitation Token API
// GET - Get invitation details by token
// POST - Accept invitation

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getInvitationByToken, acceptInvitation } from "@/lib/family";
import { prisma } from "@/lib/db";
import { sendFamilyMemberJoinedEmail } from "@/lib/email";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required" },
        { status: 400 }
      );
    }

    const invitation = await getInvitationByToken(token);

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ invitation });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitation" },
      { status: 500 }
    );
  }
}

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

    // Check if user is already in a family
    const existingMembership = await prisma.familyMember.findUnique({
      where: { userId: session.user.id },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "You are already a member of a family group" },
        { status: 400 }
      );
    }

    // Accept the invitation
    const result = await acceptInvitation(token, session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Send notification email to owner
    try {
      const invitation = await prisma.familyInvitation.findUnique({
        where: { token },
        include: {
          familyGroup: {
            include: {
              owner: { select: { email: true, name: true } },
            },
          },
        },
      });

      if (invitation) {
        const newMember = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, email: true },
        });

        if (newMember) {
          await sendFamilyMemberJoinedEmail(
            invitation.familyGroup.owner.email,
            invitation.familyGroup.owner.name,
            newMember.name || newMember.email
          );
        }
      }
    } catch (emailError) {
      console.error("Failed to send member joined email:", emailError);
      // Don't fail the request
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined the family plan",
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
