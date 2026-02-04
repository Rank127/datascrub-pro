import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function listSources() {
  // Get all unique sources with counts
  const sources = await prisma.exposure.groupBy({
    by: ["source"],
    _count: true,
    orderBy: { _count: { source: "desc" } },
  });

  console.log("ALL UNIQUE SOURCES IN DATABASE:");
  console.log("=".repeat(60));
  console.log(`Total unique sources: ${sources.length}`);
  console.log();

  // Print all sources
  for (const s of sources) {
    console.log(`"${s.source}",`);
  }

  await prisma.$disconnect();
}

listSources().catch(console.error);
