// SEO Report Generator
// Generates comprehensive SEO reports and stores results

import { prisma } from "@/lib/db";

export interface SEOReport {
  id: string;
  generatedAt: Date;
  technicalScore: number;
  contentScore: number;
  overallScore: number;
  summary: string;
  criticalIssues: string[];
  warnings: string[];
  improvements: string[];
  blogIdeas: BlogIdea[];
  nextActions: string[];
}

export interface BlogIdea {
  title: string;
  slug: string;
  keywords: string[];
  priority: number;
  category: string;
}

/**
 * Generate a unique report ID
 */
function generateReportId(): string {
  return `seo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Store SEO report in database (using Alert model for now)
 */
export async function storeReport(report: SEOReport): Promise<void> {
  try {
    // Find an admin user to associate the report with
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { role: "SUPER_ADMIN" },
          { role: "ADMIN" },
          { role: "SEO_MANAGER" },
        ],
      },
    });

    if (!adminUser) {
      console.log("[SEO Agent] No admin user found, skipping report storage");
      return;
    }

    // Store as an alert for now (could create dedicated SEOReport model later)
    await prisma.alert.create({
      data: {
        userId: adminUser.id,
        type: "SEO_REPORT",
        title: `SEO Report - Score: ${report.overallScore}/100`,
        message: report.summary,
        severity: report.overallScore >= 80 ? "LOW" : report.overallScore >= 60 ? "MEDIUM" : "HIGH",
        metadata: JSON.stringify({
          reportId: report.id,
          technicalScore: report.technicalScore,
          contentScore: report.contentScore,
          criticalIssues: report.criticalIssues,
          warnings: report.warnings,
          improvements: report.improvements,
          blogIdeas: report.blogIdeas.slice(0, 5),
          nextActions: report.nextActions,
        }),
      },
    });

    console.log(`[SEO Agent] Report stored: ${report.id}`);
  } catch (error) {
    console.error("[SEO Agent] Failed to store report:", error);
  }
}

/**
 * Get the latest SEO report
 */
export async function getLatestReport(): Promise<SEOReport | null> {
  try {
    const alert = await prisma.alert.findFirst({
      where: { type: "SEO_REPORT" },
      orderBy: { createdAt: "desc" },
    });

    if (!alert || !alert.metadata) return null;

    const metadata = JSON.parse(alert.metadata);

    return {
      id: metadata.reportId,
      generatedAt: alert.createdAt,
      technicalScore: metadata.technicalScore,
      contentScore: metadata.contentScore,
      overallScore: Math.round((metadata.technicalScore + metadata.contentScore) / 2),
      summary: alert.message,
      criticalIssues: metadata.criticalIssues || [],
      warnings: metadata.warnings || [],
      improvements: metadata.improvements || [],
      blogIdeas: metadata.blogIdeas || [],
      nextActions: metadata.nextActions || [],
    };
  } catch (error) {
    console.error("[SEO Agent] Failed to get latest report:", error);
    return null;
  }
}

/**
 * Generate comprehensive SEO report
 */
export async function generateSEOReport(
  technicalAudit: {
    pageAudits: Array<{ url: string; score: number; status: string; checks: Array<{ name: string; status: string; message: string; recommendation?: string }> }>;
    sitemapStatus: { errors: string[] };
    robotsCheck: { status: string; message: string };
    overallScore: number;
    summary: string;
  },
  contentAnalysis: {
    analyses: Array<{ url: string; wordCount: number; suggestions: Array<{ type: string; priority: string; message: string; recommendation: string }> }>;
    overallSuggestions: Array<{ type: string; priority: string; message: string; recommendation: string }>;
    contentScore: number;
  },
  blogIdeas: BlogIdea[]
): Promise<SEOReport> {
  const report: SEOReport = {
    id: generateReportId(),
    generatedAt: new Date(),
    technicalScore: technicalAudit.overallScore,
    contentScore: contentAnalysis.contentScore,
    overallScore: Math.round((technicalAudit.overallScore + contentAnalysis.contentScore) / 2),
    summary: "",
    criticalIssues: [],
    warnings: [],
    improvements: [],
    blogIdeas: blogIdeas.slice(0, 10),
    nextActions: [],
  };

  // Collect critical issues
  for (const audit of technicalAudit.pageAudits) {
    for (const check of audit.checks) {
      if (check.status === "fail") {
        report.criticalIssues.push(`${audit.url}: ${check.message}`);
      }
    }
  }

  for (const analysis of contentAnalysis.analyses) {
    for (const suggestion of analysis.suggestions) {
      if (suggestion.priority === "high") {
        report.criticalIssues.push(`${analysis.url}: ${suggestion.message}`);
      }
    }
  }

  // Collect warnings
  for (const audit of technicalAudit.pageAudits) {
    for (const check of audit.checks) {
      if (check.status === "warning") {
        report.warnings.push(`${audit.url}: ${check.message}`);
      }
    }
  }

  for (const analysis of contentAnalysis.analyses) {
    for (const suggestion of analysis.suggestions) {
      if (suggestion.priority === "medium") {
        report.warnings.push(`${analysis.url}: ${suggestion.message}`);
      }
    }
  }

  // Add sitemap/robots issues
  if (technicalAudit.sitemapStatus.errors.length > 0) {
    report.warnings.push(`Sitemap: ${technicalAudit.sitemapStatus.errors.join(", ")}`);
  }
  if (technicalAudit.robotsCheck.status !== "pass") {
    report.warnings.push(`robots.txt: ${technicalAudit.robotsCheck.message}`);
  }

  // Generate improvements list
  const allRecommendations = new Set<string>();

  for (const audit of technicalAudit.pageAudits) {
    for (const check of audit.checks) {
      if (check.recommendation) {
        allRecommendations.add(check.recommendation);
      }
    }
  }

  for (const analysis of contentAnalysis.analyses) {
    for (const suggestion of analysis.suggestions) {
      allRecommendations.add(suggestion.recommendation);
    }
  }

  report.improvements = Array.from(allRecommendations).slice(0, 10);

  // Generate next actions
  if (report.criticalIssues.length > 0) {
    report.nextActions.push(`Fix ${report.criticalIssues.length} critical SEO issues`);
  }
  if (report.warnings.length > 0) {
    report.nextActions.push(`Address ${report.warnings.length} SEO warnings`);
  }
  if (blogIdeas.length > 0) {
    report.nextActions.push(`Create ${Math.min(5, blogIdeas.length)} new blog posts`);
    report.nextActions.push(`Top priority: "${blogIdeas[0]?.title}"`);
  }

  // Generate summary
  report.summary = `SEO Score: ${report.overallScore}/100 (Technical: ${report.technicalScore}, Content: ${report.contentScore}). `;
  if (report.criticalIssues.length > 0) {
    report.summary += `${report.criticalIssues.length} critical issues need attention. `;
  }
  if (report.warnings.length > 0) {
    report.summary += `${report.warnings.length} warnings found. `;
  }
  if (blogIdeas.length > 0) {
    report.summary += `${blogIdeas.length} blog post opportunities identified. `;
  }
  if (report.overallScore >= 80) {
    report.summary += "Overall SEO health is good!";
  } else if (report.overallScore >= 60) {
    report.summary += "SEO needs some improvements.";
  } else {
    report.summary += "SEO needs significant attention.";
  }

  return report;
}

/**
 * Format report for email/notification
 */
export function formatReportForEmail(report: SEOReport): string {
  let email = `
# GhostMyData SEO Report
Generated: ${report.generatedAt.toISOString()}

## Overall Score: ${report.overallScore}/100
- Technical Score: ${report.technicalScore}/100
- Content Score: ${report.contentScore}/100

## Summary
${report.summary}

`;

  if (report.criticalIssues.length > 0) {
    email += `## Critical Issues (${report.criticalIssues.length})
${report.criticalIssues.map(i => `- ${i}`).join("\n")}

`;
  }

  if (report.warnings.length > 0) {
    email += `## Warnings (${report.warnings.length})
${report.warnings.slice(0, 10).map(w => `- ${w}`).join("\n")}

`;
  }

  if (report.blogIdeas.length > 0) {
    email += `## Blog Post Ideas
${report.blogIdeas.slice(0, 5).map(b => `- ${b.title} (Priority: ${b.priority})`).join("\n")}

`;
  }

  if (report.nextActions.length > 0) {
    email += `## Recommended Actions
${report.nextActions.map(a => `- ${a}`).join("\n")}

`;
  }

  email += `
---
Report ID: ${report.id}
Generated by GhostMyData SEO Agent
`;

  return email;
}

/**
 * Format report as JSON for API response
 */
export function formatReportAsJson(report: SEOReport): object {
  return {
    id: report.id,
    generatedAt: report.generatedAt.toISOString(),
    scores: {
      overall: report.overallScore,
      technical: report.technicalScore,
      content: report.contentScore,
    },
    summary: report.summary,
    issues: {
      critical: report.criticalIssues,
      warnings: report.warnings,
    },
    improvements: report.improvements,
    blogIdeas: report.blogIdeas,
    nextActions: report.nextActions,
  };
}
