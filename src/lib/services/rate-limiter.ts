/**
 * Simple in-memory rate limiter for external API services
 * Tracks daily usage and per-minute usage (for HIBP)
 * Provides fallback recommendations and queue management
 */

interface ServiceUsage {
  count: number;
  resetDate: string;
}

interface MinuteUsage {
  count: number;
  minuteKey: string;
  lastRequestAt: number;
}

const usage: Record<string, ServiceUsage> = {};
const minuteUsage: Record<string, MinuteUsage> = {};

// HIBP rate limit: 10 requests per minute
const HIBP_REQUESTS_PER_MINUTE = parseInt(process.env.HIBP_RATE_LIMIT || "10");
const HIBP_MIN_DELAY_MS = 6100; // 6.1 seconds between requests (safe margin)

function getTodayKey(): string {
  return new Date().toDateString();
}

function getMinuteKey(): string {
  const now = new Date();
  return `${now.getMinutes()}`;
}

function getUsage(service: string): ServiceUsage {
  const today = getTodayKey();
  if (!usage[service] || usage[service].resetDate !== today) {
    usage[service] = { count: 0, resetDate: today };
  }
  return usage[service];
}

function getMinuteUsage(service: string): MinuteUsage {
  const minuteKey = getMinuteKey();
  if (!minuteUsage[service] || minuteUsage[service].minuteKey !== minuteKey) {
    minuteUsage[service] = { count: 0, minuteKey, lastRequestAt: 0 };
  }
  return minuteUsage[service];
}

/**
 * HIBP-specific rate limiting
 * Returns the number of milliseconds to wait before making the next request
 */
export function getHIBPWaitTime(): number {
  const minute = getMinuteUsage("hibp");
  const now = Date.now();

  // If we've hit the per-minute limit, calculate wait time until next minute
  if (minute.count >= HIBP_REQUESTS_PER_MINUTE) {
    const secondsUntilReset = 60 - new Date().getSeconds();
    return secondsUntilReset * 1000;
  }

  // Enforce minimum delay between requests (6.1 seconds)
  if (minute.lastRequestAt > 0) {
    const timeSinceLastRequest = now - minute.lastRequestAt;
    if (timeSinceLastRequest < HIBP_MIN_DELAY_MS) {
      return HIBP_MIN_DELAY_MS - timeSinceLastRequest;
    }
  }

  return 0;
}

/**
 * Record a HIBP request and return whether it was allowed
 */
export function recordHIBPRequest(): boolean {
  const minute = getMinuteUsage("hibp");

  if (minute.count >= HIBP_REQUESTS_PER_MINUTE) {
    return false;
  }

  minute.count++;
  minute.lastRequestAt = Date.now();

  // Also increment daily usage
  incrementUsage("hibp");

  return true;
}

/**
 * Get HIBP rate limit status for display
 */
export function getHIBPRateLimitStatus(): {
  requestsThisMinute: number;
  maxPerMinute: number;
  remaining: number;
  percentUsed: number;
  secondsUntilReset: number;
  canMakeRequest: boolean;
} {
  const minute = getMinuteUsage("hibp");
  const remaining = Math.max(0, HIBP_REQUESTS_PER_MINUTE - minute.count);
  const secondsUntilReset = 60 - new Date().getSeconds();

  return {
    requestsThisMinute: minute.count,
    maxPerMinute: HIBP_REQUESTS_PER_MINUTE,
    remaining,
    percentUsed: Math.round((minute.count / HIBP_REQUESTS_PER_MINUTE) * 100),
    secondsUntilReset,
    canMakeRequest: minute.count < HIBP_REQUESTS_PER_MINUTE,
  };
}

export function incrementUsage(service: string): void {
  const serviceUsage = getUsage(service);
  serviceUsage.count++;
}

export function getServiceUsage(service: string): number {
  return getUsage(service).count;
}

export function canUseService(service: string): boolean {
  const limits: Record<string, number> = {
    hibp: parseInt(process.env.HIBP_DAILY_LIMIT || "50"),
    leakcheck: parseInt(process.env.LEAKCHECK_DAILY_LIMIT || "50"),
    scrapingbee: parseInt(process.env.SCRAPINGBEE_DAILY_LIMIT || "100"),
    resend: parseInt(process.env.DAILY_EMAIL_LIMIT || "90"),
  };

  const limit = limits[service.toLowerCase()];
  if (!limit) return true;

  const currentUsage = getUsage(service.toLowerCase());
  return currentUsage.count < limit;
}

export function shouldUseFreeAlternative(): boolean {
  return process.env.USE_FREE_TIER_ONLY === "true";
}

export function getServiceStatus(service: string): {
  used: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  useFreeAlternative: boolean;
} {
  const limits: Record<string, number> = {
    hibp: parseInt(process.env.HIBP_DAILY_LIMIT || "50"),
    leakcheck: parseInt(process.env.LEAKCHECK_DAILY_LIMIT || "50"),
    scrapingbee: parseInt(process.env.SCRAPINGBEE_DAILY_LIMIT || "100"),
    resend: parseInt(process.env.DAILY_EMAIL_LIMIT || "90"),
  };

  const limit = limits[service.toLowerCase()] || 100;
  const used = getUsage(service.toLowerCase()).count;
  const remaining = Math.max(0, limit - used);

  return {
    used,
    limit,
    remaining,
    percentUsed: Math.round((used / limit) * 100),
    useFreeAlternative: shouldUseFreeAlternative() || remaining === 0,
  };
}

// Reset all counters (for testing)
export function resetAllUsage(): void {
  Object.keys(usage).forEach((key) => {
    delete usage[key];
  });
}
