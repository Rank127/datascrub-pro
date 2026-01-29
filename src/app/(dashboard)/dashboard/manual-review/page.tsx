"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ExposureCard } from "@/components/dashboard/exposure-card";
import { RemovalProgressTracker } from "@/components/dashboard/removal-progress-tracker";
import { RemovalWizard } from "@/components/dashboard/removal-wizard";
import {
  MousePointerClick,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trackManualReviewCompleted } from "@/components/analytics/google-analytics";
import type { DataSource, Severity, ExposureStatus, ExposureType } from "@/lib/types";

// AI-related sources that should be handled in AI Protection page (Enterprise only)
const AI_SOURCES = [
  // AI Training
  "SPAWNING_AI", "LAION_AI", "STABILITY_AI", "OPENAI", "MIDJOURNEY", "META_AI",
  "GOOGLE_AI", "LINKEDIN_AI", "ADOBE_AI", "AMAZON_AI",
  // Facial Recognition
  "CLEARVIEW_AI", "PIMEYES", "FACECHECK_ID", "SOCIAL_CATFISH", "TINEYE", "YANDEX_IMAGES",
  // Voice Cloning
  "ELEVENLABS", "RESEMBLE_AI", "MURF_AI",
];

interface ManualExposure {
  id: string;
  source: DataSource;
  sourceUrl: string | null;
  sourceName: string;
  dataType: ExposureType;
  dataPreview: string | null;
  severity: Severity;
  status: ExposureStatus;
  isWhitelisted: boolean;
  firstFoundAt: string;
  requiresManualAction: boolean;
  manualActionTaken: boolean;
  manualActionTakenAt: string | null;
}

// Grouped exposures by broker
interface GroupedExposure {
  source: DataSource;
  sourceName: string;
  sourceUrl: string | null;
  exposures: ManualExposure[];
  highestSeverity: Severity;
  totalCount: number;
  pendingCount: number;
  doneCount: number;
}

// Helper to get highest severity
function getHighestSeverity(exposures: ManualExposure[]): Severity {
  const severityOrder: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  for (const severity of severityOrder) {
    if (exposures.some(e => e.severity === severity)) {
      return severity;
    }
  }
  return "LOW";
}

// Group exposures by source/broker
function groupExposuresByBroker(exposures: ManualExposure[]): GroupedExposure[] {
  const grouped = new Map<string, ManualExposure[]>();

  for (const exposure of exposures) {
    const key = exposure.source;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(exposure);
  }

  return Array.from(grouped.entries()).map(([source, exps]) => ({
    source: source as DataSource,
    sourceName: exps[0].sourceName,
    sourceUrl: exps[0].sourceUrl,
    exposures: exps,
    highestSeverity: getHighestSeverity(exps),
    totalCount: exps.length,
    pendingCount: exps.filter(e => !e.manualActionTaken).length,
    doneCount: exps.filter(e => e.manualActionTaken).length,
  })).sort((a, b) => {
    // Sort by pending count (descending), then by severity
    if (a.pendingCount !== b.pendingCount) return b.pendingCount - a.pendingCount;
    const severityOrder: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
    return severityOrder.indexOf(a.highestSeverity) - severityOrder.indexOf(b.highestSeverity);
  });
}

