/**
 * ProfileValidator - Two-Tier Confidence Model v2
 *
 * TIER 1 — Deterministic (hard identifiers, short-circuit to 100):
 *   Email-only profile + exact email match → 100 CONFIRMED (no name needed)
 *   Phone-only profile + exact phone match → 100 CONFIRMED (no name needed)
 *   Name + Email match → 100 CONFIRMED
 *   Name + Phone match → 100 CONFIRMED
 *   Name + Street+City+State match → 100 CONFIRMED
 *
 * TIER 2 — Probabilistic (soft signals, only if Tier 1 didn't match):
 *   Name Match (0-35): Exact=35, First+Last=30, Alias=28, Partial=20, LastOnly=15, Fuzzy=10
 *   Location Match (0-30): City+State=30, State=18, City-only=10
 *   Age Match (0-25): Exact=25, ±2yr=18, ±5yr=12, ±10yr=5
 *   Data Correlation (0-10): Phone partial=5, Email domain=5
 *
 * Source reliability factor REMOVED — all scanners are known brokers, was dead weight.
 *
 * MIN_FACTORS: 1 for people-search brokers, 2 for all others.
 */

import type { ScanInput } from "../base-scanner";
import {
  type ConfidenceFactors,
  type ConfidenceResult,
  classifyConfidence,
  CONFIDENCE_THRESHOLDS,
} from "../base-scanner";

// People-search source keys — only need 1 factor match (these are aggregated data, not user-created)
const PEOPLE_SEARCH_SOURCES = new Set([
  "SPOKEO", "WHITEPAGES", "BEENVERIFIED", "TRUEPEOPLESEARCH",
  "RADARIS", "INTELIUS", "FASTPEOPLESEARCH", "PEOPLEFINDER",
  "MYLIFE", "USPHONEBOOK", "THATSTHEM", "CYBERBACKGROUNDCHECKS",
  "INSTANTCHECKMATE", "TRUTHFINDER", "PEOPLESEARCHNOW",
  "SEARCHPEOPLEFREE", "FAMILYTREENOW", "ADVANCEDBACKGROUNDCHECKS",
  "USSEARCH", "ZABASEARCH", "NUWBER", "SPYDIALER", "CHECKPEOPLE",
  "PUBLICRECORDSNOW", "PEOPLEFINDERS", "PEOPLELOOKER",
]);

// State name to abbreviation mapping
const STATE_ABBREVIATIONS: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR",
  california: "CA", colorado: "CO", connecticut: "CT", delaware: "DE",
  florida: "FL", georgia: "GA", hawaii: "HI", idaho: "ID",
  illinois: "IL", indiana: "IN", iowa: "IA", kansas: "KS",
  kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS",
  missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM",
  "new york": "NY", "north carolina": "NC", "north dakota": "ND",
  ohio: "OH", oklahoma: "OK", oregon: "OR", pennsylvania: "PA",
  "rhode island": "RI", "south carolina": "SC", "south dakota": "SD",
  tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", "west virginia": "WV",
  wisconsin: "WI", wyoming: "WY", "district of columbia": "DC",
};

export interface ExtractedData {
  name?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  street?: string;
  age?: number | string;
  phones?: string[];
  emails?: string[];
}

export interface ValidationInput {
  profile: ScanInput;
  extracted: ExtractedData;
  source: string;
}

export class ProfileValidator {
  /**
   * Validate extracted data against user's profile.
   * Two-tier model: Tier 1 checks hard identifiers first (short-circuit to 100),
   * then falls back to Tier 2 probabilistic scoring.
   */
  validate(input: ValidationInput): ConfidenceResult {
    const { profile, extracted, source } = input;

    // ─── TIER 1: Deterministic hard-identifier combos ───
    const tier1 = this.validateTier1(profile, extracted, source);
    if (tier1) {
      return tier1;
    }

    // ─── TIER 2: Probabilistic soft-signal scoring ───
    return this.validateTier2(profile, extracted, source);
  }

