"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger" | "info";
  format?: "number" | "currency" | "percentage";
}

const variantStyles = {
  default: "text-slate-400",
  success: "text-emerald-400",
  warning: "text-amber-400",
  danger: "text-red-400",
  info: "text-blue-400",
};

const iconBgStyles = {
  default: "bg-slate-500/10",
  success: "bg-emerald-500/10",
  warning: "bg-amber-500/10",
  danger: "bg-red-500/10",
  info: "bg-blue-500/10",
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  format = "number",
}: MetricCardProps) {
  const formattedValue = () => {
    if (typeof value === "string") return value;

    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value / 100); // Convert cents to dollars
      case "percentage":
        return `${value.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat("en-US").format(value);
    }
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-white">{formattedValue()}</p>
            {subtitle && (
              <p className="text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
          <div className={cn("p-3 rounded-lg", iconBgStyles[variant])}>
            <Icon className={cn("h-5 w-5", variantStyles[variant])} />
          </div>
        </div>

        {trend !== undefined && (
          <div className="mt-4 flex items-center gap-1">
            {trend.value === 0 ? (
              <Minus className="h-4 w-4 text-slate-500" />
            ) : trend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
            <span
              className={cn(
                "text-sm font-medium",
                trend.value === 0
                  ? "text-slate-500"
                  : trend.isPositive
                  ? "text-emerald-400"
                  : "text-red-400"
              )}
            >
              {trend.value > 0 ? "+" : ""}
              {trend.value.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500 ml-1">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for smaller displays
export function MetricCardCompact({
  title,
  value,
  icon: Icon,
  variant = "default",
}: Omit<MetricCardProps, "subtitle" | "trend" | "format">) {
  return (
    <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
      <div className={cn("p-2 rounded-lg", iconBgStyles[variant])}>
        <Icon className={cn("h-4 w-4", variantStyles[variant])} />
      </div>
      <div>
        <p className="text-xs text-slate-400">{title}</p>
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}
