"use client";

import { useState, useEffect } from "react";
import { FinanceMetrics } from "@/lib/executive/types";
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
  DollarSign,
  Users,
  CreditCard,
  AlertTriangle,
  UserPlus,
  Percent,
  Loader2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";

interface FinanceSectionProps {
  data: FinanceMetrics;
}

interface UserListItem {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  createdAt: string;
}

type DialogType = "pro" | "enterprise" | "new" | "churned" | "all" | null;

export function FinanceSection({ data }: FinanceSectionProps) {
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dialogType) {
      fetchUsers(dialogType);
    }
  }, [dialogType]);

  const fetchUsers = async (type: DialogType) => {
    if (!type) return;
    setLoading(true);
    try {
      let url = "/api/admin/users?limit=50";
      if (type === "pro") {
        url = "/api/admin/users?limit=50&plan=PRO";
      } else if (type === "enterprise") {
        url = "/api/admin/users?limit=50&plan=ENTERPRISE";
      } else if (type === "new") {
        // Get users created this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        url = `/api/admin/users?limit=50&createdAfter=${startOfMonth.toISOString()}`;
      }
      // For "churned" and "all", we'd need special handling

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch users");
      const result = await response.json();
      setUsers(result.users || []);
    } catch {
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getDialogTitle = () => {
    switch (dialogType) {
      case "pro": return "Pro Users";
      case "enterprise": return "Enterprise Users";
      case "new": return "New Subscriptions This Month";
      case "churned": return "Churned Users This Month";
      case "all": return "All Paying Users";
      default: return "Users";
    }
  };

  const MetricCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    variant = "default",
    trend,
    onClick,
    format,
  }: {
    title: string;
    value: number;
    subtitle?: string;
    icon: React.ElementType;
    variant?: "default" | "success" | "warning" | "info";
    trend?: { value: number; isPositive: boolean };
    onClick?: () => void;
    format?: "currency" | "percentage";
  }) => {
    const variantStyles = {
      default: "from-slate-500/10 to-slate-500/5 border-slate-500/20",
      success: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
      warning: "from-amber-500/10 to-amber-500/5 border-amber-500/20",
      info: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
    };

    const iconStyles = {
      default: "bg-slate-500/20 text-slate-400",
      success: "bg-emerald-500/20 text-emerald-400",
      warning: "bg-amber-500/20 text-amber-400",
      info: "bg-blue-500/20 text-blue-400",
    };

    let displayValue: string;
    if (format === "currency") {
      displayValue = `$${(value / 100).toLocaleString()}`;
    } else if (format === "percentage") {
      displayValue = `${value}%`;
    } else {
      displayValue = value.toLocaleString();
    }

    return (
      <Card
        className={`bg-gradient-to-br ${variantStyles[variant]} ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${iconStyles[variant]}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 truncate">{title}</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-white">{displayValue}</p>
                {trend && (
                  <span className={`text-xs flex items-center ${trend.isPositive ? "text-emerald-400" : "text-red-400"}`}>
                    {trend.isPositive ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                    {trend.value >= 0 ? "+" : ""}{trend.value}%
                  </span>
                )}
              </div>
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="MRR"
          value={data.mrr}
          format="currency"
          icon={DollarSign}
          variant="success"
          trend={{
            value: data.mrrGrowth,
            isPositive: data.mrrGrowth >= 0,
          }}
          onClick={() => setDialogType("all")}
        />
        <MetricCard
          title="Pro Users"
          value={data.subscriptionsByPlan.PRO}
          icon={Users}
          variant="info"
          subtitle={`$${((data.subscriptionsByPlan.PRO * 1199) / 100).toLocaleString()}/mo`}
          onClick={() => setDialogType("pro")}
        />
        <MetricCard
          title="Enterprise Users"
          value={data.subscriptionsByPlan.ENTERPRISE}
          icon={Users}
          variant="success"
          subtitle={`$${((data.subscriptionsByPlan.ENTERPRISE * 2999) / 100).toLocaleString()}/mo`}
          onClick={() => setDialogType("enterprise")}
        />
        <MetricCard
          title="New Subscriptions"
          value={data.newSubscriptionsThisMonth}
          icon={UserPlus}
          variant="success"
          subtitle="This month"
          onClick={() => setDialogType("new")}
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
                  $0/mo
                </Badge>
              </div>
              <p className="text-2xl font-bold text-white">
                {data.subscriptionsByPlan.FREE.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">users</p>
            </div>

            <div
              className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg cursor-pointer hover:bg-blue-500/20 transition-colors"
              onClick={() => setDialogType("pro")}
            >
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

            <div
              className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg cursor-pointer hover:bg-emerald-500/20 transition-colors"
              onClick={() => setDialogType("enterprise")}
            >
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

      {/* User List Dialog */}
      <Dialog open={dialogType !== null} onOpenChange={(open) => !open && setDialogType(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white">{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
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
                    <TableHead className="text-slate-400">Joined</TableHead>
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
                      <TableCell className="text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
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