  /**
   * Tier 1: Deterministic matching.
   * If any hard identifier combo matches, return score=100 CONFIRMED immediately.
   * Returns null if no Tier 1 match found.
   */
  private validateTier1(
    profile: ScanInput,
    extracted: ExtractedData,
    source: string
  ): ConfidenceResult | null {
    const reasoning: string[] = [];

    // ─── Email/Phone-only profiles (no name) ───
    // An exact email or phone match IS the user's data — no name needed
    if (!profile.fullName) {
      if (profile.emails?.length && this.hasExactEmailMatch(profile, extracted)) {
        reasoning.push(
          `TIER 1 CONFIRMED: Exact email match (no-name profile) on ${source}`,
          `Email: exact match found`
        );
        console.log(`[ProfileValidator] ${source}: ★ TIER 1 — Email-only → 100 CONFIRMED`);
        return this.buildTier1Result(reasoning, "email-only");
      }

      if (profile.phones?.length && this.hasExactPhoneMatch(profile, extracted)) {
        reasoning.push(
          `TIER 1 CONFIRMED: Exact phone match (no-name profile) on ${source}`,
          `Phone: exact match found`
        );
        console.log(`[ProfileValidator] ${source}: ★ TIER 1 — Phone-only → 100 CONFIRMED`);
        return this.buildTier1Result(reasoning, "phone-only");
      }

      return null; // No name and no exact email/phone match → can't be Tier 1
    }

    // ─── Name-based combos (existing logic) ───
    const hasNameMatch = this.hasAnyNameMatch(profile, extracted);

    if (!hasNameMatch) {
      return null; // No name match at all → can't be a Tier 1 match
    }

    // Name + Email match
    if (this.hasExactEmailMatch(profile, extracted)) {
      reasoning.push(
        `TIER 1 CONFIRMED: Name match + exact email match on ${source}`,
        `Name: "${extracted.name || `${extracted.firstName} ${extracted.lastName}`}"`,
        `Email: exact match found`
      );
      console.log(`[ProfileValidator] ${source}: ★ TIER 1 — Name + Email → 100 CONFIRMED`);
      return this.buildTier1Result(reasoning, "email");
    }

    // Name + Phone match
    if (this.hasExactPhoneMatch(profile, extracted)) {
      reasoning.push(
        `TIER 1 CONFIRMED: Name match + exact phone match on ${source}`,
        `Name: "${extracted.name || `${extracted.firstName} ${extracted.lastName}`}"`,
        `Phone: exact match found`
      );
      console.log(`[ProfileValidator] ${source}: ★ TIER 1 — Name + Phone → 100 CONFIRMED`);
      return this.buildTier1Result(reasoning, "phone");
    }

    // Name + Full Address (Street + City + State) match
    if (this.hasFullAddressMatch(profile, extracted)) {
      reasoning.push(
        `TIER 1 CONFIRMED: Name match + full address match on ${source}`,
        `Name: "${extracted.name || `${extracted.firstName} ${extracted.lastName}`}"`,
        `Address: street + city + state match found`
      );
      console.log(`[ProfileValidator] ${source}: ★ TIER 1 — Name + Address → 100 CONFIRMED`);
      return this.buildTier1Result(reasoning, "address");
    }

    return null;
  }

  /**
   * Build a Tier 1 result (always score=100, CONFIRMED)
   */
  private buildTier1Result(
    reasoning: string[],
    matchType: "email" | "phone" | "address" | "email-only" | "phone-only"
  ): ConfidenceResult {
    const isNoNameMatch = matchType === "email-only" || matchType === "phone-only";
    const factors: ConfidenceFactors = {
      nameMatch: isNoNameMatch ? 0 : 35,
      locationMatch: matchType === "address" ? 30 : 0,
      ageMatch: 0,
      dataCorrelation: matchType !== "address" ? 10 : 0,
      sourceReliability: 0,
    };

    return {
      score: 100,
      classification: "CONFIRMED",
      factors,
      reasoning,
      validatedAt: new Date(),
    };
  }

  /**
   * Check if there's any name match (exact, first+last, alias, partial)
   */
  private hasAnyNameMatch(profile: ScanInput, extracted: ExtractedData): boolean {
    if (!profile.fullName) return false;

    const profileName = this.normalizeName(profile.fullName);
    const profileParts = profileName.split(" ");
    const profileFirst = profileParts[0] || "";
    const profileLast = profileParts[profileParts.length - 1] || "";

    // Check full name
    if (extracted.name) {
      const extractedName = this.normalizeName(extracted.name);
      const extractedParts = extractedName.split(" ");
      const extractedFirst = extractedParts[0] || "";
      const extractedLast = extractedParts[extractedParts.length - 1] || "";

      if (profileName === extractedName) return true;
      if (profileFirst === extractedFirst && profileLast === extractedLast) return true;
      if (profileName.includes(extractedName) || extractedName.includes(profileName)) return true;
      if (profileLast === extractedLast && profileLast.length > 2) return true;
    }

    // Check firstName/lastName separately
    if (extracted.firstName || extracted.lastName) {
      const ef = this.normalizeName(extracted.firstName || "");
      const el = this.normalizeName(extracted.lastName || "");
      if (profileFirst === ef && profileLast === el) return true;
      if (profileLast === el && el.length > 2) return true;
    }

    // Check aliases
    if (profile.aliases && extracted.name) {
      const extractedName = this.normalizeName(extracted.name);
      for (const alias of profile.aliases) {
        if (this.normalizeName(alias) === extractedName) return true;
      }
    }

    return false;
  }

