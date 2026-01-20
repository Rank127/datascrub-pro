// Plan Types
export const Plan = {
  FREE: "FREE",
  PRO: "PRO",
  ENTERPRISE: "ENTERPRISE",
} as const;
export type Plan = (typeof Plan)[keyof typeof Plan];

// Scan Status
export const ScanStatus = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;
export type ScanStatus = (typeof ScanStatus)[keyof typeof ScanStatus];

// Scan Types
export const ScanType = {
  FULL: "FULL",
  QUICK: "QUICK",
  MONITORING: "MONITORING",
} as const;
export type ScanType = (typeof ScanType)[keyof typeof ScanType];

// Data Sources
export const DataSource = {
  // Data Brokers
  SPOKEO: "SPOKEO",
  WHITEPAGES: "WHITEPAGES",
  BEENVERIFIED: "BEENVERIFIED",
  INTELIUS: "INTELIUS",
  PEOPLEFINDER: "PEOPLEFINDER",
  TRUEPEOPLESEARCH: "TRUEPEOPLESEARCH",
  RADARIS: "RADARIS",
  FASTPEOPLESEARCH: "FASTPEOPLESEARCH",
  USSEARCH: "USSEARCH",
  PIPL: "PIPL",
  // Breaches
  HAVEIBEENPWNED: "HAVEIBEENPWNED",
  DEHASHED: "DEHASHED",
  BREACH_DB: "BREACH_DB",
  // Dark Web
  DARK_WEB_MARKET: "DARK_WEB_MARKET",
  PASTE_SITE: "PASTE_SITE",
  DARK_WEB_FORUM: "DARK_WEB_FORUM",
  // Social Media
  LINKEDIN: "LINKEDIN",
  FACEBOOK: "FACEBOOK",
  TWITTER: "TWITTER",
  INSTAGRAM: "INSTAGRAM",
  TIKTOK: "TIKTOK",
  REDDIT: "REDDIT",
  PINTEREST: "PINTEREST",
  YOUTUBE: "YOUTUBE",
  OTHER: "OTHER",
} as const;
export type DataSource = (typeof DataSource)[keyof typeof DataSource];

// Exposure Types
export const ExposureType = {
  EMAIL: "EMAIL",
  PHONE: "PHONE",
  NAME: "NAME",
  ADDRESS: "ADDRESS",
  DOB: "DOB",
  SSN: "SSN",
  PHOTO: "PHOTO",
  USERNAME: "USERNAME",
  FINANCIAL: "FINANCIAL",
  COMBINED_PROFILE: "COMBINED_PROFILE",
} as const;
export type ExposureType = (typeof ExposureType)[keyof typeof ExposureType];

// Severity Levels
export const Severity = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;
export type Severity = (typeof Severity)[keyof typeof Severity];

// Exposure Status
export const ExposureStatus = {
  ACTIVE: "ACTIVE",
  REMOVAL_PENDING: "REMOVAL_PENDING",
  REMOVAL_IN_PROGRESS: "REMOVAL_IN_PROGRESS",
  REMOVED: "REMOVED",
  WHITELISTED: "WHITELISTED",
} as const;
export type ExposureStatus = (typeof ExposureStatus)[keyof typeof ExposureStatus];

// Removal Status
export const RemovalStatus = {
  PENDING: "PENDING",
  SUBMITTED: "SUBMITTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REQUIRES_MANUAL: "REQUIRES_MANUAL",
} as const;
export type RemovalStatus = (typeof RemovalStatus)[keyof typeof RemovalStatus];

// Removal Method
export const RemovalMethod = {
  AUTO_FORM: "AUTO_FORM",
  AUTO_EMAIL: "AUTO_EMAIL",
  API: "API",
  MANUAL_GUIDE: "MANUAL_GUIDE",
} as const;
export type RemovalMethod = (typeof RemovalMethod)[keyof typeof RemovalMethod];

// Alert Types
export const AlertType = {
  NEW_EXPOSURE: "NEW_EXPOSURE",
  REMOVAL_COMPLETED: "REMOVAL_COMPLETED",
  SCAN_COMPLETED: "SCAN_COMPLETED",
  REMOVAL_FAILED: "REMOVAL_FAILED",
} as const;
export type AlertType = (typeof AlertType)[keyof typeof AlertType];

// Address Interface
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isCurrent?: boolean;
}

// Personal Profile Interface (for forms)
export interface PersonalProfileInput {
  fullName?: string;
  aliases?: string[];
  emails?: string[];
  phones?: string[];
  addresses?: Address[];
  dateOfBirth?: string;
  ssn?: string;
  photoUrls?: string[];
  usernames?: string[];
}

// Scan Result Interface
export interface ScanResult {
  id: string;
  source: DataSource;
  sourceName: string;
  sourceUrl?: string;
  dataType: ExposureType;
  dataPreview?: string;
  severity: Severity;
  foundAt: Date;
}

// Plan Features
export const PlanFeatures = {
  FREE: {
    maxEmailScans: 1,
    maxPhoneScans: 1,
    monthlyScans: 1,
    autoRemoval: false,
    darkWebMonitoring: false,
    familyProfiles: 1,
    monitoring: "none",
  },
  PRO: {
    maxEmailScans: -1, // unlimited
    maxPhoneScans: -1,
    monthlyScans: 10,
    autoRemoval: true,
    darkWebMonitoring: false,
    familyProfiles: 1,
    monitoring: "weekly",
  },
  ENTERPRISE: {
    maxEmailScans: -1,
    maxPhoneScans: -1,
    monthlyScans: -1,
    autoRemoval: true,
    darkWebMonitoring: true,
    familyProfiles: 5,
    monitoring: "daily",
  },
} as const;

// Data source display names
export const DataSourceNames: Record<DataSource, string> = {
  SPOKEO: "Spokeo",
  WHITEPAGES: "WhitePages",
  BEENVERIFIED: "BeenVerified",
  INTELIUS: "Intelius",
  PEOPLEFINDER: "PeopleFinder",
  TRUEPEOPLESEARCH: "TruePeopleSearch",
  RADARIS: "Radaris",
  FASTPEOPLESEARCH: "FastPeopleSearch",
  USSEARCH: "USSearch",
  PIPL: "Pipl",
  HAVEIBEENPWNED: "Have I Been Pwned",
  DEHASHED: "DeHashed",
  BREACH_DB: "Breach Database",
  DARK_WEB_MARKET: "Dark Web Marketplace",
  PASTE_SITE: "Paste Site",
  DARK_WEB_FORUM: "Dark Web Forum",
  LINKEDIN: "LinkedIn",
  FACEBOOK: "Facebook",
  TWITTER: "Twitter/X",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  REDDIT: "Reddit",
  PINTEREST: "Pinterest",
  YOUTUBE: "YouTube",
  OTHER: "Other",
};

// Severity colors
export const SeverityColors: Record<Severity, string> = {
  LOW: "bg-blue-100 text-blue-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

// Status colors
export const ExposureStatusColors: Record<ExposureStatus, string> = {
  ACTIVE: "bg-red-100 text-red-800",
  REMOVAL_PENDING: "bg-yellow-100 text-yellow-800",
  REMOVAL_IN_PROGRESS: "bg-blue-100 text-blue-800",
  REMOVED: "bg-green-100 text-green-800",
  WHITELISTED: "bg-gray-100 text-gray-800",
};
