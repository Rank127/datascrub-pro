"use client";

import { cn } from "@/lib/utils";

interface RiskScoreProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
}

export function RiskScore({ score, size = "md" }: RiskScoreProps) {
  const getColor = () => {
    if (score <= 25) return "text-emerald-500";
    if (score <= 50) return "text-yellow-500";
    if (score <= 75) return "text-orange-500";
    return "text-red-500";
  };

  const getRiskLevel = () => {
    if (score <= 25) return "Low Risk";
    if (score <= 50) return "Moderate Risk";
    if (score <= 75) return "High Risk";
    return "Critical Risk";
  };

  const sizes = {
    sm: { ring: "w-24 h-24", text: "text-2xl", label: "text-xs" },
    md: { ring: "w-36 h-36", text: "text-4xl", label: "text-sm" },
    lg: { ring: "w-48 h-48", text: "text-5xl", label: "text-base" },
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className={cn("relative", sizes[size].ring)}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-800"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={cn("stop-current", getColor())} />
              <stop offset="100%" className={cn("stop-current", getColor())} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", sizes[size].text, getColor())}>
            {score}
          </span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className={cn("font-medium", sizes[size].label, getColor())}>
          {getRiskLevel()}
        </p>
        <p className={cn("text-slate-500", size === "sm" ? "text-xs" : "text-sm")}>
          Exposure Score
        </p>
      </div>
    </div>
  );
}
