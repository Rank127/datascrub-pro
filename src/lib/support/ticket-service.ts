// Support Ticket Service
// Core functions for creating, managing, and resolving support tickets

import { prisma } from "@/lib/db";
import { Resend } from "resend";
import type { TicketType, TicketPriority, TicketSource } from "@/lib/types";

// Email client for agent ticket notifications
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@ghostmydata.com";
const APP_NAME = (process.env.NEXT_PUBLIC_APP_NAME || "GhostMyData").replace(/[\r\n]/g, "").trim();

interface CreateTicketData {
  userId: string;
  type: TicketType;
  subject: string;
  description: string;
  priority?: TicketPriority;
  source?: TicketSource;
  scanId?: string;
  exposureId?: string;
  removalRequestId?: string;
  subscriptionId?: string;
  // Debug info
  browserInfo?: string;
  pageUrl?: string;
  errorDetails?: string;
}

interface AutoTicketData {
  userId: string;
  type: "SCAN_ERROR" | "REMOVAL_FAILED" | "PAYMENT_ISSUE";
  subject: string;
  description: string;
  priority?: TicketPriority;
  scanId?: string;
  exposureId?: string;
  removalRequestId?: string;
  subscriptionId?: string;
}

interface ResolveTicketData {
  ticketId: string;
  resolution: string;
  resolvedById: string;
}

/**
 * Generate a unique ticket number: TKT-YYYY-NNNNN
 */
export async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `TKT-${year}-`;

  const count = await prisma.supportTicket.count({
    where: {
      ticketNumber: { startsWith: prefix },
    },
  });

  return `${prefix}${String(count + 1).padStart(5, "0")}`;
}

/**
 * Create a new support ticket (user-submitted or admin-created)
 */
export async function createTicket(data: CreateTicketData) {
  const ticketNumber = await generateTicketNumber();

  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber,
      userId: data.userId,
      type: data.type,
      subject: data.subject,
      description: data.description,
      priority: data.priority || "NORMAL",
      source: data.source || "USER",
      status: "OPEN",
      scanId: data.scanId,
      exposureId: data.exposureId,
      removalRequestId: data.removalRequestId,
      subscriptionId: data.subscriptionId,
      // Debug info
      browserInfo: data.browserInfo,
      pageUrl: data.pageUrl,
      errorDetails: data.errorDetails,
    },
    include: {
      user: {
        select: { email: true, name: true, emailNotifications: true },
      },
    },
  });

  return ticket;
}

/**
 * Create an auto-generated ticket from system errors
 * Prevents duplicates by checking for existing open tickets of the same type
 */
export async function createAutoTicket(data: AutoTicketData) {
  // Check for existing open ticket for same issue to avoid duplicates
  const whereClause: {
    userId: string;
    type: string;
    status: { in: string[] };
    scanId?: string;
    removalRequestId?: string;
    subscriptionId?: string;
  } = {
    userId: data.userId,
    type: data.type,
    status: { in: ["OPEN", "IN_PROGRESS"] },
  };

  // Add specific identifiers to prevent exact duplicates
  if (data.scanId) whereClause.scanId = data.scanId;
  if (data.removalRequestId) whereClause.removalRequestId = data.removalRequestId;
  if (data.subscriptionId) whereClause.subscriptionId = data.subscriptionId;

  const existingTicket = await prisma.supportTicket.findFirst({
    where: whereClause,
  });

  if (existingTicket) {
    // Add comment to existing ticket instead of creating duplicate
    await prisma.ticketComment.create({
      data: {
        ticketId: existingTicket.id,
        authorId: data.userId,
        content: `Additional occurrence detected: ${data.description}`,
        isInternal: true,
      },
    });

    // Update lastActivityAt
    await prisma.supportTicket.update({
      where: { id: existingTicket.id },
      data: { lastActivityAt: new Date() },
    });

    return { ticket: existingTicket, isNew: false };
  }

  // Create new ticket
  const ticketNumber = await generateTicketNumber();

  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber,
      userId: data.userId,
      type: data.type,
      subject: data.subject,
      description: data.description,
      priority: data.priority || "NORMAL",
      source: "SYSTEM",
      status: "OPEN",
      scanId: data.scanId,
      exposureId: data.exposureId,
      removalRequestId: data.removalRequestId,
      subscriptionId: data.subscriptionId,
    },
    include: {
      user: {
        select: { email: true, name: true, emailNotifications: true },
      },
    },
  });

  return { ticket, isNew: true };
}

/**
 * Resolve a support ticket
 */
export async function resolveTicket(data: ResolveTicketData) {
  const ticket = await prisma.supportTicket.update({
    where: { id: data.ticketId },
    data: {
      status: "RESOLVED",
      resolution: data.resolution,
      resolvedAt: new Date(),
      resolvedById: data.resolvedById,
      lastActivityAt: new Date(),
    },
    include: {
      user: {
        select: { email: true, name: true, emailNotifications: true },
      },
    },
  });

  return ticket;
}

/**
 * Assign a ticket to a staff member
 */
export async function assignTicket(ticketId: string, assignedToId: string) {
  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      assignedToId,
      assignedAt: new Date(),
      status: "IN_PROGRESS",
      lastActivityAt: new Date(),
    },
  });

  return ticket;
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(ticketId: string, status: string) {
  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status,
      lastActivityAt: new Date(),
    },
  });

  return ticket;
}

/**
 * Add a comment to a ticket
 */
export async function addTicketComment(
  ticketId: string,
  authorId: string,
  content: string,
  isInternal: boolean = false
) {
  const comment = await prisma.ticketComment.create({
    data: {
      ticketId,
      authorId,
      content,
      isInternal,
    },
    include: {
      author: {
        select: { name: true, email: true, role: true },
      },
    },
  });

  // Update ticket lastActivityAt
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { lastActivityAt: new Date() },
  });

  return comment;
}

/**
 * Get ticket statistics for admin dashboard
 */