  /**
   * Check for exact email match between profile and extracted data
   */
  private hasExactEmailMatch(profile: ScanInput, extracted: ExtractedData): boolean {
    if (!profile.emails?.length || !extracted.emails?.length) return false;
    const profileEmails = profile.emails.map(e => e.toLowerCase().trim());
    return extracted.emails.some(e => profileEmails.includes(e.toLowerCase().trim()));
  }

  /**
   * Check for exact phone match (last 10 digits)
   */
  private hasExactPhoneMatch(profile: ScanInput, extracted: ExtractedData): boolean {
    if (!profile.phones?.length || !extracted.phones?.length) return false;
    const profilePhones = profile.phones.map(p => this.normalizePhone(p));
    return extracted.phones.some(p => profilePhones.includes(this.normalizePhone(p)));
  }

  /**
   * Check for full address match (street + city + state)
   */
  private hasFullAddressMatch(profile: ScanInput, extracted: ExtractedData): boolean {
    if (!profile.addresses?.length) return false;
    if (!extracted.street || !extracted.city || !extracted.state) return false;

    const extractedStreet = this.normalizeStreet(extracted.street);
    const extractedCity = this.normalizeCity(extracted.city);
    const extractedState = this.normalizeState(extracted.state);

    for (const addr of profile.addresses) {
      const profileStreet = this.normalizeStreet(addr.street || "");
      const profileCity = this.normalizeCity(addr.city || "");
      const profileState = this.normalizeState(addr.state || "");

      if (
        profileStreet === extractedStreet &&
        profileCity === extractedCity &&
        profileState === extractedState
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Tier 2: Probabilistic soft-signal scoring.
   * Name (0-35) + Location (0-30) + Age (0-25) + DataCorrelation (0-10) = max 100
   * Source reliability removed.
   */
  private validateTier2(
    profile: ScanInput,
    extracted: ExtractedData,
    source: string
  ): ConfidenceResult {
    const reasoning: string[] = [];
    const factors: ConfidenceFactors = {
      nameMatch: 0,
      locationMatch: 0,
      ageMatch: 0,
      dataCorrelation: 0,
      sourceReliability: 0, // Deprecated — always 0
    };

    // 1. Name Match (0-35 points)
    const nameResult = this.scoreNameMatch(profile, extracted);
    factors.nameMatch = nameResult.score;
    reasoning.push(...nameResult.reasoning);

    // 2. Location Match (0-30 points)
    const locationResult = this.scoreLocationMatch(profile, extracted);
    factors.locationMatch = locationResult.score;
    reasoning.push(...locationResult.reasoning);

    // 3. Age Match (0-25 points)
    const ageResult = this.scoreAgeMatch(profile, extracted);
    factors.ageMatch = ageResult.score;
    reasoning.push(...ageResult.reasoning);

    // 4. Data Correlation (0-10 points) — only partial matches here; exact caught by Tier 1
    const correlationResult = this.scoreDataCorrelation(profile, extracted);
    factors.dataCorrelation = correlationResult.score;
    reasoning.push(...correlationResult.reasoning);

    // Calculate total score
    let score = Math.min(
      100,
      factors.nameMatch + factors.locationMatch + factors.ageMatch + factors.dataCorrelation
    );

    // Count matching factors (all 4 are real match signals now)
    const factorsMatched = this.countMatchingFactors(factors);

    // Determine MIN_FACTORS based on source type
    const normalizedSource = source.toUpperCase().replace(/[^A-Z]/g, "");
    const minFactors = PEOPLE_SEARCH_SOURCES.has(normalizedSource) ? 1 : CONFIDENCE_THRESHOLDS.MIN_FACTORS;

    console.log(
      `[ProfileValidator] ${source}: Tier 2 — Factors matched: ${factorsMatched}/${minFactors} needed ` +
      `(name=${factors.nameMatch}, loc=${factors.locationMatch}, age=${factors.ageMatch}, data=${factors.dataCorrelation})`
    );

    // If fewer factors than required, cap score below REJECT threshold
    if (factorsMatched < minFactors) {
      reasoning.push(
        `PRECISION CHECK: Only ${factorsMatched} factor(s) matched (need ${minFactors}+). ` +
        `Reducing confidence to prevent false positive.`
      );

      const maxScoreForInsufficientFactors = CONFIDENCE_THRESHOLDS.REJECT - 1;
      if (score > maxScoreForInsufficientFactors) {
        const originalScore = score;
        score = maxScoreForInsufficientFactors;
        reasoning.push(
          `Score capped to ${maxScoreForInsufficientFactors} due to insufficient matching factors.`
        );
        console.log(
          `[ProfileValidator] ${source}: ⚠️ REJECTED — Score ${originalScore} capped to ${score} (${factorsMatched} factor, need ${minFactors})`
        );
      }
    } else {
      reasoning.push(
        `PRECISION CHECK: ${factorsMatched} factors matched (${minFactors} needed) — sufficient for exposure creation.`
      );
      console.log(
        `[ProfileValidator] ${source}: ✓ Tier 2 score ${score}, ${factorsMatched} factors matched`
      );
    }

    const classification = classifyConfidence(score);

    return {
      score,
      classification,
      factors,
      reasoning,
      validatedAt: new Date(),
    };
  }

  /**
   * Count matching factors (positive score = matched). sourceReliability excluded.
   */
  private countMatchingFactors(factors: ConfidenceFactors): number {
    let count = 0;
    if (factors.nameMatch > 0) count++;
    if (factors.locationMatch > 0) count++;
    if (factors.ageMatch > 0) count++;
    if (factors.dataCorrelation > 0) count++;
    return count;
  }

  /**
   * Score name match (0-35 points) — Tier 2
   */
  private scoreNameMatch(
    profile: ScanInput,
    extracted: ExtractedData
  ): { score: number; reasoning: string[] } {
    const reasoning: string[] = [];
    let score = 0;

    if (!profile.fullName) {
      reasoning.push("No profile name to compare");
      return { score: 0, reasoning };
    }

    const profileName = this.normalizeName(profile.fullName);
    const profileParts = profileName.split(" ");
    const profileFirst = profileParts[0] || "";
    const profileLast = profileParts[profileParts.length - 1] || "";
    const extractedName = this.normalizeName(extracted.name || "");

    // Check against aliases FIRST
    if (profile.aliases && profile.aliases.length > 0 && extractedName) {
      for (const alias of profile.aliases) {
        const normalizedAlias = this.normalizeName(alias);
        if (normalizedAlias === extractedName) {
          score = 28;
          reasoning.push(`Alias match: "${extracted.name}" matches alias "${alias}"`);
          return { score, reasoning };
        }
      }
    }

    // Try extracted full name
    if (extracted.name) {
      const extractedParts = extractedName.split(" ");
      const extractedFirst = extractedParts[0] || "";
      const extractedLast = extractedParts[extractedParts.length - 1] || "";

      if (profileName === extractedName) {
        score = 35;
        reasoning.push(`Exact name match: "${extracted.name}"`);
        return { score, reasoning };
      }

      if (profileFirst === extractedFirst && profileLast === extractedLast) {
        score = 30;
        reasoning.push(`First and last name match: ${extractedFirst} ${extractedLast}`);
        return { score, reasoning };
      }

      if (profileName.includes(extractedName) || extractedName.includes(profileName)) {
        score = 20;
        reasoning.push(`Partial name overlap: "${extracted.name}" in "${profile.fullName}"`);
        return { score, reasoning };
      }

      if (profileLast === extractedLast && profileLast.length > 2) {
        score = 15;
        reasoning.push(`Last name match only: ${extractedLast}`);
        return { score, reasoning };
      }

      if (profileFirst === extractedFirst && profileFirst.length > 2) {
        score = 10;
        reasoning.push(`First name match only: ${extractedFirst}`);
        return { score, reasoning };
      }

      const distance = this.levenshteinDistance(profileName, extractedName);
      if (distance <= 2) {
        score = 10;
        reasoning.push(`Fuzzy name match (distance ${distance}): "${extracted.name}"`);
        return { score, reasoning };
      }
    }

    // Try extracted firstName/lastName separately
    if (extracted.firstName || extracted.lastName) {
      const extractedFirst = this.normalizeName(extracted.firstName || "");
      const extractedLast = this.normalizeName(extracted.lastName || "");

      if (profileFirst === extractedFirst && profileLast === extractedLast) {
        score = 30;
        reasoning.push(`First+Last name match: ${extractedFirst} ${extractedLast}`);
        return { score, reasoning };
      }

      if (profileLast === extractedLast && extractedLast.length > 2) {
        score = 15;
        reasoning.push(`Last name match: ${extractedLast}`);
        return { score, reasoning };
      }

      if (profileFirst === extractedFirst && extractedFirst.length > 2) {
        score = 10;
        reasoning.push(`First name match: ${extractedFirst}`);
        return { score, reasoning };
      }
    }

    reasoning.push(`Name mismatch: profile="${profile.fullName}", extracted="${extracted.name || 'unknown'}"`);
    return { score: 0, reasoning };
  }

  /**
   * Score location match (0-30 points) — Tier 2
   */
  private scoreLocationMatch(
    profile: ScanInput,
    extracted: ExtractedData
  ): { score: number; reasoning: string[] } {
    const reasoning: string[] = [];

    if (!profile.addresses || profile.addresses.length === 0) {
      reasoning.push("No profile addresses to compare");
      return { score: 0, reasoning };
    }

    if (!extracted.city && !extracted.state) {
      reasoning.push("No location data in scan result");
      return { score: 0, reasoning };
    }

    const extractedCity = this.normalizeCity(extracted.city || "");
    const extractedState = this.normalizeState(extracted.state || "");

    for (const address of profile.addresses) {
      const profileCity = this.normalizeCity(address.city || "");
      const profileState = this.normalizeState(address.state || "");

      // City AND State match
      if (extractedCity && extractedState) {
        if (profileCity === extractedCity && profileState === extractedState) {
          reasoning.push(`City+State match: ${extracted.city}, ${extracted.state}`);
          return { score: 30, reasoning };
        }
      }

      // State only match
      if (extractedState && profileState === extractedState) {
        reasoning.push(`State match only: ${extracted.state}`);
        return { score: 18, reasoning };
      }

      // City only match (less reliable due to common city names)
      if (extractedCity && profileCity === extractedCity) {
        reasoning.push(`City match only (no state): ${extracted.city}`);
        return { score: 10, reasoning };
      }
    }

    reasoning.push(
      `Location mismatch: extracted "${extracted.city || ""}, ${extracted.state || ""}" not in profile addresses`
    );
    return { score: 0, reasoning };
  }

  /**
   * Score age match (0-25 points) — Tier 2
   */
  private scoreAgeMatch(
    profile: ScanInput,
    extracted: ExtractedData
  ): { score: number; reasoning: string[] } {
    const reasoning: string[] = [];

    if (!profile.dateOfBirth) {
      reasoning.push("No profile DOB to compare");
      return { score: 0, reasoning };
    }

    if (!extracted.age) {
      reasoning.push("No age data in scan result");
      return { score: 0, reasoning };
    }

    const profileAge = this.calculateAge(profile.dateOfBirth);
    if (profileAge === null) {
      reasoning.push("Could not calculate profile age");
      return { score: 0, reasoning };
    }

    const extractedAge =
      typeof extracted.age === "string"
        ? this.parseAge(extracted.age)
        : extracted.age;

    if (extractedAge === null) {
      reasoning.push(`Could not parse extracted age: ${extracted.age}`);
      return { score: 0, reasoning };
    }

    const ageDiff = Math.abs(profileAge - extractedAge);

    if (ageDiff === 0) {
      reasoning.push(`Exact age match: ${extractedAge}`);
      return { score: 25, reasoning };
    }

    if (ageDiff <= 2) {
      reasoning.push(`Age within 2 years: profile=${profileAge}, extracted=${extractedAge}`);
      return { score: 18, reasoning };
    }

    if (ageDiff <= 5) {
      reasoning.push(`Age within 5 years: profile=${profileAge}, extracted=${extractedAge}`);
      return { score: 12, reasoning };
    }

    if (ageDiff <= 10) {
      reasoning.push(`Age within 10 years: profile=${profileAge}, extracted=${extractedAge}`);
      return { score: 5, reasoning };
    }

    reasoning.push(`Age mismatch: profile=${profileAge}, extracted=${extractedAge} (diff=${ageDiff})`);
    return { score: 0, reasoning };
  }

  /**
   * Score data correlation — partial phone/email matches (0-10 points) — Tier 2
   * Exact phone/email matches are already caught by Tier 1, so this catches
   * partial matches (phone prefix, email domain).
   */
  private scoreDataCorrelation(
    profile: ScanInput,
    extracted: ExtractedData
  ): { score: number; reasoning: string[] } {
    const reasoning: string[] = [];
    let score = 0;

    // Phone match (0-5 points)
    if (profile.phones?.length && extracted.phones?.length) {
      const profilePhones = profile.phones.map(p => this.normalizePhone(p));
      const extractedPhones = extracted.phones.map(p => this.normalizePhone(p));

      for (const extractedPhone of extractedPhones) {
        // Exact match
        if (profilePhones.includes(extractedPhone)) {
          score += 5;
          reasoning.push(`Phone match: ${this.maskPhone(extractedPhone)}`);
          break;
        }
        // Partial match (last 7 digits match — same local number, area code differs)
        const last7 = extractedPhone.slice(-7);
        if (profilePhones.some(p => p.endsWith(last7)) && last7.length === 7) {
          score += 3;
          reasoning.push(`Phone partial match (last 7 digits): ${this.maskPhone(extractedPhone)}`);
          break;
        }
      }
    }

    // Email match (0-5 points)
    if (profile.emails?.length && extracted.emails?.length) {
      const profileEmails = profile.emails.map(e => e.toLowerCase().trim());
      const extractedEmails = extracted.emails.map(e => e.toLowerCase().trim());

      for (const extractedEmail of extractedEmails) {
        // Exact match
        if (profileEmails.includes(extractedEmail)) {
          score += 5;
          reasoning.push(`Email match: ${this.maskEmail(extractedEmail)}`);
          break;
        }
        // Domain match (same email provider — weak but positive signal)
        const extractedDomain = extractedEmail.split("@")[1];
        if (extractedDomain && profileEmails.some(e => e.split("@")[1] === extractedDomain)) {
          score += 2;
          reasoning.push(`Email domain match: @${extractedDomain}`);
          break;
        }
      }
    }

    if (score === 0) {
      reasoning.push("No phone/email correlation found");
    }

    return { score: Math.min(10, score), reasoning };
  }

  // =========================================================================
  // UTILITY METHODS
  // =========================================================================

  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z\s]/g, "")
      .replace(/\s+/g, " ");
  }

