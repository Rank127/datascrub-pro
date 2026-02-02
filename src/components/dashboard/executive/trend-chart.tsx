"use client";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrendChartProps {
  title: string;
  data: Array<{ date: string; value: number }>;
  color?: string;
  type?: "line" | "area" | "bar";
  height?: number;
}

const COLORS = {
  emerald: "#10b981",
  blue: "#3b82f6",
  amber: "#f59e0b",
  red: "#ef4444",
  purple: "#8b5cf6",
  cyan: "#06b6d4",
};

export function TrendChart({
  title,
  data,
  color = "emerald",
  type = "area",
  height = 200,
}: TrendChartProps) {
  const chartColor = COLORS[color as keyof typeof COLORS] || COLORS.emerald;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-slate-400 text-xs">{label}</p>
          <p className="text-white font-semibold">
            {new Intl.NumberFormat("en-US").format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    switch (type) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => new Intl.NumberFormat("en-US", { notation: "compact" }).format(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: chartColor }}
            />
          </LineChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => new Intl.NumberFormat("en-US", { notation: "compact" }).format(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill={chartColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      default: // area
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => new Intl.NumberFormat("en-US", { notation: "compact" }).format(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={2}
              fill={`url(#gradient-${color})`}
            />
          </AreaChart>
        );
    }
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface PieChartProps {
  title: string;
  data: Array<{ name: string; value: number; color?: string }>;
  height?: number;
}

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export function DonutChart({ title, data, height = 200 }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const percentage = ((item.value / total) * 100).toFixed(1);
                  return (
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
                      <p className="text-white font-semibold">{item.name}</p>
                      <p className="text-slate-400 text-sm">
                        {item.value.toLocaleString()} ({percentage}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              content={({ payload }) => (
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                  {payload?.map((entry: { color?: string; value?: string }, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-xs text-slate-400">{entry.value}</span>
                    </div>
                  ))}
                </div>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
}

export function ProgressBar({ label, value, max, color = "emerald" }: ProgressBarProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const colorClass = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  }[color] || "bg-emerald-500";

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-medium">
          {value.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
