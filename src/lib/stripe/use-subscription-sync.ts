// Server-side subscription sync hook
// Use this in API routes and server components to ensure subscription is in sync

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { validateAndSyncSubscription } from "./subscription-intelligence";

// Cache to prevent too frequent syncs (in-memory, resets on server restart)
const syncCache = new Map<string, number>();
const SYNC_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes between syncs

/**
 * Get user with validated subscription
 * Automatically syncs from Stripe if out of date
 * Use this instead of just fetching user for plan-gated features
 */
export async function getValidatedUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;
  const now = Date.now();
  const lastSync = syncCache.get(userId) || 0;

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      role: true,
      image: true,
    },
  });

  if (!user) {
    return null;
  }

  // Check if we should sync (cooldown period)
  if (now - lastSync > SYNC_COOLDOWN_MS) {
    try {
      const syncResult = await validateAndSyncSubscription(userId, {
        autoFix: true,
        silent: true,
      });

      // Update cache
      syncCache.set(userId, now);

      // If plan was fixed, return updated plan
      if (syncResult.fixed) {
        return {
          ...user,
          plan: syncResult.currentPlan as "FREE" | "PRO" | "ENTERPRISE",
          _subscriptionSynced: true,
        };
      }
    } catch (error) {
      // Don't fail if sync fails, just use database value
      console.error("Subscription sync error:", error);
    }
  }

  return {
    ...user,
    _subscriptionSynced: false,
  };
}

/**
 * Force sync a user's subscription (bypass cooldown)
 * Use for admin actions or explicit user requests
 */
export async function forceSyncUserSubscription(userId: string) {
  const result = await validateAndSyncSubscription(userId, {
    autoFix: true,
    silent: false,
  });

  // Update cache
  syncCache.set(userId, Date.now());

  return result;
}

/**
 * Check if user has required plan with auto-sync
 */
export async function requirePlan(requiredPlan: "PRO" | "ENTERPRISE"): Promise<{
  authorized: boolean;
  user: Awaited<ReturnType<typeof getValidatedUser>>;
  currentPlan: string;
}> {
  const user = await getValidatedUser();

  if (!user) {
    return { authorized: false, user: null, currentPlan: "NONE" };
  }

  const planHierarchy: Record<string, number> = {
    FREE: 0,
    PRO: 1,
    ENTERPRISE: 2,
  };

  const requiredRank = planHierarchy[requiredPlan] ?? 0;
  const currentRank = planHierarchy[user.plan] ?? 0;

  return {
    authorized: currentRank >= requiredRank,
    user,
    currentPlan: user.plan,
  };
}

/**
 * Clear sync cache for a user (call after manual plan changes)
 */
export function clearSyncCache(userId: string) {
  syncCache.delete(userId);
}

/**
 * Clear entire sync cache (for testing/maintenance)
 */
export function clearAllSyncCache() {
  syncCache.clear();
}
