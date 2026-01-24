import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption/crypto";
import { sendRemovalUpdateEmail } from "@/lib/email";
import { LeakCheckScanner } from "@/lib/scanners/breaches/leakcheck";
import { HaveIBeenPwnedScanner } from "@/lib/scanners/breaches/haveibeenpwned";
import type { ScanInput, ScanResult, Scanner } from "@/lib/scanners/base-scanner";
import { generateScreenshotUrl } from "@/lib/screenshots/screenshot-service";

// Days to wait before verification based on source
const VERIFICATION_DELAYS: Record<string, number> = {
  // Data brokers - use their estimated days + buffer
  SPOKEO: 7,
  WHITEPAGES: 10,
  BEENVERIFIED: 14,
  INTELIUS: 14,
  PEOPLEFINDER: 10,
  TRUEPEOPLESEARCH: 3,
  RADARIS: 21,
  FASTPEOPLESEARCH: 3,
  USSEARCH: 14,
  PIPL: 45,
  // Breach databases - longer wait, data may persist
  BREACH_DB: 45,
  HAVEIBEENPWNED: 45,
  DEHASHED: 30,
  // Social media
  LINKEDIN: 35,
  FACEBOOK: 35,
  TWITTER: 35,
  INSTAGRAM: 35,
  // Default
  DEFAULT: 30,
};

// Maximum verification attempts before giving up
const MAX_VERIFICATION_ATTEMPTS = 3;

// Get scanner for a specific source
function getScannerForSource(source: string): Scanner | null {
  switch (source) {
    case "BREACH_DB":
      return new LeakCheckScanner();
    case "HAVEIBEENPWNED":
      return new HaveIBeenPwnedScanner();
    // Data broker scanners would go here
    // For now, we can't verify data brokers without re-scraping
    default:
      return null;
  }
}

// Calculate when verification should run
export function calculateVerifyAfterDate(source: string, submittedAt: Date = new Date()): Date {
  const days = VERIFICATION_DELAYS[source] || VERIFICATION_DELAYS.DEFAULT;
  const verifyAfter = new Date(submittedAt);
  verifyAfter.setDate(verifyAfter.getDate() + days);
  return verifyAfter;
}

// Prepare scan input from user profile
async function prepareScanInputForUser(userId: string): Promise<ScanInput | null> {
  const profile = await prisma.personalProfile.findFirst({
    where: { userId },
  });

  if (!profile) {
    return null;
  }

  // Helper to safely decrypt and parse JSON
  const safeDecryptAndParse = <T>(encrypted: string | null): T | undefined => {
    if (!encrypted) return undefined;
    try {
      const decrypted = decrypt(encrypted);
      return JSON.parse(decrypted) as T;
    } catch {
      try {
        return JSON.parse(encrypted) as T;
      } catch {
        return undefined;
      }
    }
  };

  return {
    fullName: profile.fullName || undefined,
    aliases: safeDecryptAndParse<string[]>(profile.aliases),
    emails: safeDecryptAndParse<string[]>(profile.emails),
    phones: safeDecryptAndParse<string[]>(profile.phones),
    addresses: safeDecryptAndParse<Array<{
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    }>>(profile.addresses),
    dateOfBirth: profile.dateOfBirth ? decrypt(profile.dateOfBirth) : undefined,
    ssnHash: profile.ssnHash || undefined,
    usernames: safeDecryptAndParse<string[]>(profile.usernames),
  };
}

// Check if exposure still exists in scan results
function exposureStillExists(
  exposure: { source: string; sourceName: string; dataType: string; dataPreview: string | null },
  scanResults: ScanResult[]
): boolean {
  // For breach databases, check if the same breach source is still found
  if (exposure.source === "BREACH_DB") {
    // LeakCheck results have sourceName like "LeakCheck - Canva.com"
    const breachName = exposure.sourceName.replace("LeakCheck - ", "");
    return scanResults.some(result =>
      result.sourceName.includes(breachName) ||
      (result.rawData?.breachName === breachName)
    );
  }

  // For other sources, check by source and data type
  return scanResults.some(result =>
    result.source === exposure.source &&
    result.dataType === exposure.dataType
  );
}

