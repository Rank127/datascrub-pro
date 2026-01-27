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

export function incrementUsage(service: string, count: number = 1): void {
  const serviceUsage = getUsage(service);
  serviceUsage.count += count;
}

export function getServiceUsage(service: string): number {
  return getUsage(service).count;
}

// ============================================
// ScrapingBee Monthly Credit Management
// ============================================

interface ScrapingBeeCredits {
  used: number;
  monthKey: string;
  lastCheckedAt: number;
  apiCreditsRemaining: number | null; // From API check
}

const scrapingBeeCredits: ScrapingBeeCredits = {
  used: 0,
  monthKey: "",
  lastCheckedAt: 0,
  apiCreditsRemaining: null,
};

// Credit costs based on ScrapingBee pricing
const SCRAPINGBEE_CREDITS = {
  BASIC: 1,           // No JS, no proxy
  JS_RENDERING: 5,    // With JavaScript rendering
  PREMIUM_NO_JS: 10,  // Premium proxy without JS
  PREMIUM_WITH_JS: 25, // Premium proxy with JS rendering
  STEALTH_NO_JS: 75,  // Stealth proxy without JS (estimate)
  STEALTH_WITH_JS: 100, // Stealth proxy with JS (estimate)
};

// Monthly limit from plan (250,000 credits)
const SCRAPINGBEE_MONTHLY_LIMIT = parseInt(process.env.SCRAPINGBEE_MONTHLY_LIMIT || "250000");

// Warning threshold (80% = 200,000 credits)
const SCRAPINGBEE_WARNING_THRESHOLD = 0.8;

// Critical threshold (95% = 237,500 credits) - start using fallback
const SCRAPINGBEE_CRITICAL_THRESHOLD = 0.95;

function getMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getScrapingBeeCreditsState(): ScrapingBeeCredits {
  const monthKey = getMonthKey();
  if (scrapingBeeCredits.monthKey !== monthKey) {
    // New month - reset counters
    scrapingBeeCredits.used = 0;
    scrapingBeeCredits.monthKey = monthKey;
    scrapingBeeCredits.apiCreditsRemaining = null;
    console.log(`[ScrapingBee] New month ${monthKey}, credits reset`);
  }
  return scrapingBeeCredits;
}

/**
 * Calculate credit cost for a ScrapingBee request based on options
 */
export function calculateScrapingBeeCost(options: {
  renderJs?: boolean;
  premiumProxy?: boolean;
  stealthProxy?: boolean;
}): number {
  const { renderJs = true, premiumProxy = false, stealthProxy = false } = options;

  if (stealthProxy) {
    return renderJs ? SCRAPINGBEE_CREDITS.STEALTH_WITH_JS : SCRAPINGBEE_CREDITS.STEALTH_NO_JS;
  }
  if (premiumProxy) {
    return renderJs ? SCRAPINGBEE_CREDITS.PREMIUM_WITH_JS : SCRAPINGBEE_CREDITS.PREMIUM_NO_JS;
  }
  if (renderJs) {
    return SCRAPINGBEE_CREDITS.JS_RENDERING;
  }
  return SCRAPINGBEE_CREDITS.BASIC;
}

/**
 * Record ScrapingBee credits used
 */
export function recordScrapingBeeUsage(credits: number): void {
  const state = getScrapingBeeCreditsState();
  state.used += credits;
  console.log(`[ScrapingBee] Used ${credits} credits (total this month: ${state.used}/${SCRAPINGBEE_MONTHLY_LIMIT})`);
}

/**
 * Update API credits from ScrapingBee usage endpoint
 */
export function updateScrapingBeeApiCredits(creditsRemaining: number): void {
  const state = getScrapingBeeCreditsState();
  state.apiCreditsRemaining = creditsRemaining;
  state.lastCheckedAt = Date.now();
}

/**
 * Check if ScrapingBee has enough credits for a request
 */
