import { describe, it, expect } from "vitest";
import {
  rateLimitSync,
  getClientIdentifier,
  isRedisConfigured,
} from "./rate-limit";

// ============================
// rateLimitSync (in-memory)
// ============================

describe("rateLimitSync", () => {
  it("allows requests within limit", () => {
    const result = rateLimitSync("test-user-1", "test-endpoint-1", {
      maxRequests: 5,
      windowMs: 60000,
    });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.limit).toBe(5);
  });

  it("decrements remaining on successive calls", () => {
    const config = { maxRequests: 3, windowMs: 60000 };
    const r1 = rateLimitSync("test-user-2", "test-endpoint-2", config);
    const r2 = rateLimitSync("test-user-2", "test-endpoint-2", config);
    const r3 = rateLimitSync("test-user-2", "test-endpoint-2", config);

    expect(r1.remaining).toBe(2);
    expect(r2.remaining).toBe(1);
    expect(r3.remaining).toBe(0);
    expect(r3.success).toBe(true);
  });

  it("blocks after limit exceeded", () => {
    const config = { maxRequests: 2, windowMs: 60000 };
    rateLimitSync("test-user-3", "test-endpoint-3", config);
    rateLimitSync("test-user-3", "test-endpoint-3", config);
    const r3 = rateLimitSync("test-user-3", "test-endpoint-3", config);

    expect(r3.success).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("isolates different identifiers", () => {
    const config = { maxRequests: 1, windowMs: 60000 };
    const r1 = rateLimitSync("user-a", "test-endpoint-4", config);
    const r2 = rateLimitSync("user-b", "test-endpoint-4", config);

    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });

  it("isolates different endpoints", () => {
    const config = { maxRequests: 1, windowMs: 60000 };
    const r1 = rateLimitSync("user-c", "endpoint-a", config);
    const r2 = rateLimitSync("user-c", "endpoint-b", config);

    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });

  it("includes reset timestamp in response", () => {
    const result = rateLimitSync("test-user-5", "test-endpoint-5", {
      maxRequests: 5,
      windowMs: 60000,
    });
    expect(result.reset).toBeGreaterThan(Date.now());
  });
});

// ============================
// getClientIdentifier
// ============================

describe("getClientIdentifier", () => {
  it("returns user-based identifier when userId provided", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.2.3.4" },
    });
    expect(getClientIdentifier(request, "user-123")).toBe("user:user-123");
  });

  it("falls back to IP from x-forwarded-for", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIdentifier(request)).toBe("ip:1.2.3.4");
  });

  it("prefers cf-connecting-ip over x-forwarded-for", () => {
    const request = new Request("https://example.com", {
      headers: {
        "cf-connecting-ip": "10.0.0.1",
        "x-forwarded-for": "1.2.3.4",
      },
    });
    expect(getClientIdentifier(request)).toBe("ip:10.0.0.1");
  });

  it("returns unknown when no IP headers present", () => {
    const request = new Request("https://example.com");
    expect(getClientIdentifier(request)).toBe("ip:unknown");
  });
});

// ============================
// isRedisConfigured
// ============================

describe("isRedisConfigured", () => {
  it("returns false when env vars not set", () => {
    // In test env, these should not be set
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    expect(isRedisConfigured()).toBe(false);
  });
});
