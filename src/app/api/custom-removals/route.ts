import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectivePlan } from "@/lib/family/family-service";
import { rateLimit, getClientIdentifier, rateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";

// Monthly limit for custom removal requests
const MONTHLY_LIMIT = 10;

// Validation schema
const createRequestSchema = z.object({
  targetUrl: z.string().url("Please enter a valid URL"),
  siteName: z.string().optional(),
  dataType: z.enum(["EMAIL", "PHONE", "NAME", "ADDRESS", "PHOTO", "COMBINED_PROFILE", "OTHER"]),
  dataPreview: z.string().max(500).optional(),
  userNotes: z.string().max(1000).optional(),
  userScreenshot: z.string().optional(), // Base64 or URL
});

// GET - List user's custom removal requests
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check user plan (checks subscription + family membership)
    const userPlan = await getEffectivePlan(userId);

    if (userPlan !== "ENTERPRISE") {
      return NextResponse.json(
        { error: "Custom removal requests are an Enterprise feature" },
        { status: 403 }
      );
    }

    // Get current month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [requests, monthlyCount] = await Promise.all([
      prisma.customRemovalRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50, // Limit to most recent 50
      }),
      prisma.customRemovalRequest.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth },
        },
      }),
    ]);

    return NextResponse.json({
      requests,
      usage: {
        used: monthlyCount,
        limit: MONTHLY_LIMIT,
        remaining: Math.max(0, MONTHLY_LIMIT - monthlyCount),
      },
    });
  } catch (error) {
    console.error("Custom removals list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom removal requests" },
      { status: 500 }
    );
  }
}

// POST - Create a new custom removal request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit custom removal submissions
    const rl = await rateLimit(getClientIdentifier(request, session.user.id), "api");
    if (!rl.success) return rateLimitResponse(rl);

    const userId = session.user.id;

    // Check user plan (checks subscription + family membership)
    const userPlan = await getEffectivePlan(userId);

    if (userPlan !== "ENTERPRISE") {
      return NextResponse.json(
        { error: "Custom removal requests are an Enterprise feature" },
        { status: 403 }
      );
    }

    // Parse and validate request body before entering transaction
    const body = await request.json();
    const validatedData = createRequestSchema.parse(body);

    // Use transaction to atomically check limit + create request (prevents race condition)
    const result = await prisma.$transaction(async (tx) => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthlyCount = await tx.customRemovalRequest.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth },
        },
      });

      if (monthlyCount >= MONTHLY_LIMIT) {
        return {
          error: `Monthly limit reached. You can submit up to ${MONTHLY_LIMIT} custom removal requests per month.`,
          usage: { used: monthlyCount, limit: MONTHLY_LIMIT, remaining: 0 },
          status: 429 as const,
        };
      }

      // Check for duplicate pending requests
      const existingRequest = await tx.customRemovalRequest.findFirst({
        where: {
          userId,
          targetUrl: validatedData.targetUrl,
          status: { in: ["PENDING", "ASSIGNED", "IN_PROGRESS"] },
        },
      });

      if (existingRequest) {
        return {
          error: "You already have a pending request for this URL",
          status: 409 as const,
        };
      }

      const customRequest = await tx.customRemovalRequest.create({
        data: {
          userId,
          targetUrl: validatedData.targetUrl,
          siteName: validatedData.siteName,
          dataType: validatedData.dataType,
          dataPreview: validatedData.dataPreview,
          userNotes: validatedData.userNotes,
          userScreenshot: validatedData.userScreenshot,
          status: "PENDING",
          priority: "NORMAL",
        },
      });

      return {
        success: true,
        request: customRequest,
        usage: {
          used: monthlyCount + 1,
          limit: MONTHLY_LIMIT,
          remaining: Math.max(0, MONTHLY_LIMIT - monthlyCount - 1),
        },
      };
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error, ...(result.usage ? { usage: result.usage } : {}) },
        { status: result.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Custom removal create error:", error);
    return NextResponse.json(
      { error: "Failed to create custom removal request" },
      { status: 500 }
    );
  }
}
