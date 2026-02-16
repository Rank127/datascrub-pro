// Corporate RBAC — Simple role model for corporate accounts

import { prisma } from "@/lib/db";

export type CorporateRole = "CORP_ADMIN" | "CORP_MEMBER";

/** Check if user is the admin of any corporate account. */
export async function isCorporateAdmin(userId: string): Promise<boolean> {
  const account = await prisma.corporateAccount.findUnique({
    where: { adminUserId: userId },
    select: { id: true },
  });
  return !!account;
}

/** Get corporate account for a user (either as admin or seat holder). */
export async function getCorporateAccountForUser(userId: string): Promise<{
  id: string;
  role: CorporateRole;
  tier: string;
  name: string;
} | null> {
  // Check admin first
  const adminAccount = await prisma.corporateAccount.findUnique({
    where: { adminUserId: userId },
    select: { id: true, tier: true, name: true },
  });
  if (adminAccount) {
    return { ...adminAccount, role: "CORP_ADMIN" };
  }

  // Check seat holder
  const seat = await prisma.corporateSeat.findUnique({
    where: { userId },
    include: {
      corporateAccount: {
        select: { id: true, tier: true, name: true },
      },
    },
  });
  if (seat) {
    return { ...seat.corporateAccount, role: "CORP_MEMBER" };
  }

  return null;
}

/** Throws 403 if user is not admin of the specified corporate account. */
export async function requireCorporateAdmin(
  userId: string,
  corporateAccountId?: string
): Promise<string> {
  const account = await prisma.corporateAccount.findUnique({
    where: corporateAccountId
      ? { id: corporateAccountId, adminUserId: userId }
      : { adminUserId: userId },
    select: { id: true },
  });

  if (!account) {
    throw new Error("Forbidden: not a corporate admin");
  }

  return account.id;
}