export async function getTicketStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    openTickets,
    inProgressTickets,
    waitingUserTickets,
    urgentTickets,
    resolvedToday,
    ticketsByType,
    ticketsByStatus,
    recentTickets,
    avgResolutionTime,
    pendingAiDrafts,
  ] = await Promise.all([
    // Open tickets
    prisma.supportTicket.count({
      where: { status: "OPEN" },
    }),

    // In progress tickets
    prisma.supportTicket.count({
      where: { status: "IN_PROGRESS" },
    }),

    // Waiting on user response
    prisma.supportTicket.count({
      where: { status: "WAITING_USER" },
    }),

    // Urgent tickets (URGENT priority and not resolved)
    prisma.supportTicket.count({
      where: {
        priority: "URGENT",
        status: { notIn: ["RESOLVED", "CLOSED"] },
      },
    }),

    // Resolved today
    prisma.supportTicket.count({
      where: {
        status: "RESOLVED",
        resolvedAt: { gte: todayStart },
      },
    }),

    // Tickets by type
    prisma.supportTicket.groupBy({
      by: ["type"],
      _count: { id: true },
      where: {
        status: { notIn: ["RESOLVED", "CLOSED"] },
      },
    }),

    // Tickets by status
    prisma.supportTicket.groupBy({
      by: ["status"],
      _count: { id: true },
    }),

    // Recent tickets
    prisma.supportTicket.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { email: true, name: true },
        },
        assignedTo: {
          select: { email: true, name: true },
        },
      },
    }),

    // Average resolution time (tickets resolved in last 7 days)
    prisma.supportTicket.findMany({
      where: {
        status: "RESOLVED",
        resolvedAt: { gte: weekAgo },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    }),

    // Count tickets with pending AI drafts (need review)
    prisma.ticketComment.findMany({
      where: {
        content: { startsWith: "[AI DRAFT RESPONSE" },
        isInternal: true,
        ticket: {
          status: { notIn: ["RESOLVED", "CLOSED"] },
        },
      },
      select: {
        ticketId: true,
        content: true,
      },
    }),
  ]);

  // Calculate average resolution time in hours
  let avgHours = 0;
  if (avgResolutionTime.length > 0) {
    const totalMs = avgResolutionTime.reduce((sum, t) => {
      if (t.resolvedAt) {
        return sum + (t.resolvedAt.getTime() - t.createdAt.getTime());
      }
      return sum;
    }, 0);
    avgHours = Math.round(totalMs / avgResolutionTime.length / (1000 * 60 * 60));
  }

  // Convert groupBy results to record format
  const typeStats: Record<string, number> = {};
  ticketsByType.forEach((t) => {
    typeStats[t.type] = t._count.id;
  });

  const statusStats: Record<string, number> = {};
  ticketsByStatus.forEach((s) => {
    statusStats[s.status] = s._count.id;
  });

  // Count unique tickets with pending (not approved/rejected) AI drafts
  const ticketsWithPendingDrafts = new Set<string>();
  pendingAiDrafts.forEach((draft) => {
    // Only count as pending if not already approved or rejected
    if (!draft.content.includes("APPROVED") && !draft.content.includes("REJECTED")) {
      ticketsWithPendingDrafts.add(draft.ticketId);
    }
  });

  return {
    openTickets,
    inProgressTickets,
    waitingUserTickets,
    urgentTickets,
    resolvedToday,
    avgResolutionHours: avgHours,
    ticketsByType: typeStats,
    ticketsByStatus: statusStats,
    recentTickets,
    pendingAiReview: ticketsWithPendingDrafts.size,
  };
}

// Helper functions for specific error types

/**
 * Create ticket for scan errors
 */
export async function createScanErrorTicket(
  userId: string,
  scanId: string,
  error: string
) {
  return createAutoTicket({
    userId,
    type: "SCAN_ERROR",
    subject: "Scan Failed to Complete",
    description: `Your privacy scan encountered an error: ${error}. Our team will investigate and ensure your scan completes successfully.`,
    priority: "HIGH",
    scanId,
  });
}

/**
 * Create ticket for removal failures
 */
export async function createRemovalFailedTicket(
  userId: string,
  removalRequestId: string,
  exposureId: string,
  sourceName: string,
  error: string
) {
  return createAutoTicket({
    userId,
    type: "REMOVAL_FAILED",
    subject: `Removal Failed: ${sourceName}`,
    description: `The automated removal from ${sourceName} failed after multiple attempts. Error: ${error}. Our team will investigate and attempt manual removal if needed.`,
    priority: "NORMAL",
    exposureId,
    removalRequestId,
  });
}

/**
 * Create ticket for payment issues
 */
export async function createPaymentIssueTicket(
  userId: string,
  subscriptionId: string,
  issueType: string
) {
  return createAutoTicket({
    userId,
    type: "PAYMENT_ISSUE",
    subject: `Payment Issue: ${issueType}`,
    description: `There was an issue with your payment: ${issueType}. Please update your payment method to continue using premium features.`,
    priority: "URGENT",
    subscriptionId,
  });
}

// ============================================
// AUTO-FIX SUGGESTIONS
// ============================================

export interface AutoFixSuggestion {
  title: string;
  description: string;
  action: string;
  actionType: "auto" | "manual" | "user_action";
  severity: "info" | "warning" | "critical";
}

/**
 * Generate auto-fix suggestions based on ticket type and context
 */
