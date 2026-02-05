import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  sendFollowUpReminderEmail,
  sendBatchFollowUpEmail,
} from "@/lib/email";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";

// Cron job to send follow-up reminders for pending removal requests
// Runs daily at 9 AM UTC
// Vercel cron: "0 9 * * *"

const REMINDER_THRESHOLDS = [30, 45]; // Days after submission to send reminders
const BATCH_THRESHOLD = 5; // If user has more than this many pending, send batch email

export async function GET(request: Request) {
  const startTime = Date.now();

  // Verify cron secret
  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return cronUnauthorizedResponse(authResult.reason);
  }

  console.log("[Follow-up Cron] Starting follow-up reminder job...");

  const stats = {
    usersProcessed: 0,
    emailsSent: 0,
    batchEmailsSent: 0,
    individualEmailsSent: 0,
    errors: 0,
  };

  try {
    const now = new Date();

    // Get all users with pending removal requests that need follow-up
    // We look for requests submitted more than 30 days ago that haven't been completed
    const usersWithPendingRemovals = await prisma.user.findMany({
      where: {
        removalRequests: {
          some: {
            status: { in: ["SUBMITTED", "IN_PROGRESS"] },
            submittedAt: {
              lte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30+ days ago
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        removalRequests: {
          where: {
            status: { in: ["SUBMITTED", "IN_PROGRESS"] },
            submittedAt: { not: null },
          },
          include: {
            exposure: {
              select: {
                sourceName: true,
                dataType: true,
              },
            },
          },
          orderBy: { submittedAt: "asc" },
        },
      },
    });

    console.log(`[Follow-up Cron] Found ${usersWithPendingRemovals.length} users with pending removals`);

    for (const user of usersWithPendingRemovals) {
      if (!user.email) continue;

      stats.usersProcessed++;

      try {
        // Calculate days since submission for each removal
        const remindersNeeded = user.removalRequests
          .filter(r => r.submittedAt)
          .map(r => {
            const daysSince = Math.floor(
              (now.getTime() - r.submittedAt!.getTime()) / (1000 * 60 * 60 * 24)
            );
            return {
              id: r.id,
              sourceName: r.exposure.sourceName,
              dataType: r.exposure.dataType,
              submittedAt: r.submittedAt!,
              daysSinceSubmission: daysSince,
              needsReminder: REMINDER_THRESHOLDS.some(threshold => {
                // Send reminder if we're at the threshold day or every 7 days after 45 days
                if (daysSince === threshold) return true;
                if (daysSince > 45 && (daysSince - 45) % 7 === 0) return true;
                return false;
              }),
            };
          })
          .filter(r => r.daysSinceSubmission >= 30); // Only include 30+ day old requests

        if (remindersNeeded.length === 0) continue;

        // Decide between batch email or individual emails
        if (remindersNeeded.length >= BATCH_THRESHOLD) {
          // Send batch summary email
          const over30Days = remindersNeeded.filter(r => r.daysSinceSubmission >= 30).length;
          const over45Days = remindersNeeded.filter(r => r.daysSinceSubmission >= 45).length;

          await sendBatchFollowUpEmail(user.email, user.name || "", {
            totalPending: remindersNeeded.length,
            over30Days,
            over45Days,
            reminders: remindersNeeded.map(r => ({
              sourceName: r.sourceName,
              daysSinceSubmission: r.daysSinceSubmission,
            })),
          });

          stats.batchEmailsSent++;
          stats.emailsSent++;

          // Record that we sent reminders
          await prisma.removalRequest.updateMany({
            where: {
              id: { in: remindersNeeded.map(r => r.id) },
            },
            data: {
              notes: `Follow-up reminder sent on ${now.toISOString()}`,
            },
          });
        } else {
          // Send individual reminder emails for requests at threshold
          const toRemind = remindersNeeded.filter(r => r.needsReminder);

          for (const reminder of toRemind) {
            await sendFollowUpReminderEmail(user.email, user.name || "", {
              sourceName: reminder.sourceName,
              dataType: reminder.dataType,
              submittedAt: reminder.submittedAt,
              daysSinceSubmission: reminder.daysSinceSubmission,
              removalRequestId: reminder.id,
            });

            stats.individualEmailsSent++;
            stats.emailsSent++;

            // Record that we sent a reminder
            await prisma.removalRequest.update({
              where: { id: reminder.id },
              data: {
                notes: `Follow-up reminder sent on ${now.toISOString()} (${reminder.daysSinceSubmission} days)`,
              },
            });

            // Small delay between emails to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      } catch (error) {
        console.error(`[Follow-up Cron] Error processing user ${user.id}:`, error);
        stats.errors++;
      }
    }

    const duration = `${Date.now() - startTime}ms`;
    console.log(`[Follow-up Cron] Completed in ${duration}:`, stats);

    return NextResponse.json({
      success: true,
      stats,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Follow-up Cron] Fatal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stats,
        duration: `${Date.now() - startTime}ms`,
      },
      { status: 500 }
    );
  }
}
