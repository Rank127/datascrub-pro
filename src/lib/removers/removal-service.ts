import { prisma } from "@/lib/db";
import { sendCCPARemovalRequest, sendRemovalStatusDigestEmail, queueRemovalStatusUpdate } from "@/lib/email";
import { getDataBrokerInfo, getOptOutInstructions, getSubsidiaries, getConsolidationParent, type DataBrokerInfo } from "./data-broker-directory";
import { calculateVerifyAfterDate } from "./verification-service";
import { attemptAutomatedOptOut, isAutomationEnabled } from "./browser-automation";
import type { RemovalMethod } from "@/lib/types";
import { createRemovalFailedTicket } from "@/lib/support/ticket-service";
import { isDomainBlocklisted, getBlocklistEntry } from "./blocklist";

const MAX_REMOVAL_ATTEMPTS = 5;
const MAX_REQUESTS_PER_BROKER_PER_DAY = 25; // Limit requests to any single broker per day (avoid spam flags)
const MIN_MINUTES_BETWEEN_SAME_BROKER = 15; // Space requests to same broker (minutes)

interface RemovalExecutionResult {
  success: boolean;
  method: RemovalMethod;
  message: string;
  instructions?: string;
  isNonRemovable?: boolean; // Flag for breach databases, dark web sources
}

// Common privacy email patterns to try (in order of preference)
const PRIVACY_EMAIL_PATTERNS = [
  "privacy@{domain}",
  "dpo@{domain}",              // Data Protection Officer (GDPR)
  "dataprivacy@{domain}",
  "legal@{domain}",
  "compliance@{domain}",
  "support@{domain}",
  "info@{domain}",
];

// Try to extract privacy emails from a domain - returns multiple candidates
function extractPrivacyEmailsFromDomain(sourceUrl?: string | null): string[] {
  if (!sourceUrl) return [];

  try {
    const url = new URL(sourceUrl);
    const domain = url.hostname.replace(/^www\./, "");

    // Generate candidate emails
    return PRIVACY_EMAIL_PATTERNS.map(pattern => pattern.replace("{domain}", domain));
  } catch {
    return [];
  }
}

// Get primary privacy email (backward compatible)
function extractPrivacyEmailFromDomain(sourceUrl?: string | null): string | null {
  const emails = extractPrivacyEmailsFromDomain(sourceUrl);
  return emails.length > 0 ? emails[0] : null;
}

// Extract domain name from source for display
function extractDomainFromSource(source: string, sourceUrl?: string | null): string {
  // First try to get from URL
  if (sourceUrl) {
    try {
      const url = new URL(sourceUrl);
      return url.hostname.replace(/^www\./, "");
    } catch {
      // Fall through to source name parsing
    }
  }

  // Convert source name to readable format: SOME_SOURCE -> some source
  return source.toLowerCase().replace(/_/g, " ");
}

// Check if source is a breach/monitoring source that can't be removed
function isNonRemovableSource(source: string, brokerInfo?: DataBrokerInfo | null): boolean {
  // Check broker info flag first
  if (brokerInfo?.isRemovable === false) return true;
  if (brokerInfo?.removalMethod === "NOT_REMOVABLE") return true;

  // Check source name patterns for breach databases
  const nonRemovablePatterns = [
    /breach/i,
    /leak/i,
    /dark_?web/i,
    /paste_?site/i,
    /stealer/i,
    /ransomware/i,
    /underground/i,
    /carding/i,
    /forum_?monitor/i,
    /market_?monitor/i,
  ];

  return nonRemovablePatterns.some(pattern => pattern.test(source));
}

// Generate appropriate instructions for non-removable sources
function getNonRemovableInstructions(source: string, brokerInfo?: DataBrokerInfo | null): string {
  if (brokerInfo?.notes) {
    return brokerInfo.notes;
  }

  const sourceUpper = source.toUpperCase();

  if (sourceUpper.includes("BREACH") || sourceUpper.includes("PWNED")) {
    return `This data was exposed in a historical data breach. The breach has already occurred and the leaked data cannot be "removed" from existence.

What you SHOULD do:
1. Change any passwords that may have been exposed
2. Enable two-factor authentication (2FA) on all accounts
3. Monitor your accounts for suspicious activity
4. Consider placing a credit freeze if sensitive data was exposed
5. Be alert for phishing attempts using your leaked information`;
  }

  if (sourceUpper.includes("DARK") || sourceUpper.includes("FORUM") || sourceUpper.includes("MARKET")) {
    return `This data was found on the dark web. Data on underground forums and marketplaces cannot be removed through normal channels.

What you SHOULD do:
1. Immediately change all compromised credentials
2. Enable two-factor authentication everywhere
3. Place credit freezes with Equifax, Experian, and TransUnion
4. Monitor your bank and credit accounts closely
5. Consider identity theft protection services
6. Report to identitytheft.gov if identity fraud occurs`;
  }

  if (sourceUpper.includes("PASTE")) {
    return `This data was found on a paste site. While the specific paste may be removed, copies likely exist elsewhere.

What you SHOULD do:
1. Change any exposed credentials immediately
2. Enable two-factor authentication
3. Monitor for unauthorized account access`;
  }

  return `This source type is classified as monitoring-only. The data cannot be directly removed through standard opt-out procedures. Focus on securing your accounts and monitoring for misuse.`;
}

interface ExecuteRemovalOptions {
  skipUserNotification?: boolean; // Skip sending notification email to user (for bulk operations)
  skipEntityValidation?: boolean; // Skip entity classification check (for retries where already validated)
}

// ============================================================================
// ENTITY VALIDATION - Prevents sending removals to Data Processors
// ============================================================================

interface EntityValidationResult {
  shouldProceed: boolean;
  classification: "DATA_BROKER" | "DATA_PROCESSOR" | "UNKNOWN";
  confidence: number;
  reason: string;
  blockedByBlocklist: boolean;
}

