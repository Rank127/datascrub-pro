import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";
import { logAudit } from "@/lib/rbac/audit-log";
import { getEmailQuotaStatus, getEmailQueueStatus, sendServiceAlertEmail } from "@/lib/email";
import { shouldUseFreeAlternative, getHIBPRateLimitStatus, getScrapingBeeStatus, updateScrapingBeeApiCredits, getLeakCheckStatus, updateLeakCheckApiCredits } from "@/lib/services/rate-limiter";
import {
  ServicesIntegrationResponse,
  ResendServiceStatus,
  HIBPServiceStatus,
  LeakCheckServiceStatus,
  ScrapingBeeServiceStatus,
  RedisServiceStatus,
  AnthropicServiceStatus,
  TwilioServiceStatus,
  RateLimitHealth,
} from "@/lib/integrations/types";

function calculateRateLimitHealth(used: number, limit: number, resetAt?: string): RateLimitHealth {
  const percentUsed = limit > 0 ? Math.round((used / limit) * 100) : 0;

  let status: RateLimitHealth["status"] = "healthy";
  let recommendation: string | undefined;

  if (percentUsed >= 80) {
    status = "critical";
    recommendation = "Time to upgrade - limit nearly exhausted";
  } else if (percentUsed >= 60) {
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

/**
 * HIBP-specific rate limit health calculation
 * Uses different thresholds and messaging since it's a per-MINUTE limit that resets quickly
 */
function calculateHIBPRateLimitHealth(used: number, limit: number, secondsUntilReset: number): RateLimitHealth {
  const percentUsed = limit > 0 ? Math.round((used / limit) * 100) : 0;

  let status: RateLimitHealth["status"] = "healthy";
  let recommendation: string | undefined;

  // For per-minute limits, only show critical when fully exhausted
  // Warning at 80% since it resets every minute anyway
  if (percentUsed >= 100) {
    status = "critical";
    recommendation = `Rate limited - resets in ${secondsUntilReset}s`;
  } else if (percentUsed >= 80) {
    status = "warning";
    recommendation = `${limit - used} requests left this minute`;
  }

  return {
    status,
    used,
    limit,
    percentUsed,
    resetAt: `${secondsUntilReset}s`,
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
    // Verify Resend connection using SDK (avoids raw GET /emails API noise)
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error: resendError } = await resend.emails.list();

    const dailyLimit = quotaStatus.limit;

    if (!resendError && data) {
      const emailList = (data as unknown as { data: unknown[] })?.data;
      const emailsSent = Array.isArray(emailList) ? emailList.length : 0;
      const actualSent = Math.max(emailsSent, quotaStatus.sent);

      return {
        status: "connected",
        message: `Connected to Resend (${quotaStatus.sent} sent today${queueInfo.queued > 0 ? `, ${queueInfo.queued} queued` : ''})`,
        monthlyLimit: 3000,
        monthlyUsed: emailsSent,
        rateLimit: calculateRateLimitHealth(actualSent, dailyLimit, "midnight UTC"),
        queue: queueInfo,
      };
    } else if (resendError?.message?.includes("restricted")) {
      // Key is valid but restricted to sending - use internal tracking
      return {
        status: "connected",
        message: `Send-only API key (${quotaStatus.sent}/${quotaStatus.limit} today${queueInfo.queued > 0 ? `, ${queueInfo.queued} queued` : ''})`,
        monthlyLimit: 3000,
        rateLimit: calculateRateLimitHealth(quotaStatus.sent, quotaStatus.limit, "midnight UTC"),
        queue: queueInfo,
      };
    } else {
      // API key configured, use internal tracking as fallback
      return {
        status: "connected",
        message: `Resend configured (${quotaStatus.sent}/${quotaStatus.limit} today${queueInfo.queued > 0 ? `, ${queueInfo.queued} queued` : ''})`,
        monthlyLimit: 3000,
        rateLimit: calculateRateLimitHealth(quotaStatus.sent, dailyLimit, "midnight UTC"),
        queue: queueInfo,
      };
    }
  } catch (_error) {
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

  // Get our internal rate limit tracking
  const internalStatus = getHIBPRateLimitStatus();

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
      // Get rate limit from HIBP headers
      const apiRemaining = parseInt(response.headers.get("x-ratelimit-remaining") || "10");
      const apiLimit = parseInt(response.headers.get("x-ratelimit-limit") || "10");

      // Use the lower of API remaining vs our internal tracking
      const remaining = Math.min(apiRemaining, internalStatus.remaining);
      const limit = apiLimit;
      const used = limit - remaining;

      // Format message based on usage
      let message = "HIBP connected";
      if (remaining === limit) {
        message = `HIBP connected (${limit} req/min available)`;
      } else if (remaining === 0) {
        message = `HIBP rate limited - resets in ${internalStatus.secondsUntilReset}s`;
      } else {
        message = `HIBP connected (${remaining} of ${limit} req/min left)`;
      }

      return {
        status: "connected",
        message,
        rateLimit: calculateHIBPRateLimitHealth(used, limit, internalStatus.secondsUntilReset),
      };
    } else if (response.status === 401) {
      return {
        status: "error",
        message: "Invalid API key",
      };
    } else if (response.status === 429) {
      // Rate limited - use internal tracking
      return {
        status: "connected",
        message: `HIBP rate limited - resets in ${internalStatus.secondsUntilReset}s`,
        rateLimit: calculateHIBPRateLimitHealth(
          internalStatus.maxPerMinute,
          internalStatus.maxPerMinute,
          internalStatus.secondsUntilReset
        ),
      };
    } else {
      return {
        status: "error",
        message: `API returned ${response.status}`,
      };
    }
  } catch (error) {
    // Even on error, show our internal tracking
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Connection failed",
      rateLimit: calculateHIBPRateLimitHealth(
        internalStatus.requestsThisMinute,
        internalStatus.maxPerMinute,
        internalStatus.secondsUntilReset
      ),
    };
  }
}

