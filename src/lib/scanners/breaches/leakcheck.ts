import { BaseScanner, type ScanInput, type ScanResult } from "../base-scanner";
import type { DataSource, Severity } from "@/lib/types";

/**
 * LeakCheck API v2 Response
 */
interface LeakCheckSource {
  name: string;
  date?: string;
}

interface LeakCheckResult {
  email?: string;
  username?: string;
  password?: string;
  phone?: string;
  last_ip?: string;
  hash?: string;
  source: LeakCheckSource;
  fields?: string[];
}

interface LeakCheckResponse {
  success: boolean;
  found: number;
  quota: number;
  result?: LeakCheckResult[];
  error?: string;
}

/**
 * Rate limiting queue for LeakCheck API
 * Ensures we don't exceed API rate limits
 */
class RateLimitQueue {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;
  private lastRequest = 0;
  private minDelay: number;

  constructor(requestsPerMinute: number = 10) {
    // Calculate minimum delay between requests
    this.minDelay = Math.ceil(60000 / requestsPerMinute);
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequest;

      if (timeSinceLastRequest < this.minDelay) {
        await this.delay(this.minDelay - timeSinceLastRequest);
      }

      const task = this.queue.shift();
      if (task) {
        this.lastRequest = Date.now();
        await task();
      }
    }

    this.processing = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * LeakCheck Scanner (Paid API v2)
 *
 * Uses LeakCheck's paid API to check if emails/usernames/phones
 * appear in breach databases. Returns detailed breach information
 * including exposed passwords (hashed), phone numbers, and more.
 *
 * API Documentation: https://wiki.leakcheck.io/en/api
 *
 * Features:
 * - Real-time breach database search
 * - Supports email, username, phone lookups
 * - Returns exposed field details
 * - Rate limited queue to prevent API blocks
 */
export class LeakCheckScanner extends BaseScanner {
  name = "LeakCheck Scanner";
  source: DataSource = "BREACH_DB";

  private apiKey: string;
  private baseUrl = "https://leakcheck.io/api/v2/query";
  private rateLimitQueue: RateLimitQueue;

