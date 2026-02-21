/**
 * Broker Scraper Diagnostic
 *
 * Tests ScrapingBee against real broker URLs with different proxy levels
 * to identify which sites work with premium vs stealth vs direct fetch.
 *
 * Usage: npx tsx scripts/diagnose-scrapers.ts
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Test URLs — one search URL per broker category
const TEST_URLS: Array<{ name: string; url: string; category: string }> = [
  // Premium proxy sites (moderate bot detection)
  { name: "Spokeo", url: "https://www.spokeo.com/John-Smith/Texas", category: "premium" },
  { name: "WhitePages", url: "https://www.whitepages.com/name/John-Smith/Dallas-TX", category: "premium" },
  { name: "TruePeopleSearch", url: "https://www.truepeoplesearch.com/results?name=John%20Smith&citystatezip=Dallas%20TX", category: "premium" },
  // Stealth proxy sites (heavy bot detection / paywall)
  { name: "BeenVerified", url: "https://www.beenverified.com/people/John-Smith/TX", category: "stealth" },
  { name: "TruthFinder", url: "https://www.truthfinder.com/results/?firstName=John&lastName=Smith&state=TX", category: "stealth" },
  { name: "Intelius", url: "https://www.intelius.com/people-search/John-Smith", category: "stealth" },
];

interface TestResult {
  name: string;
  method: string;
  success: boolean;
  statusCode: number;
  htmlBytes: number;
  botDetected: boolean;
  error?: string;
  durationMs: number;
  creditCost: number;
}

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

function hasBotIndicators(html: string): boolean {
  return (
    html.includes("Access Denied") ||
    html.includes("Request blocked") ||
    html.includes("captcha") ||
    html.includes("CAPTCHA") ||
    html.includes("Please verify you are a human") ||
    html.includes("cf-browser-verification") ||
    html.includes("challenge-form")
  );
}

async function testDirect(name: string, url: string): Promise<TestResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 15000);

    const resp = await fetch(url, { headers: BROWSER_HEADERS, redirect: "follow", signal: controller.signal });
    const html = await resp.text();
    const botDetected = html.length < 10000 && hasBotIndicators(html);

    return {
      name, method: "direct", success: resp.ok && !botDetected,
      statusCode: resp.status, htmlBytes: html.length, botDetected,
      durationMs: Date.now() - start, creditCost: 0,
    };
  } catch (e) {
    return {
      name, method: "direct", success: false, statusCode: 0, htmlBytes: 0,
      botDetected: false, error: e instanceof Error ? e.message : String(e),
      durationMs: Date.now() - start, creditCost: 0,
    };
  }
}

async function testScrapingBee(
  name: string,
  url: string,
  proxyType: "none" | "premium" | "stealth"
): Promise<TestResult> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY?.trim();
  if (!apiKey) {
    return {
      name, method: `scrapingbee-${proxyType}`, success: false, statusCode: 0,
      htmlBytes: 0, botDetected: false, error: "SCRAPINGBEE_API_KEY not set",
      durationMs: 0, creditCost: 0,
    };
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    url,
    render_js: "true",
  });

  if (proxyType === "premium") params.set("premium_proxy", "true");
  if (proxyType === "stealth") params.set("stealth_proxy", "true");

  const creditCost = proxyType === "stealth" ? 100 : proxyType === "premium" ? 25 : 5;

  const start = Date.now();
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 35000);

    const resp = await fetch(`https://app.scrapingbee.com/api/v1/?${params.toString()}`, {
      signal: controller.signal,
    });

    const html = await resp.text();
    const originalStatus = parseInt(resp.headers.get("Spb-Status") || "200");

    const botDetected = html.length < 10000 && hasBotIndicators(html);

    return {
      name, method: `scrapingbee-${proxyType}`,
      success: resp.ok && originalStatus < 400 && !botDetected,
      statusCode: resp.ok ? originalStatus : resp.status,
      htmlBytes: html.length, botDetected,
      error: !resp.ok ? `API ${resp.status}` : originalStatus >= 400 ? `Target ${originalStatus}` : undefined,
      durationMs: Date.now() - start, creditCost,
    };
  } catch (e) {
    return {
      name, method: `scrapingbee-${proxyType}`, success: false, statusCode: 0,
      htmlBytes: 0, botDetected: false, error: e instanceof Error ? e.message : String(e),
      durationMs: Date.now() - start, creditCost,
    };
  }
}

async function main() {
  console.log("=== Broker Scraper Diagnostic ===\n");

  const hasKey = !!process.env.SCRAPINGBEE_API_KEY?.trim();
  console.log(`ScrapingBee API key: ${hasKey ? "CONFIGURED" : "MISSING"}`);
  if (!hasKey) {
    console.error("\nSCRAPINGBEE_API_KEY not found in .env.local — only direct fetch will be tested\n");
  }

  const results: TestResult[] = [];
  let totalCreditsUsed = 0;

  for (const { name, url, category } of TEST_URLS) {
    console.log(`\n--- Testing ${name} (${url}) ---`);

    // Test 1: Direct fetch (0 credits)
    console.log(`  [1/3] Direct fetch...`);
    const directResult = await testDirect(name, url);
    results.push(directResult);
    console.log(`        ${directResult.success ? "OK" : "BLOCKED"} — ${directResult.statusCode} — ${directResult.htmlBytes} bytes — ${directResult.durationMs}ms${directResult.botDetected ? " — BOT DETECTED" : ""}${directResult.error ? ` — ${directResult.error}` : ""}`);

    if (!hasKey) continue;

    // Test 2: Premium proxy (25 credits)
    console.log(`  [2/3] ScrapingBee Premium...`);
    const premiumResult = await testScrapingBee(name, url, "premium");
    results.push(premiumResult);
    totalCreditsUsed += premiumResult.creditCost;
    console.log(`        ${premiumResult.success ? "OK" : "BLOCKED"} — ${premiumResult.statusCode} — ${premiumResult.htmlBytes} bytes — ${premiumResult.durationMs}ms — ${premiumResult.creditCost} credits${premiumResult.botDetected ? " — BOT DETECTED" : ""}${premiumResult.error ? ` — ${premiumResult.error}` : ""}`);

    // Only test stealth if premium failed (save credits)
    if (!premiumResult.success) {
      console.log(`  [3/3] ScrapingBee Stealth...`);
      const stealthResult = await testScrapingBee(name, url, "stealth");
      results.push(stealthResult);
      totalCreditsUsed += stealthResult.creditCost;
      console.log(`        ${stealthResult.success ? "OK" : "BLOCKED"} — ${stealthResult.statusCode} — ${stealthResult.htmlBytes} bytes — ${stealthResult.durationMs}ms — ${stealthResult.creditCost} credits${stealthResult.botDetected ? " — BOT DETECTED" : ""}${stealthResult.error ? ` — ${stealthResult.error}` : ""}`);
    } else {
      console.log(`  [3/3] Stealth — SKIPPED (premium worked)`);
    }

    // Small delay between sites
    await new Promise(r => setTimeout(r, 1000));
  }

  // Summary table
  console.log("\n\n=== SUMMARY ===\n");
  console.log("Site".padEnd(20) + "Direct".padEnd(12) + "Premium".padEnd(12) + "Stealth".padEnd(12) + "Recommendation");
  console.log("-".repeat(75));

  const siteNames = [...new Set(results.map(r => r.name))];
  for (const site of siteNames) {
    const siteResults = results.filter(r => r.name === site);
    const direct = siteResults.find(r => r.method === "direct");
    const premium = siteResults.find(r => r.method === "scrapingbee-premium");
    const stealth = siteResults.find(r => r.method === "scrapingbee-stealth");

    const directStatus = direct?.success ? "OK" : direct?.statusCode ? `${direct.statusCode}` : "FAIL";
    const premiumStatus = premium?.success ? "OK" : premium?.statusCode ? `${premium.statusCode}` : "N/A";
    const stealthStatus = stealth?.success ? "OK" : stealth ? `${stealth.statusCode || "FAIL"}` : "N/A";

    let recommendation = "unknown";
    if (direct?.success) recommendation = "direct (free)";
    else if (premium?.success) recommendation = "premium (25cr)";
    else if (stealth?.success) recommendation = "stealth (100cr)";
    else recommendation = "ALL BLOCKED";

    console.log(
      site.padEnd(20) +
      directStatus.padEnd(12) +
      premiumStatus.padEnd(12) +
      stealthStatus.padEnd(12) +
      recommendation
    );
  }

  console.log(`\nTotal ScrapingBee credits used: ${totalCreditsUsed}`);
  console.log("\n=== Diagnostic Complete ===");
}

main().catch((e) => {
  console.error("Diagnostic failed:", e);
  process.exit(1);
});
