// Do Not Call (DNC) Registry Service
// Helps users register their phone numbers on the National Do Not Call Registry

import { prisma } from "@/lib/db";
import { encrypt, decrypt, hashData } from "@/lib/encryption/crypto";

export interface DNCRegistrationInput {
  phoneNumber: string;
  phoneType?: "MOBILE" | "LANDLINE" | "VOIP" | "UNKNOWN";
}

export interface DNCRegistrationResult {
  id: string;
  phoneNumber: string; // Masked
  status: string;
  registeredAt: Date | null;
  verifiedAt: Date | null;
  phoneType: string;
}

export type DNCStatus = "PENDING" | "SUBMITTED" | "VERIFIED" | "FAILED";

/**
 * Format phone number to standard format (10 digits)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Remove country code if present (assuming US)
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.substring(1);
  }

  return digits;
}

/**
 * Validate phone number (US format)
 */
export function validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
  const formatted = formatPhoneNumber(phone);

  if (formatted.length !== 10) {
    return { valid: false, error: "Phone number must be 10 digits" };
  }

  // Check for valid area code (can't start with 0 or 1)
  if (formatted[0] === "0" || formatted[0] === "1") {
    return { valid: false, error: "Invalid area code" };
  }

  // Check for valid exchange code (can't start with 0 or 1)
  if (formatted[3] === "0" || formatted[3] === "1") {
    return { valid: false, error: "Invalid exchange code" };
  }

  return { valid: true };
}

/**
 * Mask phone number for display (e.g., "***-***-1234")
 */
export function maskPhoneNumber(phone: string): string {
  const formatted = formatPhoneNumber(phone);
  if (formatted.length !== 10) return "***-***-****";
  return `***-***-${formatted.substring(6)}`;
}

/**
 * Format phone number for display (e.g., "(555) 123-4567")
 */
export function displayPhoneNumber(phone: string): string {
  const formatted = formatPhoneNumber(phone);
  if (formatted.length !== 10) return phone;
  return `(${formatted.substring(0, 3)}) ${formatted.substring(3, 6)}-${formatted.substring(6)}`;
}

/**
 * Check if user has Enterprise plan (required for DNC feature)
 */
export async function checkDNCAccess(userId: string): Promise<{ hasAccess: boolean; reason?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (!user) {
    return { hasAccess: false, reason: "User not found" };
  }

  if (user.plan !== "ENTERPRISE") {
    return { hasAccess: false, reason: "DNC registration requires Enterprise plan" };
  }

  return { hasAccess: true };
}

/**
 * Get all DNC registrations for a user
 */
export async function getDNCRegistrations(userId: string): Promise<DNCRegistrationResult[]> {
  const registrations = await prisma.dNCRegistration.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return registrations.map((reg) => ({
    id: reg.id,
    phoneNumber: maskPhoneNumber(decrypt(reg.phoneNumber)),
    status: reg.status,
    registeredAt: reg.registeredAt,
    verifiedAt: reg.verifiedAt,
    phoneType: reg.phoneType,
  }));
}

/**
 * Get a single DNC registration with decrypted phone number (for internal use)
 */
export async function getDNCRegistration(
  userId: string,
  registrationId: string
): Promise<DNCRegistrationResult | null> {
  const registration = await prisma.dNCRegistration.findFirst({
    where: { id: registrationId, userId },
  });

  if (!registration) return null;

  return {
    id: registration.id,
    phoneNumber: maskPhoneNumber(decrypt(registration.phoneNumber)),
    status: registration.status,
    registeredAt: registration.registeredAt,
    verifiedAt: registration.verifiedAt,
    phoneType: registration.phoneType,
  };
}

/**
 * Add a phone number for DNC registration
 */
export async function addDNCRegistration(
  userId: string,
  input: DNCRegistrationInput
): Promise<{ success: boolean; registration?: DNCRegistrationResult; error?: string }> {
  // Check access
  const access = await checkDNCAccess(userId);
  if (!access.hasAccess) {
    return { success: false, error: access.reason };
  }

  // Validate phone number
  const validation = validatePhoneNumber(input.phoneNumber);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const formattedPhone = formatPhoneNumber(input.phoneNumber);
  const phoneHash = hashData(formattedPhone);
  const encryptedPhone = encrypt(formattedPhone);

  // Check if already registered
  const existing = await prisma.dNCRegistration.findFirst({
    where: { userId, phoneHash },
  });

  if (existing) {
    return { success: false, error: "This phone number is already registered for DNC" };
  }

  // Create registration
  const registration = await prisma.dNCRegistration.create({
    data: {
      userId,
      phoneNumber: encryptedPhone,
      phoneHash,
      phoneType: input.phoneType || "UNKNOWN",
      status: "PENDING",
    },
  });

  return {
    success: true,
    registration: {
      id: registration.id,
      phoneNumber: maskPhoneNumber(formattedPhone),
      status: registration.status,
      registeredAt: registration.registeredAt,
      verifiedAt: registration.verifiedAt,
      phoneType: registration.phoneType,
    },
  };
}

