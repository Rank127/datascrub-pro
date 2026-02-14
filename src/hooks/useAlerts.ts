"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: string;
  createdAt: string;
}

/**
 * Hook for fetching and managing user alerts with real-time polling
 */
export function useAlerts(options?: { pollingInterval?: number; showToast?: boolean }) {
  const { pollingInterval = 30000, showToast = true } = options || {};
  const queryClient = useQueryClient();
  const previousAlerts = useRef<Alert[]>([]);

  const query = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const res = await fetch("/api/alerts");
      if (!res.ok) throw new Error("Failed to fetch alerts");
      return res.json() as Promise<{ alerts: Alert[] }>;
    },
    refetchInterval: pollingInterval,
    refetchIntervalInBackground: false,
  });

  // Show toast for new alerts
  useEffect(() => {
    if (!showToast || !query.data?.alerts) return;

    const currentAlerts = query.data.alerts;
    const newAlerts = currentAlerts.filter(
      (alert) =>
        !alert.isRead &&
        !previousAlerts.current.find((p) => p.id === alert.id)
    );

    newAlerts.forEach((alert) => {
      toast.info(alert.title, {
        description: alert.message,
        duration: 5000,
      });
    });

    previousAlerts.current = currentAlerts;
  }, [query.data?.alerts, showToast]);

  // Mark alert as read
  const markAsRead = useMutation({
    mutationFn: async (alertId: string) => {
      const res = await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId }),
      });
      if (!res.ok) throw new Error("Failed to mark alert as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (!res.ok) throw new Error("Failed to mark all alerts as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  const unreadCount = query.data?.alerts?.filter((a) => !a.isRead).length || 0;

  return {
    alerts: query.data?.alerts || [],
    unreadCount,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
  };
}
