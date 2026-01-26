"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrokerStat {
  source: string;
  sourceName: string;
  exposureCount: number;
  completedCount: number;
  inProgressCount: number;
  pendingCount: number;
  status: string;
  lastCompletedAt?: string;
  // Consolidation fields
  isParent?: boolean;
  subsidiaryCount?: number;
  subsidiaries?: string[];
  consolidatesTo?: string;
  parentName?: string;
}

interface BrokerProgressProps {
  brokers: BrokerStat[];
  className?: string;
  showConsolidated?: boolean; // If true, group subsidiaries under parents
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: typeof CheckCircle }
> = {
  COMPLETED: {
    label: "Removed",
    color: "bg-emerald-500/20 text-emerald-400",
    icon: CheckCircle,
  },
  PARTIAL: {
    label: "Partial",
    color: "bg-blue-500/20 text-blue-400",
    icon: AlertCircle,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-yellow-500/20 text-yellow-400",
    icon: Clock,
  },
  PENDING: {
    label: "Pending",
    color: "bg-slate-500/20 text-slate-400",
    icon: Clock,
  },
};

export function BrokerProgress({ brokers, className, showConsolidated = true }: BrokerProgressProps) {
  const [expanded, setExpanded] = useState(false);

  // Process brokers to consolidate subsidiaries under parents
  const processedBrokers = showConsolidated ? consolidateBrokers(brokers) : brokers;
  const displayBrokers = expanded ? processedBrokers : processedBrokers.slice(0, 5);

  if (brokers.length === 0) {
    return null;
  }

  // Calculate savings from consolidation
  const originalCount = brokers.length;
  const consolidatedCount = processedBrokers.length;
  const savedActions = originalCount - consolidatedCount;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-slate-400">Broker Status</h3>
          {savedActions > 0 && (
            <Badge variant="outline" className="text-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Layers className="h-3 w-3 mr-1" />
              {savedActions} consolidated
            </Badge>
          )}
        </div>
        <Link href="/dashboard/exposures">
          <Button variant="ghost" size="sm" className="text-emerald-500 hover:text-emerald-400 h-7 text-xs">
            View All
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        {displayBrokers.map((broker) => {
          const config = statusConfig[broker.status] || statusConfig.PENDING;
          const StatusIcon = config.icon;
          const isConsolidatedParent = broker.isParent && (broker.subsidiaryCount || 0) > 0;

          return (
            <Link
              key={broker.source}
              href={`/dashboard/exposures?source=${broker.source}`}
              className="block"
            >
              <div className={cn(
                "flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer",
                isConsolidatedParent ? "bg-slate-700/40 border border-slate-600/50" : "bg-slate-700/30"
              )}>
                <div className="flex items-center gap-2">
                  <StatusIcon className={cn("h-4 w-4", config.color.split(" ")[1])} />
                  <div>
                    <span className="text-sm text-white">{broker.sourceName}</span>
                    {isConsolidatedParent && (
                      <span className="ml-2 text-xs text-emerald-400">
                        +{broker.subsidiaryCount} sites
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {broker.status === "PARTIAL" && (
                    <span className="text-xs text-slate-400">
                      {broker.completedCount}/{broker.exposureCount}
                    </span>
                  )}
                  {broker.status === "IN_PROGRESS" && (
                    <span className="text-xs text-slate-400">
                      {broker.inProgressCount} pending
                    </span>
                  )}
                  {broker.status === "PENDING" && broker.exposureCount > 1 && (
                    <span className="text-xs text-slate-400">
                      {broker.exposureCount} exposures
                    </span>
                  )}
                  {isConsolidatedParent && broker.status === "PENDING" && (
                    <Badge variant="outline" className="text-xs border-0 bg-emerald-500/20 text-emerald-400">
                      1 action
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={cn("text-xs border-0", config.color)}
                  >
                    {config.label}
                  </Badge>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {processedBrokers.length > 5 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-slate-400 hover:text-white"
        >
          {expanded ? (
            <>
              <ChevronUp className="mr-1 h-4 w-4" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 h-4 w-4" />
              Show {processedBrokers.length - 5} More
            </>
          )}
        </Button>
      )}
    </div>
  );
}

// Helper function to consolidate subsidiaries under parent brokers
function consolidateBrokers(brokers: BrokerStat[]): BrokerStat[] {
  const result: BrokerStat[] = [];
  const processedSources = new Set<string>();

  // First pass: identify parent brokers and their subsidiaries
  for (const broker of brokers) {
    if (processedSources.has(broker.source)) continue;

    // If this broker consolidates to a parent, skip it (will be counted under parent)
    if (broker.consolidatesTo) {
      // Check if parent is in the list
      const parentInList = brokers.some(b => b.source === broker.consolidatesTo);
      if (parentInList) {
        processedSources.add(broker.source);
        continue;
      }
    }

    // If this is a parent broker, consolidate subsidiaries
    if (broker.isParent && broker.subsidiaries) {
      const subsidiariesInList = brokers.filter(b =>
        broker.subsidiaries?.includes(b.source) && !processedSources.has(b.source)
      );

      // Mark subsidiaries as processed
      subsidiariesInList.forEach(sub => processedSources.add(sub.source));

      // Update parent with consolidated counts
      const consolidatedBroker: BrokerStat = {
        ...broker,
        subsidiaryCount: subsidiariesInList.length,
        exposureCount: broker.exposureCount + subsidiariesInList.reduce((sum, s) => sum + s.exposureCount, 0),
        completedCount: broker.completedCount + subsidiariesInList.reduce((sum, s) => sum + s.completedCount, 0),
        pendingCount: broker.pendingCount + subsidiariesInList.reduce((sum, s) => sum + s.pendingCount, 0),
      };

      result.push(consolidatedBroker);
      processedSources.add(broker.source);
    } else {
      // Regular broker, add as-is
      result.push(broker);
      processedSources.add(broker.source);
    }
  }

  return result;
}
