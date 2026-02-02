import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, getAllCategories } from "@/lib/blog/posts";
import { Calendar, Clock, ArrowRight, ArrowLeft, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog Archive | All Privacy Articles | GhostMyData",
  description:
    "Browse all privacy and data removal articles. Complete archive of guides on data brokers, dark web protection, and privacy tips.",
  alternates: {
    canonical: "https://ghostmydata.com/blog/archive",
  },
};

export default function BlogArchivePage() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  // Group posts by category
  const postsByCategory = categories.reduce((acc, category) => {
    acc[category] = posts.filter((post) => post.category === category);
    return acc;
  }, {} as Record<string, typeof posts>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Header */}
      <div className="mb-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Blog Archive
        </h1>
        <p className="text-xl text-slate-400">
          All {posts.length} articles organized by category
        </p>
      </div>

      {/* Posts by Category */}
      {categories.map((category) => (
        <section key={category} className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Tag className="h-5 w-5 text-emerald-400" />
            {category}
            <span className="text-sm font-normal text-slate-500">
              ({postsByCategory[category].length} articles)
            </span>
          </h2>
          <div className="grid gap-4">
            {postsByCategory[category].map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white group-hover:text-emerald-400 transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="mt-16 text-center p-8 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl border border-emerald-500/20">
        <h2 className="text-2xl font-bold text-white mb-4">
          Ready to Protect Your Privacy?
        </h2>
        <p className="text-slate-400 mb-6">
          Put these guides into action. Start removing your data now.
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
