// Bing Webmaster Tools API Client
// Documentation: https://learn.microsoft.com/en-us/bingwebmaster/

import {
  BingSearchQuery,
  BingPageStats,
  BingCrawlStats,
  BingBacklink,
  BingSearchPerformance,
} from "./types";

const BING_API_BASE = "https://ssl.bing.com/webmaster/api.svc/json";

/**
 * Check if Bing Webmaster Tools is configured
 */
export function isBingConfigured(): boolean {
  return !!(process.env.BING_WEBMASTER_API_KEY && process.env.BING_SITE_URL);
}

/**
 * Get the API key from environment
 */
function getApiKey(): string | null {
  return process.env.BING_WEBMASTER_API_KEY || null;
}

/**
 * Get the site URL from environment
 */
function getSiteUrl(): string | null {
  return process.env.BING_SITE_URL || null;
}

/**
 * Make a request to Bing Webmaster API
 */
async function bingApiRequest<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T | null> {
  const apiKey = getApiKey();
  const siteUrl = getSiteUrl();

  if (!apiKey || !siteUrl) {
    console.log("[Bing] Missing API key or site URL");
    return null;
  }

  const queryParams = new URLSearchParams({
    apikey: apiKey,
    siteUrl: siteUrl,
    ...params,
  });

  const url = `${BING_API_BASE}/${endpoint}?${queryParams}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Bing] API request failed for ${endpoint}:`, errorText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[Bing] API request error for ${endpoint}:`, error);
    return null;
  }
}

/**
 * Get query statistics (top search queries)
 */
export async function getQueryStats(): Promise<BingSearchQuery[]> {
  if (!isBingConfigured()) return [];

  try {
    const data = await bingApiRequest<{ d: Array<{
      Query: string;
      Impressions: number;
      Clicks: number;
      AvgImpressionPosition: number;
    }> }>("GetQueryStats");

    if (!data?.d) return [];

    return data.d.map((item) => ({
      query: item.Query,
      impressions: item.Impressions,
      clicks: item.Clicks,
      ctr: item.Impressions > 0 ? (item.Clicks / item.Impressions) * 100 : 0,
      position: item.AvgImpressionPosition,
    })).sort((a, b) => b.clicks - a.clicks).slice(0, 20);
  } catch (error) {
    console.error("[Bing] Failed to get query stats:", error);
    return [];
  }
}

/**
 * Get page statistics (top performing pages)
 */
export async function getPageStats(): Promise<BingPageStats[]> {
  if (!isBingConfigured()) return [];

  try {
    const data = await bingApiRequest<{ d: Array<{
      Url: string;
      Impressions: number;
      Clicks: number;
      AvgImpressionPosition: number;
    }> }>("GetPageStats");

    if (!data?.d) return [];

    return data.d.map((item) => ({
      url: item.Url,
      impressions: item.Impressions,
      clicks: item.Clicks,
      ctr: item.Impressions > 0 ? (item.Clicks / item.Impressions) * 100 : 0,
      position: item.AvgImpressionPosition,
    })).sort((a, b) => b.clicks - a.clicks).slice(0, 20);
  } catch (error) {
    console.error("[Bing] Failed to get page stats:", error);
    return [];
  }
}

/**
 * Get crawl statistics
 */
export async function getCrawlStats(): Promise<BingCrawlStats | null> {
  if (!isBingConfigured()) return null;

  try {
    const data = await bingApiRequest<{ d: {
      CrawledPages: number;
      CrawlErrors: number;
      InIndex: number;
      BlockedByRobotsTxt: number;
    } }>("GetCrawlStats");

    if (!data?.d) return null;

    return {
      crawledPages: data.d.CrawledPages || 0,
      crawlErrors: data.d.CrawlErrors || 0,
      inIndex: data.d.InIndex || 0,
      blockedByRobots: data.d.BlockedByRobotsTxt || 0,
    };
  } catch (error) {
    console.error("[Bing] Failed to get crawl stats:", error);
    return null;
  }
}

/**
 * Get backlinks (link counts from external sites)
 */
export async function getBacklinks(): Promise<BingBacklink[]> {
  if (!isBingConfigured()) return [];

  try {
    const data = await bingApiRequest<{ d: Array<{
      SourceUrl: string;
      AnchorText: string;
    }> }>("GetLinkCounts");

    if (!data?.d) return [];

    return data.d.map((item) => ({
      sourceUrl: item.SourceUrl,
      anchorText: item.AnchorText || "",
    })).slice(0, 20);
  } catch (error) {
    console.error("[Bing] Failed to get backlinks:", error);
    return [];
  }
}

/**
 * Get overall search performance (aggregate stats)
 */
export async function getSearchPerformance(): Promise<BingSearchPerformance | null> {
  if (!isBingConfigured()) return null;

  try {
    // Get all query stats and aggregate
    const queries = await getQueryStats();

    if (queries.length === 0) {
      return {
        clicks: 0,
        impressions: 0,
        averageCtr: 0,
        averagePosition: 0,
      };
    }

    const totalClicks = queries.reduce((sum, q) => sum + q.clicks, 0);
    const totalImpressions = queries.reduce((sum, q) => sum + q.impressions, 0);
    const avgPosition = queries.reduce((sum, q) => sum + q.position, 0) / queries.length;

    return {
      clicks: totalClicks,
      impressions: totalImpressions,
      averageCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      averagePosition: Math.round(avgPosition * 10) / 10,
    };
  } catch (error) {
    console.error("[Bing] Failed to get search performance:", error);
    return null;
  }
}

/**
 * Submit URL for indexing via IndexNow
 */
export async function submitUrlToIndex(url: string): Promise<boolean> {
  const indexNowKey = process.env.BING_INDEXNOW_KEY;
  const siteUrl = getSiteUrl();

  if (!indexNowKey || !siteUrl) {
    console.log("[Bing] IndexNow not configured");
    return false;
  }

  try {
    const response = await fetch("https://www.bing.com/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        host: new URL(siteUrl).host,
        key: indexNowKey,
        keyLocation: `${siteUrl}/${indexNowKey}.txt`,
        urlList: [url],
      }),
    });

    if (response.ok || response.status === 202) {
      console.log(`[Bing] Successfully submitted URL for indexing: ${url}`);
      return true;
    }

    console.error("[Bing] IndexNow submission failed:", await response.text());
    return false;
  } catch (error) {
    console.error("[Bing] IndexNow submission error:", error);
    return false;
  }
}

/**
 * Submit multiple URLs for indexing via IndexNow
 */
export async function submitUrlsToIndex(urls: string[]): Promise<{ submitted: number; failed: number }> {
  const indexNowKey = process.env.BING_INDEXNOW_KEY;
  const siteUrl = getSiteUrl();

  if (!indexNowKey || !siteUrl) {
    console.log("[Bing] IndexNow not configured");
    return { submitted: 0, failed: urls.length };
  }

  try {
    const response = await fetch("https://www.bing.com/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        host: new URL(siteUrl).host,
        key: indexNowKey,
        keyLocation: `${siteUrl}/${indexNowKey}.txt`,
        urlList: urls,
      }),
    });

    if (response.ok || response.status === 202) {
      console.log(`[Bing] Successfully submitted ${urls.length} URLs for indexing`);
      return { submitted: urls.length, failed: 0 };
    }

    console.error("[Bing] IndexNow batch submission failed:", await response.text());
    return { submitted: 0, failed: urls.length };
  } catch (error) {
    console.error("[Bing] IndexNow batch submission error:", error);
    return { submitted: 0, failed: urls.length };
  }
}
