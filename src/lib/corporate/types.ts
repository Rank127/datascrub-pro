// Corporate Plan Types & Pricing Constants

export interface CorporateTier {
  id: "CORP_10" | "CORP_25" | "CORP_50" | "CORP_100";
  name: string;
  maxSeats: number;
  annualPrice: number; // cents
  perSeatMonthly: number; // cents
  perSeatAnnual: number; // cents
  savingsVsEnterprise: number; // percentage
  features: string[];
}

export const FAMILY_ADDON_PRICE = 12000; // $120/year in cents
export const PER_SEAT_FLOOR = 12000; // $120/year ($10/mo) in cents
export const ENTERPRISE_PER_SEAT_MONTHLY = 2250; // $22.50/mo

export const CORPORATE_TIERS: CorporateTier[] = [
  {
    id: "CORP_10",
    name: "Small",
    maxSeats: 10,
    annualPrice: 199900, // $1,999/year
    perSeatMonthly: 1666, // $16.66/mo
    perSeatAnnual: 19990, // $199.90/year
    savingsVsEnterprise: 26,
    features: [
      "Full Enterprise features per seat",
      "Admin dashboard",
      "QR-code onboarding",
      "Quarterly compliance reports",
      "Per-seat tracking & analytics",
    ],
  },
  {
    id: "CORP_25",
    name: "Medium",
    maxSeats: 25,
    annualPrice: 399900, // $3,999/year
    perSeatMonthly: 1333, // $13.33/mo
    perSeatAnnual: 15996, // $159.96/year
    savingsVsEnterprise: 41,
    features: [
      "Full Enterprise features per seat",
      "Admin dashboard",
      "QR-code onboarding",
      "Quarterly compliance reports",
      "Per-seat tracking & analytics",
      "Bulk CSV onboarding",
      "Role-based access control",
    ],
  },
  {
    id: "CORP_50",
    name: "Large",
    maxSeats: 50,
    annualPrice: 699900, // $6,999/year
    perSeatMonthly: 1167, // $11.67/mo
    perSeatAnnual: 13996, // $139.96/year
    savingsVsEnterprise: 48,
    features: [
      "Full Enterprise features per seat",
      "Admin dashboard",
      "QR-code onboarding",
      "Quarterly compliance reports",
      "Per-seat tracking & analytics",
      "Bulk CSV onboarding",
      "Role-based access control",
      "SSO/SAML included",
      "Dedicated account manager",
      "Net 30 invoice billing",
      "Compliance audit trails",
    ],
  },
  {
    id: "CORP_100",
    name: "XL",
    maxSeats: 100,
    annualPrice: 1199900, // $11,999/year
    perSeatMonthly: 1000, // $10.00/mo
    perSeatAnnual: 12000, // $120/year
    savingsVsEnterprise: 56,
    features: [
      "Full Enterprise features per seat",
      "Admin dashboard",
      "QR-code onboarding",
      "Quarterly compliance reports",
      "Per-seat tracking & analytics",
      "Bulk CSV onboarding",
      "Role-based access control",
      "SSO/SAML included",
      "Dedicated account manager",
      "Net 30 invoice billing",
      "Compliance audit trails",
      "Custom API access",
    ],
  },
];

export interface CorporateFeature {
  name: string;
  corp10: boolean | "addon";
  corp25: boolean | "addon";
  corp50: boolean | "addon";
  corp100: boolean | "addon";
}

export const CORPORATE_FEATURES: CorporateFeature[] = [
  { name: "Full Enterprise features per seat", corp10: true, corp25: true, corp50: true, corp100: true },
  { name: "Admin dashboard", corp10: true, corp25: true, corp50: true, corp100: true },
  { name: "QR-code onboarding", corp10: true, corp25: true, corp50: true, corp100: true },
  { name: "Quarterly compliance reports", corp10: true, corp25: true, corp50: true, corp100: true },
  { name: "Per-seat tracking & analytics", corp10: true, corp25: true, corp50: true, corp100: true },
  { name: "Dark web monitoring", corp10: true, corp25: true, corp50: true, corp100: true },
  { name: "Bulk CSV onboarding", corp10: false, corp25: true, corp50: true, corp100: true },
  { name: "Role-based access control", corp10: false, corp25: true, corp50: true, corp100: true },
  { name: "SSO/SAML", corp10: false, corp25: "addon", corp50: true, corp100: true },
  { name: "Dedicated account manager", corp10: false, corp25: false, corp50: true, corp100: true },
  { name: "Net 30 invoice billing", corp10: false, corp25: false, corp50: true, corp100: true },
  { name: "Compliance audit trails", corp10: false, corp25: false, corp50: true, corp100: true },
  { name: "Custom API access", corp10: false, corp25: false, corp50: false, corp100: true },
];

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