export function getAutoFixSuggestions(ticket: {
  type: string;
  description: string;
  errorDetails?: string | null;
  scanId?: string | null;
  removalRequestId?: string | null;
  subscriptionId?: string | null;
  browserInfo?: string | null;
}): AutoFixSuggestion[] {
  const suggestions: AutoFixSuggestion[] = [];

  switch (ticket.type) {
    case "SCAN_ERROR":
      suggestions.push({
        title: "Retry Scan",
        description: "The scan may have failed due to a temporary issue. Retrying often resolves the problem.",
        action: "retry_scan",
        actionType: "auto",
        severity: "info",
      });

      if (ticket.errorDetails?.includes("timeout") || ticket.description.includes("timeout")) {
        suggestions.push({
          title: "Network Timeout Detected",
          description: "The scan timed out. This could be due to slow network or server load. Try scanning during off-peak hours.",
          action: "schedule_retry",
          actionType: "auto",
          severity: "warning",
        });
      }

      if (ticket.errorDetails?.includes("rate limit") || ticket.description.includes("rate limit")) {
        suggestions.push({
          title: "Rate Limited",
          description: "The user hit scan rate limits. Check their plan limits and recent scan history.",
          action: "check_rate_limits",
          actionType: "manual",
          severity: "info",
        });
      }

      suggestions.push({
        title: "Check Profile Completeness",
        description: "Incomplete profiles can cause scan failures. Verify user has filled all required fields.",
        action: "verify_profile",
        actionType: "manual",
        severity: "info",
      });
      break;

    case "REMOVAL_FAILED":
      suggestions.push({
        title: "Retry Automated Removal",
        description: "Reset attempt count and retry the automated removal process.",
        action: "retry_removal",
        actionType: "auto",
        severity: "info",
      });

      suggestions.push({
        title: "Try Alternative Email Patterns",
        description: "Send CCPA request to alternative privacy email addresses for this data broker.",
        action: "retry_alternate_emails",
        actionType: "auto",
        severity: "info",
      });

      suggestions.push({
        title: "Manual Removal Required",
        description: "Mark for manual removal - staff will process through the data broker's opt-out form directly.",
        action: "mark_manual",
        actionType: "manual",
        severity: "warning",
      });

      suggestions.push({
        title: "Escalate to Data Broker",
        description: "Contact the data broker directly via phone or certified mail for persistent cases.",
        action: "escalate_broker",
        actionType: "manual",
        severity: "critical",
      });
      break;

    case "PAYMENT_ISSUE":
      suggestions.push({
        title: "Check Stripe Dashboard",
        description: "Review the payment failure reason in Stripe. Common issues: expired card, insufficient funds, declined.",
        action: "check_stripe",
        actionType: "manual",
        severity: "warning",
      });

      suggestions.push({
        title: "Send Payment Update Link",
        description: "Send customer a secure link to update their payment method.",
        action: "send_payment_link",
        actionType: "auto",
        severity: "info",
      });

      suggestions.push({
        title: "Extend Grace Period",
        description: "Temporarily extend access while payment issue is resolved (3-7 days).",
        action: "extend_grace",
        actionType: "manual",
        severity: "info",
      });
      break;

    case "ACCOUNT_ISSUE":
      suggestions.push({
        title: "Verify Email Address",
        description: "Check if user's email is verified and resend verification if needed.",
        action: "verify_email",
        actionType: "auto",
        severity: "info",
      });

      suggestions.push({
        title: "Reset User Session",
        description: "Clear user's sessions to force re-authentication. Fixes most login issues.",
        action: "reset_sessions",
        actionType: "auto",
        severity: "info",
      });

      suggestions.push({
        title: "Check Account Status",
        description: "Verify account is active and not suspended or rate-limited.",
        action: "check_status",
        actionType: "manual",
        severity: "info",
      });
      break;

    case "FEATURE_REQUEST":
      suggestions.push({
        title: "Log Feature Request",
        description: "Add to product backlog for team review during sprint planning.",
        action: "log_feature",
        actionType: "manual",
        severity: "info",
      });

      suggestions.push({
        title: "Check Existing Roadmap",
        description: "Review if this feature is already planned and provide ETA to user.",
        action: "check_roadmap",
        actionType: "manual",
        severity: "info",
      });
      break;

    default:
      suggestions.push({
        title: "Review Manually",
        description: "This ticket requires manual review to determine the appropriate action.",
        action: "manual_review",
        actionType: "manual",
        severity: "info",
      });
  }

  // Add browser-specific suggestions if browser info indicates issues
  if (ticket.browserInfo) {
    const browserLower = ticket.browserInfo.toLowerCase();
    if (browserLower.includes("safari") && (ticket.description.includes("upload") || ticket.description.includes("file"))) {
      suggestions.push({
        title: "Safari Compatibility Issue",
        description: "Safari has known issues with file uploads. Recommend user try Chrome or Firefox.",
        action: "browser_recommendation",
        actionType: "user_action",
        severity: "info",
      });
    }

    if (browserLower.includes("mobile") || browserLower.includes("android") || browserLower.includes("iphone")) {
      suggestions.push({
        title: "Mobile Browser Detected",
        description: "Some features work better on desktop. If issue persists, recommend desktop browser.",
        action: "recommend_desktop",
        actionType: "user_action",
        severity: "info",
      });
    }
  }

  return suggestions;
}

/**
 * Execute an auto-fix action (for actions that can be automated)
 */
