"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Trash2,
  CheckCircle,
  Clock,
  Eye,
  ExternalLink,
  RefreshCw,
  Camera,
  Image as ImageIcon,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  Shield,
  BarChart3,
} from "lucide-react";
import { RemovalPipeline } from "@/components/dashboard/removal-pipeline";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LoadingSpinner } from "@/components/dashboard/loading-spinner";
import { DataSourceNames, type DataSource, type Severity } from "@/lib/types";
import { getBrokerComplianceTier } from "@/lib/removals/user-status";

interface RemovalRequest {
  id: string;
  status: string;
  method: string;
  submittedAt: string | null;
  completedAt: string | null;
  attempts: number;
  lastError: string | null;
  createdAt: string;
  optOutUrl: string | null;
  optOutEmail: string | null;
  estimatedDays: number | null;
  // User-facing status fields
  userStatus: "in_progress" | "completed" | "monitoring";
  userStatusLabel: string;
  userStatusColor: string;
  estimatedCompletionDate: string | null;
  eta: string | null;
  // Screenshot proof fields
  beforeScreenshot: string | null;
  beforeScreenshotAt: string | null;
  afterScreenshot: string | null;
  afterScreenshotAt: string | null;
  formScreenshot: string | null;
  formScreenshotAt: string | null;
  exposure: {
    id: string;
    source: DataSource;
    sourceName: string;
    sourceUrl: string | null;
    dataType: string;
    dataPreview: string | null;
    severity: Severity;
    proofScreenshot: string | null;
    proofScreenshotAt: string | null;
  };
}

interface SimplifiedStats {
  inProgress: number;
  completed: number;
  monitoring: number;
  total: number;
}

// Internal status labels for tooltips
const internalStatusLabels: Record<string, string> = {
  PENDING: "Queued for processing",
  SUBMITTED: "Opt-out request sent to broker",
  IN_PROGRESS: "Broker acknowledged, processing",
  COMPLETED: "Verified removed",
  FAILED: "Will retry automatically",
  REQUIRES_MANUAL: "Being handled by our team",
  ACKNOWLEDGED: "Breach alert — monitoring",
  SKIPPED: "Monitoring",
};

const methodLabels: Record<string, string> = {
  AUTO_FORM: "Automated Opt-out",
  AUTO_EMAIL: "Automated Email",
  API: "API Integration",
  MANUAL_GUIDE: "Team Assisted",
};

