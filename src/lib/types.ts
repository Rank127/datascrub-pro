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

// Data Sources (expanded for AI Shield - 60+ AI sources)
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

  // ==========================================
  // AI TRAINING DATASETS (20 sources)
  // ==========================================
  SPAWNING_AI: "SPAWNING_AI",
  LAION_AI: "LAION_AI",
  STABILITY_AI: "STABILITY_AI",
  OPENAI: "OPENAI",
  ANTHROPIC: "ANTHROPIC",
  MIDJOURNEY: "MIDJOURNEY",
  META_AI: "META_AI",
  GOOGLE_AI: "GOOGLE_AI",
  MICROSOFT_AI: "MICROSOFT_AI",
  LINKEDIN_AI: "LINKEDIN_AI",
  ADOBE_AI: "ADOBE_AI",
  AMAZON_AI: "AMAZON_AI",
  APPLE_AI: "APPLE_AI",
  X_AI: "X_AI",
  REDDIT_AI: "REDDIT_AI",
  SHUTTERSTOCK_AI: "SHUTTERSTOCK_AI",
  GETTY_AI: "GETTY_AI",
  HUGGINGFACE: "HUGGINGFACE",
  COMMON_CRAWL: "COMMON_CRAWL",
  COHERE_AI: "COHERE_AI",

  // ==========================================
  // FACIAL RECOGNITION (12 sources)
  // ==========================================
  CLEARVIEW_AI: "CLEARVIEW_AI",
  PIMEYES: "PIMEYES",
  FACECHECK_ID: "FACECHECK_ID",
  SOCIAL_CATFISH: "SOCIAL_CATFISH",
  TINEYE: "TINEYE",
  YANDEX_IMAGES: "YANDEX_IMAGES",
  GOOGLE_IMAGES: "GOOGLE_IMAGES",
  BING_IMAGES: "BING_IMAGES",
  AMAZON_REKOGNITION: "AMAZON_REKOGNITION",
  FINDFACE: "FINDFACE",
  KAIROS: "KAIROS",
  FACE_PLUS_PLUS: "FACE_PLUS_PLUS",

  // ==========================================
  // VOICE CLONING (10 sources)
  // ==========================================
  ELEVENLABS: "ELEVENLABS",
  RESEMBLE_AI: "RESEMBLE_AI",
  MURF_AI: "MURF_AI",
  PLAY_HT: "PLAY_HT",
  DESCRIPT: "DESCRIPT",
  LOVO_AI: "LOVO_AI",
  REPLICA_STUDIOS: "REPLICA_STUDIOS",
  COQUI_AI: "COQUI_AI",
  SPEECHIFY: "SPEECHIFY",
  WELLSAID_LABS: "WELLSAID_LABS",

  // ==========================================
  // DEEPFAKE VIDEO (10 sources)
  // ==========================================
  D_ID: "D_ID",
  HEYGEN: "HEYGEN",
  SYNTHESIA: "SYNTHESIA",
  REFACE: "REFACE",
  FACEAPP: "FACEAPP",
  MYHERITAGE_DEEPNOSTALGIA: "MYHERITAGE_DEEPNOSTALGIA",
  WOMBO: "WOMBO",
  DEEP_ART_EFFECTS: "DEEP_ART_EFFECTS",
  ROOP: "ROOP",
  RUNWAY_ML: "RUNWAY_ML",

  // ==========================================
  // AI AVATAR (8 sources)
  // ==========================================
  LENSA_AI: "LENSA_AI",
  READY_PLAYER_ME: "READY_PLAYER_ME",
  ARTBREEDER: "ARTBREEDER",
  DALL_E: "DALL_E",
  STARRY_AI: "STARRY_AI",
  NIGHTCAFE: "NIGHTCAFE",
  PIKA_LABS: "PIKA_LABS",
  SUNO_AI: "SUNO_AI",

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
  // AI-related exposure types
  FACE_DATA: "FACE_DATA",
  VOICE_DATA: "VOICE_DATA",
  AI_TRAINING_DATA: "AI_TRAINING_DATA",
  BIOMETRIC: "BIOMETRIC",
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
  MONITORING: "MONITORING", // Breach data - can't be removed, just monitored
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
  // Data Brokers
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
  // Breaches
  HAVEIBEENPWNED: "Have I Been Pwned",
  DEHASHED: "DeHashed",
  BREACH_DB: "Breach Database",
  // Dark Web
  DARK_WEB_MARKET: "Dark Web Marketplace",
  PASTE_SITE: "Paste Site",
  DARK_WEB_FORUM: "Dark Web Forum",
  // Social Media
  LINKEDIN: "LinkedIn",
  FACEBOOK: "Facebook",
  TWITTER: "Twitter/X",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  REDDIT: "Reddit",
  PINTEREST: "Pinterest",
  YOUTUBE: "YouTube",

  // AI Training Datasets
  SPAWNING_AI: "Spawning AI (Do Not Train)",
  LAION_AI: "LAION AI Dataset",
  STABILITY_AI: "Stability AI",
  OPENAI: "OpenAI",
  ANTHROPIC: "Anthropic (Claude)",
  MIDJOURNEY: "Midjourney",
  META_AI: "Meta AI",
  GOOGLE_AI: "Google AI (Gemini)",
  MICROSOFT_AI: "Microsoft AI (Copilot)",
  LINKEDIN_AI: "LinkedIn AI",
  ADOBE_AI: "Adobe Firefly/AI",
  AMAZON_AI: "Amazon AI (Alexa)",
  APPLE_AI: "Apple Intelligence",
  X_AI: "X/Twitter AI (Grok)",
  REDDIT_AI: "Reddit AI Training",
  SHUTTERSTOCK_AI: "Shutterstock AI",
  GETTY_AI: "Getty Images AI",
  HUGGINGFACE: "Hugging Face",
  COMMON_CRAWL: "Common Crawl",
  COHERE_AI: "Cohere",

  // Facial Recognition
  CLEARVIEW_AI: "Clearview AI",
  PIMEYES: "PimEyes",
  FACECHECK_ID: "FaceCheck.ID",
  SOCIAL_CATFISH: "Social Catfish",
  TINEYE: "TinEye",
  YANDEX_IMAGES: "Yandex Images",
  GOOGLE_IMAGES: "Google Images",
  BING_IMAGES: "Bing Images",
  AMAZON_REKOGNITION: "Amazon Rekognition",
  FINDFACE: "FindFace/NTechLab",
  KAIROS: "Kairos",
  FACE_PLUS_PLUS: "Face++",

  // Voice Cloning
  ELEVENLABS: "ElevenLabs",
  RESEMBLE_AI: "Resemble AI",
  MURF_AI: "Murf AI",
  PLAY_HT: "PlayHT",
  DESCRIPT: "Descript Overdub",
  LOVO_AI: "LOVO AI",
  REPLICA_STUDIOS: "Replica Studios",
  COQUI_AI: "Coqui AI",
  SPEECHIFY: "Speechify",
  WELLSAID_LABS: "WellSaid Labs",

  // Deepfake Video
  D_ID: "D-ID",
  HEYGEN: "HeyGen",
  SYNTHESIA: "Synthesia",
  REFACE: "Reface App",
  FACEAPP: "FaceApp",
  MYHERITAGE_DEEPNOSTALGIA: "MyHeritage Deep Nostalgia",
  WOMBO: "Wombo",
  DEEP_ART_EFFECTS: "Deep Art Effects",
  ROOP: "Roop/DeepFaceLab",
  RUNWAY_ML: "Runway ML",

  // AI Avatar
  LENSA_AI: "Lensa AI",
  READY_PLAYER_ME: "Ready Player Me",
  ARTBREEDER: "Artbreeder",
  DALL_E: "DALL-E (OpenAI)",
  STARRY_AI: "Starry AI",
  NIGHTCAFE: "NightCafe",
  PIKA_LABS: "Pika Labs",
  SUNO_AI: "Suno AI",

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
  MONITORING: "bg-purple-100 text-purple-800", // Breach data - being monitored
};