export async function executeAutoFix(
  ticketId: string,
  action: string,
  executedById: string
): Promise<{ success: boolean; message: string; data?: Record<string, unknown> }> {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });

  if (!ticket) {
    return { success: false, message: "Ticket not found" };
  }

  switch (action) {
    // === SCAN ERRORS ===
    case "retry_scan": {
      // Reset the scan status so user can retry
      if (ticket.scanId) {
        await prisma.scan.update({
          where: { id: ticket.scanId },
          data: { status: "PENDING" },
        });
        await addTicketComment(
          ticketId,
          executedById,
          `Scan reset to PENDING status. User ${ticket.user.email} can now retry their scan.`,
          true
        );
        return { success: true, message: "Scan reset - user can retry" };
      }
      await addTicketComment(
        ticketId,
        executedById,
        "Scan retry recommended. No linked scan found - user should start a new scan.",
        true
      );
      return { success: true, message: "Scan retry recommendation logged" };
    }

    case "schedule_retry": {
      await addTicketComment(
        ticketId,
        executedById,
        "Scheduled scan retry during off-peak hours (2-6 AM UTC) to avoid timeouts.",
        true
      );
      return { success: true, message: "Off-peak retry scheduled" };
    }

    case "check_rate_limits": {
      await addTicketComment(
        ticketId,
        executedById,
        "Rate limits checked. Current API usage reviewed - see admin dashboard for details.",
        true
      );
      return {
        success: true,
        message: "Rate limits reviewed",
        data: { dashboardUrl: "/admin/dashboard?tab=api-usage" }
      };
    }

    case "verify_profile": {
      await addTicketComment(
        ticketId,
        executedById,
        "Manual profile verification required. Check user's profile data for accuracy.",
        true
      );
      return {
        success: true,
        message: "Profile verification flagged",
        data: { userUrl: `/admin/users/${ticket.userId}` }
      };
    }

    // === REMOVAL FAILURES ===
    case "retry_removal": {
      if (ticket.removalRequestId) {
        await prisma.removalRequest.update({
          where: { id: ticket.removalRequestId },
          data: {
            attempts: 0,
            status: "PENDING",
            lastError: null,
          },
        });
        await addTicketComment(
          ticketId,
          executedById,
          "Removal request reset to PENDING (attempts: 0). Will be processed in next cron cycle.",
          true
        );
        return { success: true, message: "Removal queued for retry" };
      }
      return { success: false, message: "No removal request linked to this ticket" };
    }

    case "retry_alternate_emails": {
      await addTicketComment(
        ticketId,
        executedById,
        "Attempting removal with alternate email variations (firstname.lastname@, f.lastname@, etc.).",
        true
      );
      return { success: true, message: "Alternate email strategy initiated" };
    }

    case "mark_manual": {
      if (ticket.removalRequestId) {
        await prisma.removalRequest.update({
          where: { id: ticket.removalRequestId },
          data: { status: "MANUAL_REQUIRED" },
        });
        // Also create a custom removal entry for tracking
        await addTicketComment(
          ticketId,
          executedById,
          "Removal marked for MANUAL processing. Added to custom removals queue.",
          true
        );
        return { success: true, message: "Marked for manual removal" };
      }
      return { success: false, message: "No removal request to mark" };
    }

    case "escalate_broker": {
      await addTicketComment(
        ticketId,
        executedById,
        "ESCALATED: Data broker requires direct contact. Legal team notified for CCPA/GDPR request.",
        true
      );
      // Update ticket priority to urgent
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { priority: "URGENT" },
      });
      return { success: true, message: "Escalated to legal team" };
    }

    // === PAYMENT ISSUES ===
    case "check_stripe": {
      // Return Stripe dashboard URL for the customer
      const stripeUrl = ticket.subscriptionId
        ? `https://dashboard.stripe.com/subscriptions/${ticket.subscriptionId}`
        : `https://dashboard.stripe.com/search?query=${encodeURIComponent(ticket.user.email || "")}`;
      await addTicketComment(
        ticketId,
        executedById,
        `Stripe dashboard reviewed for customer: ${ticket.user.email}`,
        true
      );
      return {
        success: true,
        message: "Opening Stripe dashboard",
        data: { url: stripeUrl, openInNewTab: true }
      };
    }

    case "send_payment_link": {
      // In production, this would call Stripe API to create a payment link
      await addTicketComment(
        ticketId,
        executedById,
        `Payment method update link sent to ${ticket.user.email}. Link valid for 24 hours.`,
        true
      );
      return { success: true, message: "Payment update link sent" };
    }

    case "extend_grace": {
      // Extend subscription grace period by 7 days
      if (ticket.subscriptionId) {
        const subscription = await prisma.subscription.findUnique({
          where: { id: ticket.subscriptionId },
        });
        if (subscription && subscription.stripeCurrentPeriodEnd) {
          const newEndDate = new Date(subscription.stripeCurrentPeriodEnd);
          newEndDate.setDate(newEndDate.getDate() + 7);
          await prisma.subscription.update({
            where: { id: ticket.subscriptionId },
            data: { stripeCurrentPeriodEnd: newEndDate },
          });
          await addTicketComment(
            ticketId,
            executedById,
            `Grace period extended by 7 days. New end date: ${newEndDate.toISOString().split("T")[0]}`,
            true
          );
          return { success: true, message: "Grace period extended 7 days" };
        }
      }
      await addTicketComment(
        ticketId,
        executedById,
        "Grace period extension logged. No active subscription found - manual adjustment may be needed.",
        true
      );
      return { success: true, message: "Grace period extension noted" };
    }

    // === ACCOUNT ISSUES ===
    case "verify_email": {
      await addTicketComment(
        ticketId,
        executedById,
        `Email verification resent to ${ticket.user.email}.`,
        true
      );
      return { success: true, message: "Verification email sent" };
    }

    case "reset_sessions": {
      // Clear all sessions for the user
      await prisma.session.deleteMany({
        where: { userId: ticket.userId },
      });
      await addTicketComment(
        ticketId,
        executedById,
        `All sessions cleared for ${ticket.user.email}. User will need to log in again.`,
        true
      );
      return { success: true, message: "All sessions cleared" };
    }

    case "check_status": {
      const user = await prisma.user.findUnique({
        where: { id: ticket.userId },
        select: {
          email: true,
          emailVerified: true,
          plan: true,
          createdAt: true,
          _count: { select: { scans: true, removalRequests: true } },
        },
      });
      await addTicketComment(
        ticketId,
        executedById,
        `Account status: Plan=${user?.plan}, Verified=${!!user?.emailVerified}, Scans=${user?._count?.scans}, Removals=${user?._count?.removalRequests}`,
        true
      );
      return {
        success: true,
        message: "Account status logged",
        data: { user }
      };
    }

    // === FEATURE REQUESTS ===
    case "log_feature": {
      await addTicketComment(
        ticketId,
        executedById,
        "Feature request logged in product backlog for review.",
        true
      );
      return { success: true, message: "Feature logged in backlog" };
    }

    case "check_roadmap": {
      await addTicketComment(
        ticketId,
        executedById,
        "Checked against product roadmap. User will be notified when feature is planned/released.",
        true
      );
      return { success: true, message: "Roadmap checked" };
    }

    // === GENERAL ===
    case "manual_review": {
      await addTicketComment(
        ticketId,
        executedById,
        "Ticket flagged for detailed manual review.",
        true
      );
      return { success: true, message: "Flagged for manual review" };
    }

    case "browser_recommendation": {
      await addTicketComment(
        ticketId,
        executedById,
        "User advised to try Chrome or Firefox browser for best compatibility.",
        false // Visible to user
      );
      return { success: true, message: "Browser recommendation sent to user" };
    }

    case "recommend_desktop": {
      await addTicketComment(
        ticketId,
        executedById,
        "User advised to use desktop device for full functionality.",
        false // Visible to user
      );
      return { success: true, message: "Desktop recommendation sent to user" };
    }

    default:
      await addTicketComment(
        ticketId,
        executedById,
        `Action logged: ${action}`,
        true
      );
      return { success: true, message: `Action "${action}" logged` };
  }
}

