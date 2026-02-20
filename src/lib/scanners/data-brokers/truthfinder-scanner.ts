import {
  BaseBrokerScanner,
  type BrokerConfig,
  type BrokerSearchResult,
} from "./base-broker-scanner";
import type { ScanInput } from "../base-scanner";

export class TruthFinderScanner extends BaseBrokerScanner {
  config: BrokerConfig = {
    name: "TruthFinder",
    source: "TRUTHFINDER",
    baseUrl: "https://www.truthfinder.com",
    searchUrl: "https://www.truthfinder.com/results/",
    optOutUrl: "https://www.truthfinder.com/opt-out/",
    optOutInstructions:
      "1. Go to truthfinder.com/opt-out/\n" +
      "2. Search for your name and state\n" +
      "3. Find your listing and click 'Remove This Record'\n" +
      "4. Enter your email address for verification\n" +
      "5. Click the confirmation link sent to your email\n" +
      "6. Removal takes up to 14 days to process",
    estimatedRemovalDays: 14,
    privacyEmail: "privacy@truthfinder.com",
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

    const firstName = encodeURIComponent(nameParts[0]);
    const lastName = encodeURIComponent(nameParts[nameParts.length - 1]);

    let url = `${this.config.searchUrl}?firstName=${firstName}&lastName=${lastName}`;

    if (input.addresses?.length) {
      const addr = input.addresses[0];
      const state = this.formatStateForUrl(addr.state);
      url += `&state=${state.toUpperCase()}`;
    }

    return url;
  }

  protected parseSearchResults(html: string, input: ScanInput): BrokerSearchResult {
    const result: BrokerSearchResult = {
      found: false,
    };

    const hasResults =
      html.includes("record-card") ||
      html.includes("person-card") ||
      html.includes("search-result") ||
      html.includes("View Report") ||
      html.includes("View Details") ||
      (input.fullName && this.nameInHtml(html, input.fullName));

    const noResults =
      html.includes("No results found") ||
      html.includes("We couldn't find") ||
      html.includes("no records found") ||
      html.includes("0 results");

    if (noResults) {
      return result;
    }

    if (hasResults) {
      result.found = true;

      const profileUrlMatch = html.match(/href="(\/results\/[^"]+)"/);
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
