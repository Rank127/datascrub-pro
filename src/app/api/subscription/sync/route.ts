import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { validateAndSyncSubscription } from "@/lib/stripe/subscription-intelligence";
import { clearSyncCache } from "@/lib/stripe/use-subscription-sync";

// POST /api/subscription/sync - Sync current user's subscription from Stripe
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Clear cache to force fresh sync
    clearSyncCache(session.user.id);

    const result = await validateAndSyncSubscription(session.user.id, {
      autoFix: true,
      silent: false,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Subscription sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync subscription" },
      { status: 500 }
    );
  }
}

// GET /api/subscription/sync - Check sync status without fixing
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await validateAndSyncSubscription(session.user.id, {
      autoFix: false,
      silent: true,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Subscription check error:", error);
    return NextResponse.json(
      { error: "Failed to check subscription" },
      { status: 500 }
    );
  }
}
