import { prisma } from "@/lib/db";

const DROP_PORTAL_URL = "https://deletemydata.cppa.ca.gov/";

export function getDropPortalUrl(): string {
  return DROP_PORTAL_URL;
}

export async function getDropSubmission(userId: string) {
  return prisma.dropSubmission.findUnique({
    where: { userId },
  });
}

export async function hasActiveDropSubmission(userId: string): Promise<boolean> {
  const submission = await prisma.dropSubmission.findUnique({
    where: { userId },
    select: { status: true },
  });
  return submission?.status === "SUBMITTED" || submission?.status === "CONFIRMED";
}

interface ProfileReadiness {
  hasFullName: boolean;
  hasDOB: boolean;
  hasPhone: boolean;
  hasEmail: boolean;
  isReady: boolean;
  missingFields: string[];
}

export async function getDropProfileReadiness(userId: string): Promise<ProfileReadiness> {
  const profile = await prisma.personalProfile.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  const hasFullName = Boolean(profile?.fullName?.trim());
  const hasDOB = Boolean(profile?.dateOfBirth?.trim());
  const hasPhone = Boolean(profile?.phones?.trim());
  const hasEmail = Boolean(user?.email || profile?.emails?.trim());

  const missingFields: string[] = [];
  if (!hasFullName) missingFields.push("Full Name");
  if (!hasDOB) missingFields.push("Date of Birth");
  if (!hasPhone && !hasEmail) missingFields.push("Phone or Email");

  return {
    hasFullName,
    hasDOB,
    hasPhone,
    hasEmail,
    isReady: hasFullName && hasDOB && (hasPhone || hasEmail),
    missingFields,
  };
}
