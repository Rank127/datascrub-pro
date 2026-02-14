import { describe, it, expect } from "vitest";
import {
  maskEmail,
  maskPhone,
  maskName,
  maskAddress,
  maskDateOfBirth,
  maskSSN,
  maskUsername,
  maskUrl,
  maskId,
  maskUserProfile,
  maskUserListItem,
  shouldMaskField,
} from "./pii-masking";

// ============================
// maskEmail
// ============================

describe("maskEmail", () => {
  it("masks local and domain parts", () => {
    expect(maskEmail("john.doe@example.com")).toBe("j***e@e***.com");
  });

  it("handles short local part (<=2 chars)", () => {
    const result = maskEmail("ab@test.com");
    expect(result).toBe("a***@t***.com");
  });

  it("returns placeholder for null/undefined", () => {
    expect(maskEmail(null)).toBe("***@***.***");
    expect(maskEmail(undefined)).toBe("***@***.***");
  });

  it("returns placeholder for invalid email (no @)", () => {
    expect(maskEmail("noemail")).toBe("***@***.***");
  });
});

// ============================
// maskPhone
// ============================

describe("maskPhone", () => {
  it("shows only last 4 digits", () => {
    // + is preserved, only digits get masked
    expect(maskPhone("+15551234567")).toBe("+*******4567");
  });

  it("returns placeholder for null", () => {
    expect(maskPhone(null)).toBe("***-***-****");
  });

  it("handles short numbers", () => {
    expect(maskPhone("123")).toBe("***-****");
  });

  it("strips formatting characters", () => {
    const result = maskPhone("(555) 123-4567");
    expect(result).toContain("4567");
  });
});

// ============================
// maskName
// ============================

describe("maskName", () => {
  it("masks each word keeping first letter", () => {
    expect(maskName("John Doe")).toBe("J*** D**");
  });

  it("handles single-char names", () => {
    expect(maskName("A")).toBe("*");
  });

  it("returns placeholder for null", () => {
    expect(maskName(null)).toBe("***");
  });

  it("limits mask to 3 asterisks per word", () => {
    // "Jonathan" has 8 chars, but mask should be max 3 *s
    expect(maskName("Jonathan")).toBe("J***");
  });
});

// ============================
// maskDateOfBirth
// ============================

describe("maskDateOfBirth", () => {
  it("keeps only the day", () => {
    // Use a date format that avoids timezone issues
    const result = maskDateOfBirth("1990-05-15");
    expect(result).toMatch(/^\*{4}-\*{2}-\d{2}$/);
  });

  it("returns placeholder for null", () => {
    expect(maskDateOfBirth(null)).toBe("****-**-**");
  });

  it("returns placeholder for invalid date", () => {
    expect(maskDateOfBirth("not-a-date")).toBe("****-**-**");
  });
});

// ============================
// maskSSN
// ============================

describe("maskSSN", () => {
  it("shows only last 4 digits", () => {
    expect(maskSSN("123-45-6789")).toBe("***-**-6789");
  });

  it("handles unformatted input", () => {
    expect(maskSSN("123456789")).toBe("***-**-6789");
  });

  it("returns placeholder for null", () => {
    expect(maskSSN(null)).toBe("***-**-****");
  });

  it("handles short input", () => {
    expect(maskSSN("12")).toBe("***-**-****");
  });
});

// ============================
// maskUsername
// ============================

describe("maskUsername", () => {
  it("shows first 2 and last 2 for long usernames", () => {
    expect(maskUsername("johndoe123")).toBe("jo***23");
  });

  it("handles short usernames (<=4 chars)", () => {
    expect(maskUsername("joe")).toBe("j**");
  });

  it("returns placeholder for null", () => {
    expect(maskUsername(null)).toBe("***");
  });
});

// ============================
// maskUrl
// ============================

