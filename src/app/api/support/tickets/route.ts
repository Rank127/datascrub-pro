import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { createTicket } from "@/lib/support/ticket-service";
import { sendTicketCreatedEmail } from "@/lib/email";

const createTicketSchema = z.object({
  type: z.enum([
    "SCAN_ERROR",
    "REMOVAL_FAILED",
    "PAYMENT_ISSUE",
    "ACCOUNT_ISSUE",
    "FEATURE_REQUEST",
    "OTHER",
  ]),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  // Optional linked records
  scanId: z.string().optional(),
  exposureId: z.string().optional(),
  removalRequestId: z.string().optional(),
});

/**
 * GET /api/support/tickets - List user's own tickets
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: { userId: string; status?: string } = {
      userId: session.user.id,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          _count: { select: { comments: true } },
        },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return NextResponse.json({
      tickets,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("[Support API] Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/support/tickets - Create a new support ticket
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Create the ticket
    const ticket = await createTicket({
      userId: session.user.id,
      type: data.type,
      subject: data.subject,
      description: data.description,
      priority: data.priority,
      source: "USER",
      scanId: data.scanId,
      exposureId: data.exposureId,
      removalRequestId: data.removalRequestId,
    });

    // Send confirmation email (non-blocking)
    if (ticket.user?.email && ticket.user?.emailNotifications) {
      sendTicketCreatedEmail(
        ticket.user.email,
        ticket.user.name || "",
        {
          ticketNumber: ticket.ticketNumber,
          subject: ticket.subject,
          type: ticket.type,
        }
      ).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        type: ticket.type,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
      },
    });
  } catch (error) {
    console.error("[Support API] Error creating ticket:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
