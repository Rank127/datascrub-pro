import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";
import { logAudit } from "@/lib/rbac/audit-log";
import { getEmailQuotaStatus, getEmailQueueStatus } from "@/lib/email";
import { getServiceStatus, shouldUseFreeAlternative } from "@/lib/services/rate-limiter";
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
    console.log("[Services] Getting email queue status...");
    const queueStatus = await getEmailQueueStatus();
    console.log("[Services] Queue status:", queueStatus);
    queueInfo = {
      queued: queueStatus.queued,
      processing: queueStatus.processing,
      sent: queueStatus.sent,
      failed: queueStatus.failed,
      nextProcessAt: queueStatus.nextProcessAt?.toISOString() || null,
    };
  } catch (error) {
    console.error("[Services] Failed to get email queue status:", error);
    console.error("[Services] Error details:", error instanceof Error ? error.stack : String(error));
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
        message: `Connected to Resend (${quotaStatus.sent} sent today${queueInfo.queued > 0 ? `, ${queueInfo.queued} queued` : ''})`,
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
          message: `Send-only API key (${quotaStatus.sent}/${quotaStatus.limit} today${queueInfo.queued > 0 ? `, ${queueInfo.queued} queued` : ''})`,
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
      message: `Resend configured (${quotaStatus.sent}/${quotaStatus.limit} today${queueInfo.queued > 0 ? `, ${queueInfo.queued} queued` : ''})`,
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
  const freeTierMode = shouldUseFreeAlternative();
  const rateLimitStatus = getServiceStatus("leakcheck");

  if (!process.env.LEAKCHECK_API_KEY) {
    return {
      status: freeTierMode ? "connected" : "not_configured",
      message: freeTierMode ? "Using HIBP as free alternative" : "LEAKCHECK_API_KEY not set"
    };
  }

  // If in free tier mode, show rate-limited status
  if (freeTierMode) {
    return {
      status: "connected",
      message: `Rate limited (${rateLimitStatus.used}/${rateLimitStatus.limit}/day) - using HIBP fallback`,
      rateLimit: calculateRateLimitHealth(rateLimitStatus.used, rateLimitStatus.limit, "midnight UTC"),
    };
  }

  try {
    // Check LeakCheck API status
    const response = await fetch(
      `https://leakcheck.io/api/v2/balance?key=${process.env.LEAKCHECK_API_KEY}`
    );

    if (response.ok) {
      const data = await response.json();
      const credits = data.balance || data.queries_left || 0;
      const estimatedMax = Math.max(credits, 1000);

      return {
        status: "connected",
        message: `Connected to LeakCheck (${credits} credits)`,
        credits,
        rateLimit: calculateRateLimitHealth(estimatedMax - credits, estimatedMax),
      };
    } else if (response.status === 401 || response.status === 403) {
      return {
        status: "connected",
        message: "API key expired - using HIBP fallback",
      };
    } else {
      return {
        status: "connected",
        message: `API error (${response.status}) - using HIBP fallback`,
      };
    }
  } catch (error) {
    return {
      status: "connected",
      message: "Connection failed - using HIBP fallback",
    };
  }
}

async function checkScrapingBeeStatus(): Promise<ScrapingBeeServiceStatus> {
  const freeTierMode = shouldUseFreeAlternative();
  const rateLimitStatus = getServiceStatus("scrapingbee");

  if (!process.env.SCRAPINGBEE_API_KEY) {
    return {
      status: freeTierMode ? "connected" : "not_configured",
      message: freeTierMode ? "Using direct fetch (no JS rendering)" : "SCRAPINGBEE_API_KEY not set"
    };
  }

  // If in free tier mode, show rate-limited status
  if (freeTierMode) {
    return {
      status: "connected",
      message: `Rate limited (${rateLimitStatus.used}/${rateLimitStatus.limit}/day) - using direct fetch`,
      rateLimit: calculateRateLimitHealth(rateLimitStatus.used, rateLimitStatus.limit, "midnight UTC"),
    };
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

      // If credits exhausted, switch to free mode
      if (creditsRemaining === 0) {
        return {
          status: "connected",
          message: "Credits exhausted - using direct fetch fallback",
          creditsRemaining: 0,
          maxCredits,
          rateLimit: calculateRateLimitHealth(maxCredits, maxCredits),
        };
      }

      return {
        status: "connected",
        message: `Connected to ScrapingBee (${creditsRemaining} credits)`,
        creditsRemaining,
        maxCredits,
        rateLimit: calculateRateLimitHealth(creditsUsed, maxCredits),
      };
    } else if (response.status === 401) {
      return {
        status: "connected",
        message: "Invalid API key - using direct fetch fallback",
      };
    } else {
      return {
        status: "connected",
        message: `API error - using direct fetch fallback`,
      };
    }
  } catch (error) {
    return {
      status: "connected",
      message: "Connection failed - using direct fetch fallback",
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

    // Check all services in parallel with error handling
    console.log("[Services] Checking all services...");
    const [resend, hibp, leakcheck, scrapingbee, redis] = await Promise.all([
      checkResendStatus().catch(e => {
        console.error("[Services] checkResendStatus failed:", e);
        return { status: "error" as const, message: "Failed to check Resend status" };
      }),
      checkHIBPStatus().catch(e => {
        console.error("[Services] checkHIBPStatus failed:", e);
        return { status: "error" as const, message: "Failed to check HIBP status" };
      }),
      checkLeakCheckStatus().catch(e => {
        console.error("[Services] checkLeakCheckStatus failed:", e);
        return { status: "error" as const, message: "Failed to check LeakCheck status" };
      }),
      checkScrapingBeeStatus().catch(e => {
        console.error("[Services] checkScrapingBeeStatus failed:", e);
        return { status: "error" as const, message: "Failed to check ScrapingBee status" };
      }),
      checkRedisStatus().catch(e => {
        console.error("[Services] checkRedisStatus failed:", e);
        return { status: "error" as const, message: "Failed to check Redis status" };
      }),
    ]);
    console.log("[Services] All checks completed");

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
