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

// Support both exposureId (from dashboard) and direct source/sourceName
const addSchema = z.union([
  z.object({
    exposureId: z.string(),
    reason: z.string().optional(),
  }),
  z.object({
    source: z.string(),
    sourceUrl: z.string().optional(),
    sourceName: z.string(),
    reason: z.string().optional(),
  }),
]);

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
        { error: "Invalid request", details: result.error.issues },
        { status: 400 }
      );
    }

    const data = result.data;
    let source: string;
    let sourceName: string;
    let sourceUrl: string | null = null;
    let reason: string | null = null;

    // Handle exposureId format (from dashboard)
    if ("exposureId" in data) {
      const exposure = await prisma.exposure.findFirst({
        where: {
          id: data.exposureId,
          userId: session.user.id,
        },
      });

      if (!exposure) {
        return NextResponse.json(
          { error: "Exposure not found" },
          { status: 404 }
        );
      }

      source = exposure.source;
      sourceName = exposure.sourceName;
      sourceUrl = exposure.sourceUrl;
      reason = data.reason || null;
    } else {
      // Handle direct source/sourceName format
      source = data.source;
      sourceName = data.sourceName;
      sourceUrl = data.sourceUrl || null;
      reason = data.reason || null;
    }

    // Check if already whitelisted
    const existing = await prisma.whitelist.findFirst({
      where: {
        userId: session.user.id,
        source,
        sourceName,
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
        source,
        sourceUrl,
        sourceName,
        reason,
      },
    });

    // Update any matching exposures
    await prisma.exposure.updateMany({
      where: {
        userId: session.user.id,
        source,
        sourceName,
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

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Support both query param (exposureId) and body (id)
    const url = new URL(request.url);
    const exposureId = url.searchParams.get("exposureId");
    const whitelistId = url.searchParams.get("id");

    let source: string;
    let sourceName: string;
    let whitelistToDelete: { id: string } | null = null;

    if (exposureId) {
      // Find exposure and its whitelist entry
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

      source = exposure.source;
      sourceName = exposure.sourceName;

      // Find the whitelist entry
      whitelistToDelete = await prisma.whitelist.findFirst({
        where: {
          userId: session.user.id,
          source,
          sourceName,
        },
        select: { id: true },
      });
    } else if (whitelistId) {
      // Direct whitelist ID
      const whitelist = await prisma.whitelist.findFirst({
        where: {
          id: whitelistId,
          userId: session.user.id,
        },
      });

      if (!whitelist) {
        return NextResponse.json(
          { error: "Whitelist entry not found" },
          { status: 404 }
        );
      }

      source = whitelist.source;
      sourceName = whitelist.sourceName;
      whitelistToDelete = { id: whitelist.id };
    } else {
      // Try parsing body for legacy support
      try {
        const body = await request.json();
        if (body.id) {
          const whitelist = await prisma.whitelist.findFirst({
            where: {
              id: body.id,
              userId: session.user.id,
            },
          });

          if (!whitelist) {
            return NextResponse.json(
              { error: "Whitelist entry not found" },
              { status: 404 }
            );
          }

          source = whitelist.source;
          sourceName = whitelist.sourceName;
          whitelistToDelete = { id: whitelist.id };
        } else {
          return NextResponse.json(
            { error: "Missing exposureId or id parameter" },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Missing exposureId or id parameter" },
          { status: 400 }
        );
      }
    }

    if (!whitelistToDelete) {
      return NextResponse.json(
        { error: "Whitelist entry not found" },
        { status: 404 }
      );
    }

    // Delete whitelist entry
    await prisma.whitelist.delete({
      where: { id: whitelistToDelete.id },
    });

    // Update matching exposures back to active
    await prisma.exposure.updateMany({
      where: {
        userId: session.user.id,
        source,
        sourceName,
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
