/**
 * Exposure Projection Engine
 *
 * After real scrapers finish, projects confirmed/likely exposures onto
 * related unscanned brokers using data broker network relationships.
 *
 * Based on how the data broker industry works: people-search brokers ALL
 * buy from the same 3-4 data aggregators. If your data is on Spokeo,
 * it IS on most other people-search sites.
 *
 * Performance: Pure in-memory computation (<100ms), no network calls.
 */

import type { ScanInput, ScanResult } from "./base-scanner";
import type { ConfidenceFactors, ConfidenceResult } from "./base-scanner";
import type { DataSource, Severity } from "@/lib/types";
import {
  DATA_BROKER_DIRECTORY,
  BROKER_CATEGORIES,
} from "@/lib/removers/data-broker-directory";
import {
  getCategoryProjectionTargets,
  getSubsidiaryProjectionTargets,
  isExcludedFromProjection,
  PROJECTION_MIN_SCORE,
} from "./broker-network";

// Minimum source confidence score to trigger projection
const MIN_SOURCE_SCORE = 50;

// Default exposed fields by broker category for projected exposures
type ExposedField = { type: string; count?: number };
const CATEGORY_EXPOSED_FIELDS: Record<string, ExposedField[]> = {
  PEOPLE_SEARCH: [{ type: "name" }, { type: "phone" }, { type: "address" }, { type: "age" }, { type: "relatives" }],
  PHONE_LOOKUP: [{ type: "name" }, { type: "phone" }],
  BACKGROUND_CHECK: [{ type: "name" }, { type: "address" }, { type: "phone" }, { type: "email" }],
  PROPERTY_RECORDS: [{ type: "name" }, { type: "address" }],
  COURT_RECORDS: [{ type: "name" }, { type: "address" }],
  EMAIL_IDENTITY: [{ type: "name" }, { type: "email" }],
  PROFESSIONAL_B2B: [{ type: "name" }, { type: "email" }, { type: "phone" }],
  MARKETING: [{ type: "name" }, { type: "email" }, { type: "address" }],
};

// Build a reverse lookup: broker key → category
function getBrokerCategory(brokerKey: string): string | null {
  for (const [category, brokers] of Object.entries(BROKER_CATEGORIES)) {
    if ((brokers as readonly string[]).includes(brokerKey)) return category;
  }
  return null;
}

// Severity lookup (mirrors all-brokers-scanner logic)
const HIGH_SEVERITY_BROKERS = new Set([
  "SPOKEO", "WHITEPAGES", "BEENVERIFIED", "INTELIUS", "RADARIS",
  "TRUTHFINDER", "INSTANTCHECKMATE", "MYLIFE", "ZOOMINFO",
  "LEXISNEXIS", "ACXIOM", "EXPERIAN_MARKETING",
]);

const PROFESSIONAL_B2B_SET = new Set(BROKER_CATEGORIES.PROFESSIONAL_B2B as readonly string[]);
const MARKETING_SET = new Set(BROKER_CATEGORIES.MARKETING as readonly string[]);

function getSeverityForBroker(brokerKey: string): Severity {
  if (HIGH_SEVERITY_BROKERS.has(brokerKey)) return "HIGH";
  if (PROFESSIONAL_B2B_SET.has(brokerKey)) return "MEDIUM";
  if (MARKETING_SET.has(brokerKey)) return "MEDIUM";
  return "LOW";
}

export interface ProjectionStats {
  confirmedSources: number;
  projectedCount: number;
  skippedExcluded: number;
  skippedDuplicate: number;
  skippedLowScore: number;
}

/**
 * Project confirmed exposures onto related unscanned brokers.
 *
 * @param confirmedResults - Results from real scanners (only CONFIRMED/LIKELY used)
 * @param userProfile - The user's scan input profile
 * @returns Array of projected ScanResult items with PROJECTED classification
 */
