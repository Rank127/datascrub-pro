/**
 * Email Suppression Service
 *
 * Tracks bounced/complained email addresses and prevents re-sending.
 * Fed by Resend webhooks (real-time) and email-monitor cron (batch).
 *
 * Suppression rules:
 * - 1 permanent bounce → immediate suppress
 * - 1 complaint → immediate suppress
 * - 3+ transient bounces → suppress (broker greylisting / bad address)
 * - Manual suppress via admin
 */

import { prisma } from "@/lib/db";
import { DATA_BROKER_DIRECTORY } from "@/lib/removers/data-broker-directory";

// Thresholds
const TRANSIENT_BOUNCE_SUPPRESS_THRESHOLD = 3;

export type BounceType = "transient" | "permanent" | "undetermined";
export type SuppressionCategory = "ccpa_broker" | "platform" | "drip" | "admin";
export type SuppressionReason =
  | "hard_bounce"
  | "soft_bounce_repeated"
  | "complaint"
  | "manual";

/**
 * Check if an email address is suppressed (should not be sent to)
 */
export async function isEmailSuppressed(email: string): Promise<boolean> {
  try {
    const record = await prisma.emailSuppression.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { suppressed: true },
    });
    return record?.suppressed ?? false;
  } catch {
    // Fail open — don't block sends if DB is down
    return false;
  }
}

/**
 * Record a bounce event. Auto-suppresses based on thresholds.
 * Returns true if the email was newly suppressed.
 */
export async function recordBounce(params: {
  email: string;
  bounceType: BounceType;
  category?: SuppressionCategory;
  brokerKey?: string;
  resendEmailId?: string;
}): Promise<{ suppressed: boolean; bounceCount: number }> {
  const normalizedEmail = params.email.toLowerCase().trim();
  const now = new Date();

  try {
    // Upsert the bounce record
    const existing = await prisma.emailSuppression.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      const newCount = existing.bounceCount + 1;
      const shouldSuppress =
        existing.suppressed ||
        params.bounceType === "permanent" ||
        (params.bounceType === "transient" &&
          newCount >= TRANSIENT_BOUNCE_SUPPRESS_THRESHOLD);

      const updated = await prisma.emailSuppression.update({
        where: { email: normalizedEmail },
        data: {
          bounceCount: newCount,
          lastBounceType: params.bounceType,
          lastBouncedAt: now,
          lastResendId: params.resendEmailId || existing.lastResendId,
          category: params.category || existing.category,
          brokerKey: params.brokerKey || existing.brokerKey,
          suppressed: shouldSuppress,
          suppressedAt: shouldSuppress && !existing.suppressed ? now : existing.suppressedAt,
          reason: shouldSuppress
            ? params.bounceType === "permanent"
              ? "hard_bounce"
              : "soft_bounce_repeated"
            : existing.reason,
        },
      });

      if (shouldSuppress && !existing.suppressed) {
        console.log(
          `[Suppression] Suppressed ${normalizedEmail} after ${newCount} bounces (${params.bounceType})`
        );
      }

      return { suppressed: updated.suppressed, bounceCount: newCount };
    }

    // New record
    const shouldSuppress = params.bounceType === "permanent";

    const created = await prisma.emailSuppression.create({
      data: {
        email: normalizedEmail,
        reason: shouldSuppress ? "hard_bounce" : "soft_bounce_repeated",
        bounceCount: 1,
        lastBounceType: params.bounceType,
        category: params.category,
        brokerKey: params.brokerKey,
        suppressed: shouldSuppress,
        suppressedAt: shouldSuppress ? now : null,
        firstBouncedAt: now,
        lastBouncedAt: now,
        lastResendId: params.resendEmailId,
      },
    });

    if (shouldSuppress) {
      console.log(
        `[Suppression] Immediately suppressed ${normalizedEmail} (permanent bounce)`
      );
    }

    return { suppressed: created.suppressed, bounceCount: 1 };
  } catch (error) {
    console.error("[Suppression] Failed to record bounce:", error);
    return { suppressed: false, bounceCount: 0 };
  }
}

