"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IntegrationCard, MetricDisplay } from "./integration-card";
import { AnalyticsIntegrationResponse } from "@/lib/integrations/types";
import {
  BarChart3,
  Users,
  TrendingUp,
  Globe,
  ExternalLink,
  RefreshCw,
  Eye,
  Target,
} from "lucide-react";

interface AnalyticsSectionProps {
  data: AnalyticsIntegrationResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

export function AnalyticsSection({
  data,
  loading,
  onRefresh,
}: AnalyticsSectionProps) {
  if (loading) {
    return (
      <IntegrationCard
        title="Google Analytics"
        icon={BarChart3}
        status="loading"
        message="Loading analytics data..."
      />
    );
  }

  if (!data?.configured) {
    return (
      <IntegrationCard
        title="Google Analytics"
        icon={BarChart3}
        status="not_configured"
        message={
          data?.error ||
          "Configure GOOGLE_SERVICE_ACCOUNT_KEY and GA_PROPERTY_ID to enable"
        }
      >
        <div className="text-sm text-slate-400 p-4 bg-slate-800/50 rounded-lg">
          <p className="font-medium mb-2">Setup Instructions:</p>
          <ol className="list-decimal list-inside space-y-2 text-slate-500">
            <li>Create a Google Cloud project</li>
            <li>Enable the Analytics Data API</li>
            <li>Create a service account with Analytics Viewer role</li>
            <li>Download the JSON key and base64 encode it</li>
            <li>Add the service account email to your GA4 property</li>
          </ol>
          <p className="font-medium mt-4 mb-2">Required Environment Variables:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li>GOOGLE_SERVICE_ACCOUNT_KEY (base64 encoded)</li>
            <li>GA_PROPERTY_ID (e.g., properties/123456789)</li>
          </ul>
        </div>
      </IntegrationCard>
    );
  }

  return (
    <div className="space-y-4">
      <IntegrationCard
        title="Google Analytics"
        icon={BarChart3}
        status="connected"
        message="GA4 Data API connected"
      >
        {/* Actions */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <a
            href="https://analytics.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              GA Dashboard
            </Button>
          </a>
        </div>

        {/* Page Views */}
        {data.pageViews && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <MetricDisplay
              label="Page Views Today"
              value={data.pageViews.today.toLocaleString()}
              variant="success"
            />
            <MetricDisplay
              label="Page Views (7 days)"
              value={data.pageViews.week.toLocaleString()}
            />
            <MetricDisplay
              label="Page Views (30 days)"
              value={data.pageViews.month.toLocaleString()}
            />
          </div>
        )}

        {/* Active Users */}
        {data.activeUsers && (
          <div className="grid grid-cols-3 gap-4">
            <MetricDisplay
              label="DAU (Daily)"
              value={data.activeUsers.dau.toLocaleString()}
              variant="success"
            />
            <MetricDisplay
              label="WAU (Weekly)"
              value={data.activeUsers.wau.toLocaleString()}
            />
            <MetricDisplay
              label="MAU (Monthly)"
              value={data.activeUsers.mau.toLocaleString()}
            />
          </div>
        )}
      </IntegrationCard>

      {/* Top Pages */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-400" />
            Top Pages (30 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.topPages.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No page data available</p>
            ) : (
              data.topPages.map((page, index) => (
                <div
                  key={page.path}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-6">#{index + 1}</span>
                    <span className="text-sm text-white font-mono truncate max-w-[300px]">
                      {page.path}
                    </span>
                  </div>
                  <span className="text-sm text-emerald-400 font-medium">
                    {page.views.toLocaleString()} views
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Traffic Sources & Conversions */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Traffic Sources */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-400" />
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.trafficSources.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No traffic data</p>
              ) : (
                data.trafficSources.map((source) => {
                  const total = data.trafficSources.reduce(
                    (sum, s) => sum + s.sessions,
                    0
                  );
                  const percentage = total > 0 ? (source.sessions / total) * 100 : 0;

                  return (
                    <div key={source.source} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">
                          {source.source}
                        </span>
                        <span className="text-xs text-slate-500">
                          {source.sessions.toLocaleString()} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Conversions */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-400" />
              Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.conversions.length === 0 ? (
                <p className="text-slate-500 text-center py-4">
                  No conversion events tracked
                </p>
              ) : (
                data.conversions.map((conversion) => (
                  <div
                    key={conversion.event}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                  >
                    <span className="text-sm text-white">{conversion.event}</span>
                    <span className="text-sm text-emerald-400 font-medium">
                      {conversion.count.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
