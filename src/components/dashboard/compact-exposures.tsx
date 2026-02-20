"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Trash2, Shield, Search, User, Phone, Mail, MapPin, Calendar, Users } from "lucide-react";
import Link from "next/link";
import {
  DataSourceNames,
  type DataSource,
  type Severity,
  type ExposureType,
} from "@/lib/types";

interface Exposure {
  id: string;
  source: DataSource;
  sourceName: string;
  dataType: ExposureType;
  severity: Severity;
  status: string;
  isWhitelisted: boolean;
  exposedFields?: string | null;
}

const FIELD_ICONS: Record<string, { icon: typeof User; tip: string }> = {
  name: { icon: User, tip: "Name" },
  phone: { icon: Phone, tip: "Phone" },
  email: { icon: Mail, tip: "Email" },
  address: { icon: MapPin, tip: "Address" },
  age: { icon: Calendar, tip: "Age" },
  relatives: { icon: Users, tip: "Relatives" },
};

interface CompactExposuresProps {
  exposures: Exposure[];
  onRemove?: (id: string) => void;
  onWhitelist: (id: string) => void;
  className?: string;
}

const dataTypeShortLabels: Partial<Record<ExposureType, string>> = {
  EMAIL: "Email",
  PHONE: "Phone",
  NAME: "Name",
  ADDRESS: "Address",
  DOB: "DOB",
  SSN: "SSN",
  PHOTO: "Photo",
  USERNAME: "Username",
  FINANCIAL: "Financial",
  COMBINED_PROFILE: "Full profile",
  FACE_DATA: "Face data",
  VOICE_DATA: "Voice data",
  AI_TRAINING_DATA: "AI data",
  BIOMETRIC: "Biometric",
};

const severityConfig: Record<Severity, { color: string; bgColor: string }> = {
  LOW: { color: "text-blue-400", bgColor: "bg-blue-500/20" },
  MEDIUM: { color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
  HIGH: { color: "text-orange-400", bgColor: "bg-orange-500/20" },
  CRITICAL: { color: "text-red-400", bgColor: "bg-red-500/20" },
};

// Severity order for sorting (higher = more severe)
const severityOrder: Record<Severity, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export function CompactExposures({
  exposures,
  onRemove,
  onWhitelist,
  className,
}: CompactExposuresProps) {
  if (exposures.length === 0) {
    return null;
  }

  // Sort by severity (critical/high first)
  const sortedExposures = [...exposures].sort(
    (a, b) => severityOrder[b.severity] - severityOrder[a.severity]
  );

  return (
    <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2 text-base">
          <Search className="h-4 w-4 text-emerald-400" />
          Recent Exposures ({exposures.length})
        </CardTitle>
        <Link href="/dashboard/exposures">
          <Button
            variant="ghost"
            size="sm"
            className="text-emerald-400 hover:text-emerald-300 h-7"
          >
            View all
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="divide-y divide-slate-700/50">
          {sortedExposures.map((exposure) => {
            const displayName = exposure.sourceName || DataSourceNames[exposure.source] || exposure.source;
            const dataTypeLabel = dataTypeShortLabels[exposure.dataType] || exposure.dataType;
            const severity = severityConfig[exposure.severity];
            const isActive = exposure.status === "ACTIVE" && !exposure.isWhitelisted;

            return (
              <div
                key={exposure.id}
                className="py-2.5 flex items-center gap-3 group hover:bg-slate-700/20 -mx-2 px-2 rounded transition-colors"
              >
                {/* Source indicator */}
                <div className="w-1.5 h-8 rounded-full bg-slate-700 flex-shrink-0">
                  <div
                    className={cn("w-full rounded-full", severity.bgColor)}
                    style={{ height: "100%" }}
                  />
                </div>

                {/* Source name */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm truncate">
                    {displayName}
                  </div>
                  {exposure.exposedFields ? (() => {
                    try {
                      const fields: Array<{ type: string; count?: number }> = JSON.parse(exposure.exposedFields!);
                      if (!Array.isArray(fields) || fields.length === 0) return (
                        <div className="text-xs text-slate-400">{dataTypeLabel} exposed</div>
                      );
                      return (
                        <div className="flex items-center gap-1 mt-0.5">
                          {fields.map((f) => {
                            const cfg = FIELD_ICONS[f.type];
                            if (!cfg) return null;
                            const Icon = cfg.icon;
                            const tip = f.count && f.count > 1 ? `${cfg.tip} (${f.count})` : cfg.tip;
                            return (
                              <span key={f.type} title={tip}>
                                <Icon className="h-3 w-3 text-slate-500" />
                              </span>
                            );
                          })}
                        </div>
                      );
                    } catch {
                      return <div className="text-xs text-slate-400">{dataTypeLabel} exposed</div>;
                    }
                  })() : (
                    <div className="text-xs text-slate-400">
                      {dataTypeLabel} exposed
                    </div>
                  )}
                </div>

                {/* Severity badge */}
                <Badge
                  variant="outline"
                  className={cn(
                    "border-0 text-xs font-medium flex-shrink-0",
                    severity.bgColor,
                    severity.color
                  )}
                >
                  {exposure.severity}
                </Badge>

                {/* Action button */}
                {isActive && (
                  <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onRemove && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-slate-400 hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(exposure.id);
                      }}
                      title="Request removal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-slate-400 hover:text-emerald-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        onWhitelist(exposure.id);
                      }}
                      title="Whitelist"
                    >
                      <Shield className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}

                {/* Status for non-active */}
                {!isActive && (
                  <span className="text-xs text-slate-500 flex-shrink-0">
                    {exposure.isWhitelisted ? "Whitelisted" : exposure.status.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
