/**
 * ProfileValidator - Validates scan results against user's profile
 *
 * CRITICAL: This prevents false positives by comparing extracted data
 * against the user's actual profile data (name, location, age, etc.)
 *
 * Confidence Scoring (100 points max):
 * - Name Match (0-30): Exact=30, First+Last=28, Partial=15, Fuzzy=10
 * - Location Match (0-25): City+State=25, State only=15
 * - Age Match (0-20): Exact=20, ±2 years=15, ±5 years=10
 * - Data Correlation (0-15): Phone match=5, Email match=5
 * - Source Reliability (0-10): Known broker=10, Unknown=7
 *
 * PRECISION IMPROVEMENT: Requires 2+ matching factors to create exposure.
 * Name-only matches are rejected to prevent false positives.
 */

import type { ScanInput } from "../base-scanner";
import {
  type ConfidenceFactors,
  type ConfidenceResult,
  classifyConfidence,
  CONFIDENCE_THRESHOLDS,
} from "../base-scanner";

// Known data broker sources (more reliable than unknown sources)
const KNOWN_DATA_BROKERS = new Set([
  "SPOKEO",
  "WHITEPAGES",
  "BEENVERIFIED",
  "TRUEPEOPLESEARCH",
  "RADARIS",
  "INTELIUS",
  "FASTPEOPLESEARCH",
  "PEOPLEFINDER",
  "MYLIFE",
  "USPHONEBOOK",
  "THATSTHEM",
  "CYBERBACKGROUNDCHECKS",
  "INSTANTCHECKMATE",
  "TRUTHFINDER",
  "PEOPLESEARCHNOW",
  "SEARCHPEOPLEFREE",
  "FAMILYTREENOW",
  "ADVANCEDBACKGROUNDCHECKS",
  "USSEARCH",
  "ZABASEARCH",
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
   * Validate extracted data against user's profile
   * Returns confidence score with detailed reasoning
   *
   * PRECISION IMPROVEMENT: Requires 2+ matching factors to avoid false positives.
   * Name-only matches are rejected even if confidence score would otherwise pass.
   */
  validate(input: ValidationInput): ConfidenceResult {
    const { profile, extracted, source } = input;
    const reasoning: string[] = [];
    const factors: ConfidenceFactors = {
      nameMatch: 0,
      locationMatch: 0,
      ageMatch: 0,
      dataCorrelation: 0,
      sourceReliability: 0,
    };

    // 1. Name Match (0-30 points)
    const nameResult = this.scoreNameMatch(profile, extracted);
    factors.nameMatch = nameResult.score;
    reasoning.push(...nameResult.reasoning);

    // 2. Location Match (0-25 points)
    const locationResult = this.scoreLocationMatch(profile, extracted);
    factors.locationMatch = locationResult.score;
    reasoning.push(...locationResult.reasoning);

    // 3. Age Match (0-20 points)
    const ageResult = this.scoreAgeMatch(profile, extracted);
    factors.ageMatch = ageResult.score;
    reasoning.push(...ageResult.reasoning);

    // 4. Data Correlation (0-15 points)
    const correlationResult = this.scoreDataCorrelation(profile, extracted);
    factors.dataCorrelation = correlationResult.score;
    reasoning.push(...correlationResult.reasoning);

    // 5. Source Reliability (0-10 points)
    const reliabilityResult = this.scoreSourceReliability(source);
    factors.sourceReliability = reliabilityResult.score;
    reasoning.push(...reliabilityResult.reasoning);

    // Calculate total score
    let score = Math.min(
      100,
      factors.nameMatch +
        factors.locationMatch +
        factors.ageMatch +
        factors.dataCorrelation +
        factors.sourceReliability
    );

    // PRECISION IMPROVEMENT: Count matching factors (excluding sourceReliability)
    // Require at least MIN_FACTORS (2) matching factors to avoid false positives
    const factorsMatched = this.countMatchingFactors(factors);

    // Log factor breakdown for debugging
    console.log(
      `[ProfileValidator] ${source}: Factors matched: ${factorsMatched} ` +
      `(name=${factors.nameMatch}, loc=${factors.locationMatch}, age=${factors.ageMatch}, data=${factors.dataCorrelation})`
    );

    // If only one factor matched (e.g., name-only), penalize the score
    // This prevents "John Smith in New York" from matching just because of a common name
    if (factorsMatched < CONFIDENCE_THRESHOLDS.MIN_FACTORS) {
      reasoning.push(
        `PRECISION CHECK: Only ${factorsMatched} factor(s) matched (need ${CONFIDENCE_THRESHOLDS.MIN_FACTORS}+). ` +
        `Reducing confidence to prevent false positive.`
      );

      // Cap the score below REJECT threshold if less than MIN_FACTORS matched
      // This ensures single-factor matches don't create exposures
      const maxScoreForSingleFactor = CONFIDENCE_THRESHOLDS.REJECT - 1;
      if (score > maxScoreForSingleFactor) {
        const originalScore = score;
        score = maxScoreForSingleFactor;
        reasoning.push(
          `Score capped to ${maxScoreForSingleFactor} due to insufficient matching factors.`
        );
        console.log(
          `[ProfileValidator] ${source}: ⚠️ REJECTED - Score ${originalScore} capped to ${score} (only ${factorsMatched} factor)`
        );
      } else {
        console.log(
          `[ProfileValidator] ${source}: ⚠️ LOW CONFIDENCE - Score ${score}, only ${factorsMatched} factor`
        );
      }
    } else {
      reasoning.push(
        `PRECISION CHECK: ${factorsMatched} factors matched - sufficient for exposure creation.`
      );
      console.log(
        `[ProfileValidator] ${source}: ✓ Score ${score}, ${factorsMatched} factors matched`
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
   * Count the number of factors that actually matched (have a positive score).
   * Excludes sourceReliability since that's not a match factor.
   *
   * A factor is considered "matched" if it has a meaningful score:
   * - nameMatch: > 0 (any name match)
   * - locationMatch: > 0 (any location match)
   * - ageMatch: > 0 (any age match)
   * - dataCorrelation: > 0 (phone or email matched)
   */
  private countMatchingFactors(factors: ConfidenceFactors): number {
    let count = 0;

    // Name match (any positive score counts)
    if (factors.nameMatch > 0) count++;

    // Location match (any positive score counts)
    if (factors.locationMatch > 0) count++;

    // Age match (any positive score counts)
    if (factors.ageMatch > 0) count++;

    // Data correlation (phone/email match)
    if (factors.dataCorrelation > 0) count++;

    // Note: sourceReliability is NOT counted - it's not a match factor

    return count;
  }

  /**
   * Score name match (0-30 points)
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

    // Check against aliases FIRST (before partial matching)
    // This ensures "Bob Johnson" matches alias before falling back to last-name-only
    if (profile.aliases && profile.aliases.length > 0 && extractedName) {
      for (const alias of profile.aliases) {
        const normalizedAlias = this.normalizeName(alias);
        if (normalizedAlias === extractedName) {
          score = 25;
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

      // Exact full name match
      if (profileName === extractedName) {
        score = 30;
        reasoning.push(`Exact name match: "${extracted.name}"`);
        return { score, reasoning };
      }

      // First AND last name match (but middle differs or missing)
      if (profileFirst === extractedFirst && profileLast === extractedLast) {
        score = 28;
        reasoning.push(`First and last name match: ${extractedFirst} ${extractedLast}`);
        return { score, reasoning };
      }

      // Check if extracted is contained in profile or vice versa
      if (profileName.includes(extractedName) || extractedName.includes(profileName)) {
        score = 20;
        reasoning.push(`Partial name overlap: "${extracted.name}" in "${profile.fullName}"`);
        return { score, reasoning };
      }

      // Last name match only
      if (profileLast === extractedLast && profileLast.length > 2) {
        score = 15;
        reasoning.push(`Last name match only: ${extractedLast}`);
        return { score, reasoning };
      }

      // First name match only
      if (profileFirst === extractedFirst && profileFirst.length > 2) {
        score = 10;
        reasoning.push(`First name match only: ${extractedFirst}`);
        return { score, reasoning };
      }

      // Fuzzy match (Levenshtein distance <= 2)
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
        score = 28;
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
   * Score location match (0-25 points)
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
          return { score: 25, reasoning };
        }
      }

      // State only match
      if (extractedState && profileState === extractedState) {
        reasoning.push(`State match only: ${extracted.state}`);
        return { score: 15, reasoning };
      }

      // City only match (less reliable due to common city names)
      if (extractedCity && profileCity === extractedCity) {
        reasoning.push(`City match only (no state): ${extracted.city}`);
        return { score: 8, reasoning };
      }
    }

    reasoning.push(
      `Location mismatch: extracted "${extracted.city || ""}, ${extracted.state || ""}" not in profile addresses`
    );
    return { score: 0, reasoning };
  }

  /**
   * Score age match (0-20 points)
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
      return { score: 20, reasoning };
    }

    if (ageDiff <= 2) {
      reasoning.push(`Age within 2 years: profile=${profileAge}, extracted=${extractedAge}`);
      return { score: 15, reasoning };
    }

    if (ageDiff <= 5) {
      reasoning.push(`Age within 5 years: profile=${profileAge}, extracted=${extractedAge}`);
      return { score: 10, reasoning };
    }

    if (ageDiff <= 10) {
      reasoning.push(`Age within 10 years: profile=${profileAge}, extracted=${extractedAge}`);
      return { score: 5, reasoning };
    }

    reasoning.push(`Age mismatch: profile=${profileAge}, extracted=${extractedAge} (diff=${ageDiff})`);
    return { score: 0, reasoning };
  }

  /**
   * Score data correlation - phone/email matches (0-15 points)
   */
  private scoreDataCorrelation(
    profile: ScanInput,
    extracted: ExtractedData
  ): { score: number; reasoning: string[] } {
    const reasoning: string[] = [];
    let score = 0;

    // Phone match (0-5 points)
    if (profile.phones && profile.phones.length > 0 && extracted.phones && extracted.phones.length > 0) {
      const profilePhones = profile.phones.map((p) => this.normalizePhone(p));
      const extractedPhones = extracted.phones.map((p) => this.normalizePhone(p));

      for (const extractedPhone of extractedPhones) {
        if (profilePhones.includes(extractedPhone)) {
          score += 5;
          reasoning.push(`Phone match: ${this.maskPhone(extractedPhone)}`);
          break;
        }
      }
    }

    // Email match (0-5 points)
    if (profile.emails && profile.emails.length > 0 && extracted.emails && extracted.emails.length > 0) {
      const profileEmails = profile.emails.map((e) => e.toLowerCase().trim());
      const extractedEmails = extracted.emails.map((e) => e.toLowerCase().trim());

      for (const extractedEmail of extractedEmails) {
        if (profileEmails.includes(extractedEmail)) {
          score += 5;
          reasoning.push(`Email match: ${this.maskEmail(extractedEmail)}`);
          break;
        }
      }
    }

    // Bonus for multiple correlations
    if (score >= 10) {
      score = Math.min(15, score + 5);
      reasoning.push("Multiple data correlations (+5 bonus)");
    }

    if (score === 0) {
      reasoning.push("No phone/email correlation found");
    }

    return { score, reasoning };
  }

  /**
   * Score source reliability (0-10 points)
   */
  private scoreSourceReliability(source: string): { score: number; reasoning: string[] } {
    const reasoning: string[] = [];
    const normalizedSource = source.toUpperCase().replace(/[^A-Z]/g, "");

    if (KNOWN_DATA_BROKERS.has(normalizedSource)) {
      reasoning.push(`Known data broker: ${source}`);
      return { score: 10, reasoning };
    }

    // Check for partial matches (e.g., "SPOKEO_PREMIUM" should match "SPOKEO")
    for (const knownBroker of KNOWN_DATA_BROKERS) {
      if (normalizedSource.includes(knownBroker) || knownBroker.includes(normalizedSource)) {
        reasoning.push(`Recognized broker variant: ${source}`);
        return { score: 9, reasoning };
      }
    }

    reasoning.push(`Unknown source (reliability reduced): ${source}`);
    return { score: 7, reasoning };
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
    // If it's already a 2-letter abbreviation
    if (cleaned.length === 2) {
      return cleaned.toUpperCase();
    }
    // Convert full name to abbreviation
    return STATE_ABBREVIATIONS[cleaned] || cleaned.toUpperCase();
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, "").slice(-10); // Last 10 digits
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
    // Handle formats like "45", "45 years old", "Age: 45", "40-50", etc.
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
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
}

// Singleton instance for convenience
export const profileValidator = new ProfileValidator();
