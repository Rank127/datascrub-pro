/**
 * Broker Network — Data broker relationship graph for exposure projection.
 *
 * Maps category-level and subsidiary-level relationships between brokers.
 * Used by the exposure projector to project confirmed exposures onto
 * related unscanned brokers.
 *
 * Based on how the data broker industry works: people-search brokers ALL
 * buy from the same 3-4 data aggregators (Acxiom, LexisNexis, Experian
 * Marketing, CoreLogic). If your data is on Spokeo, it IS on most other
 * people-search sites.
 */

import {
  DATA_BROKER_DIRECTORY,
  BROKER_CATEGORIES,
  getSubsidiaries,
  getConsolidationParent,
} from "@/lib/removers/data-broker-directory";

// ─── Category Projection Rules ──────────────────────────────────────────
// If a user is found on a broker in the source category, project to all
// brokers in the target categories with the given weight.

export interface CategoryProjection {
  targetCategory: string;
  weight: number;
}

/**
 * When a CONFIRMED/LIKELY exposure is found on a broker in a given category,
 * project to these related categories.
 */
export const CATEGORY_PROJECTION_RULES: Record<string, CategoryProjection[]> = {
  PEOPLE_SEARCH: [
    { targetCategory: "PEOPLE_SEARCH", weight: 0.90 },
    { targetCategory: "PHONE_LOOKUP", weight: 0.82 },
    { targetCategory: "BACKGROUND_CHECK", weight: 0.82 },
    { targetCategory: "PROPERTY_RECORDS", weight: 0.70 }, // Only if user has address
    { targetCategory: "COURT_RECORDS", weight: 0.60 },
  ],
  PHONE_LOOKUP: [
    { targetCategory: "PHONE_LOOKUP", weight: 0.85 },
    { targetCategory: "PEOPLE_SEARCH", weight: 0.75 },
  ],
  BACKGROUND_CHECK: [
    { targetCategory: "BACKGROUND_CHECK", weight: 0.85 },
    { targetCategory: "PEOPLE_SEARCH", weight: 0.75 },
    { targetCategory: "COURT_RECORDS", weight: 0.70 },
  ],
};

// Subsidiary relationship weights
const SUBSIDIARY_WEIGHT = 0.95;
const SAME_PARENT_WEIGHT = 0.90;

// Minimum projected score to create an exposure
export const PROJECTION_MIN_SCORE = 45;

// ─── Category Lookup ────────────────────────────────────────────────────

// Build a reverse lookup: brokerKey → category name
const brokerToCategoryCache = new Map<string, string>();

function buildCategoryCache(): void {
  if (brokerToCategoryCache.size > 0) return;

  const categoriesToIndex = [
    "PEOPLE_SEARCH", "PHONE_LOOKUP", "BACKGROUND_CHECK",
    "COURT_RECORDS", "PROPERTY_RECORDS", "EMAIL_IDENTITY",
    "PROFESSIONAL_B2B", "MARKETING", "DATING_RELATIONSHIP",
    "FINANCIAL", "VEHICLE_DRIVING", "GENEALOGY",
    "INTERNATIONAL", "EDUCATIONAL", "HEALTHCARE",
    "LOCATION_TRACKING", "INSURANCE_RISK", "IDENTITY_GRAPHS",
  ];

  for (const cat of categoriesToIndex) {
    const brokers = (BROKER_CATEGORIES as Record<string, readonly string[]>)[cat];
    if (brokers) {
      for (const broker of brokers) {
        brokerToCategoryCache.set(broker, cat);
      }
    }
  }
}

/**
 * Get the primary category for a broker key.
 * Returns undefined if the broker isn't in any indexed category.
 */
export function getBrokerCategory(brokerKey: string): string | undefined {
  buildCategoryCache();
  return brokerToCategoryCache.get(brokerKey);
}

// ─── Exclusion Checks ───────────────────────────────────────────────────

// Build exclusion sets once
const SOCIAL_MEDIA_SET = new Set(BROKER_CATEGORIES.SOCIAL_MEDIA as readonly string[]);
const BREACH_DB_SET = new Set(BROKER_CATEGORIES.BREACH_DATABASE as readonly string[]);
const DIRECT_RELATIONSHIP_SET = new Set(BROKER_CATEGORIES.DIRECT_RELATIONSHIP_PLATFORMS as readonly string[]);
const GRAY_AREA_SET = new Set(BROKER_CATEGORIES.GRAY_AREA_SOURCES as readonly string[]);
const SERVICE_PROVIDER_SET = new Set(BROKER_CATEGORIES.SERVICE_PROVIDER_SOURCES as readonly string[]);
const NON_REMOVABLE_SET = new Set(BROKER_CATEGORIES.NON_REMOVABLE as readonly string[]);

