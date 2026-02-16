// Corporate Invite Service — invite management for corporate accounts

import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

const INVITATION_EXPIRY_DAYS = 14; // Longer than family's 7 days for enterprise procurement

// ==========================================
// INVITE CREATION
// ==========================================

export async function createCorporateInvite(
  corporateAccountId: string,
  email: string,
  invitedById: string
): Promise<{ success: boolean; invite?: { id: string; token: string; expiresAt: Date }; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  // Get account and check capacity
  const account = await prisma.corporateAccount.findUnique({
    where: { id: corporateAccountId },
    include: {
      seats: { where: { status: { in: ["ACTIVE", "INVITED"] } } },
      invitations: { where: { status: "PENDING" } },
    },
  });

  if (!account) {
    return { success: false, error: "Corporate account not found" };
  }

  if (account.adminUserId !== invitedById) {
    return { success: false, error: "Only the corporate admin can send invitations" };
  }

  if (account.status !== "ACTIVE") {
    return { success: false, error: "Corporate account is not active" };
  }

  // Check available seats
  const activeSeats = account.seats.filter((s) => s.userId !== null).length;
  if (activeSeats >= account.maxSeats) {
    return { success: false, error: "All seats are occupied" };
  }

  // Check for duplicate pending invite
  const existingInvite = account.invitations.find(
    (inv) => inv.email.toLowerCase() === normalizedEmail
  );
  if (existingInvite) {
    return { success: false, error: "An invitation is already pending for this email" };
  }

  // Check if email is already a seat holder
  const existingSeat = await prisma.corporateSeat.findFirst({
    where: {
      corporateAccountId,
      user: { email: normalizedEmail },
      status: "ACTIVE",
    },
  });
  if (existingSeat) {
    return { success: false, error: "This user already has an active seat" };
  }

  // Generate token and create invite
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

  const invite = await prisma.corporateInvite.create({
    data: {
      corporateAccountId,
      email: normalizedEmail,
      token,
      status: "PENDING",
      expiresAt,
    },
  });

  return {
    success: true,
    invite: { id: invite.id, token: invite.token, expiresAt: invite.expiresAt },
  };
}

// ==========================================
// INVITE ACCEPTANCE
// ==========================================

export async function acceptCorporateInvite(
  token: string,
  userId: string
): Promise<{ success: boolean; companyName?: string; error?: string }> {
  return await prisma.$transaction(async (tx) => {
    const invite = await tx.corporateInvite.findUnique({
      where: { token },
      include: {
        corporateAccount: {
          include: { seats: true },
        },
      },
    });

    if (!invite) {
      return { success: false, error: "Invalid invitation" };
    }

    if (invite.status !== "PENDING") {
      return { success: false, error: "This invitation is no longer valid" };
    }

    if (invite.expiresAt < new Date()) {
      await tx.corporateInvite.update({
        where: { id: invite.id },
        data: { status: "EXPIRED" },
      });
      return { success: false, error: "This invitation has expired" };
    }

    // Verify email matches
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      return { success: false, error: "This invitation was sent to a different email address" };
    }

    // Check if user already has a corporate seat
    const existingSeat = await tx.corporateSeat.findUnique({ where: { userId } });
    if (existingSeat) {
      return { success: false, error: "You already have a corporate seat" };
    }

    // Find an unassigned seat
    const availableSeat = invite.corporateAccount.seats.find(
      (s) => s.userId === null && s.status === "INVITED"
    );

    if (!availableSeat) {
      return { success: false, error: "No available seats" };
    }

    // Assign seat to user
    await tx.corporateSeat.update({
      where: { id: availableSeat.id },
      data: {
        userId,
        status: "ACTIVE",
        onboardedAt: new Date(),
      },
    });

    // Mark invite as accepted
    await tx.corporateInvite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED" },
    });

    // Update user plan to ENTERPRISE
    await tx.user.update({
      where: { id: userId },
      data: { plan: "ENTERPRISE" },
    });

    return { success: true, companyName: invite.corporateAccount.name };
  });
}

// ==========================================
// INVITE QUERIES
// ==========================================

export async function getInviteByToken(token: string) {
  const invite = await prisma.corporateInvite.findUnique({
    where: { token },
    include: {
      corporateAccount: {
        select: { name: true, tier: true, adminUserId: true },
        include: {
          adminUser: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!invite) return null;

  return {
    id: invite.id,
    email: invite.email,
    status: invite.status,
    expiresAt: invite.expiresAt,
    isExpired: invite.expiresAt < new Date(),
    companyName: invite.corporateAccount.name,
    tier: invite.corporateAccount.tier,
    adminName: invite.corporateAccount.adminUser.name,
    adminEmail: invite.corporateAccount.adminUser.email,
  };
}

export async function cancelCorporateInvite(
  inviteId: string,
  corporateAccountId: string
): Promise<{ success: boolean; error?: string }> {
  const invite = await prisma.corporateInvite.findFirst({
    where: { id: inviteId, corporateAccountId, status: "PENDING" },
  });

  if (!invite) {
    return { success: false, error: "Pending invite not found" };
  }

  await prisma.corporateInvite.update({
    where: { id: inviteId },
    data: { status: "EXPIRED" },
  });

  return { success: true };
}

export async function resendCorporateInvite(
  inviteId: string,
  corporateAccountId: string
): Promise<{ success: boolean; token?: string; expiresAt?: Date; error?: string }> {
  const invite = await prisma.corporateInvite.findFirst({
    where: { id: inviteId, corporateAccountId },
  });

  if (!invite) {
    return { success: false, error: "Invite not found" };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

  await prisma.corporateInvite.update({
    where: { id: inviteId },
    data: { token, expiresAt, status: "PENDING" },
  });

  return { success: true, token, expiresAt };
}
