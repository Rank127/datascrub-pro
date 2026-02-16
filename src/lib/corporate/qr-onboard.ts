// Corporate QR Code Onboarding — modeled after src/lib/family/qr-invite.ts

import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

const CORP_QR_PREFIX = "corp_";

export interface CorporateQRResult {
  success: boolean;
  error?: string;
  qrCode?: string; // Base64 data URL
  inviteUrl?: string;
  token?: string;
  seatId?: string;
}

export interface CorporateQROptions {
  size?: number;
  margin?: number;
  dark?: string;
  light?: string;
}

/**
 * Generate a QR code for a specific unassigned corporate seat.
 */
export async function generateCorporateQR(
  corporateAccountId: string,
  seatId: string,
  options: CorporateQROptions = {}
): Promise<CorporateQRResult> {
  const seat = await prisma.corporateSeat.findFirst({
    where: {
      id: seatId,
      corporateAccountId,
      userId: null,
      status: "INVITED",
    },
  });

  if (!seat) {
    return { success: false, error: "Seat not found or already assigned" };
  }

  const token = CORP_QR_PREFIX + randomBytes(32).toString("hex");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ghostmydata.com";
  const inviteUrl = `${baseUrl}/corporate/join?token=${token}`;

  // Store token on the seat's qrCode field
  await prisma.corporateSeat.update({
    where: { id: seatId },
    data: { qrCode: token },
  });

  try {
    const qrCode = await QRCode.toDataURL(inviteUrl, {
      width: options.size || 300,
      margin: options.margin || 2,
      color: {
        dark: options.dark || "#000000",
        light: options.light || "#ffffff",
      },
    });

    return { success: true, qrCode, inviteUrl, token, seatId };
  } catch (error) {
    console.error("[Corporate QR] Failed to generate QR code:", error);
    return { success: false, error: "Failed to generate QR code" };
  }
}

/**
 * Generate QR codes for multiple unassigned seats.
 */
export async function generateBulkQR(
  corporateAccountId: string,
  count: number,
  options: CorporateQROptions = {}
): Promise<{ success: boolean; results: CorporateQRResult[]; error?: string }> {
  const unassignedSeats = await prisma.corporateSeat.findMany({
    where: {
      corporateAccountId,
      userId: null,
      status: "INVITED",
    },
    take: count,
    orderBy: { createdAt: "asc" },
  });

  if (unassignedSeats.length === 0) {
    return { success: false, results: [], error: "No unassigned seats available" };
  }

  const results: CorporateQRResult[] = [];
  for (const seat of unassignedSeats) {
    const result = await generateCorporateQR(corporateAccountId, seat.id, options);
    results.push(result);
  }

  return {
    success: results.some((r) => r.success),
    results,
  };
}

/**
 * Accept a corporate QR code — matches by seat qrCode field.
 */
export async function acceptCorporateQR(
  token: string,
  userId: string
): Promise<{ success: boolean; companyName?: string; error?: string }> {
  return await prisma.$transaction(async (tx) => {
    const seat = await tx.corporateSeat.findFirst({
      where: { qrCode: token, userId: null },
      include: {
        corporateAccount: { select: { name: true, status: true } },
      },
    });

    if (!seat) {
      return { success: false, error: "Invalid or already used QR code" };
    }

    if (seat.corporateAccount.status !== "ACTIVE") {
      return { success: false, error: "Corporate account is not active" };
    }

    // Check if user already has a corporate seat
    const existingSeat = await tx.corporateSeat.findUnique({ where: { userId } });
    if (existingSeat) {
      return { success: false, error: "You already have a corporate seat" };
    }

    // Assign seat
    await tx.corporateSeat.update({
      where: { id: seat.id },
      data: {
        userId,
        status: "ACTIVE",
        onboardedAt: new Date(),
      },
    });

    // Update user plan
    await tx.user.update({
      where: { id: userId },
      data: { plan: "ENTERPRISE" },
    });

    return { success: true, companyName: seat.corporateAccount.name };
  });
}
