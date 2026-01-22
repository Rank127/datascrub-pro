import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  getDNCRegistration,
  submitDNCRegistration,
  verifyDNCStatus,
  removeDNCRegistration,
  checkDNCAccess,
} from "@/lib/dnc";

// GET /api/dnc/[id] - Get a specific DNC registration
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check access
    const access = await checkDNCAccess(session.user.id);
    if (!access.hasAccess) {
      return NextResponse.json({ error: access.reason }, { status: 403 });
    }

    const registration = await getDNCRegistration(session.user.id, id);

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ registration });
  } catch (error) {
    console.error("Error fetching DNC registration:", error);
    return NextResponse.json(
      { error: "Failed to fetch DNC registration" },
      { status: 500 }
    );
  }
}

// POST /api/dnc/[id] - Submit or verify a DNC registration
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    // Check access
    const access = await checkDNCAccess(session.user.id);
    if (!access.hasAccess) {
      return NextResponse.json({ error: access.reason }, { status: 403 });
    }

    if (action === "submit") {
      const result = await submitDNCRegistration(session.user.id, id);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: result.message,
      });
    }

    if (action === "verify") {
      const result = await verifyDNCStatus(session.user.id, id);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        isRegistered: result.isRegistered,
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'submit' or 'verify'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing DNC registration:", error);
    return NextResponse.json(
      { error: "Failed to process DNC registration" },
      { status: 500 }
    );
  }
}

// DELETE /api/dnc/[id] - Remove a DNC registration
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check access
    const access = await checkDNCAccess(session.user.id);
    if (!access.hasAccess) {
      return NextResponse.json({ error: access.reason }, { status: 403 });
    }

    const result = await removeDNCRegistration(session.user.id, id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing DNC registration:", error);
    return NextResponse.json(
      { error: "Failed to remove DNC registration" },
      { status: 500 }
    );
  }
}
