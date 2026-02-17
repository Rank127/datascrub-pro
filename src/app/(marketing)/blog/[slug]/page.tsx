import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPostsCombined, getPostBySlugCombined } from "@/lib/blog/blog-service";
import { BreadcrumbSchema, BlogPostingSchema, HowToSchema, type HowToStep } from "@/components/seo/structured-data";
import { Calendar, Clock, ArrowLeft, ArrowRight, User, Tag } from "lucide-react";
import { NewsletterCapture } from "@/components/blog/newsletter-capture";

// Extract steps from markdown content for HowTo schema
function extractHowToSteps(content: string): HowToStep[] {
  const steps: HowToStep[] = [];
  const stepRegex = /### Step (\d+)[:\s]+([^\n]+)\n+([\s\S]*?)(?=\n### Step|\n## |$)/gi;
  let match;

  while ((match = stepRegex.exec(content)) !== null) {
    const stepTitle = match[2].trim();
    const stepContent = match[3]
      .replace(/^\d+\.\s+/gm, '') // Remove numbered list prefixes
      .replace(/^- /gm, '') // Remove bullet prefixes
      .split('\n')
      .filter(line => line.trim())
      .slice(0, 3) // Take first 3 meaningful lines
      .join(' ')
      .trim();

    if (stepTitle && stepContent) {
      steps.push({
        name: stepTitle,
        text: stepContent.substring(0, 500), // Limit length
      });
    }
  }

  return steps;
}

// Check if post is a "How To" guide
function isHowToPost(title: string, slug: string): boolean {
  return title.toLowerCase().startsWith('how to') ||
         slug.startsWith('how-to-');
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPostsCombined();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlugCombined(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: {
      canonical: `https://ghostmydata.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://ghostmydata.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: "https://ghostmydata.com/og-image.png",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["https://ghostmydata.com/og-image.png"],
    },
  };
}

/**
 * Wrap consecutive elements of the same type in a container tag.
 * E.g., wrap consecutive <li> lines in <ul>, consecutive <tr> lines in <table>.
 */
function wrapConsecutiveElements(
  html: string,
  tagName: string,
  wrapperOpen: string,
  wrapperClose: string
): string {
  const lines = html.split("\n");
  const result: string[] = [];
  let inGroup = false;

  for (const line of lines) {
    const isTarget = line.trimStart().startsWith(`<${tagName}`);
    if (isTarget && !inGroup) {
      result.push(wrapperOpen);
      inGroup = true;
    } else if (!isTarget && inGroup) {
      result.push(wrapperClose);
      inGroup = false;
    }
    result.push(line);
  }
  if (inGroup) result.push(wrapperClose);

  return result.join("\n");
}

function parseMarkdown(content: string): string {
  // Basic markdown parsing
  let html = content
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold text-white mt-8 mb-4">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-white mt-10 mb-4">$1</h2>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-200">$1</strong>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-emerald-400 hover:text-emerald-300 underline">$1</a>')
    // Lists
    .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4">$2</li>')
    // Tables
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      if (cells[0]?.includes('---')) return '';
      const isHeader = match.includes('**');
      const tag = isHeader ? 'th' : 'td';
      const cellClass = isHeader
        ? 'px-4 py-2 text-left text-slate-200 font-semibold border-b border-slate-700'
        : 'px-4 py-2 text-slate-400 border-b border-slate-800';
      return `<tr>${cells.map(c => `<${tag} class="${cellClass}">${c.trim()}</${tag}>`).join('')}</tr>`;
    })
    // Paragraphs
    .replace(/^(?!<[hl]|<li|<tr)(.+)$/gm, '<p class="text-slate-400 mb-4">$1</p>');

  // Wrap consecutive <li> elements in <ul>
  html = wrapConsecutiveElements(
    html,
    "li",
    '<ul class="list-disc list-inside space-y-2 mb-6 text-slate-400">',
    "</ul>"
  );

  // Wrap consecutive <tr> elements in <table>
  html = wrapConsecutiveElements(
    html,
    "tr",
    '<table class="w-full mb-6 border-collapse">',
    "</table>"
  );

  return html;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlugCombined(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getAllPostsCombined();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 3);

  const breadcrumbs = [
    { name: "Home", url: "https://ghostmydata.com" },
    { name: "Blog", url: "https://ghostmydata.com/blog" },
    { name: post.title, url: `https://ghostmydata.com/blog/${post.slug}` },
  ];

  // Extract HowTo steps if this is a "how to" post
  const isHowTo = isHowToPost(post.title, post.slug);
  const howToSteps = isHowTo ? extractHowToSteps(post.content) : [];

  // Estimate total time based on content (rough estimate)
  const estimatedTime = isHowTo
    ? `PT${Math.max(5, Math.min(30, howToSteps.length * 3))}M`
    : undefined;

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      {isHowTo && howToSteps.length > 0 && (
        <HowToSchema
          name={post.title}
          description={post.description}
          totalTime={estimatedTime || "PT15M"}
          steps={howToSteps}
        />
      )}
      <BlogPostingSchema post={post} />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300">
            Home
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-slate-300">
            Blog
          </Link>
          <span>/</span>
          <span className="text-slate-400 truncate">{post.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm border border-emerald-500/20">
              {post.category}
            </span>
            {post.featured && (
              <span className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full text-sm border border-orange-500/20">
                Featured
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {post.title}
          </h1>

          <p className="text-xl text-slate-400 mb-6">{post.description}</p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </span>
          </div>
        </header>

        {/* Content */}
        <div
          className="prose prose-invert prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }}
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-slate-800">
          <Tag className="h-4 w-4 text-slate-500" />
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA Box */}
        <div className="mt-12 p-8 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl border border-emerald-500/20 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Remove Your Data?
          </h3>
          <p className="text-slate-400 mb-6">
            Stop letting data brokers profit from your personal information.
            GhostMyData automates the removal process.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
          >
            Start Your Free Scan
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Newsletter Capture */}
        <div className="mt-12">
          <NewsletterCapture source="blog" />
        </div>

        {/* Navigation */}
        <nav className="flex justify-between mt-12 pt-8 border-t border-slate-800">
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <div className="text-left">
                <div className="text-sm text-slate-500">Previous</div>
                <div className="line-clamp-1">{prevPost.title}</div>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {nextPost && (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors text-right"
            >
              <div>
                <div className="text-sm text-slate-500">Next</div>
                <div className="line-clamp-1">{nextPost.title}</div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </nav>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="group p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <h3 className="font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {relatedPost.title}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {relatedPost.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
