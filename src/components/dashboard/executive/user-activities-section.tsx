"use client";

import { ActivitiesMetrics } from "@/lib/executive/types";
import { MetricCard } from "./metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Scan,
  Shield,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Trophy,
} from "lucide-react";

interface UserActivitiesSectionProps {
  data: ActivitiesMetrics;
}

export function UserActivitiesSection({ data }: UserActivitiesSectionProps) {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-emerald-500/20 text-emerald-400">Completed</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500/20 text-blue-400">In Progress</Badge>;
      case "FAILED":
        return <Badge className="bg-red-500/20 text-red-400">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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
        />
        <MetricCard
          title="Active Users (30 days)"
          value={data.activeUsersLast30Days}
          icon={Activity}
          variant="info"
        />
        <MetricCard
          title="Recent Signups"
          value={data.recentSignups.length}
          icon={UserPlus}
          variant="success"
          subtitle="Last 10 users"
        />
        <MetricCard
          title="Recent Scans"
          value={data.recentScans.length}
          icon={Scan}
          variant="info"
          subtitle="Last 10 scans"
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
                    <TableRow key={user.id} className="border-slate-800">
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

        {/* Recent Scans */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              <Scan className="h-5 w-5 text-blue-400" />
              Recent Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">User</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Found</TableHead>
                    <TableHead className="text-slate-400">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentScans.map((scan) => (
                    <TableRow key={scan.id} className="border-slate-800">
                      <TableCell className="text-slate-400 text-sm">
                        {scan.userEmail}
                      </TableCell>
                      <TableCell>{getStatusBadge(scan.status)}</TableCell>
                      <TableCell>
                        <span className="text-amber-400 font-medium">
                          {scan.exposuresFound}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {formatDate(scan.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
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
                  <TableRow key={user.id} className="border-slate-800">
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
                  <TableRow key={log.id} className="border-slate-800">
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
    </div>
  );
}
