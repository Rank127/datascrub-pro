"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/dashboard/executive/metric-card";
import { GrowthMetrics } from "@/lib/executive/types";
import {
  Sprout,
  Users,
  Star,
  Share2,
  TrendingUp,
  Lightbulb,
  Clock,
} from "lucide-react";

interface GrowthSectionProps {
  data?: GrowthMetrics;
}

export function GrowthSection({ data }: GrowthSectionProps) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Sprout className="h-12 w-12 text-emerald-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          No Growth Analysis Data Yet
        </h3>
        <p className="text-slate-400 max-w-md">
          The growth analysis runs weekly on Wednesdays. Data will appear here
          after the first run.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Power Users Identified"
          value={data.powerUsers.identified}
          icon={Users}
          variant="success"
        />
        <MetricCard
          title="Advocate Candidates"
          value={data.powerUsers.advocateCandidates}
          icon={Star}
          variant="warning"
        />
        <MetricCard
          title="Viral Coefficient"
          value={data.viralCoefficient.toFixed(2)}
          icon={Share2}
          variant={data.viralCoefficient >= 1 ? "success" : data.viralCoefficient >= 0.5 ? "warning" : "default"}
        />
        <MetricCard
          title="Referral Rate"
          value={data.referrals.conversionRate}
          format="percentage"
          icon={TrendingUp}
          variant={data.referrals.conversionRate >= 10 ? "success" : data.referrals.conversionRate >= 5 ? "warning" : "default"}
        />
      </div>

      {/* Power Users Table + User Segments */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Power Users */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Top Power Users
              <Badge className="bg-emerald-500/20 text-emerald-400 ml-auto">
                {data.powerUsers.topUsers.length} shown
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.powerUsers.topUsers.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.powerUsers.topUsers.map((user, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-800/30 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 truncate">{user.email}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {user.segments.slice(0, 3).map((seg) => (
                          <Badge key={seg} className="bg-emerald-500/10 text-emerald-400 text-[10px] px-1.5 py-0">
                            {seg.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right ml-3 shrink-0">
                      <div className="text-emerald-400 font-bold">{user.score}</div>
                      <div className="text-slate-500">{user.scans}s / {user.removals}r</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No power users identified yet</p>
            )}
          </CardContent>
        </Card>

        {/* Referral Stats */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Referral Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-3 bg-emerald-500/10 rounded-lg">
                <div className="text-lg font-bold text-emerald-400">{data.referrals.analyzed}</div>
                <div className="text-xs text-slate-500">Users Analyzed</div>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                <div className="text-lg font-bold text-blue-400">{data.referrals.totalReferrers}</div>
                <div className="text-xs text-slate-500">Active Referrers</div>
              </div>
            </div>
            {data.referrals.recommendations.length > 0 && (
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" /> Recommendations
                </p>
                {data.referrals.recommendations.slice(0, 4).map((rec, i) => (
                  <p key={i} className="text-xs text-slate-400 pl-4 border-l-2 border-emerald-500/30">
                    {rec}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Growth Insights */}
      {data.powerUsers.insights.length > 0 && (
        <Card className="bg-slate-900/50 border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-400 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Growth Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {data.powerUsers.insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-3 bg-emerald-500/5 rounded-lg">
                  <TrendingUp className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-slate-300">{insight}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Run Info */}
      {data.lastRun && (
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Last analysis: {new Date(data.lastRun).toLocaleString()}
        </p>
      )}
    </div>
  );
}
