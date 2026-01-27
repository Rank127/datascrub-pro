import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";
import { logAudit } from "@/lib/rbac/audit-log";
import { z } from "zod";

function getClientIP(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return undefined;
}

const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(5000),
  isInternal: z.boolean().optional().default(false),
});

/**
 * GET /api/admin/support/tickets/[id]/comments - Get comments for a ticket
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

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const role = getEffectiveRole(currentUser.email, currentUser.role);

    if (!["SUPPORT", "ADMIN", "LEGAL", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Verify ticket exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const comments = await prisma.ticketComment.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("[Admin Support API] Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/support/tickets/[id]/comments - Add a comment to a ticket
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

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true, name: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const role = getEffectiveRole(currentUser.email, currentUser.role);

    if (!["SUPPORT", "ADMIN", "LEGAL", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Verify ticket exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      select: { id: true, ticketNumber: true, userId: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = createCommentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { content, isInternal } = result.data;

    // Create the comment
    const comment = await prisma.ticketComment.create({
      data: {
        ticketId: id,
        authorId: session.user.id,
        content,
        isInternal,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Update ticket's last activity
    await prisma.supportTicket.update({
      where: { id },
      data: { lastActivityAt: new Date() },
    });

    // Log the action
    await logAudit({
      actorId: session.user.id,
      actorEmail: currentUser.email || "",
      actorRole: role,
      action: "ADD_TICKET_COMMENT",
      resource: "support_tickets",
      resourceId: id,
      targetUserId: ticket.userId,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      details: {
        ticketNumber: ticket.ticketNumber,
        isInternal,
        contentPreview: content.substring(0, 100),
      },
    });

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("[Admin Support API] Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
