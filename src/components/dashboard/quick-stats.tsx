"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  SendHorizontal,
  Trash2,
  HandHelping,
  Shield
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface QuickStatsProps {
  activeExposures: number;
  submittedRemovals: number;
  removedCount: number;
  manualAction: {
    done: number;
    total: number;
  };
  whitelistedCount: number;
  className?: string;
}

const STORAGE_KEY = "dashboard-quick-stats-expanded";

export function QuickStats({
  activeExposures,
  submittedRemovals,
  removedCount,
  manualAction,
  whitelistedCount,
  className,
}: QuickStatsProps) {
  const [expanded, setExpanded] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setExpanded(saved === "true");
    }
  }, []);

  // Save state to localStorage
  const toggleExpanded = () => {
    const newValue = !expanded;
    setExpanded(newValue);
    localStorage.setItem(STORAGE_KEY, String(newValue));
  };

  const stats = [
    {
      label: "Active",
      value: activeExposures,
      icon: AlertTriangle,
      color: "text-orange-400",
      href: "/dashboard/exposures?status=ACTIVE"
    },
    {
      label: "Submitted",
      value: submittedRemovals,
      icon: SendHorizontal,
      color: "text-purple-400",
      href: "/dashboard/removals"
    },
    {
      label: "Removed",
      value: removedCount,
      icon: Trash2,
      color: "text-emerald-400",
      href: "/dashboard/removals"
    },
    {
      label: "Manual",
      value: `${manualAction.done}/${manualAction.total}`,
      icon: HandHelping,
      color: "text-amber-400",
      href: "/dashboard/exposures?manualAction=pending"
    },
    {
      label: "Whitelist",
      value: whitelistedCount,
      icon: Shield,
      color: "text-blue-400",
      href: "/dashboard/whitelist"
    },
  ];

  // For collapsed view, show first 3 stats inline
  const inlineStats = stats.slice(0, 3);
  const hiddenCount = stats.length - 3;

  return (
    <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-300">Quick Stats</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className="text-slate-400 hover:text-white h-7 px-2"
          >
            {expanded ? (
              <>
                Collapse
                <ChevronUp className="ml-1 h-4 w-4" />
              </>
            ) : (
              <>
                Expand
                <ChevronDown className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Collapsed View - Inline Stats */}
        {!expanded && (
          <div className="flex items-center gap-4 mt-2">
            {inlineStats.map((stat, index) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity"
              >
                <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
                <span className="text-slate-400">{stat.label}:</span>
                <span className="text-white font-medium">{stat.value}</span>
                {index < inlineStats.length - 1 && (
                  <span className="text-slate-600 ml-2">•</span>
                )}
              </Link>
            ))}
            {hiddenCount > 0 && (
              <span className="text-xs text-slate-500">+{hiddenCount} more</span>
            )}
          </div>
        )}

        {/* Expanded View - Full Grid */}
        {expanded && (
          <div className="grid grid-cols-5 gap-2 mt-3">
            {stats.map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="flex flex-col items-center p-2 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors cursor-pointer"
              >
                <stat.icon className={cn("h-4 w-4 mb-1", stat.color)} />
                <span className="text-lg font-bold text-white">{stat.value}</span>
                <span className="text-xs text-slate-400">{stat.label}</span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
