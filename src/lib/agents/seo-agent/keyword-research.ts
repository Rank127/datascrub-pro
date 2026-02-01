/**
 * Keyword Research Module
 *
 * Searches multiple engines to find keyword opportunities:
 * - Google (via API or scraping)
 * - Bing
 * - DuckDuckGo
 * - Extracts related searches, suggestions, and competitor keywords
 */

import { TARGET_KEYWORDS } from "@/content/pages";

// ============================================================================
// TYPES
// ============================================================================

export interface KeywordData {
  keyword: string;
  source: "google" | "bing" | "duckduckgo" | "competitor" | "related";
  volume?: "high" | "medium" | "low";
  difficulty?: "easy" | "medium" | "hard";
  relevance: number; // 0-100
  currentlyTargeted: boolean;
}

export interface CompetitorKeyword {
  keyword: string;
  competitor: string;
  url: string;
  position?: number;
}

export interface KeywordResearchResult {
  discoveredKeywords: KeywordData[];
  relatedSearches: string[];
  competitorKeywords: CompetitorKeyword[];
  suggestedNewTargets: string[];
  keywordGaps: string[];
  searchEnginesUsed: string[];
  timestamp: string;
}

// ============================================================================
// SEARCH ENGINE QUERIES
// ============================================================================

// Core search terms for our niche
const SEED_QUERIES = [
  "data removal service",
  "remove personal information online",
  "data broker removal",
  "delete my data from internet",
  "privacy protection service",
  "opt out of data brokers",
  "remove yourself from spokeo",
  "people search removal",
  "online privacy protection",
  "data broker opt out",
];

// Known competitors to analyze
const COMPETITORS = [
  { name: "DeleteMe", domain: "joindeleteme.com" },
  { name: "Incogni", domain: "incogni.com" },
  { name: "Optery", domain: "optery.com" },
  { name: "Kanary", domain: "kanary.com" },
  { name: "Privacy Bee", domain: "privacybee.com" },
];

// ============================================================================
// SEARCH ENGINE FUNCTIONS
// ============================================================================

/**
 * Fetch related searches from DuckDuckGo (no API key needed)
 */
async function fetchDuckDuckGoSuggestions(query: string): Promise<string[]> {
  try {
    const url = `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GhostMyData-SEO/1.0)",
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    // DuckDuckGo returns [query, [suggestions]]
    if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
      return data[1].slice(0, 10);
    }
    return [];
  } catch (error) {
    console.error(`[KeywordResearch] DuckDuckGo error for "${query}":`, error);
    return [];
  }
}

/**
 * Fetch suggestions from Bing Autosuggest (free tier available)
 */
async function fetchBingSuggestions(query: string): Promise<string[]> {
  try {
    // Bing has a public autocomplete endpoint
    const url = `https://www.bing.com/AS/Suggestions?pt=page.home&mkt=en-us&qry=${encodeURIComponent(query)}&cp=1&cvid=1`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GhostMyData-SEO/1.0)",
      },
    });

    if (!response.ok) return [];

    const text = await response.text();
    // Parse suggestions from response (HTML format)
    const suggestions: string[] = [];
    const regex = /<span[^>]*class="sa_tm"[^>]*>([^<]+)<\/span>/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
      suggestions.push(match[1].trim());
    }
    return suggestions.slice(0, 10);
  } catch (error) {
    console.error(`[KeywordResearch] Bing error for "${query}":`, error);
    return [];
  }
}

/**
 * Fetch Google suggestions (public autocomplete)
 */
async function fetchGoogleSuggestions(query: string): Promise<string[]> {
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GhostMyData-SEO/1.0)",
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    // Google returns [query, [suggestions]]
    if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
      return data[1].slice(0, 10);
    }
    return [];
  } catch (error) {
    console.error(`[KeywordResearch] Google error for "${query}":`, error);
    return [];
  }
}

/**
 * Analyze a competitor page for keywords
 */