/**
 * Record a complaint (spam report). Always suppresses immediately.
 */
export async function recordComplaint(params: {
  email: string;
  category?: SuppressionCategory;
  resendEmailId?: string;
}): Promise<void> {
  const normalizedEmail = params.email.toLowerCase().trim();
  const now = new Date();

  try {
    await prisma.emailSuppression.upsert({
      where: { email: normalizedEmail },
      create: {
        email: normalizedEmail,
        reason: "complaint",
        bounceCount: 0,
        category: params.category,
        suppressed: true,
        suppressedAt: now,
      },
      update: {
        reason: "complaint",
        suppressed: true,
        suppressedAt: now,
        lastResendId: params.resendEmailId,
      },
    });

    console.log(`[Suppression] Suppressed ${normalizedEmail} (complaint)`);
  } catch (error) {
    console.error("[Suppression] Failed to record complaint:", error);
  }
}

/**
 * Manually suppress an email address
 */
export async function suppressEmail(
  email: string,
  reason: string = "manual"
): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const now = new Date();

  try {
    await prisma.emailSuppression.upsert({
      where: { email: normalizedEmail },
      create: {
        email: normalizedEmail,
        reason,
        bounceCount: 0,
        suppressed: true,
        suppressedAt: now,
      },
      update: {
        reason,
        suppressed: true,
        suppressedAt: now,
      },
    });
  } catch (error) {
    console.error("[Suppression] Failed to suppress email:", error);
  }
}

/**
 * Get suppression stats for monitoring/dashboard
 */
export async function getSuppressionStats(): Promise<{
  totalTracked: number;
  totalSuppressed: number;
  byCategory: Record<string, { tracked: number; suppressed: number }>;
  byBounceType: Record<string, number>;
}> {
  try {
    const [totalTracked, totalSuppressed, allRecords] = await Promise.all([
      prisma.emailSuppression.count(),
      prisma.emailSuppression.count({ where: { suppressed: true } }),
      prisma.emailSuppression.findMany({
        select: {
          category: true,
          suppressed: true,
          lastBounceType: true,
        },
      }),
    ]);

    const byCategory: Record<string, { tracked: number; suppressed: number }> = {};
    const byBounceType: Record<string, number> = {};

    for (const record of allRecords) {
      const cat = record.category || "unknown";
      if (!byCategory[cat]) byCategory[cat] = { tracked: 0, suppressed: 0 };
      byCategory[cat].tracked++;
      if (record.suppressed) byCategory[cat].suppressed++;

      const bt = record.lastBounceType || "unknown";
      byBounceType[bt] = (byBounceType[bt] || 0) + 1;
    }

    return { totalTracked, totalSuppressed, byCategory, byBounceType };
  } catch (error) {
    console.error("[Suppression] Failed to get stats:", error);
    return {
      totalTracked: 0,
      totalSuppressed: 0,
      byCategory: {},
      byBounceType: {},
    };
  }
}

/**
 * Look up broker key from a recipient email address
 */
export function lookupBrokerByEmail(recipientEmail: string): string | null {
  const domain = recipientEmail.split("@")[1]?.toLowerCase();
  if (!domain) return null;

  for (const [key, broker] of Object.entries(DATA_BROKER_DIRECTORY)) {
    if (broker.privacyEmail?.toLowerCase().includes(domain)) {
      return key;
    }
    // Check domain match
    const brokerDomain = key.toLowerCase().replace(/_/g, "");
    if (domain.includes(brokerDomain)) {
      return key;
    }
  }

  return null;
}

/**
 * Categorize an email address based on recipient
 */
export function categorizeEmail(toEmail: string): SuppressionCategory {
  // Check if it's a broker privacy email
  const brokerKey = lookupBrokerByEmail(toEmail);
  if (brokerKey) return "ccpa_broker";

  // Admin emails
  const adminEmails = ["rocky@ghostmydata.com", "support@ghostmydata.com"];
  if (adminEmails.includes(toEmail.toLowerCase())) return "admin";

  // Default to platform
  return "platform";
}
