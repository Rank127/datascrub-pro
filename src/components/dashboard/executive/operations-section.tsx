"use client";

import { useState, useEffect } from "react";
import { OperationsMetrics, PlatformMetrics } from "@/lib/executive/types";
import { MetricCard } from "./metric-card";
import { TrendChart } from "./trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  Activity,
  Timer,
  Server,
  Users,
  Eye,
  Shield,
  TrendingUp,
  BarChart3,
  Scan,
} from "lucide-react";
import { toast } from "sonner";

interface OperationsSectionProps {
  data: OperationsMetrics;
  platform?: PlatformMetrics;
}

interface UserWithExposures {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  createdAt: string;
  _count?: {
    exposures: number;
    scans: number;
  };
  exposureStats?: {
    total: number;
    removed: number;
    pending: number;
    inProgress: number;
  };
}

export function OperationsSection({ data, platform }: OperationsSectionProps) {
  const [showUsersDialog, setShowUsersDialog] = useState(false);
  const [users, setUsers] = useState<UserWithExposures[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (showUsersDialog) {
      fetchUsersWithExposures();
    }
  }, [showUsersDialog]);

  const fetchUsersWithExposures = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch("/api/admin/users?limit=100&includeExposureStats=true");
      if (!response.ok) throw new Error("Failed to fetch users");
      const result = await response.json();

      // Sort by plan: ENTERPRISE > PRO > FREE
      const planOrder: Record<string, number> = { ENTERPRISE: 0, PRO: 1, FREE: 2 };
      const sortedUsers = (result.users || []).sort((a: UserWithExposures, b: UserWithExposures) => {
        return (planOrder[a.plan] ?? 3) - (planOrder[b.plan] ?? 3);
      });

      setUsers(sortedUsers);
    } catch {
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };
  const getHealthBadge = (rate: number) => {
    if (rate >= 95) {
      return <Badge className="bg-emerald-500/20 text-emerald-400">Healthy</Badge>;
    } else if (rate >= 80) {
      return <Badge className="bg-amber-500/20 text-amber-400">Warning</Badge>;
    }
    return <Badge className="bg-red-500/20 text-red-400">Critical</Badge>;
  };

  const totalRemovals = Object.values(data.removalsByStatus).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Platform Overview */}
      {platform && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Platform Overview</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Users"
              value={platform.totalUsers}
              icon={Users}
              variant="info"
              trend={{
                value: platform.userGrowthRate,
                isPositive: platform.userGrowthRate >= 0,
              }}
              onClick={() => setShowUsersDialog(true)}
            />
            <MetricCard
              title="New Users This Month"
              value={platform.newUsersThisMonth}
              icon={TrendingUp}
              variant="success"
            />
            <MetricCard
              title="Total Exposures Found"
              value={platform.totalExposures}
              icon={Eye}
              variant="warning"
            />
            <MetricCard
              title="Removals Completed"
              value={platform.totalRemovals}
              icon={Shield}
              variant="success"
            />
          </div>

          {/* Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Removal Success Rate"
              value={platform.removalSuccessRate}
              format="percentage"
              icon={CheckCircle}
              variant={platform.removalSuccessRate >= 90 ? "success" : platform.removalSuccessRate >= 70 ? "warning" : "danger"}
            />
            <MetricCard
              title="Scan Completion Rate"
              value={platform.scanCompletionRate}
              format="percentage"
              icon={Scan}
              variant={platform.scanCompletionRate >= 95 ? "success" : platform.scanCompletionRate >= 80 ? "warning" : "danger"}
            />
            <MetricCard
              title="Avg Exposures Per User"
              value={platform.avgExposuresPerUser.toFixed(1)}
              icon={BarChart3}
              variant="default"
            />
          </div>

          {/* Trend Charts */}
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            <TrendChart
              title="User Growth (12 Months)"
              data={platform.trends.users}
              color="blue"
              type="area"
              height={200}
            />
            <TrendChart
              title="Exposures Found (12 Months)"
              data={platform.trends.exposures}
              color="amber"
              type="area"
              height={200}
            />
            <TrendChart
              title="Removals Completed (12 Months)"
              data={platform.trends.removals}
              color="emerald"
              type="area"
              height={200}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-slate-800 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Activity className="h-5 w-5 text-amber-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Queue & Processing</h2>
            </div>
          </div>
        </>
      )}

      {/* Queue Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Pending Removals"
          value={data.pendingRemovalRequests}
          icon={Clock}
          variant={data.pendingRemovalRequests > 100 ? "warning" : "default"}
          subtitle="Awaiting processing"
        />
        <MetricCard
          title="In Progress"
          value={data.inProgressRemovals}
          icon={Loader2}
          variant="info"
          subtitle="Currently processing"
        />
        <MetricCard
          title="Manual Action Queue"
          value={data.manualActionQueue}
          icon={AlertTriangle}
          variant={data.manualActionQueue > 50 ? "danger" : data.manualActionQueue > 20 ? "warning" : "default"}
          subtitle="Requires human review"
        />
        <MetricCard
          title="Custom Requests"
          value={data.customRemovalBacklog}
          icon={FileText}
          variant="info"
          subtitle="Enterprise backlog"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          title="Avg Removal Time"
          value={`${data.avgRemovalTimeHours.toFixed(1)}h`}
          icon={Timer}
          variant={data.avgRemovalTimeHours < 24 ? "success" : data.avgRemovalTimeHours < 72 ? "warning" : "danger"}
          subtitle="From submission to completion"
        />
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Server className="h-4 w-4" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Scan Success Rate</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{data.systemHealth.scanSuccessRate}%</span>
                  {getHealthBadge(data.systemHealth.scanSuccessRate)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Removal Success Rate</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{data.systemHealth.removalSuccessRate}%</span>
                  {getHealthBadge(data.systemHealth.removalSuccessRate)}
                </div>
              </div>
              {data.systemHealth.lastScanTime && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Scan</span>
                  <span className="text-white text-sm">
                    {new Date(data.systemHealth.lastScanTime).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Removal Status Breakdown */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            Removal Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.removalsByStatus).map(([status, count]) => {
              const statusConfig: Record<string, { color: string; icon: typeof CheckCircle }> = {
                COMPLETED: { color: "emerald", icon: CheckCircle },
                IN_PROGRESS: { color: "blue", icon: Loader2 },
                PENDING: { color: "amber", icon: Clock },
                SUBMITTED: { color: "purple", icon: FileText },
                FAILED: { color: "red", icon: XCircle },
                REQUIRES_MANUAL: { color: "amber", icon: AlertTriangle },
              };
              const config = statusConfig[status] || { color: "slate", icon: FileText };
              const Icon = config.icon;

              return (
                <div key={status} className="flex items-center gap-4">
                  <div className="w-32 flex items-center gap-2">
                    <Icon className={`h-4 w-4 text-${config.color}-400`} />
                    <span className="text-sm text-slate-400">{status.replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${config.color}-500 rounded-full transition-all`}
                        style={{ width: `${totalRemovals > 0 ? (count / totalRemovals) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-20 text-right text-white font-medium">
                    {count.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Removal Methods */}
      {Object.keys(data.removalsByMethod).length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white">
              Removal Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(data.removalsByMethod).map(([method, count]) => (
                <div key={method} className="p-4 bg-slate-800/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-white">{count.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-1">{method.replace(/_/g, " ")}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Dialog */}
      <Dialog open={showUsersDialog} onOpenChange={setShowUsersDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-6xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              All Users by Plan
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-slate-400">No users found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">Email</TableHead>
                    <TableHead className="text-slate-400">Name</TableHead>
                    <TableHead className="text-slate-400">Plan</TableHead>
                    <TableHead className="text-slate-400 text-center">Total Exposures</TableHead>
                    <TableHead className="text-slate-400 text-center">Removed</TableHead>
                    <TableHead className="text-slate-400 text-center">Pending</TableHead>
                    <TableHead className="text-slate-400 text-center">In Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-slate-800">
                      <TableCell className="text-white">{user.email}</TableCell>
                      <TableCell className="text-slate-300">{user.name || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.plan === "ENTERPRISE"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : user.plan === "PRO"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-slate-500/20 text-slate-400"
                          }
                        >
                          {user.plan}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-slate-300">
                        {user.exposureStats?.total ?? user._count?.exposures ?? 0}
                      </TableCell>
                      <TableCell className="text-center text-emerald-400">
                        {user.exposureStats?.removed ?? 0}
                      </TableCell>
                      <TableCell className="text-center text-amber-400">
                        {user.exposureStats?.pending ?? 0}
                      </TableCell>
                      <TableCell className="text-center text-blue-400">
                        {user.exposureStats?.inProgress ?? 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
