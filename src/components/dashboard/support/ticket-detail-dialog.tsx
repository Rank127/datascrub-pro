"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Send,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Lock,
  Wrench,
  Zap,
  Monitor,
  Globe,
  Bot,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  AlertOctagon,
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

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
}

interface AutoFixSuggestion {
  title: string;
  description: string;
  action: string;
  actionType: "auto" | "manual" | "user_action";
  severity: "info" | "warning" | "critical";
}

interface AIDraft {
  id: string;
  content: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

interface AIAnalysisData {
  hasPendingDraft: boolean;
  pendingDraft: AIDraft | null;
  allDrafts: AIDraft[];
  latestAnalysis: {
    suggestedActions: string[];
    managerReviewItems: string[];
    createdAt: string;
  } | null;
  hasManagerReviewItems: boolean;
  allManagerReviewItems: string[];
  totalAnalysisCount: number;
}

interface Comment {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface TicketDetailDialogProps {
  ticket: Ticket;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
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

export function TicketDetailDialog({
  ticket,
  open,
  onOpenChange,
  onUpdated,
}: TicketDetailDialogProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const [resolution, setResolution] = useState(ticket.resolution || "");
  const [updating, setUpdating] = useState(false);
  const [executingFix, setExecutingFix] = useState<string | null>(null);
  const [autoResolving, setAutoResolving] = useState(false);

  // AI Draft Review state
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisData | null>(null);
  const [loadingAiAnalysis, setLoadingAiAnalysis] = useState(false);
  const [editedDraft, setEditedDraft] = useState("");
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [approvingDraft, setApprovingDraft] = useState(false);
  const [resolveOnApprove, setResolveOnApprove] = useState(true);

  const handleAutoResolve = async () => {
    setAutoResolving(true);
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticket.id}/auto-resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (response.ok) {
        if (result.resolved) {
          toast.success(`Auto-resolve completed: ${result.actionsAttempted.join(", ")}`);
        } else {
          toast.warning(result.message || "Auto-resolve needs manual intervention");
        }
        fetchComments();
        fetchAiAnalysis();
        onUpdated();
      } else {
        toast.error(result.error || "Auto-resolve failed");
      }
    } catch {
      toast.error("Failed to auto-resolve");
    } finally {
      setAutoResolving(false);
    }
  };

