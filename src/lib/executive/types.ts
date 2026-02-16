// Executive Dashboard TypeScript Interfaces

export interface ExecutiveStatsResponse {
  finance: FinanceMetrics;
  analytics: WebAnalyticsMetrics;
  operations: OperationsMetrics;
  activities: ActivitiesMetrics;
  platform: PlatformMetrics; // User/exposure/removal trends
  competitive?: CompetitiveIntelMetrics;
  growth?: GrowthMetrics;
  corporate?: CorporateMetrics;
  generatedAt: string;
}

export interface CorporateMetrics {
  totalAccounts: number;
  totalSeats: number;
  activeSeats: number;
  accountsByTier: Record<string, number>;
  totalCorporateARR: number; // cents
  recentAccounts: Array<{
    id: string;
    name: string;
    tier: string;
    maxSeats: number;
    activeSeats: number;
    status: string;
    createdAt: string;
  }>;
}

export interface CompetitiveIntelMetrics {
  lastRun: string | null;
  totalSnapshots: number;
  recentChanges: Array<{
    id: string;
    competitor: string;
    changeType: string;
    description: string;
    impact: string;
    detectedAt: string;
    acknowledged: boolean;
  }>;
  gapAnalysis: Array<{
    feature: string;
    competitors: string[];
    priority: string;
    estimatedImpact: string;
  }>;
  advantages: Array<{
    feature: string;
    description: string;
  }>;
  recommendations: string[];
  changesByCompetitor: Record<string, number>;
  changesByType: Record<string, number>;
}

export interface FinanceMetrics {
  mrr: number; // Monthly Recurring Revenue in cents
  mrrGrowth: number; // Percentage change from last month
  subscriptionsByPlan: {
    FREE: number;
    PRO: number;
    ENTERPRISE: number;
  };
  activeSubscriptions: number;
  canceledSubscriptions: number;
  pastDueSubscriptions: number;
  newSubscriptionsThisMonth: number;
  churnRate: number; // Percentage
  arpu: number; // Average Revenue Per User in cents
}

// Platform metrics (users, exposures, removals) - moved to Operations
export interface PlatformMetrics {
  totalUsers: number;
  newUsersThisMonth: number;
  userGrowthRate: number; // Percentage
  totalExposures: number;
  totalRemovals: number;
  removalSuccessRate: number; // Percentage
  scanCompletionRate: number; // Percentage
  avgExposuresPerUser: number;
  trends: {
    users: TrendDataPoint[];
    exposures: TrendDataPoint[];
    removals: TrendDataPoint[];
  };
}

// Web Analytics (Google Analytics + Bing)
export interface WebAnalyticsMetrics {
  googleAnalytics: {
    configured: boolean;
    pageViews?: {
      today: number;
      week: number;
      month: number;
    };
    activeUsers?: {
      dau: number;
      wau: number;
      mau: number;
    };
    realTimeUsers?: {
      activeUsers: number;
      activeUsersByCountry: { country: string; users: number }[];
      activeUsersByPage: { page: string; users: number }[];
    };
    topPages: { path: string; views: number }[];
    trafficSources: { source: string; sessions: number }[];
  };
  bing: {
    configured: boolean;
    searchPerformance?: {
      clicks: number;
      impressions: number;
      averageCtr: number;
      averagePosition: number;
    };
    topQueries: { query: string; impressions: number; clicks: number; ctr: number; position: number }[];
    crawlStats?: {
      crawledPages: number;
      crawlErrors: number;
      inIndex: number;
    };
  };
}

// Legacy alias for backwards compatibility
export type AnalyticsMetrics = WebAnalyticsMetrics;