async function checkLeakCheckStatus(): Promise<LeakCheckServiceStatus> {
  const freeTierMode = shouldUseFreeAlternative();
  const internalStatus = getLeakCheckStatus();

  if (!process.env.LEAKCHECK_API_KEY) {
    return {
      status: freeTierMode ? "connected" : "not_configured",
      message: freeTierMode ? "Using HIBP as free alternative" : "LEAKCHECK_API_KEY not set"
    };
  }

  // If in free tier mode, show status
  if (freeTierMode) {
    return {
      status: "connected",
      message: `Free tier mode - using HIBP fallback`,
      rateLimit: {
        status: internalStatus.status,
        used: internalStatus.queriesUsed,
        limit: internalStatus.dailyLimit,
        percentUsed: internalStatus.percentUsed,
        resetAt: "midnight UTC (daily)",
      },
    };
  }

  try {
    // Check LeakCheck API balance
    const response = await fetch(
      `https://leakcheck.io/api/v2/balance?key=${process.env.LEAKCHECK_API_KEY}`
    );

    if (response.ok) {
      const data = await response.json();
      // LeakCheck returns: queries_left or balance
      const queriesRemaining = data.queries_left ?? data.balance ?? 0;
      const dailyLimit = internalStatus.dailyLimit; // 400/day lifetime plan
      const queriesUsed = dailyLimit - queriesRemaining;
      const percentUsed = Math.round((queriesUsed / dailyLimit) * 100);

      // Sync with internal tracking
      updateLeakCheckApiCredits(queriesRemaining);

      // Determine status
      let status: RateLimitHealth["status"] = "healthy";
      let recommendation: string | undefined;

      if (queriesRemaining <= 0) {
        status = "critical";
        recommendation = "Daily query limit reached - resets midnight UTC";
      } else if (percentUsed >= 95) {
        status = "critical";
        recommendation = `Only ${queriesRemaining} queries left today`;
      } else if (percentUsed >= 80) {
        status = "warning";
        recommendation = `${queriesRemaining} queries remaining today`;
      }

      return {
        status: "connected",
        message: queriesRemaining <= 0
          ? "Daily limit reached - resets midnight UTC"
          : `LeakCheck (${queriesRemaining}/${dailyLimit} today)`,
        credits: queriesRemaining,
        rateLimit: {
          status,
          used: queriesUsed,
          limit: dailyLimit,
          percentUsed,
          resetAt: "midnight UTC (daily)",
          recommendation,
        },
      };
    } else if (response.status === 401 || response.status === 403) {
      return {
        status: "error",
        message: "Invalid API key",
      };
    } else {
      // Use internal tracking on API error
      return {
        status: "connected",
        message: `~${internalStatus.queriesRemaining} queries left today (API unavailable)`,
        credits: internalStatus.queriesRemaining,
        rateLimit: {
          status: internalStatus.status,
          used: internalStatus.queriesUsed,
          limit: internalStatus.dailyLimit,
          percentUsed: internalStatus.percentUsed,
          resetAt: "midnight UTC (daily)",
        },
      };
    }
  } catch (_error) {
    return {
      status: "connected",
      message: `~${internalStatus.queriesRemaining} queries left today (API error)`,
      credits: internalStatus.queriesRemaining,
      rateLimit: {
        status: internalStatus.status,
        used: internalStatus.queriesUsed,
        limit: internalStatus.dailyLimit,
        percentUsed: internalStatus.percentUsed,
        resetAt: "midnight UTC (daily)",
      },
    };
  }
}

