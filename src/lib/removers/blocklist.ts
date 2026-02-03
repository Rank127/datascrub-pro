/**
 * Blocklist - Companies that should NOT receive automated deletion requests
 *
 * This file documents organizations that have been explicitly excluded from
 * our data broker directory because they are Data Processors (not Data Brokers)
 * or for other legal/compliance reasons.
 *
 * DATA PROCESSOR vs DATA BROKER:
 * - Data Broker: Independently collects, sells, or trades personal data
 * - Data Processor: Only processes data on behalf of a Data Controller (client)
 *
 * Per GDPR Articles 28 and 29, Data Processors may only process personal data
 * on documented instructions from their clients. Article 17 (Right to Erasure)
 * places the obligation to assess and fulfill erasure requests solely on the
 * Data Controller, not the Processor.
 *
 * Sending deletion requests to Data Processors:
 * 1. Cannot be actioned (they need Controller authorization)
 * 2. May actually increase data exposure (adding data to systems where it didn't exist)
 * 3. Bypasses the proper legal channel (the Data Controller)
 */

export interface BlocklistedCompany {
  name: string;
  domains: string[];
  reason: string;
  dateAdded: string;
  contactedBy?: string;
  notes?: string;
}

/**
 * Companies that must NOT receive automated deletion/opt-out requests
 */
export const BLOCKLISTED_COMPANIES: BlocklistedCompany[] = [
  {
    name: "Syndigo",
    domains: ["syndigo.com"],
    reason: "Data Processor, not Data Broker. Acts on behalf of retail clients per GDPR Articles 28/29.",
    dateAdded: "2026-02-03",
    contactedBy: "Sean Milford, Head of Global Data Privacy",
    notes: "Parent company of PowerReviews and 1WorldSync. Requested removal on 2026-02-03.",
  },
  {
    name: "PowerReviews",
    domains: ["powerreviews.com"],
    reason: "Data Processor (Syndigo subsidiary). Processes review data on behalf of retailer clients.",
    dateAdded: "2026-02-03",
    contactedBy: "Sean Milford, Head of Global Data Privacy (Syndigo)",
    notes: "Acquired by Syndigo. Only processes data for retail clients who are the Data Controllers.",
  },
  {
    name: "1WorldSync",
    domains: ["1worldsync.com"],
    reason: "Data Processor (Syndigo affiliate). Product content syndication platform.",
    dateAdded: "2026-02-03",
    contactedBy: "Sean Milford, Head of Global Data Privacy (Syndigo)",
    notes: "Syndigo affiliate. Processes product data on behalf of brand/retailer clients.",
  },
];

/**
 * Blocklisted email domains - never send automated emails to these
 */
export const BLOCKLISTED_EMAIL_DOMAINS: string[] = [
  "syndigo.com",
  "powerreviews.com",
  "1worldsync.com",
];

/**
 * Check if a domain is blocklisted
 */
export function isDomainBlocklisted(domain: string): boolean {
  const normalizedDomain = domain.toLowerCase().trim();
  return BLOCKLISTED_EMAIL_DOMAINS.some(
    (blocked) => normalizedDomain === blocked || normalizedDomain.endsWith(`.${blocked}`)
  );
}

/**
 * Check if an email address is blocklisted
 */
export function isEmailBlocklisted(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return false;
  return isDomainBlocklisted(domain);
}

/**
 * Get blocklist entry for a company by domain
 */
export function getBlocklistEntry(domain: string): BlocklistedCompany | undefined {
  const normalizedDomain = domain.toLowerCase().trim();
  return BLOCKLISTED_COMPANIES.find((company) =>
    company.domains.some(
      (d) => normalizedDomain === d || normalizedDomain.endsWith(`.${d}`)
    )
  );
}
