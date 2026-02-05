/**
 * Security Scan Cron Job
 *
 * Runs daily to:
 * 1. Detect security threats
 * 2. Monitor suspicious activity
 * 3. Prevent fraud
 * 4. Check system security configuration
 * 5. Generate security reports
 *
 * Schedule: Daily at 2 AM UTC (configured in vercel.json)
 */

import { NextResponse } from "next/server";
import { logCronExecution } from "@/lib/cron-logger";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";
import {
  detectThreats,
  preventFraud,
  getSecurityAgent,
} from "@/lib/agents/security-agent";
import { prisma } from "@/lib/db";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

const JOB_NAME = "security-scan";

// Security configuration checks
interface SecurityConfigCheck {
  name: string;
  status: "PASS" | "FAIL" | "WARN";
  message: string;
}

async function checkSecurityConfiguration(): Promise<SecurityConfigCheck[]> {
  const checks: SecurityConfigCheck[] = [];

  // Check CRON_SECRET is configured
  checks.push({
    name: "CRON_SECRET",
    status: process.env.CRON_SECRET ? "PASS" : "FAIL",
    message: process.env.CRON_SECRET
      ? "Cron authentication configured"
      : "CRON_SECRET not set - cron endpoints are vulnerable",
  });

  // Check Upstash Redis is configured
  const upstashConfigured = !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
  checks.push({
    name: "UPSTASH_REDIS",
    status: upstashConfigured ? "PASS" : "WARN",
    message: upstashConfigured
      ? "Upstash Redis configured for rate limiting"
      : "Upstash Redis not configured - using in-memory fallback",
  });

  // Check admin IP allowlist
  const ipAllowlist = process.env.ADMIN_IP_ALLOWLIST;
  checks.push({
    name: "ADMIN_IP_ALLOWLIST",
    status: ipAllowlist ? "PASS" : "WARN",
    message: ipAllowlist
      ? `Admin IP allowlist configured (${ipAllowlist.split(",").length} IPs)`
      : "Admin IP allowlist not configured - all IPs can access admin",
  });

  // Check encryption key
  checks.push({
    name: "ENCRYPTION_KEY",
    status: process.env.ENCRYPTION_KEY ? "PASS" : "FAIL",
    message: process.env.ENCRYPTION_KEY
      ? "Encryption key configured"
      : "ENCRYPTION_KEY not set - data encryption will fail",
  });

  // Check NextAuth secret
  checks.push({
    name: "NEXTAUTH_SECRET",
    status: process.env.NEXTAUTH_SECRET ? "PASS" : "FAIL",
    message: process.env.NEXTAUTH_SECRET
      ? "NextAuth secret configured"
      : "NEXTAUTH_SECRET not set - sessions are insecure",
  });

  // Check Stripe webhook secret
  checks.push({
    name: "STRIPE_WEBHOOK_SECRET",
    status: process.env.STRIPE_WEBHOOK_SECRET ? "PASS" : "WARN",
    message: process.env.STRIPE_WEBHOOK_SECRET
      ? "Stripe webhook signature verification enabled"
      : "STRIPE_WEBHOOK_SECRET not set - webhooks cannot be verified",
  });

  // Check 2FA enforcement for admins
  const adminsWithout2FA = await prisma.user.count({
    where: {
      role: { in: ["ADMIN", "SUPER_ADMIN"] },
      twoFactorEnabled: false,
    },
  });
  checks.push({
    name: "ADMIN_2FA",
    status: adminsWithout2FA === 0 ? "PASS" : "WARN",
    message:
      adminsWithout2FA === 0
        ? "All admins have 2FA enabled"
        : `${adminsWithout2FA} admin(s) do not have 2FA enabled`,
  });

  return checks;
}