export interface OperationsMetrics {
  pendingRemovalRequests: number; // Legacy: PENDING + SUBMITTED combined
  inProgressRemovals: number;
  manualActionQueue: number;
  customRemovalBacklog: number; // Enterprise feature
  avgRemovalTimeHours: number;
  systemHealth: {
    scanSuccessRate: number;
    removalSuccessRate: number;
    lastScanTime: string | null;
  };
  removalsByStatus: Record<string, number>;
  removalsByMethod: Record<string, number>;
  // New granular queue breakdown
  queueBreakdown?: {
    toProcess: number;      // PENDING only - items waiting to be sent
    awaitingResponse: number; // SUBMITTED - emails sent, waiting for broker
    requiresManual: number;   // REQUIRES_MANUAL status
    manualExposures: number;  // Exposures needing manual action
    totalPipeline: number;    // Sum of all active items
  };
  // Real-time cron health + ticket SLA
  cronHealth?: {
    total: number;
    healthy: number;
    overdue: number;
    failed: number;
    criticalJobs: Array<{
      name: string;
      lastRun: string | null;
      lastStatus: string | null;
      isOverdue: boolean;
      expectedInterval: string;
    }>;
  };
  ticketSLA?: {
    openTickets: number;
    inProgressTickets: number;
    waitingUserTickets: number;
    breachedSLAs: number;
    avgResponseHours: number | null;
    avgResolutionHours: number | null;
    resolvedToday: number;
    autoFixedToday: number;
  };
  agentPerformance?: {
    totalAgents: number;
    healthyAgents: number;
    degradedAgents: number;
    failedAgents: number;
    totalCost24h: number;
    totalExecutions24h: number;
    agents: Array<{
      agentId: string;
      status: string;
      successRate: number;
      avgDuration: number;
      executions: number;
      estimatedCost: number;
      avgConfidence: number | null;
      humanReviewRate: number;
    }>;
  };
  brokerIntelligence?: {
    totalBrokers: number;
    topPerformers: Array<{
      source: string;
      sourceName: string | null;
      successRate: number;
      removalsCompleted: number;
      removalsSent: number;
    }>;
    worstPerformers: Array<{
      source: string;
      sourceName: string | null;
      successRate: number;
      falsePositiveRate: number;
      removalsSent: number;
    }>;
  };
  remediationSavings?: {
    autoFixedToday: number;
    autoFixed7d: number;
    aiCallsAvoidedToday: number;
    aiCallsAvoided7d: number;
    estimatedCostSaved7d: number; // cents
  };
  queueVelocity?: {
    itemsProcessedLast24h: number;
    itemsProcessedLast7d: number;
    avgItemsPerHour24h: number;
    avgItemsPerRun: number;
    runsLast24h: number;
  };
  emailQueue?: {
    queued: number;
    processing: number;
    sent: number;
    failed: number;
    quotaUsed: number;
    quotaLimit: number;
    quotaPercentUsed: number;
  };
  linkHealth?: {
    lastRun: string | null;
    checked: number;
    working: number;
    broken: number;
    errors: number;
    corrected: number;
    suggested: number;
    healthPercent: number;
    brokenLinks: Array<{ broker: string; url: string; status: number | string }>;
  };
}

export interface ActivitiesMetrics {
  recentSignups: UserActivity[];
  recentScans: ScanActivity[];
  recentPlanChanges: PlanChangeActivity[];
  recentAuditLogs: AuditLogEntry[];
  activeUsersLast7Days: number;
  activeUsersLast30Days: number;
  topUsersByActivity: TopUser[];
}

export interface PlanChangeActivity {
  id: string;
  userId: string;
  userEmail: string; // Masked
  userName: string | null;
  previousPlan: string;
  newPlan: string;
  changeType: "upgrade" | "downgrade" | "cancel";
  reason?: string;
  createdAt: string;
}

export interface TrendDataPoint {
  date: string; // YYYY-MM format
  value: number;
}

export interface UserActivity {
  id: string;
  email: string; // Masked for non-SUPER_ADMIN
  name: string | null;
  plan: string;
  effectivePlan?: string; // Effective plan considering family membership
  createdAt: string;
}

export interface ScanActivity {
  id: string;
  userEmail: string; // Masked
  type: string;
  status: string;
  exposuresFound: number;
  sourcesChecked: number;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorEmail: string; // Masked
  action: string;
  resource: string;
  targetEmail: string | null; // Masked
  success: boolean;
  createdAt: string;
}

export interface TopUser {
  id: string;
  email: string; // Masked
  name: string | null;
  plan: string;
  effectivePlan?: string; // Effective plan considering family membership
  scansCount: number;
  exposuresCount: number;
  lastActive: string;
}

export interface GrowthMetrics {
  lastRun: string | null;
  powerUsers: {
    identified: number;
    advocateCandidates: number;
    upsellCandidates: number;
    topUsers: Array<{
      email: string;
      score: number;
      segments: string[];
      scans: number;
      removals: number;
      tenure: number;
    }>;
    insights: string[];
  };
  referrals: {
    analyzed: number;
    totalReferrers: number;
    conversionRate: number;
    recommendations: string[];
  };
  viralCoefficient: number;
}

// Plan pricing in cents for MRR calculation
// Annual pricing, effective Feb 2026 (50%/55% OFF annual plans)
export const PLAN_PRICING = {
  FREE: 0,
  PRO: 11988, // $119.88/year ($9.99/mo effective, 50% OFF)
  ENTERPRISE: 26995, // $269.95/year ($22.50/mo effective, 55% OFF)
} as const;

export const PLAN_ORIGINAL_PRICING = {
  FREE: 0,
  PRO: 23988, // $239.88/year ($19.99/mo × 12)
  ENTERPRISE: 59988, // $599.88/year ($49.99/mo × 12)
} as const;

// Corporate plan pricing in cents (annual)
export const CORPORATE_PLAN_PRICING = {
  CORP_10: 199900, // $1,999/year (10 seats)
  CORP_25: 399900, // $3,999/year (25 seats)
  CORP_50: 699900, // $6,999/year (50 seats)
  CORP_100: 1199900, // $11,999/year (100 seats)
  FAMILY_ADDON: 12000, // $120/year per family add-on
} as const;
