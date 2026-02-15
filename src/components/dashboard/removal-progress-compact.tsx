"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronDown,
  ChevronUp,
  Package,
  Zap,
  ArrowRight,
  Database,
  ShieldAlert,
  Share2,
  Bot,
} from "lucide-react";

interface RemovalProgress {
  completed: number;
  total: number;
  percentage: number;
}

interface RemovalProgressCompactProps {
  removalProgress: {
    dataBrokers: RemovalProgress;
    breaches: RemovalProgress;
    socialMedia: RemovalProgress;
    aiProtection: RemovalProgress;
  };
  pendingRemovals: number;
  onStartWizard: () => void;
  className?: string;
}

const STORAGE_KEY = "dashboard-removal-progress-expanded";

export function RemovalProgressCompact({
  removalProgress,
  pendingRemovals,
  onStartWizard,
  className,
}: RemovalProgressCompactProps) {
  const [expanded, setExpanded] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpanded(saved === "true");
    }
  }, []);

  // Save state to localStorage
  const toggleExpanded = () => {
    const newValue = !expanded;
    setExpanded(newValue);
    localStorage.setItem(STORAGE_KEY, String(newValue));
  };

  // Calculate overall progress
  const totalCompleted =
    removalProgress.dataBrokers.completed +
    removalProgress.breaches.completed +
    removalProgress.socialMedia.completed +
    removalProgress.aiProtection.completed;

  const totalItems =
    removalProgress.dataBrokers.total +
    removalProgress.breaches.total +
    removalProgress.socialMedia.total +
    removalProgress.aiProtection.total;

  const overallPercentage = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  // Don't render if nothing to show
  if (totalItems === 0) {
    return null;
  }

  const categories = [
    {
      key: "dataBrokers",
      label: "Data Brokers",
      icon: Database,
      color: "text-purple-400",
      data: removalProgress.dataBrokers,
    },
    {
      key: "breaches",
      label: "Breaches",
      icon: ShieldAlert,
      color: "text-red-400",
      data: removalProgress.breaches,
    },
    {
      key: "socialMedia",
      label: "Social Media",
      icon: Share2,
      color: "text-blue-400",
      data: removalProgress.socialMedia,
    },
    {
      key: "aiProtection",
      label: "AI Protection",
      icon: Bot,
      color: "text-pink-400",
      data: removalProgress.aiProtection,
    },
  ].filter((cat) => cat.data.total > 0);

  return (
    <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2 text-base">
          <Package className="h-4 w-4 text-emerald-400" />
          Removal Progress
        </CardTitle>
        <div className="flex items-center gap-2">
          {pendingRemovals > 0 && (
            <Button
              onClick={onStartWizard}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 h-7 text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              Start Wizard
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Overall progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-slate-400">
              {totalCompleted} of {totalItems} removed
            </span>
            <span className="text-white font-medium">
              {totalItems - totalCompleted > 0
                ? `${totalItems - totalCompleted} in progress`
                : "All done!"}
            </span>
          </div>
          <Progress
            value={overallPercentage}
            className="h-2.5 bg-slate-700"
            indicatorClassName="bg-emerald-500"
          />
        </div>

        {/* Expand/Collapse button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleExpanded}
          className="w-full text-slate-400 hover:text-white hover:bg-slate-700/50 h-7 text-xs"
        >
          {expanded ? (
            <>
              Hide breakdown
              <ChevronUp className="ml-1 h-3 w-3" />
            </>
          ) : (
            <>
              Show breakdown
              <ChevronDown className="ml-1 h-3 w-3" />
            </>
          )}
        </Button>

        {/* Expanded breakdown */}
        {expanded && (
          <div className="space-y-3 mt-3 pt-3 border-t border-slate-700">
            {categories.map((cat) => (
              <div key={cat.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <cat.icon className={cn("h-3.5 w-3.5", cat.color)} />
                    <span className="text-slate-400">{cat.label}</span>
                  </div>
                  <span className="text-white text-xs">
                    {cat.data.completed}/{cat.data.total}
                  </span>
                </div>
                <Progress
                  value={cat.data.percentage}
                  className="h-1.5 bg-slate-700"
                  indicatorClassName={cat.color.replace("text-", "bg-")}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
