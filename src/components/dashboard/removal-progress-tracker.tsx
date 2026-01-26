"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Zap,
  Layers,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingDown,
  Target,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RemovalProgressTrackerProps {
  onStartWizard?: () => void;
  className?: string;
}

interface BulkStats {
  totalPendingExposures: number;
  parentBrokers: number;
  standaloneBrokers: number;
  subsidiaryBrokers: number;
  actionsNeeded: number;
  actionsSaved: number;
  savingsPercent: number;
}

export function RemovalProgressTracker({ onStartWizard, className }: RemovalProgressTrackerProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BulkStats | null>(null);
  const [removalStats, setRemovalStats] = useState<{
    completed: number;
    inProgress: number;
    pending: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [bulkResponse, dashResponse] = await Promise.all([
        fetch("/api/removals/bulk"),
        fetch("/api/dashboard/stats"),
      ]);

      if (bulkResponse.ok) {
        const bulkData = await bulkResponse.json();
        setStats(bulkData);
      }

      if (dashResponse.ok) {
        const dashData = await dashResponse.json();
        setRemovalStats({
          completed: dashData.stats?.removedExposures || 0,
          inProgress: dashData.stats?.pendingRemovals || 0,
          pending: dashData.stats?.activeExposures || 0,
          total: dashData.stats?.totalExposures || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalPendingExposures === 0) {
    return null;
  }

  const overallProgress = removalStats
    ? Math.round((removalStats.completed / Math.max(removalStats.total, 1)) * 100)
    : 0;

  return (
    <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-400" />
              Removal Progress
            </CardTitle>
            <CardDescription className="text-slate-400">
              Track your data removal journey
            </CardDescription>
          </div>
          {stats.savingsPercent > 0 && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <TrendingDown className="h-3 w-3 mr-1" />
              {stats.savingsPercent}% fewer actions needed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Overall Removal Progress</span>
            <span className="text-white font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-3 bg-slate-700" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-white">{removalStats?.completed || 0}</p>
            <p className="text-xs text-slate-400">Completed</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-yellow-400" />
            </div>
            <p className="text-xl font-bold text-white">{removalStats?.inProgress || 0}</p>
            <p className="text-xs text-slate-400">In Progress</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Layers className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-xl font-bold text-white">{stats.actionsNeeded}</p>
            <p className="text-xs text-slate-400">Actions Needed</p>
          </div>
        </div>

        {/* Consolidation Info */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">Smart Consolidation Active</span>
          </div>
          <p className="text-xs text-slate-400">
            {stats.totalPendingExposures} pending exposures consolidated into{" "}
            <span className="text-emerald-400 font-medium">{stats.actionsNeeded} actions</span>.
            {stats.parentBrokers > 0 && (
              <span> {stats.parentBrokers} parent brokers cover {stats.subsidiaryBrokers} subsidiaries.</span>
            )}
          </p>
        </div>

        {/* CTA Button */}
        {stats.actionsNeeded > 0 && (
          <Button
            onClick={onStartWizard}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            Start Removal Wizard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