// Screenshot Proof Dialog Component
function ScreenshotProofDialog({ removal }: { removal: RemovalRequest }) {
  const beforeScreenshot = removal.beforeScreenshot || removal.exposure.proofScreenshot;
  const afterScreenshot = removal.afterScreenshot;
  const hasProof = beforeScreenshot || afterScreenshot;

  if (!hasProof) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-emerald-600 text-emerald-400 hover:bg-emerald-600/20"
        >
          <Camera className="mr-2 h-4 w-4" />
          View Proof
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Camera className="h-5 w-5 text-emerald-500" />
            Removal Proof - {removal.exposure.sourceName}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Screenshots showing the data before and after removal
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {/* Before Screenshot */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-red-400">Before Removal</h4>
              {(removal.beforeScreenshotAt || removal.exposure.proofScreenshotAt) && (
                <span className="text-xs text-slate-500">
                  {new Date(removal.beforeScreenshotAt || removal.exposure.proofScreenshotAt!).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
              {beforeScreenshot ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={beforeScreenshot}
                  alt="Before removal"
                  className="w-full h-auto"
                  loading="lazy"
                />
              ) : (
                <div className="flex items-center justify-center h-48 text-slate-500">
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No screenshot available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* After Screenshot */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-emerald-400">After Removal</h4>
              {removal.afterScreenshotAt && (
                <span className="text-xs text-slate-500">
                  {new Date(removal.afterScreenshotAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
              {afterScreenshot ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={afterScreenshot}
                  alt="After removal"
                  className="w-full h-auto"
                  loading="lazy"
                />
              ) : (
                <div className="flex items-center justify-center h-48 text-slate-500">
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">
                      {removal.status === "COMPLETED"
                        ? "Screenshot pending"
                        : "Available after verification"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Screenshot if available */}
        {removal.formScreenshot && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-blue-400">Opt-out Form Submission</h4>
              {removal.formScreenshotAt && (
                <span className="text-xs text-slate-500">
                  {new Date(removal.formScreenshotAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={removal.formScreenshot}
                alt="Form submission"
                className="w-full h-auto max-h-64 object-contain"
                loading="lazy"
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// User-facing status icon
function StatusIcon({ userStatus }: { userStatus: string }) {
  switch (userStatus) {
    case "completed":
      return <CheckCircle className="h-5 w-5 text-emerald-400" />;
    case "monitoring":
      return <Eye className="h-5 w-5 text-purple-400" />;
    default:
      return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />;
  }
}

export default function RemovalsPage() {
  const [removals, setRemovals] = useState<RemovalRequest[]>([]);
  const [simplifiedStats, setSimplifiedStats] = useState<SimplifiedStats>({
    inProgress: 0,
    completed: 0,
    monitoring: 0,
    total: 0,
  });
  const [rawStats, setRawStats] = useState<Record<string, number>>({});
  const [brokerMetrics, setBrokerMetrics] = useState<Record<string, {
    totalCompleted: number;
    avgDays: number;
    estimatedDays: number;
    complianceStatus: "fast" | "on-time" | "slow" | "non-compliant";
  }>>({});
  const [platformBrokerData, setPlatformBrokerData] = useState<Record<string, {
    successRate: number;
    completionsTotal: number;
    isHealthy?: boolean;
  }>>({});
  const [showBrokerRatings, setShowBrokerRatings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

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
        setRawStats(data.stats || {});
        setBrokerMetrics(data.brokerMetrics || {});
        setPlatformBrokerData(data.platformBrokerData || {});
        setSimplifiedStats(
          data.simplifiedStats || {
            inProgress: 0,
            completed: 0,
            monitoring: 0,
            total: 0,
          }
        );
      }
    } catch (error) {
      console.error("Failed to fetch removals:", error);
      toast.error("Failed to load removal requests");
    } finally {
      setLoading(false);
    }
  };

  const { inProgress, completed, monitoring, total } = simplifiedStats;
  const activeWorkMessage =
    inProgress > 0
      ? `We're actively working on ${inProgress} removal${inProgress !== 1 ? "s" : ""}`
      : completed > 0
        ? "All removals completed!"
        : "No removals in progress";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Removal Requests"
        description="Track the status of your data removal requests"
      />

      {/* Simplified Stats — 3 cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          value={inProgress}
          label="In Progress"
          color="blue"
          icon={Loader2}
        />
        <StatCard
          value={completed}
          label="Removed"
          color="emerald"
          icon={CheckCircle}
        />
        <StatCard
          value={monitoring}
          label="Monitoring"
          color="purple"
          icon={Shield}
        />
      </div>

      {/* Overall Progress — framed positively */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Removal Progress</CardTitle>
          <CardDescription className="text-slate-400">
            {activeWorkMessage}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">
                {completed} of {total} removals completed
              </span>
              <span className="text-white">
                {total > 0
                  ? Math.round((completed / total) * 100)
                  : 0}
                %
              </span>
            </div>
            <Progress
              value={total > 0 ? (completed / total) * 100 : 0}
              className="h-3 bg-slate-700"
            />
            {inProgress > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                Most brokers process removal requests within 7-45 days per
                CCPA/GDPR requirements.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Visualization */}
      <RemovalPipeline stats={rawStats} />

      {/* Broker Compliance Ratings */}
      {(Object.keys(brokerMetrics).length > 0 || Object.keys(platformBrokerData).length > 0) && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <button
              onClick={() => setShowBrokerRatings(!showBrokerRatings)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
                <CardTitle className="text-white">Broker Compliance Ratings</CardTitle>
              </div>
              {showBrokerRatings ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </button>
            <CardDescription className="text-slate-400">
              How quickly brokers process removal requests
            </CardDescription>
          </CardHeader>
          {showBrokerRatings && (
            <CardContent className="space-y-4">
              {/* Personal broker metrics (from user's completed removals) */}
              {Object.keys(brokerMetrics).length > 0 && (
                <div className="grid gap-3">
                  {Object.entries(brokerMetrics)
                    .sort((a, b) => a[1].avgDays - b[1].avgDays)
                    .map(([broker, metrics]) => {
                      const statusColors: Record<string, string> = {
                        fast: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                        "on-time": "bg-blue-500/20 text-blue-400 border-blue-500/30",
                        slow: "bg-amber-500/20 text-amber-400 border-amber-500/30",
                        "non-compliant": "bg-red-500/20 text-red-400 border-red-500/30",
                      };
                      const statusLabels: Record<string, string> = {
                        fast: "Fast",
                        "on-time": "On Time",
                        slow: "Slow",
                        "non-compliant": "Non-Compliant",
                      };
                      return (
                        <div key={broker} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-white">{broker}</span>
                            <Badge variant="outline" className={statusColors[metrics.complianceStatus]}>
                              {statusLabels[metrics.complianceStatus]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span>{Math.round(metrics.avgDays)}d avg</span>
                            <span className="text-slate-600">|</span>
                            <span>{metrics.totalCompleted} removed</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Platform-wide broker ratings (shown when user has no personal completions or as supplement) */}
              {Object.keys(platformBrokerData).length > 0 && (
                <div className="space-y-3">
                  {Object.keys(brokerMetrics).length > 0 && (
                    <div className="border-t border-slate-600 pt-3" />
                  )}
                  <p className="text-xs text-slate-500">
                    Based on platform-wide data across all users
                  </p>
                  <div className="grid gap-2">
                    {Object.entries(platformBrokerData)
                      .sort((a, b) => b[1].successRate - a[1].successRate)
                      .map(([source, data]) => {
                        const indicator = getBrokerComplianceTier(data.successRate);
                        return (
                          <div key={source} className="flex items-center justify-between p-2.5 bg-slate-700/20 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white">
                                {DataSourceNames[source as keyof typeof DataSourceNames] || source}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-xs border-0 ${indicator.bgColor} ${indicator.color}`}
                                title={indicator.description}
                              >
                                {indicator.label}
                              </Badge>
                              {data.isHealthy === false && (
                                <span className="text-xs text-amber-400" title="Opt-out form temporarily unavailable — using alternative methods">
                                  ⚠
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">
                              {data.completionsTotal} removals completed
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Help Section */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-white">How Removals Work</CardTitle>
            </div>
            {showHelp ? (
              <ChevronUp className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400" />
            )}
          </button>
        </CardHeader>
        {showHelp && (
          <CardContent className="pt-0 space-y-4">
            <div className="grid gap-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                <Loader2 className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <span className="font-medium text-blue-300">In Progress</span>
                  <p className="text-slate-400">
                    We&apos;ve sent the removal request to the data broker and are actively
                    following up. This includes queued requests, sent emails, and any
                    items our team is handling. Most brokers comply within 7-45 days.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5" />
                <div>
                  <span className="font-medium text-emerald-300">Removed</span>
                  <p className="text-slate-400">
                    Verified! We re-scanned the broker and confirmed your data has been
                    removed. We&apos;ll continue monitoring for any re-collection.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                <Eye className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <span className="font-medium text-purple-300">Monitoring</span>
                  <p className="text-slate-400">
                    Data from breaches and other non-removable sources. We continuously
                    monitor these and will alert you to any changes.
                  </p>
                </div>
              </div>
            </div>

            {/* Proof Screenshots */}
            <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <h4 className="font-medium text-blue-300 mb-2">About Proof Screenshots</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>&bull; <strong>Before:</strong> Screenshot taken when we first found your data</li>
                <li>&bull; <strong>After:</strong> Screenshot taken when we verify it&apos;s removed (may take days/weeks)</li>
                <li>&bull; <strong>View Proof:</strong> Only shows if screenshots are available (not all sources support this)</li>
              </ul>
            </div>
          </CardContent>
        )}
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
                Hover over status badges for details
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
            <LoadingSpinner />
          ) : removals.length === 0 ? (
            <EmptyState
              icon={
                <Trash2 className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              }
              title="No removal requests"
              description="Request removal from the Exposures page"
            />
          ) : (
            <div className="space-y-4">
                {removals.map((removal) => (
                  <div
                    key={removal.id}
                    className="p-4 bg-slate-700/30 rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg">
                          <StatusIcon userStatus={removal.userStatus} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
                              {removal.exposure.sourceName}
                            </span>
                            {platformBrokerData[removal.exposure.source] && (() => {
                              const tier = getBrokerComplianceTier(platformBrokerData[removal.exposure.source].successRate);
                              return (
                                <span className={`text-xs font-medium ${tier.color}`} title={tier.description}>
                                  {tier.label}
                                </span>
                              );
                            })()}
                            <Badge
                              variant="outline"
                              className={
                                removal.userStatusColor +
                                " border-0 cursor-help"
                              }
                              title={
                                internalStatusLabels[removal.status] ||
                                removal.status
                              }
                            >
                              {removal.userStatusLabel}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400">
                            {DataSourceNames[removal.exposure.source] ||
                              removal.exposure.source}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* View Proof Button */}
                        {(removal.beforeScreenshot ||
                          removal.afterScreenshot ||
                          removal.exposure.proofScreenshot) && (
                          <ScreenshotProofDialog removal={removal} />
                        )}
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
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-slate-400">
                        <FileText className="h-4 w-4" />
                        {methodLabels[removal.method] || removal.method}
                      </div>
                      {removal.submittedAt && (
                        <div className="text-slate-500">
                          Submitted:{" "}
                          {new Date(
                            removal.submittedAt
                          ).toLocaleDateString()}
                        </div>
                      )}
                      {removal.eta &&
                        removal.userStatus === "in_progress" && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <Clock className="h-3.5 w-3.5" />
                            Estimated: {removal.eta}
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
