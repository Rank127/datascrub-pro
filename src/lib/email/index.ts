import { Resend } from "resend";
import { prisma } from "@/lib/db";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const APP_NAME = (process.env.NEXT_PUBLIC_APP_NAME || "GhostMyData").replace(/[\r\n]/g, "").trim();

// Daily email quota tracking (resets at midnight UTC)
const DAILY_EMAIL_LIMIT = parseInt(process.env.DAILY_EMAIL_LIMIT || "90"); // Leave buffer below Resend's 100
let emailsSentToday = 0;
let lastResetDate = new Date().toDateString();

function checkAndResetDailyCounter() {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    emailsSentToday = 0;
    lastResetDate = today;
  }
}

export function getEmailQuotaStatus() {
  checkAndResetDailyCounter();
  return {
    sent: emailsSentToday,
    limit: DAILY_EMAIL_LIMIT,
    remaining: Math.max(0, DAILY_EMAIL_LIMIT - emailsSentToday),
    percentUsed: Math.round((emailsSentToday / DAILY_EMAIL_LIMIT) * 100),
  };
}

export function canSendEmail(): boolean {
  checkAndResetDailyCounter();
  return emailsSentToday < DAILY_EMAIL_LIMIT;
}
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || "https://ghostmydata.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || `${APP_NAME} <onboarding@resend.dev>`;

// Base email template
function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 40px 20px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 40px;">
        ${content}
        <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">
        <p style="font-size: 12px; color: #64748b; margin-bottom: 0; text-align: center;">
          &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.<br>
          <a href="${APP_URL}/dashboard/settings" style="color: #10b981;">Manage notification preferences</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

// Button component
function buttonHtml(text: string, url: string): string {
  return `
    <div style="text-align: center; margin: 32px 0;">
      <a href="${url}" style="display: inline-block; background-color: #10b981; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        ${text}
      </a>
    </div>
  `;
}

interface SendEmailOptions {
  skipQuotaCheck?: boolean;
  queueIfExceeded?: boolean;  // Queue email if quota exceeded instead of failing
  emailType?: string;         // For queue categorization
  userId?: string;            // Associated user
  priority?: number;          // 1=highest, 10=lowest
  context?: Record<string, unknown>;  // Additional context for debugging
}

// Queue an email for later sending
async function queueEmail(
  to: string,
  subject: string,
  html: string,
  options: SendEmailOptions = {}
): Promise<{ success: boolean; queued: boolean; queueId?: string }> {
  try {
    const queued = await prisma.emailQueue.create({
      data: {
        toEmail: to,
        subject,
        htmlContent: html,
        emailType: options.emailType || "GENERAL",
        priority: options.priority || 5,
        userId: options.userId,
        context: options.context ? JSON.stringify(options.context) : null,
        status: "QUEUED",
        // Process after midnight UTC when quota resets
        processAt: getNextQuotaReset(),
      },
    });

    console.log(`[Email] Queued email to ${to} (ID: ${queued.id}) - will process after quota reset`);
    return { success: true, queued: true, queueId: queued.id };
  } catch (error) {
    console.error("[Email] Failed to queue email:", error);
    return { success: false, queued: false };
  }
}

// Get next quota reset time (midnight UTC)
function getNextQuotaReset(): Date {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow;
}

// Send email helper with quota tracking and optional queueing
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  options: SendEmailOptions | boolean = {}
) {
  // Handle legacy boolean parameter (skipQuotaCheck)
  if (typeof options === "boolean") {
    options = { skipQuotaCheck: options };
  }

  const { skipQuotaCheck = false, queueIfExceeded = true, emailType, userId, priority, context } = options;

  if (!resend) {
    console.warn("Email service not configured - RESEND_API_KEY missing");
    return { success: false, error: "Email service not configured" };
  }

  // Check quota (unless explicitly skipped for critical emails)
  if (!skipQuotaCheck && !canSendEmail()) {
    console.warn(`[Email] Daily quota exceeded (${emailsSentToday}/${DAILY_EMAIL_LIMIT}).`);

    // Queue the email if enabled
    if (queueIfExceeded) {
      return queueEmail(to, subject, html, { emailType, userId, priority, context });
    }

    return { success: false, error: "Daily email quota exceeded", quotaExceeded: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return { success: false, error: error.message };
    }

    // Track successful send
    emailsSentToday++;
    console.log(`[Email] Sent to ${to} (${emailsSentToday}/${DAILY_EMAIL_LIMIT} today)`);

    return { success: true };
  } catch (err) {
    console.error("Error sending email:", err);
    return { success: false, error: "Failed to send email" };
  }
}

// Process queued emails (call this from a cron job or API endpoint)
export async function processEmailQueue(limit: number = 10): Promise<{
  processed: number;
  sent: number;
  failed: number;
  remaining: number;
}> {
  const stats = { processed: 0, sent: 0, failed: 0, remaining: 0 };

  // Check if we have quota available
  const quota = getEmailQuotaStatus();
  if (quota.remaining <= 0) {
    console.log("[Email Queue] No quota available, skipping queue processing");
    const remaining = await prisma.emailQueue.count({ where: { status: "QUEUED" } });
    return { ...stats, remaining };
  }

  // Get queued emails ready to process
  const queuedEmails = await prisma.emailQueue.findMany({
    where: {
      status: "QUEUED",
      processAt: { lte: new Date() },
      attempts: { lt: 3 },
    },
    orderBy: [
      { priority: "asc" },  // Higher priority first (lower number)
      { createdAt: "asc" }, // Older first
    ],
    take: Math.min(limit, quota.remaining),
  });

  console.log(`[Email Queue] Processing ${queuedEmails.length} queued emails`);

  for (const email of queuedEmails) {
    stats.processed++;

    // Update status to processing
    await prisma.emailQueue.update({
      where: { id: email.id },
      data: { status: "PROCESSING", attempts: { increment: 1 } },
    });

    try {
      // Send directly without queueing (to avoid infinite loop)
      const result = await sendEmail(email.toEmail, email.subject, email.htmlContent, {
        skipQuotaCheck: false,
        queueIfExceeded: false, // Don't re-queue if this fails
      });

      if (result.success) {
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: { status: "SENT", sentAt: new Date() },
        });
        stats.sent++;
      } else {
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: {
            status: email.attempts >= 2 ? "FAILED" : "QUEUED",
            lastError: "error" in result ? result.error : "Unknown error",
          },
        });
        stats.failed++;
      }
    } catch (error) {
      await prisma.emailQueue.update({
        where: { id: email.id },
        data: {
          status: email.attempts >= 2 ? "FAILED" : "QUEUED",
          lastError: error instanceof Error ? error.message : "Unknown error",
        },
      });
      stats.failed++;
    }

    // Small delay between sends
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Get remaining count
  stats.remaining = await prisma.emailQueue.count({ where: { status: "QUEUED" } });

  console.log(`[Email Queue] Done: ${stats.sent} sent, ${stats.failed} failed, ${stats.remaining} remaining`);
  return stats;
}

// Get queue status for dashboard
export async function getEmailQueueStatus(): Promise<{
  queued: number;
  processing: number;
  sent: number;
  failed: number;
  nextProcessAt: Date | null;
}> {
  const [queued, processing, sent, failed, nextEmail] = await Promise.all([
    prisma.emailQueue.count({ where: { status: "QUEUED" } }),
    prisma.emailQueue.count({ where: { status: "PROCESSING" } }),
    prisma.emailQueue.count({ where: { status: "SENT" } }),
    prisma.emailQueue.count({ where: { status: "FAILED" } }),
    prisma.emailQueue.findFirst({
      where: { status: "QUEUED" },
      orderBy: { processAt: "asc" },
      select: { processAt: true },
    }),
  ]);

  return {
    queued,
    processing,
    sent,
    failed,
    nextProcessAt: nextEmail?.processAt || null,
  };
}