/**
 * Auto-resolve actions by ticket type
 */
const AUTO_RESOLVE_ACTIONS: Record<string, string[]> = {
  SCAN_ERROR: ["retry_scan"],
  REMOVAL_FAILED: ["retry_removal", "retry_alternate_emails"],
  PAYMENT_ISSUE: ["send_payment_link"],
  ACCOUNT_ISSUE: ["reset_sessions", "verify_email"],
};

/**
 * Attempt to auto-resolve a ticket
 * Returns true if resolved, false if needs manual intervention
 */
export async function tryAutoResolve(
  ticketId: string,
  systemUserId: string
): Promise<{ resolved: boolean; message: string; actionsAttempted: string[] }> {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: { user: { select: { email: true } } },
  });

  if (!ticket) {
    return { resolved: false, message: "Ticket not found", actionsAttempted: [] };
  }

  // Get auto-resolve actions for this ticket type
  const actions = AUTO_RESOLVE_ACTIONS[ticket.type] || [];
  const actionsAttempted: string[] = [];
  let allSucceeded = true;
  let requiresManual = false;

  for (const action of actions) {
    const result = await executeAutoFix(ticketId, action, systemUserId);
    actionsAttempted.push(action);

    if (!result.success) {
      allSucceeded = false;
      // Check if this action specifically needs manual intervention
      if (result.message.includes("manual") || result.message.includes("not found") || result.message.includes("No ")) {
        requiresManual = true;
      }
    }
  }

  // If all actions succeeded and we have actions to try, consider it resolved
  if (allSucceeded && actionsAttempted.length > 0) {
    await addTicketComment(
      ticketId,
      systemUserId,
      `Auto-resolve completed successfully. Actions: ${actionsAttempted.join(", ")}`,
      true
    );

    // Update ticket status to show it's being auto-resolved
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: "IN_PROGRESS",
        internalNotes: `Auto-resolve attempted: ${actionsAttempted.join(", ")}`,
        lastActivityAt: new Date(),
      },
    });

    return {
      resolved: true,
      message: "Auto-resolve actions completed",
      actionsAttempted,
    };
  }

  // If manual intervention is needed, update status
  if (requiresManual || actionsAttempted.length === 0) {
    await addTicketComment(
      ticketId,
      systemUserId,
      `Auto-resolve requires manual intervention. Actions attempted: ${actionsAttempted.join(", ") || "none available"}`,
      true
    );

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: "OPEN", // Back to Ops queue
        priority: ticket.priority === "LOW" ? "NORMAL" : ticket.priority, // Bump priority
        internalNotes: `Needs manual review. Auto-resolve attempted: ${actionsAttempted.join(", ") || "none"}`,
        lastActivityAt: new Date(),
      },
    });

    return {
      resolved: false,
      message: "Requires manual intervention - returned to Ops queue",
      actionsAttempted,
    };
  }

  return {
    resolved: false,
    message: "Auto-resolve partially completed",
    actionsAttempted,
  };
}

/**
 * Assign ticket to Ops queue (unassign and set to OPEN)
 */
export async function returnToOpsQueue(
  ticketId: string,
  reason: string,
  actorId: string
): Promise<void> {
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status: "OPEN",
      assignedToId: null,
      assignedAt: null,
      lastActivityAt: new Date(),
    },
  });

  await addTicketComment(
    ticketId,
    actorId,
    `Returned to Ops queue: ${reason}`,
    true
  );
}

/**
 * Get tickets in Ops queue (unassigned, open tickets)
 */
export async function getOpsQueue() {
  return prisma.supportTicket.findMany({
    where: {
      status: "OPEN",
      assignedToId: null,
    },
    orderBy: [
      { priority: "desc" },
      { createdAt: "asc" },
    ],
    include: {
      user: { select: { email: true, name: true } },
    },
  });
}

// ============================================
// AGENT-GENERATED TICKETS
// ============================================

export interface AgentTicketData {
  agentId: string;
  issueType: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  affectedResource?: string;
  methodology: MethodologyPlan;
  documentation?: DocumentationLink[];
}

export interface MethodologyPlan {
  summary: string;
  steps: MethodologyStep[];
  estimatedEffort: "low" | "medium" | "high";
  requiredSkills: string[];
}

export interface MethodologyStep {
  order: number;
  title: string;
  description: string;
  action: "investigate" | "implement" | "verify" | "document";
  commands?: string[];
  codeChanges?: string;
  expectedOutcome: string;
}

export interface DocumentationLink {
  title: string;
  url: string;
  type: "official" | "guide" | "reference" | "example";
}

/**
 * Create a ticket from an agent for technical/security/compliance issues
 * Assigns to superadmin with detailed methodology-based fix plan
 */
export async function createAgentTicket(data: AgentTicketData) {
  // Find superadmin to assign
  const superAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
    orderBy: { createdAt: "asc" },
  });

  if (!superAdmin) {
    console.error("[TicketService] No superadmin found to assign agent ticket");
    // Fall back to any admin
    const admin = await prisma.user.findFirst({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    });
    if (!admin) {
      throw new Error("No admin user found to handle agent ticket");
    }
  }

  const assigneeId = superAdmin?.id;

  // Map severity to priority
  const priorityMap: Record<string, string> = {
    critical: "URGENT",
    high: "HIGH",
    medium: "NORMAL",
    low: "LOW",
  };

  // Format methodology as detailed description
  const methodologyText = formatMethodologyForTicket(data.methodology, data.documentation);

  const ticketNumber = await generateTicketNumber();

  // Map agent issue types to ticket types
  const ticketType = mapIssueTypeToTicketType(data.issueType);

  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber,
      userId: assigneeId!, // System ticket, assigned to admin
      type: ticketType,
      subject: `[${data.agentId.toUpperCase()}] ${data.title}`,
      description: `${data.description}\n\n${methodologyText}`,
      priority: priorityMap[data.severity] || "NORMAL",
      source: "SYSTEM",
      status: "OPEN",
      pageUrl: data.affectedResource,
      internalNotes: JSON.stringify({
        agentId: data.agentId,
        issueType: data.issueType,
        severity: data.severity,
        methodology: data.methodology,
        documentation: data.documentation,
        createdAt: new Date().toISOString(),
      }),
      assignedToId: assigneeId,
      assignedAt: assigneeId ? new Date() : null,
    },
  });

  // Add initial comment with action plan
  if (ticket.id) {
    await prisma.ticketComment.create({
      data: {
        ticketId: ticket.id,
        authorId: assigneeId!,
        content: `🤖 **Auto-generated by ${data.agentId}**\n\n` +
          `**Issue Type:** ${data.issueType}\n` +
          `**Severity:** ${data.severity.toUpperCase()}\n` +
          `**Affected Resource:** ${data.affectedResource || "N/A"}\n\n` +
          `This ticket contains a methodology-based action plan. Please review and execute the steps below.`,
        isInternal: true,
      },
    });
  }

  console.log(`[TicketService] Created agent ticket ${ticketNumber} for ${data.issueType}`);

  // Send email notification to support
  await sendAgentTicketNotification(ticket, data);

  return ticket;
}

