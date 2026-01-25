"use client";

import { OperationsMetrics } from "@/lib/executive/types";
import { MetricCard } from "./metric-card";
import { ProgressBar } from "./trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

interface OperationsSectionProps {
  data: OperationsMetrics;
}

export function OperationsSection({ data }: OperationsSectionProps) {
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
    </div>
  );
}
