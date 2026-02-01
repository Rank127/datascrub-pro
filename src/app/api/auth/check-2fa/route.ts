import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";

const checkSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = checkSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ requires2FA: false }, { status: 200 });
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        passwordHash: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({ requires2FA: false }, { status: 200 });
    }

    // If password is provided, verify it first
    if (password) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ requires2FA: false }, { status: 200 });
      }
    }

    return NextResponse.json({
      requires2FA: user.twoFactorEnabled,
    });
  } catch (error) {
    console.error("Check 2FA error:", error);
    return NextResponse.json({ requires2FA: false }, { status: 200 });
  }
}
