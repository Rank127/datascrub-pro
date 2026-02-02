/**
 * Email Drip Campaign System
 *
 * Automated email sequences for nurturing leads and converting free users.
 * Campaigns are triggered when users sign up and run over 14 days.
 */

import { Resend } from "resend";
import { prisma } from "@/lib/db";

// Lazy-initialize Resend client
let _resend: Resend | null = null;
function getResendClient(): Resend | null {
  if (_resend === null && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const APP_NAME = "GhostMyData";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ghostmydata.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || `${APP_NAME} <onboarding@resend.dev>`;

// Drip campaign schedule (days after signup)
export const DRIP_SCHEDULE = [
  { day: 0, templateId: "welcome" },
  { day: 1, templateId: "scan_reminder" },
  { day: 3, templateId: "case_study" },
  { day: 7, templateId: "discount_offer" },
  { day: 14, templateId: "final_push" },
] as const;

export type DripTemplateId = typeof DRIP_SCHEDULE[number]["templateId"];

interface DripEmail {
  subject: string;
  previewText: string;
  html: string;
}

// Email templates
function getDripEmailTemplate(templateId: DripTemplateId, name: string): DripEmail {
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
    <p>You've taken the first step toward taking control of your personal data. We're here to help you every step of the way.</p>

    <div class="stats">
      <div class="stat">
        <div class="stat-value">2,100+</div>
        <div class="stat-label">Data sources we monitor</div>
      </div>
    </div>

    <p><span class="highlight">Your next step:</span> Run your first scan to see exactly where your personal information is exposed online.</p>

    <a href="${APP_URL}/dashboard" class="btn">Run Your First Scan →</a>

    <p>If you have any questions, just reply to this email. We're here to help!</p>

    <p>Stay safe,<br>The ${APP_NAME} Team</p>

    <div class="footer">
      <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <p><a href="${APP_URL}/unsubscribe" style="color: #64748b;">Unsubscribe</a></p>
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

    <p>Did you know that the average person has their personal information listed on <span class="highlight">over 50 data broker sites</span>?</p>

    <div class="warning-box">
      <p>⚠️ Right now, your name, address, phone number, and email could be available for anyone to find - including scammers and identity thieves.</p>
    </div>

    <p>The good news? Finding out takes less than 60 seconds.</p>

    <a href="${APP_URL}/dashboard" class="btn">See My Exposed Data →</a>

    <p>Once you run your scan, you'll see exactly which sites have your information and how to remove it.</p>

    <p>Your privacy matters,<br>The ${APP_NAME} Team</p>

    <div class="footer">
      <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <p><a href="${APP_URL}/unsubscribe" style="color: #64748b;">Unsubscribe</a></p>
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

    <p>I wanted to share a real success story from one of our customers - because seeing real results is the best way to understand what ${APP_NAME} can do for you.</p>

    <h2>Meet Sarah from Los Angeles</h2>

    <p>Sarah discovered her personal information - including her home address, phone number, and family members' names - was listed on <span class="highlight">over 150 data broker websites</span>.</p>

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

    <a href="${APP_URL}/dashboard" class="btn">See My Exposure Score →</a>

    <p>To your privacy,<br>The ${APP_NAME} Team</p>

    <div class="footer">
      <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <p><a href="${APP_URL}/unsubscribe" style="color: #64748b;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
        `,
      };

    case "discount_offer":
      return {
        subject: `${firstName}, here's 50% off Pro - just for you`,
        previewText: "Limited time offer - expires in 48 hours",
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
    .green { color: #10b981; }
    .btn { display: inline-block; background: #f97316; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 700; font-size: 18px; margin: 16px 0; }
    .offer-box { background: linear-gradient(135deg, #065f46 0%, #064e3b 100%); border: 2px solid #10b981; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
    .offer-title { color: #10b981; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
    .offer-price { color: #ffffff; font-size: 48px; font-weight: bold; }
    .offer-original { color: #94a3b8; text-decoration: line-through; font-size: 18px; }
    .offer-period { color: #94a3b8; font-size: 14px; }
    .urgency { background: #7c2d12; border: 1px solid #ea580c; border-radius: 8px; padding: 12px; margin: 24px 0; text-align: center; }
    .urgency p { color: #fed7aa; margin: 0; font-weight: 600; }
    .features { margin: 24px 0; }
    .feature { display: flex; align-items: center; gap: 12px; color: #e2e8f0; margin-bottom: 12px; }
    .feature-icon { color: #10b981; }
    .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎁 Special Offer Just For You</h1>

    <p>Hey ${firstName},</p>

    <p>I noticed you haven't upgraded to Pro yet. I wanted to give you a special offer that I don't usually share...</p>

    <div class="offer-box">
      <div class="offer-title">Exclusive 50% Off</div>
      <div class="offer-original">$11.99/month</div>
      <div class="offer-price">$5.99<span style="font-size: 18px; font-weight: normal;">/month</span></div>
      <div class="offer-period">Billed monthly. Cancel anytime.</div>
    </div>

    <div class="urgency">
      <p>⏰ This offer expires in 48 hours</p>
    </div>

    <p><span class="green">With Pro, you get:</span></p>

    <div class="features">
      <div class="feature"><span class="feature-icon">✓</span> Automated removal from 2,100+ sites</div>
      <div class="feature"><span class="feature-icon">✓</span> Weekly monitoring for new exposures</div>
      <div class="feature"><span class="feature-icon">✓</span> CCPA/GDPR removal requests</div>
      <div class="feature"><span class="feature-icon">✓</span> Priority support</div>
    </div>

    <a href="${APP_URL}/pricing?code=DRIP50" class="btn">Claim 50% Off Now →</a>

    <p>Use code <span class="highlight">DRIP50</span> at checkout if it's not automatically applied.</p>

    <p>To your privacy,<br>The ${APP_NAME} Team</p>

    <div class="footer">
      <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <p><a href="${APP_URL}/unsubscribe" style="color: #64748b;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
        `,
      };

    case "final_push":
      return {
        subject: `Last chance: Your data is still exposed, ${firstName}`,
        previewText: "Final reminder + special offer",
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
    .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚠️ This Is My Final Reminder</h1>

    <p>Hey ${firstName},</p>

    <p>I've been sending you emails about protecting your privacy, but I haven't heard back from you.</p>

    <p>I get it - we're all busy. But I want to be real with you about what's at stake...</p>

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
      <p><span class="green">I'm extending your 50% discount one more time.</span><br>Code: DRIP50</p>
      <a href="${APP_URL}/pricing?code=DRIP50" class="btn">Start Protecting My Data →</a>
    </div>

    <p>This is the last email I'll send about this. The choice is yours.</p>

    <p>I hope you take action,<br>The ${APP_NAME} Team</p>

    <p style="font-size: 12px; color: #64748b;">P.S. If you've already taken care of your privacy elsewhere, that's great! Just reply and let me know, and I'll stop these reminders.</p>

    <div class="footer">
      <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <p><a href="${APP_URL}/unsubscribe" style="color: #64748b;">Unsubscribe</a></p>
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

    const template = getDripEmailTemplate(templateId, user.name || "there");

    const { error } = await client.emails.send({
      from: FROM_EMAIL,
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