// Password Reset Email
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const html = baseTemplate(`
    <h1 style="color: #10b981; margin-top: 0;">Reset Your Password</h1>
    <p style="font-size: 16px; line-height: 1.6;">
      You requested to reset your password for your ${APP_NAME} account.
    </p>
    <p style="font-size: 16px; line-height: 1.6;">
      Click the button below to set a new password. This link will expire in 1 hour.
    </p>
    ${buttonHtml("Reset Password", resetUrl)}
    <p style="font-size: 14px; color: #94a3b8;">
      If you didn't request this, you can safely ignore this email.
    </p>
  `);

  return sendEmail(email, `Reset your ${APP_NAME} password`, html);
}

// Welcome Email
export async function sendWelcomeEmail(email: string, name: string) {
  const html = baseTemplate(`
    <h1 style="color: #10b981; margin-top: 0;">Welcome to ${APP_NAME}!</h1>
    <p style="font-size: 16px; line-height: 1.6;">
      Hi ${name || "there"},
    </p>
    <p style="font-size: 16px; line-height: 1.6;">
      Thank you for joining ${APP_NAME}. We're here to help you take control of your personal data online.
    </p>
    <p style="font-size: 16px; line-height: 1.6;">
      <strong>Here's how to get started:</strong>
    </p>
    <ol style="font-size: 16px; line-height: 1.8; padding-left: 20px;">
      <li>Complete your profile with your personal information</li>
      <li>Run your first scan to find data exposures</li>
      <li>Review results and request removals</li>
      <li>Whitelist accounts you want to keep</li>
    </ol>
    ${buttonHtml("Start Your First Scan", `${APP_URL}/dashboard/scan`)}
    <p style="font-size: 14px; color: #94a3b8;">
      Need help? Reply to this email or visit our help center.
    </p>
  `);

  return sendEmail(email, `Welcome to ${APP_NAME}!`, html);
}

// New Exposure Alert Email
interface ExposureAlert {
  count: number;
  critical: number;
  high: number;
  sources: string[];
}

export async function sendExposureAlertEmail(email: string, name: string, alert: ExposureAlert) {
  const severityText = alert.critical > 0
    ? `<span style="color: #ef4444; font-weight: bold;">${alert.critical} critical</span>`
    : alert.high > 0
    ? `<span style="color: #f97316; font-weight: bold;">${alert.high} high-risk</span>`
    : `${alert.count}`;

  const html = baseTemplate(`
    <h1 style="color: #f97316; margin-top: 0;">⚠️ New Data Exposures Found</h1>
    <p style="font-size: 16px; line-height: 1.6;">
      Hi ${name || "there"},
    </p>
    <p style="font-size: 16px; line-height: 1.6;">
      Your latest scan found <strong>${alert.count} new data exposure${alert.count !== 1 ? 's' : ''}</strong>,
      including ${severityText} findings.
    </p>
    <div style="background-color: #0f172a; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #94a3b8;">Sources:</p>
      <ul style="margin: 0; padding-left: 20px; color: #e2e8f0;">
        ${alert.sources.slice(0, 5).map(s => `<li>${s}</li>`).join('')}
        ${alert.sources.length > 5 ? `<li>...and ${alert.sources.length - 5} more</li>` : ''}
      </ul>
    </div>
    ${buttonHtml("Review Exposures", `${APP_URL}/dashboard/exposures`)}
    <p style="font-size: 14px; color: #94a3b8;">
      We recommend reviewing these exposures and requesting removal for any you don't want online.
    </p>
  `);

  return sendEmail(email, `[Action Required] ${alert.count} New Data Exposures Found`, html);
}

// Removal Status Update Email
interface RemovalUpdate {
  sourceName: string;
  status: "SUBMITTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  dataType: string;
}

export async function sendRemovalUpdateEmail(email: string, name: string, update: RemovalUpdate) {
  const statusConfig = {
    SUBMITTED: { color: "#3b82f6", text: "Removal Request Submitted", icon: "📤" },
    IN_PROGRESS: { color: "#f97316", text: "Removal In Progress", icon: "⏳" },
    COMPLETED: { color: "#10b981", text: "Removal Completed!", icon: "✅" },
    FAILED: { color: "#ef4444", text: "Removal Requires Attention", icon: "⚠️" },
  };

  const config = statusConfig[update.status];

  const html = baseTemplate(`
    <h1 style="color: ${config.color}; margin-top: 0;">${config.icon} ${config.text}</h1>
    <p style="font-size: 16px; line-height: 1.6;">
      Hi ${name || "there"},
    </p>
    <p style="font-size: 16px; line-height: 1.6;">
      Your data removal request has been updated:
    </p>
    <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #94a3b8;">Source:</td>
          <td style="padding: 8px 0; color: #e2e8f0; text-align: right; font-weight: 600;">${update.sourceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #94a3b8;">Data Type:</td>
          <td style="padding: 8px 0; color: #e2e8f0; text-align: right;">${update.dataType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #94a3b8;">Status:</td>
          <td style="padding: 8px 0; color: ${config.color}; text-align: right; font-weight: 600;">${update.status.replace(/_/g, ' ')}</td>
        </tr>
      </table>
    </div>
    ${update.status === "COMPLETED"
      ? `<p style="font-size: 16px; line-height: 1.6; color: #10b981;">
          🎉 Great news! Your data has been successfully removed from ${update.sourceName}.
        </p>`
      : update.status === "FAILED"
      ? `<p style="font-size: 16px; line-height: 1.6;">
          The automatic removal encountered an issue. You may need to complete this removal manually.
        </p>`
      : `<p style="font-size: 16px; line-height: 1.6;">
          We'll keep you updated as the removal progresses.
        </p>`
    }
    ${buttonHtml("View All Removals", `${APP_URL}/dashboard/removals`)}
  `);

  return sendEmail(email, `${config.icon} Removal Update: ${update.sourceName}`, html);
}

// Weekly Report Email
interface WeeklyReportData {
  totalExposures: number;
  newExposures: number;
  removedThisWeek: number;
  pendingRemovals: number;
  riskScore: number;
  riskChange: number; // positive = worse, negative = better
}

