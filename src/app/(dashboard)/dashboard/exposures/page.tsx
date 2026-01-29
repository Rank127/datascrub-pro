"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExposureCard } from "@/components/dashboard/exposure-card";
import {
  AlertTriangle,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ShieldCheck,
  SendHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { trackRemovalRequested } from "@/components/analytics/google-analytics";
import type { DataSource, Severity, ExposureStatus } from "@/lib/types";

interface Exposure {
  id: string;
  source: DataSource;
  sourceUrl: string | null;
  sourceName: string;
  dataType: string;
  dataPreview: string | null;
  severity: Severity;
  status: ExposureStatus;
  isWhitelisted: boolean;
  firstFoundAt: string;
  removalRequest?: {
    id: string;
    status: string;
    method: string;
  };
}

interface ExposureStats {
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  totalRemovalRequests: number;
}

function ExposuresPageContent() {
  const searchParams = useSearchParams();
  const [exposures, setExposures] = useState<Exposure[]>([]);
  const [stats, setStats] = useState<ExposureStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // Filters - initialize from URL params
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get("status") || "all"
  );
  const [severityFilter, setSeverityFilter] = useState<string>(
    searchParams.get("severity") || "all"
  );

  // Get only actionable exposures (active, not whitelisted)
  const actionableExposures = exposures.filter(
    (e) => e.status === "ACTIVE" && !e.isWhitelisted
  );
  const allSelected = actionableExposures.length > 0 &&
    actionableExposures.every((e) => selectedIds.has(e.id));
  const someSelected = selectedIds.size > 0;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(actionableExposures.map((e) => e.id)));
    }
  };

  const fetchExposures = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (severityFilter !== "all") params.set("severity", severityFilter);
      const response = await fetch(`/api/exposures?${params}`);
      if (response.ok) {
        const data = await response.json();
        setExposures(data.exposures);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch exposures:", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, severityFilter]);

  useEffect(() => {
    fetchExposures();
  }, [fetchExposures]);

  const handleWhitelist = async (exposureId: string) => {
    try {
      const response = await fetch("/api/exposures", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exposureId, action: "whitelist" }),
      });

      if (response.ok) {
        fetchExposures();
      }
    } catch (error) {
      console.error("Failed to whitelist:", error);
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
        fetchExposures();
      }
    } catch (error) {
      console.error("Failed to unwhitelist:", error);
    }
  };

  const handleRemove = async (exposureId: string) => {
    try {
      const exposure = exposures.find(e => e.id === exposureId);
      const response = await fetch("/api/removals/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exposureId }),
      });

      if (response.ok) {
        // Track the removal request
        if (exposure) {
          trackRemovalRequested(exposure.sourceName, exposure.dataType);
        }
        toast.success("Removal request submitted");
        fetchExposures();
      } else {
        const data = await response.json();
        if (data.requiresUpgrade) {
          toast.error(
            <div>
              {data.error}{" "}
              <a href="/pricing" className="text-emerald-400 underline">
                View Plans
              </a>
            </div>
          );
        } else {
          toast.error(data.error || "Failed to request removal");
        }
      }
    } catch (error) {
      console.error("Failed to request removal:", error);
      toast.error("Failed to request removal");
    }
  };

  const handleBulkWhitelist = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const promises = Array.from(selectedIds).map((id) =>
        fetch("/api/exposures", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exposureId: id, action: "whitelist" }),
        })
      );
      await Promise.all(promises);
      setSelectedIds(new Set());
      fetchExposures();
    } catch (error) {
      console.error("Failed to bulk whitelist:", error);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkRemove = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    let hasUpgradeError = false;
    try {
      const results = await Promise.all(
        Array.from(selectedIds).map(async (id) => {
          const response = await fetch("/api/removals/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exposureId: id }),
          });
          if (!response.ok) {
            const data = await response.json();
            if (data.requiresUpgrade) {
              hasUpgradeError = true;
            }
            return { success: false, data };
          }
          return { success: true };
        })
      );

      const successCount = results.filter((r) => r.success).length;
      if (successCount > 0) {
        toast.success(`${successCount} removal request(s) submitted`);
      }
      if (hasUpgradeError) {
        toast.error(
          <div>
            You&apos;ve reached your removal limit.{" "}
            <a href="/pricing" className="text-emerald-400 underline">
              Upgrade your plan
            </a>{" "}
            for unlimited removals.
          </div>
        );
      }
      setSelectedIds(new Set());
      fetchExposures();
    } catch (error) {
      console.error("Failed to bulk remove:", error);
      toast.error("Failed to process removal requests");
    } finally {
      setBulkLoading(false);
    }
  };

  const totalExposures = stats
    ? Object.values(stats.byStatus).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Data Exposures</h1>
        <p className="text-slate-400">
          View and manage all your discovered data exposures
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-white">{totalExposures}</div>
            <p className="text-sm text-slate-400">Total Exposures</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-400">
              {stats?.bySeverity?.CRITICAL || 0}
            </div>
            <p className="text-sm text-slate-400">Critical</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-400">
              {stats?.bySeverity?.HIGH || 0}
            </div>
            <p className="text-sm text-slate-400">High Risk</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <SendHorizontal className="h-5 w-5 text-purple-400" />
              <div className="text-2xl font-bold text-purple-400">
                {stats?.totalRemovalRequests || 0}
              </div>
            </div>
            <p className="text-sm text-slate-400">Submitted</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-emerald-400">
              {stats?.byStatus?.REMOVED || 0}
            </div>
            <p className="text-sm text-slate-400">Removed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <CardTitle className="text-sm font-medium text-slate-300">
              Filters
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="REMOVAL_PENDING">Removal Pending</SelectItem>
                  <SelectItem value="REMOVAL_IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="REMOVED">Removed</SelectItem>
                  <SelectItem value="WHITELISTED">Whitelisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Severity</label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {someSelected && (
        <Card className="bg-emerald-900/30 border-emerald-700/50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-emerald-300">
                {selectedIds.size} exposure{selectedIds.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
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
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleBulkRemove}
                  disabled={bulkLoading}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exposures List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">All Exposures</CardTitle>
              <CardDescription className="text-slate-400">
                Select exposures to take bulk actions
              </CardDescription>
            </div>
            {actionableExposures.length > 0 && (
              <div className="flex items-center gap-2">
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
                  Select All
                </label>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : exposures.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-300">
                No exposures found
              </h3>
              <p className="text-slate-500 mt-1">
                {statusFilter !== "all" || severityFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Run a scan to find data exposures"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {exposures.map((exposure) => (
                <ExposureCard
                  key={exposure.id}
                  id={exposure.id}
                  source={exposure.source}
                  sourceName={exposure.sourceName}
                  sourceUrl={exposure.sourceUrl}
                  dataType={exposure.dataType as "EMAIL" | "PHONE" | "NAME" | "ADDRESS" | "DOB" | "SSN" | "PHOTO" | "USERNAME" | "FINANCIAL" | "COMBINED_PROFILE"}
                  dataPreview={exposure.dataPreview}
                  severity={exposure.severity}
                  status={exposure.status}
                  isWhitelisted={exposure.isWhitelisted}
                  firstFoundAt={new Date(exposure.firstFoundAt)}
                  onWhitelist={() => handleWhitelist(exposure.id)}
                  onUnwhitelist={() => handleUnwhitelist(exposure.id)}
                  onRemove={() => handleRemove(exposure.id)}
                  showCheckbox={true}
                  selected={selectedIds.has(exposure.id)}
                  onSelect={toggleSelect}
                />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ExposuresPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      }
    >
      <ExposuresPageContent />
    </Suspense>
  );
}