export function projectExposures(
  confirmedResults: ScanResult[],
  userProfile: ScanInput
): { projected: ScanResult[]; stats: ProjectionStats } {
  const stats: ProjectionStats = {
    confirmedSources: 0,
    projectedCount: 0,
    skippedExcluded: 0,
    skippedDuplicate: 0,
    skippedLowScore: 0,
  };

  // Filter to only CONFIRMED/LIKELY results with score >= MIN_SOURCE_SCORE
  const qualifyingSources = confirmedResults.filter(r => {
    const score = r.confidence?.score ?? 0;
    return score >= MIN_SOURCE_SCORE;
  });

  stats.confirmedSources = qualifyingSources.length;

  if (qualifyingSources.length === 0) {
    console.log("[ExposureProjector] No qualifying sources for projection");
    return { projected: [], stats };
  }

  // Track which brokers already have results (from real scanners)
  const existingBrokerKeys = new Set(
    confirmedResults.map(r => String(r.source))
  );

  // Track projected brokers to avoid duplicates (keep highest score)
  const projectedMap = new Map<string, ScanResult>();

  const userHasAddress = !!(userProfile.addresses && userProfile.addresses.length > 0);

  for (const sourceResult of qualifyingSources) {
    const sourceKey = String(sourceResult.source);
    const sourceScore = sourceResult.confidence?.score ?? 100;
    const sourceName = sourceResult.sourceName;

    // Get category-based projection targets
    const categoryTargets = getCategoryProjectionTargets(sourceKey, userHasAddress);

    // Get subsidiary-based projection targets
    const subsidiaryTargets = getSubsidiaryProjectionTargets(sourceKey);

    // Merge both target sets, keeping highest weight per broker
    const allTargets = new Map<string, number>();

    for (const t of categoryTargets) {
      const existing = allTargets.get(t.brokerKey) ?? 0;
      allTargets.set(t.brokerKey, Math.max(existing, t.weight));
    }

    for (const t of subsidiaryTargets) {
      const existing = allTargets.get(t.brokerKey) ?? 0;
      allTargets.set(t.brokerKey, Math.max(existing, t.weight));
    }

    // Project onto each target
    for (const [targetKey, weight] of allTargets) {
      // Skip if already found by real scanners
      if (existingBrokerKeys.has(targetKey)) {
        stats.skippedDuplicate++;
        continue;
      }

      // Skip excluded brokers
      if (isExcludedFromProjection(targetKey)) {
        stats.skippedExcluded++;
        continue;
      }

      // Get broker info from directory
      const brokerInfo = DATA_BROKER_DIRECTORY[targetKey];
      if (!brokerInfo) {
        stats.skippedExcluded++;
        continue;
      }

      // Calculate projected score
      const projectedScore = Math.round(sourceScore * weight);

      // Skip if below minimum
      if (projectedScore < PROJECTION_MIN_SCORE) {
        stats.skippedLowScore++;
        continue;
      }

      // Check if we already have a higher-scored projection for this broker
      const existing = projectedMap.get(targetKey);
      if (existing && (existing.confidence?.score ?? 0) >= projectedScore) {
        stats.skippedDuplicate++;
        continue;
      }

      // Build the opt-out URL for the exposure
      const sourceUrl = brokerInfo.optOutUrl
        || (brokerInfo.privacyEmail ? `mailto:${brokerInfo.privacyEmail}` : undefined);

      if (!sourceUrl) {
        stats.skippedExcluded++;
        continue;
      }

      // Build confidence factors for projected exposure
      const factors: ConfidenceFactors = {
        nameMatch: 0,
        locationMatch: 0,
        ageMatch: 0,
        dataCorrelation: 0,
        sourceReliability: 0,
        projectionSource: sourceKey,
        projectionWeight: weight,
      };

      const confidence: ConfidenceResult = {
        score: projectedScore,
        classification: "PROJECTED",
        factors,
        reasoning: [
          `PROJECTED: Based on confirmed exposure on ${sourceName} (score ${sourceScore})`,
          `Relationship weight: ${weight} (${sourceKey} → ${targetKey})`,
          `Projected score: ${sourceScore} × ${weight} = ${projectedScore}`,
        ],
        validatedAt: new Date(),
      };

      // Determine default exposed fields based on target broker's category
      const targetCategory = getBrokerCategory(targetKey);
      const exposedFields = targetCategory
        ? CATEGORY_EXPOSED_FIELDS[targetCategory] || [{ type: "name" }]
        : [{ type: "name" }];

      const projectedResult: ScanResult = {
        source: targetKey as DataSource,
        sourceName: brokerInfo.name,
        sourceUrl,
        dataType: "COMBINED_PROFILE",
        dataPreview: `Your information is likely available on ${brokerInfo.name} based on confirmed exposure on ${sourceName}`,
        severity: getSeverityForBroker(targetKey),
        rawData: { exposedFields },
        confidence,
      };

      projectedMap.set(targetKey, projectedResult);
      // Also mark as existing so later source iterations don't override
      existingBrokerKeys.add(targetKey);
    }
  }

  const projected = Array.from(projectedMap.values());
  stats.projectedCount = projected.length;

  console.log(
    `[ExposureProjector] Projected ${stats.projectedCount} exposures from ${stats.confirmedSources} confirmed sources ` +
    `(${stats.skippedExcluded} excluded, ${stats.skippedDuplicate} dedup, ${stats.skippedLowScore} low-score)`
  );

  return { projected, stats };
}
