import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Check if user is an admin
async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, role: true },
  });

  if (!user) return false;

  // Check if user has admin role
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    return true;
  }

  // Check ADMIN_EMAILS environment variable
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) || [];
  return adminEmails.includes(user.email || "");
}

// POST /api/admin/reset-exposures - Clear all exposures and related data for current user
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin status
    const admin = await isAdmin(session.user.id);
    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { targetUserId, confirmDelete } = body;

    // Use target user ID if provided (for admin to clear another user's data), otherwise current user
    const userIdToReset = targetUserId || session.user.id;

    if (!confirmDelete) {
      // Return stats about what would be deleted
      const [exposureCount, removalCount, scanCount, whitelistCount] = await Promise.all([
        prisma.exposure.count({ where: { userId: userIdToReset } }),
        prisma.removalRequest.count({ where: { userId: userIdToReset } }),
        prisma.scan.count({ where: { userId: userIdToReset } }),
        prisma.whitelist.count({ where: { userId: userIdToReset } }),
      ]);

      return NextResponse.json({
        preview: true,
        message: "This will delete the following data:",
        data: {
          exposures: exposureCount,
          removalRequests: removalCount,
          scans: scanCount,
          whitelistItems: whitelistCount,
        },
        userId: userIdToReset,
      });
    }

    // Delete in correct order (respecting foreign key constraints)
    // 1. First delete removal requests (they reference exposures)
    const deletedRemovals = await prisma.removalRequest.deleteMany({
      where: { userId: userIdToReset },
    });

    // 2. Delete whitelist entries
    const deletedWhitelist = await prisma.whitelist.deleteMany({
      where: { userId: userIdToReset },
    });

    // 3. Delete exposures (some might be referenced by scans)
    const deletedExposures = await prisma.exposure.deleteMany({
      where: { userId: userIdToReset },
    });

    // 4. Delete scans
    const deletedScans = await prisma.scan.deleteMany({
      where: { userId: userIdToReset },
    });

    return NextResponse.json({
      success: true,
      message: "All exposure data cleared successfully",
      deleted: {
        exposures: deletedExposures.count,
        removalRequests: deletedRemovals.count,
        scans: deletedScans.count,
        whitelistItems: deletedWhitelist.count,
      },
      userId: userIdToReset,
    });
  } catch (error) {
    console.error("Error resetting exposures:", error);
    return NextResponse.json(
      { error: "Failed to reset exposure data" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reset-exposures - Alternative method using DELETE verb
export async function DELETE(request: Request) {
  // Delegate to POST handler
  return POST(request);
}
