import { BaseScanner, type ScanInput, type ScanResult } from "../base-scanner";
import { DataSourceNames } from "@/lib/types";

interface BreachData {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  DataClasses: string[];
  Description: string;
  IsVerified: boolean;
  IsSensitive: boolean;
}

export class HaveIBeenPwnedScanner extends BaseScanner {
  name = "Have I Been Pwned Scanner";
  source = "HAVEIBEENPWNED" as const;

  private apiKey: string;
  private baseUrl = "https://haveibeenpwned.com/api/v3";

  constructor() {
    super();
    this.apiKey = process.env.HIBP_API_KEY || "";
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  async scan(input: ScanInput): Promise<ScanResult[]> {
    const results: ScanResult[] = [];

    if (!input.emails?.length) {
      return results;
    }

    if (!this.apiKey) {
      console.warn("HIBP API key not configured");
      return results;
    }

    for (const email of input.emails) {
      try {
        // HIBP rate limit: 10 requests per minute, add delay between requests
        if (input.emails.indexOf(email) > 0) {
          await this.delay(6100); // 6.1 seconds between requests to stay under rate limit
        }

        const breaches = await this.fetchBreaches(email);

        for (const breach of breaches) {
          const severity = this.calculateBreachSeverity(breach);

          results.push({
            source: "HAVEIBEENPWNED",
            sourceName: `${DataSourceNames.HAVEIBEENPWNED} - ${breach.Title}`,
            sourceUrl: `https://haveibeenpwned.com/account/${encodeURIComponent(email)}`,
            dataType: "EMAIL",
            dataPreview: this.maskData(email, "EMAIL"),
            severity,
            rawData: {
              breachName: breach.Name,
              breachDate: breach.BreachDate,
              dataClasses: breach.DataClasses,
              domain: breach.Domain,
              description: breach.Description,
              isVerified: breach.IsVerified,
            },
          });
        }
      } catch (error) {
        console.error(`HIBP scan failed for email:`, error);
        // Continue with other emails
      }
    }

    return results;
  }

  private async fetchBreaches(email: string): Promise<BreachData[]> {
    const response = await fetch(
      `${this.baseUrl}/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
      {
        headers: {
          "hibp-api-key": this.apiKey,
          "User-Agent": "GhostMyData",
        },
      }
    );

    // 404 means no breaches found (this is good!)
    if (response.status === 404) {
      return [];
    }

    // 401 means invalid API key
    if (response.status === 401) {
      throw new Error("Invalid HIBP API key");
    }

    // 429 means rate limited
    if (response.status === 429) {
      const retryAfter = response.headers.get("retry-after") || "2";
      await this.delay(parseInt(retryAfter) * 1000);
      return this.fetchBreaches(email); // Retry once
    }

    if (!response.ok) {
      throw new Error(`HIBP API error: ${response.status}`);
    }

    return response.json();
  }

  private calculateBreachSeverity(
    breach: BreachData
  ): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    const dataClasses = breach.DataClasses.map((d) => d.toLowerCase());

    if (
      dataClasses.some(
        (d) =>
          d.includes("password") ||
          d.includes("credit card") ||
          d.includes("social security") ||
          d.includes("bank") ||
          d.includes("financial")
      )
    ) {
      return "CRITICAL";
    }

    if (
      dataClasses.some(
        (d) =>
          d.includes("phone") ||
          d.includes("address") ||
          d.includes("date of birth") ||
          d.includes("ip address")
      )
    ) {
      return "HIGH";
    }

    if (dataClasses.some((d) => d.includes("email") || d.includes("name"))) {
      return "MEDIUM";
    }

    return "LOW";
  }
}
