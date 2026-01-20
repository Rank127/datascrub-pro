import type { Scanner, ScanInput, ScanResult } from "./base-scanner";
import { MockDataBrokerScanner } from "./data-brokers/mock-broker-scanner";
import { HaveIBeenPwnedScanner } from "./breaches/haveibeenpwned";
import { DarkWebScanner } from "./dark-web/monitor";
import { SocialMediaScanner } from "./social/social-scanner";
import type { Plan, ScanType } from "@/lib/types";

export interface ScanProgress {
  currentScanner: string;
  scannersCompleted: number;
  totalScanners: number;
  resultsFound: number;
  progress: number; // 0-100
}

export interface ScanOptions {
  type: ScanType;
  userPlan: Plan;
  onProgress?: (progress: ScanProgress) => void;
}

export class ScanOrchestrator {
  private scanners: Scanner[] = [];

  constructor(options: ScanOptions) {
    this.initializeScanners(options);
  }

  private initializeScanners(options: ScanOptions) {
    const { type, userPlan } = options;

    // Always include breach scanners
    this.scanners.push(new HaveIBeenPwnedScanner());

    // Quick scan only checks breaches
    if (type === "QUICK") {
      return;
    }

    // Full scan includes data brokers
    if (type === "FULL" || type === "MONITORING") {
      // Add data broker scanners
      this.scanners.push(...MockDataBrokerScanner.createAll());

      // Add social media scanner
      this.scanners.push(new SocialMediaScanner());
    }

    // Dark web monitoring for Enterprise only
    if (userPlan === "ENTERPRISE") {
      this.scanners.push(new DarkWebScanner(true));
    }
  }

  async runScan(
    input: ScanInput,
    onProgress?: (progress: ScanProgress) => void
  ): Promise<ScanResult[]> {
    const allResults: ScanResult[] = [];
    const totalScanners = this.scanners.length;

    for (let i = 0; i < this.scanners.length; i++) {
      const scanner = this.scanners[i];

      // Check if scanner is available
      const isAvailable = await scanner.isAvailable();
      if (!isAvailable) {
        continue;
      }

      // Report progress
      if (onProgress) {
        onProgress({
          currentScanner: scanner.name,
          scannersCompleted: i,
          totalScanners,
          resultsFound: allResults.length,
          progress: Math.round((i / totalScanners) * 100),
        });
      }

      try {
        const results = await scanner.scan(input);
        allResults.push(...results);
      } catch (error) {
        console.error(`Scanner ${scanner.name} failed:`, error);
        // Continue with other scanners
      }
    }

    // Final progress update
    if (onProgress) {
      onProgress({
        currentScanner: "Complete",
        scannersCompleted: totalScanners,
        totalScanners,
        resultsFound: allResults.length,
        progress: 100,
      });
    }

    return allResults;
  }

  getScannerCount(): number {
    return this.scanners.length;
  }

  getScannerNames(): string[] {
    return this.scanners.map((s) => s.name);
  }
}

// Helper to convert encrypted profile to scan input
export async function prepareProfileForScan(
  profile: {
    fullName?: string | null;
    aliases?: string | null;
    emails?: string | null;
    phones?: string | null;
    addresses?: string | null;
    dateOfBirth?: string | null;
    ssnHash?: string | null;
    usernames?: string | null;
  },
  decryptFn: (encrypted: string) => string
): Promise<ScanInput> {
  return {
    fullName: profile.fullName || undefined,
    aliases: profile.aliases
      ? JSON.parse(decryptFn(profile.aliases))
      : undefined,
    emails: profile.emails ? JSON.parse(decryptFn(profile.emails)) : undefined,
    phones: profile.phones ? JSON.parse(decryptFn(profile.phones)) : undefined,
    addresses: profile.addresses
      ? JSON.parse(decryptFn(profile.addresses))
      : undefined,
    dateOfBirth: profile.dateOfBirth
      ? decryptFn(profile.dateOfBirth)
      : undefined,
    ssnHash: profile.ssnHash || undefined,
    usernames: profile.usernames
      ? JSON.parse(decryptFn(profile.usernames))
      : undefined,
  };
}
