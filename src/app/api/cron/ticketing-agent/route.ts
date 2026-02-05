import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { processNewTicket } from "@/lib/agents/ticketing-agent";
import { logCronExecution } from "@/lib/cron-logger";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";

/**
 * Cron job to automatically process open support tickets using AI agent
 * Schedule: Every 30 minutes
 *
 * This job:
 * 1. Finds all OPEN and IN_PROGRESS tickets
 * 2. Runs the AI ticketing agent on each to analyze and auto-resolve if possible
 * 3. Tracks statistics on auto-resolved vs human review needed
 */
export async function POST(request: Request) {
  try {
    // Verify cron secret
    const authResult = verifyCronAuth(request);
    if (!authResult.authorized) {
      return cronUnauthorizedResponse(authResult.reason);
    }

    // Check if Anthropic API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log("[Cron: Ticketing Agent] ANTHROPIC_API_KEY not configured, skipping");
      await logCronExecution({
        jobName: "ticketing-agent",
        status: "SKIPPED",
        message: "ANTHROPIC_API_KEY not configured",
      });
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "ANTHROPIC_API_KEY not configured",
      });
    }

    console.log("[Cron: Ticketing Agent] Starting...");
    const startTime = Date.now();

    // Find all open and in-progress tickets that haven't been processed recently
    // Avoid processing tickets updated in the last 5 minutes to prevent duplicate processing
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const ticketsToProcess = await prisma.supportTicket.findMany({
      where: {
        status: { in: ["OPEN", "IN_PROGRESS"] },
        // Don't reprocess tickets that were just updated
        lastActivityAt: {
          lt: fiveMinutesAgo,
        },
      },
      select: {
        id: true,
        ticketNumber: true,
        status: true,
        subject: true,
        createdAt: true,
      },
      orderBy: [
        // Prioritize by: URGENT > HIGH > NORMAL > LOW
        { priority: "desc" },
        // Then by oldest first
        { createdAt: "asc" },
      ],
      // Limit to prevent timeout on large backlogs
      take: 20,
    });

    console.log(`[Cron: Ticketing Agent] Found ${ticketsToProcess.length} tickets to process`);

    let processed = 0;
    let autoResolved = 0;
    let needsReview = 0;
    let failed = 0;
    const results: Array<{
      ticketNumber: string;
      status: string;
      result: string;
    }> = [];

    for (const ticket of ticketsToProcess) {
      try {
        console.log(`[Cron: Ticketing Agent] Processing ${ticket.ticketNumber}...`);

        const result = await processNewTicket(ticket.id);
        processed++;

        if (result.autoResolved) {
          autoResolved++;
          results.push({
            ticketNumber: ticket.ticketNumber,
            status: "auto_resolved",
            result: result.message,
          });
          console.log(`[Cron: Ticketing Agent] ${ticket.ticketNumber} auto-resolved`);
        } else if (result.success) {
          needsReview++;
          results.push({
            ticketNumber: ticket.ticketNumber,
            status: "needs_review",
            result: result.message,
          });
          console.log(`[Cron: Ticketing Agent] ${ticket.ticketNumber} needs human review`);
        } else {
          failed++;
          results.push({
            ticketNumber: ticket.ticketNumber,
            status: "failed",
            result: result.message,
          });
          console.error(`[Cron: Ticketing Agent] ${ticket.ticketNumber} failed: ${result.message}`);
        }

        // Add a small delay between tickets to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        failed++;
        results.push({
          ticketNumber: ticket.ticketNumber,
          status: "error",
          result: error instanceof Error ? error.message : "Unknown error",
        });
        console.error(`[Cron: Ticketing Agent] Error processing ${ticket.ticketNumber}:`, error);
      }
    }

    const duration = Date.now() - startTime;

    const response = {
      success: true,
      duration: `${(duration / 1000).toFixed(1)}s`,
      stats: {
        found: ticketsToProcess.length,
        processed,
        autoResolved,
        needsReview,
        failed,
      },
      results,
    };

    console.log("[Cron: Ticketing Agent] Complete:", JSON.stringify({
      ...response,
      results: `${results.length} tickets (details omitted)`,
    }, null, 2));

    // Log successful execution
    await logCronExecution({
      jobName: "ticketing-agent",
      status: failed > 0 && autoResolved === 0 ? "FAILED" : "SUCCESS",
      duration,
      message: `Processed ${processed} tickets: ${autoResolved} auto-resolved, ${needsReview} need review, ${failed} failed`,
      metadata: {
        found: ticketsToProcess.length,
        processed,
        autoResolved,
        needsReview,
        failed,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Cron: Ticketing Agent] Error:", error);

    // Log failed execution
    await logCronExecution({
      jobName: "ticketing-agent",
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
