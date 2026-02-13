/**
 * Content Agent
 *
 * Handles content generation including:
 * - Blog post generation
 * - Help article creation
 * - Marketing copy
 * - SEO content optimization
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
import { buildAgentMastermindPrompt } from "@/lib/mastermind";
import { mrbeastRemarkabilityScore } from "@/lib/mastermind/frameworks";

// ============================================================================
// CONSTANTS
// ============================================================================

const AGENT_ID = "content-agent";
const AGENT_VERSION = "1.0.0";

// ============================================================================
// TYPES
// ============================================================================

interface BlogPostInput {
  topic: string;
  keywords?: string[];
  targetLength?: "short" | "medium" | "long";
  tone?: "professional" | "casual" | "educational";
}

interface BlogPostResult {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaDescription: string;
  keywords: string[];
  estimatedReadTime: number;
  seoScore: number;
}

interface HelpArticleInput {
  topic: string;
  category: "getting-started" | "features" | "troubleshooting" | "faq";
  relatedFeatures?: string[];
}

interface HelpArticleResult {
  title: string;
  slug: string;
  category: string;
  content: string;
  steps?: Array<{
    step: number;
    title: string;
    description: string;
  }>;
  relatedArticles: string[];
  keywords: string[];
}

interface MarketingCopyInput {
  type: "email" | "landing_page" | "ad" | "social";
  campaign?: string;
  audience?: string;
  callToAction?: string;
}

interface MarketingCopyResult {
  type: string;
  headline: string;
  subheadline?: string;
  body: string;
  callToAction: string;
  variants: Array<{
    name: string;
    headline: string;
    body: string;
  }>;
}

interface SEOOptimizeInput {
  content: string;
  targetKeywords: string[];
  contentType?: "blog" | "landing" | "product";
}

interface SEOOptimizeResult {
  optimizedContent: string;
  seoScore: number;
  improvements: Array<{
    type: string;
    suggestion: string;
    impact: "LOW" | "MEDIUM" | "HIGH";
  }>;
  keywordDensity: Record<string, number>;
  readabilityScore: number;
}

interface GenerateMetaInput {
  url: string;
  issueType: string;
  currentContent?: {
    title?: string;
    description?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
  pageContent?: string;
}

interface GenerateMetaResult {
  url: string;
  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterCard: string;
    twitterTitle: string;
    twitterDescription: string;
  };
  code: string; // Next.js metadata export code
  applied: boolean;
}

// ============================================================================
// CONTENT AGENT CLASS
// ============================================================================

class ContentAgent extends BaseAgent {
  readonly id = AGENT_ID;
  readonly name = "Content Agent";
  readonly domain = AgentDomains.USER_EXPERIENCE;
  readonly mode = AgentModes.AI;
  readonly version = AGENT_VERSION;
  readonly description =
    "Generates blog posts, help articles, marketing copy, and optimizes content for SEO";

  readonly capabilities: AgentCapability[] = [
    {
      id: "generate-blog",
      name: "Generate Blog Post",
      description: "Generate SEO-optimized blog posts",
      requiresAI: true,
      estimatedTokens: 1500,
    },
    {
      id: "generate-help",
      name: "Generate Help Article",
      description: "Create help and documentation articles",
      requiresAI: true,
      estimatedTokens: 800,
    },
    {
      id: "generate-marketing",
      name: "Generate Marketing Copy",
      description: "Create marketing copy for various channels",
      requiresAI: true,
      estimatedTokens: 600,
    },
    {
      id: "optimize-seo",
      name: "Optimize for SEO",
      description: "Analyze and optimize content for search engines",
      requiresAI: true,
      estimatedTokens: 500,
    },
    {
      id: "generate-meta",
      name: "Generate Meta Tags",
      description: "Generate missing meta tags (title, description, OG tags) for pages",
      requiresAI: false,
      estimatedTokens: 200,
    },
    {
      id: "optimize-content",
      name: "Optimize Content",
      description: "Optimize existing content for SEO and readability",
      requiresAI: true,
      estimatedTokens: 800,
    },
  ];

  protected getSystemPrompt(): string {
    const base = `You are the Content Agent for GhostMyData, a data privacy and removal service. Your role is to create compelling, accurate, and SEO-optimized content about data privacy, personal information protection, and our services. Write in a helpful, authoritative tone that builds trust with readers concerned about their online privacy.`;
    const mastermind = buildAgentMastermindPrompt("brand-media", 3);
    return `${base}${mastermind}`;
  }

  protected registerHandlers(): void {
    this.handlers.set("generate-blog", this.handleGenerateBlog.bind(this));
    this.handlers.set("generate-help", this.handleGenerateHelp.bind(this));
    this.handlers.set("generate-marketing", this.handleGenerateMarketing.bind(this));
    this.handlers.set("optimize-seo", this.handleOptimizeSEO.bind(this));
    this.handlers.set("generate-meta", this.handleGenerateMeta.bind(this));
    this.handlers.set("optimize-content", this.handleOptimizeContent.bind(this));
  }

  private async handleGenerateBlog(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<BlogPostResult>> {
    const startTime = Date.now();
    const {
      topic,
      keywords = [],
      targetLength = "medium",
      tone = "professional",
    } = input as BlogPostInput;

    try {
      // Read directives for content configuration
      const directiveWordCount = await this.getDirective<number>("content_target_wordcount", 1000);
      const focusTopics = await this.getDirective<string[]>("content_focus_topics", []);

      // In production, would use AI to generate content
      // For now, generate structured template
      const slug = topic
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const wordCounts = { short: 500, medium: directiveWordCount, long: 2000 };
      const targetWords = wordCounts[targetLength];

      // Merge focus topics from directive into keywords
      const mergedKeywords = [...new Set([...keywords, ...focusTopics])];

      const content = this.generateBlogTemplate(topic, mergedKeywords, tone);
      const metaDescription = `Learn about ${topic}. Discover how to protect your personal information and maintain your privacy online with GhostMyData.`;

      const seoKeywords = [
        ...mergedKeywords,
        "data privacy",
        "personal information",
        "data removal",
      ].slice(0, 10);

      // Score content quality with MrBeast Remarkability framework
      const remarkability = mrbeastRemarkabilityScore({
        hasHook: content.includes("?") || content.includes("!"),
        hasStakes: content.toLowerCase().includes("protect") || content.toLowerCase().includes("risk"),
        hasSurprise: content.toLowerCase().includes("surprising") || content.toLowerCase().includes("discover"),
        isShareWorthy: seoKeywords.length >= 3 && targetWords >= 800,
        scaleMultiplier: Math.min(10, Math.ceil(targetWords / 200)),
      });

      // Use remarkability to influence seoScore
      const seoScore = Math.min(100, Math.round(85 * 0.6 + remarkability * 0.4));

      return this.createSuccessResult<BlogPostResult>(
        {
          title: `${topic}: A Complete Guide to Protecting Your Privacy`,
          slug,
          excerpt: metaDescription,
          content,
          metaDescription,
          keywords: seoKeywords,
          estimatedReadTime: Math.ceil(targetWords / 200),
          seoScore,
        },
        {
          capability: "generate-blog",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
        {
          needsHumanReview: true, // Content should always be reviewed
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "BLOG_ERROR",
          message: error instanceof Error ? error.message : "Blog generation failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "generate-blog",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private generateBlogTemplate(topic: string, keywords: string[], tone: string): string {
    return `
# ${topic}: A Complete Guide to Protecting Your Privacy

In today's digital age, protecting your personal information has never been more important. ${topic} is a critical aspect of maintaining your online privacy.

## Why ${topic} Matters

Your personal data is constantly being collected, shared, and sold by data brokers. Understanding ${topic} helps you take control of your digital footprint.

${keywords.length > 0 ? `### Key Concepts: ${keywords.join(", ")}` : ""}

## How to Get Started

1. **Assess Your Current Exposure** - Run a comprehensive scan to see where your data appears
2. **Understand Your Rights** - Know your privacy rights under GDPR, CCPA, and other regulations
3. **Take Action** - Request removal of your personal information from data brokers

## Best Practices

- Regularly monitor your online presence
- Use privacy-focused tools and services
- Be mindful of what information you share online

## Conclusion

${topic} is an essential part of protecting your privacy. With the right tools and knowledge, you can significantly reduce your digital footprint and take back control of your personal information.

---
*Want to learn more about protecting your privacy? [Get started with GhostMyData](/signup) today.*
    `.trim();
  }

  private async handleGenerateHelp(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<HelpArticleResult>> {
    const startTime = Date.now();
    const { topic, category, relatedFeatures = [] } = input as HelpArticleInput;

    try {
      const slug = topic
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const steps = this.generateHelpSteps(topic, category);
      const content = this.generateHelpContent(topic, category, steps);

      const relatedArticles = this.suggestRelatedArticles(category, relatedFeatures);

      return this.createSuccessResult<HelpArticleResult>(
        {
          title: `How to ${topic}`,
          slug,
          category,
          content,
          steps,
          relatedArticles,
          keywords: [topic.toLowerCase(), category, "help", "guide", "tutorial"],
        },
        {
          capability: "generate-help",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
        {
          needsHumanReview: true,
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "HELP_ERROR",
          message: error instanceof Error ? error.message : "Help article generation failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "generate-help",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private generateHelpSteps(topic: string, category: string): HelpArticleResult["steps"] {
    const commonSteps: Record<string, HelpArticleResult["steps"]> = {
      "getting-started": [
        { step: 1, title: "Create your account", description: "Sign up for a GhostMyData account" },
        { step: 2, title: "Run your first scan", description: "Start a comprehensive privacy scan" },
        { step: 3, title: "Review your results", description: "See where your data appears online" },
      ],
      features: [
        { step: 1, title: "Access the feature", description: "Navigate to the feature in your dashboard" },
        { step: 2, title: "Configure settings", description: "Adjust the feature to your preferences" },
        { step: 3, title: "Verify it's working", description: "Confirm the feature is active" },
      ],
      troubleshooting: [
        { step: 1, title: "Identify the issue", description: "Understand what's not working" },
        { step: 2, title: "Try common fixes", description: "Apply standard troubleshooting steps" },
        { step: 3, title: "Contact support", description: "Reach out if the issue persists" },
      ],
      faq: [],
    };

    return commonSteps[category] || [];
  }

  private generateHelpContent(
    topic: string,
    category: string,
    steps: HelpArticleResult["steps"]
  ): string {
    let content = `# How to ${topic}\n\n`;

    if (category === "faq") {
      content += `## Frequently Asked Questions about ${topic}\n\n`;
      content += `Find answers to common questions about ${topic}.\n\n`;
    } else {
      content += `This guide will walk you through ${topic.toLowerCase()}.\n\n`;

      if (steps && steps.length > 0) {
        content += `## Steps\n\n`;
        for (const step of steps) {
          content += `### Step ${step.step}: ${step.title}\n\n`;
          content += `${step.description}\n\n`;
        }
      }
    }

    content += `## Need More Help?\n\n`;
    content += `If you have questions, contact our support team at support@ghostmydata.com.\n`;

    return content;
  }

  private suggestRelatedArticles(category: string, features: string[]): string[] {
    const suggestions: string[] = [];

    if (category === "getting-started") {
      suggestions.push("Understanding Your Privacy Score", "Setting Up Notifications");
    } else if (category === "features") {
      suggestions.push("Feature Overview", "Advanced Settings");
    } else if (category === "troubleshooting") {
      suggestions.push("Common Issues", "Contacting Support");
    }

    for (const feature of features.slice(0, 2)) {
      suggestions.push(`Using ${feature}`);
    }

    return suggestions;
  }

  private async handleGenerateMarketing(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<MarketingCopyResult>> {
    const startTime = Date.now();
    const {
      type,
      campaign = "general",
      audience = "privacy-conscious consumers",
      callToAction = "Get Started Free",
    } = input as MarketingCopyInput;

    try {
      const copy = this.generateMarketingCopy(type, campaign, audience, callToAction);

      return this.createSuccessResult<MarketingCopyResult>(
        copy,
        {
          capability: "generate-marketing",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
        {
          needsHumanReview: true,
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "MARKETING_ERROR",
          message: error instanceof Error ? error.message : "Marketing copy generation failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "generate-marketing",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private generateMarketingCopy(
    type: string,
    campaign: string,
    audience: string,
    callToAction: string
  ): MarketingCopyResult {
    const templates: Record<string, Omit<MarketingCopyResult, "type">> = {
      email: {
        headline: "Your Personal Data Is Being Sold. Here's How to Stop It.",
        subheadline: "Take back control of your privacy in minutes",
        body: `Did you know that over 4,000 data brokers are selling your personal information right now? Your name, address, phone number, and more are available to anyone willing to pay.

GhostMyData automatically removes your information from data broker sites, protecting your privacy and reducing unwanted contact.`,
        callToAction,
        variants: [
          {
            name: "urgency",
            headline: "Your Data Is Exposed. Act Now.",
            body: "Every day you wait, your personal information spreads further. Take action today.",
          },
          {
            name: "benefit",
            headline: "Sleep Better Knowing Your Data Is Protected",
            body: "Join thousands who've taken back their privacy with automated data removal.",
          },
        ],
      },
      landing_page: {
        headline: "Remove Your Personal Information From the Internet",
        subheadline: "Automated privacy protection that works 24/7",
        body: `Your personal information is scattered across hundreds of data broker websites. These companies collect and sell your data without your consent.

GhostMyData finds where your data appears and automatically requests removal. We continuously monitor for new exposures and keep your information private.`,
        callToAction,
        variants: [
          {
            name: "social_proof",
            headline: "Join 50,000+ People Protecting Their Privacy",
            body: "Trusted by privacy-conscious individuals worldwide to keep their data safe.",
          },
        ],
      },
      ad: {
        headline: "Stop Data Brokers From Selling Your Info",
        body: "Automatic removal from 200+ data broker sites. Try free.",
        callToAction,
        variants: [
          {
            name: "question",
            headline: "Is Your Personal Data Being Sold?",
            body: "Find out in 60 seconds with a free privacy scan.",
          },
          {
            name: "statistic",
            headline: "4,000+ Data Brokers Have Your Info",
            body: "We remove it automatically. Start protecting your privacy today.",
          },
        ],
      },
      social: {
        headline: "Did you know data brokers are selling YOUR information?",
        body: "Your name, address, phone number, and more—all available for purchase. Take back control of your privacy. 🛡️",
        callToAction,
        variants: [
          {
            name: "educational",
            headline: "What data brokers know about you might surprise you",
            body: "We scanned the internet and found personal data for 99% of Americans. Protect yourself.",
          },
        ],
      },
    };

    return {
      type,
      ...templates[type] || templates.email,
    };
  }

  private async handleOptimizeSEO(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<SEOOptimizeResult>> {
    const startTime = Date.now();
    const { content, targetKeywords, contentType = "blog" } = input as SEOOptimizeInput;

    try {
      const analysis = this.analyzeSEO(content, targetKeywords);
      const optimizedContent = this.applySEOImprovements(content, analysis.improvements);

      return this.createSuccessResult<SEOOptimizeResult>(
        {
          optimizedContent,
          seoScore: analysis.score,
          improvements: analysis.improvements,
          keywordDensity: analysis.keywordDensity,
          readabilityScore: analysis.readabilityScore,
        },
        {
          capability: "optimize-seo",
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
          code: "SEO_ERROR",
          message: error instanceof Error ? error.message : "SEO optimization failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "optimize-seo",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private analyzeSEO(
    content: string,
    keywords: string[]
  ): {
    score: number;
    improvements: SEOOptimizeResult["improvements"];
    keywordDensity: Record<string, number>;
    readabilityScore: number;
  } {
    const contentLower = content.toLowerCase();
    const wordCount = content.split(/\s+/).length;
    const improvements: SEOOptimizeResult["improvements"] = [];
    let score = 100;

    // Calculate keyword density
    const keywordDensity: Record<string, number> = {};
    for (const keyword of keywords) {
      const regex = new RegExp(keyword.toLowerCase(), "gi");
      const matches = contentLower.match(regex);
      const count = matches ? matches.length : 0;
      const density = (count / wordCount) * 100;
      keywordDensity[keyword] = Math.round(density * 100) / 100;

      if (density < 0.5) {
        improvements.push({
          type: "keyword_density",
          suggestion: `Increase usage of "${keyword}" (current: ${density.toFixed(1)}%)`,
          impact: "HIGH",
        });
        score -= 10;
      } else if (density > 3) {
        improvements.push({
          type: "keyword_stuffing",
          suggestion: `Reduce usage of "${keyword}" to avoid keyword stuffing`,
          impact: "MEDIUM",
        });
        score -= 5;
      }
    }

    // Check for heading structure
    if (!content.includes("# ")) {
      improvements.push({
        type: "heading",
        suggestion: "Add a main heading (H1) to the content",
        impact: "HIGH",
      });
      score -= 15;
    }

    // Check for meta description length (if in first paragraph)
    const firstParagraph = content.split("\n\n")[0];
    if (firstParagraph.length < 120) {
      improvements.push({
        type: "meta_description",
        suggestion: "Expand the introduction for a better meta description",
        impact: "MEDIUM",
      });
      score -= 5;
    }

    // Check content length
    if (wordCount < 300) {
      improvements.push({
        type: "content_length",
        suggestion: "Add more content (minimum 300 words recommended)",
        impact: "HIGH",
      });
      score -= 20;
    }

    // Readability score (simplified Flesch-Kincaid approximation)
    const sentences = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentences;
    let readabilityScore = 100 - avgWordsPerSentence * 2;
    readabilityScore = Math.max(0, Math.min(100, readabilityScore));

    if (readabilityScore < 60) {
      improvements.push({
        type: "readability",
        suggestion: "Break up long sentences to improve readability",
        impact: "MEDIUM",
      });
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      improvements,
      keywordDensity,
      readabilityScore,
    };
  }

  private applySEOImprovements(
    content: string,
    improvements: SEOOptimizeResult["improvements"]
  ): string {
    // Return original content - actual optimization would be done by AI in production
    return content;
  }

  private async handleGenerateMeta(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<GenerateMetaResult>> {
    const startTime = Date.now();
    const { url, issueType, currentContent = {} } = input as GenerateMetaInput;

    try {
      // Extract page name from URL for generating content
      const pageName = this.extractPageName(url);
      const meta = this.generateMetaForPage(pageName, currentContent);

      // Generate Next.js metadata export code
      const code = this.generateMetadataCode(meta);

      return this.createSuccessResult<GenerateMetaResult>(
        {
          url,
          meta,
          code,
          applied: false, // Content agent generates, doesn't apply
        },
        {
          capability: "generate-meta",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
        {
          needsHumanReview: true, // Always review generated meta
          suggestedActions: [
            {
              action: "apply-meta-tags",
              description: `Apply generated meta tags to ${url}`,
              targetAgent: "operations-agent",
              priority: "HIGH",
              autoExecute: false,
            },
          ],
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "META_GENERATION_ERROR",
          message: error instanceof Error ? error.message : "Meta tag generation failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "generate-meta",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
      };
    }
  }

  private extractPageName(url: string): string {
    // Extract meaningful page name from URL
    const path = url.replace(/^https?:\/\/[^\/]+/, "").replace(/\/$/, "");
    if (!path || path === "/") return "Home";

    const parts = path.split("/").filter(Boolean);
    const pageName = parts[parts.length - 1]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return pageName;
  }

  private generateMetaForPage(
    pageName: string,
    currentContent: GenerateMetaInput["currentContent"]
  ): GenerateMetaResult["meta"] {
    const siteName = "GhostMyData";
    const baseDescription = "Protect your privacy online. Remove your personal information from data broker sites automatically.";

    // Generate contextual title
    const title = currentContent?.title ||
      (pageName === "Home"
        ? `${siteName} - Remove Your Personal Data from the Internet`
        : `${pageName} | ${siteName}`);

    // Generate contextual description
    const description = currentContent?.description ||
      this.generateDescription(pageName, baseDescription);

    // OG tags (use title/description if not provided)
    const ogTitle = currentContent?.ogTitle || title;
    const ogDescription = currentContent?.ogDescription || description;
    const ogImage = currentContent?.ogImage || "https://ghostmydata.com/og-image.png";

    return {
      title,
      description,
      ogTitle,
      ogDescription,
      ogImage,
      twitterCard: "summary_large_image",
      twitterTitle: ogTitle,
      twitterDescription: ogDescription,
    };
  }

  private generateDescription(pageName: string, baseDescription: string): string {
    const descriptions: Record<string, string> = {
      "Home": "GhostMyData automatically removes your personal information from data brokers. Protect your privacy and reduce unwanted contact. Start your free scan today.",
      "Pricing": "Choose the right privacy protection plan for you. GhostMyData offers affordable data removal services with continuous monitoring.",
      "How It Works": "Learn how GhostMyData protects your privacy. We scan data brokers, submit removal requests, and continuously monitor for re-appearances.",
      "Blog": "Privacy tips, data protection guides, and industry insights from GhostMyData. Stay informed about protecting your personal information online.",
      "Compare": "Compare GhostMyData with other data removal services. See why we offer the best value for comprehensive privacy protection.",
      "Privacy": "Read GhostMyData's privacy policy. We're committed to protecting your data while removing it from unwanted places.",
      "Terms": "GhostMyData terms of service. Understand your rights and responsibilities when using our data removal services.",
      "Security": "Learn about GhostMyData's security practices. We use enterprise-grade encryption to protect your information.",
    };

    return descriptions[pageName] || `${pageName} - ${baseDescription}`;
  }

  private generateMetadataCode(meta: GenerateMetaResult["meta"]): string {
    return `// Add this to your page component
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "${meta.title}",
  description: "${meta.description}",
  openGraph: {
    title: "${meta.ogTitle}",
    description: "${meta.ogDescription}",
    images: ["${meta.ogImage}"],
    type: 'website',
  },
  twitter: {
    card: "${meta.twitterCard}",
    title: "${meta.twitterTitle}",
    description: "${meta.twitterDescription}",
  },
};`;
  }

  private async handleOptimizeContent(
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<SEOOptimizeResult>> {
    const startTime = Date.now();
    const { url, issueType, currentContent, targetKeywords = [] } = input as {
      url?: string;
      issueType?: string;
      currentContent?: string;
      targetKeywords?: string[];
    };

    try {
      // If no content provided, return suggestions only
      if (!currentContent) {
        return this.createSuccessResult<SEOOptimizeResult>(
          {
            optimizedContent: "",
            seoScore: 0,
            improvements: [
              {
                type: "no_content",
                suggestion: "No content provided for optimization. Fetch page content first.",
                impact: "HIGH",
              },
            ],
            keywordDensity: {},
            readabilityScore: 0,
          },
          {
            capability: "optimize-content",
            requestId: context.requestId,
            duration: Date.now() - startTime,
            usedFallback: false,
            executedAt: new Date(),
          }
        );
      }

      // Use the existing SEO analysis
      const analysis = this.analyzeSEO(currentContent, targetKeywords);

      // Generate optimization suggestions based on issue type
      if (issueType === "thin_content" && analysis.improvements.every(i => i.type !== "content_length")) {
        analysis.improvements.push({
          type: "content_expansion",
          suggestion: "Add more detailed explanations, examples, and supporting content",
          impact: "HIGH",
        });
      }

      if (issueType === "low_readability" && analysis.improvements.every(i => i.type !== "readability")) {
        analysis.improvements.push({
          type: "readability",
          suggestion: "Break up long sentences and paragraphs, use simpler words",
          impact: "MEDIUM",
        });
      }

      return this.createSuccessResult<SEOOptimizeResult>(
        {
          optimizedContent: currentContent, // Would be AI-optimized in production
          seoScore: analysis.score,
          improvements: analysis.improvements,
          keywordDensity: analysis.keywordDensity,
          readabilityScore: analysis.readabilityScore,
        },
        {
          capability: "optimize-content",
          requestId: context.requestId,
          duration: Date.now() - startTime,
          usedFallback: false,
          executedAt: new Date(),
        },
        {
          needsHumanReview: true,
        }
      );
    } catch (error) {
      return {
        success: false,
        error: {
          code: "CONTENT_OPTIMIZE_ERROR",
          message: error instanceof Error ? error.message : "Content optimization failed",
          retryable: true,
        },
        needsHumanReview: true,
        metadata: {
          agentId: this.id,
          capability: "optimize-content",
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

let contentAgentInstance: ContentAgent | null = null;

export async function getContentAgent(): Promise<ContentAgent> {
  if (!contentAgentInstance) {
    contentAgentInstance = new ContentAgent();
    await contentAgentInstance.initialize();
    registerAgent(contentAgentInstance);
  }
  return contentAgentInstance;
}

export async function generateBlogPost(
  topic: string,
  keywords?: string[]
): Promise<BlogPostResult> {
  const agent = await getContentAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.ON_DEMAND,
  });

  const result = await agent.execute<BlogPostResult>(
    "generate-blog",
    { topic, keywords },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Blog post generation failed");
}

export async function generateHelpArticle(
  topic: string,
  category: HelpArticleInput["category"]
): Promise<HelpArticleResult> {
  const agent = await getContentAgent();
  const context = createAgentContext({
    requestId: nanoid(),
    invocationType: InvocationTypes.ON_DEMAND,
  });

  const result = await agent.execute<HelpArticleResult>(
    "generate-help",
    { topic, category },
    context
  );

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error?.message || "Help article generation failed");
}

export { ContentAgent };
export default getContentAgent;
