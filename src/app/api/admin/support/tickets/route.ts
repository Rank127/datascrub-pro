import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole, checkPermission } from "@/lib/admin";
import { logAudit } from "@/lib/rbac/audit-log";
import { z } from "zod";
import { createTicket } from "@/lib/support/ticket-service";
import { sendTicketCreatedEmail } from "@/lib/email";

function getClientIP(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return undefined;
}

const createTicketSchema = z.object({
  userId: z.string(),
  type: z.enum([
    "SCAN_ERROR",
    "REMOVAL_FAILED",
    "PAYMENT_ISSUE",
    "ACCOUNT_ISSUE",
    "FEATURE_REQUEST",
    "OTHER",
  ]),
  subject: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
});

/**
 * GET /api/admin/support/tickets - List all tickets (admin)
 */
export async function GET(request: NextRequest) {
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

    // Need at least SUPPORT role to view tickets
    if (!checkPermission(currentUser.email, currentUser.role, "manage_support_tickets")) {
      // Fall back to checking basic admin access
      if (!["SUPPORT", "ADMIN", "LEGAL", "SUPER_ADMIN"].includes(role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");
    const assignedToId = searchParams.get("assignedToId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Record<string, unknown> = {};

    if (status && status !== "all") where.status = status;
    if (type && type !== "all") where.type = type;
    if (priority && priority !== "all") where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId === "unassigned" ? null : assignedToId;

    const [tickets, total, pendingDrafts] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: [
          { priority: "desc" }, // URGENT first
          { createdAt: "desc" },
        ],
        take: limit,
        skip: offset,
        include: {
          user: {
            select: { email: true, name: true, plan: true },
          },
          assignedTo: {
            select: { email: true, name: true },
          },
          _count: { select: { comments: true } },
        },
      }),
      prisma.supportTicket.count({ where }),
      // Get pending AI drafts for all tickets
      prisma.ticketComment.findMany({
        where: {
          content: { startsWith: "[AI DRAFT RESPONSE" },
          isInternal: true,
        },
        select: {
          ticketId: true,
          content: true,
        },
      }),
    ]);

    // Create a set of ticket IDs with pending drafts
    const ticketsWithPendingDrafts = new Set<string>();
    pendingDrafts.forEach((draft) => {
      if (!draft.content.includes("APPROVED") && !draft.content.includes("REJECTED")) {
        ticketsWithPendingDrafts.add(draft.ticketId);
      }
    });

    // Add hasPendingAiDraft flag to each ticket
    const ticketsWithDraftFlag = tickets.map((ticket) => ({
      ...ticket,
      hasPendingAiDraft: ticketsWithPendingDrafts.has(ticket.id),
    }));

    // Log access
    await logAudit({
      actorId: session.user.id,
      actorEmail: currentUser.email || "",
      actorRole: role,
      action: "VIEW_SUPPORT_TICKETS",
      resource: "support_tickets",
      ipAddress: getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      details: { filters: { status, type, priority, assignedToId } },
    });

    return NextResponse.json({
      tickets: ticketsWithDraftFlag,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("[Admin Support API] Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/support/tickets - Create ticket for a user (admin)
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const result = createTicketSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true, email: true, name: true, emailNotifications: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Create ticket as admin
    const ticket = await createTicket({
      userId: data.userId,
      type: data.type,
      subject: data.subject,
      description: data.description,
      priority: data.priority,
      source: "ADMIN",
    });

    // Log the action
    await logAudit({
      actorId: session.user.id,
      actorEmail: currentUser.email || "",
      actorRole: role,
      action: "CREATE_SUPPORT_TICKET",
      resource: "support_tickets",
      resourceId: ticket.id,
      targetUserId: data.userId,
      targetEmail: targetUser.email,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      details: { ticketNumber: ticket.ticketNumber, type: data.type },
    });

    // Notify user (non-blocking)
    if (targetUser.email && targetUser.emailNotifications) {
      sendTicketCreatedEmail(
        targetUser.email,
        targetUser.name || "",
        {
          ticketNumber: ticket.ticketNumber,
          subject: ticket.subject,
          type: ticket.type,
        }
      ).catch((e) => { import("@/lib/error-reporting").then(m => m.captureError("admin-ticket-created-email", e instanceof Error ? e : new Error(String(e)))); });
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        status: ticket.status,
      },
    });
  } catch (error) {
    console.error("[Admin Support API] Error creating ticket:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