async function analyzeCompetitorKeywords(
  competitor: { name: string; domain: string }
): Promise<CompetitorKeyword[]> {
  try {
    const url = `https://${competitor.domain}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GhostMyData-SEO/1.0)",
      },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const keywords: CompetitorKeyword[] = [];

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      const titleWords = extractKeywordPhrases(titleMatch[1]);
      titleWords.forEach(kw => {
        keywords.push({
          keyword: kw,
          competitor: competitor.name,
          url,
          position: 1,
        });
      });
    }

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (descMatch) {
      const descWords = extractKeywordPhrases(descMatch[1]);
      descWords.forEach(kw => {
        keywords.push({
          keyword: kw,
          competitor: competitor.name,
          url,
        });
      });
    }

    // Extract meta keywords if present
    const kwMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
    if (kwMatch) {
      kwMatch[1].split(",").forEach(kw => {
        keywords.push({
          keyword: kw.trim().toLowerCase(),
          competitor: competitor.name,
          url,
        });
      });
    }

    // Extract h1, h2 headings
    const headingRegex = /<h[12][^>]*>([^<]+)<\/h[12]>/gi;
    let headingMatch;
    while ((headingMatch = headingRegex.exec(html)) !== null) {
      const phrases = extractKeywordPhrases(headingMatch[1]);
      phrases.forEach(kw => {
        keywords.push({
          keyword: kw,
          competitor: competitor.name,
          url,
        });
      });
    }

    return keywords;
  } catch (error) {
    console.error(`[KeywordResearch] Competitor analysis error for ${competitor.name}:`, error);
    return [];
  }
}

/**
 * Extract keyword phrases from text
 */
function extractKeywordPhrases(text: string): string[] {
  // Clean text
  const clean = text.toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = clean.split(" ");
  const phrases: string[] = [];

  // Single keywords (filter out stop words)
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "must", "can", "your", "our", "we",
    "you", "i", "it", "this", "that", "these", "those",
  ]);

  words.forEach(word => {
    if (word.length > 3 && !stopWords.has(word)) {
      phrases.push(word);
    }
  });

  // 2-word phrases
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`;
    if (!stopWords.has(words[i]) && !stopWords.has(words[i + 1]) && phrase.length > 5) {
      phrases.push(phrase);
    }
  }

  // 3-word phrases
  for (let i = 0; i < words.length - 2; i++) {
    const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    if (phrase.length > 8 && !stopWords.has(words[i]) && !stopWords.has(words[i + 2])) {
      phrases.push(phrase);
    }
  }

  return [...new Set(phrases)];
}

/**
 * Calculate keyword relevance to our niche
 */
function calculateRelevance(keyword: string): number {
  const lowerKw = keyword.toLowerCase();

  // High relevance keywords
  const highRelevance = [
    "data removal", "data broker", "privacy", "personal information",
    "opt out", "remove", "delete", "spokeo", "whitepages", "beenverified",
    "people search", "background check", "public records",
  ];

  // Medium relevance
  const mediumRelevance = [
    "identity", "security", "protection", "online", "internet",
    "search", "find", "information", "profile",
  ];

  let score = 20; // Base score

  for (const term of highRelevance) {
    if (lowerKw.includes(term)) {
      score += 30;
    }
  }

  for (const term of mediumRelevance) {
    if (lowerKw.includes(term)) {
      score += 15;
    }
  }

  return Math.min(100, score);
}

/**
 * Determine if keyword is currently targeted
 */
function isCurrentlyTargeted(keyword: string): boolean {
  const lowerKw = keyword.toLowerCase();
  return TARGET_KEYWORDS.some(target =>
    lowerKw.includes(target.toLowerCase()) || target.toLowerCase().includes(lowerKw)
  );
}

// ============================================================================
// MAIN RESEARCH FUNCTION
// ============================================================================

/**
 * Run comprehensive keyword research across multiple engines
 */
