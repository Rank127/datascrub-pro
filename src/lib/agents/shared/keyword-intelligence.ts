/**
 * Shared Keyword Intelligence Store
 *
 * Central store for keyword data discovered by SEO agent.
 * Other agents (Content Agent, Content Optimizer) use this
 * to improve content with the latest keyword insights.
 */

import * as fs from "fs/promises";
import * as path from "path";
import { TARGET_KEYWORDS } from "@/content/pages";

// ============================================================================
// TYPES
// ============================================================================

export interface DiscoveredKeyword {
  keyword: string;
  source: "google" | "bing" | "duckduckgo" | "competitor" | "manual";
  relevance: number; // 0-100
  searchVolume?: "high" | "medium" | "low";
  difficulty?: "easy" | "medium" | "hard";
  firstSeen: string;
  lastSeen: string;
  timesFound: number;
}

export interface CompetitorInsight {
  competitor: string;
  domain: string;
  topKeywords: string[];
  lastAnalyzed: string;
}

export interface KeywordIntelligence {
  lastUpdated: string;
  baseKeywords: string[];
  discoveredKeywords: DiscoveredKeyword[];
  competitorInsights: CompetitorInsight[];
  keywordGaps: string[]; // High-value keywords we're not targeting
  suggestedTargets: string[]; // Top keywords to add
  searchEnginesQueried: string[];
  totalKeywordsDiscovered: number;
}

// ============================================================================
// STORAGE
// ============================================================================

const STORE_FILE = path.join(process.cwd(), "keyword-intelligence.json");

/**
 * Load keyword intelligence from disk
 */
