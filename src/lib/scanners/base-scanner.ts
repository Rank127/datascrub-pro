import type { DataSource, ExposureType, Severity } from "@/lib/types";

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
