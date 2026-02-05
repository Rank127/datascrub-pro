/**
 * Secure Cron Authentication
 *
 * SECURITY: This module enforces authentication for all cron endpoints.
 * - CRON_SECRET must be set in all environments
 * - Fails closed: If secret is not configured, access is DENIED
 * - Logs all authentication attempts for security auditing
 */

export interface CronAuthResult {
  authorized: boolean;
  reason: string;
}

/**
 * Verify cron request authentication
 * @param request - The incoming request
 * @returns Authorization result with reason
 */
export function verifyCronAuth(request: Request): CronAuthResult {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // SECURITY: Fail closed - if secret not configured, deny access
  if (!cronSecret) {
    console.error("[Cron Auth] SECURITY: CRON_SECRET not configured - access denied");
    return {
      authorized: false,
      reason: "CRON_SECRET not configured",
    };
  }

  // Check for missing auth header
  if (!authHeader) {
    return {
      authorized: false,
      reason: "Missing authorization header",
    };
  }

  // Validate bearer token
  const expectedToken = `Bearer ${cronSecret}`;
  if (authHeader !== expectedToken) {
    console.warn("[Cron Auth] Invalid token attempt");
    return {
      authorized: false,
      reason: "Invalid authorization token",
    };
  }

  return {
    authorized: true,
    reason: "Authenticated",
  };
}

/**
 * Helper to create unauthorized response
 */
export function cronUnauthorizedResponse(reason: string): Response {
  return new Response(JSON.stringify({ error: "Unauthorized", reason }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
