import { BaseScanner, type ScanInput, type ScanResult } from "../base-scanner";
import type { DataSource } from "@/lib/types";

export interface ManualCheckConfig {
  name: string;
  source: DataSource;
  baseUrl: string;
  optOutUrl: string;
  optOutInstructions: string;
  estimatedRemovalDays: number;
  privacyEmail?: string;
  buildSearchUrl: (input: ScanInput) => string | null;
}

/**
 * Scanner for sites with advanced bot protection that can't be scraped.
 * Returns a "manual check required" result with a direct link for the user.
 */
export class ManualCheckScanner extends BaseScanner {
  private config: ManualCheckConfig;

  constructor(config: ManualCheckConfig) {
    super();
    this.config = config;
  }

  get name(): string {
    return this.config.name;
  }

  get source(): DataSource {
    return this.config.source;
  }

  async scan(input: ScanInput): Promise<ScanResult[]> {
    const searchUrl = this.config.buildSearchUrl(input);

    if (!searchUrl) {
      console.log(`[${this.config.name}] No search URL built (missing required data)`);
      return [];
    }

    console.log(`[${this.config.name}] Manual check required - returning link for user`);

    // Return a special result that indicates manual verification is needed
    return [{
      source: this.config.source,
      sourceName: this.config.name,
      sourceUrl: searchUrl,
      dataType: "COMBINED_PROFILE",
      dataPreview: `Manual check required - click to verify`,
      severity: "LOW", // Low severity since we don't know if they're actually listed
      rawData: {
        manualCheckRequired: true,
        searchUrl,
        optOutUrl: this.config.optOutUrl,
        optOutInstructions: this.config.optOutInstructions,
        estimatedRemovalDays: this.config.estimatedRemovalDays,
        privacyEmail: this.config.privacyEmail,
        reason: "This site has advanced bot protection. Please click the link to check if your information is listed.",
      },
    }];
  }
}

// Helper functions for URL building
function formatNameForUrl(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, "-");
}

function formatStateForUrl(state: string): string {
  const stateMap: Record<string, string> = {
    alabama: "al", alaska: "ak", arizona: "az", arkansas: "ar",
    california: "ca", colorado: "co", connecticut: "ct", delaware: "de",
    florida: "fl", georgia: "ga", hawaii: "hi", idaho: "id",
    illinois: "il", indiana: "in", iowa: "ia", kansas: "ks",
    kentucky: "ky", louisiana: "la", maine: "me", maryland: "md",
    massachusetts: "ma", michigan: "mi", minnesota: "mn", mississippi: "ms",
    missouri: "mo", montana: "mt", nebraska: "ne", nevada: "nv",
    "new hampshire": "nh", "new jersey": "nj", "new mexico": "nm",
    "new york": "ny", "north carolina": "nc", "north dakota": "nd",
    ohio: "oh", oklahoma: "ok", oregon: "or", pennsylvania: "pa",
    "rhode island": "ri", "south carolina": "sc", "south dakota": "sd",
    tennessee: "tn", texas: "tx", utah: "ut", vermont: "vt",
    virginia: "va", washington: "wa", "west virginia": "wv",
    wisconsin: "wi", wyoming: "wy", "district of columbia": "dc",
  };

  const normalized = state.toLowerCase().trim();
  if (normalized.length === 2) return normalized;
  return stateMap[normalized] || normalized;
}

// Pre-configured manual check scanners for protected sites
export function createFastPeopleSearchManualScanner(): ManualCheckScanner {
  return new ManualCheckScanner({
    name: "FastPeopleSearch",
    source: "FASTPEOPLESEARCH",
    baseUrl: "https://www.fastpeoplesearch.com",
    optOutUrl: "https://www.fastpeoplesearch.com/removal",
    optOutInstructions:
      "1. Go to fastpeoplesearch.com and search for your name\n" +
      "2. Find your listing and view your profile\n" +
      "3. Copy the URL of your profile page\n" +
      "4. Visit fastpeoplesearch.com/removal\n" +
      "5. Paste your profile URL\n" +
      "6. Complete the CAPTCHA and submit\n" +
      "7. Your listing will be removed within 24-48 hours",
    estimatedRemovalDays: 2,
    buildSearchUrl: (input: ScanInput) => {
      if (!input.fullName) return null;

      const nameParts = input.fullName.trim().split(/\s+/);
      if (nameParts.length < 2) return null;

      const firstName = formatNameForUrl(nameParts[0]);
      const lastName = formatNameForUrl(nameParts[nameParts.length - 1]);

      let url = `https://www.fastpeoplesearch.com/name/${firstName}-${lastName}`;

      if (input.addresses?.length) {
        const addr = input.addresses[0];
        const city = formatNameForUrl(addr.city);
        const state = formatStateForUrl(addr.state);
        url += `_${city}-${state}`;
      }

      return url;
    },
  });
}

export function createPeopleFinderManualScanner(): ManualCheckScanner {
  return new ManualCheckScanner({
    name: "PeopleFinders",
    source: "PEOPLEFINDER",
    baseUrl: "https://www.peoplefinders.com",
    optOutUrl: "https://www.peoplefinders.com/manage",
    optOutInstructions:
      "1. Go to peoplefinders.com/manage\n" +
      "2. Enter your first name, last name, and state\n" +
      "3. Search for your listing in the results\n" +
      "4. Click 'This is me' on your profile\n" +
      "5. Follow the opt-out process\n" +
      "6. Verify via email\n" +
      "7. Your listing will be removed within 48 hours",
    estimatedRemovalDays: 2,
    privacyEmail: "privacy@peoplefinders.com",
    buildSearchUrl: (input: ScanInput) => {
      if (!input.fullName) return null;

      const nameParts = input.fullName.trim().split(/\s+/);
      if (nameParts.length < 2) return null;

      const firstName = formatNameForUrl(nameParts[0]);
      const lastName = formatNameForUrl(nameParts[nameParts.length - 1]);

      let url = `https://www.peoplefinders.com/people/${firstName}-${lastName}`;

      if (input.addresses?.length) {
        const addr = input.addresses[0];
        const city = formatNameForUrl(addr.city);
        const state = formatStateForUrl(addr.state);
        url += `/${city}-${state}`;
      }

      return url;
    },
  });
}
