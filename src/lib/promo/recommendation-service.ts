/**
 * Promo Recommendation Service
 *
 * Agents call createRecommendation() to flag high-value free users.
 * Admin reviews in Growth tab, approves/declines.
 * No auto-sending — human-in-the-loop only.
 */

import { prisma } from "@/lib/db";
import { getDirective } from "@/lib/mastermind/directives";

interface CreateRecommendationInput {
  userId: string;
  promoType: "DISCOUNT" | "URGENCY" | "WIN_BACK";
  reason: string;
  confidence: number;
  agentId: string;
}

/**
 * Create a promo recommendation for admin review.
 * Guards: max 1 PENDING per user, confidence >= directive threshold, 7-day expiry.
 */
export async function createRecommendation(input: CreateRecommendationInput): Promise<void> {
  const { userId, promoType, reason, confidence, agentId } = input;

  // Read min confidence from directives (default 0.4)
  const minConfidence = await getDirective<number>("promo_min_confidence", 0.4);

  if (confidence < minConfidence) {
    return; // Below threshold — skip silently
  }

  // Guard: max 1 PENDING recommendation per user
  const existing = await prisma.promoRecommendation.findFirst({
    where: { userId, status: "PENDING" },
  });

  if (existing) {
    return; // Already has a pending recommendation
  }

  // 7-day expiry
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.promoRecommendation.create({
    data: {
      userId,
      promoType,
      reason,
      confidence,
      agentId,
      expiresAt,
    },
  });
}

interface PendingRecommendation {
  id: string;
  userId: string;
  promoType: string;
  reason: string;
  confidence: number;
  agentId: string;
  status: string;
  couponCode: string;
  expiresAt: Date | null;
  createdAt: Date;
  user: {
    email: string;
    name: string | null;
    plan: string;
  };
}

/**
 * Get recommendations for admin dashboard.
 */
export async function getPendingRecommendations(
  status: string = "PENDING"
): Promise<PendingRecommendation[]> {
  return prisma.promoRecommendation.findMany({
    where: { status },
    include: {
      user: {
        select: { email: true, name: true, plan: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

/**
 * Approve a recommendation — sets status to APPROVED.
 */
export async function approveRecommendation(id: string, adminId: string): Promise<void> {
  await prisma.promoRecommendation.update({
    where: { id },
    data: {
      status: "APPROVED",
      approvedBy: adminId,
      approvedAt: new Date(),
    },
  });
}

/**
 * Decline a recommendation.
 */
export async function declineRecommendation(id: string): Promise<void> {
  await prisma.promoRecommendation.update({
    where: { id },
    data: { status: "DECLINED" },
  });
}

/**
 * Expire old PENDING recommendations past their expiresAt.
 * Called from health-check cron.
 */
export async function expireOldRecommendations(): Promise<number> {
  const result = await prisma.promoRecommendation.updateMany({
    where: {
      status: "PENDING",
      expiresAt: { lt: new Date() },
    },
    data: { status: "EXPIRED" },
  });

  return result.count;
}
