"use client";

import { FinanceMetrics } from "@/lib/executive/types";
import { MetricCard } from "./metric-card";
import { DonutChart } from "./trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  AlertTriangle,
  UserPlus,
  Percent,
} from "lucide-react";

interface FinanceSectionProps {
  data: FinanceMetrics;
}

export function FinanceSection({ data }: FinanceSectionProps) {
  const planData = [
    { name: "Free", value: data.subscriptionsByPlan.FREE, color: "#64748b" },
    { name: "Pro", value: data.subscriptionsByPlan.PRO, color: "#3b82f6" },
    { name: "Enterprise", value: data.subscriptionsByPlan.ENTERPRISE, color: "#10b981" },
  ];

  const subscriptionStatusData = [
    { name: "Active", value: data.activeSubscriptions, color: "#10b981" },
    { name: "Canceled", value: data.canceledSubscriptions, color: "#ef4444" },
    { name: "Past Due", value: data.pastDueSubscriptions, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Monthly Recurring Revenue"
          value={data.mrr}
          format="currency"
          icon={DollarSign}
          variant="success"
          trend={{
            value: data.mrrGrowth,
            isPositive: data.mrrGrowth >= 0,
          }}
        />
        <MetricCard
          title="Average Revenue Per User"
          value={data.arpu}
          format="currency"
          icon={TrendingUp}
          variant="info"
          subtitle="Paid users only"
        />
        <MetricCard
          title="New Subscriptions"
          value={data.newSubscriptionsThisMonth}
          icon={UserPlus}
          variant="success"
          subtitle="This month"
        />
        <MetricCard
          title="Churn Rate"
          value={data.churnRate}
          format="percentage"
          icon={data.churnRate > 5 ? AlertTriangle : Percent}
          variant={data.churnRate > 5 ? "warning" : "default"}
          subtitle="This month"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <DonutChart
          title="Users by Plan"
          data={planData}
          height={250}
        />
        <DonutChart
          title="Subscription Status"
          data={subscriptionStatusData}
          height={250}
        />
      </div>

      {/* Subscription Details */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-400" />
            Subscription Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Free Tier</span>
                <Badge variant="secondary" className="bg-slate-700">
                  ${0}/mo
                </Badge>
              </div>
              <p className="text-2xl font-bold text-white">
                {data.subscriptionsByPlan.FREE.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">users</p>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-400">Pro</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  $11.99/mo
                </Badge>
              </div>
              <p className="text-2xl font-bold text-white">
                {data.subscriptionsByPlan.PRO.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                ${((data.subscriptionsByPlan.PRO * 1199) / 100).toLocaleString()}/mo revenue
              </p>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-400">Enterprise</span>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  $29.99/mo
                </Badge>
              </div>
              <p className="text-2xl font-bold text-white">
                {data.subscriptionsByPlan.ENTERPRISE.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                ${((data.subscriptionsByPlan.ENTERPRISE * 2999) / 100).toLocaleString()}/mo revenue
              </p>
            </div>
          </div>

          {/* Status Summary */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-400">Active:</span>
                <span className="text-white font-medium">{data.activeSubscriptions}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-slate-400">Canceled:</span>
                <span className="text-white font-medium">{data.canceledSubscriptions}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-400">Past Due:</span>
                <span className="text-white font-medium">{data.pastDueSubscriptions}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
