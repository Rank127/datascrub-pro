// Shared API response types for type safety between frontend and backend

export interface TimeSaved {
  minutes: number
  hours: number
  estimatedValue: number
}

export interface ManualAction {
  total: number
  done: number
  pending: number
}

export interface TrendData {
  current: number
  previous: number
  changePercent: number
}

export interface BrokerStats {
  source: string
  sourceName: string
  exposureCount: number
  completedCount: number
  inProgressCount: number
  pendingCount: number
  status: string
  lastCompletedAt?: string
  isParent: boolean
  subsidiaryCount: number
  subsidiaries: string[]
  consolidatesTo: string | null
  parentName: string | null
}

export interface CategoryProgress {
  completed: number
  total: number
  percentage: number
}

export interface AIProtectionStats {
  total: number
  aiTraining: number
  facialRecognition: number
  voiceCloning: number
  optedOut: number
}

export interface DashboardStats {
  totalExposures: number
  activeExposures: number
  removedExposures: number
  whitelistedItems: number
  dataProcessorsExcluded: number
  pendingRemovals: number
  totalRemovalRequests: number
  riskScore: number
  manualAction: ManualAction
  aiProtection: AIProtectionStats
  userPlan: string
}

export interface ExposureSummary {
  id: string
  source: string
  sourceName: string
  sourceUrl: string | null
  dataType: string
  dataPreview: string | null
  severity: string
  status: string
  isWhitelisted: boolean
  firstFoundAt: string
  requiresManualAction: boolean
  manualActionTaken: boolean
  confidenceScore: number | null
  matchClassification: string | null
  userConfirmed: boolean | null
}

export interface DashboardStatsResponse {
  stats: DashboardStats
  protectionScore: number
  timeSaved: TimeSaved
  trends: {
    exposures: TrendData
    removals: TrendData
  }
  brokerStats: BrokerStats[]
  recentExposures: ExposureSummary[]
  removalProgress: {
    dataBrokers: CategoryProgress
    breaches: CategoryProgress
    socialMedia: CategoryProgress
    aiProtection: CategoryProgress
  }
}

export interface ExposuresResponse {
  exposures: ExposureSummary[]
  stats: {
    total: number
    byStatus: Record<string, number>
    bySeverity: Record<string, number>
    activeSeverity: Record<string, number>
  }
  manualAction: {
    totalBrokers: number
    brokersPending: number
    brokersDone: number
  }
  pagination: {
    total: number
    pages: number
    page: number
    limit: number
  }
}

export interface RemovalRequest {
  id: string
  status: string
  createdAt: string
  submittedAt: string | null
  completedAt: string | null
  exposure: {
    source: string
    sourceName: string
  }
}

export interface RemovalsResponse {
  removals: RemovalRequest[]
  stats: {
    total: number
    byStatus: Record<string, number>
  }
  manualAction: ManualAction
}
