import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAllAutomatableBrokers, isAutomationEnabled, getBrowserlessUsage } from "@/lib/removers/browser-automation";
import { isCaptchaSolverEnabled } from "@/lib/removers/captcha-solver";

/**
 * GET /api/automation/stats
 *
 * Returns automation capabilities and statistics
 * - Shows which brokers can be automated (form vs email vs manual)
 * - Shows current user's removal automation stats
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get automation capabilities
    const capabilities = getAllAutomatableBrokers();
    const browserlessUsage = getBrowserlessUsage();

    // Get user's removal stats by method
    const [byMethod, byStatus] = await Promise.all([
      prisma.removalRequest.groupBy({
        by: ["method"],
        where: { userId: session.user.id },
        _count: { id: true },
      }),
      prisma.removalRequest.groupBy({
        by: ["status"],
        where: { userId: session.user.id },
        _count: { id: true },
      }),
    ]);

    const methodStats = Object.fromEntries(
      byMethod.map((m) => [m.method, m._count.id])
    );
    const statusStats = Object.fromEntries(
      byStatus.map((s) => [s.status, s._count.id])
    );

    // Calculate user's automation rate
    const totalRemovals = byMethod.reduce((sum, m) => sum + m._count.id, 0);
    const automatedRemovals =
      (methodStats["AUTO_EMAIL"] || 0) +
      (methodStats["AUTO_FORM"] || 0) +
      (methodStats["EMAIL"] || 0);
    const userAutomationRate =
      totalRemovals > 0
        ? Math.round((automatedRemovals / totalRemovals) * 100)
        : 0;

    return NextResponse.json({
      systemCapabilities: {
        browserAutomation: {
          enabled: isAutomationEnabled(),
          provider: isAutomationEnabled() ? "Browserless.io" : "Not configured",
          usage: browserlessUsage,
        },
        captchaSolver: {
          enabled: isCaptchaSolverEnabled(),
          provider: isCaptchaSolverEnabled() ? "CapSolver" : "Not configured",
        },
        brokerCoverage: {
          total: capabilities.total,
          formAutomated: capabilities.stats.formCount,
          emailAutomated: capabilities.stats.emailCount,
          manualOnly: capabilities.stats.manualCount,
          automationRate: capabilities.stats.automationRate,
        },
      },
      userStats: {
        totalRemovals,
        byMethod: methodStats,
        byStatus: statusStats,
        automationRate: userAutomationRate,
        automated: automatedRemovals,
        manual:
          (methodStats["MANUAL_GUIDE"] || 0) +
          (methodStats["FORM"] || 0) -
          (methodStats["AUTO_FORM"] || 0),
      },
      recommendations: getRecommendations(capabilities, methodStats, statusStats),
    });
  } catch (error) {
    console.error("Automation stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch automation stats" },
      { status: 500 }
    );
  }
}

function getRecommendations(
  capabilities: ReturnType<typeof getAllAutomatableBrokers>,
  _methodStats: Record<string, number>,
  statusStats: Record<string, number>
): string[] {
  const recommendations: string[] = [];

  if (capabilities.stats.formCount === 0) {
    recommendations.push(
      "Form automation blocked by Cloudflare on all brokers. Email automation is being used as fallback."
    );
  }

  if (capabilities.stats.emailCount > 0) {
    recommendations.push(
      `${capabilities.stats.emailCount} brokers support automated CCPA/GDPR email requests.`
    );
  }

  const pendingManual = statusStats["REQUIRES_MANUAL"] || 0;
  if (pendingManual > 0) {
    recommendations.push(
      `${pendingManual} removal(s) require manual action - visit the Manual Review page to complete them.`
    );
  }

  const failed = statusStats["FAILED"] || 0;
  if (failed > 0) {
    recommendations.push(
      `${failed} removal(s) failed and may be retried automatically.`
    );
  }

  return recommendations;
}
