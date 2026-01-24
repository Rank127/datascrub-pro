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
import { ExposureCard } from "@/components/dashboard/exposure-card";
import {
  MousePointerClick,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react";
import { toast } from "sonner";
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

export default function ManualReviewPage() {
  const [exposures, setExposures] = useState<ManualExposure[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [stats, setStats] = useState({ total: 0, pending: 0, done: 0 });

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
        setTotalPages(data.pagination.totalPages);

        // Calculate stats excluding AI sources
        const allManualItems = data.exposures.filter(
          (e: ManualExposure) => e.requiresManualAction && !AI_SOURCES.includes(e.source)
        );
        const pendingCount = allManualItems.filter((e: ManualExposure) => !e.manualActionTaken).length;
        const doneCount = allManualItems.filter((e: ManualExposure) => e.manualActionTaken).length;
        setStats({
          total: allManualItems.length,
          pending: pendingCount,
          done: doneCount,
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
      const response = await fetch("/api/exposures", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exposureId, action: "markDone" }),
      });

      if (response.ok) {
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MousePointerClick className="h-5 w-5 text-amber-400" />
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>
            <p className="text-sm text-slate-400">Total Manual Items</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700 border-amber-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" />
              <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
            </div>
            <p className="text-sm text-slate-400">Pending Review</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700 border-emerald-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <div className="text-2xl font-bold text-emerald-400">{stats.done}</div>
            </div>
            <p className="text-sm text-slate-400">Reviewed</p>
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
          {exposures.map((exposure) => (
            <ExposureCard
              key={exposure.id}
              id={exposure.id}
              source={exposure.source}
              sourceName={exposure.sourceName}
              sourceUrl={exposure.sourceUrl}
              dataType={exposure.dataType}
              dataPreview={exposure.dataPreview}
              severity={exposure.severity}
              status={exposure.status}
              isWhitelisted={exposure.isWhitelisted}
              firstFoundAt={new Date(exposure.firstFoundAt)}
              requiresManualAction={exposure.requiresManualAction}
              manualActionTaken={exposure.manualActionTaken}
              onWhitelist={() => handleWhitelist(exposure.id)}
              onUnwhitelist={() => handleUnwhitelist(exposure.id)}
              onRemove={() => handleRemove(exposure.id)}
              onMarkDone={() => handleMarkDone(exposure.id)}
              onMarkUndone={() => handleMarkUndone(exposure.id)}
            />
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
