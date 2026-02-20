import {
  BaseBrokerScanner,
  type BrokerConfig,
  type BrokerSearchResult,
} from "./base-broker-scanner";
import type { ScanInput } from "../base-scanner";

export class CheckPeopleScanner extends BaseBrokerScanner {
  config: BrokerConfig = {
    name: "CheckPeople",
    source: "CHECKPEOPLE",
    baseUrl: "https://www.checkpeople.com",
    searchUrl: "https://www.checkpeople.com/search/results",
    optOutUrl: "https://www.checkpeople.com/opt-out",
    optOutInstructions:
      "1. Go to checkpeople.com/opt-out\n" +
      "2. Search for your name and state\n" +
      "3. Find your listing and click 'Remove'\n" +
      "4. Enter your email address for verification\n" +
      "5. Click the confirmation link in your email\n" +
      "6. Removal typically takes 7 days",
    estimatedRemovalDays: 7,
    privacyEmail: "privacy@checkpeople.com",
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

    const fullName = encodeURIComponent(input.fullName.trim());
    let url = `${this.config.searchUrl}?name=${fullName}`;

    if (input.addresses?.length) {
      const addr = input.addresses[0];
      if (addr.state) {
        const state = this.formatStateForUrl(addr.state);
        url += `&state=${state.toUpperCase()}`;
      }
    }

    return url;
  }

  protected parseSearchResults(html: string, input: ScanInput): BrokerSearchResult {
    const result: BrokerSearchResult = {
      found: false,
    };

    const hasResults =
      html.includes("search-results") ||
      html.includes("person-card") ||
      html.includes("result-card") ||
      html.includes("View Report") ||
      html.includes("View Full Report") ||
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

      const profileUrlMatch = html.match(/href="(\/search\/[^"]+|\/result\/[^"]+)"/);
      if (profileUrlMatch) {
        result.profileUrl = `${this.config.baseUrl}${profileUrlMatch[1]}`;
      }

      const locationMatch = html.match(
        /(?:Located in|Lives in|Current City)[:\s]*([^<,]+,\s*[A-Z]{2})/i
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

      const relativesMatch = html.match(/(\d+)\s*(?:relatives|associates)/i);
      if (relativesMatch) {
        result.relatives = new Array(parseInt(relativesMatch[1])).fill("Relative");
      }
    }

    return result;
  }
}
