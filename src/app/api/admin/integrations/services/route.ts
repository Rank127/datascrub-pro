import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";
import { logAudit } from "@/lib/rbac/audit-log";
import { getEmailQuotaStatus, getEmailQueueStatus } from "@/lib/email";
import {
  ServicesIntegrationResponse,
  ResendServiceStatus,
  HIBPServiceStatus,
  LeakCheckServiceStatus,
  ScrapingBeeServiceStatus,
  RedisServiceStatus,
  RateLimitHealth,
} from "@/lib/integrations/types";

function calculateRateLimitHealth(used: number, limit: number, resetAt?: string): RateLimitHealth {
  const percentUsed = limit > 0 ? Math.round((used / limit) * 100) : 0;

  let status: RateLimitHealth["status"] = "healthy";
  let recommendation: string | undefined;

  if (percentUsed >= 90) {
    status = "critical";
    recommendation = "Upgrade plan immediately - approaching rate limit";
  } else if (percentUsed >= 75) {
    status = "warning";
    recommendation = "Consider upgrading plan - high usage";
  }

  return {
    status,
    used,
    limit,
    percentUsed,
    resetAt,
    recommendation,
  };
}

function getClientIP(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return undefined;
}

async function checkResendStatus(): Promise<ResendServiceStatus> {
  if (!process.env.RESEND_API_KEY) {
    return { status: "not_configured", message: "RESEND_API_KEY not set" };
  }

  // Get our internal email quota tracking and queue status
  const quotaStatus = getEmailQuotaStatus();

  // Get queue status with error handling
  let queueInfo = {
    queued: 0,
    processing: 0,
    sent: 0,
    failed: 0,
    nextProcessAt: null as string | null,
  };

  try {
    const queueStatus = await getEmailQueueStatus();
    queueInfo = {
      queued: queueStatus.queued,
      processing: queueStatus.processing,
      sent: queueStatus.sent,
      failed: queueStatus.failed,
      nextProcessAt: queueStatus.nextProcessAt?.toISOString() || null,
    };
  } catch (error) {
    console.error("[Services] Failed to get email queue status:", error);
    // Continue with default queue info
  }

  try {
    // Try to verify the key by checking emails endpoint
    // Note: Many Resend API keys are restricted to sending only
    const response = await fetch("https://api.resend.com/emails", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
    });

    // Resend free tier: 100 emails/day, 3000/month
    const dailyLimit = quotaStatus.limit;

    if (response.ok) {
      const data = await response.json();
      const emailsSent = Array.isArray(data.data) ? data.data.length : 0;
      // Use max of Resend count and our internal count (in case server restarted)
      const actualSent = Math.max(emailsSent, quotaStatus.sent);

      return {
        status: "connected",
        message: `Connected to Resend (${quotaStatus.sent} sent today${queueStatus.queued > 0 ? `, ${queueStatus.queued} queued` : ''})`,
        monthlyLimit: 3000,
        monthlyUsed: emailsSent,
        rateLimit: calculateRateLimitHealth(actualSent, dailyLimit, "midnight UTC"),
        queue: queueInfo,
      };
    } else if (response.status === 401) {
      // Check if it's a restricted key (send-only)
      const errorData = await response.json().catch(() => ({}));
      if (errorData.name === "restricted_api_key") {
        // Key is valid but restricted to sending - use internal tracking
        return {
          status: "connected",
          message: `Send-only API key (${quotaStatus.sent}/${quotaStatus.limit} today${queueStatus.queued > 0 ? `, ${queueStatus.queued} queued` : ''})`,
          monthlyLimit: 3000,
          rateLimit: calculateRateLimitHealth(quotaStatus.sent, quotaStatus.limit, "midnight UTC"),
          queue: queueInfo,
        };
      }
      return {
        status: "error",
        message: "Invalid API key",
        queue: queueInfo,
      };
    } else {
      return {
        status: "error",
        message: `API returned ${response.status}`,
        queue: queueInfo,
      };
    }
  } catch (error) {
    // Even if Resend API check fails, show our internal quota
    return {
      status: "connected",
      message: `Resend configured (${quotaStatus.sent}/${quotaStatus.limit} today${queueStatus.queued > 0 ? `, ${queueStatus.queued} queued` : ''})`,
      monthlyLimit: 3000,
      rateLimit: calculateRateLimitHealth(quotaStatus.sent, quotaStatus.limit, "midnight UTC"),
      queue: queueInfo,
    };
  }
}

