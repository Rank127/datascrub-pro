import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  sendVerificationCode,
  generateVerificationCode,
  formatPhoneE164,
  isValidPhoneNumber,
  isUSPhoneNumber,
  isSMSConfigured,
} from "@/lib/sms";
import { getEffectivePlan } from "@/lib/family";

// Store pending phone numbers and codes for verification
const pendingVerifications = new Map<string, { phone: string; code: string; expires: Date }>();

/**
 * GET /api/user/sms - Get SMS settings
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        plan: true,
        smsNotifications: true,
        smsPhone: true,
        smsPhoneVerified: true,
        smsExposureAlerts: true,
        smsRemovalUpdates: true,
        smsBreachAlerts: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const effectivePlan = await getEffectivePlan(session.user.id);
    const isEnterprise = effectivePlan === "ENTERPRISE";

    console.log("[SMS API] User DB plan:", user.plan, "effective:", effectivePlan, "isEnterprise:", isEnterprise);

    return NextResponse.json({
      ...user,
      smsConfigured: isSMSConfigured(),
      smsAvailable: isEnterprise && isSMSConfigured(),
      // Mask phone number for privacy
      smsPhone: user.smsPhone ? maskPhone(user.smsPhone) : null,
    });
  } catch (error) {
    console.error("[SMS API] Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch SMS settings" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/sms - Update SMS preferences (Enterprise only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has Enterprise plan (including family membership)
    const effectivePlan = await getEffectivePlan(session.user.id);

    if (effectivePlan !== "ENTERPRISE") {
      return NextResponse.json(
        { error: "SMS notifications require an Enterprise subscription" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      smsNotifications,
      smsExposureAlerts,
      smsRemovalUpdates,
      smsBreachAlerts,
    } = body;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(typeof smsNotifications === "boolean" && { smsNotifications }),
        ...(typeof smsExposureAlerts === "boolean" && { smsExposureAlerts }),
        ...(typeof smsRemovalUpdates === "boolean" && { smsRemovalUpdates }),
        ...(typeof smsBreachAlerts === "boolean" && { smsBreachAlerts }),
      },
      select: {
        smsNotifications: true,
        smsExposureAlerts: true,
        smsRemovalUpdates: true,
        smsBreachAlerts: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[SMS API] Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update SMS settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/sms - Add phone number and send verification (Enterprise only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has Enterprise plan (including family membership)
    const effectivePlanPost = await getEffectivePlan(session.user.id);

    if (effectivePlanPost !== "ENTERPRISE") {
      return NextResponse.json(
        { error: "SMS notifications require an Enterprise subscription" },
        { status: 403 }
      );
    }

    if (!isSMSConfigured()) {
      return NextResponse.json(
        { error: "SMS service not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { phone, action } = body;

    // Handle verification code submission
    if (action === "verify") {
      const { code } = body;
      const pending = pendingVerifications.get(session.user.id);

      if (!pending) {
        return NextResponse.json(
          { error: "No verification pending. Please request a new code." },
          { status: 400 }
        );
      }

      if (new Date() > pending.expires) {
        pendingVerifications.delete(session.user.id);
        return NextResponse.json(
          { error: "Code expired. Please request a new code." },
          { status: 400 }
        );
      }

      // Verify code locally (cost-effective vs Twilio Verify)
      if (code !== pending.code) {
        return NextResponse.json(
          { error: "Invalid verification code" },
          { status: 400 }
        );
      }

      // Code is valid - update user
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          smsPhone: pending.phone,
          smsPhoneVerified: true,
          smsNotifications: true,
        },
      });

      pendingVerifications.delete(session.user.id);

      return NextResponse.json({
        success: true,
        message: "Phone number verified successfully",
      });
    }

    // Handle new phone number submission
    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    if (!isValidPhoneNumber(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // US numbers only
    if (!isUSPhoneNumber(phone)) {
      return NextResponse.json(
        { error: "SMS notifications are only available for US phone numbers" },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhoneE164(phone);

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Send verification code via regular SMS (cost-effective)
    const result = await sendVerificationCode(formattedPhone, verificationCode);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send verification code" },
        { status: 500 }
      );
    }

    // Store pending verification with code and 10-minute expiration
    pendingVerifications.set(session.user.id, {
      phone: formattedPhone,
      code: verificationCode,
      expires: new Date(Date.now() + 10 * 60 * 1000),
    });

    return NextResponse.json({
      success: true,
      message: "Verification code sent",
      phone: maskPhone(formattedPhone),
    });
  } catch (error) {
    console.error("[SMS API] Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/sms - Remove phone number (Enterprise only)
 */
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has Enterprise plan (including family membership)
    const effectivePlanDel = await getEffectivePlan(session.user.id);

    if (effectivePlanDel !== "ENTERPRISE") {
      return NextResponse.json(
        { error: "SMS notifications require an Enterprise subscription" },
        { status: 403 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        smsPhone: null,
        smsPhoneVerified: false,
        smsNotifications: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Phone number removed",
    });
  } catch (error) {
    console.error("[SMS API] Error removing phone:", error);
    return NextResponse.json(
      { error: "Failed to remove phone number" },
      { status: 500 }
    );
  }
}

/**
 * Mask phone number for display (e.g., +1******7890)
 */
function maskPhone(phone: string): string {
  if (phone.length < 4) return phone;
  const visible = phone.slice(-4);
  const masked = phone.slice(0, -4).replace(/\d/g, "*");
  return masked + visible;
}
