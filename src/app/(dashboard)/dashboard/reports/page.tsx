"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Download,
  Calendar,
  TrendingDown,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LoadingSpinner } from "@/components/dashboard/loading-spinner";
import { toast } from "sonner";

interface ReportStats {
  newExposures: number;
  removedExposures: number;
  riskScoreChange: number;
}

interface Report {
  id: string;
  period: string;
  generatedAt: string;
  stats: ReportStats;
}

interface Summary {
  totalExposuresRemoved: number;
  riskScoreReduction: number;
  sourcesMonitored: number;
  averageRemovalTime: string;
  totalExposures: number;
  activeExposures: number;
  pendingRemovals: number;
}

interface Progress {
  dataBroker: number;
  breach: number;
  social: number;
}

interface ReportsData {
  summary: Summary;
  progress: Progress;
  reports: Report[];
}

// Generate CSV content for a report
function generateReportCSV(report: Report) {
  const headers = ["Metric", "Value"];
  const rows = [
    ["Report Period", report.period],
    ["Generated Date", report.generatedAt],
    ["New Exposures Found", report.stats.newExposures.toString()],
    ["Exposures Removed", report.stats.removedExposures.toString()],
    ["Risk Score Change", `${report.stats.riskScoreChange}%`],
  ];

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");

  return csvContent;
}

// Download a single report
function downloadReport(report: Report) {
  const csvContent = generateReportCSV(report);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `ghostmydata-report-${report.period.replace(" ", "-").toLowerCase()}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success(`Downloaded ${report.period} report`);
}

// Export all reports
function exportAllReports(reports: Report[], summary: Summary) {
  const headers = ["Period", "Generated Date", "New Exposures", "Removed Exposures", "Risk Score Change"];
  const rows = reports.map(report => [
    report.period,
    report.generatedAt,
    report.stats.newExposures.toString(),
    report.stats.removedExposures.toString(),
    `${report.stats.riskScoreChange}%`,
  ]);

  const summaryRows = [
    [],
    ["Summary Statistics"],
    ["Total Exposures Removed", summary.totalExposuresRemoved.toString()],
    ["Risk Score Reduction", `${summary.riskScoreReduction}%`],
    ["Sources Monitored", summary.sourcesMonitored.toString()],
    ["Average Removal Time", summary.averageRemovalTime],
  ];

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ...summaryRows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `ghostmydata-all-reports-${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success("Downloaded all reports");
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const response = await fetch("/api/reports");
        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  if (loading) {
    return (
      <LoadingSpinner className="flex items-center justify-center min-h-[400px]" />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-white text-lg">Failed to load reports</p>
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { summary, progress, reports } = data;
  const hasData = summary.totalExposures > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="View your monthly data protection reports"
        actions={
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => exportAllReports(reports, summary)}
            disabled={reports.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard value={summary.totalExposuresRemoved} label="Total Exposures Removed" icon={CheckCircle} color="emerald" />
        <StatCard value={summary.riskScoreReduction > 0 ? `-${summary.riskScoreReduction}%` : "0%"} label="Risk Score Reduction" icon={summary.riskScoreReduction > 0 ? TrendingDown : TrendingUp} color={summary.riskScoreReduction > 0 ? "emerald" : "white"} />
        <StatCard value={summary.sourcesMonitored} label="Sources Monitored" icon={Shield} color="blue" />
        <StatCard value={summary.averageRemovalTime} label="Avg. Removal Time" icon={Calendar} color="purple" />
      </div>

      {/* Protection Progress */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Protection Progress</CardTitle>
          <CardDescription className="text-slate-400">
            Your data protection improvement over time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Data Broker Removal</span>
              <span className="text-white">{progress.dataBroker}%</span>
            </div>
            <Progress value={progress.dataBroker} className="h-2 bg-slate-700" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Breach Mitigation</span>
              <span className="text-white">{progress.breach}%</span>
            </div>
            <Progress value={progress.breach} className="h-2 bg-slate-700" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Social Media Cleanup</span>
              <span className="text-white">{progress.social}%</span>
            </div>
            <Progress value={progress.social} className="h-2 bg-slate-700" />
          </div>
          {!hasData && (
            <p className="text-sm text-slate-500 text-center pt-4">
              Run a scan to start tracking your protection progress
            </p>
          )}
        </CardContent>
      </Card>

      {/* Monthly Reports */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-emerald-500" />
            Monthly Reports
          </CardTitle>
          <CardDescription className="text-slate-400">
            Download detailed reports for each month
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <EmptyState
              icon={<FileText className="mx-auto h-12 w-12 text-slate-600 mb-4" />}
              title="No reports available yet"
              description="Reports will appear here after you run your first scan"
            />
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <FileText className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{report.period}</h4>
                      <p className="text-sm text-slate-400">
                        Generated {new Date(report.generatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-4">
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-orange-400" />
                          <span className="text-white">
                            {report.stats.newExposures}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">New</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          <span className="text-white">
                            {report.stats.removedExposures}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">Removed</p>
                      </div>
                      <div className="text-center">
                        <Badge
                          variant="outline"
                          className={
                            report.stats.riskScoreChange < 0
                              ? "bg-emerald-500/20 text-emerald-400 border-0"
                              : report.stats.riskScoreChange > 0
                              ? "bg-red-500/20 text-red-400 border-0"
                              : "bg-slate-500/20 text-slate-400 border-0"
                          }
                        >
                          {report.stats.riskScoreChange < 0 ? (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          ) : report.stats.riskScoreChange > 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : null}
                          {report.stats.riskScoreChange === 0 ? "0" : Math.abs(report.stats.riskScoreChange)}%
                        </Badge>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600"
                      onClick={() => downloadReport(report)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
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
