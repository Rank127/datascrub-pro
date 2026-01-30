import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";
import { logAudit } from "@/lib/rbac/audit-log";
import { z } from "zod";
import { sendTicketStatusUpdateEmail } from "@/lib/email";

function getClientIP(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return undefined;
}

const approveDraftSchema = z.object({
  draftCommentId: z.string().min(1, "Draft comment ID required"),
  editedContent: z.string().min(1, "Response content required").max(5000),
  resolveTicket: z.boolean().default(false),
});

/**
 * POST /api/admin/support/tickets/[id]/approve-draft
 * Approve an AI draft response, optionally with edits, and send to user
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
      include: {
        user: {
          select: { id: true, email: true, name: true, emailNotifications: true },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = approveDraftSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { draftCommentId, editedContent, resolveTicket } = result.data;

    // Verify the draft comment exists and is a draft
    const draftComment = await prisma.ticketComment.findUnique({
      where: { id: draftCommentId },
    });

    if (!draftComment) {
      return NextResponse.json({ error: "Draft comment not found" }, { status: 404 });
    }

    // Security: Verify the draft belongs to this ticket
    if (draftComment.ticketId !== id) {
      return NextResponse.json({ error: "Draft does not belong to this ticket" }, { status: 400 });
    }

    if (!draftComment.content.includes("[AI DRAFT RESPONSE")) {
      return NextResponse.json({ error: "This comment is not an AI draft" }, { status: 400 });
    }

    // Verify draft hasn't already been approved/rejected
    if (draftComment.content.includes("APPROVED") || draftComment.content.includes("REJECTED")) {
      return NextResponse.json({ error: "This draft has already been processed" }, { status: 400 });
    }

    // Use transaction to update draft and create public response
    const [updatedDraft, publicComment, updatedTicket] = await prisma.$transaction([
      // Mark the draft as approved
      prisma.ticketComment.update({
        where: { id: draftCommentId },
        data: {
          content: draftComment.content.replace(
            "[AI DRAFT RESPONSE",
            `[AI DRAFT - APPROVED by ${currentUser.name || currentUser.email}`
          ),
        },
      }),
      // Create the public response
      prisma.ticketComment.create({
        data: {
          ticketId: id,
          authorId: session.user.id,
          content: editedContent,
          isInternal: false,
        },
      }),
      // Update ticket status
      prisma.supportTicket.update({
        where: { id },
        data: {
          status: resolveTicket ? "RESOLVED" : "WAITING_USER",
          lastActivityAt: new Date(),
          ...(resolveTicket && {
            resolution: editedContent,
            resolvedAt: new Date(),
            resolvedById: session.user.id,
          }),
        },
      }),
    ]);

    // Send email notification to user
    if (ticket.user.email && ticket.user.emailNotifications !== false) {
      sendTicketStatusUpdateEmail(
        ticket.user.email,
        ticket.user.name || "User",
        {
          ticketNumber: ticket.ticketNumber,
          subject: ticket.subject,
          status: resolveTicket ? "RESOLVED" : "WAITING_USER",
          comment: editedContent,
        }
      ).catch((error) => {
        console.error("[Approve Draft] Failed to send email:", error);
      });
    }

    // Log the action
    await logAudit({
      actorId: session.user.id,
      actorEmail: currentUser.email || "",
      actorRole: role,
      action: "APPROVE_AI_DRAFT",
      resource: "support_tickets",
      resourceId: id,
      targetUserId: ticket.userId,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      details: {
        ticketNumber: ticket.ticketNumber,
        draftCommentId,
        resolved: resolveTicket,
        wasEdited: editedContent !== extractDraftContent(draftComment.content),
      },
    });

    return NextResponse.json({
      success: true,
      message: resolveTicket ? "Draft approved and ticket resolved" : "Draft approved and sent to user",
      comment: publicComment,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("[Admin Support API] Error approving draft:", error);
    return NextResponse.json(
      { error: "Failed to approve draft" },
      { status: 500 }
    );
  }
}

/**
 * Extract the actual draft content from the comment (remove prefix)
 */
function extractDraftContent(fullContent: string): string {
  return fullContent
    .replace(/^\[AI DRAFT RESPONSE[^\]]*\]\n?/, "")
    .replace(/^\[AI DRAFT RESPONSE\]\n?/, "")
    .trim();
}
