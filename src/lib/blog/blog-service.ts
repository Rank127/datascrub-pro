/**
 * Blog Service — merges static posts (posts.ts) with auto-generated posts (AutoBlogPost DB table)
 *
 * All callers that need the full universe of blog posts should use these async functions
 * instead of the sync functions from posts.ts directly.
 */

import { prisma } from "@/lib/db";
import {
  getAllPosts as getStaticPosts,
  getPostBySlug as getStaticPostBySlug,
  getFeaturedPosts as getStaticFeaturedPosts,
  getAllCategories as getStaticCategories,
  type BlogPost,
} from "./posts";

/**
 * Convert a DB AutoBlogPost record to the BlogPost interface
 */
function mapDbPost(dbPost: {
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: Date;
  author: string;
  category: string;
  tags: string[];
  readTime: string;
  featured: boolean;
  updatedAt: Date;
}): BlogPost {
  return {
    slug: dbPost.slug,
    title: dbPost.title,
    description: dbPost.description,
    content: dbPost.content,
    publishedAt: dbPost.publishedAt.toISOString().split("T")[0],
    updatedAt: dbPost.updatedAt.toISOString().split("T")[0],
    author: dbPost.author,
    category: dbPost.category,
    tags: dbPost.tags,
    readTime: dbPost.readTime,
    featured: dbPost.featured,
  };
}

/**
 * Fetch all published auto-generated posts from DB
 */
async function getDbPosts(): Promise<BlogPost[]> {
  try {
    const dbPosts = await prisma.autoBlogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
    });
    return dbPosts.map(mapDbPost);
  } catch {
    // DB may not have the table yet (pre-migration) — fail gracefully
    console.warn("[blog-service] AutoBlogPost query failed, using static posts only");
    return [];
  }
}

/**
 * Get all posts (static + DB), sorted newest first
 */
export async function getAllPostsCombined(): Promise<BlogPost[]> {
  const [staticPosts, dbPosts] = await Promise.all([
    Promise.resolve(getStaticPosts()),
    getDbPosts(),
  ]);

  // DB posts override static posts with same slug (shouldn't happen, but safety)
  const staticSlugs = new Set(staticPosts.map((p) => p.slug));
  const uniqueDbPosts = dbPosts.filter((p) => !staticSlugs.has(p.slug));

  const combined = [...staticPosts, ...uniqueDbPosts];
  return combined.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Get a single post by slug — checks static first (fast), then DB
 */
export async function getPostBySlugCombined(
  slug: string
): Promise<BlogPost | undefined> {
  // Static lookup is instant — try first
  const staticPost = getStaticPostBySlug(slug);
  if (staticPost) return staticPost;

  // Fall back to DB
  try {
    const dbPost = await prisma.autoBlogPost.findUnique({
      where: { slug, status: "PUBLISHED" },
    });
    if (dbPost) return mapDbPost(dbPost);
  } catch {
    // Pre-migration fallback
  }

  return undefined;
}

/**
 * Get featured posts (static + DB)
 */
export async function getFeaturedPostsCombined(): Promise<BlogPost[]> {
  const [staticFeatured, dbPosts] = await Promise.all([
    Promise.resolve(getStaticFeaturedPosts()),
    getDbPosts(),
  ]);

  const dbFeatured = dbPosts.filter((p) => p.featured);
  const staticSlugs = new Set(staticFeatured.map((p) => p.slug));
  const uniqueDbFeatured = dbFeatured.filter((p) => !staticSlugs.has(p.slug));

  return [...staticFeatured, ...uniqueDbFeatured].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Get all unique categories (static + DB)
 */
export async function getAllCategoriesCombined(): Promise<string[]> {
  const [staticCategories, dbPosts] = await Promise.all([
    Promise.resolve(getStaticCategories()),
    getDbPosts(),
  ]);

  const dbCategories = [...new Set(dbPosts.map((p) => p.category))];
  return [...new Set([...staticCategories, ...dbCategories])];
}

/**
 * Get all slugs — for dedup in blog-generator / blog-writer
 */
export async function getAllSlugs(): Promise<string[]> {
  const posts = await getAllPostsCombined();
  return posts.map((p) => p.slug);
}
