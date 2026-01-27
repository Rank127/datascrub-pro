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
    urgentTickets,
    resolvedToday,
    avgResolutionTime: avgHours,
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
