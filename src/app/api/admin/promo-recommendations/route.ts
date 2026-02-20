import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkPermission } from "@/lib/admin";
import {
  getPendingRecommendations,
  approveRecommendation,
  declineRecommendation,
} from "@/lib/promo";

// GET /api/admin/promo-recommendations — list recommendations
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });

    if (!checkPermission(currentUser?.email, currentUser?.role, "view_users_list")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";

    const recommendations = await getPendingRecommendations(status);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("[promo-recommendations] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}

// POST /api/admin/promo-recommendations — approve or decline
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });

    if (!checkPermission(currentUser?.email, currentUser?.role, "view_users_list")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, recommendationId } = body;

    if (!action || !recommendationId) {
      return NextResponse.json(
        { error: "Missing action or recommendationId" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      await approveRecommendation(recommendationId, session.user.id);
      return NextResponse.json({ success: true, status: "APPROVED" });
    } else if (action === "decline") {
      await declineRecommendation(recommendationId);
      return NextResponse.json({ success: true, status: "DECLINED" });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'approve' or 'decline'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[promo-recommendations] POST error:", error);
    return NextResponse.json(
      { error: "Failed to update recommendation" },
      { status: 500 }
    );
  }
}
