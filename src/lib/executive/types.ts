// Executive Dashboard TypeScript Interfaces

export interface ExecutiveStatsResponse {
  finance: FinanceMetrics;
  analytics: AnalyticsMetrics;
  operations: OperationsMetrics;
  activities: ActivitiesMetrics;
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

export interface AnalyticsMetrics {
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

export interface OperationsMetrics {
  pendingRemovalRequests: number;
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
}

export interface ActivitiesMetrics {
  recentSignups: UserActivity[];
  recentScans: ScanActivity[];
  recentAuditLogs: AuditLogEntry[];
  activeUsersLast7Days: number;
  activeUsersLast30Days: number;
  topUsersByActivity: TopUser[];
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
  PRO: 999, // $9.99
  ENTERPRISE: 2999, // $29.99
} as const;