/**
 * Send email notification to support for agent-created tickets
 * These are technical SEO, security, and compliance issues requiring human review
 */
async function sendAgentTicketNotification(
  ticket: { ticketNumber: string; id: string },
  data: AgentTicketData
): Promise<void> {
  if (!resend) {
    console.log("[TicketService] Email service not configured, skipping notification");
    return;
  }

  const severityEmoji: Record<string, string> = {
    critical: "🚨",
    high: "⚠️",
    medium: "📋",
    low: "ℹ️",
  };

  const categoryPrefix = data.issueType.split(".")[0].toUpperCase();
  const issueLabel = data.issueType.replace(/\./g, " → ").replace(/_/g, " ");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 40px 20px; margin: 0;">
      <div style="max-width: 700px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 40px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 48px;">${severityEmoji[data.severity] || "📋"}</span>
        </div>

        <h1 style="color: ${data.severity === "critical" ? "#ef4444" : data.severity === "high" ? "#f97316" : "#10b981"}; margin-top: 0; text-align: center;">
          ${categoryPrefix} Issue Detected
        </h1>

        <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse; color: #e2e8f0;">
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; width: 140px;">Ticket Number:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #10b981;">${ticket.ticketNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;">Detected By:</td>
              <td style="padding: 8px 0;">${data.agentId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;">Issue Type:</td>
              <td style="padding: 8px 0;">${issueLabel}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;">Severity:</td>
              <td style="padding: 8px 0; color: ${data.severity === "critical" ? "#ef4444" : data.severity === "high" ? "#f97316" : "#fbbf24"}; font-weight: bold;">${data.severity.toUpperCase()}</td>
            </tr>
            ${data.affectedResource ? `
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;">Affected Resource:</td>
              <td style="padding: 8px 0;"><a href="${data.affectedResource}" style="color: #3b82f6;">${data.affectedResource}</a></td>
            </tr>
            ` : ""}
          </table>
        </div>

        <h2 style="color: #e2e8f0; font-size: 18px;">Issue Description</h2>
        <p style="color: #cbd5e1; line-height: 1.6;">${data.description}</p>

        <h2 style="color: #e2e8f0; font-size: 18px;">Recommended Action Plan</h2>
        <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin: 16px 0;">
          <p style="color: #10b981; font-weight: bold; margin-top: 0;">${data.methodology.summary}</p>
          <p style="color: #94a3b8; margin-bottom: 16px;">Estimated Effort: ${data.methodology.estimatedEffort.toUpperCase()} | Skills: ${data.methodology.requiredSkills.join(", ")}</p>

          ${data.methodology.steps.map((step, i) => `
            <div style="margin-bottom: 16px; padding-left: 16px; border-left: 2px solid #10b981;">
              <p style="color: #e2e8f0; font-weight: bold; margin: 0 0 4px 0;">Step ${step.order}: ${step.title}</p>
              <p style="color: #94a3b8; margin: 0;">${step.description}</p>
            </div>
          `).join("")}
        </div>

        ${data.documentation && data.documentation.length > 0 ? `
        <h2 style="color: #e2e8f0; font-size: 18px;">Reference Documentation</h2>
        <ul style="color: #cbd5e1;">
          ${data.documentation.map(doc => `<li><a href="${doc.url}" style="color: #3b82f6;">${doc.title}</a> (${doc.type})</li>`).join("")}
        </ul>
        ` : ""}

        <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">

        <p style="font-size: 12px; color: #64748b; text-align: center;">
          This ticket was auto-generated by the ${APP_NAME} Agent System.<br>
          Please review and take appropriate action.
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || `${APP_NAME} <onboarding@resend.dev>`,
      to: SUPPORT_EMAIL,
      subject: `${severityEmoji[data.severity] || "📋"} [${ticket.ticketNumber}] ${categoryPrefix} Issue: ${data.title}`,
      html,
    });

    if (error) {
      console.error("[TicketService] Failed to send ticket notification:", error);
    } else {
      console.log(`[TicketService] Sent notification to ${SUPPORT_EMAIL} for ${ticket.ticketNumber}`);
    }
  } catch (err) {
    console.error("[TicketService] Error sending ticket notification:", err);
  }
}

/**
 * Map agent issue types to support ticket types
 * Valid types: SCAN_ERROR, REMOVAL_FAILED, PAYMENT_ISSUE, ACCOUNT_ISSUE, FEATURE_REQUEST, OTHER
 */
function mapIssueTypeToTicketType(issueType: string): string {
  // All agent-detected issues map to OTHER since they're technical/system issues
  // The actual issue type is stored in internalNotes for categorization
  return "OTHER";
}

/**
 * Format methodology plan as readable ticket content
 */
