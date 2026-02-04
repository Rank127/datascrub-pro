/**
 * Review Resend.com Emails - Analyze non-delivered emails
 *
 * Fetches emails from Resend API and identifies issues to adjust the system.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ResendEmail {
  id: string;
  to: string[];
  from: string;
  subject: string;
  created_at: string;
  last_event: string;
}

async function reviewEmails() {
  console.log("=".repeat(70));
  console.log("RESEND EMAIL REVIEW - NON-DELIVERED EMAILS");
  console.log("=".repeat(70));
  console.log();

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    process.exit(1);
  }

  try {
    // Fetch recent emails from Resend
    const response = await resend.emails.list();

    if (!response.data) {
      console.log("No emails found or error fetching emails");
      console.log("Response:", response);
      return;
    }

    const emails = response.data.data as ResendEmail[];
    console.log(`Total emails fetched: ${emails.length}`);
    console.log();

    // Group by status
    const byStatus = new Map<string, ResendEmail[]>();
    for (const email of emails) {
      const status = email.last_event || "unknown";
      if (!byStatus.has(status)) {
        byStatus.set(status, []);
      }
      byStatus.get(status)!.push(email);
    }

    // Show status breakdown
    console.log("EMAIL STATUS BREAKDOWN:");
    console.log("-".repeat(50));
    for (const [status, statusEmails] of byStatus) {
      console.log(`  ${status.padEnd(20)}: ${statusEmails.length}`);
    }
    console.log();

    // Filter non-delivered emails (exclude 'delivered' and 'sent')
    const problemStatuses = ["bounced", "complained", "failed", "rejected", "unsubscribed"];
    const problemEmails: ResendEmail[] = [];

    for (const [status, statusEmails] of byStatus) {
      if (problemStatuses.includes(status.toLowerCase())) {
        problemEmails.push(...statusEmails);
      }
    }

    if (problemEmails.length === 0) {
      console.log("✓ No problem emails found (bounced, failed, etc.)");
      console.log();

      // Show pending/queued emails that haven't been delivered yet
      const pendingStatuses = ["queued", "sending", "scheduled"];
      const pendingEmails: ResendEmail[] = [];

      for (const [status, statusEmails] of byStatus) {
        if (pendingStatuses.includes(status.toLowerCase())) {
          pendingEmails.push(...statusEmails);
        }
      }

      if (pendingEmails.length > 0) {
        console.log(`PENDING EMAILS (${pendingEmails.length}):`)
        console.log("-".repeat(70));
        for (const email of pendingEmails.slice(0, 10)) {
          console.log(`  To: ${email.to.join(", ")}`);
          console.log(`  Subject: ${email.subject}`);
          console.log(`  Status: ${email.last_event}`);
          console.log(`  Created: ${email.created_at}`);
          console.log();
        }
      }
    } else {
      console.log(`PROBLEM EMAILS (${problemEmails.length}):`)
      console.log("-".repeat(70));

      // Group problem emails by domain for analysis
      const problemDomains = new Map<string, { count: number; emails: ResendEmail[] }>();

      for (const email of problemEmails) {
        const toEmail = email.to[0] || "";
        const domain = toEmail.split("@")[1] || "unknown";

        if (!problemDomains.has(domain)) {
          problemDomains.set(domain, { count: 0, emails: [] });
        }
        problemDomains.get(domain)!.count++;
        problemDomains.get(domain)!.emails.push(email);
      }

      console.log("Problem Emails by Domain:");
      console.log("-".repeat(50));
      const sortedDomains = Array.from(problemDomains.entries())
        .sort((a, b) => b[1].count - a[1].count);

      for (const [domain, data] of sortedDomains.slice(0, 20)) {
        console.log(`  ${domain.padEnd(30)}: ${data.count} emails`);
      }
      console.log();

      // Show details of problem emails
      console.log("Problem Email Details:");
      console.log("-".repeat(70));
      for (const email of problemEmails.slice(0, 20)) {
        console.log(`  ID: ${email.id}`);
        console.log(`  To: ${email.to.join(", ")}`);
        console.log(`  Subject: ${email.subject?.substring(0, 50)}...`);
        console.log(`  Status: ${email.last_event}`);
        console.log(`  Created: ${email.created_at}`);
        console.log();
      }

      // Recommendations
      console.log("=".repeat(70));
      console.log("RECOMMENDATIONS:");
      console.log("-".repeat(70));

      const bouncedDomains = sortedDomains.filter(([_, data]) =>
        data.emails.some(e => e.last_event === "bounced")
      );

      if (bouncedDomains.length > 0) {
        console.log("1. BOUNCED emails - these addresses are invalid:");
        for (const [domain, data] of bouncedDomains.slice(0, 5)) {
          console.log(`   - ${domain}: Consider removing from broker directory`);
        }
        console.log();
      }

      const complainedEmails = problemEmails.filter(e => e.last_event === "complained");
      if (complainedEmails.length > 0) {
        console.log("2. COMPLAINED emails - recipients marked as spam:");
        console.log("   - Review email content for spam triggers");
        console.log("   - Ensure proper unsubscribe links");
        console.log();
      }
    }

    // Also show delivered stats
    const deliveredCount = byStatus.get("delivered")?.length || 0;
    const sentCount = byStatus.get("sent")?.length || 0;
    const totalSent = deliveredCount + sentCount;

    console.log("=".repeat(70));
    console.log("SUMMARY:");
    console.log("-".repeat(50));
    console.log(`  Total emails: ${emails.length}`);
    console.log(`  Delivered/Sent: ${totalSent}`);
    console.log(`  Problem emails: ${problemEmails.length}`);
    console.log(`  Delivery rate: ${emails.length > 0 ? Math.round((totalSent / emails.length) * 100) : 0}%`);
    console.log("=".repeat(70));

  } catch (error) {
    console.error("Error fetching emails from Resend:", error);
  }
}

reviewEmails().catch(console.error);
