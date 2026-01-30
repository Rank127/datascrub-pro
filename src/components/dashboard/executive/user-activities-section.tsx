"use client";

import { useState } from "react";
import { ActivitiesMetrics, PlanChangeActivity } from "@/lib/executive/types";
import { MetricCard } from "./metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserPlus,
  Activity,
  CheckCircle,
  XCircle,
  Eye,
  Trophy,
  ExternalLink,
  Mail,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Gift,
  MessageSquare,
} from "lucide-react";

interface UserActivitiesSectionProps {
  data: ActivitiesMetrics;
}

type DialogType = "activeUsers7" | "activeUsers30" | "signup" | "planChanges" | "user" | "auditLog" | "planChange" | "winback" | null;

export function UserActivitiesSection({ data }: UserActivitiesSectionProps) {
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "ENTERPRISE":
        return <Badge className="bg-emerald-500/20 text-emerald-400">Enterprise</Badge>;
      case "PRO":
        return <Badge className="bg-blue-500/20 text-blue-400">Pro</Badge>;
      default:
        return <Badge variant="secondary">Free</Badge>;
    }
  };

  const handleUserClick = (user: any) => {
    setSelectedItem(user);
    setDialogType("user");
  };

  const handlePlanChangeClick = (change: PlanChangeActivity) => {
    setSelectedItem(change);
    setDialogType("planChange");
  };

  const handleWinbackClick = (change: PlanChangeActivity) => {
    setSelectedItem(change);
    setDialogType("winback");
  };

  const handleAuditLogClick = (log: any) => {
    setSelectedItem(log);
    setDialogType("auditLog");
  };

  const getChangeTypeBadge = (changeType: string) => {
    switch (changeType) {
      case "upgrade":
        return <Badge className="bg-emerald-500/20 text-emerald-400">Upgrade</Badge>;
      case "downgrade":
        return <Badge className="bg-amber-500/20 text-amber-400">Downgrade</Badge>;
      case "cancel":
        return <Badge className="bg-red-500/20 text-red-400">Canceled</Badge>;
      default:
        return <Badge variant="secondary">{changeType}</Badge>;
    }
  };

  // Count plan changes by type
  const planChangeCounts = {
    upgrades: data.recentPlanChanges?.filter(p => p.changeType === "upgrade").length || 0,
    downgrades: data.recentPlanChanges?.filter(p => p.changeType === "downgrade").length || 0,
    cancels: data.recentPlanChanges?.filter(p => p.changeType === "cancel").length || 0,
  };

  const closeDialog = () => {
    setDialogType(null);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Activity Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Users (7 days)"
          value={data.activeUsersLast7Days}
          icon={Users}
          variant="success"
          onClick={() => setDialogType("activeUsers7")}
          active={dialogType === "activeUsers7"}
        />
        <MetricCard
          title="Active Users (30 days)"
          value={data.activeUsersLast30Days}
          icon={Activity}
          variant="info"
          onClick={() => setDialogType("activeUsers30")}
          active={dialogType === "activeUsers30"}
        />
        <MetricCard
          title="Recent Signups"
          value={data.recentSignups.length}
          icon={UserPlus}
          variant="success"
          subtitle="Last 10 users"
          onClick={() => setDialogType("signup")}
          active={dialogType === "signup"}
        />
        <MetricCard
          title="Plan Changes"
          value={data.recentPlanChanges?.length || 0}
          icon={TrendingUp}
          variant={planChangeCounts.downgrades + planChangeCounts.cancels > planChangeCounts.upgrades ? "warning" : "success"}
          subtitle={`↑${planChangeCounts.upgrades} ↓${planChangeCounts.downgrades + planChangeCounts.cancels}`}
          onClick={() => setDialogType("planChanges")}
          active={dialogType === "planChanges"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Signups */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-400" />
              Recent Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">User</TableHead>
                    <TableHead className="text-slate-400">Plan</TableHead>
                    <TableHead className="text-slate-400">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentSignups.map((user) => (
                    <TableRow
                      key={user.id}
                      className="border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors"
                      onClick={() => handleUserClick(user)}
                    >
                      <TableCell>
                        <div>
                          <p className="text-white font-medium">{user.name || "—"}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getPlanBadge(user.plan)}</TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {formatDate(user.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Plan Changes */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Recent Plan Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">User</TableHead>
                    <TableHead className="text-slate-400">Change</TableHead>
                    <TableHead className="text-slate-400">Type</TableHead>
                    <TableHead className="text-slate-400">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data.recentPlanChanges || []).length === 0 ? (
                    <TableRow className="border-slate-800">
                      <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                        No recent plan changes
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.recentPlanChanges.map((change) => (
                      <TableRow
                        key={change.id}
                        className="border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors"
                        onClick={() => handlePlanChangeClick(change)}
                      >
                        <TableCell>
                          <div>
                            <p className="text-white font-medium text-sm">{change.userName || "—"}</p>
                            <p className="text-xs text-slate-500">{change.userEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            {getPlanBadge(change.previousPlan)}
                            <ArrowRight className="h-3 w-3 text-slate-500" />
                            {getPlanBadge(change.newPlan)}
                          </div>
                        </TableCell>
                        <TableCell>{getChangeTypeBadge(change.changeType)}</TableCell>
                        <TableCell>
                          {(change.changeType === "downgrade" || change.changeType === "cancel") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWinbackClick(change);
                              }}
                            >
                              <Gift className="h-3 w-3 mr-1" />
                              Win Back
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            Top Users by Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400 w-12">#</TableHead>
                  <TableHead className="text-slate-400">User</TableHead>
                  <TableHead className="text-slate-400">Plan</TableHead>
                  <TableHead className="text-slate-400 text-center">Scans</TableHead>
                  <TableHead className="text-slate-400 text-center">Exposures</TableHead>
                  <TableHead className="text-slate-400">Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topUsersByActivity.map((user, index) => (
                  <TableRow
                    key={user.id}
                    className="border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors"
                    onClick={() => handleUserClick(user)}
                  >
                    <TableCell>
                      <span className={`font-bold ${index < 3 ? "text-amber-400" : "text-slate-500"}`}>
                        {index + 1}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-white font-medium">{user.name || "—"}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getPlanBadge(user.plan)}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-blue-400 font-medium">{user.scansCount}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-amber-400 font-medium">{user.exposuresCount}</span>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {user.lastActive ? formatDate(user.lastActive) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Audit Logs */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-400" />
            Recent Audit Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400">Actor</TableHead>
                  <TableHead className="text-slate-400">Action</TableHead>
                  <TableHead className="text-slate-400">Resource</TableHead>
                  <TableHead className="text-slate-400">Target</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentAuditLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors"
                    onClick={() => handleAuditLogClick(log)}
                  >
                    <TableCell className="text-slate-400 text-sm">
                      {log.actorEmail}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {log.action.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {log.resource}
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {log.targetEmail || "—"}
                    </TableCell>
                    <TableCell>
                      {log.success ? (
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {formatDate(log.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Active Users Dialog */}
      <Dialog open={dialogType === "activeUsers7" || dialogType === "activeUsers30"} onOpenChange={closeDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-400" />
              {dialogType === "activeUsers7" ? "Active Users (7 Days)" : "Active Users (30 Days)"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Users who have logged in or performed actions in the selected period.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-white">
                  {dialogType === "activeUsers7" ? data.activeUsersLast7Days : data.activeUsersLast30Days}
                </p>
                <p className="text-sm text-slate-400">Active Users</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-emerald-400">
                  {data.topUsersByActivity.length}
                </p>
                <p className="text-sm text-slate-400">Top Performers</p>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              <p>Activity includes: logins, scans, profile updates, and removal requests.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog open={dialogType === "user" && selectedItem !== null} onOpenChange={closeDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-400" />
              User Details
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {(selectedItem.name || selectedItem.email || "?").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-medium text-white">{selectedItem.name || "No name"}</p>
                  <p className="text-sm text-slate-400">{selectedItem.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Plan</p>
                  {getPlanBadge(selectedItem.plan)}
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Joined</p>
                  <p className="text-sm text-white">
                    {selectedItem.createdAt ? formatDate(selectedItem.createdAt) : "—"}
                  </p>
                </div>
                {selectedItem.scansCount !== undefined && (
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Scans</p>
                    <p className="text-lg font-bold text-blue-400">{selectedItem.scansCount}</p>
                  </div>
                )}
                {selectedItem.exposuresCount !== undefined && (
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Exposures Found</p>
                    <p className="text-lg font-bold text-amber-400">{selectedItem.exposuresCount}</p>
                  </div>
                )}
              </div>

              {selectedItem.lastActive && (
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Last Active</p>
                  <p className="text-sm text-white">{formatDate(selectedItem.lastActive)}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-slate-700 hover:bg-slate-800"
                  onClick={() => {
                    window.location.href = `mailto:${selectedItem.email}`;
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email User
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-slate-700 hover:bg-slate-800"
                  onClick={() => {
                    window.location.href = `/dashboard/executive?tab=users&search=${encodeURIComponent(selectedItem.email)}`;
                    closeDialog();
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Plan Change Detail Dialog */}
      <Dialog open={dialogType === "planChange" && selectedItem !== null} onOpenChange={closeDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {selectedItem?.changeType === "upgrade" ? (
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-amber-400" />
              )}
              Plan Change Details
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {(selectedItem.userName || selectedItem.userEmail || "?").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-medium text-white">{selectedItem.userName || "No name"}</p>
                  <p className="text-sm text-slate-400">{selectedItem.userEmail}</p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-2">Plan Change</p>
                <div className="flex items-center gap-3">
                  {getPlanBadge(selectedItem.previousPlan)}
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                  {getPlanBadge(selectedItem.newPlan)}
                  <span className="ml-auto">{getChangeTypeBadge(selectedItem.changeType)}</span>
                </div>
              </div>

              {selectedItem.reason && (
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Reason</p>
                  <p className="text-sm text-white">{selectedItem.reason}</p>
                </div>
              )}

              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Changed</p>
                <p className="text-sm text-white">{formatDate(selectedItem.createdAt)}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-slate-700 hover:bg-slate-800"
                  onClick={() => {
                    window.location.href = `mailto:${selectedItem.userEmail}`;
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email User
                </Button>
                {(selectedItem.changeType === "downgrade" || selectedItem.changeType === "cancel") && (
                  <Button
                    size="sm"
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                    onClick={() => {
                      setDialogType("winback");
                    }}
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    Win Back
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Win Back Dialog */}
      <Dialog open={dialogType === "winback" && selectedItem !== null} onOpenChange={closeDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Gift className="h-5 w-5 text-amber-400" />
              Win Back Customer
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Send a personalized offer to bring back {selectedItem?.userName || selectedItem?.userEmail}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 pt-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-2">Customer changed from</p>
                <div className="flex items-center gap-3">
                  {getPlanBadge(selectedItem.previousPlan)}
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                  {getPlanBadge(selectedItem.newPlan)}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-white">Quick Actions:</p>

                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-700 hover:bg-slate-800"
                  onClick={() => {
                    const subject = encodeURIComponent("We miss you! Here's a special offer");
                    const body = encodeURIComponent(
                      `Hi ${selectedItem.userName || "there"},\n\n` +
                      `We noticed you recently changed your plan. We'd love to have you back!\n\n` +
                      `As a special offer, we'd like to give you 20% off your next 3 months.\n\n` +
                      `Use code: COMEBACK20\n\n` +
                      `Best regards,\nThe DataScrub Team`
                    );
                    window.location.href = `mailto:${selectedItem.userEmail}?subject=${subject}&body=${body}`;
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send 20% Discount Offer
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-700 hover:bg-slate-800"
                  onClick={() => {
                    const subject = encodeURIComponent("Free month on us - we want you back!");
                    const body = encodeURIComponent(
                      `Hi ${selectedItem.userName || "there"},\n\n` +
                      `We noticed you recently downgraded your plan. We value you as a customer!\n\n` +
                      `We'd like to offer you a FREE month of ${selectedItem.previousPlan} to give our service another try.\n\n` +
                      `Simply reply to this email and we'll apply the credit to your account.\n\n` +
                      `Best regards,\nThe DataScrub Team`
                    );
                    window.location.href = `mailto:${selectedItem.userEmail}?subject=${subject}&body=${body}`;
                  }}
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Offer Free Month
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-700 hover:bg-slate-800"
                  onClick={() => {
                    const subject = encodeURIComponent("Quick call to discuss your needs?");
                    const body = encodeURIComponent(
                      `Hi ${selectedItem.userName || "there"},\n\n` +
                      `I noticed you recently made changes to your account. I'd love to understand what led to this decision and see if there's anything we can do to better serve your needs.\n\n` +
                      `Would you have 15 minutes for a quick call this week?\n\n` +
                      `Best regards`
                    );
                    window.location.href = `mailto:${selectedItem.userEmail}?subject=${subject}&body=${body}`;
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Request Feedback Call
                </Button>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <Button
                  variant="ghost"
                  className="w-full text-slate-400"
                  onClick={closeDialog}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Audit Log Detail Dialog */}
      <Dialog open={dialogType === "auditLog" && selectedItem !== null} onOpenChange={closeDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" />
              Audit Log Details
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Action</p>
                  <Badge variant="outline" className="text-xs">
                    {selectedItem.action.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Status</p>
                  {selectedItem.success ? (
                    <div className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Success</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-400">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">Failed</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Actor</p>
                <p className="text-sm text-white">{selectedItem.actorEmail}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Resource</p>
                  <p className="text-sm text-white">{selectedItem.resource}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Target</p>
                  <p className="text-sm text-white">{selectedItem.targetEmail || "—"}</p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Timestamp</p>
                <p className="text-sm text-white">{formatDate(selectedItem.createdAt)}</p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Log ID</p>
                <p className="text-xs text-slate-400 font-mono">{selectedItem.id}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Signups Summary Dialog */}
      <Dialog open={dialogType === "signup"} onOpenChange={closeDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-400" />
              Recent Signups Summary
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Overview of the last {data.recentSignups.length} user registrations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-white">{data.recentSignups.length}</p>
                <p className="text-xs text-slate-400">Total</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {data.recentSignups.filter(u => u.plan === "PRO").length}
                </p>
                <p className="text-xs text-slate-400">Pro</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-emerald-400">
                  {data.recentSignups.filter(u => u.plan === "ENTERPRISE").length}
                </p>
                <p className="text-xs text-slate-400">Enterprise</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Click on individual users in the table below for more details.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Plan Changes Summary Dialog */}
      <Dialog open={dialogType === "planChanges"} onOpenChange={closeDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Plan Changes Summary
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Recent subscription plan changes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-emerald-400">{planChangeCounts.upgrades}</p>
                <p className="text-xs text-slate-400">Upgrades</p>
              </div>
              <div className="bg-amber-500/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-amber-400">{planChangeCounts.downgrades}</p>
                <p className="text-xs text-slate-400">Downgrades</p>
              </div>
              <div className="bg-red-500/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-400">{planChangeCounts.cancels}</p>
                <p className="text-xs text-slate-400">Cancels</p>
              </div>
            </div>
            {(planChangeCounts.downgrades + planChangeCounts.cancels) > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-sm text-amber-400">
                  <Gift className="h-4 w-4 inline mr-1" />
                  {planChangeCounts.downgrades + planChangeCounts.cancels} customers may be won back.
                  Click on individual rows to send win-back offers.
                </p>
              </div>
            )}
            <p className="text-sm text-slate-500">
              Click on individual plan changes in the table for details and actions.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
