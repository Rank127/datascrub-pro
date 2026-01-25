import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ghostmydata.com";
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
    { path: "/login", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/register", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/forgot-password", priority: 0.3, changeFrequency: "monthly" as const },
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
