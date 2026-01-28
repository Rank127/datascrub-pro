// Leave Family API
// POST - Leave a family group voluntarily

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { leaveFamily } from "@/lib/family";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await leaveFamily(session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "You have left the family plan",
    });
  } catch (error) {
    console.error("Error leaving family:", error);
    return NextResponse.json(
      { error: "Failed to leave family" },
      { status: 500 }
    );
  }
}
