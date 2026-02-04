// Executive Dashboard TypeScript Interfaces

export interface ExecutiveStatsResponse {
  finance: FinanceMetrics;
  analytics: WebAnalyticsMetrics;
  operations: OperationsMetrics;
  activities: ActivitiesMetrics;
  platform: PlatformMetrics; // User/exposure/removal trends
  generatedAt: string;
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
  scansCount: number;
  exposuresCount: number;
  lastActive: string;
}

// Plan pricing in cents for MRR calculation
export const PLAN_PRICING = {
  FREE: 0,
  PRO: 1199, // $11.99
  ENTERPRISE: 2999, // $29.99
} as const;
