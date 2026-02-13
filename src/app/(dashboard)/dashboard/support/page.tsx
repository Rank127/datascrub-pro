"use client";

import { useState, useEffect, useCallback } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Headphones,
  Loader2,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

interface Ticket {
  id: string;
  ticketNumber: string;
  type: string;
  status: string;
  priority: string;
  subject: string;
  description: string;
  resolution: string | null;
  resolvedAt: string | null;
  lastActivityAt: string;
  createdAt: string;
  _count?: {
    comments: number;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    name: string | null;
    email: string | null;
    role: string;
  };
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  OPEN: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Open" },
  IN_PROGRESS: { bg: "bg-amber-500/20", text: "text-amber-400", label: "In Progress" },
  WAITING_USER: { bg: "bg-purple-500/20", text: "text-purple-400", label: "Awaiting Response" },
  RESOLVED: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "Resolved" },
  CLOSED: { bg: "bg-slate-500/20", text: "text-slate-400", label: "Closed" },
};

const typeLabels: Record<string, string> = {
  SCAN_ERROR: "Scan Issue",
  REMOVAL_FAILED: "Removal Issue",
  PAYMENT_ISSUE: "Payment Issue",
  ACCOUNT_ISSUE: "Account Issue",
  FEATURE_REQUEST: "Feature Request",
  OTHER: "Other",
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { plan: userPlan } = useSubscription();

  // Prevent hydration mismatch with date formatting
  useEffect(() => {
    setMounted(true);
  }, []);

  // New ticket form state
  const [newTicketForm, setNewTicketForm] = useState({
    type: "OTHER",
    subject: "",
    description: "",
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/support/tickets");
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const fetchComments = async (ticketId: string) => {
    try {
      setLoadingComments(true);
      const response = await fetch(`/api/support/tickets/${ticketId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    fetchComments(ticket.id);
  };

  // Get browser and device info for debugging
  const getBrowserInfo = () => {
    if (typeof window === "undefined") return "";
    const ua = navigator.userAgent;
    const screenSize = `${window.screen.width}x${window.screen.height}`;
    return `${ua} | Screen: ${screenSize}`;
  };

  const handleCreateTicket = async () => {
    if (!newTicketForm.subject.trim() || !newTicketForm.description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setSubmittingTicket(true);

      // Collect browser info and current page for debugging
      const ticketData = {
        ...newTicketForm,
        browserInfo: getBrowserInfo(),
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
      };

      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketData),
      });

      if (response.ok) {
        toast.success("Support ticket created - we'll get back to you soon!");
        setShowNewTicket(false);
        setNewTicketForm({ type: "OTHER", subject: "", description: "" });
        fetchTickets();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to create ticket");
      }
    } catch (error) {
      toast.error("Failed to create ticket");
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTicket) return;

    try {
      setSubmittingComment(true);
      const response = await fetch(`/api/support/tickets/${selectedTicket.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        setNewComment("");
        fetchComments(selectedTicket.id);
        toast.success("Reply sent");
      } else {
        toast.error("Failed to send reply");
      }
    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setSubmittingComment(false);
    }
  };

  const openTickets = tickets.filter((t) => !["RESOLVED", "CLOSED"].includes(t.status));
  const closedTickets = tickets.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Support</h1>
          <p className="text-slate-400">
            Get help with your account, scans, or removals
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="border-slate-600"
            onClick={fetchTickets}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setShowNewTicket(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="p-3 bg-emerald-500/10 rounded-full">
            <Headphones className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-medium text-white">
              {openTickets.length} open ticket{openTickets.length !== 1 ? "s" : ""}
            </p>
            <p className="text-sm text-slate-400">
              {tickets.length} total support requests
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Your Tickets</CardTitle>
          <CardDescription className="text-slate-400">
            View and manage your support requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <Headphones className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-300">
                No support tickets
              </h3>
              <p className="text-slate-500 mt-1">
                Need help? Create a new support ticket.
              </p>
              <Button className="mt-4" onClick={() => setShowNewTicket(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Ticket
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Open Tickets */}
              {openTickets.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-slate-400">Open Tickets</h3>
                  {openTickets.map((ticket) => (
                    <TicketRow
                      key={ticket.id}
                      ticket={ticket}
                      onClick={() => handleViewTicket(ticket)}
                    />
                  ))}
                </div>
              )}

              {/* Closed Tickets */}
              {closedTickets.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h3 className="text-sm font-medium text-slate-400">Resolved Tickets</h3>
                  {closedTickets.map((ticket) => (
                    <TicketRow
                      key={ticket.id}
                      ticket={ticket}
                      onClick={() => handleViewTicket(ticket)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Ticket Dialog */}
      <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Create Support Ticket</DialogTitle>
            <DialogDescription className="text-slate-400">
              Describe your issue and we will get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Issue Type</Label>
              <Select
                value={newTicketForm.type}
                onValueChange={(value) =>
                  setNewTicketForm((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCAN_ERROR">Scan Issue</SelectItem>
                  <SelectItem value="REMOVAL_FAILED">Removal Issue</SelectItem>
                  <SelectItem value="PAYMENT_ISSUE">Payment Issue</SelectItem>
                  <SelectItem value="ACCOUNT_ISSUE">Account Issue</SelectItem>
                  <SelectItem value="FEATURE_REQUEST">Feature Request</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Subject</Label>
              <Input
                value={newTicketForm.subject}
                onChange={(e) =>
                  setNewTicketForm((prev) => ({ ...prev, subject: e.target.value }))
                }
                placeholder="Brief summary of your issue"
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Description</Label>
              <Textarea
                value={newTicketForm.description}
                onChange={(e) =>
                  setNewTicketForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Please describe your issue in detail..."
                className="bg-slate-800 border-slate-700 min-h-[120px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowNewTicket(false)}
                className="border-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTicket}
                disabled={submittingTicket}
              >
                {submittingTicket && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Ticket
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Refund Info - Only for paid users */}
      {userPlan !== "FREE" && (
        <p className="text-xs text-slate-500 text-center">
          Need a refund? We offer a 30-day money-back guarantee.{" "}
          <a
            href={`mailto:support@ghostmydata.com?subject=Refund%20Request%20-%20${userPlan}%20Plan&body=Hi%20GhostMyData%20Support%2C%0A%0AI%20would%20like%20to%20request%20a%20refund%20for%20my%20${userPlan}%20subscription.%0A%0AReason%20for%20refund%3A%20%0A%0AThank%20you.`}
            className="text-slate-400 hover:text-slate-300 underline"
          >
            Request a refund
          </a>
        </p>
      )}

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl max-h-[90vh]">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-white">
                      {selectedTicket.subject}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-mono text-xs text-slate-500">
                        {selectedTicket.ticketNumber}
                      </span>
                      <Badge
                        className={`${statusColors[selectedTicket.status]?.bg} ${statusColors[selectedTicket.status]?.text}`}
                      >
                        {statusColors[selectedTicket.status]?.label || selectedTicket.status}
                      </Badge>
                      <Badge variant="outline" className="text-slate-400">
                        {typeLabels[selectedTicket.type] || selectedTicket.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-4">
                  {/* Original Description */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500" suppressHydrationWarning>
                        Submitted {format(new Date(selectedTicket.createdAt), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg text-slate-300 whitespace-pre-wrap">
                      {selectedTicket.description}
                    </div>
                  </div>

                  {/* Auto-close warning for resolved tickets */}
                  {selectedTicket.status === "RESOLVED" && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <p className="text-sm text-amber-400 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          <strong>This ticket will automatically close in 24 hours.</strong>{" "}
                          Reply below if you need further assistance.
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Resolution */}
                  {selectedTicket.resolution && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Resolution
                      </h4>
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-white">
                        {selectedTicket.resolution}
                      </div>
                    </div>
                  )}

                  <Separator className="bg-slate-800" />

                  {/* Comments */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-400">Conversation</h4>
                    {loadingComments ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
                      </div>
                    ) : comments.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">
                        No messages yet. Add a reply below.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {comments.map((comment) => (
                          <div
                            key={comment.id}
                            className={`p-3 rounded-lg ${
                              comment.author.role !== "USER"
                                ? "bg-emerald-500/10 border border-emerald-500/20"
                                : "bg-slate-800/50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white">
                                {comment.author.role !== "USER" ? (
                                  <span className="flex items-center gap-1">
                                    <Headphones className="h-3 w-3 text-emerald-400" />
                                    Support Team
                                  </span>
                                ) : (
                                  "You"
                                )}
                              </span>
                              <span className="text-xs text-slate-500" suppressHydrationWarning>
                                {mounted ? formatDistanceToNow(new Date(comment.createdAt), {
                                  addSuffix: true,
                                }) : ""}
                              </span>
                            </div>
                            <p className="text-sm text-slate-300 whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    {selectedTicket.status !== "CLOSED" && (
                      <div className="space-y-2 pt-2">
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a reply..."
                          className="bg-slate-800 border-slate-700 min-h-[80px]"
                        />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={handleAddComment}
                            disabled={submittingComment || !newComment.trim()}
                          >
                            {submittingComment ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Send className="h-4 w-4 mr-2" />
                            )}
                            Send Reply
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TicketRow({
  ticket,
  onClick,
}: {
  ticket: Ticket;
  onClick: () => void;
}) {
  const statusConfig = statusColors[ticket.status] || statusColors.OPEN;
  const isResolved = ["RESOLVED", "CLOSED"].includes(ticket.status);

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors ${
        isResolved
          ? "bg-slate-800/30 hover:bg-slate-800/50"
          : "bg-slate-700/30 hover:bg-slate-700/50"
      }`}
      onClick={onClick}
    >
      <div
        className={`p-2 rounded-lg ${
          isResolved ? "bg-slate-500/10" : "bg-emerald-500/10"
        }`}
      >
        {isResolved ? (
          <CheckCircle className="h-5 w-5 text-slate-400" />
        ) : (
          <Clock className="h-5 w-5 text-emerald-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
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
        </div>
        <h4 className={`font-medium ${isResolved ? "text-slate-400" : "text-white"}`}>
          {ticket.subject}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <Badge className={`${statusConfig.bg} ${statusConfig.text} text-xs`}>
            {statusConfig.label}
          </Badge>
          <span className="text-xs text-slate-500" suppressHydrationWarning>
            {formatDistanceToNow(new Date(ticket.lastActivityAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
