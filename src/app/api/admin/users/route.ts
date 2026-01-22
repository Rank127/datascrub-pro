import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole, checkPermission } from "@/lib/admin";
import { maskUserListItem, logDataAccess } from "@/lib/rbac";
import { z } from "zod";

// GET /api/admin/users - List all users (with role-based masking)
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's role
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });

    const role = getEffectiveRole(currentUser?.email, currentUser?.role);

    // Check permission
    if (!checkPermission(currentUser?.email, currentUser?.role, "view_users_list")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const roleFilter = searchParams.get("role") || "";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (roleFilter) {
      where.role = roleFilter;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          plan: true,
          createdAt: true,
          emailVerified: true,
          _count: {
            select: {
              exposures: true,
              scans: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Log the data access
    await logDataAccess(
      { id: session.user.id, email: currentUser?.email || "", role },
      "VIEW_USER_LIST",
      "users",
      undefined,
      undefined,
      request
    );

    // Mask PII based on role
    const canSeeFullPII = checkPermission(currentUser?.email, currentUser?.role, "view_full_pii");

    const maskedUsers = users.map(user => {
      if (canSeeFullPII || user.id === session.user.id) {
        return user;
      }
      return maskUserListItem(user);
    });

    return NextResponse.json({
      users: maskedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users - Update user role or plan
const updateUserSchema = z.object({
  userId: z.string(),
  role: z.enum(["USER", "SEO_MANAGER", "SUPPORT", "ADMIN", "LEGAL", "SUPER_ADMIN"]).optional(),
  plan: z.enum(["FREE", "PRO", "ENTERPRISE"]).optional(),
});

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = updateUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const { userId, role: newRole, plan: newPlan } = result.data;

    // Get current user's role
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });

    const actorRole = getEffectiveRole(currentUser?.email, currentUser?.role);

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, plan: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: Record<string, string> = {};

    // Handle role change
    if (newRole) {
      if (!checkPermission(currentUser?.email, currentUser?.role, "modify_user_role")) {
        return NextResponse.json(
          { error: "You don't have permission to change roles" },
          { status: 403 }
        );
      }

      // Can't change to a role higher than your own (except SUPER_ADMIN)
      const { ROLE_HIERARCHY } = await import("@/lib/rbac/roles");
      if (ROLE_HIERARCHY[newRole] >= ROLE_HIERARCHY[actorRole] && actorRole !== "SUPER_ADMIN") {
        return NextResponse.json(
          { error: "Cannot assign a role equal to or higher than your own" },
          { status: 403 }
        );
      }

      updateData.role = newRole;

      // Log role change
      const { logRoleChange } = await import("@/lib/rbac/audit-log");
      await logRoleChange(
        { id: session.user.id, email: currentUser?.email || "", role: actorRole },
        { id: targetUser.id, email: targetUser.email },
        targetUser.role,
        newRole,
        request
      );
    }

    // Handle plan change
    if (newPlan) {
      if (!checkPermission(currentUser?.email, currentUser?.role, "modify_user_plan")) {
        return NextResponse.json(
          { error: "You don't have permission to change plans" },
          { status: 403 }
        );
      }

      updateData.plan = newPlan;

      // Log data access
      await logDataAccess(
        { id: session.user.id, email: currentUser?.email || "", role: actorRole },
        "MODIFY_USER",
        "users",
        targetUser.id,
        { id: targetUser.id, email: targetUser.email },
        request
      );
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
