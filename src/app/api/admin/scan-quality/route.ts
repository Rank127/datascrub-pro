import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get scanner health stats from last 7 days
    const healthLogs = await prisma.scannerHealthLog.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: {
        scannerName: true,
        scannerType: true,
        status: true,
        errorType: true,
        responseTimeMs: true,
        resultsFound: true,
        proxyUsed: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5000,
    });

    // Aggregate per-scanner stats
    const scannerMap = new Map<string, {
      name: string;
      type: string;
      totalScans: number;
      successCount: number;
      failedCount: number;
      blockedCount: number;
      timeoutCount: number;
      emptyCount: number;
      skippedCount: number;
      avgResponseTimeMs: number;
      totalResults: number;
      proxyTiers: Record<string, number>;
      errorTypes: Record<string, number>;
      last24h: { success: number; failed: number };
    }>();

    for (const log of healthLogs) {
      let stats = scannerMap.get(log.scannerName);
      if (!stats) {
        stats = {
          name: log.scannerName,
          type: log.scannerType,
          totalScans: 0,
          successCount: 0,
          failedCount: 0,
          blockedCount: 0,
          timeoutCount: 0,
          emptyCount: 0,
          skippedCount: 0,
          avgResponseTimeMs: 0,
          totalResults: 0,
          proxyTiers: {},
          errorTypes: {},
          last24h: { success: 0, failed: 0 },
        };
        scannerMap.set(log.scannerName, stats);
      }

      stats.totalScans++;
      stats.totalResults += log.resultsFound;
      stats.avgResponseTimeMs += log.responseTimeMs ?? 0;

      switch (log.status) {
        case "SUCCESS": stats.successCount++; break;
        case "FAILED": stats.failedCount++; break;
        case "BLOCKED": stats.blockedCount++; break;
        case "TIMEOUT": stats.timeoutCount++; break;
        case "EMPTY": stats.emptyCount++; break;
        case "SKIPPED": stats.skippedCount++; break;
      }

      if (log.proxyUsed) {
        stats.proxyTiers[log.proxyUsed] = (stats.proxyTiers[log.proxyUsed] || 0) + 1;
      }

      if (log.errorType) {
        stats.errorTypes[log.errorType] = (stats.errorTypes[log.errorType] || 0) + 1;
      }

      if (log.createdAt >= oneDayAgo) {
        if (log.status === "SUCCESS") stats.last24h.success++;
        else if (["FAILED", "BLOCKED", "TIMEOUT"].includes(log.status)) stats.last24h.failed++;
      }
    }

    // Finalize averages and build sorted array
    const scanners = Array.from(scannerMap.values())
      .map(s => ({
        ...s,
        avgResponseTimeMs: s.totalScans > 0 ? Math.round(s.avgResponseTimeMs / s.totalScans) : 0,
        successRate: s.totalScans > 0 ? Math.round((s.successCount / s.totalScans) * 100) : 0,
      }))
      .sort((a, b) => b.totalScans - a.totalScans);

    // Aggregate error breakdown
    const errorBreakdown: Record<string, number> = {};
    for (const s of scanners) {
      for (const [type, count] of Object.entries(s.errorTypes)) {
        errorBreakdown[type] = (errorBreakdown[type] || 0) + count;
      }
    }

    // Overall stats
    const totalScans = healthLogs.length;
    const successTotal = healthLogs.filter(l => l.status === "SUCCESS").length;
    const failedTotal = healthLogs.filter(l => ["FAILED", "BLOCKED", "TIMEOUT"].includes(l.status)).length;

    // Confidence distribution from exposures
    const confidenceDist = await prisma.exposure.groupBy({
      by: ["matchClassification"],
      where: { firstFoundAt: { gte: sevenDaysAgo } },
      _count: true,
    });

    return NextResponse.json({
      period: { from: sevenDaysAgo.toISOString(), to: now.toISOString() },
      overview: {
        totalScans,
        successRate: totalScans > 0 ? Math.round((successTotal / totalScans) * 100) : 0,
        failedTotal,
        activeScanners: scanners.filter(s => s.last24h.success > 0 || s.last24h.failed > 0).length,
        totalScanners: scanners.length,
      },
      scanners,
      errorBreakdown,
      confidenceDistribution: confidenceDist.map(d => ({
        classification: d.matchClassification,
        count: d._count,
      })),
    });
  } catch (error) {
    console.error("Scan quality error:", error);
    return NextResponse.json({ error: "Failed to fetch scan quality" }, { status: 500 });
  }
}
