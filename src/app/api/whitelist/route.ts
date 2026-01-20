import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whitelist = await prisma.whitelist.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ whitelist });
  } catch (error) {
    console.error("Whitelist fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch whitelist" },
      { status: 500 }
    );
  }
}

const addSchema = z.object({
  source: z.string(),
  sourceUrl: z.string().optional(),
  sourceName: z.string(),
  reason: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = addSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check if already whitelisted
    const existing = await prisma.whitelist.findFirst({
      where: {
        userId: session.user.id,
        source: data.source,
        sourceName: data.sourceName,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already whitelisted" },
        { status: 400 }
      );
    }

    // Create whitelist entry
    const whitelist = await prisma.whitelist.create({
      data: {
        userId: session.user.id,
        source: data.source,
        sourceUrl: data.sourceUrl || null,
        sourceName: data.sourceName,
        reason: data.reason || null,
      },
    });

    // Update any matching exposures
    await prisma.exposure.updateMany({
      where: {
        userId: session.user.id,
        source: data.source,
        sourceName: data.sourceName,
        isWhitelisted: false,
      },
      data: {
        isWhitelisted: true,
        status: "WHITELISTED",
      },
    });

    return NextResponse.json({ whitelist }, { status: 201 });
  } catch (error) {
    console.error("Whitelist add error:", error);
    return NextResponse.json(
      { error: "Failed to add to whitelist" },
      { status: 500 }
    );
  }
}

const deleteSchema = z.object({
  id: z.string(),
});

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = deleteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { id } = result.data;

    // Get the whitelist entry first
    const whitelist = await prisma.whitelist.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!whitelist) {
      return NextResponse.json(
        { error: "Whitelist entry not found" },
        { status: 404 }
      );
    }

    // Delete whitelist entry
    await prisma.whitelist.delete({
      where: { id },
    });

    // Update matching exposures back to active
    await prisma.exposure.updateMany({
      where: {
        userId: session.user.id,
        source: whitelist.source,
        sourceName: whitelist.sourceName,
        isWhitelisted: true,
      },
      data: {
        isWhitelisted: false,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Whitelist delete error:", error);
    return NextResponse.json(
      { error: "Failed to remove from whitelist" },
      { status: 500 }
    );
  }
}
