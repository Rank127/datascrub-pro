/**
 * User-Facing Status Mapping
 *
 * Maps 8 internal removal statuses to 3 simple user-facing categories.
 * Modeled after Incogni's approach: In Progress / Removed / Monitoring.
 */

export type UserStatusCategory = "in_progress" | "completed" | "monitoring";

export interface UserStatusConfig {
  category: UserStatusCategory;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  showETA: boolean;
}

/**
 * Internal status → user-facing category mapping.
 *
 * Key insight: users don't need to know about PENDING vs SUBMITTED vs FAILED.
 * All of those mean "we're working on it." Only COMPLETED and breach-related
 * statuses (ACKNOWLEDGED, SKIPPED) get separate treatment.
 */
const STATUS_MAP: Record<string, UserStatusCategory> = {
  PENDING: "in_progress",
  SUBMITTED: "in_progress",
  IN_PROGRESS: "in_progress",
  REQUIRES_MANUAL: "in_progress",
  FAILED: "in_progress",
  COMPLETED: "completed",
  ACKNOWLEDGED: "monitoring",
  SKIPPED: "monitoring",
};

const CATEGORY_CONFIG: Record<UserStatusCategory, UserStatusConfig> = {
  in_progress: {
    category: "in_progress",
    label: "In Progress",
    description:
      "We've sent the removal request and are actively following up. Most brokers respond within 7-45 days.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    showETA: true,
  },
  completed: {
    category: "completed",
    label: "Removed",
    description:
      "Verified: your data has been removed from this broker. We'll continue monitoring for re-collection.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    showETA: false,
  },
  monitoring: {
    category: "monitoring",
    label: "Monitoring",
    description:
      "This source is being monitored. We'll alert you if your data reappears.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    showETA: false,
  },
};

/**
 * Get the user-facing status category for an internal status.
 */
export function getUserStatusCategory(
  internalStatus: string
): UserStatusCategory {
  return STATUS_MAP[internalStatus] || "in_progress";
}

/**
 * Get full user-facing config for an internal status.
 */
export function getUserStatusConfig(internalStatus: string): UserStatusConfig {
  const category = getUserStatusCategory(internalStatus);
  return CATEGORY_CONFIG[category];
}

/**
 * Get config for a category directly.
 */
export function getCategoryConfig(
  category: UserStatusCategory
): UserStatusConfig {
  return CATEGORY_CONFIG[category];
}

/**
 * Calculate estimated completion date from submission date and broker's estimated days.
 */
export function getEstimatedCompletionDate(
  submittedAt: string | Date | null,
  estimatedDays: number | null
): Date | null {
  if (!submittedAt || !estimatedDays || estimatedDays < 0) return null;
  const submitted = new Date(submittedAt);
  return new Date(submitted.getTime() + estimatedDays * 24 * 60 * 60 * 1000);
}

/**
 * Get human-readable ETA string.
 */
export function getETAString(
  submittedAt: string | Date | null,
  estimatedDays: number | null
): string | null {
  const estimated = getEstimatedCompletionDate(submittedAt, estimatedDays);
  if (!estimated) return null;

  const now = new Date();
  const diffMs = estimated.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays <= 0) return "Any day now";
  if (diffDays === 1) return "~1 day";
  if (diffDays <= 7) return `~${diffDays} days`;
  const weeks = Math.ceil(diffDays / 7);
  return `~${weeks} week${weeks > 1 ? "s" : ""}`;
}

/**
 * Calculate simplified stats from raw status counts.
 */
export function getSimplifiedStats(stats: Record<string, number>): {
  inProgress: number;
  completed: number;
  monitoring: number;
  total: number;
} {
  let inProgress = 0;
  let completed = 0;
  let monitoring = 0;

  for (const [status, count] of Object.entries(stats)) {
    const category = getUserStatusCategory(status);
    if (category === "in_progress") inProgress += count;
    else if (category === "completed") completed += count;
    else if (category === "monitoring") monitoring += count;
  }

  return {
    inProgress,
    completed,
    monitoring,
    total: inProgress + completed + monitoring,
  };
}

// --- Broker Compliance Indicators (user-facing) ---

export type BrokerComplianceTier = "excellent" | "good" | "slow" | "poor";

export interface BrokerComplianceIndicator {
  tier: BrokerComplianceTier;
  label: string;
  color: string; // Tailwind text color
  bgColor: string; // Tailwind bg color
  description: string;
}

/**
 * Get user-facing compliance tier from platform-wide success rate.
 * Thresholds match existing compliance color scheme.
 */
export function getBrokerComplianceTier(
  successRate: number
): BrokerComplianceIndicator {
  if (successRate >= 80) {
    return {
      tier: "excellent",
      label: "Excellent",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
      description: `${Math.round(successRate)}% platform success rate — this broker responds quickly and reliably`,
    };
  }
  if (successRate >= 55) {
    return {
      tier: "good",
      label: "Good",
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      description: `${Math.round(successRate)}% platform success rate — this broker typically complies with removal requests`,
    };
  }
  if (successRate >= 30) {
    return {
      tier: "slow",
      label: "Slow",
      color: "text-amber-400",
      bgColor: "bg-amber-500/20",
      description: `${Math.round(successRate)}% platform success rate — this broker is slower to respond but we follow up persistently`,
    };
  }
  return {
    tier: "poor",
    label: "Poor",
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    description: `${Math.round(successRate)}% platform success rate — this broker is difficult but we escalate aggressively`,
  };
}
