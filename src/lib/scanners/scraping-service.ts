/**
 * Scraping Service
 *
 * Provides reliable web scraping with:
 * - JavaScript rendering (5 credits)
 * - Bot detection bypass
 * - Proxy rotation (premium: 10-25 credits, stealth: 75-100 credits)
 * - CAPTCHA handling
 * - Smart credit management with monthly limits
 *
 * Uses ScrapingBee API (or falls back to direct fetch when credits exhausted)
 */

import {
  canUseScrapingBee,
  recordScrapingBeeUsage,
  shouldUseScrapingBeeFallback,
  getScrapingBeeStatus,
} from "@/lib/services/rate-limiter";

export interface ScrapingOptions {
  renderJs?: boolean;
  premiumProxy?: boolean;
  stealthProxy?: boolean; // Most expensive but best for anti-bot sites
  countryCode?: string;
  waitForSelector?: string;
  timeout?: number;
  forceFallback?: boolean; // Force direct fetch even if ScrapingBee is available
}

interface ScrapingResult {
  success: boolean;
  html: string;
  statusCode: number;
  error?: string;
}

// Browser-like headers for fallback
const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

/**
 * Check if ScrapingBee API key is configured
 */
export function isScrapingServiceEnabled(): boolean {
  return !!process.env.SCRAPINGBEE_API_KEY;
}

/**
 * Fetch a URL using ScrapingBee API
 */
