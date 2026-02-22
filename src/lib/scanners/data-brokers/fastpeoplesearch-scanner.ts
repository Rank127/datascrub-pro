import {
  BaseBrokerScanner,
  type BrokerConfig,
  type BrokerSearchResult,
} from "./base-broker-scanner";
import type { ScanInput } from "../base-scanner";

export class FastPeopleSearchScanner extends BaseBrokerScanner {
  config: BrokerConfig = {
    name: "FastPeopleSearch",
    source: "FASTPEOPLESEARCH",
    baseUrl: "https://www.fastpeoplesearch.com",
    searchUrl: "https://www.fastpeoplesearch.com/name",
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
    requiresVerification: false,
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

    // Format: /name/firstname-lastname/city-state
    const firstName = this.formatNameForUrl(nameParts[0]);
    const lastName = this.formatNameForUrl(nameParts[nameParts.length - 1]);

    let url = `${this.config.searchUrl}/${firstName}-${lastName}`;

    // Add location if available
    if (input.addresses?.length) {
      const addr = input.addresses[0];
      if (addr.city && addr.state) {
        const city = this.formatNameForUrl(addr.city);
        const state = this.formatStateForUrl(addr.state);
        url += `_${city}-${state}`;
      }
    }

    return url;
  }

  protected parseSearchResults(html: string, input: ScanInput): BrokerSearchResult {
    const result: BrokerSearchResult = {
      found: false,
    };

    // Check for results indicators
    const hasResults =
      html.includes("people-list") ||
      html.includes("search-results") ||
      html.includes("result-card") ||
      html.includes("View Free Details") ||
      html.includes("Full Profile") ||
      (input.fullName && this.nameInHtml(html, input.fullName));

    // Check for no results
    const noResults =
      html.includes("No Results Found") ||
      html.includes("We couldn't find") ||
      html.includes("0 people found") ||
      html.includes("Try a different search");

    if (noResults) {
      return result;
    }

    if (hasResults) {
      result.found = true;

      // Extract profile URL
      const profileUrlMatch = html.match(/href="(\/name\/[^"]+)"/);
      if (profileUrlMatch) {
        result.profileUrl = `${this.config.baseUrl}${profileUrlMatch[1]}`;
      }

      // Extract location
      const locationMatch = html.match(
        /(?:Lives in|Location|Resides)[:\s]*([^<]+(?:,\s*[A-Z]{2}))/i
      );
      if (locationMatch) {
        result.location = locationMatch[1].trim();
      }

      // Extract age
      const ageMatch = html.match(/(?:Age|age)[:\s]*(\d+)/);
      if (ageMatch) {
        result.age = ageMatch[1];
      }

      // FastPeopleSearch shows a lot of data
      // Count addresses
      const addressMatches = html.match(/\d+\s+[A-Za-z\s]+(?:St|Ave|Rd|Blvd|Dr|Ln|Way|Ct|Pl)/gi);
      if (addressMatches) {
        result.addresses = new Array(Math.min(addressMatches.length, 10)).fill(
          "Address on file"
        );
      }

      // Count phone numbers
      const phoneMatches = html.match(/\(\d{3}\)\s*\d{3}-\d{4}|\d{3}-\d{3}-\d{4}/g);
      if (phoneMatches) {
        result.phones = phoneMatches.slice(0, 5);
      }

      // Count relatives
      const relativesSection = html.includes("Possible Relatives") || html.includes("Related To");
      if (relativesSection) {
        const relativeNames = html.match(/<a[^>]*href="\/name\/[^"]*"[^>]*>([^<]+)</gi);
        if (relativeNames) {
          result.relatives = new Array(Math.min(relativeNames.length, 10)).fill("Relative");
        }
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
