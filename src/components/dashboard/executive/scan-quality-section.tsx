"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Timer,
  Shield,
} from "lucide-react";

interface ScannerStats {
  name: string;
  type: string;
  totalScans: number;
  successCount: number;
  failedCount: number;
  blockedCount: number;
  timeoutCount: number;
  emptyCount: number;
  skippedCount: number;
  avgResponseTimeMs: number;
  totalResults: number;
  successRate: number;
  proxyTiers: Record<string, number>;
  errorTypes: Record<string, number>;
  last24h: { success: number; failed: number };
}

interface ScanQualityData {
  period: { from: string; to: string };
  overview: {
    totalScans: number;
    successRate: number;
    failedTotal: number;
    activeScanners: number;
    totalScanners: number;
  };
  scanners: ScannerStats[];
  errorBreakdown: Record<string, number>;
  confidenceDistribution: Array<{ classification: string | null; count: number }>;
}

export function ScanQualitySection() {
  const [data, setData] = useState<ScanQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/scan-quality")
      .then(r => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-10 text-red-400">
        Failed to load scan quality data. {error}
      </div>
    );
  }

  const getStatusColor = (rate: number) => {
    if (rate >= 80) return "text-emerald-400";
    if (rate >= 50) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Success Rate</span>
            </div>
            <span className={`text-2xl font-bold ${getStatusColor(data.overview.successRate)}`}>
              {data.overview.successRate}%
            </span>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-slate-400">Active Scanners</span>
            </div>
            <span className="text-2xl font-bold text-white">
              {data.overview.activeScanners}/{data.overview.totalScanners}
            </span>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Total Scans (7d)</span>
            </div>
            <span className="text-2xl font-bold text-white">{data.overview.totalScans}</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="text-xs text-slate-400">Failures (7d)</span>
            </div>
            <span className="text-2xl font-bold text-red-400">{data.overview.failedTotal}</span>
          </CardContent>
        </Card>
      </div>

      {/* Scanner Health Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-base">Scanner Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-400 font-medium">Scanner</th>
                  <th className="text-left py-2 text-slate-400 font-medium">Type</th>
                  <th className="text-right py-2 text-slate-400 font-medium">Scans</th>
                  <th className="text-right py-2 text-slate-400 font-medium">Success</th>
                  <th className="text-right py-2 text-slate-400 font-medium">Avg Time</th>
                  <th className="text-right py-2 text-slate-400 font-medium">Results</th>
                  <th className="text-right py-2 text-slate-400 font-medium">24h</th>
                </tr>
              </thead>
              <tbody>
                {data.scanners.map(s => (
                  <tr key={s.name} className="border-b border-slate-700/50">
                    <td className="py-2 text-white font-medium">{s.name}</td>
                    <td className="py-2">
                      <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                        {s.type}
                      </Badge>
                    </td>
                    <td className="py-2 text-right text-slate-300">{s.totalScans}</td>
                    <td className={`py-2 text-right font-medium ${getStatusColor(s.successRate)}`}>
                      {s.successRate}%
                    </td>
                    <td className="py-2 text-right text-slate-300">
                      <span className="flex items-center justify-end gap-1">
                        <Timer className="h-3 w-3 text-slate-500" />
                        {(s.avgResponseTimeMs / 1000).toFixed(1)}s
                      </span>
                    </td>
                    <td className="py-2 text-right text-slate-300">{s.totalResults}</td>
                    <td className="py-2 text-right">
                      {s.last24h.success > 0 || s.last24h.failed > 0 ? (
                        <span className="flex items-center justify-end gap-1">
                          <span className="text-emerald-400">{s.last24h.success}</span>
                          <span className="text-slate-500">/</span>
                          <span className="text-red-400">{s.last24h.failed}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Error Breakdown + Confidence Distribution */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Error Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(data.errorBreakdown).length === 0 ? (
              <p className="text-slate-500 text-sm">No errors in the last 7 days</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(data.errorBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">{type}</span>
                      <Badge variant="outline" className="border-red-500/30 text-red-400">
                        {count}
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" />
              Confidence Distribution (7d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.confidenceDistribution.length === 0 ? (
              <p className="text-slate-500 text-sm">No exposures in the last 7 days</p>
            ) : (
              <div className="space-y-2">
                {data.confidenceDistribution
                  .sort((a, b) => b.count - a.count)
                  .map(d => (
                    <div key={d.classification || "null"} className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">{d.classification || "Unclassified"}</span>
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        {d.count}
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
