import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const removals = await prisma.removalRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        exposure: {
          select: {
            id: true,
            source: true,
            sourceName: true,
            sourceUrl: true,
            dataType: true,
            dataPreview: true,
            severity: true,
          },
        },
      },
    });

    // Get stats
    const stats = await prisma.removalRequest.groupBy({
      by: ["status"],
      where: { userId: session.user.id },
      _count: true,
    });

    return NextResponse.json({
      removals,
      stats: Object.fromEntries(stats.map((s) => [s.status, s._count])),
    });
  } catch (error) {
    console.error("Removals fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch removal requests" },
      { status: 500 }
    );
  }
}
