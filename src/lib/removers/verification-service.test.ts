import { describe, it, expect } from "vitest";
import {
  canVerifySource,
  calculateVerifyAfterDate,
} from "./verification-service";

describe("canVerifySource", () => {
  it("returns true for SPOKEO", () => {
    expect(canVerifySource("SPOKEO")).toBe(true);
  });

  it("returns true for breach databases", () => {
    expect(canVerifySource("HAVEIBEENPWNED")).toBe(true);
    expect(canVerifySource("LEAKCHECK")).toBe(true);
  });

  it("returns true for data brokers with scrapers", () => {
    expect(canVerifySource("WHITEPAGES")).toBe(true);
    expect(canVerifySource("BEENVERIFIED")).toBe(true);
    expect(canVerifySource("TRUEPEOPLESEARCH")).toBe(true);
  });

  it("returns false for unknown sources", () => {
    expect(canVerifySource("UNKNOWN_BROKER")).toBe(false);
    expect(canVerifySource("")).toBe(false);
  });

  it("returns false for social media", () => {
    // Social media is in VERIFICATION_DELAYS but not VERIFIABLE_SOURCES
    expect(canVerifySource("FACEBOOK")).toBe(false);
    expect(canVerifySource("LINKEDIN")).toBe(false);
  });
});

describe("calculateVerifyAfterDate", () => {
  const baseDate = new Date("2026-01-01T00:00:00Z");

  it("returns 3 days for fast brokers", () => {
    const result = calculateVerifyAfterDate("TRUEPEOPLESEARCH", baseDate);
    expect(result.toISOString()).toBe("2026-01-04T00:00:00.000Z");
  });

  it("returns 7 days for SPOKEO", () => {
    const result = calculateVerifyAfterDate("SPOKEO", baseDate);
    expect(result.toISOString()).toBe("2026-01-08T00:00:00.000Z");
  });

  it("returns 14 days for slow brokers", () => {
    const result = calculateVerifyAfterDate("BEENVERIFIED", baseDate);
    expect(result.toISOString()).toBe("2026-01-15T00:00:00.000Z");
  });

  it("returns 21 days for RADARIS", () => {
    const result = calculateVerifyAfterDate("RADARIS", baseDate);
    expect(result.toISOString()).toBe("2026-01-22T00:00:00.000Z");
  });

  it("returns 30 days (default) for unknown sources", () => {
    const result = calculateVerifyAfterDate("UNKNOWN_BROKER", baseDate);
    expect(result.toISOString()).toBe("2026-01-31T00:00:00.000Z");
  });

  it("does not mutate the input date", () => {
    const input = new Date("2026-06-15T00:00:00Z");
    const inputCopy = input.getTime();
    calculateVerifyAfterDate("SPOKEO", input);
    expect(input.getTime()).toBe(inputCopy);
  });
});
