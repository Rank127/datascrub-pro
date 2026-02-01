/**
 * SEO Agent
 *
 * Handles SEO operations including:
 * - Technical SEO audits
 * - Content analysis and optimization
 * - Blog topic generation
 * - SEO report generation
 * - Automated content fixes (via ContentAgent collaboration)
 */

import { nanoid } from "nanoid";
import { BaseAgent, createAgentContext } from "../base-agent";
import {
  AgentCapability,
  AgentContext,
  AgentDomains,
  AgentModes,
  AgentResult,
  InvocationTypes,
} from "../types";
import { registerAgent } from "../registry";

// Import helpers
import {
  runFullAudit,
  auditPage,
  checkSitemap,
  SEOAuditResult,
  SitemapStatus,
  SEOCheck,
} from "./technical-audit";
import {
  analyzeAllContent,
  analyzePageContent,
  ContentAnalysis,
  ContentSuggestion,
} from "./content-optimizer";
import {
  getTopBlogIdeas,
  generateTopicIdeas,
  BlogTopic,
} from "./blog-generator";
import {
  generateSEOReport,
  storeReport,
  formatReportForEmail,
  formatReportAsJson,
  getLatestReport,
  SEOReport,
} from "./report-generator";
import {
  runKeywordResearch,
  getKeywordSuggestions,
  KeywordResearchResult,
  KeywordData,
} from "./keyword-research";

// ============================================================================
// CONSTANTS
// ============================================================================

const AGENT_ID = "seo-agent";
const AGENT_VERSION = "1.0.0";

// Default pages to audit
const DEFAULT_PAGES = [
  "/",
  "/pricing",
  "/how-it-works",
  "/blog",
  "/compare",
  "/compare/deleteme",
  "/compare/incogni",
  "/compare/optery",
  "/remove-from",
  "/remove-from/spokeo",
  "/remove-from/whitepages",
  "/remove-from/beenverified",
  "/privacy",
  "/terms",
  "/security",
];

// ============================================================================
// TYPES
// ============================================================================

interface TechnicalAuditInput {
  baseUrl?: string;
  pages?: string[];
}

interface TechnicalAuditResult {
  pageAudits: SEOAuditResult[];
  sitemapStatus: SitemapStatus;
  robotsCheck: SEOCheck;
  overallScore: number;
  summary: string;
}

interface ContentAnalysisInput {
  baseUrl?: string;
  pages?: string[];
}

interface ContentAnalysisResult {
  analyses: ContentAnalysis[];
  overallSuggestions: ContentSuggestion[];
  contentScore: number;
}

interface BlogIdeasInput {
  limit?: number;
  category?: "data-broker" | "privacy" | "security" | "dark-web" | "guide";
}

interface BlogIdeasResult {
  ideas: BlogTopic[];
  totalAvailable: number;
}

interface FullReportInput {
  baseUrl?: string;
  pages?: string[];
  sendEmail?: boolean;
  emailTo?: string;
}

interface FullReportResult {
  report: SEOReport;
  formatted: object;
  emailContent?: string;
  stored: boolean;
}

interface GetReportInput {
  reportId?: string;
}

interface GetReportResult {
  report: SEOReport | null;
  formatted: object | null;
}

interface KeywordResearchInput {
  topic?: string;
}

interface KeywordResearchResultOutput {
  research: KeywordResearchResult;
  topOpportunities: string[];
  keywordGaps: string[];
  competitorInsights: { competitor: string; topKeywords: string[] }[];
}

// ============================================================================
// SEO AGENT CLASS
// ============================================================================

class SEOAgent extends BaseAgent {
  readonly id = AGENT_ID;
  readonly name = "SEO Agent";
  readonly domain = AgentDomains.USER_EXPERIENCE;
  readonly mode = AgentModes.HYBRID;
  readonly version = AGENT_VERSION;
  readonly description =
    "Runs technical SEO audits, analyzes content, generates blog ideas, and creates comprehensive SEO reports";

