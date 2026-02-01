/**
 * Family Plan QR Code Invitation System
 *
 * Generates QR codes for Enterprise plan owners to share with family members.
 * Only owners can generate invitations - family members cannot invite others.
 */

import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { FamilyRole } from "./types";

const INVITATION_EXPIRY_DAYS = 7;
const QR_INVITE_PREFIX = "qr_"; // Prefix to identify QR-generated invites

export interface QRInviteResult {
  success: boolean;
  error?: string;
  qrCode?: string; // Base64 data URL
  inviteUrl?: string;
  token?: string;
  expiresAt?: Date;
}

export interface QRInviteOptions {
  size?: number; // QR code size in pixels (default: 300)
  margin?: number; // Margin around QR code (default: 2)
  dark?: string; // Dark color (default: #000000)
  light?: string; // Light color (default: #ffffff)
}

/**
 * Check if user is allowed to create family invitations
 * Only the family group OWNER can invite new members
 */
export async function canCreateInvitation(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  familyGroupId?: string;
  spotsRemaining?: number;
}> {
  // Check if user owns a family group
  const familyGroup = await prisma.familyGroup.findUnique({
    where: { ownerId: userId },
    include: {
      members: true,
      invitations: {
        where: { status: "PENDING" },
      },
      owner: {
        include: { subscription: true },
      },
    },
  });

  if (!familyGroup) {
    // Check if user is a family MEMBER (not owner)
    const membership = await prisma.familyMember.findUnique({
      where: { userId },
    });

    if (membership) {
      return {
        allowed: false,
        reason: "Only the family plan owner can invite new members. Contact your family plan owner to add members.",
      };
    }

    return {
      allowed: false,
      reason: "You need an Enterprise plan to create a family group and invite members.",
    };
  }

  // Verify owner has Enterprise plan
  const ownerPlan = familyGroup.owner.subscription?.plan || familyGroup.owner.plan;
  if (ownerPlan !== "ENTERPRISE") {
    return {
      allowed: false,
      reason: "Family invitations require an active Enterprise plan.",
    };
  }

  // Check available spots
  const currentMembers = familyGroup.members.length;
  const pendingInvites = familyGroup.invitations.length;
  const spotsUsed = currentMembers + pendingInvites;
  const spotsRemaining = familyGroup.maxMembers - spotsUsed;

  if (spotsRemaining <= 0) {
    return {
      allowed: false,
      reason: `Your family plan is full (${familyGroup.maxMembers} members). Remove a member or cancel a pending invitation to add more.`,
      familyGroupId: familyGroup.id,
      spotsRemaining: 0,
    };
  }

  return {
    allowed: true,
    familyGroupId: familyGroup.id,
    spotsRemaining,
  };
}

/**
 * Generate a QR code invitation for family members
 * Creates a unique token that can be used once to join the family
 */
export async function generateQRInvite(
  ownerId: string,
  options: QRInviteOptions = {}
): Promise<QRInviteResult> {
  // Verify permission
  const permission = await canCreateInvitation(ownerId);
  if (!permission.allowed) {
    return {
      success: false,
      error: permission.reason,
    };
  }

  const familyGroupId = permission.familyGroupId!;

  // Generate unique token with QR prefix
  const token = QR_INVITE_PREFIX + randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

  // Create the invitation record
  // Using a placeholder email that will be updated when someone accepts
  const placeholderEmail = `pending_qr_${Date.now()}@invite.local`;

  await prisma.familyInvitation.create({
    data: {
      familyGroupId,
      email: placeholderEmail, // Will be replaced on acceptance
      token,
      invitedById: ownerId,
      expiresAt,
      status: "PENDING",
    },
  });

  // Generate invite URL
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://ghostmydata.com";
  const inviteUrl = `${baseUrl}/family/join?token=${token}`;

  // Generate QR code as base64 data URL
  const qrOptions = {
    width: options.size || 300,
    margin: options.margin || 2,
    color: {
      dark: options.dark || "#000000",
      light: options.light || "#ffffff",
    },
  };

  try {
    const qrCode = await QRCode.toDataURL(inviteUrl, qrOptions);

    return {
      success: true,
      qrCode,
      inviteUrl,
      token,
      expiresAt,
    };
  } catch (error) {
    console.error("[QR Invite] Failed to generate QR code:", error);
    return {
      success: false,
      error: "Failed to generate QR code. Please try again.",
    };
  }
}

