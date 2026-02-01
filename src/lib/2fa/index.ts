import * as OTPAuth from "otpauth";
import { randomBytes, createHash } from "crypto";
import QRCode from "qrcode";
import { encrypt, decrypt } from "@/lib/encryption/crypto";

const ISSUER = "DataScrub";
const BACKUP_CODE_COUNT = 10;
const BACKUP_CODE_LENGTH = 8;

/**
 * Generate a new TOTP secret
 */
export function generateTOTPSecret(): string {
  // Generate a random 20-byte secret (base32 encoded will be 32 characters)
  const secret = new OTPAuth.Secret({ size: 20 });
  return secret.base32;
}

/**
 * Create a TOTP instance for verification
 */
function createTOTP(secret: string, email: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
}

/**
 * Generate the TOTP URI for QR code generation
 */
export function getTOTPUri(secret: string, email: string): string {
  const totp = createTOTP(secret, email);
  return totp.toString();
}

/**
 * Generate a QR code data URL for the TOTP secret
 */
export async function generateQRCode(secret: string, email: string): Promise<string> {
  const uri = getTOTPUri(secret, email);
  return QRCode.toDataURL(uri, {
    width: 256,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}

/**
 * Verify a TOTP code
 * @param secret The base32-encoded secret
 * @param code The 6-digit code from the authenticator app
 * @param window Number of periods to check (default 1 = current + 1 before/after)
 */
export function verifyTOTPCode(secret: string, code: string, email: string, window = 1): boolean {
  try {
    const totp = createTOTP(secret, email);
    const delta = totp.validate({ token: code, window });
    return delta !== null;
  } catch {
    return false;
  }
}

/**
 * Generate backup codes
 * Returns both the plain codes (to show user once) and hashed codes (to store)
 */
export function generateBackupCodes(): { plainCodes: string[]; hashedCodes: string[] } {
  const plainCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
    // Generate random backup code
    const code = randomBytes(BACKUP_CODE_LENGTH / 2)
      .toString("hex")
      .toUpperCase();

    plainCodes.push(code);
    hashedCodes.push(hashBackupCode(code));
  }

  return { plainCodes, hashedCodes };
}

/**
 * Hash a backup code for storage
 */
export function hashBackupCode(code: string): string {
  const salt = process.env.ENCRYPTION_KEY || "backup-code-salt";
  return createHash("sha256")
    .update(code.toUpperCase() + salt)
    .digest("hex");
}

/**
 * Verify a backup code against stored hashed codes
 * Returns the index of the matched code, or -1 if not found
 */
export function verifyBackupCode(code: string, hashedCodes: string[]): number {
  const hashedInput = hashBackupCode(code);
  return hashedCodes.findIndex((hashed) => hashed === hashedInput);
}

/**
 * Encrypt the TOTP secret for storage
 */
export function encryptTOTPSecret(secret: string): string {
  return encrypt(secret);
}

/**
 * Decrypt the TOTP secret from storage
 */
export function decryptTOTPSecret(encryptedSecret: string): string {
  return decrypt(encryptedSecret);
}

/**
 * Format backup codes for display (add dashes for readability)
 */
export function formatBackupCode(code: string): string {
  // Format as XXXX-XXXX
  if (code.length === 8) {
    return `${code.slice(0, 4)}-${code.slice(4)}`;
  }
  return code;
}

/**
 * Parse backup codes from JSON string stored in database
 */
export function parseBackupCodes(jsonString: string | null): string[] {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch {
    return [];
  }
}

/**
 * Stringify backup codes for database storage
 */
export function stringifyBackupCodes(codes: string[]): string {
  return JSON.stringify(codes);
}
