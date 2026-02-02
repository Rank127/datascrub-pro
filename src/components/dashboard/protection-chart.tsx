"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface TrendDataPoint {
  date: string;
  value: number;
}

interface ProtectionChartProps {
  className?: string;
}

const PERIODS = [
  { value: "1m", label: "1M" },
  { value: "3m", label: "3M" },
  { value: "6m", label: "6M" },
  { value: "1y", label: "1Y" },
];

export function ProtectionChart({ className }: ProtectionChartProps) {
  const [period, setPeriod] = useState("6m");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    exposures: TrendDataPoint[];
    removals: TrendDataPoint[];
    protectionScore: TrendDataPoint[];
  } | null>(null);

  useEffect(() => {
    fetchTrends();
  }, [period]);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/dashboard/trends?period=${period}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch trends:", error);
    } finally {
      setLoading(false);
    }
  };

  // Combine data for the chart
  const chartData =
    data?.exposures.map((exp, i) => ({
      date: formatDate(exp.date),
      exposures: exp.value,
      removals: data.removals[i]?.value || 0,
    })) || [];

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-slate-400 text-xs mb-2">{label}</p>
          {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-white">Protection Progress</CardTitle>
          <CardDescription className="text-slate-400">
            Exposures found vs removals completed
          </CardDescription>
        </div>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <Button
              key={p.value}
              variant={period === p.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setPeriod(p.value)}
              className={
                period === p.value
                  ? "bg-emerald-600 hover:bg-emerald-700 h-7 px-2 text-xs"
                  : "text-slate-400 hover:text-white h-7 px-2 text-xs"
              }
            >
              {p.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[200px]">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-slate-400">
            No data available for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="exposuresGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="removalsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={30}
                formatter={(value) => (
                  <span className="text-xs text-slate-400">{value}</span>
                )}
              />
              <Area
                type="monotone"
                dataKey="exposures"
                name="Exposures Found"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#exposuresGradient)"
              />
              <Area
                type="monotone"
                dataKey="removals"
                name="Removals Completed"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#removalsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// Format date for display
function formatDate(dateStr: string): string {
  // Handle YYYY-MM format
  if (dateStr.length === 7) {
    const [year, month] = dateStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "short" });
  }
  // Handle YYYY-MM-DD format
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