export async function GET(request: Request) {
  // SECURITY: Verify cron authorization
  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return cronUnauthorizedResponse(authResult.reason);
  }

  const startTime = Date.now();

  try {
    console.log(`[${JOB_NAME}] Starting daily security scan...`);

    // Step 1: Check security configuration
    console.log(`[${JOB_NAME}] Checking security configuration...`);
    const configChecks = await checkSecurityConfiguration();
    const configFailures = configChecks.filter((c) => c.status === "FAIL");
    const configWarnings = configChecks.filter((c) => c.status === "WARN");

    if (configFailures.length > 0) {
      console.error(
        `[${JOB_NAME}] CRITICAL: ${configFailures.length} security config failures!`
      );
      for (const failure of configFailures) {
        console.error(`  - ${failure.name}: ${failure.message}`);
      }
    }

    // Step 2: Detect security threats
    console.log(`[${JOB_NAME}] Running threat detection...`);
    let threats: Awaited<ReturnType<typeof detectThreats>> | null = null;
    try {
      threats = await detectThreats("day");
      if (threats?.summary?.critical > 0 || threats?.summary?.high > 0) {
        console.warn(
          `[${JOB_NAME}] Security threats detected: ${threats.summary.critical} critical, ${threats.summary.high} high`
        );
      }
    } catch (threatError) {
      console.error(`[${JOB_NAME}] Threat detection failed:`, threatError);
    }

    // Step 3: Fraud prevention scan
    console.log(`[${JOB_NAME}] Running fraud prevention scan...`);
    let fraud: Awaited<ReturnType<typeof preventFraud>> | null = null;
    try {
      fraud = await preventFraud("scan");
      if (fraud?.flagged?.length > 0) {
        console.log(`[${JOB_NAME}] ${fraud.flagged.length} accounts flagged for fraud`);
      }
    } catch (fraudError) {
      console.error(`[${JOB_NAME}] Fraud prevention failed:`, fraudError);
    }

    // Step 4: Log security events
    const securityEvents = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM "AuditLog"
      WHERE action LIKE '%FAILED%'
      AND "timestamp" >= NOW() - INTERVAL '24 hours'
    `;
    const failedEvents = Number(securityEvents[0]?.count || 0);

    // Step 5: Check for suspicious patterns
    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    // Check for rapid account creation from same email patterns
    const emailDomains = recentUsers.map((u) => u.email.split("@")[1]);
    const domainCounts = emailDomains.reduce(
      (acc, domain) => {
        acc[domain] = (acc[domain] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const suspiciousDomains = Object.entries(domainCounts)
      .filter(([, count]) => count > 5)
      .map(([domain, count]) => ({ domain, count }));

    const duration = Date.now() - startTime;

    // Generate summary
    const summary = {
      configStatus: {
        total: configChecks.length,
        passed: configChecks.filter((c) => c.status === "PASS").length,
        warnings: configWarnings.length,
        failures: configFailures.length,
      },
      threats: {
        total: threats?.threats?.length ?? 0,
        critical: threats?.summary?.critical ?? 0,
        high: threats?.summary?.high ?? 0,
        medium: threats?.summary?.medium ?? 0,
        low: threats?.summary?.low ?? 0,
      },
      fraud: {
        analyzed: fraud?.analyzed ?? 0,
        flagged: fraud?.flagged?.length ?? 0,
        blocked: fraud?.flagged?.filter((f) => f.status === "BLOCKED").length ?? 0,
      },
      activity: {
        failedEvents,
        newUsers: recentUsers.length,
        suspiciousDomains: suspiciousDomains.length,
      },
    };

    // Log the execution
    const hasCriticalIssues = configFailures.length > 0 || (threats?.summary?.critical ?? 0) > 0;
    await logCronExecution({
      jobName: JOB_NAME,
      status: hasCriticalIssues ? "FAILED" : "SUCCESS",
      duration,
      message: `Config: ${summary.configStatus.passed}/${summary.configStatus.total} passed, Threats: ${summary.threats.total} detected, Fraud: ${summary.fraud.flagged} flagged`,
      metadata: summary,
    });

    console.log(`[${JOB_NAME}] Complete in ${duration}ms`);

    return NextResponse.json({
      success: true,
      summary,
      configChecks,
      threats: {
        count: threats?.threats?.length ?? 0,
        items: threats?.threats?.slice(0, 10) ?? [],
      },
      fraud: {
        flaggedCount: fraud?.flagged?.length ?? 0,
        items: fraud?.flagged?.slice(0, 10) ?? [],
      },
      suspiciousDomains,
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error(`[${JOB_NAME}] Error:`, error);

    await logCronExecution({
      jobName: JOB_NAME,
      status: "FAILED",
      duration,
      message: `Security scan failed: ${errorMessage}`,
    });

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        duration,
      },
      { status: 500 }
    );
  }
}
