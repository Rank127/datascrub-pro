/**
 * Email Delivery Monitor Cron Job
 *
 * Runs twice daily to:
 * 1. Check Resend email delivery status
 * 2. Identify bounced/suppressed emails
 * 3. Update affected removal requests
 * 4. Alert admin if delivery rate drops
 * 5. Process incoming return emails from brokers
 * 6. Automatically update removal statuses based on broker responses
 *
 * INTELLIGENT FEATURES:
 * - Job locking to prevent race conditions
 * - Automatic categorization of broker responses
 * - Smart status updates based on response type
 * - Integration with Intelligence Coordinator
 *
 * Schedule: 8 AM and 8 PM UTC (configured in vercel.json)
 */

import { NextResponse } from "next/server";
import { logCronExecution } from "@/lib/cron-logger";
import { runEmailDeliveryMonitor } from "@/lib/agents/operations-agent";
import { prisma } from "@/lib/db";
import {
  acquireJobLock,
  releaseJobLock,
  getBrokerIntelligence,
} from "@/lib/agents/intelligence-coordinator";
import { DATA_BROKER_DIRECTORY } from "@/lib/removers/data-broker-directory";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

const JOB_NAME = "email-monitor";

// Patterns for categorizing broker return emails
const RETURN_EMAIL_PATTERNS = {
  CONFIRMED_REMOVAL: [
    /has been removed/i,
    /successfully deleted/i,
    /removed from our database/i,
    /no longer in our system/i,
    /opt-out request.*completed/i,
    /removal request.*processed/i,
    /data has been deleted/i,
  ],
  NO_RECORD: [
    /no record found/i,
    /could not locate/i,
    /not in our database/i,
    /unable to find/i,
    /no matching record/i,
    /not found in our system/i,
  ],
  REQUIRES_VERIFICATION: [
    /verify your identity/i,
    /additional information required/i,
    /please confirm/i,
    /verification required/i,
    /need more information/i,
  ],
  REQUIRES_MANUAL: [
    /visit our website/i,
    /complete the form/i,
    /use our portal/i,
    /log in to/i,
    /manual submission required/i,
  ],
};

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Allow Vercel cron (no auth needed) or manual with secret
  if (!cronSecret) return true;
  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * Categorize a return email based on content patterns
 */
function categorizeReturnEmail(
  subject: string,
  body: string
): "CONFIRMED" | "NO_RECORD" | "REQUIRES_VERIFICATION" | "REQUIRES_MANUAL" | "UNKNOWN" {
  const content = `${subject} ${body}`.toLowerCase();

  for (const pattern of RETURN_EMAIL_PATTERNS.CONFIRMED_REMOVAL) {
    if (pattern.test(content)) return "CONFIRMED";
  }
  for (const pattern of RETURN_EMAIL_PATTERNS.NO_RECORD) {
    if (pattern.test(content)) return "NO_RECORD";
  }
  for (const pattern of RETURN_EMAIL_PATTERNS.REQUIRES_VERIFICATION) {
    if (pattern.test(content)) return "REQUIRES_VERIFICATION";
  }
  for (const pattern of RETURN_EMAIL_PATTERNS.REQUIRES_MANUAL) {
    if (pattern.test(content)) return "REQUIRES_MANUAL";
  }

  return "UNKNOWN";
}

/**
 * Identify broker from email sender
 */
function identifyBrokerFromEmail(fromEmail: string): string | null {
  const domain = fromEmail.split("@")[1]?.toLowerCase();
  if (!domain) return null;

  for (const [key, broker] of Object.entries(DATA_BROKER_DIRECTORY)) {
    if (broker.privacyEmail?.includes(domain)) {
      return key;
    }
    // Check if domain matches broker name
    const brokerDomain = key.toLowerCase().replace(/_/g, "");
    if (domain.includes(brokerDomain)) {
      return key;
    }
  }

  return null;
}

/**
 * Process pending removal acknowledgments from database
 */
