import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";
import { logAudit } from "@/lib/rbac/audit-log";
import { tryAutoResolve } from "@/lib/support/ticket-service";

function getClientIP(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return undefined;
}

/**
 * POST /api/admin/support/tickets/[id]/auto-resolve - Attempt auto-resolution
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
      select: { id: true, ticketNumber: true, userId: true, type: true, status: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Attempt auto-resolve
    const result = await tryAutoResolve(id, session.user.id);

    // Log the action
    await logAudit({
      actorId: session.user.id,
      actorEmail: currentUser.email || "",
      actorRole: role,
      action: "EXECUTE_AUTO_FIX",
      resource: "support_tickets",
      resourceId: id,
      targetUserId: ticket.userId,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      details: {
        ticketNumber: ticket.ticketNumber,
        ticketType: ticket.type,
        autoResolve: true,
        resolved: result.resolved,
        actionsAttempted: result.actionsAttempted,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Admin Support API] Error in auto-resolve:", error);
    return NextResponse.json(
      { error: "Failed to auto-resolve" },
      { status: 500 }
    );
  }
}
