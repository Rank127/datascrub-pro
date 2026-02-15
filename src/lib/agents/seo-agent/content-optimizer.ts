// Content Optimizer
// Analyzes existing content and suggests/applies keyword improvements

export interface ContentAnalysis {
  url: string;
  title: string;
  wordCount: number;
  keywordDensity: Record<string, number>;
  readabilityScore: number;
  suggestions: ContentSuggestion[];
  internalLinks: number;
  externalLinks: number;
  images: ImageAnalysis[];
}

export interface ContentSuggestion {
  type: "keyword" | "readability" | "structure" | "linking" | "media";
  priority: "high" | "medium" | "low";
  message: string;
  recommendation: string;
}

export interface ImageAnalysis {
  src: string;
  hasAlt: boolean;
  altText?: string;
}

// Target keywords for GhostMyData
const TARGET_KEYWORDS = [
  "data removal service",
  "remove personal information",
  "delete my data online",
  "data broker removal",
  "privacy protection",
  "dark web monitoring",
  "identity protection",
  "opt out of data brokers",
  "personal data cleanup",
  "online privacy",
  "CCPA removal",
  "GDPR data deletion",
  "people search removal",
  "spokeo removal",
  "whitepages removal",
  "beenverified removal",
];

// Secondary keywords
const SECONDARY_KEYWORDS = [
  "identity theft protection",
  "data breach monitoring",
  "personal information removal",
  "privacy service",
  "data scrubbing",
  "ghost my data",
  "remove my information",
  "delete personal data",
  "opt out service",
  "automated removal",
];

/**
 * Calculate keyword density in text
 */
export function calculateKeywordDensity(text: string, keywords: string[]): Record<string, number> {
  const lowerText = text.toLowerCase();
  const wordCount = lowerText.split(/\s+/).length;
  const density: Record<string, number> = {};

  for (const keyword of keywords) {
    // eslint-disable-next-line security/detect-non-literal-regexp
    const regex = new RegExp(keyword.toLowerCase(), "gi");
    const matches = lowerText.match(regex);
    const count = matches ? matches.length : 0;
    density[keyword] = Math.round((count / wordCount) * 1000) / 10; // Percentage with 1 decimal
  }

  return density;
}

/**
 * Calculate simple readability score (Flesch-like)
 */
export function calculateReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((count, word) => {
    return count + countSyllables(word);
  }, 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  // Simplified Flesch Reading Ease formula
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Count syllables in a word (simplified)
 */
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
  if (word.endsWith("e")) count--;

  return Math.max(1, count);
}

/**
 * Analyze page content
 */
export async function analyzePageContent(baseUrl: string, path: string): Promise<ContentAnalysis> {
  const url = `${baseUrl}${path}`;
  const suggestions: ContentSuggestion[] = [];

  try {
    const response = await fetch(url);
    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : "";

    // Extract text content (simplified - removes HTML tags)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const wordCount = textContent.split(/\s+/).length;

    // Check word count
    if (wordCount < 300) {
      suggestions.push({
        type: "structure",
        priority: "high",
        message: `Page has only ${wordCount} words`,
        recommendation: "Add more content. Aim for at least 500-1000 words for better SEO.",
      });
    } else if (wordCount < 500) {
      suggestions.push({
        type: "structure",
        priority: "medium",
        message: `Page has ${wordCount} words`,
        recommendation: "Consider adding more content to reach 800-1500 words.",
      });
    }

    // Calculate keyword density
    const keywordDensity = calculateKeywordDensity(textContent, [...TARGET_KEYWORDS, ...SECONDARY_KEYWORDS]);

    // Check for target keywords
    const hasTargetKeywords = TARGET_KEYWORDS.some(kw => keywordDensity[kw] > 0);
    if (!hasTargetKeywords) {
      suggestions.push({
        type: "keyword",
        priority: "high",
        message: "No target keywords found in content",
        recommendation: `Include keywords like: ${TARGET_KEYWORDS.slice(0, 5).join(", ")}`,
      });
    }

    // Check keyword density
    for (const [keyword, density] of Object.entries(keywordDensity)) {
      if (density > 3) {
        suggestions.push({
          type: "keyword",
          priority: "medium",
          message: `Keyword "${keyword}" appears too frequently (${density}%)`,
          recommendation: "Reduce keyword usage to avoid over-optimization. Aim for 1-2%.",
        });
      }
    }

    // Calculate readability
    const readabilityScore = calculateReadability(textContent);
    if (readabilityScore < 30) {
      suggestions.push({
        type: "readability",
        priority: "high",
        message: `Low readability score: ${readabilityScore}`,
        recommendation: "Simplify sentences and use shorter words for better readability.",
      });
    } else if (readabilityScore < 50) {
      suggestions.push({
        type: "readability",
        priority: "medium",
        message: `Moderate readability score: ${readabilityScore}`,
        recommendation: "Consider simplifying some complex sentences.",
      });
    }

    // Count internal and external links
    // eslint-disable-next-line security/detect-non-literal-regexp
    const internalLinkRegex = new RegExp(`<a[^>]*href=["'](/[^"']*|${baseUrl}[^"']*)["']`, "gi");
    const externalLinkRegex = /<a[^>]*href=["'](https?:\/\/[^"']+)["']/gi;

    const internalMatches = html.match(internalLinkRegex);
    const externalMatches = html.match(externalLinkRegex);

    const internalLinks = internalMatches ? internalMatches.length : 0;
    const externalLinks = externalMatches ? externalMatches.length : 0;

    if (internalLinks < 3) {
      suggestions.push({
        type: "linking",
        priority: "medium",
        message: `Only ${internalLinks} internal links found`,
        recommendation: "Add more internal links to other relevant pages on your site.",
      });
    }

    // Analyze images
    const imageRegex = /<img\s[^>]{0,500}src=["']([^"']{1,2000})["'][^>]{0,500}/gi;
    const images: ImageAnalysis[] = [];
    let imageMatch;

    while ((imageMatch = imageRegex.exec(html)) !== null) {
      const src = imageMatch[1];
      // Extract alt text from the full match string
      const altMatch = imageMatch[0].match(/alt=["']([^"']{0,500})["']/i);
      const altText = altMatch ? altMatch[1] : undefined;
      images.push({
        src,
        hasAlt: !!altText && altText.length > 0,
        altText,
      });
    }

    const imagesWithoutAlt = images.filter(img => !img.hasAlt);
    if (imagesWithoutAlt.length > 0) {
      suggestions.push({
        type: "media",
        priority: "medium",
        message: `${imagesWithoutAlt.length} images missing alt text`,
        recommendation: "Add descriptive alt text to all images for accessibility and SEO.",
      });
    }

    // Check for H1 tag (handles JSX with nested elements)
    const h1Matches = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi);
    if (!h1Matches || h1Matches.length === 0) {
      suggestions.push({
        type: "structure",
        priority: "high",
        message: "Missing H1 tag",
        recommendation: "Add a single H1 tag with the main heading of the page.",
      });
    } else if (h1Matches.length > 1) {
      suggestions.push({
        type: "structure",
        priority: "medium",
        message: `Multiple H1 tags found (${h1Matches.length})`,
        recommendation: "Use only one H1 tag per page.",
      });
    }

    return {
      url,
      title,
      wordCount,
      keywordDensity,
      readabilityScore,
      suggestions,
      internalLinks,
      externalLinks,
      images,
    };
  } catch (error) {
    return {
      url,
      title: "",
      wordCount: 0,
      keywordDensity: {},
      readabilityScore: 0,
      suggestions: [{
        type: "structure",
        priority: "high",
        message: `Failed to analyze page: ${error instanceof Error ? error.message : "Unknown error"}`,
        recommendation: "Check if the page is accessible.",
      }],
      internalLinks: 0,
      externalLinks: 0,
      images: [],
    };
  }
}

