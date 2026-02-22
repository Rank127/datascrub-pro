import type { DataSource, ExposureType, Severity } from "@/lib/types";

// ============================================================================
// CONFIDENCE SCORING SYSTEM
// Prevents false positives and blocks auto-removals for uncertain matches
// ============================================================================

export interface ConfidenceFactors {
  nameMatch: number;       // 0-35: Exact=35, First+Last=30, Alias=28, Partial=20, LastOnly=15, Fuzzy=10
  locationMatch: number;   // 0-30: City+State=30, State=18, City-only=10
  ageMatch: number;        // 0-25: Exact=25, ±2yr=18, ±5yr=12, ±10yr=5
  dataCorrelation: number; // 0-10: Phone partial=5, Email domain=5 (exact matches caught in Tier 1)
  sourceReliability: number; // DEPRECATED — always 0, kept for schema compatibility
  projectionSource?: string;   // Source broker key for PROJECTED exposures
  projectionWeight?: number;   // Relationship weight used for projection (0-1)
}

export type MatchClassification =
  | "CONFIRMED"   // 75-100: Auto-removal OK (or any Tier 1 deterministic match)
  | "LIKELY"      // 50-74: Auto-removal with caution
  | "POSSIBLE"    // 25-49: Manual review required
  | "REJECTED"    // 0-24: Don't create exposure
  | "PROJECTED"   // Projected from confirmed exposure on related broker
  | "CHECKING";   // User should verify — broker in same category as confirmed exposure

export const CONFIDENCE_THRESHOLDS = {
  AUTO_PROCEED: 75,   // Minimum score for auto-removal without confirmation (lowered: Tier 2 realistic max ~80)
  DISPLAY: 50,        // Show to user, require confirmation before removal
  MANUAL_REVIEW: 40,  // Below this requires manual review
  REJECT: 25,         // Below this don't create exposure at all
  MIN_FACTORS: 2,     // Minimum number of matching factors required (1 for people-search brokers)
} as const;

export interface ConfidenceResult {
  score: number;
  classification: MatchClassification;
  factors: ConfidenceFactors;
  reasoning: string[];
  validatedAt: Date;
}

/**
 * Classify a confidence score into a match classification
 */
export function classifyConfidence(score: number): MatchClassification {
  if (score >= 75) return "CONFIRMED";
  if (score >= 50) return "LIKELY";
  if (score >= 25) return "POSSIBLE";
  return "REJECTED";
}

// ============================================================================
// SCAN INPUT/OUTPUT TYPES
// ============================================================================

export interface ScanInput {
  fullName?: string;
  aliases?: string[];
  emails?: string[];
  phones?: string[];
  addresses?: Array<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>;
  dateOfBirth?: string;
  ssnHash?: string;
  usernames?: string[];
}

export interface ScanResult {
  source: DataSource;
  sourceName: string;
  sourceUrl?: string;
  dataType: ExposureType;
  dataPreview?: string;
  severity: Severity;
  rawData?: Record<string, unknown>;
  confidence?: ConfidenceResult;
}

export interface Scanner {
  name: string;
  source: DataSource;
  isAvailable(): Promise<boolean>;
  scan(input: ScanInput): Promise<ScanResult[]>;
}

export abstract class BaseScanner implements Scanner {
  abstract name: string;
  abstract source: DataSource;

  async isAvailable(): Promise<boolean> {
    return true;
  }

  abstract scan(input: ScanInput): Promise<ScanResult[]>;

  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected calculateSeverity(dataTypes: ExposureType[]): Severity {
    const criticalTypes: ExposureType[] = ["SSN", "FINANCIAL"];
    const highTypes: ExposureType[] = ["COMBINED_PROFILE", "DOB", "ADDRESS"];
    const mediumTypes: ExposureType[] = ["PHONE", "EMAIL"];

    if (dataTypes.some((t) => criticalTypes.includes(t))) return "CRITICAL";
    if (dataTypes.some((t) => highTypes.includes(t))) return "HIGH";
    if (dataTypes.some((t) => mediumTypes.includes(t))) return "MEDIUM";
    return "LOW";
  }

  protected maskData(data: string, type: ExposureType): string {
    switch (type) {
      case "EMAIL": {
        const [local, domain] = data.split("@");
        if (!domain) return "****";
        const maskedLocal =
          local.length <= 2
            ? "*".repeat(local.length)
            : local[0] + "*".repeat(local.length - 2) + local[local.length - 1];
        return `${maskedLocal}@${domain}`;
      }
      case "PHONE": {
        const digits = data.replace(/\D/g, "");
        return "*".repeat(digits.length - 4) + digits.slice(-4);
      }
      case "SSN":
        return "***-**-" + data.slice(-4);
      case "NAME": {
        const parts = data.split(" ");
        return parts
          .map((p) => (p.length <= 1 ? "*" : p[0] + "*".repeat(p.length - 1)))
          .join(" ");
      }
      case "ADDRESS": {
        const parts = data.split(" ");
        if (parts.length <= 2) return "*".repeat(data.length);
        return parts
          .map((part, index) => {
            if (index === 0) return "*".repeat(part.length);
            if (index === parts.length - 1 || index === parts.length - 2)
              return part;
            return part[0] + "*".repeat(Math.max(0, part.length - 1));
          })
          .join(" ");
      }
      default:
        return data.length <= 4
          ? "*".repeat(data.length)
          : data.slice(0, 2) + "*".repeat(data.length - 4) + data.slice(-2);
    }
  }
}
