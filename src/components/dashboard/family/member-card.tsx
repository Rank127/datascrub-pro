"use client";

import { User, Crown, Calendar, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FamilyMemberInfo } from "@/lib/family/types";

interface MemberCardProps {
  member: FamilyMemberInfo;
  isOwner: boolean;
  canRemove: boolean;
  onRemove: () => void;
}

export function MemberCard({ member, isOwner, canRemove, onRemove }: MemberCardProps) {
  const joinedDate = new Date(member.joinedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const lastScanDate = member.lastScanAt
    ? new Date(member.lastScanAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "Never";

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
          isOwner ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
        }`}>
          {isOwner ? (
            <Crown className="h-5 w-5" />
          ) : (
            <User className="h-5 w-5" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-slate-200">
              {member.name || member.email.split("@")[0]}
            </p>
            {isOwner && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 text-xs">
                Owner
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-400">{member.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Stats - only show for owner view */}
        {member.exposuresCount !== undefined && (
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-200">
              {member.exposuresCount} exposure{member.exposuresCount !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-slate-400">Last scan: {lastScanDate}</p>
          </div>
        )}

        {/* Join date */}
        <div className="text-right hidden md:block">
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Joined {joinedDate}
          </p>
        </div>

        {/* Remove button */}
        {canRemove && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  Remove Family Member?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove <strong>{member.name || member.email}</strong> from your family plan?
                  <br /><br />
                  They will lose access to Enterprise features but keep their account and data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onRemove}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Remove Member
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
