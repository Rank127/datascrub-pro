"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Crown, Calendar, Shield, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { InviteDialog } from "./invite-dialog";
import { MemberCard } from "./member-card";
import { FamilyGroupInfo, FamilyMembershipInfo, FamilyRole } from "@/lib/family/types";
import { toast } from "sonner";

interface FamilyData {
  isOwner: boolean;
  isMember?: boolean;
  familyGroup?: FamilyGroupInfo;
  membership?: FamilyMembershipInfo;
  message?: string;
}

export function FamilySection() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FamilyData | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const fetchFamilyData = async () => {
    try {
      const response = await fetch("/api/family");
      if (!response.ok) throw new Error("Failed to fetch family data");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching family data:", error);
      toast.error("Failed to load family plan data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/family/members/${memberId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove member");
      }

      toast.success("Member removed from family plan");
      fetchFamilyData();
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    }
  };

  const handleCancelInvitation = async (token: string) => {
    try {
      const response = await fetch(`/api/family/invite/${token}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel invitation");
      }

      toast.success("Invitation cancelled");
      fetchFamilyData();
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to cancel invitation");
    }
  };

  const handleResendInvitation = async (token: string) => {
    try {
      const response = await fetch(`/api/family/invite/${token}/resend`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to resend invitation");
      }

      toast.success("Invitation resent");
      fetchFamilyData();
    } catch (error) {
      console.error("Error resending invitation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to resend invitation");
    }
  };

  const handleLeaveFamily = async () => {
    if (!confirm("Are you sure you want to leave this family plan? You will lose access to Enterprise features.")) {
      return;
    }

    try {
      const response = await fetch("/api/family/leave", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to leave family");
      }

      toast.success("You have left the family plan");
      fetchFamilyData();
    } catch (error) {
      console.error("Error leaving family:", error);
      toast.error(error instanceof Error ? error.message : "Failed to leave family");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not an Enterprise user and not in a family
  if (!data || (!data.isOwner && !data.isMember && !data.familyGroup)) {
    return (
      <Card className="border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" />
            Family Plan
          </CardTitle>
          <CardDescription>
            Family plan is available with Enterprise subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-300">
                  Enterprise plan includes coverage for up to 5 family members. Each member gets their own account with full Enterprise features.
                </p>
                <Button className="mt-4" variant="default" asChild>
                  <a href="/pricing">Upgrade to Enterprise</a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Family member view (non-owner)
  if (data.isMember && data.membership) {
    const membership = data.membership;
    return (
      <Card className="border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" />
            Family Plan
          </CardTitle>
          <CardDescription>
            You&apos;re covered by {membership.ownerName || membership.ownerEmail}&apos;s Enterprise family plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2 text-emerald-400 mb-3">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Enterprise Features Active</span>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Unlimited scans
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Automatic data removal
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Dark web monitoring
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Daily monitoring
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Calendar className="h-4 w-4" />
              Member since: {new Date(membership.joinedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={handleLeaveFamily}
            >
              Leave Family Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Owner view
  if (data.familyGroup) {
    const familyGroup = data.familyGroup;
    const canInvite = familyGroup.memberCount + familyGroup.pendingInvitations.length < familyGroup.maxMembers;

    return (
      <Card className="border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-500" />
                Family Plan
              </CardTitle>
              <CardDescription>
                Your Enterprise plan includes coverage for up to {familyGroup.maxMembers} family members
              </CardDescription>
            </div>
            <Button
              onClick={() => setInviteDialogOpen(true)}
              disabled={!canInvite}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Member count */}
          <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-400" />
              <span className="text-slate-300">
                Members ({familyGroup.memberCount}/{familyGroup.maxMembers})
              </span>
            </div>
            {!canInvite && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-400">
                <AlertCircle className="h-3 w-3 mr-1" />
                Limit Reached
              </Badge>
            )}
          </div>

          {/* Members list */}
          <div className="space-y-3">
            {familyGroup.members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isOwner={member.role === FamilyRole.OWNER}
                canRemove={member.role !== FamilyRole.OWNER && data.isOwner}
                onRemove={() => handleRemoveMember(member.id)}
              />
            ))}
          </div>

          {/* Pending invitations */}
          {familyGroup.pendingInvitations.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <span>Pending Invitations ({familyGroup.pendingInvitations.length})</span>
              </h4>
              {familyGroup.pendingInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{invitation.email}</p>
                      <p className="text-sm text-slate-400">
                        Sent {new Date(invitation.createdAt).toLocaleDateString()} •
                        Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Need to get the token - for now we'll use a workaround
                        // In production, the API should return the token or we fetch it
                        handleResendInvitation(invitation.id);
                      }}
                      className="text-slate-400 hover:text-slate-300"
                    >
                      Resend
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelInvitation(invitation.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <InviteDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          onSuccess={() => {
            setInviteDialogOpen(false);
            fetchFamilyData();
          }}
        />
      </Card>
    );
  }

  return null;
}