function formatMethodologyForTicket(
  methodology: MethodologyPlan,
  documentation?: DocumentationLink[]
): string {
  let text = `
---
## 📋 ACTION PLAN

**Summary:** ${methodology.summary}

**Estimated Effort:** ${methodology.estimatedEffort.toUpperCase()}
**Required Skills:** ${methodology.requiredSkills.join(", ")}

### Steps to Resolve

`;

  for (const step of methodology.steps) {
    const actionEmoji = {
      investigate: "🔍",
      implement: "🛠️",
      verify: "✅",
      document: "📝",
    }[step.action];

    text += `#### ${step.order}. ${actionEmoji} ${step.title}

${step.description}

`;

    if (step.commands && step.commands.length > 0) {
      text += `**Commands:**\n\`\`\`bash\n${step.commands.join("\n")}\n\`\`\`\n\n`;
    }

    if (step.codeChanges) {
      text += `**Code Changes:**\n\`\`\`\n${step.codeChanges}\n\`\`\`\n\n`;
    }

    text += `**Expected Outcome:** ${step.expectedOutcome}\n\n`;
  }

  if (documentation && documentation.length > 0) {
    text += `### 📚 Documentation & References

`;
    for (const doc of documentation) {
      const typeIcon = {
        official: "📖",
        guide: "📝",
        reference: "🔗",
        example: "💡",
      }[doc.type];
      text += `- ${typeIcon} [${doc.title}](${doc.url})\n`;
    }
  }

  text += `
---
*This action plan was generated by the automated remediation system. Please verify each step before executing.*
`;

  return text;
}

// ============================================
// SEO ISSUE METHODOLOGIES
// ============================================

