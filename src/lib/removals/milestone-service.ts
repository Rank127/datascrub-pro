import { prisma } from "@/lib/db";
import { sendFirstRemovalMilestoneEmail } from "@/lib/email";

/**
 * Check if this is the user's first completed removal.
 * If so, set the milestone timestamp, create a celebration alert,
 * send a milestone email, and track via PostHog (client-side).
 *
 * Idempotent — returns early if firstRemovalCompletedAt is already set.
 */
export async function checkAndFireFirstRemovalMilestone(
  userId: string,
  brokerName: string,
  removalRequestId: string
): Promise<void> {
  try {
    // Quick check — skip if already celebrated
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstRemovalCompletedAt: true,
        email: true,
        name: true,
        plan: true,
        emailNotifications: true,
        removalUpdates: true,
      },
    });

    if (!user || user.firstRemovalCompletedAt) {
      return; // Already celebrated or user not found
    }

    // Set milestone timestamp
    await prisma.user.update({
      where: { id: userId },
      data: { firstRemovalCompletedAt: new Date() },
    });

    // Create celebration alert
    await prisma.alert.create({
      data: {
        userId,
        type: "FIRST_REMOVAL_MILESTONE",
        title: "Your First Data Removal!",
        message: `Congratulations! Your data has been successfully removed from ${brokerName}. This is a major step in protecting your privacy.`,
        metadata: JSON.stringify({
          brokerName,
          removalRequestId,
          isFirstRemoval: true,
        }),
      },
    });

    // Send celebration email (respect user preferences)
    if (user.emailNotifications && user.removalUpdates) {
      await sendFirstRemovalMilestoneEmail(
        user.email,
        user.name || "there",
        brokerName
      );
    }

    console.log(
      `[Milestone] First removal celebrated for user ${userId} (broker: ${brokerName})`
    );
  } catch (error) {
    // Never fail the parent operation — milestone is a bonus
    console.error("[Milestone] Error firing first removal milestone:", error);
  }
}
