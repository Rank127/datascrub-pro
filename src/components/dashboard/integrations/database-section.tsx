"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IntegrationCard, MetricDisplay } from "./integration-card";
import { DatabaseIntegrationResponse } from "@/lib/integrations/types";
import {
  Database,
  Table,
  HardDrive,
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DatabaseSectionProps {
  data: DatabaseIntegrationResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

const statusConfig = {
  healthy: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    label: "Healthy",
  },
  degraded: {
    icon: AlertCircle,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    label: "Degraded",
  },
  error: {
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    label: "Error",
  },
};

export function DatabaseSection({
  data,
  loading,
  onRefresh,
}: DatabaseSectionProps) {
  if (loading) {
    return (
      <IntegrationCard
        title="Database"
        icon={Database}
        status="loading"
        message="Checking database connection..."
      />
    );
  }

  if (!data || data.connectionStatus === "error") {
    return (
      <IntegrationCard
        title="Database"
        icon={Database}
        status="error"
        message={data?.error || "Database connection failed"}
      >
        <div className="text-sm text-slate-400 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="font-medium mb-2 text-red-400">Connection Error</p>
          <p className="text-slate-500">
            Unable to connect to the database. Check your DATABASE_URL configuration
            and ensure the database server is running.
          </p>
        </div>
      </IntegrationCard>
    );
  }

  const status = statusConfig[data.connectionStatus];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-4">
      <IntegrationCard
        title="Database"
        icon={Database}
        status={data.connectionStatus === "healthy" ? "connected" : "error"}
        message={`PostgreSQL • ${data.totalSize}`}
      >
        {/* Actions */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Connection Status */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className={cn("h-4 w-4", status.color)} />
              <span className="text-sm text-slate-400">Connection</span>
            </div>
            <p className={cn("text-lg font-bold", status.color)}>{status.label}</p>
          </div>
          <MetricDisplay
            label="Latency"
            value={`${data.latencyMs}ms`}
            variant={
              data.latencyMs < 100
                ? "success"
                : data.latencyMs < 500
                ? "warning"
                : "danger"
            }
          />
          <MetricDisplay
            label="Total Size"
            value={data.totalSize}
          />
        </div>

        {/* Table Count Summary */}
        <div className="grid grid-cols-4 gap-4">
          {data.tables.slice(0, 4).map((table) => (
            <MetricDisplay
              key={table.name}
              label={table.name}
              value={table.rowCount.toLocaleString()}
              subValue={table.size !== "N/A" ? table.size : undefined}
            />
          ))}
        </div>
      </IntegrationCard>

      {/* Full Table Stats */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <Table className="h-5 w-5 text-blue-400" />
            Table Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-2">
            {data.tables.map((table) => (
              <div
                key={table.name}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <HardDrive className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-white font-mono">{table.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="bg-slate-700/50">
                    {table.rowCount.toLocaleString()} rows
                  </Badge>
                  {table.size !== "N/A" && (
                    <span className="text-xs text-slate-500 w-20 text-right">
                      {table.size}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