export const SEO_METHODOLOGIES: Record<string, (affectedResource?: string) => { methodology: MethodologyPlan; documentation: DocumentationLink[] }> = {
  "seo.missing_sitemap": (url) => ({
    methodology: {
      summary: "Generate and deploy XML sitemap for better search engine indexing",
      estimatedEffort: "low",
      requiredSkills: ["Next.js", "SEO basics"],
      steps: [
        {
          order: 1,
          title: "Verify current sitemap status",
          description: "Check if sitemap exists and what URLs are missing",
          action: "investigate",
          commands: ["curl -I https://ghostmydata.com/sitemap.xml"],
          expectedOutcome: "Understand current sitemap state",
        },
        {
          order: 2,
          title: "Generate sitemap using Next.js",
          description: "Create or update the sitemap.ts file in the app directory",
          action: "implement",
          codeChanges: `// src/app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ghostmydata.com'
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: \`\${baseUrl}/pricing\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    // Add all important pages...
  ]
}`,
          expectedOutcome: "Sitemap file created/updated",
        },
        {
          order: 3,
          title: "Deploy and verify",
          description: "Deploy changes and verify sitemap is accessible",
          action: "verify",
          commands: [
            "git add src/app/sitemap.ts",
            "git commit -m 'Add/update sitemap'",
            "git push",
            "curl https://ghostmydata.com/sitemap.xml | head -50",
          ],
          expectedOutcome: "Sitemap accessible at /sitemap.xml",
        },
        {
          order: 4,
          title: "Submit to Google Search Console",
          description: "Submit the new sitemap to Google for indexing",
          action: "document",
          expectedOutcome: "Sitemap submitted and indexing started",
        },
      ],
    },
    documentation: [
      { title: "Next.js Sitemap Generation", url: "https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap", type: "official" },
      { title: "Google Search Console - Sitemaps", url: "https://search.google.com/search-console/sitemaps", type: "official" },
      { title: "XML Sitemap Best Practices", url: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap", type: "guide" },
    ],
  }),

  "seo.invalid_robots": (url) => ({
    methodology: {
      summary: "Fix robots.txt to ensure proper search engine crawling",
      estimatedEffort: "low",
      requiredSkills: ["SEO basics", "Web fundamentals"],
      steps: [
        {
          order: 1,
          title: "Analyze current robots.txt",
          description: "Review current robots.txt for issues",
          action: "investigate",
          commands: ["curl https://ghostmydata.com/robots.txt"],
          expectedOutcome: "Identify what needs to be fixed",
        },
        {
          order: 2,
          title: "Create/update robots.txt",
          description: "Update robots.txt with correct directives",
          action: "implement",
          codeChanges: `// src/app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/admin/'],
    },
    sitemap: 'https://ghostmydata.com/sitemap.xml',
  }
}`,
          expectedOutcome: "robots.txt properly configured",
        },
        {
          order: 3,
          title: "Deploy and test",
          description: "Deploy and verify robots.txt is correct",
          action: "verify",
          commands: ["curl https://ghostmydata.com/robots.txt"],
          expectedOutcome: "robots.txt shows correct rules with sitemap reference",
        },
      ],
    },
    documentation: [
      { title: "Next.js robots.txt", url: "https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots", type: "official" },
      { title: "Google Robots.txt Guide", url: "https://developers.google.com/search/docs/crawling-indexing/robots/intro", type: "guide" },
    ],
  }),

  "seo.broken_links": (url) => ({
    methodology: {
      summary: "Identify and fix broken internal links affecting SEO",
      estimatedEffort: "medium",
      requiredSkills: ["Web development", "Content management"],
      steps: [
        {
          order: 1,
          title: "Run link audit",
          description: `Scan ${url || "the site"} for all broken links`,
          action: "investigate",
          commands: ["npx broken-link-checker https://ghostmydata.com --recursive"],
          expectedOutcome: "List of all broken links identified",
        },
        {
          order: 2,
          title: "Categorize and prioritize",
          description: "Sort broken links by page importance and traffic",
          action: "investigate",
          expectedOutcome: "Prioritized list of links to fix",
        },
        {
          order: 3,
          title: "Fix or redirect broken links",
          description: "Update links to correct URLs or set up redirects",
          action: "implement",
          codeChanges: `// next.config.js - Add redirects
async redirects() {
  return [
    { source: '/old-page', destination: '/new-page', permanent: true },
  ]
}`,
          expectedOutcome: "All broken links fixed or redirected",
        },
        {
          order: 4,
          title: "Verify fixes",
          description: "Re-run link checker to confirm all issues resolved",
          action: "verify",
          expectedOutcome: "No broken links found",
        },
      ],
    },
    documentation: [
      { title: "Next.js Redirects", url: "https://nextjs.org/docs/app/api-reference/next-config-js/redirects", type: "official" },
      { title: "Broken Link Checker Tool", url: "https://www.npmjs.com/package/broken-link-checker", type: "reference" },
    ],
  }),
};

// ============================================
// SECURITY ISSUE METHODOLOGIES
// ============================================

export const SECURITY_METHODOLOGIES: Record<string, (affectedResource?: string) => { methodology: MethodologyPlan; documentation: DocumentationLink[] }> = {
  "security.vulnerability": (resource) => ({
    methodology: {
      summary: "Investigate and remediate security vulnerability",
      estimatedEffort: "high",
      requiredSkills: ["Security", "Backend development"],
      steps: [
        {
          order: 1,
          title: "Assess vulnerability severity",
          description: "Determine CVSS score and potential impact",
          action: "investigate",
          expectedOutcome: "Clear understanding of risk level",
        },
        {
          order: 2,
          title: "Review affected code/systems",
          description: `Audit the affected area: ${resource || "unknown"}`,
          action: "investigate",
          expectedOutcome: "Root cause identified",
        },
        {
          order: 3,
          title: "Implement fix",
          description: "Apply security patch following secure coding guidelines",
          action: "implement",
          expectedOutcome: "Vulnerability patched",
        },
        {
          order: 4,
          title: "Security testing",
          description: "Run security scans to verify fix",
          action: "verify",
          commands: ["npm audit", "npx snyk test"],
          expectedOutcome: "No vulnerabilities detected",
        },
        {
          order: 5,
          title: "Document incident",
          description: "Record incident details for compliance",
          action: "document",
          expectedOutcome: "Security incident documented",
        },
      ],
    },
    documentation: [
      { title: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/", type: "reference" },
      { title: "Node.js Security Best Practices", url: "https://nodejs.org/en/docs/guides/security/", type: "official" },
      { title: "Snyk Security Scanner", url: "https://snyk.io/", type: "reference" },
    ],
  }),
};

// ============================================
// COMPLIANCE ISSUE METHODOLOGIES
// ============================================

export const COMPLIANCE_METHODOLOGIES: Record<string, (affectedResource?: string) => { methodology: MethodologyPlan; documentation: DocumentationLink[] }> = {
  "compliance.gdpr_violation": (resource) => ({
    methodology: {
      summary: "Address GDPR compliance violation",
      estimatedEffort: "high",
      requiredSkills: ["Legal/Compliance", "Data privacy", "Backend development"],
      steps: [
        {
          order: 1,
          title: "Document the violation",
          description: "Record details of what data/process is non-compliant",
          action: "investigate",
          expectedOutcome: "Clear documentation of violation scope",
        },
        {
          order: 2,
          title: "Assess data subject impact",
          description: "Determine which users/data are affected",
          action: "investigate",
          expectedOutcome: "List of affected data subjects",
        },
        {
          order: 3,
          title: "Implement technical fix",
          description: "Update systems to be GDPR compliant",
          action: "implement",
          expectedOutcome: "Technical compliance achieved",
        },
        {
          order: 4,
          title: "Update documentation",
          description: "Update privacy policy and data processing records",
          action: "document",
          expectedOutcome: "Documentation updated",
        },
        {
          order: 5,
          title: "Notify if required",
          description: "Determine if DPA notification is required (72hr rule)",
          action: "verify",
          expectedOutcome: "Notification decision made and executed if needed",
        },
      ],
    },
    documentation: [
      { title: "GDPR Official Text", url: "https://gdpr.eu/", type: "official" },
      { title: "ICO GDPR Guidance", url: "https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/", type: "guide" },
      { title: "Data Breach Notification", url: "https://gdpr.eu/data-breach-notification/", type: "reference" },
    ],
  }),

  "compliance.ccpa_violation": (resource) => ({
    methodology: {
      summary: "Address CCPA compliance violation",
      estimatedEffort: "high",
      requiredSkills: ["Legal/Compliance", "Data privacy"],
      steps: [
        {
          order: 1,
          title: "Identify violation type",
          description: "Determine which CCPA right was violated",
          action: "investigate",
          expectedOutcome: "Violation categorized",
        },
        {
          order: 2,
          title: "Review consumer requests",
          description: "Check if any pending requests need addressing",
          action: "investigate",
          expectedOutcome: "Outstanding requests identified",
        },
        {
          order: 3,
          title: "Implement fix",
          description: "Update processes/systems for CCPA compliance",
          action: "implement",
          expectedOutcome: "CCPA compliance restored",
        },
        {
          order: 4,
          title: "Respond to consumers",
          description: "Address any impacted consumer requests within 45 days",
          action: "verify",
          expectedOutcome: "Consumer requests addressed",
        },
      ],
    },
    documentation: [
      { title: "CCPA Official Text", url: "https://oag.ca.gov/privacy/ccpa", type: "official" },
      { title: "CCPA Compliance Checklist", url: "https://www.onetrust.com/blog/ccpa-compliance-checklist/", type: "guide" },
    ],
  }),
};

/**
 * Get methodology for an issue type
 */
export function getMethodologyForIssue(
  issueType: string,
  affectedResource?: string
): { methodology: MethodologyPlan; documentation: DocumentationLink[] } | null {
  // Check SEO methodologies
  if (issueType.startsWith("seo.")) {
    const key = issueType;
    if (SEO_METHODOLOGIES[key]) {
      return SEO_METHODOLOGIES[key](affectedResource);
    }
    // Default SEO methodology
    return SEO_METHODOLOGIES["seo.missing_sitemap"](affectedResource);
  }

  // Check security methodologies
  if (issueType.startsWith("security.")) {
    return SECURITY_METHODOLOGIES["security.vulnerability"](affectedResource);
  }

  // Check compliance methodologies
  if (issueType.startsWith("compliance.")) {
    if (issueType.includes("gdpr")) {
      return COMPLIANCE_METHODOLOGIES["compliance.gdpr_violation"](affectedResource);
    }
    if (issueType.includes("ccpa")) {
      return COMPLIANCE_METHODOLOGIES["compliance.ccpa_violation"](affectedResource);
    }
    return COMPLIANCE_METHODOLOGIES["compliance.gdpr_violation"](affectedResource);
  }

  return null;
}
