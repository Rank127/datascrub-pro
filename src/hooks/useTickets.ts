"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface Ticket {
  id: string;
  ticketNumber: string;
  type: string;
  status: string;
  priority: string;
  subject: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  user?: {
    name: string;
    email: string;
  };
  _count?: {
    comments: number;
  };
}

interface TicketStats {
  openTickets: number;
  inProgressTickets: number;
  waitingUserTickets: number;
  urgentTickets: number;
  resolvedToday: number;
  avgResolutionHours: number;
  ticketsByType: Record<string, number>;
  ticketsByStatus: Record<string, number>;
  recentTickets: Ticket[];
}

interface UseTicketsOptions {
  pollingInterval?: number;
  showToast?: boolean;
  status?: string;
  type?: string;
  priority?: string;
}

/**
 * Hook for fetching admin support tickets with real-time polling
 */
export function useAdminTickets(options?: UseTicketsOptions) {
  const {
    pollingInterval = 20000,
    showToast = true,
    status,
    type,
    priority,
  } = options || {};
  const queryClient = useQueryClient();
  const previousTickets = useRef<Ticket[]>([]);

  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (type) params.set("type", type);
  if (priority) params.set("priority", priority);

  const query = useQuery({
    queryKey: ["admin-tickets", status, type, priority],
    queryFn: async () => {
      const res = await fetch(`/api/admin/support/tickets?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch tickets");
      return res.json() as Promise<{ tickets: Ticket[]; total: number }>;
    },
    refetchInterval: pollingInterval,
    refetchIntervalInBackground: true,
  });

  // Show toast for new tickets
  useEffect(() => {
    if (!showToast || !query.data?.tickets) return;

    const currentTickets = query.data.tickets;
    const newTickets = currentTickets.filter(
      (ticket) =>
        ticket.status === "OPEN" &&
        !previousTickets.current.find((p) => p.id === ticket.id)
    );

    newTickets.forEach((ticket) => {
      toast.info(`New ticket: ${ticket.ticketNumber}`, {
        description: ticket.subject,
        duration: 8000,
      });
    });

    // Also check for updated tickets
    const updatedTickets = currentTickets.filter((ticket) => {
      const prev = previousTickets.current.find((p) => p.id === ticket.id);
      return prev && prev.lastActivityAt !== ticket.lastActivityAt;
    });

    updatedTickets.forEach((ticket) => {
      toast.info(`Ticket updated: ${ticket.ticketNumber}`, {
        description: `Status: ${ticket.status}`,
        duration: 5000,
      });
    });

    previousTickets.current = currentTickets;
  }, [query.data?.tickets, showToast]);

  return {
    tickets: query.data?.tickets || [],
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/**
 * Hook for fetching ticket statistics with polling
 */
export function useTicketStats(options?: { pollingInterval?: number }) {
  const { pollingInterval = 30000 } = options || {};

  const query = useQuery({
    queryKey: ["ticket-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/support/tickets/stats");
      if (!res.ok) throw new Error("Failed to fetch ticket stats");
      return res.json() as Promise<TicketStats>;
    },
    refetchInterval: pollingInterval,
    refetchIntervalInBackground: true,
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/**
 * Hook for fetching user's own tickets with polling
 */
export function useUserTickets(options?: { pollingInterval?: number; showToast?: boolean }) {
  const { pollingInterval = 30000, showToast = true } = options || {};
  const queryClient = useQueryClient();
  const previousTickets = useRef<Ticket[]>([]);

  const query = useQuery({
    queryKey: ["user-tickets"],
    queryFn: async () => {
      const res = await fetch("/api/support/tickets");
      if (!res.ok) throw new Error("Failed to fetch tickets");
      return res.json() as Promise<{ tickets: Ticket[]; total: number }>;
    },
    refetchInterval: pollingInterval,
    refetchIntervalInBackground: true,
  });

  // Show toast for ticket updates
  useEffect(() => {
    if (!showToast || !query.data?.tickets) return;

    const currentTickets = query.data.tickets;

    // Check for status changes
    currentTickets.forEach((ticket) => {
      const prev = previousTickets.current.find((p) => p.id === ticket.id);
      if (prev && prev.status !== ticket.status) {
        if (ticket.status === "RESOLVED") {
          toast.success(`Ticket ${ticket.ticketNumber} resolved!`, {
            description: "Your support request has been resolved.",
            duration: 8000,
          });
        } else if (ticket.status === "IN_PROGRESS") {
          toast.info(`Ticket ${ticket.ticketNumber} in progress`, {
            description: "A support agent is working on your request.",
            duration: 5000,
          });
        }
      }

      // Check for new comments (by checking lastActivityAt)
      if (prev && prev.lastActivityAt !== ticket.lastActivityAt && prev.status === ticket.status) {
        toast.info(`New response on ${ticket.ticketNumber}`, {
          description: "You have a new response on your support ticket.",
          duration: 8000,
        });
      }
    });

    previousTickets.current = currentTickets;
  }, [query.data?.tickets, showToast]);

  return {
    tickets: query.data?.tickets || [],
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
