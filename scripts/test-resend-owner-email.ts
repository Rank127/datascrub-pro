import { config } from "dotenv";
config({ path: ".env.local" });

import { Resend } from "resend";

async function testOwnerEmail() {
  console.log("\n" + "═".repeat(60));
  console.log("           TESTING EMAIL TO ACCOUNT OWNER");
  console.log("═".repeat(60));

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@ghostmydata.com";

  if (!apiKey) {
    console.log("❌ RESEND_API_KEY not set");
    return;
  }

  const resend = new Resend(apiKey);

  // The error message said we can only send to rank1its@gmail.com
  // This means it's the account owner's email - let's test with that
  const ownerEmail = "rank1its@gmail.com";

  console.log(`\n📧 Sending test email:`);
  console.log(`  From: ${fromEmail}`);
  console.log(`  To: ${ownerEmail} (account owner)`);

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: [ownerEmail],
      subject: "GhostMyData - Resend Configuration Test",
      text: `This is a test email to verify Resend is working correctly.

If you receive this email, the Resend integration is working but the API key is in TEST MODE.

To send emails to data brokers and users, you need to:
1. Go to https://resend.com/api-keys
2. Create a new API key with FULL ACCESS (not test/restricted)
3. Update RESEND_API_KEY in .env.local

Time: ${new Date().toISOString()}`,
      html: `
        <h2>GhostMyData - Resend Configuration Test</h2>
        <p>This is a test email to verify Resend is working correctly.</p>
        <p>If you receive this email, the Resend integration is working but the <strong>API key is in TEST MODE</strong>.</p>
        <h3>To send emails to data brokers and users:</h3>
        <ol>
          <li>Go to <a href="https://resend.com/api-keys">resend.com/api-keys</a></li>
          <li>Create a new API key with <strong>FULL ACCESS</strong> (not test/restricted)</li>
          <li>Update RESEND_API_KEY in .env.local</li>
        </ol>
        <p><small>Time: ${new Date().toISOString()}</small></p>
      `,
    });

    console.log(`\n✅ Email sent successfully!`);
    console.log(`  Email ID: ${result.data?.id}`);
    console.log(`\n📌 This confirms:`);
    console.log(`  - Resend API connection works`);
    console.log(`  - API key is in TEST MODE (can only send to owner)`);
    console.log(`\n💡 To fix: Create a production API key at resend.com/api-keys`);

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`\n❌ Failed to send: ${errorMsg}`);

    if (errorMsg.includes("verify a domain")) {
      console.log(`\n💡 The domain is not verified.`);
      console.log(`   Go to https://resend.com/domains and verify ghostmydata.com`);
    }
  }

  console.log("\n" + "═".repeat(60));
}

testOwnerEmail().catch(console.error);
