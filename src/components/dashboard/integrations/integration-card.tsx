"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntegrationCardProps {
  title: string;
  icon: LucideIcon;
  status: "connected" | "error" | "not_configured" | "loading";
  message?: string;
  children?: React.ReactNode;
  className?: string;
}

const statusConfig = {
  connected: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    label: "Connected",
  },
  error: {
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    badgeClass: "bg-red-500/20 text-red-400 border-red-500/30",
    label: "Error",
  },
  not_configured: {
    icon: AlertCircle,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    badgeClass: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    label: "Not Configured",
  },
  loading: {
    icon: Loader2,
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/20",
    badgeClass: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    label: "Loading...",
  },
};

export function IntegrationCard({
  title,
  icon: Icon,
  status,
  message,
  children,
  className,
}: IntegrationCardProps) {
  const config = statusConfig[status];
  const StatusIcon = status === "loading" ? Loader2 : config.icon;

  return (
    <Card className={cn("bg-slate-900/50 border-slate-800", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", config.bgColor)}>
              <Icon className={cn("h-5 w-5", config.color)} />
            </div>
            <CardTitle className="text-lg font-medium text-white">
              {title}
            </CardTitle>
          </div>
          <Badge variant="outline" className={config.badgeClass}>
            <StatusIcon
              className={cn(
                "h-3 w-3 mr-1",
                status === "loading" && "animate-spin"
              )}
            />
            {config.label}
          </Badge>
        </div>
        {message && (
          <p className="text-xs text-slate-500 mt-2 pl-11">{message}</p>
        )}
      </CardHeader>
      {children && <CardContent className="pt-2">{children}</CardContent>}
    </Card>
  );
}

// Compact status indicator for service lists
interface StatusIndicatorProps {
  status: "connected" | "error" | "not_configured";
  label?: string;
}

export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <StatusIcon className={cn("h-4 w-4", config.color)} />
      {label && <span className="text-sm text-slate-400">{label}</span>}
    </div>
  );
}

// Simple metric display
interface MetricDisplayProps {
  label: string;
  value: string | number;
  subValue?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export function MetricDisplay({
  label,
  value,
  subValue,
  variant = "default",
}: MetricDisplayProps) {
  const valueColors = {
    default: "text-white",
    success: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-red-400",
  };

  return (
    <div className="text-center p-3 bg-slate-800/50 rounded-lg">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={cn("text-lg font-bold", valueColors[variant])}>{value}</p>
      {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
    </div>
  );
}
