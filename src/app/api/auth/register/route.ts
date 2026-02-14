import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encryption/crypto";
import { sendWelcomeEmail } from "@/lib/email";
import { enrollInDripCampaign } from "@/lib/email/drip-campaigns";
import { trackReferralSignup } from "@/lib/referrals";
import { rateLimit, getClientIdentifier, rateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
  referralCode: z.string().optional(),
});

export async function POST(request: Request) {
  // Rate limiting (uses Upstash Redis in production)
  const identifier = getClientIdentifier(request);
  const rateLimitResult = await rateLimit(identifier, "auth-register");
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult);
  }

  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, name, referralCode } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        plan: "FREE",
      },
    });

    // Create default personal profile with encrypted data
    await prisma.personalProfile.create({
      data: {
        userId: user.id,
        emails: encrypt(JSON.stringify([email])),
        fullName: name,
      },
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, name).catch(console.error);

    // Enroll in drip campaign for conversion optimization (non-blocking)
    enrollInDripCampaign(user.id).catch(console.error);

    // Track referral if code provided (non-blocking)
    if (referralCode) {
      trackReferralSignup(referralCode, user.id).catch(console.error);
    }

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
