import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";
import { logAudit } from "@/lib/rbac/audit-log";
import { getStripe } from "@/lib/stripe";
import { StripeIntegrationResponse } from "@/lib/integrations/types";

function getClientIP(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return undefined;
}

function getStartOfDay(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const role = getEffectiveRole(currentUser.email, currentUser.role);

    // SUPER_ADMIN only for integrations
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Log access
    await logAudit({
      actorId: session.user.id,
      actorEmail: currentUser.email || "",
      actorRole: role,
      action: "ACCESS_ADMIN_PANEL",
      resource: "integrations_stripe",
      ipAddress: getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      details: { integration: "stripe" },
    });

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      const response: StripeIntegrationResponse = {
        configured: false,
        recentCharges: [],
        recentCustomers: [],
        error: "Stripe integration not configured. Set STRIPE_SECRET_KEY.",
      };
      return NextResponse.json(response);
    }

    const stripe = getStripe();

    // Fetch Stripe data in parallel
    const startOfToday = getStartOfDay();
    const weekAgo = getDaysAgo(7);
    const monthAgo = getDaysAgo(30);

    const [
      balance,
      todayCharges,
      weekCharges,
      monthCharges,
      allTimeCharges,
      recentCharges,
      subscriptions,
      recentCustomers,
    ] = await Promise.all([
      stripe.balance.retrieve(),
      stripe.charges.list({
        created: { gte: Math.floor(startOfToday.getTime() / 1000) },
        limit: 100,
      }),
      stripe.charges.list({
        created: { gte: Math.floor(weekAgo.getTime() / 1000) },
        limit: 100,
      }),
      stripe.charges.list({
        created: { gte: Math.floor(monthAgo.getTime() / 1000) },
        limit: 100,
      }),
      stripe.charges.list({ limit: 100 }),
      stripe.charges.list({ limit: 10 }),
      stripe.subscriptions.list({ limit: 100, status: "all" }),
      stripe.customers.list({ limit: 10 }),
    ]);

    // Calculate revenue
    const sumCharges = (charges: typeof todayCharges) =>
      charges.data
        .filter((c) => c.status === "succeeded")
        .reduce((sum, c) => sum + c.amount, 0);

    // Calculate subscription stats
    const subscriptionStats = {
      active: subscriptions.data.filter((s) => s.status === "active").length,
      canceled: subscriptions.data.filter((s) => s.status === "canceled").length,
      pastDue: subscriptions.data.filter((s) => s.status === "past_due").length,
      trialing: subscriptions.data.filter((s) => s.status === "trialing").length,
    };

    const response: StripeIntegrationResponse = {
      configured: true,
      balance: {
        available: balance.available.reduce((sum, b) => sum + b.amount, 0),
        pending: balance.pending.reduce((sum, b) => sum + b.amount, 0),
      },
      revenue: {
        today: sumCharges(todayCharges),
        week: sumCharges(weekCharges),
        month: sumCharges(monthCharges),
        total: sumCharges(allTimeCharges),
      },
      recentCharges: recentCharges.data.map((c) => ({
        id: c.id,
        amount: c.amount,
        currency: c.currency,
        status: c.status,
        description: c.description,
        customerEmail: c.receipt_email || c.billing_details?.email || null,
        created: c.created,
      })),
      subscriptionStats,
      recentCustomers: recentCustomers.data.map((c) => ({
        id: c.id,
        email: c.email,
        name: c.name ?? null,
        created: c.created,
      })),
    };

    console.log("[Stripe] Response data:", JSON.stringify(response, null, 2));

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Integrations/Stripe] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