  constructor() {
    super();
    this.apiKey = process.env.LEAKCHECK_API_KEY || "";
    // LeakCheck allows ~10 requests per minute on most plans
    this.rateLimitQueue = new RateLimitQueue(10);
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  async scan(input: ScanInput): Promise<ScanResult[]> {
    const results: ScanResult[] = [];

    if (!this.apiKey) {
      console.log("[LeakCheck] API key not configured, using public API fallback");
      return this.scanPublicApi(input);
    }

    console.log("[LeakCheck] Using paid API v2 with rate limiting");

    // Check emails
    if (input.emails?.length) {
      for (const email of input.emails) {
        try {
          const breaches = await this.rateLimitQueue.add(() =>
            this.checkLeak(email, "email")
          );
          results.push(...breaches);
        } catch (error) {
          console.error(`[LeakCheck] Error checking email:`, error);
        }
      }
    }

    // Check phones
    if (input.phones?.length) {
      for (const phone of input.phones) {
        try {
          // Clean phone number
          const cleanPhone = phone.replace(/\D/g, "");
          const breaches = await this.rateLimitQueue.add(() =>
            this.checkLeak(cleanPhone, "phone")
          );
          results.push(...breaches);
        } catch (error) {
          console.error(`[LeakCheck] Error checking phone:`, error);
        }
      }
    }

    // Check usernames
    if (input.usernames?.length) {
      for (const username of input.usernames) {
        try {
          const breaches = await this.rateLimitQueue.add(() =>
            this.checkLeak(username, "username")
          );
          results.push(...breaches);
        } catch (error) {
          console.error(`[LeakCheck] Error checking username:`, error);
        }
      }
    }

    console.log(`[LeakCheck] Found ${results.length} breach exposures`);
    return results;
  }

  private async checkLeak(
    query: string,
    type: "email" | "phone" | "username"
  ): Promise<ScanResult[]> {
    console.log(`[LeakCheck] Checking ${type}: ${this.maskQuery(query)}`);

    const url = `${this.baseUrl}/${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: {
        "X-API-Key": this.apiKey,
        "Accept": "application/json",
        "User-Agent": "GhostMyData/1.0",
      },
    });

    if (response.status === 429) {
      console.warn("[LeakCheck] Rate limited, waiting 10s...");
      await this.delay(10000);
      return this.checkLeak(query, type); // Retry once
    }

    if (response.status === 401) {
      throw new Error("Invalid LeakCheck API key");
    }

    if (response.status === 404) {
      // No breaches found
      return [];
    }

    if (!response.ok) {
      throw new Error(`LeakCheck API error: ${response.status}`);
    }

    const data: LeakCheckResponse = await response.json();

    if (!data.success || !data.found || !data.result) {
      return [];
    }

    console.log(`[LeakCheck] Found ${data.found} breaches, quota remaining: ${data.quota}`);

    // Convert results to ScanResult format
    return data.result.map(breach => this.createResult(breach, query, type));
  }

  private createResult(
    breach: LeakCheckResult,
    query: string,
    queryType: "email" | "phone" | "username"
  ): ScanResult {
    // Determine exposed fields
    const exposedFields: string[] = [];
    if (breach.email) exposedFields.push("email");
    if (breach.username) exposedFields.push("username");
    if (breach.password) exposedFields.push("password");
    if (breach.phone) exposedFields.push("phone");
    if (breach.hash) exposedFields.push("password_hash");
    if (breach.last_ip) exposedFields.push("ip_address");
    if (breach.fields) exposedFields.push(...breach.fields);

    const severity = this.calculateBreachSeverity(exposedFields);
    const dataType = queryType === "email" ? "EMAIL" :
                     queryType === "phone" ? "PHONE" : "USERNAME";

    return {
      source: "BREACH_DB",
      sourceName: `LeakCheck - ${breach.source.name}`,
      sourceUrl: "https://leakcheck.io",
      dataType,
      dataPreview: this.maskData(query, dataType),
      severity,
      rawData: {
        breachName: breach.source.name,
        breachDate: breach.source.date || "Unknown",
        exposedFields,
        hasPassword: !!breach.password || !!breach.hash,
        hasPhone: !!breach.phone,
        hasEmail: !!breach.email,
        hasIP: !!breach.last_ip,
        poweredBy: "LeakCheck",
      },
    };
  }

  /**
   * Fallback to public API if no API key configured
   */
  private async scanPublicApi(input: ScanInput): Promise<ScanResult[]> {
    const results: ScanResult[] = [];
    const publicUrl = "https://leakcheck.io/api/public";

    if (input.emails?.length) {
      for (const email of input.emails) {
        try {
          const url = `${publicUrl}?check=${encodeURIComponent(email)}`;
          const response = await fetch(url, {
            headers: {
              "Accept": "application/json",
              "User-Agent": "GhostMyData/1.0",
            },
          });

          if (response.status === 429) {
            console.warn("[LeakCheck] Public API rate limited");
            await this.delay(5000);
            continue;
          }

          if (!response.ok) continue;

          const data = await response.json();
          if (data.success && data.found > 0 && data.sources) {
            for (const source of data.sources) {
              results.push({
                source: "BREACH_DB",
                sourceName: `LeakCheck - ${source.name}`,
                sourceUrl: "https://leakcheck.io",
                dataType: "EMAIL",
                dataPreview: this.maskData(email, "EMAIL"),
                severity: this.calculateBreachSeverity(data.fields || []),
                rawData: {
                  breachName: source.name,
                  breachDate: source.date || "Unknown",
                  exposedFields: data.fields || [],
                  poweredBy: "LeakCheck",
                },
              });
            }
          }

          // Rate limiting for public API
          await this.delay(1500);
        } catch (error) {
          console.error(`[LeakCheck] Public API error:`, error);
        }
      }
    }

    return results;
  }

  private calculateBreachSeverity(fields: string[]): Severity {
    const lowerFields = fields.map(f => f.toLowerCase());

    // Critical if password or financial data exposed
    if (lowerFields.some(f =>
      f.includes("password") ||
      f.includes("hash") ||
      f.includes("credit") ||
      f.includes("ssn") ||
      f.includes("social security")
    )) {
      return "CRITICAL";
    }

    // High if PII like phone, address, DOB, IP
    if (lowerFields.some(f =>
      f.includes("phone") ||
      f.includes("address") ||
      f.includes("dob") ||
      f.includes("birth") ||
      f.includes("zip") ||
      f.includes("ip")
    )) {
      return "HIGH";
    }

    // Medium if name or username
    if (lowerFields.some(f =>
      f.includes("name") ||
      f.includes("username")
    )) {
      return "MEDIUM";
    }

    return "LOW";
  }

  private maskQuery(query: string): string {
    if (query.includes("@")) {
      const [local, domain] = query.split("@");
      return `${local.slice(0, 2)}***@${domain}`;
    }
    if (query.length > 4) {
      return `${query.slice(0, 2)}***${query.slice(-2)}`;
    }
    return "***";
  }
}
