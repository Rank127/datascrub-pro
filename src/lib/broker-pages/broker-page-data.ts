/**
 * Programmatic broker removal page data generator.
 * Maps DATA_BROKER_DIRECTORY entries to BrokerInfo objects for SEO landing pages.
 *
 * Generates 350+ pages from the 2,045-entry data broker directory.
 * Existing 25 hand-crafted pages are excluded (Next.js static routes take precedence).
 */

import {
  DATA_BROKER_DIRECTORY,
  BROKER_CATEGORIES,
  type DataBrokerInfo,
  type RemovalMethod,
} from "@/lib/removers/data-broker-directory";
import type { BrokerInfo } from "@/components/broker-removal-template";
import type { HowToStep } from "@/components/seo/structured-data";

// ============================================================
// EXISTING MANUAL PAGES — skip in dynamic route
// ============================================================
export const EXISTING_MANUAL_PAGES = new Set([
  "spokeo", "whitepages", "beenverified", "intelius", "peoplefinder",
  "truepeoplesearch", "radaris", "fastpeoplesearch", "mylife", "ussearch",
  "truthfinder", "instant-checkmate", "usphonebook", "smartbackgroundchecks",
  "checkpeople", "arrests-org", "nuwber", "peekyou", "pipl",
  "searchpeoplefree", "familytreenow", "thatsthem", "clustrmaps",
  "cocofinder", "zoominfo",
]);

// ============================================================
// EXCLUDED CATEGORIES — monitoring/dark web/not-removable
// ============================================================
const MONITORING_EXCLUSIONS = new Set<string>([
  ...(BROKER_CATEGORIES.DARK_WEB_MONITORING as readonly string[]),
  ...(BROKER_CATEGORIES.BREACH_LEAK_DB as readonly string[]),
  ...(BROKER_CATEGORIES.PASTE_SITE_MONITORS as readonly string[]),
  ...(BROKER_CATEGORIES.DARK_MARKETPLACE_MONITORS as readonly string[]),
  ...(BROKER_CATEGORIES.CREDENTIAL_MONITORING as readonly string[]),
  ...(BROKER_CATEGORIES.DARK_WEB_SEARCH as readonly string[]),
  ...(BROKER_CATEGORIES.STEALER_LOG_MONITORS as readonly string[]),
  ...(BROKER_CATEGORIES.RANSOMWARE_LEAK_MONITORS as readonly string[]),
  ...(BROKER_CATEGORIES.CHAT_PLATFORM_MONITORS as readonly string[]),
  ...(BROKER_CATEGORIES.CREDENTIAL_MARKETS as readonly string[]),
  ...(BROKER_CATEGORIES.THREAT_INTEL_PLATFORMS as readonly string[]),
  ...(BROKER_CATEGORIES.BREACH_AGGREGATORS as readonly string[]),
  ...(BROKER_CATEGORIES.ADDITIONAL_PASTE_SITES as readonly string[]),
  ...(BROKER_CATEGORIES.UNDERGROUND_FORUMS as readonly string[]),
  ...(BROKER_CATEGORIES.CARDING_FRAUD_SITES as readonly string[]),
  ...(BROKER_CATEGORIES.ADDITIONAL_STEALER_LOGS as readonly string[]),
  ...(BROKER_CATEGORIES.ADDITIONAL_RANSOMWARE_LEAKS as readonly string[]),
  ...(BROKER_CATEGORIES.TELEGRAM_FRAUD_CHANNELS as readonly string[]),
  ...(BROKER_CATEGORIES.IDENTITY_DOCUMENT_LEAKS as readonly string[]),
  ...(BROKER_CATEGORIES.ADDITIONAL_DARK_MARKETS as readonly string[]),
  ...(BROKER_CATEGORIES.INITIAL_ACCESS_BROKERS as readonly string[]),
  ...(BROKER_CATEGORIES.BOTNET_MALWARE_PANELS as readonly string[]),
  ...(BROKER_CATEGORIES.PHISHING_SCAM_MONITORING as readonly string[]),
  ...(BROKER_CATEGORIES.CRYPTO_THREAT_MONITORING as readonly string[]),
  ...(BROKER_CATEGORIES.GAMING_ACCOUNT_FRAUD as readonly string[]),
  ...(BROKER_CATEGORIES.SOCIAL_MEDIA_ACCOUNT_MARKETS as readonly string[]),
  ...(BROKER_CATEGORIES.STREAMING_ACCOUNT_FRAUD as readonly string[]),
  ...(BROKER_CATEGORIES.GOVERNMENT_MILITARY_LEAKS as readonly string[]),
  ...(BROKER_CATEGORIES.HEALTHCARE_DATA_LEAKS as readonly string[]),
  ...(BROKER_CATEGORIES.CORPORATE_DATA_EXPOSURE as readonly string[]),
  ...(BROKER_CATEGORIES.MOBILE_DEVICE_LEAKS as readonly string[]),
  ...(BROKER_CATEGORIES.ECOMMERCE_RETAIL_FRAUD as readonly string[]),
  ...(BROKER_CATEGORIES.TRAVEL_HOSPITALITY_FRAUD as readonly string[]),
  ...(BROKER_CATEGORIES.EDUCATION_ACADEMIC_LEAKS as readonly string[]),
  ...(BROKER_CATEGORIES.IOT_SMART_DEVICE_LEAKS as readonly string[]),
  ...(BROKER_CATEGORIES.AUTOMOTIVE_VEHICLE_DATA as readonly string[]),
  ...(BROKER_CATEGORIES.FINANCIAL_BANKING_LEAKS as readonly string[]),
  ...(BROKER_CATEGORIES.DATING_ADULT_SITE_LEAKS as readonly string[]),
  ...(BROKER_CATEGORIES.DARK_WEB_MONITORING_EXPANSION as readonly string[]),
  ...(BROKER_CATEGORIES.BREACH_DATABASE as readonly string[]),
  ...(BROKER_CATEGORIES.NON_REMOVABLE as readonly string[]),
]);

