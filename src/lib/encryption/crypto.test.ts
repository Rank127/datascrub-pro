import { describe, it, expect, beforeAll } from "vitest";
import {
  encrypt,
  decrypt,
  safeDecrypt,
  hashSSN,
  hashData,
  maskEmail,
  maskPhone,
  maskSSN,
  maskName,
  maskAddress,
  encryptArray,
  decryptArray,
  encryptObject,
  decryptObject,
} from "./crypto";

beforeAll(() => {
  // Set a test encryption key (64-char hex)
  process.env.ENCRYPTION_KEY =
    "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2";
});

// ============================
// Encrypt / Decrypt
// ============================

describe("encrypt and decrypt", () => {
  it("roundtrips a simple string", () => {
    const plain = "hello world";
    const encrypted = encrypt(plain);
    expect(encrypted).not.toBe(plain);
    expect(decrypt(encrypted)).toBe(plain);
  });

  it("handles empty string", () => {
    expect(encrypt("")).toBe("");
    expect(decrypt("")).toBe("");
  });

  it("handles unicode characters", () => {
    const plain = "日本語テスト 🔐";
    expect(decrypt(encrypt(plain))).toBe(plain);
  });

  it("produces different ciphertext each time (random IV)", () => {
    const plain = "same input";
    const a = encrypt(plain);
    const b = encrypt(plain);
    expect(a).not.toBe(b);
    // Both still decrypt to the same value
    expect(decrypt(a)).toBe(plain);
    expect(decrypt(b)).toBe(plain);
  });

  it("rejects tampered ciphertext", () => {
    const encrypted = encrypt("secret");
    const tampered = encrypted.slice(0, -4) + "ffff";
    expect(() => decrypt(tampered)).toThrow();
  });
});

describe("safeDecrypt", () => {
  it("decrypts valid ciphertext", () => {
    const encrypted = encrypt("test");
    expect(safeDecrypt(encrypted)).toBe("test");
  });

  it("returns original for invalid ciphertext (legacy data)", () => {
    expect(safeDecrypt("plain text")).toBe("plain text");
  });

  it("returns empty string for null/undefined", () => {
    expect(safeDecrypt(null)).toBe("");
    expect(safeDecrypt(undefined)).toBe("");
    expect(safeDecrypt("")).toBe("");
  });
});

// ============================
// Hashing
// ============================

describe("hashSSN", () => {
  it("produces consistent hash for same input", () => {
    expect(hashSSN("123-45-6789")).toBe(hashSSN("123-45-6789"));
  });

  it("produces different hash for different input", () => {
    expect(hashSSN("123-45-6789")).not.toBe(hashSSN("987-65-4321"));
  });

  it("produces 64-char hex string", () => {
    expect(hashSSN("123-45-6789")).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("hashData", () => {
  it("produces consistent hash", () => {
    expect(hashData("test@email.com")).toBe(hashData("test@email.com"));
  });

  it("produces different hash for different data", () => {
    expect(hashData("a")).not.toBe(hashData("b"));
  });
});

// ============================
// Array / Object encrypt/decrypt
// ============================

describe("encryptArray / decryptArray", () => {
  it("roundtrips an array of strings", () => {
    const arr = ["email1@test.com", "email2@test.com"];
    const encrypted = encryptArray(arr);
    expect(decryptArray(encrypted)).toEqual(arr);
  });

  it("returns empty array for empty input", () => {
    expect(decryptArray("")).toEqual([]);
  });

  it("returns empty array for invalid data", () => {
    expect(decryptArray("not-encrypted")).toEqual([]);
  });
});

describe("encryptObject / decryptObject", () => {
  it("roundtrips an object", () => {
    const obj = { street: "123 Main St", city: "Springfield" };
    const encrypted = encryptObject(obj);
    expect(decryptObject(encrypted)).toEqual(obj);
  });

  it("returns null for empty input", () => {
    expect(decryptObject("")).toBeNull();
  });

  it("returns null for invalid data", () => {
    expect(decryptObject("garbage")).toBeNull();
  });
});

// ============================
// Masking functions
// ============================

describe("maskEmail", () => {
  it("masks local part keeping first and last char", () => {
    const masked = maskEmail("john.doe@example.com");
    expect(masked).toBe("j******e@example.com");
  });

  it("masks short local part", () => {
    const masked = maskEmail("ab@example.com");
    expect(masked).toBe("**@example.com");
  });

  it("returns input for non-email", () => {
    expect(maskEmail("noemail")).toBe("noemail");
  });
});

describe("maskPhone", () => {
  it("shows only last 4 digits", () => {
    const masked = maskPhone("+15551234567");
    expect(masked).toContain("4567");
    expect(masked).toContain("*");
  });

  it("handles short numbers", () => {
    expect(maskPhone("123")).toBe("***");
  });
});

describe("maskSSN", () => {
  it("shows only last 4 digits in XXX-XX-XXXX format", () => {
    expect(maskSSN("123-45-6789")).toBe("***-**-6789");
  });

  it("handles unformatted input", () => {
    expect(maskSSN("123456789")).toBe("***-**-6789");
  });
});

describe("maskName", () => {
  it("masks each word keeping first letter", () => {
    expect(maskName("John Doe")).toBe("J*** D**");
  });

  it("handles single character names", () => {
    expect(maskName("A B")).toBe("* *");
  });
});

describe("maskAddress", () => {
  it("masks street number and partial street name", () => {
    const masked = maskAddress("123 Main Street Springfield IL");
    expect(masked.startsWith("***")).toBe(true);
    // City and state should be preserved
    expect(masked).toContain("Springfield");
    expect(masked).toContain("IL");
  });

  it("fully masks short addresses", () => {
    const masked = maskAddress("PO Box");
    expect(masked).toBe("******");
  });
});
