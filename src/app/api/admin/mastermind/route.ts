/**
 * Admin Mastermind API
 *
 * POST /api/admin/mastermind
 * Accepts a question with optional mission domain or invocation command.
 * Returns AI-generated strategic advice channeling mastermind advisors.
 * Rate limited to 10 requests per day per admin.
 */

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";
import { buildMastermindPrompt } from "@/lib/mastermind";
import type { MissionDomain } from "@/lib/mastermind";

const DAILY_LIMIT = 10;

export async function POST(request: Request) {
  let step = "init";
  try {
    // Auth
    step = "auth";
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
    const role = getEffectiveRole(currentUser?.email, currentUser?.role);
    if (!["ADMIN", "LEGAL", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    // Rate limiting
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

    // Build mastermind prompt
    step = "build-prompt";
    const promptOptions: Parameters<typeof buildMastermindPrompt>[0] = {
      maxAdvisors: 5,
      includeBusinessContext: true,
      scenario: question.trim(),
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

    // Call Claude
    step = "anthropic-init";
    const anthropic = new Anthropic();

    step = "anthropic-call";
    const message = await anthropic.messages.create({
      model: "claude-haiku-3-5-20241022",
      max_tokens: 1500,
      temperature: 0.4,
      system: `You are the Mastermind Advisory Council for GhostMyData. Channel the assigned advisors' thinking styles to provide strategic advice.

${mastermindPrompt}

${liveContext}

Respond with valid JSON only (no markdown, no code fences):
{
  "advice": "3-5 paragraph strategic advice channeling the advisors' perspectives",
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
        actorId: session.user.id,
        actorEmail: currentUser?.email || "unknown",
        actorRole: role,
        action: "MASTERMIND_QUERY",
        resource: "mastermind",
        details: JSON.stringify({
          question: question.trim().substring(0, 200),
          mission,
          invocation,
          advisors: result.advisors,
        }),
      },
    });

    return NextResponse.json({
      advice: result.advice,
      advisors: result.advisors || [],
      protocol: result.protocol || [],
      keyInsight: result.keyInsight,
      queriesRemaining: DAILY_LIMIT - todayCount - 1,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Mastermind API] Failed at step "${step}":`, errorMessage, error);
    return NextResponse.json(
      { error: `Mastermind failed at ${step}: ${errorMessage}` },
      { status: 500 }
    );
  }
}
