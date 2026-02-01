import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import {
  verifyTOTPCode,
  decryptTOTPSecret,
  verifyBackupCode,
  parseBackupCodes,
  stringifyBackupCodes,
} from "@/lib/2fa";

const verifySchema = z.object({
  email: z.string().email("Invalid email"),
  code: z.string().min(1, "Code is required"),
  isBackupCode: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = verifySchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { email, code, isBackupCode } = result.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: "Two-factor authentication is not enabled for this account" },
        { status: 400 }
      );
    }

    if (isBackupCode) {
      // Verify backup code
      const hashedCodes = parseBackupCodes(user.twoFactorBackupCodes);
      const codeIndex = verifyBackupCode(code.replace(/-/g, ""), hashedCodes);

      if (codeIndex === -1) {
        return NextResponse.json(
          { error: "Invalid backup code" },
          { status: 401 }
        );
      }

      // Remove used backup code
      hashedCodes.splice(codeIndex, 1);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorBackupCodes: stringifyBackupCodes(hashedCodes),
        },
      });

      return NextResponse.json({
        verified: true,
        userId: user.id,
        remainingBackupCodes: hashedCodes.length,
      });
    } else {
      // Verify TOTP code
      const secret = decryptTOTPSecret(user.twoFactorSecret);
      const isValid = verifyTOTPCode(secret, code, user.email);

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid verification code" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        verified: true,
        userId: user.id,
      });
    }
  } catch (error) {
    console.error("2FA verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify 2FA code" },
      { status: 500 }
    );
  }
}
