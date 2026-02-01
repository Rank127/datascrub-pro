/**
 * Admin Family Management API
 *
 * GET - Diagnose family plan issues for a user
 * POST - Fix family plan issues (create family group, link members)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkPermission, getEffectiveRole } from "@/lib/admin";

/**
 * GET /api/admin/family?email=xxx or ?userId=xxx
 *
 * Diagnose family plan status for a user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin permission
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });

    if (!checkPermission(currentUser?.email, currentUser?.role, "view_users_list")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const userId = searchParams.get("userId");
    const search = searchParams.get("search"); // Search by name or email

    if (!email && !userId && !search) {
      return NextResponse.json(
        { error: "Provide email, userId, or search parameter" },
        { status: 400 }
      );
    }

    // Find the user
    let user;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
        },
      });
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          subscription: true,
        },
      });
    } else if (search) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ],
        },
        include: {
          subscription: true,
        },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user owns a family group
    const ownedFamilyGroup = await prisma.familyGroup.findUnique({
      where: { ownerId: user.id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, name: true, plan: true },
            },
          },
        },
        invitations: {
          where: { status: "PENDING" },
        },
      },
    });

    // Check if user is a member of a family group
    const familyMembership = await prisma.familyMember.findUnique({
      where: { userId: user.id },
      include: {
        familyGroup: {
          include: {
            owner: {
              select: { id: true, email: true, name: true, plan: true },

            },
            members: {
              include: {
                user: {
                  select: { id: true, email: true, name: true },
                },
              },
            },
          },
        },
      },
    });

    // Determine effective plan
    const effectivePlan = user.subscription?.plan || user.plan;
    const hasEnterprise = effectivePlan === "ENTERPRISE";

    // Build diagnosis
    const diagnosis = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        subscriptionPlan: user.subscription?.plan || null,
        subscriptionStatus: user.subscription?.status || null,
        stripeSubscriptionId: user.subscription?.stripeSubscriptionId || null,
        effectivePlan,
        hasEnterprise,
      },
      familyOwnership: ownedFamilyGroup
        ? {
            familyGroupId: ownedFamilyGroup.id,
            maxMembers: ownedFamilyGroup.maxMembers,
            memberCount: ownedFamilyGroup.members.length,
            pendingInvitations: ownedFamilyGroup.invitations.length,
            members: ownedFamilyGroup.members.map((m) => ({
              id: m.id,
              memberId: m.userId,
              email: m.user.email,
              name: m.user.name,
              role: m.role,
              plan: m.user.plan,
            })),
          }
        : null,
      familyMembership: familyMembership
        ? {
            familyGroupId: familyMembership.familyGroupId,
            role: familyMembership.role,
            ownerEmail: familyMembership.familyGroup.owner.email,
            ownerName: familyMembership.familyGroup.owner.name,
            ownerPlan: familyMembership.familyGroup.owner.plan,
          }
        : null,
      issues: [] as string[],
      recommendations: [] as string[],
    };

    // Check for issues
    if (hasEnterprise && !ownedFamilyGroup && !familyMembership) {
      diagnosis.issues.push("User has Enterprise plan but no family group exists");
      diagnosis.recommendations.push("Create family group for this user");
    }

    if (ownedFamilyGroup && !ownedFamilyGroup.members.some((m) => m.role === "OWNER")) {
      diagnosis.issues.push("Family group exists but owner is not in members list");
      diagnosis.recommendations.push("Add owner as OWNER member to family group");
    }

    if (hasEnterprise && ownedFamilyGroup && ownedFamilyGroup.members.length === 0) {
      diagnosis.issues.push("Family group has no members");
      diagnosis.recommendations.push("Add owner as first member");
    }

    if (user.plan !== effectivePlan) {
      diagnosis.issues.push(`User.plan (${user.plan}) doesn't match subscription.plan (${user.subscription?.plan})`);
      diagnosis.recommendations.push("Sync user.plan with subscription.plan");
    }

    return NextResponse.json(diagnosis);
  } catch (error) {
    console.error("[Admin Family] Diagnosis error:", error);
    return NextResponse.json(
      { error: "Failed to diagnose family plan" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/family
 *
 * Fix family plan issues for a user
 *
 * Body:
 * {
 *   userId: string,
 *   action: "create_family_group" | "add_owner_as_member" | "sync_plan" | "add_member"
 *   memberEmail?: string  // For add_member action
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin permission
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, role: true },
    });

    if (!checkPermission(currentUser?.email, currentUser?.role, "modify_user_plan")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action, memberEmail } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "userId and action are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const results: string[] = [];

    switch (action) {
      case "create_family_group": {
        // Check if family group already exists
        const existing = await prisma.familyGroup.findUnique({
          where: { ownerId: userId },
        });

        if (existing) {
          return NextResponse.json(
            { error: "Family group already exists", familyGroupId: existing.id },
            { status: 400 }
          );
        }

        // Create family group
        const familyGroup = await prisma.familyGroup.create({
          data: {
            ownerId: userId,
            maxMembers: 5,
          },
        });

        // Add owner as first member
        await prisma.familyMember.create({
          data: {
            familyGroupId: familyGroup.id,
            userId: userId,
            role: "OWNER",
          },
        });

        results.push(`Created family group: ${familyGroup.id}`);
        results.push(`Added owner as OWNER member`);
        break;
      }

      case "add_owner_as_member": {
        const familyGroup = await prisma.familyGroup.findUnique({
          where: { ownerId: userId },
        });

        if (!familyGroup) {
          return NextResponse.json(
            { error: "User doesn't own a family group" },
            { status: 400 }
          );
        }

        // Check if already a member
        const existingMember = await prisma.familyMember.findUnique({
          where: { userId },
        });

        if (existingMember) {
          results.push(`User is already a member (role: ${existingMember.role})`);
        } else {
          await prisma.familyMember.create({
            data: {
              familyGroupId: familyGroup.id,
              userId: userId,
              role: "OWNER",
            },
          });
          results.push(`Added owner as OWNER member to family group`);
        }
        break;
      }

      case "sync_plan": {
        const effectivePlan = user.subscription?.plan || "FREE";

        if (user.plan !== effectivePlan) {
          await prisma.user.update({
            where: { id: userId },
            data: { plan: effectivePlan },
          });
          results.push(`Synced user.plan from ${user.plan} to ${effectivePlan}`);
        } else {
          results.push(`Plans already in sync: ${user.plan}`);
        }
        break;
      }

      case "add_member": {
        if (!memberEmail) {
          return NextResponse.json(
            { error: "memberEmail is required for add_member action" },
            { status: 400 }
          );
        }

        const familyGroup = await prisma.familyGroup.findUnique({
          where: { ownerId: userId },
          include: { members: true },
        });

        if (!familyGroup) {
          return NextResponse.json(
            { error: "User doesn't own a family group" },
            { status: 400 }
          );
        }

        // Find the member to add
        const memberUser = await prisma.user.findUnique({
          where: { email: memberEmail.toLowerCase() },
        });

        if (!memberUser) {
          return NextResponse.json(
            { error: `User not found: ${memberEmail}` },
            { status: 404 }
          );
        }

        // Check if already a member
        const existingMembership = await prisma.familyMember.findUnique({
          where: { userId: memberUser.id },
        });

        if (existingMembership) {
          return NextResponse.json(
            { error: `User ${memberEmail} is already in a family group` },
            { status: 400 }
          );
        }

        // Check capacity
        if (familyGroup.members.length >= familyGroup.maxMembers) {
          return NextResponse.json(
            { error: "Family group is full" },
            { status: 400 }
          );
        }

        // Add member
        await prisma.familyMember.create({
          data: {
            familyGroupId: familyGroup.id,
            userId: memberUser.id,
            role: "MEMBER",
          },
        });

        results.push(`Added ${memberEmail} as MEMBER to family group`);
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    // Log the admin action
    const { logAudit } = await import("@/lib/rbac/audit-log");
    await logAudit({
      actorId: session.user.id,
      actorEmail: currentUser?.email || "",
      actorRole: getEffectiveRole(currentUser?.email, currentUser?.role),
      action: "MODIFY_USER",
      resource: "family_group",
      resourceId: userId,
      targetUserId: userId,
      targetEmail: user.email,
      details: { action, results, memberEmail },
    });

    return NextResponse.json({
      success: true,
      action,
      results,
    });
  } catch (error) {
    console.error("[Admin Family] Fix error:", error);
    return NextResponse.json(
      { error: "Failed to fix family plan" },
      { status: 500 }
    );
  }
}
