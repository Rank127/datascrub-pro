import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { batchSyncAllSubscriptions, cleanupDuplicateSubscriptions } from "@/lib/stripe/subscription-intelligence";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/rbac/audit-log";

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: Request): boolean {
  const headersList = headers();
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // If no CRON_SECRET is set, only allow from localhost in development
  if (!cronSecret) {
    const host = request.headers.get("host") || "";
    return process.env.NODE_ENV === "development" && host.includes("localhost");
  }

  return authHeader === `Bearer ${cronSecret}`;
}

// POST /api/cron/sync-subscriptions - Batch sync all subscriptions
export async function POST(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { dryRun = false, limit = 500, cleanupDuplicates = true } = body;

    console.log(`[Cron] Starting subscription sync. DryRun: ${dryRun}, Limit: ${limit}`);

    // Step 1: Batch sync subscriptions
    const syncResult = await batchSyncAllSubscriptions({ dryRun, limit });

    console.log(`[Cron] Sync complete. Checked: ${syncResult.checked}, Fixed: ${syncResult.fixed}`);

    // Step 2: Cleanup duplicates if enabled
    let duplicatesCleanedUp = 0;
    if (cleanupDuplicates && !dryRun) {
      // Find customers with potential duplicates
      const customersWithMultiple = await prisma.subscription.findMany({
        where: {
          stripeCustomerId: { not: null },
          status: "active",
        },
        select: {
          stripeCustomerId: true,
          userId: true,
        },
      });

      for (const sub of customersWithMultiple) {
        if (sub.stripeCustomerId) {
          try {
            const result = await cleanupDuplicateSubscriptions(sub.stripeCustomerId);
            duplicatesCleanedUp += result.canceled;
          } catch (err) {
            console.error(`[Cron] Failed to cleanup duplicates for ${sub.stripeCustomerId}:`, err);
          }
        }
      }
    }

    // Log the cron run
    await logAudit({
      actorId: "CRON_JOB",
      actorEmail: "cron@system",
      actorRole: "SYSTEM",
      action: "SUBSCRIPTION_UPDATED",
      resource: "subscription_sync",
      details: {
        checked: syncResult.checked,
        inSync: syncResult.inSync,
        fixed: syncResult.fixed,
        errors: syncResult.errors,
        duplicatesCleanedUp,
        dryRun,
      },
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      sync: {
        checked: syncResult.checked,
        inSync: syncResult.inSync,
        fixed: syncResult.fixed,
        errors: syncResult.errors,
      },
      duplicatesCleanedUp,
      dryRun,
      details: syncResult.details,
    });
  } catch (error) {
    console.error("[Cron] Subscription sync failed:", error);
    return NextResponse.json(
      { error: "Subscription sync failed", details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/cron/sync-subscriptions - Check sync status (no changes)
export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await batchSyncAllSubscriptions({ dryRun: true, limit: 100 });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      dryRun: true,
      wouldFix: result.fixed,
      checked: result.checked,
      inSync: result.inSync,
      details: result.details,
    });
  } catch (error) {
    console.error("[Cron] Subscription check failed:", error);
    return NextResponse.json(
      { error: "Subscription check failed" },
      { status: 500 }
    );
  }
}
