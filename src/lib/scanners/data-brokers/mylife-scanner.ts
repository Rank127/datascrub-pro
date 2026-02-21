import {
  BaseBrokerScanner,
  type BrokerConfig,
  type BrokerSearchResult,
} from "./base-broker-scanner";
import type { ScanInput } from "../base-scanner";

export class MyLifeScanner extends BaseBrokerScanner {
  config: BrokerConfig = {
    name: "MyLife",
    source: "MYLIFE",
    baseUrl: "https://www.mylife.com",
    searchUrl: "https://www.mylife.com",
    optOutUrl: "https://www.mylife.com/ccpa/index.pubview",
    optOutInstructions:
      "1. Go to mylife.com/ccpa/index.pubview\n" +
      "2. Submit a CCPA data deletion request\n" +
      "3. You may need to verify your identity\n" +
      "4. MyLife will process the request under CCPA\n" +
      "5. Removal takes up to 14 days to complete",
    estimatedRemovalDays: 14,
    privacyEmail: "privacy@mylife.com",
    requiresVerification: true,
    usePremiumProxy: true,
    rateLimit: {
      requestsPerMinute: 5,
      delayMs: 3000,
    },
  };

  protected buildSearchUrl(input: ScanInput): string | null {
    if (!input.fullName) return null;

    const nameParts = input.fullName.trim().split(/\s+/);
    if (nameParts.length < 2) return null;

    // MyLife uses path-based URLs: /first-last/
    // The old /pub/search?firstName=...&lastName=... endpoint returns 404
    const firstName = nameParts[0].toLowerCase().replace(/[^a-z]/g, "");
    const lastName = nameParts[nameParts.length - 1].toLowerCase().replace(/[^a-z]/g, "");

    return `${this.config.searchUrl}/${firstName}-${lastName}/`;
  }

  protected parseSearchResults(html: string, input: ScanInput): BrokerSearchResult {
    const result: BrokerSearchResult = {
      found: false,
    };

    const hasResults =
      html.includes("search-results") ||
      html.includes("person-card") ||
      html.includes("profile-card") ||
      html.includes("View Profile") ||
      html.includes("reputation-score") ||
      html.includes("Public Records for") ||
      html.includes("Found)") ||
      (input.fullName && this.nameInHtml(html, input.fullName));

    const noResults =
      html.includes("No results found") ||
      html.includes("We couldn't find") ||
      html.includes("no records") ||
      html.includes("0 results");

    if (noResults) {
      return result;
    }

    if (hasResults) {
      result.found = true;

      const profileUrlMatch = html.match(/href="(\/[^"]*profile[^"]+)"/i);
      if (profileUrlMatch) {
        result.profileUrl = `${this.config.baseUrl}${profileUrlMatch[1]}`;
      }

      const locationMatch = html.match(
        /(?:Located in|Lives in|Current City|Location)[:\s]*([^<,]+,\s*[A-Z]{2})/i
      );
      if (locationMatch) {
        result.location = locationMatch[1].trim();
      }

      const ageMatch = html.match(/(?:Age|age)[:\s]*(\d+)/);
      if (ageMatch) {
        result.age = ageMatch[1];
      }

      const addressCount = (html.match(/(?:address|addresses)/gi) || []).length;
      if (addressCount > 0) {
        result.addresses = new Array(Math.min(addressCount, 5)).fill("Address on file");
      }

      const phoneCount = (html.match(/(?:phone|phones)/gi) || []).length;
      if (phoneCount > 0) {
        result.phones = new Array(Math.min(phoneCount, 3)).fill("Phone on file");
      }

      const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        result.emails = [emailMatch[0]];
      }

      const relativesMatch = html.match(/(\d+)\s*(?:relatives|associates|family)/i);
      if (relativesMatch) {
        result.relatives = new Array(parseInt(relativesMatch[1])).fill("Relative");
      }
    }

    return result;
  }
}
