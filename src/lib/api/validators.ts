import { z } from 'zod'

// Time saved validation
export const TimeSavedSchema = z.object({
  minutes: z.number().min(0),
  hours: z.number().min(0),
  estimatedValue: z.number().min(0),
})

// Manual action validation
export const ManualActionSchema = z.object({
  total: z.number().min(0),
  done: z.number().min(0),
  pending: z.number().min(0),
})

// Trend data validation
export const TrendDataSchema = z.object({
  current: z.number(),
  previous: z.number(),
  changePercent: z.number(),
})

// Broker stats validation
export const BrokerStatsSchema = z.object({
  source: z.string(),
  sourceName: z.string(),
  exposureCount: z.number().min(0),
  completedCount: z.number().min(0),
  inProgressCount: z.number().min(0),
  pendingCount: z.number().min(0),
  status: z.string(),
  lastCompletedAt: z.date().optional(),
  isParent: z.boolean(),
  subsidiaryCount: z.number().min(0),
  subsidiaries: z.array(z.string()),
  consolidatesTo: z.string().nullable(),
  parentName: z.string().nullable(),
})

// Category progress validation
export const CategoryProgressSchema = z.object({
  completed: z.number().min(0),
  total: z.number().min(0),
  percentage: z.number().min(0).max(100),
})

// AI Protection stats validation
export const AIProtectionStatsSchema = z.object({
  total: z.number().min(0),
  aiTraining: z.number().min(0),
  facialRecognition: z.number().min(0),
  voiceCloning: z.number().min(0),
  optedOut: z.number().min(0),
})

// Dashboard stats validation
export const DashboardStatsSchema = z.object({
  totalExposures: z.number().min(0),
  activeExposures: z.number().min(0),
  removedExposures: z.number().min(0),
  whitelistedItems: z.number().min(0),
  dataProcessorsExcluded: z.number().min(0),
  pendingRemovals: z.number().min(0),
  totalRemovalRequests: z.number().min(0),
  riskScore: z.number().min(0).max(100),
  manualAction: ManualActionSchema,
  aiProtection: AIProtectionStatsSchema,
  userPlan: z.string(),
})

// Exposure summary validation
export const ExposureSummarySchema = z.object({
  id: z.string(),
  source: z.string(),
  sourceName: z.string().nullable(),
  sourceUrl: z.string().nullable(),
  dataType: z.string(),
  dataPreview: z.string().nullable(),
  severity: z.string(),
  status: z.string(),
  isWhitelisted: z.boolean(),
  firstFoundAt: z.union([z.string(), z.date()]),
  requiresManualAction: z.boolean(),
  manualActionTaken: z.boolean(),
  confidenceScore: z.number().nullable(),
  matchClassification: z.string().nullable(),
  userConfirmed: z.boolean().nullable(),
})

// Full dashboard response validation
export const DashboardStatsResponseSchema = z.object({
  stats: DashboardStatsSchema,
  protectionScore: z.number().min(0).max(100),
  timeSaved: TimeSavedSchema,
  trends: z.object({
    exposures: TrendDataSchema,
    removals: TrendDataSchema,
  }),
  brokerStats: z.array(BrokerStatsSchema),
  recentExposures: z.array(ExposureSummarySchema),
  removalProgress: z.object({
    dataBrokers: CategoryProgressSchema,
    breaches: CategoryProgressSchema,
    socialMedia: CategoryProgressSchema,
    aiProtection: CategoryProgressSchema,
  }),
})

// Type exports
export type DashboardStats = z.infer<typeof DashboardStatsSchema>
export type DashboardStatsResponse = z.infer<typeof DashboardStatsResponseSchema>
export type TimeSaved = z.infer<typeof TimeSavedSchema>
export type ManualAction = z.infer<typeof ManualActionSchema>
export type TrendData = z.infer<typeof TrendDataSchema>
export type BrokerStats = z.infer<typeof BrokerStatsSchema>
export type CategoryProgress = z.infer<typeof CategoryProgressSchema>
export type AIProtectionStats = z.infer<typeof AIProtectionStatsSchema>
export type ExposureSummary = z.infer<typeof ExposureSummarySchema>

/**
 * Validate API response before sending
 * Throws ZodError if validation fails
 */
export function validateResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}

/**
 * Safely validate API response, returning null on failure
 */
export function safeValidateResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T | null {
  const result = schema.safeParse(data)
  if (result.success) {
    return result.data
  }
  console.error('API response validation failed:', result.error.issues)
  return null
}
