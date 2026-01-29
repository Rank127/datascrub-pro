"use client";

import { useState, useEffect } from "react";
import { OperationsMetrics, PlatformMetrics } from "@/lib/executive/types";
import { MetricCard } from "./metric-card";
import { TrendChart } from "./trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Zap,
  Play,
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
  removalStats?: {
    total: number;
    submitted: number;
    inProgress: number;
    completed: number;
    failed: number;
    manual: number;
  };
}

type DialogType = "all" | "new" | "submitted" | "completed" | null;

interface AutomationResult {
  success: boolean;
  dryRun: boolean;
  summary: {
    totalManual: number;
    canAutomate: number;
    cannotAutomate: number;
    updated: number;
  };
  sourceBreakdown: { source: string; canAutomate: number; cannotAutomate: number }[];
}

export function OperationsSection({ data, platform }: OperationsSectionProps) {
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [users, setUsers] = useState<UserWithExposures[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAutomationDialog, setShowAutomationDialog] = useState(false);
  const [automationLoading, setAutomationLoading] = useState(false);
  const [automationResult, setAutomationResult] = useState<AutomationResult | null>(null);
  const [automationExecuting, setAutomationExecuting] = useState(false);

  useEffect(() => {
    if (dialogType) {
      fetchUsersWithExposures(dialogType);
    }
  }, [dialogType]);

  const fetchUsersWithExposures = async (type: DialogType) => {
    if (!type) return;
    setLoadingUsers(true);
    try {
      let url = "/api/admin/users?limit=100&includeExposureStats=true&includeRemovalStats=true";

      if (type === "new") {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        url += `&createdAfter=${startOfMonth.toISOString()}`;
      } else if (type === "submitted") {
        url += "&hasSubmittedRemovals=true";
      } else if (type === "completed") {
        url += "&hasCompletedRemovals=true";
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch users");
      const result = await response.json();

      // Sort by plan: ENTERPRISE > PRO > FREE
      const planOrder: Record<string, number> = { ENTERPRISE: 0, PRO: 1, FREE: 2 };
      let sortedUsers = (result.users || []).sort((a: UserWithExposures, b: UserWithExposures) => {
        return (planOrder[a.plan] ?? 3) - (planOrder[b.plan] ?? 3);
      });

      // For submitted/completed, sort by relevant count descending
      if (type === "submitted") {
        sortedUsers = sortedUsers.sort((a: UserWithExposures, b: UserWithExposures) => {
          const aCount = a.removalStats?.submitted ?? 0;
          const bCount = b.removalStats?.submitted ?? 0;
          return bCount - aCount;
        });
      } else if (type === "completed") {
        sortedUsers = sortedUsers.sort((a: UserWithExposures, b: UserWithExposures) => {
          const aCount = a.removalStats?.completed ?? 0;
          const bCount = b.removalStats?.completed ?? 0;
          return bCount - aCount;
        });
      }

      setUsers(sortedUsers);
    } catch {
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const previewAutomation = async () => {
    setAutomationLoading(true);
    setAutomationResult(null);
    try {
      const response = await fetch("/api/admin/reprocess-manual-removals?dryRun=true", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to preview automation");
      const result = await response.json();
      setAutomationResult(result);
    } catch {
      toast.error("Failed to preview automation");
    } finally {
      setAutomationLoading(false);
    }
  };

  const executeAutomation = async () => {
    setAutomationExecuting(true);
    try {
      const response = await fetch("/api/admin/reprocess-manual-removals", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to execute automation");
      const result = await response.json();
      setAutomationResult(result);
      toast.success(`Successfully converted ${result.summary.updated} manual removals to automated!`);
    } catch {
      toast.error("Failed to execute automation");
    } finally {
      setAutomationExecuting(false);
    }
  };

  const handleOpenAutomation = () => {
    setShowAutomationDialog(true);
    previewAutomation();
  };

  const getDialogTitle = () => {
    switch (dialogType) {
      case "all": return "All Users by Plan";
      case "new": return "New Users This Month";
      case "submitted": return "Users with Submitted Removals";
      case "completed": return "Users with Completed Removals";
      default: return "Users";
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

  const totalRemovalRequests = Object.values(data.removalsByStatus).reduce((a, b) => a + b, 0);
  const completedRemovals = data.removalsByStatus["COMPLETED"] || 0;

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
              onClick={() => setDialogType("all")}
            />
            <MetricCard
              title="New Users This Month"
              value={platform.newUsersThisMonth}
              icon={TrendingUp}
              variant="success"
              onClick={() => setDialogType("new")}
            />
            <MetricCard
              title="Removals Submitted"
              value={totalRemovalRequests}
              icon={Eye}
              variant="warning"
              onClick={() => setDialogType("submitted")}
            />
            <MetricCard
              title="Removals Completed"
              value={completedRemovals}
              icon={Shield}
              variant="success"
              onClick={() => setDialogType("completed")}
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
        <div className="relative">
          <MetricCard
            title="Manual Action Queue"
            value={data.manualActionQueue}
            icon={AlertTriangle}
            variant={data.manualActionQueue > 50 ? "danger" : data.manualActionQueue > 20 ? "warning" : "default"}
            subtitle="Requires human review"
          />
          {data.manualActionQueue > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="absolute bottom-2 right-2 gap-1 text-xs h-7 bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
              onClick={handleOpenAutomation}
            >
              <Zap className="h-3 w-3" />
              Automate
            </Button>
          )}
        </div>
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
                        style={{ width: `${totalRemovalRequests > 0 ? (count / totalRemovalRequests) * 100 : 0}%` }}
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
      <Dialog open={dialogType !== null} onOpenChange={(open) => !open && setDialogType(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-6xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              {getDialogTitle()}
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
                    {(dialogType === "submitted" || dialogType === "completed") ? (
                      <>
                        <TableHead className="text-slate-400 text-center">Total</TableHead>
                        <TableHead className="text-slate-400 text-center">Submitted</TableHead>
                        <TableHead className="text-slate-400 text-center">In Progress</TableHead>
                        <TableHead className="text-slate-400 text-center">Completed</TableHead>
                        <TableHead className="text-slate-400 text-center">Manual</TableHead>
                        <TableHead className="text-slate-400 text-center">Failed</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="text-slate-400 text-center">Total Exposures</TableHead>
                        <TableHead className="text-slate-400 text-center">Removed</TableHead>
                        <TableHead className="text-slate-400 text-center">Pending</TableHead>
                        <TableHead className="text-slate-400 text-center">In Progress</TableHead>
                      </>
                    )}
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
                      {(dialogType === "submitted" || dialogType === "completed") ? (
                        <>
                          <TableCell className="text-center text-slate-300">
                            {user.removalStats?.total ?? 0}
                          </TableCell>
                          <TableCell className="text-center text-amber-400">
                            {user.removalStats?.submitted ?? 0}
                          </TableCell>
                          <TableCell className="text-center text-blue-400">
                            {user.removalStats?.inProgress ?? 0}
                          </TableCell>
                          <TableCell className="text-center text-emerald-400">
                            {user.removalStats?.completed ?? 0}
                          </TableCell>
                          <TableCell className="text-center text-orange-400">
                            {user.removalStats?.manual ?? 0}
                          </TableCell>
                          <TableCell className="text-center text-red-400">
                            {user.removalStats?.failed ?? 0}
                          </TableCell>
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Automation Dialog */}
      <Dialog open={showAutomationDialog} onOpenChange={setShowAutomationDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              Automate Manual Removals
            </DialogTitle>
          </DialogHeader>

          {automationLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              <span className="ml-2 text-slate-400">Analyzing manual removals...</span>
            </div>
          ) : automationResult ? (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-sm">Total Manual</p>
                  <p className="text-2xl font-bold text-white">{automationResult.summary.totalManual}</p>
                </div>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <p className="text-emerald-400 text-sm">Can Automate</p>
                  <p className="text-2xl font-bold text-emerald-400">{automationResult.summary.canAutomate}</p>
                </div>
              </div>

              {automationResult.summary.canAutomate > 0 ? (
                <>
                  <p className="text-slate-400 text-sm">
                    {automationResult.dryRun ? (
                      <>
                        <span className="text-emerald-400 font-medium">{automationResult.summary.canAutomate}</span> manual removals can be converted to automated email opt-outs.
                        Click &quot;Execute Automation&quot; to process them.
                      </>
                    ) : (
                      <>
                        Successfully converted <span className="text-emerald-400 font-medium">{automationResult.summary.updated}</span> manual removals to automated!
                        They will be processed in the next cron run.
                      </>
                    )}
                  </p>

                  {/* Source Breakdown */}
                  {automationResult.sourceBreakdown.length > 0 && (
                    <div className="max-h-48 overflow-y-auto">
                      <p className="text-sm text-slate-400 mb-2">Sources that can be automated:</p>
                      <div className="space-y-1">
                        {automationResult.sourceBreakdown
                          .filter(s => s.canAutomate > 0)
                          .slice(0, 20)
                          .map((source) => (
                            <div key={source.source} className="flex justify-between text-sm">
                              <span className="text-slate-300">{source.source}</span>
                              <span className="text-emerald-400">{source.canAutomate}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-slate-400 text-sm">
                  No manual removals can be automated at this time. The remaining removals are from sources without known privacy email addresses.
                </p>
              )}

              {automationResult.summary.cannotAutomate > 0 && (
                <p className="text-xs text-slate-500">
                  {automationResult.summary.cannotAutomate} removals cannot be automated (unknown sources or form-only brokers).
                </p>
              )}
            </div>
          ) : null}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAutomationDialog(false)}
            >
              Cancel
            </Button>
            {automationResult?.dryRun && automationResult.summary.canAutomate > 0 && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                onClick={executeAutomation}
                disabled={automationExecuting}
              >
                {automationExecuting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Execute Automation ({automationResult.summary.canAutomate})
              </Button>
            )}
            {automationResult && !automationResult.dryRun && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setShowAutomationDialog(false)}
              >
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
