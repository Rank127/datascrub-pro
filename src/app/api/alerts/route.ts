import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/alerts - Get user's alerts
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [alerts, unreadCount] = await Promise.all([
      prisma.alert.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 50, // Limit to last 50 alerts
      }),
      prisma.alert.count({
        where: { userId: session.user.id, isRead: false },
      }),
    ]);

    return NextResponse.json({ alerts, unreadCount });
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

// PATCH /api/alerts - Mark alerts as read
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { alertId, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all alerts as read
      await prisma.alert.updateMany({
        where: {
          userId: session.user.id,
          isRead: false,
        },
        data: { isRead: true },
      });

      return NextResponse.json({ success: true, message: "All alerts marked as read" });
    }

    if (alertId) {
      // Mark single alert as read
      const alert = await prisma.alert.updateMany({
        where: {
          id: alertId,
          userId: session.user.id, // Ensure user owns this alert
        },
        data: { isRead: true },
      });

      if (alert.count === 0) {
        return NextResponse.json({ error: "Alert not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Missing alertId or markAllAsRead" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Failed to update alert:", error);
    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 }
    );
  }
}

// DELETE /api/alerts - Delete an alert
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get("id");

    if (!alertId) {
      return NextResponse.json({ error: "Missing alert ID" }, { status: 400 });
    }

    const result = await prisma.alert.deleteMany({
      where: {
        id: alertId,
        userId: session.user.id, // Ensure user owns this alert
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete alert:", error);
    return NextResponse.json(
      { error: "Failed to delete alert" },
      { status: 500 }
    );
  }
}
