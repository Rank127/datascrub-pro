"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

const colorMap = {
  white: "text-white",
  red: "text-red-400",
  orange: "text-orange-400",
  amber: "text-amber-400",
  blue: "text-blue-400",
  purple: "text-purple-400",
  pink: "text-pink-400",
  emerald: "text-emerald-400",
} as const;

const borderColorMap = {
  white: "",
  red: "border-red-500/30",
  orange: "border-orange-500/30",
  amber: "border-amber-500/30",
  blue: "border-blue-500/30",
  purple: "border-purple-500/30",
  pink: "border-pink-500/30",
  emerald: "border-emerald-500/30",
} as const;

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: LucideIcon;
  color?: keyof typeof colorMap;
  borderColor?: boolean;
  href?: string;
}

export function StatCard({
  value,
  label,
  icon: Icon,
  color = "white",
  borderColor = false,
  href,
}: StatCardProps) {
  const card = (
    <Card
      className={`bg-slate-800/50 border-slate-700 ${
        borderColor ? borderColorMap[color] : ""
      } ${href ? "hover:bg-slate-800/70 hover:border-amber-500/50 transition-all cursor-pointer h-full" : ""}`}
    >
      <CardContent className="pt-6">
        {Icon ? (
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${colorMap[color]}`} />
            <div className={`text-2xl font-bold ${colorMap[color]}`}>{value}</div>
          </div>
        ) : (
          <div className={`text-2xl font-bold ${colorMap[color]}`}>{value}</div>
        )}
        <p className="text-sm text-slate-400">{label}</p>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{card}</Link>;
  }

  return card;
}
