/**
 * Shared Keyword Intelligence Store
 *
 * Central store for keyword data discovered by SEO agent.
 * Uses PostgreSQL database for persistence on serverless (Vercel).
 * Other agents (Content Agent, Content Optimizer) use this
 * to improve content with the latest keyword insights.
 */

import { prisma } from "@/lib/db";
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
// DATABASE OPERATIONS
// ============================================================================

/**
 * Load keyword intelligence from database
 */
export async function loadKeywordIntelligence(): Promise<KeywordIntelligence> {
  try {
    // Get all keywords from database
    const keywords = await prisma.keywordIntelligence.findMany({
      orderBy: { relevance: "desc" },
    });

    // Convert to DiscoveredKeyword format
    const discoveredKeywords: DiscoveredKeyword[] = keywords.map(k => ({
      keyword: k.keyword,
      source: k.source as DiscoveredKeyword["source"],
      relevance: k.relevance,
      searchVolume: k.searchVolume as DiscoveredKeyword["searchVolume"],
      difficulty: k.difficulty as DiscoveredKeyword["difficulty"],
      firstSeen: k.firstSeen.toISOString(),
      lastSeen: k.lastSeen.toISOString(),
      timesFound: k.timesFound,
    }));

    // Get competitor keywords
    const competitorKeywords = keywords.filter(k => k.source === "competitor" && k.competitor);
    const competitorMap = new Map<string, string[]>();
    for (const k of competitorKeywords) {
      if (k.competitor) {
        const existing = competitorMap.get(k.competitor) || [];
        existing.push(k.keyword);
        competitorMap.set(k.competitor, existing);
      }
    }

    const competitorInsights: CompetitorInsight[] = Array.from(competitorMap.entries()).map(
      ([competitor, keywords]) => ({
        competitor,
        domain: "",
        topKeywords: keywords.slice(0, 20),
        lastAnalyzed: new Date().toISOString(),
      })
    );

    // Get keyword gaps (high relevance but not targeted)
    const keywordGaps = keywords
      .filter(k => k.relevance >= 50 && !k.isTargeted)
      .map(k => k.keyword)
      .slice(0, 30);

    // Get suggested targets
    const suggestedTargets = keywords
      .filter(k => k.relevance >= 60 && !k.isTargeted)
      .map(k => k.keyword)
      .slice(0, 20);

    // Get unique sources
    const searchEnginesQueried = [...new Set(keywords.map(k => k.source))];

    return {
      lastUpdated: new Date().toISOString(),
      baseKeywords: TARGET_KEYWORDS,
      discoveredKeywords,
      competitorInsights,
      keywordGaps,
      suggestedTargets,
      searchEnginesQueried,
      totalKeywordsDiscovered: keywords.length,
    };
  } catch (error) {
    console.error("[KeywordIntelligence] Failed to load from database:", error);
    // Return default structure if database fails
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
 * Merge new keyword research results into the database
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
  const now = new Date();
  const startTime = Date.now();

  try {
    // Upsert discovered keywords
    for (const kw of research.discoveredKeywords) {
      await prisma.keywordIntelligence.upsert({
        where: { keyword: kw.keyword.toLowerCase() },
        update: {
          lastSeen: now,
          relevance: Math.max(kw.relevance, 0),
          timesFound: { increment: 1 },
        },
        create: {
          keyword: kw.keyword.toLowerCase(),
          source: kw.source,
          relevance: kw.relevance,
          timesFound: 1,
          firstSeen: now,
          lastSeen: now,
        },
      });
    }

    // Upsert competitor keywords
    for (const ck of research.competitorKeywords) {
      await prisma.keywordIntelligence.upsert({
        where: { keyword: ck.keyword.toLowerCase() },
        update: {
          lastSeen: now,
          competitor: ck.competitor,
          timesFound: { increment: 1 },
        },
        create: {
          keyword: ck.keyword.toLowerCase(),
          source: "competitor",
          relevance: 50, // Default relevance for competitor keywords
          competitor: ck.competitor,
          timesFound: 1,
          firstSeen: now,
          lastSeen: now,
        },
      });
    }

    // Log the research run
    await prisma.keywordResearchRun.create({
      data: {
        searchEnginesUsed: JSON.stringify(research.searchEnginesUsed),
        keywordsDiscovered: research.discoveredKeywords.length,
        keywordGaps: research.keywordGaps.length,
        competitorsAnalyzed: new Set(research.competitorKeywords.map(k => k.competitor)).size,
        duration: Date.now() - startTime,
        status: "COMPLETED",
      },
    });

    console.log(`[KeywordIntelligence] Saved ${research.discoveredKeywords.length} keywords to database`);

    // Return updated intelligence
    return loadKeywordIntelligence();
  } catch (error) {
    console.error("[KeywordIntelligence] Failed to save to database:", error);

    // Log failed run
    try {
      await prisma.keywordResearchRun.create({
        data: {
          searchEnginesUsed: JSON.stringify(research.searchEnginesUsed),
          keywordsDiscovered: 0,
          keywordGaps: 0,
          competitorsAnalyzed: 0,
          duration: Date.now() - startTime,
          status: "FAILED",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
    } catch {
      // Ignore logging failure
    }

    throw error;
  }
}

// ============================================================================
// KEYWORD RETRIEVAL
// ============================================================================

/**
 * Get the best keywords to use for content optimization
 * Combines base keywords with top discovered keywords
 */
export async function getOptimizationKeywords(limit = 10): Promise<string[]> {
  // Start with base keywords
  const keywords = [...TARGET_KEYWORDS];

  try {
    // Add top discovered keywords by relevance
    const topDiscovered = await prisma.keywordIntelligence.findMany({
      where: { relevance: { gte: 50 } },
      orderBy: { relevance: "desc" },
      take: limit,
    });

    keywords.push(...topDiscovered.map(k => k.keyword));
  } catch (error) {
    console.error("[KeywordIntelligence] Failed to get keywords from DB:", error);
  }

  // Deduplicate and return
  return [...new Set(keywords)].slice(0, limit + 5);
}

/**
 * Get keyword gaps - valuable keywords we should be targeting
 */
export async function getKeywordGaps(): Promise<string[]> {
  try {
    const gaps = await prisma.keywordIntelligence.findMany({
      where: {
        relevance: { gte: 50 },
        isTargeted: false,
      },
      orderBy: { relevance: "desc" },
      take: 30,
    });
    return gaps.map(k => k.keyword);
  } catch {
    return [];
  }
}

/**
 * Get competitor insights
 */
export async function getCompetitorKeywords(): Promise<CompetitorInsight[]> {
  try {
    const competitorKeywords = await prisma.keywordIntelligence.findMany({
      where: {
        source: "competitor",
        competitor: { not: null },
      },
      orderBy: { relevance: "desc" },
    });

    const competitorMap = new Map<string, string[]>();
    for (const k of competitorKeywords) {
      if (k.competitor) {
        const existing = competitorMap.get(k.competitor) || [];
        existing.push(k.keyword);
        competitorMap.set(k.competitor, existing);
      }
    }

    return Array.from(competitorMap.entries()).map(([competitor, keywords]) => ({
      competitor,
      domain: "",
      topKeywords: keywords.slice(0, 20),
      lastAnalyzed: new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

/**
 * Get all discovered keywords above a relevance threshold
 */
export async function getDiscoveredKeywords(
  minRelevance = 40
): Promise<DiscoveredKeyword[]> {
  try {
    const keywords = await prisma.keywordIntelligence.findMany({
      where: { relevance: { gte: minRelevance } },
      orderBy: { relevance: "desc" },
    });

    return keywords.map(k => ({
      keyword: k.keyword,
      source: k.source as DiscoveredKeyword["source"],
      relevance: k.relevance,
      searchVolume: k.searchVolume as DiscoveredKeyword["searchVolume"],
      difficulty: k.difficulty as DiscoveredKeyword["difficulty"],
      firstSeen: k.firstSeen.toISOString(),
      lastSeen: k.lastSeen.toISOString(),
      timesFound: k.timesFound,
    }));
  } catch {
    return [];
  }
}

/**
 * Check if a keyword is already being targeted
 */
export async function isKeywordTargeted(keyword: string): Promise<boolean> {
  const lowerKw = keyword.toLowerCase();

  // Check base keywords
  if (TARGET_KEYWORDS.some(k => k.toLowerCase() === lowerKw)) {
    return true;
  }

  try {
    const kw = await prisma.keywordIntelligence.findUnique({
      where: { keyword: lowerKw },
    });
    return kw?.isTargeted ?? false;
  } catch {
    return false;
  }
}

/**
 * Mark a keyword as targeted
 */
export async function markKeywordAsTargeted(keyword: string): Promise<void> {
  try {
    await prisma.keywordIntelligence.update({
      where: { keyword: keyword.toLowerCase() },
      data: { isTargeted: true },
    });
  } catch {
    // Keyword may not exist, that's ok
  }
}

/**
 * Add a manual keyword to track
 */
export async function addManualKeyword(keyword: string, relevance = 70): Promise<void> {
  try {
    await prisma.keywordIntelligence.upsert({
      where: { keyword: keyword.toLowerCase() },
      update: {
        relevance: Math.max(relevance, 70),
        lastSeen: new Date(),
      },
      create: {
        keyword: keyword.toLowerCase(),
        source: "manual",
        relevance,
        isTargeted: true,
        firstSeen: new Date(),
        lastSeen: new Date(),
      },
    });
  } catch (error) {
    console.error("[KeywordIntelligence] Failed to add manual keyword:", error);
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
  try {
    const [total, google, bing, ddg, competitor, highRel, gaps, lastRun] = await Promise.all([
      prisma.keywordIntelligence.count(),
      prisma.keywordIntelligence.count({ where: { source: "google" } }),
      prisma.keywordIntelligence.count({ where: { source: "bing" } }),
      prisma.keywordIntelligence.count({ where: { source: "duckduckgo" } }),
      prisma.keywordIntelligence.count({ where: { source: "competitor" } }),
      prisma.keywordIntelligence.count({ where: { relevance: { gte: 70 } } }),
      prisma.keywordIntelligence.count({ where: { relevance: { gte: 50 }, isTargeted: false } }),
      prisma.keywordResearchRun.findFirst({ orderBy: { createdAt: "desc" } }),
    ]);

    return {
      totalDiscovered: total,
      fromGoogle: google,
      fromBing: bing,
      fromDuckDuckGo: ddg,
      fromCompetitors: competitor,
      highRelevance: highRel,
      gaps,
      lastUpdated: lastRun?.createdAt.toISOString() || new Date().toISOString(),
    };
  } catch {
    return {
      totalDiscovered: 0,
      fromGoogle: 0,
      fromBing: 0,
      fromDuckDuckGo: 0,
      fromCompetitors: 0,
      highRelevance: 0,
      gaps: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  loadKeywordIntelligence,
  updateFromKeywordResearch,
  getOptimizationKeywords,
  getKeywordGaps,
  getCompetitorKeywords,
  getDiscoveredKeywords,
  isKeywordTargeted,
  markKeywordAsTargeted,
  addManualKeyword,
  getKeywordStats,
};
