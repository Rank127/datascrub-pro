import { NextResponse } from "next/server";
import { runFullAudit } from "@/lib/seo-agent/technical-audit";
import { analyzeAllContent } from "@/lib/seo-agent/content-optimizer";
import { getTopBlogIdeas } from "@/lib/seo-agent/blog-generator";
import {
  generateSEOReport,
  storeReport,
  formatReportForEmail,
  formatReportAsJson,
} from "@/lib/seo-agent/report-generator";
import { sendEmail } from "@/lib/email";

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;

// Pages to audit
const PAGES_TO_AUDIT = [
  "/",
  "/pricing",
  "/how-it-works",
  "/blog",
  "/compare/deleteme",
  "/compare/incogni",
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
      try {
        await sendEmail({
          to: adminEmail,
          subject: `GhostMyData SEO Alert - Score: ${report.overallScore}/100`,
          text: formatReportForEmail(report),
          html: `<pre style="font-family: monospace; white-space: pre-wrap;">${formatReportForEmail(report)}</pre>`,
        });
      } catch (emailError) {
        console.error("[SEO Agent] Failed to send email:", emailError);
      }
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
          try {
            await sendEmail({
              to: adminEmail,
              subject: `GhostMyData SEO Report - Score: ${report.overallScore}/100`,
              text: formatReportForEmail(report),
              html: `<pre style="font-family: monospace; white-space: pre-wrap;">${formatReportForEmail(report)}</pre>`,
            });
            results.emailSent = true;
          } catch (emailError) {
            console.error("[SEO Agent] Failed to send email:", emailError);
            results.emailSent = false;
          }
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
