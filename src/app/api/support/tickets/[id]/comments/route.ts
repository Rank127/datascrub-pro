import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { addTicketComment } from "@/lib/support/ticket-service";

const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(5000),
});

/**
 * GET /api/support/tickets/[id]/comments - Get ticket comments
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

    // First verify ticket exists and user owns it
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (ticket.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get non-internal comments only for users
    const comments = await prisma.ticketComment.findMany({
      where: {
        ticketId: id,
        isInternal: false,
      },
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: { name: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("[Support API] Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/support/tickets/[id]/comments - Add a comment to a ticket
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // First verify ticket exists and user owns it
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (ticket.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Can't comment on closed tickets
    if (ticket.status === "CLOSED") {
      return NextResponse.json(
        { error: "Cannot comment on closed tickets" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = createCommentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const comment = await addTicketComment(
      id,
      session.user.id,
      result.data.content,
      false // Not internal - user comments are always visible
    );

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: comment.author,
      },
    });
  } catch (error) {
    console.error("[Support API] Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