  // Fetch AI analysis data
  const fetchAiAnalysis = async () => {
    try {
      setLoadingAiAnalysis(true);
      const response = await fetch(`/api/admin/support/tickets/${ticket.id}/ai-analysis`);
      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data);
        // If there's a pending draft, set it for editing
        if (data.pendingDraft) {
          setEditedDraft(data.pendingDraft.content);
        }
      }
    } catch (error) {
      console.error("Failed to fetch AI analysis:", error);
    } finally {
      setLoadingAiAnalysis(false);
    }
  };

  // Approve AI draft
  const handleApproveDraft = async () => {
    if (!aiAnalysis?.pendingDraft) return;

    setApprovingDraft(true);
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticket.id}/approve-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftCommentId: aiAnalysis.pendingDraft.id,
          editedContent: editedDraft,
          resolveTicket: resolveOnApprove,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Draft approved and sent to user");
        setIsEditingDraft(false);
        fetchComments();
        fetchAiAnalysis();
        onUpdated();
      } else {
        toast.error(result.error || "Failed to approve draft");
      }
    } catch {
      toast.error("Failed to approve draft");
    } finally {
      setApprovingDraft(false);
    }
  };

  // Reject AI draft (mark as rejected without sending)
  const handleRejectDraft = async () => {
    if (!aiAnalysis?.pendingDraft) return;

    try {
      // Add a rejection note as internal comment
      await fetch(`/api/admin/support/tickets/${ticket.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `[AI DRAFT - REJECTED]\nOriginal draft was rejected. Admin chose to write custom response.`,
          isInternal: true,
        }),
      });

      toast.info("Draft rejected. You can now write a custom response.");
      fetchAiAnalysis();
      fetchComments();
    } catch {
      toast.error("Failed to reject draft");
    }
  };

  // Generate auto-fix suggestions based on ticket type
  // Action names must match executeAutoFix in ticket-service.ts
  const getAutoFixSuggestions = (): AutoFixSuggestion[] => {
    const suggestions: AutoFixSuggestion[] = [];

    switch (ticket.type) {
      case "SCAN_ERROR":
        suggestions.push(
          { title: "Retry Scan", description: "Reset scan status so user can retry", action: "retry_scan", actionType: "auto", severity: "info" },
          { title: "Verify Profile", description: "Check user profile data for accuracy", action: "verify_profile", actionType: "manual", severity: "info" }
        );
        if (ticket.description.toLowerCase().includes("timeout")) {
          suggestions.push({ title: "Schedule Off-Peak", description: "Schedule retry during off-peak hours", action: "schedule_retry", actionType: "auto", severity: "warning" });
        }
        break;
      case "REMOVAL_FAILED":
        suggestions.push(
          { title: "Retry Removal", description: "Reset attempts and queue for retry", action: "retry_removal", actionType: "auto", severity: "info" },
          { title: "Try Alt Emails", description: "Try alternative email variations", action: "retry_alternate_emails", actionType: "auto", severity: "info" },
          { title: "Mark Manual", description: "Flag for manual processing", action: "mark_manual", actionType: "manual", severity: "warning" },
          { title: "Escalate", description: "Escalate to legal for CCPA/GDPR request", action: "escalate_broker", actionType: "manual", severity: "critical" }
        );
        break;
      case "PAYMENT_ISSUE":
        suggestions.push(
          { title: "Check Stripe", description: "Open Stripe dashboard for this customer", action: "check_stripe", actionType: "manual", severity: "warning" },
          { title: "Send Update Link", description: "Send payment method update link to user", action: "send_payment_link", actionType: "auto", severity: "info" },
          { title: "Extend Grace", description: "Extend access 7 days while issue resolves", action: "extend_grace", actionType: "manual", severity: "info" }
        );
        break;
      case "ACCOUNT_ISSUE":
        suggestions.push(
          { title: "Reset Sessions", description: "Clear all sessions to fix login issues", action: "reset_sessions", actionType: "auto", severity: "info" },
          { title: "Verify Email", description: "Resend email verification link", action: "verify_email", actionType: "auto", severity: "info" },
          { title: "Check Status", description: "Review full account status", action: "check_status", actionType: "manual", severity: "info" }
        );
        break;
      case "FEATURE_REQUEST":
        suggestions.push(
          { title: "Log Feature", description: "Add to product backlog", action: "log_feature", actionType: "manual", severity: "info" },
          { title: "Check Roadmap", description: "Check if already planned", action: "check_roadmap", actionType: "manual", severity: "info" }
        );
        break;
      default:
        suggestions.push({ title: "Manual Review", description: "Review and respond manually", action: "manual_review", actionType: "manual", severity: "info" });
    }

    return suggestions;
  };

  const suggestions = getAutoFixSuggestions();

  const handleExecuteFix = async (action: string, suggestion: AutoFixSuggestion) => {
    setExecutingFix(action);
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticket.id}/execute-fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || `${suggestion.title} completed`);

        // Handle special actions that return URLs
        if (result.data?.url && result.data?.openInNewTab) {
          window.open(result.data.url, "_blank");
        }

        fetchComments();
      } else {
        toast.error(result.message || "Action failed");
      }
    } catch {
      toast.error("Failed to execute action");
    } finally {
      setExecutingFix(null);
    }
  };

  useEffect(() => {
    if (open) {
      fetchComments();
      fetchAiAnalysis();
      setStatus(ticket.status);
      setPriority(ticket.priority);
      setResolution(ticket.resolution || "");
      setIsEditingDraft(false);
    }
  }, [open, ticket]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await fetch(`/api/admin/support/tickets/${ticket.id}/comments`);
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

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/admin/support/tickets/${ticket.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment, isInternal }),
      });

      if (response.ok) {
        setNewComment("");
        setIsInternal(false);
        fetchComments();
        toast.success("Comment added");
      } else {
        toast.error("Failed to add comment");
      }
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTicket = async () => {
    try {
      setUpdating(true);
      const body: Record<string, string> = {};

      if (status !== ticket.status) body.status = status;
      if (priority !== ticket.priority) body.priority = priority;
      if (resolution && !ticket.resolution) body.resolution = resolution;

      if (Object.keys(body).length === 0) {
        toast.info("No changes to save");
        return;
      }

      const response = await fetch(`/api/admin/support/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success("Ticket updated");
        onUpdated();
      } else {
        toast.error("Failed to update ticket");
      }
    } catch (error) {
      toast.error("Failed to update ticket");
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignToMe = async () => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/support/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignToMe: true }),
      });

      if (response.ok) {
        toast.success("Ticket assigned to you");
        onUpdated();
      } else {
        toast.error("Failed to assign ticket");
      }
    } catch (error) {
      toast.error("Failed to assign ticket");
    } finally {
      setUpdating(false);
    }
  };

  const handleResolve = async () => {
    if (!resolution.trim()) {
      toast.error("Please enter a resolution message");
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/support/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED", resolution }),
      });

      if (response.ok) {
        toast.success("Ticket resolved");
        onUpdated();
      } else {
        toast.error("Failed to resolve ticket");
      }
    } catch (error) {
      toast.error("Failed to resolve ticket");
    } finally {
      setUpdating(false);
    }
  };

  const statusStyle = statusColors[ticket.status] || statusColors.OPEN;
  const priorityStyle = priorityColors[ticket.priority] || priorityColors.NORMAL;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-slate-900 border-slate-800">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl text-white flex items-center gap-2">
                {ticket.subject}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-mono text-xs text-slate-500">
                  {ticket.ticketNumber}
                </span>
                <Badge className={`${statusStyle.bg} ${statusStyle.text}`}>
                  {ticket.status.replace(/_/g, " ")}
                </Badge>
                <Badge className={`${priorityStyle.bg} ${priorityStyle.text}`}>
                  {ticket.priority}
                </Badge>
                <Badge variant="outline" className="text-slate-400">
                  {ticket.type.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            {/* Ticket Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-slate-500">Submitted by</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-white">{ticket.user.name || "Unknown"}</span>
                  <span className="text-slate-500">({ticket.user.email})</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500">Created</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-white">
                    {format(new Date(ticket.createdAt), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
              </div>
              {ticket.assignedTo && (
                <div className="space-y-1">
                  <p className="text-slate-500">Assigned to</p>
                  <span className="text-white">
                    {ticket.assignedTo.name || ticket.assignedTo.email}
                  </span>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-slate-500">Source</p>
                <Badge variant="outline">{ticket.source}</Badge>
              </div>
            </div>

            {/* Debug Info (if available) */}
            {(ticket.browserInfo || ticket.pageUrl) && (
              <div className="p-3 bg-slate-800/50 rounded-lg space-y-2">
                <h4 className="text-xs font-medium text-slate-400 flex items-center gap-1">
                  <Monitor className="h-3 w-3" />
                  Debug Info
                </h4>
                {ticket.pageUrl && (
                  <div className="flex items-center gap-2 text-xs">
                    <Globe className="h-3 w-3 text-slate-500" />
                    <span className="text-slate-400">Page:</span>
                    <span className="text-slate-300 truncate">{ticket.pageUrl}</span>
                  </div>
                )}
                {ticket.browserInfo && (
                  <div className="text-xs text-slate-400 truncate">
                    {ticket.browserInfo}
                  </div>
                )}
              </div>
            )}

            {/* AI Draft Review Section */}
            {aiAnalysis?.hasPendingDraft && aiAnalysis.pendingDraft && ticket.status !== "CLOSED" && (
              <div className="space-y-3 p-4 rounded-lg border-2 border-blue-500/50 bg-blue-500/10">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-blue-400 flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    AI Draft Response
                    <Badge className="bg-blue-500/20 text-blue-300 text-xs">Pending Review</Badge>
                  </h4>
                  <span className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(aiAnalysis.pendingDraft.createdAt), { addSuffix: true })}
                  </span>
                </div>

                {isEditingDraft ? (
                  <Textarea
                    value={editedDraft}
                    onChange={(e) => setEditedDraft(e.target.value)}
                    className="bg-slate-800 border-slate-700 min-h-[120px] text-sm"
                    placeholder="Edit the AI response..."
                  />
                ) : (
                  <div className="p-3 bg-slate-800/50 rounded-lg text-sm text-slate-300 whitespace-pre-wrap">
                    {aiAnalysis.pendingDraft.content}
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  {!isEditingDraft ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => setIsEditingDraft(true)}
                        variant="outline"
                        className="gap-1"
                      >
                        <Edit3 className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleApproveDraft}
                        disabled={approvingDraft}
                        className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                      >
                        {approvingDraft ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <ThumbsUp className="h-3 w-3" />
                        )}
                        Approve & Send
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleRejectDraft}
                        variant="outline"
                        className="gap-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <ThumbsDown className="h-3 w-3" />
                        Reject
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          setIsEditingDraft(false);
                          setEditedDraft(aiAnalysis.pendingDraft!.content);
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleApproveDraft}
                        disabled={approvingDraft || !editedDraft.trim()}
                        className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                      >
                        {approvingDraft ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <ThumbsUp className="h-3 w-3" />
                        )}
                        Approve Edited
                      </Button>
                    </>
                  )}
                  <label className="flex items-center gap-2 text-xs text-slate-400 ml-auto">
                    <input
                      type="checkbox"
                      checked={resolveOnApprove}
                      onChange={(e) => setResolveOnApprove(e.target.checked)}
                      className="rounded border-slate-600"
                    />
                    Resolve ticket on approve
                  </label>
                </div>
              </div>
            )}

            {/* AI Analysis Summary */}
            {aiAnalysis?.latestAnalysis && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-purple-400 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Analysis
                </h4>
                <div className="grid gap-2">
                  {aiAnalysis.latestAnalysis.suggestedActions.length > 0 && (
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Suggested Actions</p>
                      <div className="flex flex-wrap gap-1">
                        {aiAnalysis.latestAnalysis.suggestedActions.map((action, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {action.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {aiAnalysis.hasManagerReviewItems && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <p className="text-xs text-amber-400 mb-2 flex items-center gap-1">
                        <AlertOctagon className="h-3 w-3" />
                        Manager Review Required
                      </p>
                      <ul className="text-sm text-slate-300 space-y-1">
                        {aiAnalysis.allManagerReviewItems.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-400">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Loading AI Analysis */}
            {loadingAiAnalysis && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading AI analysis...
              </div>
            )}

            {/* Auto-Fix Suggestions */}
            {ticket.status !== "CLOSED" && suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-amber-400 flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Suggested Actions
                </h4>
                <div className="grid gap-2">
                  {suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${
                        suggestion.severity === "critical"
                          ? "bg-red-500/10 border-red-500/20"
                          : suggestion.severity === "warning"
                          ? "bg-amber-500/10 border-amber-500/20"
                          : "bg-slate-800/50 border-slate-700"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{suggestion.title}</p>
                        <p className="text-xs text-slate-400">{suggestion.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={suggestion.actionType === "auto" ? "default" : "outline"}
                        onClick={() => handleExecuteFix(suggestion.action, suggestion)}
                        disabled={executingFix === suggestion.action}
                        className="shrink-0"
                      >
                        {executingFix === suggestion.action ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : suggestion.actionType === "auto" ? (
                          <Zap className="h-3 w-3 mr-1" />
                        ) : null}
                        {suggestion.actionType === "auto" ? "Run" : "Log"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="bg-slate-800" />

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-400">Description</h4>
              <div className="p-4 bg-slate-800/50 rounded-lg text-white whitespace-pre-wrap">
                {ticket.description}
              </div>
            </div>

            {/* Linked Resources */}
            {(ticket.scanId || ticket.exposureId || ticket.removalRequestId || ticket.subscriptionId) && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-400">Linked Resources</h4>
                <div className="flex flex-wrap gap-2">
                  {ticket.scanId && (
                    <Badge variant="outline" className="gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Scan: {ticket.scanId.substring(0, 8)}...
                    </Badge>
                  )}
                  {ticket.exposureId && (
                    <Badge variant="outline" className="gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Exposure: {ticket.exposureId.substring(0, 8)}...
                    </Badge>
                  )}
                  {ticket.removalRequestId && (
                    <Badge variant="outline" className="gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Removal: {ticket.removalRequestId.substring(0, 8)}...
                    </Badge>
                  )}
                  {ticket.subscriptionId && (
                    <Badge variant="outline" className="gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Subscription: {ticket.subscriptionId.substring(0, 8)}...
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Resolution (if resolved) */}
            {ticket.resolution && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Resolution
                </h4>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-white">
                  {ticket.resolution}
                </div>
              </div>
            )}

            <Separator className="bg-slate-800" />

            {/* Comments */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-400">Comments</h4>

              {loadingComments ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  No comments yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-3 rounded-lg ${
                        comment.isInternal
                          ? "bg-amber-500/10 border border-amber-500/20"
                          : "bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {comment.author.id === ticket.userId
                              ? (comment.author.name || "Customer")
                              : "GhostMyData Support"}
                          </span>
                          {comment.isInternal && (
                            <Badge className="bg-amber-500/20 text-amber-400 text-xs gap-1">
                              <Lock className="h-3 w-3" />
                              Internal
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              <div className="space-y-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="bg-slate-800 border-slate-700 min-h-[80px]"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-slate-600"
                    />
                    <Lock className="h-3 w-3" />
                    Internal note (hidden from user)
                  </label>
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={submitting || !newComment.trim()}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Add Comment
                  </Button>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-800" />

            {/* Admin Actions */}
            {ticket.status !== "CLOSED" && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-400">Actions</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-400">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="WAITING_USER">Waiting User</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-400">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {!ticket.assignedTo && (
                  <Button
                    variant="outline"
                    onClick={handleAssignToMe}
                    disabled={updating}
                  >
                    Assign to Me
                  </Button>
                )}

                {ticket.status !== "RESOLVED" && (
                  <div className="space-y-2">
                    <Label className="text-slate-400">Resolution Message</Label>
                    <Textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Enter resolution message to close ticket..."
                      className="bg-slate-800 border-slate-700 min-h-[80px]"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleUpdateTicket}
                    disabled={updating}
                  >
                    {updating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Update Ticket
                  </Button>

                  {ticket.status !== "RESOLVED" && (
                    <Button
                      onClick={handleAutoResolve}
                      disabled={autoResolving || updating}
                      variant="outline"
                      className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                    >
                      {autoResolving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      Auto-Resolve
                    </Button>
                  )}

                  {ticket.status !== "RESOLVED" && resolution && (
                    <Button
                      onClick={handleResolve}
                      disabled={updating}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolve Ticket
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
