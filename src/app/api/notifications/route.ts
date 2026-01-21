import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/notifications - Get notification preferences
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        emailNotifications: true,
        newExposureAlerts: true,
        removalUpdates: true,
        weeklyReports: true,
        marketingEmails: true,
        reportFrequency: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to fetch notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Update notification preferences
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      emailNotifications,
      newExposureAlerts,
      removalUpdates,
      weeklyReports,
      marketingEmails,
      reportFrequency,
    } = body;

    // Validate reportFrequency
    const validFrequencies = ["daily", "weekly", "monthly"];
    if (reportFrequency && !validFrequencies.includes(reportFrequency)) {
      return NextResponse.json(
        { error: "Invalid report frequency" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(typeof emailNotifications === "boolean" && { emailNotifications }),
        ...(typeof newExposureAlerts === "boolean" && { newExposureAlerts }),
        ...(typeof removalUpdates === "boolean" && { removalUpdates }),
        ...(typeof weeklyReports === "boolean" && { weeklyReports }),
        ...(typeof marketingEmails === "boolean" && { marketingEmails }),
        ...(reportFrequency && { reportFrequency }),
      },
      select: {
        emailNotifications: true,
        newExposureAlerts: true,
        removalUpdates: true,
        weeklyReports: true,
        marketingEmails: true,
        reportFrequency: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to update notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
