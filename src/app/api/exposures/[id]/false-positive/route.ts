import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { markExposureFalsePositive } from "@/lib/removers/removal-service";
import { z } from "zod";

const fpSchema = z.object({
  reason: z.enum(["USER_REJECTED", "BROKER_NOT_FOUND"]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: exposureId } = await params;

    const body = await request.json();
    const parsed = fpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request. Provide reason: USER_REJECTED or BROKER_NOT_FOUND" },
        { status: 400 }
      );
    }

    const result = await markExposureFalsePositive(
      exposureId,
      session.user.id,
      parsed.data.reason
    );

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error("[FalsePositive API] Error:", error);
    return NextResponse.json(
      { error: "Failed to mark as false positive" },
      { status: 500 }
    );
  }
}
