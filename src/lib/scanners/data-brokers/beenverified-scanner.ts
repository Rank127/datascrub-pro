import {
  BaseBrokerScanner,
  type BrokerConfig,
  type BrokerSearchResult,
} from "./base-broker-scanner";
import type { ScanInput } from "../base-scanner";

export class BeenVerifiedScanner extends BaseBrokerScanner {
  config: BrokerConfig = {
    name: "BeenVerified",
    source: "BEENVERIFIED",
    baseUrl: "https://www.beenverified.com",
    searchUrl: "https://www.beenverified.com/people",
    optOutUrl: "https://www.beenverified.com/f/optout/search",
    optOutInstructions:
      "1. Go to beenverified.com/f/optout/search\n" +
      "2. Search for your name and state\n" +
      "3. Find your listing and click 'Remove My Info'\n" +
      "4. Enter your email address to receive verification\n" +
      "5. Click the link in the confirmation email\n" +
      "6. Your information will be removed within 24 hours",
    estimatedRemovalDays: 1,
    privacyEmail: "privacy@beenverified.com",
    requiresVerification: true,
    useStealthProxy: true, // Paywall + Cloudflare — premium proxy gets blocked, stealth required
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

    // Build search URL: /people/first-last
    let url = `${this.config.searchUrl}/${firstName}-${lastName}`;

    // Add location if available
    if (input.addresses?.length) {
      const addr = input.addresses[0];
      const state = this.formatStateForUrl(addr.state);
      url += `/${state}`;
    }

    return url;
  }

  protected parseSearchResults(html: string, input: ScanInput): BrokerSearchResult {
    const result: BrokerSearchResult = {
      found: false,
    };

    // Check for results indicators
    const hasResults =
      html.includes("people-search-results") ||
      html.includes("person-card") ||
      html.includes("search-result") ||
      html.includes("View Report") ||
      (input.fullName && this.nameInHtml(html, input.fullName));

    // Check for no results
    const noResults =
      html.includes("No results found") ||
      html.includes("We couldn't find") ||
      html.includes("Try another search") ||
      html.includes("0 results");

    if (noResults) {
      return result;
    }

    if (hasResults) {
      result.found = true;

      // Extract profile URL
      const profileUrlMatch = html.match(/href="(\/pp\/[^"]+)"/);
      if (profileUrlMatch) {
        result.profileUrl = `${this.config.baseUrl}${profileUrlMatch[1]}`;
      }

      // Extract location
      const locationMatch = html.match(
        /(?:Located in|Lives in|Current City)[:\s]*([^<]+)/i
      );
      if (locationMatch) {
        result.location = locationMatch[1].trim().replace(/\s+/g, " ");
      }

      // Extract age
      const ageMatch = html.match(/(?:Age|age)[:\s]*(\d+)/);
      if (ageMatch) {
        result.age = ageMatch[1];
      }

      // Count data points mentioned
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
