import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  generateTOTPSecret,
  generateQRCode,
  generateBackupCodes,
  encryptTOTPSecret,
  stringifyBackupCodes,
  formatBackupCode,
} from "@/lib/2fa";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "Two-factor authentication is already enabled" },
        { status: 400 }
      );
    }

    // Generate new secret
    const secret = generateTOTPSecret();

    // Generate QR code
    const qrCode = await generateQRCode(secret, user.email);

    // Generate backup codes
    const { plainCodes, hashedCodes } = generateBackupCodes();

    // Store encrypted secret and hashed backup codes (not enabled yet)
    // User must verify with a code before 2FA is enabled
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorSecret: encryptTOTPSecret(secret),
        twoFactorBackupCodes: stringifyBackupCodes(hashedCodes),
        // twoFactorEnabled stays false until verified
      },
    });

    return NextResponse.json({
      secret,
      qrCode,
      backupCodes: plainCodes.map(formatBackupCode),
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { error: "Failed to setup 2FA" },
      { status: 500 }
    );
  }
}
