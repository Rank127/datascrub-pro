// Check user subscription history and account status
// Usage: npx tsx scripts/check-user-history.ts <email>

// Load environment manually
import { readFileSync } from "fs";
import { join } from "path";

const envPath = join(process.cwd(), ".env.local");
try {
  const envContent = readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").replace(/^["']|["']$/g, "");
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  });
} catch (_e) {
  // .env.local might not exist
}

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  const args = process.argv.slice(2);
  const emailArg = args.find(arg => arg.includes("@"));

  if (!emailArg) {
    console.log("Usage: npx tsx scripts/check-user-history.ts <email>");
    console.log("Example: npx tsx scripts/check-user-history.ts user@example.com");
    process.exit(1);
  }

  // Find the user
  const user = await prisma.user.findFirst({
    where: { email: { equals: emailArg, mode: "insensitive" } },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      role: true,
      createdAt: true,
      emailVerified: true,
    }
  });

  if (!user) {
    console.log(`User not found: ${emailArg}`);
    return;
  }

  console.log("=== User Profile ===");
  console.log("ID:", user.id);
  console.log("Email:", user.email);
  console.log("Name:", user.name);
  console.log("Current Plan:", user.plan);
  console.log("Role:", user.role);
  console.log("Created:", user.createdAt);
  console.log("Email Verified:", user.emailVerified);

  // Check subscription record
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  console.log("\n=== Subscription Record ===");
  if (subscription) {
    console.log("Plan:", subscription.plan);
    console.log("Status:", subscription.status);
    console.log("Stripe Customer ID:", subscription.stripeCustomerId);
    console.log("Stripe Subscription ID:", subscription.stripeSubscriptionId);
    console.log("Period End:", subscription.stripeCurrentPeriodEnd);
    console.log("Created:", subscription.createdAt);
    console.log("Updated:", subscription.updatedAt);
  } else {
    console.log("No subscription record found");
  }

  // Check audit logs for this user (as target or actor)
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      OR: [
        { targetUserId: user.id },
        { targetEmail: user.email },
        { actorId: user.id },
      ],
      // Exclude operational logs
      NOT: {
        action: { in: ["VIEW_USER_LIST", "VIEW_USER_DETAILS", "ACCESS_ADMIN_PANEL"] }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  console.log("\n=== Audit Logs (Plan/Account Related) ===");
  if (auditLogs.length === 0) {
    console.log("No audit logs found");
  } else {
    auditLogs.forEach(log => {
      console.log(`[${log.createdAt.toISOString()}] ${log.action} - ${log.resource}`);
      if (log.details) {
        console.log("  Details:", JSON.stringify(log.details));
      }
    });
  }

  // Check alerts for this user
  const alerts = await prisma.alert.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  console.log("\n=== User Alerts (Subscription/Payment Related) ===");
  const relevantAlerts = alerts.filter(a =>
    a.type.includes("SUBSCRIPTION") ||
    a.type.includes("PAYMENT") ||
    a.type.includes("REFUND") ||
    a.type.includes("PLAN")
  );

  if (relevantAlerts.length === 0) {
    console.log("No subscription/payment alerts found");
  } else {
    relevantAlerts.forEach(a => {
      console.log(`[${a.createdAt.toISOString()}] ${a.type}: ${a.title}`);
      console.log("  ", a.message);
    });
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
