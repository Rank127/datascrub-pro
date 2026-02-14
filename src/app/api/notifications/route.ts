import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const notificationSchema = z.object({
  emailNotifications: z.boolean().optional(),
  newExposureAlerts: z.boolean().optional(),
  removalUpdates: z.boolean().optional(),
  weeklyReports: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  reportFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
}).strict();

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
    const parsed = notificationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      emailNotifications,
      newExposureAlerts,
      removalUpdates,
      weeklyReports,
      marketingEmails,
      reportFrequency,
    } = parsed.data;

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
