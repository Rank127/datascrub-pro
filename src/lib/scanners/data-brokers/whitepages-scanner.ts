import {
  BaseBrokerScanner,
  type BrokerConfig,
  type BrokerSearchResult,
} from "./base-broker-scanner";
import type { ScanInput } from "../base-scanner";

export class WhitePagesScanner extends BaseBrokerScanner {
  config: BrokerConfig = {
    name: "WhitePages",
    source: "WHITEPAGES",
    baseUrl: "https://www.whitepages.com",
    searchUrl: "https://www.whitepages.com/name",
    optOutUrl: "https://www.whitepages.com/suppression-requests",
    optOutInstructions:
      "1. Go to whitepages.com and search for your listing\n" +
      "2. Click on your profile to view the full listing\n" +
      "3. Copy the URL of your profile page\n" +
      "4. Visit whitepages.com/suppression-requests\n" +
      "5. Paste your profile URL and enter your phone number\n" +
      "6. You'll receive a verification call - enter the code\n" +
      "7. Your listing will be removed within 24 hours",
    estimatedRemovalDays: 1,
    privacyEmail: "support@whitepages.com",
    requiresVerification: true,
    usePremiumProxy: true, // Strong bot detection requires residential IPs
    rateLimit: {
      requestsPerMinute: 10,
      delayMs: 2000,
    },
  };

  protected buildSearchUrl(input: ScanInput): string | null {
    if (!input.fullName) return null;

    const nameParts = input.fullName.trim().split(/\s+/);
    if (nameParts.length < 2) return null;

    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];

    // Build search URL: /name/First-Last/City-ST
    let url = `${this.config.searchUrl}/${this.formatNameForUrl(firstName)}-${this.formatNameForUrl(lastName)}`;

    // Add location if available
    if (input.addresses?.length) {
      const addr = input.addresses[0];
      const state = this.formatStateForUrl(addr.state).toUpperCase();
      const city = this.formatNameForUrl(addr.city);
      url += `/${city}-${state}`;
    }

    return url;
  }

  protected parseSearchResults(html: string, input: ScanInput): BrokerSearchResult {
    const result: BrokerSearchResult = {
      found: false,
    };

    // Check for search results presence
    const hasResults =
      html.includes('class="serp-results"') ||
      html.includes('class="person-card"') ||
      html.includes("data-person-card") ||
      html.includes('class="results"') ||
      (input.fullName && this.nameInHtml(html, input.fullName));

    // Check for no results
    const noResults =
      html.includes("We couldn't find") ||
      html.includes("No results") ||
      html.includes("0 people found") ||
      html.includes("Try searching again");

    if (noResults) {
      return result;
    }

    if (hasResults) {
      result.found = true;

      // Try to extract profile URL
      const profileUrlMatch = html.match(
        /href="(\/person\/[^"]+)"/
      );
      if (profileUrlMatch) {
        result.profileUrl = `${this.config.baseUrl}${profileUrlMatch[1]}`;
      }

      // Extract location from meta or content
      const locationMatch = html.match(
        /(?:Lives in|Location|Address)[:\s]*([^<,\n]{1,200})/i
      );
      if (locationMatch) {
        result.location = locationMatch[1].trim();
      }

      // Extract age
      const ageMatch = html.match(/(?:Age|age)[:\s]*(\d+)/);
      if (ageMatch) {
        result.age = ageMatch[1];
      }

      // Count relatives mentioned
      const relativesMatch = html.match(/(\d+)\s*(?:relatives|associates|related)/i);
      if (relativesMatch) {
        result.relatives = new Array(parseInt(relativesMatch[1])).fill("Relative");
      }

      // Look for addresses
      const addressMatches = html.match(/(?:address|lived at|residence)/gi);
      if (addressMatches) {
        result.addresses = new Array(Math.min(addressMatches.length, 5)).fill(
          "Address on file"
        );
      }

      // Look for phone numbers
      const phoneMatches = html.match(/(?:\d{3}[-.)]\s*\d{3}[-.)]\s*\d{4}|phone number)/gi);
      if (phoneMatches) {
        result.phones = new Array(Math.min(phoneMatches.length, 3)).fill(
          "Phone on file"
        );
      }
    }

    return result;
  }
}
