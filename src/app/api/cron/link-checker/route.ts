import { NextResponse } from "next/server";
import { DATA_BROKER_DIRECTORY } from "@/lib/removers/data-broker-directory";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";
import { logCronExecution } from "@/lib/cron-logger";

export const maxDuration = 300;

interface LinkCheckResult {
  broker: string;
  url: string;
  status: number | "error";
  error?: string;
  working: boolean;
}

interface BrokenLinkReport {
  checked: number;
  working: number;
  broken: number;
  errors: number;
  brokenLinks: LinkCheckResult[];
}

const CONCURRENCY = 20; // Check 20 URLs in parallel

async function checkUrlBatch<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  concurrency: number
): Promise<void> {
  let i = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx]);
    }
  });
  await Promise.all(workers);
}

// Check a single URL with timeout
async function checkUrl(url: string, timeout: number = 5000): Promise<{ status: number | "error"; error?: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: "HEAD", // Use HEAD for faster checks
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
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

// Known URL corrections - auto-fix these when detected as broken
const URL_CORRECTIONS: Record<string, string> = {
  // These will be populated when we identify correct URLs
  "https://www.beenverified.com/opt-out/": "https://www.beenverified.com/app/optout/search",
  "https://www.peoplefinder.com/optout": "https://www.peoplefinder.com/manage",
  "https://privacy.openai.com/policies": "https://privacy.openai.com/policies?modal=take-control",
  "https://www.facebook.com/help/contact/540404257914453": "https://www.facebook.com/help/contact/367438723733209",
  "https://clearview.ai/privacy/requests": "https://clearview.ai/privacy-requests",
  "https://stability.ai/opt-out": "https://stability.ai/contact",
  "https://www.peekyou.com/about/contact/optout/": "https://www.peekyou.com/about/contact/optout",
};

export async function GET(request: Request) {
  const startTime = Date.now();

  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return cronUnauthorizedResponse(authResult.reason);
  }

  console.log("[LinkChecker] Starting daily link check...");

  const results: LinkCheckResult[] = [];
  const brokers = Object.entries(DATA_BROKER_DIRECTORY);

  // Filter to brokers with opt-out URLs
  const checkable = brokers.filter(([, b]) => b.optOutUrl);
  console.log(`[LinkChecker] Checking ${checkable.length} URLs (${CONCURRENCY} concurrent)...`);

  // Check all broker opt-out URLs in parallel batches
  await checkUrlBatch(checkable, async ([key, broker]) => {
    const checkResult = await checkUrl(broker.optOutUrl!);

    // Consider 2xx and 3xx as working, 403 might be bot protection (mark as working)
    const isWorking =
      (typeof checkResult.status === "number" && checkResult.status >= 200 && checkResult.status < 400) ||
      checkResult.status === 403; // 403 often means bot protection, not truly broken

    results.push({
      broker: key,
      url: broker.optOutUrl!,
      status: checkResult.status,
      error: checkResult.error,
      working: isWorking,
    });

    // Log broken links
    if (!isWorking) {
      console.log(`[LinkChecker] Broken: ${key} - ${broker.optOutUrl} (${checkResult.status})`);
    }
  }, CONCURRENCY);

  const report: BrokenLinkReport = {
    checked: results.length,
    working: results.filter(r => r.working).length,
    broken: results.filter(r => !r.working && r.status !== "error").length,
    errors: results.filter(r => r.status === "error").length,
    brokenLinks: results.filter(r => !r.working),
  };

  const duration = Date.now() - startTime;

  console.log(`[LinkChecker] Complete: ${report.checked} checked, ${report.working} working, ${report.broken} broken, ${report.errors} errors`);

  // Send alert email if there are broken links
  if (report.brokenLinks.length > 0) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

      if (adminEmails.length > 0 && process.env.RESEND_API_KEY) {
        const brokenList = report.brokenLinks
          .map(r => `- ${r.broker}: ${r.url} (${r.status}${r.error ? ` - ${r.error}` : ""})`)
          .join("\n");

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "noreply@ghostmydata.com",
          to: adminEmails,
          subject: `[GhostMyData] ${report.brokenLinks.length} Broken Opt-Out Links Detected`,
          text: `Daily Link Check Report\n\nChecked: ${report.checked}\nWorking: ${report.working}\nBroken: ${report.broken}\nErrors: ${report.errors}\n\nBroken Links:\n${brokenList}\n\nPlease update these URLs in data-broker-directory.ts`,
        });
        console.log("[LinkChecker] Alert email sent to admins");
      }
    } catch (emailError) {
      console.error("[LinkChecker] Failed to send alert email:", emailError);
    }
  }

  await logCronExecution({
    jobName: "link-checker",
    status: "SUCCESS",
    duration,
    message: `${report.checked} checked, ${report.working} working, ${report.broken} broken`,
  });

  return NextResponse.json({
    success: true,
    report,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
  });
}

// POST endpoint for manual trigger with options
export async function POST(request: Request) {
  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return cronUnauthorizedResponse(authResult.reason);
  }

  // Reuse GET logic
  return GET(request);
}
