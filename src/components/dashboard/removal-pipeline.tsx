"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Send, RefreshCw, CheckCircle } from "lucide-react";

interface RemovalPipelineProps {
  stats: Record<string, number>;
}

interface PipelineStage {
  label: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  lineColor: string;
  arrowColor: string;
}

function buildStages(stats: Record<string, number>): PipelineStage[] {
  return [
    {
      label: "Submitted",
      count: stats.PENDING || 0,
      icon: FileText,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-500",
      textColor: "text-blue-300",
      lineColor: "bg-blue-500/40",
      arrowColor: "border-l-blue-500",
    },
    {
      label: "Sent to Broker",
      count:
        (stats.SUBMITTED || 0) +
        (stats.IN_PROGRESS || 0) +
        (stats.REQUIRES_MANUAL || 0) +
        (stats.FAILED || 0),
      icon: Send,
      color: "text-amber-400",
      bgColor: "bg-amber-500/20",
      borderColor: "border-amber-500",
      textColor: "text-amber-300",
      lineColor: "bg-amber-500/40",
      arrowColor: "border-l-amber-500",
    },
    {
      label: "Processing",
      count: stats.ACKNOWLEDGED || 0,
      icon: RefreshCw,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-500",
      textColor: "text-purple-300",
      lineColor: "bg-purple-500/40",
      arrowColor: "border-l-purple-500",
    },
    {
      label: "Removed",
      count: stats.COMPLETED || 0,
      icon: CheckCircle,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
      borderColor: "border-emerald-500",
      textColor: "text-emerald-300",
      lineColor: "bg-emerald-500/40",
      arrowColor: "border-l-emerald-500",
    },
  ];
}

function StageNode({ stage, index }: { stage: PipelineStage; index: number }) {
  const Icon = stage.icon;
  const hasItems = stage.count > 0;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Circle with icon */}
      <div className="relative">
        <div
          className={`
            w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all
            ${
              hasItems
                ? `${stage.bgColor} ${stage.borderColor}`
                : "bg-slate-700/50 border-slate-600"
            }
          `}
        >
          <Icon
            className={`h-6 w-6 ${hasItems ? stage.color : "text-slate-500"}`}
          />
        </div>
        {/* Count badge */}
        {hasItems && (
          <span
            className={`
              absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5
              rounded-full text-xs font-bold flex items-center justify-center
              ${stage.bgColor} ${stage.color} border ${stage.borderColor}
            `}
          >
            {stage.count}
          </span>
        )}
      </div>
      {/* Label */}
      <div className="text-center">
        <span
          className={`text-xs font-medium ${hasItems ? stage.textColor : "text-slate-500"}`}
        >
          {index + 1}. {stage.label}
        </span>
        {!hasItems && (
          <p className="text-[10px] text-slate-600 mt-0.5">0 items</p>
        )}
      </div>
    </div>
  );
}

function ConnectorLine({ stage }: { stage: PipelineStage }) {
  const hasItems = stage.count > 0;

  return (
    <div className="hidden md:flex items-center flex-1 pt-1">
      <div className="flex items-center w-full">
        <div
          className={`h-0.5 flex-1 ${hasItems ? stage.lineColor : "bg-slate-700"}`}
        />
        <div
          className={`
            w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent
            border-l-[8px] ${hasItems ? stage.arrowColor : "border-l-slate-700"}
          `}
        />
      </div>
    </div>
  );
}

export function RemovalPipeline({ stats }: RemovalPipelineProps) {
  const stages = buildStages(stats);
  const totalItems = stages.reduce((sum, s) => sum + s.count, 0);

  if (totalItems === 0) {
    return null;
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white text-base">
          Removal Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop: horizontal pipeline */}
        <div className="hidden md:flex items-start justify-between gap-2">
          {stages.map((stage, i) => (
            <div key={stage.label} className="contents">
              <StageNode stage={stage} index={i} />
              {i < stages.length - 1 && <ConnectorLine stage={stage} />}
            </div>
          ))}
        </div>

        {/* Mobile: 2x2 grid */}
        <div className="grid grid-cols-2 gap-6 md:hidden">
          {stages.map((stage, i) => (
            <StageNode key={stage.label} stage={stage} index={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
