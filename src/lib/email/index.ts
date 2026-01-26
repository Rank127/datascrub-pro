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

// Bulk Removal Summary Email (sent to user after bulk removal)
interface BulkRemovalSummary {
  totalProcessed: number;
  successCount: number;
  failCount: number;
  sources: string[];
  consolidatedCount: number;
}

export async function sendBulkRemovalSummaryEmail(
  email: string,
  name: string,
  summary: BulkRemovalSummary
) {
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
          <td style="padding: 12px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Total Requests</td>
          <td style="padding: 12px 0; color: #e2e8f0; text-align: right; font-weight: 600; border-bottom: 1px solid #334155;">${summary.totalProcessed}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Successfully Submitted</td>
          <td style="padding: 12px 0; color: #10b981; text-align: right; font-weight: 600; border-bottom: 1px solid #334155;">${summary.successCount}</td>
        </tr>
        ${summary.consolidatedCount > 0 ? `
        <tr>
          <td style="padding: 12px 0; color: #94a3b8; border-bottom: 1px solid #334155;">Consolidated (Bonus)</td>
          <td style="padding: 12px 0; color: #3b82f6; text-align: right; font-weight: 600; border-bottom: 1px solid #334155;">+${summary.consolidatedCount}</td>
        </tr>
        ` : ''}
        ${summary.failCount > 0 ? `
        <tr>
          <td style="padding: 12px 0; color: #94a3b8;">Requires Manual Action</td>
          <td style="padding: 12px 0; color: #f97316; text-align: right; font-weight: 600;">${summary.failCount}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    <p style="font-size: 16px; line-height: 1.6;"><strong>Sources included:</strong></p>
    <div style="background-color: #0f172a; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <ul style="margin: 0; padding-left: 20px; color: #e2e8f0; line-height: 1.8;">
        ${summary.sources.slice(0, 10).map(s => `<li>${s}</li>`).join('')}
        ${summary.sources.length > 10 ? `<li>...and ${summary.sources.length - 10} more</li>` : ''}
      </ul>
    </div>
    <p style="font-size: 16px; line-height: 1.6;">
      Most data brokers are required to respond within 30-45 days. We'll monitor the status and notify you when removals are confirmed.
    </p>
    ${buttonHtml("View Removal Status", `${APP_URL}/dashboard/removals`)}
  `);

  return sendEmail(
    email,
    `🚀 ${summary.successCount} Removal Requests Submitted`,
    html
  );
}
