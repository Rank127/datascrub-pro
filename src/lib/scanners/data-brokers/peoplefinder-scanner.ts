import {
  BaseBrokerScanner,
  type BrokerConfig,
  type BrokerSearchResult,
} from "./base-broker-scanner";
import type { ScanInput } from "../base-scanner";

export class PeopleFinderScanner extends BaseBrokerScanner {
  config: BrokerConfig = {
    name: "PeopleFinders",
    source: "PEOPLEFINDER",
    baseUrl: "https://www.peoplefinders.com",
    searchUrl: "https://www.peoplefinders.com/people",
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

    const firstName = this.formatNameForUrl(nameParts[0]);
    const lastName = this.formatNameForUrl(nameParts[nameParts.length - 1]);

    // Format: /people/firstname-lastname/city-state
    let url = `${this.config.searchUrl}/${firstName}-${lastName}`;

    // Add location if available
    if (input.addresses?.length) {
      const addr = input.addresses[0];
      const city = this.formatNameForUrl(addr.city);
      const state = this.formatStateForUrl(addr.state);
      url += `/${city}-${state}`;
    }

    return url;
  }

  protected parseSearchResults(html: string, input: ScanInput): BrokerSearchResult {
    const result: BrokerSearchResult = {
      found: false,
    };

    // Check for results
    const hasResults =
      html.includes("search-results") ||
      html.includes("person-card") ||
      html.includes("profile-results") ||
      html.includes("View Profile") ||
      (input.fullName && this.nameInHtml(html, input.fullName));

    // Check for no results
    const noResults =
      html.includes("No results") ||
      html.includes("We couldn't find") ||
      html.includes("0 results") ||
      html.includes("No people found");

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
        /(?:Lives in|Location|City)[:\s]*([^<]+(?:,\s*[A-Z]{2}))/i
      );
      if (locationMatch) {
        result.location = locationMatch[1].trim();
      }

      // Extract age
      const ageMatch = html.match(/(?:Age|age)[:\s]*(\d+)/);
      if (ageMatch) {
        result.age = ageMatch[1];
      }

      // Count data points
      const addressCount = (html.match(/(?:address|addresses|lived)/gi) || []).length;
      if (addressCount > 0) {
        result.addresses = new Array(Math.min(addressCount, 5)).fill("Address on file");
      }

      const phoneCount = (html.match(/(?:phone|phones|mobile)/gi) || []).length;
      if (phoneCount > 0) {
        result.phones = new Array(Math.min(phoneCount, 3)).fill("Phone on file");
      }

      const relativesMatch = html.match(/(\d+)\s*(?:relatives|family)/i);
      if (relativesMatch) {
        result.relatives = new Array(parseInt(relativesMatch[1])).fill("Relative");
      }
    }

    return result;
  }
}