async function fetchWithScrapingBee(
  url: string,
  options: ScrapingOptions = {}
): Promise<ScrapingResult> {
  // Trim to remove any trailing newlines from env variable
  const apiKey = process.env.SCRAPINGBEE_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("SCRAPINGBEE_API_KEY not configured");
  }

  // Check if we have enough credits
  const creditCheck = canUseScrapingBee(options);
  if (!creditCheck.allowed) {
    console.warn(`[ScrapingService] ScrapingBee blocked: ${creditCheck.reason}`);
    return {
      success: false,
      html: "",
      statusCode: 402, // Payment Required
      error: creditCheck.reason,
    };
  }

  const creditCost = creditCheck.creditsNeeded;
  const renderJs = options.renderJs !== false;

  const params = new URLSearchParams({
    api_key: apiKey,
    url: url,
    render_js: renderJs ? "true" : "false",
  });

  // Stealth proxy is most expensive but best for anti-bot sites
  // Premium proxy is cheaper but less effective
  // Only enable one at a time
  if (options.stealthProxy) {
    params.set("stealth_proxy", "true");
  } else if (options.premiumProxy) {
    params.set("premium_proxy", "true");
  }

  if (options.countryCode) {
    params.set("country_code", options.countryCode);
  }

  if (options.waitForSelector) {
    params.set("wait_for", options.waitForSelector);
  }

  const scrapingUrl = `https://app.scrapingbee.com/api/v1/?${params.toString()}`;

  console.log(`[ScrapingService] Fetching via ScrapingBee: ${url} (cost: ${creditCost} credits)`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);

  try {
    const response = await fetch(scrapingUrl, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const html = await response.text();

    // ScrapingBee returns original status code in Spb-Status header
    const originalStatusCode = parseInt(response.headers.get("Spb-Status") || "200");
    const resolvedUrl = response.headers.get("Spb-Resolved-Url") || url;

    console.log(`[ScrapingService] ScrapingBee response: apiStatus=${response.status}, originalStatus=${originalStatusCode}, html=${html.length} bytes`);

    if (!response.ok) {
      // Log full error response for debugging
      console.error(`[ScrapingService] ScrapingBee API error: status=${response.status}, body=${html.substring(0, 500)}`);

      // ScrapingBee error codes:
      // 403 = Invalid API key or insufficient credits
      // 429 = Rate limit exceeded
      // 500 = ScrapingBee internal error
      let errorDetail = `ScrapingBee API error ${response.status}`;
      try {
        const errorJson = JSON.parse(html);
        if (errorJson.message) {
          errorDetail = `ScrapingBee: ${errorJson.message}`;
        }
      } catch {
        // Not JSON, use raw body
        if (html.length > 0) {
          errorDetail = `ScrapingBee: ${html.substring(0, 200)}`;
        }
      }

      return {
        success: false,
        html: "",
        statusCode: response.status,
        error: errorDetail,
      };
    }

    // Check if the original target site returned an error
    // For 404s, still return the HTML - some sites use 404 for "person not found"
    // which is valid and should be parsed by the scanner
    if (originalStatusCode >= 400 && originalStatusCode !== 404) {
      console.error(`[ScrapingService] Target site returned ${originalStatusCode}`);
      return {
        success: false,
        html,
        statusCode: originalStatusCode,
        error: `Target site returned HTTP ${originalStatusCode}`,
      };
    }

    // For 404s with HTML content, let the scanner parse it
    if (originalStatusCode === 404 && html.length > 1000) {
      console.log(`[ScrapingService] Target returned 404 with ${html.length} bytes - passing to scanner for parsing`);
      return {
        success: true, // Let scanner determine if it's "no results" vs error
        html,
        statusCode: originalStatusCode,
      };
    }

    // Check for bot detection in the response
    // Only flag as blocked if the response is small (real pages are large)
    // and contains clear bot-blocking indicators
    const isSmallResponse = html.length < 10000;
    const hasBotIndicators =
      html.includes("Access Denied") ||
      html.includes("Request blocked") ||
      html.includes("captcha") ||
      html.includes("CAPTCHA") ||
      html.includes("Please verify you are a human") ||
      html.includes("cf-browser-verification") ||
      html.includes("challenge-form");

    if (isSmallResponse && hasBotIndicators) {
      console.warn(`[ScrapingService] Bot detection triggered: small response (${html.length} bytes) with blocking indicators`);
      return {
        success: false,
        html,
        statusCode: 403,
        error: "Bot detection triggered on target site",
      };
    }

    // Record successful credit usage
    recordScrapingBeeUsage(creditCost);
    console.log(`[ScrapingService] ScrapingBee success: ${html.length} bytes, resolved=${resolvedUrl}, credits used: ${creditCost}`);

    return {
      success: true,
      html,
      statusCode: originalStatusCode,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[ScrapingService] ScrapingBee fetch error:`, errorMessage);
    return {
      success: false,
      html: "",
      statusCode: 0,
      error: errorMessage,
    };
  }
}

/**
 * Fetch a URL using direct HTTP (fallback)
 */
async function fetchDirect(
  url: string,
  options: ScrapingOptions = {}
): Promise<ScrapingResult> {
  console.log(`[ScrapingService] Fetching directly: ${url}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 15000);

  try {
    const response = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: "follow",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`[ScrapingService] Direct fetch error: ${response.status}`);
      return {
        success: false,
        html: "",
        statusCode: response.status,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const html = await response.text();
    console.log(`[ScrapingService] Direct fetch success: ${html.length} bytes`);

    // Check for common bot detection indicators
    const isBlocked =
      html.includes("captcha") ||
      html.includes("CAPTCHA") ||
      html.includes("challenge-form") ||
      html.includes("cf-browser-verification") ||
      html.includes("Please verify you are a human") ||
      html.includes("Access Denied") ||
      html.includes("blocked") ||
      html.length < 1000; // Suspiciously small response

    if (isBlocked) {
      console.warn(`[ScrapingService] Possible bot detection at ${url}`);
      return {
        success: false,
        html,
        statusCode: 403,
        error: "Bot detection triggered - response may be blocked",
      };
    }

    return {
      success: true,
      html,
      statusCode: 200,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[ScrapingService] Direct fetch error:`, errorMessage);
    return {
      success: false,
      html: "",
      statusCode: 0,
      error: errorMessage,
    };
  }
}

/**
 * Main scraping function - uses ScrapingBee if available, falls back to direct fetch
 *
 * Automatically falls back to direct fetch when:
 * - ScrapingBee is not configured
 * - Monthly credits are exhausted (95%+ used)
 * - forceFallback option is set
 * - ScrapingBee returns a server error
 */
export async function scrapeUrl(
  url: string,
  options: ScrapingOptions = {}
): Promise<ScrapingResult> {
  // Force fallback if requested
  if (options.forceFallback) {
    console.log(`[ScrapingService] Forced fallback to direct fetch for: ${url}`);
    return fetchDirect(url, options);
  }

  // Check if we should use fallback due to credit exhaustion
  if (shouldUseScrapingBeeFallback()) {
    const status = getScrapingBeeStatus();
    console.warn(`[ScrapingService] Using fallback - ScrapingBee credits ${status.percentUsed}% used (${status.creditsRemaining} remaining)`);
    return fetchDirect(url, options);
  }

  // Try ScrapingBee first if configured
  if (isScrapingServiceEnabled()) {
    const result = await fetchWithScrapingBee(url, options);

    // Return ScrapingBee result if:
    // 1. It was successful
    // 2. We got HTML back (even if target returned 403, the HTML might have useful content)
    if (result.success || result.html.length > 0) {
      return result;
    }

    // Check if this was a ScrapingBee API error vs target site error
    console.warn(`[ScrapingService] ScrapingBee failed: status=${result.statusCode}, error=${result.error}`);

    // 402 means we ran out of credits - use fallback
    if (result.statusCode === 402) {
      console.warn(`[ScrapingService] Credits exhausted, falling back to direct fetch`);
      return fetchDirect(url, options);
    }

    // Don't fall back for 4xx client errors - these indicate real problems
    // (e.g., blocked URL, invalid request, etc.)
    if (result.statusCode >= 400 && result.statusCode < 500) {
      console.warn(`[ScrapingService] Not falling back due to 4xx error from ScrapingBee`);
      return result;
    }

    // Only fall back for server errors or network issues
    console.warn(`[ScrapingService] Falling back to direct fetch`);
  }

  // Fall back to direct fetch
  return fetchDirect(url, options);
}

/**
 * Get current ScrapingBee credit status (for external use)
 */
export { getScrapingBeeStatus } from "@/lib/services/rate-limiter";

/**
 * Scrape multiple URLs in parallel with rate limiting
 */
export async function scrapeUrls(
  urls: string[],
  options: ScrapingOptions = {},
  concurrency: number = 3
): Promise<Map<string, ScrapingResult>> {
  const results = new Map<string, ScrapingResult>();

  // Process in batches to respect rate limits
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (url) => {
        const result = await scrapeUrl(url, options);
        return { url, result };
      })
    );

    for (const { url, result } of batchResults) {
      results.set(url, result);
    }

    // Add delay between batches
    if (i + concurrency < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}
