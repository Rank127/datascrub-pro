// Pure calculation functions - no database dependencies

export function calculateProtectionScore(
  totalExposures: number,
  removedExposures: number
): number {
  if (totalExposures === 0) return 100
  return Math.round((removedExposures / totalExposures) * 100)
}

export function calculateRiskScore(
  totalExposures: number,
  activeExposures: number,
  criticalCount: number,
  highCount: number
): number {
  if (totalExposures === 0) return 0
  const baseScore = (activeExposures / totalExposures) * 100
  const severityPenalty = criticalCount * 10 + highCount * 5
  return Math.min(100, Math.round(baseScore + severityPenalty))
}

export function calculateWeekOverWeekChange(
  currentWeek: number,
  previousWeek: number
): number {
  if (previousWeek === 0) {
    return currentWeek > 0 ? 100 : 0
  }
  return Math.round(((currentWeek - previousWeek) / previousWeek) * 100)
}

export function calculateTimeSaved(completedRemovals: number): {
  minutes: number
  hours: number
  estimatedValue: number
} {
  const minutes = completedRemovals * 45
  const hours = Math.round(minutes / 60)
  const estimatedValue = Math.round(hours * 15)
  return { minutes, hours, estimatedValue }
}

export type BrokerStatus = 'COMPLETED' | 'PARTIAL' | 'IN_PROGRESS' | 'PENDING'

export function determineBrokerStatus(
  exposureCount: number,
  completedCount: number,
  inProgressCount: number
): BrokerStatus {
  if (completedCount === exposureCount && exposureCount > 0) return 'COMPLETED'
  if (completedCount > 0) return 'PARTIAL'
  if (inProgressCount > 0) return 'IN_PROGRESS'
  return 'PENDING'
}

export function calculateCategoryProgress(
  total: number,
  completed: number
): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}
