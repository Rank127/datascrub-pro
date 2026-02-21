/**
 * Quick Dehashed v2 API Test
 * Usage: npx tsx scripts/test-dehashed.ts
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const apiKey = process.env.DEHASHED_API_KEY?.trim();

  console.log("=== Dehashed v2 API Test ===\n");
  console.log(`API Key: ${apiKey ? `${apiKey.substring(0, 8)}...` : "MISSING"}`);

  if (!apiKey) {
    console.error("DEHASHED_API_KEY not set");
    process.exit(1);
  }

  console.log("\n--- POST /v2/search ---");
  const response = await fetch("https://api.dehashed.com/v2/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Dehashed-Api-Key": apiKey,
    },
    body: JSON.stringify({ query: "email:test@test.com", page: 1, size: 3 }),
  });

  console.log(`Status: ${response.status}`);
  const body = await response.text();

  if (!response.ok) {
    console.error(`Error: ${body}`);
    process.exit(1);
  }

  const data = JSON.parse(body);
  console.log(`Success: ${data.success}`);
  console.log(`Balance: ${data.balance} credits remaining`);
  console.log(`Total results: ${data.total}`);

  if (data.entries?.length) {
    console.log(`\nSample entries (${data.entries.length}):`);
    for (const entry of data.entries.slice(0, 3)) {
      const fields = [
        entry.email ? "email" : null,
        entry.password ? "password(plain)" : null,
        entry.hashed_password ? "password(hashed)" : null,
        entry.phone ? "phone" : null,
        entry.name ? "name" : null,
      ].filter(Boolean).join(", ");
      console.log(`  [${entry.database_name || "?"}] → ${fields}`);
    }
  }

  console.log("\n=== Dehashed v2 is LIVE ===");
}

main().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
