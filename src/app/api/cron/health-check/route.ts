import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption/crypto";
import { Resend } from "resend";
import { logCronExecution, getCronHealthStatus, cleanupOldCronLogs, getRetriggerCount, logRetriggerAttempt } from "@/lib/cron-logger";
import {
  acquireJobLock,
  releaseJobLock,
  analyzePatternsAndPredict,
  getCoordinatorStatus,
} from "@/lib/agents/intelligence-coordinator";
import { verifyCronAuth, cronUnauthorizedResponse } from "@/lib/cron-auth";
import { reportIssue } from "@/lib/agents/orchestrator/remediation-engine";

export const maxDuration = 300;

const ADMIN_EMAIL = "developer@ghostmydata.com";
const JOB_NAME = "health-check";

// Lazy initialization to avoid build-time errors
function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

interface TestResult {
  name: string;
  status: "PASS" | "FAIL" | "WARN";
  message: string;
  autoFixed?: boolean;
  actionRequired?: string;
}

interface HealthReport {
  timestamp: string;
  overall: "HEALTHY" | "DEGRADED" | "CRITICAL";
  tests: TestResult[];
  summary: {
    passed: number;
    failed: number;
    warnings: number;
    autoFixed: number;
  };
}

export async function GET(request: Request) {
  // SECURITY: Verify cron authorization (fails closed if CRON_SECRET not set)
  const authResult = verifyCronAuth(request);
  if (!authResult.authorized) {
    return cronUnauthorizedResponse(authResult.reason);
  }

  const tests: TestResult[] = [];

  // ========== DATABASE TESTS ==========

  // Test 1: Database Connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    tests.push({
      name: "Database Connection",
      status: "PASS",
      message: "PostgreSQL connection successful",
    });
  } catch (error) {
    tests.push({
      name: "Database Connection",
      status: "FAIL",
      message: `Database connection failed: ${error}`,
      actionRequired: "Check DATABASE_URL and Supabase status",
    });
  }

  // Test 2: User Table Access
  try {
    const userCount = await prisma.user.count();
    tests.push({
      name: "User Table",
      status: "PASS",
      message: `${userCount} users in database`,
    });
  } catch (error) {
    tests.push({
      name: "User Table",
      status: "FAIL",
      message: `Cannot access User table: ${error}`,
      actionRequired: "Run prisma db push to sync schema",
    });
  }

  // Test 3: Check for orphaned records
  try {
    // Find profiles where the userId doesn't exist in User table
    const orphanedProfiles = await prisma.$queryRaw<{count: bigint}[]>`
      SELECT COUNT(*) as count FROM "PersonalProfile" p
      WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = p."userId")
    `;
    const orphanCount = Number(orphanedProfiles[0]?.count || 0);

    if (orphanCount > 0) {
      // Auto-fix: Delete orphaned profiles
      await prisma.$executeRaw`
        DELETE FROM "PersonalProfile" p
        WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = p."userId")
      `;
      tests.push({
        name: "Orphaned Profiles",
        status: "WARN",
        message: `Found and deleted ${orphanCount} orphaned profiles`,
        autoFixed: true,
      });
    } else {
      tests.push({
        name: "Orphaned Profiles",
        status: "PASS",
        message: "No orphaned profiles found",
      });
    }
  } catch (error) {
    tests.push({
      name: "Orphaned Profiles",
      status: "WARN",
      message: `Could not check orphaned profiles: ${error}`,
    });
  }

  // A6: Cascading fix cooldown — let DB settle after orphan cleanup before next read
  await new Promise(r => setTimeout(r, 500));

  // ========== ENCRYPTION TESTS ==========

  // Test 4: Encryption/Decryption
  try {
    const testString = "test-encryption-" + Date.now();
    const encrypted = encrypt(testString);
    const decrypted = decrypt(encrypted);

    if (decrypted === testString) {
      tests.push({
        name: "Encryption System",
        status: "PASS",
        message: "Encryption/decryption working correctly",
      });
    } else {
      tests.push({
        name: "Encryption System",
        status: "FAIL",
        message: "Encryption/decryption mismatch",
        actionRequired: "Check ENCRYPTION_KEY environment variable",
      });
    }
  } catch (error) {
    tests.push({
      name: "Encryption System",
      status: "FAIL",
      message: `Encryption failed: ${error}`,
      actionRequired: "Check ENCRYPTION_KEY environment variable",
    });
  }

  // ========== AUTHENTICATION TESTS ==========

  // Test 5: Auth Configuration
  try {
    const authUrl = process.env.AUTH_URL;
    const authSecret = process.env.AUTH_SECRET;

    if (!authUrl || !authSecret) {
      tests.push({
        name: "Auth Configuration",
        status: "FAIL",
        message: "Missing AUTH_URL or AUTH_SECRET",
        actionRequired: "Set AUTH_URL and AUTH_SECRET in Vercel",
      });
    } else if (!authUrl.includes("ghostmydata.com")) {
      tests.push({
        name: "Auth Configuration",
        status: "WARN",
        message: `AUTH_URL is ${authUrl}, expected ghostmydata.com`,
        actionRequired: "Update AUTH_URL to https://ghostmydata.com",
      });
    } else {
      tests.push({
        name: "Auth Configuration",
        status: "PASS",
        message: "Auth properly configured",
      });
    }
  } catch (error) {
    tests.push({
      name: "Auth Configuration",
      status: "FAIL",
      message: `Auth check failed: ${error}`,
    });
  }

  // ========== EXTERNAL SERVICES TESTS ==========

  // Test 6: Resend Email Service
  try {
    if (!process.env.RESEND_API_KEY) {
      tests.push({
        name: "Email Service (Resend)",
        status: "FAIL",
        message: "RESEND_API_KEY not configured",
        actionRequired: "Set RESEND_API_KEY in Vercel",
      });
    } else {
      // Verify API key by checking API keys endpoint
      const response = await fetch("https://api.resend.com/api-keys", {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
      });

      if (response.ok) {
        tests.push({
          name: "Email Service (Resend)",
          status: "PASS",
          message: "Resend API key valid (full access)",
        });
      } else {
        // Check if it's a restricted "send only" key (which is fine)
        const data = await response.json().catch(() => ({}));
        if (data.name === "restricted_api_key") {
          tests.push({
            name: "Email Service (Resend)",
            status: "PASS",
            message: "Resend API key valid (send-only, secure)",
          });
        } else {
          tests.push({
            name: "Email Service (Resend)",
            status: "FAIL",
            message: "Resend API key invalid or expired",
            actionRequired: "Regenerate RESEND_API_KEY in Resend dashboard",
          });
        }
      }
    }
  } catch (error) {
    tests.push({
      name: "Email Service (Resend)",
      status: "WARN",
      message: `Could not verify Resend: ${error}`,
    });
  }

  // Test 7: Stripe Configuration
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const proPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
    const enterprisePriceId = process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID;

    const missing = [];
    if (!stripeKey) missing.push("STRIPE_SECRET_KEY");
    if (!webhookSecret) missing.push("STRIPE_WEBHOOK_SECRET");
    if (!proPriceId) missing.push("STRIPE_PRO_MONTHLY_PRICE_ID");
    if (!enterprisePriceId) missing.push("STRIPE_ENTERPRISE_MONTHLY_PRICE_ID");

    if (missing.length > 0) {
      tests.push({
        name: "Stripe Configuration",
        status: "FAIL",
        message: `Missing: ${missing.join(", ")}`,
        actionRequired: "Configure missing Stripe environment variables",
      });
    } else {
      tests.push({
        name: "Stripe Configuration",
        status: "PASS",
        message: "All Stripe variables configured",
      });
    }
  } catch (error) {
    tests.push({
      name: "Stripe Configuration",
      status: "FAIL",
      message: `Stripe check failed: ${error}`,
    });
  }

  // Test 8: HIBP API
  try {
    const hibpKey = process.env.HIBP_API_KEY;
    if (!hibpKey) {
      tests.push({
        name: "HIBP API",
        status: "WARN",
        message: "HIBP_API_KEY not configured - breach scanning limited",
        actionRequired: "Add HIBP_API_KEY for full breach scanning",
      });
    } else {
      tests.push({
        name: "HIBP API",
        status: "PASS",
        message: "HIBP API key configured",
      });
    }
  } catch (error) {
    tests.push({
      name: "HIBP API",
      status: "WARN",
      message: `HIBP check failed: ${error}`,
    });
  }

  // Test 8b: Anthropic API (AI Ticketing)
  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      tests.push({
        name: "Anthropic API (AI Ticketing)",
        status: "WARN",
        message: "ANTHROPIC_API_KEY not configured - AI ticket resolution disabled",
        actionRequired: "Add ANTHROPIC_API_KEY for AI-powered ticket resolution",
      });
    } else {
      tests.push({
        name: "Anthropic API (AI Ticketing)",
        status: "PASS",
        message: "Anthropic API key configured",
      });
    }
  } catch (error) {
    tests.push({
      name: "Anthropic API (AI Ticketing)",
      status: "WARN",
      message: `Anthropic check failed: ${error}`,
    });
  }

  // ========== CRON JOB MONITORING ==========

  // Test 8c: Cron Job Execution Status
  // Critical crons that must never miss a run — overdue = FAIL (CRITICAL overall)
  const CRITICAL_CRONS = new Set(["process-removals", "clear-pending-queue", "verify-removals", "health-check"]);

  try {
    const cronStatus = await getCronHealthStatus();
    const overdueJobs = cronStatus.jobs.filter(j => j.isOverdue && j.lastRun);
    const overdueCritical = overdueJobs.filter(j => CRITICAL_CRONS.has(j.name));
    const overdueNonCritical = overdueJobs.filter(j => !CRITICAL_CRONS.has(j.name));

    if (overdueCritical.length > 0) {
      // Auto-remediate: attempt to re-trigger dead critical crons
      const baseUrl = process.env.AUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://ghostmydata.com");
      const cronSecret = process.env.CRON_SECRET;
      const retriggered: string[] = [];
      const retriggerFailed: string[] = [];

      if (cronSecret) {
        for (const job of overdueCritical) {
          // Don't re-trigger health-check (that's us!)
          if (job.name === "health-check") continue;

          // A5: Rate-limit retriggers — max 3 per cron per 24h
          const retriggers = await getRetriggerCount(job.name, 24);
          if (retriggers >= 3) {
            retriggerFailed.push(`${job.name}(rate-limited: ${retriggers}/3 in 24h)`);
            continue;
          }

          try {
            const response = await fetch(`${baseUrl}/api/cron/${job.name}`, {
              method: "GET",
              headers: { Authorization: `Bearer ${cronSecret}` },
              signal: AbortSignal.timeout(10000),
            });
            if (response.ok) {
              retriggered.push(job.name);
              await logRetriggerAttempt(job.name, true);
            } else {
              retriggerFailed.push(`${job.name}(${response.status})`);
              await logRetriggerAttempt(job.name, false);
            }
          } catch (error) {
            retriggerFailed.push(`${job.name}(${error instanceof Error ? error.message : "timeout"})`);
            await logRetriggerAttempt(job.name, false);
          }
        }
      }

      const autoFixNote = retriggered.length > 0
        ? ` Auto-retriggered: ${retriggered.join(", ")}.`
        : "";
      const failNote = retriggerFailed.length > 0
        ? ` Retrigger failed: ${retriggerFailed.join(", ")}.`
        : "";

      tests.push({
        name: "Cron Job Monitoring",
        status: "FAIL",
        message: `${overdueCritical.length} CRITICAL cron(s) overdue: ${overdueCritical.map(j => `${j.name} (last: ${j.lastRun ? Math.floor((Date.now() - j.lastRun.getTime()) / 3600000) + "h ago" : "never"})`).join(", ")}${overdueNonCritical.length > 0 ? `. Also ${overdueNonCritical.length} non-critical overdue.` : ""}${autoFixNote}${failNote}`,
        actionRequired: `CRITICAL: ${overdueCritical.map(j => j.name).join(", ")} stopped running.${retriggered.length > 0 ? " Auto-retrigger attempted." : " Check Vercel logs immediately."}`,
        autoFixed: retriggered.length > 0,
      });

      // Emit remediation events for failed retriggers so the engine can track/escalate
      for (const failedCron of retriggerFailed) {
        const cronName = failedCron.split("(")[0];
        try {
          await reportIssue({
            type: "cron.failed",
            severity: "critical",
            description: `Critical cron "${cronName}" is overdue and retrigger failed`,
            sourceAgentId: "health-check",
            affectedResource: cronName,
            details: { cronName, retriggered: false },
            canAutoRemediate: true,
          });
        } catch { /* non-blocking */ }
      }
    } else if (overdueNonCritical.length > 0) {
      tests.push({
        name: "Cron Job Monitoring",
        status: "WARN",
        message: `${overdueNonCritical.length} non-critical cron(s) overdue: ${overdueNonCritical.map(j => j.name).join(", ")}`,
        actionRequired: "Check Vercel cron configuration and deployment status",
      });
    } else {
      const runningJobs = cronStatus.jobs.filter(j => j.lastRun);
      tests.push({
        name: "Cron Job Monitoring",
        status: "PASS",
        message: `${runningJobs.length} cron jobs tracked, all running on schedule`,
      });
    }

    // Clean up old cron logs
    const cleanedLogs = await cleanupOldCronLogs();
    if (cleanedLogs > 0) {
      console.log(`[Health Check] Cleaned up ${cleanedLogs} old cron logs`);
    }
  } catch (error) {
    tests.push({
      name: "Cron Job Monitoring",
      status: "WARN",
      message: `Could not check cron status: ${error}`,
    });
  }

  // Test 8d: Vercel Deployment Status (optional)
  try {
    const vercelToken = process.env.VERCEL_API_TOKEN;
    const vercelProjectId = process.env.VERCEL_PROJECT_ID;

    if (vercelToken && vercelProjectId) {
      const response = await fetch(
        `https://api.vercel.com/v6/deployments?projectId=${vercelProjectId}&limit=5&state=ERROR`,
        {
          headers: {
            Authorization: `Bearer ${vercelToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const failedDeployments = data.deployments || [];

        if (failedDeployments.length > 0) {
          const recentFailed = failedDeployments[0];
          const failedAt = new Date(recentFailed.created).toLocaleString();
          tests.push({
            name: "Vercel Deployments",
            status: "WARN",
            message: `Recent failed deployment at ${failedAt}`,
            actionRequired: "Check Vercel dashboard for deployment errors",
          });
        } else {
          tests.push({
            name: "Vercel Deployments",
            status: "PASS",
            message: "No recent failed deployments",
          });
        }
      } else {
        tests.push({
          name: "Vercel Deployments",
          status: "WARN",
          message: "Could not fetch Vercel deployment status",
        });
      }
    } else {
      tests.push({
        name: "Vercel Deployments",
        status: "WARN",
        message: "VERCEL_API_TOKEN or VERCEL_PROJECT_ID not configured",
        actionRequired: "Add VERCEL_API_TOKEN and VERCEL_PROJECT_ID to monitor deployments",
      });
    }
  } catch (error) {
    tests.push({
      name: "Vercel Deployments",
      status: "WARN",
      message: `Vercel check failed: ${error}`,
    });
  }

  // ========== DATA INTEGRITY TESTS ==========

  // Test 9: Stuck Scans (running for more than 1 hour)
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const stuckScans = await prisma.scan.findMany({
      where: {
        status: "IN_PROGRESS",
        createdAt: { lt: oneHourAgo },
      },
    });

    if (stuckScans.length > 0) {
      // Auto-fix: Mark stuck scans as failed
      await prisma.scan.updateMany({
        where: {
          id: { in: stuckScans.map(s => s.id) },
        },
        data: {
          status: "FAILED",
          completedAt: new Date(),
        },
      });

      tests.push({
        name: "Stuck Scans",
        status: "WARN",
        message: `Found and marked ${stuckScans.length} stuck scans as FAILED`,
        autoFixed: true,
      });
    } else {
      tests.push({
        name: "Stuck Scans",
        status: "PASS",
        message: "No stuck scans found",
      });
    }
  } catch (error) {
    tests.push({
      name: "Stuck Scans",
      status: "WARN",
      message: `Could not check stuck scans: ${error}`,
    });
  }

  // A6: Cascading fix cooldown — let DB settle after stuck scan updates
  await new Promise(r => setTimeout(r, 500));

  // Test 10: Stuck Removal Requests (pending for more than 7 days) - AUTO-FIX
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const stuckRemovals = await prisma.removalRequest.findMany({
      where: {
        status: "PENDING",
        createdAt: { lt: sevenDaysAgo },
        attempts: { lt: 3 }, // Only try if under attempt limit
      },
      select: { id: true, userId: true },
      take: 10, // Limit batch size for health check
    });

    if (stuckRemovals.length > 0) {
      // Import and use the removal service to auto-process
      const { executeRemoval } = await import("@/lib/removers/removal-service");

      let processed = 0;
      let successful = 0;

      for (const removal of stuckRemovals) {
        try {
          const result = await executeRemoval(removal.id, removal.userId);
          processed++;
          if (result.success && result.method === "AUTO_EMAIL") {
            successful++;
          }
        } catch (e) {
          console.error(`[Health Check] Failed to process stuck removal ${removal.id}:`, e);
        }
      }

      const totalStuck = await prisma.removalRequest.count({
        where: {
          status: "PENDING",
          createdAt: { lt: sevenDaysAgo },
        },
      });

      tests.push({
        name: "Stuck Removal Requests",
        status: totalStuck > processed ? "WARN" : "PASS",
        message: `Auto-processed ${processed} stuck removals (${successful} emails sent). ${totalStuck > processed ? `${totalStuck - processed} remaining.` : "All clear."}`,
        autoFixed: processed > 0,
        actionRequired: totalStuck > processed ? `${totalStuck - processed} stuck removals still need attention` : undefined,
      });
    } else {
      tests.push({
        name: "Stuck Removal Requests",
        status: "PASS",
        message: "No stuck removal requests",
      });
    }
  } catch (error) {
    tests.push({
      name: "Stuck Removal Requests",
      status: "WARN",
      message: `Could not check removals: ${error}`,
    });
  }

  // A6: Cascading fix cooldown — let DB settle after stuck removal processing
  await new Promise(r => setTimeout(r, 500));

  // Test 11: Past Due Subscriptions
  try {
    const pastDueCount = await prisma.subscription.count({
      where: { status: "past_due" },
    });

    if (pastDueCount > 0) {
      tests.push({
        name: "Past Due Subscriptions",
        status: "WARN",
        message: `${pastDueCount} subscriptions are past due`,
        actionRequired: "Review past due subscriptions in Stripe dashboard",
      });
    } else {
      tests.push({
        name: "Past Due Subscriptions",
        status: "PASS",
        message: "No past due subscriptions",
      });
    }
  } catch (error) {
    tests.push({
      name: "Past Due Subscriptions",
      status: "WARN",
      message: `Could not check subscriptions: ${error}`,
    });
  }

  // Test 12: Admin Access
  try {
    const adminEmails = process.env.ADMIN_EMAILS;
    if (!adminEmails) {
      tests.push({
        name: "Admin Configuration",
        status: "WARN",
        message: "ADMIN_EMAILS not configured",
        actionRequired: "Set ADMIN_EMAILS for admin bypass access",
      });
    } else {
      const adminCount = adminEmails.split(",").filter(e => e.trim()).length;
      tests.push({
        name: "Admin Configuration",
        status: "PASS",
        message: `${adminCount} admin email(s) configured`,
      });
    }
  } catch (error) {
    tests.push({
      name: "Admin Configuration",
      status: "WARN",
      message: `Could not check admin config: ${error}`,
    });
  }

  // ========== SECURITY TESTS ==========

  // Test 13: Check for users without password hash
  try {
    const result = await prisma.$queryRaw<{count: bigint}[]>`
      SELECT COUNT(*) as count FROM "User" WHERE "passwordHash" IS NULL
    `;
    const usersWithoutPassword = Number(result[0]?.count || 0);

    if (usersWithoutPassword > 0) {
      tests.push({
        name: "Users Without Password",
        status: "WARN",
        message: `${usersWithoutPassword} users have no password set`,
        actionRequired: "These users may have OAuth accounts or incomplete registration",
      });
    } else {
      tests.push({
        name: "Users Without Password",
        status: "PASS",
        message: "All users have passwords set",
      });
    }
  } catch (error) {
    tests.push({
      name: "Users Without Password",
      status: "WARN",
      message: `Could not check users: ${error}`,
    });
  }

  // Test 14: Expired Subscriptions Still Active
  try {
    const now = new Date();
    const expiredButActive = await prisma.subscription.count({
      where: {
        status: "active",
        stripeCurrentPeriodEnd: { lt: now },
      },
    });

    if (expiredButActive > 0) {
      tests.push({
        name: "Expired Active Subscriptions",
        status: "WARN",
        message: `${expiredButActive} subscriptions expired but still marked active`,
        actionRequired: "Sync subscription status with Stripe",
      });
    } else {
      tests.push({
        name: "Expired Active Subscriptions",
        status: "PASS",
        message: "No subscription status mismatches",
      });
    }
  } catch (error) {
    tests.push({
      name: "Expired Active Subscriptions",
      status: "WARN",
      message: `Could not check expired subscriptions: ${error}`,
    });
  }

  // ========== PERFORMANCE METRICS ==========

  // Test 15: Recent Activity
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentScans = await prisma.scan.count({
      where: { createdAt: { gte: oneDayAgo } },
    });

    const recentUsers = await prisma.user.count({
      where: { createdAt: { gte: oneDayAgo } },
    });

    tests.push({
      name: "Daily Activity",
      status: "PASS",
      message: `Last 24h: ${recentScans} scans, ${recentUsers} new users`,
    });
  } catch (error) {
    tests.push({
      name: "Daily Activity",
      status: "WARN",
      message: `Could not get activity metrics: ${error}`,
    });
  }

  // ========== PREDICTIVE INTELLIGENCE ==========

  // Test 16: Predictive Anomaly Detection
  try {
    const predictions = await analyzePatternsAndPredict();
    const criticalPredictions = predictions.filter(p => p.severity === "CRITICAL");
    const warningPredictions = predictions.filter(p => p.severity === "WARNING");

    if (criticalPredictions.length > 0) {
      tests.push({
        name: "Predictive Intelligence",
        status: "FAIL",
        message: `${criticalPredictions.length} critical anomalies detected: ${criticalPredictions[0].message}`,
        actionRequired: criticalPredictions[0].suggestedAction || "Review critical predictions",
      });
    } else if (warningPredictions.length > 0) {
      tests.push({
        name: "Predictive Intelligence",
        status: "WARN",
        message: `${warningPredictions.length} warnings detected: ${warningPredictions[0].message}`,
      });
    } else {
      tests.push({
        name: "Predictive Intelligence",
        status: "PASS",
        message: `No anomalies detected. ${predictions.length} patterns analyzed.`,
      });
    }
  } catch (error) {
    tests.push({
      name: "Predictive Intelligence",
      status: "WARN",
      message: `Could not run predictive analysis: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }

  // Test 17: Intelligence Coordinator Status
  try {
    const coordinatorStatus = getCoordinatorStatus();

    tests.push({
      name: "Intelligence Coordinator",
      status: "PASS",
      message: `Active locks: ${coordinatorStatus.activeLocks.length}, Insights: ${coordinatorStatus.insightCount}, Broker intel: ${coordinatorStatus.brokerIntelCount}`,
    });
  } catch (error) {
    tests.push({
      name: "Intelligence Coordinator",
      status: "WARN",
      message: `Could not get coordinator status: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }

  // Test 18: Removal Success Rate Trend
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    // Last 7 days
    const recentRemovals = await prisma.removalRequest.groupBy({
      by: ["status"],
      where: { updatedAt: { gte: sevenDaysAgo } },
      _count: true,
    });

    // Previous 7 days (for comparison)
    const previousRemovals = await prisma.removalRequest.groupBy({
      by: ["status"],
      where: { updatedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
      _count: true,
    });

    const recentCompleted = recentRemovals.find(r => r.status === "COMPLETED")?._count || 0;
    const recentFailed = recentRemovals.find(r => r.status === "FAILED")?._count || 0;
    const recentTotal = recentCompleted + recentFailed;
    const recentRate = recentTotal > 0 ? (recentCompleted / recentTotal) * 100 : 100;

    const prevCompleted = previousRemovals.find(r => r.status === "COMPLETED")?._count || 0;
    const prevFailed = previousRemovals.find(r => r.status === "FAILED")?._count || 0;
    const prevTotal = prevCompleted + prevFailed;
    const prevRate = prevTotal > 0 ? (prevCompleted / prevTotal) * 100 : 100;

    const trend = recentRate - prevRate;
    const trendDirection = trend > 0 ? "↑" : trend < 0 ? "↓" : "→";

    if (recentRate < 50) {
      tests.push({
        name: "Removal Success Rate",
        status: "FAIL",
        message: `${recentRate.toFixed(1)}% success rate (${trendDirection} ${Math.abs(trend).toFixed(1)}% from last week)`,
        actionRequired: "Review failed removals and adjust strategies",
      });
    } else if (recentRate < 70 || trend < -10) {
      tests.push({
        name: "Removal Success Rate",
        status: "WARN",
        message: `${recentRate.toFixed(1)}% success rate (${trendDirection} ${Math.abs(trend).toFixed(1)}% from last week)`,
      });
    } else {
      tests.push({
        name: "Removal Success Rate",
        status: "PASS",
        message: `${recentRate.toFixed(1)}% success rate (${trendDirection} ${Math.abs(trend).toFixed(1)}% from last week)`,
      });
    }
  } catch (error) {
    tests.push({
      name: "Removal Success Rate",
      status: "WARN",
      message: `Could not calculate success rate trend: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }

  // Test 19: Queue Backlog Health
  try {
    const pendingCount = await prisma.removalRequest.count({
      where: { status: "PENDING" },
    });

    const submittedCount = await prisma.removalRequest.count({
      where: { status: "SUBMITTED" },
    });

    // Check oldest pending
    const oldestPending = await prisma.removalRequest.findFirst({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });

    let oldestDays = 0;
    if (oldestPending) {
      oldestDays = Math.floor((Date.now() - oldestPending.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    }

    if (pendingCount > 500 || oldestDays > 14) {
      tests.push({
        name: "Queue Backlog",
        status: "FAIL",
        message: `${pendingCount} pending, ${submittedCount} submitted. Oldest: ${oldestDays} days`,
        actionRequired: oldestDays > 14 ? "Clear stale pending requests" : "Increase processing capacity",
      });
    } else if (pendingCount > 200 || oldestDays > 7) {
      tests.push({
        name: "Queue Backlog",
        status: "WARN",
        message: `${pendingCount} pending, ${submittedCount} submitted. Oldest: ${oldestDays} days`,
      });
    } else {
      tests.push({
        name: "Queue Backlog",
        status: "PASS",
        message: `${pendingCount} pending, ${submittedCount} submitted. Oldest: ${oldestDays} days`,
      });
    }
  } catch (error) {
    tests.push({
      name: "Queue Backlog",
      status: "WARN",
      message: `Could not check queue backlog: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }

  // Test 20: Removal Processing Stagnation Detection
  try {
    const pendingForStagnation = await prisma.removalRequest.count({
      where: { status: "PENDING" },
    });

    if (pendingForStagnation > 50) {
      // There's a meaningful backlog — check if process-removals is making progress
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const lastProcessRemovalsLog = await prisma.cronLog.findFirst({
        where: {
          jobName: "process-removals",
          createdAt: { gte: oneDayAgo },
        },
        orderBy: { createdAt: "desc" },
        select: { message: true, createdAt: true },
      });

      if (!lastProcessRemovalsLog) {
        tests.push({
          name: "Removal Processing Health",
          status: "FAIL",
          message: `${pendingForStagnation} removals in PENDING queue but process-removals hasn't logged in 24 hours`,
          actionRequired: "process-removals cron is dead. Check Vercel function logs for timeout or crash.",
        });
      } else {
        // Parse "Processed X pending" from log message
        const processedMatch = lastProcessRemovalsLog.message?.match(/Processed (\d+) pending/);
        const processedCount = processedMatch ? parseInt(processedMatch[1], 10) : -1;

        if (processedCount === 0) {
          tests.push({
            name: "Removal Processing Health",
            status: "FAIL",
            message: `${pendingForStagnation} removals in PENDING queue but last process-removals run processed 0 items`,
            actionRequired: "process-removals is running but not processing. Check batch logic and broker rate limits.",
          });
        } else if (processedCount > 0) {
          tests.push({
            name: "Removal Processing Health",
            status: "PASS",
            message: `Queue active: ${pendingForStagnation} pending, last run processed ${processedCount}`,
          });
        } else {
          // Couldn't parse — at least it logged, so WARN
          tests.push({
            name: "Removal Processing Health",
            status: "WARN",
            message: `${pendingForStagnation} pending, process-removals logged but couldn't parse processing count`,
          });
        }
      }
    } else {
      tests.push({
        name: "Removal Processing Health",
        status: "PASS",
        message: `Queue healthy: ${pendingForStagnation} pending (threshold: 50)`,
      });
    }
  } catch (error) {
    tests.push({
      name: "Removal Processing Health",
      status: "WARN",
      message: `Could not check removal processing: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }

  // ========== TICKET HEALTH ==========

  // Test 21: Support Ticket Health
  try {
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const [staleOpenCount, staleWaitingCount, totalOpen] = await Promise.all([
      prisma.supportTicket.count({
        where: { status: "OPEN", lastActivityAt: { lt: fourHoursAgo } },
      }),
      prisma.supportTicket.count({
        where: { status: "WAITING_USER", lastActivityAt: { lt: fortyEightHoursAgo } },
      }),
      prisma.supportTicket.count({
        where: { status: "OPEN" },
      }),
    ]);

    if (staleOpenCount > 10 || staleWaitingCount > 5) {
      tests.push({
        name: "Ticket Health",
        status: "FAIL",
        message: `${staleOpenCount} stale OPEN tickets (4h+), ${staleWaitingCount} stale WAITING_USER (48h+), ${totalOpen} total open`,
        actionRequired: "Stale tickets need attention — customers may be waiting for responses",
      });

      // Emit remediation event for stale tickets
      try {
        await reportIssue({
          type: "ticket.stale",
          severity: "high",
          description: `${staleOpenCount} stale OPEN tickets (4h+) and ${staleWaitingCount} stale WAITING_USER (48h+) need attention`,
          sourceAgentId: "health-check",
          details: { staleOpenCount, staleWaitingCount, totalOpen, ticketCount: staleOpenCount + staleWaitingCount },
          canAutoRemediate: true,
        });
      } catch { /* non-blocking */ }
    } else if (staleOpenCount > 5 || staleWaitingCount > 2) {
      tests.push({
        name: "Ticket Health",
        status: "WARN",
        message: `${staleOpenCount} stale OPEN tickets (4h+), ${staleWaitingCount} stale WAITING_USER (48h+), ${totalOpen} total open`,
      });
    } else {
      tests.push({
        name: "Ticket Health",
        status: "PASS",
        message: `${totalOpen} open tickets, ${staleOpenCount} stale OPEN, ${staleWaitingCount} stale WAITING_USER — all healthy`,
      });
    }
  } catch (error) {
    tests.push({
      name: "Ticket Health",
      status: "WARN",
      message: `Could not check ticket health: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }

  // ========== OPERATIONS AGENT ANOMALY DETECTION ==========

  // Test 22: Run Operations Agent's enhanced anomaly detection
  try {
    const { runDetectAnomalies } = await import("@/lib/agents/operations-agent");
    const anomalyResult = await runDetectAnomalies();

    if (anomalyResult.anomaliesDetected > 0) {
      const criticalAnomalies = anomalyResult.alerts.filter(a => a.severity === "CRITICAL");
      const highAnomalies = anomalyResult.alerts.filter(a => a.severity === "HIGH");

      if (criticalAnomalies.length > 0) {
        tests.push({
          name: "Operations Agent Anomalies",
          status: "FAIL",
          message: `${criticalAnomalies.length} critical anomalies: ${criticalAnomalies.map(a => a.message).join("; ")}`,
          actionRequired: "Critical system anomalies detected — check Operations Agent alerts",
          autoFixed: criticalAnomalies.some(a => a.message.includes("AUTO-FIX: Re-triggered")),
        });
      } else if (highAnomalies.length > 0) {
        tests.push({
          name: "Operations Agent Anomalies",
          status: "WARN",
          message: `${highAnomalies.length} high-severity anomalies: ${highAnomalies.map(a => a.message).join("; ")}`,
        });
      } else {
        tests.push({
          name: "Operations Agent Anomalies",
          status: "WARN",
          message: `${anomalyResult.anomaliesDetected} anomalies: ${anomalyResult.alerts.map(a => a.message).join("; ")}`,
        });
      }
    } else {
      tests.push({
        name: "Operations Agent Anomalies",
        status: "PASS",
        message: "No anomalies detected by Operations Agent",
      });
    }
  } catch (error) {
    tests.push({
      name: "Operations Agent Anomalies",
      status: "WARN",
      message: `Operations Agent anomaly detection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }

  // ========== COMPILE REPORT ==========

  const summary = {
    passed: tests.filter(t => t.status === "PASS").length,
    failed: tests.filter(t => t.status === "FAIL").length,
    warnings: tests.filter(t => t.status === "WARN").length,
    autoFixed: tests.filter(t => t.autoFixed).length,
  };

  let overall: "HEALTHY" | "DEGRADED" | "CRITICAL";
  if (summary.failed > 0) {
    overall = "CRITICAL";
  } else if (summary.warnings > 0) {
    overall = "DEGRADED";
  } else {
    overall = "HEALTHY";
  }

  const report: HealthReport = {
    timestamp: new Date().toISOString(),
    overall,
    tests,
    summary,
  };

  // ========== SEND EMAIL REPORT ==========

  const actionsRequired = tests.filter(t => t.actionRequired);
  const autoFixedItems = tests.filter(t => t.autoFixed);

  // Only send email if there are issues or it's a weekly summary (Monday)
  const isMonday = new Date().getDay() === 1;
  const hasIssues = summary.failed > 0 || summary.warnings > 0;

  if (hasIssues || isMonday) {
    try {
      const statusEmoji = overall === "HEALTHY" ? "✅" : overall === "DEGRADED" ? "⚠️" : "🚨";

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: ${overall === "HEALTHY" ? "#10b981" : overall === "DEGRADED" ? "#f59e0b" : "#ef4444"};">
            ${statusEmoji} GhostMyData Health Report: ${overall}
          </h1>

          <p style="color: #6b7280;">
            ${new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
          </p>

          <h2 style="color: #374151;">Summary</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">✅ Passed</td>
              <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">${summary.passed}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">⚠️ Warnings</td>
              <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; color: #f59e0b;">${summary.warnings}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">❌ Failed</td>
              <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; color: #ef4444;">${summary.failed}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">🔧 Auto-Fixed</td>
              <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; color: #3b82f6;">${summary.autoFixed}</td>
            </tr>
          </table>

          ${autoFixedItems.length > 0 ? `
            <h2 style="color: #374151;">🔧 Auto-Fixed Issues</h2>
            <ul style="color: #6b7280;">
              ${autoFixedItems.map(t => `<li><strong>${t.name}:</strong> ${t.message}</li>`).join("")}
            </ul>
          ` : ""}

          ${actionsRequired.length > 0 ? `
            <h2 style="color: #ef4444;">⚡ Actions Required</h2>
            <ul>
              ${actionsRequired.map(t => `
                <li style="margin-bottom: 12px;">
                  <strong style="color: ${t.status === "FAIL" ? "#ef4444" : "#f59e0b"};">${t.name}</strong><br>
                  <span style="color: #6b7280;">${t.message}</span><br>
                  <span style="color: #374151; font-weight: 500;">→ ${t.actionRequired}</span>
                </li>
              `).join("")}
            </ul>
          ` : ""}

          <h2 style="color: #374151;">All Tests</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="background: #f3f4f6;">
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Test</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Status</th>
              <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Details</th>
            </tr>
            ${tests.map(t => `
              <tr>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">${t.name}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">
                  ${t.status === "PASS" ? "✅" : t.status === "WARN" ? "⚠️" : "❌"} ${t.status}
                </td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; color: #6b7280;">${t.message}</td>
              </tr>
            `).join("")}
          </table>

          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px;">
            This is an automated health check from GhostMyData.<br>
            Runs daily at 7 AM UTC.
          </p>
        </div>
      `;

      await getResend().emails.send({
        from: process.env.RESEND_FROM_EMAIL || "GhostMyData <noreply@send.ghostmydata.com>",
        to: [ADMIN_EMAIL],
        subject: `${statusEmoji} GhostMyData Health: ${overall} - ${summary.failed} failed, ${summary.warnings} warnings`,
        html: emailHtml,
      });

      console.log("[Health Check] Email report sent to", ADMIN_EMAIL);
    } catch (emailError) {
      console.error("[Health Check] Failed to send email:", emailError);
    }
  }

  // Log this health check execution — include which tests failed/warned for quick diagnosis
  const failedTestNames = tests.filter(t => t.status === "FAIL").map(t => t.name);
  const warnedTestNames = tests.filter(t => t.status === "WARN").map(t => t.name);
  let logMessage = `${overall}: ${summary.passed} passed, ${summary.failed} failed, ${summary.warnings} warnings`;
  if (failedTestNames.length > 0) logMessage += `. FAIL: ${failedTestNames.join(", ")}`;
  if (warnedTestNames.length > 0) logMessage += `. WARN: ${warnedTestNames.join(", ")}`;

  await logCronExecution({
    jobName: "health-check",
    status: summary.failed > 0 ? "FAILED" : "SUCCESS",
    message: logMessage,
    metadata: {
      overall,
      passed: summary.passed,
      failed: summary.failed,
      warnings: summary.warnings,
      autoFixed: summary.autoFixed,
    },
  });

  return NextResponse.json(report);
}
