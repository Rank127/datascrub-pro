/**
 * Simple in-memory rate limiter for external API services
 * Tracks daily usage and provides fallback recommendations
 */

interface ServiceUsage {
  count: number;
  resetDate: string;
}

const usage: Record<string, ServiceUsage> = {};

function getTodayKey(): string {
  return new Date().toDateString();
}

function getUsage(service: string): ServiceUsage {
  const today = getTodayKey();
  if (!usage[service] || usage[service].resetDate !== today) {
    usage[service] = { count: 0, resetDate: today };
  }
  return usage[service];
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