const EXPANSION_EXCLUSIONS = new Set<string>([
  ...(BROKER_CATEGORIES.PEOPLE_SEARCH_EXPANSION as readonly string[]),
  ...(BROKER_CATEGORIES.PHONE_LOOKUP_EXPANSION as readonly string[]),
  ...(BROKER_CATEGORIES.ADDRESS_LOOKUP_EXPANSION as readonly string[]),
  ...(BROKER_CATEGORIES.B2B_DATA_EXPANSION as readonly string[]),
  ...(BROKER_CATEGORIES.MARKETING_DATA_EXPANSION as readonly string[]),
  ...(BROKER_CATEGORIES.BACKGROUND_CHECK_EXPANSION as readonly string[]),
  ...(BROKER_CATEGORIES.INTERNATIONAL_EXPANSION as readonly string[]),
  ...(BROKER_CATEGORIES.PROPERTY_DATA_EXPANSION as readonly string[]),
  ...(BROKER_CATEGORIES.EMAIL_MARKETING_EXPANSION as readonly string[]),
  ...(BROKER_CATEGORIES.SOCIAL_MEDIA_AGGREGATORS as readonly string[]),
  ...(BROKER_CATEGORIES.IDENTITY_VERIFICATION_EXPANSION as readonly string[]),
]);

const PLATFORM_EXCLUSIONS = new Set([
  ...(BROKER_CATEGORIES.DIRECT_RELATIONSHIP_PLATFORMS as readonly string[]),
  ...(BROKER_CATEGORIES.GRAY_AREA_SOURCES as readonly string[]),
  ...(BROKER_CATEGORIES.SERVICE_PROVIDER_SOURCES as readonly string[]),
  ...(BROKER_CATEGORIES.SOCIAL_MEDIA as readonly string[]),
]);

// ============================================================
// CATEGORY CLASSIFICATION
// ============================================================
type PageCategory =
  | "people_search" | "background_check" | "phone_lookup"
  | "b2b" | "marketing" | "court_records" | "property"
  | "financial" | "genealogy" | "international"
  | "ai_training" | "ai_image" | "ai_voice" | "ai_facial"
  | "employment" | "vehicle" | "healthcare" | "insurance"
  | "tenant_screening" | "voter" | "location" | "legal"
  | "general";

const CATEGORY_DISPLAY_NAMES: Record<PageCategory, string> = {
  people_search: "People Search",
  background_check: "Background Check",
  phone_lookup: "Phone Lookup",
  b2b: "B2B Data",
  marketing: "Marketing Data",
  court_records: "Court Records",
  property: "Property Records",
  financial: "Financial Data",
  genealogy: "Genealogy",
  international: "International",
  ai_training: "AI Training",
  ai_image: "AI Image & Video",
  ai_voice: "AI Voice",
  ai_facial: "AI Facial Recognition",
  employment: "Employment Data",
  vehicle: "Vehicle Data",
  healthcare: "Healthcare",
  insurance: "Insurance Data",
  tenant_screening: "Tenant Screening",
  voter: "Voter & Political Data",
  location: "Location Tracking",
  legal: "Legal Records",
  general: "Data Broker",
};

// Build reverse lookup: broker key → page category
const REVERSE_CATEGORY = new Map<string, PageCategory>();

