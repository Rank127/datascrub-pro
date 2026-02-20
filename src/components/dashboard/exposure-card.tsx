"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DataSourceNames,
  SeverityColors,
  ExposureStatusColors,
  type DataSource,
  type Severity,
  type ExposureStatus,
  type ExposureType,
} from "@/lib/types";
import { ExternalLink, Shield, Trash2, ListChecks, User, Phone, Mail, MapPin, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExposureCardProps {
  id: string;
  source: DataSource;
  sourceName: string;
  sourceUrl?: string | null;
  dataType: ExposureType;
  dataPreview?: string | null;
  severity: Severity;
  status: ExposureStatus;
  isWhitelisted: boolean;
  firstFoundAt: Date;
  onWhitelist?: () => void;
  onUnwhitelist?: () => void;
  onRemove?: () => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
  exposedFields?: string | null;
  showCheckbox?: boolean;
  clickable?: boolean; // Make the card clickable to navigate to filtered view
}

interface ExposedFieldItem {
  type: string;
  count?: number;
  value?: string;
}

const EXPOSED_FIELD_CONFIG: Record<string, { icon: typeof User; label: string }> = {
  name: { icon: User, label: "Name" },
  phone: { icon: Phone, label: "Phone" },
  email: { icon: Mail, label: "Email" },
  address: { icon: MapPin, label: "Address" },
  age: { icon: Calendar, label: "Age" },
  relatives: { icon: Users, label: "Relatives" },
};

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
  // AI-related exposure types
  FACE_DATA: "Facial Data",
  VOICE_DATA: "Voice Data",
  AI_TRAINING_DATA: "AI Training Data",
  BIOMETRIC: "Biometric Data",
};

// Status display names (what users see)
const statusDisplayNames: Record<string, string> = {
  ACTIVE: "ACTIVE",
  REMOVAL_PENDING: "PENDING",
  REMOVAL_IN_PROGRESS: "IN PROGRESS",
  REMOVED: "REMOVED",
  WHITELISTED: "WHITELISTED",
  MONITORING: "BREACH ALERT", // More descriptive than "MONITORING"
};

export function ExposureCard({
  id,
  source,
  sourceName,
  sourceUrl,
  dataType,
  dataPreview,
  severity,
  status,
  isWhitelisted,
  firstFoundAt,
  onWhitelist,
  onUnwhitelist,
  onRemove,
  selected,
  onSelect,
  exposedFields,
  showCheckbox = false,
  clickable = false,
}: ExposureCardProps) {
  const displayName = sourceName || DataSourceNames[source] || source;
  // Can only select for bulk removal if: active and not whitelisted
  const canSelect = status === "ACTIVE" && !isWhitelisted;

  // Build the link URL based on the exposure type
  const getFilterUrl = () => {
    const params = new URLSearchParams();
    if (severity) params.set("severity", severity);
    if (status) params.set("status", status);
    return `/dashboard/exposures?${params.toString()}`;
  };

  const cardContent = (
    <Card className={cn(
      "bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors",
      selected && "border-emerald-600 bg-emerald-900/20",
      clickable && "cursor-pointer hover:bg-slate-800/70"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Checkbox */}
          {showCheckbox && canSelect && (
            <div className="pt-1">
              <Checkbox
                checked={selected}
                onCheckedChange={() => onSelect?.(id)}
                className="border-slate-500 data-[state=checked]:bg-emerald-600"
              />
            </div>
          )}
          {showCheckbox && !canSelect && (
            <div className="w-4" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                {statusDisplayNames[status] || status.replace(/_/g, " ")}
              </Badge>
            </div>

            <h3 className="font-medium text-white truncate">
              {displayName}
            </h3>

            <p className="text-sm text-slate-400 mt-1">
              {dataTypeLabels[dataType as ExposureType] || dataType}
            </p>

            {dataPreview && (
              <p className="text-sm text-slate-500 mt-2 font-mono truncate">
                {dataPreview}
              </p>
            )}

            {exposedFields && (() => {
              try {
                const fields: ExposedFieldItem[] = JSON.parse(exposedFields);
                if (!Array.isArray(fields) || fields.length === 0) return null;
                return (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {fields.map((field) => {
                      const config = EXPOSED_FIELD_CONFIG[field.type];
                      if (!config) return null;
                      const Icon = config.icon;
                      const label = field.count && field.count > 1
                        ? `${config.label} (${field.count})`
                        : config.label;
                      return (
                        <span
                          key={field.type}
                          className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded"
                        >
                          <Icon className="h-3 w-3" />
                          {label}
                        </span>
                      );
                    })}
                  </div>
                );
              } catch {
                return null;
              }
            })()}

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
                title="View source"
              >
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}

            {/* Whitelist button - show for all active non-whitelisted items */}
            {!isWhitelisted && status === "ACTIVE" && (
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-emerald-500"
                onClick={onWhitelist}
                title="Whitelist"
              >
                <ListChecks className="h-4 w-4" />
              </Button>
            )}

            {/* Remove button - request opt-out from broker */}
            {!isWhitelisted && status === "ACTIVE" && (
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-red-500"
                onClick={onRemove}
                title="Request removal"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            {isWhitelisted && (
              <Button
                variant="outline"
                size="sm"
                className="text-emerald-500 border-emerald-500/50 hover:bg-emerald-500/10 hover:text-orange-400 hover:border-orange-400/50"
                onClick={onUnwhitelist}
                title="Remove from whitelist"
              >
                <Shield className="h-4 w-4 mr-1" />
                Undo
              </Button>
            )}

          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Wrap in Link if clickable
  if (clickable) {
    return (
      <Link href={getFilterUrl()} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
