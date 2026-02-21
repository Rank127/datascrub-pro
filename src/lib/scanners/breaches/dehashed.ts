import { BaseScanner, type ScanInput, type ScanResult, type ConfidenceResult } from "../base-scanner";
import type { DataSource, Severity } from "@/lib/types";

/**
 * Dehashed API Response Types
 * Dehashed is a search engine for leaked/breached databases
 */
interface DehashedEntry {
  id: string;
  email: string;
  ip_address: string;
  username: string;
  password: string;
  hashed_password: string;
  hash_type: string;
  name: string;
  vin: string;
  address: string;
  phone: string;
  database_name: string;
}

interface DehashedResponse {
  balance: number;
  entries: DehashedEntry[] | null;
  success: boolean;
  took: string;
  total: number;
}

/**
 * Dehashed Scanner
 *
 * Searches the Dehashed breach database for exposed credentials and personal data.
 * Dehashed aggregates data from thousands of breaches and dark web dumps.
 *
 * API v2 (Feb 2026):
 *   POST https://api.dehashed.com/v2/search
 *   Header: Dehashed-Api-Key
 *   Body: { query, page, size }
 *
 * Pricing: $15/500 credits (1 credit per query)
 * Rate Limits: 10 req/sec
 */
export class DehashedScanner extends BaseScanner {
  name = "Dehashed Scanner";
  source: DataSource = "DEHASHED";

  private apiKey: string;
  private baseUrl = "https://api.dehashed.com/v2/search";

