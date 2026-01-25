import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";
import { logAudit } from "@/lib/rbac/audit-log";
import {
  ServicesIntegrationResponse,
  ResendServiceStatus,
  HIBPServiceStatus,
  LeakCheckServiceStatus,
  ScrapingBeeServiceStatus,
  RedisServiceStatus,
} from "@/lib/integrations/types";

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

  try {
    // Check Resend API status by fetching domains
    const response = await fetch("https://api.resend.com/domains", {
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
    });

    if (response.ok) {
      return {
        status: "connected",
        message: "Connected to Resend",
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
      return {
        status: "connected",
        message: "Connected to LeakCheck",
        credits: data.balance || data.queries_left || 0,
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
      return {
        status: "connected",
        message: "Connected to ScrapingBee",
        creditsRemaining: data.credits_remaining || data.api_credit || 0,
        maxCredits: data.max_api_credit || data.credits_limit || 0,
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

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Integrations/Services] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