const CATEGORY_MAPPINGS: [PageCategory, readonly string[]][] = [
  ["people_search", BROKER_CATEGORIES.PEOPLE_SEARCH as readonly string[]],
  ["background_check", BROKER_CATEGORIES.BACKGROUND_CHECK as readonly string[]],
  ["background_check", BROKER_CATEGORIES.ADDITIONAL_BACKGROUND_CHECK as readonly string[]],
  ["court_records", BROKER_CATEGORIES.COURT_RECORDS as readonly string[]],
  ["phone_lookup", BROKER_CATEGORIES.PHONE_LOOKUP as readonly string[]],
  ["phone_lookup", BROKER_CATEGORIES.PHONE_DATA_PROVIDERS as readonly string[]],
  ["phone_lookup", BROKER_CATEGORIES.ADDITIONAL_PHONE_IDENTITY as readonly string[]],
  ["property", BROKER_CATEGORIES.PROPERTY_RECORDS as readonly string[]],
  ["property", BROKER_CATEGORIES.REAL_ESTATE_DATA as readonly string[]],
  ["property", BROKER_CATEGORIES.ADDITIONAL_REAL_ESTATE as readonly string[]],
  ["b2b", BROKER_CATEGORIES.PROFESSIONAL_B2B as readonly string[]],
  ["b2b", BROKER_CATEGORIES.B2B_DATA_PROVIDERS as readonly string[]],
  ["b2b", BROKER_CATEGORIES.BUSINESS_INTELLIGENCE as readonly string[]],
  ["marketing", BROKER_CATEGORIES.MARKETING as readonly string[]],
  ["marketing", BROKER_CATEGORIES.CONSUMER_MARKETING_DATA as readonly string[]],
  ["marketing", BROKER_CATEGORIES.RETAIL_SHOPPING_DATA as readonly string[]],
  ["marketing", BROKER_CATEGORIES.ADVERTISING_DATA as readonly string[]],
  ["marketing", BROKER_CATEGORIES.ADDITIONAL_RETAIL_DATA as readonly string[]],
  ["marketing", BROKER_CATEGORIES.ADDITIONAL_CONSUMER_DATA as readonly string[]],
  ["marketing", BROKER_CATEGORIES.SPECIALTY_DATA as readonly string[]],
  ["marketing", BROKER_CATEGORIES.IDENTITY_GRAPHS as readonly string[]],
  ["marketing", BROKER_CATEGORIES.DATA_ENRICHMENT as readonly string[]],
  ["marketing", BROKER_CATEGORIES.IDENTITY_RESOLUTION as readonly string[]],
  ["financial", BROKER_CATEGORIES.FINANCIAL as readonly string[]],
  ["financial", BROKER_CATEGORIES.ALTERNATIVE_CREDIT as readonly string[]],
  ["genealogy", BROKER_CATEGORIES.GENEALOGY as readonly string[]],
  ["international", BROKER_CATEGORIES.INTERNATIONAL as readonly string[]],
  ["international", BROKER_CATEGORIES.INTERNATIONAL_APAC as readonly string[]],
  ["international", BROKER_CATEGORIES.INTERNATIONAL_LATAM as readonly string[]],
  ["international", BROKER_CATEGORIES.INTERNATIONAL_MENA_AFRICA as readonly string[]],
  ["international", BROKER_CATEGORIES.INTERNATIONAL_EUROPE as readonly string[]],
  ["ai_training", BROKER_CATEGORIES.AI_TRAINING as readonly string[]],
  ["ai_image", BROKER_CATEGORIES.AI_IMAGE_VIDEO as readonly string[]],
  ["ai_voice", BROKER_CATEGORIES.AI_VOICE as readonly string[]],
  ["ai_facial", BROKER_CATEGORIES.AI_FACIAL_RECOGNITION as readonly string[]],
  ["tenant_screening", BROKER_CATEGORIES.TENANT_SCREENING as readonly string[]],
  ["employment", BROKER_CATEGORIES.EMPLOYMENT_HR as readonly string[]],
  ["employment", BROKER_CATEGORIES.EMPLOYMENT_DATA as readonly string[]],
  ["vehicle", BROKER_CATEGORIES.VEHICLE_DRIVING as readonly string[]],
  ["vehicle", BROKER_CATEGORIES.AUTOMOTIVE_DATA as readonly string[]],
  ["insurance", BROKER_CATEGORIES.INSURANCE_DATA as readonly string[]],
  ["insurance", BROKER_CATEGORIES.INSURANCE_RISK as readonly string[]],
  ["healthcare", BROKER_CATEGORIES.HEALTHCARE as readonly string[]],
  ["healthcare", BROKER_CATEGORIES.HEALTHCARE_PROVIDERS as readonly string[]],
  ["location", BROKER_CATEGORIES.LOCATION_TRACKING as readonly string[]],
  ["location", BROKER_CATEGORIES.LOCATION_DATA_PROVIDERS as readonly string[]],
  ["legal", BROKER_CATEGORIES.LEGAL_RECORDS as readonly string[]],
  ["voter", BROKER_CATEGORIES.VOTER_POLITICAL_DATA as readonly string[]],
  ["voter", BROKER_CATEGORIES.SOCIAL_AGGREGATORS as readonly string[]],
  ["b2b", BROKER_CATEGORIES.PROFESSIONAL_DIRECTORIES as readonly string[]],
  ["people_search", BROKER_CATEGORIES.EMAIL_IDENTITY as readonly string[]],
  ["employment", BROKER_CATEGORIES.SKIP_TRACING_COLLECTIONS as readonly string[]],
  ["people_search", BROKER_CATEGORIES.EDUCATIONAL as readonly string[]],
];

for (const [cat, keys] of CATEGORY_MAPPINGS) {
  for (const key of keys) {
    if (!REVERSE_CATEGORY.has(key)) {
      REVERSE_CATEGORY.set(key, cat);
    }
  }
}

function getBrokerCategory(key: string): PageCategory {
  return REVERSE_CATEGORY.get(key) ?? "general";
}

// ============================================================
// SLUG GENERATION
// ============================================================
function keyToSlug(key: string): string {
  return key.toLowerCase().replace(/_/g, "-");
}

// ============================================================
// ELIGIBILITY CHECK
// ============================================================
function isBrokerEligibleForPage(key: string, info: DataBrokerInfo): boolean {
  if (info.removalMethod === "NOT_REMOVABLE") return false;
  if (info.isRemovable === false) return false;
  if (info.category === "DARK_WEB" || info.category === "BREACH_DATABASE" || info.category === "SOCIAL_MEDIA" || info.category === "SERVICE_PROVIDER") return false;
  if (MONITORING_EXCLUSIONS.has(key)) return false;
  if (EXPANSION_EXCLUSIONS.has(key)) return false;
  if (PLATFORM_EXCLUSIONS.has(key)) return false;
  return true;
}

// ============================================================
// DIFFICULTY HEURISTIC
// ============================================================
function getDifficulty(method: RemovalMethod): "Easy" | "Medium" | "Hard" {
  switch (method) {
    case "BOTH": return "Easy";
    case "FORM": return "Medium";
    case "EMAIL": return "Hard";
    case "MONITOR": return "Medium";
    default: return "Medium";
  }
}

// ============================================================
// OPT-OUT TIME (ISO 8601)
// ============================================================
function getOptOutTime(estimatedDays: number): string {
  if (estimatedDays <= 0) return "PT720H"; // ~30 days for unknown
  return `PT${estimatedDays * 24}H`;
}

function getTimeEstimate(estimatedDays: number): string {
  if (estimatedDays <= 0) return "Up to 30 days";
  if (estimatedDays <= 1) return "24 hours";
  if (estimatedDays <= 2) return "1-2 days";
  if (estimatedDays <= 3) return "2-3 days";
  if (estimatedDays <= 5) return "3-5 days";
  if (estimatedDays <= 7) return "5-7 days";
  if (estimatedDays <= 14) return "7-14 days";
  if (estimatedDays <= 30) return "14-30 days";
  return `${estimatedDays} days`;
}

// ============================================================
// CONTENT TEMPLATES BY CATEGORY
// ============================================================
interface CategoryContent {
  dataCollected: string[];
  risks: string[];
}

