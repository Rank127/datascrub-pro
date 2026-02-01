import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, getFeaturedPosts, getAllCategories } from "@/lib/blog/posts";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Blog - Data Removal Guides & Privacy Tips",
  description:
    "Expert guides on removing your personal data from data brokers, protecting your privacy online, and understanding your data rights under CCPA and GDPR.",
  keywords: [
    "data removal guide",
    "privacy blog",
    "how to remove personal data",
    "data broker opt out",
    "privacy tips",
    "CCPA guide",
    "GDPR rights",
    "identity theft protection",
  ],
  alternates: {
    canonical: "https://ghostmydata.com/blog",
  },
  openGraph: {
    title: "Privacy Blog - GhostMyData",
    description:
      "Expert guides on data removal, privacy protection, and understanding your data rights.",
    url: "https://ghostmydata.com/blog",
    type: "website",
    images: [
      {
        url: "https://ghostmydata.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "GhostMyData Privacy Blog",
      },
    ],
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const featuredPosts = getFeaturedPosts();
  const categories = getAllCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Privacy Blog
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Learn how to remove your data. Protect your privacy. Know your rights.
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((category) => (
          <span
            key={category}
            className="px-4 py-2 bg-slate-800/50 rounded-full text-sm text-slate-300 border border-slate-700"
          >
            {category}
          </span>
        ))}
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8">Featured Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPosts.slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block p-6 bg-emerald-500/10 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-center gap-2 text-emerald-400 text-sm mb-3">
                  <Tag className="h-4 w-4" />
                  {post.category}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {post.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readTime}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Posts */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-8">All Articles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block p-6 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                <Tag className="h-4 w-4" />
                {post.category}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                {post.title}
              </h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                {post.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readTime}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 text-center p-8 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl border border-emerald-500/20">
        <h2 className="text-2xl font-bold text-white mb-4">
          Ready to Protect Your Privacy?
        </h2>
        <p className="text-slate-400 mb-6">
          Stop reading. Start removing your data now.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
        >
          Start Your Free Scan
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