/**
 * Get keyword suggestions for a topic
 */
export function getKeywordSuggestions(topic: string): string[] {
  const baseTopic = topic.toLowerCase();
  const suggestions: string[] = [];

  // Add variations
  suggestions.push(baseTopic);
  suggestions.push(`how to ${baseTopic}`);
  suggestions.push(`${baseTopic} guide`);
  suggestions.push(`${baseTopic} tutorial`);
  suggestions.push(`best ${baseTopic}`);
  suggestions.push(`${baseTopic} tips`);
  suggestions.push(`${baseTopic} ${new Date().getFullYear()}`);

  // Add related terms if topic matches our niche
  if (baseTopic.includes("remove") || baseTopic.includes("delete") || baseTopic.includes("opt out")) {
    suggestions.push("data removal service");
    suggestions.push("privacy protection");
    suggestions.push("personal data cleanup");
  }

  if (baseTopic.includes("privacy") || baseTopic.includes("data")) {
    suggestions.push("online privacy");
    suggestions.push("data protection");
    suggestions.push("identity protection");
  }

  return [...new Set(suggestions)];
}

/**
 * Analyze multiple pages and generate optimization report
 */
export async function analyzeAllContent(baseUrl: string, paths: string[]): Promise<{
  analyses: ContentAnalysis[];
  overallSuggestions: ContentSuggestion[];
  contentScore: number;
}> {
  const analyses: ContentAnalysis[] = [];

  for (const path of paths) {
    const analysis = await analyzePageContent(baseUrl, path);
    analyses.push(analysis);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Generate overall suggestions
  const overallSuggestions: ContentSuggestion[] = [];

  // Check for thin content pages
  const thinPages = analyses.filter(a => a.wordCount < 300);
  if (thinPages.length > 0) {
    overallSuggestions.push({
      type: "structure",
      priority: "high",
      message: `${thinPages.length} pages have thin content (<300 words)`,
      recommendation: "Expand content on these pages to improve SEO value.",
    });
  }

  // Check for pages without target keywords
  const pagesWithoutKeywords = analyses.filter(a => {
    const hasKeywords = TARGET_KEYWORDS.some(kw => (a.keywordDensity[kw] || 0) > 0);
    return !hasKeywords;
  });
  if (pagesWithoutKeywords.length > 0) {
    overallSuggestions.push({
      type: "keyword",
      priority: "high",
      message: `${pagesWithoutKeywords.length} pages missing target keywords`,
      recommendation: "Add relevant keywords to improve search visibility.",
    });
  }

  // Calculate content score
  const avgWordCount = analyses.reduce((sum, a) => sum + a.wordCount, 0) / analyses.length;
  const avgReadability = analyses.reduce((sum, a) => sum + a.readabilityScore, 0) / analyses.length;
  const totalSuggestions = analyses.reduce((sum, a) => sum + a.suggestions.length, 0);

  let contentScore = 100;
  if (avgWordCount < 300) contentScore -= 20;
  else if (avgWordCount < 500) contentScore -= 10;
  if (avgReadability < 50) contentScore -= 15;
  contentScore -= Math.min(30, totalSuggestions * 2);

  return {
    analyses,
    overallSuggestions,
    contentScore: Math.max(0, Math.round(contentScore)),
  };
}
