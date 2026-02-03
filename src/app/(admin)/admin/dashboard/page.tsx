"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FinanceSection } from "@/components/dashboard/executive/finance-section";
import { AnalyticsSection } from "@/components/dashboard/executive/analytics-section";
import { OperationsSection } from "@/components/dashboard/executive/operations-section";
import { UserActivitiesSection } from "@/components/dashboard/executive/user-activities-section";
import { IntegrationsSection } from "@/components/dashboard/integrations/integrations-section";
import { SupportSection } from "@/components/dashboard/support/support-section";
import { ExecutiveStatsResponse } from "@/lib/executive/types";
import {
  Loader2,
  TrendingUp,
  RefreshCw,
  DollarSign,
  BarChart3,
  Settings,
  Users,
  ShieldAlert,
  LogOut,
  Shield,
  Plug,
  Headphones,
  Cloud,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<ExecutiveStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("finance");
  const [vercelData, setVercelData] = useState<{
    configured: boolean;
    lastDeployment?: { state: string; createdAt: number; url?: string };
    analytics?: { pageViews: number; visitors: number };
  } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
      return;
    }
    if (status === "authenticated") {
      fetchExecutiveStats();
      fetchVercelStatus();
    }
  }, [status, router]);

  const fetchVercelStatus = async () => {
    try {
      console.log("[Admin] Fetching Vercel status...");
      const response = await fetch("/api/admin/integrations/vercel");
      console.log("[Admin] Vercel response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("[Admin] Vercel data received:", {
          configured: result.configured,
          deploymentsCount: result.deployments?.length,
          hasAnalytics: !!result.analytics
        });
        setVercelData({
          configured: result.configured,
          lastDeployment: result.deployments?.[0],
          analytics: result.analytics,
        });
      } else {
        const errorText = await response.text();
        console.error("[Admin] Vercel API error:", response.status, errorText);
      }
    } catch (err) {
      console.error("[Admin] Failed to fetch Vercel status:", err);
    }
  };

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
        setError("Access denied. Admin privileges required.");
        return;
      }

      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch executive stats");
      }

      const result = await response.json();
      setData(result);

      if (isRefresh) {
        toast.success("Dashboard data refreshed");
        fetchVercelStatus(); // Also refresh Vercel data
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/admin/login" });
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mx-auto" />
          <p className="text-slate-400">Loading executive dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="bg-slate-900/50 border-slate-800 max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <ShieldAlert className="h-12 w-12 text-red-400 mx-auto" />
            <h2 className="text-xl font-semibold text-white">Access Denied</h2>
            <p className="text-slate-400">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => fetchExecutiveStats()}
              >
                Try Again
              </Button>
              <Button
                variant="ghost"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-emerald-500" />
              <span className="text-xl font-bold text-white">GhostMyData</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">
                {session?.user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-slate-400 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-7 w-7 text-emerald-500" />
                Executive Dashboard
              </h1>
              <p className="text-slate-400 mt-1">
                Business metrics, analytics, and platform overview
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

          {/* Quick Stats - Interactive cards that switch tabs */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card
              className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40 cursor-pointer transition-all"
              onClick={() => setActiveTab("activities")}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Users</p>
                  <p className="text-xl font-bold text-white">
                    {data.platform.totalUsers.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-all"
              onClick={() => setActiveTab("analytics")}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Exposures Found</p>
                  <p className="text-xl font-bold text-white">
                    {data.platform.totalExposures.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:border-purple-500/40 cursor-pointer transition-all"
              onClick={() => setActiveTab("operations")}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Settings className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Pending Queue</p>
                  <p className="text-xl font-bold text-white">
                    {(data.operations.pendingRemovalRequests + data.operations.manualActionQueue).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Vercel Deployment Status */}
            <Card
              className={`bg-gradient-to-br cursor-pointer transition-all ${
                vercelData?.lastDeployment?.state === "READY"
                  ? "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40"
                  : vercelData?.lastDeployment?.state === "ERROR"
                  ? "from-red-500/10 to-red-500/5 border-red-500/20 hover:border-red-500/40"
                  : vercelData?.lastDeployment?.state === "BUILDING"
                  ? "from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40"
                  : "from-slate-500/10 to-slate-500/5 border-slate-500/20 hover:border-slate-500/40"
              }`}
              onClick={() => setActiveTab("integrations")}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-lg ${
                  vercelData?.lastDeployment?.state === "READY"
                    ? "bg-emerald-500/20"
                    : vercelData?.lastDeployment?.state === "ERROR"
                    ? "bg-red-500/20"
                    : vercelData?.lastDeployment?.state === "BUILDING"
                    ? "bg-blue-500/20"
                    : "bg-slate-500/20"
                }`}>
                  <Cloud className={`h-6 w-6 ${
                    vercelData?.lastDeployment?.state === "READY"
                      ? "text-emerald-400"
                      : vercelData?.lastDeployment?.state === "ERROR"
                      ? "text-red-400"
                      : vercelData?.lastDeployment?.state === "BUILDING"
                      ? "text-blue-400"
                      : "text-slate-400"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400">Vercel Deploy</p>
                  <div className="flex items-center gap-2">
                    {vercelData?.lastDeployment ? (
                      <>
                        <Badge
                          variant="outline"
                          className={`text-xs px-1.5 py-0 ${
                            vercelData.lastDeployment.state === "READY"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : vercelData.lastDeployment.state === "ERROR"
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : vercelData.lastDeployment.state === "BUILDING"
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                          }`}
                        >
                          {vercelData.lastDeployment.state === "READY" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {vercelData.lastDeployment.state === "ERROR" && <XCircle className="h-3 w-3 mr-1" />}
                          {vercelData.lastDeployment.state === "BUILDING" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                          {vercelData.lastDeployment.state === "QUEUED" && <Clock className="h-3 w-3 mr-1" />}
                          {vercelData.lastDeployment.state}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {new Date(vercelData.lastDeployment.createdAt).toLocaleDateString()}
                        </span>
                      </>
                    ) : vercelData?.configured === false ? (
                      <span className="text-sm text-slate-500">Not configured</span>
                    ) : (
                      <span className="text-sm text-slate-500">Loading...</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
              <TabsTrigger
                value="finance"
                className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 gap-2"
              >
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Finance</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger
                value="operations"
                className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 gap-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Operations</span>
              </TabsTrigger>
              <TabsTrigger
                value="activities"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 gap-2"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Activities</span>
              </TabsTrigger>
              <TabsTrigger
                value="integrations"
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 gap-2"
              >
                <Plug className="h-4 w-4" />
                <span className="hidden sm:inline">Integrations</span>
              </TabsTrigger>
              <TabsTrigger
                value="support"
                className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400 gap-2"
              >
                <Headphones className="h-4 w-4" />
                <span className="hidden sm:inline">Support</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="finance" className="mt-6">
              <FinanceSection data={data.finance} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <AnalyticsSection data={data.analytics} />
            </TabsContent>

            <TabsContent value="operations" className="mt-6">
              <OperationsSection data={data.operations} />
            </TabsContent>

            <TabsContent value="activities" className="mt-6">
              <UserActivitiesSection data={data.activities} />
            </TabsContent>

            <TabsContent value="integrations" className="mt-6">
              <IntegrationsSection />
            </TabsContent>

            <TabsContent value="support" className="mt-6">
              <SupportSection />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
