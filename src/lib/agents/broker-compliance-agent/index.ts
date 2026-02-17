/**
 * Broker Compliance Agent
 *
 * Daily monitoring of broker directory health:
 * - Validate opt-out URLs are reachable (rotating subset, ~100/day)
 * - Check email bounce rates for high-bounce broker domains
 * - Run classification audits (weekly, Tuesdays)
 * - Generate compliance reports
 */

import { prisma } from "@/lib/db";
import {
  getAllBrokerKeys,
  getDataBrokerInfo,
  isKnownDataBroker,
  getLegalClassification,
  BROKER_CATEGORIES,
  type LegalClassification,
} from "@/lib/removers/data-broker-directory";

// ============================================================================
// TYPES
// ============================================================================

export interface UrlCheckResult {
  brokerKey: string;
  brokerName: string;
  url: string;
  httpStatus: number | null;
  responseTimeMs: number;
  isHealthy: boolean;
  error?: string;
}

export interface BounceRateResult {
  domain: string;
  totalSent: number;
  bounced: number;
  bounceRate: number;
  isHighBounce: boolean;
}

export interface ClassificationAuditResult {
  brokerKey: string;
  brokerName: string;
  currentClassification: LegalClassification;
  isRemovable: boolean;
  hasOptOutUrl: boolean;
  hasPrivacyEmail: boolean;
  issues: string[];
}

export interface ComplianceReport {
  urlsChecked: number;
  urlsHealthy: number;
  urlsBroken: number;
  urlsRedirected: number;
  highBounceEmails: number;
  classificationsChecked: number;
  classificationIssues: number;
  issues: Array<{
    type: "BROKEN_URL" | "HIGH_BOUNCE" | "CLASSIFICATION_ISSUE" | "MISSING_OPTOUT";
    severity: "LOW" | "MEDIUM" | "HIGH";
    brokerKey: string;
    description: string;
  }>;
}

// ============================================================================
// URL VALIDATION
// ============================================================================

/**
 * Validate opt-out URLs for a subset of brokers.
 * Checks HTTP status codes and response times.
 *
 * @param brokerKeys - specific keys to check (defaults to rotating subset)
 * @param batchSize - how many to check per run (default 100)
 */
export async function validateOptOutUrls(
  brokerKeys?: string[],
  batchSize: number = 100
): Promise<UrlCheckResult[]> {
  const keys = brokerKeys || getRotatingSubset(batchSize);
  const results: UrlCheckResult[] = [];

  for (const key of keys) {
    const info = getDataBrokerInfo(key);
    if (!info?.optOutUrl) continue;

    const startMs = Date.now();
    let httpStatus: number | null = null;
    let isHealthy = false;
    let error: string | undefined;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      // Use GET with redirect follow — many broker sites block HEAD requests
      // or return 405/403. Follow redirects since opt-out pages often redirect.
      const response = await fetch(info.optOutUrl, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      clearTimeout(timeout);
      // Consume body to avoid memory leaks on open connections
      await response.text().catch(() => {});
      httpStatus = response.status;
      // 2xx-3xx = healthy, 403 = bot protection (indeterminate, not broken),
      // 405 = method not allowed (page exists), 429 = rate limited (page exists),
      // 404/410/5xx = genuinely broken
      isHealthy = (httpStatus >= 200 && httpStatus < 400) || httpStatus === 403 || httpStatus === 405 || httpStatus === 429;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const errName = err instanceof Error ? err.name : "";
      error = errMsg;
      // Network failures from Vercel serverless: fetch failed, aborted, ENOTFOUND,
      // ECONNREFUSED, ETIMEDOUT — mostly international sites unreachable from US-East.
      // Treat as indeterminate (healthy) rather than flagging as broken opt-out URLs.
      const isNetworkError =
        errMsg.includes("fetch failed") ||
        errMsg.includes("aborted") ||
        errMsg.includes("ENOTFOUND") ||
        errMsg.includes("ECONNREFUSED") ||
        errMsg.includes("ETIMEDOUT") ||
        errName === "AbortError" ||
        errName === "TypeError";
      isHealthy = isNetworkError;
    }

    const responseTimeMs = Date.now() - startMs;
    results.push({
      brokerKey: key,
      brokerName: info.name,
      url: info.optOutUrl,
      httpStatus,
      responseTimeMs,
      isHealthy,
      error,
    });

    // Update BrokerOptOutHealth record
    try {
      await prisma.brokerOptOutHealth.upsert({
        where: { brokerKey: key },
        update: {
          lastCheckAt: new Date(),
          lastHttpStatus: httpStatus,
          lastResponseTimeMs: responseTimeMs,
          isHealthy,
          lastError: error || null,
          consecutiveFailures: isHealthy ? 0 : { increment: 1 },
        },
        create: {
          brokerKey: key,
          brokerName: info.name,
          optOutUrl: info.optOutUrl,
          privacyEmail: info.privacyEmail || null,
          lastCheckAt: new Date(),
          lastHttpStatus: httpStatus,
          lastResponseTimeMs: responseTimeMs,
          isHealthy,
          lastError: error || null,
          consecutiveFailures: isHealthy ? 0 : 1,
        },
      });
    } catch {
      // Don't fail the whole run for one DB write error
      console.error(`[BrokerCompliance] Failed to upsert health record for ${key}`);
    }
  }

  return results;
}

