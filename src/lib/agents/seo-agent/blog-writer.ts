/**
 * Blog Post Writer
 *
 * Takes a BlogTopic from the blog-generator and produces a full blog post
 * using Claude Haiku for cost-efficient content generation.
 * Saves the result to the AutoBlogPost database table.
 */

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { MODEL_HAIKU, MODEL_SONNET } from "../base-agent";
import { type BlogTopic, generateBlogOutline } from "./blog-generator";
import { getAllSlugs } from "@/lib/blog/blog-service";

export interface WrittenBlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  readTime: string;
  targetKeywords: string[];
}

/**
 * Estimate read time from word count
 */
function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

/**
 * Map topic category to blog category display name
 */
function categoryDisplayName(category: string): string {
  const map: Record<string, string> = {
    "data-broker": "Data Broker Removal",
    privacy: "Privacy Guide",
    security: "Security",
    "dark-web": "Dark Web Protection",
    guide: "Guide",
    comparison: "Service Comparison",
    "state-privacy": "State Privacy Rights",
    legal: "Legal & Rights",
    scam: "Scam Alert",
    "tool-review": "Privacy Tool Review",
    "platform-privacy": "Platform Privacy",
    "ai-privacy": "AI & Privacy",
  };
  return map[category] || "Privacy";
}

/**
 * Generate a full blog post for a given topic using Claude AI
 */
export async function writeBlogPost(
  topic: BlogTopic
): Promise<WrittenBlogPost | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[blog-writer] ANTHROPIC_API_KEY not set");
    return null;
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const outline = generateBlogOutline(topic);

  const prompt = `You are an expert privacy journalist and cybersecurity writer. Write an in-depth, SEO-optimized blog post for GhostMyData (ghostmydata.com), a data privacy removal service that scans 2,100+ data brokers and uses 24 AI agents to automate removals.

**Topic:** ${topic.title}
**Target Keywords:** ${topic.keywords.join(", ")}
**Category:** ${topic.category}

**Outline to follow:**
${outline.map((section, i) => `${i + 1}. ${section}`).join("\n")}

**Content Requirements:**
- Write 1,500-2,500 words of genuinely helpful, expert-level content
- Use markdown formatting with ## for main sections and ### for subsections
- Weave target keywords naturally (1-2% density) — never keyword stuff
- Write in a confident, authoritative but conversational tone — like a knowledgeable friend
- Include specific, actionable steps with exact URLs, menu paths, or button names where applicable
- Reference relevant privacy laws (CCPA, GDPR, state laws) with actual legal citations where appropriate
- Include a FAQ section at the end with 4-6 questions using ### format — target "People Also Ask" queries
- End with a natural CTA mentioning GhostMyData (not salesy — helpful)
- Do NOT include a title (## or #) at the top — the title is handled separately
- Do NOT include any images, image placeholders, or markdown image syntax
- Use bullet points, numbered lists, and bold key terms for scannability
- Include internal links where natural: [pricing](/pricing), [how it works](/how-it-works), [free scan](/register), [compare services](/compare)
- For data broker articles, reference that GhostMyData covers 2,100+ brokers vs competitors' 35-500
- For scam/security articles, explain how data brokers contribute to the problem and link to scan

**Quality Standards:**
- Write as if publishing on a major cybersecurity outlet (Krebs on Security, The Verge, Wired)
- Every claim must be factually accurate — do not invent statistics or studies
- Use general industry knowledge and publicly available data (FTC reports, state AG data, Verizon DBIR)
- Include real-world examples or scenarios to illustrate points
- Anticipate follow-up questions and address them proactively
- Each section should provide unique value — no filler paragraphs
- Use transition sentences between sections for natural reading flow

Return ONLY the markdown content, nothing else.`;

  try {
    console.log(`[blog-writer] Generating post: ${topic.title}`);

    // Use Sonnet for higher quality content (~$0.02/post vs $0.005 with Haiku)
    const response = await anthropic.messages.create({
      model: MODEL_SONNET,
      max_tokens: 4096,
      temperature: 0.6,
      messages: [{ role: "user", content: prompt }],
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    if (!content || content.length < 500) {
      console.error("[blog-writer] Generated content too short");
      return null;
    }

    // Generate meta description
    const descPrompt = `Write a 150-160 character meta description for a blog post titled "${topic.title}" about ${topic.keywords[0]}. Be compelling and include a call to action. Return ONLY the description text.`;

    const descResponse = await anthropic.messages.create({
      model: MODEL_HAIKU,
      max_tokens: 200,
      temperature: 0.5,
      messages: [{ role: "user", content: descPrompt }],
    });

    const description =
      descResponse.content[0].type === "text"
        ? descResponse.content[0].text.trim()
        : topic.title;

    // Generate tags from keywords + category
    const tags = [
      ...new Set([
        topic.category === "data-broker"
          ? "data broker removal"
          : topic.category,
        "privacy",
        "data removal",
        ...topic.keywords.slice(0, 3),
      ]),
    ];

    return {
      slug: topic.slug,
      title: topic.title,
      description: description.substring(0, 200),
      content,
      category: categoryDisplayName(topic.category),
      tags,
      readTime: estimateReadTime(content),
      targetKeywords: topic.keywords,
    };
  } catch (error) {
    console.error("[blog-writer] Generation failed:", error);
    return null;
  }
}

/**
 * Write and publish a blog post to the database
 * Returns the slug of the published post, or null if failed
 */
export async function writeAndPublishPost(
  topic: BlogTopic
): Promise<string | null> {
  // Check for duplicate slugs
  const existingSlugs = await getAllSlugs();
  if (existingSlugs.includes(topic.slug)) {
    console.log(`[blog-writer] Slug already exists: ${topic.slug}, skipping`);
    return null;
  }

  const post = await writeBlogPost(topic);
  if (!post) return null;

  try {
    await prisma.autoBlogPost.create({
      data: {
        slug: post.slug,
        title: post.title,
        description: post.description,
        content: post.content,
        publishedAt: new Date(),
        author: "GhostMyData Team",
        category: post.category,
        tags: post.tags,
        readTime: post.readTime,
        featured: false,
        status: "PUBLISHED",
        targetKeywords: post.targetKeywords,
        generatedBy: "blog-publisher",
      },
    });

    console.log(`[blog-writer] Published: ${post.slug}`);
    return post.slug;
  } catch (error) {
    console.error("[blog-writer] DB save failed:", error);
    return null;
  }
}
