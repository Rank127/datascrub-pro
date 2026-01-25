import { NextResponse } from "next/server";
import { Resend } from "resend";
import { runFullAudit } from "@/lib/seo-agent/technical-audit";
import { analyzeAllContent } from "@/lib/seo-agent/content-optimizer";
import { getTopBlogIdeas } from "@/lib/seo-agent/blog-generator";
import {
  generateSEOReport,
  storeReport,
  formatReportForEmail,
  formatReportAsJson,
} from "@/lib/seo-agent/report-generator";

// Initialize Resend for email notifications
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendSEOAlertEmail(to: string, subject: string, content: string): Promise<boolean> {
  if (!resend) {
    console.log("[SEO Agent] Email service not configured, skipping email");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "GhostMyData <onboarding@resend.dev>",
      to,
      subject,
      html: `<pre style="font-family: monospace; white-space: pre-wrap; background: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 8px;">${content}</pre>`,
    });

    if (error) {
      console.error("[SEO Agent] Email error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[SEO Agent] Failed to send email:", err);
    return false;
  }
}

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;

// Pages to audit - prioritized by SEO importance
const PAGES_TO_AUDIT = [
  // High priority - main pages
  "/",
  "/pricing",
  "/how-it-works",
  "/blog",
  // Comparison pages (high-value keywords)
  "/compare",
  "/compare/deleteme",
  "/compare/incogni",
  "/compare/optery",
  "/compare/kanary",
  "/compare/privacy-bee",
  // Data broker removal guides (high SEO value)
  "/remove-from",
  "/remove-from/spokeo",
  "/remove-from/whitepages",
  "/remove-from/beenverified",
  "/remove-from/radaris",
  "/remove-from/intelius",
  "/remove-from/truepeoplesearch",
  "/remove-from/fastpeoplesearch",
  "/remove-from/mylife",
  "/remove-from/ussearch",
  "/remove-from/peoplefinder",
  // Location-based landing pages
  "/data-removal-california",
  "/data-removal-texas",
  "/data-removal-new-york",
  "/data-removal-florida",
  // Resource pages
  "/resources",
  "/testimonials",
  // Legal pages (lower priority)
  "/privacy",
  "/terms",
  "/security",
];

export async function GET(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[SEO Agent] Starting automated SEO optimization run...");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ghostmydata.com";

    // Step 1: Run technical SEO audit
    console.log("[SEO Agent] Running technical audit...");
    const technicalAudit = await runFullAudit(baseUrl);

    // Step 2: Analyze content
    console.log("[SEO Agent] Analyzing content...");
    const contentAnalysis = await analyzeAllContent(baseUrl, PAGES_TO_AUDIT);

    // Step 3: Generate blog ideas
    console.log("[SEO Agent] Generating blog ideas...");
    const blogIdeasRaw = await getTopBlogIdeas(10);
    const blogIdeas = blogIdeasRaw.map(idea => ({
      title: idea.title,
      slug: idea.slug,
      keywords: idea.keywords,
      priority: idea.priority,
      category: idea.category,
    }));

    // Step 4: Generate comprehensive report
    console.log("[SEO Agent] Generating report...");
    const report = await generateSEOReport(technicalAudit, contentAnalysis, blogIdeas);

    // Step 5: Store report
    await storeReport(report);

    // Step 6: Send email notification if score is low or there are critical issues
    const adminEmail = process.env.ADMIN_EMAILS?.split(",")[0];
    if (adminEmail && (report.overallScore < 70 || report.criticalIssues.length > 0)) {
      console.log("[SEO Agent] Sending alert email...");
      await sendSEOAlertEmail(
        adminEmail,
        `GhostMyData SEO Alert - Score: ${report.overallScore}/100`,
        formatReportForEmail(report)
      );
    }

    console.log(`[SEO Agent] Run complete. Score: ${report.overallScore}/100`);

    return NextResponse.json({
      success: true,
      report: formatReportAsJson(report),
    });
  } catch (error) {
    console.error("[SEO Agent] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST endpoint for manual trigger with options
export async function POST(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const {
      runTechnicalAudit = true,
      runContentAnalysis = true,
      generateBlogIdeas = true,
      sendEmailReport = false,
    } = body;

    console.log("[SEO Agent] Starting manual SEO run with options:", {
      runTechnicalAudit,
      runContentAnalysis,
      generateBlogIdeas,
      sendEmailReport,
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ghostmydata.com";
    const results: Record<string, unknown> = {};

    // Technical audit
    if (runTechnicalAudit) {
      console.log("[SEO Agent] Running technical audit...");
      results.technicalAudit = await runFullAudit(baseUrl);
    }

    // Content analysis
    if (runContentAnalysis) {
      console.log("[SEO Agent] Analyzing content...");
      results.contentAnalysis = await analyzeAllContent(baseUrl, PAGES_TO_AUDIT);
    }

    // Blog ideas
    if (generateBlogIdeas) {
      console.log("[SEO Agent] Generating blog ideas...");
      results.blogIdeas = await getTopBlogIdeas(10);
    }

    // Generate and store report if we have audit data
    if (runTechnicalAudit && runContentAnalysis) {
      const blogIdeasForReport = generateBlogIdeas
        ? (results.blogIdeas as Array<{ title: string; slug: string; keywords: string[]; priority: number; category: string }>)
        : [];

      const report = await generateSEOReport(
        results.technicalAudit as Parameters<typeof generateSEOReport>[0],
        results.contentAnalysis as Parameters<typeof generateSEOReport>[1],
        blogIdeasForReport
      );

      await storeReport(report);
      results.report = formatReportAsJson(report);

      // Send email if requested
      if (sendEmailReport) {
        const adminEmail = process.env.ADMIN_EMAILS?.split(",")[0];
        if (adminEmail) {
          const emailSent = await sendSEOAlertEmail(
            adminEmail,
            `GhostMyData SEO Report - Score: ${report.overallScore}/100`,
            formatReportForEmail(report)
          );
          results.emailSent = emailSent;
        }
      }
    }

    console.log("[SEO Agent] Manual run complete");

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("[SEO Agent] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