/**
 * Get a rotating subset of broker keys so all brokers are checked
 * over approximately 16 days (total keys / 100 per day).
 */
function getRotatingSubset(batchSize: number): string[] {
  const allKeys = getAllBrokerKeys().filter((key) => {
    const info = getDataBrokerInfo(key);
    return info?.optOutUrl && isKnownDataBroker(key);
  });

  // Use day-of-year to rotate through the list
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const startIndex = (dayOfYear * batchSize) % allKeys.length;
  const subset = allKeys.slice(startIndex, startIndex + batchSize);

  // Wrap around if we're near the end
  if (subset.length < batchSize) {
    subset.push(...allKeys.slice(0, batchSize - subset.length));
  }

  return subset;
}

// ============================================================================
// BOUNCE RATE CHECKING
// ============================================================================

/**
 * Check EmailQueue for domains with high bounce rates.
 * Looks at the last 30 days of email activity.
 */
export async function checkBounceRates(): Promise<BounceRateResult[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Get all emails sent in last 30 days, grouped by domain
  const recentEmails = await prisma.emailQueue.findMany({
    where: {
      createdAt: { gte: thirtyDaysAgo },
      status: { in: ["SENT", "FAILED"] },
    },
    select: {
      toEmail: true,
      status: true,
      lastError: true,
    },
  });

  const domainStats = new Map<string, { sent: number; bounced: number }>();

  for (const email of recentEmails) {
    const domain = email.toEmail.split("@")[1]?.toLowerCase();
    if (!domain) continue;

    const stats = domainStats.get(domain) || { sent: 0, bounced: 0 };
    stats.sent++;
    if (email.status === "FAILED" && email.lastError?.toLowerCase().includes("bounce")) {
      stats.bounced++;
    }
    domainStats.set(domain, stats);
  }

  const results: BounceRateResult[] = [];
  for (const [domain, stats] of domainStats) {
    if (stats.sent < 3) continue; // Need minimum sample size
    const bounceRate = stats.bounced / stats.sent;
    results.push({
      domain,
      totalSent: stats.sent,
      bounced: stats.bounced,
      bounceRate,
      isHighBounce: bounceRate > 0.3, // 30% threshold
    });
  }

  return results.sort((a, b) => b.bounceRate - a.bounceRate);
}

// ============================================================================
// CLASSIFICATION AUDIT
// ============================================================================

/**
 * Run a full classification audit on all broker directory entries.
 * Checks that legal classifications are consistent and flags issues.
 */