export function canUseScrapingBee(options: {
  renderJs?: boolean;
  premiumProxy?: boolean;
  stealthProxy?: boolean;
} = {}): { allowed: boolean; reason?: string; creditsNeeded: number } {
  const state = getScrapingBeeCreditsState();
  const creditsNeeded = calculateScrapingBeeCost(options);

  // If we have API data, use that as source of truth
  if (state.apiCreditsRemaining !== null) {
    if (state.apiCreditsRemaining < creditsNeeded) {
      return {
        allowed: false,
        reason: `Insufficient credits (need ${creditsNeeded}, have ${state.apiCreditsRemaining})`,
        creditsNeeded,
      };
    }
  }

  // Check against our internal tracking
  const estimatedRemaining = SCRAPINGBEE_MONTHLY_LIMIT - state.used;
  const percentUsed = state.used / SCRAPINGBEE_MONTHLY_LIMIT;

  // If at critical threshold, deny non-essential requests
  if (percentUsed >= SCRAPINGBEE_CRITICAL_THRESHOLD) {
    return {
      allowed: false,
      reason: `Monthly credits nearly exhausted (${Math.round(percentUsed * 100)}% used)`,
      creditsNeeded,
    };
  }

  if (estimatedRemaining < creditsNeeded) {
    return {
      allowed: false,
      reason: `Insufficient credits (need ${creditsNeeded}, ~${estimatedRemaining} remaining)`,
      creditsNeeded,
    };
  }

  return { allowed: true, creditsNeeded };
}

/**
 * Should use direct fetch fallback instead of ScrapingBee?
 */
export function shouldUseScrapingBeeFallback(): boolean {
  const state = getScrapingBeeCreditsState();
  const percentUsed = state.used / SCRAPINGBEE_MONTHLY_LIMIT;

  // Use fallback if at critical threshold
  if (percentUsed >= SCRAPINGBEE_CRITICAL_THRESHOLD) {
    return true;
  }

  // Use fallback if API reports no credits
  if (state.apiCreditsRemaining !== null && state.apiCreditsRemaining <= 0) {
    return true;
  }

  return false;
}

/**
 * Get ScrapingBee credit status for dashboard
 */
export function getScrapingBeeStatus(): {
  creditsUsed: number;
  creditsRemaining: number;
  monthlyLimit: number;
  percentUsed: number;
  status: "healthy" | "warning" | "critical";
  shouldUseFallback: boolean;
  apiCreditsRemaining: number | null;
  costBreakdown: typeof SCRAPINGBEE_CREDITS;
} {
  const state = getScrapingBeeCreditsState();
  const creditsRemaining = state.apiCreditsRemaining ?? (SCRAPINGBEE_MONTHLY_LIMIT - state.used);
  const percentUsed = Math.round(((SCRAPINGBEE_MONTHLY_LIMIT - creditsRemaining) / SCRAPINGBEE_MONTHLY_LIMIT) * 100);

  let status: "healthy" | "warning" | "critical" = "healthy";
  if (percentUsed >= SCRAPINGBEE_CRITICAL_THRESHOLD * 100) {
    status = "critical";
  } else if (percentUsed >= SCRAPINGBEE_WARNING_THRESHOLD * 100) {
    status = "warning";
  }

  return {
    creditsUsed: state.used,
    creditsRemaining,
    monthlyLimit: SCRAPINGBEE_MONTHLY_LIMIT,
    percentUsed,
    status,
    shouldUseFallback: shouldUseScrapingBeeFallback(),
    apiCreditsRemaining: state.apiCreditsRemaining,
    costBreakdown: SCRAPINGBEE_CREDITS,
  };
}

