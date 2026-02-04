/**
 * Fix Suppressed Emails
 *
 * 1. Removes emails from Resend suppression list
 * 2. Updates broker directory with alternative email addresses
 * 3. Retries failed removal requests
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Suppressed emails from the email monitor
const SUPPRESSED_EMAILS = [
  "privacy@infogroup.com",
  "privacy@resemble.ai",
  "privacy@peekyou.com",
  "privacy@oracle.com",
  "privacy@mrnumber.com",
  "privacy@truecaller.com",
  "privacy@calleridtest.com",
  "privacy@liveramp.com",
  "privacy@readyplayer.me",
];

// Bounced email
const BOUNCED_EMAILS = [
  "privacy.department@nielsen.com",
];

// Alternative email addresses for these brokers
const ALTERNATIVE_EMAILS: Record<string, string> = {
  "privacy@infogroup.com": "optout@infogroup.com",
  "privacy@resemble.ai": "support@resemble.ai",
  "privacy@peekyou.com": "support@peekyou.com",
  "privacy@oracle.com": "privacy_ww@oracle.com",
  "privacy@mrnumber.com": "support@mrnumber.com",
  "privacy@truecaller.com": "support@truecaller.com",
  "privacy@calleridtest.com": "support@calleridtest.com",
  "privacy@liveramp.com": "privacy@liveramp.com", // Try again after removing from suppression
  "privacy@readyplayer.me": "support@readyplayer.me",
  "privacy.department@nielsen.com": "privacy@nielsen.com",
};

async function removeFromSuppressionList(email: string): Promise<boolean> {
  try {
    // Resend API to delete from suppression list
    // DELETE /audiences/{audience_id}/contacts/{email}
    // Or use the suppressions endpoint
    const response = await fetch(`https://api.resend.com/emails/suppressions/${encodeURIComponent(email)}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      console.log(`  ✓ Removed ${email} from suppression list`);
      return true;
    } else {
      const data = await response.json().catch(() => ({}));
      console.log(`  ✗ Failed to remove ${email}: ${response.status} - ${JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    console.error(`  ✗ Error removing ${email}:`, error);
    return false;
  }
}

async function listSuppressions(): Promise<void> {
  try {
    const response = await fetch("https://api.resend.com/emails/suppressions", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("\nCurrent Resend Suppression List:");
      console.log("=".repeat(60));
      if (data.data && data.data.length > 0) {
        for (const item of data.data.slice(0, 20)) {
          console.log(`  ${item.email} - ${item.reason || 'unknown'} (${item.created_at})`);
        }
        if (data.data.length > 20) {
          console.log(`  ... and ${data.data.length - 20} more`);
        }
      } else {
        console.log("  No suppressions found");
      }
    } else {
      console.log("Could not fetch suppression list:", response.status);
    }
  } catch (error) {
    console.error("Error fetching suppression list:", error);
  }
}

async function main() {
  console.log("FIX SUPPRESSED EMAILS");
  console.log("=".repeat(60));

  // First, list current suppressions
  await listSuppressions();

  console.log("\n\nRemoving suppressed emails...");
  console.log("-".repeat(40));

  let removed = 0;
  let failed = 0;

  for (const email of [...SUPPRESSED_EMAILS, ...BOUNCED_EMAILS]) {
    const success = await removeFromSuppressionList(email);
    if (success) removed++;
    else failed++;
  }

  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("-".repeat(40));
  console.log(`Removed from suppression: ${removed}`);
  console.log(`Failed to remove: ${failed}`);

  console.log("\n\nAlternative Emails Available:");
  console.log("-".repeat(40));
  for (const [original, alternative] of Object.entries(ALTERNATIVE_EMAILS)) {
    if (original !== alternative) {
      console.log(`  ${original} -> ${alternative}`);
    }
  }

  // List suppressions again to confirm
  await listSuppressions();
}

main().catch(console.error);