export async function auditClassifications(): Promise<ClassificationAuditResult[]> {
  const allKeys = getAllBrokerKeys();
  const results: ClassificationAuditResult[] = [];

  for (const key of allKeys) {
    const info = getDataBrokerInfo(key);
    if (!info) continue;

    const classification = getLegalClassification(key);
    const removable = isKnownDataBroker(key);
    const issues: string[] = [];

    // Check 1: Removable but no removal path at all (safety net — should be rare after isKnownDataBroker fix)
    if (removable && !info.optOutUrl && !info.privacyEmail && !info.optOutEmail) {
      issues.push("Marked as removable but no opt-out URL or email — no removal path");
    }

    // Check 2: Has URL but not classified as removable
    if (!removable && info.optOutUrl && classification === "STATUTORY_DATA_BROKER") {
      issues.push("Has opt-out URL but not classified as removable — classification mismatch");
    }

    // Check 3: Method mismatch — FORM method needs a URL
    if (removable && info.removalMethod === "FORM" && !info.optOutUrl) {
      issues.push("Removal method is FORM but no opt-out URL defined");
    }

    if (issues.length > 0) {
      results.push({
        brokerKey: key,
        brokerName: info.name,
        currentClassification: classification,
        isRemovable: removable,
        hasOptOutUrl: !!info.optOutUrl,
        hasPrivacyEmail: !!info.privacyEmail,
        issues,
      });
    }
  }

  return results;
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

/**
 * Generate a comprehensive compliance report from URL checks,
 * bounce rates, and classification audits.
 */
export async function generateComplianceReport(
  urlResults: UrlCheckResult[],
  bounceResults: BounceRateResult[],
  classificationResults?: ClassificationAuditResult[]
): Promise<ComplianceReport> {
  const issues: ComplianceReport["issues"] = [];

  // URL issues
  const brokenUrls = urlResults.filter((r) => !r.isHealthy);
  const redirectedUrls = urlResults.filter(
    (r) => r.httpStatus && r.httpStatus >= 300 && r.httpStatus < 400
  );

  // Batch-load health records for all broken URLs to avoid N+1 queries
  const brokenKeys = brokenUrls.map((b) => b.brokerKey);
  const healthRecords = brokenKeys.length > 0
    ? await prisma.brokerOptOutHealth.findMany({
        where: { brokerKey: { in: brokenKeys } },
        select: { brokerKey: true, consecutiveFailures: true },
      })
    : [];
  const healthMap = new Map(healthRecords.map((h) => [h.brokerKey, h.consecutiveFailures]));

  for (const broken of brokenUrls) {
    // Check if this is a top broker (high removal volume)
    const removalCount = await prisma.removalRequest.count({
      where: {
        exposure: { source: broken.brokerKey },
        status: { in: ["PENDING", "SUBMITTED", "IN_PROGRESS", "COMPLETED"] },
      },
    });

    // Only HIGH if broken for 2+ consecutive checks AND has active removals
    const isRepeatFailure = (healthMap.get(broken.brokerKey) ?? 0) >= 2;

    issues.push({
      type: "BROKEN_URL",
      severity: (removalCount > 10 && isRepeatFailure) ? "HIGH" : removalCount > 0 ? "MEDIUM" : "LOW",
      brokerKey: broken.brokerKey,
      description: `Opt-out URL returned ${broken.httpStatus || "timeout"}: ${broken.url}${broken.error ? ` (${broken.error})` : ""}`,
    });
  }

  // Bounce rate issues
  const highBounce = bounceResults.filter((r) => r.isHighBounce);
  for (const bounce of highBounce) {
    issues.push({
      type: "HIGH_BOUNCE",
      severity: bounce.bounceRate > 0.5 ? "HIGH" : "MEDIUM",
      brokerKey: bounce.domain,
      description: `High bounce rate ${(bounce.bounceRate * 100).toFixed(1)}% for ${bounce.domain} (${bounce.bounced}/${bounce.totalSent} bounced)`,
    });
  }

  // Classification issues
  if (classificationResults) {
    for (const audit of classificationResults) {
      for (const issue of audit.issues) {
        issues.push({
          type: audit.hasOptOutUrl ? "CLASSIFICATION_ISSUE" : "MISSING_OPTOUT",
          severity: audit.isRemovable ? "HIGH" : "MEDIUM",
          brokerKey: audit.brokerKey,
          description: `${audit.brokerName}: ${issue}`,
        });
      }
    }
  }

  return {
    urlsChecked: urlResults.length,
    urlsHealthy: urlResults.filter((r) => r.isHealthy).length,
    urlsBroken: brokenUrls.length,
    urlsRedirected: redirectedUrls.length,
    highBounceEmails: highBounce.length,
    classificationsChecked: classificationResults?.length || 0,
    classificationIssues: classificationResults?.filter((r) => r.issues.length > 0).length || 0,
    issues,
  };
}