const CATEGORY_CONTENT: Record<PageCategory, CategoryContent> = {
  people_search: {
    dataCollected: [
      "Full name and aliases", "Current and past addresses", "Phone numbers (mobile and landline)",
      "Email addresses", "Relatives and associates", "Age and date of birth",
      "Photos and social media profiles", "Employment history", "Education background",
      "Property ownership records", "Court and legal records", "Neighborhood details",
    ],
    risks: [
      "Identity theft — criminals use your exposed personal details to open fraudulent accounts",
      "Doxxing — your home address and contact info can be published to harass you",
      "Stalking — abusers use people search sites to locate victims",
      "Spam calls and phishing — your phone and email are sold to telemarketers and scammers",
      "Employment discrimination — employers may find outdated or misleading information",
      "Reputation damage — old associations and records can be taken out of context",
    ],
  },
  background_check: {
    dataCollected: [
      "Full name and aliases", "Criminal history and arrest records", "Court filings and judgments",
      "Address history", "Employment verification", "Education verification",
      "Sex offender registry status", "Driving records", "Professional licenses",
      "Bankruptcy filings", "Liens and civil judgments", "Social media presence",
    ],
    risks: [
      "Employment discrimination — outdated criminal records can prevent you from getting hired",
      "Housing denial — landlords may reject applications based on incomplete background data",
      "Reputation damage — dismissed charges or mistaken identity records appear alongside your name",
      "Insurance rate increases — background data can influence insurance pricing decisions",
      "Relationship damage — personal legal history exposed to anyone who searches for you",
      "False associations — records of people with similar names can be incorrectly linked to you",
    ],
  },
  phone_lookup: {
    dataCollected: [
      "Phone numbers (mobile, landline, VoIP)", "Name associated with number", "Current and past addresses",
      "Carrier and phone type", "Location data", "Caller ID information",
      "Spam likelihood scores", "Connected email addresses", "Social media profiles linked to number",
      "Call frequency patterns",
    ],
    risks: [
      "Spam calls — your number is sold to telemarketing companies and robocall operations",
      "Harassment — anyone can look up who owns a phone number and find your identity",
      "Doxxing — your phone number links to your real name and address",
      "Phishing and vishing — scammers use your details to craft convincing phone scams",
      "Unwanted contacts — ex-partners, debt collectors, or strangers can find your number easily",
    ],
  },
  b2b: {
    dataCollected: [
      "Work email address", "Job title and department", "Company name and size",
      "Direct phone number and extension", "LinkedIn profile URL", "Professional history",
      "Company revenue and employee count", "Technology stack used", "Industry classification",
      "Business address", "Decision-making authority", "Funding information",
    ],
    risks: [
      "Spam outreach — your work email and phone are sold to sales teams worldwide",
      "Corporate phishing — detailed professional info enables targeted spear-phishing attacks",
      "Competitor intelligence — your role and company data is sold to competitors",
      "Data sold to recruiters — constant unsolicited recruiting messages",
      "Professional reputation — outdated job titles or company info can be misleading",
    ],
  },
  marketing: {
    dataCollected: [
      "Purchasing habits and transaction history", "Demographics (age, income, household size)",
      "Interests and lifestyle preferences", "Online browsing behavior", "Location and movement patterns",
      "Device identifiers and ad tracking IDs", "Credit score ranges", "Political affiliation estimates",
      "Health interest indicators", "Retail loyalty program data",
    ],
    risks: [
      "Targeted manipulation — ads and offers are tailored using intimate knowledge of your behavior",
      "Price discrimination — your data can be used to charge you higher prices",
      "Data resale — your profile is sold across hundreds of advertising networks",
      "Financial profiling — credit and income estimates affect the offers you receive",
      "Privacy erosion — your daily habits and preferences become a commodity",
    ],
  },
  court_records: {
    dataCollected: [
      "Arrest records and mugshots", "Court filings (civil and criminal)", "Case outcomes and sentencing",
      "Traffic violations", "Bankruptcy filings", "Liens and judgments",
      "Restraining orders", "Divorce proceedings", "Small claims records",
      "Probation and parole status",
    ],
    risks: [
      "Employment discrimination — arrest records (even without conviction) can cost you job opportunities",
      "Reputation damage — old or dismissed charges remain publicly visible",
      "Housing denial — landlords use court records to screen tenants",
      "False associations — records of people with similar names may be incorrectly attributed to you",
      "Relationship damage — personal legal matters become publicly searchable",
      "Loan and credit impact — financial judgments visible to lenders",
    ],
  },
  property: {
    dataCollected: [
      "Property ownership records", "Home address and parcel data", "Purchase price and sale history",
      "Property tax assessments", "Mortgage and lien information", "Home value estimates",
      "Square footage and lot size", "Number of bedrooms and bathrooms", "Previous owners",
      "Neighborhood demographics",
    ],
    risks: [
      "Stalking risk — your home address is publicly linked to your name",
      "Burglary targeting — property value reveals your wealth level",
      "Financial exposure — mortgage amounts and purchase prices are visible",
      "Unwanted solicitation — real estate agents, investors, and scammers target homeowners",
      "Identity theft — property records combined with other data enable account takeover",
    ],
  },
  financial: {
    dataCollected: [
      "Credit history and scores", "Bank account information", "Payment patterns and history",
      "Credit inquiries", "Outstanding debts and collections", "Bankruptcy filings",
      "Income estimates", "Asset valuations", "Insurance claims history",
      "Check-writing history",
    ],
    risks: [
      "Identity theft — financial data enables fraudulent account openings and loan applications",
      "Credit fraud — stolen credit information leads to unauthorized charges",
      "Insurance rate manipulation — claims history affects premium pricing",
      "Employment impact — some employers check credit reports during hiring",
      "Financial profiling — your spending patterns determine the offers and rates you receive",
    ],
  },
  genealogy: {
    dataCollected: [
      "Family trees and lineage", "Birth and death records", "Marriage and divorce records",
      "Immigration and naturalization records", "Census data", "Military service records",
      "DNA and genetic data", "Historical photographs", "Cemetery and burial records",
      "Newspaper obituaries and announcements",
    ],
    risks: [
      "Genetic discrimination — DNA data could affect insurance or employment decisions",
      "Family privacy breach — sensitive family history becomes publicly searchable",
      "Identity theft — birth dates and family details are used in identity verification",
      "Unwanted family connections — biological relatives can find you without consent",
      "Historical embarrassment — old records may contain sensitive information",
    ],
  },
  international: {
    dataCollected: [
      "Full name and aliases", "Phone numbers and addresses", "Business listings",
      "Professional affiliations", "Public records from local sources", "Directory listings",
      "Email addresses", "Social media profiles", "Company information",
    ],
    risks: [
      "Cross-border data exposure — your information is accessible from multiple countries",
      "Spam and scam targeting — international scammers use your contact details",
      "Identity fraud — personal data combined across jurisdictions enables fraud",
      "Privacy law gaps — data may be stored in countries with weaker privacy protections",
      "Persistent exposure — international removal is harder and data reappears faster",
    ],
  },
  ai_training: {
    dataCollected: [
      "Text content and writings", "Social media posts and comments", "Personal photographs",
      "Voice recordings", "Published articles and blog posts", "Forum posts and discussions",
      "Code and technical contributions", "Creative works", "Personal communications (if leaked)",
    ],
    risks: [
      "AI impersonation — models can generate text in your writing style",
      "Deepfakes — your likeness may be used to create fake content",
      "Unauthorized model training — your creative work trains AI without compensation",
      "Loss of attribution — AI-generated content derived from yours has no attribution",
      "Data permanence — once trained into a model, your data cannot be fully removed",
    ],
  },
  ai_image: {
    dataCollected: [
      "Photographs and selfies", "Social media images", "Video footage",
      "Facial features and expressions", "Body measurements and poses", "Art style characteristics",
      "Voice recordings (for video)", "Personal branding imagery", "Professional headshots",
    ],
    risks: [
      "Deepfake creation — your face can be placed in fabricated videos",
      "Non-consensual imagery — your likeness used without permission",
      "Identity manipulation — fake images of you can be created and spread",
      "Reputation damage — AI-generated images with your face in compromising situations",
      "Artistic theft — your visual style can be replicated by AI models",
    ],
  },
  ai_voice: {
    dataCollected: [
      "Voice recordings and samples", "Speech patterns and cadence", "Vocal characteristics",
      "Podcast and video audio", "Phone call recordings", "Voice assistant interactions",
      "Accent and dialect features", "Emotional tone patterns",
    ],
    risks: [
      "Voice cloning — your voice can be replicated for fraud or impersonation",
      "Phone scams — cloned voices used in vishing attacks targeting your contacts",
      "Unauthorized audio content — fake audio of you saying things you never said",
      "Identity verification bypass — voice clones can defeat voice-based security",
      "Reputation damage — fabricated audio recordings attributed to you",
    ],
  },
  ai_facial: {
    dataCollected: [
      "Facial photographs from multiple angles", "Facial geometry and biometric measurements",
      "Social media profile photos", "Publicly available images", "Surveillance camera captures",
      "Group photos you appear in", "Government ID photos (if leaked)", "Event photographs",
    ],
    risks: [
      "Mass surveillance — your face can be identified in crowds without consent",
      "Unauthorized identification — strangers can photograph you and identify you instantly",
      "Law enforcement misidentification — facial recognition errors lead to wrongful suspicion",
      "Stalking enablement — anyone with your photo can find all your online presence",
      "Privacy violation — your movements tracked through facial recognition at stores and public spaces",
    ],
  },
  employment: {
    dataCollected: [
      "Employment history and dates", "Salary and compensation data", "Job titles and departments",
      "Employer names and locations", "Performance indicators", "Professional references",
      "Education verification", "Professional licenses", "Workers compensation claims",
      "Unemployment claims history",
    ],
    risks: [
      "Salary transparency — past compensation data affects negotiation leverage",
      "Employment verification issues — outdated or incorrect records cause hiring delays",
      "Skip tracing — debt collectors use employment data to locate you",
      "Competitive intelligence — your career moves are tracked by competitors",
      "Discrimination risk — employment gaps or patterns used in biased screening",
    ],
  },
  vehicle: {
    dataCollected: [
      "Vehicle ownership history", "VIN and registration details", "Accident and damage reports",
      "Service and maintenance records", "Odometer readings", "Title status and liens",
      "Recall information", "Emissions test results", "Insurance claims on vehicle",
    ],
    risks: [
      "Location tracking — vehicle registration links to your home address",
      "Purchase manipulation — dealers use your vehicle history against you in negotiations",
      "Insurance impact — accident history affects premium rates",
      "Fraud risk — VIN cloning and title washing schemes target vehicle data",
      "Privacy exposure — your travel patterns and vehicle usage become trackable",
    ],
  },
  healthcare: {
    dataCollected: [
      "Provider directory listings", "Medical specialty and credentials", "Practice locations and hours",
      "Patient reviews and ratings", "Insurance network participation", "Board certifications",
      "Disciplinary actions", "Prescription patterns (aggregate)", "Hospital affiliations",
    ],
    risks: [
      "Unwanted solicitation — pharmaceutical and medical device companies target healthcare providers",
      "Reputation manipulation — fake or biased reviews affect provider reputation",
      "Practice location exposure — home office addresses become publicly visible",
      "Credential misrepresentation — outdated or incorrect credential listings",
      "Patient privacy concerns — provider listings may reveal patient demographics",
    ],
  },
  insurance: {
    dataCollected: [
      "Claims history (auto, home, health)", "Policy information", "Premium payment history",
      "Risk scores and actuarial data", "Property inspection reports", "Driving records",
      "Medical information briefs", "Fraud investigation flags", "Coverage denial history",
    ],
    risks: [
      "Higher premiums — claims history from one insurer affects rates with all others",
      "Coverage denial — past claims used to justify refusing new policies",
      "Employment impact — some employers access insurance-related background data",
      "Medical privacy — health-related claims reveal sensitive conditions",
      "Financial profiling — insurance data enriches consumer profiles sold to data brokers",
    ],
  },
  tenant_screening: {
    dataCollected: [
      "Rental history and addresses", "Eviction records", "Credit reports and scores",
      "Criminal background check results", "Income verification", "Employment history",
      "Landlord references", "Rental payment history", "Court records related to tenancy",
    ],
    risks: [
      "Housing denial — old eviction records or credit issues prevent you from renting",
      "Discrimination — screening data used as proxy for protected characteristics",
      "Inaccurate records — errors in tenant screening reports are difficult to correct",
      "Rental price manipulation — your screening profile affects the rent you're offered",
      "Privacy invasion — detailed financial life exposed to every landlord you apply with",
    ],
  },
  voter: {
    dataCollected: [
      "Voter registration records", "Party affiliation", "Voting history (whether you voted, not how)",
      "Address and contact information", "Precinct and district data", "Donation history",
      "Political interest indicators", "Demographic data", "Estimated political leanings",
    ],
    risks: [
      "Political targeting — campaigns use your data for micro-targeted messaging",
      "Doxxing — voter registration reveals your home address publicly",
      "Political profiling — your estimated political views sold to advertisers",
      "Harassment — political donors and voters targeted by opposing groups",
      "Data weaponization — voter data used in influence operations",
    ],
  },
  location: {
    dataCollected: [
      "GPS coordinates and movement history", "Store and business visits", "Dwell time at locations",
      "Home and work address inference", "Travel patterns", "Device identifiers",
      "Wi-Fi and Bluetooth beacon data", "App usage location signals", "Geofence triggers",
    ],
    risks: [
      "Physical safety — your real-time location and daily patterns are trackable",
      "Stalking enablement — location data reveals where you live, work, and frequent",
      "Behavioral profiling — your movements used to infer health conditions, relationships, religion",
      "Government surveillance — location data purchased by agencies without warrants",
      "Advertising manipulation — location-based targeting follows you across the physical world",
    ],
  },
  legal: {
    dataCollected: [
      "Court case filings and dockets", "Legal judgments and orders", "Attorney involvement records",
      "Bankruptcy proceedings", "Patent and trademark filings", "SEC filings",
      "Regulatory actions", "Administrative law decisions", "Appeals records",
    ],
    risks: [
      "Reputation impact — legal involvement (even as a plaintiff) is publicly searchable",
      "Business damage — lawsuit history can affect partnerships and investment",
      "Employment screening — legal records checked during background verification",
      "Privacy erosion — personal legal disputes exposed to the public",
      "Context-free exposure — complex legal matters reduced to misleading summaries",
    ],
  },
  general: {
    dataCollected: [
      "Full name and aliases", "Contact information (phone, email, address)",
      "Online activity and browsing data", "Social media profiles", "Public records",
      "Purchasing behavior", "Demographic information", "Professional details",
      "Family and associate connections", "Location data",
    ],
    risks: [
      "Identity theft — personal details used to open fraudulent accounts",
      "Spam and unwanted contact — your information sold to marketers and scammers",
      "Privacy erosion — your digital footprint becomes a commodity",
      "Phishing attacks — detailed personal info enables targeted scams",
      "Reputation risk — outdated or incorrect information published online",
    ],
  },
};

