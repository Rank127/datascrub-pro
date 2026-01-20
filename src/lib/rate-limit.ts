// Simple in-memory rate limiter
// For production, consider using Redis-based rate limiting (e.g., @upstash/ratelimit)

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const defaultConfigs: Record<string, RateLimitConfig> = {
  // Strict limits for sensitive endpoints
  "auth-register": { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  "auth-login": { maxRequests: 10, windowMs: 15 * 60 * 1000 }, // 10 per 15 min
  "auth-forgot-password": { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour

  // Scan limits (in addition to monthly limits)
  scan: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour

  // API general limits
  api: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute

  // Stripe endpoints
  stripe: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute
};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function rateLimit(
  identifier: string,
  endpoint: string,
  customConfig?: RateLimitConfig
): RateLimitResult {
  const config = customConfig || defaultConfigs[endpoint] || defaultConfigs.api;
  const key = `${endpoint}:${identifier}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  // If no entry or window expired, create new entry
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const success = entry.count <= config.maxRequests;

  return {
    success,
    limit: config.maxRequests,
    remaining,
    reset: entry.resetTime,
  };
}

// Helper to get client identifier (IP address or user ID)
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP from various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  const ip = cfConnectingIp || realIp || forwarded?.split(",")[0].trim() || "unknown";
  return `ip:${ip}`;
}

// Rate limit response helper
export function rateLimitResponse(result: RateLimitResult) {
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please try again later.",
      retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
        "Retry-After": Math.ceil((result.reset - Date.now()) / 1000).toString(),
      },
    }
  );
}
