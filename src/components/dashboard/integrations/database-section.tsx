"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IntegrationCard, MetricDisplay } from "./integration-card";
import { DatabaseIntegrationResponse } from "@/lib/integrations/types";
import {
  Database,
  Table,
  HardDrive,
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Users,
  Shield,
  Search,
  CreditCard,
  Loader2,
  Mail,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanBadge } from "../plan-badge";

interface UserDetails {
  id: string;
  email: string | null;
  name: string | null;
  plan: string;
  effectivePlan?: string;
  createdAt: string;
  scanCount: number;
  exposureCount: number;
}

interface DatabaseSectionProps {
  data: DatabaseIntegrationResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

const statusConfig = {
  healthy: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    label: "Healthy",
  },
  degraded: {
    icon: AlertCircle,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    label: "Degraded",
  },
  error: {
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    label: "Error",
  },
};

export function DatabaseSection({
  data,
  loading,
  onRefresh,
}: DatabaseSectionProps) {
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const handlePlanClick = async (plan: string) => {
    setSelectedPlan(plan);
    setUsersModalOpen(true);
    setLoadingUsers(true);

    try {
      const response = await fetch(`/api/admin/integrations/database/users?plan=${plan}`);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <IntegrationCard
        title="Database"
        icon={Database}
        status="loading"
        message="Checking database connection..."
      />
    );
  }

  if (!data || data.connectionStatus === "error") {
    return (
      <IntegrationCard
        title="Database"
        icon={Database}
        status="error"
        message={data?.error || "Database connection failed"}
      >
        <div className="text-sm text-slate-400 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="font-medium mb-2 text-red-400">Connection Error</p>
          <p className="text-slate-500">
            Unable to connect to the database. Check your DATABASE_URL configuration
            and ensure the database server is running.
          </p>
        </div>
      </IntegrationCard>
    );
  }

  const status = statusConfig[data.connectionStatus];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-4">
      <IntegrationCard
        title="Database"
        icon={Database}
        status={data.connectionStatus === "healthy" ? "connected" : "error"}
        message={`PostgreSQL • ${data.totalSize}`}
      >
        {/* Actions */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Connection Status */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className={cn("h-4 w-4", status.color)} />
              <span className="text-sm text-slate-400">Connection</span>
            </div>
            <p className={cn("text-lg font-bold", status.color)}>{status.label}</p>
          </div>
          <MetricDisplay
            label="Latency"
            value={`${data.latencyMs}ms`}
            variant={
              data.latencyMs < 100
                ? "success"
                : data.latencyMs < 500
                ? "warning"
                : "danger"
            }
          />
          <MetricDisplay
            label="Total Size"
            value={data.totalSize}
          />
        </div>

        {/* Table Count Summary */}
        <div className="grid grid-cols-4 gap-4">
          {data.tables.slice(0, 4).map((table) => (
            <MetricDisplay
              key={table.name}
              label={table.name}
              value={table.rowCount.toLocaleString()}
              subValue={table.size !== "N/A" ? table.size : undefined}
            />
          ))}
        </div>
      </IntegrationCard>

      {/* Business Metrics */}
      {data.businessMetrics && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              Business Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Users by Plan */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-slate-300">Users by Plan</span>
                <span className="text-xs text-slate-500 ml-1">(click to view)</span>
                <Badge variant="outline" className="ml-auto">{data.businessMetrics.users.total} total</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handlePlanClick("FREE")}
                  className="p-3 bg-slate-800/50 rounded-lg text-center hover:bg-slate-700/50 transition-colors cursor-pointer"
                >
                  <p className="text-2xl font-bold text-slate-300">{data.businessMetrics.users.free}</p>
                  <p className="text-xs text-slate-500">Free</p>
                </button>
                <button
                  onClick={() => handlePlanClick("PRO")}
                  className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center hover:bg-emerald-500/20 transition-colors cursor-pointer"
                >
                  <p className="text-2xl font-bold text-emerald-400">{data.businessMetrics.users.pro}</p>
                  <p className="text-xs text-emerald-400/70">Pro</p>
                </button>
                <button
                  onClick={() => handlePlanClick("ENTERPRISE")}
                  className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-center hover:bg-purple-500/20 transition-colors cursor-pointer"
                >
                  <p className="text-2xl font-bold text-purple-400">{data.businessMetrics.users.enterprise}</p>
                  <p className="text-xs text-purple-400/70">Enterprise</p>
                </button>
              </div>
            </div>

            {/* Exposures */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-slate-300">Exposures</span>
                <Badge variant="outline" className="ml-auto">{data.businessMetrics.exposures.total.toLocaleString()} total</Badge>
              </div>
              <div className="grid grid-cols-6 gap-2">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                  <p className="text-xl font-bold text-red-400">{data.businessMetrics.exposures.active.toLocaleString()}</p>
                  <p className="text-xs text-red-400/70">Active</p>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center">
                  <p className="text-xl font-bold text-amber-400">{(data.businessMetrics.exposures.removalPending || 0).toLocaleString()}</p>
                  <p className="text-xs text-amber-400/70">Pending</p>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
                  <p className="text-xl font-bold text-blue-400">{(data.businessMetrics.exposures.removalInProgress || 0).toLocaleString()}</p>
                  <p className="text-xs text-blue-400/70">In Progress</p>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                  <p className="text-xl font-bold text-emerald-400">{data.businessMetrics.exposures.removed.toLocaleString()}</p>
                  <p className="text-xs text-emerald-400/70">Removed</p>
                </div>
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-center">
                  <p className="text-xl font-bold text-purple-400">{(data.businessMetrics.exposures.monitoring || 0).toLocaleString()}</p>
                  <p className="text-xs text-purple-400/70">Monitoring</p>
                </div>
                <div className="p-3 bg-slate-500/10 border border-slate-500/20 rounded-lg text-center">
                  <p className="text-xl font-bold text-slate-400">{(data.businessMetrics.exposures.whitelisted || 0).toLocaleString()}</p>
                  <p className="text-xs text-slate-400/70">Whitelisted</p>
                </div>
              </div>
            </div>

            {/* Removal Requests */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-slate-300">Removal Requests</span>
                <Badge variant="outline" className="ml-auto">{data.businessMetrics.removals.total} total</Badge>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center">
                  <p className="text-xl font-bold text-amber-400">{data.businessMetrics.removals.pending}</p>
                  <p className="text-xs text-amber-400/70">Pending</p>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
                  <p className="text-xl font-bold text-blue-400">{data.businessMetrics.removals.inProgress}</p>
                  <p className="text-xs text-blue-400/70">In Progress</p>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                  <p className="text-xl font-bold text-emerald-400">{data.businessMetrics.removals.completed}</p>
                  <p className="text-xs text-emerald-400/70">Completed</p>
                </div>
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                  <p className="text-xl font-bold text-red-400">{data.businessMetrics.removals.failed}</p>
                  <p className="text-xs text-red-400/70">Failed</p>
                </div>
              </div>
            </div>

            {/* Scans */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-slate-300">Scans</span>
                <Badge variant="outline" className="ml-auto">{data.businessMetrics.scans.total} total</Badge>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center">
                  <p className="text-xl font-bold text-amber-400">{data.businessMetrics.scans.pending}</p>
                  <p className="text-xs text-amber-400/70">Pending</p>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
                  <p className="text-xl font-bold text-blue-400">{data.businessMetrics.scans.running}</p>
                  <p className="text-xs text-blue-400/70">Running</p>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                  <p className="text-xl font-bold text-emerald-400">{data.businessMetrics.scans.completed}</p>
                  <p className="text-xs text-emerald-400/70">Completed</p>
                </div>
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                  <p className="text-xl font-bold text-red-400">{data.businessMetrics.scans.failed}</p>
                  <p className="text-xs text-red-400/70">Failed</p>
                </div>
              </div>
            </div>

            {/* Subscriptions */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-slate-300">Subscriptions</span>
                <Badge variant="outline" className="ml-auto">{data.businessMetrics.subscriptions.total} total</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-emerald-400">{data.businessMetrics.subscriptions.active}</p>
                  <p className="text-xs text-emerald-400/70">Active</p>
                </div>
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-400">{data.businessMetrics.subscriptions.canceled}</p>
                  <p className="text-xs text-red-400/70">Canceled</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Table Stats */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <Table className="h-5 w-5 text-blue-400" />
            Table Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-2">
            {data.tables.map((table) => (
              <div
                key={table.name}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <HardDrive className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-white font-mono">{table.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="bg-slate-700/50">
                    {table.rowCount.toLocaleString()} rows
                  </Badge>
                  {table.size !== "N/A" && (
                    <span className="text-xs text-slate-500 w-20 text-right">
                      {table.size}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users Modal */}
      <Dialog open={usersModalOpen} onOpenChange={setUsersModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              {selectedPlan} Users
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                <span className="ml-2 text-slate-400">Loading users...</span>
              </div>
            ) : users.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No users found</p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      <span className="text-sm text-white truncate">
                        {user.email || "No email"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(user.createdAt)}
                      </span>
                      <span>{user.scanCount} scans</span>
                      <span>{user.exposureCount} exposures</span>
                    </div>
                  </div>
                  <PlanBadge plan={user.effectivePlan || user.plan} variant="outline" className="ml-2 flex-shrink-0" />
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
