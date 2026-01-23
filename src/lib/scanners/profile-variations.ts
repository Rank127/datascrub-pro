/**
 * Profile Variations Service
 *
 * Generates variations of user profile data for comprehensive scanning.
 * Data brokers may store information in different formats, so we need
 * to search for various combinations of names, addresses, etc.
 */

import type { ScanInput } from "./base-scanner";

export interface NameVariation {
  full: string;
  first: string;
  middle?: string;
  last: string;
  suffix?: string;
  type: "original" | "alias" | "initial" | "nickname" | "formal" | "maiden";
}

export interface AddressVariation {
  full: string;
  street: string;
  city: string;
  state: string;
  stateAbbrev: string;
  zipCode: string;
  type: "current" | "previous" | "abbreviated" | "normalized";
}

export interface ProfileVariations {
  names: NameVariation[];
  emails: string[];
  phones: string[];
  addresses: AddressVariation[];
  usernames: string[];
}

// Common name suffixes
const SUFFIXES = ["Jr", "Jr.", "Junior", "Sr", "Sr.", "Senior", "II", "III", "IV", "V"];

// State abbreviation mapping
const STATE_ABBREVIATIONS: Record<string, string> = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
  "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
  "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
  "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
  "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
  "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
  "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
  "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
  "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
  "Wisconsin": "WI", "Wyoming": "WY", "District of Columbia": "DC"
};

// Reverse mapping for abbreviation to full name
const STATE_FULL_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_ABBREVIATIONS).map(([name, abbrev]) => [abbrev, name])
);

// Common nickname mappings
const NICKNAME_MAPPINGS: Record<string, string[]> = {
  "William": ["Bill", "Will", "Billy", "Willy", "Liam"],
  "Robert": ["Bob", "Rob", "Bobby", "Robbie"],
  "Richard": ["Rick", "Rich", "Dick", "Ricky"],
  "Michael": ["Mike", "Mikey", "Mick"],
  "James": ["Jim", "Jimmy", "Jamie"],
  "John": ["Jack", "Johnny", "Jon"],
  "Thomas": ["Tom", "Tommy"],
  "Joseph": ["Joe", "Joey"],
  "Charles": ["Charlie", "Chuck", "Chas"],
  "David": ["Dave", "Davey"],
  "Daniel": ["Dan", "Danny"],
  "Christopher": ["Chris", "Kit"],
  "Matthew": ["Matt", "Matty"],
  "Anthony": ["Tony", "Ant"],
  "Steven": ["Steve", "Stevie"],
  "Stephen": ["Steve", "Stevie"],
  "Andrew": ["Andy", "Drew"],
  "Edward": ["Ed", "Eddie", "Ted", "Teddy"],
  "Benjamin": ["Ben", "Benny"],
  "Nicholas": ["Nick", "Nicky"],
  "Alexander": ["Alex", "Al"],
  "Patrick": ["Pat", "Paddy"],
  "Timothy": ["Tim", "Timmy"],
  "Jonathan": ["Jon", "Jonny"],
  "Samuel": ["Sam", "Sammy"],
  "Gregory": ["Greg", "Gregg"],
  "Kenneth": ["Ken", "Kenny"],
  "Raymond": ["Ray"],
  "Lawrence": ["Larry", "Lars"],
  "Elizabeth": ["Liz", "Beth", "Lizzie", "Betty", "Eliza"],
  "Jennifer": ["Jen", "Jenny"],
  "Katherine": ["Kate", "Katie", "Kathy", "Kay"],
  "Catherine": ["Kate", "Katie", "Cathy", "Kay"],
  "Margaret": ["Maggie", "Meg", "Peggy", "Marge"],
  "Patricia": ["Pat", "Patty", "Trish"],
  "Susan": ["Sue", "Susie"],
  "Jessica": ["Jess", "Jessie"],
  "Rebecca": ["Becky", "Becca"],
  "Samantha": ["Sam", "Sammie"],
  "Victoria": ["Vicky", "Tori"],
  "Stephanie": ["Steph", "Stevie"],
  "Christina": ["Chris", "Tina", "Chrissy"],
  "Alexandra": ["Alex", "Lexi", "Sandra"],
  "Jacqueline": ["Jackie", "Jacqui"],
  "Deborah": ["Deb", "Debbie"],
  "Dorothy": ["Dot", "Dottie", "Dolly"],
  "Barbara": ["Barb", "Barbie"],
  "Kimberly": ["Kim", "Kimmy"],
  "Melissa": ["Mel", "Missy", "Lisa"],
  "Amanda": ["Mandy", "Amy"],
  "Carolyn": ["Carol", "Carrie", "Lynn"],
  "Michelle": ["Shelly", "Micki"],
  "Abigail": ["Abby", "Abbie", "Gail"],
};

/**
 * Parse a full name into components
 */
