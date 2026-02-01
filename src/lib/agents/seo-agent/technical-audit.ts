// Technical SEO Audit
// Checks for broken links, meta tags, sitemap status, and indexing

export interface SEOAuditResult {
  url: string;
  status: "pass" | "warning" | "fail";
  checks: SEOCheck[];
  score: number;
  timestamp: Date;
}

export interface SEOCheck {
  name: string;
  status: "pass" | "warning" | "fail";
  message: string;
  value?: string | number;
  recommendation?: string;
}

export interface SitemapStatus {
  totalUrls: number;
  indexedUrls: number;
  lastUpdated: Date;
  errors: string[];
}

export interface BrokenLink {
  sourceUrl: string;
  targetUrl: string;
  statusCode: number;
  linkText: string;
}

// Pages to audit
const PAGES_TO_AUDIT = [
  "/",
  "/pricing",
  "/how-it-works",
  "/blog",
  "/compare/deleteme",
  "/compare/incogni",
  "/privacy",
  "/terms",
  "/security",
];

// Required meta tags
const REQUIRED_META_TAGS = [
  "title",
  "description",
  "og:title",
  "og:description",
  "og:image",
  "twitter:card",
  "twitter:title",
  "twitter:description",
];

/**
 * Audit a single page for SEO issues
 */
export async function auditPage(baseUrl: string, path: string): Promise<SEOAuditResult> {
  const url = `${baseUrl}${path}`;
  const checks: SEOCheck[] = [];
  let totalScore = 0;
  let maxScore = 0;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "GhostMyData-SEO-Agent/1.0",
      },
    });

    // Check response status
    maxScore += 10;
    if (response.ok) {
      checks.push({
        name: "Page Accessible",
        status: "pass",
        message: `Page returned status ${response.status}`,
        value: response.status,
      });
      totalScore += 10;
    } else {
      checks.push({
        name: "Page Accessible",
        status: "fail",
        message: `Page returned status ${response.status}`,
        value: response.status,
        recommendation: "Fix the page to return a 200 status code",
      });
    }

    const html = await response.text();

    // Check for title tag
    maxScore += 10;
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      const titleLength = titleMatch[1].length;
      if (titleLength >= 30 && titleLength <= 60) {
        checks.push({
          name: "Title Tag",
          status: "pass",
          message: `Title is ${titleLength} characters (optimal: 30-60)`,
          value: titleMatch[1],
        });
        totalScore += 10;
      } else {
        checks.push({
          name: "Title Tag",
          status: "warning",
          message: `Title is ${titleLength} characters (optimal: 30-60)`,
          value: titleMatch[1],
          recommendation: titleLength < 30 ? "Make title longer" : "Make title shorter",
        });
        totalScore += 5;
      }
    } else {
      checks.push({
        name: "Title Tag",
        status: "fail",
        message: "Missing title tag",
        recommendation: "Add a descriptive title tag",
      });
    }

    // Check for meta description
    maxScore += 10;
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (descMatch && descMatch[1]) {
      const descLength = descMatch[1].length;
      if (descLength >= 120 && descLength <= 160) {
        checks.push({
          name: "Meta Description",
          status: "pass",
          message: `Description is ${descLength} characters (optimal: 120-160)`,
          value: descMatch[1],
        });
        totalScore += 10;
      } else {
        checks.push({
          name: "Meta Description",
          status: "warning",
          message: `Description is ${descLength} characters (optimal: 120-160)`,
          value: descMatch[1],
          recommendation: descLength < 120 ? "Make description longer" : "Make description shorter",
        });
        totalScore += 5;
      }
    } else {
      checks.push({
        name: "Meta Description",
        status: "fail",
        message: "Missing meta description",
        recommendation: "Add a compelling meta description",
      });
    }

    // Check for Open Graph tags
    maxScore += 10;
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);

    if (ogTitleMatch && ogDescMatch && ogImageMatch) {
      checks.push({
        name: "Open Graph Tags",
        status: "pass",
        message: "All required OG tags present",
      });
      totalScore += 10;
    } else {
      const missing = [];
      if (!ogTitleMatch) missing.push("og:title");
      if (!ogDescMatch) missing.push("og:description");
      if (!ogImageMatch) missing.push("og:image");
      checks.push({
        name: "Open Graph Tags",
        status: missing.length === 3 ? "fail" : "warning",
        message: `Missing OG tags: ${missing.join(", ")}`,
        recommendation: "Add all Open Graph meta tags for social sharing",
      });
      if (missing.length < 3) totalScore += 5;
    }

    // Check for H1 tag (handles JSX with nested elements)
    maxScore += 10;
    const h1Exists = /<h1[^>]*>/i.test(html);
    const h1ContentMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Exists && h1ContentMatch) {
      // Extract text content from H1, stripping nested tags
      const h1Text = h1ContentMatch[1].replace(/<[^>]+>/g, "").trim().substring(0, 50);
      checks.push({
        name: "H1 Tag",
        status: "pass",
        message: "H1 tag present",
        value: h1Text || "H1 found",
      });
      totalScore += 10;
    } else {
      checks.push({
        name: "H1 Tag",
        status: "fail",
        message: "Missing H1 tag",
        recommendation: "Add a single H1 tag with the main heading",
      });
    }

    // Check for canonical URL
    maxScore += 5;
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    if (canonicalMatch) {
      checks.push({
        name: "Canonical URL",
        status: "pass",
        message: "Canonical URL specified",
        value: canonicalMatch[1],
      });
      totalScore += 5;
    } else {
      checks.push({
        name: "Canonical URL",
        status: "warning",
        message: "Missing canonical URL",
        recommendation: "Add a canonical URL to prevent duplicate content issues",
      });
    }

    // Check for structured data
    maxScore += 10;
    const hasJsonLd = html.includes('application/ld+json');
    if (hasJsonLd) {
      checks.push({
        name: "Structured Data",
        status: "pass",
        message: "JSON-LD structured data found",
      });
      totalScore += 10;
    } else {
      checks.push({
        name: "Structured Data",
        status: "warning",
        message: "No JSON-LD structured data found",
        recommendation: "Add structured data for better search appearance",
      });
    }

    // Check page load size (uncompressed HTML)
    // Note: Modern Next.js pages with structured data and rich content typically 100-150KB
    // Compressed transfer size is usually 10-20KB which is acceptable
    maxScore += 10;
    const pageSize = html.length;
    if (pageSize < 150000) {
      checks.push({
        name: "Page Size",
        status: "pass",
        message: `Page size is ${Math.round(pageSize / 1024)}KB`,
        value: pageSize,
      });
      totalScore += 10;
    } else if (pageSize < 250000) {
      checks.push({
        name: "Page Size",
        status: "warning",
        message: `Page size is ${Math.round(pageSize / 1024)}KB (consider optimizing)`,
        value: pageSize,
        recommendation: "Optimize images and reduce JavaScript",
      });
      totalScore += 5;
    } else {
      checks.push({
        name: "Page Size",
        status: "fail",
        message: `Page size is ${Math.round(pageSize / 1024)}KB (too large)`,
        value: pageSize,
        recommendation: "Significantly reduce page size for better performance",
      });
    }

  } catch (error) {
    checks.push({
      name: "Page Fetch",
      status: "fail",
      message: `Failed to fetch page: ${error instanceof Error ? error.message : "Unknown error"}`,
      recommendation: "Check if the page URL is correct and accessible",
    });
  }

  const score = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return {
    url,
    status: score >= 80 ? "pass" : score >= 60 ? "warning" : "fail",
    checks,
    score,
    timestamp: new Date(),
  };
}

