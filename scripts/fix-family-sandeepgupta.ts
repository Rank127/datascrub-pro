/**
 * Fix script: Add sgmgsg@hotmail.com to sandeepgupta's family plan
 *
 * Run with: npx tsx scripts/fix-family-sandeepgupta.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Finding users...\n");

  // Find sandeepgupta (owner)
  const owner = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { contains: "sandeepgupta", mode: "insensitive" } },
        { name: { contains: "sandeepgupta", mode: "insensitive" } },
      ],
    },
    include: {
      subscription: true,
    },
  });

  if (!owner) {
    console.error("❌ Could not find sandeepgupta user");
    return;
  }

  console.log("✅ Found owner:");
  console.log(`   ID: ${owner.id}`);
  console.log(`   Email: ${owner.email}`);
  console.log(`   Name: ${owner.name}`);
  console.log(`   Plan: ${owner.plan}`);
  console.log(`   Subscription Plan: ${owner.subscription?.plan || "none"}`);
  console.log(`   Subscription Status: ${owner.subscription?.status || "none"}`);

  // Find the family member
  const member = await prisma.user.findUnique({
    where: { email: "sgmgsg@hotmail.com" },
  });

  if (!member) {
    console.error("\n❌ Could not find user: sgmgsg@hotmail.com");
    console.log("   Make sure this user has created an account first.");
    return;
  }

  console.log("\n✅ Found member:");
  console.log(`   ID: ${member.id}`);
  console.log(`   Email: ${member.email}`);
  console.log(`   Name: ${member.name}`);
  console.log(`   Current Plan: ${member.plan}`);

  // Check if member is already in a family
  const existingMembership = await prisma.familyMember.findUnique({
    where: { userId: member.id },
    include: { familyGroup: true },
  });

  if (existingMembership) {
    console.log(`\n⚠️  Member is already in a family group: ${existingMembership.familyGroupId}`);
    console.log(`   Role: ${existingMembership.role}`);
    return;
  }

  // Check/create family group for owner
  let familyGroup = await prisma.familyGroup.findUnique({
    where: { ownerId: owner.id },
    include: {
      members: {
        include: {
          user: { select: { email: true, name: true } },
        },
      },
    },
  });

  if (!familyGroup) {
    console.log("\n📦 Creating family group for owner...");
    familyGroup = await prisma.familyGroup.create({
      data: {
        ownerId: owner.id,
        maxMembers: 5,
      },
      include: {
        members: {
          include: {
            user: { select: { email: true, name: true } },
          },
        },
      },
    });
    console.log(`   ✅ Created family group: ${familyGroup.id}`);

    // Add owner as first member
    await prisma.familyMember.create({
      data: {
        familyGroupId: familyGroup.id,
        userId: owner.id,
        role: "OWNER",
      },
    });
    console.log("   ✅ Added owner as OWNER member");
  } else {
    console.log(`\n✅ Family group exists: ${familyGroup.id}`);
    console.log(`   Members: ${familyGroup.members.length}/${familyGroup.maxMembers}`);

    // Make sure owner is in members
    const ownerInMembers = familyGroup.members.some(m => m.userId === owner.id);
    if (!ownerInMembers) {
      await prisma.familyMember.create({
        data: {
          familyGroupId: familyGroup.id,
          userId: owner.id,
          role: "OWNER",
        },
      });
      console.log("   ✅ Added owner as OWNER member (was missing)");
    }
  }

  // Check capacity
  const currentMemberCount = await prisma.familyMember.count({
    where: { familyGroupId: familyGroup.id },
  });

  if (currentMemberCount >= familyGroup.maxMembers) {
    console.error(`\n❌ Family group is full (${currentMemberCount}/${familyGroup.maxMembers})`);
    return;
  }

  // Add the member
  console.log("\n👥 Adding sgmgsg@hotmail.com to family group...");
  await prisma.familyMember.create({
    data: {
      familyGroupId: familyGroup.id,
      userId: member.id,
      role: "MEMBER",
    },
  });
  console.log("   ✅ Added as MEMBER");

  // Verify final state
  const finalGroup = await prisma.familyGroup.findUnique({
    where: { id: familyGroup.id },
    include: {
      members: {
        include: {
          user: { select: { email: true, name: true } },
        },
      },
    },
  });

  console.log("\n🎉 Done! Final family group state:");
  console.log(`   Family Group ID: ${finalGroup?.id}`);
  console.log(`   Members (${finalGroup?.members.length}/${finalGroup?.maxMembers}):`);
  finalGroup?.members.forEach((m, i) => {
    console.log(`     ${i + 1}. ${m.user.email} (${m.role})`);
  });

  console.log("\n✅ sgmgsg@hotmail.com should now have Enterprise access through the family plan!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
