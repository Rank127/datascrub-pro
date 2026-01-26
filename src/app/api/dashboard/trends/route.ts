import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface TrendDataPoint {
  date: string;
  value: number;
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "6m";

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let groupBy: "day" | "week" | "month";

    switch (period) {
      case "1m":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = "day";
        break;
      case "3m":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        groupBy = "week";
        break;
      case "6m":
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        groupBy = "month";
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        groupBy = "month";
        break;
      default:
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        groupBy = "month";
    }

    // Fetch exposures and removals within the period
    const [exposures, removals] = await Promise.all([
      prisma.exposure.findMany({
        where: {
          userId,
          firstFoundAt: { gte: startDate },
        },
        select: {
          firstFoundAt: true,
        },
        orderBy: { firstFoundAt: "asc" },
      }),
      prisma.removalRequest.findMany({
        where: {
          userId,
          status: "COMPLETED",
          completedAt: { gte: startDate },
        },
        select: {
          completedAt: true,
        },
        orderBy: { completedAt: "asc" },
      }),
    ]);

    // Group data by period
    const groupData = (items: { date: Date | null }[], groupBy: "day" | "week" | "month"): TrendDataPoint[] => {
      const grouped = new Map<string, number>();

      for (const item of items) {
        if (!item.date) continue;
        const date = new Date(item.date);
        let key: string;

        if (groupBy === "day") {
          key = date.toISOString().split("T")[0];
        } else if (groupBy === "week") {
          // Get the Monday of the week
          const day = date.getDay();
          const diff = date.getDate() - day + (day === 0 ? -6 : 1);
          const monday = new Date(date.setDate(diff));
          key = monday.toISOString().split("T")[0];
        } else {
          // Month
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        }

        grouped.set(key, (grouped.get(key) || 0) + 1);
      }

      // Fill in missing periods with 0
      const result: TrendDataPoint[] = [];
      const current = new Date(startDate);

      while (current <= now) {
        let key: string;

        if (groupBy === "day") {
          key = current.toISOString().split("T")[0];
          current.setDate(current.getDate() + 1);
        } else if (groupBy === "week") {
          const day = current.getDay();
          const diff = current.getDate() - day + (day === 0 ? -6 : 1);
          const monday = new Date(current.setDate(diff));
          key = monday.toISOString().split("T")[0];
          current.setDate(current.getDate() + 7);
        } else {
          key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
          current.setMonth(current.getMonth() + 1);
        }

        result.push({
          date: key,
          value: grouped.get(key) || 0,
        });
      }

      // Remove duplicates (from week grouping)
      const seen = new Set<string>();
      return result.filter((item) => {
        if (seen.has(item.date)) return false;
        seen.add(item.date);
        return true;
      });
    };

    const exposureTrend = groupData(
      exposures.map((e) => ({ date: e.firstFoundAt })),
      groupBy
    );
    const removalTrend = groupData(
      removals.map((r) => ({ date: r.completedAt })),
      groupBy
    );

    // Calculate cumulative protection score over time
    // This shows how protection improved over time
    let totalExposures = 0;
    let totalRemovals = 0;
    const protectionTrend: TrendDataPoint[] = exposureTrend.map((exp, index) => {
      totalExposures += exp.value;
      totalRemovals += removalTrend[index]?.value || 0;
      const score = totalExposures > 0 ? Math.round((totalRemovals / totalExposures) * 100) : 100;
      return {
        date: exp.date,
        value: Math.min(score, 100),
      };
    });

    return NextResponse.json({
      period,
      groupBy,
      exposures: exposureTrend,
      removals: removalTrend,
      protectionScore: protectionTrend,
    });
  } catch (error) {
    console.error("Dashboard trends error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard trends" },
      { status: 500 }
    );
  }
}
