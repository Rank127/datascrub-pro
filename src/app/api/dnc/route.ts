import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  getDNCRegistrations,
  addDNCRegistration,
  getDNCStats,
  getDNCInfo,
  checkDNCAccess,
} from "@/lib/dnc";

// GET /api/dnc - Get all DNC registrations for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check access
    const access = await checkDNCAccess(session.user.id);
    if (!access.hasAccess) {
      return NextResponse.json({ error: access.reason }, { status: 403 });
    }

    const [registrations, stats, info] = await Promise.all([
      getDNCRegistrations(session.user.id),
      getDNCStats(session.user.id),
      Promise.resolve(getDNCInfo()),
    ]);

    return NextResponse.json({
      registrations,
      stats,
      info,
    });
  } catch (error) {
    console.error("Error fetching DNC registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch DNC registrations" },
      { status: 500 }
    );
  }
}

// POST /api/dnc - Add a new phone number for DNC registration
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { phoneNumber, phoneType } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const result = await addDNCRegistration(session.user.id, {
      phoneNumber,
      phoneType,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      registration: result.registration,
    });
  } catch (error) {
    console.error("Error adding DNC registration:", error);
    return NextResponse.json(
      { error: "Failed to add DNC registration" },
      { status: 500 }
    );
  }
}
