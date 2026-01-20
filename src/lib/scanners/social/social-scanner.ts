import { BaseScanner, type ScanInput, type ScanResult } from "../base-scanner";
import { DataSource, DataSourceNames } from "@/lib/types";

interface SocialPlatform {
  source: DataSource;
  baseUrl: string;
  searchByUsername: boolean;
  searchByEmail: boolean;
  searchByName: boolean;
}

const PLATFORMS: SocialPlatform[] = [
  {
    source: "LINKEDIN",
    baseUrl: "https://www.linkedin.com/in/",
    searchByUsername: true,
    searchByEmail: false,
    searchByName: true,
  },
  {
    source: "FACEBOOK",
    baseUrl: "https://www.facebook.com/",
    searchByUsername: true,
    searchByEmail: true,
    searchByName: true,
  },
  {
    source: "TWITTER",
    baseUrl: "https://twitter.com/",
    searchByUsername: true,
    searchByEmail: false,
    searchByName: false,
  },
  {
    source: "INSTAGRAM",
    baseUrl: "https://www.instagram.com/",
    searchByUsername: true,
    searchByEmail: false,
    searchByName: false,
  },
  {
    source: "TIKTOK",
    baseUrl: "https://www.tiktok.com/@",
    searchByUsername: true,
    searchByEmail: false,
    searchByName: false,
  },
  {
    source: "REDDIT",
    baseUrl: "https://www.reddit.com/user/",
    searchByUsername: true,
    searchByEmail: false,
    searchByName: false,
  },
];

export class SocialMediaScanner extends BaseScanner {
  name = "Social Media Scanner";
  source: DataSource = "OTHER";

  async scan(input: ScanInput): Promise<ScanResult[]> {
    const results: ScanResult[] = [];

    for (const platform of PLATFORMS) {
      // Simulate API/scraping delay
      await this.delay(Math.random() * 500 + 200);

      // Check by username
      if (platform.searchByUsername && input.usernames?.length) {
        for (const username of input.usernames) {
          // 40% chance of finding a match
          if (Math.random() < 0.4) {
            results.push(this.createResult(platform, username, "USERNAME"));
          }
        }
      }

      // Check by email
      if (platform.searchByEmail && input.emails?.length) {
        for (const email of input.emails) {
          // 30% chance
          if (Math.random() < 0.3) {
            results.push(this.createResult(platform, email, "EMAIL"));
          }
        }
      }

      // Check by name
      if (platform.searchByName && input.fullName) {
        // 50% chance for name-based search
        if (Math.random() < 0.5) {
          results.push(this.createResult(platform, input.fullName, "NAME"));
        }
      }
    }

    return results;
  }

  private createResult(
    platform: SocialPlatform,
    identifier: string,
    dataType: "USERNAME" | "EMAIL" | "NAME"
  ): ScanResult {
    const username = this.generateUsername(identifier);

    return {
      source: platform.source,
      sourceName: DataSourceNames[platform.source],
      sourceUrl: platform.baseUrl + encodeURIComponent(username),
      dataType,
      dataPreview:
        dataType === "USERNAME"
          ? `@${username}`
          : this.maskData(identifier, dataType),
      severity: "LOW", // Social media profiles are usually low severity
      rawData: {
        platform: platform.source,
        username,
        foundVia: dataType.toLowerCase(),
        profileUrl: platform.baseUrl + username,
      },
    };
  }

  private generateUsername(identifier: string): string {
    // Generate a plausible username from the identifier
    const clean = identifier.toLowerCase().replace(/[^a-z0-9]/g, "");
    const suffixes = ["", "123", "_official", ".real", "2024", "_"];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    return clean.slice(0, 15) + suffix;
  }
}
