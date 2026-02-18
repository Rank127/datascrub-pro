import { MetadataRoute } from "next";
import { getAllPostsCombined } from "@/lib/blog/blog-service";
import { APP_URL } from "@/lib/constants";
import { getRemovableBrokerSlugs, EXISTING_MANUAL_PAGES } from "@/lib/broker-pages/broker-page-data";
import { getAllStateSlugs } from "@/lib/state-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = APP_URL;
  const currentDate = new Date().toISOString();

  // Dynamic broker removal guide slugs (all eligible brokers)
  const allBrokerSlugs = [...EXISTING_MANUAL_PAGES, ...getRemovableBrokerSlugs()];
  const brokerSitemap = allBrokerSlugs.map(slug => ({
    url: `${baseUrl}/remove-from/${slug}`,
    lastModified: currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

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
    // Data broker removal hub (high SEO value)
    { path: "/remove-from", priority: 0.9, changeFrequency: "weekly" as const },
    // Legal pages
    { path: "/cookies", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/vulnerability-disclosure", priority: 0.5, changeFrequency: "monthly" as const },
    // Resource and info pages
    { path: "/resources", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/testimonials", priority: 0.7, changeFrequency: "weekly" as const },
    // New pages
    { path: "/data-removal-statistics", priority: 0.85, changeFrequency: "monthly" as const },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/press", priority: 0.6, changeFrequency: "monthly" as const },
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

  // State data removal pages (all 50 states)
  const stateSlugs = getAllStateSlugs();
  const stateSitemap = stateSlugs.map((slug) => ({
    url: `${baseUrl}/data-removal/${slug}`,
    lastModified: currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  // Blog posts (static + auto-generated from DB)
  const posts = await getAllPostsCombined();
  const blogSitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt,
    changeFrequency: "weekly" as const,
    priority: post.featured ? 0.8 : 0.7,
  }));

  return [...staticSitemap, ...brokerSitemap, ...stateSitemap, ...blogSitemap];
}
