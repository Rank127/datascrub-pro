"use client";

import { cn } from "@/lib/utils";

interface ProtectionScoreProps {
  score: number;
  removed: number;
  total: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProtectionScore({
  score,
  removed,
  total,
  size = "md",
  className,
}: ProtectionScoreProps) {
  const sizeConfig = {
    sm: { container: "w-16 h-16", text: "text-lg", label: "text-xs" },
    md: { container: "w-24 h-24", text: "text-2xl", label: "text-xs" },
    lg: { container: "w-32 h-32", text: "text-3xl", label: "text-sm" },
  };

  const config = sizeConfig[size];

  // Color based on protection level
  const getColor = () => {
    if (score >= 80) return "#10b981"; // emerald-500 - Excellent
    if (score >= 60) return "#22c55e"; // green-500 - Good
    if (score >= 40) return "#eab308"; // yellow-500 - Fair
    if (score >= 20) return "#f97316"; // orange-500 - Poor
    return "#ef4444"; // red-500 - Critical
  };

  const getLabel = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    if (score >= 20) return "Poor";
    return "Critical";
  };

  const color = getColor();
  const strokeWidth = size === "sm" ? 4 : size === "md" ? 6 : 8;
  const radius = size === "sm" ? 28 : size === "md" ? 42 : 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className={cn("relative", config.container)}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-700"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: "stroke-dashoffset 1s ease-in-out",
            }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", config.text)} style={{ color }}>
            {score}%
          </span>
        </div>
      </div>
      <div className="text-center mt-2">
        <p className={cn("font-medium text-white", config.label)}>Protected</p>
        <p className="text-xs text-slate-400">
          {removed} of {total} removed
        </p>
        <p className={cn("text-xs font-medium mt-1", config.label)} style={{ color }}>
          {getLabel()}
        </p>
      </div>
    </div>
  );
}