/**
 * Accept a QR code invitation
 * Updates the placeholder email with the actual user's email
 */
export async function acceptQRInvite(
  token: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  // Get the invitation
  const invitation = await prisma.familyInvitation.findUnique({
    where: { token },
    include: {
      familyGroup: {
        include: { members: true },
      },
    },
  });

  if (!invitation) {
    return { success: false, error: "Invalid invitation link." };
  }

  if (invitation.status !== "PENDING") {
    return { success: false, error: "This invitation has already been used or cancelled." };
  }

  if (invitation.expiresAt < new Date()) {
    await prisma.familyInvitation.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
    });
    return { success: false, error: "This invitation has expired. Please request a new one from the family owner." };
  }

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) {
    return { success: false, error: "User not found." };
  }

  // Check if user is already in a family
  const existingMembership = await prisma.familyMember.findUnique({
    where: { userId },
  });

  if (existingMembership) {
    return { success: false, error: "You are already a member of a family group." };
  }

  // Check if family is full
  if (invitation.familyGroup.members.length >= invitation.familyGroup.maxMembers) {
    return { success: false, error: "This family group is full." };
  }

  // Accept invitation and create membership
  await prisma.$transaction([
    // Update invitation with actual email and mark as accepted
    prisma.familyInvitation.update({
      where: { id: invitation.id },
      data: {
        email: user.email.toLowerCase(),
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
    }),
    // Create family membership
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
 * Get all active QR invitations for a family owner
 */
export async function getActiveQRInvites(ownerId: string): Promise<{
  invitations: Array<{
    id: string;
    token: string;
    createdAt: Date;
    expiresAt: Date;
    isQRInvite: boolean;
  }>;
  spotsRemaining: number;
}> {
  const familyGroup = await prisma.familyGroup.findUnique({
    where: { ownerId },
    include: {
      members: true,
      invitations: {
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!familyGroup) {
    return { invitations: [], spotsRemaining: 0 };
  }

  const invitations = familyGroup.invitations.map((inv) => ({
    id: inv.id,
    token: inv.token,
    createdAt: inv.createdAt,
    expiresAt: inv.expiresAt,
    isQRInvite: inv.token.startsWith(QR_INVITE_PREFIX),
  }));

  const spotsUsed = familyGroup.members.length + familyGroup.invitations.length;
  const spotsRemaining = familyGroup.maxMembers - spotsUsed;

  return { invitations, spotsRemaining };
}

/**
 * Regenerate QR code for an existing invitation
 */
export async function regenerateQRCode(
  invitationId: string,
  ownerId: string,
  options: QRInviteOptions = {}
): Promise<QRInviteResult> {
  // Get invitation and verify ownership
  const invitation = await prisma.familyInvitation.findUnique({
    where: { id: invitationId },
    include: {
      familyGroup: true,
    },
  });

  if (!invitation) {
    return { success: false, error: "Invitation not found." };
  }

  if (invitation.familyGroup.ownerId !== ownerId) {
    return { success: false, error: "Only the family owner can regenerate invitation QR codes." };
  }

  if (invitation.status !== "PENDING") {
    return { success: false, error: "This invitation is no longer active." };
  }

  // Generate invite URL
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://ghostmydata.com";
  const inviteUrl = `${baseUrl}/family/join?token=${invitation.token}`;

  // Generate QR code
  const qrOptions = {
    width: options.size || 300,
    margin: options.margin || 2,
    color: {
      dark: options.dark || "#000000",
      light: options.light || "#ffffff",
    },
  };

  try {
    const qrCode = await QRCode.toDataURL(inviteUrl, qrOptions);

    return {
      success: true,
      qrCode,
      inviteUrl,
      token: invitation.token,
      expiresAt: invitation.expiresAt,
    };
  } catch (error) {
    console.error("[QR Invite] Failed to regenerate QR code:", error);
    return {
      success: false,
      error: "Failed to generate QR code. Please try again.",
    };
  }
}
