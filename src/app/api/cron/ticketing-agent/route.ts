import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { processNewTicket } from "@/lib/agents/ticketing-agent";
import { tryAutoResolve, getSystemUserId } from "@/lib/support/ticket-service";
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
export const maxDuration = 300;

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
    const PROCESSING_DEADLINE_MS = 240_000; // 4 minutes — leave 1 min buffer for logging
    const deadline = startTime + PROCESSING_DEADLINE_MS;

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

    // Get system user ID for automated actions
    const systemUserId = await getSystemUserId();

    let processed = 0;
    let autoResolved = 0;
    let autoFixed = 0;
    let needsReview = 0;
    let failed = 0;
    let timeBoxed = false;
    const results: Array<{
      ticketNumber: string;
      status: string;
      result: string;
    }> = [];

    for (const ticket of ticketsToProcess) {
      // Time-boxing: break if approaching Vercel timeout
      if (Date.now() >= deadline) {
        console.log(`[Cron: Ticketing Agent] Deadline reached after ${processed} tickets, stopping`);
        timeBoxed = true;
        break;
      }

      try {
        console.log(`[Cron: Ticketing Agent] Processing ${ticket.ticketNumber}...`);

        // Step 1: Try auto-resolve first (cheaper than AI call)
        try {
          const autoResult = await tryAutoResolve(ticket.id, systemUserId);
          if (autoResult.resolved) {
            autoFixed++;
            processed++;
            results.push({
              ticketNumber: ticket.ticketNumber,
              status: "auto_fixed",
              result: `Auto-resolved: ${autoResult.actionsAttempted.join(", ")}`,
            });
            console.log(`[Cron: Ticketing Agent] ${ticket.ticketNumber} auto-fixed (${autoResult.actionsAttempted.join(", ")})`);
            continue; // Skip AI processing — saved cost + time
          }
        } catch (autoErr) {
          console.error(`[Cron: Ticketing Agent] tryAutoResolve failed for ${ticket.ticketNumber}:`, autoErr);
          // Fall through to AI processing
        }

        // Step 2: AI-powered analysis (for tickets that couldn't be auto-resolved)
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
      timeBoxed,
      stats: {
        found: ticketsToProcess.length,
        processed,
        autoFixed,
        autoResolved,
        needsReview,
        failed,
      },
      results,
    };

    // ===== STALE TICKET DETECTION =====
    // Only run if we haven't been time-boxed (still have time budget)
    let staleStats = { escalatedOpen: 0, reopenedWaiting: 0 };
    if (!timeBoxed && Date.now() < deadline) {
      try {
        const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

        // 1. OPEN tickets with no activity for 4+ hours → escalate priority
        const staleOpen = await prisma.supportTicket.findMany({
          where: {
            status: "OPEN",
            lastActivityAt: { lt: fourHoursAgo },
            priority: { not: "URGENT" },
          },
          select: { id: true, ticketNumber: true, priority: true },
          take: 20,
        });

        for (const stale of staleOpen) {
          if (Date.now() >= deadline) break;
          const newPriority = stale.priority === "LOW" ? "NORMAL" : stale.priority === "NORMAL" ? "HIGH" : "URGENT";
          await prisma.supportTicket.update({
            where: { id: stale.id },
            data: { priority: newPriority, lastActivityAt: new Date() },
          });
          await prisma.ticketComment.create({
            data: {
              ticketId: stale.id,
              authorId: systemUserId,
              content: `Priority escalated from ${stale.priority} to ${newPriority} due to 4+ hours of inactivity.`,
              isInternal: true,
            },
          });
          staleStats.escalatedOpen++;
          console.log(`[Cron: Ticketing Agent] Escalated stale ${stale.ticketNumber}: ${stale.priority} → ${newPriority}`);
        }

        // 2. WAITING_USER tickets inactive 48+ hours → reopen
        const staleWaiting = await prisma.supportTicket.findMany({
          where: {
            status: "WAITING_USER",
            lastActivityAt: { lt: fortyEightHoursAgo },
          },
          select: { id: true, ticketNumber: true },
          take: 20,
        });

        for (const stale of staleWaiting) {
          if (Date.now() >= deadline) break;
          await prisma.supportTicket.update({
            where: { id: stale.id },
            data: { status: "OPEN", lastActivityAt: new Date() },
          });
          await prisma.ticketComment.create({
            data: {
              ticketId: stale.id,
              authorId: systemUserId,
              content: "Auto-reopened: No user response after 48 hours. Returning to operations queue.",
              isInternal: false,
            },
          });
          staleStats.reopenedWaiting++;
          console.log(`[Cron: Ticketing Agent] Reopened stale WAITING_USER ${stale.ticketNumber}`);
        }

        if (staleStats.escalatedOpen > 0 || staleStats.reopenedWaiting > 0) {
          console.log(`[Cron: Ticketing Agent] Stale detection: ${staleStats.escalatedOpen} escalated, ${staleStats.reopenedWaiting} reopened`);
        }
      } catch (staleErr) {
        console.error("[Cron: Ticketing Agent] Stale ticket detection error:", staleErr);
      }
    }

    console.log("[Cron: Ticketing Agent] Complete:", JSON.stringify({
      ...response,
      staleStats,
      results: `${results.length} tickets (details omitted)`,
    }, null, 2));

    // Log execution — PARTIAL if time-boxed before finishing all tickets
    const cronStatus = timeBoxed ? "PARTIAL" : (failed > 0 && autoResolved === 0 && autoFixed === 0 ? "FAILED" : "SUCCESS");
    await logCronExecution({
      jobName: "ticketing-agent",
      status: cronStatus as "SUCCESS" | "FAILED",
      duration,
      message: `${timeBoxed ? "PARTIAL: " : ""}Processed ${processed}/${ticketsToProcess.length} tickets: ${autoFixed} auto-fixed, ${autoResolved} AI-resolved, ${needsReview} need review, ${failed} failed`,
      metadata: {
        found: ticketsToProcess.length,
        processed,
        autoFixed,
        autoResolved,
        needsReview,
        failed,
        timeBoxed,
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