// ============================================================
// STEPS BY REMOVAL METHOD
// ============================================================
function getSteps(name: string, info: DataBrokerInfo): HowToStep[] {
  const { removalMethod, optOutUrl, optOutEmail, privacyEmail } = info;
  const email = optOutEmail || privacyEmail;

  switch (removalMethod) {
    case "FORM":
      return [
        { name: "Visit the opt-out page", text: `Go to ${name}'s official opt-out or removal page to begin the process.`, url: optOutUrl },
        { name: "Search for your listing", text: `Enter your full name and any other identifying information to find your profile on ${name}.` },
        { name: "Select your record", text: `Identify and select the listing that matches your personal information. There may be multiple entries.` },
        { name: "Submit your removal request", text: `Follow the on-screen instructions to submit your opt-out request. You may need to provide a reason.` },
        { name: "Verify your identity", text: `${name} may send a verification email or require additional identity confirmation. Complete this step promptly.` },
        { name: "Wait for processing", text: `Allow time for ${name} to process your removal request. Check back periodically to confirm your data has been removed.` },
      ];
    case "EMAIL":
      return [
        { name: "Draft your removal request", text: `Write a formal data removal request email to ${email || name + "'s privacy team"}. Reference CCPA (California) or GDPR (EU) rights as applicable.` },
        { name: "Include identification details", text: `In your email, include your full name, any known profile URLs, and enough information for ${name} to locate your records.` },
        { name: "Send to the privacy team", text: `Send your removal request to ${email || "their privacy email address"}. Use a clear subject line like "Data Removal Request — [Your Name]."` },
        { name: "Follow up if needed", text: `If you don't receive a confirmation within 7 business days, send a follow-up email referencing your original request.` },
        { name: "Verify removal", text: `After receiving confirmation, check ${name} to verify your data has been removed. Keep the confirmation email for your records.` },
      ];
    case "BOTH":
      return [
        { name: "Visit the opt-out page", text: `Start by visiting ${name}'s official opt-out page. This is usually the fastest removal method.`, url: optOutUrl },
        { name: "Search for your information", text: `Use the search function to find your personal profile on ${name}. Try variations of your name if needed.` },
        { name: "Submit the online form", text: `If you find your listing, use the online opt-out form to request removal. Fill in all required fields carefully.` },
        { name: "Email as backup", text: `If the form doesn't work or you can't find your listing, email ${email || "their privacy team"} with a formal CCPA/GDPR removal request.` },
        { name: "Verify your identity", text: `Complete any verification steps ${name} requires, such as confirming via email or providing additional identity documents.` },
        { name: "Confirm removal", text: `After the processing period, search for yourself on ${name} again to confirm your information has been removed.` },
      ];
    case "MONITOR":
      return [
        { name: "Search for your data", text: `Visit ${name} and search for your personal information to understand your current exposure level.`, url: optOutUrl },
        { name: "Check your exposure", text: `Review what personal data ${name} has collected about you and assess the risk level.` },
        { name: "Submit a removal request", text: `Use ${name}'s privacy controls or contact their support team to request data deletion.` },
        { name: "Set up monitoring alerts", text: `Enable any available monitoring features to be notified if your data reappears on ${name}.` },
        { name: "Regular follow-up", text: `Periodically check ${name} to ensure your data hasn't been re-collected from other sources.` },
      ];
    default:
      return [
        { name: "Visit the website", text: `Go to ${name}'s website and look for their privacy policy or opt-out instructions.`, url: optOutUrl },
        { name: "Locate opt-out options", text: `Find the data removal or opt-out section. Check the footer, privacy policy, or help center.` },
        { name: "Submit your request", text: `Follow the provided instructions to submit your data removal request to ${name}.` },
        { name: "Verify and follow up", text: `Complete any verification steps and follow up if you don't receive confirmation within the expected timeframe.` },
      ];
  }
}

