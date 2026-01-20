import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { executeRemoval } from "@/lib/removers/removal-service";
import { getDataBrokerInfo } from "@/lib/removers/data-broker-directory";
import { z } from "zod";
import type { Plan, RemovalMethod } from "@/lib/types";

const requestSchema = z.object({
  exposureId: z.string(),
});

// Determine removal method based on data source
function getRemovalMethod(source: string): RemovalMethod {
  const broker = getDataBrokerInfo(source);

  if (broker) {
    if (broker.removalMethod === "EMAIL" || broker.removalMethod === "BOTH") {
      return "AUTO_EMAIL";
    }
    if (broker.removalMethod === "FORM") {
      return "AUTO_FORM";
    }
  }

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

  if (socialMedia.includes(source)) {
    return "MANUAL_GUIDE";
  }

  if (source.includes("DARK_WEB") || source.includes("PASTE_SITE")) {
    return "MANUAL_GUIDE"; // Can't automate dark web removal
  }

  // Default to email for breach databases
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

    // Require paid plan for automated removals
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

    // Execute the removal (send emails, provide instructions)
    const executionResult = await executeRemoval(
      removalRequest.id,
      session.user.id
    );

    // Get updated request
    const updatedRequest = await prisma.removalRequest.findUnique({
      where: { id: removalRequest.id },
    });

    return NextResponse.json({
      request: updatedRequest,
      message: executionResult.message,
      method: executionResult.method,
      instructions: executionResult.instructions,
      success: executionResult.success,
    });
  } catch (error) {
    console.error("Removal request error:", error);
    return NextResponse.json(
      { error: "Failed to create removal request" },
      { status: 500 }
    );
  }
}