/**
 * Validate an entity before sending a removal request.
 * This prevents the Syndigo incident from recurring - we should NOT send
 * deletion requests to Data Processors (only Data Controllers/Brokers).
 *
 * Design: FAIL OPEN - if validation fails, we proceed with removal
 * to avoid blocking legitimate removals due to system errors.
 */
export async function validateEntityBeforeRemoval(
  domain: string,
  options: { sourceUrl?: string | null; source?: string } = {}
): Promise<EntityValidationResult> {
  const normalizedDomain = domain.toLowerCase().trim();

  try {
    // Step 1: Quick blocklist check (highest confidence, fastest)
    const blocklistEntry = getBlocklistEntry(normalizedDomain);
    if (blocklistEntry) {
      console.log(`[Removal Validation] BLOCKED: ${normalizedDomain} is blocklisted as Data Processor`);

      // Log to database for audit trail
      try {
        await prisma.entityClassification.create({
          data: {
            domain: normalizedDomain,
            classification: "DATA_PROCESSOR",
            confidence: 1.0,
            source: "BLOCKLIST",
            reasoning: `Blocklisted: ${blocklistEntry.reason}`,
            parentCompany: blocklistEntry.name,
            blockedFromRemoval: true,
          },
        });
      } catch {
        // Database table might not exist yet
      }

      return {
        shouldProceed: false,
        classification: "DATA_PROCESSOR",
        confidence: 1.0,
        reason: `${blocklistEntry.name} is a Data Processor: ${blocklistEntry.reason}`,
        blockedByBlocklist: true,
      };
    }

    // Step 2: Check if domain or any parent domain is blocklisted
    // e.g., api.powerreviews.com should match powerreviews.com
    const domainParts = normalizedDomain.split(".");
    for (let i = 1; i < domainParts.length - 1; i++) {
      const parentDomain = domainParts.slice(i).join(".");
      const parentBlocklist = getBlocklistEntry(parentDomain);
      if (parentBlocklist) {
        console.log(`[Removal Validation] BLOCKED: ${normalizedDomain} - parent ${parentDomain} is blocklisted`);

        try {
          await prisma.entityClassification.create({
            data: {
              domain: normalizedDomain,
              classification: "DATA_PROCESSOR",
              confidence: 0.95,
              source: "BLOCKLIST",
              reasoning: `Parent domain ${parentDomain} is blocklisted: ${parentBlocklist.reason}`,
              parentCompany: parentBlocklist.name,
              blockedFromRemoval: true,
            },
          });
        } catch {
          // Database table might not exist yet
        }

        return {
          shouldProceed: false,
          classification: "DATA_PROCESSOR",
          confidence: 0.95,
          reason: `Parent domain ${parentDomain} (${parentBlocklist.name}) is a Data Processor`,
          blockedByBlocklist: true,
        };
      }
    }

    // Step 3: Check data broker directory (known brokers = safe to send)
    const brokerKey = (options.source || normalizedDomain).toUpperCase().replace(/[.\-]/g, "_");
    const brokerInfo = getDataBrokerInfo(brokerKey);
    if (brokerInfo) {
      // It's a known data broker - safe to proceed
      return {
        shouldProceed: true,
        classification: "DATA_BROKER",
        confidence: 0.95,
        reason: `${brokerInfo.name} is a known data broker in our directory`,
        blockedByBlocklist: false,
      };
    }

    // Step 4: Check cached classification from database
    try {
      const cachedClassification = await prisma.entityClassification.findFirst({
        where: {
          domain: normalizedDomain,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // 30 day cache
        },
        orderBy: { createdAt: "desc" },
      });

      if (cachedClassification) {
        const shouldProceed = cachedClassification.classification !== "DATA_PROCESSOR";
        console.log(`[Removal Validation] Cached classification for ${normalizedDomain}: ${cachedClassification.classification}`);
        return {
          shouldProceed,
          classification: cachedClassification.classification as EntityValidationResult["classification"],
          confidence: cachedClassification.confidence,
          reason: cachedClassification.reasoning,
          blockedByBlocklist: false,
        };
      }
    } catch {
      // Database table might not exist yet
    }

    // Step 5: Unknown entity - FAIL OPEN (proceed with removal)
    // Better to attempt a removal that bounces than to block legitimate removals
    console.log(`[Removal Validation] Unknown entity ${normalizedDomain} - proceeding (fail open)`);
    return {
      shouldProceed: true,
      classification: "UNKNOWN",
      confidence: 0.5,
      reason: "Entity not in blocklist or broker directory - proceeding with removal",
      blockedByBlocklist: false,
    };
  } catch (error) {
    // FAIL OPEN - if validation itself fails, proceed with removal
    console.error(`[Removal Validation] Error validating ${normalizedDomain}:`, error);
    return {
      shouldProceed: true,
      classification: "UNKNOWN",
      confidence: 0,
      reason: "Validation error - proceeding with removal (fail open)",
      blockedByBlocklist: false,
    };
  }
}

