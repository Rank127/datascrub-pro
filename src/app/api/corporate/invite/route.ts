import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createCorporateInvite } from "@/lib/corporate/invite-service";
import { sendCorporateInviteEmail } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ghostmydata.com";

// POST — send single email invite
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { email } = body as { email: string };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Get corporate account
  const account = await prisma.corporateAccount.findUnique({
    where: { adminUserId: session.user.id },
    select: { id: true, name: true },
  });

  if (!account) {
    return NextResponse.json({ error: "Corporate account not found" }, { status: 403 });
  }

  const result = await createCorporateInvite(account.id, email, session.user.id);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Send invitation email (non-blocking)
  const inviteUrl = `${APP_URL}/corporate/join?token=${result.invite!.token}`;
  sendCorporateInviteEmail(
    email,
    account.name,
    session.user.name || "Your admin",
    inviteUrl
  ).catch(console.error);

  return NextResponse.json({
    success: true,
    invite: {
      id: result.invite!.id,
      expiresAt: result.invite!.expiresAt,
    },
  });
}

// GET — list all invites for admin's corporate account
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = await prisma.corporateAccount.findUnique({
    where: { adminUserId: session.user.id },
    include: {
      invitations: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!account) {
    return NextResponse.json({ error: "Corporate account not found" }, { status: 403 });
  }

  return NextResponse.json({
    invites: account.invitations.map((inv) => ({
      id: inv.id,
      email: inv.email,
      status: inv.status,
      expiresAt: inv.expiresAt,
      createdAt: inv.createdAt,
      isExpired: inv.status === "PENDING" && inv.expiresAt < new Date(),
    })),
  });
}