/**
 * Audit all important pages
 */
export async function auditAllPages(baseUrl: string): Promise<SEOAuditResult[]> {
  const results: SEOAuditResult[] = [];

  for (const path of PAGES_TO_AUDIT) {
    const result = await auditPage(baseUrl, path);
    results.push(result);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

/**
 * Check sitemap status
 */
export async function checkSitemap(baseUrl: string): Promise<SitemapStatus> {
  const errors: string[] = [];
  let totalUrls = 0;

  try {
    const response = await fetch(`${baseUrl}/sitemap.xml`);

    if (!response.ok) {
      errors.push(`Sitemap returned status ${response.status}`);
      return {
        totalUrls: 0,
        indexedUrls: 0,
        lastUpdated: new Date(),
        errors,
      };
    }

    const xml = await response.text();

    // Count URLs in sitemap
    const urlMatches = xml.match(/<loc>/g);
    totalUrls = urlMatches ? urlMatches.length : 0;

    if (totalUrls === 0) {
      errors.push("Sitemap contains no URLs");
    }

    // Check for lastmod dates
    const hasLastmod = xml.includes("<lastmod>");
    if (!hasLastmod) {
      errors.push("Sitemap URLs missing lastmod dates");
    }

  } catch (error) {
    errors.push(`Failed to fetch sitemap: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  return {
    totalUrls,
    indexedUrls: totalUrls, // Would need Search Console API for actual indexed count
    lastUpdated: new Date(),
    errors,
  };
}

/**
 * Check robots.txt
 */
export async function checkRobotsTxt(baseUrl: string): Promise<SEOCheck> {
  try {
    const response = await fetch(`${baseUrl}/robots.txt`);

    if (!response.ok) {
      return {
        name: "robots.txt",
        status: "fail",
        message: `robots.txt returned status ${response.status}`,
        recommendation: "Create a robots.txt file",
      };
    }

    const content = await response.text();

    // Check for sitemap reference
    const hasSitemap = content.toLowerCase().includes("sitemap:");

    if (hasSitemap) {
      return {
        name: "robots.txt",
        status: "pass",
        message: "robots.txt exists and includes sitemap reference",
      };
    } else {
      return {
        name: "robots.txt",
        status: "warning",
        message: "robots.txt exists but missing sitemap reference",
        recommendation: "Add Sitemap: directive to robots.txt",
      };
    }
  } catch (error) {
    return {
      name: "robots.txt",
      status: "fail",
      message: `Failed to check robots.txt: ${error instanceof Error ? error.message : "Unknown error"}`,
      recommendation: "Ensure robots.txt is accessible",
    };
  }
}

/**
 * Find broken internal links (simplified version)
 */
export async function findBrokenLinks(baseUrl: string, path: string): Promise<BrokenLink[]> {
  const brokenLinks: BrokenLink[] = [];

  try {
    const response = await fetch(`${baseUrl}${path}`);
    const html = await response.text();

    // Find all internal links
    const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      const linkText = match[2];

      // Only check internal links
      if (href.startsWith("/") || href.startsWith(baseUrl)) {
        const fullUrl = href.startsWith("/") ? `${baseUrl}${href}` : href;

        try {
          const linkResponse = await fetch(fullUrl, { method: "HEAD" });
          if (!linkResponse.ok) {
            brokenLinks.push({
              sourceUrl: `${baseUrl}${path}`,
              targetUrl: fullUrl,
              statusCode: linkResponse.status,
              linkText: linkText.substring(0, 50),
            });
          }
        } catch {
          brokenLinks.push({
            sourceUrl: `${baseUrl}${path}`,
            targetUrl: fullUrl,
            statusCode: 0,
            linkText: linkText.substring(0, 50),
          });
        }

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  } catch (error) {
    console.error(`Error checking links on ${path}:`, error);
  }

  return brokenLinks;
}

/**
 * Run full technical SEO audit
 */
export async function runFullAudit(baseUrl: string): Promise<{
  pageAudits: SEOAuditResult[];
  sitemapStatus: SitemapStatus;
  robotsCheck: SEOCheck;
  overallScore: number;
  summary: string;
}> {
  console.log("[SEO Agent] Starting full technical audit...");

  const pageAudits = await auditAllPages(baseUrl);
  const sitemapStatus = await checkSitemap(baseUrl);
  const robotsCheck = await checkRobotsTxt(baseUrl);

  // Calculate overall score
  const pageScores = pageAudits.map(a => a.score);
  const avgPageScore = pageScores.reduce((a, b) => a + b, 0) / pageScores.length;

  const sitemapScore = sitemapStatus.errors.length === 0 ? 100 : 50;
  const robotsScore = robotsCheck.status === "pass" ? 100 : robotsCheck.status === "warning" ? 75 : 0;

  const overallScore = Math.round((avgPageScore * 0.7) + (sitemapScore * 0.15) + (robotsScore * 0.15));

  // Generate summary
  const failingPages = pageAudits.filter(a => a.status === "fail").length;
  const warningPages = pageAudits.filter(a => a.status === "warning").length;

  let summary = `SEO Audit Complete: Overall Score ${overallScore}/100. `;
  if (failingPages > 0) {
    summary += `${failingPages} pages need attention. `;
  }
  if (warningPages > 0) {
    summary += `${warningPages} pages have warnings. `;
  }
  if (sitemapStatus.errors.length > 0) {
    summary += `Sitemap has ${sitemapStatus.errors.length} issues. `;
  }
  if (robotsCheck.status !== "pass") {
    summary += `robots.txt needs attention. `;
  }
  if (overallScore >= 80) {
    summary += "Good SEO health!";
  }

  console.log(`[SEO Agent] Audit complete: ${summary}`);

  return {
    pageAudits,
    sitemapStatus,
    robotsCheck,
    overallScore,
    summary,
  };
}
