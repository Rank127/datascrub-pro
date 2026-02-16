import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createCorporateInvite } from "@/lib/corporate/invite-service";
import { sendCorporateInviteEmail } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ghostmydata.com";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { emails } = body as { emails: string[] };

  if (!Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json({ error: "emails array is required" }, { status: 400 });
  }

  if (emails.length > 100) {
    return NextResponse.json({ error: "Maximum 100 emails per batch" }, { status: 400 });
  }

  // Get corporate account
  const account = await prisma.corporateAccount.findUnique({
    where: { adminUserId: session.user.id },
    select: { id: true, name: true },
  });

  if (!account) {
    return NextResponse.json({ error: "Corporate account not found" }, { status: 403 });
  }

  const invited: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  // Deduplicate emails
  const uniqueEmails = [...new Set(emails.map((e) => e.toLowerCase().trim()))];

  for (const email of uniqueEmails) {
    if (!EMAIL_REGEX.test(email)) {
      errors.push(`${email}: invalid format`);
      continue;
    }

    const result = await createCorporateInvite(account.id, email, session.user.id);

    if (result.success) {
      invited.push(email);
      // Send email (non-blocking)
      const inviteUrl = `${APP_URL}/corporate/join?token=${result.invite!.token}`;
      sendCorporateInviteEmail(
        email,
        account.name,
        session.user.name || "Your admin",
        inviteUrl
      ).catch(console.error);
    } else {
      skipped.push(`${email}: ${result.error}`);
    }
  }

  return NextResponse.json({
    invited: invited.length,
    skipped,
    errors,
    total: uniqueEmails.length,
  });
}