export async function sendWeeklyReportEmail(email: string, name: string, report: WeeklyReportData) {
  const riskColor = report.riskScore >= 70 ? "#ef4444" : report.riskScore >= 40 ? "#f97316" : "#10b981";
  const changeText = report.riskChange === 0
    ? "unchanged"
    : report.riskChange < 0
    ? `<span style="color: #10b981;">↓ ${Math.abs(report.riskChange)} points better</span>`
    : `<span style="color: #ef4444;">↑ ${report.riskChange} points worse</span>`;

  const html = baseTemplate(`
    <h1 style="color: #10b981; margin-top: 0;">📊 Your Weekly Privacy Report</h1>
    <p style="font-size: 16px; line-height: 1.6;">
      Hi ${name || "there"},
    </p>
    <p style="font-size: 16px; line-height: 1.6;">
      Here's your data privacy summary for the past week:
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <div style="display: inline-block; width: 100px; height: 100px; border-radius: 50%; background: conic-gradient(${riskColor} ${report.riskScore}%, #1e293b ${report.riskScore}%); position: relative;">
        <div style="position: absolute; top: 10px; left: 10px; right: 10px; bottom: 10px; background: #1e293b; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 24px; font-weight: bold; color: ${riskColor};">${report.riskScore}</span>
        </div>
      </div>
      <p style="color: #94a3b8; margin-top: 8px;">Risk Score (${changeText})</p>
    </div>

    <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Total Exposures</td>
          <td style="padding: 12px 0; color: #e2e8f0; text-align: right; font-weight: 600; border-bottom: 1px solid #334155;">${report.totalExposures}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #94a3b8; border-bottom: 1px solid #334155;">New This Week</td>
          <td style="padding: 12px 0; color: ${report.newExposures > 0 ? '#f97316' : '#10b981'}; text-align: right; font-weight: 600; border-bottom: 1px solid #334155;">
            ${report.newExposures > 0 ? '+' : ''}${report.newExposures}
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Removed This Week</td>
          <td style="padding: 12px 0; color: #10b981; text-align: right; font-weight: 600; border-bottom: 1px solid #334155;">${report.removedThisWeek}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #94a3b8;">Pending Removals</td>
          <td style="padding: 12px 0; color: #e2e8f0; text-align: right; font-weight: 600;">${report.pendingRemovals}</td>
        </tr>
      </table>
    </div>

    ${report.newExposures > 0
      ? `<p style="font-size: 16px; line-height: 1.6;">
          ⚠️ We found ${report.newExposures} new exposure${report.newExposures !== 1 ? 's' : ''} this week.
          Review and request removal to improve your privacy score.
        </p>`
      : `<p style="font-size: 16px; line-height: 1.6;">
          ✅ No new exposures found this week. Keep up the good work!
        </p>`
    }
    ${buttonHtml("View Full Dashboard", `${APP_URL}/dashboard`)}
  `);

  return sendEmail(email, `📊 Your Weekly Privacy Report - Risk Score: ${report.riskScore}`, html);
}

// Subscription Confirmation Email
export async function sendSubscriptionEmail(email: string, name: string, plan: "PRO" | "ENTERPRISE") {
  const features = plan === "ENTERPRISE"
    ? ["Unlimited scans", "Dark web monitoring", "Family plan (5 profiles)", "Daily monitoring", "API access", "Priority support"]
    : ["50 scans/month", "Automated removals", "Weekly monitoring", "Priority support"];

  const html = baseTemplate(`
    <h1 style="color: #10b981; margin-top: 0;">🎉 Welcome to ${APP_NAME} ${plan}!</h1>
    <p style="font-size: 16px; line-height: 1.6;">
      Hi ${name || "there"},
    </p>
    <p style="font-size: 16px; line-height: 1.6;">
      Thank you for upgrading! Your ${plan} subscription is now active.
    </p>
    <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #10b981;">Your ${plan} features:</p>
      <ul style="margin: 0; padding-left: 20px; color: #e2e8f0; line-height: 1.8;">
        ${features.map(f => `<li>${f}</li>`).join('')}
      </ul>
    </div>
    ${buttonHtml("Start Using Premium Features", `${APP_URL}/dashboard`)}
    <p style="font-size: 14px; color: #94a3b8;">
      You can manage your subscription anytime in Settings → Subscription.
    </p>
  `);

  return sendEmail(email, `🎉 Your ${APP_NAME} ${plan} subscription is active!`, html);
}

// Refund Confirmation Email
export async function sendRefundConfirmationEmail(
  email: string,
  name: string,
  refundAmount: number,
  isFullRefund: boolean
) {
  const html = baseTemplate(`
    <h1 style="color: #10b981; margin-top: 0;">💰 Refund Processed</h1>
    <p style="font-size: 16px; line-height: 1.6;">
      Hi ${name || "there"},
    </p>
    <p style="font-size: 16px; line-height: 1.6;">
      We've processed your refund request. Here are the details:
    </p>
    <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Refund Amount</td>
          <td style="padding: 12px 0; color: #10b981; text-align: right; font-weight: 600; font-size: 18px; border-bottom: 1px solid #334155;">$${refundAmount.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Refund Type</td>
          <td style="padding: 12px 0; color: #e2e8f0; text-align: right; border-bottom: 1px solid #334155;">${isFullRefund ? 'Full Refund' : 'Partial Refund'}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #94a3b8;">Processing Time</td>
          <td style="padding: 12px 0; color: #e2e8f0; text-align: right;">5-10 business days</td>
        </tr>
      </table>
    </div>
    ${isFullRefund
      ? `<p style="font-size: 16px; line-height: 1.6;">
          Your subscription has been cancelled and your account has been moved to the <strong>Free plan</strong>.
          You can continue using basic features or upgrade again anytime.
        </p>`
      : `<p style="font-size: 16px; line-height: 1.6;">
          Your subscription remains active. If you have any questions about this partial refund, please contact our support team.
        </p>`
    }
    <p style="font-size: 16px; line-height: 1.6;">
      The refund will appear on your original payment method within 5-10 business days, depending on your bank.
    </p>
    ${buttonHtml("Go to Dashboard", `${APP_URL}/dashboard`)}
    <p style="font-size: 14px; color: #94a3b8;">
      Thank you for trying ${APP_NAME}. If you have any feedback about your experience,
      we'd love to hear from you at <a href="mailto:support@ghostmydata.com" style="color: #10b981;">support@ghostmydata.com</a>.
    </p>
  `);

  return sendEmail(email, `💰 Your $${refundAmount.toFixed(2)} Refund Has Been Processed`, html);
}

// Removal Follow-up Reminder Email (30/45 day reminder)
interface FollowUpReminderData {
  sourceName: string;
  dataType: string;
  submittedAt: Date;
  daysSinceSubmission: number;
  removalRequestId: string;
}

export async function sendFollowUpReminderEmail(
  email: string,
  name: string,
  reminder: FollowUpReminderData
) {
  const submittedDate = reminder.submittedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isOverdue = reminder.daysSinceSubmission >= 45;
  const urgencyColor = isOverdue ? "#ef4444" : "#f97316";

  const html = baseTemplate(`
    <h1 style="color: ${urgencyColor}; margin-top: 0;">📬 Removal Follow-up Reminder</h1>
    <p style="font-size: 16px; line-height: 1.6;">
      Hi ${name || "there"},
    </p>
    <p style="font-size: 16px; line-height: 1.6;">
      It's been <strong>${reminder.daysSinceSubmission} days</strong> since we submitted your data removal request.
      Here's the status:
    </p>
    <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #94a3b8;">Source:</td>
          <td style="padding: 8px 0; color: #e2e8f0; text-align: right; font-weight: 600;">${reminder.sourceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #94a3b8;">Data Type:</td>
          <td style="padding: 8px 0; color: #e2e8f0; text-align: right;">${reminder.dataType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #94a3b8;">Submitted On:</td>
          <td style="padding: 8px 0; color: #e2e8f0; text-align: right;">${submittedDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #94a3b8;">Days Elapsed:</td>
          <td style="padding: 8px 0; color: ${urgencyColor}; text-align: right; font-weight: 600;">${reminder.daysSinceSubmission} days</td>
        </tr>
      </table>
    </div>
    ${isOverdue
      ? `<div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; color: #ef4444; font-weight: 600;">⚠️ Past CCPA 45-Day Deadline</p>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #e2e8f0;">
            Under CCPA, organizations must respond within 45 days. This request is overdue.
            We recommend sending a follow-up request or contacting them directly.
          </p>
        </div>`
      : `<p style="font-size: 16px; line-height: 1.6;">
          Under CCPA (45 days) and GDPR (30 days), organizations must respond to data deletion requests.
          ${reminder.daysSinceSubmission >= 30
            ? `This request has passed the <strong>GDPR 30-day deadline</strong>.`
            : `You have ${45 - reminder.daysSinceSubmission} days until the CCPA deadline.`
          }
        </p>`
    }
    <p style="font-size: 16px; line-height: 1.6;">
      <strong>What you can do:</strong>
    </p>
    <ul style="font-size: 16px; line-height: 1.8; padding-left: 20px; color: #e2e8f0;">
      <li>Check your email for any responses from ${reminder.sourceName}</li>
      <li>Re-send the removal request with escalation language</li>
      <li>Contact them directly if no response is received</li>
    </ul>
    ${buttonHtml("View Removal Status", `${APP_URL}/dashboard/removals`)}
    ${buttonHtml("Re-send Request", `${APP_URL}/api/removals/resend?id=${reminder.removalRequestId}`)}
  `);

  return sendEmail(
    email,
    `📬 ${isOverdue ? "[Overdue]" : "[Reminder]"} Follow-up: ${reminder.sourceName} removal (${reminder.daysSinceSubmission} days)`,
    html
  );
}

