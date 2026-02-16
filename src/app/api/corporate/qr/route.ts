import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateCorporateQR, generateBulkQR } from "@/lib/corporate/qr-onboard";

// POST — generate QR for specific seat or bulk
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = await prisma.corporateAccount.findUnique({
    where: { adminUserId: session.user.id },
    select: { id: true },
  });

  if (!account) {
    return NextResponse.json({ error: "Corporate account not found" }, { status: 403 });
  }

  const body = await request.json();
  const { seatId, count } = body as { seatId?: string; count?: number };

  if (seatId) {
    // Single seat QR
    const result = await generateCorporateQR(account.id, seatId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  }

  if (count && count > 0) {
    // Bulk QR generation
    const result = await generateBulkQR(account.id, Math.min(count, 100));
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Provide seatId or count" }, { status: 400 });
}

// GET — list QR codes for admin's account
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = await prisma.corporateAccount.findUnique({
    where: { adminUserId: session.user.id },
    include: {
      seats: {
        select: {
          id: true,
          qrCode: true,
          status: true,
          userId: true,
          onboardedAt: true,
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!account) {
    return NextResponse.json({ error: "Corporate account not found" }, { status: 403 });
  }

  return NextResponse.json({
    seats: account.seats.map((s) => ({
      id: s.id,
      qrCode: s.qrCode,
      status: s.status,
      assigned: !!s.userId,
      userName: s.user?.name || null,
      userEmail: s.user?.email || null,
      onboardedAt: s.onboardedAt,
    })),
  });
}
