import { NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkPermission } from "@/lib/admin";
import { getFounderFromEmail } from "@/lib/email";

const FOUNDER_REPLY_TO = "rocky@ghostmydata.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ghostmydata.com";

function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

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
  const firstName = esc(name?.split(" ")[0] || "there");
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
  const firstName = esc(name?.split(" ")[0] || "there");
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

interface ExposureTarget {
  email: string;
  name: string | null;
  exposureCount: number;
  topBrokers: string[];
  severityCounts: { critical: number; high: number; medium: number };
}

function buildFreeUserExposureEmail(target: ExposureTarget): { subject: string; html: string } {
  const firstName = esc(target.name?.split(" ")[0] || "there");
  const brokerList = target.topBrokers.slice(0, 5).map((b) => esc(b));
  const urgentCount = target.severityCounts.critical + target.severityCounts.high;

  const subject = urgentCount > 0
    ? `${target.exposureCount} sites have your personal data — ${urgentCount} are high risk`
    : `Your personal data was found on ${target.exposureCount} sites`;

  const brokerHtml = brokerList.length > 0
    ? `<ul style="margin: 12px 0; padding-left: 20px;">${brokerList.map((b) => `<li style="margin-bottom: 4px;">${b}</li>`).join("")}${target.topBrokers.length > 5 ? `<li style="margin-bottom: 4px; color: #888;">...and ${target.exposureCount - 5} more</li>` : ""}</ul>`
    : "";

  const urgentLine = urgentCount > 0
    ? `<p style="color: #c0392b; font-weight: bold;">${urgentCount} of these are high-risk exposures that include sensitive personal information.</p>`
    : "";

  return {
    subject,
    html: personalEmailTemplate(`
<p>Hi ${firstName},</p>
<p>This is Rocky from GhostMyData. When you scanned your data with us, we found your personal information on <strong>${target.exposureCount} sites</strong>, including:</p>
${brokerHtml}
${urgentLine}
<p>Right now these sites are selling or sharing your data — your name, email, phone number, and more — to anyone who searches for you.</p>
<p>With a Pro plan, we automatically send legal removal requests to every one of these sites on your behalf. Most removals complete within 2-4 weeks, and we keep monitoring to make sure your data stays gone.</p>
<p style="margin: 24px 0;">
  <a href="${APP_URL}/pricing" style="background-color: #10b981; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-family: -apple-system, sans-serif; font-size: 15px;">Remove My Data — $9.99/mo</a>
</p>
<p>Questions? Just reply to this email — I read every one.</p>
<p>Best,<br>Rocky Kathuria<br><span style="color: #666; font-size: 14px;">Founder, GhostMyData</span></p>
<p style="font-size: 12px; color: #999; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
  You're receiving this because you signed up for GhostMyData and ran a data scan.
  <a href="${APP_URL}/dashboard/settings" style="color: #999;">Manage preferences</a>
</p>
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

    const validTypes = ["churn_survey", "enterprise_interview", "free_user_exposure"];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    if (type === "free_user_exposure") {
      return handleFreeUserExposure(dryRun);
    }

    // Query target users for churn_survey / enterprise_interview
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

/**
 * Free user exposure campaign — sends personalized emails showing
 * each free user's actual exposure count and top broker names.
 * Filters out test accounts and users with notifications disabled.
 */
async function handleFreeUserExposure(dryRun?: boolean) {
  // Exclude test/internal emails
  const excludePatterns = [
    "test@", "example.com", "example.org", "ghostmydata.com",
    "rank1its", "ziprecruiter.com", "invalid.test",
  ];

  // Find free users who have exposures and have email notifications enabled
  const freeUsersWithExposures: {
    userId: string;
    email: string;
    name: string | null;
    _count: number;
  }[] = await prisma.$queryRaw`
    SELECT
      u.id as "userId",
      u.email,
      u.name,
      COUNT(e.id)::int as "_count"
    FROM "User" u
    JOIN "Exposure" e ON e."userId" = u.id
    WHERE u.plan = 'FREE'
      AND u."emailNotifications" = true
      AND e.status IN ('ACTIVE', 'MONITORING')
    GROUP BY u.id, u.email, u.name
    HAVING COUNT(e.id) >= 3
    ORDER BY COUNT(e.id) DESC
  `;

  // Filter out test accounts
  const realUsers = freeUsersWithExposures.filter((u) =>
    u.email && !excludePatterns.some((p) => u.email.toLowerCase().includes(p))
  );

  // Build detailed targets with broker info and severity
  const targets: (ExposureTarget & { userId: string })[] = [];

  for (const user of realUsers) {
    // Top brokers by count
    const topBrokers: { sourceName: string; count: bigint }[] = await prisma.$queryRaw`
      SELECT "sourceName", COUNT(*)::bigint as count
      FROM "Exposure"
      WHERE "userId" = ${user.userId}
        AND status IN ('ACTIVE', 'MONITORING')
        AND "sourceName" IS NOT NULL
      GROUP BY "sourceName"
      ORDER BY count DESC
      LIMIT 8
    `;

    // Severity breakdown
    const severities: { severity: string; count: bigint }[] = await prisma.$queryRaw`
      SELECT severity, COUNT(*)::bigint as count
      FROM "Exposure"
      WHERE "userId" = ${user.userId}
        AND status IN ('ACTIVE', 'MONITORING')
      GROUP BY severity
    `;

    const sevMap: Record<string, number> = {};
    severities.forEach((s) => { sevMap[s.severity] = Number(s.count); });

    targets.push({
      userId: user.userId,
      email: user.email,
      name: user.name,
      exposureCount: user._count,
      topBrokers: topBrokers.map((b) => b.sourceName),
      severityCounts: {
        critical: sevMap["CRITICAL"] || 0,
        high: sevMap["HIGH"] || 0,
        medium: sevMap["MEDIUM"] || 0,
      },
    });
  }

  if (dryRun) {
    return NextResponse.json({
      status: "dry_run",
      type: "free_user_exposure",
      targetCount: targets.length,
      targets: targets.map((t) => ({
        email: t.email,
        name: t.name,
        exposureCount: t.exposureCount,
        topBrokers: t.topBrokers.slice(0, 5),
        urgentCount: t.severityCounts.critical + t.severityCounts.high,
      })),
    });
  }

  if (targets.length === 0) {
    return NextResponse.json({ status: "no_targets", type: "free_user_exposure", sent: 0 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = getFounderFromEmail();
  const results: { email: string; success: boolean; exposureCount: number; error?: string }[] = [];

  for (const target of targets) {
    const { subject, html } = buildFreeUserExposureEmail(target);

    try {
      await resend.emails.send({
        from,
        to: target.email,
        replyTo: FOUNDER_REPLY_TO,
        subject,
        html,
      });
      results.push({ email: target.email, success: true, exposureCount: target.exposureCount });
    } catch (err) {
      results.push({
        email: target.email,
        success: false,
        exposureCount: target.exposureCount,
        error: err instanceof Error ? err.message : "Send failed",
      });
    }
  }

  const sent = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return NextResponse.json({
    status: "sent",
    type: "free_user_exposure",
    sent,
    failed,
    results,
  });
}
