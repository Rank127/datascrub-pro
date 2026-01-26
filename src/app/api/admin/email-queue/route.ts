import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole } from "@/lib/admin";
import { processEmailQueue, getEmailQueueStatus, getEmailQuotaStatus } from "@/lib/email";

// GET - Get queue status
export async function GET() {
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

    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [queueStatus, quotaStatus] = await Promise.all([
      getEmailQueueStatus(),
      Promise.resolve(getEmailQuotaStatus()),
    ]);

    return NextResponse.json({
      queue: queueStatus,
      quota: quotaStatus,
    });
  } catch (error) {
    console.error("[Email Queue] GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Process queued emails
export async function POST(request: Request) {
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

    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden - SUPER_ADMIN only" }, { status: 403 });
    }

    // Parse optional limit from body
    let limit = 10;
    try {
      const body = await request.json();
      if (body.limit && typeof body.limit === "number") {
        limit = Math.min(body.limit, 50); // Max 50 at a time
      }
    } catch {
      // Body is optional
    }

    console.log(`[Email Queue] Processing queue (limit: ${limit}) triggered by ${currentUser.email}`);

    const result = await processEmailQueue(limit);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[Email Queue] POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
