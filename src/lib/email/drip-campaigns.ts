/**
 * Email Drip Campaign System
 *
 * Automated email sequences for nurturing leads and converting free users.
 * Campaigns are triggered when users sign up and run over 14 days.
 */

import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { getFromEmail, canSendEmail } from "@/lib/email";
import { isEmailSuppressed } from "@/lib/email/suppression";

// Lazy-initialize Resend client (used for drip sends with custom headers)
let _resend: Resend | null = null;
function getResendClient(): Resend | null {
  if (_resend === null && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const APP_NAME = "GhostMyData";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ghostmydata.com";

function appendUtm(url: string, campaign: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}utm_source=drip&utm_medium=email&utm_campaign=${campaign}`;
}

// Drip campaign schedule (days after signup)
export const DRIP_SCHEDULE = [
  { day: 0, templateId: "welcome" },
  { day: 1, templateId: "scan_reminder" },
  { day: 3, templateId: "case_study" },
  { day: 7, templateId: "first_removal_coming" },
  { day: 14, templateId: "final_push" },
] as const;

export type DripTemplateId = typeof DRIP_SCHEDULE[number]["templateId"];

interface DripEmail {
  subject: string;
  previewText: string;
  html: string;
}

interface DripTemplateData {
  submittedCount: number;
  completedCount: number;
  exposureCount: number;
  topBrokers: string[];
}

// Email templates
function getDripEmailTemplate(templateId: DripTemplateId, name: string, data?: DripTemplateData): DripEmail {
  const firstName = name.split(" ")[0] || "there";

  switch (templateId) {
    case "welcome":
      return {
        subject: `Welcome to ${APP_NAME}, ${firstName}!`,
        previewText: "Your privacy journey starts now",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; }
    h1 { color: #ffffff; font-size: 24px; margin-bottom: 16px; }
    p { color: #94a3b8; line-height: 1.6; margin-bottom: 16px; }
    .highlight { color: #10b981; font-weight: bold; }
    .btn { display: inline-block; background: #10b981; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0; }
    .btn:hover { background: #059669; }
    .stats { background: #334155; border-radius: 8px; padding: 16px; margin: 24px 0; }
    .stat { text-align: center; }
    .stat-value { color: #10b981; font-size: 32px; font-weight: bold; }
    .stat-label { color: #94a3b8; font-size: 14px; }
    .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to ${APP_NAME}, ${firstName}! 🎉</h1>
    <p>You've taken the first step toward taking control of your personal data. Here's what makes this decision a no-brainer:</p>

    <div class="stats">
      <div class="stat">
        <div class="stat-value">2,100+</div>
        <div class="stat-label">Data sources we monitor</div>
      </div>
    </div>

    <p>Most people have their personal info scattered across 50-200 data broker sites — and every day it sits there, the risk of identity theft, spam, and harassment grows.</p>

    <p><span class="highlight">Your next step:</span> Run your first scan to see exactly where your personal information is exposed. It takes 60 seconds and the results will surprise you.</p>

    <a href="${appendUtm(`${APP_URL}/dashboard`, 'welcome')}" class="btn">Run Your First Scan →</a>

    <p>Our team handles everything — scanning data brokers, submitting removal requests, and verifying your data is actually deleted. That's the kind of protection that used to require a team of lawyers.</p>

    <p>If you have any questions, just reply to this email. We're here to help!</p>

    <p>Stay safe,<br>The ${APP_NAME} Team</p>

    <div class="footer">
      <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <p><a href="${appendUtm(`${APP_URL}/unsubscribe`, 'welcome')}" style="color: #64748b;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
        `,
      };

    case "scan_reminder":
      return {
        subject: `${firstName}, your data is waiting to be found`,
        previewText: "Run your first scan in 60 seconds",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; }
    h1 { color: #ffffff; font-size: 24px; margin-bottom: 16px; }
    p { color: #94a3b8; line-height: 1.6; margin-bottom: 16px; }
    .highlight { color: #f97316; font-weight: bold; }
    .btn { display: inline-block; background: #10b981; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0; }
    .warning-box { background: #7c2d12; border: 1px solid #ea580c; border-radius: 8px; padding: 16px; margin: 24px 0; }
    .warning-box p { color: #fed7aa; margin: 0; }
    .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Your Personal Data Is Exposed 🔓</h1>

    <p>Hey ${firstName},</p>

    <p>Let me ask you something: <strong>How comfortable are you with strangers being able to look up your home address, phone number, and family members' names in seconds?</strong></p>

    <p>Because right now, the average person has their personal information listed on <span class="highlight">over 50 data broker sites</span>.</p>

    <div class="warning-box">
      <p>⚠️ Right now, your name, address, phone number, and email could be available for anyone to find - including scammers and identity thieves.</p>
    </div>

    <p>The good news? Finding out exactly what's exposed takes less than 60 seconds.</p>

    <a href="${appendUtm(`${APP_URL}/dashboard`, 'scan_reminder')}" class="btn">See My Exposed Data →</a>

    <p>Once you run your scan, you'll see exactly which sites have your information — and we can start removing it immediately.</p>

    <p>Your privacy matters,<br>The ${APP_NAME} Team</p>

    <div class="footer">
      <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <p><a href="${appendUtm(`${APP_URL}/unsubscribe`, 'scan_reminder')}" style="color: #64748b;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
        `,
      };

    case "case_study":
      return {
        subject: `How Sarah removed her data from 150+ sites`,
        previewText: "Real results from a real customer",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; }
    h1 { color: #ffffff; font-size: 24px; margin-bottom: 16px; }
    h2 { color: #ffffff; font-size: 18px; margin: 24px 0 12px; }
    p { color: #94a3b8; line-height: 1.6; margin-bottom: 16px; }
    .highlight { color: #10b981; font-weight: bold; }
    .btn { display: inline-block; background: #10b981; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0; }
    .quote-box { background: #334155; border-left: 4px solid #10b981; border-radius: 0 8px 8px 0; padding: 16px; margin: 24px 0; }
    .quote { color: #e2e8f0; font-style: italic; margin-bottom: 8px; }
    .author { color: #10b981; font-weight: 600; }
    .results { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0; }
    .result { background: #334155; border-radius: 8px; padding: 16px; text-align: center; }
    .result-value { color: #10b981; font-size: 28px; font-weight: bold; }
    .result-label { color: #94a3b8; font-size: 12px; margin-top: 4px; }
    .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Sarah's Privacy Success Story 🎯</h1>

    <p>Hey ${firstName},</p>

    <p>People don't believe it until they see it. So instead of telling you what ${APP_NAME} can do — let me show you what happened to someone just like you.</p>

    <h2>Meet Sarah from Los Angeles</h2>

    <p>Sarah discovered her personal information — including her home address, phone number, and family members' names — was listed on <span class="highlight">over 150 data broker websites</span>. She couldn't believe it.</p>

    <div class="quote-box">
      <p class="quote">"I was shocked to see how much of my personal information was out there. ${APP_NAME} removed it from over 150 sites in just a few weeks. The peace of mind is priceless."</p>
      <p class="author">— Sarah M., Los Angeles, CA</p>
    </div>

    <div class="results">
      <div class="result">
        <div class="result-value">156</div>
        <div class="result-label">Sites Found</div>
      </div>
      <div class="result">
        <div class="result-value">147</div>
        <div class="result-label">Removed</div>
      </div>
      <div class="result">
        <div class="result-value">2 wks</div>
        <div class="result-label">Timeline</div>
      </div>
    </div>

    <p><span class="highlight">Your results could be similar.</span> Run your scan to see how exposed you are.</p>

    <a href="${appendUtm(`${APP_URL}/dashboard`, 'case_study')}" class="btn">See My Exposure Score →</a>

    <p>To your privacy,<br>The ${APP_NAME} Team</p>

    <div class="footer">
      <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <p><a href="${appendUtm(`${APP_URL}/unsubscribe`, 'case_study')}" style="color: #64748b;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
        `,
      };

    case "first_removal_coming": {
      const submitted = data?.submittedCount ?? 0;
      const completed = data?.completedCount ?? 0;
      const exposures = data?.exposureCount ?? 0;
      const brokers = data?.topBrokers ?? [];
      const hasRemovals = submitted > 0 || completed > 0;

      const brokerListHtml = brokers.length > 0
        ? `<div class="broker-list">
            <p style="color: #e2e8f0; font-weight: 600; margin-bottom: 8px;">Brokers we're working on:</p>
            ${brokers.map(b => `<div class="broker-item"><span class="broker-icon">&#8227;</span> ${b}</div>`).join("")}
          </div>`
        : "";

      const statsHtml = hasRemovals
        ? `<div class="stats-row">
            <div class="stat-card">
              <div class="stat-value">${submitted + completed}</div>
              <div class="stat-label">Removal Requests Submitted</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${completed}</div>
              <div class="stat-label">Already Completed</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${exposures}</div>
              <div class="stat-label">Exposures Found</div>
            </div>
          </div>`
        : "";

      const progressMessage = completed > 0
        ? `<p>Great news — <span class="highlight">${completed} removal${completed === 1 ? " has" : "s have"} already been completed!</span> The rest are being processed by data brokers right now.</p>`
        : hasRemovals
          ? `<p>We've submitted <span class="highlight">${submitted + completed} removal request${submitted + completed === 1 ? "" : "s"}</span> to data brokers on your behalf. Most brokers take 7-14 days to process removals — <span class="highlight">your first completions are expected soon.</span></p>`
          : `<p>You signed up a week ago but haven't run your first scan yet. It takes 60 seconds and we'll immediately start removing your data from every broker that has it.</p>`;

      return {
        subject: `${firstName}, your data removals are in progress`,
        previewText: hasRemovals
          ? `${submitted + completed} removal requests submitted — completions coming soon`
          : "Run your first scan to start removing your data",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; }
    h1 { color: #ffffff; font-size: 24px; margin-bottom: 16px; }
    p { color: #94a3b8; line-height: 1.6; margin-bottom: 16px; }
    .highlight { color: #10b981; font-weight: bold; }
    .btn { display: inline-block; background: #10b981; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0; }
    .btn:hover { background: #059669; }
    .btn-secondary { display: inline-block; background: transparent; color: #10b981; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; margin: 8px 0; border: 1px solid #10b981; }
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 24px 0; }
    .stat-card { background: #334155; border-radius: 8px; padding: 16px; text-align: center; }
    .stat-value { color: #10b981; font-size: 28px; font-weight: bold; }
    .stat-label { color: #94a3b8; font-size: 12px; margin-top: 4px; }
    .progress-box { background: linear-gradient(135deg, #065f46 0%, #064e3b 100%); border: 1px solid #10b981; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .progress-box p { color: #a7f3d0; margin: 0 0 8px 0; }
    .broker-list { margin: 16px 0; }
    .broker-item { color: #e2e8f0; padding: 6px 0; display: flex; align-items: center; gap: 8px; }
    .broker-icon { color: #10b981; font-weight: bold; }
    .upgrade-box { background: #334155; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center; }
    .upgrade-box p { color: #94a3b8; margin: 0 0 12px 0; }
    .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${hasRemovals ? "Your Removals Are In Progress" : "Your Privacy Scan Is Waiting"}</h1>

    <p>Hey ${firstName},</p>

    ${progressMessage}

    ${statsHtml}

    ${hasRemovals ? `
    <div class="progress-box">
      <p><strong>What happens next?</strong></p>
      <p>Data brokers are legally required to process opt-out requests, but each one has its own timeline. Most respond within 7-14 days. We'll keep monitoring and re-submit if any broker drags their feet.</p>
    </div>
    ` : ""}

    ${brokerListHtml}

    <a href="${appendUtm(`${APP_URL}/dashboard`, 'first_removal_coming')}" class="btn">${hasRemovals ? "View Your Dashboard" : "Run Your First Scan"} &rarr;</a>

    ${hasRemovals ? `
    <div class="upgrade-box">
      <p>Free plan includes 3 removals per month. <strong style="color: #e2e8f0;">Unlock unlimited removals</strong> and continuous monitoring with Pro.</p>
      <a href="${appendUtm(`${APP_URL}/dashboard/billing`, 'first_removal_coming')}" class="btn-secondary">See Upgrade Options &rarr;</a>
    </div>
    ` : ""}

    <p>Your privacy is our priority,<br>The ${APP_NAME} Team</p>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <p><a href="${appendUtm(`${APP_URL}/unsubscribe`, 'first_removal_coming')}" style="color: #64748b;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
        `,
      };
    }

    case "final_push":
      return {
        subject: `${firstName}, this is my last reminder about your exposed data`,
        previewText: "Your personal info is still out there — here's what's at stake",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; }
    h1 { color: #ffffff; font-size: 24px; margin-bottom: 16px; }
    p { color: #94a3b8; line-height: 1.6; margin-bottom: 16px; }
    .highlight { color: #ef4444; font-weight: bold; }
    .green { color: #10b981; font-weight: bold; }
    .btn { display: inline-block; background: #10b981; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 16px 0; }
    .warning-box { background: #450a0a; border: 1px solid #dc2626; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .warning-box h3 { color: #fca5a5; margin: 0 0 12px 0; }
    .warning-box ul { color: #fca5a5; margin: 0; padding-left: 20px; }
    .warning-box li { margin-bottom: 8px; }
    .cta-box { background: #065f46; border: 2px solid #10b981; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
    .cta-box p { color: #a7f3d0; margin: 0 0 16px 0; }
    .price { color: #ffffff; font-size: 28px; font-weight: bold; }
    .price-detail { color: #94a3b8; font-size: 14px; }
    .price-original { color: #94a3b8; text-decoration: line-through; }
    .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="container">
    <h1>This Is My Final Reminder</h1>

    <p>Hey ${firstName},</p>

    <p>I'm going to be honest with you — this is the last email I'll send about this.</p>

    <p>I've been reaching out because your data is still exposed, and every day it sits out there, the risk compounds. I'm not going to pretend otherwise.</p>

    <p>Here's what's at stake...</p>

    <div class="warning-box">
      <h3>While you wait, your exposed data can be used for:</h3>
      <ul>
        <li>Identity theft and financial fraud</li>
        <li>Targeted phishing attacks</li>
        <li>Unwanted spam calls and texts</li>
        <li>Stalking and harassment</li>
        <li>Social engineering scams</li>
      </ul>
    </div>

    <p>The longer your data stays out there, the more it gets copied and spread across new sites.</p>

    <div class="cta-box">
      <p><span class="green">Pro gives you unlimited removals across 2,100+ data brokers.</span></p>
      <div class="price"><span class="price-original">$19.99/mo</span> &rarr; $9.99/mo</div>
      <p class="price-detail">$119.88/year — 50% off list price. 30-day money-back guarantee.</p>
      <a href="${appendUtm(`${APP_URL}/dashboard/billing`, 'final_push')}" class="btn">Upgrade to Pro &rarr;</a>
    </div>

    <p>This is the last email I'll send about this. The choice is yours.</p>

    <p>I hope you take action,<br>The ${APP_NAME} Team</p>

    <p style="font-size: 12px; color: #64748b;">P.S. If you've already taken care of your privacy elsewhere, that's great! Just reply and let me know, and I'll stop these reminders.</p>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <p><a href="${appendUtm(`${APP_URL}/unsubscribe`, 'final_push')}" style="color: #64748b;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
        `,
      };

    default:
      throw new Error(`Unknown drip template: ${templateId}`);
  }
}

/**
 * Enroll a user in the drip campaign
 */
export async function enrollInDripCampaign(userId: string): Promise<void> {
  try {
    // Check if user exists and get their info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, plan: true },
    });

    if (!user) {
      console.error("[Drip] User not found:", userId);
      return;
    }

    // Don't enroll paid users
    if (user.plan !== "FREE") {
      console.log("[Drip] Skipping enrollment for paid user:", userId);
      return;
    }

    // Create drip campaign enrollment
    await prisma.dripCampaign.upsert({
      where: { userId },
      create: {
        userId,
        enrolledAt: new Date(),
        nextEmailDay: 0,
        status: "active",
      },
      update: {
        enrolledAt: new Date(),
        nextEmailDay: 0,
        status: "active",
      },
    });

    console.log("[Drip] Enrolled user:", userId);

    // Send welcome email immediately
    await sendDripEmail(userId, "welcome");
  } catch (error) {
    console.error("[Drip] Failed to enroll user:", error);
  }
}

/**
 * Send a drip email to a user
 */
export async function sendDripEmail(userId: string, templateId: DripTemplateId): Promise<boolean> {
  const client = getResendClient();
  if (!client) {
    console.error("[Drip] Email client not configured");
    return false;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      console.error("[Drip] User not found:", userId);
      return false;
    }

    // Fetch per-user removal stats for the first_removal_coming template
    let templateData: DripTemplateData | undefined;
    if (templateId === "first_removal_coming") {
      const [removalRequests, exposureCount] = await Promise.all([
        prisma.removalRequest.findMany({
          where: { userId, status: { in: ["SUBMITTED", "IN_PROGRESS", "PENDING", "COMPLETED"] } },
          select: { status: true, exposure: { select: { sourceName: true } } },
          take: 50,
        }),
        prisma.exposure.count({ where: { userId } }),
      ]);
      templateData = {
        submittedCount: removalRequests.filter(r => r.status === "SUBMITTED" || r.status === "IN_PROGRESS").length,
        completedCount: removalRequests.filter(r => r.status === "COMPLETED").length,
        exposureCount,
        topBrokers: [...new Set(removalRequests.slice(0, 5).map(r => r.exposure.sourceName))],
      };
    }

    const template = getDripEmailTemplate(templateId, user.name || "there", templateData);

    // Check suppression — don't drip to bounced addresses
    const suppressed = await isEmailSuppressed(user.email);
    if (suppressed) {
      console.log(`[Drip] Skipped ${templateId} to ${user.email} — address suppressed`);
      return false;
    }

    // Check quota — drip emails should respect the shared limit
    if (!canSendEmail()) {
      console.warn(`[Drip] Skipped ${templateId} to ${user.email} — daily quota exceeded`);
      return false;
    }

    const { error } = await client.emails.send({
      from: getFromEmail(),
      to: user.email,
      subject: template.subject,
      html: template.html,
      headers: {
        "X-Entity-Ref-ID": `drip-${userId}-${templateId}`,
      },
    });

    if (error) {
      console.error("[Drip] Failed to send email:", error);
      return false;
    }

    // Log the sent email
    await prisma.dripEmailLog.create({
      data: {
        userId,
        templateId,
        sentAt: new Date(),
      },
    });

    console.log(`[Drip] Sent ${templateId} email to ${user.email}`);
    return true;
  } catch (error) {
    console.error("[Drip] Error sending email:", error);
    return false;
  }
}

/**
 * Process pending drip emails (called by cron job)
 */
export async function processDripCampaigns(): Promise<{
  processed: number;
  sent: number;
  errors: number;
}> {
  const stats = { processed: 0, sent: 0, errors: 0 };

  try {
    // Get active drip campaigns
    const campaigns = await prisma.dripCampaign.findMany({
      where: { status: "active" },
      include: {
        user: {
          select: { email: true, name: true, plan: true },
        },
      },
    });

    for (const campaign of campaigns) {
      stats.processed++;

      // Skip if user upgraded to paid
      if (campaign.user.plan !== "FREE") {
        await prisma.dripCampaign.update({
          where: { id: campaign.id },
          data: { status: "completed" },
        });
        continue;
      }

      // Calculate days since enrollment
      const daysSinceEnrollment = Math.floor(
        (Date.now() - campaign.enrolledAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Find the next email to send
      const nextEmail = DRIP_SCHEDULE.find(
        (s) => s.day === daysSinceEnrollment && s.day >= campaign.nextEmailDay
      );

      if (nextEmail) {
        // Check if we already sent this email
        const alreadySent = await prisma.dripEmailLog.findFirst({
          where: {
            userId: campaign.userId,
            templateId: nextEmail.templateId,
          },
        });

        if (!alreadySent) {
          const sent = await sendDripEmail(campaign.userId, nextEmail.templateId);
          if (sent) {
            stats.sent++;
            // Update next email day
            await prisma.dripCampaign.update({
              where: { id: campaign.id },
              data: { nextEmailDay: nextEmail.day + 1 },
            });
          } else {
            stats.errors++;
          }
        }
      }

      // Complete campaign if past final email
      if (daysSinceEnrollment > 14) {
        await prisma.dripCampaign.update({
          where: { id: campaign.id },
          data: { status: "completed" },
        });
      }
    }
  } catch (error) {
    console.error("[Drip] Error processing campaigns:", error);
    stats.errors++;
  }

  console.log(`[Drip] Processed: ${stats.processed}, Sent: ${stats.sent}, Errors: ${stats.errors}`);
  return stats;
}

/**
 * Pause a user's drip campaign
 */
export async function pauseDripCampaign(userId: string): Promise<void> {
  await prisma.dripCampaign.updateMany({
    where: { userId },
    data: { status: "paused" },
  });
}

/**
 * Resume a user's drip campaign
 */
export async function resumeDripCampaign(userId: string): Promise<void> {
  await prisma.dripCampaign.updateMany({
    where: { userId, status: "paused" },
    data: { status: "active" },
  });
}

/**
 * Unsubscribe user from drip campaign
 */
export async function unsubscribeFromDrip(userId: string): Promise<void> {
  await prisma.dripCampaign.updateMany({
    where: { userId },
    data: { status: "unsubscribed" },
  });
}
