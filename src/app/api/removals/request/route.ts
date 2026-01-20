import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import type { Plan, RemovalMethod } from "@/lib/types";

const requestSchema = z.object({
  exposureId: z.string(),
});

// Determine removal method based on data source
function getRemovalMethod(source: string): RemovalMethod {
  const dataBrokers = [
    "SPOKEO",
    "WHITEPAGES",
    "BEENVERIFIED",
    "INTELIUS",
    "PEOPLEFINDER",
    "TRUEPEOPLESEARCH",
    "RADARIS",
    "FASTPEOPLESEARCH",
    "USSEARCH",
    "PIPL",
  ];

  const socialMedia = [
    "LINKEDIN",
    "FACEBOOK",
    "TWITTER",
    "INSTAGRAM",
    "TIKTOK",
    "REDDIT",
    "PINTEREST",
    "YOUTUBE",
  ];

  if (dataBrokers.includes(source)) {
    return "AUTO_FORM";
  }

  if (socialMedia.includes(source)) {
    return "MANUAL_GUIDE";
  }

  if (source.includes("DARK_WEB") || source.includes("PASTE_SITE")) {
    return "MANUAL_GUIDE"; // Can't automate dark web removal
  }

  // Breach databases - send emails
  return "AUTO_EMAIL";
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { exposureId } = result.data;

    // Check user's plan
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });

    const userPlan = (user?.plan || "FREE") as Plan;

    // Free users can't use automated removal
    if (userPlan === "FREE") {
      return NextResponse.json(
        {
          error: "Automated removal requires a paid plan. Please upgrade to PRO.",
          requiresUpgrade: true,
        },
        { status: 403 }
      );
    }

    // Get the exposure
    const exposure = await prisma.exposure.findFirst({
      where: {
        id: exposureId,
        userId: session.user.id,
      },
    });

    if (!exposure) {
      return NextResponse.json(
        { error: "Exposure not found" },
        { status: 404 }
      );
    }

    if (exposure.isWhitelisted) {
      return NextResponse.json(
        { error: "Cannot remove whitelisted items" },
        { status: 400 }
      );
    }

    // Check if removal already requested
    const existingRequest = await prisma.removalRequest.findUnique({
      where: { exposureId },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "Removal already requested", request: existingRequest },
        { status: 400 }
      );
    }

    // Determine removal method
    const method = getRemovalMethod(exposure.source);

    // Create removal request
    const removalRequest = await prisma.removalRequest.create({
      data: {
        userId: session.user.id,
        exposureId,
        method,
        status: "PENDING",
      },
    });

    // Update exposure status
    await prisma.exposure.update({
      where: { id: exposureId },
      data: { status: "REMOVAL_PENDING" },
    });

    // In a real app, this would trigger a background job to:
    // 1. Submit opt-out forms for data brokers
    // 2. Send CCPA/GDPR emails
    // 3. Update status as the removal progresses

    // Simulate processing (mark as submitted)
    await prisma.removalRequest.update({
      where: { id: removalRequest.id },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        attempts: 1,
      },
    });

    await prisma.exposure.update({
      where: { id: exposureId },
      data: { status: "REMOVAL_IN_PROGRESS" },
    });

    return NextResponse.json({
      request: removalRequest,
      message: "Removal request submitted successfully",
    });
  } catch (error) {
    console.error("Removal request error:", error);
    return NextResponse.json(
      { error: "Failed to create removal request" },
      { status: 500 }
    );
  }
}
