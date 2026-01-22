// PII Masking Utilities
// Provides functions to mask sensitive personal information

/**
 * Mask an email address
 * john.doe@example.com → j***e@e***.com
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return "***@***.***";

  const [localPart, domain] = email.split("@");
  if (!domain) return "***@***.***";

  const [domainName, tld] = domain.split(".");

  const maskedLocal = localPart.length > 2
    ? `${localPart[0]}***${localPart[localPart.length - 1]}`
    : `${localPart[0]}***`;

  const maskedDomain = domainName && domainName.length > 2
    ? `${domainName[0]}***`
    : domainName || "***";

  return `${maskedLocal}@${maskedDomain}.${tld || "***"}`;
}

/**
 * Mask a phone number
 * +1 (555) 123-4567 → +1 (***) ***-4567
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "***-***-****";

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "");

  if (cleaned.length < 4) return "***-****";

  // Show only last 4 digits
  const lastFour = cleaned.slice(-4);
  const prefix = cleaned.slice(0, -4).replace(/\d/g, "*");

  return `${prefix}${lastFour}`;
}

/**
 * Mask a name
 * John Doe → J*** D**
 */
export function maskName(name: string | null | undefined): string {
  if (!name) return "***";

  const parts = name.trim().split(/\s+/);
  return parts.map(part => {
    if (part.length <= 1) return "*";
    return `${part[0]}${"*".repeat(Math.min(part.length - 1, 3))}`;
  }).join(" ");
}

/**
 * Mask an address
 * 123 Main St, City, ST 12345 → 1** M*** St, C***, ** *2345
 */
export function maskAddress(address: string | null | undefined): string {
  if (!address) return "*** **** **";

  // Mask most characters but keep structure
  return address.replace(/[a-zA-Z]/g, (char, index) => {
    // Keep first character of each word
    const prevChar = address[index - 1];
    if (!prevChar || prevChar === " " || prevChar === ",") {
      return char;
    }
    return "*";
  }).replace(/\d(?=\d{4})/g, "*"); // Keep last 4 digits of zip
}

/**
 * Mask a date of birth
 * 1990-05-15 → ****-**-15
 */
export function maskDateOfBirth(dob: string | null | undefined): string {
  if (!dob) return "****-**-**";

  // Keep only the day
  const date = new Date(dob);
  if (isNaN(date.getTime())) return "****-**-**";

  const day = date.getDate().toString().padStart(2, "0");
  return `****-**-${day}`;
}

/**
 * Mask SSN (should never be stored, but just in case)
 * 123-45-6789 → ***-**-6789
 */
export function maskSSN(ssn: string | null | undefined): string {
  if (!ssn) return "***-**-****";

  const cleaned = ssn.replace(/\D/g, "");
  if (cleaned.length < 4) return "***-**-****";

  const lastFour = cleaned.slice(-4);
  return `***-**-${lastFour}`;
}

/**
 * Mask a username
 * johndoe123 → jo***23
 */
export function maskUsername(username: string | null | undefined): string {
  if (!username) return "***";

  if (username.length <= 4) {
    return `${username[0]}${"*".repeat(username.length - 1)}`;
  }

  return `${username.slice(0, 2)}***${username.slice(-2)}`;
}

/**
 * Mask a URL (keep domain, mask path params)
 */
export function maskUrl(url: string | null | undefined): string {
  if (!url) return "https://***.***";

  try {
    const parsed = new URL(url);
    // Keep the hostname, mask the path
    return `${parsed.protocol}//${parsed.hostname}/***`;
  } catch {
    return "https://***.***";
  }
}

/**
 * Mask a generic ID or token
 */
export function maskId(id: string | null | undefined): string {
  if (!id) return "***";

  if (id.length <= 8) {
    return `${id.slice(0, 2)}***`;
  }

  return `${id.slice(0, 4)}***${id.slice(-4)}`;
}

/**
 * Mask an entire user profile object
 */
export interface UserProfile {
  id?: string;
  email?: string | null;
  name?: string | null;
  fullName?: string | null;
  emails?: string | null; // JSON array
  phones?: string | null; // JSON array
  addresses?: string | null; // JSON array
  dateOfBirth?: string | null;
  usernames?: string | null; // JSON array
  [key: string]: unknown;
}

export interface MaskedUserProfile extends Omit<UserProfile, "emails" | "phones" | "addresses" | "usernames"> {
  email?: string;
  name?: string;
  fullName?: string;
  emails?: string[];
  phones?: string[];
  addresses?: string[];
  dateOfBirth?: string;
  usernames?: string[];
}

export function maskUserProfile(profile: UserProfile): MaskedUserProfile {
  // Explicitly construct masked object to avoid type issues with null values
  const masked: MaskedUserProfile = {
    id: profile.id,
  };

  if (profile.email) {
    masked.email = maskEmail(profile.email);
  }

  if (profile.name) {
    masked.name = maskName(profile.name);
  }

  if (profile.fullName) {
    masked.fullName = maskName(profile.fullName);
  }

  // Handle JSON array fields
  if (profile.emails) {
    try {
      const emails = JSON.parse(profile.emails);
      masked.emails = Array.isArray(emails) ? emails.map(maskEmail) : [];
    } catch {
      masked.emails = [];
    }
  }

  if (profile.phones) {
    try {
      const phones = JSON.parse(profile.phones);
      masked.phones = Array.isArray(phones) ? phones.map(maskPhone) : [];
    } catch {
      masked.phones = [];
    }
  }

  if (profile.addresses) {
    try {
      const addresses = JSON.parse(profile.addresses);
      masked.addresses = Array.isArray(addresses) ? addresses.map((addr: string | object) => {
        if (typeof addr === "string") return maskAddress(addr);
        if (typeof addr === "object" && addr !== null) {
          return Object.fromEntries(
            Object.entries(addr).map(([k, v]) => [k, typeof v === "string" ? maskAddress(v) : v])
          );
        }
        return "***";
      }) : [];
    } catch {
      masked.addresses = [];
    }
  }

  if (profile.dateOfBirth) {
    masked.dateOfBirth = maskDateOfBirth(profile.dateOfBirth);
  }

  if (profile.usernames) {
    try {
      const usernames = JSON.parse(profile.usernames);
      masked.usernames = Array.isArray(usernames) ? usernames.map(maskUsername) : [];
    } catch {
      masked.usernames = [];
    }
  }

  return masked;
}

/**
 * Mask a user object for display in admin lists
 */
export interface UserListItem {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  plan: string;
  createdAt: Date | string;
}

export function maskUserListItem(user: UserListItem): UserListItem {
  return {
    ...user,
    email: maskEmail(user.email),
    name: maskName(user.name),
  };
}

/**
 * Determine if a field should be masked based on role
 */
export function shouldMaskField(
  fieldName: string,
  viewerRole: string,
  isOwnData: boolean
): boolean {
  // Users can always see their own unmasked data
  if (isOwnData) return false;

  // LEGAL and SUPER_ADMIN can see unmasked PII
  if (viewerRole === "LEGAL" || viewerRole === "SUPER_ADMIN") {
    return false;
  }

  // All PII fields should be masked for other roles
  const piiFields = [
    "email", "name", "fullName", "emails", "phones",
    "addresses", "dateOfBirth", "ssn", "ssnHash", "usernames"
  ];

  return piiFields.includes(fieldName);
}