  constructor() {
    super();
    this.apiKey = process.env.DEHASHED_API_KEY || "";
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  async scan(input: ScanInput): Promise<ScanResult[]> {
    const results: ScanResult[] = [];

    if (!this.apiKey) {
      console.log("[Dehashed] API key not configured, skipping");
      return results;
    }

    // Search by email addresses
    if (input.emails?.length) {
      for (const email of input.emails) {
        try {
          const entries = await this.searchByField("email", email);
          results.push(...this.processEntries(entries, email, "EMAIL"));

          // Rate limiting - small delay between requests
          if (input.emails.indexOf(email) < input.emails.length - 1) {
            await this.delay(1000);
          }
        } catch (error) {
          console.error(`[Dehashed] Search failed for email:`, error);
        }
      }
    }

    // Search by usernames
    if (input.usernames?.length) {
      for (const username of input.usernames) {
        try {
          const entries = await this.searchByField("username", username);
          results.push(...this.processEntries(entries, username, "USERNAME"));
          await this.delay(1000);
        } catch (error) {
          console.error(`[Dehashed] Search failed for username:`, error);
        }
      }
    }

    // Search by phone numbers
    if (input.phones?.length) {
      for (const phone of input.phones) {
        try {
          // Normalize phone number (remove non-digits)
          const normalizedPhone = phone.replace(/\D/g, "");
          const entries = await this.searchByField("phone", normalizedPhone);
          results.push(...this.processEntries(entries, phone, "PHONE"));
          await this.delay(1000);
        } catch (error) {
          console.error(`[Dehashed] Search failed for phone:`, error);
        }
      }
    }

    // Search by name (if we have it)
    if (input.fullName) {
      try {
        const entries = await this.searchByField("name", input.fullName);
        results.push(...this.processEntries(entries, input.fullName, "NAME"));
      } catch (error) {
        console.error(`[Dehashed] Search failed for name:`, error);
      }
    }

    console.log(`[Dehashed] Found ${results.length} exposures`);
    return results;
  }

  private retryCount = 0;

  private async searchByField(
    field: string,
    value: string
  ): Promise<DehashedEntry[]> {
    const query = `${field}:${value}`;

    console.log(`[Dehashed] Searching: ${field}:${this.maskValue(value)}`);

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Dehashed-Api-Key": this.apiKey,
      },
      body: JSON.stringify({ query, page: 1, size: 100 }),
    });

    if (response.status === 401) {
      const body = await response.text();
      throw new Error(`Dehashed API auth error: ${body}`);
    }

    if (response.status === 429) {
      if (this.retryCount < 1) {
        this.retryCount++;
        console.warn("[Dehashed] Rate limited, waiting 5s...");
        await this.delay(5000);
        return this.searchByField(field, value);
      }
      throw new Error("Dehashed rate limit exceeded after retry");
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Dehashed API error ${response.status}: ${body.substring(0, 200)}`);
    }

    this.retryCount = 0;
    const data: DehashedResponse = await response.json();

    console.log(`[Dehashed] Balance: ${data.balance} credits remaining`);

    if (!data.success) {
      console.warn("[Dehashed] API returned success=false");
      return [];
    }

    return data.entries || [];
  }

  private processEntries(
    entries: DehashedEntry[],
    searchValue: string,
    searchType: "EMAIL" | "USERNAME" | "PHONE" | "NAME"
  ): ScanResult[] {
    const results: ScanResult[] = [];
    const seenDatabases = new Set<string>();

    for (const entry of entries) {
      // Deduplicate by database name
      if (seenDatabases.has(entry.database_name)) {
        continue;
      }
      seenDatabases.add(entry.database_name);

      const severity = this.calculateEntrySeverity(entry);
      const dataTypes = this.getExposedDataTypes(entry);

      // Dehashed results are exact search matches — always CONFIRMED
      const confidence: ConfidenceResult = {
        score: 100,
        classification: "CONFIRMED",
        factors: {
          nameMatch: 0,
          locationMatch: 0,
          ageMatch: 0,
          dataCorrelation: 10,
          sourceReliability: 0,
        },
        reasoning: [
          `Exact ${searchType.toLowerCase()} match in breach database: ${entry.database_name || "Unknown"}`,
        ],
        validatedAt: new Date(),
      };

      results.push({
        source: "DEHASHED",
        sourceName: `Dehashed - ${entry.database_name || "Unknown Breach"}`,
        sourceUrl: "https://dehashed.com",
        dataType: this.getPrimaryDataType(entry, searchType),
        dataPreview: this.maskData(searchValue, searchType),
        severity,
        confidence,
        rawData: {
          database: entry.database_name,
          exposedFields: dataTypes,
          hasPassword: !!entry.password || !!entry.hashed_password,
          hashedPasswordType: entry.hash_type || null,
          // Don't store actual leaked data, just metadata
          foundEmail: !!entry.email,
          foundUsername: !!entry.username,
          foundPhone: !!entry.phone,
          foundAddress: !!entry.address,
          foundName: !!entry.name,
          foundIp: !!entry.ip_address,
        },
      });
    }

    return results;
  }

  private calculateEntrySeverity(entry: DehashedEntry): Severity {
    // Critical if password is exposed (even hashed)
    if (entry.password || entry.hashed_password) {
      return "CRITICAL";
    }

    // High if multiple PII fields exposed
    const piiFields = [
      entry.phone,
      entry.address,
      entry.name,
      entry.ip_address,
    ].filter(Boolean).length;

    if (piiFields >= 2) {
      return "HIGH";
    }

    // Medium if email + username
    if (entry.email && entry.username) {
      return "MEDIUM";
    }

    return "LOW";
  }

  private getExposedDataTypes(entry: DehashedEntry): string[] {
    const types: string[] = [];
    if (entry.email) types.push("email");
    if (entry.username) types.push("username");
    if (entry.password) types.push("password (plaintext)");
    if (entry.hashed_password) types.push(`password (${entry.hash_type || "hashed"})`);
    if (entry.phone) types.push("phone");
    if (entry.address) types.push("address");
    if (entry.name) types.push("name");
    if (entry.ip_address) types.push("ip_address");
    return types;
  }

  private getPrimaryDataType(
    entry: DehashedEntry,
    searchType: "EMAIL" | "USERNAME" | "PHONE" | "NAME"
  ): "EMAIL" | "USERNAME" | "PHONE" | "NAME" | "COMBINED_PROFILE" {
    // If multiple types of data exposed, it's a combined profile
    const fieldCount = [
      entry.email,
      entry.username,
      entry.phone,
      entry.address,
      entry.name,
    ].filter(Boolean).length;

    if (fieldCount >= 3) {
      return "COMBINED_PROFILE";
    }

    return searchType;
  }

  private maskValue(value: string): string {
    if (value.includes("@")) {
      // Email
      const [local, domain] = value.split("@");
      return `${local.slice(0, 2)}***@${domain}`;
    }
    if (value.length > 4) {
      return `${value.slice(0, 2)}***${value.slice(-2)}`;
    }
    return "***";
  }
}
