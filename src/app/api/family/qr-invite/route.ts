/**
 * Family QR Code Invitation API
 *
 * POST - Generate a new QR code invitation (owners only)
 * GET  - Get active invitations with QR codes (owners only)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  generateQRInvite,
  getActiveQRInvites,
  regenerateQRCode,
  canCreateInvitation,
} from "@/lib/family/qr-invite";
import { z } from "zod";

const generateSchema = z.object({
  size: z.number().min(100).max(1000).optional(),
  margin: z.number().min(0).max(10).optional(),
  dark: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  light: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

const regenerateSchema = z.object({
  invitationId: z.string(),
  size: z.number().min(100).max(1000).optional(),
  margin: z.number().min(0).max(10).optional(),
  dark: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  light: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

/**
 * POST /api/family/qr-invite
 *
 * Generate a new QR code invitation for family members.
 * Only Enterprise plan OWNERS can generate invitations.
 * Family members cannot invite others.
 *
 * Request body (optional):
 * {
 *   size?: number,      // QR code size (100-1000px, default 300)
 *   margin?: number,    // Margin (0-10, default 2)
 *   dark?: string,      // Dark color hex (default #000000)
 *   light?: string,     // Light color hex (default #ffffff)
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   qrCode: string,     // Base64 data URL for the QR code image
 *   inviteUrl: string,  // URL encoded in the QR code
 *   token: string,      // Invitation token
 *   expiresAt: string,  // ISO date when invitation expires
 *   spotsRemaining: number,
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if this is a regenerate request or new invite
    const body = await request.json().catch(() => ({}));

    if (body.invitationId) {
      // Regenerate QR for existing invitation
      const validated = regenerateSchema.parse(body);
      const result = await regenerateQRCode(validated.invitationId, userId, {
        size: validated.size,
        margin: validated.margin,
        dark: validated.dark,
        light: validated.light,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json(result);
    }

    // Generate new invitation
    const validated = generateSchema.parse(body);
    const result = await generateQRInvite(userId, {
      size: validated.size,
      margin: validated.margin,
      dark: validated.dark,
      light: validated.light,
    });

    if (!result.success) {
      // Determine appropriate status code
      const statusCode = result.error?.includes("Only the family plan owner")
        ? 403
        : result.error?.includes("Enterprise plan")
          ? 403
          : result.error?.includes("full")
            ? 400
            : 400;

      return NextResponse.json({ error: result.error }, { status: statusCode });
    }

    // Get updated spots info
    const { spotsRemaining } = await getActiveQRInvites(userId);

    return NextResponse.json({
      ...result,
      spotsRemaining,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid options", details: error.issues },
        { status: 400 }
      );
    }

    console.error("[API /family/qr-invite POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate QR invitation" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/family/qr-invite
 *
 * Get invitation permission status and active invitations.
 * Only accessible by family group owners.
 *
 * Response:
 * {
 *   canInvite: boolean,
 *   reason?: string,            // If canInvite is false
 *   spotsRemaining: number,
 *   invitations: [
 *     {
 *       id: string,
 *       token: string,
 *       createdAt: string,
 *       expiresAt: string,
 *       isQRInvite: boolean,
 *     }
 *   ]
 * }
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check permission
    const permission = await canCreateInvitation(userId);

    if (!permission.allowed) {
      return NextResponse.json({
        canInvite: false,
        reason: permission.reason,
        spotsRemaining: permission.spotsRemaining || 0,
        invitations: [],
      });
    }

    // Get active invitations
    const { invitations, spotsRemaining } = await getActiveQRInvites(userId);

    return NextResponse.json({
      canInvite: true,
      spotsRemaining,
      invitations: invitations.map((inv) => ({
        ...inv,
        createdAt: inv.createdAt.toISOString(),
        expiresAt: inv.expiresAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[API /family/qr-invite GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to get invitation status" },
      { status: 500 }
    );
  }
}
