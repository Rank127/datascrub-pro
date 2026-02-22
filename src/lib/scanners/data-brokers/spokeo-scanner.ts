import {
  BaseBrokerScanner,
  type BrokerConfig,
  type BrokerSearchResult,
} from "./base-broker-scanner";
import type { ScanInput } from "../base-scanner";

export class SpokeoScanner extends BaseBrokerScanner {
  config: BrokerConfig = {
    name: "Spokeo",
    source: "SPOKEO",
    baseUrl: "https://www.spokeo.com",
    searchUrl: "https://www.spokeo.com/search",
    optOutUrl: "https://www.spokeo.com/optout",
    optOutInstructions:
      "1. Go to Spokeo.com and search for your listing\n" +
      "2. Copy the URL of your profile\n" +
      "3. Visit spokeo.com/optout\n" +
      "4. Paste the profile URL and enter your email\n" +
      "5. Click the confirmation link sent to your email\n" +
      "6. Your listing will be removed within 24-48 hours",
    estimatedRemovalDays: 3,
    privacyEmail: "privacy@spokeo.com",
    requiresVerification: true,
    usePremiumProxy: true,
    rateLimit: {
      requestsPerMinute: 10,
      delayMs: 2000, // Reduced for parallel execution
    },
  };

  protected buildSearchUrl(input: ScanInput): string | null {
    if (!input.fullName) return null;

    const nameParts = input.fullName.trim().split(/\s+/);
    if (nameParts.length < 2) return null;

    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];

    // Build search URL - Spokeo uses /FirstName-LastName/State format
    let url = `${this.config.baseUrl}/${encodeURIComponent(firstName)}-${encodeURIComponent(lastName)}`;

    // Add state only (Spokeo doesn't accept city in URL)
    if (input.addresses?.length) {
      const addr = input.addresses[0];
      if (addr.state) {
        const state = this.getFullStateName(addr.state);
        url += `/${state}`;
      }
    }

    return url;
  }

  // Convert state abbreviation to full name for Spokeo URL
  private getFullStateName(state: string): string {
    const stateMap: Record<string, string> = {
      al: "Alabama", ak: "Alaska", az: "Arizona", ar: "Arkansas",
      ca: "California", co: "Colorado", ct: "Connecticut", de: "Delaware",
      fl: "Florida", ga: "Georgia", hi: "Hawaii", id: "Idaho",
      il: "Illinois", in: "Indiana", ia: "Iowa", ks: "Kansas",
      ky: "Kentucky", la: "Louisiana", me: "Maine", md: "Maryland",
      ma: "Massachusetts", mi: "Michigan", mn: "Minnesota", ms: "Mississippi",
      mo: "Missouri", mt: "Montana", ne: "Nebraska", nv: "Nevada",
      nh: "New-Hampshire", nj: "New-Jersey", nm: "New-Mexico",
      ny: "New-York", nc: "North-Carolina", nd: "North-Dakota",
      oh: "Ohio", ok: "Oklahoma", or: "Oregon", pa: "Pennsylvania",
      ri: "Rhode-Island", sc: "South-Carolina", sd: "South-Dakota",
      tn: "Tennessee", tx: "Texas", ut: "Utah", vt: "Vermont",
      va: "Virginia", wa: "Washington", wv: "West-Virginia",
      wi: "Wisconsin", wy: "Wyoming", dc: "District-of-Columbia",
    };

    const normalized = state.toLowerCase().trim();
    // If already a full state name, capitalize and hyphenate
    if (normalized.length > 2) {
      return normalized.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
    }
    return stateMap[normalized] || state;
  }

  protected parseSearchResults(html: string, input: ScanInput): BrokerSearchResult {
    const result: BrokerSearchResult = {
      found: false,
    };

    // Check for "no results" indicators FIRST
    const noResults =
      html.includes("We did not find") ||
      html.includes("No results found") ||
      html.includes("0 results") ||
      html.includes("0 matches") ||
      html.includes("Try a different search") ||
      html.includes("no matching records");

    if (noResults) {
      console.log(`[Spokeo] No results indicator found`);
      return result;
    }

    // Check title for match count (e.g., "Rakesh Kathuria, Georgia (1 match)")
    const titleMatch = html.match(/<title>([^<]+)\((\d+)\s*match/i);
    const hasMatchInTitle = titleMatch && parseInt(titleMatch[2]) > 0;

    // Check for various result indicators
    const hasResults =
      hasMatchInTitle ||
      html.includes("person-card") ||
      html.includes("result-card") ||
      html.includes("data-link-to-full-profile") ||
      html.includes("View Full Profile") ||
      html.includes("See Full Results") ||
      (input.fullName && this.nameInHtml(html, input.fullName));

    console.log(`[Spokeo] Parse: hasMatchInTitle=${hasMatchInTitle}, hasResults=${hasResults}`);

    if (hasResults) {
      result.found = true;

      // Try to extract profile URL - multiple patterns
      const profileUrlPatterns = [
        /href="(\/[^"]+)"[^>]*data-link-to-full-profile/,
        /href="(\/[A-Z][a-z]+-[A-Z][a-z]+\/[^"]+)"/,
        /<a[^>]*href="(\/[^"]+)"[^>]*>View/i,
      ];

      for (const pattern of profileUrlPatterns) {
        const match = html.match(pattern);
        if (match) {
          result.profileUrl = `${this.config.baseUrl}${match[1]}`;
          break;
        }
      }

      // Extract location from title or content
      if (titleMatch) {
        const locationFromTitle = titleMatch[1].split(",")[1]?.trim().split("(")[0]?.trim();
        if (locationFromTitle) {
          result.location = locationFromTitle;
        }
      }
      if (!result.location) {
        const locationMatch = html.match(/(?:Lives in|Located in|Location)[:\s]*([^<,\n]{1,200})/i);
        if (locationMatch) {
          result.location = locationMatch[1].trim();
        }
      }

      // Extract age - multiple patterns
      const agePatterns = [
        /age[:\s]*(\d+)/i,
        /(\d+)\s*years?\s*old/i,
        /"age"[:\s]*(\d+)/,
      ];
      for (const pattern of agePatterns) {
        const match = html.match(pattern);
        if (match) {
          result.age = match[1];
          break;
        }
      }

      // Look for relative count
      const relativesMatch = html.match(/(\d+)\s*(?:relatives|family members|associated people)/i);
      if (relativesMatch) {
        result.relatives = new Array(Math.min(parseInt(relativesMatch[1]), 10)).fill("Relative");
      }

      // Look for address indicators
      const hasAddress = html.toLowerCase().includes("address") ||
                        html.includes("Current Address") ||
                        html.includes("Past Address");
      if (hasAddress) {
        result.addresses = ["Address on file"];
      }

      // Look for phone indicators
      const hasPhone = html.toLowerCase().includes("phone") ||
                      html.includes("Mobile") ||
                      html.includes("Landline");
      if (hasPhone) {
        result.phones = ["Phone on file"];
      }

      // Look for email indicators
      const hasEmail = html.toLowerCase().includes("email") ||
                      html.includes("@");
      if (hasEmail) {
        result.emails = ["Email on file"];
      }

      console.log(`[Spokeo] Found profile: location=${result.location}, age=${result.age}`);
    }

    return result;
  }
}