  private normalizeCity(city: string): string {
    return city.toLowerCase().trim().replace(/[^a-z\s]/g, "");
  }

  private normalizeState(state: string): string {
    const cleaned = state.toLowerCase().trim();
    if (cleaned.length === 2) {
      return cleaned.toUpperCase();
    }
    return STATE_ABBREVIATIONS[cleaned] || cleaned.toUpperCase();
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, "").slice(-10); // Last 10 digits
  }

  private normalizeStreet(street: string): string {
    return street
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      // Normalize common abbreviations
      .replace(/\bstreet\b/g, "st")
      .replace(/\bavenue\b/g, "ave")
      .replace(/\bdrive\b/g, "dr")
      .replace(/\broad\b/g, "rd")
      .replace(/\blane\b/g, "ln")
      .replace(/\bcourt\b/g, "ct")
      .replace(/\bboulevard\b/g, "blvd")
      .replace(/\bapartment\b/g, "apt")
      .replace(/\bsuite\b/g, "ste");
  }

  private calculateAge(dob: string): number | null {
    try {
      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime())) return null;

      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age;
    } catch {
      return null;
    }
  }

  private parseAge(ageStr: string): number | null {
    const match = ageStr.match(/(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  }

  private maskPhone(phone: string): string {
    if (phone.length <= 4) return "****";
    return "*".repeat(phone.length - 4) + phone.slice(-4);
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split("@");
    if (!domain) return "****";
    const maskedLocal =
      local.length <= 2
        ? "*".repeat(local.length)
        : local[0] + "*".repeat(local.length - 2) + local[local.length - 1];
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Levenshtein distance for fuzzy name matching
   */
  private levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
}

// Singleton instance for convenience
export const profileValidator = new ProfileValidator();
