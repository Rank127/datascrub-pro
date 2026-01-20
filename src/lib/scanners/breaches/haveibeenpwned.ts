import { BaseScanner, type ScanInput, type ScanResult } from "../base-scanner";
import { DataSource, DataSourceNames } from "@/lib/types";

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

// Mock breach data for development
const MOCK_BREACHES: BreachData[] = [
  {
    Name: "LinkedIn2021",
    Title: "LinkedIn 2021",
    Domain: "linkedin.com",
    BreachDate: "2021-06-22",
    DataClasses: ["Email addresses", "Names", "Phone numbers", "Employers"],
    Description: "In June 2021, LinkedIn experienced a data breach.",
    IsVerified: true,
    IsSensitive: false,
  },
  {
    Name: "Adobe",
    Title: "Adobe",
    Domain: "adobe.com",
    BreachDate: "2013-10-04",
    DataClasses: ["Email addresses", "Passwords", "Password hints", "Usernames"],
    Description: "In October 2013, 153 million Adobe accounts were breached.",
    IsVerified: true,
    IsSensitive: false,
  },
  {
    Name: "Dropbox",
    Title: "Dropbox",
    Domain: "dropbox.com",
    BreachDate: "2012-07-01",
    DataClasses: ["Email addresses", "Passwords"],
    Description: "In mid-2012, Dropbox suffered a data breach.",
    IsVerified: true,
    IsSensitive: false,
  },
  {
    Name: "Twitter2023",
    Title: "Twitter (2023)",
    Domain: "twitter.com",
    BreachDate: "2023-01-01",
    DataClasses: ["Email addresses", "Names", "Phone numbers", "Usernames"],
    Description: "In early 2023, a breach exposed Twitter user data.",
    IsVerified: true,
    IsSensitive: false,
  },
];

export class HaveIBeenPwnedScanner extends BaseScanner {
  name = "Have I Been Pwned Scanner";
  source: DataSource = "HAVEIBEENPWNED";

  private apiKey?: string;

  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey;
  }

  async isAvailable(): Promise<boolean> {
    // In production, check if API key is valid
    return true;
  }

  async scan(input: ScanInput): Promise<ScanResult[]> {
    const results: ScanResult[] = [];

    if (!input.emails?.length) {
      return results;
    }

    for (const email of input.emails) {
      // Simulate API delay
      await this.delay(Math.random() * 500 + 200);

      // In production, this would call the real HIBP API:
      // const response = await fetch(
      //   `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`,
      //   {
      //     headers: {
      //       "hibp-api-key": this.apiKey,
      //       "User-Agent": "DataScrub-Pro",
      //     },
      //   }
      // );

      // For development, use mock data
      const breaches = this.getMockBreaches(email);

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
          },
        });
      }
    }

    return results;
  }

  private getMockBreaches(email: string): BreachData[] {
    // Deterministically select breaches based on email hash
    const hash = email.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const numBreaches = hash % 4; // 0-3 breaches

    return MOCK_BREACHES.slice(0, numBreaches);
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
          d.includes("social security")
      )
    ) {
      return "CRITICAL";
    }

    if (
      dataClasses.some(
        (d) =>
          d.includes("phone") ||
          d.includes("address") ||
          d.includes("date of birth")
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
