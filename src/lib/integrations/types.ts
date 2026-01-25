// Integration Dashboard TypeScript Interfaces

// ============================================
// Vercel Integration Types
// ============================================

export interface VercelDeployment {
  id: string;
  name: string;
  url: string;
  state: "BUILDING" | "ERROR" | "INITIALIZING" | "QUEUED" | "READY" | "CANCELED";
  createdAt: number;
  buildingAt?: number;
  ready?: number;
  source?: string;
  meta?: {
    githubCommitSha?: string;
    githubCommitMessage?: string;
    githubCommitRef?: string;
    githubCommitAuthorName?: string;
  };
}

export interface VercelProject {
  id: string;
  name: string;
  framework: string | null;
  updatedAt: number;
}

export interface VercelAnalytics {
  pageViews: number;
  visitors: number;
  topPages: { path: string; views: number }[];
}

export interface VercelIntegrationResponse {
  configured: boolean;
  project?: VercelProject;
  deployments: VercelDeployment[];
  analytics?: VercelAnalytics | null;
  error?: string;
}

// ============================================
// Stripe Integration Types
// ============================================

export interface StripeBalance {
  available: number; // in cents
  pending: number; // in cents
}

export interface StripeRevenue {
  today: number;
  week: number;
  month: number;
  total: number;
}

export interface StripeCharge {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  customerEmail: string | null;
  created: number;
}

export interface StripeSubscriptionStats {
  active: number;
  canceled: number;
  pastDue: number;
  trialing: number;
}

export interface StripeCustomer {
  id: string;
  email: string | null;
  name: string | null;
  created: number;
}

export interface StripeIntegrationResponse {
  configured: boolean;
  balance?: StripeBalance;
  revenue?: StripeRevenue;
  recentCharges: StripeCharge[];
  subscriptionStats?: StripeSubscriptionStats;
  recentCustomers: StripeCustomer[];
  error?: string;
}

// ============================================
// Google Analytics Integration Types
// ============================================

export interface GAPageViews {
  today: number;
  week: number;
  month: number;
}

export interface GAActiveUsers {
  dau: number; // Daily Active Users
  wau: number; // Weekly Active Users
  mau: number; // Monthly Active Users
}

export interface GATopPage {
  path: string;
  views: number;
}

export interface GATrafficSource {
  source: string;
  sessions: number;
}

export interface GAConversion {
  event: string;
  count: number;
}

export interface AnalyticsIntegrationResponse {
  configured: boolean;
  pageViews?: GAPageViews;
  activeUsers?: GAActiveUsers;
  topPages: GATopPage[];
  trafficSources: GATrafficSource[];
  conversions: GAConversion[];
  error?: string;
}

// ============================================
// Database Integration Types
// ============================================

export interface DatabaseTable {
  name: string;
  rowCount: number;
  size: string;
}

export interface DatabaseIntegrationResponse {
  configured: boolean;
  tables: DatabaseTable[];
  totalSize: string;
  connectionStatus: "healthy" | "degraded" | "error";
  latencyMs: number;
  error?: string;
}

// ============================================
// External Services Types
// ============================================

export interface ServiceStatus {
  status: "connected" | "error" | "not_configured";
  message?: string;
}

export interface ResendServiceStatus extends ServiceStatus {
  recentEmailCount?: number;
  deliveryRate?: number;
}

export interface HIBPServiceStatus extends ServiceStatus {
  rateLimit?: {
    remaining: number;
    resetAt: string;
  };
}

export interface LeakCheckServiceStatus extends ServiceStatus {
  credits?: number;
}

export interface ScrapingBeeServiceStatus extends ServiceStatus {
  creditsRemaining?: number;
  maxCredits?: number;
}

export interface RedisServiceStatus extends ServiceStatus {
  queueSizes?: Record<string, number>;
  totalJobs?: number;
}

export interface ServicesIntegrationResponse {
  resend: ResendServiceStatus;
  hibp: HIBPServiceStatus;
  leakcheck: LeakCheckServiceStatus;
  scrapingbee: ScrapingBeeServiceStatus;
  redis: RedisServiceStatus;
}

// ============================================
// Combined Integration State
// ============================================

export interface IntegrationsState {
  vercel: VercelIntegrationResponse | null;
  stripe: StripeIntegrationResponse | null;
  analytics: AnalyticsIntegrationResponse | null;
  database: DatabaseIntegrationResponse | null;
  services: ServicesIntegrationResponse | null;
  loading: {
    vercel: boolean;
    stripe: boolean;
    analytics: boolean;
    database: boolean;
    services: boolean;
  };
  errors: {
    vercel: string | null;
    stripe: string | null;
    analytics: string | null;
    database: string | null;
    services: string | null;
  };
}
