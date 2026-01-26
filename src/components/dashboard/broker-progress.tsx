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
}

interface BrokerProgressProps {
  brokers: BrokerStat[];
  className?: string;
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

export function BrokerProgress({ brokers, className }: BrokerProgressProps) {
  const [expanded, setExpanded] = useState(false);

  const displayBrokers = expanded ? brokers : brokers.slice(0, 5);

  if (brokers.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-400">Broker Status</h3>
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
          const progress =
            broker.exposureCount > 0
              ? Math.round((broker.completedCount / broker.exposureCount) * 100)
              : 0;

          return (
            <Link
              key={broker.source}
              href={`/dashboard/exposures?source=${broker.source}`}
              className="block"
            >
              <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <StatusIcon className={cn("h-4 w-4", config.color.split(" ")[1])} />
                  <span className="text-sm text-white">{broker.sourceName}</span>
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

      {brokers.length > 5 && (
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
              Show {brokers.length - 5} More
            </>
          )}
        </Button>
      )}
    </div>
  );
}
