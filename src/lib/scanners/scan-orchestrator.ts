import type { Scanner, ScanInput, ScanResult } from "./base-scanner";
import { MockDataBrokerScanner } from "./data-brokers/mock-broker-scanner";
import { createRealBrokerScanners } from "./data-brokers";
import { BaseBrokerScanner } from "./data-brokers/base-broker-scanner";
import { loadDynamicScanners } from "./data-brokers/dynamic-broker-scanner";
import { HaveIBeenPwnedScanner } from "./breaches/haveibeenpwned";
import { DehashedScanner } from "./breaches/dehashed";
import { LeakCheckScanner } from "./breaches/leakcheck";
import { SocialMediaScanner } from "./social/social-scanner";
import { AIProtectionScanner } from "./ai-protection";
import { getBrokerCount } from "../removers/data-broker-directory";
import { projectExposures, type ProjectionStats } from "./exposure-projector";
import type { Plan, ScanType } from "@/lib/types";

// ─── Scanner Outcome Tracking ───

export interface ScannerOutcome {
  scannerName: string;
  scannerType: "STATIC_BROKER" | "DYNAMIC_BROKER" | "BREACH" | "SOCIAL" | "AI_PROTECTION" | "MANUAL_CHECK";
  status: "SUCCESS" | "FAILED" | "TIMEOUT" | "BLOCKED" | "EMPTY" | "SKIPPED";
  errorType?: string;
  errorMessage?: string;
  responseTimeMs: number;
  resultsFound: number;
  httpStatus?: number;
  proxyUsed?: string;
}

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
  private lastProjectionStats: ProjectionStats | null = null;
  private partialResults: ScanResult[] = [];
  private outcomes: ScannerOutcome[] = [];
  private failedScannerCount = 0;

  private constructor() {
    // Use ScanOrchestrator.create() instead
  }

  /**
   * Async factory — loads static + dynamic scanners
   */
  static async create(options: ScanOptions): Promise<ScanOrchestrator> {
    const orchestrator = new ScanOrchestrator();
    await orchestrator.initializeScanners(options);
    return orchestrator;
  }

  private async initializeScanners(options: ScanOptions) {
    const { type, userPlan } = options;

    // HIBP for all users (breach scanning)
    this.scanners.push(new HaveIBeenPwnedScanner());

    // LeakCheck for all paid users (lifetime plan — unlimited queries, 3 RPS)
    if (userPlan === "PRO" || userPlan === "ENTERPRISE") {
      console.log("[ScanOrchestrator] Adding LeakCheck Scanner (paid feature — lifetime plan)");
      this.scanners.push(new LeakCheckScanner());
    }

    // Dehashed - optional paid API for dark web dumps
    this.scanners.push(new DehashedScanner());

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

        // Load dynamic scanners from DB (graceful degradation on failure)
        try {
          const dynamicScanners = await loadDynamicScanners();
          if (dynamicScanners.length > 0) {
            console.log(`[ScanOrchestrator] Loaded ${dynamicScanners.length} dynamic scanners: ${dynamicScanners.map(s => s.name).join(", ")}`);
            this.scanners.push(...dynamicScanners);
          }
        } catch (error) {
          console.error("[ScanOrchestrator] Failed to load dynamic scanners (continuing with static only):", error);
        }
      } else {
        console.log("[ScanOrchestrator] Using MOCK data broker scanners");
        this.scanners.push(...MockDataBrokerScanner.createAll());
      }

      // Social media scanner provides manual check links
      this.scanners.push(new SocialMediaScanner());

      // AI Protection Scanner - Enterprise only feature
      // Scans for AI training datasets, facial recognition databases, and voice cloning services
      if (userPlan === "ENTERPRISE") {
        console.log("[ScanOrchestrator] Adding AI Protection Scanner (Enterprise feature)");
        this.scanners.push(new AIProtectionScanner());
      }
    }
  }

  /** Classify scanner into a type category for health tracking */
  private classifyScannerType(scanner: Scanner): ScannerOutcome["scannerType"] {
    if (scanner instanceof BaseBrokerScanner) return "STATIC_BROKER";
    if (scanner instanceof HaveIBeenPwnedScanner || scanner instanceof DehashedScanner || scanner instanceof LeakCheckScanner) return "BREACH";
    if (scanner instanceof SocialMediaScanner) return "SOCIAL";
    if (scanner instanceof AIProtectionScanner) return "AI_PROTECTION";
    // Check for dynamic broker scanner by duck-typing (has "Dynamic" in name)
    if (scanner.name.startsWith("Dynamic:")) return "DYNAMIC_BROKER";
    // Manual check scanners generate check links
    if (scanner.name.includes("Manual")) return "MANUAL_CHECK";
    return "STATIC_BROKER";
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

    // Helper to run a single scanner with outcome tracking
    const runScanner = async (scanner: Scanner): Promise<ScanResult[]> => {
      const scannerType = this.classifyScannerType(scanner);
      const startTime = Date.now();

      const isAvailable = await scanner.isAvailable();
      if (!isAvailable) {
        console.log(`[ScanOrchestrator] ${scanner.name} not available, skipping`);
        this.outcomes.push({
          scannerName: scanner.name,
          scannerType,
          status: "SKIPPED",
          responseTimeMs: Date.now() - startTime,
          resultsFound: 0,
          proxyUsed: scanner instanceof BaseBrokerScanner ? scanner.getProxyUsed() : undefined,
        });
        return [];
      }

      console.log(`[ScanOrchestrator] Starting ${scanner.name}...`);
      try {
        const results = await scanner.scan(input);
        const responseTimeMs = Date.now() - startTime;
        console.log(`[ScanOrchestrator] ${scanner.name} completed with ${results.length} results`);

        // Determine outcome status
        let status: ScannerOutcome["status"] = results.length > 0 ? "SUCCESS" : "EMPTY";

        // Check if the scanner had a hidden error (returned [] due to catch)
        if (scanner instanceof BaseBrokerScanner) {
          const lastError = scanner.getLastError();
          if (lastError && results.length === 0) {
            // Scanner caught an error and returned [] — classify it
            status = lastError.type === "TIMEOUT" ? "TIMEOUT"
              : lastError.type === "BOT_DETECTION" ? "BLOCKED"
              : "FAILED";

            this.outcomes.push({
              scannerName: scanner.name,
              scannerType,
              status,
              errorType: lastError.type,
              errorMessage: lastError.message.substring(0, 500),
              responseTimeMs,
              resultsFound: 0,
              httpStatus: lastError.httpStatus,
              proxyUsed: scanner.getProxyUsed(),
            });
            return results;
          }
        }

        this.outcomes.push({
          scannerName: scanner.name,
          scannerType,
          status,
          responseTimeMs,
          resultsFound: results.length,
          proxyUsed: scanner instanceof BaseBrokerScanner ? scanner.getProxyUsed() : undefined,
        });
        return results;
      } catch (error) {
        const responseTimeMs = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[ScanOrchestrator] ${scanner.name} failed:`, error);

        // Categorize the error
        let errorType = "UNKNOWN";
        let status: ScannerOutcome["status"] = "FAILED";
        if (errorMessage.includes("403") || errorMessage.toLowerCase().includes("access denied")) {
          errorType = "BOT_DETECTION";
          status = "BLOCKED";
        } else if (errorMessage.toLowerCase().includes("timeout") || errorMessage.includes("ETIMEDOUT")) {
          errorType = "TIMEOUT";
          status = "TIMEOUT";
        } else if (errorMessage.includes("fetch failed") || errorMessage.includes("ECONNREFUSED")) {
          errorType = "NETWORK";
        }

        this.outcomes.push({
          scannerName: scanner.name,
          scannerType,
          status,
          errorType,
          errorMessage: errorMessage.substring(0, 500),
          responseTimeMs,
          resultsFound: 0,
          proxyUsed: scanner instanceof BaseBrokerScanner ? scanner.getProxyUsed() : undefined,
        });
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
        } else {
          // Promise.allSettled rejection — track it
          this.failedScannerCount++;
          console.error(`[ScanOrchestrator] Scanner failed in batch: ${result.reason}`);
        }
      }

      // Track partial results after each batch for crash recovery
      this.partialResults = [...allResults];

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < this.scanners.length) {
        console.log(`[ScanOrchestrator] Waiting 1s before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Log scanner health summary
    const statusCounts = this.outcomes.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const statusSummary = Object.entries(statusCounts).map(([s, c]) => `${c} ${s}`).join(", ");
    console.log(`[ScanOrchestrator] Scanner health: ${statusSummary} (${this.outcomes.length} total, ${this.failedScannerCount} rejected)`);

    console.log(`[ScanOrchestrator] All scanners complete. Scanned results: ${allResults.length}`);

    // ─── Exposure Projection ───
    // After all scanners finish, project confirmed exposures onto related brokers
    const { projected, stats: projectionStats } = projectExposures(allResults, input);
    this.lastProjectionStats = projectionStats;

    if (projected.length > 0) {
      allResults.push(...projected);
      console.log(
        `[ScanOrchestrator] After projection: ${allResults.length} total ` +
        `(${allResults.length - projected.length} scanned + ${projected.length} projected)`
      );
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

  /**
   * Get results accumulated so far from completed batches.
   * Used for crash recovery — saves partial results even if a later batch fails.
   */
  getPartialResults(): ScanResult[] {
    return this.partialResults;
  }

  /**
   * Get the stats from the last projection run.
   */
  getProjectionStats(): ProjectionStats | null {
    return this.lastProjectionStats;
  }

  getScannerCount(): number {
    return this.scanners.length;
  }

  getScannerNames(): string[] {
    return this.scanners.map((s) => s.name);
  }

  /** Get per-scanner outcome data from the last scan run */
  getOutcomes(): ScannerOutcome[] {
    return this.outcomes;
  }

  /** Get count of scanners that threw unhandled rejections */
  getFailedCount(): number {
    return this.failedScannerCount;
  }

  /**
   * Get the actual number of data sources checked
   * This includes all brokers from DATA_BROKER_DIRECTORY plus breach databases and social media
   */
  getSourcesCheckedCount(): number {
    // Base: all data brokers from the directory
    const brokerCount = getBrokerCount();

    // Add breach scanners (HIBP, LeakCheck, Dehashed = 3 sources)
    // Add social media platforms (10 platforms checked)
    const total = brokerCount + 3 + 10;

    console.log(`[ScanOrchestrator] Sources: ${brokerCount} brokers + 3 breach + 10 social = ${total}`);
    return total;
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