function parseName(fullName: string): {
  first: string;
  middle?: string;
  last: string;
  suffix?: string;
} {
  const parts = fullName.trim().split(/\s+/);

  // Check for suffix at the end
  let suffix: string | undefined;
  const lastPart = parts[parts.length - 1];
  if (SUFFIXES.some(s => s.toLowerCase() === lastPart.toLowerCase())) {
    suffix = parts.pop();
  }

  if (parts.length === 1) {
    return { first: parts[0], last: "" };
  }

  if (parts.length === 2) {
    return { first: parts[0], last: parts[1], suffix };
  }

  // 3+ parts: first, middle(s), last
  const first = parts[0];
  const last = parts[parts.length - 1];
  const middle = parts.slice(1, -1).join(" ");

  return { first, middle, last, suffix };
}

/**
 * Generate name variations
 */
export function generateNameVariations(
  fullName: string,
  aliases?: string[]
): NameVariation[] {
  const variations: NameVariation[] = [];
  const seen = new Set<string>();

  const addVariation = (variation: NameVariation) => {
    const key = variation.full.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      variations.push(variation);
    }
  };

  // Parse the main name
  const parsed = parseName(fullName);

  // Original name
  addVariation({
    full: fullName,
    first: parsed.first,
    middle: parsed.middle,
    last: parsed.last,
    suffix: parsed.suffix,
    type: "original",
  });

  // Name without middle name
  if (parsed.middle) {
    addVariation({
      full: `${parsed.first} ${parsed.last}${parsed.suffix ? ` ${parsed.suffix}` : ""}`,
      first: parsed.first,
      last: parsed.last,
      suffix: parsed.suffix,
      type: "original",
    });
  }

  // Name with middle initial only
  if (parsed.middle) {
    const middleInitial = parsed.middle.charAt(0);
    addVariation({
      full: `${parsed.first} ${middleInitial}. ${parsed.last}${parsed.suffix ? ` ${parsed.suffix}` : ""}`,
      first: parsed.first,
      middle: `${middleInitial}.`,
      last: parsed.last,
      suffix: parsed.suffix,
      type: "initial",
    });

    // Also without period
    addVariation({
      full: `${parsed.first} ${middleInitial} ${parsed.last}${parsed.suffix ? ` ${parsed.suffix}` : ""}`,
      first: parsed.first,
      middle: middleInitial,
      last: parsed.last,
      suffix: parsed.suffix,
      type: "initial",
    });
  }

  // First initial + last name
  addVariation({
    full: `${parsed.first.charAt(0)}. ${parsed.last}`,
    first: `${parsed.first.charAt(0)}.`,
    last: parsed.last,
    type: "initial",
  });

  // Nickname variations
  const firstNameUpper = parsed.first.charAt(0).toUpperCase() + parsed.first.slice(1).toLowerCase();
  const nicknames = NICKNAME_MAPPINGS[firstNameUpper] || [];

  for (const nickname of nicknames) {
    addVariation({
      full: `${nickname} ${parsed.last}`,
      first: nickname,
      last: parsed.last,
      suffix: parsed.suffix,
      type: "nickname",
    });

    // Nickname with middle
    if (parsed.middle) {
      addVariation({
        full: `${nickname} ${parsed.middle} ${parsed.last}`,
        first: nickname,
        middle: parsed.middle,
        last: parsed.last,
        suffix: parsed.suffix,
        type: "nickname",
      });
    }
  }

  // Process aliases (maiden names, etc.)
  if (aliases) {
    for (const alias of aliases) {
      const aliasParsed = parseName(alias);
      addVariation({
        full: alias,
        first: aliasParsed.first,
        middle: aliasParsed.middle,
        last: aliasParsed.last,
        suffix: aliasParsed.suffix,
        type: "alias",
      });

      // If alias has different last name, combine with original first name
      if (aliasParsed.last !== parsed.last) {
        addVariation({
          full: `${parsed.first} ${aliasParsed.last}`,
          first: parsed.first,
          last: aliasParsed.last,
          type: "maiden",
        });
      }
    }
  }

  return variations;
}

/**
 * Normalize phone number to various formats
 */
export function generatePhoneVariations(phone: string): string[] {
  // Extract digits only
  const digits = phone.replace(/\D/g, "");

  if (digits.length < 10) return [phone];

  // Get last 10 digits (area code + number)
  const tenDigits = digits.slice(-10);
  const areaCode = tenDigits.slice(0, 3);
  const exchange = tenDigits.slice(3, 6);
  const number = tenDigits.slice(6, 10);

  return [
    `${areaCode}${exchange}${number}`,              // 1234567890
    `${areaCode}-${exchange}-${number}`,            // 123-456-7890
    `(${areaCode}) ${exchange}-${number}`,          // (123) 456-7890
    `${areaCode}.${exchange}.${number}`,            // 123.456.7890
    `+1${areaCode}${exchange}${number}`,            // +11234567890
    `+1 ${areaCode}-${exchange}-${number}`,         // +1 123-456-7890
    `1-${areaCode}-${exchange}-${number}`,          // 1-123-456-7890
  ];
}

/**
 * Generate email variations
 */
export function generateEmailVariations(emails: string[]): string[] {
  const variations = new Set<string>();

  for (const email of emails) {
    // Original
    variations.add(email.toLowerCase());

    // Gmail dot variations (gmail ignores dots)
    if (email.toLowerCase().includes("@gmail.com")) {
      const [local, domain] = email.split("@");
      // Remove all dots
      variations.add(`${local.replace(/\./g, "")}@${domain}`);
    }
  }

  return Array.from(variations);
}

