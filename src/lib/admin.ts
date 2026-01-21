// Admin access configuration
// Admin users bypass all plan restrictions and have full access

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);

/**
 * Check if an email has admin privileges
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Check if user has access to a feature (either by plan or admin status)
 */
export function hasFeatureAccess(
  email: string | null | undefined,
  userPlan: string,
  requiredPlan: "FREE" | "PRO" | "ENTERPRISE"
): boolean {
  // Admins have full access
  if (isAdmin(email)) return true;

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
 * Get effective plan for a user (admins get ENTERPRISE)
 */
export function getEffectivePlan(email: string | null | undefined, actualPlan: string): string {
  if (isAdmin(email)) return "ENTERPRISE";
  return actualPlan;
}
