// Family Member Management API
// DELETE - Remove a member from the family group

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { removeMember } from "@/lib/family";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: memberId } = await params;

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    const result = await removeMember(memberId, session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Member removed from family plan",
    });
  } catch (error) {
    console.error("Error removing family member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