  readonly capabilities: AgentCapability[] = [
    {
      id: "technical-audit",
      name: "Technical SEO Audit",
      description: "Audit pages for technical SEO issues (meta tags, structure, performance)",
      requiresAI: false,
    },
    {
      id: "content-analysis",
      name: "Content Analysis",
      description: "Analyze content for keyword density, readability, and optimization opportunities",
      requiresAI: false,
    },
    {
      id: "blog-ideas",
      name: "Generate Blog Ideas",
      description: "Generate SEO-optimized blog topic ideas based on gaps",
      requiresAI: false,
    },
    {
      id: "full-report",
      name: "Full SEO Report",
      description: "Run complete SEO audit and generate comprehensive report",
      requiresAI: false,
    },
    {
      id: "get-report",
      name: "Get Latest Report",
      description: "Retrieve the most recent SEO report",
      requiresAI: false,
    },
    {
      id: "keyword-research",
      name: "Keyword Research",
      description: "Search multiple engines (Google, Bing, DuckDuckGo) to discover keyword opportunities and competitor keywords",
      requiresAI: false,
    },
  ];

  protected getSystemPrompt(): string {
    return `You are the SEO Agent for GhostMyData. Your role is to optimize the website for search engines by:
1. Identifying technical SEO issues
2. Analyzing content quality and keyword optimization
3. Suggesting new content opportunities
4. Generating actionable recommendations

Focus on privacy and data protection related keywords. Prioritize high-impact issues.`;
  }

  protected registerHandlers(): void {
    this.handlers.set("technical-audit", this.handleTechnicalAudit.bind(this));
    this.handlers.set("content-analysis", this.handleContentAnalysis.bind(this));
    this.handlers.set("blog-ideas", this.handleBlogIdeas.bind(this));
    this.handlers.set("full-report", this.handleFullReport.bind(this));
    this.handlers.set("get-report", this.handleGetReport.bind(this));
    this.handlers.set("keyword-research", this.handleKeywordResearch.bind(this));
  }