// Batch follow-up summary email (when multiple reminders are due)
interface BatchFollowUpData {
  totalPending: number;
  over30Days: number;
  over45Days: number;
  reminders: Array<{
    sourceName: string;
    daysSinceSubmission: number;
  }>;
}

export async function sendBatchFollowUpEmail(
  email: string,
  name: string,
  data: BatchFollowUpData
) {
  const html = baseTemplate(`
    <h1 style="color: #f97316; margin-top: 0;">📊 Removal Request Status Summary</h1>
    <p style="font-size: 16px; line-height: 1.6;">
      Hi ${name || "there"},
    </p>
    <p style="font-size: 16px; line-height: 1.6;">
      Here's a summary of your pending data removal requests:
    </p>
    <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Total Pending</td>
          <td style="padding: 12px 0; color: #e2e8f0; text-align: right; font-weight: 600; border-bottom: 1px solid #334155;">${data.totalPending}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Over GDPR Deadline (30 days)</td>
          <td style="padding: 12px 0; color: ${data.over30Days > 0 ? '#f97316' : '#10b981'}; text-align: right; font-weight: 600; border-bottom: 1px solid #334155;">${data.over30Days}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #94a3b8;">Over CCPA Deadline (45 days)</td>
          <td style="padding: 12px 0; color: ${data.over45Days > 0 ? '#ef4444' : '#10b981'}; text-align: right; font-weight: 600;">${data.over45Days}</td>
        </tr>
      </table>
    </div>
    ${data.over45Days > 0
      ? `<div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; color: #ef4444; font-weight: 600;">⚠️ ${data.over45Days} request${data.over45Days !== 1 ? 's' : ''} past CCPA deadline</p>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #e2e8f0;">
            Consider escalating these requests or contacting the organizations directly.
          </p>
        </div>`
      : ''
    }
    <p style="font-size: 16px; line-height: 1.6;"><strong>Requests requiring attention:</strong></p>
    <div style="background-color: #0f172a; border-radius: 8px; padding: 16px; margin: 24px 0;">
      ${data.reminders.slice(0, 10).map(r => `
        <div style="padding: 8px 0; border-bottom: 1px solid #334155; display: flex; justify-content: space-between;">
          <span style="color: #e2e8f0;">${r.sourceName}</span>
          <span style="color: ${r.daysSinceSubmission >= 45 ? '#ef4444' : r.daysSinceSubmission >= 30 ? '#f97316' : '#10b981'}; font-weight: 600;">
            ${r.daysSinceSubmission} days
          </span>
        </div>
      `).join('')}
      ${data.reminders.length > 10 ? `
        <p style="margin: 12px 0 0 0; color: #94a3b8; font-size: 14px;">
          ...and ${data.reminders.length - 10} more
        </p>
      ` : ''}
    </div>
    ${buttonHtml("View All Removals", `${APP_URL}/dashboard/removals`)}
  `);

  return sendEmail(
    email,
    `📊 ${data.over45Days > 0 ? '[Action Required] ' : ''}${data.totalPending} Pending Removal Requests`,
    html
  );
}

