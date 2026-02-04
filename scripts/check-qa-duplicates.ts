import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  // Same query as QA agent
  const result = await prisma.$queryRaw<Array<{ userId: string; source: string; sourceUrl: string; cnt: bigint }>>`
    SELECT "userId", "source", "sourceUrl", COUNT(*) as cnt
    FROM "Exposure"
    WHERE "sourceUrl" IS NOT NULL
    GROUP BY "userId", "source", "sourceUrl"
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
    LIMIT 20
  `;

  console.log("Duplicates found by QA criteria (userId + source + sourceUrl):");
  console.log("=".repeat(80));

  if (result.length === 0) {
    console.log("No duplicates found!");
  } else {
    for (const row of result) {
      console.log(`User: ${row.userId.substring(0, 8)}... | Source: ${row.source.padEnd(20)} | Count: ${row.cnt}`);
      console.log(`  URL: ${row.sourceUrl?.substring(0, 60)}...`);
    }
  }

  // Also check total count
  const total = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as count FROM (
      SELECT "userId", "source", "sourceUrl"
      FROM "Exposure"
      WHERE "sourceUrl" IS NOT NULL
      GROUP BY "userId", "source", "sourceUrl"
      HAVING COUNT(*) > 1
    ) as duplicates
  `;

  console.log();
  console.log(`Total duplicate groups: ${total[0]?.count || 0}`);

  await prisma.$disconnect();
}

check().catch(console.error);
