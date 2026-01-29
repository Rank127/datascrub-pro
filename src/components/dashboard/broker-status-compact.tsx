"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Building2 } from "lucide-react";
import { BrokerProgress } from "./broker-progress";

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

interface BrokerStatusCompactProps {
  brokers: BrokerStat[];
  className?: string;
}

const STORAGE_KEY = "dashboard-broker-status-expanded";

export function BrokerStatusCompact({
  brokers,
  className,
}: BrokerStatusCompactProps) {
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

  if (brokers.length === 0) {
    return null;
  }

  return (
    <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
      <CardHeader className="pb-2">
        <button
          onClick={toggleExpanded}
          className="flex items-center justify-between w-full text-left"
        >
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-slate-400" />
            Broker Status ({brokers.length} brokers)
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white h-7 px-2"
            asChild
          >
            <span>
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
          </Button>
        </button>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0">
          <BrokerProgress brokers={brokers} />
        </CardContent>
      )}
    </Card>
  );
}
