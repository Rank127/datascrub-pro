"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IntegrationCard, MetricDisplay } from "./integration-card";
import { VercelIntegrationResponse } from "@/lib/integrations/types";
import {
  Cloud,
  Rocket,
  RefreshCw,
  ExternalLink,
  GitCommit,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface VercelSectionProps {
  data: VercelIntegrationResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

const deploymentStatusConfig: Record<
  string,
  { color: string; bgColor: string; icon: typeof CheckCircle2 }
> = {
  READY: {
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    icon: CheckCircle2,
  },
  BUILDING: {
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    icon: Loader2,
  },
  QUEUED: {
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    icon: Clock,
  },
  ERROR: {
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    icon: XCircle,
  },
  CANCELED: {
    color: "text-slate-400",
    bgColor: "bg-slate-500/20",
    icon: XCircle,
  },
  INITIALIZING: {
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    icon: Loader2,
  },
};

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function VercelSection({ data, loading, onRefresh }: VercelSectionProps) {
  const [redeploying, setRedeploying] = useState(false);

  const handleRedeploy = async () => {
    setRedeploying(true);
    try {
      const response = await fetch("/api/admin/integrations/vercel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "redeploy" }),
      });

      if (response.ok) {
        toast.success("Redeploy triggered successfully");
        onRefresh();
      } else {
        toast.error("Failed to trigger redeploy");
      }
    } catch {
      toast.error("Failed to trigger redeploy");
    } finally {
      setRedeploying(false);
    }
  };

  if (loading) {
    return (
      <IntegrationCard
        title="Vercel"
        icon={Cloud}
        status="loading"
        message="Loading deployment data..."
      />
    );
  }

  if (!data?.configured) {
    return (
      <IntegrationCard
        title="Vercel"
        icon={Cloud}
        status="not_configured"
        message={data?.error || "Configure VERCEL_ACCESS_TOKEN and VERCEL_PROJECT_ID to enable"}
      >
        <div className="text-sm text-slate-400 p-4 bg-slate-800/50 rounded-lg">
          <p className="font-medium mb-2">Required Environment Variables:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li>VERCEL_ACCESS_TOKEN</li>
            <li>VERCEL_PROJECT_ID</li>
            <li>VERCEL_TEAM_ID (optional)</li>
          </ul>
        </div>
      </IntegrationCard>
    );
  }

  const deployments = data.deployments || [];
  const recentDeployment = deployments[0];

  // Debug: log what we're receiving
  console.log("[VercelSection] Data received:", {
    configured: data.configured,
    project: data.project,
    deploymentsCount: deployments.length,
    deployments: deployments.slice(0, 2)
  });

  return (
    <div className="space-y-4">
      <IntegrationCard
        title="Vercel"
        icon={Cloud}
        status="connected"
        message={data.project ? `Project: ${data.project.name}` : `${deployments.length} deployments loaded`}
      >
        {/* Project Info & Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {data.project?.framework && (
              <Badge variant="outline" className="bg-slate-800/50">
                {data.project.framework}
              </Badge>
            )}
            {recentDeployment && (
              <span className="text-xs text-slate-500">
                Last deploy: {formatTimeAgo(recentDeployment.createdAt)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleRedeploy}
              disabled={redeploying}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Rocket className={`h-4 w-4 mr-2 ${redeploying ? "animate-bounce" : ""}`} />
              Redeploy
            </Button>
          </div>
        </div>

        {/* Analytics (if available) */}
        {data.analytics && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <MetricDisplay
              label="Page Views (24h)"
              value={data.analytics.pageViews.toLocaleString()}
            />
            <MetricDisplay
              label="Visitors (24h)"
              value={data.analytics.visitors.toLocaleString()}
            />
            <MetricDisplay
              label="Top Pages"
              value={data.analytics.topPages.length}
            />
          </div>
        )}
      </IntegrationCard>

      {/* Deployments Table */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <Rocket className="h-5 w-5 text-blue-400" />
            Recent Deployments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {deployments.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No deployments found</p>
            ) : (
              deployments.map((deployment) => {
                const statusConfig =
                  deploymentStatusConfig[deployment.state] ||
                  deploymentStatusConfig.QUEUED;
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={deployment.id}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={`${statusConfig.bgColor} ${statusConfig.color} border-transparent`}
                      >
                        <StatusIcon
                          className={`h-3 w-3 mr-1 ${
                            deployment.state === "BUILDING" ? "animate-spin" : ""
                          }`}
                        />
                        {deployment.state}
                      </Badge>
                      <div>
                        {deployment.meta?.githubCommitMessage ? (
                          <div className="flex items-center gap-2">
                            <GitCommit className="h-3 w-3 text-slate-500" />
                            <span className="text-sm text-white truncate max-w-[300px]">
                              {deployment.meta.githubCommitMessage}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-white">{deployment.name}</span>
                        )}
                        {deployment.meta?.githubCommitRef && (
                          <span className="text-xs text-slate-500 ml-5">
                            {deployment.meta.githubCommitRef}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">
                        {formatTimeAgo(deployment.createdAt)}
                      </span>
                      {deployment.state === "READY" && (
                        <a
                          href={`https://${deployment.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
