// Google Analytics Data API Client
// Documentation: https://developers.google.com/analytics/devguides/reporting/data/v1

import {
  GAPageViews,
  GAActiveUsers,
  GATopPage,
  GATrafficSource,
  GAConversion,
} from "./types";

const GA_API_BASE = "https://analyticsdata.googleapis.com/v1beta";

interface GAConfig {
  propertyId: string;
  accessToken: string;
}

interface ServiceAccountKey {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
}

// Cache for the access token
let tokenCache: { token: string; expiresAt: number } | null = null;

/**
 * Check if Google Analytics is configured
 */
export function isGAConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY && process.env.GA_PROPERTY_ID
  );
}

/**
 * Get service account credentials from environment
 */
function getServiceAccountKey(): ServiceAccountKey | null {
  const keyBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyBase64) return null;

  try {
    const keyJson = Buffer.from(keyBase64, "base64").toString("utf-8");
    return JSON.parse(keyJson);
  } catch (error) {
    console.error("[GA] Failed to parse service account key:", error);
    return null;
  }
}

/**
 * Get property ID from environment
 */
function getPropertyId(): string | null {
  return process.env.GA_PROPERTY_ID || null;
}

/**
 * Create a JWT and exchange it for an access token
 */
async function getAccessToken(): Promise<string | null> {
  // Return cached token if still valid
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60000) {
    return tokenCache.token;
  }

  const serviceAccount = getServiceAccountKey();
  if (!serviceAccount) return null;

  try {
    // Create JWT header and payload
    const header = {
      alg: "RS256",
      typ: "JWT",
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: serviceAccount.token_uri,
      iat: now,
      exp: now + 3600, // 1 hour
    };

    // Sign the JWT using the service account's private key
    const { createSign } = await import("crypto");

    const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString(
      "base64url"
    );
    const signatureInput = `${headerB64}.${payloadB64}`;

    const sign = createSign("RSA-SHA256");
    sign.update(signatureInput);
    const signature = sign.sign(serviceAccount.private_key, "base64url");

    const jwt = `${signatureInput}.${signature}`;

    // Exchange JWT for access token
    const tokenResponse = await fetch(serviceAccount.token_uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("[GA] Token exchange failed:", errorText);
      return null;
    }

    const tokenData = await tokenResponse.json();

    // Cache the token
    tokenCache = {
      token: tokenData.access_token,
      expiresAt: Date.now() + (tokenData.expires_in || 3600) * 1000,
    };

    return tokenData.access_token;
  } catch (error) {
    console.error("[GA] Failed to get access token:", error);
    return null;
  }
}

/**
 * Run a GA4 report
 */