describe("maskUrl", () => {
  it("keeps hostname, masks path", () => {
    expect(maskUrl("https://example.com/users/123")).toBe(
      "https://example.com/***"
    );
  });

  it("returns placeholder for null", () => {
    expect(maskUrl(null)).toBe("https://***.***");
  });

  it("returns placeholder for invalid URL", () => {
    expect(maskUrl("not a url")).toBe("https://***.***");
  });
});

// ============================
// maskId
// ============================

describe("maskId", () => {
  it("shows first 4 and last 4 for long IDs", () => {
    expect(maskId("cuid1234567890")).toBe("cuid***7890");
  });

  it("shows first 2 for short IDs", () => {
    expect(maskId("abc123")).toBe("ab***");
  });

  it("returns placeholder for null", () => {
    expect(maskId(null)).toBe("***");
  });
});

// ============================
// maskUserProfile
// ============================

describe("maskUserProfile", () => {
  it("masks all PII fields in a profile", () => {
    const profile = {
      id: "test-id",
      email: "john@example.com",
      name: "John Doe",
      fullName: "John Michael Doe",
      dateOfBirth: "1990-05-15",
    };

    const masked = maskUserProfile(profile);
    expect(masked.id).toBe("test-id"); // ID preserved
    expect(masked.email).not.toBe("john@example.com");
    expect(masked.name).not.toBe("John Doe");
    expect(masked.dateOfBirth).toMatch(/^\*{4}-\*{2}-\d{2}$/);
  });

  it("handles JSON array fields (emails, phones)", () => {
    const profile = {
      emails: JSON.stringify(["a@test.com", "b@test.com"]),
      phones: JSON.stringify(["+15551234567"]),
    };

    const masked = maskUserProfile(profile);
    expect(masked.emails).toHaveLength(2);
    expect(masked.phones).toHaveLength(1);
    expect(masked.emails![0]).toContain("***");
  });

  it("handles invalid JSON gracefully", () => {
    const profile = {
      emails: "not-json",
      phones: "{invalid}",
    };

    const masked = maskUserProfile(profile);
    expect(masked.emails).toEqual([]);
    expect(masked.phones).toEqual([]);
  });
});

// ============================
// maskUserListItem
// ============================

describe("maskUserListItem", () => {
  it("masks email and name, preserves other fields", () => {
    const user = {
      id: "abc123",
      email: "john@example.com",
      name: "John Doe",
      role: "USER",
      plan: "PRO",
      createdAt: new Date("2024-01-01"),
    };

    const masked = maskUserListItem(user);
    expect(masked.id).toBe("abc123");
    expect(masked.role).toBe("USER");
    expect(masked.plan).toBe("PRO");
    expect(masked.email).not.toBe("john@example.com");
    expect(masked.name).not.toBe("John Doe");
  });
});

// ============================
// shouldMaskField
// ============================

describe("shouldMaskField", () => {
  it("never masks own data", () => {
    expect(shouldMaskField("email", "USER", true)).toBe(false);
    expect(shouldMaskField("ssn", "USER", true)).toBe(false);
  });

  it("SUPER_ADMIN can see all unmasked PII", () => {
    expect(shouldMaskField("email", "SUPER_ADMIN", false)).toBe(false);
    expect(shouldMaskField("ssn", "SUPER_ADMIN", false)).toBe(false);
  });

  it("LEGAL can see all unmasked PII", () => {
    expect(shouldMaskField("email", "LEGAL", false)).toBe(false);
  });

  it("ADMIN sees masked PII for other users", () => {
    expect(shouldMaskField("email", "ADMIN", false)).toBe(true);
    expect(shouldMaskField("name", "ADMIN", false)).toBe(true);
    expect(shouldMaskField("phones", "ADMIN", false)).toBe(true);
  });

  it("non-PII fields are never masked", () => {
    expect(shouldMaskField("plan", "ADMIN", false)).toBe(false);
    expect(shouldMaskField("role", "USER", false)).toBe(false);
    expect(shouldMaskField("createdAt", "SUPPORT", false)).toBe(false);
  });
});
