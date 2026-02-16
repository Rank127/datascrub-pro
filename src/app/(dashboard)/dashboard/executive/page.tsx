"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Headphones,
  Crosshair,
  Sprout,
  Plug,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

// Lazy-load heavy tab sections — only the active tab is loaded
const TabLoader = () => (
  <div className="flex items-center justify-center py-20">
    <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
  </div>
);
const FinanceSection = dynamic(
  () => import("@/components/dashboard/executive/finance-section").then((m) => ({ default: m.FinanceSection })),
  { loading: TabLoader }
);
const AnalyticsSection = dynamic(
  () => import("@/components/dashboard/executive/analytics-section").then((m) => ({ default: m.AnalyticsSection })),
  { loading: TabLoader }
);
const OperationsSection = dynamic(
  () => import("@/components/dashboard/executive/operations-section").then((m) => ({ default: m.OperationsSection })),
  { loading: TabLoader }
);
const UserActivitiesSection = dynamic(
  () => import("@/components/dashboard/executive/user-activities-section").then((m) => ({ default: m.UserActivitiesSection })),
  { loading: TabLoader }
);
const UserManagementSection = dynamic(
  () => import("@/components/dashboard/executive/user-management-section").then((m) => ({ default: m.UserManagementSection })),
  { loading: TabLoader }
);
const SupportSection = dynamic(
  () => import("@/components/dashboard/support/support-section").then((m) => ({ default: m.SupportSection })),
  { loading: TabLoader }
);
const CompetitiveSection = dynamic(
  () => import("@/components/dashboard/executive/competitive-section").then((m) => ({ default: m.CompetitiveSection })),
  { loading: TabLoader }
);
const GrowthSection = dynamic(
  () => import("@/components/dashboard/executive/growth-section").then((m) => ({ default: m.GrowthSection })),
  { loading: TabLoader }
);
const IntegrationsSection = dynamic(
  () => import("@/components/dashboard/integrations/integrations-section").then((m) => ({ default: m.IntegrationsSection })),
  { loading: TabLoader }
);
const CorporateSection = dynamic(
  () => import("@/components/dashboard/executive/corporate-section").then((m) => ({ default: m.CorporateSection })),
  { loading: TabLoader }
);

// Wrapper component to handle Suspense boundary for useSearchParams
export default function ExecutiveDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    }>
      <ExecutiveDashboardContent />
    </Suspense>
  );
}

function ExecutiveDashboardContent() {
  useSession(); // Ensure user is authenticated
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const defaultTab = ["finance", "analytics", "operations", "activities", "users", "support", "integrations", "competitive", "growth", "corporate"].includes(tabParam || "")
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

      const response = await fetch("/api/admin/executive-stats", {
        cache: "no-store",
      });

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
            <span className="hidden sm:inline">Finance</span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="px-4 py-2.5 text-sm font-medium gap-2 data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-300 data-[state=active]:border-blue-500/50 data-[state=active]:border hover:bg-blue-500/10 hover:text-blue-400 transition-all"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger
            value="operations"
            className="px-4 py-2.5 text-sm font-medium gap-2 data-[state=active]:bg-amber-500/30 data-[state=active]:text-amber-300 data-[state=active]:border-amber-500/50 data-[state=active]:border hover:bg-amber-500/10 hover:text-amber-400 transition-all"
          >
            <Settings className="h-5 w-5" />
            <span className="hidden sm:inline">Operations</span>
          </TabsTrigger>
          <TabsTrigger
            value="activities"
            className="px-4 py-2.5 text-sm font-medium gap-2 data-[state=active]:bg-purple-500/30 data-[state=active]:text-purple-300 data-[state=active]:border-purple-500/50 data-[state=active]:border hover:bg-purple-500/10 hover:text-purple-400 transition-all"
          >
            <Users className="h-5 w-5" />
            <span className="hidden sm:inline">Activities</span>
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="px-4 py-2.5 text-sm font-medium gap-2 data-[state=active]:bg-pink-500/30 data-[state=active]:text-pink-300 data-[state=active]:border-pink-500/50 data-[state=active]:border hover:bg-pink-500/10 hover:text-pink-400 transition-all"
          >
            <UserCog className="h-5 w-5" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger
            value="support"
            className="px-4 py-2.5 text-sm font-medium gap-2 data-[state=active]:bg-cyan-500/30 data-[state=active]:text-cyan-300 data-[state=active]:border-cyan-500/50 data-[state=active]:border hover:bg-cyan-500/10 hover:text-cyan-400 transition-all"
          >
            <Headphones className="h-5 w-5" />
            <span className="hidden sm:inline">Support</span>
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="px-4 py-2.5 text-sm font-medium gap-2 data-[state=active]:bg-teal-500/30 data-[state=active]:text-teal-300 data-[state=active]:border-teal-500/50 data-[state=active]:border hover:bg-teal-500/10 hover:text-teal-400 transition-all"
          >
            <Plug className="h-5 w-5" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger
            value="competitive"
            className="px-4 py-2.5 text-sm font-medium gap-2 data-[state=active]:bg-indigo-500/30 data-[state=active]:text-indigo-300 data-[state=active]:border-indigo-500/50 data-[state=active]:border hover:bg-indigo-500/10 hover:text-indigo-400 transition-all"
          >
            <Crosshair className="h-5 w-5" />
            <span className="hidden sm:inline">Competitive</span>
          </TabsTrigger>
          <TabsTrigger
            value="growth"
            className="px-4 py-2.5 text-sm font-medium gap-2 data-[state=active]:bg-green-500/30 data-[state=active]:text-green-300 data-[state=active]:border-green-500/50 data-[state=active]:border hover:bg-green-500/10 hover:text-green-400 transition-all"
          >
            <Sprout className="h-5 w-5" />
            <span className="hidden sm:inline">Growth</span>
          </TabsTrigger>
          <TabsTrigger
            value="corporate"
            className="px-4 py-2.5 text-sm font-medium gap-2 data-[state=active]:bg-violet-500/30 data-[state=active]:text-violet-300 data-[state=active]:border-violet-500/50 data-[state=active]:border hover:bg-violet-500/10 hover:text-violet-400 transition-all"
          >
            <Briefcase className="h-5 w-5" />
            <span className="hidden sm:inline">Corporate</span>
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

        <TabsContent value="support" className="mt-6 p-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
          <SupportSection />
        </TabsContent>

        <TabsContent value="integrations" className="mt-6 p-4 rounded-lg border border-teal-500/20 bg-teal-500/5">
          <IntegrationsSection />
        </TabsContent>

        <TabsContent value="competitive" className="mt-6 p-4 rounded-lg border border-indigo-500/20 bg-indigo-500/5">
          <CompetitiveSection data={data.competitive} />
        </TabsContent>

        <TabsContent value="growth" className="mt-6 p-4 rounded-lg border border-green-500/20 bg-green-500/5">
          <GrowthSection data={data.growth} />
        </TabsContent>

        <TabsContent value="corporate" className="mt-6 p-4 rounded-lg border border-violet-500/20 bg-violet-500/5">
          <CorporateSection data={data.corporate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
