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

      return NextResponse.json({ scan });
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

    return NextResponse.json({ scans });
  } catch (error) {
    console.error("Scan status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scan status" },
      { status: 500 }
    );
  }
}
