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
import { getEffectiveRole, checkPermission } from "@/lib/admin";
import { buildMastermindPrompt } from "@/lib/mastermind";
import type { MissionDomain } from "@/lib/mastermind";

const DAILY_LIMIT = 10;

export async function POST(request: Request) {
  try {
    // Auth
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });

    if (!checkPermission(currentUser?.email, currentUser?.role, "view_analytics")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse body
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

    // Rate limiting (simple: count AI calls today via audit log)
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
    const [userCount, removalStats] = await Promise.all([
      prisma.user.count(),
      prisma.removalRequest.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    const liveContext = `Live metrics: ${userCount} total users. Removals: ${removalStats.map((r) => `${r.status}: ${r._count}`).join(", ")}.`;

    // Call Claude
    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      temperature: 0.4,
      system: `You are the Mastermind Advisory Council for GhostMyData. Channel the assigned advisors' thinking styles to provide strategic advice.

${mastermindPrompt}

${liveContext}

Respond with valid JSON:
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

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    const result = JSON.parse(textBlock.text);

    // Log the query
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        actorEmail: currentUser?.email || "unknown",
        actorRole: currentUser?.role || "ADMIN",
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
    console.error("[Mastermind API] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate mastermind advice" },
      { status: 500 }
    );
  }
}