// ============================================================
// FAQ TEMPLATES
// ============================================================
function getFaqs(name: string, category: PageCategory, difficulty: string, timeEstimate: string): { question: string; answer: string }[] {
  const baseFaqs = [
    {
      question: `How do I remove my information from ${name}?`,
      answer: `Follow our step-by-step guide above to remove your personal data from ${name}. The process is rated ${difficulty.toLowerCase()} difficulty and typically takes ${timeEstimate}. Alternatively, GhostMyData can automatically handle the removal for you along with 2,100+ other data brokers.`,
    },
    {
      question: `Is ${name} a data broker?`,
      answer: `Yes, ${name} collects and makes available personal information about individuals, often without their direct knowledge or consent. Under privacy laws like California's CCPA and Vermont's data broker registration act, companies like ${name} that collect and sell or share personal data are classified as data brokers.`,
    },
    {
      question: `How long does it take to remove data from ${name}?`,
      answer: `Removal from ${name} typically takes ${timeEstimate}. Processing times can vary depending on verification requirements and the volume of requests they're handling. We recommend checking back after the estimated period to confirm your data has been removed.`,
    },
    {
      question: `Will my data reappear on ${name} after removal?`,
      answer: `Yes, it's common for data to reappear on ${name} and similar sites. Data brokers continuously collect new information from public records, online activity, and other brokers. This is why ongoing monitoring is essential — GhostMyData provides continuous monitoring and automatic re-removal.`,
    },
    {
      question: `What data does ${name} have about me?`,
      answer: `${name} may have your name, contact information, address history, and other personal details depending on their data sources. See the "What Information Does ${name} Collect?" section above for a complete list of data types they typically aggregate.`,
    },
    {
      question: `Is it free to remove my data from ${name}?`,
      answer: `Yes, you have the legal right to request removal of your data from ${name} at no cost. Data brokers are required to honor opt-out requests under CCPA and other privacy laws. However, the process can be time-consuming and needs to be repeated regularly as data reappears.`,
    },
    {
      question: `Can I remove my data from all data brokers at once?`,
      answer: `There's no single opt-out form that covers all data brokers. Each one requires a separate removal request. GhostMyData automates this entire process — one scan triggers removal requests to ${name} and 2,100+ other data brokers simultaneously, with continuous monitoring for reappearances.`,
    },
    {
      question: `What happens if ${name} doesn't remove my data?`,
      answer: `If ${name} doesn't honor your removal request within the legally required timeframe, you can file a complaint with your state attorney general or the FTC. Under CCPA, businesses must respond to deletion requests within 45 days. GhostMyData tracks all requests and follows up automatically on your behalf.`,
    },
  ];

  return baseFaqs;
}

