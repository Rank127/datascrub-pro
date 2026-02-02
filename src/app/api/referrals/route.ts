import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getReferralStats, validateReferralCode } from "@/lib/referrals";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
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

// Validate a referral code (public endpoint)
export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
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
