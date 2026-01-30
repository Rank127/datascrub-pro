import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logCronExecution } from "@/lib/cron-logger";

/**
 * Cron job to automatically close resolved tickets after 24 hours
 * Schedule: Every hour (to catch tickets as they hit the 24-hour mark)
 *
 * This job:
 * 1. Finds all RESOLVED tickets older than 24 hours
 * 2. Updates their status to CLOSED
 * 3. Adds a system comment noting the auto-closure
 */
export async function POST(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron: Close Resolved Tickets] Starting...");
    const startTime = Date.now();

    // Find resolved tickets older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const ticketsToClose = await prisma.supportTicket.findMany({
      where: {
        status: "RESOLVED",
        resolvedAt: {
          lt: twentyFourHoursAgo,
        },
      },
      select: {
        id: true,
        ticketNumber: true,
        userId: true,
        resolvedAt: true,
      },
    });

    console.log(`[Cron: Close Resolved Tickets] Found ${ticketsToClose.length} tickets to close`);

    let closed = 0;
    let failed = 0;

    for (const ticket of ticketsToClose) {
      try {
        // Update ticket status to CLOSED and add system comment
        await prisma.$transaction([
          prisma.supportTicket.update({
            where: { id: ticket.id },
            data: {
              status: "CLOSED",
              lastActivityAt: new Date(),
              updatedAt: new Date(),
            },
          }),
          prisma.ticketComment.create({
            data: {
              ticketId: ticket.id,
              authorId: ticket.userId, // Use ticket owner as author for system message
              content: "This ticket was automatically closed after 24 hours with no further activity.",
              isInternal: false,
            },
          }),
        ]);

        closed++;
        console.log(`[Cron: Close Resolved Tickets] Closed ${ticket.ticketNumber}`);
      } catch (error) {
        failed++;
        console.error(`[Cron: Close Resolved Tickets] Failed to close ${ticket.ticketNumber}:`, error);
      }
    }

    const duration = Date.now() - startTime;

    const response = {
      success: true,
      duration: `${(duration / 1000).toFixed(1)}s`,
      found: ticketsToClose.length,
      closed,
      failed,
    };

    console.log("[Cron: Close Resolved Tickets] Complete:", JSON.stringify(response, null, 2));

    // Log successful execution
    await logCronExecution({
      jobName: "close-resolved-tickets",
      status: "SUCCESS",
      duration,
      message: `Closed ${closed} tickets${failed > 0 ? `, ${failed} failed` : ""}`,
      metadata: { found: ticketsToClose.length, closed, failed },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Cron: Close Resolved Tickets] Error:", error);

    // Log failed execution
    await logCronExecution({
      jobName: "close-resolved-tickets",
      status: "FAILED",
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also allow GET for manual testing
export async function GET(request: Request) {
  return POST(request);
}
