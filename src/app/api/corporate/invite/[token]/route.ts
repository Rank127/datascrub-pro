import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getInviteByToken, acceptCorporateInvite } from "@/lib/corporate/invite-service";
import { sendCorporateSeatActivatedEmail } from "@/lib/email";
import { prisma } from "@/lib/db";

// GET — validate token (public, for join page)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const invite = await getInviteByToken(token);
  if (!invite) {
    return NextResponse.json({ error: "Invalid invitation" }, { status: 404 });
  }

  return NextResponse.json({
    companyName: invite.companyName,
    adminName: invite.adminName,
    email: invite.email,
    status: invite.status,
    isExpired: invite.isExpired,
    tier: invite.tier,
  });
}

// POST — accept invite (auth required)
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await params;
  const result = await acceptCorporateInvite(token, session.user.id);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Notify admin (non-blocking)
  const invite = await getInviteByToken(token);
  if (invite?.adminEmail) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });
    sendCorporateSeatActivatedEmail(
      invite.adminEmail,
      user?.name || session.user.email || "A team member",
      invite.companyName
    ).catch(console.error);
  }

  return NextResponse.json({ success: true, companyName: result.companyName });
}
