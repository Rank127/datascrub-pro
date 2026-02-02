import { config } from "dotenv";
config({ path: ".env.local" });

import { Resend } from "resend";

async function testEmailSend() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  console.log("FROM_EMAIL:", fromEmail);
  console.log("API_KEY:", apiKey?.substring(0, 12) + "...");

  if (!apiKey) {
    console.log("No API key!");
    return;
  }

  const resend = new Resend(apiKey);

  // Try sending to a test broker email
  const testTo = "privacy@example.com";

  console.log(`\nSending test email from ${fromEmail} to ${testTo}...`);

  try {
    const result = await resend.emails.send({
      from: fromEmail!,
      to: testTo,
      subject: "Test CCPA Request",
      text: "This is a test removal request.",
    });

    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.log("Error:", error);
  }
}

testEmailSend();
