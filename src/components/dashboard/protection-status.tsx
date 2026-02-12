"use client";

import { cn } from "@/lib/utils";
import { Shield, Clock, AlertTriangle, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface ProtectionStatusProps {
  protectionScore: number;
  removedCount: number;
  totalCount: number;
  timeSaved: {
    hours: number;
    minutes: number;
    estimatedValue: number;
  };
  riskScore: number;
  maxExposure?: { found: number; totalKnown: number };
  className?: string;
}

export function ProtectionStatus({
  protectionScore,
  removedCount,
  totalCount,
  timeSaved,
  riskScore,
  maxExposure,
  className,
}: ProtectionStatusProps) {
  // Protection score color
  const getProtectionColor = () => {
    if (protectionScore >= 80) return "text-emerald-400";
    if (protectionScore >= 60) return "text-green-400";
    if (protectionScore >= 40) return "text-yellow-400";
    if (protectionScore >= 20) return "text-orange-400";
    return "text-red-400";
  };

  const getProtectionBgColor = () => {
    if (protectionScore >= 80) return "bg-emerald-500";
    if (protectionScore >= 60) return "bg-green-500";
    if (protectionScore >= 40) return "bg-yellow-500";
    if (protectionScore >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  // Risk level
  const getRiskLevel = () => {
    if (riskScore <= 25) return { label: "Low", color: "text-emerald-400", dots: 1 };
    if (riskScore <= 50) return { label: "Medium", color: "text-yellow-400", dots: 2 };
    if (riskScore <= 75) return { label: "High", color: "text-orange-400", dots: 3 };
    return { label: "Critical", color: "text-red-400", dots: 4 };
  };

  const risk = getRiskLevel();

  // Format time
  const formatTime = () => {
    if (timeSaved.hours >= 1) {
      const h = Math.floor(timeSaved.hours);
      const m = Math.round((timeSaved.hours - h) * 60 + timeSaved.minutes);
      if (m > 0) return `${h}h ${m}m`;
      return `${h}h`;
    }
    return `${timeSaved.minutes}m`;
  };

  return (
    <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2 text-base">
          <Shield className="h-4 w-4 text-emerald-400" />
          Protection Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Protection Score */}
          <Link
            href="/dashboard/exposures"
            className="p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors cursor-pointer"
          >
            <div className="text-xs text-slate-400 mb-1">Protection</div>
            <div className={cn("text-2xl font-bold", getProtectionColor())}>
              {protectionScore}%
            </div>
            <Progress
              value={protectionScore}
              className="h-1.5 mt-2 bg-slate-700"
              indicatorClassName={getProtectionBgColor()}
            />
            <div className="text-xs text-slate-500 mt-1">
              {removedCount}/{totalCount} removed
            </div>
          </Link>

          {/* Time Saved */}
          <Link
            href="/dashboard/removals"
            className="p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors cursor-pointer"
          >
            <div className="text-xs text-slate-400 mb-1">Time Saved</div>
            <div className="text-2xl font-bold text-blue-400 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTime()}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              ~${timeSaved.estimatedValue} value
            </div>
          </Link>

          {/* Risk Level */}
          <Link
            href="/dashboard/exposures?status=ACTIVE"
            className="p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors cursor-pointer"
          >
            <div className="text-xs text-slate-400 mb-1">Risk Level</div>
            <div className={cn("text-2xl font-bold flex items-center gap-1", risk.color)}>
              <AlertTriangle className="h-4 w-4" />
              {risk.label}
            </div>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4].map((dot) => (
                <div
                  key={dot}
                  className={cn(
                    "w-3 h-3 rounded-full",
                    dot <= risk.dots ? risk.color.replace("text-", "bg-") : "bg-slate-700"
                  )}
                />
              ))}
            </div>
          </Link>

          {/* Exposure Reach */}
          <Link
            href="/dashboard/exposures"
            className="p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors cursor-pointer"
          >
            <div className="text-xs text-slate-400 mb-1">Exposure Reach</div>
            <div className="text-2xl font-bold text-orange-400 flex items-center gap-1">
              <Globe className="h-4 w-4" />
              {maxExposure?.found ?? 0}
            </div>
            <Progress
              value={maxExposure ? (maxExposure.found / maxExposure.totalKnown) * 100 : 0}
              className="h-1.5 mt-2 bg-slate-700"
              indicatorClassName="bg-orange-500"
            />
            <div className="text-xs text-slate-500 mt-1">
              of {maxExposure?.totalKnown?.toLocaleString() ?? "2,000"}+ broker sites
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
