import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption/crypto";
import { sendRemovalStatusDigestEmail } from "@/lib/email";
// SMS for removal updates disabled - only exposure and breach alerts
import { LeakCheckScanner } from "@/lib/scanners/breaches/leakcheck";
import { HaveIBeenPwnedScanner } from "@/lib/scanners/breaches/haveibeenpwned";
import { getScannerBySource as getDataBrokerScanner } from "@/lib/scanners/data-brokers";
import type { ScanInput, ScanResult, Scanner } from "@/lib/scanners/base-scanner";
import { generateScreenshotUrl } from "@/lib/screenshots/screenshot-service";

// Days to wait before verification based on source
// These are based on actual broker processing times + buffer
const VERIFICATION_DELAYS: Record<string, number> = {
  // Fast data brokers (automated systems, 1-3 days processing)
  TRUEPEOPLESEARCH: 3,
  FASTPEOPLESEARCH: 3,
  // Medium data brokers (5-10 days processing)
  SPOKEO: 7,
  PEOPLEFINDER: 10,
  WHITEPAGES: 10,
  // Slow data brokers (14+ days processing)
  BEENVERIFIED: 14,
  INTELIUS: 14,
  USSEARCH: 14,
  RADARIS: 21,
  PIPL: 45,
  // Breach databases - these are monitoring only, but we verify if user changed password
  BREACH_DB: 45,
  HAVEIBEENPWNED: 45,
  DEHASHED: 30,
  // Social media - account deletion takes time
  LINKEDIN: 35,
  FACEBOOK: 35,
  TWITTER: 35,
  INSTAGRAM: 35,
  // Default for unknown sources
  DEFAULT: 30,
};

// Maximum verification attempts before marking as failed
const MAX_VERIFICATION_ATTEMPTS = 3;

// Adaptive retry delays based on attempt number (exponential backoff)
const RETRY_DELAYS = [7, 14, 21]; // Days for attempt 1, 2, 3

// Sources that support automated re-verification
const VERIFIABLE_SOURCES = new Set([
  // Breach databases
  "BREACH_DB",
  "HAVEIBEENPWNED",
  "LEAKCHECK",
  // Data brokers with scrapers
  "SPOKEO",
  "WHITEPAGES",
  "BEENVERIFIED",
  "TRUEPEOPLESEARCH",
  "RADARIS",
  "INTELIUS",
  // Manual check scanners (can verify via search URL)
  "FASTPEOPLESEARCH",
  "PEOPLEFINDER",
]);

// Get scanner for a specific source - now includes data broker scanners!
function getScannerForSource(source: string): Scanner | null {
  // Breach scanners
  switch (source) {
    case "BREACH_DB":
    case "LEAKCHECK":
      return new LeakCheckScanner();
    case "HAVEIBEENPWNED":
      return new HaveIBeenPwnedScanner();
  }

  // Try data broker scanner
  const brokerScanner = getDataBrokerScanner(source);
  if (brokerScanner) {
    return brokerScanner;
  }

  return null;
}

// Calculate optimal retry delay based on source and attempt number
function getRetryDelay(source: string, attemptNumber: number): number {
  // Use exponential backoff, capped at the source's typical processing time
  const baseDelay = RETRY_DELAYS[Math.min(attemptNumber, RETRY_DELAYS.length - 1)];
  const sourceDelay = VERIFICATION_DELAYS[source] || VERIFICATION_DELAYS.DEFAULT;

  // Don't retry more frequently than the source typically processes
  return Math.max(baseDelay, Math.min(sourceDelay, 21));
}

