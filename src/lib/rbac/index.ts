// RBAC (Role-Based Access Control) Module
// Exports all role, permission, masking, and audit functionality

export * from "./roles";
export * from "./pii-masking";
export * from "./audit-log";

// Re-export commonly used functions for convenience
export {
  hasPermission,
  canManageRole,
  isStaffRole,
  canViewPII,
  canViewFullPII,
  isValidRole,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  ROLE_DISPLAY_NAMES,
  ROLE_DESCRIPTIONS,
} from "./roles";

export {
  maskEmail,
  maskPhone,
  maskName,
  maskAddress,
  maskUserProfile,
  maskUserListItem,
  shouldMaskField,
} from "./pii-masking";

export {
  logAudit,
  logDataAccess,
  logSecurityEvent,
  logRoleChange,
  logDataDeletion,
  logPIIUnmask,
  getAuditLogs,
} from "./audit-log";
