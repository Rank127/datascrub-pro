"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Bug,
  CreditCard,
  User,
  Lightbulb,
  HelpCircle,
  MessageSquare,
  Bot,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Ticket {
  id: string;
  ticketNumber: string;
  userId: string;
  type: string;
  status: string;
  priority: string;
  subject: string;
  description: string;
  source: string;
  scanId: string | null;
  exposureId: string | null;
  removalRequestId: string | null;
  subscriptionId: string | null;
  assignedToId: string | null;
  assignedAt: string | null;
  resolution: string | null;
  resolvedAt: string | null;
  resolvedById: string | null;
  internalNotes: string | null;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  // Debug info
  browserInfo: string | null;
  pageUrl: string | null;
  errorDetails: string | null;
  user: {
    id: string;
    email: string | null;
    name: string | null;
  };
  assignedTo: {
    id: string;
    email: string | null;
    name: string | null;
  } | null;
  _count?: {
    comments: number;
  };
  hasPendingAiDraft?: boolean;
}

interface TicketListProps {
  tickets: Ticket[];
  loading: boolean;
  filters: {
    status: string;
    priority: string;
    type: string;
  };
  onFilterChange: (key: string, value: string) => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  onSelectTicket: (ticket: Ticket) => void;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  OPEN: { bg: "bg-blue-500/20", text: "text-blue-400" },
  IN_PROGRESS: { bg: "bg-amber-500/20", text: "text-amber-400" },
  WAITING_USER: { bg: "bg-purple-500/20", text: "text-purple-400" },
  RESOLVED: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  CLOSED: { bg: "bg-slate-500/20", text: "text-slate-400" },
};

const priorityColors: Record<string, { bg: string; text: string }> = {
  LOW: { bg: "bg-slate-500/20", text: "text-slate-400" },
  NORMAL: { bg: "bg-blue-500/20", text: "text-blue-400" },
  HIGH: { bg: "bg-amber-500/20", text: "text-amber-400" },
  URGENT: { bg: "bg-red-500/20", text: "text-red-400" },
};

const typeIcons: Record<string, typeof AlertCircle> = {
  SCAN_ERROR: Bug,
  REMOVAL_FAILED: AlertCircle,
  PAYMENT_ISSUE: CreditCard,
  ACCOUNT_ISSUE: User,
  FEATURE_REQUEST: Lightbulb,
  OTHER: HelpCircle,
};

export function TicketList({
  tickets,
  loading,
  filters,
  onFilterChange,
  pagination,
  onPageChange,
  onSelectTicket,
}: TicketListProps) {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-lg font-medium text-white">
            All Tickets ({pagination.total})
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => onFilterChange("status", value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="WAITING_USER">Waiting User</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority || "all"}
              onValueChange={(value) => onFilterChange("priority", value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.type || "all"}
              onValueChange={(value) => onFilterChange("type", value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-[160px] bg-slate-800 border-slate-700">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="SCAN_ERROR">Scan Error</SelectItem>
                <SelectItem value="REMOVAL_FAILED">Removal Failed</SelectItem>
                <SelectItem value="PAYMENT_ISSUE">Payment Issue</SelectItem>
                <SelectItem value="ACCOUNT_ISSUE">Account Issue</SelectItem>
                <SelectItem value="FEATURE_REQUEST">Feature Request</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No tickets found matching your filters. Try clearing filters to see all tickets.
          </div>
        ) : (
          <>
            {(filters.status || filters.priority || filters.type) && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-sm">
                Showing {pagination.total} ticket(s) matching filter: <strong>{filters.status || filters.priority || filters.type}</strong>.
                Click &quot;Show All Tickets&quot; to see all.
              </div>
            )}
            <div className="rounded-lg border border-slate-800 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-800/50 hover:bg-slate-800/50">
                    <TableHead className="text-slate-400">Ticket</TableHead>
                    <TableHead className="text-slate-400">User</TableHead>
                    <TableHead className="text-slate-400">Type</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Priority</TableHead>
                    <TableHead className="text-slate-400">Assigned</TableHead>
                    <TableHead className="text-slate-400">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => {
                    const TypeIcon = typeIcons[ticket.type] || HelpCircle;
                    const statusStyle = statusColors[ticket.status] || statusColors.OPEN;
                    const priorityStyle = priorityColors[ticket.priority] || priorityColors.NORMAL;

                    return (
                      <TableRow
                        key={ticket.id}
                        className="cursor-pointer hover:bg-slate-800/50"
                        onClick={() => onSelectTicket(ticket)}
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-slate-500">
                                {ticket.ticketNumber}
                              </span>
                              {ticket._count && ticket._count.comments > 0 && (
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <MessageSquare className="h-3 w-3" />
                                  {ticket._count.comments}
                                </span>
                              )}
                              {ticket.hasPendingAiDraft && (
                                <Badge className="bg-blue-500/20 text-blue-400 text-xs gap-1 px-1.5">
                                  <Bot className="h-3 w-3" />
                                  AI Draft
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-white font-medium line-clamp-1">
                              {ticket.subject}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="text-white">{ticket.user.name || "Unknown"}</p>
                            <p className="text-xs text-slate-500">{ticket.user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-300">
                              {ticket.type.replace(/_/g, " ")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusStyle.bg} ${statusStyle.text}`}>
                            {ticket.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${priorityStyle.bg} ${priorityStyle.text}`}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ticket.assignedTo ? (
                            <span className="text-sm text-slate-300">
                              {ticket.assignedTo.name || ticket.assignedTo.email}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-500">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-400">
                            {formatDistanceToNow(new Date(ticket.lastActivityAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-slate-400">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total} tickets
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-slate-400">
                    Page {pagination.page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.page + 1)}
                    disabled={pagination.page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
