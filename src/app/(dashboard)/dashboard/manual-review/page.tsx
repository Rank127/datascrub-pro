"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ExternalLink,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import type { DataSource, Severity, ExposureStatus } from "@/lib/types";

interface ManualExposure {
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
  const [stats, setStats] = useState({ total: 0, pending: 0, done: 0 });

  const fetchManualExposures = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        manualAction: statusFilter === "pending" ? "pending" : statusFilter === "done" ? "done" : "all",
      });

      const response = await fetch(`/api/exposures?${params}`);
      if (response.ok) {
        const data = await response.json();
        // Filter to only manual action items
        const manualItems = data.exposures.filter((e: ManualExposure) => e.requiresManualAction);
        setExposures(manualItems);
        setTotalPages(data.pagination.totalPages);
        if (data.stats?.manualAction) {
          setStats({
            total: data.stats.manualAction.total,
            pending: data.stats.manualAction.pending,
            done: data.stats.manualAction.done,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch manual review items:", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

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
            <Card
              key={exposure.id}
              className={`bg-slate-800/50 border-slate-700 ${
                exposure.manualActionTaken ? "opacity-60" : ""
              }`}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-white">{exposure.sourceName}</h3>
                      <Badge
                        variant="outline"
                        className={
                          exposure.manualActionTaken
                            ? "border-emerald-500/50 text-emerald-400"
                            : "border-amber-500/50 text-amber-400"
                        }
                      >
                        {exposure.manualActionTaken ? "Reviewed" : "Pending"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          exposure.severity === "CRITICAL"
                            ? "border-red-500/50 text-red-400"
                            : exposure.severity === "HIGH"
                            ? "border-orange-500/50 text-orange-400"
                            : exposure.severity === "MEDIUM"
                            ? "border-yellow-500/50 text-yellow-400"
                            : "border-blue-500/50 text-blue-400"
                        }
                      >
                        {exposure.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">
                      {exposure.dataPreview || "Check this site for your personal information"}
                    </p>
                    <div className="flex items-center gap-3">
                      {exposure.sourceUrl && (
                        <a
                          href={exposure.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Visit Site to Check
                        </a>
                      )}
                      <span className="text-xs text-slate-500">
                        Found {new Date(exposure.firstFoundAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!exposure.manualActionTaken && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleMarkDone(exposure.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Mark Reviewed
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600"
                      onClick={() => handleWhitelist(exposure.id)}
                    >
                      Whitelist
                    </Button>
                  </div>
                </div>
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
