import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const APP_NAME = (process.env.NEXT_PUBLIC_APP_NAME || "GhostMyData").replace(/[\r\n]/g, "").trim();
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

// Send email helper
async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn("Email service not configured - RESEND_API_KEY missing");
    return { success: false, error: "Email service not configured" };
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

    return { success: true };
  } catch (err) {
    console.error("Error sending email:", err);
    return { success: false, error: "Failed to send email" };
  }
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
