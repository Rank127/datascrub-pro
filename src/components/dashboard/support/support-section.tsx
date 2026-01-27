"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "../executive/metric-card";
import { TicketList } from "./ticket-list";
import { TicketDetailDialog } from "./ticket-detail-dialog";
import {
  Inbox,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface SupportStats {
  openTickets: number;
  inProgressTickets: number;
  waitingUserTickets: number;
  urgentTickets: number;
  resolvedToday: number;
  avgResolutionHours: number;
  ticketsByType: Record<string, number>;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  userId: string;
  type: string;
  status: string;
  priority: string;
  subject: string;
  description: string;
  source: string;
  scanId: string | null;
  exposureId: string | null;
  removalRequestId: string | null;
  subscriptionId: string | null;
  assignedToId: string | null;
  assignedAt: string | null;
  resolution: string | null;
  resolvedAt: string | null;
  resolvedById: string | null;
  internalNotes: string | null;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  // Debug info
  browserInfo: string | null;
  pageUrl: string | null;
  errorDetails: string | null;
  user: {
    id: string;
    email: string | null;
    name: string | null;
  };
  assignedTo: {
    id: string;
    email: string | null;
    name: string | null;
  } | null;
  _count?: {
    comments: number;
  };
}

export function SupportSection() {
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    type: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/support/tickets/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch support stats:", error);
    }
  }, []);

  const fetchTickets = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.type) params.append("type", filters.type);
      params.append("limit", pagination.limit.toString());
      params.append("offset", ((pagination.page - 1) * pagination.limit).toString());

      const response = await fetch(`/api/admin/support/tickets?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets);
        setPagination((prev) => ({ ...prev, total: data.total }));
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchStats();
    fetchTickets();
  }, [fetchStats, fetchTickets]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchTickets(true)]);
    setRefreshing(false);
    toast.success("Support data refreshed");
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleTicketUpdated = () => {
    fetchStats();
    fetchTickets(true);
    setSelectedTicket(null);
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Support Tickets</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            title="Open Tickets"
            value={stats.openTickets}
            icon={Inbox}
            variant={stats.openTickets > 20 ? "warning" : "default"}
            subtitle="Awaiting response"
          />
          <MetricCard
            title="In Progress"
            value={stats.inProgressTickets}
            icon={Clock}
            variant="info"
            subtitle="Being handled"
          />
          <MetricCard
            title="Urgent"
            value={stats.urgentTickets}
            icon={AlertTriangle}
            variant={stats.urgentTickets > 0 ? "danger" : "default"}
            subtitle="High priority"
          />
          <MetricCard
            title="Resolved Today"
            value={stats.resolvedToday}
            icon={CheckCircle}
            variant="success"
            subtitle="Closed tickets"
          />
          <MetricCard
            title="Avg Resolution"
            value={`${(stats.avgResolutionHours ?? 0).toFixed(1)}h`}
            icon={Clock}
            variant={(stats.avgResolutionHours ?? 0) < 24 ? "success" : (stats.avgResolutionHours ?? 0) < 48 ? "warning" : "danger"}
            subtitle="Time to resolve"
          />
        </div>
      )}

      {/* Tickets by Type */}
      {stats && Object.keys(stats.ticketsByType).length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Tickets by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.ticketsByType).map(([type, count]) => (
                <Badge
                  key={type}
                  variant="outline"
                  className="bg-slate-800/50 text-slate-300 border-slate-700 cursor-pointer hover:bg-slate-800"
                  onClick={() => handleFilterChange("type", type === filters.type ? "" : type)}
                >
                  {type.replace(/_/g, " ")}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ticket List */}
      <TicketList
        tickets={tickets}
        loading={loading}
        filters={filters}
        onFilterChange={handleFilterChange}
        pagination={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        onSelectTicket={setSelectedTicket}
      />

      {/* Ticket Detail Dialog */}
      {selectedTicket && (
        <TicketDetailDialog
          ticket={selectedTicket}
          open={!!selectedTicket}
          onOpenChange={(open) => !open && setSelectedTicket(null)}
          onUpdated={handleTicketUpdated}
        />
      )}
    </div>
  );
}
