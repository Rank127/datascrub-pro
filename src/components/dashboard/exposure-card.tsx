"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DataSourceNames,
  SeverityColors,
  ExposureStatusColors,
  type DataSource,
  type Severity,
  type ExposureStatus,
  type ExposureType,
} from "@/lib/types";
import { ExternalLink, Shield, Trash2, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExposureCardProps {
  id: string;
  source: DataSource;
  sourceUrl?: string | null;
  dataType: ExposureType;
  dataPreview?: string | null;
  severity: Severity;
  status: ExposureStatus;
  isWhitelisted: boolean;
  firstFoundAt: Date;
  onWhitelist?: () => void;
  onRemove?: () => void;
}

const dataTypeLabels: Record<ExposureType, string> = {
  EMAIL: "Email Address",
  PHONE: "Phone Number",
  NAME: "Full Name",
  ADDRESS: "Physical Address",
  DOB: "Date of Birth",
  SSN: "Social Security Number",
  PHOTO: "Photo/Image",
  USERNAME: "Username",
  FINANCIAL: "Financial Data",
  COMBINED_PROFILE: "Full Profile",
};

const dataTypeIcons: Record<ExposureType, string> = {
  EMAIL: "mail",
  PHONE: "phone",
  NAME: "user",
  ADDRESS: "map-pin",
  DOB: "calendar",
  SSN: "file-lock",
  PHOTO: "image",
  USERNAME: "at-sign",
  FINANCIAL: "credit-card",
  COMBINED_PROFILE: "user-circle",
};

export function ExposureCard({
  source,
  sourceUrl,
  dataType,
  dataPreview,
  severity,
  status,
  isWhitelisted,
  firstFoundAt,
  onWhitelist,
  onRemove,
}: ExposureCardProps) {
  const sourceName = DataSourceNames[source] || source;

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className={cn(SeverityColors[severity], "border-0")}
              >
                {severity}
              </Badge>
              <Badge
                variant="outline"
                className={cn(ExposureStatusColors[status], "border-0")}
              >
                {status.replace(/_/g, " ")}
              </Badge>
            </div>

            <h3 className="font-medium text-white truncate">
              {sourceName}
            </h3>

            <p className="text-sm text-slate-400 mt-1">
              {dataTypeLabels[dataType as ExposureType] || dataType}
            </p>

            {dataPreview && (
              <p className="text-sm text-slate-500 mt-2 font-mono truncate">
                {dataPreview}
              </p>
            )}

            <p className="text-xs text-slate-500 mt-2">
              Found: {new Date(firstFoundAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {sourceUrl && (
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white"
                asChild
              >
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}

            {!isWhitelisted && status === "ACTIVE" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-emerald-500"
                  onClick={onWhitelist}
                  title="Add to whitelist"
                >
                  <ListChecks className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-red-500"
                  onClick={onRemove}
                  title="Request removal"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}

            {isWhitelisted && (
              <span title="Whitelisted">
                <Shield className="h-5 w-5 text-emerald-500" />
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
