/**
 * Page Content Optimizer
 *
 * Reads page files, generates improved content, and writes changes back.
 * Used by Content Agent for automated SEO improvements.
 */

import * as fs from "fs/promises";
import * as path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { getOptimizationKeywords } from "../shared/keyword-intelligence";

// ============================================================================
// TYPES
// ============================================================================

export interface PageOptimizationResult {
  url: string;
  filePath: string;
  originalWordCount: number;
  newWordCount: number;
  originalReadability: number;
  newReadability: number;
  keywordsAdded: string[];
  success: boolean;
  error?: string;
  changes: string[];
}

export interface OptimizationConfig {
  targetWordCount: number;
  targetReadability: number;
  targetKeywords: string[];
  maxContentLength?: number;
}

// ============================================================================
// URL TO FILE PATH MAPPING
// ============================================================================

const PROJECT_ROOT = process.cwd();
const MARKETING_PAGES_DIR = path.join(PROJECT_ROOT, "src", "app", "(marketing)");

const URL_TO_FILE_MAP: Record<string, string> = {
  "/compare": "compare/page.tsx",
  "/remove-from": "remove-from/page.tsx",
  "/privacy": "privacy/page.tsx",
  "/terms": "terms/page.tsx",
  "/security": "security/page.tsx",
  "/pricing": "pricing/page.tsx",
  "/how-it-works": "how-it-works/page.tsx",
  "/blog": "blog/page.tsx",
};

export function urlToFilePath(url: string): string | null {
  // Extract path from URL
  const urlPath = url.replace(/^https?:\/\/[^\/]+/, "").replace(/\/$/, "") || "/";

  // Check direct mapping
  const relativePath = URL_TO_FILE_MAP[urlPath];
  if (relativePath) {
    return path.join(MARKETING_PAGES_DIR, relativePath);
  }

  // Try to construct path for sub-pages
  const parts = urlPath.split("/").filter(Boolean);
  if (parts.length > 0) {
    const possiblePath = path.join(MARKETING_PAGES_DIR, ...parts, "page.tsx");
    return possiblePath;
  }

  return null;
}

// ============================================================================
// CONTENT ANALYSIS
// ============================================================================

