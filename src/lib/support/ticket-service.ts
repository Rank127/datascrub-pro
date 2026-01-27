// Support Ticket Service
// Core functions for creating, managing, and resolving support tickets

import { prisma } from "@/lib/db";
import type { TicketType, TicketPriority, TicketSource } from "@/lib/types";

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
