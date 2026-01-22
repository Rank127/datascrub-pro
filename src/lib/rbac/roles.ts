// Role-Based Access Control (RBAC) System
// Defines roles, permissions, and access control for GhostMyData

export type Role =
  | "USER"           // Regular customer - can only access own data
  | "SEO_MANAGER"    // Marketing/SEO - blog, analytics, no user PII
  | "SUPPORT"        // Customer support - masked PII, can view user issues
  | "ADMIN"          // Admin - user management, masked PII
  | "LEGAL"          // Legal/Privacy/DPO - full PII for compliance requests
  | "SUPER_ADMIN";   // Owner - full system access

export type Permission =
  // User data permissions
  | "view_own_data"
  | "view_users_list"
  | "view_user_details"
  | "view_masked_pii"
  | "view_full_pii"
  | "unmask_pii"
  | "export_user_data"
  | "delete_user_data"

  // User management
  | "create_user"
  | "modify_user"
  | "delete_user"
  | "modify_user_role"
  | "modify_user_plan"

  // Content management
  | "manage_blog"
  | "manage_seo"
  | "view_analytics"

  // System administration
  | "view_audit_logs"
  | "manage_system_config"
  | "view_error_logs"

  // Support actions
  | "respond_to_tickets"
  | "escalate_issues"
  | "send_user_emails";

// Permission matrix by role
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  USER: [
    "view_own_data",
  ],

  SEO_MANAGER: [
    "view_own_data",
    "manage_blog",
    "manage_seo",
    "view_analytics",
  ],

  SUPPORT: [
    "view_own_data",
    "view_users_list",
    "view_user_details",
    "view_masked_pii",
    "respond_to_tickets",
    "escalate_issues",
    "send_user_emails",
  ],

  ADMIN: [
    "view_own_data",
    "view_users_list",
    "view_user_details",
    "view_masked_pii",
    "create_user",
    "modify_user",
    "modify_user_plan",
    "respond_to_tickets",
    "escalate_issues",
    "send_user_emails",
    "view_analytics",
    "view_audit_logs",
  ],

  LEGAL: [
    "view_own_data",
    "view_users_list",
    "view_user_details",
    "view_masked_pii",
    "view_full_pii",
    "unmask_pii",
    "export_user_data",
    "delete_user_data",
    "view_audit_logs",
  ],

  SUPER_ADMIN: [
    "view_own_data",
    "view_users_list",
    "view_user_details",
    "view_masked_pii",
    "view_full_pii",
    "unmask_pii",
    "export_user_data",
    "delete_user_data",
    "create_user",
    "modify_user",
    "delete_user",
    "modify_user_role",
    "modify_user_plan",
    "manage_blog",
    "manage_seo",
    "view_analytics",
    "view_audit_logs",
    "manage_system_config",
    "view_error_logs",
    "respond_to_tickets",
    "escalate_issues",
    "send_user_emails",
  ],
};

// Role hierarchy (higher number = more privileges)
export const ROLE_HIERARCHY: Record<Role, number> = {
  USER: 0,
  SEO_MANAGER: 1,
  SUPPORT: 2,
  ADMIN: 3,
  LEGAL: 4,
  SUPER_ADMIN: 5,
};

// Role display names
export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  USER: "User",
  SEO_MANAGER: "SEO Manager",
  SUPPORT: "Support",
  ADMIN: "Administrator",
  LEGAL: "Legal/Privacy/DPO",
  SUPER_ADMIN: "Super Administrator",
};

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  USER: "Regular customer with access to own data only",
  SEO_MANAGER: "Marketing and SEO team member - no access to user PII",
  SUPPORT: "Customer support - can view masked user data and respond to tickets",
  ADMIN: "Administrator - can manage users and view masked PII",
  LEGAL: "Legal/Privacy/DPO - full PII access for compliance and deletion requests",
  SUPER_ADMIN: "Full system access - owner only",
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions?.includes(permission) ?? false;
}

/**
 * Check if a role can access another role's level
 */
export function canManageRole(actorRole: Role, targetRole: Role): boolean {
  // Only SUPER_ADMIN can manage SUPER_ADMIN
  if (targetRole === "SUPER_ADMIN") {
    return actorRole === "SUPER_ADMIN";
  }

  // Must have higher hierarchy to manage
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
}

/**
 * Check if role is a staff role (not a regular user)
 */
export function isStaffRole(role: Role): boolean {
  return role !== "USER";
}

/**
 * Check if role can view PII (even masked)
 */
export function canViewPII(role: Role): boolean {
  return hasPermission(role, "view_masked_pii") || hasPermission(role, "view_full_pii");
}

/**
 * Check if role can view full (unmasked) PII
 */
export function canViewFullPII(role: Role): boolean {
  return hasPermission(role, "view_full_pii");
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Validate if a string is a valid role
 */
export function isValidRole(role: string): role is Role {
  return Object.keys(ROLE_PERMISSIONS).includes(role);
}
