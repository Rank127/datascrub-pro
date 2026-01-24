"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RiskScore } from "@/components/dashboard/risk-score";
import { ExposureCard } from "@/components/dashboard/exposure-card";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";
import {
  AlertTriangle,
  Search,
  Shield,
  Trash2,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Loader2,
  HandHelping,
  SendHorizontal,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface DashboardStats {
  totalExposures: number;
  activeExposures: number;
  removedExposures: number;
  whitelistedItems: number;
  pendingRemovals: number;
  totalRemovalRequests: number;
  riskScore: number;
  manualAction: {
    total: number;
    done: number;
    pending: number;
  };
}

interface RemovalProgress {
  completed: number;
  total: number;
  percentage: number;
}

interface Exposure {
  id: string;
  source: string;
  sourceName: string;
  sourceUrl: string | null;
  dataType: string;
  dataPreview: string | null;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: string;
  isWhitelisted: boolean;
  firstFoundAt: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentExposures: Exposure[];
  removalProgress: {
    dataBrokers: RemovalProgress;
    breaches: RemovalProgress;
    socialMedia: RemovalProgress;
  };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleWhitelist = async (exposureId: string) => {
    try {
      const response = await fetch("/api/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exposureId }),
      });
      if (!response.ok) throw new Error("Failed to whitelist");
      toast.success("Added to whitelist");
      fetchDashboardData();
    } catch {
      toast.error("Failed to add to whitelist");
    }
  };

  const handleUnwhitelist = async (exposureId: string) => {
    try {
      const response = await fetch(`/api/whitelist?exposureId=${exposureId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove from whitelist");
      toast.success("Removed from whitelist");
      fetchDashboardData();
    } catch {
      toast.error("Failed to remove from whitelist");
    }
  };

  const handleRemove = async (exposureId: string) => {
    try {
      const response = await fetch("/api/removals/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exposureId }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to request removal");
      }
      toast.success("Removal request submitted");
      fetchDashboardData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to request removal");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const stats = data?.stats || {
    totalExposures: 0,
    activeExposures: 0,
    removedExposures: 0,
    whitelistedItems: 0,
    pendingRemovals: 0,
    totalRemovalRequests: 0,
    riskScore: 0,
    manualAction: { total: 0, done: 0, pending: 0 },
  };

  const removalProgress = data?.removalProgress || {
    dataBrokers: { completed: 0, total: 0, percentage: 0 },
    breaches: { completed: 0, total: 0, percentage: 0 },
    socialMedia: { completed: 0, total: 0, percentage: 0 },
  };

  const recentExposures = data?.recentExposures || [];

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {session?.user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-slate-400">
            Here&apos;s an overview of your data exposure
          </p>
        </div>
        <Link href="/dashboard/scan">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Search className="mr-2 h-4 w-4" />
            Start New Scan
          </Button>
        </Link>
      </div>

      {/* Upgrade Banner - shows for FREE users only */}
      <UpgradeBanner variant="card" />

      {/* Risk Score and Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
        {/* Risk Score Card */}
        <Link href="/dashboard/exposures" className="md:col-span-2 lg:col-span-1">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:border-slate-600 transition-all cursor-pointer h-full">
            <CardContent className="flex items-center justify-center py-6">
              <RiskScore score={stats.riskScore} size="md" />
            </CardContent>
          </Card>
        </Link>

        {/* Active Exposures */}
        <Link href="/dashboard/exposures?status=ACTIVE">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:border-orange-500/50 transition-all cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Active Exposures
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.activeExposures}
              </div>
              <div className="flex items-center text-xs text-slate-500">
                {stats.activeExposures > 0 ? (
                  <>
                    <TrendingUp className="mr-1 h-3 w-3 text-red-400" />
                    <span className="text-red-400">Needs attention</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="mr-1 h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">All clear</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Submitted for Removal */}
        <Link href="/dashboard/removals">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:border-purple-500/50 transition-all cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Submitted
              </CardTitle>
              <SendHorizontal className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.totalRemovalRequests}
              </div>
              <p className="text-xs text-slate-500">
                {stats.pendingRemovals > 0
                  ? `${stats.pendingRemovals} in progress`
                  : "Removal requests"}
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Removed */}
        <Link href="/dashboard/removals">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:border-emerald-500/50 transition-all cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Removed
              </CardTitle>
              <Trash2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.removedExposures}
              </div>
              <div className="flex items-center text-xs text-emerald-400">
                <TrendingDown className="mr-1 h-3 w-3" />
                {stats.removedExposures > 0 ? "Protected" : "No removals yet"}
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Manual Actions */}
        <Link href="/dashboard/exposures?manualAction=pending">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:border-amber-500/50 transition-all cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Manual Actions
              </CardTitle>
              <HandHelping className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.manualAction.done}/{stats.manualAction.total}
              </div>
              <p className="text-xs text-slate-500">
                {stats.manualAction.pending > 0
                  ? `${stats.manualAction.pending} pending`
                  : "All done"}
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Whitelisted */}
        <Link href="/dashboard/whitelist">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:border-blue-500/50 transition-all cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Whitelisted
              </CardTitle>
              <Shield className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.whitelistedItems}
              </div>
              <p className="text-xs text-slate-500">
                Accounts you want to keep
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Pending Removals Progress */}
      {(removalProgress.dataBrokers.total > 0 || removalProgress.breaches.total > 0 || removalProgress.socialMedia.total > 0) && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Removal Progress</CardTitle>
            <CardDescription className="text-slate-400">
              {stats.pendingRemovals} removal requests in progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {removalProgress.dataBrokers.total > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Data Brokers</span>
                  <span className="text-white">
                    {removalProgress.dataBrokers.completed}/{removalProgress.dataBrokers.total} completed
                  </span>
                </div>
                <Progress value={removalProgress.dataBrokers.percentage} className="h-2 bg-slate-700" />
              </div>
            )}
            {removalProgress.breaches.total > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Breach Notifications</span>
                  <span className="text-white">
                    {removalProgress.breaches.completed}/{removalProgress.breaches.total} completed
                  </span>
                </div>
                <Progress value={removalProgress.breaches.percentage} className="h-2 bg-slate-700" />
              </div>
            )}
            {removalProgress.socialMedia.total > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Social Media</span>
                  <span className="text-white">
                    {removalProgress.socialMedia.completed}/{removalProgress.socialMedia.total} completed
                  </span>
                </div>
                <Progress value={removalProgress.socialMedia.percentage} className="h-2 bg-slate-700" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No data state */}
      {stats.totalExposures === 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-12 w-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No exposures found yet</h3>
            <p className="text-slate-400 mb-4">
              Start a scan to discover where your personal data appears online
            </p>
            <Link href="/dashboard/scan">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Search className="mr-2 h-4 w-4" />
                Start Your First Scan
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Recent Exposures */}
      {recentExposures.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Recent Exposures</CardTitle>
              <CardDescription className="text-slate-400">
                Latest data exposures found in your scans
              </CardDescription>
            </div>
            <Link href="/dashboard/exposures">
              <Button variant="ghost" className="text-emerald-500 hover:text-emerald-400">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentExposures.map((exposure) => (
              <ExposureCard
                key={exposure.id}
                id={exposure.id}
                source={exposure.source as "SPOKEO" | "WHITEPAGES" | "BEENVERIFIED" | "INTELIUS" | "PEOPLEFINDER" | "TRUEPEOPLESEARCH" | "RADARIS" | "HAVEIBEENPWNED" | "DEHASHED" | "BREACH_DB" | "DARK_WEB_MARKET" | "PASTE_SITE" | "DARK_WEB_FORUM" | "LINKEDIN" | "FACEBOOK" | "TWITTER" | "INSTAGRAM" | "TIKTOK" | "REDDIT" | "OTHER"}
                sourceName={exposure.sourceName}
                sourceUrl={exposure.sourceUrl}
                dataType={exposure.dataType as "EMAIL" | "PHONE" | "NAME" | "ADDRESS" | "DOB" | "SSN" | "PHOTO" | "USERNAME" | "FINANCIAL" | "COMBINED_PROFILE"}
                dataPreview={exposure.dataPreview}
                severity={exposure.severity}
                status={exposure.status as "ACTIVE" | "REMOVAL_PENDING" | "REMOVAL_IN_PROGRESS" | "REMOVED" | "WHITELISTED"}
                isWhitelisted={exposure.isWhitelisted}
                firstFoundAt={new Date(exposure.firstFoundAt)}
                onWhitelist={() => handleWhitelist(exposure.id)}
                onUnwhitelist={() => handleUnwhitelist(exposure.id)}
                onRemove={() => handleRemove(exposure.id)}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
