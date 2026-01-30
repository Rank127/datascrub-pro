// Audit Logging System
// Tracks all data access and modifications for security and compliance

import { prisma } from "@/lib/db";
import { maskEmail } from "./pii-masking";

export type AuditAction =
  // Data viewing
  | "VIEW_USER_LIST"
  | "VIEW_USER_DETAILS"
  | "VIEW_MASKED_PII"
  | "VIEW_FULL_PII"
  | "UNMASK_PII"

  // Data export
  | "EXPORT_USER_DATA"
  | "EXPORT_ALL_USERS"
  | "DOWNLOAD_REPORT"

  // Data modification
  | "CREATE_USER"
  | "MODIFY_USER"
  | "DELETE_USER"
  | "DELETE_USER_DATA"

  // Role/Permission changes
  | "MODIFY_USER_ROLE"
  | "MODIFY_USER_PLAN"
  | "GRANT_PERMISSION"
  | "REVOKE_PERMISSION"

  // Plan/Subscription changes
  | "UPDATE_USER_PLAN"
  | "PLAN_UPGRADE"
  | "PLAN_DOWNGRADE"
  | "SUBSCRIPTION_CANCELED"
  | "SUBSCRIPTION_UPDATED"

  // Authentication
  | "LOGIN"
  | "LOGOUT"
  | "LOGIN_FAILED"
  | "PASSWORD_RESET"

  // Admin actions
  | "ACCESS_ADMIN_PANEL"
  | "VIEW_AUDIT_LOGS"
  | "MODIFY_SYSTEM_CONFIG"

  // Support actions
  | "VIEW_SUPPORT_TICKET"
  | "VIEW_SUPPORT_TICKETS"
  | "VIEW_SUPPORT_STATS"
  | "CREATE_SUPPORT_TICKET"
  | "UPDATE_SUPPORT_TICKET"
  | "RESPOND_TO_TICKET"
  | "SEND_USER_EMAIL"
  | "ADD_TICKET_COMMENT"
  | "EXECUTE_AUTO_FIX"
  | "APPROVE_AI_DRAFT"
  | "REJECT_AI_DRAFT";

export interface AuditLogEntry {
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  targetUserId?: string;
  targetEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  success?: boolean;
  errorMessage?: string;
}

/**
 * Log an audit event
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId,
        actorEmail: entry.actorEmail,
        actorRole: entry.actorRole,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId || null,
        targetUserId: entry.targetUserId || null,
        targetEmail: entry.targetEmail ? maskEmail(entry.targetEmail) : null,
        ipAddress: entry.ipAddress || null,
        userAgent: entry.userAgent || null,
        details: entry.details ? JSON.stringify(entry.details) : null,
        success: entry.success ?? true,
        errorMessage: entry.errorMessage || null,
      },
    });
  } catch (error) {
    // Don't let audit logging failures break the application
    console.error("Failed to write audit log:", error);
  }
}

/**
 * Log a data access event
 */
export async function logDataAccess(
  actor: { id: string; email: string; role: string },
  action: AuditAction,
  resource: string,
  resourceId?: string,
  targetUser?: { id: string; email: string },
  request?: Request
): Promise<void> {
  await logAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action,
    resource,
    resourceId,
    targetUserId: targetUser?.id,
    targetEmail: targetUser?.email,
    ipAddress: getClientIP(request),
    userAgent: request?.headers.get("user-agent") || undefined,
  });
}

/**
 * Log a security event (login, logout, etc.)
 */
export async function logSecurityEvent(
  actorId: string,
  actorEmail: string,
  action: AuditAction,
  success: boolean,
  request?: Request,
  errorMessage?: string
): Promise<void> {
  await logAudit({
    actorId,
    actorEmail,
    actorRole: "USER", // Role may not be known at login time
    action,
    resource: "auth",
    success,
    errorMessage,
    ipAddress: getClientIP(request),
    userAgent: request?.headers.get("user-agent") || undefined,
  });
}

/**
 * Log a role/permission change
 */
export async function logRoleChange(
  actor: { id: string; email: string; role: string },
  targetUser: { id: string; email: string },
  oldRole: string,
  newRole: string,
  request?: Request
): Promise<void> {
  await logAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: "MODIFY_USER_ROLE",
    resource: "users",
    resourceId: targetUser.id,
    targetUserId: targetUser.id,
    targetEmail: targetUser.email,
    details: { oldRole, newRole },
    ipAddress: getClientIP(request),
    userAgent: request?.headers.get("user-agent") || undefined,
  });
}

/**
 * Log a data deletion event
 */
export async function logDataDeletion(
  actor: { id: string; email: string; role: string },
  targetUser: { id: string; email: string },
  dataType: string,
  reason: string,
  request?: Request
): Promise<void> {
  await logAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: "DELETE_USER_DATA",
    resource: dataType,
    targetUserId: targetUser.id,
    targetEmail: targetUser.email,
    details: { reason },
    ipAddress: getClientIP(request),
    userAgent: request?.headers.get("user-agent") || undefined,
  });
}

/**
 * Log PII unmask event (important for compliance)
 */
export async function logPIIUnmask(
  actor: { id: string; email: string; role: string },
  targetUser: { id: string; email: string },
  fields: string[],
  reason: string,
  request?: Request
): Promise<void> {
  await logAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: "UNMASK_PII",
    resource: "pii",
    targetUserId: targetUser.id,
    targetEmail: targetUser.email,
    details: { fields, reason },
    ipAddress: getClientIP(request),
    userAgent: request?.headers.get("user-agent") || undefined,
  });
}

/**
 * Get audit logs with filtering
 */
export async function getAuditLogs(options: {
  actorId?: string;
  targetUserId?: string;
  action?: AuditAction;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, unknown> = {};

  if (options.actorId) where.actorId = options.actorId;
  if (options.targetUserId) where.targetUserId = options.targetUserId;
  if (options.action) where.action = options.action;
  if (options.resource) where.resource = options.resource;

  if (options.startDate || options.endDate) {
    where.createdAt = {};
    if (options.startDate) (where.createdAt as Record<string, Date>).gte = options.startDate;
    if (options.endDate) (where.createdAt as Record<string, Date>).lte = options.endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options.limit || 50,
      skip: options.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
}

/**
 * Get audit logs for a specific user (what was done TO them)
 */
export async function getUserAuditTrail(userId: string, limit = 100) {
  return prisma.auditLog.findMany({
    where: { targetUserId: userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Get audit logs by a specific actor (what they did)
 */
export async function getActorAuditTrail(actorId: string, limit = 100) {
  return prisma.auditLog.findMany({
    where: { actorId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Extract client IP from request
 */
function getClientIP(request?: Request): string | undefined {
  if (!request) return undefined;

  // Check common headers for proxied requests
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;

  return undefined;
}

/**
 * Clean up old audit logs (retention policy)
 */
export async function cleanupOldAuditLogs(retentionDays = 365): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
    },
  });

  return result.count;
}