  private getBaseUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL || "https://ghostmydata.com";
  }

  private async handleTechnicalAudit(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<TechnicalAuditResult>> {
    const startTime = Date.now();
    const { baseUrl = this.getBaseUrl(), pages } = input as TechnicalAuditInput;

    try {
      console.log(`[${this.name}] Starting technical audit for ${baseUrl}...`);

      const result = await runFullAudit(baseUrl);

      return this.createSuccessResult<TechnicalAuditResult>(
        result,
        {
          capability: "technical-audit",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "TECHNICAL_AUDIT_ERROR",
          message: error instanceof Error ? error.message : "Technical audit failed",
          retryable: true,
        },
        needsHumanReview: false,
        metadata: {
          agentId: this.id,
          capability: "technical-audit",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleContentAnalysis(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<ContentAnalysisResult>> {
    const startTime = Date.now();
    const { baseUrl = this.getBaseUrl(), pages = DEFAULT_PAGES } = input as ContentAnalysisInput;

    try {
      console.log(`[${this.name}] Starting content analysis for ${pages.length} pages...`);

      const result = await analyzeAllContent(baseUrl, pages);

      return this.createSuccessResult<ContentAnalysisResult>(
        result,
        {
          capability: "content-analysis",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "CONTENT_ANALYSIS_ERROR",
          message: error instanceof Error ? error.message : "Content analysis failed",
          retryable: true,
        },
        needsHumanReview: false,
        metadata: {
          agentId: this.id,
          capability: "content-analysis",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleBlogIdeas(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<BlogIdeasResult>> {
    const startTime = Date.now();
    const { limit = 10, category } = input as BlogIdeasInput;

    try {
      console.log(`[${this.name}] Generating blog ideas...`);

      let ideas = await generateTopicIdeas();

      // Filter by category if specified
      if (category) {
        ideas = ideas.filter(idea => idea.category === category);
      }

      const topIdeas = ideas.slice(0, limit);

      return this.createSuccessResult<BlogIdeasResult>(
        {
          ideas: topIdeas,
          totalAvailable: ideas.length,
        },
        {
          capability: "blog-ideas",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "BLOG_IDEAS_ERROR",
          message: error instanceof Error ? error.message : "Blog idea generation failed",
          retryable: true,
        },
        needsHumanReview: false,
        metadata: {
          agentId: this.id,
          capability: "blog-ideas",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleFullReport(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<FullReportResult>> {
    const startTime = Date.now();
    const {
      baseUrl = this.getBaseUrl(),
      pages = DEFAULT_PAGES,
      sendEmail = false,
      emailTo,
    } = input as FullReportInput;

    try {
      console.log(`[${this.name}] Running full SEO audit and report generation...`);

      // Step 1: Technical audit
      const technicalAudit = await runFullAudit(baseUrl);

      // Step 2: Content analysis
      const contentAnalysis = await analyzeAllContent(baseUrl, pages);

      // Step 3: Blog ideas
      const blogIdeasRaw = await getTopBlogIdeas(10);
      const blogIdeas = blogIdeasRaw.map(idea => ({
        title: idea.title,
        slug: idea.slug,
        keywords: idea.keywords,
        priority: idea.priority,
        category: idea.category,
      }));

      // Step 3.5: Keyword research from multiple engines
      console.log(`[${this.name}] Running keyword research across search engines...`);
      let keywordResearchData: KeywordResearchResult | null = null;
      try {
        keywordResearchData = await runKeywordResearch();
        console.log(`[${this.name}] Found ${keywordResearchData.discoveredKeywords.length} keywords from ${keywordResearchData.searchEnginesUsed.join(", ")}`);
      } catch (err) {
        console.error(`[${this.name}] Keyword research failed, continuing without:`, err);
      }

      // Step 4: Generate report
      const report = await generateSEOReport(technicalAudit, contentAnalysis, blogIdeas);

      // Add keyword research to report
      if (keywordResearchData) {
        (report as SEOReport & { keywordResearch?: KeywordResearchResult }).keywordResearch = keywordResearchData;
      }

      // Step 5: Store report
      await storeReport(report);

      // Step 6: Format for output
      const formatted = formatReportAsJson(report);
      const emailContent = formatReportForEmail(report);

      console.log(`[${this.name}] Report complete. Score: ${report.overallScore}/100`);

      return this.createSuccessResult<FullReportResult>(
        {
          report,
          formatted,
          emailContent: sendEmail ? emailContent : undefined,
          stored: true,
        },
        {
          capability: "full-report",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
        {
          needsHumanReview: report.criticalIssues.length > 0,
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "FULL_REPORT_ERROR",
          message: error instanceof Error ? error.message : "Full report generation failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "full-report",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleGetReport(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<GetReportResult>> {
    const startTime = Date.now();

    try {
      const report = await getLatestReport();

      return this.createSuccessResult<GetReportResult>(
        {
          report,
          formatted: report ? formatReportAsJson(report) : null,
        },
        {
          capability: "get-report",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "GET_REPORT_ERROR",
          message: error instanceof Error ? error.message : "Failed to get report",
          retryable: true,
        },
        needsHumanReview: false,
        metadata: {
          agentId: this.id,
          capability: "get-report",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private async handleKeywordResearch(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<KeywordResearchResultOutput>> {
    const startTime = Date.now();
    const { topic } = (input as KeywordResearchInput) || {};

    try {
      console.log(`[${this.name}] Starting multi-engine keyword research...`);

      // Run full keyword research
      const research = await runKeywordResearch();

      // If topic provided, get topic-specific suggestions too
      if (topic) {
        const topicSuggestions = await getKeywordSuggestions(topic);
        topicSuggestions.forEach(suggestion => {
          if (!research.discoveredKeywords.find(k => k.keyword === suggestion)) {
            research.discoveredKeywords.push({
              keyword: suggestion,
              source: "related",
              relevance: 50,
              currentlyTargeted: false,
            });
          }
        });
      }

      // Extract top opportunities (high relevance, not targeted)
      const topOpportunities = research.discoveredKeywords
        .filter(k => k.relevance >= 60 && !k.currentlyTargeted)
        .slice(0, 15)
        .map(k => k.keyword);

      // Group competitor keywords by competitor
      const competitorMap = new Map<string, string[]>();
      research.competitorKeywords.forEach(ck => {
        const existing = competitorMap.get(ck.competitor) || [];
        if (!existing.includes(ck.keyword)) {
          existing.push(ck.keyword);
        }
        competitorMap.set(ck.competitor, existing);
      });

      const competitorInsights = Array.from(competitorMap.entries())
        .map(([competitor, keywords]) => ({
          competitor,
          topKeywords: keywords.slice(0, 10),
        }));

      console.log(`[${this.name}] Keyword research complete.`);
      console.log(`[${this.name}] Engines used: ${research.searchEnginesUsed.join(", ")}`);
      console.log(`[${this.name}] Keywords found: ${research.discoveredKeywords.length}`);
      console.log(`[${this.name}] Top opportunities: ${topOpportunities.length}`);

      return this.createSuccessResult<KeywordResearchResultOutput>(
        {
          research,
          topOpportunities,
          keywordGaps: research.keywordGaps,
          competitorInsights,
        },
        {
          capability: "keyword-research",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "KEYWORD_RESEARCH_ERROR",
          message: error instanceof Error ? error.message : "Keyword research failed",
          retryable: true,
        },
        needsHumanReview: false,
        metadata: {
          agentId: this.id,
          capability: "keyword-research",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  protected async executeRuleBased<T>(
    capability: string,
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<T>> {
    const handler = this.handlers.get(capability);
    if (handler) {
      return handler(input, context) as Promise<AgentResult<T>>;
    }

    return {
      success: false,
      error: {
        code: "NO_HANDLER",
        message: `No handler for capability: ${capability}`,
        retryable: false,
      },
      needsHumanReview: true,
      metadata: {
        agentId: this.id,
        capability,
        requestId: context.requestId,
        duration: 0,
        usedFallback: true,
        executedAt: new Date(),
      },
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

let seoAgentInstance: SEOAgent | null = null;

export async function getSEOAgent(): Promise<SEOAgent> {
  if (!seoAgentInstance) {
    seoAgentInstance = new SEOAgent();
    await seoAgentInstance.initialize();
    registerAgent(seoAgentInstance);
  }
  return seoAgentInstance;
}

// Convenience functions
export async function runSEOAudit(baseUrl?: string): Promise<TechnicalAuditResult> {
  const agent = await getSEOAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.ON_DEMAND,
  });

  const result = await agent.execute<TechnicalAuditResult>(
    "technical-audit",
    { baseUrl },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "SEO audit failed");
}

export async function runFullSEOReport(options?: FullReportInput): Promise<FullReportResult> {
  const agent = await getSEOAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.CRON,
  });

  const result = await agent.execute<FullReportResult>(
    "full-report",
    options || {},
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "SEO report generation failed");
}

export async function getBlogIdeas(limit = 10): Promise<BlogTopic[]> {
  const agent = await getSEOAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.ON_DEMAND,
  });

  const result = await agent.execute<BlogIdeasResult>(
    "blog-ideas",
    { limit },
    context
  );

  if (result.success && result.data) {
    return result.data.ideas;
  }

  throw new Error(result.error?.message || "Blog idea generation failed");
}

export async function runKeywordResearchReport(topic?: string): Promise<KeywordResearchResultOutput> {
  const agent = await getSEOAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.ON_DEMAND,
  });

  const result = await agent.execute<KeywordResearchResultOutput>(
    "keyword-research",
    { topic },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Keyword research failed");
}

export { SEOAgent };
export default getSEOAgent;

// Re-export types for convenience
export type {
  TechnicalAuditResult,
  ContentAnalysisResult,
  BlogIdeasResult,
  FullReportResult,
  GetReportResult,
  KeywordResearchResultOutput,
};

// Re-export keyword research functions
export { runKeywordResearch, getKeywordSuggestions } from "./keyword-research";
export type { KeywordResearchResult, KeywordData } from "./keyword-research";
