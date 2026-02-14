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
  AlertCircle,
  XCircle,
  Mail,
  FileText,
  ExternalLink,
  RefreshCw,
  HandHelping,
  Camera,
  Image as ImageIcon,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LoadingSpinner } from "@/components/dashboard/loading-spinner";
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
  optOutUrl: string | null;
  optOutEmail: string | null;
  estimatedDays: number | null;
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

const statusConfig: Record<
  string,
  { label: string; description: string; color: string; icon: typeof CheckCircle }
> = {
  PENDING: {
    label: "Queued",
    description: "Request created, opt-out email will be sent soon",
    color: "bg-slate-500/20 text-slate-400",
    icon: Clock,
  },
  SUBMITTED: {
    label: "Email Sent",
    description: "Opt-out request emailed to broker, waiting for response (up to 45 days)",
    color: "bg-blue-500/20 text-blue-400",
    icon: Mail,
  },
  IN_PROGRESS: {
    label: "Processing",
    description: "Broker acknowledged request, removal in progress",
    color: "bg-yellow-500/20 text-yellow-400",
    icon: RefreshCw,
  },
  COMPLETED: {
    label: "Removed",
    description: "Verified: your data has been removed from this broker",
    color: "bg-emerald-500/20 text-emerald-400",
    icon: CheckCircle,
  },
  FAILED: {
    label: "Failed",
    description: "Request failed - will retry automatically",
    color: "bg-red-500/20 text-red-400",
    icon: XCircle,
  },
  REQUIRES_MANUAL: {
    label: "Form Required",
    description: "This broker only accepts opt-out via their website form - click 'Open Opt-Out Form' below",
    color: "bg-orange-500/20 text-orange-400",
    icon: AlertCircle,
  },
  ACKNOWLEDGED: {
    label: "Breach Alert",
    description: "Data breach - cannot be removed, only monitored",
    color: "bg-purple-500/20 text-purple-400",
    icon: AlertCircle,
  },
};

const methodLabels: Record<string, string> = {
  AUTO_FORM: "Automated Opt-out Form",
  AUTO_EMAIL: "Automated Email Request",
  API: "API Integration",
  MANUAL_GUIDE: "Manual Removal Guide",
};

interface ManualActionStats {
  total: number;
  done: number;
  pending: number;
}

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
              {removal.beforeScreenshotAt || removal.exposure.proofScreenshotAt ? (
                <span className="text-xs text-slate-500">
                  {new Date(removal.beforeScreenshotAt || removal.exposure.proofScreenshotAt!).toLocaleDateString()}
                </span>
              ) : null}
            </div>
            <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
              {beforeScreenshot ? (
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

export default function RemovalsPage() {
  const [removals, setRemovals] = useState<RemovalRequest[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [manualAction, setManualAction] = useState<ManualActionStats>({ total: 0, done: 0, pending: 0 });
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
        setStats(data.stats);
        setManualAction(data.manualAction || { total: 0, done: 0, pending: 0 });
      }
    } catch (error) {
      console.error("Failed to fetch removals:", error);
      toast.error("Failed to load removal requests");
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
      <PageHeader
        title="Removal Requests"
        description="Track the status of your data removal requests"
      />

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard value={totalRemovals} label="Total Requests" />
        <StatCard value={completedCount} label="Completed" color="emerald" />
        <StatCard value={(stats.SUBMITTED || 0) + (stats.IN_PROGRESS || 0)} label="In Progress" color="blue" />
        <StatCard value={(stats.FAILED || 0) + (stats.REQUIRES_MANUAL || 0)} label="Needs Attention" color="orange" />
        <StatCard value={`${manualAction.done}/${manualAction.total}`} label="Manual Actions" icon={HandHelping} color="amber" href="/dashboard/exposures?manualAction=pending" />
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
            {/* Status Explanations */}
            <div className="grid gap-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="font-medium text-slate-300">Queued</span>
                  <p className="text-slate-400">Request created. Opt-out email will be sent automatically.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <span className="font-medium text-blue-300">Email Sent</span>
                  <p className="text-slate-400">CCPA/GDPR opt-out email sent to the data broker. They have 45 days to comply.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5" />
                <div>
                  <span className="font-medium text-orange-300">Manual Required</span>
                  <p className="text-slate-400">This broker only accepts removals via their website form. Click &quot;Open Opt-Out Form&quot; to complete the removal yourself.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5" />
                <div>
                  <span className="font-medium text-emerald-300">Removed</span>
                  <p className="text-slate-400">Verified! Our system re-scanned the broker and confirmed your data is gone.</p>
                </div>
              </div>
            </div>

            {/* Proof Screenshots */}
            <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <h4 className="font-medium text-blue-300 mb-2">About Proof Screenshots</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• <strong>Before:</strong> Screenshot taken when we first found your data</li>
                <li>• <strong>After:</strong> Screenshot taken when we verify it&apos;s removed (may take days/weeks)</li>
                <li>• <strong>View Proof:</strong> Only shows if screenshots are available (not all sources support this)</li>
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
              icon={<Trash2 className="mx-auto h-12 w-12 text-slate-600 mb-4" />}
              title="No removal requests"
              description="Request removal from the Exposures page"
            />
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
                              className={config.color + " border-0 cursor-help"}
                              title={config.description}
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
                      <div className="flex items-center gap-2">
                        {/* View Proof Button - show if screenshots available */}
                        {(removal.beforeScreenshot || removal.afterScreenshot || removal.exposure.proofScreenshot) && (
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
                      <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-orange-400 mb-1">
                              Form-Based Removal Required
                            </p>
                            <p className="text-xs text-slate-400">
                              This broker only accepts removals through their website form, not email.
                            </p>
                          </div>
                          {removal.optOutUrl && (
                            <Button
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700 text-white shrink-0"
                              asChild
                            >
                              <a
                                href={removal.optOutUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open Opt-Out Form
                              </a>
                            </Button>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-orange-500/20">
                          <p className="text-xs text-slate-400 mb-2">Steps to complete:</p>
                          <ol className="text-xs text-slate-400 list-decimal list-inside space-y-1">
                            <li>Click the button above to open the opt-out form</li>
                            <li>Search for your name/info and locate your record</li>
                            <li>Submit the removal request</li>
                            {removal.estimatedDays && (
                              <li>Wait up to {removal.estimatedDays} days for processing</li>
                            )}
                          </ol>
                        </div>

                        {!removal.optOutUrl && (
                          <p className="text-xs text-slate-500 mt-2">
                            Search for &quot;{removal.exposure.sourceName} opt out&quot; to find the removal form.
                          </p>
                        )}
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
