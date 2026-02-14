// Family Plan Service
// Core logic for managing family groups, invitations, and members

import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import {
  FamilyRole,
  InvitationStatus,
  FamilyGroupInfo,
  FamilyMemberInfo,
  FamilyMembershipInfo,
  FamilyInvitationInfo,
  InvitationDetails,
} from "./types";

const INVITATION_EXPIRY_DAYS = 7;

// ==========================================
// FAMILY GROUP MANAGEMENT
// ==========================================

/**
 * Get or create a family group for an Enterprise user
 */
export async function getOrCreateFamilyGroup(
  ownerId: string
): Promise<FamilyGroupInfo> {
  // Check if user already has a family group
  let familyGroup = await prisma.familyGroup.findUnique({
    where: { ownerId },
    include: {
      owner: {
        select: { id: true, name: true, email: true, lastScanAt: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, lastScanAt: true },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      invitations: {
        where: { status: InvitationStatus.PENDING },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Create if doesn't exist — use transaction to prevent orphaned groups
  if (!familyGroup) {
    familyGroup = await prisma.$transaction(async (tx) => {
      const group = await tx.familyGroup.create({
        data: {
          ownerId,
          maxMembers: 5,
        },
      });

      // Add owner as first member (atomic with group creation)
      await tx.familyMember.create({
        data: {
          familyGroupId: group.id,
          userId: ownerId,
          role: FamilyRole.OWNER,
        },
      });

      // Return fully populated group
      return tx.familyGroup.findUnique({
        where: { id: group.id },
        include: {
          owner: {
            select: { id: true, name: true, email: true, lastScanAt: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, lastScanAt: true },
              },
            },
            orderBy: { joinedAt: "asc" },
          },
          invitations: {
            where: { status: InvitationStatus.PENDING },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    });
  }

  return formatFamilyGroupInfo(familyGroup!);
}

/**
 * Get family group info for a user (either as owner or member)
 */
export async function getFamilyGroupForUser(
  userId: string
): Promise<FamilyGroupInfo | null> {
  // Check if owner
  const ownedGroup = await prisma.familyGroup.findUnique({
    where: { ownerId: userId },
    include: {
      owner: {
        select: { id: true, name: true, email: true, lastScanAt: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, lastScanAt: true },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      invitations: {
        where: { status: InvitationStatus.PENDING },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (ownedGroup) {
    return formatFamilyGroupInfo(ownedGroup);
  }

  // Check if member
  const membership = await prisma.familyMember.findUnique({
    where: { userId },
    include: {
      familyGroup: {
        include: {
          owner: {
            select: { id: true, name: true, email: true, lastScanAt: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, lastScanAt: true },
              },
            },
            orderBy: { joinedAt: "asc" },
          },
          invitations: {
            where: { status: InvitationStatus.PENDING },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (membership) {
    return formatFamilyGroupInfo(membership.familyGroup);
  }

  return null;
}

/**
 * Get family membership info for a non-owner member
 */
export async function getFamilyMembership(
  userId: string
): Promise<FamilyMembershipInfo | null> {
  const membership = await prisma.familyMember.findUnique({
    where: { userId },
    include: {
      familyGroup: {
        include: {
          owner: {
            select: { name: true, email: true },
          },
          _count: {
            select: { members: true },
          },
        },
      },
    },
  });

  if (!membership || membership.role === FamilyRole.OWNER) {
    return null;
  }

  return {
    familyGroupId: membership.familyGroupId,
    familyName: membership.familyGroup.name,
    ownerName: membership.familyGroup.owner.name,
    ownerEmail: membership.familyGroup.owner.email,
    role: membership.role as FamilyRole,
    joinedAt: membership.joinedAt,
    memberCount: membership.familyGroup._count.members,
  };
}

// ==========================================
// INVITATION MANAGEMENT
// ==========================================

/**
 * Create a new invitation to join the family group
 */
export async function createInvitation(
  familyGroupId: string,
  email: string,
  invitedById: string
): Promise<{ success: boolean; invitation?: FamilyInvitationInfo; error?: string }> {
  // Get family group
  const familyGroup = await prisma.familyGroup.findUnique({
    where: { id: familyGroupId },
    include: {
      members: true,
      invitations: {
        where: { status: InvitationStatus.PENDING },
      },
    },
  });

  if (!familyGroup) {
    return { success: false, error: "Family group not found" };
  }

  // Check if user is the owner
  if (familyGroup.ownerId !== invitedById) {
    return { success: false, error: "Only the family owner can send invitations" };
  }

  // Check member limit
  const currentCount = familyGroup.members.length;
  const pendingCount = familyGroup.invitations.length;
  if (currentCount + pendingCount >= familyGroup.maxMembers) {
    return { success: false, error: "Family group has reached its member limit" };
  }

  // Check if email is already a member
  const existingMember = await prisma.familyMember.findFirst({
    where: {
      familyGroupId,
      user: { email: email.toLowerCase() },
    },
  });

  if (existingMember) {
    return { success: false, error: "This email is already a family member" };
  }

  // Check for existing pending invitation
  const existingInvitation = await prisma.familyInvitation.findUnique({
    where: {
      familyGroupId_email: {
        familyGroupId,
        email: email.toLowerCase(),
      },
    },
  });

  if (existingInvitation && existingInvitation.status === InvitationStatus.PENDING) {
    // Check if expired
    if (existingInvitation.expiresAt > new Date()) {
      return { success: false, error: "An invitation is already pending for this email" };
    }
    // Expire old invitation
    await prisma.familyInvitation.update({
      where: { id: existingInvitation.id },
      data: { status: InvitationStatus.EXPIRED },
    });
  }

  // Generate unique token
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

  // Create invitation
  const invitation = await prisma.familyInvitation.create({
    data: {
      familyGroupId,
      email: email.toLowerCase(),
      token,
      invitedById,
      expiresAt,
      status: InvitationStatus.PENDING,
    },
  });

  return {
    success: true,
    invitation: {
      id: invitation.id,
      email: invitation.email,
      status: invitation.status as InvitationStatus,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
    },
  };
}

/**
 * Get invitation details by token
 */
export async function getInvitationByToken(
  token: string
): Promise<InvitationDetails | null> {
  const invitation = await prisma.familyInvitation.findUnique({
    where: { token },
    include: {
      familyGroup: {
        include: {
          owner: {
            select: { name: true, email: true },
          },
        },
      },
    },
  });

  if (!invitation) {
    return null;
  }

  const isExpired = invitation.expiresAt < new Date();

  return {
    id: invitation.id,
    email: invitation.email,
    status: invitation.status as InvitationStatus,
    expiresAt: invitation.expiresAt,
    isExpired,
    familyOwnerName: invitation.familyGroup.owner.name,
    familyOwnerEmail: invitation.familyGroup.owner.email,
    familyName: invitation.familyGroup.name,
  };
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(
  token: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  // Get invitation
  const invitation = await prisma.familyInvitation.findUnique({
    where: { token },
    include: {
      familyGroup: {
        include: { members: true },
      },
    },
  });

  if (!invitation) {
    return { success: false, error: "Invitation not found" };
  }

  if (invitation.status !== InvitationStatus.PENDING) {
    return { success: false, error: "This invitation is no longer valid" };
  }

  if (invitation.expiresAt < new Date()) {
    await prisma.familyInvitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.EXPIRED },
    });
    return { success: false, error: "This invitation has expired" };
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  // Verify email matches
  if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return { success: false, error: "This invitation was sent to a different email address" };
  }

  // Check if already a member of any family
  const existingMembership = await prisma.familyMember.findUnique({
    where: { userId },
  });

  if (existingMembership) {
    return { success: false, error: "You are already a member of a family group" };
  }

  // Check if family group is full
  if (invitation.familyGroup.members.length >= invitation.familyGroup.maxMembers) {
    return { success: false, error: "This family group is full" };
  }

  // Accept invitation and create membership in a transaction
  await prisma.$transaction([
    prisma.familyInvitation.update({
      where: { id: invitation.id },
      data: {
        status: InvitationStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
    }),
    prisma.familyMember.create({
      data: {
        familyGroupId: invitation.familyGroupId,
        userId,
        role: FamilyRole.MEMBER,
      },
    }),
  ]);

  return { success: true };
}

/**
 * Cancel a pending invitation
 */
export async function cancelInvitation(
  invitationId: string,
  requesterId: string
): Promise<{ success: boolean; error?: string }> {
  const invitation = await prisma.familyInvitation.findUnique({
    where: { id: invitationId },
    include: {
      familyGroup: true,
    },
  });

  if (!invitation) {
    return { success: false, error: "Invitation not found" };
  }

  if (invitation.familyGroup.ownerId !== requesterId) {
    return { success: false, error: "Only the family owner can cancel invitations" };
  }

  if (invitation.status !== InvitationStatus.PENDING) {
    return { success: false, error: "This invitation is no longer pending" };
  }

  await prisma.familyInvitation.update({
    where: { id: invitationId },
    data: { status: InvitationStatus.CANCELLED },
  });

  return { success: true };
}

/**
 * Resend an invitation (creates new token and extends expiry)
 */
export async function resendInvitation(
  invitationId: string,
  requesterId: string
): Promise<{ success: boolean; invitation?: FamilyInvitationInfo; error?: string }> {
  const invitation = await prisma.familyInvitation.findUnique({
    where: { id: invitationId },
    include: {
      familyGroup: true,
    },
  });

  if (!invitation) {
    return { success: false, error: "Invitation not found" };
  }

  if (invitation.familyGroup.ownerId !== requesterId) {
    return { success: false, error: "Only the family owner can resend invitations" };
  }

  // Generate new token and extend expiry
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

  const updated = await prisma.familyInvitation.update({
    where: { id: invitationId },
    data: {
      token,
      expiresAt,
      status: InvitationStatus.PENDING,
    },
  });

  return {
    success: true,
    invitation: {
      id: updated.id,
      email: updated.email,
      status: updated.status as InvitationStatus,
      createdAt: updated.createdAt,
      expiresAt: updated.expiresAt,
    },
  };
}

// ==========================================
// MEMBER MANAGEMENT
// ==========================================

/**
 * Remove a member from the family group (owner only)
 */
export async function removeMember(
  memberId: string,
  requesterId: string
): Promise<{ success: boolean; error?: string }> {
  const member = await prisma.familyMember.findUnique({
    where: { id: memberId },
    include: {
      familyGroup: true,
      user: { select: { id: true, email: true } },
    },
  });

  if (!member) {
    return { success: false, error: "Member not found" };
  }

  if (member.familyGroup.ownerId !== requesterId) {
    return { success: false, error: "Only the family owner can remove members" };
  }

  if (member.role === FamilyRole.OWNER) {
    return { success: false, error: "Cannot remove the family owner" };
  }

  await prisma.familyMember.delete({
    where: { id: memberId },
  });

  return { success: true };
}

/**
 * Leave a family group (member voluntarily leaves)
 */
export async function leaveFamily(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const member = await prisma.familyMember.findUnique({
    where: { userId },
    include: {
      familyGroup: true,
    },
  });

  if (!member) {
    return { success: false, error: "You are not a member of any family group" };
  }

  if (member.role === FamilyRole.OWNER) {
    return { success: false, error: "The family owner cannot leave. Transfer ownership or delete the family group instead." };
  }

  await prisma.familyMember.delete({
    where: { userId },
  });

  return { success: true };
}

// ==========================================
// PLAN CHECKING
// ==========================================

/**
 * Check if a user has Enterprise access through family membership
 */
export async function hasEnterpriseThroughFamily(userId: string): Promise<boolean> {
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
    return false;
  }

  const ownerPlan =
    membership.familyGroup.owner.subscription?.plan ||
    membership.familyGroup.owner.plan;

  return ownerPlan === "ENTERPRISE";
}

/**
 * Get effective plan for a user (checks own plan + family membership)
 */
export async function getEffectivePlan(userId: string): Promise<string> {
  const details = await getEffectivePlanDetails(userId);
  return details.plan;
}

// Re-export types
export type { PlanSource, PlanDetails } from "./types";
import type { PlanDetails } from "./types";

/**
 * Get detailed plan information including source (direct subscription vs family)
 */
export async function getEffectivePlanDetails(userId: string): Promise<PlanDetails> {
  // Get user's own plan and subscription
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) {
    return {
      plan: "FREE",
      source: "DEFAULT",
      isOwner: false,
    };
  }

  const ownPlan = user.subscription?.plan || user.plan;

  // If user has their own Enterprise subscription, they're the owner
  if (ownPlan === "ENTERPRISE") {
    // Check if they own a family group with member and invitation counts
    const familyGroup = await prisma.familyGroup.findUnique({
      where: { ownerId: userId },
      include: {
        _count: { select: { members: true } },
        invitations: {
          where: { status: "PENDING" },
          select: { id: true },
        },
      },
    });

    const memberCount = familyGroup?._count.members || 0;
    const pendingInvitations = familyGroup?.invitations.length || 0;
    const maxMembers = familyGroup?.maxMembers || 5;
    const spotsRemaining = Math.max(0, maxMembers - memberCount - pendingInvitations);

    return {
      plan: "ENTERPRISE",
      source: "DIRECT",
      isOwner: true,
      familyInfo: familyGroup ? {
        familyGroupId: familyGroup.id,
        familyName: familyGroup.name,
        ownerName: user.name,
        ownerEmail: user.email,
        role: "OWNER",
        memberCount,
        pendingInvitations,
        maxMembers,
        spotsRemaining,
      } : undefined,
      subscriptionInfo: user.subscription ? {
        status: user.subscription.status,
        stripeSubscriptionId: user.subscription.stripeSubscriptionId,
        currentPeriodEnd: user.subscription.stripeCurrentPeriodEnd,
      } : undefined,
    };
  }

  // Check family membership for inherited Enterprise access
  const membership = await prisma.familyMember.findUnique({
    where: { userId },
    include: {
      familyGroup: {
        include: {
          owner: {
            include: { subscription: true },
          },
          _count: { select: { members: true } },
          invitations: {
            where: { status: "PENDING" },
            select: { id: true },
          },
        },
      },
    },
  });

  if (membership) {
    const ownerPlan =
      membership.familyGroup.owner.subscription?.plan ||
      membership.familyGroup.owner.plan;

    if (ownerPlan === "ENTERPRISE") {
      const memberCount = membership.familyGroup._count.members;
      const pendingInvitations = membership.familyGroup.invitations.length;
      const maxMembers = membership.familyGroup.maxMembers;
      const spotsRemaining = Math.max(0, maxMembers - memberCount - pendingInvitations);

      return {
        plan: "ENTERPRISE",
        source: "FAMILY",
        isOwner: false,
        familyInfo: {
          familyGroupId: membership.familyGroup.id,
          familyName: membership.familyGroup.name,
          ownerName: membership.familyGroup.owner.name,
          ownerEmail: membership.familyGroup.owner.email,
          role: membership.role,
          memberCount,
          pendingInvitations,
          maxMembers,
          spotsRemaining,
        },
        subscriptionInfo: membership.familyGroup.owner.subscription ? {
          status: membership.familyGroup.owner.subscription.status,
          stripeSubscriptionId: null, // Don't expose owner's Stripe ID to members
          currentPeriodEnd: membership.familyGroup.owner.subscription.stripeCurrentPeriodEnd,
        } : undefined,
      };
    }
  }

  // Return user's own plan (PRO or FREE)
  return {
    plan: ownPlan,
    source: ownPlan === "FREE" ? "DEFAULT" : "DIRECT",
    isOwner: true,
    subscriptionInfo: user.subscription ? {
      status: user.subscription.status,
      stripeSubscriptionId: user.subscription.stripeSubscriptionId,
      currentPeriodEnd: user.subscription.stripeCurrentPeriodEnd,
    } : undefined,
  };
}

// ==========================================
// HELPERS
// ==========================================

async function formatFamilyGroupInfo(
  familyGroup: {
    id: string;
    name: string | null;
    ownerId: string;
    maxMembers: number;
    owner: { id: string; name: string | null; email: string; lastScanAt: Date | null };
    members: Array<{
      id: string;
      userId: string;
      role: string;
      joinedAt: Date;
      user: { id: string; name: string | null; email: string; lastScanAt: Date | null };
    }>;
    invitations: Array<{
      id: string;
      email: string;
      status: string;
      createdAt: Date;
      expiresAt: Date;
    }>;
  }
): Promise<FamilyGroupInfo> {
  // Get exposure counts for all members
  const memberUserIds = familyGroup.members.map((m) => m.userId);
  const exposureCounts = await prisma.exposure.groupBy({
    by: ["userId"],
    where: {
      userId: { in: memberUserIds },
      status: "ACTIVE",
    },
    _count: true,
  });

  const exposureMap = new Map(
    exposureCounts.map((e) => [e.userId, e._count])
  );

  const members: FamilyMemberInfo[] = familyGroup.members.map((m) => ({
    id: m.id,
    userId: m.userId,
    name: m.user.name,
    email: m.user.email,
    role: m.role as FamilyRole,
    joinedAt: m.joinedAt,
    exposuresCount: exposureMap.get(m.userId) || 0,
    lastScanAt: m.user.lastScanAt,
  }));

  const pendingInvitations: FamilyInvitationInfo[] = familyGroup.invitations
    .filter((i) => i.status === InvitationStatus.PENDING)
    .map((i) => ({
      id: i.id,
      email: i.email,
      status: i.status as InvitationStatus,
      createdAt: i.createdAt,
      expiresAt: i.expiresAt,
    }));

  return {
    id: familyGroup.id,
    name: familyGroup.name,
    ownerId: familyGroup.ownerId,
    ownerName: familyGroup.owner.name,
    ownerEmail: familyGroup.owner.email,
    maxMembers: familyGroup.maxMembers,
    memberCount: members.length,
    members,
    pendingInvitations,
  };
}
