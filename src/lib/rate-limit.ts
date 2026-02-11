/**
 * Production-Ready Rate Limiting with Upstash Redis
 *
 * Uses Upstash Redis for distributed rate limiting that persists across
 * serverless function restarts. Falls back to in-memory for local development.
 *
 * SECURITY: Rate limiting prevents brute force attacks, DoS, and API abuse.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ============================================================================
// Configuration
// ============================================================================

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const defaultConfigs: Record<string, RateLimitConfig> = {
  // Strict limits for sensitive auth endpoints
  "auth-register": { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  "auth-login": { maxRequests: 10, windowMs: 15 * 60 * 1000 }, // 10 per 15 min
  "auth-forgot-password": { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  "auth-2fa": { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 min

  // Scan limits (in addition to monthly limits)
  scan: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour

  // API general limits
  api: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute

  // Stripe endpoints
  stripe: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute

  // Admin endpoints (stricter)
  admin: { maxRequests: 50, windowMs: 60 * 1000 }, // 50 per minute
};

// ============================================================================
// Upstash Redis Rate Limiter (Production)
// ============================================================================

let redis: Redis | null = null;
const upstashRatelimiters: Map<string, Ratelimit> = new Map();

/**
 * Initialize Upstash Redis connection
 * Supports both Vercel KV (KV_REST_API_*) and direct Upstash (UPSTASH_REDIS_REST_*) env vars
 */
function getRedis(): Redis | null {
  if (redis) return redis;

  // Check for Vercel KV env vars first, then fall back to direct Upstash vars
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  try {
    redis = new Redis({ url, token });
    return redis;
  } catch (error) {
    console.error("[RateLimit] Failed to connect to Upstash Redis:", error);
    return null;
  }
}

/**
 * Get or create Upstash rate limiter for an endpoint
 */
function getUpstashRatelimiter(endpoint: string, config: RateLimitConfig): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  const key = `${endpoint}:${config.maxRequests}:${config.windowMs}`;

  if (upstashRatelimiters.has(key)) {
    return upstashRatelimiters.get(key)!;
  }

  // Convert windowMs to seconds for Upstash
  const windowSeconds = Math.ceil(config.windowMs / 1000);

  const limiter = new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(config.maxRequests, `${windowSeconds} s`),
    prefix: `ratelimit:${endpoint}`,
    analytics: true, // Enable analytics for monitoring
  });

  upstashRatelimiters.set(key, limiter);
  return limiter;
}

// ============================================================================
// In-Memory Fallback (Development)
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const inMemoryStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of inMemoryStore.entries()) {
      if (entry.resetTime < now) {
        inMemoryStore.delete(key);
      }
    }
  }, 60000); // Clean up every minute
}

/**
 * In-memory rate limiting (fallback for local dev)
 */
function inMemoryRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${endpoint}:${identifier}`;
  const now = Date.now();

  let entry = inMemoryStore.get(key);

  // If no entry or window expired, create new entry
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    inMemoryStore.set(key, entry);

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;
  inMemoryStore.set(key, entry);

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const success = entry.count <= config.maxRequests;

  return {
    success,
    limit: config.maxRequests,
    remaining,
    reset: entry.resetTime,
  };
}

// ============================================================================
// Public API
// ============================================================================

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit for a request
 *
 * @param identifier - Unique identifier (IP or user ID)
 * @param endpoint - Endpoint name for config lookup
 * @param customConfig - Optional custom config override
 * @returns Rate limit result
 */
export async function rateLimit(
  identifier: string,
  endpoint: string,
  customConfig?: RateLimitConfig
): Promise<RateLimitResult> {
  const config = customConfig || defaultConfigs[endpoint] || defaultConfigs.api;

  // Try Upstash Redis first (production)
  const upstashLimiter = getUpstashRatelimiter(endpoint, config);

  if (upstashLimiter) {
    try {
      const result = await upstashLimiter.limit(identifier);

      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch (error) {
      console.error("[RateLimit] Upstash error, falling back to in-memory:", error);
      // Fall through to in-memory
    }
  }

  // Fallback to in-memory (development or if Redis fails)
  return inMemoryRateLimit(identifier, endpoint, config);
}

/**
 * Synchronous rate limit check (for backwards compatibility)
 * Uses in-memory only - prefer async version for production
 */
export function rateLimitSync(
  identifier: string,
  endpoint: string,
  customConfig?: RateLimitConfig
): RateLimitResult {
  const config = customConfig || defaultConfigs[endpoint] || defaultConfigs.api;
  return inMemoryRateLimit(identifier, endpoint, config);
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP from various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  const vercelIp = request.headers.get("x-vercel-forwarded-for");

  const ip = cfConnectingIp || vercelIp || realIp || forwarded?.split(",")[0].trim() || "unknown";
  return `ip:${ip}`;
}

/**
 * Create rate limit exceeded response
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: "Too many requests. Please try again later.",
      retryAfter: Math.max(1, retryAfter),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
        "Retry-After": Math.max(1, retryAfter).toString(),
      },
    }
  );
}

/**
 * Check if Upstash Redis is configured
 */
export function isRedisConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}