export default function ManualReviewPage() {
  const [exposures, setExposures] = useState<ManualExposure[]>([]);
  const [groupedExposures, setGroupedExposures] = useState<GroupedExposure[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [stats, setStats] = useState({ brokers: 0, pending: 0, done: 0 });
  const [showRemovalWizard, setShowRemovalWizard] = useState(false);
  const [selectedBrokers, setSelectedBrokers] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // Get actionable brokers (those with pending items)
  const actionableBrokers = groupedExposures.filter(g => g.pendingCount > 0);
  const allSelected = actionableBrokers.length > 0 &&
    actionableBrokers.every(g => selectedBrokers.has(g.source));

  const toggleSelectBroker = (source: string) => {
    setSelectedBrokers(prev => {
      const next = new Set(prev);
      if (next.has(source)) {
        next.delete(source);
      } else {
        next.add(source);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedBrokers(new Set());
    } else {
      setSelectedBrokers(new Set(actionableBrokers.map(g => g.source)));
    }
  };

  const handleBulkWhitelist = async () => {
    if (selectedBrokers.size === 0) return;
    setBulkLoading(true);
    try {
      // Get all exposure IDs for selected brokers
      const exposureIds = exposures
        .filter(e => selectedBrokers.has(e.source))
        .map(e => e.id);

      // Whitelist all exposures
      await Promise.all(
        exposureIds.map(id =>
          fetch("/api/exposures", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exposureId: id, action: "whitelist" }),
          })
        )
      );

      toast.success(`Whitelisted ${selectedBrokers.size} site(s)`);
      setSelectedBrokers(new Set());
      fetchManualExposures();
    } catch (error) {
      toast.error("Failed to whitelist sites");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkMarkDone = async () => {
    if (selectedBrokers.size === 0) return;
    setBulkLoading(true);
    try {
      // Get all pending exposure IDs for selected brokers
      const exposureIds = exposures
        .filter(e => selectedBrokers.has(e.source) && !e.manualActionTaken)
        .map(e => e.id);

      // Mark all as done
      await Promise.all(
        exposureIds.map(id =>
          fetch("/api/exposures", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exposureId: id, action: "markDone" }),
          })
        )
      );

      toast.success(`Marked ${selectedBrokers.size} site(s) as reviewed`);
      setSelectedBrokers(new Set());
      fetchManualExposures();
    } catch (error) {
      toast.error("Failed to mark sites as reviewed");
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleGroup = (source: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(source)) {
        next.delete(source);
      } else {
        next.add(source);
      }
      return next;
    });
  };

  const fetchManualExposures = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        manualAction: statusFilter === "pending" ? "pending" : statusFilter === "done" ? "done" : "all",
      });
      if (severityFilter !== "all") {
        params.set("severity", severityFilter);
      }

      const response = await fetch(`/api/exposures?${params}`);
      if (response.ok) {
        const data = await response.json();
        // Filter to only manual action items, excluding AI sources (handled in AI Protection)
        const manualItems = data.exposures.filter(
          (e: ManualExposure) => e.requiresManualAction && !AI_SOURCES.includes(e.source)
        );
        setExposures(manualItems);

        // Group by broker for consolidated view
        const grouped = groupExposuresByBroker(manualItems);
        setGroupedExposures(grouped);
        setTotalPages(data.pagination.totalPages);

        // Use API stats (broker-centric, calculated server-side)
        setStats({
          brokers: data.stats.manualAction.brokers,
          pending: data.stats.manualAction.pending,
          done: data.stats.manualAction.done,
        });
      }
    } catch (error) {
      console.error("Failed to fetch manual review items:", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, severityFilter]);

  useEffect(() => {
    fetchManualExposures();
  }, [fetchManualExposures]);

  const handleMarkDone = async (exposureId: string) => {
    try {
      const exposure = exposures.find(e => e.id === exposureId);
      const response = await fetch("/api/exposures", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exposureId, action: "markDone" }),
      });

      if (response.ok) {
        // Track manual review completion
        if (exposure) {
          trackManualReviewCompleted(exposure.sourceName);
        }
        toast.success("Marked as reviewed");
        fetchManualExposures();
      } else {
        toast.error("Failed to mark as reviewed");
      }
    } catch (error) {
      toast.error("Failed to mark as reviewed");
    }
  };

  const handleMarkUndone = async (exposureId: string) => {
    try {
      const response = await fetch("/api/exposures", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exposureId, action: "markUndone" }),
      });

      if (response.ok) {
        toast.success("Marked as pending");
        fetchManualExposures();
      } else {
        toast.error("Failed to update");
      }
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleWhitelist = async (exposureId: string) => {
    try {
      const response = await fetch("/api/exposures", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exposureId, action: "whitelist" }),
      });

      if (response.ok) {
        toast.success("Added to whitelist");
        fetchManualExposures();
      } else {
        toast.error("Failed to whitelist");
      }
    } catch (error) {
      toast.error("Failed to whitelist");
    }
  };

  const handleUnwhitelist = async (exposureId: string) => {
    try {
      const response = await fetch("/api/exposures", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exposureId, action: "unwhitelist" }),
      });

      if (response.ok) {
        toast.success("Removed from whitelist");
        fetchManualExposures();
      } else {
        toast.error("Failed to remove from whitelist");
      }
    } catch (error) {
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

      if (response.ok) {
        toast.success("Removal request submitted");
        fetchManualExposures();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to request removal");
      }
    } catch (error) {
      toast.error("Failed to request removal");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MousePointerClick className="h-7 w-7 text-amber-400" />
            Manual Review
          </h1>
          <p className="text-slate-400 mt-1">
            Sites that require you to manually check and take action
          </p>
        </div>
        <Link href="/dashboard/scan">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Search className="mr-2 h-4 w-4" />
            Run New Scan
          </Button>
        </Link>
      </div>

      {/* Stats Cards - Broker-centric (sites to visit, not individual exposures) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MousePointerClick className="h-5 w-5 text-amber-400" />
              <div className="text-2xl font-bold text-white">{stats.brokers}</div>
            </div>
            <p className="text-sm text-slate-400">Total Sites</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700 border-amber-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" />
              <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
            </div>
            <p className="text-sm text-slate-400">Sites Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700 border-emerald-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <div className="text-2xl font-bold text-emerald-400">{stats.done}</div>
            </div>
            <p className="text-sm text-slate-400">Sites Reviewed</p>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-amber-500/10 border-amber-500/30">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <MousePointerClick className="h-5 w-5 text-amber-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-300">How Manual Review Works</h3>
              <p className="text-sm text-amber-200/70 mt-1">
                Some sites have advanced bot protection that prevents automated scanning.
                Click the link to visit the site, search for your information manually,
                and mark as reviewed once done. If you find your data, use the site&apos;s
                opt-out process to request removal.
              </p>
              <p className="text-xs text-amber-200/50 mt-2">
                Note: AI-related manual reviews (facial recognition, voice cloning, AI training)
                are available in the <Link href="/dashboard/ai-protection" className="underline hover:text-amber-200">AI Protection</Link> page (Enterprise).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Removal Wizard or Progress Tracker */}
      {showRemovalWizard ? (
        <RemovalWizard
          onComplete={() => {
            setShowRemovalWizard(false);
            fetchManualExposures();
          }}
          onClose={() => setShowRemovalWizard(false)}
        />
      ) : stats.pending > 0 && (
        <Card className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-emerald-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-emerald-300">Quick Bulk Removal Available</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Use the Removal Wizard to submit all opt-out requests at once with smart broker consolidation.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowRemovalWizard(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                Start Wizard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="done">Reviewed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600">
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedBrokers.size > 0 && (
        <Card className="bg-emerald-900/30 border-emerald-700/50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-emerald-300">
                {selectedBrokers.size} site{selectedBrokers.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-emerald-600 text-emerald-300 hover:bg-emerald-700/50"
                  onClick={handleBulkMarkDone}
                  disabled={bulkLoading}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Mark Reviewed
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={handleBulkWhitelist}
                  disabled={bulkLoading}
                >
                  <ShieldCheck className="h-4 w-4 mr-1" />
                  Whitelist Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Select All Header */}
      {!loading && actionableBrokers.length > 0 && (
        <div className="flex items-center justify-end gap-2">
          <Checkbox
            id="select-all"
            checked={allSelected}
            onCheckedChange={toggleSelectAll}
            className="border-slate-500 data-[state=checked]:bg-emerald-600"
          />
          <label
            htmlFor="select-all"
            className="text-sm text-slate-400 cursor-pointer"
          >
            Select All ({actionableBrokers.length})
          </label>
        </div>
      )}

      {/* Exposures List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : exposures.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {statusFilter === "pending"
                ? "No Pending Manual Reviews"
                : "No Manual Review Items"}
            </h3>
            <p className="text-slate-400 mb-4">
              {statusFilter === "pending"
                ? "Great job! You've reviewed all manual items."
                : "Run a scan to check for sites requiring manual review."}
            </p>
            <Link href="/dashboard/scan">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Search className="mr-2 h-4 w-4" />
                Run Scan
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedExposures.map((group) => (
            <Card
              key={group.source}
              className={`bg-slate-800/50 border-slate-700 ${
                group.pendingCount === 0 ? "opacity-60" : ""
              }`}
            >
              <CardContent className="py-4">
                {/* Broker Header - Always visible */}
                <div
                  className="flex items-start gap-4"
                >
                  {/* Checkbox for bulk selection */}
                  {group.pendingCount > 0 && (
                    <div className="pt-1">
                      <Checkbox
                        checked={selectedBrokers.has(group.source)}
                        onCheckedChange={() => toggleSelectBroker(group.source)}
                        className="border-slate-500 data-[state=checked]:bg-emerald-600"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                  {group.pendingCount === 0 && <div className="w-4" />}

                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => group.totalCount > 1 && toggleGroup(group.source)}
                  >
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-medium text-white">{group.sourceName}</h3>
                      {group.totalCount > 1 && (
                        <Badge variant="outline" className="border-slate-500 text-slate-300">
                          {group.totalCount} exposures
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={
                          group.pendingCount === 0
                            ? "border-emerald-500/50 text-emerald-400"
                            : "border-amber-500/50 text-amber-400"
                        }
                      >
                        {group.pendingCount === 0 ? "Reviewed" : "Pending"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          group.highestSeverity === "CRITICAL"
                            ? "border-red-500/50 text-red-400"
                            : group.highestSeverity === "HIGH"
                            ? "border-orange-500/50 text-orange-400"
                            : group.highestSeverity === "MEDIUM"
                            ? "border-yellow-500/50 text-yellow-400"
                            : "border-blue-500/50 text-blue-400"
                        }
                      >
                        {group.highestSeverity}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">
                      {group.totalCount > 1
                        ? `Found ${group.totalCount} data types exposed on this site`
                        : group.exposures[0].dataPreview || "Check this site for your personal information"}
                    </p>
                    <div className="flex items-center gap-3">
                      {group.sourceUrl && (
                        <a
                          href={group.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Visit Site to Check
                        </a>
                      )}
                      {group.totalCount > 1 && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          {expandedGroups.has(group.source) ? (
                            <>
                              <ChevronUp className="h-3 w-3" /> Hide details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3" /> Show details
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {group.pendingCount > 0 && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Mark all pending as done
                          group.exposures
                            .filter(exp => !exp.manualActionTaken)
                            .forEach(exp => handleMarkDone(exp.id));
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        {group.totalCount > 1 ? "Mark All Done" : "Mark Done"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expanded Details - Individual exposures */}
                {expandedGroups.has(group.source) && group.totalCount > 1 && (
                  <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                    {group.exposures.map((exposure) => (
                      <div
                        key={exposure.id}
                        className={`flex items-center justify-between p-3 rounded-lg bg-slate-900/50 ${
                          exposure.manualActionTaken ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className={
                              exposure.manualActionTaken
                                ? "border-emerald-500/50 text-emerald-400"
                                : "border-amber-500/50 text-amber-400"
                            }
                          >
                            {exposure.manualActionTaken ? "Done" : "Pending"}
                          </Badge>
                          <span className="text-sm text-slate-300">{exposure.dataType}</span>
                          {exposure.dataPreview && (
                            <span className="text-xs text-slate-500 font-mono">
                              {exposure.dataPreview}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!exposure.manualActionTaken ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                              onClick={() => handleMarkDone(exposure.id)}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Done
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-slate-400"
                              onClick={() => handleMarkUndone(exposure.id)}
                            >
                              Undo
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-600 text-slate-400"
                            onClick={() => handleWhitelist(exposure.id)}
                          >
                            Whitelist
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Single exposure - show actions inline */}
                {group.totalCount === 1 && (
                  <div className="mt-3 flex items-center gap-2">
                    {!group.exposures[0].manualActionTaken && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600"
                        onClick={() => handleWhitelist(group.exposures[0].id)}
                      >
                        Whitelist
                      </Button>
                    )}
                    {group.exposures[0].manualActionTaken && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-400"
                        onClick={() => handleMarkUndone(group.exposures[0].id)}
                      >
                        Undo Done
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border-slate-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-400">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="border-slate-600"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
