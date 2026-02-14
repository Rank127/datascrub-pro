import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";
import { logAudit } from "@/lib/rbac/audit-log";
import { z } from "zod";
import {
  resolveTicket,
  assignTicket,
  updateTicketStatus,
  addTicketComment,
} from "@/lib/support/ticket-service";
import { sendTicketResolvedEmail, sendTicketStatusUpdateEmail } from "@/lib/email";

function getClientIP(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return undefined;
}

const updateTicketSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING_USER", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  assignedToId: z.string().nullable().optional(),
  internalNotes: z.string().max(5000).optional(),
  resolution: z.string().max(5000).optional(),
  comment: z.string().max(5000).optional(),
  isInternalComment: z.boolean().optional(),
});

/**
 * GET /api/admin/support/tickets/[id] - Get ticket details (admin)
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

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, name: true, plan: true, createdAt: true },
        },
        assignedTo: {
          select: { id: true, email: true, name: true },
        },
        resolvedBy: {
          select: { id: true, email: true, name: true },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: { name: true, email: true, role: true },
            },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Log access
    await logAudit({
      actorId: session.user.id,
      actorEmail: currentUser.email || "",
      actorRole: role,
      action: "VIEW_SUPPORT_TICKET",
      resource: "support_tickets",
      resourceId: id,
      targetUserId: ticket.userId,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("[Admin Support API] Error fetching ticket:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/support/tickets/[id] - Update ticket (admin)
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
    const existingTicket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true, name: true, emailNotifications: true },
        },
      },
    });

    if (!existingTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
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
    const changes: string[] = [];

    // Handle assignment
    if (data.assignedToId !== undefined) {
      if (data.assignedToId) {
        await assignTicket(id, data.assignedToId);
        changes.push("assigned");
      } else {
        // Unassign
        await prisma.supportTicket.update({
          where: { id },
          data: { assignedToId: null, assignedAt: null },
        });
        changes.push("unassigned");
      }
    }

    // Handle resolution
    if (data.status === "RESOLVED" && data.resolution) {
      const resolvedTicket = await resolveTicket({
        ticketId: id,
        resolution: data.resolution,
        resolvedById: session.user.id,
      });
      changes.push("resolved");

      // Notify user
      if (resolvedTicket.user?.email && resolvedTicket.user?.emailNotifications) {
        sendTicketResolvedEmail(
          resolvedTicket.user.email,
          resolvedTicket.user.name || "",
          {
            ticketNumber: existingTicket.ticketNumber,
            subject: existingTicket.subject,
            resolution: data.resolution,
          }
        ).catch((e) => { import("@/lib/error-reporting").then(m => m.captureError("ticket-resolved-email", e instanceof Error ? e : new Error(String(e)))); });
      }
    } else if (data.status && data.status !== existingTicket.status) {
      // Status change (not resolution)
      await updateTicketStatus(id, data.status);
      changes.push(`status:${data.status}`);

      // Notify user of status change (except for internal status changes)
      if (
        existingTicket.user?.email &&
        existingTicket.user?.emailNotifications &&
        ["IN_PROGRESS", "WAITING_USER"].includes(data.status)
      ) {
        sendTicketStatusUpdateEmail(
          existingTicket.user.email,
          existingTicket.user.name || "",
          {
            ticketNumber: existingTicket.ticketNumber,
            subject: existingTicket.subject,
            status: data.status,
            comment: data.comment,
          }
        ).catch((e) => { import("@/lib/error-reporting").then(m => m.captureError("ticket-status-email", e instanceof Error ? e : new Error(String(e)))); });
      }
    }

    // Handle priority change
    if (data.priority && data.priority !== existingTicket.priority) {
      await prisma.supportTicket.update({
        where: { id },
        data: { priority: data.priority },
      });
      changes.push(`priority:${data.priority}`);
    }

    // Handle internal notes
    if (data.internalNotes !== undefined) {
      await prisma.supportTicket.update({
        where: { id },
        data: { internalNotes: data.internalNotes },
      });
      changes.push("notes");
    }

    // Handle comment
    if (data.comment) {
      await addTicketComment(
        id,
        session.user.id,
        data.comment,
        data.isInternalComment ?? false
      );
      changes.push(data.isInternalComment ? "internal_comment" : "comment");
    }

    // Log the action
    await logAudit({
      actorId: session.user.id,
      actorEmail: currentUser.email || "",
      actorRole: role,
      action: "UPDATE_SUPPORT_TICKET",
      resource: "support_tickets",
      resourceId: id,
      targetUserId: existingTicket.userId,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      details: { changes },
    });

    // Fetch updated ticket
    const updatedTicket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true, name: true },
        },
        assignedTo: {
          select: { email: true, name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
      changes,
    });
  } catch (error) {
    console.error("[Admin Support API] Error updating ticket:", error);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}
