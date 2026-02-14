/**
 * Shared Upstash Redis client
 *
 * Used for circuit breaker state, event deduplication, and issue deduplication.
 * Falls back gracefully when Redis is unavailable.
 */

import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
let connectionAttempted = false;

/**
 * Get shared Redis instance. Returns null if not configured.
 */
export function getRedisClient(): Redis | null {
  if (redis) return redis;
  if (connectionAttempted) return null;

  connectionAttempted = true;

  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  try {
    redis = new Redis({ url, token });
    return redis;
  } catch (error) {
    console.error("[RedisClient] Failed to connect:", error);
    return null;
  }
}

// Key prefix constants
export const REDIS_PREFIX = {
  CIRCUIT_BREAKER: "cb:",
  ISSUE_DEDUP: "dedup:issue:",
  EVENT_DEDUP: "dedup:event:",
} as const;
