"use client";

import { AnalyticsMetrics } from "@/lib/executive/types";
import { MetricCard } from "./metric-card";
import { TrendChart } from "./trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Eye,
  Shield,
  CheckCircle,
  Scan,
  TrendingUp,
  BarChart3,
} from "lucide-react";

interface AnalyticsSectionProps {
  data: AnalyticsMetrics;
}

export function AnalyticsSection({ data }: AnalyticsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={data.totalUsers}
          icon={Users}
          variant="info"
          trend={{
            value: data.userGrowthRate,
            isPositive: data.userGrowthRate >= 0,
          }}
        />
        <MetricCard
          title="New Users This Month"
          value={data.newUsersThisMonth}
          icon={TrendingUp}
          variant="success"
        />
        <MetricCard
          title="Total Exposures Found"
          value={data.totalExposures}
          icon={Eye}
          variant="warning"
        />
        <MetricCard
          title="Removals Completed"
          value={data.totalRemovals}
          icon={Shield}
          variant="success"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Removal Success Rate"
          value={data.removalSuccessRate}
          format="percentage"
          icon={CheckCircle}
          variant={data.removalSuccessRate >= 90 ? "success" : data.removalSuccessRate >= 70 ? "warning" : "danger"}
        />
        <MetricCard
          title="Scan Completion Rate"
          value={data.scanCompletionRate}
          format="percentage"
          icon={Scan}
          variant={data.scanCompletionRate >= 95 ? "success" : data.scanCompletionRate >= 80 ? "warning" : "danger"}
        />
        <MetricCard
          title="Avg Exposures Per User"
          value={data.avgExposuresPerUser.toFixed(1)}
          icon={BarChart3}
          variant="default"
        />
      </div>

      {/* Trend Charts */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <TrendChart
          title="User Growth (12 Months)"
          data={data.trends.users}
          color="blue"
          type="area"
          height={200}
        />
        <TrendChart
          title="Exposures Found (12 Months)"
          data={data.trends.exposures}
          color="amber"
          type="area"
          height={200}
        />
        <TrendChart
          title="Removals Completed (12 Months)"
          data={data.trends.removals}
          color="emerald"
          type="area"
          height={200}
        />
      </div>

      {/* Summary Card */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-400" />
            Platform Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <p className="text-3xl font-bold text-blue-400">
                {data.userGrowthRate >= 0 ? "+" : ""}
                {data.userGrowthRate.toFixed(1)}%
              </p>
              <p className="text-sm text-slate-400 mt-1">User Growth</p>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <p className="text-3xl font-bold text-emerald-400">
                {data.removalSuccessRate.toFixed(0)}%
              </p>
              <p className="text-sm text-slate-400 mt-1">Removal Success</p>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <p className="text-3xl font-bold text-amber-400">
                {data.avgExposuresPerUser.toFixed(1)}
              </p>
              <p className="text-sm text-slate-400 mt-1">Avg Exposures/User</p>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <p className="text-3xl font-bold text-purple-400">
                {((data.totalRemovals / Math.max(data.totalExposures, 1)) * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-slate-400 mt-1">Exposure Resolution</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