// Expansion exclusion categories
const EXPANSION_CATEGORIES = [
  "PEOPLE_SEARCH_EXPANSION", "PHONE_LOOKUP_EXPANSION", "ADDRESS_LOOKUP_EXPANSION",
  "B2B_DATA_EXPANSION", "MARKETING_DATA_EXPANSION", "BACKGROUND_CHECK_EXPANSION",
  "INTERNATIONAL_EXPANSION", "PROPERTY_DATA_EXPANSION", "EMAIL_MARKETING_EXPANSION",
  "SOCIAL_MEDIA_AGGREGATORS", "IDENTITY_VERIFICATION_EXPANSION",
] as const;

const EXPANSION_SET = new Set<string>();
for (const cat of EXPANSION_CATEGORIES) {
  const brokers = (BROKER_CATEGORIES as Record<string, readonly string[]>)[cat];
  if (brokers) {
    for (const broker of brokers) {
      EXPANSION_SET.add(broker);
    }
  }
}

// AI categories to exclude
const AI_TRAINING_SET = new Set(BROKER_CATEGORIES.AI_TRAINING as readonly string[]);
const AI_IMAGE_SET = new Set(BROKER_CATEGORIES.AI_IMAGE_VIDEO as readonly string[]);

/**
 * Check if a broker should be excluded from projection.
 */
export function isExcludedFromProjection(brokerKey: string): boolean {
  // Direct relationship / gray area / service provider — not data brokers
  if (DIRECT_RELATIONSHIP_SET.has(brokerKey)) return true;
  if (GRAY_AREA_SET.has(brokerKey)) return true;
  if (SERVICE_PROVIDER_SET.has(brokerKey)) return true;

  // Social media / breach databases — handled by dedicated scanners
  if (SOCIAL_MEDIA_SET.has(brokerKey)) return true;
  if (BREACH_DB_SET.has(brokerKey)) return true;

  // Non-removable / expansion (bogus) entries
  if (NON_REMOVABLE_SET.has(brokerKey)) return true;
  if (EXPANSION_SET.has(brokerKey)) return true;

  // AI services
  if (AI_TRAINING_SET.has(brokerKey)) return true;
  if (AI_IMAGE_SET.has(brokerKey)) return true;

  // Check broker info for category/method exclusions
  const info = DATA_BROKER_DIRECTORY[brokerKey];
  if (!info) return true; // Not in directory

  if (info.category === "AI_SERVICE" || info.category === "SERVICE_PROVIDER") return true;
  if (info.category === "BREACH_DATABASE" || info.category === "DARK_WEB") return true;
  if (info.category === "SOCIAL_MEDIA") return true;

  // Not removable AND no contact info
  if (info.removalMethod === "NOT_REMOVABLE" && !info.optOutUrl && !info.privacyEmail) return true;

  return false;
}

// ─── Projection Targets ─────────────────────────────────────────────────

/**
 * Get all category-based projection targets for a source broker.
 * Returns pairs of [brokerKey, weight] to project onto.
 */
export function getCategoryProjectionTargets(
  sourceBrokerKey: string,
  userHasAddress: boolean
): Array<{ brokerKey: string; weight: number }> {
  const sourceCategory = getBrokerCategory(sourceBrokerKey);
  if (!sourceCategory) return [];

  const rules = CATEGORY_PROJECTION_RULES[sourceCategory];
  if (!rules) return [];

  const targets: Array<{ brokerKey: string; weight: number }> = [];

  for (const rule of rules) {
    // Skip property records projection if user has no address
    if (rule.targetCategory === "PROPERTY_RECORDS" && !userHasAddress) continue;

    const brokers = (BROKER_CATEGORIES as Record<string, readonly string[]>)[rule.targetCategory];
    if (!brokers) continue;

    for (const broker of brokers) {
      // Don't project back to the source broker
      if (broker === sourceBrokerKey) continue;

      targets.push({ brokerKey: broker, weight: rule.weight });
    }
  }

  return targets;
}

/**
 * Get subsidiary-based projection targets for a broker.
 * Projects: parent → subsidiaries, subsidiary → parent, same parent → siblings.
 */
export function getSubsidiaryProjectionTargets(
  sourceBrokerKey: string
): Array<{ brokerKey: string; weight: number }> {
  const targets: Array<{ brokerKey: string; weight: number }> = [];

  // Parent → subsidiaries
  const subsidiaries = getSubsidiaries(sourceBrokerKey);
  for (const sub of subsidiaries) {
    targets.push({ brokerKey: sub, weight: SUBSIDIARY_WEIGHT });
  }

  // Subsidiary → parent
  const parent = getConsolidationParent(sourceBrokerKey);
  if (parent) {
    targets.push({ brokerKey: parent, weight: SUBSIDIARY_WEIGHT });

    // Same parent → siblings
    const siblings = getSubsidiaries(parent);
    for (const sibling of siblings) {
      if (sibling !== sourceBrokerKey) {
        targets.push({ brokerKey: sibling, weight: SAME_PARENT_WEIGHT });
      }
    }
  }

  return targets;
}
