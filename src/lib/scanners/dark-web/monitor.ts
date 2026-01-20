import { BaseScanner, type ScanInput, type ScanResult } from "../base-scanner";
import { DataSource, DataSourceNames } from "@/lib/types";

interface DarkWebFinding {
  source: "DARK_WEB_MARKET" | "PASTE_SITE" | "DARK_WEB_FORUM";
  title: string;
  dataType: "EMAIL" | "SSN" | "FINANCIAL" | "COMBINED_PROFILE";
  description: string;
}

// Mock dark web findings for development
const MOCK_FINDINGS: DarkWebFinding[] = [
  {
    source: "PASTE_SITE",
    title: "Pastebin Leak",
    dataType: "EMAIL",
    description: "Email found in credential dump",
  },
  {
    source: "DARK_WEB_FORUM",
    title: "Hacking Forum Post",
    dataType: "COMBINED_PROFILE",
    description: "Personal data discussed in forum thread",
  },
  {
    source: "DARK_WEB_MARKET",
    title: "Data Marketplace Listing",
    dataType: "FINANCIAL",
    description: "Financial data available for sale",
  },
];

export class DarkWebScanner extends BaseScanner {
  name = "Dark Web Monitor";
  source: DataSource = "DARK_WEB_MARKET";

  private isProPlan: boolean;

  constructor(isProPlan: boolean = false) {
    super();
    this.isProPlan = isProPlan;
  }

  async isAvailable(): Promise<boolean> {
    // Dark web monitoring only available for Enterprise plan
    return this.isProPlan;
  }

  async scan(input: ScanInput): Promise<ScanResult[]> {
    const results: ScanResult[] = [];

    if (!this.isProPlan) {
      return results;
    }

    // Simulate dark web scan delay (longer than other scans)
    await this.delay(Math.random() * 2000 + 1000);

    // Check emails
    if (input.emails?.length) {
      for (const email of input.emails) {
        // 30% chance of finding something on dark web
        if (Math.random() < 0.3) {
          const finding = MOCK_FINDINGS[Math.floor(Math.random() * 2)]; // Email or profile

          results.push({
            source: finding.source as DataSource,
            sourceName: `${DataSourceNames[finding.source as DataSource]} - ${finding.title}`,
            dataType: finding.dataType,
            dataPreview: this.maskData(email, "EMAIL"),
            severity: "CRITICAL",
            rawData: {
              foundIn: finding.title,
              description: finding.description,
              detectedAt: new Date().toISOString(),
            },
          });
        }
      }
    }

    // Check SSN hash
    if (input.ssnHash) {
      // 10% chance of SSN being on dark web
      if (Math.random() < 0.1) {
        results.push({
          source: "DARK_WEB_MARKET",
          sourceName: `${DataSourceNames.DARK_WEB_MARKET} - Identity Data`,
          dataType: "SSN",
          dataPreview: "***-**-****",
          severity: "CRITICAL",
          rawData: {
            foundIn: "Identity marketplace",
            description: "SSN hash matched in identity data listing",
            detectedAt: new Date().toISOString(),
          },
        });
      }
    }

    // Check for financial data exposure
    if (input.fullName && input.addresses?.length) {
      // 15% chance
      if (Math.random() < 0.15) {
        results.push({
          source: "DARK_WEB_FORUM",
          sourceName: `${DataSourceNames.DARK_WEB_FORUM} - Personal Data`,
          dataType: "COMBINED_PROFILE",
          dataPreview: this.maskData(input.fullName, "NAME"),
          severity: "HIGH",
          rawData: {
            foundIn: "Underground forum",
            description: "Personal profile data found in forum post",
            detectedAt: new Date().toISOString(),
          },
        });
      }
    }

    return results;
  }
}
