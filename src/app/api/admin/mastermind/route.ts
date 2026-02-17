/**
 * Admin Mastermind API
 *
 * POST /api/admin/mastermind
 * Accepts a question with optional mission domain or invocation command.
 * Returns AI-generated strategic advice channeling mastermind advisors.
 * Rate limited to 10 requests per day per admin.
 *
 * Auth: Browser session (NextAuth) OR CRON_SECRET Bearer token for CLI access.
 */

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";
import { buildMastermindPrompt } from "@/lib/mastermind";
import { resolveInvocation } from "@/lib/mastermind/invocations";
import { getSystemUserId } from "@/lib/support/ticket-service";
import type { MissionDomain } from "@/lib/mastermind";

const DAILY_LIMIT = 10;

export const maxDuration = 300;

export async function POST(request: Request) {
  let step = "init";
  try {
    // Auth — session or CRON_SECRET
    step = "auth";
    let actorId = "system-cli";
    let actorEmail = "cli@ghostmydata.com";
    let role = "ADMIN";

    const authHeader = request.headers.get("authorization");
    const isCronAuth =
      authHeader === `Bearer ${process.env.CRON_SECRET}` && process.env.CRON_SECRET;

    if (isCronAuth) {
      // CLI access via CRON_SECRET — skip session auth and rate limiting
      const systemId = await getSystemUserId();
      if (systemId) actorId = systemId;
    } else {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      step = "fetch-user";
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, role: true },
      });

      step = "check-role";
      role = getEffectiveRole(currentUser?.email, currentUser?.role);
      if (!["ADMIN", "LEGAL", "SUPER_ADMIN"].includes(role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      actorId = session.user.id;
      actorEmail = currentUser?.email || "unknown";

      // Rate limiting (session users only)
      step = "rate-limit";
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayCount = await prisma.auditLog.count({
        where: {
          actorId: session.user.id,
          action: "MASTERMIND_QUERY",
          createdAt: { gte: todayStart },
        },
      });

      if (todayCount >= DAILY_LIMIT) {
        return NextResponse.json(
          { error: `Daily limit of ${DAILY_LIMIT} mastermind queries reached. Try again tomorrow.` },
          { status: 429 }
        );
      }
    }

    // Parse body
    step = "parse-body";
    const body = await request.json();
    const { question, mission, invocation } = body as {
      question?: string;
      mission?: string;
      invocation?: string;
    };

    if (!question || typeof question !== "string" || question.trim().length < 5) {
      return NextResponse.json(
        { error: "Question must be at least 5 characters" },
        { status: 400 }
      );
    }

    // Build mastermind prompt — scale advisors and model based on invocation
    step = "build-prompt";
    const resolved = invocation ? resolveInvocation(invocation) : null;
    const isGroupMode = resolved?.mode === "group";
    const advisorCount = isGroupMode ? Math.max(14, resolved.advisorIds.length) : 5;

    const promptOptions: Parameters<typeof buildMastermindPrompt>[0] = {
      maxAdvisors: advisorCount,
      includeBusinessContext: true,
      scenario: question.trim(),
      era: isGroupMode ? "both" : "modern",
    };

    if (invocation) {
      promptOptions.invocation = invocation;
    } else if (mission) {
      promptOptions.mission = mission as MissionDomain;
    }

    const mastermindPrompt = buildMastermindPrompt(promptOptions);

    // Fetch some live context
    step = "fetch-metrics";
    const userCount = await prisma.user.count();

    const liveContext = `Live metrics: ${userCount} total users.`;

    // Scale model and tokens for group invocations (Board Meeting, War Rooms, etc.)
    const model = isGroupMode ? "claude-sonnet-4-5-20250929" : "claude-haiku-4-5-20251001";
    const maxTokens = isGroupMode ? 8000 : 1500;

    // Call Claude
    step = "anthropic-init";
    const anthropic = new Anthropic();

    step = "anthropic-call";
    const message = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature: 0.4,
      system: `You are the Mastermind Advisory Council for GhostMyData, a data privacy platform. Channel the assigned advisors' thinking styles to provide strategic advice.

${mastermindPrompt}

${liveContext}

Respond with valid JSON only (no markdown, no code fences):
{
  "advice": "${isGroupMode ? "Comprehensive multi-section strategic analysis using the 8-section format (LANDSCAPE, ANALYSIS, OFFER/SOLUTION, SEO & GROWTH, ACTION PLAN, SECURITY & INFRASTRUCTURE, RISKS & BLIND SPOTS, GOVERNANCE CHECK)" : "3-5 paragraph strategic advice channeling the advisors' perspectives"}",
  "advisors": ["List of advisor names whose perspectives you channeled"],
  "protocol": ["List of protocol steps you applied, if any"],
  "keyInsight": "One-sentence key takeaway"
}`,
      messages: [
        {
          role: "user",
          content: question.trim(),
        },
      ],
    });

    step = "parse-response";
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Strip markdown code fences if present
    let jsonText = textBlock.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const result = JSON.parse(jsonText);

    // Log the query
    step = "audit-log";
    await prisma.auditLog.create({
      data: {
        actorId,
        actorEmail,
        actorRole: role,
        action: "MASTERMIND_QUERY",
        resource: "mastermind",
        details: JSON.stringify({
          question: question.trim().substring(0, 200),
          mission,
          invocation,
          advisors: result.advisors,
          source: isCronAuth ? "cli" : "dashboard",
        }),
      },
    });

    return NextResponse.json({
      advice: result.advice,
      advisors: result.advisors || [],
      protocol: result.protocol || [],
      keyInsight: result.keyInsight,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Mastermind API] Failed at step "${step}":`, errorMessage, error);
    return NextResponse.json(
      { error: "Failed to generate mastermind advice. Please try again.", step },
      { status: 500 }
    );
  }
}
