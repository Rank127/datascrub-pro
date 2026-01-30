import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";

/**
 * GET /api/admin/support/tickets/[id]/ai-analysis
 * Get AI analysis data for a ticket including drafts, sentiment, and suggested actions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    if (!["SUPPORT", "ADMIN", "LEGAL", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Fetch internal comments that contain AI analysis
    const internalComments = await prisma.ticketComment.findMany({
      where: {
        ticketId: id,
        isInternal: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Parse AI data from comments
    const aiDrafts: Array<{
      id: string;
      content: string;
      createdAt: Date;
      status: "pending" | "approved" | "rejected";
    }> = [];

    const aiAnalysis: Array<{
      id: string;
      content: string;
      createdAt: Date;
      suggestedActions: string[];
      managerReviewItems: string[];
    }> = [];

    for (const comment of internalComments) {
      // Check for AI draft responses
      if (comment.content.includes("[AI DRAFT RESPONSE")) {
        const isApproved = comment.content.includes("APPROVED");
        const isRejected = comment.content.includes("REJECTED");
        const content = comment.content
          .replace(/^\[AI DRAFT RESPONSE[^\]]*\]\n?/, "")
          .replace(/^\[AI DRAFT RESPONSE\]\n?/, "")
          .trim();

        aiDrafts.push({
          id: comment.id,
          content,
          createdAt: comment.createdAt,
          status: isApproved ? "approved" : isRejected ? "rejected" : "pending",
        });
      }

      // Check for AI analysis comments
      if (comment.content.includes("[AI AGENT ANALYSIS")) {
        // Extract suggested actions
        const actionsMatch = comment.content.match(/Suggested actions:\s*([^\n]+)/);
        const suggestedActions = actionsMatch
          ? actionsMatch[1].split(",").map((a) => a.trim())
          : [];

        // Extract manager review items
        const managerReviewMatch = comment.content.match(
          /\[MANAGER REVIEW REQUIRED\]\n([\s\S]*?)(?:\n\n|$)/
        );
        const managerItems = managerReviewMatch
          ? managerReviewMatch[1]
              .split("\n")
              .filter((line) => line.match(/^\d+\./))
              .map((line) => line.replace(/^\d+\.\s*/, "").trim())
          : [];

        aiAnalysis.push({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          suggestedActions,
          managerReviewItems: managerItems,
        });
      }
    }

    // Check if there's a pending draft (most recent non-approved/rejected)
    const pendingDraft = aiDrafts.find((d) => d.status === "pending");

    // Get the latest analysis
    const latestAnalysis = aiAnalysis[0] || null;

    // Check for manager review items across all analysis
    const allManagerReviewItems = aiAnalysis.flatMap((a) => a.managerReviewItems);
    const hasManagerReviewItems = allManagerReviewItems.length > 0;

    return NextResponse.json({
      hasPendingDraft: !!pendingDraft,
      pendingDraft: pendingDraft || null,
      allDrafts: aiDrafts,
      latestAnalysis: latestAnalysis
        ? {
            suggestedActions: latestAnalysis.suggestedActions,
            managerReviewItems: latestAnalysis.managerReviewItems,
            createdAt: latestAnalysis.createdAt,
          }
        : null,
      hasManagerReviewItems,
      allManagerReviewItems: [...new Set(allManagerReviewItems)],
      totalAnalysisCount: aiAnalysis.length,
    });
  } catch (error) {
    console.error("[Admin Support API] Error fetching AI analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI analysis" },
      { status: 500 }
    );
  }
}
