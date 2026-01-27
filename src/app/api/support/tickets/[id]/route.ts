import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateTicketSchema = z.object({
  // Users can only close their own tickets or add additional info
  status: z.enum(["CLOSED"]).optional(),
  additionalInfo: z.string().max(2000).optional(),
});

/**
 * GET /api/support/tickets/[id] - Get ticket details
 */
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

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        comments: {
          where: { isInternal: false }, // Users only see non-internal comments
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: { name: true, email: true, role: true },
            },
          },
        },
        user: {
          select: { id: true },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Users can only see their own tickets
    if (ticket.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Remove user relation from response (we already verified ownership)
    const { user: _, ...ticketData } = ticket;

    return NextResponse.json({ ticket: ticketData });
  } catch (error) {
    console.error("[Support API] Error fetching ticket:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/support/tickets/[id] - Update ticket (user can close or add info)
 */
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

    // First verify ownership
    const existingTicket = await prisma.supportTicket.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!existingTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (existingTicket.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const result = updateTicketSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    // If user is adding additional info, create a comment
    if (data.additionalInfo) {
      await prisma.ticketComment.create({
        data: {
          ticketId: id,
          authorId: session.user.id,
          content: data.additionalInfo,
          isInternal: false,
        },
      });
    }

    // Update ticket if status change requested
    const updateData: { status?: string; lastActivityAt: Date } = {
      lastActivityAt: new Date(),
    };

    if (data.status === "CLOSED") {
      // Users can only close resolved tickets or their own open tickets
      if (!["OPEN", "RESOLVED", "WAITING_USER"].includes(existingTicket.status)) {
        return NextResponse.json(
          { error: "Cannot close ticket in current status" },
          { status: 400 }
        );
      }
      updateData.status = "CLOSED";
    }

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        lastActivityAt: ticket.lastActivityAt,
      },
    });
  } catch (error) {
    console.error("[Support API] Error updating ticket:", error);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}
