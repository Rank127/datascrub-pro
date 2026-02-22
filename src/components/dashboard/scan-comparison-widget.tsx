"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Search, AlertTriangle } from "lucide-react";

interface ScanComparisonData {
  confirmed: number;
  projected: number;
  checking: number;
  totalActive: number;
  totalKnownBrokers: number;
  benchmarks: {
    malwarebytes: { scannedSites: number; avgExposures: number };
    deleteme: { scannedSites: number; avgExposures: number };
    incogni: { scannedSites: number; avgExposures: number };
  };
}

export function ScanComparisonWidget() {
  const [data, setData] = useState<ScanComparisonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/scan-comparison")
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data || data.totalActive === 0) return null;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Search className="h-4 w-4 text-emerald-400" />
          Scan Coverage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main stat */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">{data.confirmed}</span>
          <span className="text-sm text-slate-400">confirmed exposures</span>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <div className="flex items-center gap-1 mb-1">
              <Eye className="h-3 w-3 text-emerald-400" />
              <span className="text-xs text-emerald-400">Confirmed</span>
            </div>
            <span className="text-lg font-semibold text-white">{data.confirmed}</span>
          </div>
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-1 mb-1">
              <Shield className="h-3 w-3 text-blue-400" />
              <span className="text-xs text-blue-400">Projected</span>
            </div>
            <span className="text-lg font-semibold text-white">{data.projected}</span>
          </div>
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle className="h-3 w-3 text-amber-400" />
              <span className="text-xs text-amber-400">To Verify</span>
            </div>
            <span className="text-lg font-semibold text-white">{data.checking}</span>
          </div>
        </div>

        {/* Coverage bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Your coverage</span>
            <span>{data.totalKnownBrokers.toLocaleString()}+ known sites</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.max(2, (data.totalActive / data.totalKnownBrokers) * 100))}%` }}
            />
          </div>
        </div>

        {/* Context message */}
        <p className="text-xs text-slate-400">
          Found <strong className="text-white">{data.confirmed}</strong> confirmed exposures across active scans.
          {data.projected > 0 && (
            <> Your data likely appears on <strong className="text-white">{data.projected}+</strong> additional broker sites in our removal network.</>
          )}
        </p>

        {/* Benchmark comparison */}
        <div className="pt-2 border-t border-slate-700">
          <p className="text-xs text-slate-500 mb-2">Industry comparison (avg exposures found):</p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
              Malwarebytes: {data.benchmarks.malwarebytes.avgExposures}
            </Badge>
            <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
              Incogni: {data.benchmarks.incogni.avgExposures}
            </Badge>
            <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
              DeleteMe: {data.benchmarks.deleteme.avgExposures}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
