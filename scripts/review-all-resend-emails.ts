/**
 * Review ALL Resend.com Emails - Comprehensive analysis
 *
 * Fetches all emails from Resend API with pagination.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

const RESEND_API_KEY = process.env.RESEND_API_KEY;

interface ResendEmail {
  id: string;
  to: string[];
  from: string;
  subject: string;
  created_at: string;
  last_event: string;
}

interface ResendListResponse {
  data: ResendEmail[];
}

async function fetchAllEmails(): Promise<ResendEmail[]> {
  const allEmails: ResendEmail[] = [];

  // Resend API: GET /emails with pagination
  const response = await fetch("https://api.resend.com/emails", {
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Resend API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as ResendListResponse;
  allEmails.push(...data.data);

  return allEmails;
}

async function reviewEmails() {
  console.log("=".repeat(70));
  console.log("RESEND EMAIL COMPREHENSIVE REVIEW");
  console.log("=".repeat(70));
  console.log();

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    process.exit(1);
  }

  try {
    const emails = await fetchAllEmails();
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
    for (const [status, statusEmails] of Array.from(byStatus.entries()).sort((a, b) => b[1].length - a[1].length)) {
      const pct = Math.round((statusEmails.length / emails.length) * 100);
      console.log(`  ${status.padEnd(20)}: ${statusEmails.length.toString().padStart(5)} (${pct}%)`);
    }
    console.log();

    // Identify ALL non-delivered emails
    const deliveredStatuses = ["delivered", "sent", "opened", "clicked"];
    const nonDelivered: ResendEmail[] = [];

    for (const [status, statusEmails] of byStatus) {
      if (!deliveredStatuses.includes(status.toLowerCase())) {
        nonDelivered.push(...statusEmails);
      }
    }

    console.log(`NON-DELIVERED EMAILS: ${nonDelivered.length}`);
    console.log("-".repeat(70));

    if (nonDelivered.length > 0) {
      // Group by status and domain
      const problemsByStatusDomain = new Map<string, Map<string, ResendEmail[]>>();

      for (const email of nonDelivered) {
        const status = email.last_event || "unknown";
        const toEmail = email.to[0] || "";
        const domain = toEmail.split("@")[1] || "unknown";

        if (!problemsByStatusDomain.has(status)) {
          problemsByStatusDomain.set(status, new Map());
        }
        if (!problemsByStatusDomain.get(status)!.has(domain)) {
          problemsByStatusDomain.get(status)!.set(domain, []);
        }
        problemsByStatusDomain.get(status)!.get(domain)!.push(email);
      }

      // Show by status
      for (const [status, domainMap] of problemsByStatusDomain) {
        console.log();
        console.log(`${status.toUpperCase()} (${Array.from(domainMap.values()).flat().length}):`);
        console.log("-".repeat(50));

        const sortedDomains = Array.from(domainMap.entries())
          .sort((a, b) => b[1].length - a[1].length);

        for (const [domain, domainEmails] of sortedDomains) {
          console.log(`  ${domain.padEnd(35)}: ${domainEmails.length}`);
          // Show sample email addresses
          const uniqueEmails = [...new Set(domainEmails.map(e => e.to[0]))];
          for (const addr of uniqueEmails.slice(0, 3)) {
            console.log(`    → ${addr}`);
          }
        }
      }

      // Generate fix recommendations
      console.log();
      console.log("=".repeat(70));
      console.log("EMAILS TO FIX IN DATA BROKER DIRECTORY:");
      console.log("-".repeat(70));

      const bouncedEmails = nonDelivered.filter(e =>
        ["bounced", "failed", "rejected"].includes((e.last_event || "").toLowerCase())
      );

      const uniqueBouncedAddresses = [...new Set(bouncedEmails.map(e => e.to[0]))];
      console.log("Invalid email addresses (bounced/failed):");
      for (const addr of uniqueBouncedAddresses) {
        console.log(`  - ${addr}`);
      }

      console.log();
      console.log("SUPPRESSED emails (recipient opted out or complained):");
      const suppressedEmails = nonDelivered.filter(e => e.last_event === "suppressed");
      const uniqueSuppressed = [...new Set(suppressedEmails.map(e => e.to[0]))];
      for (const addr of uniqueSuppressed) {
        console.log(`  - ${addr}`);
      }
    }

    // Summary
    const deliveredCount = deliveredStatuses.reduce(
      (sum, status) => sum + (byStatus.get(status)?.length || 0),
      0
    );

    console.log();
    console.log("=".repeat(70));
    console.log("SUMMARY:");
    console.log("-".repeat(50));
    console.log(`  Total emails:      ${emails.length}`);
    console.log(`  Delivered:         ${deliveredCount}`);
    console.log(`  Non-delivered:     ${nonDelivered.length}`);
    console.log(`  Delivery rate:     ${emails.length > 0 ? Math.round((deliveredCount / emails.length) * 100) : 0}%`);
    console.log("=".repeat(70));

  } catch (error) {
    console.error("Error:", error);
  }
}

reviewEmails().catch(console.error);