export function canUseService(service: string): boolean {
  // LeakCheck has lifetime limit, not daily
  if (service.toLowerCase() === "leakcheck") {
    return canUseLeakCheck().allowed;
  }

  const limits: Record<string, number> = {
    hibp: parseInt(process.env.HIBP_DAILY_LIMIT || "50"),
    scrapingbee: parseInt(process.env.SCRAPINGBEE_DAILY_LIMIT || "100"),
    resend: parseInt(process.env.DAILY_EMAIL_LIMIT || "90"),
  };

  const limit = limits[service.toLowerCase()];
  if (!limit) return true;

  const currentUsage = getUsage(service.toLowerCase());
  return currentUsage.count < limit;
}

// ============================================
// LeakCheck Lifetime Credit Management
// ============================================

interface LeakCheckCredits {
  used: number;
  apiCreditsRemaining: number | null;
  lastCheckedAt: number;
}

const leakCheckCredits: LeakCheckCredits = {
  used: 0,
  apiCreditsRemaining: null,
  lastCheckedAt: 0,
};

// LeakCheck lifetime limit (400 queries total, never renews)
const LEAKCHECK_LIFETIME_LIMIT = parseInt(process.env.LEAKCHECK_LIFETIME_LIMIT || "400");

// Warning at 80% (320 queries used)
const LEAKCHECK_WARNING_THRESHOLD = 0.8;

// Critical at 95% (380 queries used) - be very conservative
const LEAKCHECK_CRITICAL_THRESHOLD = 0.95;

/**
 * Update LeakCheck credits from API
 */
export function updateLeakCheckApiCredits(creditsRemaining: number): void {
  leakCheckCredits.apiCreditsRemaining = creditsRemaining;
  leakCheckCredits.lastCheckedAt = Date.now();
}

/**
 * Record LeakCheck query usage
 */
export function recordLeakCheckUsage(): void {
  leakCheckCredits.used++;
  if (leakCheckCredits.apiCreditsRemaining !== null && leakCheckCredits.apiCreditsRemaining > 0) {
    leakCheckCredits.apiCreditsRemaining--;
  }
}

/**
 * Check if LeakCheck can be used
 */
export function canUseLeakCheck(): { allowed: boolean; reason?: string } {
  // If we have API data, use it
  if (leakCheckCredits.apiCreditsRemaining !== null) {
    if (leakCheckCredits.apiCreditsRemaining <= 0) {
      return { allowed: false, reason: "Lifetime queries exhausted" };
    }
    const percentUsed = (LEAKCHECK_LIFETIME_LIMIT - leakCheckCredits.apiCreditsRemaining) / LEAKCHECK_LIFETIME_LIMIT;
    if (percentUsed >= LEAKCHECK_CRITICAL_THRESHOLD) {
      return { allowed: false, reason: "Conserving remaining lifetime queries" };
    }
  }

  return { allowed: true };
}

/**
 * Get LeakCheck status for dashboard
 */
export function getLeakCheckStatus(): {
  queriesUsed: number;
  queriesRemaining: number;
  lifetimeLimit: number;
  percentUsed: number;
  status: "healthy" | "warning" | "critical";
  apiCreditsRemaining: number | null;
} {
  const remaining = leakCheckCredits.apiCreditsRemaining ?? (LEAKCHECK_LIFETIME_LIMIT - leakCheckCredits.used);
  const used = LEAKCHECK_LIFETIME_LIMIT - remaining;
  const percentUsed = Math.round((used / LEAKCHECK_LIFETIME_LIMIT) * 100);

  let status: "healthy" | "warning" | "critical" = "healthy";
  if (percentUsed >= LEAKCHECK_CRITICAL_THRESHOLD * 100) {
    status = "critical";
  } else if (percentUsed >= LEAKCHECK_WARNING_THRESHOLD * 100) {
    status = "warning";
  }

  return {
    queriesUsed: used,
    queriesRemaining: remaining,
    lifetimeLimit: LEAKCHECK_LIFETIME_LIMIT,
    percentUsed,
    status,
    apiCreditsRemaining: leakCheckCredits.apiCreditsRemaining,
  };
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
