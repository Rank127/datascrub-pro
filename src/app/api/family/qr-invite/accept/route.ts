/**
 * Accept QR Code Family Invitation
 *
 * POST - Accept a QR code invitation to join a family group
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { acceptQRInvite } from "@/lib/family/qr-invite";
import { getEffectivePlanDetails } from "@/lib/family/family-service";
import { z } from "zod";

const acceptSchema = z.object({
  token: z.string().min(1, "Invitation token is required"),
});

/**
 * POST /api/family/qr-invite/accept
 *
 * Accept a QR code invitation to join a family group.
 * User must be logged in and not already in a family group.
 *
 * Request body:
 * {
 *   token: string  // The invitation token from the QR code URL
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   message?: string,
 *   planDetails?: {
 *     plan: string,
 *     planSource: string,
 *     familyInfo: {...}
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Please sign in to accept this invitation",
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { token } = acceptSchema.parse(body);

    // Accept the invitation
    const result = await acceptQRInvite(token, userId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Get updated plan details to return to user
    const planDetails = await getEffectivePlanDetails(userId);

    return NextResponse.json({
      success: true,
      message: "Welcome to the family! You now have Enterprise access.",
      planDetails: {
        plan: planDetails.plan,
        planSource: planDetails.source,
        familyInfo: planDetails.familyInfo,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }

    console.error("[API /family/qr-invite/accept] Error:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