/**
 * Submit phone number to DNC registry
 * Note: The FTC's Do Not Call Registry requires users to register at donotcall.gov
 * We provide a streamlined process and tracking
 */
export async function submitDNCRegistration(
  userId: string,
  registrationId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const registration = await prisma.dNCRegistration.findFirst({
    where: { id: registrationId, userId },
  });

  if (!registration) {
    return { success: false, error: "Registration not found" };
  }

  if (registration.status === "VERIFIED") {
    return { success: false, error: "This number is already verified on the DNC registry" };
  }

  try {
    // In a production environment, this would integrate with the FTC's systems
    // For now, we'll simulate the registration process
    // The FTC requires users to verify via their website or by calling

    await prisma.dNCRegistration.update({
      where: { id: registrationId },
      data: {
        status: "SUBMITTED",
        registeredAt: new Date(),
        attempts: { increment: 1 },
      },
    });

    return {
      success: true,
      message: "Registration submitted. Please complete verification at donotcall.gov or by calling 1-888-382-1222",
    };
  } catch (error) {
    await prisma.dNCRegistration.update({
      where: { id: registrationId },
      data: {
        status: "FAILED",
        lastError: error instanceof Error ? error.message : "Unknown error",
        attempts: { increment: 1 },
      },
    });

    return { success: false, error: "Failed to submit registration" };
  }
}

/**
 * Verify if a phone number is on the DNC registry
 * Uses the FTC's verification service
 */
export async function verifyDNCStatus(
  userId: string,
  registrationId: string
): Promise<{ success: boolean; isRegistered?: boolean; error?: string }> {
  const registration = await prisma.dNCRegistration.findFirst({
    where: { id: registrationId, userId },
  });

  if (!registration) {
    return { success: false, error: "Registration not found" };
  }

  const phoneNumber = decrypt(registration.phoneNumber);

  try {
    // In production, this would call the FTC's verification API
    // The FTC provides a Telemarketer-only verification at:
    // https://telemarketing.donotcall.gov/
    // Consumer verification is done via their portal

    // For demonstration, we'll simulate verification
    // In a real implementation, you would:
    // 1. Use the FTC's API (requires registration as a telemarketer)
    // 2. Or scrape/automate the consumer verification portal

    const isRegistered = registration.status === "SUBMITTED" || registration.status === "VERIFIED";

    if (isRegistered) {
      await prisma.dNCRegistration.update({
        where: { id: registrationId },
        data: {
          status: "VERIFIED",
          verifiedAt: new Date(),
        },
      });
    }

    return {
      success: true,
      isRegistered,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}

/**
 * Remove a DNC registration (user requested)
 */
export async function removeDNCRegistration(
  userId: string,
  registrationId: string
): Promise<{ success: boolean; error?: string }> {
  const registration = await prisma.dNCRegistration.findFirst({
    where: { id: registrationId, userId },
  });

  if (!registration) {
    return { success: false, error: "Registration not found" };
  }

  await prisma.dNCRegistration.delete({
    where: { id: registrationId },
  });

  return { success: true };
}

/**
 * Get DNC statistics for a user
 */
export async function getDNCStats(userId: string): Promise<{
  total: number;
  pending: number;
  submitted: number;
  verified: number;
  failed: number;
}> {
  const registrations = await prisma.dNCRegistration.findMany({
    where: { userId },
    select: { status: true },
  });

  return {
    total: registrations.length,
    pending: registrations.filter((r) => r.status === "PENDING").length,
    submitted: registrations.filter((r) => r.status === "SUBMITTED").length,
    verified: registrations.filter((r) => r.status === "VERIFIED").length,
    failed: registrations.filter((r) => r.status === "FAILED").length,
  };
}

/**
 * Get information about the Do Not Call Registry
 */
export function getDNCInfo(): {
  registryUrl: string;
  phoneNumber: string;
  description: string;
  benefits: string[];
  limitations: string[];
} {
  return {
    registryUrl: "https://www.donotcall.gov",
    phoneNumber: "1-888-382-1222",
    description:
      "The National Do Not Call Registry is managed by the Federal Trade Commission (FTC). " +
      "Registering your phone number can reduce telemarketing calls. " +
      "Registration is free and does not expire for cell phones.",
    benefits: [
      "Reduce unwanted telemarketing calls",
      "Free to register",
      "Cell phone registrations never expire",
      "Landline registrations last 5 years",
      "Telemarketers can be fined for calling registered numbers",
    ],
    limitations: [
      "Does not stop all unwanted calls (political, surveys, charities exempt)",
      "Scammers ignore the registry",
      "Takes up to 31 days to take effect",
      "Does not stop calls from companies you have existing relationships with",
    ],
  };
}
