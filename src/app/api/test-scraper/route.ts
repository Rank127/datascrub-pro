import { NextResponse } from "next/server";
import { scrapeUrl, isScrapingServiceEnabled } from "@/lib/scanners/scraping-service";

// Brokers that need premium proxy (residential IPs) due to strong bot detection
const premiumProxyBrokers = new Set([
  "whitepages",
  "beenverified",
  "truepeoplesearch",
  "fastpeoplesearch",
  "radaris",
  "intelius",
  "peoplefinders",
]);

// State name to abbreviation mapping
const stateAbbreviations: Record<string, string> = {
  alabama: "al", alaska: "ak", arizona: "az", arkansas: "ar", california: "ca",
  colorado: "co", connecticut: "ct", delaware: "de", florida: "fl", georgia: "ga",
  hawaii: "hi", idaho: "id", illinois: "il", indiana: "in", iowa: "ia",
  kansas: "ks", kentucky: "ky", louisiana: "la", maine: "me", maryland: "md",
  massachusetts: "ma", michigan: "mi", minnesota: "mn", mississippi: "ms",
  missouri: "mo", montana: "mt", nebraska: "ne", nevada: "nv",
  "new hampshire": "nh", "new jersey": "nj", "new mexico": "nm", "new york": "ny",
  "north carolina": "nc", "north dakota": "nd", ohio: "oh", oklahoma: "ok",
  oregon: "or", pennsylvania: "pa", "rhode island": "ri", "south carolina": "sc",
  "south dakota": "sd", tennessee: "tn", texas: "tx", utah: "ut", vermont: "vt",
  virginia: "va", washington: "wa", "west virginia": "wv", wisconsin: "wi",
  wyoming: "wy", "district of columbia": "dc"
};

function getStateAbbreviation(state: string): string {
  const normalized = state.toLowerCase().trim().replace(/-/g, " ");
  return stateAbbreviations[normalized] || state.toLowerCase();
}

// URL builders for each broker
const brokerUrls: Record<string, (name: string, city: string, state: string) => string> = {
  spokeo: (name, city, state) => `https://www.spokeo.com/${name}/${state}`,
  whitepages: (name, city, state) => {
    const stateAbbr = getStateAbbreviation(state).toUpperCase();
    return `https://www.whitepages.com/name/${name.toLowerCase()}/${city.toLowerCase()}-${stateAbbr}`;
  },
  beenverified: (name, city, state) => {
    const stateAbbr = getStateAbbreviation(state);
    return `https://www.beenverified.com/people/${name.toLowerCase()}/${stateAbbr}/`;
  },
  truepeoplesearch: (name, city, state) => `https://www.truepeoplesearch.com/results?name=${encodeURIComponent(name.replace(/-/g, ' '))}&citystatezip=${encodeURIComponent(city.replace(/-/g, ' ') + ', ' + state)}`,
  fastpeoplesearch: (name, city, state) => {
    const stateAbbr = getStateAbbreviation(state);
    return `https://www.fastpeoplesearch.com/name/${name.toLowerCase()}_${city.toLowerCase()}-${stateAbbr}`;
  },
  radaris: (name, city, state) => {
    const [first, last] = name.split('-');
    // Radaris only works with /p/First/Last/ format (no city-state)
    return `https://radaris.com/p/${first}/${last}/`;
  },
  intelius: (name, city, state) => {
    // Intelius only works with /people-search/first-last format (no city-state)
    return `https://www.intelius.com/people-search/${name.toLowerCase()}`;
  },
  peoplefinders: (name, city, state) => {
    const stateAbbr = getStateAbbreviation(state);
    return `https://www.peoplefinders.com/people/${name.toLowerCase()}/${city.toLowerCase()}-${stateAbbr}`;
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const broker = searchParams.get("broker") || "spokeo";
  const name = searchParams.get("name") || "John-Smith";
  const city = searchParams.get("city") || "Los-Angeles";
  const state = searchParams.get("state") || "California";
  const forcePremium = searchParams.get("premium") === "true";
  const forceStealth = searchParams.get("stealth") === "true";

  const urlBuilder = brokerUrls[broker.toLowerCase()];
  if (!urlBuilder) {
    return NextResponse.json({ error: `Unknown broker: ${broker}. Available: ${Object.keys(brokerUrls).join(', ')}` }, { status: 400 });
  }

  const testUrl = urlBuilder(name, city, state);
  const noProxy = searchParams.get("noproxy") === "true";
  const usePremiumProxy = !noProxy && !forceStealth && (forcePremium || premiumProxyBrokers.has(broker.toLowerCase()));
  const useStealthProxy = !noProxy && forceStealth;

  const result: Record<string, unknown> = {
    broker,
    scrapingServiceEnabled: isScrapingServiceEnabled(),
    testUrl,
    searchName: name,
    searchCity: city,
    searchState: state,
    usePremiumProxy,
    useStealthProxy,
  };

  // Debug mode - test ScrapingBee directly to see raw errors
  const debug = searchParams.get("debug") === "true";

  try {
    const scrapeResult = await scrapeUrl(testUrl, {
      renderJs: true,
      timeout: 30000,
      premiumProxy: usePremiumProxy,
      stealthProxy: useStealthProxy
    });

    // In debug mode, also store the raw error if any
    if (debug && !scrapeResult.success) {
      result.debugError = scrapeResult.error;
      result.debugStatusCode = scrapeResult.statusCode;
      result.debugHtmlLength = scrapeResult.html?.length || 0;
      // First 500 chars of HTML (might be error page)
      result.debugHtmlPreview = scrapeResult.html?.substring(0, 500) || "";
    }
    const html = scrapeResult.html;
    const htmlLower = html.toLowerCase();

    // Analyze the HTML content
    result.scrapeResult = {
      success: scrapeResult.success,
      htmlLength: html.length,
      statusCode: scrapeResult.statusCode,
      error: scrapeResult.error,
    };

    // Check for various indicators
    result.analysis = {
      // No results indicators
      hasNoResults: html.includes("We did not find") ||
                   html.includes("No results found") ||
                   html.includes("0 results") ||
                   html.includes("Try a different search"),

      // Results indicators
      hasResultsPage: html.includes("results-page") || html.includes("People Search Results"),
      hasProfilePage: html.includes("profile-page") || html.includes("data-link-to-full-profile"),
      hasPersonCard: html.includes("person-card") || html.includes("result-card"),

      // Name detection
      nameInPage: name.split("-").every(part => htmlLower.includes(part.toLowerCase())),

      // Data indicators
      hasAgeInfo: /age[:\s]*\d+/i.test(html),
      hasAddressInfo: html.includes("address") || html.includes("Address"),
      hasPhoneInfo: html.includes("phone") || html.includes("Phone"),
      hasRelatives: html.includes("relative") || html.includes("Relative"),

      // Profile URL patterns
      profileUrls: (html.match(/href="(\/[^"]+)"[^>]*data-link-to-full-profile/g) || []).slice(0, 3),
    };

    // Get a snippet around name if found
    const nameIndex = htmlLower.indexOf(name.split("-")[0].toLowerCase());
    if (nameIndex > 0) {
      result.snippetAroundName = html.substring(Math.max(0, nameIndex - 100), nameIndex + 200).replace(/\s+/g, ' ');
    }

  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(result, { status: 200 });
}