async function checkScrapingBeeStatus(): Promise<ScrapingBeeServiceStatus> {
  const freeTierMode = shouldUseFreeAlternative();
  const internalStatus = getScrapingBeeStatus();

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
      message: `Free tier mode - using direct fetch`,
      rateLimit: calculateRateLimitHealth(internalStatus.creditsUsed, internalStatus.monthlyLimit, "month end"),
    };
  }

  try {
    // Check ScrapingBee usage API
    const response = await fetch(
      `https://app.scrapingbee.com/api/v1/usage?api_key=${process.env.SCRAPINGBEE_API_KEY}`
    );

    if (response.ok) {
      const data = await response.json();
      // ScrapingBee API returns: max_api_credit, used_api_credit
      const maxCredits = data.max_api_credit || internalStatus.monthlyLimit;
      const creditsUsed = data.used_api_credit || 0;
      const apiCreditsRemaining = maxCredits - creditsUsed;

      // Sync API data with our internal tracking
      updateScrapingBeeApiCredits(apiCreditsRemaining);

      // Determine if using fallback
      const usingFallback = internalStatus.shouldUseFallback || apiCreditsRemaining <= 0;

      // Calculate status based on percentage used
      let status: RateLimitHealth["status"] = "healthy";
      let recommendation: string | undefined;

      const percentUsed = Math.round((creditsUsed / maxCredits) * 100);

      if (percentUsed >= 95 || apiCreditsRemaining <= 0) {
        status = "critical";
        recommendation = usingFallback
          ? "Credits exhausted - using direct fetch fallback (no JS rendering)"
          : "Credits nearly exhausted - will switch to fallback soon";
      } else if (percentUsed >= 80) {
        status = "warning";
        recommendation = `${apiCreditsRemaining.toLocaleString()} credits remaining this month`;
      }

      const creditCosts = `JS: 5 | Premium+JS: 25 | Stealth+JS: 100`;

      return {
        status: "connected",
        message: usingFallback
          ? `ScrapingBee exhausted - using direct fetch`
          : `${apiCreditsRemaining.toLocaleString()}/${maxCredits.toLocaleString()} credits/mo`,
        creditsRemaining: apiCreditsRemaining,
        maxCredits,
        rateLimit: {
          status,
          used: creditsUsed,
          limit: maxCredits,
          percentUsed,
          resetAt: "month end",
          recommendation: recommendation || creditCosts,
        },
      };
    } else if (response.status === 401) {
      return {
        status: "error",
        message: "Invalid API key",
      };
    } else {
      // Use internal tracking if API fails
      return {
        status: "connected",
        message: `~${internalStatus.creditsRemaining.toLocaleString()} credits remaining (API unavailable)`,
        creditsRemaining: internalStatus.creditsRemaining,
        maxCredits: internalStatus.monthlyLimit,
        rateLimit: {
          status: internalStatus.status,
          used: internalStatus.creditsUsed,
          limit: internalStatus.monthlyLimit,
          percentUsed: internalStatus.percentUsed,
          resetAt: "month end",
        },
      };
    }
  } catch (_error) {
    // Use internal tracking on error
    return {
      status: "connected",
      message: `~${internalStatus.creditsRemaining.toLocaleString()} credits remaining (API error)`,
      creditsRemaining: internalStatus.creditsRemaining,
      maxCredits: internalStatus.monthlyLimit,
      rateLimit: {
        status: internalStatus.status,
        used: internalStatus.creditsUsed,
        limit: internalStatus.monthlyLimit,
        percentUsed: internalStatus.percentUsed,
        resetAt: "month end",
      },
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
      // Ping to check connection
      const pingResponse = await fetch(
        `${process.env.UPSTASH_REDIS_REST_URL}/ping`,
        {
          headers: {
            Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
          },
        }
      );

      if (pingResponse.ok) {
        // Get DBSIZE for usage info
        const dbsizeResponse = await fetch(
          `${process.env.UPSTASH_REDIS_REST_URL}/dbsize`,
          {
            headers: {
              Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
            },
          }
        );

        let keysCount = 0;
        if (dbsizeResponse.ok) {
          const dbsizeData = await dbsizeResponse.json();
          keysCount = dbsizeData.result || 0;
        }

        // Upstash free tier: 10K commands/day, 256MB storage
        const maxKeys = 10000; // Estimate based on typical usage
        const _dailyCommandLimit = 10000;

        return {
          status: "connected",
          message: `Connected to Upstash Redis (${keysCount} keys)`,
          rateLimit: calculateRateLimitHealth(keysCount, maxKeys, "256MB max storage"),
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

async function checkAnthropicStatus(): Promise<AnthropicServiceStatus> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { status: "not_configured", message: "ANTHROPIC_API_KEY not set" };
  }

  try {
    // Make a simple API call to verify the key works
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 10,
        messages: [{ role: "user", content: "ping" }],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        status: "connected",
        message: "Claude API connected",
        model: data.model || "claude-3",
      };
    } else if (response.status === 401) {
      return {
        status: "error",
        message: "Invalid API key",
      };
    } else if (response.status === 429) {
      return {
        status: "connected",
        message: "Claude API rate limited",
        rateLimit: {
          status: "warning",
          used: 0,
          limit: 0,
          percentUsed: 100,
          recommendation: "Rate limited - reduce API calls",
        },
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

async function checkTwilioStatus(): Promise<TwilioServiceStatus> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return { status: "not_configured", message: "Twilio credentials not set" };
  }

  try {
    // Get account balance
    const balanceResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Balance.json`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        },
      }
    );

    if (balanceResponse.ok) {
      const balanceData = await balanceResponse.json();
      const balance = parseFloat(balanceData.balance || "0");
      const currency = balanceData.currency || "USD";

      // Calculate rate limit status based on balance
      let rateLimitStatus: RateLimitHealth | undefined;
      if (balance < 5) {
        rateLimitStatus = {
          status: "critical",
          used: 0,
          limit: 0,
          percentUsed: 95,
          recommendation: "Balance critically low - add funds",
        };
      } else if (balance < 20) {
        rateLimitStatus = {
          status: "warning",
          used: 0,
          limit: 0,
          percentUsed: 75,
          recommendation: "Balance running low",
        };
      }

      return {
        status: "connected",
        message: `Balance: ${currency} ${balance.toFixed(2)}`,
        accountSid: accountSid.slice(-4), // Show only last 4 chars
        balance,
        currency,
        rateLimit: rateLimitStatus,
      };
    } else if (balanceResponse.status === 401) {
      return {
        status: "error",
        message: "Invalid credentials",
      };
    } else {
      return {
        status: "error",
        message: `API returned ${balanceResponse.status}`,
      };
    }
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
    const [resend, hibp, leakcheck, scrapingbee, redis, anthropic, twilio] = await Promise.all([
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
      checkAnthropicStatus().catch(e => {
        console.error("[Services] checkAnthropicStatus failed:", e);
        return { status: "error" as const, message: "Failed to check Anthropic status" };
      }),
      checkTwilioStatus().catch(e => {
        console.error("[Services] checkTwilioStatus failed:", e);
        return { status: "error" as const, message: "Failed to check Twilio status" };
      }),
    ]);
    console.log("[Services] All checks completed");

    const response: ServicesIntegrationResponse = {
      resend,
      hibp,
      leakcheck,
      scrapingbee,
      redis,
      anthropic,
      twilio,
    };

    console.log("[Services] Response:", JSON.stringify(response, null, 2));

    // Check for critical rate limits and send admin alert
    const criticalAlerts: Array<{
      serviceName: string;
      percentUsed: number;
      used: number;
      limit: number;
      status: "warning" | "critical";
      recommendation?: string;
    }> = [];

    const servicesWithLimits = [
      { name: "Resend (Email)", data: resend },
      { name: "LeakCheck", data: leakcheck },
      { name: "ScrapingBee", data: scrapingbee },
      { name: "Redis / Upstash", data: redis },
    ];

    for (const service of servicesWithLimits) {
      const rateLimit = "rateLimit" in service.data ? service.data.rateLimit : undefined;
      if (rateLimit?.status === "critical") {
        criticalAlerts.push({
          serviceName: service.name,
          percentUsed: rateLimit.percentUsed,
          used: rateLimit.used,
          limit: rateLimit.limit,
          status: "critical",
          recommendation: rateLimit.recommendation,
        });
      }
    }

    // Send alert email if there are critical services
    if (criticalAlerts.length > 0) {
      const adminEmail = process.env.ADMIN_EMAILS?.split(",")[0]?.trim();
      if (adminEmail) {
        console.log("[Services] Sending alert for critical services:", criticalAlerts.map(a => a.serviceName));
        sendServiceAlertEmail(adminEmail, criticalAlerts).catch((err) => {
          console.error("[Services] Failed to send alert email:", err);
        });
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Integrations/Services] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