export async function loadKeywordIntelligence(): Promise<KeywordIntelligence> {
  try {
    const data = await fs.readFile(STORE_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    // Return default structure if file doesn't exist
    return {
      lastUpdated: new Date().toISOString(),
      baseKeywords: TARGET_KEYWORDS,
      discoveredKeywords: [],
      competitorInsights: [],
      keywordGaps: [],
      suggestedTargets: [],
      searchEnginesQueried: [],
      totalKeywordsDiscovered: 0,
    };
  }
}

/**
 * Save keyword intelligence to disk
 */
export async function saveKeywordIntelligence(
  intelligence: KeywordIntelligence
): Promise<void> {
  await fs.writeFile(STORE_FILE, JSON.stringify(intelligence, null, 2));
  console.log(`[KeywordIntelligence] Saved ${intelligence.totalKeywordsDiscovered} keywords to store`);
}

// ============================================================================
// KEYWORD MANAGEMENT
// ============================================================================

/**
 * Merge new keyword research results into the store
 */
export async function updateFromKeywordResearch(research: {
  discoveredKeywords: Array<{
    keyword: string;
    source: string;
    relevance: number;
  }>;
  competitorKeywords: Array<{
    keyword: string;
    competitor: string;
  }>;
  keywordGaps: string[];
  suggestedNewTargets: string[];
  searchEnginesUsed: string[];
}): Promise<KeywordIntelligence> {
  const current = await loadKeywordIntelligence();
  const now = new Date().toISOString();

  // Create a map of existing keywords for quick lookup
  const existingMap = new Map<string, DiscoveredKeyword>();
  for (const kw of current.discoveredKeywords) {
    existingMap.set(kw.keyword.toLowerCase(), kw);
  }

  // Merge discovered keywords
  for (const newKw of research.discoveredKeywords) {
    const key = newKw.keyword.toLowerCase();
    const existing = existingMap.get(key);

    if (existing) {
      // Update existing keyword
      existing.lastSeen = now;
      existing.timesFound += 1;
      existing.relevance = Math.max(existing.relevance, newKw.relevance);
    } else {
      // Add new keyword
      existingMap.set(key, {
        keyword: newKw.keyword,
        source: newKw.source as DiscoveredKeyword["source"],
        relevance: newKw.relevance,
        firstSeen: now,
        lastSeen: now,
        timesFound: 1,
      });
    }
  }

  // Update competitor insights
  const competitorMap = new Map<string, CompetitorInsight>();
  for (const insight of current.competitorInsights) {
    competitorMap.set(insight.competitor, insight);
  }

  // Group competitor keywords
  const competitorKeywordMap = new Map<string, string[]>();
  for (const ck of research.competitorKeywords) {
    const keywords = competitorKeywordMap.get(ck.competitor) || [];
    if (!keywords.includes(ck.keyword)) {
      keywords.push(ck.keyword);
    }
    competitorKeywordMap.set(ck.competitor, keywords);
  }

  // Update competitor insights
  for (const [competitor, keywords] of competitorKeywordMap) {
    const existing = competitorMap.get(competitor);
    if (existing) {
      existing.topKeywords = [...new Set([...existing.topKeywords, ...keywords])].slice(0, 20);
      existing.lastAnalyzed = now;
    } else {
      competitorMap.set(competitor, {
        competitor,
        domain: "", // Will be filled in later if needed
        topKeywords: keywords.slice(0, 20),
        lastAnalyzed: now,
      });
    }
  }

  // Build updated intelligence
  const discoveredKeywords = Array.from(existingMap.values())
    .sort((a, b) => b.relevance - a.relevance);

  const updated: KeywordIntelligence = {
    lastUpdated: now,
    baseKeywords: current.baseKeywords,
    discoveredKeywords,
    competitorInsights: Array.from(competitorMap.values()),
    keywordGaps: [...new Set([...current.keywordGaps, ...research.keywordGaps])].slice(0, 30),
    suggestedTargets: [...new Set([...research.suggestedNewTargets, ...current.suggestedTargets])].slice(0, 20),
    searchEnginesQueried: [...new Set([...current.searchEnginesQueried, ...research.searchEnginesUsed])],
    totalKeywordsDiscovered: discoveredKeywords.length,
  };

  await saveKeywordIntelligence(updated);
  return updated;
}

// ============================================================================
// KEYWORD RETRIEVAL
// ============================================================================

/**
 * Get the best keywords to use for content optimization
 * Combines base keywords with top discovered keywords
 */
export async function getOptimizationKeywords(limit = 10): Promise<string[]> {
  const intelligence = await loadKeywordIntelligence();

  // Start with base keywords
  const keywords = [...intelligence.baseKeywords];

  // Add top discovered keywords by relevance
  const topDiscovered = intelligence.discoveredKeywords
    .filter(kw => kw.relevance >= 50)
    .slice(0, limit)
    .map(kw => kw.keyword);

  keywords.push(...topDiscovered);

  // Add suggested targets
  keywords.push(...intelligence.suggestedTargets.slice(0, 5));

  // Deduplicate and return
  return [...new Set(keywords)].slice(0, limit + 5);
}

/**
 * Get keyword gaps - valuable keywords we should be targeting
 */
export async function getKeywordGaps(): Promise<string[]> {
  const intelligence = await loadKeywordIntelligence();
  return intelligence.keywordGaps;
}

/**
 * Get competitor insights
 */
export async function getCompetitorKeywords(): Promise<CompetitorInsight[]> {
  const intelligence = await loadKeywordIntelligence();
  return intelligence.competitorInsights;
}

/**
 * Get all discovered keywords above a relevance threshold
 */
export async function getDiscoveredKeywords(
  minRelevance = 40
): Promise<DiscoveredKeyword[]> {
  const intelligence = await loadKeywordIntelligence();
  return intelligence.discoveredKeywords.filter(kw => kw.relevance >= minRelevance);
}

/**
 * Check if a keyword is already being targeted
 */
export async function isKeywordTargeted(keyword: string): Promise<boolean> {
  const intelligence = await loadKeywordIntelligence();
  const lowerKw = keyword.toLowerCase();

  // Check base keywords
  if (intelligence.baseKeywords.some(k => k.toLowerCase() === lowerKw)) {
    return true;
  }

  // Check if it's in the top discovered keywords that we're using
  const topDiscovered = intelligence.discoveredKeywords
    .filter(kw => kw.relevance >= 60)
    .slice(0, 10)
    .map(kw => kw.keyword.toLowerCase());

  return topDiscovered.includes(lowerKw);
}

/**
 * Add a manual keyword to the base list
 */
export async function addManualKeyword(keyword: string): Promise<void> {
  const intelligence = await loadKeywordIntelligence();

  if (!intelligence.baseKeywords.includes(keyword)) {
    intelligence.baseKeywords.push(keyword);
    intelligence.lastUpdated = new Date().toISOString();
    await saveKeywordIntelligence(intelligence);
  }
}

/**
 * Get keyword statistics for reporting
 */
export async function getKeywordStats(): Promise<{
  totalDiscovered: number;
  fromGoogle: number;
  fromBing: number;
  fromDuckDuckGo: number;
  fromCompetitors: number;
  highRelevance: number;
  gaps: number;
  lastUpdated: string;
}> {
  const intelligence = await loadKeywordIntelligence();

  return {
    totalDiscovered: intelligence.totalKeywordsDiscovered,
    fromGoogle: intelligence.discoveredKeywords.filter(k => k.source === "google").length,
    fromBing: intelligence.discoveredKeywords.filter(k => k.source === "bing").length,
    fromDuckDuckGo: intelligence.discoveredKeywords.filter(k => k.source === "duckduckgo").length,
    fromCompetitors: intelligence.discoveredKeywords.filter(k => k.source === "competitor").length,
    highRelevance: intelligence.discoveredKeywords.filter(k => k.relevance >= 70).length,
    gaps: intelligence.keywordGaps.length,
    lastUpdated: intelligence.lastUpdated,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  loadKeywordIntelligence,
  saveKeywordIntelligence,
  updateFromKeywordResearch,
  getOptimizationKeywords,
  getKeywordGaps,
  getCompetitorKeywords,
  getDiscoveredKeywords,
  isKeywordTargeted,
  addManualKeyword,
  getKeywordStats,
};
