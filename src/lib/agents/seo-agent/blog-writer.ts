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
 * Article formats to vary the structure of generated posts
 * Rotated based on topic slug hash to ensure deterministic but varied output
 */
const ARTICLE_FORMATS = [
  {
    name: "deep-dive",
    instruction: `Write a deep-dive investigative article. Open with a compelling real-world scenario or anecdote. Use narrative flow between sections — no TL;DR. Build the argument progressively. End with a forward-looking conclusion, not a sales pitch.`,
  },
  {
    name: "practical-guide",
    instruction: `Write a practical step-by-step guide. Open with 1-2 sentences on why this matters RIGHT NOW. Use numbered steps with clear action items. Include "Pro tip:" callouts in bold. End with a quick-reference checklist summary.`,
  },
  {
    name: "myth-busting",
    instruction: `Write a myth-busting article. Open with the most common misconception about this topic. Structure as "Myth vs Reality" sections. Use bold for myth statements and follow each with the factual correction. End with a "What you should actually do" section.`,
  },
  {
    name: "explainer",
    instruction: `Write a clear explainer article. Open with a simple analogy that makes the topic relatable. Use short paragraphs (2-3 sentences max). Include a "Key takeaway:" at the end of each major section. Build complexity gradually. End with "The bottom line" summary.`,
  },
  {
    name: "opinion-analysis",
    instruction: `Write an opinionated analysis piece. Open with a bold, specific claim. Back it up with data and examples. Acknowledge counterarguments honestly. Use first-person plural ("we've seen", "our data shows") sparingly but naturally. End with a clear recommendation.`,
  },
];

/**
 * Writing voice variations to avoid uniform AI tone
 */
const VOICE_VARIATIONS = [
  "Write in a direct, no-nonsense tone. Short sentences. Get to the point fast. Cut any word that doesn't earn its place.",
  "Write in a warm, conversational tone — like explaining this to a smart friend over coffee. Use contractions. Ask occasional rhetorical questions.",
  "Write in a professional, authoritative tone. Use precise language. Back every claim with evidence. Avoid hedging words like 'might' or 'could'.",
  "Write in an engaging, slightly urgent tone. This topic matters and the reader needs to act. Use concrete numbers and deadlines where possible.",
  "Write in a calm, reassuring tone. The reader may feel overwhelmed — guide them step by step. Acknowledge that this is complex but manageable.",
];

/**
 * Simple hash function to deterministically pick format/voice from slug
 */
function hashSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
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

  // Deterministically pick format and voice based on slug
  const slugHash = hashSlug(topic.slug);
  const format = ARTICLE_FORMATS[slugHash % ARTICLE_FORMATS.length];
  const voice = VOICE_VARIATIONS[(slugHash >> 4) % VOICE_VARIATIONS.length];

  const prompt = `You are an expert privacy journalist and cybersecurity writer for GhostMyData (ghostmydata.com), a data privacy removal service that automates removals across 2,100+ data brokers.

**Topic:** ${topic.title}
**Target Keywords:** ${topic.keywords.join(", ")}
**Category:** ${topic.category}

**Outline to follow:**
${outline.map((section, i) => `${i + 1}. ${section}`).join("\n")}

**Article Format:** ${format.name}
${format.instruction}

**Voice:** ${voice}

**Content Requirements:**
- Write 1,500-2,500 words of genuinely helpful, expert-level content
- Use markdown formatting with ## for main sections and ### for subsections
- Vary heading styles — mix statements, questions, and "how to" formats. NOT every heading should be a question.
- Reference GhostMyData operational data where relevant (e.g., "Based on our removal data...", "Our analysis of thousands of removal requests shows...")
- Weave target keywords naturally (1-2% density) — never keyword stuff
- Include specific, actionable steps with exact URLs, menu paths, or button names where applicable
- Reference relevant privacy laws (CCPA, GDPR, state laws) with actual legal citations where appropriate
- End with a natural CTA mentioning GhostMyData (not salesy — helpful)
- Do NOT include a title (## or #) at the top — the title is handled separately
- Do NOT include any images, image placeholders, or markdown image syntax
- Use bullet points, numbered lists, and bold key terms for scannability
- Include internal links where natural: [pricing](/pricing), [how it works](/how-it-works), [free scan](/register), [compare services](/compare)
- For data broker articles, reference that GhostMyData covers 2,100+ brokers vs competitors' 35-500
- For scam/security articles, explain how data brokers contribute to the problem and link to scan

**CRITICAL — Avoid AI-Sounding Patterns:**
- NEVER start with "In today's digital landscape", "In an era of", "In the ever-evolving", or any similar throat-clearing
- NEVER use "It's important to note that", "It's worth mentioning", "Navigating the complex world of"
- NEVER write "In conclusion" or "To sum up" — just make your final point
- NEVER use "leverage", "utilize", "empower", "robust", "cutting-edge", "seamless" — use plain English
- NEVER use "comprehensive guide" or "ultimate guide" in the body text
- Vary sentence length dramatically — mix 5-word punches with longer explanatory sentences
- Use specific numbers, dates, and proper nouns instead of vague phrases
- Include at least one contrarian or surprising point that challenges common assumptions
- Write like a real person with opinions, not a knowledge aggregator

**Quality Standards:**
- Write as if publishing on a major cybersecurity outlet (Krebs on Security, The Verge, Wired)
- Every claim must be factually accurate — do not invent statistics or studies
- Use general industry knowledge and publicly available data (FTC reports, state AG data, Verizon DBIR)
- Include real-world examples or scenarios to illustrate points
- Anticipate follow-up questions and address them proactively
- Each section should provide unique value — no filler paragraphs

Return ONLY the markdown content, nothing else.`;

  try {
    console.log(`[blog-writer] Generating post: ${topic.title}`);

    // Use Sonnet for higher quality content (~$0.02/post vs $0.005 with Haiku)
    // Vary temperature between 0.7–0.9 for more natural variation across posts
    const temperature = 0.7 + (slugHash % 3) * 0.1;
    const response = await anthropic.messages.create({
      model: MODEL_SONNET,
      max_tokens: 4096,
      temperature,
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
        author: "Rocky Kathuria",
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
