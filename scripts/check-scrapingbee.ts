/**
 * ScrapingBee Health Check Script
 *
 * Checks account status, credit usage, and tests a sample scrape.
 *
 * Usage:
 *   npx tsx scripts/check-scrapingbee.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const API_KEY = process.env.SCRAPINGBEE_API_KEY;
const MONTHLY_LIMIT = parseInt(process.env.SCRAPINGBEE_MONTHLY_LIMIT || "250000", 10);

async function checkUsage(): Promise<{ max_api_credit: number; used_api_credit: number } | null> {
  try {
    const response = await fetch(
      `https://app.scrapingbee.com/api/v1/usage?api_key=${API_KEY}`
    );

    if (!response.ok) {
      console.error(`  ❌ Usage API returned ${response.status}: ${response.statusText}`);
      const text = await response.text();
      if (text.includes("Page not found") || text.includes("<!DOCTYPE")) {
        console.error("  ⚠️  Got HTML instead of JSON — account may be expired or API endpoint changed");
      }
      return null;
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("  ❌ Failed to reach ScrapingBee API:", err instanceof Error ? err.message : err);
    return null;
  }
}

async function testScrape(): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      api_key: API_KEY!,
      url: "https://httpbin.org/get",
      render_js: "false",
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(
      `https://app.scrapingbee.com/api/v1/?${params.toString()}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (response.ok) {
      const body = await response.text();
      const spbStatus = response.headers.get("Spb-Status");
      console.log(`  ✅ Test scrape successful (SPB status: ${spbStatus}, body: ${body.length} bytes)`);
      return true;
    } else {
      const text = await response.text();
      console.error(`  ❌ Test scrape failed: ${response.status} ${response.statusText}`);
      if (text.length < 500) console.error(`     Response: ${text}`);
      return false;
    }
  } catch (err) {
    console.error("  ❌ Test scrape error:", err instanceof Error ? err.message : err);
    return false;
  }
}

async function main() {
  console.log("🐝 ScrapingBee Health Check\n");

  if (!API_KEY) {
    console.error("❌ SCRAPINGBEE_API_KEY not found in .env.local");
    console.log("\nRemediation:");
    console.log("1. Go to https://app.scrapingbee.com/ and sign in");
    console.log("2. Copy your API key from the dashboard");
    console.log("3. Add SCRAPINGBEE_API_KEY=<key> to .env.local and Vercel");
    process.exit(1);
  }

  console.log(`API Key: ${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}`);
  console.log(`Monthly Limit: ${MONTHLY_LIMIT.toLocaleString()} credits\n`);

  // 1. Check usage/account status
  console.log("📊 Checking account status...");
  const usage = await checkUsage();

  if (usage) {
    const percentUsed = ((usage.used_api_credit / usage.max_api_credit) * 100).toFixed(1);
    console.log(`  Plan credits: ${usage.max_api_credit.toLocaleString()}`);
    console.log(`  Used: ${usage.used_api_credit.toLocaleString()} (${percentUsed}%)`);
    console.log(`  Remaining: ${(usage.max_api_credit - usage.used_api_credit).toLocaleString()}`);

    if (parseFloat(percentUsed) >= 95) {
      console.log("  ⚠️  CRITICAL: Credits nearly exhausted — fallback mode active");
    } else if (parseFloat(percentUsed) >= 80) {
      console.log("  ⚠️  WARNING: Credits running low");
    } else {
      console.log("  ✅ Credit usage healthy");
    }
  } else {
    console.log("\n  Account status check FAILED.");
    console.log("  Possible causes:");
    console.log("  - API key is expired or invalid");
    console.log("  - Account subscription has lapsed");
    console.log("  - ScrapingBee API is temporarily down");
    console.log("\n  Remediation:");
    console.log("  1. Visit https://app.scrapingbee.com/ and check your account");
    console.log("  2. If subscription expired, renew or get a new API key");
    console.log("  3. If API key changed, update SCRAPINGBEE_API_KEY in .env.local and Vercel");
  }

  // 2. Test a simple scrape
  console.log("\n🔍 Testing live scrape...");
  const scrapeOk = await testScrape();

  // 3. Summary
  console.log("\n" + "=".repeat(50));
  console.log("📋 Summary\n");

  if (usage && scrapeOk) {
    console.log("✅ ScrapingBee is fully operational");
    console.log("   Scanning pipeline will use ScrapingBee for JS-heavy broker sites");
  } else if (!usage && !scrapeOk) {
    console.log("❌ ScrapingBee is DOWN");
    console.log("   Scanning pipeline is silently falling back to direct fetch");
    console.log("   JS-heavy broker sites (WhitePages, BeenVerified, Radaris, etc.) will have degraded scan quality");
    console.log("\n   Action required: Check account at https://app.scrapingbee.com/");
  } else if (usage && !scrapeOk) {
    console.log("⚠️  Account active but scraping failing");
    console.log("   May be a temporary ScrapingBee outage or rate limit");
  } else {
    console.log("⚠️  Cannot verify account but scraping works");
    console.log("   Usage API may have changed, but core functionality is OK");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
