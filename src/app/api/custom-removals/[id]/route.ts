import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectivePlan } from "@/lib/family/family-service";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "REJECTED", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  assignedToId: z.string().optional(),
  internalNotes: z.string().max(2000).optional(),
  resolution: z.string().max(2000).optional(),
  beforeScreenshot: z.string().max(500000).optional(),
  afterScreenshot: z.string().max(500000).optional(),
  userNotes: z.string().max(1000).optional(),
  userScreenshot: z.string().max(500000).optional(),
}).strict();

// GET - Get a specific custom removal request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    // Check user plan (checks subscription + family membership) and role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const userPlan = await getEffectivePlan(userId);
    const isAdmin = ["ADMIN", "SUPPORT", "SUPER_ADMIN"].includes(user?.role || "");

    const customRequest = await prisma.customRemovalRequest.findUnique({
      where: { id },
    });

    if (!customRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Only allow owner or admin to view
    if (customRequest.userId !== userId && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Hide internal notes from non-admins
    if (!isAdmin) {
      return NextResponse.json({
        ...customRequest,
        internalNotes: undefined,
        assignedToId: undefined,
      });
    }

    return NextResponse.json(customRequest);
  } catch (error) {
    console.error("Custom removal get error:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom removal request" },
      { status: 500 }
    );
  }
}

// PATCH - Update a custom removal request (admin only for most fields)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;
    const body = await request.json();

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }
    const validatedBody = parsed.data;

    // Check user role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, email: true, role: true },
    });
    const isAdmin = ["ADMIN", "SUPPORT", "SUPER_ADMIN"].includes(user?.role || "");

    const customRequest = await prisma.customRemovalRequest.findUnique({
      where: { id },
    });

    if (!customRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Determine what can be updated
    const updateData: Record<string, unknown> = {};

    // Users can only update their own requests and only certain fields
    if (customRequest.userId === userId) {
      if (validatedBody.userNotes !== undefined && customRequest.status === "PENDING") {
        updateData.userNotes = validatedBody.userNotes;
      }
      if (validatedBody.userScreenshot !== undefined && customRequest.status === "PENDING") {
        updateData.userScreenshot = validatedBody.userScreenshot;
      }
    }

    // Admins can update more fields
    if (isAdmin) {
      if (validatedBody.status !== undefined) {
        updateData.status = validatedBody.status;
        if (validatedBody.status === "COMPLETED") {
          updateData.completedAt = new Date();
        }
      }
      if (validatedBody.priority !== undefined) {
        updateData.priority = validatedBody.priority;
      }
      if (validatedBody.assignedToId !== undefined) {
        updateData.assignedToId = validatedBody.assignedToId;
        updateData.assignedAt = new Date();
      }
      if (validatedBody.internalNotes !== undefined) {
        updateData.internalNotes = validatedBody.internalNotes;
      }
      if (validatedBody.resolution !== undefined) {
        updateData.resolution = validatedBody.resolution;
      }
      if (validatedBody.beforeScreenshot !== undefined) {
        updateData.beforeScreenshot = validatedBody.beforeScreenshot;
      }
      if (validatedBody.afterScreenshot !== undefined) {
        updateData.afterScreenshot = validatedBody.afterScreenshot;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updated = await prisma.customRemovalRequest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Custom removal update error:", error);
    return NextResponse.json(
      { error: "Failed to update custom removal request" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel a pending custom removal request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    // Check user role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const isAdmin = ["ADMIN", "SUPPORT", "SUPER_ADMIN"].includes(user?.role || "");

    const customRequest = await prisma.customRemovalRequest.findUnique({
      where: { id },
    });

    if (!customRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Only owner or admin can delete
    if (customRequest.userId !== userId && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Users can only cancel pending requests
    if (!isAdmin && customRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "Can only cancel pending requests" },
        { status: 400 }
      );
    }

    await prisma.customRemovalRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Custom removal delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete custom removal request" },
      { status: 500 }
    );
  }
}
