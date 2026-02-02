import { config } from "dotenv";
config({ path: ".env.local" });

async function checkResendStatus() {
  console.log("\n" + "═".repeat(60));
  console.log("           RESEND API & DOMAIN DIAGNOSTIC");
  console.log("═".repeat(60));

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  console.log(`\n📧 Configuration:`);
  console.log(`  RESEND_API_KEY: ${apiKey?.substring(0, 12)}...${apiKey?.slice(-4)}`);
  console.log(`  RESEND_FROM_EMAIL: ${fromEmail}`);

  if (!apiKey) {
    console.log("\n❌ RESEND_API_KEY is not set!");
    return;
  }

  // Check API key type (test vs production)
  console.log(`\n🔑 API Key Analysis:`);
  if (apiKey.includes("test")) {
    console.log(`  ⚠️ This appears to be a TEST API key`);
    console.log(`  Test keys can only send to the account owner's email`);
  } else {
    console.log(`  Key pattern: production format`);
  }

  // Get domains from Resend API
  console.log(`\n📋 Fetching domains from Resend API...`);

  try {
    const domainsResponse = await fetch("https://api.resend.com/domains", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!domainsResponse.ok) {
      const errorText = await domainsResponse.text();
      console.log(`  ❌ Failed to fetch domains: ${domainsResponse.status}`);
      console.log(`  Error: ${errorText}`);
      return;
    }

    const domainsData = await domainsResponse.json();
    console.log(`\n📁 Registered Domains:`);

    if (domainsData.data && domainsData.data.length > 0) {
      for (const domain of domainsData.data) {
        const statusIcon = domain.status === "verified" ? "✅" : "⚠️";
        console.log(`\n  ${statusIcon} ${domain.name}`);
        console.log(`     Status: ${domain.status}`);
        console.log(`     Created: ${domain.created_at}`);
        console.log(`     Region: ${domain.region || "default"}`);

        if (domain.records) {
          console.log(`     DNS Records:`);
          for (const record of domain.records) {
            const recordStatus = record.status === "verified" ? "✓" : "✗";
            console.log(`       [${recordStatus}] ${record.record_type}: ${record.name}`);
          }
        }
      }
    } else {
      console.log(`  ⚠️ No domains registered!`);
    }

    // Get API keys to check if we're using a test key
    console.log(`\n🔐 Fetching API keys info...`);
    const keysResponse = await fetch("https://api.resend.com/api-keys", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (keysResponse.ok) {
      const keysData = await keysResponse.json();
      console.log(`\n📑 API Keys:`);
      if (keysData.data && keysData.data.length > 0) {
        for (const key of keysData.data) {
          const currentKey = key.id === apiKey?.split("_")[1] ? " (CURRENT)" : "";
          console.log(`  - ${key.name}${currentKey}`);
          console.log(`    Created: ${key.created_at}`);
        }
      }
    }

    // Try a test send to see the exact error
    console.log(`\n📤 Testing email send...`);

    const testResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail || "noreply@ghostmydata.com",
        to: ["test@example.com"],
        subject: "Test",
        text: "Test message",
      }),
    });

    const testResult = await testResponse.json();

    if (!testResponse.ok) {
      console.log(`  ❌ Send failed: ${testResponse.status}`);
      console.log(`  Error: ${JSON.stringify(testResult, null, 2)}`);

      if (testResult.message?.includes("testing emails")) {
        console.log(`\n💡 DIAGNOSIS: Your API key is in TEST MODE`);
        console.log(`   To fix this:`);
        console.log(`   1. Go to https://resend.com/api-keys`);
        console.log(`   2. Create a new API key with "Full Access" permission`);
        console.log(`   3. Make sure it's NOT a test key`);
        console.log(`   4. Update RESEND_API_KEY in .env.local`);
      } else if (testResult.message?.includes("verify a domain")) {
        console.log(`\n💡 DIAGNOSIS: Domain not verified`);
        console.log(`   To fix this:`);
        console.log(`   1. Go to https://resend.com/domains`);
        console.log(`   2. Add/verify ghostmydata.com`);
        console.log(`   3. Add all required DNS records (SPF, DKIM)`);
      }
    } else {
      console.log(`  ✅ Test send succeeded!`);
      console.log(`  Email ID: ${testResult.id}`);
    }

  } catch (error) {
    console.log(`  ❌ Error: ${error instanceof Error ? error.message : "Unknown"}`);
  }

  console.log("\n" + "═".repeat(60));
}

checkResendStatus().catch(console.error);
