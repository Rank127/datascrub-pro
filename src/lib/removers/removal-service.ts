import { prisma } from "@/lib/db";
import { sendCCPARemovalRequest, sendRemovalUpdateEmail } from "@/lib/email";
import { getDataBrokerInfo, getOptOutInstructions } from "./data-broker-directory";
import { calculateVerifyAfterDate } from "./verification-service";
import type { RemovalMethod } from "@/lib/types";

interface RemovalExecutionResult {
  success: boolean;
  method: RemovalMethod;
  message: string;
  instructions?: string;
}

// Execute a removal request
export async function executeRemoval(
  removalRequestId: string,
  userId: string
): Promise<RemovalExecutionResult> {
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

  // Get data broker info
  const brokerInfo = getDataBrokerInfo(source);

  if (!brokerInfo) {
    // Unknown source - provide manual instructions
    return {
      success: true,
      method: "MANUAL_GUIDE",
      message: "Please contact the source directly to request data removal.",
      instructions: getOptOutInstructions(source),
    };
  }

  // Determine execution method based on broker and available info
  const method = removalRequest.method as RemovalMethod;

  try {
    switch (method) {
      case "AUTO_EMAIL": {
        // Send CCPA/GDPR removal request email
        if (brokerInfo.privacyEmail) {
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

            // Send notification to user
            await sendRemovalUpdateEmail(userEmail, userName, {
              sourceName: brokerInfo.name,
              status: "SUBMITTED",
              dataType: formatDataType(dataType),
            });

            return {
              success: true,
              method: "AUTO_EMAIL",
              message: `CCPA/GDPR removal request sent to ${brokerInfo.name}`,
            };
          }
        }

        // Fall back to manual if email fails
        return {
          success: true,
          method: "MANUAL_GUIDE",
          message: `Could not send automated email. Please use the manual opt-out process.`,
          instructions: getOptOutInstructions(source),
        };
      }

      case "AUTO_FORM": {
        // For form-based removals, we provide the URL and instructions
        // (Actual form automation would require browser automation/puppeteer)
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
        return {
          success: false,
          method: "MANUAL_GUIDE",
          message: "Unknown removal method",
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
      method,
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
  // Get current request to determine source for verification scheduling
  const currentRequest = await prisma.removalRequest.findUnique({
    where: { id: requestId },
    include: { exposure: { select: { source: true } } },
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
export async function markRemovalCompleted(
  removalRequestId: string,
  userId: string
): Promise<boolean> {
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
    return false;
  }

  await prisma.$transaction([
    prisma.removalRequest.update({
      where: { id: removalRequestId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    }),
    prisma.exposure.update({
      where: { id: request.exposureId },
      data: { status: "REMOVED" },
    }),
    prisma.alert.create({
      data: {
        userId,
        type: "REMOVAL_COMPLETED",
        title: "Data Removed Successfully",
        message: `Your data has been removed from ${request.exposure.sourceName}.`,
      },
    }),
  ]);

  // Send completion email
  if (request.user.email) {
    sendRemovalUpdateEmail(request.user.email, request.user.name || "", {
      sourceName: request.exposure.sourceName,
      status: "COMPLETED",
      dataType: formatDataType(request.exposure.dataType),
    }).catch(console.error);
  }

  return true;
}
