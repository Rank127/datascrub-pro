import type { DataSource, ExposureType, Severity } from "@/lib/types";

// ============================================================================
// CONFIDENCE SCORING SYSTEM
// Prevents false positives and blocks auto-removals for uncertain matches
// ============================================================================

export interface ConfidenceFactors {
  nameMatch: number;       // 0-30: Exact=30, First+Last=28, Partial=15, Fuzzy=10
  locationMatch: number;   // 0-25: City+State=25, State only=15
  ageMatch: number;        // 0-20: Exact=20, ±2 years=15, ±5 years=10
  dataCorrelation: number; // 0-15: Phone match=5, Email match=5
  sourceReliability: number; // 0-10: Known broker=10, Unknown=7
}

export type MatchClassification =
  | "CONFIRMED"   // 80-100: Auto-removal OK
  | "LIKELY"      // 60-79: Auto-removal with caution
  | "POSSIBLE"    // 40-59: Manual review required
  | "UNLIKELY"    // 20-39: Manual review, likely false positive
  | "REJECTED";   // 0-19: Don't create exposure

export const CONFIDENCE_THRESHOLDS = {
  AUTO_PROCEED: 80,   // Minimum score for auto-removal without confirmation
  MANUAL_REVIEW: 40,  // Below this requires manual review
  REJECT: 20,         // Below this don't create exposure at all
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
  if (score >= 80) return "CONFIRMED";
  if (score >= 60) return "LIKELY";
  if (score >= 40) return "POSSIBLE";
  if (score >= 20) return "UNLIKELY";
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