export function calculateReadability(text: string): number {
  // Simplified Flesch Reading Ease approximation
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((count, word) => {
    return count + countSyllables(word);
  }, 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  // Flesch Reading Ease formula
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  return Math.max(0, Math.min(100, Math.round(score)));
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;

  const vowels = "aeiouy";
  let count = 0;
  let prevWasVowel = false;

  for (const char of word) {
    const isVowel = vowels.includes(char);
    if (isVowel && !prevWasVowel) count++;
    prevWasVowel = isVowel;
  }

  // Adjust for silent e
  if (word.endsWith("e") && count > 1) count--;

  return Math.max(1, count);
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

export function findKeywords(text: string, keywords: string[]): string[] {
  const textLower = text.toLowerCase();
  return keywords.filter(kw => textLower.includes(kw.toLowerCase()));
}

// ============================================================================
// CONTENT EXTRACTION
// ============================================================================

export function extractTextContent(jsxContent: string): string {
  // Remove imports, exports, and code
  const text = jsxContent
    // Remove import statements
    .replace(/^import\s+.*?;?\s*$/gm, "")
    // Remove export statements (but keep content)
    .replace(/^export\s+(const|default|async|function)\s+/gm, "")
    // Remove metadata exports
    .replace(/export\s+const\s+metadata[\s\S]*?};/g, "")
    // Remove TypeScript types
    .replace(/<[A-Z][a-zA-Z]*>/g, "")
    // Remove JSX tags but keep text
    .replace(/<[^>]+>/g, " ")
    // Remove className attributes
    .replace(/className="[^"]*"/g, "")
    // Remove template literals
    .replace(/\{`[^`]*`\}/g, " ")
    // Remove JS expressions
    .replace(/\{[^}]+\}/g, " ")
    // Clean up
    .replace(/\s+/g, " ")
    .trim();

  return text;
}

// ============================================================================
// AI CONTENT GENERATION
// ============================================================================

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

interface ContentSection {
  type: "hero" | "features" | "content" | "faq" | "cta";
  title?: string;
  content: string;
}

export async function generateImprovedContent(
  currentContent: string,
  pageType: string,
  config: OptimizationConfig
): Promise<{ sections: ContentSection[]; fullContent: string }> {
  if (!anthropic) {
    console.log("[PageOptimizer] No Anthropic API key, using template-based generation");
    return generateTemplateContent(pageType, config);
  }

  const prompt = `You are a content writer for GhostMyData, a data privacy and removal service.
Improve the following page content to achieve:
- Word count: ${config.targetWordCount}+ words
- Readability score: ${config.targetReadability}+ (Flesch Reading Ease - use simple, short sentences)
- Naturally include these keywords: ${config.targetKeywords.join(", ")}

Page type: ${pageType}
Current content summary: ${currentContent.slice(0, 1000)}...

IMPORTANT GUIDELINES:
1. Use short sentences (15-20 words max)
2. Use simple, common words
3. Break up long paragraphs
4. Add helpful subheadings
5. Include the target keywords naturally
6. Write in a friendly, helpful tone
7. Focus on benefits for the user

Generate improved content sections in JSON format:
{
  "sections": [
    { "type": "hero", "title": "...", "content": "..." },
    { "type": "content", "title": "...", "content": "..." },
    ...
  ]
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const fullContent = parsed.sections
        .map((s: ContentSection) => `${s.title ? `## ${s.title}\n\n` : ""}${s.content}`)
        .join("\n\n");
      return { sections: parsed.sections, fullContent };
    }
  } catch (error) {
    console.error("[PageOptimizer] AI generation failed:", error);
  }

  // Fallback to template
  return generateTemplateContent(pageType, config);
}

function generateTemplateContent(
  pageType: string,
  config: OptimizationConfig
): { sections: ContentSection[]; fullContent: string } {
  const keywords = config.targetKeywords;

  const templates: Record<string, ContentSection[]> = {
    compare: [
      {
        type: "hero",
        title: "Compare Data Removal Services",
        content: `Looking for the best ${keywords[0] || "data removal service"}? We help you compare top privacy protection services. Finding the right service to ${keywords[1] || "remove personal information"} can be confusing. There are many options available. Each service has different features and pricing. We break down the key differences. This helps you make an informed choice. Your privacy matters. Choose a service that fits your needs.`
      },
      {
        type: "content",
        title: "Why Compare Services?",
        content: `Not all ${keywords[0] || "data removal services"} are equal. Some focus on speed. Others prioritize coverage. Price varies significantly between providers. Features differ too. Some offer monitoring. Others provide one-time removal. Understanding these differences saves you money. It also ensures better protection. A good comparison helps you find the right fit. Consider your specific privacy needs. Think about your budget. Look at the number of data brokers covered.`
      },
      {
        type: "content",
        title: "Key Features to Consider",
        content: `When choosing a ${keywords[0] || "data removal service"}, look at coverage first. How many data brokers do they monitor? Check the removal process. Is it automated or manual? Look at monitoring frequency. Daily is better than weekly. Consider the support options. Can you reach them easily? Review the pricing structure. Monthly or annual plans may save money. Look for a money-back guarantee. This shows confidence in their service. Read customer reviews too.`
      },
      {
        type: "content",
        title: "How GhostMyData Compares",
        content: `GhostMyData offers comprehensive ${keywords[2] || "data broker removal"}. We cover 200+ data broker sites. Our automated system works 24/7. We provide continuous monitoring. New exposures are caught quickly. Our ${keywords[3] || "privacy protection"} is thorough. We handle the entire removal process. You just set it up once. Then we do the work. Our team verifies every removal. We re-submit if data reappears. This ongoing protection keeps you safe.`
      },
      {
        type: "faq",
        title: "Frequently Asked Questions",
        content: `**How long does data removal take?** Most removals complete within 2-4 weeks. Some sites take longer. We keep you updated throughout the process.\n\n**Do I need to provide personal information?** Yes, we need your details to find and remove your data. We use bank-level encryption to protect this information.\n\n**What happens after removal?** We continue monitoring. If your data reappears, we remove it again. This is included in your subscription.\n\n**Can I cancel anytime?** Yes, you can cancel your subscription at any time. No long-term contracts required.`
      }
    ],
    "remove-from": [
      {
        type: "hero",
        title: "Remove Your Information from Data Brokers",
        content: `Data brokers collect and sell your personal information. They gather data from many sources. Public records, social media, and purchases all contribute. This information ends up on people-search sites. Anyone can find your address, phone number, and more. Our ${keywords[0] || "data removal service"} helps you take back control. We ${keywords[1] || "remove personal information"} from these sites. The process is simple and effective.`
      },
      {
        type: "content",
        title: "How Data Brokers Get Your Information",
        content: `Data brokers are always collecting. They scrape public records daily. Court documents, property records, and voter registrations are targets. They also buy data from other companies. Your shopping habits reveal a lot. Social media profiles add more details. All this builds a detailed profile of you. This profile is then sold to marketers, employers, and others. The information spreads quickly. It appears on dozens of sites. Each site requires separate removal requests. This is where ${keywords[2] || "data broker removal"} services help.`
      },
      {
        type: "content",
        title: "Why Remove Your Data?",
        content: `Your exposed data creates real risks. Identity theft is a major concern. Scammers use this information to target you. Stalkers can find your home address. Telemarketers get your phone number. Even employers search these sites. Bad information can cost you opportunities. ${keywords[3] || "Privacy protection"} is essential today. Removing your data reduces these risks. It makes you harder to find. It gives you peace of mind. Take action to protect yourself and your family.`
      },
      {
        type: "content",
        title: "Our Removal Process",
        content: `We make ${keywords[2] || "data broker removal"} easy. First, we scan for your information. We check 200+ data broker sites. Then we identify where you appear. Next, we submit removal requests. Each site has different requirements. We handle all the paperwork. We follow up to ensure completion. Most removals take 2-4 weeks. We verify each one. If data reappears, we remove it again. Our continuous monitoring catches new exposures. You stay protected over time.`
      }
    ],
    privacy: [
      {
        type: "hero",
        title: "Privacy Policy",
        content: `At GhostMyData, we take your privacy seriously. We are a ${keywords[0] || "data removal service"} focused on protecting you. We understand the importance of personal information. This policy explains how we handle your data. We collect only what we need. We protect it with strong security. We never sell your information. Read on to learn more about our practices.`
      },
      {
        type: "content",
        title: "Information We Collect",
        content: `We collect information to provide our ${keywords[0] || "data removal service"}. This includes your name and contact details. We need this to find your data online. We also collect payment information for subscriptions. We use secure processors for all transactions. We may collect usage data to improve our service. This includes pages visited and features used. We do not track you across other websites. We respect your ${keywords[3] || "privacy protection"} at all times.`
      },
      {
        type: "content",
        title: "How We Use Your Information",
        content: `We use your information for one main purpose. We ${keywords[1] || "remove personal information"} from data brokers. We search for your data across the internet. We submit removal requests on your behalf. We monitor for new exposures. We send you updates about our progress. We may also use data to improve our service. We analyze trends to make things better. We never use your data for advertising. We never share it with marketers.`
      },
      {
        type: "content",
        title: "Your Rights",
        content: `You have rights over your personal data. You can access the information we hold. You can request corrections to inaccurate data. You can ask us to delete your account. We will comply within 30 days. California residents have additional rights under CCPA. European residents have rights under GDPR. We support these privacy regulations fully. Contact us to exercise any of these rights. We are here to help protect your privacy.`
      }
    ],
    terms: [
      {
        type: "hero",
        title: "Terms of Service",
        content: `Welcome to GhostMyData. We provide a ${keywords[0] || "data removal service"} to protect your privacy. These terms govern your use of our service. Please read them carefully. By using GhostMyData, you agree to these terms. If you disagree, please do not use our service. We may update these terms occasionally. We will notify you of significant changes.`
      },
      {
        type: "content",
        title: "Our Service",
        content: `GhostMyData helps ${keywords[1] || "remove personal information"} from the internet. We scan data broker websites for your data. We submit removal requests automatically. We monitor for new exposures continuously. We provide reports on our progress. Our service requires accurate information from you. This helps us find and remove your data effectively. We work hard to protect your ${keywords[3] || "privacy protection"}. Results may vary based on data broker policies.`
      },
      {
        type: "content",
        title: "Your Responsibilities",
        content: `You agree to provide accurate information. False information makes removal difficult. You authorize us to act on your behalf. This lets us submit removal requests. You agree not to misuse our service. Do not use it for illegal purposes. Keep your account credentials secure. Notify us of any unauthorized access. You are responsible for maintaining your account. Update your information if it changes.`
      },
      {
        type: "content",
        title: "Payment and Cancellation",
        content: `Subscription fees are billed in advance. Monthly or annual billing options are available. Annual plans offer savings. You can cancel at any time. Cancellation takes effect at period end. No refunds for partial periods used. We may change pricing with notice. Current subscribers keep their rate until renewal. Free trials may have special terms. These will be clearly stated at signup.`
      }
    ],
    security: [
      {
        type: "hero",
        title: "Security at GhostMyData",
        content: `Your security is our top priority. As a ${keywords[0] || "data removal service"}, we handle sensitive data. We protect it with industry-leading security. Our systems use bank-level encryption. We follow strict security protocols. Our team undergoes regular training. We continuously monitor for threats. Your ${keywords[3] || "privacy protection"} depends on strong security. We take this responsibility seriously.`
      },
      {
        type: "content",
        title: "Data Encryption",
        content: `We encrypt all data in transit and at rest. We use TLS 1.3 for all connections. Your data is encrypted with AES-256. This is the same standard banks use. Even if data were intercepted, it would be unreadable. We rotate encryption keys regularly. We follow cryptographic best practices. Your personal information stays protected at all times. When we ${keywords[1] || "remove personal information"}, we do it securely.`
      },
      {
        type: "content",
        title: "Infrastructure Security",
        content: `Our infrastructure is built for security. We use reputable cloud providers. All servers are in secure data centers. We employ firewalls and intrusion detection. We monitor systems 24/7. Regular security audits identify vulnerabilities. We patch systems promptly. Access is strictly controlled. Only authorized personnel can access data. We log all access for accountability. Our ${keywords[2] || "data broker removal"} processes are secure throughout.`
      },
      {
        type: "content",
        title: "Compliance and Certifications",
        content: `We comply with major privacy regulations. This includes GDPR and CCPA. We follow SOC 2 security standards. Regular third-party audits verify our practices. We maintain detailed security documentation. Our team stays current on security trends. We participate in responsible disclosure programs. Security researchers can report vulnerabilities safely. We take all reports seriously. Protecting your data is our mission.`
      }
    ]
  };

  const sections = templates[pageType] || templates.compare;
  const fullContent = sections
    .map(s => `${s.title ? `## ${s.title}\n\n` : ""}${s.content}`)
    .join("\n\n");

  return { sections, fullContent };
}

// ============================================================================
// PAGE OPTIMIZATION
// ============================================================================

export async function optimizePage(
  url: string,
  config: OptimizationConfig
): Promise<PageOptimizationResult> {
  const filePath = urlToFilePath(url);

  if (!filePath) {
    return {
      url,
      filePath: "",
      originalWordCount: 0,
      newWordCount: 0,
      originalReadability: 0,
      newReadability: 0,
      keywordsAdded: [],
      success: false,
      error: `Could not map URL to file: ${url}`,
      changes: [],
    };
  }

  try {
    // Check if file exists
    await fs.access(filePath);
  } catch {
    return {
      url,
      filePath,
      originalWordCount: 0,
      newWordCount: 0,
      originalReadability: 0,
      newReadability: 0,
      keywordsAdded: [],
      success: false,
      error: `File not found: ${filePath}`,
      changes: [],
    };
  }

  try {
    // Read current content
    const currentFile = await fs.readFile(filePath, "utf-8");
    const currentText = extractTextContent(currentFile);
    const originalWordCount = countWords(currentText);
    const originalReadability = calculateReadability(currentText);
    const existingKeywords = findKeywords(currentText, config.targetKeywords);

    // Determine page type from URL
    const pageType = url.split("/").filter(Boolean).pop() || "compare";

    // Generate improved content
    const { fullContent } = await generateImprovedContent(
      currentText,
      pageType,
      config
    );

    // Calculate new metrics
    const newWordCount = countWords(fullContent);
    const newReadability = calculateReadability(fullContent);
    const newKeywords = findKeywords(fullContent, config.targetKeywords);
    const keywordsAdded = newKeywords.filter(k => !existingKeywords.includes(k));

    // Create changes summary
    const changes: string[] = [];
    if (newWordCount > originalWordCount) {
      changes.push(`Word count: ${originalWordCount} → ${newWordCount} (+${newWordCount - originalWordCount})`);
    }
    if (newReadability > originalReadability) {
      changes.push(`Readability: ${originalReadability} → ${newReadability} (+${newReadability - originalReadability})`);
    }
    if (keywordsAdded.length > 0) {
      changes.push(`Keywords added: ${keywordsAdded.join(", ")}`);
    }

    // Store the generated content for later application
    // For now, we save it as a draft file
    const draftPath = filePath.replace(".tsx", ".draft.md");
    await fs.writeFile(draftPath, `# Generated Content for ${url}\n\nGenerated: ${new Date().toISOString()}\n\n${fullContent}`);
    changes.push(`Draft saved to: ${draftPath}`);

    return {
      url,
      filePath,
      originalWordCount,
      newWordCount,
      originalReadability,
      newReadability,
      keywordsAdded,
      success: true,
      changes,
    };
  } catch (error) {
    return {
      url,
      filePath,
      originalWordCount: 0,
      newWordCount: 0,
      originalReadability: 0,
      newReadability: 0,
      keywordsAdded: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      changes: [],
    };
  }
}

// ============================================================================
// BATCH OPTIMIZATION
// ============================================================================

export async function optimizeAllPages(
  issues: Array<{ url: string; type: string; description: string }>
): Promise<PageOptimizationResult[]> {
  // Get dynamic keywords from shared intelligence store
  let targetKeywords = [
    "data removal service",
    "remove personal information",
    "data broker removal",
    "privacy protection",
  ];

  try {
    targetKeywords = await getOptimizationKeywords(10);
    console.log(`[PageOptimizer] Using ${targetKeywords.length} keywords from intelligence store`);
  } catch {
    console.log("[PageOptimizer] Using default keywords");
  }

  const defaultConfig: OptimizationConfig = {
    targetWordCount: 800,
    targetReadability: 60,
    targetKeywords,
  };

  // Group issues by URL
  const urlsToOptimize = [...new Set(issues.map(i => i.url))];

  const results: PageOptimizationResult[] = [];

  for (const url of urlsToOptimize) {
    console.log(`[PageOptimizer] Optimizing: ${url}`);
    const result = await optimizePage(url, defaultConfig);
    results.push(result);

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  optimizePage,
  optimizeAllPages,
  urlToFilePath,
  calculateReadability,
  countWords,
};
