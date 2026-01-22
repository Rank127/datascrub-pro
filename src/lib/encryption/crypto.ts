import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  // Hash the key to ensure it's exactly 32 bytes for AES-256
  return createHash("sha256").update(key).digest();
}

export function encrypt(text: string): string {
  if (!text) return "";

  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Combine IV + authTag + encrypted data
  return iv.toString("hex") + authTag.toString("hex") + encrypted;
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) return "";

  const key = getEncryptionKey();

  // Extract IV, authTag, and encrypted data
  const iv = Buffer.from(encryptedText.slice(0, IV_LENGTH * 2), "hex");
  const authTag = Buffer.from(
    encryptedText.slice(IV_LENGTH * 2, IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2),
    "hex"
  );
  const encrypted = encryptedText.slice(IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export function hashSSN(ssn: string): string {
  // One-way hash for SSN - can only be used for matching, not retrieval
  const salt = process.env.ENCRYPTION_KEY || "default-salt";
  return createHash("sha256")
    .update(ssn + salt)
    .digest("hex");
}

export function hashData(data: string): string {
  // Generic one-way hash for deduplication
  const salt = process.env.ENCRYPTION_KEY || "default-salt";
  return createHash("sha256")
    .update(data + salt)
    .digest("hex");
}

export function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!domain) return email;

  const maskedLocal = localPart.length <= 2
    ? "*".repeat(localPart.length)
    : localPart[0] + "*".repeat(localPart.length - 2) + localPart[localPart.length - 1];

  return `${maskedLocal}@${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "*".repeat(phone.length);

  return "*".repeat(digits.length - 4) + digits.slice(-4);
}

export function maskSSN(ssn: string): string {
  const digits = ssn.replace(/\D/g, "");
  if (digits.length < 4) return "*".repeat(ssn.length);

  return "***-**-" + digits.slice(-4);
}

export function maskName(name: string): string {
  const parts = name.split(" ");
  return parts
    .map((part) => {
      if (part.length <= 1) return "*";
      return part[0] + "*".repeat(part.length - 1);
    })
    .join(" ");
}

export function maskAddress(address: string): string {
  const parts = address.split(" ");
  if (parts.length <= 2) return "*".repeat(address.length);

  // Mask street number and part of street name
  return parts
    .map((part, index) => {
      if (index === 0) return "*".repeat(part.length);
      if (index === parts.length - 1) return part; // Keep state/zip
      if (index === parts.length - 2) return part; // Keep city
      return part[0] + "*".repeat(Math.max(0, part.length - 1));
    })
    .join(" ");
}

// Encrypt array of strings
export function encryptArray(items: string[]): string {
  return encrypt(JSON.stringify(items));
}

// Decrypt array of strings
export function decryptArray(encrypted: string): string[] {
  if (!encrypted) return [];
  try {
    return JSON.parse(decrypt(encrypted));
  } catch {
    return [];
  }
}

// Encrypt object (like address)
export function encryptObject<T>(obj: T): string {
  return encrypt(JSON.stringify(obj));
}

// Decrypt object
export function decryptObject<T>(encrypted: string): T | null {
  if (!encrypted) return null;
  try {
    return JSON.parse(decrypt(encrypted));
  } catch {
    return null;
  }
}
