import { BaseScanner, type ScanInput, type ScanResult, type ConfidenceResult } from "../base-scanner";
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
  /**
   * If true, calculate confidence based on user profile completeness.
   * Used for PEOPLE_SEARCH aggregators where having a mailing address
   * means you're almost certainly listed (they compile from public records).
   */
  profileBasedConfidence?: boolean;
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

    // Calculate profile-based confidence for people-search aggregators
    const confidence = this.config.profileBasedConfidence
      ? this.calculateProfileConfidence(input)
      : undefined;

    if (confidence) {
      console.log(
        `[${this.config.name}] Profile-based confidence: ${confidence.score} (${confidence.classification})`
      );
    }

    // Return a special result that indicates manual verification is needed
    return [{
      source: this.config.source,
      sourceName: this.config.name,
      sourceUrl: searchUrl,
      dataType: "COMBINED_PROFILE",
      dataPreview: `Manual check required - click to verify`,
      severity: confidence && confidence.score >= 50 ? "MEDIUM" : "LOW",
      confidence,
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

  /**
   * Calculate confidence for people-search aggregators based on profile data.
   *
   * People-search sites compile from public records (voter rolls, property records,
   * court filings, phone directories). If someone has a US mailing address,
   * they are almost certainly listed on these aggregators.
   *
   * Score tiers:
   *   Name + Address (city+state) → 65 LIKELY — very high probability
   *   Name + State only → 55 LIKELY — probable
   *   Name only → 40 POSSIBLE — below projection threshold (won't cascade)
   */
  private calculateProfileConfidence(input: ScanInput): ConfidenceResult | undefined {
    if (!input.fullName) return undefined;

    const reasoning: string[] = [];
    let score = 0;

    // Base: name is present (required for people-search)
    score = 35; // nameMatch equivalent
    reasoning.push(`Name present: "${input.fullName}"`);

    // Address boosts confidence significantly (public records = listed)
    const addr = input.addresses?.[0];
    if (addr?.city && addr?.state) {
      score += 30; // locationMatch equivalent
      reasoning.push(`Address on file: ${addr.city}, ${addr.state} — high public record probability`);
    } else if (addr?.state) {
      score += 20;
      reasoning.push(`State on file: ${addr.state} — moderate public record probability`);
    }

    // Cap at 65 — this is an estimate, not a confirmed scrape
    score = Math.min(65, score);

    reasoning.push(
      `Profile-based estimate for ${this.config.name} (people-search aggregator). ` +
      `Not confirmed by scraping — site has bot protection.`
    );

    return {
      score,
      classification: score >= 50 ? "LIKELY" : "POSSIBLE",
      factors: {
        nameMatch: input.fullName ? 35 : 0,
        locationMatch: addr?.city && addr?.state ? 30 : (addr?.state ? 20 : 0),
        ageMatch: 0,
        dataCorrelation: 0,
        sourceReliability: 0,
      },
      reasoning,
      validatedAt: new Date(),
    };
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
    profileBasedConfidence: true, // PEOPLE_SEARCH aggregator — uses public records
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
    profileBasedConfidence: true, // PEOPLE_SEARCH aggregator — uses public records
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

export function createBeenVerifiedManualScanner(): ManualCheckScanner {
  return new ManualCheckScanner({
    name: "BeenVerified",
    source: "BEENVERIFIED",
    baseUrl: "https://www.beenverified.com",
    optOutUrl: "https://www.beenverified.com/f/optout/search",
    profileBasedConfidence: true,
    optOutInstructions:
      "1. Go to beenverified.com/f/optout/search\n" +
      "2. Search for your name and state\n" +
      "3. Find your listing and click 'Remove My Info'\n" +
      "4. Enter your email address to receive verification\n" +
      "5. Click the link in the confirmation email\n" +
      "6. Your information will be removed within 24 hours",
    estimatedRemovalDays: 1,
    privacyEmail: "privacy@beenverified.com",
    buildSearchUrl: (input: ScanInput) => {
      if (!input.fullName) return null;

      const nameParts = input.fullName.trim().split(/\s+/);
      if (nameParts.length < 2) return null;

      // BeenVerified is a React SPA — search URLs don't return scrapable results.
      // Link to the opt-out search page instead.
      return "https://www.beenverified.com/f/optout/search";
    },
  });
}

export function createPeopleLookerManualScanner(): ManualCheckScanner {
  return new ManualCheckScanner({
    name: "PeopleLooker",
    source: "PEOPLELOOKER",
    baseUrl: "https://www.peoplelooker.com",
    optOutUrl: "https://www.peoplelooker.com/opt-out",
    profileBasedConfidence: true,
    optOutInstructions:
      "1. Go to peoplelooker.com/opt-out\n" +
      "2. Search for your name and state\n" +
      "3. Find your listing and click 'Remove'\n" +
      "4. Enter your email address for verification\n" +
      "5. Click the confirmation link in your email\n" +
      "6. Removal typically takes 7 days",
    estimatedRemovalDays: 7,
    privacyEmail: "privacy@peoplelooker.com",
    buildSearchUrl: (input: ScanInput) => {
      if (!input.fullName) return null;

      const nameParts = input.fullName.trim().split(/\s+/);
      if (nameParts.length < 2) return null;

      const firstName = formatNameForUrl(nameParts[0]);
      const lastName = formatNameForUrl(nameParts[nameParts.length - 1]);

      // PeopleLooker is a paywall SPA — search paths redirect to generic page.
      return `https://www.peoplelooker.com/people-search/${firstName}-${lastName}`;
    },
  });
}

export function createNuwberManualScanner(): ManualCheckScanner {
  return new ManualCheckScanner({
    name: "Nuwber",
    source: "NUWBER",
    baseUrl: "https://nuwber.com",
    optOutUrl: "https://nuwber.com/removal/link",
    profileBasedConfidence: true,
    optOutInstructions:
      "1. Go to nuwber.com and search for your name\n" +
      "2. Find your listing in the results\n" +
      "3. Click 'View Details' on your profile\n" +
      "4. Go to nuwber.com/removal/link\n" +
      "5. Paste your profile URL and submit\n" +
      "6. Removal typically takes 7 days",
    estimatedRemovalDays: 7,
    privacyEmail: "privacy@nuwber.com",
    buildSearchUrl: (input: ScanInput) => {
      if (!input.fullName) return null;

      const nameParts = input.fullName.trim().split(/\s+/);
      if (nameParts.length < 2) return null;

      const fullName = encodeURIComponent(input.fullName.trim());

      let url = `https://nuwber.com/search?name=${fullName}`;
      if (input.addresses?.length) {
        const addr = input.addresses[0];
        if (addr.state) {
          url += `&state=${encodeURIComponent(addr.state)}`;
        }
      }
      return url;
    },
  });
}

export function createCheckPeopleManualScanner(): ManualCheckScanner {
  return new ManualCheckScanner({
    name: "CheckPeople",
    source: "CHECKPEOPLE",
    baseUrl: "https://www.checkpeople.com",
    optOutUrl: "https://www.checkpeople.com/opt-out",
    profileBasedConfidence: true,
    optOutInstructions:
      "1. Go to checkpeople.com and search for your name\n" +
      "2. Find your listing in the results\n" +
      "3. Go to checkpeople.com/opt-out\n" +
      "4. Enter your email address for verification\n" +
      "5. Click the confirmation link in your email\n" +
      "6. Removal typically takes 7 days",
    estimatedRemovalDays: 7,
    privacyEmail: "privacy@checkpeople.com",
    buildSearchUrl: (input: ScanInput) => {
      if (!input.fullName) return null;

      const nameParts = input.fullName.trim().split(/\s+/);
      if (nameParts.length < 2) return null;

      const fullName = encodeURIComponent(input.fullName.trim());

      let url = `https://www.checkpeople.com/search/results?name=${fullName}`;
      if (input.addresses?.length) {
        const addr = input.addresses[0];
        if (addr.state) {
          url += `&state=${encodeURIComponent(addr.state)}`;
        }
      }
      return url;
    },
  });
}
