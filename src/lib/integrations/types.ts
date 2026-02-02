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
// Bing Webmaster Tools Integration Types
// ============================================

export interface BingSearchQuery {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

export interface BingPageStats {
  url: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

export interface BingCrawlStats {
  crawledPages: number;
  crawlErrors: number;
  inIndex: number;
  blockedByRobots: number;
}

export interface BingBacklink {
  sourceUrl: string;
  anchorText: string;
}

export interface BingSearchPerformance {
  clicks: number;
  impressions: number;
  averageCtr: number;
  averagePosition: number;
}

export interface BingIntegrationResponse {
  configured: boolean;
  searchPerformance?: BingSearchPerformance;
  topQueries: BingSearchQuery[];
  topPages: BingPageStats[];
  crawlStats?: BingCrawlStats;
  recentBacklinks: BingBacklink[];
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

export interface UsersByPlan {
  free: number;
  pro: number;
  enterprise: number;
  total: number;
}

export interface RemovalsByStatus {
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
  total: number;
}

export interface ExposuresByStatus {
  active: number;
  removalPending: number;
  removalInProgress: number;
  removed: number;
  whitelisted: number;
  monitoring: number; // Non-removable sources (breach databases, dark web)
  total: number;
}

export interface ScansByStatus {
  pending: number;
  running: number;
  completed: number;
  failed: number;
  total: number;
}

export interface DatabaseBusinessMetrics {
  users: UsersByPlan;
  removals: RemovalsByStatus;
  exposures: ExposuresByStatus;
  scans: ScansByStatus;
  subscriptions: {
    active: number;
    canceled: number;
    total: number;
  };
}

export interface DatabaseIntegrationResponse {
  configured: boolean;
  tables: DatabaseTable[];
  totalSize: string;
  connectionStatus: "healthy" | "degraded" | "error";
  latencyMs: number;
  businessMetrics?: DatabaseBusinessMetrics;
  error?: string;
}

// ============================================
// External Services Types
// ============================================

export interface RateLimitHealth {
  status: "healthy" | "warning" | "critical";
  used: number;
  limit: number;
  percentUsed: number;
  resetAt?: string;
  recommendation?: string;
}

export interface ServiceStatus {
  status: "connected" | "error" | "not_configured";
  message?: string;
  rateLimit?: RateLimitHealth;
}

export interface EmailQueueInfo {
  queued: number;
  processing: number;
  sent: number;
  failed: number;
  nextProcessAt: string | null;
}

export interface ResendServiceStatus extends ServiceStatus {
  recentEmailCount?: number;
  deliveryRate?: number;
  monthlyLimit?: number;
  monthlyUsed?: number;
  queue?: EmailQueueInfo;
}

// HIBP uses standard ServiceStatus (no additional fields needed)
export type HIBPServiceStatus = ServiceStatus;

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
  keysCount?: number;
  maxStorage?: string;
}

export interface AnthropicServiceStatus extends ServiceStatus {
  model?: string;
  tokensUsed?: number;
  tokensLimit?: number;
}

export interface TwilioServiceStatus extends ServiceStatus {
  accountSid?: string;
  balance?: number;
  currency?: string;
  smsCount?: number;
}

export interface ServicesIntegrationResponse {
  resend: ResendServiceStatus;
  hibp: HIBPServiceStatus;
  leakcheck: LeakCheckServiceStatus;
  scrapingbee: ScrapingBeeServiceStatus;
  redis: RedisServiceStatus;
  anthropic: AnthropicServiceStatus;
  twilio: TwilioServiceStatus;
}

// ============================================
// Combined Integration State
// ============================================

export interface IntegrationsState {
  vercel: VercelIntegrationResponse | null;
  stripe: StripeIntegrationResponse | null;
  analytics: AnalyticsIntegrationResponse | null;
  bing: BingIntegrationResponse | null;
  database: DatabaseIntegrationResponse | null;
  services: ServicesIntegrationResponse | null;
  loading: {
    vercel: boolean;
    stripe: boolean;
    analytics: boolean;
    bing: boolean;
    database: boolean;
    services: boolean;
  };
  errors: {
    vercel: string | null;
    stripe: string | null;
    analytics: string | null;
    bing: string | null;
    database: string | null;
    services: string | null;
  };
}
