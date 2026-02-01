// SEO Report Generator
// Generates comprehensive SEO reports and stores results

import { prisma } from "@/lib/db";
import { getEventBus } from "../orchestrator/event-bus";
import { nanoid } from "nanoid";

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

export interface SEOIssue {
  id: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  url?: string;
  recommendation?: string;
  canAutoRemediate: boolean;
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
        metadata: JSON.stringify({
          severity: report.overallScore >= 80 ? "LOW" : report.overallScore >= 60 ? "MEDIUM" : "HIGH",
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
 * Emit detected issues to the event bus for auto-remediation
 */
async function emitSEOIssues(issues: SEOIssue[]): Promise<void> {
  const eventBus = getEventBus();

  for (const issue of issues) {
    try {
      await eventBus.emitCustom("seo-agent", "issue.detected", {
        issue: {
          id: issue.id,
          type: issue.type,
          severity: issue.severity,
          description: issue.description,
          sourceAgentId: "seo-agent",
          affectedResource: issue.url,
          details: {
            recommendation: issue.recommendation,
          },
          canAutoRemediate: issue.canAutoRemediate,
          detectedAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`[SEO Agent] Failed to emit issue ${issue.id}:`, error);
    }
  }

  if (issues.length > 0) {
    console.log(`[SEO Agent] Emitted ${issues.length} issues for remediation`);
  }
}

/**
 * Map check name to issue type
 */
function mapCheckToIssueType(checkName: string): string {
  const mapping: Record<string, string> = {
    "Title Tag": "seo.missing_title",
    "Meta Description": "seo.missing_description",
    "Open Graph Tags": "seo.missing_og_tags",
    "H1 Tag": "seo.missing_h1",
    "Canonical URL": "seo.missing_canonical",
    "Structured Data": "seo.missing_structured_data",
    "Page Size": "seo.large_page_size",
    "Page Accessible": "seo.page_not_accessible",
    "robots.txt": "seo.invalid_robots",
    "Sitemap": "seo.missing_sitemap",
  };
  return mapping[checkName] || `seo.${checkName.toLowerCase().replace(/\s+/g, "_")}`;
}

/**
 * Determine if an issue type can be auto-remediated
 */
function canAutoRemediate(issueType: string): boolean {
  const autoRemediable = [
    "seo.missing_title",
    "seo.missing_description",
    "seo.missing_og_tags",
    "seo.thin_content",
    "seo.low_readability",
  ];
  return autoRemediable.some(type => issueType.startsWith(type));
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
  blogIdeas: BlogIdea[],
  options?: { emitIssues?: boolean }
): Promise<SEOReport> {
  const { emitIssues = true } = options || {};
  const detectedIssues: SEOIssue[] = [];
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

  // Collect critical issues and create issue objects
  for (const audit of technicalAudit.pageAudits) {
    for (const check of audit.checks) {
      if (check.status === "fail") {
        report.criticalIssues.push(`${audit.url}: ${check.message}`);

        // Create issue for remediation
        const issueType = mapCheckToIssueType(check.name);
        detectedIssues.push({
          id: nanoid(),
          type: issueType,
          severity: "critical",
          description: check.message,
          url: audit.url,
          recommendation: check.recommendation,
          canAutoRemediate: canAutoRemediate(issueType),
        });
      }
    }
  }

  for (const analysis of contentAnalysis.analyses) {
    for (const suggestion of analysis.suggestions) {
      if (suggestion.priority === "high") {
        report.criticalIssues.push(`${analysis.url}: ${suggestion.message}`);

        // Create issue for remediation
        const issueType = `seo.${suggestion.type.toLowerCase().replace(/\s+/g, "_")}`;
        detectedIssues.push({
          id: nanoid(),
          type: issueType,
          severity: "high",
          description: suggestion.message,
          url: analysis.url,
          recommendation: suggestion.recommendation,
          canAutoRemediate: canAutoRemediate(issueType),
        });
      }
    }
  }

  // Collect warnings
  for (const audit of technicalAudit.pageAudits) {
    for (const check of audit.checks) {
      if (check.status === "warning") {
        report.warnings.push(`${audit.url}: ${check.message}`);

        // Create issue for remediation (lower severity)
        const issueType = mapCheckToIssueType(check.name);
        detectedIssues.push({
          id: nanoid(),
          type: issueType,
          severity: "medium",
          description: check.message,
          url: audit.url,
          recommendation: check.recommendation,
          canAutoRemediate: canAutoRemediate(issueType),
        });
      }
    }
  }

  for (const analysis of contentAnalysis.analyses) {
    for (const suggestion of analysis.suggestions) {
      if (suggestion.priority === "medium") {
        report.warnings.push(`${analysis.url}: ${suggestion.message}`);

        // Create issue for remediation
        const issueType = `seo.${suggestion.type.toLowerCase().replace(/\s+/g, "_")}`;
        detectedIssues.push({
          id: nanoid(),
          type: issueType,
          severity: "medium",
          description: suggestion.message,
          url: analysis.url,
          recommendation: suggestion.recommendation,
          canAutoRemediate: canAutoRemediate(issueType),
        });
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

  // Emit issues for auto-remediation
  if (emitIssues && detectedIssues.length > 0) {
    // Only emit critical and high issues for auto-remediation
    const issuesForRemediation = detectedIssues.filter(
      (i) => i.severity === "critical" || i.severity === "high"
    );
    await emitSEOIssues(issuesForRemediation);
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