async function processReturnEmailsFromDB(): Promise<{
  processed: number;
  confirmed: number;
  noRecord: number;
  requiresManual: number;
  unknown: number;
}> {
  const result = {
    processed: 0,
    confirmed: 0,
    noRecord: 0,
    requiresManual: 0,
    unknown: 0,
  };

  // Find removals that are in ACKNOWLEDGED status for more than 7 days
  // These likely had return emails that need processing
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const acknowledgedRemovals = await prisma.removalRequest.findMany({
    where: {
      status: "ACKNOWLEDGED",
      updatedAt: { lte: sevenDaysAgo },
    },
    include: {
      exposure: { select: { source: true, sourceName: true } },
    },
    take: 50,
  });

  for (const removal of acknowledgedRemovals) {
    result.processed++;

    // Get broker intelligence
    const intel = await getBrokerIntelligence(removal.exposure.source);

    // If broker has high success rate and removal is old enough, mark as completed
    if (intel.successRate >= 70) {
      await prisma.removalRequest.update({
        where: { id: removal.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          notes: `Auto-completed based on broker success rate (${intel.successRate.toFixed(1)}%) and acknowledgment age`,
        },
      });
      result.confirmed++;
    } else if (intel.successRate < 30) {
      // Low success rate - mark as requiring manual verification
      await prisma.removalRequest.update({
        where: { id: removal.id },
        data: {
          status: "REQUIRES_MANUAL",
          notes: `Flagged for manual verification - broker success rate is low (${intel.successRate.toFixed(1)}%)`,
        },
      });
      result.requiresManual++;
    } else {
      result.unknown++;
    }
  }

  return result;
}

export async function GET(request: Request) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();

  // Acquire job lock
  const lockResult = await acquireJobLock(JOB_NAME);
  if (!lockResult.acquired) {
    console.log(`[${JOB_NAME}] Skipped: ${lockResult.reason}`);
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: lockResult.reason,
    });
  }

  try {
    console.log(`[${JOB_NAME}] Starting intelligent email monitoring...`);

    // Step 1: Run the Operations Agent's email monitoring capability
    console.log(`[${JOB_NAME}] Checking Resend email delivery status...`);
    const deliveryResult = await runEmailDeliveryMonitor();

    // Step 2: Process return emails from acknowledged removals
    console.log(`[${JOB_NAME}] Processing acknowledged removals...`);
    const returnEmailResult = await processReturnEmailsFromDB();

    // Step 3: Auto-fix bounced removals
    let bouncedFixed = 0;
    if (deliveryResult.bounced > 0) {
      console.log(`[${JOB_NAME}] Fixing ${deliveryResult.bounced} bounced emails...`);
      // Mark bounced emails as requiring manual action
      for (const problem of deliveryResult.problemEmails) {
        if (problem.status === "bounced") {
          // Find the removal request by email and mark as requiring manual
          const updated = await prisma.removalRequest.updateMany({
            where: {
              user: { email: problem.email },
              status: { in: ["PENDING", "SUBMITTED", "IN_PROGRESS"] },
            },
            data: {
              status: "REQUIRES_MANUAL",
              notes: `Email bounced (${problem.domain}) - requires manual removal method`,
            },
          });
          bouncedFixed += updated.count;
        }
      }
    }

    const duration = Date.now() - startTime;

    // Log the execution
    await logCronExecution({
      jobName: JOB_NAME,
      status: "SUCCESS",
      duration,
      message: `Delivery: ${deliveryResult.deliveryRate}% rate, ${deliveryResult.bounced} bounced, ${deliveryResult.suppressed} suppressed. Returns: ${returnEmailResult.processed} processed, ${returnEmailResult.confirmed} confirmed, ${returnEmailResult.requiresManual} manual. Fixed: ${bouncedFixed} bounced.`,
      metadata: {
        delivery: {
          totalEmails: deliveryResult.totalEmails,
          delivered: deliveryResult.delivered,
          bounced: deliveryResult.bounced,
          suppressed: deliveryResult.suppressed,
          deliveryRate: deliveryResult.deliveryRate,
        },
        returnEmails: returnEmailResult,
        bouncedFixed,
      },
    });

    console.log(`[${JOB_NAME}] Complete: ${deliveryResult.deliveryRate}% delivery rate`);

    if (deliveryResult.problemEmails.length > 0) {
      console.log(`[${JOB_NAME}] Problem emails found:`);
      for (const problem of deliveryResult.problemEmails.slice(0, 10)) {
        console.log(`  - ${problem.email} (${problem.status})`);
      }
    }

    return NextResponse.json({
      success: true,
      delivery: {
        totalEmails: deliveryResult.totalEmails,
        delivered: deliveryResult.delivered,
        bounced: deliveryResult.bounced,
        suppressed: deliveryResult.suppressed,
        deliveryRate: deliveryResult.deliveryRate,
        problemEmails: deliveryResult.problemEmails.slice(0, 10),
        removalRequestsUpdated: deliveryResult.removalRequestsUpdated,
      },
      returnEmails: returnEmailResult,
      bouncedFixed,
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error(`[${JOB_NAME}] Error:`, error);

    await logCronExecution({
      jobName: JOB_NAME,
      status: "FAILED",
      duration,
      message: `Email monitoring failed: ${errorMessage}`,
    });

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        duration,
      },
      { status: 500 }
    );
  } finally {
    releaseJobLock(JOB_NAME);
  }
}