export async function runKeywordResearch(): Promise<KeywordResearchResult> {
  console.log("[KeywordResearch] Starting multi-engine keyword research...");

  const allSuggestions = new Map<string, KeywordData>();
  const relatedSearches: string[] = [];
  const competitorKeywords: CompetitorKeyword[] = [];
  const searchEnginesUsed: string[] = [];

  // 1. Fetch suggestions from all search engines for each seed query
  for (const query of SEED_QUERIES) {
    console.log(`[KeywordResearch] Researching: "${query}"`);

    // DuckDuckGo
    try {
      const ddgResults = await fetchDuckDuckGoSuggestions(query);
      if (ddgResults.length > 0) {
        if (!searchEnginesUsed.includes("DuckDuckGo")) {
          searchEnginesUsed.push("DuckDuckGo");
        }
        ddgResults.forEach(suggestion => {
          if (!allSuggestions.has(suggestion)) {
            allSuggestions.set(suggestion, {
              keyword: suggestion,
              source: "duckduckgo",
              relevance: calculateRelevance(suggestion),
              currentlyTargeted: isCurrentlyTargeted(suggestion),
            });
          }
          relatedSearches.push(suggestion);
        });
      }
    } catch (e) {
      console.error("[KeywordResearch] DuckDuckGo failed:", e);
    }

    // Google
    try {
      const googleResults = await fetchGoogleSuggestions(query);
      if (googleResults.length > 0) {
        if (!searchEnginesUsed.includes("Google")) {
          searchEnginesUsed.push("Google");
        }
        googleResults.forEach(suggestion => {
          if (!allSuggestions.has(suggestion)) {
            allSuggestions.set(suggestion, {
              keyword: suggestion,
              source: "google",
              relevance: calculateRelevance(suggestion),
              currentlyTargeted: isCurrentlyTargeted(suggestion),
            });
          }
          relatedSearches.push(suggestion);
        });
      }
    } catch (e) {
      console.error("[KeywordResearch] Google failed:", e);
    }

    // Bing
    try {
      const bingResults = await fetchBingSuggestions(query);
      if (bingResults.length > 0) {
        if (!searchEnginesUsed.includes("Bing")) {
          searchEnginesUsed.push("Bing");
        }
        bingResults.forEach(suggestion => {
          if (!allSuggestions.has(suggestion)) {
            allSuggestions.set(suggestion, {
              keyword: suggestion,
              source: "bing",
              relevance: calculateRelevance(suggestion),
              currentlyTargeted: isCurrentlyTargeted(suggestion),
            });
          }
          relatedSearches.push(suggestion);
        });
      }
    } catch (e) {
      console.error("[KeywordResearch] Bing failed:", e);
    }

    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // 2. Analyze competitor keywords
  console.log("[KeywordResearch] Analyzing competitors...");
  for (const competitor of COMPETITORS) {
    try {
      const keywords = await analyzeCompetitorKeywords(competitor);
      competitorKeywords.push(...keywords);

      // Add competitor keywords to suggestions
      keywords.forEach(kw => {
        if (!allSuggestions.has(kw.keyword)) {
          allSuggestions.set(kw.keyword, {
            keyword: kw.keyword,
            source: "competitor",
            relevance: calculateRelevance(kw.keyword),
            currentlyTargeted: isCurrentlyTargeted(kw.keyword),
          });
        }
      });
    } catch (e) {
      console.error(`[KeywordResearch] Competitor ${competitor.name} failed:`, e);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 3. Process results
  const discoveredKeywords = Array.from(allSuggestions.values())
    .sort((a, b) => b.relevance - a.relevance);

  // 4. Find keyword gaps (high relevance but not targeted)
  const keywordGaps = discoveredKeywords
    .filter(kw => kw.relevance >= 50 && !kw.currentlyTargeted)
    .map(kw => kw.keyword)
    .slice(0, 20);

  // 5. Suggest new targets (top relevant, not targeted)
  const suggestedNewTargets = discoveredKeywords
    .filter(kw => kw.relevance >= 60 && !kw.currentlyTargeted)
    .map(kw => kw.keyword)
    .slice(0, 10);

  // Dedupe related searches
  const uniqueRelated = [...new Set(relatedSearches)].slice(0, 50);

  console.log(`[KeywordResearch] Complete. Found ${discoveredKeywords.length} keywords.`);
  console.log(`[KeywordResearch] Keyword gaps: ${keywordGaps.length}`);
  console.log(`[KeywordResearch] Suggested new targets: ${suggestedNewTargets.length}`);

  return {
    discoveredKeywords,
    relatedSearches: uniqueRelated,
    competitorKeywords,
    suggestedNewTargets,
    keywordGaps,
    searchEnginesUsed,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get keyword suggestions for a specific topic
 */
export async function getKeywordSuggestions(topic: string): Promise<string[]> {
  const suggestions: string[] = [];

  const [ddg, google, bing] = await Promise.all([
    fetchDuckDuckGoSuggestions(topic),
    fetchGoogleSuggestions(topic),
    fetchBingSuggestions(topic),
  ]);

  suggestions.push(...ddg, ...google, ...bing);
  return [...new Set(suggestions)];
}

/**
 * Analyze keyword competition level
 */
export function analyzeKeywordDifficulty(keyword: string): "easy" | "medium" | "hard" {
  const lowerKw = keyword.toLowerCase();

  // Brand terms are usually harder
  const brandTerms = ["spokeo", "whitepages", "beenverified", "deleteme", "incogni"];
  if (brandTerms.some(brand => lowerKw.includes(brand))) {
    return "medium";
  }

  // Generic high-competition terms
  const hardTerms = ["privacy", "data protection", "personal information"];
  if (hardTerms.some(term => lowerKw === term)) {
    return "hard";
  }

  // Long-tail keywords are usually easier
  const wordCount = keyword.split(" ").length;
  if (wordCount >= 4) {
    return "easy";
  } else if (wordCount >= 2) {
    return "medium";
  }

  return "hard";
}
