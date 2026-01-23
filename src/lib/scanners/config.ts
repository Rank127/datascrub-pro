// Scanner Configuration
// Centralized settings for all scanners

export interface ScannerConfig {
  // Use real data broker scanners (vs mock)
  useRealScanners: boolean;

  // Global rate limiting
  globalRateLimitMs: number;

  // Maximum concurrent requests
  maxConcurrentRequests: number;

  // Request timeout in milliseconds
  requestTimeoutMs: number;

  // Retry configuration
  maxRetries: number;
  retryDelayMs: number;

  // Enable detailed logging
  debugLogging: boolean;
}

// Default configuration
const defaultConfig: ScannerConfig = {
  useRealScanners: process.env.USE_MOCK_SCANNERS !== "true",
  globalRateLimitMs: 2000, // 2 seconds between any requests
  maxConcurrentRequests: 3,
  requestTimeoutMs: 30000, // 30 seconds
  maxRetries: 2,
  retryDelayMs: 5000, // 5 seconds
  debugLogging: process.env.NODE_ENV === "development",
};

// Runtime configuration (can be modified)
let runtimeConfig: ScannerConfig = { ...defaultConfig };

/**
 * Get current scanner configuration
 */
export function getScannerConfig(): ScannerConfig {
  return { ...runtimeConfig };
}

/**
 * Update scanner configuration
 */
export function updateScannerConfig(updates: Partial<ScannerConfig>): void {
  runtimeConfig = { ...runtimeConfig, ...updates };
}

/**
 * Reset configuration to defaults
 */
export function resetScannerConfig(): void {
  runtimeConfig = { ...defaultConfig };
}

/**
 * Data broker opt-out information
 */
export interface OptOutInfo {
  source: string;
  optOutUrl: string;
  instructions: string;
  estimatedDays: number;
  requiresEmail: boolean;
  requiresPhone: boolean;
  requiresId: boolean;
  privacyEmail?: string;
  notes?: string;
}

/**
 * Opt-out information for all supported data brokers
 */
export const DATA_BROKER_OPT_OUT: Record<string, OptOutInfo> = {
  SPOKEO: {
    source: "Spokeo",
    optOutUrl: "https://www.spokeo.com/optout",
    instructions:
      "1. Search for your profile on Spokeo\n" +
      "2. Copy your profile URL\n" +
      "3. Go to spokeo.com/optout\n" +
      "4. Paste URL and enter email\n" +
      "5. Click confirmation link in email",
    estimatedDays: 3,
    requiresEmail: true,
    requiresPhone: false,
    requiresId: false,
    privacyEmail: "privacy@spokeo.com",
  },
  WHITEPAGES: {
    source: "WhitePages",
    optOutUrl: "https://www.whitepages.com/suppression-requests",
    instructions:
      "1. Search for your profile\n" +
      "2. Copy profile URL\n" +
      "3. Go to suppression-requests page\n" +
      "4. Enter URL and phone number\n" +
      "5. Verify via phone call",
    estimatedDays: 1,
    requiresEmail: false,
    requiresPhone: true,
    requiresId: false,
    privacyEmail: "support@whitepages.com",
  },
  BEENVERIFIED: {
    source: "BeenVerified",
    optOutUrl: "https://www.beenverified.com/f/optout/search",
    instructions:
      "1. Go to optout search page\n" +
      "2. Search by name and state\n" +
      "3. Find your listing\n" +
      "4. Click 'Remove My Info'\n" +
      "5. Verify via email",
    estimatedDays: 1,
    requiresEmail: true,
    requiresPhone: false,
    requiresId: false,
    privacyEmail: "privacy@beenverified.com",
  },
  TRUEPEOPLESEARCH: {
    source: "TruePeopleSearch",
    optOutUrl: "https://www.truepeoplesearch.com/removal",
    instructions:
      "1. Search for your profile\n" +
      "2. Click 'Remove This Record'\n" +
      "3. Complete CAPTCHA\n" +
      "4. Removal is immediate",
    estimatedDays: 1,
    requiresEmail: false,
    requiresPhone: false,
    requiresId: false,
  },
  FASTPEOPLESEARCH: {
    source: "FastPeopleSearch",
    optOutUrl: "https://www.fastpeoplesearch.com/removal",
    instructions:
      "1. Search for your profile\n" +
      "2. Copy profile URL\n" +
      "3. Go to removal page\n" +
      "4. Paste URL and complete CAPTCHA",
    estimatedDays: 2,
    requiresEmail: false,
    requiresPhone: false,
    requiresId: false,
  },
  RADARIS: {
    source: "Radaris",
    optOutUrl: "https://radaris.com/control/privacy",
    instructions:
      "1. Create account on Radaris\n" +
      "2. Verify identity via phone/email\n" +
      "3. Request profile removal\n" +
      "4. May require follow-up",
    estimatedDays: 7,
    requiresEmail: true,
    requiresPhone: true,
    requiresId: false,
    privacyEmail: "support@radaris.com",
    notes: "Removal process can be lengthy and may require multiple attempts",
  },
  INTELIUS: {
    source: "Intelius",
    optOutUrl: "https://www.intelius.com/opt-out",
    instructions:
      "1. Go to opt-out page\n" +
      "2. Search for your listing\n" +
      "3. Select your record\n" +
      "4. Enter email for verification\n" +
      "5. Click confirmation link",
    estimatedDays: 3,
    requiresEmail: true,
    requiresPhone: false,
    requiresId: false,
    privacyEmail: "privacy@intelius.com",
  },
  PEOPLEFINDER: {
    source: "PeopleFinders",
    optOutUrl: "https://www.peoplefinders.com/manage",
    instructions:
      "1. Go to manage page\n" +
      "2. Search by name and state\n" +
      "3. Find and select your listing\n" +
      "4. Click 'This is me'\n" +
      "5. Complete opt-out process",
    estimatedDays: 2,
    requiresEmail: true,
    requiresPhone: false,
    requiresId: false,
    privacyEmail: "privacy@peoplefinders.com",
  },
};

/**
 * Get opt-out information for a data source
 */
export function getOptOutInfo(source: string): OptOutInfo | null {
  return DATA_BROKER_OPT_OUT[source] || null;
}
