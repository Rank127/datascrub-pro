// Get Family Plan Resolution
// Utility for checking if user has Enterprise access through family membership

import { prisma } from "@/lib/db";

export interface FamilyPlanInfo {
  hasEnterprise: boolean;
  throughFamily: boolean;
  familyOwnerName?: string | null;
  familyOwnerEmail?: string;
}

/**
 * Check if a user has Enterprise access, either directly or through family
 * Returns info about how they have access
 */
export async function getFamilyPlanInfo(userId: string): Promise<FamilyPlanInfo> {
  // Get user's own plan
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) {
    return { hasEnterprise: false, throughFamily: false };
  }

  const ownPlan = user.subscription?.plan || user.plan;

  // If user has Enterprise directly, return that
  if (ownPlan === "ENTERPRISE") {
    return { hasEnterprise: true, throughFamily: false };
  }

  // Check family membership
  const membership = await prisma.familyMember.findUnique({
    where: { userId },
    include: {
      familyGroup: {
        include: {
          owner: {
            include: { subscription: true },
          },
        },
      },
    },
  });

  if (!membership) {
    return { hasEnterprise: false, throughFamily: false };
  }

  // If this user IS the owner, they don't get it "through family"
  if (membership.familyGroup.ownerId === userId) {
    return { hasEnterprise: false, throughFamily: false };
  }

  const ownerPlan =
    membership.familyGroup.owner.subscription?.plan ||
    membership.familyGroup.owner.plan;

  if (ownerPlan === "ENTERPRISE") {
    return {
      hasEnterprise: true,
      throughFamily: true,
      familyOwnerName: membership.familyGroup.owner.name,
      familyOwnerEmail: membership.familyGroup.owner.email,
    };
  }

  return { hasEnterprise: false, throughFamily: false };
}

/**
 * Get the effective plan for a user (checks own plan + family membership)
 * Simple string return for plan-checking logic
 */
export async function getEffectivePlanWithFamily(userId: string): Promise<string> {
  const info = await getFamilyPlanInfo(userId);

  if (info.hasEnterprise) {
    return "ENTERPRISE";
  }

  // Get user's own plan as fallback
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  return user?.subscription?.plan || user?.plan || "FREE";
}

/**
 * Check if user is a family member (not owner) getting Enterprise through family
 */
export async function isFamilyMemberWithEnterprise(userId: string): Promise<boolean> {
  const info = await getFamilyPlanInfo(userId);
  return info.hasEnterprise && info.throughFamily;
}
