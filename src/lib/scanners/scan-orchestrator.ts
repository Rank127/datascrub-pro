import type { Scanner, ScanInput, ScanResult } from "./base-scanner";
import { MockDataBrokerScanner } from "./data-brokers/mock-broker-scanner";
import { createRealBrokerScanners } from "./data-brokers";
import { HaveIBeenPwnedScanner } from "./breaches/haveibeenpwned";
import { DarkWebScanner } from "./dark-web/monitor";
import { SocialMediaScanner } from "./social/social-scanner";
import type { Plan, ScanType } from "@/lib/types";

// Configuration: Set to true to use real data broker scanners
// Set via environment variable or default to true for production
const USE_REAL_SCANNERS = process.env.USE_MOCK_SCANNERS !== "true";

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
      // Add data broker scanners - use real or mock based on configuration
      if (USE_REAL_SCANNERS) {
        const realScanners = createRealBrokerScanners();
        console.log(`[ScanOrchestrator] Using REAL data broker scanners (${realScanners.length} scanners)`);
        console.log(`[ScanOrchestrator] Scanners: ${realScanners.map(s => s.name).join(", ")}`);
        this.scanners.push(...realScanners);
      } else {
        console.log("[ScanOrchestrator] Using MOCK data broker scanners");
        this.scanners.push(...MockDataBrokerScanner.createAll());
      }

      // Add social media scanner (still mock for now)
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
    const totalScanners = this.scanners.length;
    console.log(`[ScanOrchestrator] Starting scan with ${totalScanners} scanners`);

    // Initial progress
    if (onProgress) {
      onProgress({
        currentScanner: "Starting scanners...",
        scannersCompleted: 0,
        totalScanners,
        resultsFound: 0,
        progress: 0,
      });
    }

    const allResults: ScanResult[] = [];

    // ScrapingBee has max concurrency of 5, so batch data broker scanners
    // Separate scanners into batches to avoid hitting rate limits
    const BATCH_SIZE = 4; // Stay under ScrapingBee's limit of 5

    // Helper to run a single scanner
    const runScanner = async (scanner: Scanner): Promise<ScanResult[]> => {
      const isAvailable = await scanner.isAvailable();
      if (!isAvailable) {
        console.log(`[ScanOrchestrator] ${scanner.name} not available, skipping`);
        return [];
      }

      console.log(`[ScanOrchestrator] Starting ${scanner.name}...`);
      try {
        const results = await scanner.scan(input);
        console.log(`[ScanOrchestrator] ${scanner.name} completed with ${results.length} results`);
        return results;
      } catch (error) {
        console.error(`[ScanOrchestrator] ${scanner.name} failed:`, error);
        return [];
      }
    };

    // Process scanners in batches
    for (let i = 0; i < this.scanners.length; i += BATCH_SIZE) {
      const batch = this.scanners.slice(i, i + BATCH_SIZE);
      console.log(`[ScanOrchestrator] Running batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.map(s => s.name).join(", ")}`);

      const batchPromises = batch.map(scanner => runScanner(scanner));
      const batchResults = await Promise.allSettled(batchPromises);

      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          allResults.push(...result.value);
        }
      }

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < this.scanners.length) {
        console.log(`[ScanOrchestrator] Waiting 1s before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`[ScanOrchestrator] All scanners complete. Total results: ${allResults.length}`);

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

// Helper to safely decrypt and parse JSON
function safeDecryptAndParse<T>(
  encrypted: string | null | undefined,
  decryptFn: (encrypted: string) => string
): T | undefined {
  if (!encrypted) return undefined;

  try {
    // Try to decrypt first
    const decrypted = decryptFn(encrypted);
    return JSON.parse(decrypted) as T;
  } catch {
    // If decryption fails, try parsing as plain JSON (legacy data)
    try {
      return JSON.parse(encrypted) as T;
    } catch {
      return undefined;
    }
  }
}

// Helper to safely decrypt a string
function safeDecrypt(
  encrypted: string | null | undefined,
  decryptFn: (encrypted: string) => string
): string | undefined {
  if (!encrypted) return undefined;

  try {
    return decryptFn(encrypted);
  } catch {
    // Return as-is if decryption fails (legacy unencrypted data)
    return encrypted;
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
    aliases: safeDecryptAndParse<string[]>(profile.aliases, decryptFn),
    emails: safeDecryptAndParse<string[]>(profile.emails, decryptFn),
    phones: safeDecryptAndParse<string[]>(profile.phones, decryptFn),
    addresses: safeDecryptAndParse<Array<{ street: string; city: string; state: string; zipCode: string; country: string }>>(
      profile.addresses,
      decryptFn
    ),
    dateOfBirth: safeDecrypt(profile.dateOfBirth, decryptFn),
    ssnHash: profile.ssnHash || undefined,
    usernames: safeDecryptAndParse<string[]>(profile.usernames, decryptFn),
  };
}
