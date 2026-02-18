import { NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkPermission } from "@/lib/admin";
import { getFounderFromEmail } from "@/lib/email";

const FOUNDER_REPLY_TO = "rocky@ghostmydata.com";

function personalEmailTemplate(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Georgia, 'Times New Roman', serif; background-color: #ffffff; color: #333333; padding: 40px 20px; margin: 0; line-height: 1.6;">
<div style="max-width: 560px; margin: 0 auto;">
${body}
</div>
</body>
</html>`;
}

function buildChurnSurveyEmail(name: string): { subject: string; html: string } {
  const firstName = name?.split(" ")[0] || "there";
  return {
    subject: "Quick question about your experience with GhostMyData",
    html: personalEmailTemplate(`
<p>Hi ${firstName},</p>
<p>This is Rocky, founder of GhostMyData. I noticed you recently canceled your subscription and wanted to reach out personally.</p>
<p>I'd love to understand what we could have done better. If you have 2 minutes, could you reply with what led to your decision? Anything helps — whether it was pricing, missing features, or just not the right fit.</p>
<p>Your feedback directly shapes what we build next.</p>
<p>Thanks for giving us a try,<br>Rocky Kathuria<br><span style="color: #666; font-size: 14px;">Founder, GhostMyData</span></p>
    `),
  };
}

function buildEnterpriseInterviewEmail(name: string): { subject: string; html: string } {
  const firstName = name?.split(" ")[0] || "there";
  return {
    subject: "15 minutes? (GhostMyData founder)",
    html: personalEmailTemplate(`
<p>Hi ${firstName},</p>
<p>This is Rocky, founder of GhostMyData. You're one of our valued Enterprise subscribers and I'd love to hear how things are going.</p>
<p>Would you have 15 minutes for a quick call or video chat this week? I want to understand what's working well, what could be better, and where you'd like to see us go next.</p>
<p>No agenda, no sales pitch — just a conversation. Reply to this email and we'll find a time that works.</p>
<p>Thanks for being an early supporter,<br>Rocky Kathuria<br><span style="color: #666; font-size: 14px;">Founder, GhostMyData</span></p>
    `),
  };
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });

    if (!checkPermission(currentUser?.email, currentUser?.role, "view_users_list")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { type, dryRun } = body as { type: string; dryRun?: boolean };

    if (!type || !["churn_survey", "enterprise_interview"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be 'churn_survey' or 'enterprise_interview'" },
        { status: 400 }
      );
    }

    // Query target users
    let targets: { email: string; name: string | null }[];

    if (type === "churn_survey") {
      const subscriptions = await prisma.subscription.findMany({
        where: { status: "canceled" },
        include: {
          user: { select: { email: true, name: true, emailNotifications: true } },
        },
      });
      targets = subscriptions
        .filter((s) => s.user.email && s.user.emailNotifications)
        .map((s) => ({ email: s.user.email!, name: s.user.name }));
    } else {
      const subscriptions = await prisma.subscription.findMany({
        where: { status: "active", plan: "ENTERPRISE" },
        include: {
          user: { select: { email: true, name: true, emailNotifications: true } },
        },
      });
      targets = subscriptions
        .filter((s) => s.user.email && s.user.emailNotifications)
        .map((s) => ({ email: s.user.email!, name: s.user.name }));
    }

    if (dryRun) {
      return NextResponse.json({
        status: "dry_run",
        type,
        targetCount: targets.length,
        targets: targets.map((t) => ({ email: t.email, name: t.name })),
      });
    }

    if (targets.length === 0) {
      return NextResponse.json({ status: "no_targets", type, sent: 0 });
    }

    // Send emails
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = getFounderFromEmail();
    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const target of targets) {
      const { subject, html } =
        type === "churn_survey"
          ? buildChurnSurveyEmail(target.name || "")
          : buildEnterpriseInterviewEmail(target.name || "");

      try {
        await resend.emails.send({
          from,
          to: target.email,
          replyTo: FOUNDER_REPLY_TO,
          subject,
          html,
        });
        results.push({ email: target.email, success: true });
      } catch (err) {
        results.push({
          email: target.email,
          success: false,
          error: err instanceof Error ? err.message : "Send failed",
        });
      }
    }

    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      status: "sent",
      type,
      sent,
      failed,
      results,
    });
  } catch (error) {
    console.error("[admin/outreach] Error:", error);
    return NextResponse.json(
      { error: "Outreach failed" },
      { status: 500 }
    );
  }
}
