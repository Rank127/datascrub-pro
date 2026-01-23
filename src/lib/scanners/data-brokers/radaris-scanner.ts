import {
  BaseBrokerScanner,
  type BrokerConfig,
  type BrokerSearchResult,
} from "./base-broker-scanner";
import type { ScanInput } from "../base-scanner";

export class RadarisScanner extends BaseBrokerScanner {
  config: BrokerConfig = {
    name: "Radaris",
    source: "RADARIS",
    baseUrl: "https://radaris.com",
    searchUrl: "https://radaris.com/p",
    optOutUrl: "https://radaris.com/control/privacy",
    optOutInstructions:
      "1. Go to radaris.com and search for your name\n" +
      "2. Find your listing and view your profile\n" +
      "3. Click 'Control Info' or go to radaris.com/control/privacy\n" +
      "4. You'll need to create an account to remove your info\n" +
      "5. Verify your identity via phone or email\n" +
      "6. Request removal of your profile\n" +
      "7. Removal takes 24-48 hours but may require follow-up",
    estimatedRemovalDays: 7,
    privacyEmail: "support@radaris.com",
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

    // Format: /p/First/Last/ (no city-state - Radaris doesn't support it in URL)
    const firstName = this.capitalizeFirst(nameParts[0]);
    const lastName = this.capitalizeFirst(nameParts[nameParts.length - 1]);

    // Radaris only works with /p/First/Last/ format
    return `${this.config.searchUrl}/${firstName}/${lastName}/`;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  protected parseSearchResults(html: string, input: ScanInput): BrokerSearchResult {
    const result: BrokerSearchResult = {
      found: false,
    };

    // Check for results
    const hasResults =
      html.includes("person-card") ||
      html.includes("profile-details") ||
      html.includes("search-result") ||
      html.includes("View Full Profile") ||
      html.includes("View Details") ||
      (input.fullName && this.nameInHtml(html, input.fullName));

    // Check for no results
    const noResults =
      html.includes("No results found") ||
      html.includes("We couldn't find") ||
      html.includes("Person not found") ||
      html.includes("0 results");

    if (noResults) {
      return result;
    }

    if (hasResults) {
      result.found = true;

      // Extract profile URL
      const profileUrlMatch = html.match(/href="(\/p\/[^"]+\/[^"]+)"/);
      if (profileUrlMatch) {
        result.profileUrl = `${this.config.baseUrl}${profileUrlMatch[1]}`;
      }

      // Extract location
      const locationMatch = html.match(
        /(?:Located in|Lives in|Current Location)[:\s]*([^<,]+,\s*[A-Z]{2})/i
      );
      if (locationMatch) {
        result.location = locationMatch[1].trim();
      }

      // Extract age
      const ageMatch = html.match(/(?:Age|age)[:\s]*(\d+)/);
      if (ageMatch) {
        result.age = ageMatch[1];
      }

      // Radaris shows extensive data
      // Count addresses
      const addressCount = (html.match(/(?:address|addresses|lived at)/gi) || []).length;
      if (addressCount > 0) {
        result.addresses = new Array(Math.min(addressCount, 10)).fill("Address on file");
      }

      // Count phones
      const phoneCount = (html.match(/(?:phone|phones|mobile|landline)/gi) || []).length;
      if (phoneCount > 0) {
        result.phones = new Array(Math.min(phoneCount, 5)).fill("Phone on file");
      }

      // Count relatives
      const relativesMatch = html.match(/(\d+)\s*(?:relatives|family|associates)/i);
      if (relativesMatch) {
        result.relatives = new Array(parseInt(relativesMatch[1])).fill("Relative");
      }

      // Check for email indicators
      const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        result.emails = [emailMatch[0]];
      }
    }

    return result;
  }
}
