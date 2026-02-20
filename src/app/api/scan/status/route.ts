import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scanId = searchParams.get("scanId");

    if (scanId) {
      // Get specific scan
      const scan = await prisma.scan.findFirst({
        where: {
          id: scanId,
          userId: session.user.id,
        },
        include: {
          exposures: {
            orderBy: { severity: "desc" },
            take: 10,
          },
        },
      });

      if (!scan) {
        return NextResponse.json({ error: "Scan not found" }, { status: 404 });
      }

      // Flag scans that may be stuck (IN_PROGRESS for >5 minutes)
      const possiblyStuck = scan.status === "IN_PROGRESS" &&
        scan.startedAt &&
        Date.now() - new Date(scan.startedAt).getTime() > 5 * 60 * 1000;

      return NextResponse.json({ scan, possiblyStuck });
    }

    // Get all scans for user
    const scans = await prisma.scan.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        _count: {
          select: { exposures: true },
        },
      },
    });

    // Add possiblyStuck flag to each scan
    const scansWithStuckFlag = scans.map(scan => ({
      ...scan,
      possiblyStuck: scan.status === "IN_PROGRESS" &&
        scan.startedAt &&
        Date.now() - new Date(scan.startedAt).getTime() > 5 * 60 * 1000,
    }));

    return NextResponse.json({ scans: scansWithStuckFlag });
  } catch (error) {
    console.error("Scan status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scan status" },
      { status: 500 }
    );
  }
}
