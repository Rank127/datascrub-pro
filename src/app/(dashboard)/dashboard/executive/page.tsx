"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FinanceSection } from "@/components/dashboard/executive/finance-section";
import { AnalyticsSection } from "@/components/dashboard/executive/analytics-section";
import { OperationsSection } from "@/components/dashboard/executive/operations-section";
import { UserActivitiesSection } from "@/components/dashboard/executive/user-activities-section";
import { UserManagementSection } from "@/components/dashboard/executive/user-management-section";
import { ExecutiveStatsResponse } from "@/lib/executive/types";
import {
  Loader2,
  TrendingUp,
  RefreshCw,
  DollarSign,
  BarChart3,
  Settings,
  Users,
  UserCog,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

export default function ExecutiveDashboardPage() {
  useSession(); // Ensure user is authenticated
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const defaultTab = ["finance", "analytics", "operations", "activities", "users"].includes(tabParam || "")
    ? tabParam!
    : "finance";

  const [data, setData] = useState<ExecutiveStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExecutiveStats();
  }, []);

  const fetchExecutiveStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch("/api/admin/executive-stats");

      if (response.status === 403) {
        setError("You don't have permission to access the executive dashboard. This dashboard is restricted to Admin, Legal, and Super Admin roles.");
        return;
      }

      if (response.status === 401) {
        setError("Please sign in to access the executive dashboard.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch executive stats");
      }

      const result = await response.json();
      setData(result);

      if (isRefresh) {
        toast.success("Dashboard data refreshed");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      toast.error("Failed to load executive dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mx-auto" />
          <p className="text-slate-400">Loading executive dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="bg-slate-900/50 border-slate-800 max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <ShieldAlert className="h-12 w-12 text-red-400 mx-auto" />
            <h2 className="text-xl font-semibold text-white">Access Denied</h2>
            <p className="text-slate-400">{error}</p>
            <Button
              variant="outline"
              onClick={() => fetchExecutiveStats()}
              className="mt-4"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-emerald-500" />
            Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Business metrics, analytics, and user management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            Last updated: {new Date(data.generatedAt).toLocaleString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchExecutiveStats(true)}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1.5 h-auto flex-wrap">
          <TabsTrigger
            value="finance"
            className="px-4 py-2.5 text-sm font-medium gap-2 data-[state=active]:bg-emerald-500/30 data-[state=active]:text-emerald-300 data-[state=active]:border-emerald-500/50 data-[state=active]:border hover:bg-emerald-500/10 hover:text-emerald-400 transition-all"
          >
            <DollarSign className="h-5 w-5" />
            <span>Finance</span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="px-4 py-2.5 text-sm font-medium gap-2 data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-300 data-[state=active]:border-blue-500/50 data-[state=active]:border hover:bg-blue-500/10 hover:text-blue-400 transition-all"
          >
            <BarChart3 className="h-5 w-5" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger
            value="operations"
            className="px-4 py-2.5 text-sm font-medium gap-2 data-[state=active]:bg-amber-500/30 data-[state=active]:text-amber-300 data-[state=active]:border-amber-500/50 data-[state=active]:border hover:bg-amber-500/10 hover:text-amber-400 transition-all"
          >
            <Settings className="h-5 w-5" />
            <span>Operations</span>
          </TabsTrigger>
          <TabsTrigger
            value="activities"
            className="px-4 py-2.5 text-sm font-medium gap-2 data-[state=active]:bg-purple-500/30 data-[state=active]:text-purple-300 data-[state=active]:border-purple-500/50 data-[state=active]:border hover:bg-purple-500/10 hover:text-purple-400 transition-all"
          >
            <Users className="h-5 w-5" />
            <span>Activities</span>
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="px-4 py-2.5 text-sm font-medium gap-2 data-[state=active]:bg-pink-500/30 data-[state=active]:text-pink-300 data-[state=active]:border-pink-500/50 data-[state=active]:border hover:bg-pink-500/10 hover:text-pink-400 transition-all"
          >
            <UserCog className="h-5 w-5" />
            <span>Users</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="finance" className="mt-6 p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
          <FinanceSection data={data.finance} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6 p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
          <AnalyticsSection data={data.analytics} />
        </TabsContent>

        <TabsContent value="operations" className="mt-6 p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
          <OperationsSection data={data.operations} platform={data.platform} />
        </TabsContent>

        <TabsContent value="activities" className="mt-6 p-4 rounded-lg border border-purple-500/20 bg-purple-500/5">
          <UserActivitiesSection data={data.activities} />
        </TabsContent>

        <TabsContent value="users" className="mt-6 p-4 rounded-lg border border-pink-500/20 bg-pink-500/5">
          <UserManagementSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
