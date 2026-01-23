import {
  BaseBrokerScanner,
  type BrokerConfig,
  type BrokerSearchResult,
} from "./base-broker-scanner";
import type { ScanInput } from "../base-scanner";

export class InteliusScanner extends BaseBrokerScanner {
  config: BrokerConfig = {
    name: "Intelius",
    source: "INTELIUS",
    baseUrl: "https://www.intelius.com",
    searchUrl: "https://www.intelius.com/people-search",
    optOutUrl: "https://www.intelius.com/opt-out",
    optOutInstructions:
      "1. Go to intelius.com/opt-out\n" +
      "2. Search for your name and location\n" +
      "3. Select your listing from the results\n" +
      "4. Enter your email address\n" +
      "5. Click the verification link sent to your email\n" +
      "6. Your information will be removed within 72 hours",
    estimatedRemovalDays: 3,
    privacyEmail: "privacy@intelius.com",
    requiresVerification: true,
    usePremiumProxy: true, // Strong bot detection requires residential IPs
    rateLimit: {
      requestsPerMinute: 5,
      delayMs: 3000,
    },
  };

  protected buildSearchUrl(input: ScanInput): string | null {
    if (!input.fullName) return null;

    const nameParts = input.fullName.trim().split(/\s+/);
    if (nameParts.length < 2) return null;

    const firstName = nameParts[0].toLowerCase();
    const lastName = nameParts[nameParts.length - 1].toLowerCase();

    // Format: /people-search/first-last (no city-state - Intelius doesn't support it)
    return `${this.config.searchUrl}/${firstName}-${lastName}`;
  }

  protected parseSearchResults(html: string, input: ScanInput): BrokerSearchResult {
    const result: BrokerSearchResult = {
      found: false,
    };

    // Check for results
    const hasResults =
      html.includes("search-results") ||
      html.includes("person-card") ||
      html.includes("result-item") ||
      html.includes("View Report") ||
      (input.fullName && this.nameInHtml(html, input.fullName));

    // Check for no results
    const noResults =
      html.includes("No results found") ||
      html.includes("We couldn't find") ||
      html.includes("0 results") ||
      html.includes("Try another search");

    if (noResults) {
      return result;
    }

    if (hasResults) {
      result.found = true;

      // Extract profile URL
      const profileUrlMatch = html.match(/href="(\/people\/[^"]+)"/);
      if (profileUrlMatch) {
        result.profileUrl = `${this.config.baseUrl}${profileUrlMatch[1]}`;
      }

      // Extract location
      const locationMatch = html.match(
        /(?:Lives in|Location)[:\s]*([^<]+(?:,\s*[A-Z]{2}))/i
      );
      if (locationMatch) {
        result.location = locationMatch[1].trim();
      }

      // Extract age
      const ageMatch = html.match(/(?:Age|age)[:\s]*(\d+)/);
      if (ageMatch) {
        result.age = ageMatch[1];
      }

      // Count data indicators
      const addressCount = (html.match(/(?:address|addresses)/gi) || []).length;
      if (addressCount > 0) {
        result.addresses = new Array(Math.min(addressCount, 5)).fill("Address on file");
      }

      const phoneCount = (html.match(/(?:phone|phones)/gi) || []).length;
      if (phoneCount > 0) {
        result.phones = new Array(Math.min(phoneCount, 3)).fill("Phone on file");
      }

      const relativesMatch = html.match(/(\d+)\s*(?:relatives|associates)/i);
      if (relativesMatch) {
        result.relatives = new Array(parseInt(relativesMatch[1])).fill("Relative");
      }
    }

    return result;
  }
}