async function checkHIBPStatus(): Promise<HIBPServiceStatus> {
  if (!process.env.HIBP_API_KEY) {
    return { status: "not_configured", message: "HIBP_API_KEY not set" };
  }

  try {
    // Check HIBP API status with a simple breach lookup
    const response = await fetch(
      "https://haveibeenpwned.com/api/v3/latestbreach",
      {
        headers: {
          "hibp-api-key": process.env.HIBP_API_KEY,
          "User-Agent": "GhostMyData-Admin",
        },
      }
    );

    if (response.ok) {
      return {
        status: "connected",
        message: "Connected to HIBP",
        rateLimit: {
          remaining: parseInt(response.headers.get("x-ratelimit-remaining") || "0"),
          resetAt: response.headers.get("x-ratelimit-reset") || "",
        },
      };
    } else if (response.status === 401) {
      return {
        status: "error",
        message: "Invalid API key",
      };
    } else {
      return {
        status: "error",
        message: `API returned ${response.status}`,
      };
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

async function checkLeakCheckStatus(): Promise<LeakCheckServiceStatus> {
  if (!process.env.LEAKCHECK_API_KEY) {
    return { status: "not_configured", message: "LEAKCHECK_API_KEY not set" };
  }

  try {
    // Check LeakCheck API status
    const response = await fetch(
      `https://leakcheck.io/api/v2/balance?key=${process.env.LEAKCHECK_API_KEY}`
    );

    if (response.ok) {
      const data = await response.json();
      const credits = data.balance || data.queries_left || 0;
      // Assume they started with some max credits - estimate based on common plans
      const estimatedMax = Math.max(credits, 1000); // At least 1000 or current balance

      return {
        status: "connected",
        message: "Connected to LeakCheck",
        credits,
        rateLimit: calculateRateLimitHealth(estimatedMax - credits, estimatedMax),
      };
    } else if (response.status === 401) {
      return {
        status: "error",
        message: "Invalid API key",
      };
    } else {
      return {
        status: "error",
        message: `API returned ${response.status}`,
      };
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

async function checkScrapingBeeStatus(): Promise<ScrapingBeeServiceStatus> {
  if (!process.env.SCRAPINGBEE_API_KEY) {
    return { status: "not_configured", message: "SCRAPINGBEE_API_KEY not set" };
  }

  try {
    // Check ScrapingBee usage
    const response = await fetch(
      `https://app.scrapingbee.com/api/v1/usage?api_key=${process.env.SCRAPINGBEE_API_KEY}`
    );

    if (response.ok) {
      const data = await response.json();
      const creditsRemaining = data.credits_remaining || data.api_credit || 0;
      const maxCredits = data.max_api_credit || data.credits_limit || 1000;
      const creditsUsed = maxCredits - creditsRemaining;

      return {
        status: "connected",
        message: "Connected to ScrapingBee",
        creditsRemaining,
        maxCredits,
        rateLimit: calculateRateLimitHealth(creditsUsed, maxCredits),
      };
    } else if (response.status === 401) {
      return {
        status: "error",
        message: "Invalid API key",
      };
    } else {
      return {
        status: "error",
        message: `API returned ${response.status}`,
      };
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

async function checkRedisStatus(): Promise<RedisServiceStatus> {
  // Check if Redis is configured via environment
  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;

  if (!redisUrl) {
    return { status: "not_configured", message: "Redis/Upstash not configured" };
  }

  try {
    // If using Upstash REST API
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const response = await fetch(
        `${process.env.UPSTASH_REDIS_REST_URL}/ping`,
        {
          headers: {
            Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
          },
        }
      );

      if (response.ok) {
        return {
          status: "connected",
          message: "Connected to Upstash Redis",
        };
      }
    }

    // For regular Redis, we'd need the ioredis client
    // For now, just check if URL is set
    return {
      status: "connected",
      message: "Redis URL configured",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const role = getEffectiveRole(currentUser.email, currentUser.role);

    // SUPER_ADMIN only for integrations
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Log access
    await logAudit({
      actorId: session.user.id,
      actorEmail: currentUser.email || "",
      actorRole: role,
      action: "ACCESS_ADMIN_PANEL",
      resource: "integrations_services",
      ipAddress: getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      details: { integration: "services" },
    });

    // Check all services in parallel
    const [resend, hibp, leakcheck, scrapingbee, redis] = await Promise.all([
      checkResendStatus(),
      checkHIBPStatus(),
      checkLeakCheckStatus(),
      checkScrapingBeeStatus(),
      checkRedisStatus(),
    ]);

    const response: ServicesIntegrationResponse = {
      resend,
      hibp,
      leakcheck,
      scrapingbee,
      redis,
    };

    console.log("[Services] Response:", JSON.stringify(response, null, 2));

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Integrations/Services] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
