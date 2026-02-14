import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getReferralStats, validateReferralCode } from "@/lib/referrals";
import { rateLimit, getClientIdentifier, rateLimitResponse } from "@/lib/rate-limit";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getReferralStats(session.user.id);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching referral stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral stats" },
      { status: 500 }
    );
  }
}

// Validate a referral code (public endpoint, rate-limited)
export async function POST(request: Request) {
  try {
    // Rate limit to prevent code enumeration
    const identifier = getClientIdentifier(request);
    const rl = await rateLimit(identifier, "api");
    if (!rl.success) return rateLimitResponse(rl);

    const { code } = await request.json();

    if (!code || typeof code !== "string" || code.length > 50) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const valid = await validateReferralCode(code);

    return NextResponse.json({ valid });
  } catch (error) {
    console.error("Error validating referral code:", error);
    return NextResponse.json(
      { error: "Failed to validate code" },
      { status: 500 }
    );
  }
}