// Monthly re-scan reminder email
export async function sendRescanReminderEmail(
  email: string,
  name: string,
  lastScanDate: Date | null,
  exposureCount: number
) {
  const lastScanText = lastScanDate
    ? lastScanDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Never";
  const daysSinceLastScan = lastScanDate
    ? Math.floor((Date.now() - lastScanDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const html = baseTemplate(`
    <h1 style="color: #10b981; margin-top: 0;">🔍 Time for Your Monthly Privacy Scan</h1>
    <p style="font-size: 16px; line-height: 1.6;">
      Hi ${name || "there"},
    </p>
    <p style="font-size: 16px; line-height: 1.6;">
      It's been a while since your last privacy scan. Regular scans help you stay on top of new data exposures
      and keep your personal information secure.
    </p>
    <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Last Scan</td>
          <td style="padding: 12px 0; color: #e2e8f0; text-align: right; font-weight: 600; border-bottom: 1px solid #334155;">
            ${lastScanText}
            ${daysSinceLastScan ? ` (${daysSinceLastScan} days ago)` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #94a3b8;">Known Exposures</td>
          <td style="padding: 12px 0; color: ${exposureCount > 0 ? '#f97316' : '#10b981'}; text-align: right; font-weight: 600;">${exposureCount}</td>
        </tr>
      </table>
    </div>
    <p style="font-size: 16px; line-height: 1.6;">
      <strong>Why scan regularly?</strong>
    </p>
    <ul style="font-size: 16px; line-height: 1.8; padding-left: 20px; color: #e2e8f0;">
      <li>New data breaches happen constantly</li>
      <li>Data brokers re-aggregate information regularly</li>
      <li>Removed data may reappear from other sources</li>
      <li>Stay ahead of identity theft risks</li>
    </ul>
    ${buttonHtml("Start Scan Now", `${APP_URL}/dashboard/scan`)}
    <p style="font-size: 14px; color: #94a3b8;">
      Tip: PRO and ENTERPRISE users get automated weekly/daily scans. Upgrade to never miss a new exposure.
    </p>
  `);

  return sendEmail(
    email,
    `🔍 Time for Your Monthly Privacy Scan`,
    html
  );
}

// CCPA/GDPR Removal Request Email (sent to data brokers)
interface RemovalRequestEmail {
  toEmail: string;
  fromName: string;
  fromEmail: string;
  dataTypes: string[];
  sourceUrl?: string;
}

export async function sendCCPARemovalRequest(data: RemovalRequestEmail) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
      <p>To Whom It May Concern,</p>

      <p>I am writing to exercise my rights under the California Consumer Privacy Act (CCPA) and/or the General Data Protection Regulation (GDPR) to request the deletion of my personal information from your systems.</p>

      <p><strong>Request Details:</strong></p>
      <ul>
        <li><strong>Full Name:</strong> ${data.fromName}</li>
        <li><strong>Email:</strong> ${data.fromEmail}</li>
        <li><strong>Data Types to Remove:</strong> ${data.dataTypes.join(', ')}</li>
        ${data.sourceUrl ? `<li><strong>Profile URL (if applicable):</strong> ${data.sourceUrl}</li>` : ''}
      </ul>

      <p>Under the CCPA (Cal. Civ. Code § 1798.105) and GDPR (Article 17), I have the right to request that a business delete any personal information about me that it has collected. I am making such a request now.</p>

      <p>Please confirm receipt of this request and provide written confirmation once my data has been deleted. According to applicable regulations, you must respond to this request within 45 days (CCPA) or 30 days (GDPR).</p>

      <p>If you require any additional information to verify my identity or process this request, please contact me at ${data.fromEmail}.</p>

      <p>Thank you for your prompt attention to this matter.</p>

      <p>Sincerely,<br>${data.fromName}</p>

      <hr style="border: none; border-top: 1px solid #ccc; margin: 24px 0;">
      <p style="font-size: 12px; color: #666;">
        This request was sent via ${APP_NAME} on behalf of ${data.fromName}.<br>
        For questions about this service, visit ${APP_URL}
      </p>
    </body>
    </html>
  `;

  return sendEmail(
    data.toEmail,
    `Data Deletion Request - CCPA/GDPR - ${data.fromName}`,
    html
  );
}

// Consolidated CCPA/GDPR Removal Request Email (for bulk removals - one email per broker)
interface BulkRemovalRequestEmail {
  toEmail: string;
  brokerName: string;
  fromName: string;
  fromEmail: string;
  exposures: Array<{
    dataType: string;
    sourceUrl?: string | null;
  }>;
}

export async function sendBulkCCPARemovalRequest(data: BulkRemovalRequestEmail) {
  // Dedupe data types
  const uniqueDataTypes = [...new Set(data.exposures.map(e => e.dataType))];

  // Get unique URLs (filter out null/undefined)
  const uniqueUrls = [...new Set(data.exposures.map(e => e.sourceUrl).filter(Boolean))];

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
      <p>To Whom It May Concern,</p>

      <p>I am writing to exercise my rights under the California Consumer Privacy Act (CCPA) and/or the General Data Protection Regulation (GDPR) to request the deletion of <strong>all</strong> my personal information from your systems and any affiliated/subsidiary services.</p>

      <p><strong>Request Details:</strong></p>
      <ul>
        <li><strong>Full Name:</strong> ${data.fromName}</li>
        <li><strong>Email:</strong> ${data.fromEmail}</li>
        <li><strong>Number of Records Found:</strong> ${data.exposures.length}</li>
        <li><strong>Data Types to Remove:</strong>
          <ul>
            ${uniqueDataTypes.map(dt => `<li>${dt}</li>`).join('')}
          </ul>
        </li>
        ${uniqueUrls.length > 0 ? `
        <li><strong>Profile URLs (if applicable):</strong>
          <ul>
            ${uniqueUrls.slice(0, 10).map(url => `<li>${url}</li>`).join('')}
            ${uniqueUrls.length > 10 ? `<li><em>...and ${uniqueUrls.length - 10} more records</em></li>` : ''}
          </ul>
        </li>
        ` : ''}
      </ul>

      <p>Under the CCPA (Cal. Civ. Code § 1798.105) and GDPR (Article 17), I have the right to request that a business delete any personal information about me that it has collected. This includes all records across your platform(s) and any subsidiary or affiliated services that share data.</p>

      <p><strong>Please delete ALL records associated with:</strong></p>
      <ul>
        <li>My name: ${data.fromName}</li>
        <li>My email: ${data.fromEmail}</li>
        <li>Any variations or associated records</li>
      </ul>

      <p>Please confirm receipt of this request and provide written confirmation once my data has been deleted. According to applicable regulations, you must respond to this request within 45 days (CCPA) or 30 days (GDPR).</p>

      <p>If you require any additional information to verify my identity or process this request, please contact me at ${data.fromEmail}.</p>

      <p>Thank you for your prompt attention to this matter.</p>

      <p>Sincerely,<br>${data.fromName}</p>

      <hr style="border: none; border-top: 1px solid #ccc; margin: 24px 0;">
      <p style="font-size: 12px; color: #666;">
        This request was sent via ${APP_NAME} on behalf of ${data.fromName}.<br>
        For questions about this service, visit ${APP_URL}
      </p>
    </body>
    </html>
  `;

  return sendEmail(
    data.toEmail,
    `Data Deletion Request - CCPA/GDPR - ${data.fromName} (${data.exposures.length} records)`,
    html
  );
}

// Bulk Removal Summary Email (sent to user after bulk removal)
interface ManualRemovalInfo {
  sourceName: string;
  source: string;
  optOutUrl?: string;
  instructions?: string;
}

interface BulkRemovalSummary {
  totalProcessed: number;
  successCount: number;
  failCount: number;
  sources: string[];
  consolidatedCount: number;
  manualRemovals?: ManualRemovalInfo[];
  emailsSent?: number;
}

export async function sendBulkRemovalSummaryEmail(
  email: string,
  name: string,
  summary: BulkRemovalSummary
) {
  const manualRemovals = summary.manualRemovals || [];
  const hasManualRemovals = manualRemovals.length > 0;

  // Generate manual removal section if needed
  const manualRemovalSection = hasManualRemovals ? `
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #334155;">
      <h2 style="color: #f97316; margin-top: 0;">📋 Manual Removal Required (${manualRemovals.length} sites)</h2>
      <p style="font-size: 14px; color: #94a3b8; margin-bottom: 16px;">
        The following sites don't have automated removal. Use the links below to manually request removal:
      </p>
      <div style="background-color: #0f172a; border-radius: 8px; padding: 16px; margin: 16px 0;">
        ${manualRemovals.slice(0, 50).map((m, i) => `
          <div style="padding: 12px 0; ${i < manualRemovals.length - 1 ? 'border-bottom: 1px solid #334155;' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #e2e8f0; font-weight: 600;">${i + 1}. ${m.sourceName}</span>
              ${m.optOutUrl ? `<a href="${m.optOutUrl}" style="color: #10b981; text-decoration: none; font-size: 14px;">Opt-out Link →</a>` : ''}
            </div>
            ${m.instructions ? `<p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0 0;">${m.instructions.substring(0, 200)}${m.instructions.length > 200 ? '...' : ''}</p>` : ''}
          </div>
        `).join('')}
        ${manualRemovals.length > 50 ? `
          <p style="color: #94a3b8; font-size: 14px; margin-top: 16px; text-align: center;">
            ...and ${manualRemovals.length - 50} more. View all in your dashboard.
          </p>
        ` : ''}
      </div>
      <p style="font-size: 14px; color: #94a3b8;">
        💡 <strong>Tip:</strong> Most sites process removal requests within 30-45 days. Keep this email for reference.
      </p>
    </div>
  ` : '';

  const html = baseTemplate(`
    <h1 style="color: #10b981; margin-top: 0;">🚀 Bulk Removal Requests Submitted</h1>
    <p style="font-size: 16px; line-height: 1.6;">
      Hi ${name || "there"},
    </p>
    <p style="font-size: 16px; line-height: 1.6;">
      Your bulk data removal request has been processed. Here's a summary:
    </p>
    <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Total Exposures</td>
          <td style="padding: 12px 0; color: #e2e8f0; text-align: right; font-weight: 600; border-bottom: 1px solid #334155;">${summary.totalProcessed}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Auto-Submitted (CCPA Emails)</td>
          <td style="padding: 12px 0; color: #10b981; text-align: right; font-weight: 600; border-bottom: 1px solid #334155;">${summary.successCount}</td>
        </tr>
        ${summary.emailsSent !== undefined ? `
        <tr>
          <td style="padding: 12px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Emails Sent to Brokers</td>
          <td style="padding: 12px 0; color: #3b82f6; text-align: right; font-weight: 600; border-bottom: 1px solid #334155;">${summary.emailsSent}</td>
        </tr>
        ` : ''}
        ${hasManualRemovals ? `
        <tr>
          <td style="padding: 12px 0; color: #94a3b8;">Requires Manual Action</td>
          <td style="padding: 12px 0; color: #f97316; text-align: right; font-weight: 600;">${manualRemovals.length}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    ${summary.sources.length > 0 ? `
    <p style="font-size: 16px; line-height: 1.6;"><strong>✅ Auto-submitted to:</strong></p>
    <div style="background-color: #0f172a; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <ul style="margin: 0; padding-left: 20px; color: #e2e8f0; line-height: 1.8;">
        ${summary.sources.slice(0, 20).map(s => `<li>${s}</li>`).join('')}
        ${summary.sources.length > 20 ? `<li>...and ${summary.sources.length - 20} more</li>` : ''}
      </ul>
    </div>
    <p style="font-size: 16px; line-height: 1.6;">
      These brokers have received CCPA/GDPR removal requests and must respond within 30-45 days.
    </p>
    ` : ''}
    ${manualRemovalSection}
    ${buttonHtml("View All Removals", `${APP_URL}/dashboard/removals`)}
  `);

  const subjectParts = [];
  if (summary.successCount > 0) subjectParts.push(`${summary.successCount} auto-submitted`);
  if (hasManualRemovals) subjectParts.push(`${manualRemovals.length} manual`);

  return sendEmail(
    email,
    `🚀 Bulk Removal: ${subjectParts.join(', ') || 'Processed'}`,
    html
  );
}

// ==========================================
// Admin Service Alert Emails
// ==========================================

interface ServiceAlertData {
  serviceName: string;
  percentUsed: number;
  used: number;
  limit: number;
  status: "warning" | "critical";
  recommendation?: string;
}

// Track which alerts have been sent today to avoid spam
const alertsSentToday: Record<string, string> = {}; // service -> date

function shouldSendAlert(serviceName: string): boolean {
  const today = new Date().toDateString();
  if (alertsSentToday[serviceName] === today) {
    return false; // Already sent today
  }
  alertsSentToday[serviceName] = today;
  return true;
}

export async function sendServiceAlertEmail(
  adminEmail: string,
  alerts: ServiceAlertData[]
) {
  // Filter to only critical alerts we haven't sent today
  const newCriticalAlerts = alerts.filter(
    (a) => a.status === "critical" && shouldSendAlert(a.serviceName)
  );

  if (newCriticalAlerts.length === 0) {
    return { success: true, skipped: true, message: "No new alerts to send" };
  }

  const alertRows = newCriticalAlerts
    .map(
      (alert) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #334155; color: #e2e8f0;">
          <strong>${alert.serviceName}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #334155; text-align: center;">
          <span style="color: ${alert.status === "critical" ? "#ef4444" : "#f59e0b"}; font-weight: bold;">
            ${alert.percentUsed}%
          </span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #334155; color: #94a3b8;">
          ${alert.used.toLocaleString()} / ${alert.limit.toLocaleString()}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #334155; color: #f59e0b;">
          ${alert.recommendation || "Consider upgrading"}
        </td>
      </tr>
    `
    )
    .join("");

  const html = baseTemplate(`
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; padding: 12px; background-color: #ef4444; border-radius: 50%;">
        <span style="font-size: 32px;">⚠️</span>
      </div>
    </div>
    <h1 style="color: #ef4444; font-size: 24px; margin-bottom: 16px; text-align: center;">
      Service Usage Alert
    </h1>
    <p style="font-size: 16px; color: #94a3b8; margin-bottom: 24px; text-align: center;">
      ${newCriticalAlerts.length} service${newCriticalAlerts.length > 1 ? "s have" : " has"} reached 80%+ usage
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
      <thead>
        <tr style="background-color: #334155;">
          <th style="padding: 12px; text-align: left; color: #e2e8f0;">Service</th>
          <th style="padding: 12px; text-align: center; color: #e2e8f0;">Usage</th>
          <th style="padding: 12px; text-align: left; color: #e2e8f0;">Count</th>
          <th style="padding: 12px; text-align: left; color: #e2e8f0;">Action</th>
        </tr>
      </thead>
      <tbody>
        ${alertRows}
      </tbody>
    </table>
    <p style="font-size: 14px; color: #64748b; margin-top: 24px;">
      These services are approaching their limits. Consider upgrading to avoid service interruptions.
    </p>
    ${buttonHtml("View Integrations Dashboard", `${APP_URL}/admin/dashboard/integrations`)}
  `);

  return sendEmail(
    adminEmail,
    `⚠️ Service Alert: ${newCriticalAlerts.length} service${newCriticalAlerts.length > 1 ? "s" : ""} at ${Math.max(...newCriticalAlerts.map((a) => a.percentUsed))}% usage`,
    html,
    { skipQuotaCheck: true } // Admin alerts should always go through
  );
}

// ==========================================
// Consolidated Removal Status Digest Email
// ==========================================

interface RemovalStatusUpdate {
  sourceName: string;
  source: string;
  dataType: string;
  status: "SUBMITTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  updatedAt?: Date;
}

interface RemovalDigestData {
  completed: RemovalStatusUpdate[];
  inProgress: RemovalStatusUpdate[];
  submitted: RemovalStatusUpdate[];
  failed: RemovalStatusUpdate[];
}

export async function sendRemovalStatusDigestEmail(
  email: string,
  name: string,
  digest: RemovalDigestData
) {
  const totalUpdates =
    digest.completed.length +
    digest.inProgress.length +
    digest.submitted.length +
    digest.failed.length;

  if (totalUpdates === 0) {
    return { success: true, skipped: true, message: "No updates to send" };
  }

  // Build sections for each status type
  const buildStatusSection = (
    title: string,
    icon: string,
    color: string,
    items: RemovalStatusUpdate[]
  ) => {
    if (items.length === 0) return "";

    const itemsList = items
      .slice(0, 20) // Limit to 20 items per section
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #334155; color: #e2e8f0;">
            ${item.sourceName}
          </td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #334155; color: #94a3b8; text-align: right;">
            ${item.dataType}
          </td>
        </tr>
      `
      )
      .join("");

    const moreText =
      items.length > 20 ? `<p style="color: #64748b; font-size: 12px;">...and ${items.length - 20} more</p>` : "";

    return `
      <div style="margin: 24px 0;">
        <h3 style="color: ${color}; margin-bottom: 12px; font-size: 16px;">
          ${icon} ${title} (${items.length})
        </h3>
        <table style="width: 100%; border-collapse: collapse; background-color: #0f172a; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #1e293b;">
              <th style="padding: 10px 12px; text-align: left; color: #94a3b8; font-weight: 500;">Source</th>
              <th style="padding: 10px 12px; text-align: right; color: #94a3b8; font-weight: 500;">Data Type</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>
        ${moreText}
      </div>
    `;
  };

  const completedSection = buildStatusSection(
    "Successfully Removed",
    "✅",
    "#10b981",
    digest.completed
  );
  const inProgressSection = buildStatusSection(
    "In Progress",
    "⏳",
    "#f97316",
    digest.inProgress
  );
  const submittedSection = buildStatusSection(
    "Submitted",
    "📤",
    "#3b82f6",
    digest.submitted
  );
  const failedSection = buildStatusSection(
    "Requires Attention",
    "⚠️",
    "#ef4444",
    digest.failed
  );

  // Summary stats
  const summaryHtml = `
    <div style="display: flex; justify-content: space-around; margin: 24px 0; text-align: center;">
      ${digest.completed.length > 0 ? `
        <div style="padding: 16px;">
          <div style="font-size: 32px; font-weight: bold; color: #10b981;">${digest.completed.length}</div>
          <div style="font-size: 12px; color: #94a3b8;">Removed</div>
        </div>
      ` : ""}
      ${digest.inProgress.length > 0 ? `
        <div style="padding: 16px;">
          <div style="font-size: 32px; font-weight: bold; color: #f97316;">${digest.inProgress.length}</div>
          <div style="font-size: 12px; color: #94a3b8;">In Progress</div>
        </div>
      ` : ""}
      ${digest.submitted.length > 0 ? `
        <div style="padding: 16px;">
          <div style="font-size: 32px; font-weight: bold; color: #3b82f6;">${digest.submitted.length}</div>
          <div style="font-size: 12px; color: #94a3b8;">Submitted</div>
        </div>
      ` : ""}
      ${digest.failed.length > 0 ? `
        <div style="padding: 16px;">
          <div style="font-size: 32px; font-weight: bold; color: #ef4444;">${digest.failed.length}</div>
          <div style="font-size: 12px; color: #94a3b8;">Need Action</div>
        </div>
      ` : ""}
    </div>
  `;

  const html = baseTemplate(`
    <h1 style="color: #10b981; margin-top: 0; text-align: center;">
      📊 Removal Status Update
    </h1>
    <p style="font-size: 16px; line-height: 1.6; text-align: center; color: #94a3b8;">
      Hi ${name || "there"}, here's a summary of your data removal progress.
    </p>
    ${summaryHtml}
    ${completedSection}
    ${inProgressSection}
    ${submittedSection}
    ${failedSection}
    ${buttonHtml("View All Removals", `${APP_URL}/dashboard/removals`)}
    <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 24px;">
      Data brokers typically process removal requests within 30-45 days.
    </p>
  `);

  // Generate subject line based on most significant update
  let subject = "📊 Removal Status Update";
  if (digest.completed.length > 0) {
    subject = `✅ ${digest.completed.length} removal${digest.completed.length > 1 ? "s" : ""} completed`;
    if (digest.inProgress.length > 0 || digest.submitted.length > 0) {
      subject += `, ${digest.inProgress.length + digest.submitted.length} in progress`;
    }
  } else if (digest.failed.length > 0) {
    subject = `⚠️ ${digest.failed.length} removal${digest.failed.length > 1 ? "s" : ""} need attention`;
  } else if (digest.inProgress.length > 0) {
    subject = `⏳ ${digest.inProgress.length} removal${digest.inProgress.length > 1 ? "s" : ""} in progress`;
  }

  return sendEmail(email, subject, html);
}

// ==========================================
// Free User Exposure Digest (with Upgrade CTA)
// ==========================================

interface FreeUserExposureDigestData {
  totalExposures: number;
  criticalExposures: number;
  highExposures: number;
  mediumExposures: number;
  topSources: string[];
  dataTypesExposed: string[];
  estimatedTimeToRemove: number; // in hours
  lastScanDate: Date | null;
}

export async function sendFreeUserExposureDigest(
  email: string,
  name: string,
  data: FreeUserExposureDigestData
) {
  const urgencyColor = data.criticalExposures > 0
    ? "#ef4444"
    : data.highExposures > 0
    ? "#f97316"
    : "#eab308";

  const urgencyText = data.criticalExposures > 0
    ? `${data.criticalExposures} critical`
    : data.highExposures > 0
    ? `${data.highExposures} high-risk`
    : `${data.mediumExposures} medium-risk`;

  const lastScanText = data.lastScanDate
    ? data.lastScanDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Unknown";

  const html = baseTemplate(`
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-size: 48px;">🔍</span>
    </div>
    <h1 style="color: ${urgencyColor}; margin-top: 0; text-align: center;">
      Your Personal Data is Exposed
    </h1>
    <p style="font-size: 16px; line-height: 1.6; text-align: center; color: #94a3b8;">
      Hi ${name || "there"}, we found your information on <strong style="color: #e2e8f0;">${data.totalExposures} data broker sites</strong>.
    </p>

    <!-- Exposure Stats -->
    <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #334155;">
      <div style="display: flex; justify-content: space-around; text-align: center; flex-wrap: wrap;">
        <div style="padding: 12px; min-width: 80px;">
          <div style="font-size: 36px; font-weight: bold; color: ${urgencyColor};">${data.totalExposures}</div>
          <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase;">Total Exposures</div>
        </div>
        <div style="padding: 12px; min-width: 80px;">
          <div style="font-size: 36px; font-weight: bold; color: #ef4444;">${data.criticalExposures}</div>
          <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase;">Critical</div>
        </div>
        <div style="padding: 12px; min-width: 80px;">
          <div style="font-size: 36px; font-weight: bold; color: #f97316;">${data.highExposures}</div>
          <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase;">High Risk</div>
        </div>
      </div>
    </div>

    <!-- What's Exposed -->
    <div style="margin: 24px 0;">
      <h3 style="color: #e2e8f0; margin-bottom: 12px;">What's being shared about you:</h3>
      <div style="background-color: #0f172a; border-radius: 8px; padding: 16px;">
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${data.dataTypesExposed.slice(0, 8).map(dt => `
            <span style="background-color: #334155; color: #e2e8f0; padding: 6px 12px; border-radius: 16px; font-size: 13px;">
              ${dt}
            </span>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Top Sources -->
    <div style="margin: 24px 0;">
      <h3 style="color: #e2e8f0; margin-bottom: 12px;">Found on these sites:</h3>
      <div style="background-color: #0f172a; border-radius: 8px; padding: 16px;">
        <ul style="margin: 0; padding-left: 20px; color: #94a3b8; line-height: 1.8;">
          ${data.topSources.slice(0, 6).map(source => `<li>${source}</li>`).join('')}
          ${data.topSources.length > 6 ? `<li style="color: #64748b;">...and ${data.topSources.length - 6} more sites</li>` : ''}
        </ul>
      </div>
    </div>

    <!-- The Risk -->
    <div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h3 style="color: #ef4444; margin: 0 0 12px 0;">Why this matters:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #e2e8f0; line-height: 1.8; font-size: 14px;">
        <li>Scammers and telemarketers buy this data</li>
        <li>Identity thieves use it to impersonate you</li>
        <li>Data brokers sell your info to anyone who pays</li>
        <li>Your exposed data never goes away on its own</li>
      </ul>
    </div>

    <!-- Time to Remove Manually -->
    <div style="background-color: #1e293b; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
      <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 14px;">Removing this manually would take approximately:</p>
      <p style="margin: 0; color: #f97316; font-size: 32px; font-weight: bold;">${data.estimatedTimeToRemove}+ hours</p>
      <p style="margin: 8px 0 0 0; color: #64748b; font-size: 12px;">of tedious opt-out forms and follow-up emails</p>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin: 32px 0;">
      <p style="color: #10b981; font-size: 18px; font-weight: 600; margin-bottom: 16px;">
        Let us handle it for you.
      </p>
      <a href="${APP_URL}/pricing" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
        Upgrade to PRO - $11.99/mo
      </a>
      <p style="margin-top: 12px; color: #64748b; font-size: 12px;">
        Automated removals • Weekly monitoring • Priority support
      </p>
    </div>

    <!-- Free Options -->
    <div style="border-top: 1px solid #334155; padding-top: 24px; margin-top: 24px;">
      <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-bottom: 16px;">
        Not ready to upgrade? You can still:
      </p>
      <div style="text-align: center;">
        <a href="${APP_URL}/dashboard/exposures" style="color: #10b981; text-decoration: none; font-size: 14px;">
          View your exposures →
        </a>
        <span style="color: #334155; margin: 0 12px;">|</span>
        <a href="${APP_URL}/dashboard/scan" style="color: #10b981; text-decoration: none; font-size: 14px;">
          Run another scan →
        </a>
      </div>
    </div>

    <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 24px;">
      Last scan: ${lastScanText}
    </p>
  `);

  return sendEmail(
    email,
    `⚠️ Alert: ${data.totalExposures} Data Exposures Found (${urgencyText})`,
    html,
    {
      emailType: "FREE_USER_DIGEST",
      queueIfExceeded: true,
      priority: 3, // Medium-high priority
    }
  );
}

// ==========================================
// SUPPORT TICKET EMAIL TEMPLATES
// ==========================================

interface TicketEmailData {
  ticketNumber: string;
  subject: string;
  type?: string;
  description?: string;
  resolution?: string;
}

/**
 * Send email when user submits a support ticket
 */
export async function sendTicketCreatedEmail(
  email: string,
  name: string,
  ticket: TicketEmailData
) {
  const html = baseTemplate(`
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-size: 48px;">🎫</span>
    </div>
    <h1 style="color: #10b981; margin-top: 0; text-align: center;">
      Support Ticket Created
    </h1>
    <p style="font-size: 16px; line-height: 1.6;">
      Hi ${name || "there"},
    </p>
    <p style="font-size: 16px; line-height: 1.6;">
      We've received your support request and created ticket <strong style="color: #10b981;">${ticket.ticketNumber}</strong>.
    </p>

    <div style="background-color: #0f172a; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #334155;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Ticket Number:</td>
          <td style="padding: 12px 0; color: #10b981; text-align: right; font-weight: 600; border-bottom: 1px solid #334155;">${ticket.ticketNumber}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Subject:</td>
          <td style="padding: 12px 0; color: #e2e8f0; text-align: right; border-bottom: 1px solid #334155;">${ticket.subject}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #94a3b8;">Type:</td>
          <td style="padding: 12px 0; color: #e2e8f0; text-align: right;">${(ticket.type || "OTHER").replace(/_/g, " ")}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 16px; line-height: 1.6;">
      Our support team will review your request and respond as soon as possible.
      You can view and track your ticket status in your dashboard.
    </p>

    ${buttonHtml("View Ticket Status", `${APP_URL}/dashboard/support`)}

    <p style="font-size: 14px; color: #94a3b8; text-align: center;">
      Typical response time: 24-48 hours for non-urgent issues.
    </p>
  `);

  return sendEmail(
    email,
    `🎫 Ticket Created: ${ticket.ticketNumber}`,
    html,
    {
      emailType: "TICKET_CREATED",
      queueIfExceeded: true,
      priority: 4,
    }
  );
}

/**
 * Send email when a support ticket is resolved
 */
export async function sendTicketResolvedEmail(
  email: string,
  name: string,
  ticket: TicketEmailData
) {
  const html = baseTemplate(`
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-size: 48px;">✅</span>
    </div>
    <h1 style="color: #10b981; margin-top: 0; text-align: center;">
      Your Support Ticket Has Been Resolved
    </h1>
    <p style="font-size: 16px; line-height: 1.6;">
      Hi ${name || "there"},
    </p>
    <p style="font-size: 16px; line-height: 1.6;">
      Great news! Your support ticket <strong style="color: #10b981;">${ticket.ticketNumber}</strong> has been resolved.
    </p>

    <div style="background-color: #0f172a; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #334155;">
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #10b981;">Subject:</p>
      <p style="margin: 0 0 20px 0; color: #e2e8f0;">${ticket.subject}</p>
      <p style="margin: 0 0 12px 0; font-weight: 600; color: #10b981;">Resolution:</p>
      <p style="margin: 0; color: #e2e8f0; white-space: pre-wrap;">${ticket.resolution || "Issue has been resolved."}</p>
    </div>

    <div style="background-color: #1e293b; border-radius: 8px; padding: 16px; margin: 24px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-size: 14px; color: #fbbf24;">
        ⏰ <strong>Note:</strong> This ticket will automatically close in 24 hours. If you need further assistance, please reply before then.
      </p>
    </div>

    <p style="font-size: 16px; line-height: 1.6;">
      If this doesn't fully address your issue, you can reply to this ticket or create a new support request.
    </p>

    ${buttonHtml("View Ticket", `${APP_URL}/dashboard/support`)}

    <p style="font-size: 14px; color: #94a3b8; text-align: center;">
      Thank you for using ${APP_NAME}!
    </p>
  `);

  return sendEmail(
    email,
    `✅ Ticket Resolved: ${ticket.ticketNumber}`,
    html,
    {
      emailType: "TICKET_RESOLVED",
      queueIfExceeded: true,
      priority: 4,
    }
  );
}

/**
 * Send email when a system-generated ticket is created (auto-detected issue)
 */
export async function sendSystemTicketNotification(
  email: string,
  name: string,
  ticket: TicketEmailData
) {
  const typeMessages: Record<string, string> = {
    SCAN_ERROR: "We encountered an issue during your recent scan",
    REMOVAL_FAILED: "A data removal request needs attention",
    PAYMENT_ISSUE: "There's an issue with your payment",
  };

  const message = typeMessages[ticket.type || "OTHER"] || "We noticed an issue with your account";

  const html = baseTemplate(`
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-size: 48px;">⚠️</span>
    </div>
    <h1 style="color: #f97316; margin-top: 0; text-align: center;">
      We're Looking Into an Issue
    </h1>
    <p style="font-size: 16px; line-height: 1.6;">
      Hi ${name || "there"},
    </p>
    <p style="font-size: 16px; line-height: 1.6;">
      ${message}. We've automatically created support ticket <strong style="color: #f97316;">${ticket.ticketNumber}</strong> to track this.
    </p>

    <div style="background-color: #0f172a; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #f97316;">
      <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 14px;">Issue Type:</p>
      <p style="margin: 0 0 16px 0; color: #f97316; font-weight: 600;">${(ticket.type || "OTHER").replace(/_/g, " ")}</p>
      <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 14px;">Details:</p>
      <p style="margin: 0; color: #e2e8f0;">${ticket.description || "Our team is investigating this issue."}</p>
    </div>

    <p style="font-size: 16px; line-height: 1.6;">
      Our team is already working on this. You don't need to take any action unless you want to provide additional information.
    </p>

    ${buttonHtml("View Ticket", `${APP_URL}/dashboard/support`)}

    <p style="font-size: 14px; color: #94a3b8; text-align: center;">
      We'll notify you when this issue is resolved.
    </p>
  `);

  return sendEmail(
    email,
    `⚠️ Issue Detected: ${ticket.ticketNumber}`,
    html,
    {
      emailType: "SYSTEM_TICKET",
      queueIfExceeded: true,
      priority: 2, // Higher priority for system issues
    }
  );
}

/**
 * Send email when ticket status changes
 */
export async function sendTicketStatusUpdateEmail(
  email: string,
  name: string,
  ticket: TicketEmailData & { status: string; comment?: string }
) {
  const statusText: Record<string, string> = {
    IN_PROGRESS: "is now being worked on",
    WAITING_USER: "needs your response",
    RESOLVED: "has been resolved",
  };

  const statusMessage = statusText[ticket.status] || "has been updated";

  const html = baseTemplate(`
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-size: 48px;">📋</span>
    </div>
    <h1 style="color: #3b82f6; margin-top: 0; text-align: center;">
      Ticket Update: ${ticket.ticketNumber}
    </h1>
    <p style="font-size: 16px; line-height: 1.6;">
      Hi ${name || "there"},
    </p>
    <p style="font-size: 16px; line-height: 1.6;">
      Your support ticket <strong style="color: #3b82f6;">${ticket.ticketNumber}</strong> ${statusMessage}.
    </p>

    <div style="background-color: #0f172a; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #334155;">
      <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 14px;">Subject:</p>
      <p style="margin: 0 0 16px 0; color: #e2e8f0; font-weight: 600;">${ticket.subject}</p>
      <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 14px;">New Status:</p>
      <p style="margin: 0; color: #3b82f6; font-weight: 600;">${ticket.status.replace(/_/g, " ")}</p>
    </div>

    ${ticket.comment ? `
      <div style="background-color: #1e293b; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0 0 8px 0; color: #10b981; font-weight: 600;">Support Response:</p>
        <p style="margin: 0; color: #e2e8f0; white-space: pre-wrap;">${ticket.comment}</p>
      </div>
    ` : ""}

    ${buttonHtml("View Ticket", `${APP_URL}/dashboard/support`)}
  `);

  return sendEmail(
    email,
    `📋 Update: ${ticket.ticketNumber} - ${ticket.status.replace(/_/g, " ")}`,
    html,
    {
      emailType: "TICKET_UPDATE",
      queueIfExceeded: true,
      priority: 4,
    }
  );
}