async function runReport(
  dimensions: string[],
  metrics: string[],
  dateRanges: { startDate: string; endDate: string }[]
): Promise<{
  rows?: Array<{
    dimensionValues: Array<{ value: string }>;
    metricValues: Array<{ value: string }>;
  }>;
} | null> {
  const config = await getConfig();
  if (!config) return null;

  try {
    const response = await fetch(
      `${GA_API_BASE}/${config.propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dimensions: dimensions.map((name) => ({ name })),
          metrics: metrics.map((name) => ({ name })),
          dateRanges,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[GA] Report request failed:", errorText);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("[GA] Failed to run report:", error);
    return null;
  }
}

async function getConfig(): Promise<GAConfig | null> {
  const propertyId = getPropertyId();
  const accessToken = await getAccessToken();

  if (!propertyId || !accessToken) {
    return null;
  }

  return { propertyId, accessToken };
}

/**
 * Get page view metrics
 */
export async function getPageViews(): Promise<GAPageViews | null> {
  if (!isGAConfigured()) return null;

  try {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const [todayReport, weekReport, monthReport] = await Promise.all([
      runReport([], ["screenPageViews"], [{ startDate: today, endDate: today }]),
      runReport([], ["screenPageViews"], [
        { startDate: weekAgo, endDate: today },
      ]),
      runReport([], ["screenPageViews"], [
        { startDate: monthAgo, endDate: today },
      ]),
    ]);

    return {
      today: parseInt(todayReport?.rows?.[0]?.metricValues?.[0]?.value || "0"),
      week: parseInt(weekReport?.rows?.[0]?.metricValues?.[0]?.value || "0"),
      month: parseInt(monthReport?.rows?.[0]?.metricValues?.[0]?.value || "0"),
    };
  } catch (error) {
    console.error("[GA] Failed to get page views:", error);
    return null;
  }
}

/**
 * Get active user metrics
 */
export async function getActiveUsers(): Promise<GAActiveUsers | null> {
  if (!isGAConfigured()) return null;

  try {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const [dauReport, wauReport, mauReport] = await Promise.all([
      runReport([], ["activeUsers"], [{ startDate: today, endDate: today }]),
      runReport([], ["activeUsers"], [{ startDate: weekAgo, endDate: today }]),
      runReport([], ["activeUsers"], [{ startDate: monthAgo, endDate: today }]),
    ]);

    return {
      dau: parseInt(dauReport?.rows?.[0]?.metricValues?.[0]?.value || "0"),
      wau: parseInt(wauReport?.rows?.[0]?.metricValues?.[0]?.value || "0"),
      mau: parseInt(mauReport?.rows?.[0]?.metricValues?.[0]?.value || "0"),
    };
  } catch (error) {
    console.error("[GA] Failed to get active users:", error);
    return null;
  }
}

/**
 * Get top pages by views
 */
export async function getTopPages(limit = 10): Promise<GATopPage[]> {
  if (!isGAConfigured()) return [];

  try {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const today = new Date().toISOString().split("T")[0];

    const report = await runReport(
      ["pagePath"],
      ["screenPageViews"],
      [{ startDate: monthAgo, endDate: today }]
    );

    if (!report?.rows) return [];

    return report.rows
      .map((row) => ({
        path: row.dimensionValues[0]?.value || "",
        views: parseInt(row.metricValues[0]?.value || "0"),
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  } catch (error) {
    console.error("[GA] Failed to get top pages:", error);
    return [];
  }
}

/**
 * Get traffic sources
 */
export async function getTrafficSources(): Promise<GATrafficSource[]> {
  if (!isGAConfigured()) return [];

  try {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const today = new Date().toISOString().split("T")[0];

    const report = await runReport(
      ["sessionSource"],
      ["sessions"],
      [{ startDate: monthAgo, endDate: today }]
    );

    if (!report?.rows) return [];

    return report.rows
      .map((row) => ({
        source: row.dimensionValues[0]?.value || "(direct)",
        sessions: parseInt(row.metricValues[0]?.value || "0"),
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10);
  } catch (error) {
    console.error("[GA] Failed to get traffic sources:", error);
    return [];
  }
}

/**
 * Get conversion events
 */
export async function getConversions(): Promise<GAConversion[]> {
  if (!isGAConfigured()) return [];

  try {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const today = new Date().toISOString().split("T")[0];

    const report = await runReport(
      ["eventName"],
      ["eventCount"],
      [{ startDate: monthAgo, endDate: today }]
    );

    if (!report?.rows) return [];

    // Filter for conversion-like events
    const conversionEvents = [
      "sign_up",
      "purchase",
      "subscription",
      "checkout_complete",
      "scan_complete",
      "removal_request",
    ];

    return report.rows
      .filter((row) =>
        conversionEvents.some((e) =>
          row.dimensionValues[0]?.value?.toLowerCase().includes(e)
        )
      )
      .map((row) => ({
        event: row.dimensionValues[0]?.value || "",
        count: parseInt(row.metricValues[0]?.value || "0"),
      }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error("[GA] Failed to get conversions:", error);
    return [];
  }
}