// ==========================================
// SUPPORT TICKET TYPES
// ==========================================

// Ticket Type
export const TicketType = {
  SCAN_ERROR: "SCAN_ERROR",
  REMOVAL_FAILED: "REMOVAL_FAILED",
  PAYMENT_ISSUE: "PAYMENT_ISSUE",
  ACCOUNT_ISSUE: "ACCOUNT_ISSUE",
  FEATURE_REQUEST: "FEATURE_REQUEST",
  OTHER: "OTHER",
} as const;
export type TicketType = (typeof TicketType)[keyof typeof TicketType];

// Ticket Status
export const TicketStatus = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  WAITING_USER: "WAITING_USER",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;
export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

// Ticket Priority
export const TicketPriority = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;
export type TicketPriority = (typeof TicketPriority)[keyof typeof TicketPriority];

// Ticket Source
export const TicketSource = {
  USER: "USER",
  SYSTEM: "SYSTEM",
  ADMIN: "ADMIN",
} as const;
export type TicketSource = (typeof TicketSource)[keyof typeof TicketSource];

// Ticket type display names
export const TicketTypeNames: Record<TicketType, string> = {
  SCAN_ERROR: "Scan Error",
  REMOVAL_FAILED: "Removal Failed",
  PAYMENT_ISSUE: "Payment Issue",
  ACCOUNT_ISSUE: "Account Issue",
  FEATURE_REQUEST: "Feature Request",
  OTHER: "Other",
};

// Ticket status colors
export const TicketStatusColors: Record<TicketStatus, string> = {
  OPEN: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  WAITING_USER: "bg-purple-100 text-purple-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

// Ticket priority colors
export const TicketPriorityColors: Record<TicketPriority, string> = {
  LOW: "bg-gray-100 text-gray-600",
  NORMAL: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};
