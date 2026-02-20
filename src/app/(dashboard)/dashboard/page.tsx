"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProtectionStatus } from "@/components/dashboard/protection-status";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { CompactExposures } from "@/components/dashboard/compact-exposures";
import { RemovalProgressCompact } from "@/components/dashboard/removal-progress-compact";
import { BrokerStatusCompact } from "@/components/dashboard/broker-status-compact";
import { RemovalWizard } from "@/components/dashboard/removal-wizard";
import { ReferralWidget } from "@/components/dashboard/referral-widget";
import { Search, Loader2, Bot, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { DataSource, ExposureType, Severity } from "@/lib/types";

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
  aiProtection?: {
    total: number;
    aiTraining: number;
    facialRecognition: number;
    voiceCloning: number;
    optedOut: number;
  };
  userPlan?: string;
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
  exposedFields?: string | null;
}

interface BrokerStat {
  source: string;
  sourceName: string;
  exposureCount: number;
  completedCount: number;
  inProgressCount: number;
  pendingCount: number;
  status: string;
  lastCompletedAt?: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentExposures: Exposure[];
  removalProgress: {
    dataBrokers: RemovalProgress;
    breaches: RemovalProgress;
    socialMedia: RemovalProgress;
    aiProtection: RemovalProgress;
  };
  protectionScore: number;
  timeSaved: {
    hours: number;
    minutes: number;
    estimatedValue: number;
  };
  brokerStats: BrokerStat[];
  maxExposure?: { found: number; totalKnown: number };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [showRemovalWizard, setShowRemovalWizard] = useState(false);

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

  const handleRemove = async (exposureId: string) => {
    try {
      const response = await fetch("/api/removals/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exposureId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to request removal");
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
    aiProtection: { total: 0, aiTraining: 0, facialRecognition: 0, voiceCloning: 0, optedOut: 0 },
    userPlan: "FREE",
  };

  const removalProgress = data?.removalProgress || {
    dataBrokers: { completed: 0, total: 0, percentage: 0 },
    breaches: { completed: 0, total: 0, percentage: 0 },
    socialMedia: { completed: 0, total: 0, percentage: 0 },
    aiProtection: { completed: 0, total: 0, percentage: 0 },
  };

  const recentExposures = data?.recentExposures || [];
  const protectionScore = data?.protectionScore ?? 100;
  const timeSaved = data?.timeSaved || { hours: 0, minutes: 0, estimatedValue: 0 };
  const brokerStats = data?.brokerStats || [];

  // Map exposures to the compact format
  const compactExposures = recentExposures.map((exp) => ({
    id: exp.id,
    source: exp.source as DataSource,
    sourceName: exp.sourceName,
    dataType: exp.dataType as ExposureType,
    severity: exp.severity as Severity,
    status: exp.status,
    isWhitelisted: exp.isWhitelisted,
    exposedFields: exp.exposedFields as string | null | undefined,
  }));

  return (
    <div className="space-y-4">
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

      {/* 1. Protection Status - Consolidated hero metrics */}
      <ProtectionStatus
        protectionScore={protectionScore}
        removedCount={stats.removedExposures}
        totalCount={stats.totalExposures}
        timeSaved={timeSaved}
        riskScore={stats.riskScore}
        maxExposure={data?.maxExposure}
        userPlan={stats.userPlan}
      />

      {/* 2. Quick Stats - Collapsible inline stats */}
      <QuickStats
        activeExposures={stats.activeExposures}
        submittedRemovals={stats.totalRemovalRequests}
        removedCount={stats.removedExposures}
        manualAction={{ done: stats.manualAction.done, total: stats.manualAction.total }}
        whitelistedCount={stats.whitelistedItems}
      />

      {/* 3. Removal Progress - Single bar with optional breakdown */}
      {!showRemovalWizard && (
        <RemovalProgressCompact
          removalProgress={removalProgress}
          pendingRemovals={stats.activeExposures}
          onStartWizard={() => setShowRemovalWizard(true)}
        />
      )}

      {/* Removal Wizard - Full wizard mode */}
      {showRemovalWizard && (
        <RemovalWizard
          onComplete={() => {
            setShowRemovalWizard(false);
            fetchDashboardData();
          }}
          onClose={() => setShowRemovalWizard(false)}
        />
      )}

      {/* 4. Recent Exposures - Compact table view */}
      {compactExposures.length > 0 && (
        <CompactExposures
          exposures={compactExposures}
          onRemove={handleRemove}
          onWhitelist={handleWhitelist}
        />
      )}

      {/* 5. Broker Status - Collapsed by default */}
      <BrokerStatusCompact brokers={brokerStats} />

      {/* 6. Referral Widget - Refer & Earn */}
      <ReferralWidget />

      {/* AI Shield - Only show for Enterprise users, compact summary */}
      {stats.userPlan === "ENTERPRISE" && stats.aiProtection && stats.aiProtection.total > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Bot className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <span className="text-sm font-medium text-white">AI Shield Active</span>
                  <span className="text-xs text-slate-400 ml-2">
                    {stats.aiProtection.optedOut}/{stats.aiProtection.total} sources opted out
                  </span>
                </div>
              </div>
              <Link href="/dashboard/ai-protection">
                <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 h-7">
                  View details
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No data state - for new users */}
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
    </div>
  );
}
