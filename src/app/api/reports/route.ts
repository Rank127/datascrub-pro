import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all exposures for the user
    const exposures = await prisma.exposure.findMany({
      where: { userId },
      include: {
        removalRequest: true,
      },
    });

    // Get completed removal requests with timing data
    const completedRemovals = await prisma.removalRequest.findMany({
      where: {
        userId,
        status: "COMPLETED",
        submittedAt: { not: null },
        completedAt: { not: null },
      },
    });

    // Calculate summary stats
    const totalExposures = exposures.length;
    const removedExposures = exposures.filter(e => e.status === "REMOVED").length;
    const activeExposures = exposures.filter(e => e.status === "ACTIVE").length;
    const pendingRemovals = exposures.filter(e =>
      e.status === "REMOVAL_PENDING" || e.status === "REMOVAL_IN_PROGRESS"
    ).length;

    // Calculate unique sources monitored
    const uniqueSources = new Set(exposures.map(e => e.source));
    const sourcesMonitored = uniqueSources.size;

    // Calculate average removal time in days
    let averageRemovalTime = "N/A";
    if (completedRemovals.length > 0) {
      const totalDays = completedRemovals.reduce((acc, r) => {
        if (r.submittedAt && r.completedAt) {
          const days = (r.completedAt.getTime() - r.submittedAt.getTime()) / (1000 * 60 * 60 * 24);
          return acc + days;
        }
        return acc;
      }, 0);
      const avgDays = totalDays / completedRemovals.length;
      averageRemovalTime = avgDays > 0 ? `${avgDays.toFixed(1)} days` : "< 1 day";
    }

    // Calculate risk score reduction
    // Risk based on severity: CRITICAL=40, HIGH=25, MEDIUM=10, LOW=5
    const severityScore: Record<string, number> = {
      CRITICAL: 40,
      HIGH: 25,
      MEDIUM: 10,
      LOW: 5,
    };

    const initialRiskScore = exposures.reduce((acc, e) => acc + (severityScore[e.severity] || 5), 0);
    const currentRiskScore = exposures
      .filter(e => e.status === "ACTIVE" || e.status === "REMOVAL_PENDING" || e.status === "REMOVAL_IN_PROGRESS")
      .reduce((acc, e) => acc + (severityScore[e.severity] || 5), 0);

    let riskScoreReduction = 0;
    if (initialRiskScore > 0) {
      riskScoreReduction = Math.round(((initialRiskScore - currentRiskScore) / initialRiskScore) * 100);
    }

    // Calculate progress percentages by source type
    const dataBrokerExposures = exposures.filter(e =>
      ["SPOKEO", "WHITEPAGES", "BEENVERIFIED", "INTELIUS", "PEOPLEFINDER", "TRUEPEOPLESEARCH", "RADARIS"].includes(e.source)
    );
    const breachExposures = exposures.filter(e =>
      ["HAVEIBEENPWNED", "DEHASHED", "BREACH_DB"].includes(e.source)
    );
    const socialExposures = exposures.filter(e =>
      ["LINKEDIN", "FACEBOOK", "TWITTER", "INSTAGRAM", "TIKTOK", "REDDIT"].includes(e.source)
    );

    const calculateProgress = (items: typeof exposures) => {
      if (items.length === 0) return 0;
      const removed = items.filter(e => e.status === "REMOVED" || e.status === "WHITELISTED").length;
      return Math.round((removed / items.length) * 100);
    };

    const progress = {
      dataBroker: calculateProgress(dataBrokerExposures),
      breach: calculateProgress(breachExposures),
      social: calculateProgress(socialExposures),
    };

    // Generate monthly reports from actual data
    const monthlyReports = generateMonthlyReports(exposures);

    return NextResponse.json({
      summary: {
        totalExposuresRemoved: removedExposures,
        riskScoreReduction,
        sourcesMonitored,
        averageRemovalTime,
        totalExposures,
        activeExposures,
        pendingRemovals,
      },
      progress,
      reports: monthlyReports,
    });
  } catch (error) {
    console.error("Reports fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

interface ExposureWithRequest {
  id: string;
  status: string;
  severity: string;
  firstFoundAt: Date;
  removalRequest: {
    completedAt: Date | null;
  } | null;
}

function generateMonthlyReports(exposures: ExposureWithRequest[]) {
  // Group exposures by month
  const monthlyData: Record<string, { newExposures: number; removedExposures: number; riskChange: number }> = {};

  const severityScore: Record<string, number> = {
    CRITICAL: 40,
    HIGH: 25,
    MEDIUM: 10,
    LOW: 5,
  };

  exposures.forEach(exposure => {
    // Track when exposures were found
    const foundMonth = new Date(exposure.firstFoundAt).toISOString().slice(0, 7); // YYYY-MM
    if (!monthlyData[foundMonth]) {
      monthlyData[foundMonth] = { newExposures: 0, removedExposures: 0, riskChange: 0 };
    }
    monthlyData[foundMonth].newExposures++;
    monthlyData[foundMonth].riskChange += severityScore[exposure.severity] || 5;

    // Track when exposures were removed
    if (exposure.status === "REMOVED" && exposure.removalRequest?.completedAt) {
      const removedMonth = new Date(exposure.removalRequest.completedAt).toISOString().slice(0, 7);
      if (!monthlyData[removedMonth]) {
        monthlyData[removedMonth] = { newExposures: 0, removedExposures: 0, riskChange: 0 };
      }
      monthlyData[removedMonth].removedExposures++;
      monthlyData[removedMonth].riskChange -= severityScore[exposure.severity] || 5;
    }
  });

  // Convert to array and sort by date (newest first)
  const reports = Object.entries(monthlyData)
    .map(([monthKey, data]) => {
      const date = new Date(monthKey + "-01");
      return {
        id: monthKey,
        period: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        generatedAt: new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split("T")[0], // Last day of month
        stats: {
          newExposures: data.newExposures,
          removedExposures: data.removedExposures,
          riskScoreChange: data.riskChange > 0 ? data.riskChange : -Math.abs(data.riskChange),
        },
      };
    })
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 12); // Last 12 months

  return reports;
}