// ============================================================
// DESCRIPTION TEMPLATES
// ============================================================
function getDescription(name: string, category: PageCategory): string {
  const templates: Record<PageCategory, string> = {
    people_search: `${name} is a people search site that aggregates personal information from public records and online sources. Your name, address, phone number, email, relatives, and more may be publicly listed on ${name} for anyone to find.`,
    background_check: `${name} is a background check service that compiles criminal records, court filings, and other personal data. Your history may be accessible to employers, landlords, and the public through ${name}.`,
    phone_lookup: `${name} is a phone lookup service that connects phone numbers to personal identities. Your phone number, name, address, and other details may be publicly searchable on ${name}.`,
    b2b: `${name} is a B2B data platform that collects professional contact information including work emails, job titles, and company details. Your professional data may be sold to sales teams and recruiters through ${name}.`,
    marketing: `${name} is a data broker that collects consumer behavior data including purchasing habits, demographics, and online activity. Your personal profile may be sold to advertisers and marketers through ${name}.`,
    court_records: `${name} aggregates court records and legal filings, making arrest records, court cases, and legal history publicly searchable. Your legal records may be visible on ${name} to anyone who searches.`,
    property: `${name} aggregates property records including ownership data, home values, and transaction history. Your home address, purchase price, and property details may be publicly visible on ${name}.`,
    financial: `${name} collects financial data including credit history, account information, and payment patterns. Your financial profile may be shared with lenders, insurers, and other businesses through ${name}.`,
    genealogy: `${name} is a genealogy platform that compiles family trees, historical records, and potentially DNA data. Your family history and personal details may be accessible on ${name}.`,
    international: `${name} is an international directory service that lists personal and business contact information. Your name, phone number, and address may be publicly searchable across borders through ${name}.`,
    ai_training: `${name} is an AI service that may use personal data — including text, images, and other content — for model training. Your digital content may be incorporated into ${name}'s AI systems.`,
    ai_image: `${name} is an AI image/video service that processes photos, facial data, and visual content. Your images and likeness may be used or stored by ${name} for AI-powered features.`,
    ai_voice: `${name} is an AI voice technology platform that processes voice recordings and speech data. Your voice characteristics may be captured and used by ${name}'s systems.`,
    ai_facial: `${name} is a facial recognition service that collects and analyzes facial biometric data. Your photos and facial geometry may be indexed and searchable through ${name}.`,
    employment: `${name} collects employment and workforce data including salary information, job history, and employer details. Your professional history may be shared with employers and other parties through ${name}.`,
    vehicle: `${name} collects vehicle ownership and history data including registration details, accident reports, and service records. Your vehicle information may be accessible through ${name}.`,
    healthcare: `${name} aggregates healthcare provider data including directory listings, credentials, and patient reviews. Your professional or personal health-related information may be visible on ${name}.`,
    insurance: `${name} collects insurance-related data including claims history, risk scores, and policy information. Your insurance records may be shared with other insurers and businesses through ${name}.`,
    tenant_screening: `${name} provides tenant screening data including rental history, eviction records, and credit information. Your housing history may be shared with landlords through ${name}.`,
    voter: `${name} aggregates voter and political data including registration records, party affiliation, and donation history. Your political information may be publicly accessible through ${name}.`,
    location: `${name} collects location data including GPS coordinates, store visits, and movement patterns. Your physical movements and daily routines may be tracked and sold through ${name}.`,
    legal: `${name} aggregates legal records including court filings, dockets, and case outcomes. Your involvement in legal proceedings may be publicly searchable through ${name}.`,
    general: `${name} is a data broker that collects and shares personal information from various sources. Your name, contact details, and other personal data may be accessible through ${name}.`,
  };
  return templates[category];
}

