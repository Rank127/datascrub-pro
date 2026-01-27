import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";
import { logAudit } from "@/lib/rbac/audit-log";
import { executeAutoFix } from "@/lib/support/ticket-service";
import { z } from "zod";

function getClientIP(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return undefined;
}

const executeFixSchema = z.object({
  action: z.string().min(1),
});

/**
 * POST /api/admin/support/tickets/[id]/execute-fix - Execute an auto-fix action
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
      select: { id: true, ticketNumber: true, userId: true, type: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = executeFixSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { action } = result.data;

    // Execute the auto-fix
    const fixResult = await executeAutoFix(id, action, session.user.id);

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
        fixAction: action,
        success: fixResult.success,
        message: fixResult.message,
      },
    });

    return NextResponse.json(fixResult);
  } catch (error) {
    console.error("[Admin Support API] Error executing auto-fix:", error);
    return NextResponse.json(
      { error: "Failed to execute auto-fix" },
      { status: 500 }
    );
  }
}
