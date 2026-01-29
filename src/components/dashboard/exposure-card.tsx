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
import { ExternalLink, Shield, Trash2, ListChecks } from "lucide-react";
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
  showCheckbox?: boolean;
  clickable?: boolean; // Make the card clickable to navigate to filtered view
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
  // AI-related exposure types
  FACE_DATA: "Facial Data",
  VOICE_DATA: "Voice Data",
  AI_TRAINING_DATA: "AI Training Data",
  BIOMETRIC: "Biometric Data",
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
  // AI-related exposure types
  FACE_DATA: "scan",
  VOICE_DATA: "mic",
  AI_TRAINING_DATA: "bot",
  BIOMETRIC: "fingerprint",
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

// Status descriptions for tooltips
const statusDescriptions: Record<string, string> = {
  ACTIVE: "Action needed: Click 'Remove' to send opt-out request to this data broker, or 'Whitelist' to keep it.",
  REMOVAL_PENDING: "Opt-out request sent to data broker. They have 45 days to comply under CCPA/GDPR.",
  REMOVAL_IN_PROGRESS: "Data broker acknowledged request. Removal is being processed.",
  REMOVED: "Success! Your data has been removed from this data broker.",
  WHITELISTED: "You chose to keep this listing. No removal request will be sent.",
  MONITORING: "BREACH ALERT: Your data was exposed in a security breach. The data was stolen and cannot be 'removed' - it exists on hacker forums. Action: Change passwords, enable 2FA, monitor for identity theft.",
};

// Severity descriptions for tooltips
const severityDescriptions: Record<string, string> = {
  CRITICAL: "Extremely sensitive data exposed (SSN, financial info). Immediate action required.",
  HIGH: "Sensitive personal data exposed. Action recommended within 24-48 hours.",
  MEDIUM: "Personal data exposed. Review and take action when possible.",
  LOW: "Basic information exposed. Lower risk but still worth addressing.",
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
                className={cn(SeverityColors[severity], "border-0 cursor-help")}
                title={severityDescriptions[severity] || severity}
              >
                {severity}
              </Badge>
              <Badge
                variant="outline"
                className={cn(ExposureStatusColors[status], "border-0 cursor-help")}
                title={statusDescriptions[status] || status}
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
                title="View source: Open the original website where your data was found"
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
                title="Whitelist: Keep this listing and don't request removal"
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
                title="Remove: Send CCPA/GDPR opt-out request to this data broker"
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
                title="Remove from whitelist: Make this exposure active again so you can request removal"
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
