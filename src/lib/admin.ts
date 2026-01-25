// Admin access configuration
// Integrates with RBAC system for role-based access control

import { Role, hasPermission, isStaffRole, ROLE_HIERARCHY, type Permission } from "./rbac/roles";

// Environment-based role assignments (for initial setup before DB roles)
// Format: email:role,email:role
const ROLE_ASSIGNMENTS = parseRoleAssignments(process.env.ROLE_ASSIGNMENTS || "");

// Legacy support: ADMIN_EMAILS get SUPER_ADMIN role
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

function parseRoleAssignments(assignmentStr: string): Map<string, Role> {
  const assignments = new Map<string, Role>();

  if (!assignmentStr) return assignments;

  assignmentStr.split(",").forEach(assignment => {
    const [email, role] = assignment.trim().split(":").map(s => s.trim().toLowerCase());
    if (email && role) {
      const normalizedRole = role.toUpperCase() as Role;
      if (Object.keys(ROLE_HIERARCHY).includes(normalizedRole)) {
        assignments.set(email, normalizedRole);
      }
    }
  });

  return assignments;
}

/**
 * Get the role for a user based on email (env-based assignment)
 * This is used as a fallback when role is not set in the database
 */
export function getEnvBasedRole(email: string | null | undefined): Role {
  if (!email) return "USER";

  const normalizedEmail = email.toLowerCase();

  // Check explicit role assignments first
  const assignedRole = ROLE_ASSIGNMENTS.get(normalizedEmail);
  if (assignedRole) return assignedRole;

  // Legacy support: ADMIN_EMAILS get SUPER_ADMIN
  if (ADMIN_EMAILS.includes(normalizedEmail)) {
    return "SUPER_ADMIN";
  }

  return "USER";
}

/**
 * Check if an email has admin privileges (ADMIN or higher)
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const role = getEnvBasedRole(email);
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.ADMIN;
}

/**
 * Check if an email has staff privileges (any non-USER role)
 */
export function isStaff(email: string | null | undefined): boolean {
  if (!email) return false;
  const role = getEnvBasedRole(email);
  return isStaffRole(role);
}

/**
 * Check if user has access to a feature (either by plan or role status)
 */
export function hasFeatureAccess(
  email: string | null | undefined,
  userPlan: string,
  requiredPlan: "FREE" | "PRO" | "ENTERPRISE"
): boolean {
  // Staff roles have full feature access
  if (isStaff(email)) return true;

  // Plan hierarchy: ENTERPRISE > PRO > FREE
  const planLevel: Record<string, number> = {
    FREE: 0,
    PRO: 1,
    ENTERPRISE: 2,
  };

  const userLevel = planLevel[userPlan] ?? 0;
  const requiredLevel = planLevel[requiredPlan] ?? 0;

  return userLevel >= requiredLevel;
}

/**
 * Get effective plan for a user (staff get ENTERPRISE features)
 */
export function getEffectivePlan(email: string | null | undefined, actualPlan: string): string {
  if (isStaff(email)) return "ENTERPRISE";
  return actualPlan;
}

/**
 * Check if user has a specific permission based on their role
 */
export function checkPermission(
  email: string | null | undefined,
  dbRole: string | null | undefined,
  permission: Permission
): boolean {
  // Use database role if available, otherwise fall back to env-based
  const role = (dbRole as Role) || getEnvBasedRole(email);
  return hasPermission(role, permission);
}

/**
 * Get the effective role for a user
 * ADMIN_EMAILS always grants SUPER_ADMIN (for bootstrap access)
 * Otherwise, DB role takes precedence, then falls back to env-based role
 */
export function getEffectiveRole(
  email: string | null | undefined,
  dbRole: string | null | undefined
): Role {
  // ADMIN_EMAILS always grants SUPER_ADMIN (bootstrap override)
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
    return "SUPER_ADMIN";
  }

  if (dbRole && Object.keys(ROLE_HIERARCHY).includes(dbRole)) {
    return dbRole as Role;
  }
  return getEnvBasedRole(email);
}