// Execute a removal request
export async function executeRemoval(
  removalRequestId: string,
  userId: string,
  options: ExecuteRemovalOptions = {}
): Promise<RemovalExecutionResult> {
  const { skipUserNotification = false, skipEntityValidation = false } = options;
  // Get the removal request with exposure and user details
  const removalRequest = await prisma.removalRequest.findUnique({
    where: { id: removalRequestId },
    include: {
      exposure: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!removalRequest) {
    return {
      success: false,
      method: "MANUAL_GUIDE",
      message: "Removal request not found",
    };
  }

  // Get user's profile for removal request details
  const profile = await prisma.personalProfile.findFirst({
    where: { userId },
    select: { fullName: true },
  });

  const userName = profile?.fullName || removalRequest.user.name || "User";
  const userEmail = removalRequest.user.email;
  const source = removalRequest.exposure.source;
  const dataType = removalRequest.exposure.dataType;
  const sourceUrl = removalRequest.exposure.sourceUrl;

  // Get data broker info
  const brokerInfo = getDataBrokerInfo(source);

  // =========================================================================
  // PRE-FLIGHT VALIDATION: Check if entity is a Data Processor
  // This prevents sending deletion requests to companies like Syndigo/PowerReviews
  // =========================================================================
  if (!skipEntityValidation && sourceUrl) {
    try {
      const domain = new URL(sourceUrl).hostname.replace(/^www\./, "");
      const validation = await validateEntityBeforeRemoval(domain, { sourceUrl, source });

      if (!validation.shouldProceed) {
        console.log(`[Removal] BLOCKED: ${source} classified as ${validation.classification}`);

        // Mark the removal as blocked with explanation
        await prisma.removalRequest.update({
          where: { id: removalRequestId },
          data: {
            status: "BLOCKED",
            notes: `Removal blocked: ${validation.reason}. ` +
              `This entity is classified as a Data Processor (not a Data Broker). ` +
              `Per GDPR Articles 28/29, deletion requests should be sent to the Data Controller, not the Processor.`,
          },
        });

        // Update exposure status to indicate why removal didn't proceed
        await prisma.exposure.update({
          where: { id: removalRequest.exposureId },
          data: {
            status: "MONITORING",
            requiresManualAction: true,
          },
        });

        return {
          success: false,
          method: "MANUAL_GUIDE",
          message: `Removal blocked: ${validation.reason}`,
          instructions: `This entity (${domain}) is classified as a Data Processor, not a Data Broker. ` +
            `Data Processors only process data on behalf of their clients (Data Controllers). ` +
            `Sending deletion requests to Data Processors can:\n` +
            `1. Not be actioned (they need Controller authorization)\n` +
            `2. Actually increase data exposure (adding data to systems where it didn't exist)\n` +
            `3. Bypass the proper legal channel (the Data Controller)\n\n` +
            `If you believe this classification is incorrect, please contact support.`,
          isNonRemovable: true,
        };
      }
    } catch (validationError) {
      // FAIL OPEN - if validation errors, proceed with removal
      console.warn(`[Removal] Entity validation error for ${source}, proceeding:`, validationError);
    }
  }

  // Check if this is a non-removable source (breach database, dark web, etc.)
  if (isNonRemovableSource(source, brokerInfo)) {
    // Mark as "acknowledged" - user is informed but removal isn't possible
    await updateRemovalStatus(removalRequestId, "ACKNOWLEDGED");

    const instructions = getNonRemovableInstructions(source, brokerInfo);

    // Save instructions to the removal request
    await prisma.removalRequest.update({
      where: { id: removalRequestId },
      data: { notes: instructions },
    });

    return {
      success: true,
      method: "MANUAL_GUIDE",
      message: brokerInfo?.name
        ? `${brokerInfo.name}: Data cannot be removed from historical breaches or dark web sources.`
        : `This data cannot be removed - it originates from a breach or dark web source.`,
      instructions,
      isNonRemovable: true,
    };
  }

  if (!brokerInfo) {
    // Unknown source - don't send guessed emails (they often bounce)
    // Mark as REQUIRES_MANUAL and provide generic instructions
    console.log(`[Removal] Unknown source ${source}, marking as requires manual`);

    await updateRemovalStatus(removalRequestId, "REQUIRES_MANUAL");

    return {
      success: true,
      method: "MANUAL_GUIDE",
      message: "Unknown source - please contact them directly to request data removal.",
      instructions: getOptOutInstructions(source),
    };
  }

  // Determine execution method based on broker and available info
  // Cast to string to handle both new and legacy method names in the database
  const method = removalRequest.method as string;

  try {
    switch (method) {
      // Handle both new (AUTO_EMAIL) and legacy (EMAIL) method names
      case "AUTO_EMAIL":
      case "EMAIL": {
        // Send CCPA/GDPR removal request email
        // Only send if broker supports email AND has a valid privacyEmail
        const supportsEmail = brokerInfo.removalMethod === "EMAIL" || brokerInfo.removalMethod === "BOTH";
        if (supportsEmail && brokerInfo.privacyEmail) {
          const result = await sendCCPARemovalRequest({
            toEmail: brokerInfo.privacyEmail,
            fromName: userName,
            fromEmail: userEmail,
            dataTypes: [formatDataType(dataType)],
            sourceUrl: removalRequest.exposure.sourceUrl || undefined,
          });

          if (result.success) {
            // Update removal request status
            await updateRemovalStatus(removalRequestId, "SUBMITTED");

            // Queue notification for daily digest (unless skipped for bulk operations)
            if (!skipUserNotification) {
              await queueRemovalStatusUpdate(userId, {
                sourceName: brokerInfo.name,
                source: source,
                status: "SUBMITTED",
                dataType: formatDataType(dataType),
              });
            }

            return {
              success: true,
              method: "AUTO_EMAIL",
              message: `CCPA/GDPR removal request sent to ${brokerInfo.name}`,
            };
          }
        }

        // Fall back to manual if email fails - mark as REQUIRES_MANUAL
        await updateRemovalStatus(removalRequestId, "REQUIRES_MANUAL");
        return {
          success: true,
          method: "MANUAL_GUIDE",
          message: `Could not send automated email. Please use the manual opt-out process.`,
          instructions: getOptOutInstructions(source),
        };
      }

      // Handle both new (AUTO_FORM) and legacy (FORM) method names
      case "AUTO_FORM":
      case "FORM": {
        // Try browser automation if configured
        if (isAutomationEnabled()) {
          // Get full profile for form data
          const fullProfile = await prisma.personalProfile.findFirst({
            where: { userId },
            select: {
              fullName: true,
              phones: true,
              addresses: true,
            },
          });

          // Parse phone (first one if multiple)
          const phone = fullProfile?.phones?.split(",")[0]?.trim();

          // Parse address (first one if multiple)
          const addressParts = fullProfile?.addresses?.split(",")[0]?.trim().split(" ");
          const address = addressParts?.slice(0, -3).join(" "); // Street address
          const city = addressParts?.slice(-3, -2)[0];
          const stateZip = addressParts?.slice(-2);
          const state = stateZip?.[0];
          const zipCode = stateZip?.[1];

          const automationResult = await attemptAutomatedOptOut(source, {
            name: userName,
            email: userEmail,
            phone,
            address,
            city,
            state,
            zipCode,
            profileUrl: sourceUrl || undefined,
          });

          if (automationResult.success) {
            await updateRemovalStatus(removalRequestId, "SUBMITTED");

            if (!skipUserNotification) {
              await queueRemovalStatusUpdate(userId, {
                sourceName: brokerInfo.name,
                source: source,
                status: "SUBMITTED",
                dataType: formatDataType(dataType),
              });
            }

            return {
              success: true,
              method: "AUTO_FORM",
              message: `Form submitted automatically for ${brokerInfo.name}`,
            };
          }

          // Automation failed or not available for this broker
          console.log(`[Removal] Browser automation failed for ${source}: ${automationResult.message}`);
        }

        // Fall back to manual instructions
        await updateRemovalStatus(removalRequestId, "REQUIRES_MANUAL");

        return {
          success: true,
          method: "MANUAL_GUIDE",
          message: `Please complete the opt-out form for ${brokerInfo.name}`,
          instructions: getOptOutInstructions(source),
        };
      }

      case "MANUAL_GUIDE": {
        // Provide instructions for manual removal
        await updateRemovalStatus(removalRequestId, "REQUIRES_MANUAL");

        // Save instructions to removal request
        await prisma.removalRequest.update({
          where: { id: removalRequestId },
          data: {
            notes: getOptOutInstructions(source),
          },
        });

        return {
          success: true,
          method: "MANUAL_GUIDE",
          message: `Manual removal required for ${brokerInfo.name}`,
          instructions: getOptOutInstructions(source),
        };
      }

      default: {
        // Mark unknown methods as requiring manual intervention
        await updateRemovalStatus(removalRequestId, "REQUIRES_MANUAL");
        return {
          success: false,
          method: "MANUAL_GUIDE",
          message: `Unknown removal method: ${method}`,
        };
      }
    }
  } catch (error) {
    console.error("Removal execution error:", error);

    await updateRemovalStatus(removalRequestId, "FAILED",
      error instanceof Error ? error.message : "Unknown error"
    );

    return {
      success: false,
      method: method as RemovalMethod,
      message: "Failed to execute removal request",
    };
  }
}

// Update removal request status
async function updateRemovalStatus(
  requestId: string,
  status: string,
  error?: string
) {
  // Get current request to determine source for verification scheduling and check attempts
  const currentRequest = await prisma.removalRequest.findUnique({
    where: { id: requestId },
    select: {
      attempts: true,
      userId: true,
      exposure: { select: { id: true, source: true, sourceName: true } },
    },
  });

  const data: {
    status: string;
    attempts: { increment: number };
    submittedAt?: Date;
    lastError?: string;
    verifyAfter?: Date;
  } = {
    status,
    attempts: { increment: 1 },
  };

  if (status === "SUBMITTED") {
    data.submittedAt = new Date();
    // Schedule verification based on source type
    if (currentRequest?.exposure.source) {
      data.verifyAfter = calculateVerifyAfterDate(currentRequest.exposure.source);
      console.log(`[Removal] Scheduled verification for ${data.verifyAfter.toISOString()}`);
    }
  }

  if (error) {
    data.lastError = error;
  }

  await prisma.removalRequest.update({
    where: { id: requestId },
    data,
  });

  // Update exposure status based on removal status
  const statusMap: Record<string, string> = {
    SUBMITTED: "REMOVAL_IN_PROGRESS",
    IN_PROGRESS: "REMOVAL_IN_PROGRESS",
    COMPLETED: "REMOVED",
    FAILED: "ACTIVE",
    REQUIRES_MANUAL: "REMOVAL_PENDING",
    ACKNOWLEDGED: "MONITORING", // Non-removable sources - user informed, monitoring only
  };

  const removalRequest = await prisma.removalRequest.findUnique({
    where: { id: requestId },
    select: { exposureId: true },
  });

  if (removalRequest && statusMap[status]) {
    await prisma.exposure.update({
      where: { id: removalRequest.exposureId },
      data: { status: statusMap[status] },
    });
  }

  // Create support ticket if removal has failed after max attempts
  if (
    status === "FAILED" &&
    currentRequest &&
    currentRequest.attempts + 1 >= MAX_REMOVAL_ATTEMPTS
  ) {
    console.log(`[Removal] Max attempts reached for ${requestId}, creating support ticket`);
    createRemovalFailedTicket(
      currentRequest.userId,
      requestId,
      currentRequest.exposure.id,
      currentRequest.exposure.sourceName,
      error || "Max retry attempts exceeded"
    ).catch((ticketError) => {
      console.error("[Removal] Failed to create support ticket:", ticketError);
    });
  }
}

// Format data type for display
function formatDataType(dataType: string): string {
  const typeMap: Record<string, string> = {
    EMAIL: "Email Address",
    PHONE: "Phone Number",
    NAME: "Full Name",
    ADDRESS: "Physical Address",
    DOB: "Date of Birth",
    SSN: "Social Security Number",
    PHOTO: "Photo/Image",
    USERNAME: "Username",
    FINANCIAL: "Financial Information",
    COMBINED_PROFILE: "Combined Personal Profile",
  };

  return typeMap[dataType] || dataType;
}

// Mark removal as completed (for manual confirmation)
// Now also handles consolidated removals - completing a parent broker marks subsidiaries as removed
export async function markRemovalCompleted(
  removalRequestId: string,
  userId: string
): Promise<{ success: boolean; consolidatedCount?: number }> {
  const request = await prisma.removalRequest.findFirst({
    where: {
      id: removalRequestId,
      userId,
    },
    include: {
      exposure: true,
      user: {
        select: { email: true, name: true },
      },
    },
  });

  if (!request) {
    return { success: false };
  }

  const source = request.exposure.source;
  const subsidiaries = getSubsidiaries(source);
  const consolidatedSources = subsidiaries.length > 0 ? [source, ...subsidiaries] : [source];

  // Find all exposures from this user that match the consolidated sources
  const relatedExposures = await prisma.exposure.findMany({
    where: {
      userId,
      source: { in: consolidatedSources },
      status: { not: "REMOVED" }, // Not already removed
    },
    select: { id: true, source: true, sourceName: true },
  });

  // Collect subsidiary exposure IDs
  const consolidatedExposureIds: string[] = [];
  for (const exposure of relatedExposures) {
    if (exposure.id !== request.exposureId) {
      consolidatedExposureIds.push(exposure.id);
    }
  }

  // Create alert message
  const alertMessage = subsidiaries.length > 0
    ? `Your data has been removed from ${request.exposure.sourceName} and ${consolidatedExposureIds.length} related sites.`
    : `Your data has been removed from ${request.exposure.sourceName}.`;

  // Use interactive transaction to handle multiple models
  await prisma.$transaction(async (tx) => {
    // Mark main removal as completed
    await tx.removalRequest.update({
      where: { id: removalRequestId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        notes: subsidiaries.length > 0
          ? `Consolidated removal - also removed from: ${subsidiaries.join(", ")}`
          : undefined,
      },
    });

    // Mark main exposure as removed
    await tx.exposure.update({
      where: { id: request.exposureId },
      data: { status: "REMOVED" },
    });

    // Mark all related subsidiary exposures as removed
    for (const exposureId of consolidatedExposureIds) {
      await tx.exposure.update({
        where: { id: exposureId },
        data: { status: "REMOVED" },
      });
    }

    // Complete any pending removal requests for subsidiary exposures
    if (consolidatedExposureIds.length > 0) {
      await tx.removalRequest.updateMany({
        where: {
          exposureId: { in: consolidatedExposureIds },
          status: { in: ["PENDING", "SUBMITTED", "IN_PROGRESS", "REQUIRES_MANUAL"] },
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          notes: `Auto-completed via consolidated removal from ${request.exposure.sourceName}`,
        },
      });
    }

    // Create alert
    await tx.alert.create({
      data: {
        userId,
        type: "REMOVAL_COMPLETED",
        title: "Data Removed Successfully",
        message: alertMessage,
      },
    });
  });

  // Queue completion notification for daily digest
  const emailMessage = subsidiaries.length > 0
    ? `${request.exposure.sourceName} (plus ${consolidatedExposureIds.length} related sites)`
    : request.exposure.sourceName;

  queueRemovalStatusUpdate(userId, {
    sourceName: emailMessage,
    source: source,
    status: "COMPLETED",
    dataType: formatDataType(request.exposure.dataType),
  }).catch(console.error);

  console.log(`[Removal] Completed removal for ${source}, consolidated ${consolidatedExposureIds.length} subsidiary exposures`);

  return {
    success: true,
    consolidatedCount: consolidatedExposureIds.length,
  };
}

// ============================================
// INTELLIGENT AUTOMATION FUNCTIONS
// ============================================

/**
 * Get today's submission counts by broker source
 * Used to enforce per-broker daily rate limits
 */
async function getTodaysBrokerSubmissionCounts(): Promise<Map<string, number>> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const submissions = await prisma.removalRequest.groupBy({
    by: ["exposureId"],
    where: {
      status: "SUBMITTED",
      submittedAt: { gte: today },
    },
    _count: { id: true },
  });

  // Get the exposure sources for these submissions
  if (submissions.length === 0) {
    return new Map();
  }

  const exposureIds = submissions.map(s => s.exposureId);
  const exposures = await prisma.exposure.findMany({
    where: { id: { in: exposureIds } },
    select: { id: true, source: true },
  });

  // Build a map of exposureId -> source
  const exposureSourceMap = new Map<string, string>();
  for (const exp of exposures) {
    exposureSourceMap.set(exp.id, exp.source);
  }

  // Count submissions per broker source
  const brokerCounts = new Map<string, number>();
  for (const sub of submissions) {
    const source = exposureSourceMap.get(sub.exposureId);
    if (source) {
      brokerCounts.set(source, (brokerCounts.get(source) || 0) + sub._count.id);
    }
  }

  return brokerCounts;
}

/**
 * Get the last submission time for each broker source (for spacing requests)
 */
async function getLastSubmissionTimeByBroker(): Promise<Map<string, Date>> {
  const recentSubmissions = await prisma.removalRequest.findMany({
    where: {
      status: "SUBMITTED",
      submittedAt: {
        gte: new Date(Date.now() - MIN_MINUTES_BETWEEN_SAME_BROKER * 60 * 1000),
      },
    },
    include: {
      exposure: { select: { source: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  const lastSubmissionByBroker = new Map<string, Date>();
  for (const sub of recentSubmissions) {
    const source = sub.exposure.source;
    if (!lastSubmissionByBroker.has(source) && sub.submittedAt) {
      lastSubmissionByBroker.set(source, sub.submittedAt);
    }
  }

  return lastSubmissionByBroker;
}

// Severity priority for round-robin selection (lower = higher priority)
const SEVERITY_PRIORITY: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

/**
 * Get all pending removals that can be automatically processed
 * Uses severity-weighted round-robin for optimal distribution:
 * - Round-robin across brokers (maximizes diversity)
 * - Within each broker, prioritizes by severity (CRITICAL first)
 * - Respects per-broker daily limits and spacing requirements
 */
export async function getPendingRemovalsForAutomation(limit: number = 50): Promise<string[]> {
  // Get current broker submission counts for today
  const brokerCounts = await getTodaysBrokerSubmissionCounts();
  const lastSubmissionByBroker = await getLastSubmissionTimeByBroker();
  const now = new Date();

  // Get all pending removals with their broker source and severity
  const pendingRemovals = await prisma.removalRequest.findMany({
    where: {
      status: "PENDING",
      attempts: { lt: 3 }, // Haven't exceeded retry limit
    },
    include: {
      exposure: { select: { source: true, severity: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`[Automation] Found ${pendingRemovals.length} pending removals, applying severity-weighted round-robin...`);

  // Group by broker, then sort each group by severity
  const brokerQueues = new Map<string, Array<{ id: string; severity: string }>>();
  const skippedBrokers = new Set<string>(); // Brokers that hit limits

  for (const removal of pendingRemovals) {
    const source = removal.exposure.source;

    // Check if broker already hit daily limit (before adding to queue)
    const todayCount = brokerCounts.get(source) || 0;
    if (todayCount >= MAX_REQUESTS_PER_BROKER_PER_DAY) {
      if (!skippedBrokers.has(source)) {
        console.log(`[Automation] Broker ${source} at daily limit (${todayCount}/${MAX_REQUESTS_PER_BROKER_PER_DAY})`);
        skippedBrokers.add(source);
      }
      continue;
    }

    // Check spacing requirement (only for first request to this broker in batch)
    if (!brokerQueues.has(source)) {
      const lastSubmission = lastSubmissionByBroker.get(source);
      if (lastSubmission) {
        const minutesSinceLastSubmission = (now.getTime() - lastSubmission.getTime()) / (1000 * 60);
        if (minutesSinceLastSubmission < MIN_MINUTES_BETWEEN_SAME_BROKER) {
          console.log(`[Automation] Broker ${source} needs spacing (${Math.round(minutesSinceLastSubmission)}m/${MIN_MINUTES_BETWEEN_SAME_BROKER}m)`);
          skippedBrokers.add(source);
          continue;
        }
      }
    }

    // Add to broker queue
    if (!brokerQueues.has(source)) {
      brokerQueues.set(source, []);
    }
    brokerQueues.get(source)!.push({
      id: removal.id,
      severity: removal.exposure.severity,
    });
  }

  // Sort each broker queue by severity (CRITICAL first)
  for (const [source, queue] of brokerQueues) {
    queue.sort((a, b) => {
      const priorityA = SEVERITY_PRIORITY[a.severity] ?? 4;
      const priorityB = SEVERITY_PRIORITY[b.severity] ?? 4;
      return priorityA - priorityB;
    });
  }

  console.log(`[Automation] ${brokerQueues.size} brokers with pending requests, ${skippedBrokers.size} brokers skipped (limits)`);

  // Round-robin selection across brokers
  const selectedIds: string[] = [];
  const batchBrokerCounts = new Map<string, number>();
  const brokerList = Array.from(brokerQueues.keys());
  let brokerIndex = 0;
  let emptyRounds = 0;

  while (selectedIds.length < limit && emptyRounds < brokerList.length) {
    const source = brokerList[brokerIndex];
    const queue = brokerQueues.get(source)!;

    // Check if this broker can accept more in this batch
    const batchCount = batchBrokerCounts.get(source) || 0;
    const todayCount = brokerCounts.get(source) || 0;
    const totalCount = batchCount + todayCount;

    if (queue.length > 0 && totalCount < MAX_REQUESTS_PER_BROKER_PER_DAY) {
      // Pick the highest severity request from this broker
      const request = queue.shift()!;
      selectedIds.push(request.id);
      batchBrokerCounts.set(source, batchCount + 1);
      emptyRounds = 0; // Reset empty counter
    } else {
      emptyRounds++; // This broker had nothing to offer
    }

    // Move to next broker (round-robin)
    brokerIndex = (brokerIndex + 1) % brokerList.length;
  }

  // Log broker distribution with severity info
  if (batchBrokerCounts.size > 0) {
    const distribution = Array.from(batchBrokerCounts.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .map(([source, count]) => `${source}:${count}`)
      .join(", ");
    console.log(`[Automation] Selected ${selectedIds.length} removals (round-robin): ${distribution}`);
  }

  return selectedIds;
}

/**
 * Retry a failed removal with alternative email patterns
 * Returns true if retry was successful
 */
export async function retryFailedRemoval(
  removalRequestId: string,
  options: { skipUserNotification?: boolean } = {}
): Promise<{ success: boolean; message: string; updateInfo?: { userId: string; userEmail: string; userName: string; sourceName: string; source: string; dataType: string } }> {
  const { skipUserNotification = false } = options;
  const request = await prisma.removalRequest.findUnique({
    where: { id: removalRequestId },
    include: {
      exposure: true,
      user: { select: { email: true, name: true } },
    },
  });

  if (!request) {
    return { success: false, message: "Removal request not found" };
  }

  if (request.status !== "FAILED" && request.status !== "REQUIRES_MANUAL") {
    return { success: false, message: `Cannot retry - status is ${request.status}` };
  }

  // Get the profile for CCPA request
  const profile = await prisma.personalProfile.findFirst({
    where: { userId: request.userId },
    select: { fullName: true },
  });

  const userName = profile?.fullName || request.user.name || "User";
  const userEmail = request.user.email;
  const brokerInfo = getDataBrokerInfo(request.exposure.source);

  // Check if broker supports email-based removal
  const supportsEmail = !brokerInfo || brokerInfo.removalMethod === "EMAIL" || brokerInfo.removalMethod === "BOTH";
  if (!supportsEmail) {
    return {
      success: false,
      message: `${brokerInfo?.name || request.exposure.source} only supports form-based removal, not email.`,
    };
  }

  // Build email candidates list - only use broker's privacyEmail if available
  // Don't generate guessed emails that might bounce
  const emailCandidates: string[] = [];

  // Add broker privacy email if available
  if (brokerInfo?.privacyEmail) {
    emailCandidates.push(brokerInfo.privacyEmail);
  }

  // If no valid email candidates, can't retry via email
  if (emailCandidates.length === 0) {
    return {
      success: false,
      message: `No valid privacy email for ${request.exposure.source} - requires manual removal.`,
    };
  }

  // Track which emails we've tried
  const triedEmails = request.lastError?.match(/tried: ([\w@.,\s]+)/)?.[1]?.split(", ") || [];

  for (const candidateEmail of emailCandidates) {
    if (triedEmails.includes(candidateEmail)) {
      continue; // Skip already tried
    }

    console.log(`[Removal Retry] Trying ${candidateEmail} for ${request.exposure.source}`);

    try {
      const result = await sendCCPARemovalRequest({
        toEmail: candidateEmail,
        fromName: userName,
        fromEmail: userEmail,
        dataTypes: [formatDataType(request.exposure.dataType)],
        sourceUrl: request.exposure.sourceUrl || undefined,
      });

      if (result.success) {
        // Success! Update status
        await prisma.removalRequest.update({
          where: { id: removalRequestId },
          data: {
            status: "SUBMITTED",
            submittedAt: new Date(),
            lastError: null,
            notes: `Automated retry successful - sent to ${candidateEmail}`,
            verifyAfter: calculateVerifyAfterDate(request.exposure.source),
          },
        });

        await prisma.exposure.update({
          where: { id: request.exposureId },
          data: { status: "REMOVAL_IN_PROGRESS" },
        });

        // Queue notification for daily digest (unless batching)
        if (!skipUserNotification) {
          await queueRemovalStatusUpdate(request.userId, {
            sourceName: request.exposure.sourceName,
            source: request.exposure.source,
            status: "SUBMITTED",
            dataType: formatDataType(request.exposure.dataType),
          }).catch(console.error);
        }

        return {
          success: true,
          message: `Retry successful - CCPA request sent to ${candidateEmail}`,
          updateInfo: {
            userId: request.userId,
            userEmail: userEmail,
            userName,
            sourceName: request.exposure.sourceName,
            source: request.exposure.source,
            dataType: request.exposure.dataType,
          },
        };
      }
    } catch (error) {
      console.error(`[Removal Retry] Failed with ${candidateEmail}:`, error);
      triedEmails.push(candidateEmail);
    }
  }

  // All attempts failed
  await prisma.removalRequest.update({
    where: { id: removalRequestId },
    data: {
      lastError: `All email attempts failed. Tried: ${triedEmails.join(", ")}`,
      attempts: { increment: 1 },
    },
  });

  return {
    success: false,
    message: `All email patterns exhausted for ${request.exposure.source}`,
  };
}

/**
 * Process a batch of pending removals
 * Respects per-broker daily limits (max 10/broker/day) and spacing (30min between same broker)
 * Returns summary of results
 */
export async function processPendingRemovalsBatch(limit: number = 20): Promise<{
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  emailsSent: number;
  brokerDistribution: Record<string, number>;
}> {
  const stats = {
    processed: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    emailsSent: 0,
    brokerDistribution: {} as Record<string, number>,
  };

  // Collect updates per user for batched digest emails
  const userUpdates = new Map<string, {
    email: string;
    name: string;
    submitted: Array<{ sourceName: string; source: string; dataType: string }>;
  }>();

  const pendingIds = await getPendingRemovalsForAutomation(limit);
  console.log(`[Batch Removal] Processing ${pendingIds.length} pending removals`);

  for (const id of pendingIds) {
    const request = await prisma.removalRequest.findUnique({
      where: { id },
      include: {
        exposure: true,
        user: { select: { email: true, name: true } },
      },
    });

    if (!request) {
      stats.skipped++;
      continue;
    }

    // Skip non-removable sources
    const brokerInfo = getDataBrokerInfo(request.exposure.source);
    if (isNonRemovableSource(request.exposure.source, brokerInfo)) {
      // Mark as acknowledged instead
      await prisma.removalRequest.update({
        where: { id },
        data: { status: "ACKNOWLEDGED" },
      });
      await prisma.exposure.update({
        where: { id: request.exposureId },
        data: { status: "MONITORING" },
      });
      stats.skipped++;
      continue;
    }

    try {
      // Skip individual notifications - we'll send digest at the end
      const result = await executeRemoval(id, request.userId, { skipUserNotification: true });
      stats.processed++;

      if (result.success && (result.method === "AUTO_EMAIL" || result.method === "AUTO_FORM")) {
        stats.successful++;

        // Track broker distribution
        const source = request.exposure.source;
        stats.brokerDistribution[source] = (stats.brokerDistribution[source] || 0) + 1;

        // Collect update for digest email
        if (request.user.email) {
          if (!userUpdates.has(request.userId)) {
            userUpdates.set(request.userId, {
              email: request.user.email,
              name: request.user.name || "",
              submitted: [],
            });
          }
          userUpdates.get(request.userId)!.submitted.push({
            sourceName: request.exposure.sourceName,
            source: request.exposure.source,
            dataType: request.exposure.dataType,
          });
        }
      } else if (result.method === "MANUAL_GUIDE") {
        stats.skipped++; // Requires manual action
      } else {
        stats.failed++;
      }
    } catch (error) {
      console.error(`[Batch Removal] Error processing ${id}:`, error);
      stats.failed++;
    }

    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Send ONE digest email per user with all their submitted removals
  console.log(`[Batch Removal] Sending digest emails to ${userUpdates.size} users`);
  for (const [userId, userData] of userUpdates) {
    if (userData.submitted.length > 0) {
      try {
        await sendRemovalStatusDigestEmail(userData.email, userData.name, {
          completed: [],
          inProgress: [],
          submitted: userData.submitted.map(s => ({
            ...s,
            status: "SUBMITTED" as const,
          })),
          failed: [],
        });
        stats.emailsSent++;
        console.log(`[Batch Removal] Sent digest to ${userData.email}: ${userData.submitted.length} submitted`);
      } catch (error) {
        console.error(`[Batch Removal] Failed to send digest to ${userData.email}:`, error);
      }
    }
  }

  const brokerDist = Object.entries(stats.brokerDistribution).map(([b, c]) => `${b}:${c}`).join(", ");
  console.log(`[Batch Removal] Complete: ${stats.successful} successful, ${stats.failed} failed, ${stats.skipped} skipped, ${stats.emailsSent} digest emails`);
  if (brokerDist) {
    console.log(`[Batch Removal] Broker distribution: ${brokerDist}`);
  }
  return stats;
}

/**
 * Auto-retry all failed removals that haven't exceeded retry limit
 * Respects per-broker daily limits
 */
export async function retryFailedRemovalsBatch(limit: number = 20): Promise<{
  processed: number;
  retried: number;
  stillFailed: number;
  emailsSent: number;
  skippedDueToLimit: number;
}> {
  const stats = { processed: 0, retried: 0, stillFailed: 0, emailsSent: 0, skippedDueToLimit: 0 };

  // Collect updates per user for batched digest emails
  const userUpdates = new Map<string, {
    email: string;
    name: string;
    submitted: Array<{ sourceName: string; source: string; dataType: string }>;
  }>();

  // Get current broker submission counts for today
  const brokerCounts = await getTodaysBrokerSubmissionCounts();
  const batchBrokerCounts = new Map<string, number>();

  const failedRemovals = await prisma.removalRequest.findMany({
    where: {
      status: { in: ["FAILED", "REQUIRES_MANUAL"] },
      attempts: { lt: 5 }, // Allow up to 5 total attempts
    },
    include: {
      exposure: { select: { source: true, sourceUrl: true } },
    },
    take: limit * 2, // Fetch more since some may be skipped
    orderBy: { createdAt: "asc" },
  });

  console.log(`[Retry Batch] Found ${failedRemovals.length} failed removals, checking broker limits...`);

  let processedCount = 0;

  for (const removal of failedRemovals) {
    // Stop if we've processed enough
    if (processedCount >= limit) break;

    const source = removal.exposure.source;

    // Skip non-removable sources
    const brokerInfo = getDataBrokerInfo(source);
    if (isNonRemovableSource(source, brokerInfo)) {
      continue;
    }

    // Skip if no URL to extract email from and no broker info
    if (!removal.exposure.sourceUrl && !brokerInfo?.privacyEmail) {
      continue;
    }

    // Check per-broker daily limit
    const todayCount = (brokerCounts.get(source) || 0) + (batchBrokerCounts.get(source) || 0);
    if (todayCount >= MAX_REQUESTS_PER_BROKER_PER_DAY) {
      console.log(`[Retry Batch] Skipping ${source} - already at daily limit (${todayCount}/${MAX_REQUESTS_PER_BROKER_PER_DAY})`);
      stats.skippedDueToLimit++;
      continue;
    }

    stats.processed++;
    processedCount++;
    const result = await retryFailedRemoval(removal.id, { skipUserNotification: true });

    if (result.success) {
      stats.retried++;

      // Track broker count for this batch
      batchBrokerCounts.set(source, (batchBrokerCounts.get(source) || 0) + 1);

      // Collect update for digest email
      if (result.updateInfo?.userEmail) {
        const { userId, userEmail, userName } = result.updateInfo;
        if (!userUpdates.has(userId)) {
          userUpdates.set(userId, {
            email: userEmail,
            name: userName,
            submitted: [],
          });
        }
        userUpdates.get(userId)!.submitted.push({
          sourceName: result.updateInfo.sourceName,
          source: result.updateInfo.source,
          dataType: result.updateInfo.dataType,
        });
      }
    } else {
      stats.stillFailed++;
    }

    // Delay between retries
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // Send ONE digest email per user with all their retried removals
  console.log(`[Retry Batch] Sending digest emails to ${userUpdates.size} users`);
  for (const [userId, userData] of userUpdates) {
    if (userData.submitted.length > 0) {
      try {
        await sendRemovalStatusDigestEmail(userData.email, userData.name, {
          completed: [],
          inProgress: [],
          submitted: userData.submitted.map(s => ({
            ...s,
            status: "SUBMITTED" as const,
          })),
          failed: [],
        });
        stats.emailsSent++;
        console.log(`[Retry Batch] Sent digest to ${userData.email}: ${userData.submitted.length} retried`);
      } catch (error) {
        console.error(`[Retry Batch] Failed to send digest to ${userData.email}:`, error);
      }
    }
  }

  console.log(`[Retry Batch] Complete: ${stats.retried} retried, ${stats.stillFailed} still failed, ${stats.skippedDueToLimit} skipped (broker limit), ${stats.emailsSent} emails`);
  return stats;
}

/**
 * Get statistics on automation effectiveness
 */
export async function getAutomationStats(): Promise<{
  totalRemovals: number;
  automated: number;
  manual: number;
  pending: number;
  automationRate: number;
  byStatus: Record<string, number>;
  bySource: Array<{ source: string; count: number; automated: number }>;
}> {
  const [totalCount, byStatus, topSources] = await Promise.all([
    prisma.removalRequest.count(),
    prisma.removalRequest.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.removalRequest.groupBy({
      by: ["status"],
      _count: { id: true },
      where: {
        exposure: {
          source: {
            in: [
              "SPOKEO", "WHITEPAGES", "BEENVERIFIED", "TRUEPEOPLESEARCH",
              "RADARIS", "INTELIUS", "FASTPEOPLESEARCH", "PEOPLEFINDER",
            ],
          },
        },
      },
    }),
  ]);

  const byStatusMap: Record<string, number> = {};
  for (const row of byStatus) {
    byStatusMap[row.status] = row._count.id;
  }

  const automated = (byStatusMap["SUBMITTED"] || 0) + (byStatusMap["COMPLETED"] || 0);
  const manual = byStatusMap["REQUIRES_MANUAL"] || 0;
  const pending = byStatusMap["PENDING"] || 0;

  return {
    totalRemovals: totalCount,
    automated,
    manual,
    pending,
    automationRate: totalCount > 0 ? Math.round((automated / totalCount) * 100) : 0,
    byStatus: byStatusMap,
    bySource: [], // Would need additional query to populate
  };
}
