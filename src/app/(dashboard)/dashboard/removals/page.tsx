"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Trash2,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Mail,
  FileText,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { DataSourceNames, type DataSource, type Severity } from "@/lib/types";

interface RemovalRequest {
  id: string;
  status: string;
  method: string;
  submittedAt: string | null;
  completedAt: string | null;
  attempts: number;
  lastError: string | null;
  createdAt: string;
  exposure: {
    id: string;
    source: DataSource;
    sourceName: string;
    sourceUrl: string | null;
    dataType: string;
    dataPreview: string | null;
    severity: Severity;
  };
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: typeof CheckCircle }
> = {
  PENDING: {
    label: "Pending",
    color: "bg-slate-500/20 text-slate-400",
    icon: Clock,
  },
  SUBMITTED: {
    label: "Submitted",
    color: "bg-blue-500/20 text-blue-400",
    icon: Mail,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-yellow-500/20 text-yellow-400",
    icon: RefreshCw,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-emerald-500/20 text-emerald-400",
    icon: CheckCircle,
  },
  FAILED: {
    label: "Failed",
    color: "bg-red-500/20 text-red-400",
    icon: XCircle,
  },
  REQUIRES_MANUAL: {
    label: "Manual Action Required",
    color: "bg-orange-500/20 text-orange-400",
    icon: AlertCircle,
  },
};

const methodLabels: Record<string, string> = {
  AUTO_FORM: "Automated Opt-out Form",
  AUTO_EMAIL: "Automated Email Request",
  API: "API Integration",
  MANUAL_GUIDE: "Manual Removal Guide",
};

export default function RemovalsPage() {
  const [removals, setRemovals] = useState<RemovalRequest[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRemovals();
  }, []);

  const fetchRemovals = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/removals/status");
      if (response.ok) {
        const data = await response.json();
        setRemovals(data.removals);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch removals:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalRemovals = Object.values(stats).reduce((a, b) => a + b, 0);
  const completedCount = stats.COMPLETED || 0;
  const progressPercent =
    totalRemovals > 0 ? Math.round((completedCount / totalRemovals) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Removal Requests</h1>
        <p className="text-slate-400">
          Track the status of your data removal requests
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-white">{totalRemovals}</div>
            <p className="text-sm text-slate-400">Total Requests</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-emerald-400">
              {completedCount}
            </div>
            <p className="text-sm text-slate-400">Completed</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-400">
              {(stats.SUBMITTED || 0) + (stats.IN_PROGRESS || 0)}
            </div>
            <p className="text-sm text-slate-400">In Progress</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-400">
              {(stats.FAILED || 0) + (stats.REQUIRES_MANUAL || 0)}
            </div>
            <p className="text-sm text-slate-400">Needs Attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Overall Progress</CardTitle>
          <CardDescription className="text-slate-400">
            {completedCount} of {totalRemovals} removals completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Progress</span>
              <span className="text-white">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-3 bg-slate-700" />
          </div>
        </CardContent>
      </Card>

      {/* Removal List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trash2 className="h-5 w-5 text-red-500" />
                All Removal Requests
              </CardTitle>
              <CardDescription className="text-slate-400">
                Click on a request to view details
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRemovals}
              className="border-slate-600"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : removals.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-300">
                No removal requests
              </h3>
              <p className="text-slate-500 mt-1">
                Request removal from the Exposures page
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {removals.map((removal) => {
                const config = statusConfig[removal.status] || statusConfig.PENDING;
                const StatusIcon = config.icon;

                return (
                  <div
                    key={removal.id}
                    className="p-4 bg-slate-700/30 rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg">
                          <StatusIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
                              {removal.exposure.sourceName}
                            </span>
                            <Badge
                              variant="outline"
                              className={config.color + " border-0"}
                            >
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400">
                            {DataSourceNames[removal.exposure.source] ||
                              removal.exposure.source}
                          </p>
                        </div>
                      </div>
                      {removal.exposure.sourceUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-white"
                          asChild
                        >
                          <a
                            href={removal.exposure.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-slate-400">
                        <FileText className="h-4 w-4" />
                        {methodLabels[removal.method] || removal.method}
                      </div>
                      {removal.submittedAt && (
                        <div className="text-slate-500">
                          Submitted:{" "}
                          {new Date(removal.submittedAt).toLocaleDateString()}
                        </div>
                      )}
                      {removal.attempts > 1 && (
                        <div className="text-slate-500">
                          Attempts: {removal.attempts}
                        </div>
                      )}
                    </div>

                    {removal.lastError && (
                      <div className="p-2 bg-red-500/10 rounded text-sm text-red-400">
                        Error: {removal.lastError}
                      </div>
                    )}

                    {removal.status === "REQUIRES_MANUAL" && (
                      <div className="p-3 bg-orange-500/10 rounded-lg">
                        <p className="text-sm text-orange-400 mb-2">
                          This source requires manual action. Follow these steps:
                        </p>
                        <ol className="text-sm text-slate-400 list-decimal list-inside space-y-1">
                          <li>Visit the source website</li>
                          <li>Find the opt-out or privacy settings</li>
                          <li>Submit a removal request with your information</li>
                          <li>
                            Mark as complete once you&apos;ve submitted the
                            request
                          </li>
                        </ol>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
