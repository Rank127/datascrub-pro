/**
 * Referral Program System
 *
 * Users can refer friends and earn credits when they sign up and convert.
 * Referral structure: Give $10, Get $10 (applied as credit)
 */

import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";
import { stripe } from "@/lib/stripe";

const REFERRAL_REWARD_CENTS = 1000; // $10.00
const REFERRED_DISCOUNT_CENTS = 1000; // $10.00 off first payment

export interface ReferralStats {
  totalReferrals: number;
  signedUp: number;
  converted: number;
  totalEarnings: number; // cents
  pendingEarnings: number; // cents
  referralCode: string;
  referralLink: string;
}

/**
 * Generate or get existing referral code for a user
 */
export async function getUserReferralCode(userId: string): Promise<string> {
  // Check for existing referral
  const existing = await prisma.referral.findFirst({
    where: { referrerId: userId },
    select: { referralCode: true },
  });

  if (existing) {
    return existing.referralCode;
  }

  // Generate new unique referral code
  const code = nanoid(8).toUpperCase();

  // Create a pending referral entry (will be updated when someone uses the code)
  await prisma.referral.create({
    data: {
      referrerId: userId,
      referralCode: code,
      status: "pending",
    },
  });

  return code;
}

/**
 * Get referral statistics for a user
 */
export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
  });

  const referralCode = await getUserReferralCode(userId);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ghostmydata.com";

  const stats: ReferralStats = {
    totalReferrals: referrals.length,
    signedUp: referrals.filter((r) => r.status !== "pending").length,
    converted: referrals.filter((r) => r.status === "converted" || r.status === "rewarded").length,
    totalEarnings: referrals
      .filter((r) => r.status === "rewarded")
      .reduce((sum, r) => sum + r.rewardAmount, 0),
    pendingEarnings: referrals
      .filter((r) => r.status === "converted")
      .reduce((sum) => sum + REFERRAL_REWARD_CENTS, 0),
    referralCode,
    referralLink: `${baseUrl}/register?ref=${referralCode}`,
  };

  return stats;
}

/**
 * Track when someone signs up with a referral code
 */
export async function trackReferralSignup(
  referralCode: string,
  newUserId: string
): Promise<boolean> {
  try {
    // Find the referral by code
    const referral = await prisma.referral.findUnique({
      where: { referralCode },
    });

    if (!referral) {
      console.log(`[Referral] Invalid code: ${referralCode}`);
      return false;
    }

    // Don't allow self-referral
    if (referral.referrerId === newUserId) {
      console.log(`[Referral] Self-referral attempted: ${newUserId}`);
      return false;
    }

    // Update or create the referral record
    if (referral.status === "pending" && !referral.referredUserId) {
      // Update the existing pending referral
      await prisma.referral.update({
        where: { id: referral.id },
        data: {
          referredUserId: newUserId,
          status: "signed_up",
        },
      });
    } else {
      // Create a new referral entry for this specific signup
      await prisma.referral.create({
        data: {
          referrerId: referral.referrerId,
          referredUserId: newUserId,
          referralCode: `${referralCode}-${nanoid(4)}`, // Make unique
          status: "signed_up",
        },
      });
    }

    console.log(`[Referral] Signup tracked: ${newUserId} via ${referralCode}`);
    return true;
  } catch (error) {
    console.error("[Referral] Error tracking signup:", error);
    return false;
  }
}

/**
 * Track when a referred user converts (upgrades to paid)
 */
export async function trackReferralConversion(userId: string): Promise<boolean> {
  try {
    // Find referral where this user was referred
    const referral = await prisma.referral.findFirst({
      where: {
        referredUserId: userId,
        status: "signed_up",
      },
    });

    if (!referral) {
      return false;
    }

    // Mark as converted
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: "converted",
        convertedAt: new Date(),
      },
    });

    console.log(`[Referral] Conversion tracked: ${userId}`);
    return true;
  } catch (error) {
    console.error("[Referral] Error tracking conversion:", error);
    return false;
  }
}

/**
 * Process referral rewards (called when payment is successful)
 */
export async function processReferralReward(userId: string): Promise<{
  rewarded: boolean;
  referrerId?: string;
  amount?: number;
}> {
  try {
    // Find pending conversion for this user
    const referral = await prisma.referral.findFirst({
      where: {
        referredUserId: userId,
        status: "converted",
      },
    });

    if (!referral) {
      return { rewarded: false };
    }

    // Mark as rewarded and set reward amount
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: "rewarded",
        rewardAmount: REFERRAL_REWARD_CENTS,
      },
    });

    // Credit referrer's Stripe customer balance
    const referrerSub = await prisma.subscription.findUnique({
      where: { userId: referral.referrerId },
      select: { stripeCustomerId: true },
    });

    if (referrerSub?.stripeCustomerId) {
      try {
        await stripe.customers.createBalanceTransaction(referrerSub.stripeCustomerId, {
          amount: -REFERRAL_REWARD_CENTS, // Negative = credit
          currency: "usd",
          description: "Referral reward — friend subscribed",
        });
        console.log(`[Referral] $${REFERRAL_REWARD_CENTS / 100} Stripe credit applied to customer ${referrerSub.stripeCustomerId}`);
      } catch (stripeErr) {
        console.error("[Referral] Stripe balance credit failed (reward still tracked in DB):", stripeErr);
      }
    } else {
      console.log(`[Referral] Reward tracked in DB for ${referral.referrerId} — no Stripe customer yet, credit will apply on signup`);
    }

    return {
      rewarded: true,
      referrerId: referral.referrerId,
      amount: REFERRAL_REWARD_CENTS,
    };
  } catch (error) {
    console.error("[Referral] Error processing reward:", error);
    return { rewarded: false };
  }
}

/**
 * Get referral discount for a new user
 */
export async function getReferralDiscount(userId: string): Promise<number> {
  const referral = await prisma.referral.findFirst({
    where: {
      referredUserId: userId,
      status: { in: ["signed_up", "converted"] },
    },
  });

  if (referral) {
    return REFERRED_DISCOUNT_CENTS;
  }

  return 0;
}

/**
 * Validate a referral code
 */
export async function validateReferralCode(code: string): Promise<boolean> {
  const referral = await prisma.referral.findUnique({
    where: { referralCode: code },
  });

  return !!referral;
}

/**
 * Get leaderboard of top referrers
 */
export async function getReferralLeaderboard(limit: number = 10): Promise<
  Array<{
    userId: string;
    userName: string;
    totalReferrals: number;
    conversions: number;
  }>
> {
  const referrals = await prisma.referral.groupBy({
    by: ["referrerId"],
    where: {
      status: { in: ["converted", "rewarded"] },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: limit,
  });

  // Get user names
  const userIds = referrals.map((r) => r.referrerId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u.name || "Anonymous"]));

  return referrals.map((r) => ({
    userId: r.referrerId,
    userName: userMap.get(r.referrerId) || "Anonymous",
    totalReferrals: r._count.id,
    conversions: r._count.id,
  }));
}