// ============================================================
// RELATED BROKERS — deterministic selection from same category
// ============================================================
function getRelatedBrokers(currentKey: string, category: PageCategory, allBrokers: [string, DataBrokerInfo][]): { name: string; slug: string }[] {
  const sameCat = allBrokers.filter(([key]) => key !== currentKey && getBrokerCategory(key) === category);
  // Deterministic selection based on index
  const startIdx = currentKey.length % Math.max(1, sameCat.length);
  const related: { name: string; slug: string }[] = [];
  for (let i = 0; i < Math.min(4, sameCat.length); i++) {
    const idx = (startIdx + i) % sameCat.length;
    const [key, info] = sameCat[idx];
    related.push({ name: info.name, slug: keyToSlug(key) });
  }
  return related;
}

// ============================================================
// CORE DATA GENERATION (cached)
// ============================================================
interface BrokerPageEntry {
  key: string;
  slug: string;
  info: DataBrokerInfo;
  category: PageCategory;
}

let _cachedEntries: BrokerPageEntry[] | null = null;

function getEligibleEntries(): BrokerPageEntry[] {
  if (_cachedEntries) return _cachedEntries;

  const entries: BrokerPageEntry[] = [];
  for (const [key, info] of Object.entries(DATA_BROKER_DIRECTORY)) {
    if (!isBrokerEligibleForPage(key, info)) continue;
    const slug = keyToSlug(key);
    entries.push({ key, slug, info, category: getBrokerCategory(key) });
  }

  _cachedEntries = entries;
  return entries;
}

// ============================================================
// PUBLIC API
// ============================================================

/** All slugs for generateStaticParams (excludes existing manual pages) */
export function getRemovableBrokerSlugs(): string[] {
  return getEligibleEntries()
    .map(e => e.slug)
    .filter(slug => !EXISTING_MANUAL_PAGES.has(slug));
}

/** Full page data for a slug */
export function getBrokerPageData(slug: string): BrokerInfo | null {
  const entry = getEligibleEntries().find(e => e.slug === slug);
  if (!entry) return null;

  const { key, info, category } = entry;
  const difficulty = getDifficulty(info.removalMethod);
  const timeEstimate = getTimeEstimate(info.estimatedDays);
  const content = CATEGORY_CONTENT[category];
  const allEligible = getEligibleEntries().map(e => [e.key, e.info] as [string, DataBrokerInfo]);

  return {
    name: info.name,
    slug,
    description: getDescription(info.name, category),
    dataCollected: content.dataCollected,
    risks: content.risks,
    optOutUrl: info.optOutUrl || info.privacyEmail ? `mailto:${info.privacyEmail || info.optOutEmail}` : "#",
    optOutTime: getOptOutTime(info.estimatedDays),
    difficulty,
    steps: getSteps(info.name, info),
    faqs: getFaqs(info.name, category, difficulty, timeEstimate),
    lastUpdated: "February 17, 2026",
    relatedBrokers: getRelatedBrokers(key, category, allEligible),
  };
}

/** All broker pages for hub page listing */
export function getAllBrokerPages(): { slug: string; name: string; category: string; difficulty: string; time: string; description: string }[] {
  return getEligibleEntries().map(entry => ({
    slug: entry.slug,
    name: entry.info.name,
    category: CATEGORY_DISPLAY_NAMES[entry.category],
    difficulty: getDifficulty(entry.info.removalMethod),
    time: getTimeEstimate(entry.info.estimatedDays),
    description: getDescription(entry.info.name, entry.category).split(". ")[0] + ".",
  }));
}

/** Total count of all broker pages (manual + dynamic) */
export function getTotalBrokerPageCount(): number {
  return getEligibleEntries().length;
}
