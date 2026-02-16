import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog/posts";
import { APP_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = APP_URL;
  const currentDate = new Date().toISOString();

  // Static pages with their priorities and change frequencies
  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/pricing", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/how-it-works", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/blog", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/compare", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/compare/deleteme", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/compare/incogni", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/compare/optery", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/compare/kanary", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/compare/privacy-bee", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/security", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/terms", priority: 0.5, changeFrequency: "monthly" as const },
    // Data broker removal guides (high SEO value)
    { path: "/remove-from", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/remove-from/spokeo", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/whitepages", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/beenverified", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/intelius", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/truepeoplesearch", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/radaris", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/fastpeoplesearch", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/mylife", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/ussearch", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/peoplefinder", priority: 0.85, changeFrequency: "monthly" as const },
    // New broker guides (Feb 2026)
    { path: "/remove-from/truthfinder", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/instant-checkmate", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/usphonebook", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/smartbackgroundchecks", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/checkpeople", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/arrests-org", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/nuwber", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/peekyou", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/pipl", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/searchpeoplefree", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/familytreenow", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/thatsthem", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/clustrmaps", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/cocofinder", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/remove-from/zoominfo", priority: 0.85, changeFrequency: "monthly" as const },
    // Legal pages
    { path: "/cookies", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/vulnerability-disclosure", priority: 0.5, changeFrequency: "monthly" as const },
    // Resource and info pages
    { path: "/resources", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/testimonials", priority: 0.7, changeFrequency: "weekly" as const },
    // Location-based pages (CCPA, state-specific)
    { path: "/data-removal-california", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/data-removal-texas", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/data-removal-new-york", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/data-removal-florida", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/data-removal-illinois", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/data-removal-pennsylvania", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/data-removal-ohio", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/data-removal-georgia", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/data-removal-north-carolina", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/data-removal-michigan", priority: 0.85, changeFrequency: "monthly" as const },
    // Interactive tools
    { path: "/privacy-score", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/blog/archive", priority: 0.7, changeFrequency: "weekly" as const },
  ];

  const staticSitemap = staticPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: currentDate,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // Blog posts
  const posts = getAllPosts();
  const blogSitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt,
    changeFrequency: "weekly" as const,
    priority: post.featured ? 0.8 : 0.7,
  }));

  return [...staticSitemap, ...blogSitemap];
}
