"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IntegrationCard, StatusIndicator } from "./integration-card";
import { ServicesIntegrationResponse, RateLimitHealth } from "@/lib/integrations/types";
import {
  Plug,
  Mail,
  Shield,
  Search,
  Bug,
  Database,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  LucideIcon,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServicesStatusProps {
  data: ServicesIntegrationResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

interface ServiceCardProps {
  name: string;
  icon: LucideIcon;
  status: "connected" | "error" | "not_configured";
  message?: string;
  credits?: number | string;
  creditsLabel?: string;
  rateLimit?: RateLimitHealth;
}

const statusConfig = {
  connected: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    label: "Connected",
  },
  error: {
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    label: "Error",
  },
  not_configured: {
    icon: AlertCircle,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    label: "Not Configured",
  },
};

const rateLimitConfig = {
  healthy: {
    color: "text-emerald-400",
    bgColor: "bg-emerald-500",
    label: "Healthy",
  },
  warning: {
    color: "text-amber-400",
    bgColor: "bg-amber-500",
    label: "Warning",
  },
  critical: {
    color: "text-red-400",
    bgColor: "bg-red-500",
    label: "Critical",
  },
};

function ServiceCard({
  name,
  icon: Icon,
  status,
  message,
  credits,
  creditsLabel,
  rateLimit,
}: ServiceCardProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        "p-4 rounded-lg border",
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800/50 rounded-lg">
            <Icon className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-white">{name}</h4>
            {message && (
              <p className="text-xs text-slate-500 mt-0.5">{message}</p>
            )}
          </div>
        </div>
        <StatusIcon className={cn("h-5 w-5", config.color)} />
      </div>

      {credits !== undefined && (
        <div className="mt-2 pt-2 border-t border-slate-700/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {creditsLabel || "Credits"}
            </span>
            <span className={cn("text-sm font-medium", config.color)}>
              {typeof credits === "number" ? credits.toLocaleString() : credits}
            </span>
          </div>
        </div>
      )}

      {/* Rate Limit Health */}
      {rateLimit && (
        <div className="mt-2 pt-2 border-t border-slate-700/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Usage</span>
            <span className={cn("text-xs font-medium", rateLimitConfig[rateLimit.status].color)}>
              {rateLimit.percentUsed}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", rateLimitConfig[rateLimit.status].bgColor)}
              style={{ width: `${Math.min(rateLimit.percentUsed, 100)}%` }}
            />
          </div>
          {rateLimit.recommendation && (
            <div className="mt-2 flex items-start gap-1.5">
              <AlertTriangle className={cn("h-3 w-3 mt-0.5 flex-shrink-0", rateLimitConfig[rateLimit.status].color)} />
              <p className={cn("text-xs", rateLimitConfig[rateLimit.status].color)}>
                {rateLimit.recommendation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ServicesStatus({
  data,
  loading,
  onRefresh,
}: ServicesStatusProps) {
  if (loading) {
    return (
      <IntegrationCard
        title="External Services"
        icon={Plug}
        status="loading"
        message="Checking service connections..."
      />
    );
  }

  if (!data) {
    return (
      <IntegrationCard
        title="External Services"
        icon={Plug}
        status="error"
        message="Failed to load service status"
      />
    );
  }

  // Count connected services
  const services = [
    data.resend,
    data.hibp,
    data.leakcheck,
    data.scrapingbee,
    data.redis,
  ];
  const connectedCount = services.filter((s) => s.status === "connected").length;
  const errorCount = services.filter((s) => s.status === "error").length;

  return (
    <div className="space-y-4">
      <IntegrationCard
        title="External Services"
        icon={Plug}
        status={errorCount > 0 ? "error" : connectedCount > 0 ? "connected" : "not_configured"}
        message={`${connectedCount}/${services.length} services connected`}
      >
        {/* Actions */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Service Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Resend (Email) */}
          <ServiceCard
            name="Resend"
            icon={Mail}
            status={data.resend.status}
            message={data.resend.message}
            rateLimit={data.resend.rateLimit}
          />

          {/* HIBP */}
          <ServiceCard
            name="Have I Been Pwned"
            icon={Shield}
            status={data.hibp.status}
            message={data.hibp.message}
            credits={
              data.hibp.rateLimit?.remaining !== undefined
                ? `${data.hibp.rateLimit.remaining} remaining`
                : undefined
            }
            creditsLabel="Rate Limit"
          />

          {/* LeakCheck */}
          <ServiceCard
            name="LeakCheck"
            icon={Search}
            status={data.leakcheck.status}
            message={data.leakcheck.message}
            credits={data.leakcheck.credits}
            creditsLabel="API Credits"
            rateLimit={data.leakcheck.rateLimit}
          />

          {/* ScrapingBee */}
          <ServiceCard
            name="ScrapingBee"
            icon={Bug}
            status={data.scrapingbee.status}
            message={data.scrapingbee.message}
            credits={
              data.scrapingbee.creditsRemaining !== undefined
                ? `${data.scrapingbee.creditsRemaining}${
                    data.scrapingbee.maxCredits
                      ? ` / ${data.scrapingbee.maxCredits}`
                      : ""
                  }`
                : undefined
            }
            creditsLabel="Credits"
            rateLimit={data.scrapingbee.rateLimit}
          />

          {/* Redis */}
          <ServiceCard
            name="Redis / Upstash"
            icon={Database}
            status={data.redis.status}
            message={data.redis.message}
            credits={
              data.redis.totalJobs !== undefined
                ? data.redis.totalJobs
                : undefined
            }
            creditsLabel="Queue Jobs"
          />
        </div>
      </IntegrationCard>

      {/* Service Details */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <Plug className="h-5 w-5 text-purple-400" />
            Service Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Resend */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-white">Resend (Email)</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIndicator status={data.resend.status} />
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    statusConfig[data.resend.status].color
                  )}
                >
                  RESEND_API_KEY
                </Badge>
              </div>
            </div>

            {/* HIBP */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-white">Have I Been Pwned</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIndicator status={data.hibp.status} />
                <Badge
                  variant="outline"
                  className={cn("text-xs", statusConfig[data.hibp.status].color)}
                >
                  HIBP_API_KEY
                </Badge>
              </div>
            </div>

            {/* LeakCheck */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Search className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-white">LeakCheck</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIndicator status={data.leakcheck.status} />
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    statusConfig[data.leakcheck.status].color
                  )}
                >
                  LEAKCHECK_API_KEY
                </Badge>
              </div>
            </div>

            {/* ScrapingBee */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bug className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-white">ScrapingBee</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIndicator status={data.scrapingbee.status} />
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    statusConfig[data.scrapingbee.status].color
                  )}
                >
                  SCRAPINGBEE_API_KEY
                </Badge>
              </div>
            </div>

            {/* Redis */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-white">Redis / Upstash</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIndicator status={data.redis.status} />
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    statusConfig[data.redis.status].color
                  )}
                >
                  REDIS_URL / UPSTASH_*
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
