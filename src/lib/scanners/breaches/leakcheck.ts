import { BaseScanner, type ScanInput, type ScanResult } from "../base-scanner";
import type { DataSource, Severity } from "@/lib/types";

/**
 * LeakCheck Public API Response
 */
interface LeakCheckSource {
  name: string;
  date: string;
}

interface LeakCheckResponse {
  success: boolean;
  found: number;
  fields?: string[];
  sources?: LeakCheckSource[];
  error?: string;
}

/**
 * LeakCheck Scanner (Free Public API)
 *
 * Uses LeakCheck's free public API to check if emails/usernames
 * appear in breach databases. Returns breach sources and exposed
 * field types (but not actual leaked values).
 *
 * API Documentation: https://wiki.leakcheck.io/en/api/public
 *
 * Requirements:
 * - Add "Powered by LeakCheck" link on the website
 * - Free for commercial use
 */
export class LeakCheckScanner extends BaseScanner {
  name = "LeakCheck Scanner";
  source: DataSource = "BREACH_DB";

  private baseUrl = "https://leakcheck.io/api/public";

  async isAvailable(): Promise<boolean> {
    // Always available - no API key required
    return true;
  }

  async scan(input: ScanInput): Promise<ScanResult[]> {
    const results: ScanResult[] = [];

    // Check emails
    if (input.emails?.length) {
      for (const email of input.emails) {
        try {
          const breaches = await this.checkLeak(email);
          if (breaches.length > 0) {
            results.push(...breaches.map(b => this.createResult(b, email, "EMAIL")));
          }
          // Rate limiting - be respectful of free API
          if (input.emails.indexOf(email) < input.emails.length - 1) {
            await this.delay(1000);
          }
        } catch (error) {
          console.error(`[LeakCheck] Error checking email:`, error);
        }
      }
    }

    // Check usernames
    if (input.usernames?.length) {
      for (const username of input.usernames) {
        try {
          const breaches = await this.checkLeak(username);
          if (breaches.length > 0) {
            results.push(...breaches.map(b => this.createResult(b, username, "USERNAME")));
          }
          await this.delay(1000);
        } catch (error) {
          console.error(`[LeakCheck] Error checking username:`, error);
        }
      }
    }

    console.log(`[LeakCheck] Found ${results.length} breach exposures`);
    return results;
  }

  private async checkLeak(query: string): Promise<Array<{ source: LeakCheckSource; fields: string[] }>> {
    const url = `${this.baseUrl}?check=${encodeURIComponent(query)}`;

    console.log(`[LeakCheck] Checking: ${this.maskQuery(query)}`);

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "GhostMyData/1.0",
      },
    });

    if (response.status === 429) {
      console.warn("[LeakCheck] Rate limited, waiting...");
      await this.delay(5000);
      return this.checkLeak(query); // Retry once
    }

    if (!response.ok) {
      throw new Error(`LeakCheck API error: ${response.status}`);
    }

    const data: LeakCheckResponse = await response.json();

    if (!data.success) {
      if (data.error) {
        console.warn(`[LeakCheck] API error: ${data.error}`);
      }
      return [];
    }

    if (!data.found || data.found === 0) {
      return [];
    }

    // Combine sources with field information
    const results: Array<{ source: LeakCheckSource; fields: string[] }> = [];

    if (data.sources) {
      for (const source of data.sources) {
        results.push({
          source,
          fields: data.fields || [],
        });
      }
    }

    return results;
  }

  private createResult(
    breach: { source: LeakCheckSource; fields: string[] },
    query: string,
    queryType: "EMAIL" | "USERNAME"
  ): ScanResult {
    const severity = this.calculateBreachSeverity(breach.fields);

    return {
      source: "BREACH_DB",
      sourceName: `LeakCheck - ${breach.source.name}`,
      sourceUrl: "https://leakcheck.io",
      dataType: queryType,
      dataPreview: this.maskData(query, queryType),
      severity,
      rawData: {
        breachName: breach.source.name,
        breachDate: breach.source.date,
        exposedFields: breach.fields,
        hasPassword: breach.fields.some(f =>
          f.toLowerCase().includes("password") ||
          f.toLowerCase().includes("hash")
        ),
        hasPhone: breach.fields.some(f => f.toLowerCase().includes("phone")),
        hasAddress: breach.fields.some(f =>
          f.toLowerCase().includes("address") ||
          f.toLowerCase().includes("zip")
        ),
        poweredBy: "LeakCheck", // Attribution requirement
      },
    };
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

    // High if PII like phone, address, DOB
    if (lowerFields.some(f =>
      f.includes("phone") ||
      f.includes("address") ||
      f.includes("dob") ||
      f.includes("birth") ||
      f.includes("zip")
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
