import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getBrokerCount } from "@/lib/removers/data-broker-directory";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [confirmedCount, projectedCount, checkingCount, totalActive] = await Promise.all([
      // Confirmed exposures (score >= 75)
      prisma.exposure.count({
        where: {
          userId,
          status: "ACTIVE",
          isWhitelisted: false,
          confidenceScore: { gte: 75 },
          matchClassification: { notIn: ["CHECKING", "PROJECTED"] },
        },
      }),
      // Projected exposures
      prisma.exposure.count({
        where: {
          userId,
          status: "ACTIVE",
          isWhitelisted: false,
          matchClassification: "PROJECTED",
        },
      }),
      // Checking entries
      prisma.exposure.count({
        where: {
          userId,
          status: "ACTIVE",
          isWhitelisted: false,
          matchClassification: "CHECKING",
        },
      }),
      // All active (excluding checking)
      prisma.exposure.count({
        where: {
          userId,
          status: "ACTIVE",
          isWhitelisted: false,
          matchClassification: { not: "CHECKING" },
        },
      }),
    ]);

    const totalKnownBrokers = getBrokerCount();

    return NextResponse.json({
      confirmed: confirmedCount,
      projected: projectedCount,
      checking: checkingCount,
      totalActive,
      totalKnownBrokers,
      // Industry benchmarks
      benchmarks: {
        malwarebytes: { scannedSites: 85, avgExposures: 63 },
        deleteme: { scannedSites: 750, avgExposures: 35 },
        incogni: { scannedSites: 180, avgExposures: 45 },
      },
    }, {
      headers: { "Cache-Control": "private, s-maxage=60, stale-while-revalidate=120" },
    });
  } catch (error) {
    console.error("Scan comparison error:", error);
    return NextResponse.json({ error: "Failed to fetch scan comparison" }, { status: 500 });
  }
}
