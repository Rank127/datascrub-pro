"use client";

import { WebAnalyticsMetrics } from "@/lib/executive/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  Users,
  Globe,
  Search,
  MousePointerClick,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  BarChart3,
  ExternalLink,
  Radio,
} from "lucide-react";

interface AnalyticsSectionProps {
  data: WebAnalyticsMetrics;
}

const variantStyles = {
  default: "from-slate-500/10 to-slate-500/5 border-slate-500/20",
  success: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
  warning: "from-amber-500/10 to-amber-500/5 border-amber-500/20",
  info: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
};

const iconStyles = {
  default: "bg-slate-500/20 text-slate-400",
  success: "bg-emerald-500/20 text-emerald-400",
  warning: "bg-amber-500/20 text-amber-400",
  info: "bg-blue-500/20 text-blue-400",
};

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  variant?: "default" | "success" | "warning" | "info";
}) {
  const displayValue = typeof value === "number" ? value.toLocaleString() : value;

  return (
    <Card className={`bg-gradient-to-br ${variantStyles[variant]}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconStyles[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 truncate">{title}</p>
            <p className="text-xl font-bold text-white">{displayValue}</p>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NotConfigured({ service }: { service: string }) {
  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardContent className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">{service} Not Configured</h3>
        <p className="text-slate-400 text-sm">
          Configure your {service} integration to see analytics data here.
        </p>
      </CardContent>
    </Card>
  );
}

export function AnalyticsSection({ data }: AnalyticsSectionProps) {
  return (
    <div className="space-y-8">
      {/* Google Analytics Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <BarChart3 className="h-5 w-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Google Analytics</h2>
          {data.googleAnalytics.configured ? (
            <Badge className="bg-emerald-500/20 text-emerald-400">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge className="bg-slate-500/20 text-slate-400">Not Configured</Badge>
          )}
        </div>

        {!data.googleAnalytics.configured ? (
          <NotConfigured service="Google Analytics" />
        ) : !data.googleAnalytics.pageViews && !data.googleAnalytics.activeUsers && !data.googleAnalytics.realTimeUsers && data.googleAnalytics.topPages.length === 0 ? (
          <Card className="bg-amber-900/20 border-amber-800">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-10 w-10 text-amber-400 mx-auto mb-3" />
              <h3 className="text-md font-medium text-white mb-2">No Analytics Data Available</h3>
              <p className="text-slate-400 text-sm">
                Google Analytics is configured but no data was returned. This could mean:
              </p>
              <ul className="text-slate-500 text-sm mt-2 space-y-1">
                <li>• The service account may not have access to the GA property</li>
                <li>• The property ID may be incorrect</li>
                <li>• There may be no recent traffic data</li>
              </ul>
              <p className="text-slate-500 text-xs mt-3">
                Check the Integrations tab for more details
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Real-Time Users */}
            {data.googleAnalytics.realTimeUsers && (
              <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium text-white flex items-center gap-2">
                    <div className="relative">
                      <Radio className="h-4 w-4 text-emerald-400" />
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
                    </div>
                    Real-Time (Last 30 minutes)
                    <Badge className="bg-emerald-500/20 text-emerald-400 ml-2">
                      LIVE
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {/* Active Users Now */}
                    <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Users className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Active Users Now</p>
                        <p className="text-3xl font-bold text-white">
                          {data.googleAnalytics.realTimeUsers.activeUsers}
                        </p>
                      </div>
                    </div>

                    {/* By Country */}
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <p className="text-xs text-slate-400 mb-2">By Country</p>
                      {data.googleAnalytics.realTimeUsers.activeUsersByCountry.length === 0 ? (
                        <p className="text-sm text-slate-500">No data</p>
                      ) : (
                        <div className="space-y-1">
                          {data.googleAnalytics.realTimeUsers.activeUsersByCountry.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-slate-300 truncate">{item.country}</span>
                              <span className="text-white font-medium">{item.users}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* By Page */}
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <p className="text-xs text-slate-400 mb-2">By Page</p>
                      {data.googleAnalytics.realTimeUsers.activeUsersByPage.length === 0 ? (
                        <p className="text-sm text-slate-500">No data</p>
                      ) : (
                        <div className="space-y-1">
                          {data.googleAnalytics.realTimeUsers.activeUsersByPage.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-slate-300 truncate flex-1 mr-2">{item.page}</span>
                              <span className="text-white font-medium">{item.users}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Page Views */}
            {data.googleAnalytics.pageViews && (
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  title="Page Views (Yesterday)"
                  value={data.googleAnalytics.pageViews.today}
                  icon={Eye}
                  variant="info"
                />
                <MetricCard
                  title="Page Views (7 Days)"
                  value={data.googleAnalytics.pageViews.week}
                  icon={Eye}
                  variant="info"
                />
                <MetricCard
                  title="Page Views (30 Days)"
                  value={data.googleAnalytics.pageViews.month}
                  icon={Eye}
                  variant="info"
                />
              </div>
            )}

            {/* Active Users */}
            {data.googleAnalytics.activeUsers && (
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  title="Daily Active Users"
                  value={data.googleAnalytics.activeUsers.dau}
                  subtitle="DAU"
                  icon={Users}
                  variant="success"
                />
                <MetricCard
                  title="Weekly Active Users"
                  value={data.googleAnalytics.activeUsers.wau}
                  subtitle="WAU"
                  icon={Users}
                  variant="success"
                />
                <MetricCard
                  title="Monthly Active Users"
                  value={data.googleAnalytics.activeUsers.mau}
                  subtitle="MAU"
                  icon={Users}
                  variant="success"
                />
              </div>
            )}

            {/* Top Pages & Traffic Sources */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Top Pages */}
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-md font-medium text-white flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-400" />
                    Top Pages (30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.googleAnalytics.topPages.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4">No data available</p>
                  ) : (
                    <div className="space-y-2">
                      {data.googleAnalytics.topPages.slice(0, 8).map((page, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                          <span className="text-sm text-slate-300 truncate flex-1 mr-2">{page.path}</span>
                          <span className="text-sm font-medium text-white">{page.views.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Traffic Sources */}
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-md font-medium text-white flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-emerald-400" />
                    Traffic Sources (30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.googleAnalytics.trafficSources.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4">No data available</p>
                  ) : (
                    <div className="space-y-2">
                      {data.googleAnalytics.trafficSources.slice(0, 8).map((source, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                          <span className="text-sm text-slate-300 capitalize">{source.source}</span>
                          <span className="text-sm font-medium text-white">{source.sessions.toLocaleString()} sessions</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      {/* Bing Webmaster Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Search className="h-5 w-5 text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Bing Webmaster Tools</h2>
          {data.bing.configured ? (
            <Badge className="bg-emerald-500/20 text-emerald-400">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge className="bg-slate-500/20 text-slate-400">Not Configured</Badge>
          )}
        </div>

        {!data.bing.configured ? (
          <NotConfigured service="Bing Webmaster Tools" />
        ) : !data.bing.searchPerformance && !data.bing.crawlStats && data.bing.topQueries.length === 0 ? (
          <Card className="bg-amber-900/20 border-amber-800">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-10 w-10 text-amber-400 mx-auto mb-3" />
              <h3 className="text-md font-medium text-white mb-2">No Bing Data Available</h3>
              <p className="text-slate-400 text-sm">
                Bing Webmaster Tools is configured but no data was returned.
              </p>
              <p className="text-slate-500 text-xs mt-2">
                Check the Integrations tab for API status
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Search Performance */}
            {data.bing.searchPerformance && (
              <div className="grid gap-4 md:grid-cols-4">
                <MetricCard
                  title="Total Clicks"
                  value={data.bing.searchPerformance.clicks}
                  icon={MousePointerClick}
                  variant="success"
                />
                <MetricCard
                  title="Total Impressions"
                  value={data.bing.searchPerformance.impressions}
                  icon={Eye}
                  variant="info"
                />
                <MetricCard
                  title="Average CTR"
                  value={`${data.bing.searchPerformance.averageCtr.toFixed(2)}%`}
                  icon={TrendingUp}
                  variant="warning"
                />
                <MetricCard
                  title="Average Position"
                  value={data.bing.searchPerformance.averagePosition.toFixed(1)}
                  icon={BarChart3}
                  variant="default"
                />
              </div>
            )}

            {/* Crawl Stats */}
            {data.bing.crawlStats && (
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  title="Crawled Pages"
                  value={data.bing.crawlStats.crawledPages}
                  icon={Globe}
                  variant="info"
                />
                <MetricCard
                  title="Pages in Index"
                  value={data.bing.crawlStats.inIndex}
                  icon={CheckCircle}
                  variant="success"
                />
                <MetricCard
                  title="Crawl Errors"
                  value={data.bing.crawlStats.crawlErrors}
                  icon={AlertCircle}
                  variant={data.bing.crawlStats.crawlErrors > 0 ? "warning" : "default"}
                />
              </div>
            )}

            {/* Top Search Queries */}
            {data.bing.topQueries.length > 0 && (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-md font-medium text-white flex items-center gap-2">
                    <Search className="h-4 w-4 text-amber-400" />
                    Top Search Queries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800">
                        <TableHead className="text-slate-400">Query</TableHead>
                        <TableHead className="text-slate-400 text-right">Impressions</TableHead>
                        <TableHead className="text-slate-400 text-right">Clicks</TableHead>
                        <TableHead className="text-slate-400 text-right">CTR</TableHead>
                        <TableHead className="text-slate-400 text-right">Position</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.bing.topQueries.slice(0, 10).map((query, index) => (
                        <TableRow key={index} className="border-slate-800">
                          <TableCell className="text-white">{query.query}</TableCell>
                          <TableCell className="text-slate-300 text-right">{query.impressions.toLocaleString()}</TableCell>
                          <TableCell className="text-slate-300 text-right">{query.clicks.toLocaleString()}</TableCell>
                          <TableCell className="text-slate-300 text-right">{query.ctr.toFixed(2)}%</TableCell>
                          <TableCell className="text-slate-300 text-right">{query.position.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
