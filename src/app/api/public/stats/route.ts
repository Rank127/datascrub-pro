import { NextResponse } from "next/server";
import { getPublicStats } from "@/lib/stats";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const stats = await getPublicStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[public-stats] Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
