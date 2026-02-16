import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCorporateInvoices } from "@/lib/corporate/billing";
import { CORPORATE_TIERS } from "@/lib/corporate/types";

// GET — returns full corporate account data for the admin portal
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = await prisma.corporateAccount.findUnique({
    where: { adminUserId: session.user.id },
    include: {
      seats: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              lastScanAt: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      invitations: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!account) {
    return NextResponse.json({ error: "Corporate account not found" }, { status: 403 });
  }

  const tierData = CORPORATE_TIERS.find((t) => t.id === account.tier);

  // Get removal counts for active seat holders
  const activeUserIds = account.seats
    .filter((s) => s.userId)
    .map((s) => s.userId!);

  const removalCounts = activeUserIds.length > 0
    ? await prisma.removalRequest.groupBy({
        by: ["userId"],
        where: { userId: { in: activeUserIds } },
        _count: true,
      })
    : [];

  const removalMap = new Map(
    removalCounts.map((r) => [r.userId, r._count])
  );

  // Get invoices
  let invoices: Awaited<ReturnType<typeof getCorporateInvoices>> = [];
  try {
    invoices = await getCorporateInvoices(account.id);
  } catch {
    // Invoice fetch may fail if no Stripe customer yet
  }

  return NextResponse.json({
    account: {
      id: account.id,
      name: account.name,
      tier: account.tier,
      tierName: tierData?.name || account.tier,
      maxSeats: account.maxSeats,
      status: account.status,
      createdAt: account.createdAt,
    },
    seats: account.seats.map((s, i) => ({
      id: s.id,
      seatNumber: i + 1,
      status: s.status,
      qrCode: s.qrCode,
      onboardedAt: s.onboardedAt,
      userName: s.user?.name || null,
      userEmail: s.user?.email || null,
      userId: s.user?.id || null,
      lastScanAt: s.user?.lastScanAt || null,
      removalCount: s.userId ? (removalMap.get(s.userId) || 0) : 0,
    })),
    invites: account.invitations.map((inv) => ({
      id: inv.id,
      email: inv.email,
      status: inv.status,
      expiresAt: inv.expiresAt,
      createdAt: inv.createdAt,
      isExpired: inv.status === "PENDING" && inv.expiresAt < new Date(),
    })),
    invoices,
    stats: {
      totalSeats: account.maxSeats,
      activeSeats: account.seats.filter((s) => s.userId && s.status === "ACTIVE").length,
      pendingInvites: account.invitations.filter((i) => i.status === "PENDING").length,
      totalRemovals: Array.from(removalMap.values()).reduce((a, b) => a + b, 0),
    },
  });
}
