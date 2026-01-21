import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption/crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "developer@ghostmydata.com";

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

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Allow Vercel cron (no auth needed) or manual with secret
  if (!cronSecret) return true;
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  // Test 10: Stuck Removal Requests (pending for more than 7 days)
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const stuckRemovals = await prisma.removalRequest.count({
      where: {
        status: "PENDING",
        createdAt: { lt: sevenDaysAgo },
      },
    });

    if (stuckRemovals > 0) {
      tests.push({
        name: "Stuck Removal Requests",
        status: "WARN",
        message: `${stuckRemovals} removal requests pending for over 7 days`,
        actionRequired: "Review and manually process stuck removals",
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

      await resend.emails.send({
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

  return NextResponse.json(report);
}