// Verify a single removal request
export async function verifyRemovalRequest(removalRequestId: string): Promise<{
  success: boolean;
  status: "COMPLETED" | "FAILED" | "PENDING";
  message: string;
}> {
  // Get the removal request with exposure and user info
  const removalRequest = await prisma.removalRequest.findUnique({
    where: { id: removalRequestId },
    include: {
      exposure: {
        select: {
          id: true,
          source: true,
          sourceName: true,
          sourceUrl: true,
          dataType: true,
          dataPreview: true,
          proofScreenshot: true,
          proofScreenshotAt: true,
        },
      },
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  if (!removalRequest) {
    return { success: false, status: "FAILED", message: "Removal request not found" };
  }

  // Get scanner for this source
  const scanner = getScannerForSource(removalRequest.exposure.source);

  if (!scanner) {
    // Can't verify this source - mark for manual verification
    console.log(`[Verification] No scanner for source: ${removalRequest.exposure.source}`);

    // After max attempts, assume completed (optimistic)
    if (removalRequest.verificationCount >= MAX_VERIFICATION_ATTEMPTS) {
      await prisma.$transaction([
        prisma.removalRequest.update({
          where: { id: removalRequestId },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            notes: "Auto-completed after verification period (source cannot be automatically verified)",
          },
        }),
        prisma.exposure.update({
          where: { id: removalRequest.exposureId },
          data: { status: "REMOVED" },
        }),
      ]);

      return {
        success: true,
        status: "COMPLETED",
        message: "Marked as completed (verification not available for this source)",
      };
    }

    // Schedule next verification attempt
    const nextVerify = new Date();
    nextVerify.setDate(nextVerify.getDate() + 14); // Check again in 2 weeks

    await prisma.removalRequest.update({
      where: { id: removalRequestId },
      data: {
        verifyAfter: nextVerify,
        lastVerifiedAt: new Date(),
        verificationCount: { increment: 1 },
      },
    });

    return {
      success: true,
      status: "PENDING",
      message: "Cannot verify automatically, scheduled for retry",
    };
  }

  // Check if scanner is available
  const isAvailable = await scanner.isAvailable();
  if (!isAvailable) {
    console.log(`[Verification] Scanner not available: ${scanner.name}`);
    return { success: false, status: "PENDING", message: "Scanner not available" };
  }

  // Get user's scan input
  const scanInput = await prepareScanInputForUser(removalRequest.user.id);
  if (!scanInput) {
    return { success: false, status: "PENDING", message: "User profile not found" };
  }

  try {
    console.log(`[Verification] Running ${scanner.name} for removal ${removalRequestId}`);

    // Run the scan
    const results = await scanner.scan(scanInput);

    // Check if the exposure still exists
    const stillExists = exposureStillExists(removalRequest.exposure, results);

    if (!stillExists) {
      // Exposure no longer found - mark as completed!
      console.log(`[Verification] Exposure no longer found - marking as COMPLETED`);

      // Generate before/after screenshots for proof
      const beforeScreenshot = removalRequest.exposure.proofScreenshot || null;
      const beforeScreenshotAt = removalRequest.exposure.proofScreenshotAt || null;

      // Generate after screenshot showing data is no longer found
      let afterScreenshot: string | null = null;
      if (removalRequest.exposure.sourceUrl && !removalRequest.exposure.sourceUrl.startsWith('mailto:')) {
        try {
          afterScreenshot = generateScreenshotUrl(removalRequest.exposure.sourceUrl, { delay: 2 });
        } catch (e) {
          console.error(`[Verification] Failed to generate after screenshot:`, e);
        }
      }

      await prisma.$transaction([
        prisma.removalRequest.update({
          where: { id: removalRequestId },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            lastVerifiedAt: new Date(),
            verificationCount: { increment: 1 },
            notes: "Verified removed - data no longer found in scan",
            // Screenshot proof
            beforeScreenshot,
            beforeScreenshotAt,
            afterScreenshot,
            afterScreenshotAt: afterScreenshot ? new Date() : null,
          },
        }),
        prisma.exposure.update({
          where: { id: removalRequest.exposureId },
          data: { status: "REMOVED" },
        }),
        prisma.alert.create({
          data: {
            userId: removalRequest.user.id,
            type: "REMOVAL_COMPLETED",
            title: "Data Removal Verified",
            message: `Your data has been verified as removed from ${removalRequest.exposure.sourceName}.`,
          },
        }),
      ]);

      // Send email notification
      if (removalRequest.user.email) {
        await sendRemovalUpdateEmail(
          removalRequest.user.email,
          removalRequest.user.name || "",
          {
            sourceName: removalRequest.exposure.sourceName,
            status: "COMPLETED",
            dataType: removalRequest.exposure.dataType,
          }
        ).catch(console.error);
      }

      return {
        success: true,
        status: "COMPLETED",
        message: "Exposure verified as removed",
      };
    } else {
      // Exposure still exists
      console.log(`[Verification] Exposure still found - attempt ${removalRequest.verificationCount + 1}`);

      if (removalRequest.verificationCount >= MAX_VERIFICATION_ATTEMPTS - 1) {
        // Max attempts reached - mark as failed
        await prisma.$transaction([
          prisma.removalRequest.update({
            where: { id: removalRequestId },
            data: {
              status: "FAILED",
              lastVerifiedAt: new Date(),
              verificationCount: { increment: 1 },
              lastError: "Data still found after multiple verification attempts",
            },
          }),
          prisma.exposure.update({
            where: { id: removalRequest.exposureId },
            data: { status: "ACTIVE" },
          }),
        ]);

        // Send failure notification
        if (removalRequest.user.email) {
          await sendRemovalUpdateEmail(
            removalRequest.user.email,
            removalRequest.user.name || "",
            {
              sourceName: removalRequest.exposure.sourceName,
              status: "FAILED",
              dataType: removalRequest.exposure.dataType,
            }
          ).catch(console.error);
        }

        return {
          success: false,
          status: "FAILED",
          message: "Data still found after maximum verification attempts",
        };
      }

      // Schedule another verification
      const nextVerify = new Date();
      nextVerify.setDate(nextVerify.getDate() + 14); // Try again in 2 weeks

      await prisma.removalRequest.update({
        where: { id: removalRequestId },
        data: {
          verifyAfter: nextVerify,
          lastVerifiedAt: new Date(),
          verificationCount: { increment: 1 },
        },
      });

      return {
        success: true,
        status: "PENDING",
        message: "Data still found, scheduled for re-verification",
      };
    }
  } catch (error) {
    console.error(`[Verification] Error verifying removal ${removalRequestId}:`, error);

    // Schedule retry on error
    const nextVerify = new Date();
    nextVerify.setDate(nextVerify.getDate() + 7);

    await prisma.removalRequest.update({
      where: { id: removalRequestId },
      data: {
        verifyAfter: nextVerify,
        lastVerifiedAt: new Date(),
        lastError: error instanceof Error ? error.message : "Verification failed",
      },
    });

    return {
      success: false,
      status: "PENDING",
      message: `Verification error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// Get all removal requests due for verification
export async function getRemovalsDueForVerification(limit: number = 50): Promise<string[]> {
  const now = new Date();

  const removals = await prisma.removalRequest.findMany({
    where: {
      status: { in: ["SUBMITTED", "IN_PROGRESS"] },
      verifyAfter: { lte: now },
      verificationCount: { lt: MAX_VERIFICATION_ATTEMPTS },
    },
    select: { id: true },
    take: limit,
    orderBy: { verifyAfter: "asc" },
  });

  return removals.map(r => r.id);
}

// Run verification for all due removal requests
export async function runVerificationBatch(): Promise<{
  processed: number;
  completed: number;
  failed: number;
  pending: number;
}> {
  const stats = { processed: 0, completed: 0, failed: 0, pending: 0 };

  const removalIds = await getRemovalsDueForVerification();
  console.log(`[Verification] Found ${removalIds.length} removals due for verification`);

  for (const id of removalIds) {
    const result = await verifyRemovalRequest(id);
    stats.processed++;

    switch (result.status) {
      case "COMPLETED":
        stats.completed++;
        break;
      case "FAILED":
        stats.failed++;
        break;
      case "PENDING":
        stats.pending++;
        break;
    }

    // Small delay between verifications to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return stats;
}
