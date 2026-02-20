"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSubscription } from "@/hooks/useSubscription";
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
import { ExposureCard } from "@/components/dashboard/exposure-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LoadingSpinner } from "@/components/dashboard/loading-spinner";
import { Pagination } from "@/components/dashboard/pagination";
import { UpgradeCta } from "@/components/dashboard/upgrade-cta";
import { FreeLimitDialog } from "@/components/dashboard/free-limit-dialog";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Filter,
  Trash2,
  ShieldCheck,
  SendHorizontal,
  HelpCircle,
  ShieldAlert,
  Building2,
  X,
  Search,
  Crown,
  Shield,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { trackRemovalRequested } from "@/components/analytics/google-analytics";
import { getBrokerCount } from "@/lib/removers/data-broker-directory";
import type { DataSource, Severity, ExposureStatus } from "@/lib/types";

const TOTAL_KNOWN_BROKERS = getBrokerCount();

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
  exposedFields?: string | null;
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
  const [showFreeLimitDialog, setShowFreeLimitDialog] = useState(false);
  const [freeLimitInfo, setFreeLimitInfo] = useState<{ usage: number; limit: number }>({ usage: 3, limit: 3 });
  const { isFreePlan } = useSubscription();

  // Show upgrade banner only for actual FREE users (not family members with inherited plans)
  const showUpgradeBanner = isFreePlan;

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
      toast.error("Failed to load exposures");
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
      toast.error("Failed to whitelist exposure");
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
      toast.error("Failed to remove from whitelist");
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
          setFreeLimitInfo({ usage: data.currentUsage || 3, limit: data.limit || 3 });
          setShowFreeLimitDialog(true);
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
      toast.error("Failed to bulk whitelist exposures");
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
        setShowFreeLimitDialog(true);
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
      <PageHeader
        title="Data Exposures"
        description="View and manage all your discovered data exposures"
      />

      {/* Free User Upgrade Banner */}
      {showUpgradeBanner && (
        <div className="space-y-2">
          <UpgradeCta
            icon={<Shield className="h-8 w-8 text-amber-400" />}
            title={
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                Your Data is Exposed - Take Action Now
              </span>
            }
            description={
              <p className="max-w-xl">
                Your data is exposed on <strong className="text-amber-300">{totalExposures}</strong> of{" "}
                <strong className="text-amber-300">{TOTAL_KNOWN_BROKERS.toLocaleString()}+</strong> known
                broker sites. <strong className="text-amber-300">Upgrade to Enterprise</strong> for maximum
                protection — dark web monitoring, family plan, AI Shield &amp; more.
              </p>
            }
            features={["Automated removals from 2,000+ brokers", "Dark web monitoring", "Family plan (5 profiles)", "AI Shield protection"]}
            ctaText={<><Crown className="h-4 w-4 mr-2" />Get Maximum Protection - 55% OFF</>}
            ctaHref="/dashboard/checkout"
            colorScheme="amber"
          />
          <p className="text-sm text-slate-400 text-center">
            Or{" "}
            <a href="/dashboard/checkout?plan=PRO" className="text-emerald-400 hover:text-emerald-300 underline">
              start with Pro at $9.99/mo
            </a>
          </p>
        </div>
      )}

      {/* Monitoring context for paid users */}
      {!showUpgradeBanner && totalExposures > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-400">
          <Globe className="h-4 w-4 text-blue-400 shrink-0" />
          <span>
            Monitoring <strong className="text-slate-300">{TOTAL_KNOWN_BROKERS.toLocaleString()}+</strong> data broker sites
            {" "}&bull;{" "}
            <strong className="text-orange-400">{stats?.byStatus?.ACTIVE || 0}</strong> active exposures
            {" "}&bull;{" "}
            <strong className="text-emerald-400">{stats?.byStatus?.REMOVED || 0}</strong> removed
          </span>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard value={totalExposures} label="Total Exposures" />
        <StatCard value={stats?.activeBySeverity?.CRITICAL || 0} label="Critical to Fix" color="red" />
        <StatCard value={stats?.activeBySeverity?.HIGH || 0} label="High to Fix" color="orange" />
        <StatCard value={stats?.totalRemovalRequests || 0} label="Submitted" icon={SendHorizontal} color="purple" />
        <StatCard value={stats?.byStatus?.REMOVED || 0} label="Removed" color="emerald" />
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
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
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
              <Select value={severityFilter} onValueChange={(value) => { setSeverityFilter(value); setPage(1); }}>
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
                  <li>• <span className="text-emerald-400">Can be removed</span> - click &quot;Remove&quot; button</li>
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
                  <li>• The original company can&apos;t &quot;remove&quot; it</li>
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
          <div className="flex flex-col gap-4">
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
            {/* Top Pagination */}
            {totalPages > 1 && !loading && (
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner />
          ) : exposures.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle className="mx-auto h-12 w-12 text-slate-600 mb-4" />}
              title="No exposures found"
              description={
                statusFilter !== "all" || severityFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Run a scan to find data exposures"
              }
            />
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
                  exposedFields={exposure.exposedFields}
                  firstFoundAt={new Date(exposure.firstFoundAt)}
                  onWhitelist={() => handleWhitelist(exposure.id)}
                  onUnwhitelist={() => handleUnwhitelist(exposure.id)}
                  onRemove={() => handleRemove(exposure.id)}
                  showCheckbox={true}
                  selected={selectedIds.has(exposure.id)}
                  onSelect={toggleSelect}
                />
              ))}

              {/* Bottom Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Free Limit Upgrade Dialog */}
      <FreeLimitDialog
        open={showFreeLimitDialog}
        onClose={() => setShowFreeLimitDialog(false)}
        activeExposures={actionableExposures.length}
        removalsUsed={freeLimitInfo.usage}
        limit={freeLimitInfo.limit}
      />
    </div>
  );
}

export default function ExposuresPage() {
  return (
    <Suspense
      fallback={<LoadingSpinner className="flex items-center justify-center min-h-[400px]" />}
    >
      <ExposuresPageContent />
    </Suspense>
  );
}
