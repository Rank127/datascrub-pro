"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Download,
  Calendar,
  TrendingDown,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

// Mock report data
const reports = [
  {
    id: "1",
    period: "January 2024",
    generatedAt: "2024-01-31",
    stats: {
      newExposures: 5,
      removedExposures: 8,
      riskScoreChange: -12,
    },
  },
  {
    id: "2",
    period: "December 2023",
    generatedAt: "2023-12-31",
    stats: {
      newExposures: 12,
      removedExposures: 6,
      riskScoreChange: 8,
    },
  },
  {
    id: "3",
    period: "November 2023",
    generatedAt: "2023-11-30",
    stats: {
      newExposures: 3,
      removedExposures: 10,
      riskScoreChange: -15,
    },
  },
];

const summaryData = {
  totalExposuresRemoved: 24,
  riskScoreReduction: 35,
  sourcesMonitored: 15,
  averageRemovalTime: "3.2 days",
};

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-slate-400">
            View your monthly data protection reports
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Download className="mr-2 h-4 w-4" />
          Export All
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span className="text-2xl font-bold text-white">
                {summaryData.totalExposuresRemoved}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">Total Exposures Removed</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-emerald-500" />
              <span className="text-2xl font-bold text-emerald-400">
                -{summaryData.riskScoreReduction}%
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">Risk Score Reduction</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold text-white">
                {summaryData.sourcesMonitored}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">Sources Monitored</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold text-white">
                {summaryData.averageRemovalTime}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">Avg. Removal Time</p>
          </CardContent>
        </Card>
      </div>

      {/* Protection Progress */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Protection Progress</CardTitle>
          <CardDescription className="text-slate-400">
            Your data protection improvement over time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Data Broker Removal</span>
              <span className="text-white">75%</span>
            </div>
            <Progress value={75} className="h-2 bg-slate-700" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Breach Mitigation</span>
              <span className="text-white">60%</span>
            </div>
            <Progress value={60} className="h-2 bg-slate-700" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Social Media Cleanup</span>
              <span className="text-white">40%</span>
            </div>
            <Progress value={40} className="h-2 bg-slate-700" />
          </div>
        </CardContent>
      </Card>

      {/* Monthly Reports */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-emerald-500" />
            Monthly Reports
          </CardTitle>
          <CardDescription className="text-slate-400">
            Download detailed reports for each month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <FileText className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{report.period}</h4>
                    <p className="text-sm text-slate-400">
                      Generated {new Date(report.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-orange-400" />
                        <span className="text-white">
                          {report.stats.newExposures}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">New</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                        <span className="text-white">
                          {report.stats.removedExposures}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Removed</p>
                    </div>
                    <div className="text-center">
                      <Badge
                        variant="outline"
                        className={
                          report.stats.riskScoreChange < 0
                            ? "bg-emerald-500/20 text-emerald-400 border-0"
                            : "bg-red-500/20 text-red-400 border-0"
                        }
                      >
                        {report.stats.riskScoreChange < 0 ? (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(report.stats.riskScoreChange)}%
                      </Badge>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
