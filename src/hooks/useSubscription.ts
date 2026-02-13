"use client";

import { useQuery } from "@tanstack/react-query";

interface SubscriptionData {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  hasStripeSubscription: boolean;
  isAdmin: boolean;
  planSource: string;
  isOwner: boolean;
  familyPlan: {
    familyGroupId: string;
    familyName: string;
    role: string;
    ownerName: string;
    ownerEmail?: string;
    memberCount: number;
    pendingInvitations: number;
    maxMembers: number;
    spotsRemaining: number;
  } | null;
}

/**
 * Hook for fetching user subscription data with React Query caching.
 * Provides computed plan booleans for common checks.
 */
export function useSubscription() {
  const query = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await fetch("/api/subscription");
      if (!res.ok) throw new Error("Failed to fetch subscription");
      return res.json() as Promise<SubscriptionData>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const data = query.data;

  return {
    plan: data?.plan ?? "FREE",
    planSource: data?.planSource ?? "DEFAULT",
    isFreePlan: (data?.plan ?? "FREE") === "FREE" && (data?.planSource ?? "DEFAULT") !== "FAMILY",
    isPro: data?.plan === "PRO",
    isEnterprise: data?.plan === "ENTERPRISE",
    isAdmin: data?.isAdmin ?? false,
    currentPeriodEnd: data?.currentPeriodEnd ?? null,
    hasStripeSubscription: data?.hasStripeSubscription ?? false,
    familyPlan: data?.familyPlan ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
}
