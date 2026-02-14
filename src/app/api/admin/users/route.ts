import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveRole, checkPermission } from "@/lib/admin";
import { maskUserListItem, logDataAccess } from "@/lib/rbac";
import { rateLimit, getClientIdentifier, rateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";

// GET /api/admin/users - List all users (with role-based masking)
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit admin endpoint
    const rl = await rateLimit(getClientIdentifier(request, session.user.id), "admin");
    if (!rl.success) return rateLimitResponse(rl);

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
    const planFilter = searchParams.get("plan") || "";
    const createdAfter = searchParams.get("createdAfter") || "";
    const includeExposureStats = searchParams.get("includeExposureStats") === "true";
    const includeRemovalStats = searchParams.get("includeRemovalStats") === "true";
    const hasSubmittedRemovals = searchParams.get("hasSubmittedRemovals") === "true";
    const hasCompletedRemovals = searchParams.get("hasCompletedRemovals") === "true";

    const where: Record<string, unknown> = {};

    // Filter for users with submitted removals
    if (hasSubmittedRemovals) {
      where.exposures = {
        some: {
          removalRequest: {
            isNot: null
          }
        }
      };
    }

    // Filter for users with completed removals
    if (hasCompletedRemovals) {
      where.exposures = {
        some: {
          removalRequest: {
            status: "COMPLETED"
          }
        }
      };
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (roleFilter) {
      where.role = roleFilter;
    }

    if (planFilter) {
      where.plan = planFilter;
    }

    if (createdAfter) {
      where.createdAt = { gte: new Date(createdAfter) };
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
          subscription: {
            select: {
              plan: true,
              status: true,
            },
          },
          familyMembership: {
            select: {
              role: true,
              familyGroup: {
                select: {
                  owner: {
                    select: {
                      email: true,
                      name: true,
                      subscription: {
                        select: { plan: true },
                      },
                    },
                  },
                },
              },
            },
          },
          ownedFamilyGroup: {
            select: {
              id: true,
              _count: {
                select: { members: true },
              },
              maxMembers: true,
            },
          },
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

    // Calculate effective plan for each user (considering family membership)
    const usersWithEffectivePlan = users.map(user => {
      let effectivePlan = user.subscription?.plan || user.plan;
      let planSource: "DIRECT" | "FAMILY" | "FREE" = effectivePlan === "FREE" ? "FREE" : "DIRECT";
      let familyRole: string | null = null;
      let familyOwner: string | null = null;

      // Check if user gets Enterprise through family membership
      if (effectivePlan !== "ENTERPRISE" && user.familyMembership) {
        const ownerPlan = user.familyMembership.familyGroup.owner.subscription?.plan;
        if (ownerPlan === "ENTERPRISE") {
          effectivePlan = "ENTERPRISE";
          planSource = "FAMILY";
          familyRole = user.familyMembership.role;
          familyOwner = user.familyMembership.familyGroup.owner.email;
        }
      }

      // Check if user owns a family group
      const familyGroupInfo = user.ownedFamilyGroup ? {
        memberCount: user.ownedFamilyGroup._count.members,
        maxMembers: user.ownedFamilyGroup.maxMembers,
      } : null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        effectivePlan,
        planSource,
        familyRole,
        familyOwner,
        familyGroupInfo,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
        _count: user._count,
      };
    });

    // If exposure stats requested, fetch detailed exposure data per user
    let usersWithExposureStats = usersWithEffectivePlan;
    if (includeExposureStats && users.length > 0) {
      const userIds = users.map(u => u.id);

      // Get exposure counts by status for each user
      const exposureStats = await prisma.exposure.groupBy({
        by: ["userId", "status"],
        where: { userId: { in: userIds } },
        _count: true,
      });

      // Build a map of userId -> stats
      const statsMap: Record<string, { total: number; removed: number; pending: number; inProgress: number }> = {};

      exposureStats.forEach(stat => {
        if (!statsMap[stat.userId]) {
          statsMap[stat.userId] = { total: 0, removed: 0, pending: 0, inProgress: 0 };
        }
        statsMap[stat.userId].total += stat._count;

        if (stat.status === "REMOVED" || stat.status === "VERIFIED_REMOVED") {
          statsMap[stat.userId].removed += stat._count;
        } else if (stat.status === "ACTIVE" || stat.status === "NEW") {
          statsMap[stat.userId].pending += stat._count;
        } else if (stat.status === "REMOVAL_IN_PROGRESS" || stat.status === "REMOVAL_PENDING") {
          statsMap[stat.userId].inProgress += stat._count;
        }
      });

      usersWithExposureStats = usersWithEffectivePlan.map(user => ({
        ...user,
        exposureStats: statsMap[user.id] || { total: 0, removed: 0, pending: 0, inProgress: 0 },
      }));
    }

    // If removal stats requested, fetch detailed removal data per user
    if (includeRemovalStats && usersWithExposureStats.length > 0) {
      const userIds = usersWithExposureStats.map(u => u.id);

      // Get removal request counts by status for each user (via their exposures)
      const removalStats = await prisma.removalRequest.groupBy({
        by: ["status"],
        where: {
          exposure: {
            userId: { in: userIds }
          }
        },
        _count: true,
      });

      // Get per-user removal stats
      const userRemovalStats = await prisma.removalRequest.findMany({
        where: {
          exposure: {
            userId: { in: userIds }
          }
        },
        select: {
          status: true,
          exposure: {
            select: {
              userId: true
            }
          }
        }
      });

      // Build a map of userId -> removal stats
      const removalStatsMap: Record<string, { total: number; submitted: number; inProgress: number; completed: number; failed: number; manual: number }> = {};

      userRemovalStats.forEach(removal => {
        const userId = removal.exposure.userId;
        if (!removalStatsMap[userId]) {
          removalStatsMap[userId] = { total: 0, submitted: 0, inProgress: 0, completed: 0, failed: 0, manual: 0 };
        }
        removalStatsMap[userId].total++;

        // Map actual database statuses to display categories
        const status = removal.status;
        if (status === "PENDING" || status === "SUBMITTED") {
          removalStatsMap[userId].submitted++;
        } else if (status === "ACKNOWLEDGED" || status === "IN_PROGRESS") {
          removalStatsMap[userId].inProgress++;
        } else if (status === "COMPLETED" || status === "VERIFIED_REMOVED") {
          removalStatsMap[userId].completed++;
        } else if (status === "FAILED") {
          removalStatsMap[userId].failed++;
        } else if (status === "REQUIRES_MANUAL") {
          removalStatsMap[userId].manual++;
        }
      });

      usersWithExposureStats = usersWithExposureStats.map(user => ({
        ...user,
        removalStats: removalStatsMap[user.id] || { total: 0, submitted: 0, inProgress: 0, completed: 0, failed: 0, manual: 0 },
      }));
    }

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

    const maskedUsers = usersWithExposureStats.map(user => {
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

      // Log plan change with details for tracking upgrades/downgrades
      const { logAudit } = await import("@/lib/rbac/audit-log");
      await logAudit({
        actorId: session.user.id,
        actorEmail: currentUser?.email || "",
        actorRole: actorRole,
        action: "UPDATE_USER_PLAN",
        resource: "user_plan",
        resourceId: targetUser.id,
        targetUserId: targetUser.id,
        targetEmail: targetUser.email,
        details: {
          previousPlan: targetUser.plan,
          newPlan: newPlan,
          userName: targetUser.email.split("@")[0],
        },
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
      });
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
