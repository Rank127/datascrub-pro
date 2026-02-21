import { BaseScanner, type ScanInput, type ScanResult, type ConfidenceResult } from "../base-scanner";
import { DataSourceNames } from "@/lib/types";
import { getHIBPWaitTime, recordHIBPRequest, canUseService } from "@/lib/services/rate-limiter";

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

    // Check daily limit before starting
    if (!canUseService("hibp")) {
      console.warn("HIBP daily limit reached, skipping scan");
      return results;
    }

    for (const email of input.emails) {
      try {
        // Smart rate limiting: wait if needed based on per-minute tracking
        const waitTime = getHIBPWaitTime();
        if (waitTime > 0) {
          console.log(`[HIBP] Rate limit: waiting ${Math.ceil(waitTime / 1000)}s before next request`);
          await this.delay(waitTime);
        }

        // Record this request in the rate limiter
        if (!recordHIBPRequest()) {
          console.warn("[HIBP] Request blocked by rate limiter, waiting for reset");
          await this.delay(60000); // Wait a minute and try again
          recordHIBPRequest();
        }

        const breaches = await this.fetchBreaches(email);

        for (const breach of breaches) {
          const severity = this.calculateBreachSeverity(breach);

          // HIBP breaches are verified exact email matches — always CONFIRMED
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
              `Exact email match in verified breach database: ${breach.Title}`,
              `Breach date: ${breach.BreachDate}, verified: ${breach.IsVerified}`,
            ],
            validatedAt: new Date(),
          };

          results.push({
            source: "HAVEIBEENPWNED",
            sourceName: `${DataSourceNames.HAVEIBEENPWNED} - ${breach.Title}`,
            sourceUrl: `https://haveibeenpwned.com/account/${encodeURIComponent(email)}`,
            dataType: "EMAIL",
            dataPreview: this.maskData(email, "EMAIL"),
            severity,
            confidence,
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
