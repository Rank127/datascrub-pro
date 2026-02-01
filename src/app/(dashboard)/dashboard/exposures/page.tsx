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
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ShieldCheck,
  SendHorizontal,
  HelpCircle,
  ShieldAlert,
  Building2,
  X,
  Search,
  Crown,
  Zap,
  Shield,
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
  activeBySeverity: Record<string, number>; // Only ACTIVE items needing action
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
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get("search") || ""
  );
  const [showHelp, setShowHelp] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("FREE");
  const [planSource, setPlanSource] = useState<string>("DEFAULT");

  // Fetch user plan
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch("/api/subscription");
        if (response.ok) {
          const data = await response.json();
          setUserPlan(data.plan || "FREE");
          setPlanSource(data.planSource || "DEFAULT");
        }
      } catch (error) {
        console.error("Failed to fetch plan:", error);
      }
    };
    fetchPlan();
  }, []);

  // Show upgrade banner only for actual FREE users (not family members with inherited plans)
  const showUpgradeBanner = userPlan === "FREE" && planSource !== "FAMILY";

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
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
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
  }, [page, statusFilter, severityFilter, searchQuery]);

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

      {/* Free User Upgrade Banner */}
      {showUpgradeBanner && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/40 p-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/20 rounded-xl shrink-0">
                <Shield className="h-8 w-8 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  Your Data is Exposed - Take Action Now
                </h3>
                <p className="text-slate-300 mt-1 max-w-xl">
                  Free accounts can only view exposures. <strong className="text-amber-300">Upgrade to Pro</strong> to automatically remove your personal information from data brokers and protect your privacy.
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Zap className="h-4 w-4" /> Automated removals
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Shield className="h-4 w-4" /> 50 sites monitored
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Crown className="h-4 w-4" /> Priority support
                  </span>
                </div>
              </div>
            </div>
            <Link href="/dashboard/settings#subscription">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-6 py-2 shadow-lg shadow-amber-500/25 shrink-0">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Now - 40% Off
              </Button>
            </Link>
          </div>
        </div>
      )}

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
              {stats?.activeBySeverity?.CRITICAL || 0}
            </div>
            <p className="text-sm text-slate-400">Critical to Fix</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-400">
              {stats?.activeBySeverity?.HIGH || 0}
            </div>
            <p className="text-sm text-slate-400">High to Fix</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <CardTitle className="text-sm font-medium text-slate-300">
                Filters
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
              onClick={() => setShowHelp(!showHelp)}
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              {showHelp ? "Hide Help" : "Help"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1 flex-1 min-w-[200px] max-w-[300px]">
              <label className="text-xs text-slate-500">Search Company</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by company name..."
                  className="pl-9 bg-slate-700/50 border-slate-600"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active (Needs Action)</SelectItem>
                  <SelectItem value="REMOVAL_PENDING">Pending (Request Sent)</SelectItem>
                  <SelectItem value="REMOVAL_IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="REMOVED">Removed (Success)</SelectItem>
                  <SelectItem value="WHITELISTED">Whitelisted (Kept)</SelectItem>
                  <SelectItem value="MONITORING">Breach Alert</SelectItem>
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

      {/* Help Section */}
      {showHelp && (
        <Card className="bg-slate-800/50 border-slate-700 border-blue-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-white">Understanding Your Exposures</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white"
                onClick={() => setShowHelp(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Data Brokers vs Breaches */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-emerald-900/20 border border-emerald-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-semibold text-emerald-400">Data Brokers</h3>
                </div>
                <p className="text-sm text-slate-300 mb-3">
                  Companies like Spokeo, WhitePages, and BeenVerified that <strong>actively collect and sell</strong> your personal information.
                </p>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• They control their database</li>
                  <li>• CCPA/GDPR laws require them to delete on request</li>
                  <li>• GhostMyData sends automated opt-out requests</li>
                  <li>• <span className="text-emerald-400">Can be removed</span> - click "Remove" button</li>
                </ul>
              </div>
              <div className="p-4 bg-purple-900/20 border border-purple-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert className="h-5 w-5 text-purple-400" />
                  <h3 className="font-semibold text-purple-400">Data Breaches (HIBP)</h3>
                </div>
                <p className="text-sm text-slate-300 mb-3">
                  Security incidents where hackers <strong>stole data</strong> from companies like Deezer, LinkedIn, or Epik.
                </p>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• The data was stolen and leaked online</li>
                  <li>• Exists on hacker forums, dark web, torrents</li>
                  <li>• The original company can't "remove" it</li>
                  <li>• <span className="text-purple-400">Cannot be removed</span> - take protective action instead</li>
                </ul>
              </div>
            </div>

            {/* What to do for breaches */}
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <h3 className="font-semibold text-white mb-2">What to Do for Breach Alerts</h3>
              <div className="grid gap-2 md:grid-cols-2 text-sm text-slate-300">
                <div>1. <strong>Change passwords</strong> for affected accounts</div>
                <div>2. <strong>Enable 2FA</strong> (two-factor authentication)</div>
                <div>3. <strong>Monitor accounts</strong> for suspicious activity</div>
                <div>4. <strong>Consider credit freeze</strong> if SSN was exposed</div>
              </div>
            </div>

            {/* Status explanations */}
            <div>
              <h3 className="font-semibold text-white mb-3">Status Meanings</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-medium">ACTIVE</span>
                  <span className="text-slate-300">Needs action - you can request removal or whitelist</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">PENDING</span>
                  <span className="text-slate-300">Opt-out request sent, waiting for broker (up to 45 days)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">REMOVED</span>
                  <span className="text-slate-300">Successfully removed from this data broker</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-xs font-medium">WHITELISTED</span>
                  <span className="text-slate-300">You chose to keep this listing</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-medium">BREACH ALERT</span>
                  <span className="text-slate-300">Data breach - cannot be removed, take protective action</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
