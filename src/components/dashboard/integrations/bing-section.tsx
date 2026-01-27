"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IntegrationCard, MetricDisplay } from "./integration-card";
import { BingIntegrationResponse } from "@/lib/integrations/types";
import {
  Search,
  ExternalLink,
  RefreshCw,
  MousePointer,
  Eye,
  Link2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface BingSectionProps {
  data: BingIntegrationResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

export function BingSection({ data, loading, onRefresh }: BingSectionProps) {
  if (loading) {
    return (
      <IntegrationCard
        title="Bing Webmaster Tools"
        icon={Search}
        status="loading"
        message="Loading Bing data..."
      />
    );
  }

  if (!data?.configured) {
    return (
      <IntegrationCard
        title="Bing Webmaster Tools"
        icon={Search}
        status="not_configured"
        message={
          data?.error ||
          "Configure BING_WEBMASTER_API_KEY and BING_SITE_URL to enable"
        }
      >
        <div className="text-sm text-slate-400 p-4 bg-slate-800/50 rounded-lg">
          <p className="font-medium mb-2">Setup Instructions:</p>
          <ol className="list-decimal list-inside space-y-2 text-slate-500">
            <li>Go to Bing Webmaster Tools</li>
            <li>Click Settings (gear icon) → API Access</li>
            <li>Generate an API key</li>
            <li>Add to environment variables</li>
          </ol>
          <p className="font-medium mt-4 mb-2">Required Environment Variables:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li>BING_WEBMASTER_API_KEY</li>
            <li>BING_SITE_URL (e.g., https://ghostmydata.com)</li>
          </ul>
        </div>
      </IntegrationCard>
    );
  }

  return (
    <div className="space-y-4">
      <IntegrationCard
        title="Bing Webmaster Tools"
        icon={Search}
        status="connected"
        message="Bing API connected"
      >
        {/* Actions */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <a
            href="https://www.bing.com/webmasters"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Bing Dashboard
            </Button>
          </a>
        </div>

        {/* Search Performance */}
        {data.searchPerformance && (
          <div className="grid grid-cols-4 gap-4 mb-4">
            <MetricDisplay
              label="Clicks"
              value={data.searchPerformance.clicks.toLocaleString()}
              variant="success"
            />
            <MetricDisplay
              label="Impressions"
              value={data.searchPerformance.impressions.toLocaleString()}
            />
            <MetricDisplay
              label="Avg CTR"
              value={`${data.searchPerformance.averageCtr.toFixed(2)}%`}
            />
            <MetricDisplay
              label="Avg Position"
              value={data.searchPerformance.averagePosition.toFixed(1)}
            />
          </div>
        )}

        {/* Crawl Stats */}
        {data.crawlStats && (
          <div className="grid grid-cols-4 gap-4">
            <MetricDisplay
              label="Pages Crawled"
              value={data.crawlStats.crawledPages.toLocaleString()}
            />
            <MetricDisplay
              label="In Index"
              value={data.crawlStats.inIndex.toLocaleString()}
              variant="success"
            />
            <MetricDisplay
              label="Crawl Errors"
              value={data.crawlStats.crawlErrors.toLocaleString()}
              variant={data.crawlStats.crawlErrors > 0 ? "warning" : "default"}
            />
            <MetricDisplay
              label="Blocked by Robots"
              value={data.crawlStats.blockedByRobots.toLocaleString()}
            />
          </div>
        )}
      </IntegrationCard>

      {/* Top Search Queries */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <MousePointer className="h-5 w-5 text-blue-400" />
            Top Search Queries (Bing)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.topQueries.length === 0 ? (
              <p className="text-slate-500 text-center py-4">
                No search query data yet. Data will appear after Bing indexes your site.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 border-b border-slate-700">
                      <th className="pb-2 font-medium">Query</th>
                      <th className="pb-2 font-medium text-right">Clicks</th>
                      <th className="pb-2 font-medium text-right">Impressions</th>
                      <th className="pb-2 font-medium text-right">CTR</th>
                      <th className="pb-2 font-medium text-right">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topQueries.slice(0, 10).map((query, index) => (
                      <tr
                        key={index}
                        className="text-sm border-b border-slate-800 last:border-0"
                      >
                        <td className="py-2 text-white truncate max-w-[200px]">
                          {query.query}
                        </td>
                        <td className="py-2 text-right text-emerald-400 font-medium">
                          {query.clicks.toLocaleString()}
                        </td>
                        <td className="py-2 text-right text-slate-400">
                          {query.impressions.toLocaleString()}
                        </td>
                        <td className="py-2 text-right text-slate-400">
                          {query.ctr.toFixed(2)}%
                        </td>
                        <td className="py-2 text-right text-slate-400">
                          {query.position.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Pages & Backlinks */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Top Pages */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-400" />
              Top Pages (Bing)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.topPages.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No page data yet</p>
              ) : (
                data.topPages.slice(0, 5).map((page, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg"
                  >
                    <span className="text-sm text-white font-mono truncate max-w-[200px]">
                      {new URL(page.url).pathname || "/"}
                    </span>
                    <span className="text-xs text-emerald-400 font-medium">
                      {page.clicks} clicks
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Backlinks */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              <Link2 className="h-5 w-5 text-emerald-400" />
              Recent Backlinks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recentBacklinks.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No backlinks found yet</p>
              ) : (
                data.recentBacklinks.slice(0, 5).map((link, index) => (
                  <div
                    key={index}
                    className="p-2 bg-slate-800/50 rounded-lg"
                  >
                    <a
                      href={link.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:underline truncate block"
                    >
                      {link.sourceUrl}
                    </a>
                    {link.anchorText && (
                      <span className="text-xs text-slate-500">
                        Anchor: {link.anchorText}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crawl Status Summary */}
      {data.crawlStats && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              {data.crawlStats.crawlErrors > 0 ? (
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              ) : (
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              )}
              Crawl Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-400">Index Coverage</span>
                  <span className="text-sm text-white">
                    {data.crawlStats.crawledPages > 0
                      ? Math.round((data.crawlStats.inIndex / data.crawlStats.crawledPages) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${data.crawlStats.crawledPages > 0
                        ? (data.crawlStats.inIndex / data.crawlStats.crawledPages) * 100
                        : 0}%`,
                    }}
                  />
                </div>
              </div>
              {data.crawlStats.crawlErrors > 0 && (
                <div className="text-right">
                  <p className="text-yellow-400 text-sm font-medium">
                    {data.crawlStats.crawlErrors} errors
                  </p>
                  <p className="text-xs text-slate-500">Check Bing dashboard</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
