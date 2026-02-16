"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/dashboard/executive/metric-card";
import { CompetitiveIntelMetrics } from "@/lib/executive/types";
import {
  Crosshair,
  Eye,
  AlertTriangle,
  Shield,
  Lightbulb,
  Clock,
} from "lucide-react";

interface CompetitiveSectionProps {
  data?: CompetitiveIntelMetrics;
}

const impactColors: Record<string, string> = {
  HIGH: "bg-red-500/20 text-red-300 border-red-500/30",
  MEDIUM: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  LOW: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

const changeTypeColors: Record<string, string> = {
  PRICING: "bg-emerald-500/20 text-emerald-300",
  FEATURE: "bg-blue-500/20 text-blue-300",
  MARKETING: "bg-purple-500/20 text-purple-300",
  BROKER_COUNT: "bg-amber-500/20 text-amber-300",
};

export function CompetitiveSection({ data }: CompetitiveSectionProps) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Crosshair className="h-12 w-12 text-indigo-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          No Competitive Intelligence Data Yet
        </h3>
        <p className="text-slate-400 max-w-md">
          The competitive monitor runs weekly on Mondays. Data will appear here
          after the first run.
        </p>
      </div>
    );
  }

  const highImpactCount = data.recentChanges.filter(
    (c) => c.impact === "HIGH"
  ).length;

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Changes Detected (30d)"
          value={data.recentChanges.length}
          icon={Eye}
          variant="info"
          subtitle="Across all competitors"
        />
        <MetricCard
          title="High Impact Alerts"
          value={highImpactCount}
          icon={AlertTriangle}
          variant={highImpactCount > 0 ? "danger" : "success"}
          subtitle="Requires attention"
        />
        <MetricCard
          title="Feature Gaps"
          value={data.gapAnalysis.length}
          icon={Crosshair}
          variant="warning"
          subtitle="vs competitors"
        />
        <MetricCard
          title="Our Advantages"
          value={data.advantages.length}
          icon={Shield}
          variant="success"
          subtitle="Unique strengths"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Changes Timeline */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-400" />
              Recent Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentChanges.length === 0 ? (
              <p className="text-slate-500 text-sm">
                No changes detected in the last 30 days.
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {data.recentChanges.map((change) => (
                  <div
                    key={change.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {change.competitor}
                        </span>
                        <Badge
                          variant="outline"
                          className={changeTypeColors[change.changeType] || "bg-slate-500/20 text-slate-300"}
                        >
                          {change.changeType}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={impactColors[change.impact] || impactColors.LOW}
                        >
                          {change.impact}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {change.description}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(change.detectedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feature Gaps */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-amber-400" />
              Feature Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.gapAnalysis.length === 0 ? (
              <p className="text-slate-500 text-sm">
                No feature gaps identified.
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {data.gapAnalysis.map((gap, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        {gap.feature}
                      </span>
                      <Badge
                        variant="outline"
                        className={impactColors[gap.priority] || impactColors.LOW}
                      >
                        {gap.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">
                      {gap.estimatedImpact}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {gap.competitors.map((comp) => (
                        <span
                          key={comp}
                          className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Our Advantages */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              Our Advantages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.advantages.length === 0 ? (
              <p className="text-slate-500 text-sm">
                No unique advantages identified yet.
              </p>
            ) : (
              <div className="space-y-2">
                {data.advantages.map((adv, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20"
                  >
                    <p className="text-sm font-medium text-emerald-300">
                      {adv.feature}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {adv.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strategic Recommendations */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              Strategic Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recommendations.length === 0 ? (
              <p className="text-slate-500 text-sm">
                No recommendations at this time.
              </p>
            ) : (
              <div className="space-y-2">
                {data.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                  >
                    <span className="text-indigo-400 font-bold text-sm mt-0.5">
                      {i + 1}.
                    </span>
                    <p className="text-sm text-slate-300">{rec}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Changes by Competitor */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">
              Changes by Competitor (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(data.changesByCompetitor).length === 0 ? (
              <p className="text-slate-500 text-sm">No data yet.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(data.changesByCompetitor)
                  .sort(([, a], [, b]) => b - a)
                  .map(([competitor, count]) => (
                    <div
                      key={competitor}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-slate-300">
                        {competitor}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{
                              width: `${Math.min(100, (count / Math.max(...Object.values(data.changesByCompetitor))) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 w-6 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Changes by Type */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">
              Changes by Type (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(data.changesByType).length === 0 ? (
              <p className="text-slate-500 text-sm">No data yet.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(data.changesByType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between"
                    >
                      <Badge
                        variant="outline"
                        className={changeTypeColors[type] || "bg-slate-500/20 text-slate-300"}
                      >
                        {type}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{
                              width: `${Math.min(100, (count / Math.max(...Object.values(data.changesByType))) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 w-6 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Last Run Info */}
      {data.lastRun && (
        <p className="text-xs text-slate-500 text-right">
          Last run: {new Date(data.lastRun).toLocaleString()} | Total snapshots:{" "}
          {data.totalSnapshots}
        </p>
      )}
    </div>
  );
}