/**
 * Generate address variations
 */
export function generateAddressVariations(
  addresses: Array<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  }>
): AddressVariation[] {
  const variations: AddressVariation[] = [];

  for (const addr of addresses) {
    // Get state abbreviation and full name
    const stateAbbrev = STATE_ABBREVIATIONS[addr.state] || addr.state;
    const stateFull = STATE_FULL_NAMES[addr.state] || addr.state;

    // Normalize street abbreviations
    const streetNormalized = normalizeStreet(addr.street);

    // Full address
    variations.push({
      full: `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`,
      street: addr.street,
      city: addr.city,
      state: stateFull,
      stateAbbrev,
      zipCode: addr.zipCode,
      type: "current",
    });

    // With state abbreviation
    variations.push({
      full: `${addr.street}, ${addr.city}, ${stateAbbrev} ${addr.zipCode}`,
      street: addr.street,
      city: addr.city,
      state: stateFull,
      stateAbbrev,
      zipCode: addr.zipCode,
      type: "abbreviated",
    });

    // Normalized street address
    if (streetNormalized !== addr.street) {
      variations.push({
        full: `${streetNormalized}, ${addr.city}, ${stateAbbrev} ${addr.zipCode}`,
        street: streetNormalized,
        city: addr.city,
        state: stateFull,
        stateAbbrev,
        zipCode: addr.zipCode,
        type: "normalized",
      });
    }

    // ZIP code variations (5 vs 9 digit)
    if (addr.zipCode.length > 5) {
      const shortZip = addr.zipCode.slice(0, 5);
      variations.push({
        full: `${addr.street}, ${addr.city}, ${stateAbbrev} ${shortZip}`,
        street: addr.street,
        city: addr.city,
        state: stateFull,
        stateAbbrev,
        zipCode: shortZip,
        type: "abbreviated",
      });
    }
  }

  return variations;
}

/**
 * Normalize street address abbreviations
 */
function normalizeStreet(street: string): string {
  const abbreviations: Record<string, string> = {
    "Street": "St",
    "Avenue": "Ave",
    "Boulevard": "Blvd",
    "Drive": "Dr",
    "Court": "Ct",
    "Road": "Rd",
    "Lane": "Ln",
    "Place": "Pl",
    "Circle": "Cir",
    "Highway": "Hwy",
    "Parkway": "Pkwy",
    "Terrace": "Ter",
    "Trail": "Trl",
    "North": "N",
    "South": "S",
    "East": "E",
    "West": "W",
    "Northeast": "NE",
    "Northwest": "NW",
    "Southeast": "SE",
    "Southwest": "SW",
    "Apartment": "Apt",
    "Suite": "Ste",
    "Building": "Bldg",
    "Floor": "Fl",
  };

  let normalized = street;
  for (const [full, abbrev] of Object.entries(abbreviations)) {
    // Match whole words only
    const regex = new RegExp(`\\b${full}\\b`, "gi");
    normalized = normalized.replace(regex, abbrev);
  }

  return normalized;
}

/**
 * Generate all profile variations for comprehensive scanning
 */
export function generateProfileVariations(input: ScanInput): ProfileVariations {
  const names = input.fullName
    ? generateNameVariations(input.fullName, input.aliases)
    : [];

  const emails = input.emails
    ? generateEmailVariations(input.emails)
    : [];

  const phones = input.phones
    ? input.phones.flatMap(generatePhoneVariations)
    : [];

  const addresses = input.addresses
    ? generateAddressVariations(input.addresses)
    : [];

  const usernames = input.usernames || [];

  return {
    names,
    emails,
    phones,
    addresses,
    usernames,
  };
}

/**
 * Get search queries to use for a specific data broker
 * Different brokers may need different formats
 */
export function getSearchQueriesForBroker(
  brokerKey: string,
  variations: ProfileVariations
): string[] {
  const queries: string[] = [];

  // Most people-search sites use name + location
  const primaryNames = variations.names.slice(0, 5);
  const primaryAddresses = variations.addresses.slice(0, 3);

  for (const name of primaryNames) {
    // Name only
    queries.push(name.full);

    // Name + city/state
    for (const addr of primaryAddresses) {
      queries.push(`${name.full} ${addr.city} ${addr.stateAbbrev}`);
      queries.push(`${name.first} ${name.last} ${addr.city}`);
    }
  }

  // Email searches
  for (const email of variations.emails.slice(0, 3)) {
    queries.push(email);
  }

  // Phone searches
  for (const phone of variations.phones.slice(0, 3)) {
    queries.push(phone);
  }

  // Username searches (for social media brokers)
  if (["LINKEDIN", "FACEBOOK", "TWITTER", "INSTAGRAM"].includes(brokerKey)) {
    for (const username of variations.usernames.slice(0, 3)) {
      queries.push(username);
    }
  }

  return [...new Set(queries)]; // Remove duplicates
}
