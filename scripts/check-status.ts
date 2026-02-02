import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkStatus() {
  const statuses = await prisma.removalRequest.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  console.log("\nRemoval Request Status Counts:");
  for (const row of statuses) {
    console.log(`  ${row.status}: ${row._count.id}`);
  }

  // Check pending items' methods
  const pendingMethods = await prisma.removalRequest.groupBy({
    by: ["method"],
    where: { status: "PENDING" },
    _count: { id: true },
  });

  console.log("\nPending Items by Method:");
  for (const row of pendingMethods) {
    console.log(`  ${row.method || "NULL"}: ${row._count.id}`);
  }

  await prisma.$disconnect();
}

checkStatus().catch(console.error);
