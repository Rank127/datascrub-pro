import {
  BaseBrokerScanner,
  type BrokerConfig,
  type BrokerSearchResult,
} from "./base-broker-scanner";
import type { ScanInput } from "../base-scanner";

export class TruePeopleSearchScanner extends BaseBrokerScanner {
  config: BrokerConfig = {
    name: "TruePeopleSearch",
    source: "TRUEPEOPLESEARCH",
    baseUrl: "https://www.truepeoplesearch.com",
    searchUrl: "https://www.truepeoplesearch.com/results",
    optOutUrl: "https://www.truepeoplesearch.com/removal",
    optOutInstructions:
      "1. Go to truepeoplesearch.com and search for your name\n" +
      "2. Find your listing and click to view your profile\n" +
      "3. Scroll down and click 'Remove This Record'\n" +
      "4. Complete the CAPTCHA verification\n" +
      "5. Your listing will be removed within minutes",
    estimatedRemovalDays: 1,
    requiresVerification: false,
    usePremiumProxy: true, // Strong bot detection requires residential IPs
    rateLimit: {
      requestsPerMinute: 10,
      delayMs: 2000,
    },
  };

  protected buildSearchUrl(input: ScanInput): string | null {
    if (!input.fullName) return null;

    const name = encodeURIComponent(input.fullName.trim());
    let url = `${this.config.searchUrl}?name=${name}`;

    // Add location if available
    if (input.addresses?.length) {
      const addr = input.addresses[0];
      url += `&citystatezip=${encodeURIComponent(addr.city + ", " + addr.state)}`;
    }

    return url;
  }

  protected parseSearchResults(html: string, input: ScanInput): BrokerSearchResult {
    const result: BrokerSearchResult = {
      found: false,
    };

    // Check for results
    const hasResults =
      html.includes("card-summary") ||
      html.includes("people-list") ||
      html.includes("result-item") ||
      html.includes("View Free Details") ||
      (input.fullName && this.nameInHtml(html, input.fullName));

    // Check for no results
    const noResults =
      html.includes("No results found") ||
      html.includes("We couldn't find") ||
      html.includes("0 Records Found") ||
      html.includes("Try modifying your search");

    if (noResults) {
      return result;
    }

    if (hasResults) {
      result.found = true;

      // Extract profile URL
      const profileUrlMatch = html.match(/href="(\/find\/person\/[^"]+)"/);
      if (profileUrlMatch) {
        result.profileUrl = `${this.config.baseUrl}${profileUrlMatch[1]}`;
      }

      // Extract location from the results
      const locationMatch = html.match(
        /<span[^>]*class="[^"]*location[^"]*"[^>]*>([^<]+)<\/span>/i
      );
      if (locationMatch) {
        result.location = locationMatch[1].trim();
      } else {
        // Try another pattern
        const cityStateMatch = html.match(/([A-Za-z\s]+),\s*([A-Z]{2})\s*\d{5}/);
        if (cityStateMatch) {
          result.location = `${cityStateMatch[1]}, ${cityStateMatch[2]}`;
        }
      }

      // Extract age
      const ageMatch = html.match(/(?:Age|age)[:\s]*(\d+)/);
      if (ageMatch) {
        result.age = ageMatch[1];
      }

      // This site often shows full details including:
      // - Current and past addresses
      // - Phone numbers
      // - Relatives
      // - Email addresses

      // Count addresses
      const addressMatches = html.match(/(?:current address|past address|address)/gi);
      if (addressMatches) {
        result.addresses = new Array(Math.min(addressMatches.length, 10)).fill(
          "Address on file"
        );
      }

      // Count phones
      const phoneMatches = html.match(/\(\d{3}\)\s*\d{3}-\d{4}/g);
      if (phoneMatches) {
        result.phones = phoneMatches.slice(0, 5);
      }

      // Count relatives
      const relativesMatch = html.match(/(\d+)\s*(?:relatives|possible relatives)/i);
      if (relativesMatch) {
        result.relatives = new Array(parseInt(relativesMatch[1])).fill("Relative");
      }

      // Check for email
      const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        result.emails = [emailMatch[0]];
      }
    }

    return result;
  }
}
