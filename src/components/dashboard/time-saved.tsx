"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSavedProps {
  hours: number;
  minutes: number;
  estimatedValue?: number;
  className?: string;
}

export function TimeSaved({
  hours,
  minutes,
  estimatedValue,
  className,
}: TimeSavedProps) {
  // Format the time display
  const formatTime = () => {
    if (hours >= 1) {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      if (m > 0) {
        return `${h}h ${m}m`;
      }
      return `${h} hour${h !== 1 ? "s" : ""}`;
    }
    return `${minutes} min${minutes !== 1 ? "s" : ""}`;
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="p-3 bg-emerald-500/20 rounded-full mb-2">
        <Clock className="h-6 w-6 text-emerald-400" />
      </div>
      <div className="text-2xl font-bold text-white">{formatTime()}</div>
      <p className="text-xs text-slate-400">saved vs manual</p>
      {estimatedValue !== undefined && estimatedValue > 0 && (
        <p className="text-xs text-emerald-400 mt-1">
          ~${estimatedValue} value
        </p>
      )}
    </div>
  );
}
