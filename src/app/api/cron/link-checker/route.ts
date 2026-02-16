import { NextResponse } from "next/server";
import { DATA_BROKER_DIRECTORY } from "@/lib/removers/data-broker-directory";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";
import { logCronExecution } from "@/lib/cron-logger";
import {
  URL_PATTERN_VARIATIONS,
  getCorrectedUrl,
} from "@/lib/removals/url-corrections";

export const maxDuration = 300;

interface LinkCheckResult {
  broker: string;
  url: string;
  status: number | "error";
  error?: string;
  working: boolean;
  correctedUrl?: string;
  suggestedUrl?: string;
}

interface BrokenLinkReport {
  checked: number;
  working: number;
  broken: number;
  errors: number;
  corrected: number;
  suggested: number;
  brokenLinks: LinkCheckResult[];
  corrections: LinkCheckResult[];
  suggestions: LinkCheckResult[];
}

const CONCURRENCY = 20;

async function checkUrlBatch<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  concurrency: number
): Promise<void> {
  let i = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (i < items.length) {
        const idx = i++;
        await fn(items[idx]);
      }
    }
  );
  await Promise.all(workers);
}

async function checkUrl(
  url: string,
  timeout: number = 5000
): Promise<{ status: number | "error"; error?: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });
    clearTimeout(timeoutId);
    return { status: response.status };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return { status: "error", error: "Timeout" };
      }
      return { status: "error", error: error.message };
    }
    return { status: "error", error: "Unknown error" };
  }
}

function isUrlWorking(status: number | "error"): boolean {
  return (
    (typeof status === "number" && status >= 200 && status < 400) ||
    status === 403
  );
}

/**
 * Try common URL pattern variations for a broken link.
 * Returns the first working URL found, or null.
 */
async function trySuggestUrl(
  brokerUrl: string
): Promise<string | null> {
  try {
    const urlObj = new URL(brokerUrl);
    const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;

    for (const variation of URL_PATTERN_VARIATIONS) {
      const candidateUrl = baseUrl + variation;
      if (candidateUrl === brokerUrl) continue;

      const result = await checkUrl(candidateUrl, 3000);
      if (isUrlWorking(result.status)) {
        return candidateUrl;
      }
    }
  } catch {
    // Invalid URL — skip suggestions
  }
  return null;
}

export async function GET(request: Request) {
  const startTime = Date.now();

  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return cronUnauthorizedResponse(authResult.reason);
  }

  console.log("[LinkChecker] Starting daily link check...");

  const results: LinkCheckResult[] = [];
  const brokers = Object.entries(DATA_BROKER_DIRECTORY);
  const checkable = brokers.filter(([, b]) => b.optOutUrl);
  console.log(
    `[LinkChecker] Checking ${checkable.length} URLs (${CONCURRENCY} concurrent)...`
  );

  await checkUrlBatch(
    checkable,
    async ([key, broker]) => {
      const checkResult = await checkUrl(broker.optOutUrl!);
      const working = isUrlWorking(checkResult.status);

      const result: LinkCheckResult = {
        broker: key,
        url: broker.optOutUrl!,
        status: checkResult.status,
        error: checkResult.error,
        working,
      };

      // If broken, check for known corrections
      if (!working) {
        const corrected = getCorrectedUrl(broker.optOutUrl!);
        if (corrected) {
          // Verify the corrected URL actually works
          const correctedResult = await checkUrl(corrected, 3000);
          if (isUrlWorking(correctedResult.status)) {
            result.correctedUrl = corrected;
            console.log(
              `[LinkChecker] Correction available: ${key} → ${corrected}`
            );
          }
        }

        // If no known correction, try common pattern variations
        if (!result.correctedUrl) {
          const suggestion = await trySuggestUrl(broker.optOutUrl!);
          if (suggestion) {
            result.suggestedUrl = suggestion;
            console.log(
              `[LinkChecker] Suggestion found: ${key} → ${suggestion}`
            );
          }
        }

        console.log(
          `[LinkChecker] Broken: ${key} - ${broker.optOutUrl} (${checkResult.status})`
        );
      }

      results.push(result);
    },
    CONCURRENCY
  );

  const corrections = results.filter((r) => r.correctedUrl);
  const suggestions = results.filter(
    (r) => r.suggestedUrl && !r.correctedUrl
  );

  const report: BrokenLinkReport = {
    checked: results.length,
    working: results.filter((r) => r.working).length,
    broken: results.filter((r) => !r.working && r.status !== "error").length,
    errors: results.filter((r) => r.status === "error").length,
    corrected: corrections.length,
    suggested: suggestions.length,
    brokenLinks: results.filter((r) => !r.working),
    corrections,
    suggestions,
  };

  const duration = Date.now() - startTime;
  console.log(
    `[LinkChecker] Complete: ${report.checked} checked, ${report.working} working, ${report.broken} broken, ${report.errors} errors, ${report.corrected} corrections available, ${report.suggested} suggestions`
  );

  // Send alert email if there are broken links
  if (report.brokenLinks.length > 0) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

      if (adminEmails.length > 0 && process.env.RESEND_API_KEY) {
        const brokenList = report.brokenLinks
          .map((r) => {
            let line = `- ${r.broker}: ${r.url} (${r.status}${r.error ? ` - ${r.error}` : ""})`;
            if (r.correctedUrl) line += `\n  CORRECTION: ${r.correctedUrl}`;
            if (r.suggestedUrl) line += `\n  SUGGESTED: ${r.suggestedUrl}`;
            return line;
          })
          .join("\n");

        await resend.emails.send({
          from:
            process.env.RESEND_FROM_EMAIL || "noreply@ghostmydata.com",
          to: adminEmails,
          subject: `[GhostMyData] ${report.brokenLinks.length} Broken Opt-Out Links (${report.corrected} corrections, ${report.suggested} suggestions)`,
          text: `Daily Link Check Report\n\nChecked: ${report.checked}\nWorking: ${report.working}\nBroken: ${report.broken}\nErrors: ${report.errors}\nCorrections Available: ${report.corrected}\nSuggestions Found: ${report.suggested}\n\nBroken Links:\n${brokenList}\n\nCorrections are applied at runtime via url-corrections.ts.\nSuggestions should be verified manually before adding to the registry.`,
        });
        console.log("[LinkChecker] Alert email sent to admins");
      }
    } catch (emailError) {
      console.error(
        "[LinkChecker] Failed to send alert email:",
        emailError
      );
    }
  }

  await logCronExecution({
    jobName: "link-checker",
    status: "SUCCESS",
    duration,
    message: `${report.checked} checked, ${report.working} working, ${report.broken} broken, ${report.corrected} corrections, ${report.suggested} suggestions`,
    metadata: {
      checked: report.checked,
      working: report.working,
      broken: report.broken,
      errors: report.errors,
      corrected: report.corrected,
      suggested: report.suggested,
      brokenLinks: report.brokenLinks.map((l: { broker: string; url: string; status: number | string }) => ({
        broker: l.broker,
        url: l.url,
        status: l.status,
      })),
    },
  });

  return NextResponse.json({
    success: true,
    report,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return cronUnauthorizedResponse(authResult.reason);
  }
  return GET(request);
}