// Check if a source can be automatically verified
export function canVerifySource(source: string): boolean {
  return VERIFIABLE_SOURCES.has(source);
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
      // Decryption failed - check if it's already valid JSON (plaintext)
      try {
        return JSON.parse(encrypted) as T;
      } catch {
        // Neither decryptable nor valid JSON - likely encrypted with wrong key
        console.warn(`[Verification] Cannot decrypt/parse field, encryption key mismatch`);
        return undefined;
      }
    }
  };

  // Helper to safely decrypt a single string value
  const safeDecrypt = (encrypted: string | null): string | undefined => {
    if (!encrypted) return undefined;
    try {
      return decrypt(encrypted);
    } catch {
      // If decryption fails, check if it looks like plaintext (not a hex string)
      // Encrypted data is always hex format (64+ chars of 0-9a-f)
      const isLikelyEncrypted = /^[0-9a-f]{64,}$/i.test(encrypted);
      if (isLikelyEncrypted) {
        // This is encrypted data we can't decrypt - return undefined
        console.warn(`[Verification] Cannot decrypt field, encryption key mismatch`);
        return undefined;
      }
      // Looks like plaintext, return as-is
      return encrypted;
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
    dateOfBirth: safeDecrypt(profile.dateOfBirth),
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
interface VerificationUpdateInfo {
  userId: string;
  userEmail: string | null;
  userName: string;
  sourceName: string;
  source: string;
  dataType: string;
}

export async function verifyRemovalRequest(removalRequestId: string): Promise<{
  success: boolean;
  status: "COMPLETED" | "FAILED" | "PENDING";
  message: string;
  updateInfo?: VerificationUpdateInfo;
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

    // Schedule next verification attempt with adaptive delay
    const retryDelay = getRetryDelay(removalRequest.exposure.source, removalRequest.verificationCount);
    const nextVerify = new Date();
    nextVerify.setDate(nextVerify.getDate() + retryDelay);

    await prisma.removalRequest.update({
      where: { id: removalRequestId },
      data: {
        verifyAfter: nextVerify,
        lastVerifiedAt: new Date(),
        verificationCount: { increment: 1 },
        notes: `No scanner available for ${removalRequest.exposure.source}. Will auto-complete after ${MAX_VERIFICATION_ATTEMPTS} attempts.`,
      },
    });

    return {
      success: true,
      status: "PENDING",
      message: `Cannot verify automatically (${removalRequest.exposure.source}), scheduled retry in ${retryDelay} days`,
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

  // Validate that we have usable data for scanning
  const hasUsableData = !!(
    scanInput.fullName ||
    (scanInput.emails && scanInput.emails.length > 0) ||
    (scanInput.phones && scanInput.phones.length > 0)
  );

  if (!hasUsableData) {
    console.log(`[Verification] No usable profile data for user (encryption key mismatch?)`);

    // Schedule retry - the user may update their profile or key may be fixed
    const nextVerify = new Date();
    nextVerify.setDate(nextVerify.getDate() + 7);

    await prisma.removalRequest.update({
      where: { id: removalRequestId },
      data: {
        verifyAfter: nextVerify,
        lastVerifiedAt: new Date(),
        notes: "Verification skipped - profile data unavailable (possible encryption key mismatch)",
      },
    });

    return {
      success: false,
      status: "PENDING",
      message: "Profile data unavailable for verification"
    };
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

      // Return update info for batched email (sent by runVerificationBatch)
      return {
        success: true,
        status: "COMPLETED" as const,
        message: "Exposure verified as removed",
        updateInfo: {
          userId: removalRequest.user.id,
          userEmail: removalRequest.user.email,
          userName: removalRequest.user.name || "",
          sourceName: removalRequest.exposure.sourceName,
          source: removalRequest.exposure.source,
          dataType: removalRequest.exposure.dataType,
        },
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

        // Return update info for batched email (sent by runVerificationBatch)
        return {
          success: false,
          status: "FAILED" as const,
          message: "Data still found after maximum verification attempts",
          updateInfo: {
            userId: removalRequest.user.id,
            userEmail: removalRequest.user.email,
            userName: removalRequest.user.name || "",
            sourceName: removalRequest.exposure.sourceName,
            source: removalRequest.exposure.source,
            dataType: removalRequest.exposure.dataType,
          },
        };
      }

      // Schedule another verification with adaptive delay
      const retryDelay = getRetryDelay(removalRequest.exposure.source, removalRequest.verificationCount + 1);
      const nextVerify = new Date();
      nextVerify.setDate(nextVerify.getDate() + retryDelay);

      await prisma.removalRequest.update({
        where: { id: removalRequestId },
        data: {
          verifyAfter: nextVerify,
          lastVerifiedAt: new Date(),
          verificationCount: { increment: 1 },
          notes: `Data still present. Attempt ${removalRequest.verificationCount + 1}/${MAX_VERIFICATION_ATTEMPTS}. Next check in ${retryDelay} days.`,
        },
      });

      return {
        success: true,
        status: "PENDING",
        message: `Data still found, retry scheduled in ${retryDelay} days (attempt ${removalRequest.verificationCount + 1}/${MAX_VERIFICATION_ATTEMPTS})`,
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
interface UserUpdateInfo {
  userId: string;
  userEmail: string | null;
  userName: string;
  sourceName: string;
  source: string;
  dataType: string;
}

export async function runVerificationBatch(deadline?: number): Promise<{
  processed: number;
  completed: number;
  failed: number;
  pending: number;
  emailsSent: number;
  timeBoxed: boolean;
}> {
  const stats = { processed: 0, completed: 0, failed: 0, pending: 0, emailsSent: 0, timeBoxed: false };

  // Collect updates per user for batched emails
  const userUpdates = new Map<string, {
    email: string;
    name: string;
    completed: UserUpdateInfo[];
    failed: UserUpdateInfo[];
  }>();

  const removalIds = await getRemovalsDueForVerification();
  console.log(`[Verification] Found ${removalIds.length} removals due for verification`);

  for (const id of removalIds) {
    // Time-boxing: stop processing if approaching Vercel timeout
    if (deadline && Date.now() >= deadline) {
      console.log(`[Verification] Deadline reached after ${stats.processed} verifications, stopping`);
      stats.timeBoxed = true;
      break;
    }

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

    // Collect update info for batched email (COMPLETED and FAILED only)
    if (result.updateInfo && (result.status === "COMPLETED" || result.status === "FAILED")) {
      const { userId, userEmail, userName } = result.updateInfo;
      if (userEmail) {
        if (!userUpdates.has(userId)) {
          userUpdates.set(userId, {
            email: userEmail,
            name: userName,
            completed: [],
            failed: [],
          });
        }
        const userUpdate = userUpdates.get(userId)!;
        if (result.status === "COMPLETED") {
          userUpdate.completed.push(result.updateInfo);
        } else {
          userUpdate.failed.push(result.updateInfo);
        }
      }
    }

    // Longer delay between verifications to avoid rate limiting (15 seconds)
    // This is especially important for LeakCheck which has strict rate limits
    await new Promise(resolve => setTimeout(resolve, 15000));
  }

  // Send ONE digest email per user with all their updates
  console.log(`[Verification] Sending digest emails to ${userUpdates.size} users`);
  for (const [userId, userData] of userUpdates) {
    try {
      await sendRemovalStatusDigestEmail(userData.email, userData.name, {
        completed: userData.completed.map(u => ({
          sourceName: u.sourceName,
          source: u.source,
          dataType: u.dataType,
          status: "COMPLETED" as const,
        })),
        inProgress: [],
        submitted: [],
        failed: userData.failed.map(u => ({
          sourceName: u.sourceName,
          source: u.source,
          dataType: u.dataType,
          status: "FAILED" as const,
        })),
      });
      stats.emailsSent++;
      console.log(`[Verification] Sent digest to ${userData.email}: ${userData.completed.length} completed, ${userData.failed.length} failed`);

      // SMS for removal updates disabled - only email notifications sent
      // Users receive SMS for exposures and breach alerts only
    } catch (error) {
      console.error(`[Verification] Failed to send digest to ${userData.email}:`, error);
    }
  }

  return stats;
}
